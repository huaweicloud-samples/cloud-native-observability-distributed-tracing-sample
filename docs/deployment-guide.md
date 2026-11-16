# 使用指导书

## 1. 前置条件

- Node 18+ / npm
- （可选）MySQL 实例用于 /mysql/ 演示

## 2. 运行

```bash
npm install
node index.js
```

## 3. 验证

```bash
curl http://localhost:3000/
curl http://localhost:3000/http-request/   # 下游 https + trace id
curl http://localhost:3000/mysql/          # 需 mysql-config.json
# 控制台输出 trace-segment JSON 日志
```

## 4. 上报（可插拔）

- 默认：结构化 JSON 日志（可接 LTS 采集）
- 接 APM：替换 `src/trace.js` 的 `emit()` 为 APM SDK 上报（在华为云 APM 开通后）

## 5. 清理

本地服务 Ctrl-C 即可；无云资源。
