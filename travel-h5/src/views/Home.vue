<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const city = ref('')
const budget = ref('')
const days = ref(3)
const showCityPicker = ref(false)
const isLoading = ref(false)

const cityOptions = [
  { text: '北京', value: '北京' },
  { text: '上海', value: '上海' },
  { text: '广州', value: '广州' },
  { text: '深圳', value: '深圳' },
  { text: '杭州', value: '杭州' },
  { text: '成都', value: '成都' },
  { text: '西安', value: '西安' },
  { text: '厦门', value: '厦门' },
  { text: '丽江', value: '丽江' },
  { text: '三亚', value: '三亚' },
  { text: '重庆', value: '重庆' },
  { text: '南京', value: '南京' },
  { text: '武汉', value: '武汉' },
  { text: '苏州', value: '苏州' },
  { text: '长沙', value: '长沙' },
  { text: '天津', value: '天津' },
  { text: '青岛', value: '青岛' },
  { text: '大连', value: '大连' },
  { text: '哈尔滨', value: '哈尔滨' },
  { text: '昆明', value: '昆明' }
]

const hotCities = [
  { name: '北京', icon: '🏯' },
  { name: '上海', icon: '🌃' },
  { name: '广州', icon: '🌺' },
  { name: '成都', icon: '🐼' },
  { name: '杭州', icon: '🍵' },
  { name: '西安', icon: '🏺' },
  { name: '厦门', icon: '🌊' },
  { name: '三亚', icon: '🌴' }
]

const quickEntries = [
  { icon: '🎫', name: '景点门票', color: '#ff6b6b' },
  { icon: '🏨', name: '酒店', color: '#4ecdc4' },
  { icon: '✈️', name: '机票', color: '#45b7d1' },
  { icon: '🚌', name: '跟团游', color: '#f9ca24' }
]

const onCityConfirm = ({ selectedValues }) => {
  city.value = selectedValues[0]
  showCityPicker.value = false
}

const selectHotCity = (cityName) => {
  city.value = cityName
}

const onSearch = () => {
  if (!city.value) {
    showToast('请选择目的地')
    return
  }
  if (!budget.value || Number(budget.value) < 100) {
    showToast('预算不能低于100元')
    return
  }
  if (!days.value || Number(days.value) < 1 || Number(days.value) > 30) {
    showToast('天数必须在1-30天之间')
    return
  }

  isLoading.value = true

  router.push({
    path: '/detail',
    query: {
      city: city.value,
      budget: budget.value,
      days: days.value
    }
  })
}
</script>

<template>
  <div class="home">
    <!-- 头部区域 -->
    <div class="header">
      <van-nav-bar title="旅行推荐" :border="false" />
      <div class="header-content">
        <h1>发现你的旅程</h1>
        <p>AI 为你定制专属旅行计划</p>
      </div>

      <!-- 公告栏 -->
      <div class="notice-bar">
        <van-notice-bar
          left-icon="volume-o"
          background="#e8f5e9"
          color="#2e7d32"
          scrollable
        >
          暑期特惠！AI 定制行程立减200元，新用户首单再享8折优惠
        </van-notice-bar>
      </div>
    </div>

    <div class="content">
      <!-- 快捷入口 -->
      <div class="quick-entry">
        <div
          v-for="item in quickEntries"
          :key="item.name"
          class="entry-item"
        >
          <div class="entry-icon" :style="{ background: item.color }">
            {{ item.icon }}
          </div>
          <span class="entry-name">{{ item.name }}</span>
        </div>
      </div>

      <!-- 行程设置 -->
      <div class="trip-form">
        <div class="form-title">行程设置</div>

        <van-cell-group inset>
          <van-field
            v-model="city"
            is-link
            readonly
            label="目的地"
            placeholder="请选择城市"
            @click="showCityPicker = true"
          >
            <template #button>
              <van-icon name="location-o" />
            </template>
          </van-field>

          <van-popup v-model:show="showCityPicker" round position="bottom">
            <van-picker
              :columns="[cityOptions]"
              @confirm="onCityConfirm"
              @cancel="showCityPicker = false"
            />
          </van-popup>

          <van-field v-model="budget" type="number" label="预算" placeholder="请输入预算金额">
            <template #button>
              <span class="suffix">元</span>
            </template>
          </van-field>

          <van-field v-model="days" type="number" label="天数" placeholder="请输入天数">
            <template #button>
              <span class="suffix">天</span>
            </template>
          </van-field>
        </van-cell-group>

        <div class="submit-btn">
          <van-button
            round
            block
            type="success"
            :loading="isLoading"
            @click="onSearch"
          >
            生成旅行计划
          </van-button>
        </div>
      </div>

      <!-- 热门目的地 -->
      <div class="hot-destinations">
        <div class="section-title">热门目的地</div>
        <div class="city-tags">
          <van-tag
            v-for="item in hotCities"
            :key="item.name"
            :type="city === item.name ? 'primary' : 'default'"
            size="large"
            round
            class="city-tag"
            @click="selectHotCity(item.name)"
          >
            {{ item.icon }} {{ item.name }}
          </van-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #43a047 0%, #66bb6a 100%);
  padding-bottom: 20px;
}

.header :deep(.van-nav-bar) {
  background: transparent;
}

.header :deep(.van-nav-bar__title) {
  color: #fff;
  font-size: 18px;
}

.header-content {
  padding: 20px 20px 10px;
  text-align: center;
  color: #fff;
}

.header-content h1 {
  font-size: 26px;
  margin: 0 0 8px;
  font-weight: 600;
}

.header-content p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.notice-bar {
  padding: 10px 16px;
}

.notice-bar :deep(.van-notice-bar) {
  border-radius: 20px;
}

.content {
  padding: 16px;
  margin-top: -10px;
}

.quick-entry {
  display: flex;
  justify-content: space-around;
  background: #fff;
  border-radius: 12px;
  padding: 20px 10px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.entry-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.entry-name {
  font-size: 13px;
  color: #333;
}

.trip-form {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-left: 4px;
}

.trip-form :deep(.van-cell-group) {
  margin: 0;
}

.trip-form :deep(.van-cell-group--inset) {
  border-radius: 8px;
}

.suffix {
  color: #969799;
  font-size: 14px;
}

.submit-btn {
  padding: 20px 0 4px;
}

.submit-btn :deep(.van-button--success) {
  background: linear-gradient(135deg, #43a047 0%, #66bb6a 100%);
  border: none;
}

.hot-destinations {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.city-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.city-tag {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.city-tag :deep(.van-tag--default) {
  background: #f5f5f5;
  color: #666;
}

.city-tag :deep(.van-tag--primary) {
  background: linear-gradient(135deg, #43a047 0%, #66bb6a 100%);
}
</style>