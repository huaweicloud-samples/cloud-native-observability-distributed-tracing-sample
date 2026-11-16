const trace = require('./src/trace');
const express = require('express');
const https = require('https');
trace.captureHTTPsGlobal(https);
const mysql = trace.captureMySQL(require('mysql'));

const app = express();
const PORT = process.env.PORT || 3000;
app.use(trace.openSegment('SampleSite'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
  res.end();
});

app.get('/http-request/', (req, res) => {
  const seg = trace.getSegment();
  const sub = seg.subsegment('customSubsegment');
  const url = 'https://example.com';
  https.get(url, (response) => {
    sub.metadata = { url, statusCode: response.statusCode };
    res.send(`HTTPS response: ${response.statusCode}. (trace: ${seg.id})`);
  }).on('error', (err) => {
    sub.metadata = { url, error: err.message };
    res.status(500).send('Error: ' + err.message);
  });
});

app.get('/mysql/', (req, res) => {
  let config, table;
  try {
    const cfg = require('./mysql-config.json');
    config = cfg.config; table = cfg.table;
  } catch (e) {
    res.send('Please correctly populate mysql-config.json');
    return;
  }
  const seg = trace.getSegment();
  const connection = mysql.createConnection(config);
  connection.query(`SELECT * FROM ${table} LIMIT 1`, (err, rows) => {
    if (err) { res.status(500).send('MySQL error: ' + err.message); return; }
    res.send(`MySQL ok, rows=${rows ? rows.length : 0} (trace: ${seg.id})`);
    connection.end();
  });
});

app.use(trace.closeSegment());
app.listen(PORT, () => console.log(`Sample app listening on ${PORT}`));
