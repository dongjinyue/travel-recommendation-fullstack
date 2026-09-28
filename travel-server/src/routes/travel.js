/**
 * 旅游推荐 API 路由
 *
 * 提供两个核心接口:
 * 1. POST /recommend  - 根据城市/预算/天数生成智能旅游规划（SSE流式响应）
 * 2. POST /chat       - 旅游相关的 AI 问答对话（SSE流式响应）
 *
 * 所有接口均采用 Server-Sent Events (SSE) 实现流式输出,
 * 前端可逐步接收内容，获得更好的用户体验。
 */

import { Router } from 'express';
import { getTravelRecommendation, getChatResponse, parseJsonResponse } from '../services/travelService.js';
import { sendStreamResponse } from '../utils/streamUtils.js';

const router = Router();

/**
 * POST /recommend
 * 智能旅游推荐接口（流式）
 *
 * 请求体:
 *   - city   (string, 必填)  目的地城市，如 "北京"
 *   - budget (number, 可选)  总预算（元），默认 5000
 *   - days   (number, 可选)  旅行天数，默认 3
 *
 * SSE 响应:
 *   1. 初始提示: { type: "chunk", content: "正在生成旅游规划..." }
 *   2. 流式内容: { type: "chunk", content: "..." } （多次推送）
 *   3. 完成响应: { type: "complete", data: { success, city, days, dailyItinerary, ... } }
 */
router.post('/recommend', async (req, res, next) => {
  try {
    const { city, budget, days } = req.body;

    // 参数校验: city 为必填项
    if (!city) {
      return res.status(400).json({ error: '请提供城市 (city)' });
    }

    // 调用服务层获取 LLM 流式响应
    const stream = await getTravelRecommendation({
      city,
      budget: Number(budget) || 5000,
      days: Number(days) || 3
    });

    // 将流式数据通过 SSE 推送给客户端
    // onComplete 回调: LLM 输出完成后，将完整文本解析为 JSON 对象
    sendStreamResponse(res, stream, (fullContent) => {
      const parsed = parseJsonResponse(fullContent);
      // 优先返回解析后的 JSON 对象，解析失败则返回原始文本
      return parsed || fullContent;
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /chat
 * AI 旅游对话接口（流式）
 *
 * 请求体:
 *   - message (string, 必填)  用户的问题，如 "北京有哪些好吃的？"
 *
 * SSE 响应:
 *   1. 初始提示: { type: "chunk", content: "正在生成旅游规划..." }
 *   2. 流式内容: { type: "chunk", content: "..." } （多次推送）
 *   3. 完成响应: { type: "complete", data: { success: true, reply: "完整回答内容" } }
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { message } = req.body;

    // 参数校验: message 为必填项
    if (!message) {
      return res.status(400).json({ error: '请提供消息 (message)' });
    }

    // 调用服务层获取 LLM 流式响应
    const stream = await getChatResponse(message);

    // 将流式数据通过 SSE 推送给客户端
    // onComplete 回调: 将完整文本包装为 { success, reply } 格式
    sendStreamResponse(res, stream, (fullContent) => {
      return { success: true, reply: fullContent };
    });
  } catch (error) {
    next(error);
  }
});

export default router;
