<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ChatBubble from '../components/ChatBubble.vue'
import request from '../utils/request'

const router = useRouter()
const inputText = ref('')
const messages = ref([])
const scrollRef = ref(null)
const isSending = ref(false)

const quickQuestions = [
  '北京有哪些必去的景点?',
  '上海美食推荐',
  '成都三日游攻略',
  '如何选择旅行保险?'
]

const formatTime = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
  })
}

const sendMessage = async (text) => {
  const content = (text ?? inputText.value).trim()
  if (!content || isSending.value) return

  isSending.value = true

  const userMsg = {
    id: Date.now(),
    role: 'user',
    content,
    time: formatTime()
  }
  messages.value.push(userMsg)
  inputText.value = ''
  scrollToBottom()

  const aiMsgId = Date.now() + 1
  const aiMsg = {
    id: aiMsgId,
    role: 'assistant',
    content: '',
    time: formatTime(),
    streaming: true
  }
  messages.value.push(aiMsg)
  const aiMsgRef = messages.value[messages.value.length - 1]
  scrollToBottom()

  try {
    await new Promise((resolve) => {
      request.stream('/chat', { message: content }, {
        onChunk: (chunk) => {
          aiMsgRef.content += chunk
          scrollToBottom()
        },
        onComplete: (data) => {
          console.log('=== Chat SSE complete ===')
          console.log(data)
          aiMsgRef.streaming = false
          if (data?.reply) {
            aiMsgRef.content = data.reply
          } else if (data?.data?.reply) {
            aiMsgRef.content = data.data.reply
          } else if (!aiMsgRef.content) {
            aiMsgRef.content = '抱歉，我暂时无法回答这个问题。'
          }
          scrollToBottom()
          resolve()
        },
        onError: (err) => {
          console.error('Chat SSE error:', err)
          aiMsgRef.streaming = false
          if (!aiMsgRef.content) {
            aiMsgRef.content = '抱歉，AI 服务暂时不可用，请稍后重试。'
          }
          scrollToBottom()
          resolve()
        }
      })
    })
  } catch (e) {
    console.error('Chat error:', e)
    aiMsgRef.streaming = false
    if (!aiMsgRef.content) {
      aiMsgRef.content = '抱歉，AI 服务暂时不可用，请稍后重试。'
    }
  }

  isSending.value = false
  scrollToBottom()
}

const onInput = (val) => {
  inputText.value = val
}
</script>

<template>
  <div class="chat">
    <van-nav-bar
      title="AI 旅游助手"
      left-text="返回"
      left-arrow
      @click-left="router.back()"
      placeholder
      fixed
    />

    <div ref="scrollRef" class="chat-messages">
      <ChatBubble
        v-for="msg in messages"
        :key="msg.id"
        :role="msg.role"
        :content="msg.content"
        :time="msg.time"
        :streaming="msg.streaming"
      />

      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">
          <van-icon name="chat-o" />
        </div>
        <div class="empty-text">开始和 AI 助手对话吧!</div>
        <div class="empty-section">
          <div class="empty-section-title">常见问题</div>
          <div class="quick-tags">
            <van-tag
              v-for="q in quickQuestions"
              :key="q"
              type="primary"
              round
              class="quick-tag"
              @click="sendMessage(q)"
            >
              {{ q }}
            </van-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <van-field
        v-model="inputText"
        type="textarea"
        autosize
        :rows="1"
        placeholder="输入您的问题..."
        class="input-area"
        @update:model-value="onInput"
        @keydown.enter="sendMessage()"
      />
      <van-button
        type="primary"
        round
        :disabled="!inputText.trim() || isSending"
        @click="sendMessage()"
      >
        发送
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f7f8fa;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-top: 70px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.empty-icon :deep(.van-icon) {
  font-size: 40px;
  color: #1976d2;
}

.empty-text {
  font-size: 15px;
  color: #666;
  margin-bottom: 32px;
}

.empty-section {
  width: 100%;
  max-width: 320px;
}

.empty-section-title {
  font-size: 14px;
  color: #999;
  text-align: center;
  margin-bottom: 16px;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.quick-tag {
  font-size: 13px;
  padding: 6px 14px;
  cursor: pointer;
}

.chat-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border-top: 1px solid #ebedf0;
}

.input-area {
  flex: 1;
}

.input-area :deep(.van-field__control) {
  background: #f2f3f5;
  border-radius: 8px;
  padding: 8px 12px;
}
</style>
