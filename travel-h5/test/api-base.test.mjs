import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveApiBaseUrl } from '../src/utils/apiBase.js'

test('未配置接口地址时使用服务端的同源 API 前缀', () => {
  assert.equal(resolveApiBaseUrl(''), '/api/travel')
})

test('接口地址会去掉末尾斜杠，避免拼接出双斜杠', () => {
  assert.equal(resolveApiBaseUrl('https://api.example.com/api/travel/'), 'https://api.example.com/api/travel')
})
