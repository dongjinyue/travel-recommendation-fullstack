import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request.js'

export const useChatStore = defineStore('chat', () => {
  const history = ref([])
  const loading = ref(false)

  const sendMessage = async (content, context = {}) => {
    loading.value = true
    try {
      const res = await request.post('/chat', {
        message: content,
        context
      })
      history.value.push({
        id: Date.now(),
        role: 'user',
        content
      })
      history.value.push({
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data?.reply || res.reply || '暂无回复'
      })
      return res.data?.reply || res.reply || '暂无回复'
    } catch (e) {
      const fallback = generateMockReply(content, context)
      history.value.push({
        id: Date.now(),
        role: 'user',
        content
      })
      history.value.push({
        id: Date.now() + 1,
        role: 'assistant',
        content: fallback
      })
      return fallback
    } finally {
      loading.value = false
    }
  }

  const generateMockReply = (message, context) => {
    const city = context.city || '该目的地'
    const budget = context.budget || '不限'
    const days = context.days || '若干'

    if (message.includes('推荐') || message.includes('景点')) {
      return `根据您的需求，推荐 ${city} 的热门景点：\n\n1. ${city}市区经典游览路线\n2. 周边自然风光\n3. 当地特色美食体验\n\n建议 ${days} 天行程，预算约 ${budget} 元。如需更详细的安排，请告诉我您的偏好。`
    }
    if (message.includes('预算') || message.includes('花费')) {
      return `关于预算规划：\n\n• 景点门票：约占总预算 30%\n• 餐饮费用：约占总预算 25%\n• 住宿费用：约占总预算 35%\n• 交通杂费：约占总预算 10%\n\n在 ${city} ${days} 天行程，建议准备 ${budget} 元。`
    }
    if (message.includes('美食') || message.includes('吃')) {
      return `${city} 必尝美食推荐：\n\n1. 当地特色小吃\n2. 老字号餐厅\n3. 网红打卡店\n4. 夜市美食街\n\n建议留出每天 100-200 元的餐饮预算。`
    }
    return `收到您的消息："${message}"\n\n关于 ${city} 的旅行，我可以为您提供景点推荐、预算规划、美食介绍等服务。请问您想了解哪方面的信息？`
  }

  const clearHistory = () => {
    history.value = []
  }

  return {
    history,
    loading,
    sendMessage,
    clearHistory
  }
})
