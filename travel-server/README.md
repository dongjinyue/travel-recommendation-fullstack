# 旅游推荐服务端

Node.js + Express 服务端，负责旅游行程规划、AI 问答、SSE（服务器发送事件）流式传输和模型服务接入。

完整的全栈项目说明、前端运行方式、部署架构和维护指南请查看仓库根目录的 [README](../README.md)。

## 本地开发

```powershell
npm ci
Copy-Item .env.example .env
```

编辑 `.env`，设置 `MODEL_PROVIDER` 和对应服务商的 API Key（接口密钥），再启动：

```powershell
npm run dev
```

默认监听 `http://localhost:3000`。健康检查接口为 `GET /api/health`。

## 当前接口

- `POST /api/travel/recommend`：接收 `{ "city": "北京", "budget": 3333, "days": 3 }`，以 SSE 返回行程分片和最终行程对象。
- `POST /api/travel/chat`：接收 `{ "message": "北京有哪些旅游建议？" }`，以 SSE 返回问答分片和最终回复。

模型配置变量和完整 SSE 示例请参考根目录 README 及本目录 `.env.example`。后端当前尚未配置自动化测试，`npm test` 是占位命令。

## 代码目录

```text
src/
├── routes/travel.js          # 行程规划和问答路由
├── services/travelService.js # 模型选择、提示词和流式调用
├── utils/streamUtils.js      # SSE 响应封装
└── index.js                  # Express 入口和健康检查
```
