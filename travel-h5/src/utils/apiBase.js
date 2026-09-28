/**
 * 规范化前端访问服务端的基础地址。
 *
 * 默认使用同源的旅游服务接口，保证云端构建没有注入环境变量时，
 * 请求仍然会落到服务端约定的 /api/travel 前缀，而不是直接请求根路径。
 */
export const resolveApiBaseUrl = (value = '') => {
  const baseUrl = value.trim()
  return (baseUrl || '/api/travel').replace(/\/$/, '')
}
