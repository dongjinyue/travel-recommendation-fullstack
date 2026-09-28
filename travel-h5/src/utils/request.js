import axios from 'axios'
import { showToast } from 'vant'
import { resolveApiBaseUrl } from './apiBase.js'

// 未配置环境变量时默认访问同源服务端，避免部署后的请求丢失 /api/travel 前缀。
const BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    return res
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      const message = data?.message || data?.error || error.message

      switch (status) {
        case 401:
          showToast('登录已过期，请重新登录')
          localStorage.removeItem('token')
          break
        case 403:
          showToast('没有访问权限')
          break
        case 404:
          showToast('请求资源不存在')
          break
        case 500:
          showToast('服务器错误，请稍后重试')
          break
        default:
          showToast(message || `请求失败 (${status})`)
      }
    } else if (error.code === 'ECONNABORTED') {
      showToast('请求超时，请检查网络')
    } else {
      showToast('网络异常，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

const request = {
  get(url, params, config = {}) {
    return service.get(url, { params, ...config })
  },

  post(url, data, config = {}) {
    return service.post(url, data, config)
  },

  put(url, data, config = {}) {
    return service.put(url, data, config)
  },

  delete(url, params, config = {}) {
    return service.delete(url, { params, ...config })
  },

  upload(url, file, onProgress) {
    const formData = new FormData()
    formData.append('file', file)

    return service.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
        }
      }
    })
  },

  // SSE 流式请求 - 使用 fetch 实现
  stream(url, data, { onChunk, onComplete, onError, signal } = {}) {
    const fullUrl = `${BASE_URL}${url}`
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }

    const decoder = new TextDecoder()
    let buffer = ''

    fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      signal
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`请求失败 (${response.status})`)
      }

      const reader = response.body.getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop()

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue

          const dataStr = trimmed.slice(5).trim()
          if (!dataStr || dataStr === '[DONE]') continue

          try {
            const parsed = JSON.parse(dataStr)
            if (parsed.type === 'chunk' && onChunk) {
              onChunk(parsed.content)
            } else if (parsed.type === 'complete' && onComplete) {
              onComplete(parsed.data)
            } else if (parsed.type === 'error' && onError) {
              onError(parsed.error)
            }
          } catch (e) {
            console.warn('SSE 解析失败:', dataStr)
          }
        }
      }
    }).catch(err => {
      if (onError) {
        onError(err.message)
      } else {
        console.error('SSE 请求失败:', err)
      }
    })
  }
}

export default request
