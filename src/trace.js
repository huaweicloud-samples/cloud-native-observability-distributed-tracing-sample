// 平台无关的分布式追踪模块
// 语义：TraceHeader / Segment / Subsegment / Express 中间件 / 下游捕获
// 上报：默认输出结构化 JSON 日志（可接 LTS/APM）；接入 APM 时替换 emit()
const crypto = require('crypto');

const HEADER_KEY = 'x-trace-id';

function newId() {
  return crypto.randomBytes(8).toString('hex');
}

let currentSegment = null;

class Segment {
  constructor(name, parentId) {
    this.id = newId();
    this.name = name;
    this.parentId = parentId || null;
    this.startedAt = Date.now();
    this.endAt = null;
    this.subsegments = [];
    this.metadata = {};
  }
  subsegment(name) {
    const ss = new Segment(name, this.id);
    this.subsegments.push(ss);
    return ss;
  }
  end() {
    this.endAt = Date.now();
    emit(this);
  }
  toJSON() {
    return {
      id: this.id,
      parent_id: this.parentId,
      name: this.name,
      start_ms: this.startedAt,
      end_ms: this.endAt,
      duration_ms: this.endAt ? this.endAt - this.startedAt : null,
      subsegments: this.subsegments.map(s => s.toJSON()),
      metadata: this.metadata,
    };
  }
}

function emit(seg) {
  console.log(JSON.stringify({ type: 'trace-segment', segment: seg.toJSON() }));
}

// Express 中间件：请求入口开 segment，响应结束关 segment
function openSegment(name) {
  return (req, res, next) => {
    const incoming = req.headers[HEADER_KEY] || null;
    currentSegment = new Segment(incoming ? `${name}-continue` : name, incoming);
    res.on('finish', () => { if (currentSegment) { currentSegment.end(); currentSegment = null; } });
    next();
  };
}
function closeSegment() {
  return (req, res, next) => next();
}

function getSegment() {
  if (!currentSegment) { currentSegment = new Segment('root'); }
  return currentSegment;
}

// HTTP 下游捕获：写入 trace header 并记录耗时
function captureHTTPsGlobal(module) {
  const orig = module.request;
  module.request = function (options, cb) {
    const seg = getSegment();
    if (typeof options === 'string') { options = { url: options }; }
    options.headers = options.headers || {};
    if (seg) { options.headers[HEADER_KEY] = seg.id; }
    const started = Date.now();
    const req = orig.call(this, options, cb);
    req.on('response', () => {
      const s = new Segment('http-downstream', seg ? seg.id : null);
      s.metadata = { statusCode: req.res ? req.res.statusCode : null };
      s.end();
    });
    return req;
  };
  return module;
}

// MySQL 下游捕获：记录查询与耗时
function captureMySQL(module) {
  if (module.createConnection) {
    const origCreate = module.createConnection;
    module.createConnection = function (config) {
      const conn = origCreate.call(this, config);
      const origQuery = conn.query;
      conn.query = function (sql, cb) {
        const seg = getSegment();
        const started = Date.now();
        if (typeof cb === 'function') {
          const wrapped = (err, rows) => {
            const s = new Segment('mysql-query', seg ? seg.id : null);
            s.metadata = { sql: String(sql).slice(0, 200), err: !!err, duration_ms: Date.now() - started };
            s.end();
            return cb(err, rows);
          };
          return origQuery.call(this, sql, wrapped);
        }
        const startedP = Date.now();
        const p = origQuery.call(this, sql);
        if (p && p.then) {
          return p.then(r => { const s = new Segment('mysql-query', seg ? seg.id : null); s.metadata = { sql: String(sql).slice(0, 200), duration_ms: Date.now() - startedP }; s.end(); return r; });
        }
        return p;
      };
      return conn;
    };
  }
  return module;
}

module.exports = { openSegment, closeSegment, getSegment, captureHTTPsGlobal, captureMySQL, HEADER_KEY, newId };
