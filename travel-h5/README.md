# 旅游推荐前端

这是 AI 旅游推荐项目的移动端网页，基于 Vue 3、Vite、Vue Router 和 Vant。包含首页、行程详情、AI 助手和个人中心页面。

完整项目介绍、服务端配置、API（接口）说明和线上部署信息请查看仓库根目录的 [README](../README.md)。

## 本地开发

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Vite 默认在 `http://localhost:5173` 启动，并将 `/api` 请求代理到 `http://localhost:3000`。请先启动 `travel-server`，否则 AI 功能无法调用模型。

## 常用命令

```powershell
npm test
npm run build
npm run preview
```

- `npm test`：运行 API 基础地址相关测试。
- `npm run build`：生成生产静态文件到 `dist/`。
- `npm run preview`：本地预览生产构建。

前端环境变量见 `.env.example`。`VITE_API_BASE_URL` 默认为 `/api/travel`；不要在任何 `VITE_` 变量中存放模型 API Key（接口密钥），因为这些值会进入浏览器端构建文件。
