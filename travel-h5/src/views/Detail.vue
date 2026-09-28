<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import request from '../utils/request'

const route = useRoute()
const router = useRouter()

const city = ref(route.query.city || '')
const budget = ref(route.query.budget || 0)
const days = ref(Number(route.query.days) || 3)
const itineraryId = ref(route.query.id || '')
const routeData = ref(route.query.data ? JSON.parse(route.query.data) : null)
const loading = ref(true)
const errorMsg = ref('')
const isEmpty = ref(false)
const itinerary = ref([])
const expandedDays = ref({})
const budgetBreakdown = ref([])
const tips = ref([])
const warnings = ref([])

const timeLabels = [
  { label: '上午', color: '#ff9800' },
  { label: '下午', color: '#2196f3' },
  { label: '晚上', color: '#9c27b0' }
]

function toggleDay(day) {
  expandedDays.value[day] = !expandedDays.value[day]
}

function isDayExpanded(day) {
  return expandedDays.value[day] !== false
}

const loadItinerary = async () => {
  loading.value = true
  errorMsg.value = ''
  isEmpty.value = false
  itinerary.value = []
  budgetBreakdown.value = []
  tips.value = []
  warnings.value = []

  try {
    if (routeData.value && routeData.value.dailyItinerary) {
      const data = routeData.value
      console.log('=== 首页传递的数据 ===')
      console.log(data)
      fillData(data)
    } else {
      await new Promise((resolve) => {
        request.stream('/recommend', {
          city: city.value,
          budget: Number(budget.value),
          days: days.value
        }, {
          onChunk: () => {},
          onComplete: (data) => {
            console.log('=== Detail页SSE后端返回数据 ===')
            console.log(data)

            if (!data || data.success === false) {
              errorMsg.value = data?.message || '生成行程失败'
            } else if (!data.dailyItinerary || data.dailyItinerary.length === 0) {
              errorMsg.value = '行程数据为空，请重新生成'
            } else {
              fillData(data)
            }
            resolve()
          },
          onError: (err) => {
            console.error('=== Detail页SSE请求失败 ===')
            console.error(err)
            errorMsg.value = err.message || '加载失败，请稍后重试'
            resolve()
          }
        })
      })
    }
  } catch (err) {
    console.error('=== 加载行程失败 ===')
    console.error(err)
    errorMsg.value = err.message || '加载失败，请稍后重试'
  }

  if (itinerary.value.length === 0 && !errorMsg.value) {
    isEmpty.value = true
  }

  loading.value = false
}

function fillData(data) {
  city.value = data.city || city.value
  budget.value = data.totalBudget || budget.value
  days.value = data.days || days.value

  itinerary.value = data.dailyItinerary.map(day => ({
    day: day.day,
    date: day.date,
    sessions: timeLabels.map(t => {
      const sessionKey = t.label === '上午' ? 'morning' : t.label === '下午' ? 'afternoon' : 'evening'
      const spotData = day[sessionKey]
      if (!spotData) return null
      return {
        ...t,
        spots: [{
          name: spotData.spot,
          duration: spotData.duration,
          price: spotData.ticket,
          location: spotData.transportation,
          desc: spotData.description
        }]
      }
    }).filter(s => s !== null)
  }))

  if (data.budgetBreakdown) {
    budgetBreakdown.value = [
      { name: '住宿', amount: data.budgetBreakdown.accommodation || 0 },
      { name: '餐饮', amount: data.budgetBreakdown.food || 0 },
      { name: '交通', amount: data.budgetBreakdown.transportation || 0 },
      { name: '门票', amount: data.budgetBreakdown.tickets || 0 },
      { name: '其他', amount: data.budgetBreakdown.other || 0 }
    ]
  }

  if (data.tips) tips.value = data.tips
  if (data.warnings) warnings.value = data.warnings
}

const goChat = () => {
  router.push({ path: '/chat', query: { city: city.value, budget: budget.value, days: days.value } })
}

watch(() => route.query, () => {
  city.value = route.query.city || ''
  budget.value = route.query.budget || 0
  days.value = Number(route.query.days) || 3
  itineraryId.value = route.query.id || ''
  routeData.value = route.query.data ? JSON.parse(route.query.data) : null
  loadItinerary()
})

onMounted(loadItinerary)
</script>

<template>
  <div class="detail">
    <van-nav-bar
      title="行程规划"
      left-text="返回"
      left-arrow
      @click-left="router.back()"
      placeholder
      fixed
    />

    <van-loading v-if="loading" type="spinner" vertical>
      AI 正在为你生成行程...
    </van-loading>

    <!-- 错误状态 -->
    <div v-else-if="errorMsg" class="state-wrap">
      <van-empty image="error" description="">
        <div class="state-title">加载失败</div>
        <div class="state-desc">{{ errorMsg }}</div>
        <div class="state-actions">
          <van-button type="primary" round @click="loadItinerary">重新加载</van-button>
          <van-button round @click="router.back()">返回首页</van-button>
        </div>
      </van-empty>
    </div>

    <!-- 空状态 -->
    <div v-else-if="isEmpty" class="state-wrap">
      <van-empty image="data" description="">
        <div class="state-title">暂无行程数据</div>
        <div class="state-desc">请返回首页重新生成旅行计划</div>
        <div class="state-actions">
          <van-button type="primary" round @click="router.back()">返回首页</van-button>
        </div>
      </van-empty>
    </div>

    <template v-else>
      <!-- 行程摘要 -->
      <div class="summary-card">
        <div class="summary-left">
          <span class="city-name">{{ city }}</span>
          <span class="dash">·</span>
          <span class="days">{{ days }}天行程</span>
        </div>
        <div class="summary-right">
          <span class="budget-label">预算:</span>
          <span class="budget-value">¥{{ budget }}</span>
        </div>
      </div>

      <!-- 行程详情 -->
      <div class="itinerary">
        <div
          v-for="day in itinerary"
          :key="day.day"
          class="day-section"
        >
          <div
            class="day-header"
            @click="toggleDay(day.day)"
          >
            <span class="day-title">第{{ day.day }}天 · 第{{ day.day }}天</span>
            <van-icon
              :name="isDayExpanded(day.day) ? 'arrow-up' : 'arrow-down'"
              class="day-arrow"
            />
          </div>

          <div v-show="isDayExpanded(day.day)" class="day-body">
            <div
              v-for="session in day.sessions"
              :key="session.label"
              class="session"
            >
              <span class="session-label" :style="{ background: session.color }">
                {{ session.label }}
              </span>

              <div
                v-for="(spot, idx) in session.spots"
                :key="idx"
                class="spot-card"
              >
                <div class="spot-name">{{ spot.name }}</div>
                <div class="spot-meta">
                  <span class="meta-item">
                    <van-icon name="clock-o" />
                    {{ spot.duration }}
                  </span>
                  <span class="meta-item price">
                    <van-icon name="balance-list" />
                    {{ spot.price }}
                  </span>
                </div>
                <div class="spot-location">
                  <van-icon name="location-o" />
                  {{ spot.location }}
                </div>
                <div class="spot-desc">{{ spot.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 预算明细 -->
      <div class="budget-card">
        <div class="card-title">预算明细</div>
        <div
          v-for="item in budgetBreakdown"
          :key="item.name"
          class="budget-row"
        >
          <span class="budget-name">{{ item.name }}</span>
          <span class="budget-amount">¥{{ item.amount }}</span>
        </div>
        <van-divider />
        <div class="budget-row total">
          <span class="budget-name">总计</span>
          <span class="budget-amount red">¥{{ budget }}</span>
        </div>
      </div>

      <!-- 温馨提示 -->
      <div class="tips-card">
        <div class="card-title">温馨提示</div>
        <div
          v-for="(tip, idx) in tips"
          :key="idx"
          class="tip-item"
        >
          {{ tip }}
        </div>
      </div>

      <!-- 注意事项 -->
      <div class="notes-card">
        <div class="card-title">注意事项</div>
        <div
          v-for="(note, idx) in warnings"
          :key="idx"
          class="tip-item"
        >
          {{ note }}
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="action-bar">
        <van-button round block type="primary" @click="goChat">
          咨询 AI 助手
        </van-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.summary-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.summary-left {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.summary-left .city-name {
  color: #1976d2;
}

.summary-left .dash {
  margin: 0 6px;
  color: #999;
}

.summary-right {
  font-size: 14px;
}

.budget-label {
  color: #666;
  margin-right: 4px;
}

.budget-value {
  color: #ff5722;
  font-weight: 600;
  font-size: 16px;
}

.itinerary {
  padding: 0 12px;
}

.day-section {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.day-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.day-arrow {
  color: #999;
  font-size: 14px;
}

.day-body {
  padding: 12px 16px;
}

.session {
  margin-bottom: 16px;
}

.session:last-child {
  margin-bottom: 0;
}

.session-label {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 10px;
}

.spot-card {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
  border-left: 3px solid #1976d2;
}

.spot-card:last-child {
  margin-bottom: 0;
}

.spot-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.spot-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item.price {
  color: #ff5722;
}

.spot-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #1976d2;
  margin-bottom: 8px;
}

.spot-desc {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

.budget-card,
.tips-card,
.notes-card {
  background: #fff;
  border-radius: 12px;
  margin: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.budget-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.budget-name {
  color: #666;
}

.budget-amount {
  color: #333;
}

.budget-amount.red {
  color: #ff5722;
  font-weight: 600;
  font-size: 16px;
}

.budget-row.total {
  font-size: 16px;
  font-weight: 600;
}

.tip-item {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  padding: 6px 0;
  position: relative;
  padding-left: 14px;
}

.tip-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #1976d2;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.action-bar :deep(.van-button--primary) {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  border: none;
}

.state-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.state-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.state-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
  text-align: center;
}

.state-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
