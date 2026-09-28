<script setup>
import { computed } from 'vue'

const props = defineProps({
  role: {
    type: String,
    default: 'user'
  },
  content: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  },
  streaming: {
    type: Boolean,
    default: false
  }
})

const isUser = computed(() => props.role === 'user')
</script>

<template>
  <div class="chat-bubble" :class="{ 'bubble-user': isUser, 'bubble-ai': !isUser }">
    <div v-if="!isUser" class="avatar ai-avatar">
      <van-icon name="service-o" size="20" color="#fff" />
    </div>
    <div class="bubble-wrapper">
      <div class="bubble-content">
        <span>{{ content || '' }}</span>
        <span v-if="!content && streaming" class="thinking">
          <van-loading color="#999" size="14" />
          <span>AI 正在思考中...</span>
        </span>
      </div>
      <div v-if="time" class="bubble-time">{{ time }}</div>
    </div>
    <div v-if="isUser" class="avatar user-avatar">
      <van-icon name="user-o" size="20" color="#fff" />
    </div>
  </div>
</template>

<style scoped>
.chat-bubble {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.bubble-user {
  justify-content: flex-end;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-right: 10px;
}

.user-avatar {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  margin-left: 10px;
}

.bubble-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.bubble-user .bubble-wrapper {
  align-items: flex-end;
}

.bubble-content {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
  min-height: 20px;
}

.bubble-user .bubble-content {
  background: #4facfe;
  color: #fff;
  border-top-right-radius: 4px;
}

.bubble-ai .bubble-content {
  background: #fff;
  color: #323233;
  border-top-left-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.thinking {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 14px;
}

.bubble-time {
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
  padding: 0 4px;
}
</style>
