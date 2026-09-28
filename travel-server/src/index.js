/**
 * 旅游推荐服务端 - 主入口文件
 *
 * 技术栈: Express.js + LangChain + Server-Sent Events (SSE)
 * 功能: 提供旅游行程智能推荐和AI对话服务
 *
 * API 路由:
 *   GET  /api/health        健康检查
 *   POST /api/travel/recommend  智能推荐（流式）
 *   POST /api/travel/chat       AI对话（流式）
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import travelRouter from './routes/travel.js';

// 加载 .env 环境变量配置
dotenv.config();

// 创建 Express 应用实例
const app = express();
const port = process.env.PORT || 3000;

// ==================== 中间件配置 ====================

// 启用 CORS 跨域资源共享，允许前端跨域请求
app.use(cors());

// 解析 JSON 请求体
app.use(express.json());

// ==================== 路由配置 ====================

// 健康检查接口
// 返回服务状态、当前时间戳和使用的模型提供商信息
app.get('/api/health', (req, res) => {
  const provider = process.env.MODEL_PROVIDER?.toLowerCase() === 'siliconflow' ? '硅基流动' : 'DeepSeek';
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    modelProvider: provider
  });
});

// 挂载旅游推荐路由，所有 /api/travel 开头的请求交给 travelRouter 处理
app.use('/api/travel', travelRouter);

// ==================== 全局错误处理 ====================
// 捕获所有路由未处理的错误，统一返回 JSON 格式错误响应
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ==================== 启动服务 ====================
app.listen(port, () => {
  console.log(`旅游推荐服务端已启动: http://localhost:${port}`);
});
