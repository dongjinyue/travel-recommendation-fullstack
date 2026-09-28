/**
 * 流式响应工具
 *
 * 实现 Server-Sent Events (SSE) 协议，将 LLM 的流式输出
 * 转换为标准的 SSE 格式推送给客户端。
 *
 * SSE 数据格式:
 *   data: { "type": "chunk", "content": "文本片段" }\n\n
 *   data: { "type": "complete", "data": 最终结果 }\n\n
 *   data: { "type": "error", "error": "错误信息" }\n\n
 */

/**
 * 发送 SSE 流式响应
 *
 * 处理流程:
 *   1. 设置 SSE 响应头
 *   2. 发送初始提示消息
 *   3. 逐块消费 LLM 流，实时推送给客户端
 *   4. 收集完整内容，调用 onComplete 回调处理最终数据
 *   5. 发送完成消息
 *   6. 异常时发送错误消息
 *
 * @param {import('express').Response} res - Express 响应对象
 * @param {AsyncIterable} stream - LLM 返回的流式迭代器
 * @param {Function} [onComplete] - 可选回调，处理完整内容后返回最终 data
 * @param {string} onComplete.fullContent - LLM 输出的完整文本
 * @returns {*} onComplete 的返回值将作为 complete 消息的 data 字段
 */
export const sendStreamResponse = async (res, stream, onComplete) => {
  // 设置 SSE 标准响应头
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 累计 LLM 输出的完整文本
  let fullContent = '';

  try {
    // 发送初始提示，告知客户端开始生成
    res.write(`data: ${JSON.stringify({ type: 'chunk', content: '正在生成旅游规划...' })}\n\n`);

    // 逐块消费 LLM 流式输出
    // LangChain 的 stream() 返回异步迭代器，每个 chunk 的 content 字段包含文本片段
    for await (const chunk of stream) {
      const content = chunk.content || '';
      if (content) {
        fullContent += content;
        console.log('[Stream Chunk]', content);
        res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
      }
    }

    // 流式输出完成，处理最终数据
    // 如果提供了 onComplete 回调，用它处理完整内容（如 JSON 解析）
    // 否则直接将完整文本作为 data 返回
    const data = onComplete ? onComplete(fullContent) : fullContent;
    res.write(`data: ${JSON.stringify({ type: 'complete', data })}\n\n`);
  } catch (error) {
    // 捕获流式过程中的异常，发送错误消息
    console.error('[Stream Error]', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
  } finally {
    // 确保关闭连接
    res.end();
  }
};
