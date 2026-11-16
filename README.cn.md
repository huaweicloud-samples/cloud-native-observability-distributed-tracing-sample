# cloud-native-observability-distributed-tracing-sample / 分布式追踪示例

[![License](https://img.shields.io/badge/License-MIT%20No%20Attribution-blue.svg)](LICENSE)
[![Huawei Cloud](https://img.shields.io/badge/Huawei%20Cloud-IAM%20Auth-red.svg)](https://support.huaweicloud.com/intl/en-us/)
[English](README.md)

> Express 应用分布式追踪埋点示例（HTTP / 存储 / 数据库三类下游）
> Distributed Tracing Sample (Express)

## 1. 简介 / Overview

**中文**：本实践演示 **Express 应用三类下游请求（HTTP/存储/数据库）的分布式追踪埋点**，供 **可观测性 / APM 接入** 场景参考。面向 Node.js 后端 / 可观测性工程师。

- segment/subsegment 语义：与平台解耦，输出结构化 JSON 日志（可接 LTS / APM）
- 三类捕获：https 下游、mysql 查询、应用内自定义 subsegment
- 本地可跑可验（无云依赖）

## 2. 目录

1. [简介](#1-简介--overview-critical) 2. [目录](#2-目录) 3. [架构图](#3-架构图) 4. [方案亮点](#4-方案亮点) 5. [涉及云服务](#5-涉及云服务) 6. [前置条件](#6-前置条件-critical) 7. [快速开始](#7-快速开始-critical) 8. [分步部署](#8-分步部署) 9. [使用方法 / 验证](#9-使用方法--验证-critical) 10. [清理资源](#10-清理资源) 11. [详细说明](#11-详细说明) 12. [依赖](#12-依赖) 13. [FAQ](#13-faq--故障排除) 14. [贡献指南](#14-贡献指南) 15. [许可证](#15-许可证-critical) 16. [联系方式](#16-联系方式--维护者-critical)

## 3. 架构图

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

## 4. 方案亮点

- **语义保真**：X-Ray 埋点语义（segment/subsegment/TraceHeader/捕获）以平台无关模块保留
- **本地可验**：不需要云账号，npm install + node index.js 即可看到 trace 日志
- **可插拔上报**：默认 JSON 日志 → 接 LTS/APM 仅替换 emit()

## 5. 涉及云服务

| 服务 | 用途 | 备注 |
|---|---|---|
| LTS（日志） / APM（可选） | trace-segment 采集与可视化 | 上报通道可插拔 |
| （无必需云资源） | 本地演示 | — |

## 6. 前置条件

Node 18+ / npm；（可选）MySQL 用于 /mysql/ 演示。

## 7. 快速开始

```bash
git clone <repo-https-url> cloud-native-observability-distributed-tracing-sample
cd cloud-native-observability-distributed-tracing-sample
npm install
node index.js
curl http://localhost:3000/http-request/
# HTTTP response: 200. (trace: <id>)  + 控制台 trace-segment 日志
```

## 8. 分步部署

1. `npm install`
2. `node index.js`
3. 访问 /、/http-request/、/mysql/（后者需 mysql-config.json）

## 9. 使用方法 / 验证

> **强制实测**：本节命令在交付前已由 agent 实际执行验证。

```bash
curl http://localhost:3000/            # 200
curl http://localhost:3000/http-request/  # HTTPS response: 200. (trace: ...)
grep trace-segment <app日志>            # segment JSON 出现
```

## 10. 清理资源

本地进程 Ctrl-C；无云资源。

## 11. 详细说明

- `src/trace.js`：Segment 类（id/name/parentId/耗时/子段）、openSegment/closeSegment 中间件、getSegment、captureHTTPsGlobal（写 x-trace-id 头 + 记录）、captureMySQL（包装查询记录耗时）
- 上报：`console.log` 结构化 JSON（type: trace-segment）；接 LTS/APM 时替换 emit()

## 12. 依赖

| 名称 | 版本 | 用途 |
|---|---|---|
| express | ^4.18 | Web 框架 |
| mysql | ^2.18 | 查询演示 |

## 13. FAQ / 故障排除

- /mysql/ 报错？检查 mysql-config.json 与本地 MySQL。
- /http-request/ 报错？沙箱到 example.com 网络；对端可达即可。
- 看不到日志？确认 trace 中间件已挂载。

## 14. 贡献指南

Issue / PR；提交前 `node -c index.js`（语法）。

## 15. 许可证

MIT No Attribution（见 LICENSE）。

## 16. 联系方式 / 维护者

[@<github-username>](https://github.com/<github-username>) via GitHub Issues / PR。
