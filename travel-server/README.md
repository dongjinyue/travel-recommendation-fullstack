# 旅游推荐服务端

智能景点推荐服务端，基于 Node.js + Express + LangChain 实现。

## 技术栈

- **Node.js** - 运行时
- **Express** - Web框架
- **LangChain** - LLM 应用框架
- **dotenv** - 环境变量管理
- **cors** - 跨域资源共享

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，填入你的 API Key:

```bash
cp .env.example .env
```

### 3. 启动开发服务器

```bash
npm run dev
```

## API 接口

### POST /api/travel/recommend

获取旅游推荐方案（同步）

**请求体:**
```json
{
  "destination": "北京",
  "days": 3,
  "budget": "medium",
  "preferences": "历史文化"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "destination": "北京",
    "itinerary": "..."
  }
}
```

### POST /api/travel/recommend/stream

获取旅游推荐方案（流式响应 SSE）

**请求体:** 同上

**响应:** Server-Sent Events 流

## 项目结构

```
src/
├── routes/
│   └── travel.js          # 旅游推荐API路由
├── services/
│   └── travelService.js   # LangChain智能推荐服务
├── utils/
│   └── streamUtils.js     # 流式响应工具
└── index.js               # 主入口文件
```