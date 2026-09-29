/**
 * LangChain 智能推荐服务
 *
 * 核心功能:
 * 1. 初始化并管理 LLM 实例（支持硅基流动、DeepSeek 和通义千问）
 * 2. 构建旅游推荐的 System Prompt（包含 JSON 输出格式约束）
 * 3. 构建 AI 对话的 System Prompt
 * 4. 解析 LLM 返回的 JSON 内容（容错处理 markdown code block 包裹）
 *
 * 设计模式:
 *   - 单例模式: getLLM() 确保全局只有一个 LLM 实例
 *   - 策略模式: 根据 MODEL_PROVIDER 环境变量切换不同模型提供商
 */

import { ChatOpenAI } from '@langchain/openai';

// 全局 LLM 实例缓存，避免重复创建连接
let llmInstance = null;

/**
 * 获取 LLM 实例（懒加载 + 单例）
 *
 * 根据环境变量 MODEL_PROVIDER 选择模型提供商:
 *   - "qwen":        使用阿里云百炼兼容接口
 *   - "siliconflow": 使用硅基流动 API
 *   - 其他/默认:      使用 DeepSeek API
 *
 * 首次调用时创建实例并缓存，后续调用直接返回缓存实例。
 *
 * @returns {ChatOpenAI} LangChain ChatOpenAI 实例
 * @throws {Error} 当 API Key 未配置时抛出错误
 */
const getLLM = () => {
  // 已初始化则直接返回缓存
  if (llmInstance) return llmInstance;

  // 读取当前配置的模型提供商
  const provider = (process.env.MODEL_PROVIDER || 'deepseek').toLowerCase();

  // 根据提供商构建配置
  let config;
  if (provider === 'qwen') {
    config = {
      apiKey: process.env.DASHSCOPE_API_KEY,
      model: process.env.QWEN_MODEL || 'qwen3.8-flash',
      baseURL: (process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').trim()
    };
  } else if (provider === 'siliconflow') {
    config = {
      apiKey: process.env.SILICONFLOW_API_KEY,
      model: process.env.SILICONFLOW_MODEL || 'Qwen/Qwen3.6-35B-A3B',
      baseURL: (process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1').trim()
    };
  } else {
    config = {
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      baseURL: (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1').trim()
    };
  }

  // 校验 API Key 是否已配置
  if (provider === 'qwen' && !config.apiKey) {
    throw new Error('请在 .env 中配置 DASHSCOPE_API_KEY');
  }

  if (!config.apiKey) {
    throw new Error(`请在 .env 中配置 ${provider === 'siliconflow' ? 'SILICONFLOW_API_KEY' : 'DEEPSEEK_API_KEY'}`);
  }

  // 创建 LLM 实例并缓存
  llmInstance = new ChatOpenAI({
    apiKey: config.apiKey,
    model: config.model,
    temperature: 0.7,        // 控制输出随机性，0.7 适合创意性内容生成
    streaming: true,         // 启用流式输出，实现逐字响应
    configuration: { baseURL: config.baseURL }
  });

  return llmInstance;
};

/**
 * 构建旅游推荐的 System Prompt
 *
 * Prompt 设计要点:
 * 1. 角色设定: 专业旅游规划师
 * 2. 动态变量: 城市、预算、天数通过模板字符串注入
 * 3. 格式约束: 要求 LLM 输出结构化 JSON，并提供完整的 Schema 示例
 * 4. 容错提示: 最后提醒确保 JSON 格式正确可解析
 *
 * @param {string} city   - 目的地城市
 * @param {number} budget - 总预算（元）
 * @param {number} days   - 旅行天数
 * @returns {string} 完整的 System Prompt
 */
const buildRecommendationPrompt = (city, budget, days) => `你是一个专业的旅游规划师，擅长根据用户的需求生成详细的旅行行程。

请根据以下信息为用户生成一份详细的旅游规划：
- 目的地城市：${city}
- 预算：${budget}元
- 旅行天数：${days}天

要求：
1. 每天的行程安排（上午、下午、晚上）
2. 每个景点的详细介绍
3. 交通建议
4. 预算分配明细
5. 注意事项

请以JSON格式输出，结构如下：
\`\`\`json
{
  "success": true,
  "city": "城市名",
  "days": 天数,
  "totalBudget": 总预算,
  "dailyItinerary": [
    {
      "day": 1,
      "date": "第1天",
      "morning": {
        "spot": "景点名称",
        "duration": "游览时长",
        "ticket": "门票价格",
        "transportation": "交通方式",
        "description": "景点介绍"
      },
      "afternoon": {
        "spot": "景点名称",
        "duration": "游览时长",
        "ticket": "门票价格",
        "transportation": "交通方式",
        "description": "景点介绍"
      },
      "evening": {
        "spot": "活动名称",
        "duration": "活动时长",
        "ticket": "费用",
        "transportation": "交通方式",
        "description": "活动介绍"
      }
    }
  ],
  "budgetBreakdown": {
    "accommodation": 住宿费用,
    "food": 餐饮费用,
    "transportation": 交通费用,
    "tickets": 门票费用,
    "other": 其他费用
  },
  "tips": ["提示1", "提示2", "提示3"],
  "warnings": ["注意事项1", "注意事项2"]
}
\`\`\`

请确保JSON格式正确，可以被解析。`;

// AI 对话的 System Prompt - 旅游助手角色设定
const chatSystemPrompt = '你是一个专业的旅游助手，擅长回答各种旅游相关问题，包括景点推荐、美食攻略、交通指南、住宿建议等。请提供详细、实用、有帮助的回答。';

/**
 * 解析 LLM 返回的 JSON 响应
 *
 * LLM 输出 JSON 时常被 markdown code block 包裹（如 ```json ... ```），
 * 或带有额外文本内容。此函数通过多层正则匹配容错提取：
 *   1. 优先匹配 ```json ... ``` 代码块
 *   2. 其次匹配 ``` ... ``` 代码块
 *   3. 最后匹配文本中的第一个 { ... } 结构
 *
 * @param {string} text - LLM 返回的原始文本
 * @returns {object|null} 解析成功返回对象，失败返回 null
 */
export const parseJsonResponse = (text) => {
  // 多层正则匹配，容错提取 JSON 内容
  let match = text.match(/```json\n([\s\S]*?)\n```/) ||   // markdown json 代码块
              text.match(/```\n([\s\S]*?)\n```/) ||        // markdown 普通代码块
              text.match(/\{[\s\S]*\}/);                    // 直接匹配 JSON 对象

  if (match) {
    try {
      return JSON.parse(match[1] || match[0]);
    } catch {
      // JSON 解析失败，返回 null 由调用方处理
      return null;
    }
  }
  return null;
};

/**
 * 获取旅游推荐流式响应
 *
 * 构建包含城市/预算/天数的 System Prompt，
 * 通过 LangChain 调用 LLM 并返回异步迭代器供流式消费。
 *
 * @param {object} params
 * @param {string} params.city   - 目的地城市
 * @param {number} params.budget - 总预算
 * @param {number} params.days   - 旅行天数
 * @returns {AsyncIterable} LLM 流式输出迭代器
 */
export const getTravelRecommendation = async ({ city, budget, days }) => {
  const llm = getLLM();

  // 根据用户输入构建专属的推荐 Prompt
  const systemPrompt = buildRecommendationPrompt(city, budget, days);

  // 调用 LLM 流式接口，返回异步迭代器
  const stream = await llm.stream([
    { role: 'system', content: systemPrompt }
  ]);

  return stream;
};

/**
 * 获取 AI 对话流式响应
 *
 * 构建包含系统角色设定和用户消息的对话，
 * 通过 LangChain 调用 LLM 并返回异步迭代器供流式消费。
 *
 * @param {string} message - 用户的对话消息
 * @returns {AsyncIterable} LLM 流式输出迭代器
 */
export const getChatResponse = async (message) => {
  const llm = getLLM();

  // 构建多轮对话消息（系统角色 + 用户输入）
  const stream = await llm.stream([
    { role: 'system', content: chatSystemPrompt },
    { role: 'user', content: message }
  ]);

  return stream;
};
