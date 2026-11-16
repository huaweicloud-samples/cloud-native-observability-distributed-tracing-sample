# cloud-native-observability-distributed-tracing-sample / Distributed Tracing Sample

[![License](https://img.shields.io/badge/License-MIT%20No%20Attribution-blue.svg)](LICENSE)
[![Huawei Cloud](https://img.shields.io/badge/Huawei%20Cloud-IAM%20Auth-red.svg)](https://support.huaweicloud.com/intl/en-us/)

> Distributed tracing instrumentation sample for an Express application (HTTP / storage / database downstream calls)
> Distributed Tracing Sample (Express)

[中文版](README.cn.md)

## 1. Overview

This practice demonstrates **distributed tracing instrumentation for three classes of downstream calls (HTTP / storage / database) in an Express application**, for **observability / APM onboarding** scenarios. It targets Node.js backend and observability engineers.

- Platform-agnostic segment / subsegment semantics; emits structured JSON logs (ready for LTS / APM ingestion)
- Three capture classes: HTTPS downstream, MySQL queries, in-application custom subsegments
- Runnable and verifiable locally (no cloud dependency)

## 2. Table of Contents

1. [Overview](#1-overview) 2. [Table of Contents](#2-table-of-contents) 3. [Architecture](#3-architecture) 4. [Highlights](#4-highlights) 5. [Cloud Services Used](#5-cloud-services-used) 6. [Prerequisites](#6-prerequisites) 7. [Quick Start](#7-quick-start) 8. [Step-by-Step Deployment](#8-step-by-step-deployment) 9. [Usage / Verification](#9-usage--verification) 10. [Cleanup](#10-cleanup) 11. [Details](#11-details) 12. [Dependencies](#12-dependencies) 13. [FAQ](#13-faq--troubleshooting) 14. [Contributing](#14-contributing) 15. [License](#15-license) 16. [Maintainers](#16-maintainers)

## 3. Architecture

```
                            ┌────────────┐
                            │HTTP Client │
                            └──────┬─────┘
                                   │ requests
                                   ▼
┌────────────────────────────────────────────────────────────────────┐
│                  Express 应用（分布式追踪中间件）                  │
│           trace header / segment / subsegment / capture            │
└───────┬─────────────────┬─────────────────┬─────────────────┬──────┘
        │                 │                 │                 │
        ▼                 ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ HTTP ROUTES  │  │  DOWNSTREAM  │  │    MYSQL     │  │  LTS / APM   │
│   请求入口   │  │ 下游调用捕获 │  │   查询捕获   │  │   日志上报   │
└───────┬──────┘  └───────┬──────┘  └───────┬──────┘  └───────┬──────┘
        │                 │                 │                 │
        └─────────────────┴────────┬────────┴─────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────┐
│                       平台无关的追踪核心模块                       │
│          segment 树构建 + 结构化日志输出（emit() 可插拔）          │
└────────────────────────────────────────────────────────────────────┘
```

## 4. Highlights

- **Semantic fidelity**: tracing segment semantics (segment / subsegment / trace header / capture) are preserved in a platform-agnostic module
- **Locally verifiable**: no cloud account needed — `npm install` plus `node index.js` is enough to see the trace logs
- **Pluggable reporting**: JSON logs by default; connecting LTS / APM only requires replacing `emit()`

## 5. Cloud Services Used

| Service | Purpose | Notes |
|---|---|---|
| LTS (logging) / APM (optional) | Trace segment collection and visualization | Reporting channel is pluggable |
| (no mandatory cloud resource) | Local demo | — |

## 6. Prerequisites

Node 18+ / npm; MySQL is optional and only used for the `/mysql/` demo.

## 7. Quick Start

```bash
git clone <repo-https-url> cloud-native-observability-distributed-tracing-sample
cd cloud-native-observability-distributed-tracing-sample
npm install
node index.js
curl http://localhost:3000/http-request/
# HTTP response: 200. (trace: <id>)  + trace-segment logs on the console
```

## 8. Step-by-Step Deployment

1. `npm install`
2. `node index.js`
3. Visit `/`, `/http-request/`, `/mysql/` (the latter requires `mysql-config.json`)

## 9. Usage / Verification

> **Mandatory live check**: the commands in this section were actually executed before delivery.

```bash
curl http://localhost:3000/            # 200
curl http://localhost:3000/http-request/  # HTTPS response: 200. (trace: ...)
grep trace-segment <app-log>            # segment JSON appears
```

## 10. Cleanup

Stop the local process with Ctrl-C; no cloud resources are created.

## 11. Details

- `src/trace.js`: Segment class (id / name / parentId / duration / child segments), openSegment / closeSegment middleware, getSegment, captureHTTPsGlobal (writes the x-trace-id header and records the call), captureMySQL (wraps queries and records their duration)
- Reporting: structured JSON via `console.log` (type: trace-segment); replace `emit()` to connect LTS / APM

## 12. Dependencies

| Name | Version | Purpose |
|---|---|---|
| express | ^4.18 | Web framework |
| mysql | ^2.18 | Query demo |

## 13. FAQ / Troubleshooting

- `/mysql/` fails? Check `mysql-config.json` and the local MySQL instance.
- `/http-request/` fails? The sandbox must be able to reach the target host; any reachable endpoint works.
- No logs? Confirm the trace middleware is mounted.

## 14. Contributing

Issues / pull requests; run `node -c index.js` before submitting.

## 15. License

MIT No Attribution (see [LICENSE](LICENSE)).

## 16. Maintainers

[@<github-username>](https://github.com/<github-username>) via GitHub Issues / PRs.
