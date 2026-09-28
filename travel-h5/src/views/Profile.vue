<script setup>
import { ref } from 'vue'
import { showConfirmDialog, showToast } from 'vant'

const userInfo = ref({
  name: '旅行者',
  avatar: '',
  level: 'VIP',
  travelCount: 12,
  favoriteCities: ['北京', '上海', '成都']
})

const menuList = [
  { icon: 'orders-o', title: '我的行程', path: '/profile' },
  { icon: 'location-o', title: '足迹地图', path: '/profile' },
  { icon: 'star-o', title: '收藏景点', path: '/profile' },
  { icon: 'balance-list', title: '预算记录', path: '/profile' },
  { icon: 'service-o', title: '联系客服', path: '/profile' },
  { icon: 'setting-o', title: '设置', path: '/profile' }
]

const onMenuClick = (item) => {
  showToast(`${item.title} 功能开发中`)
}

const onLogout = () => {
  showConfirmDialog({
    title: '确认退出',
    message: '确定要退出登录吗？'
  }).then(() => {
    showToast('已退出登录')
  }).catch(() => {})
}
</script>

<template>
  <div class="profile">
    <van-nav-bar title="我的" fixed placeholder />

    <div class="user-header">
      <van-image
        width="64"
        height="64"
        round
        :src="userInfo.avatar"
        class="avatar"
      >
        <template #error>
          <van-icon name="user-o" size="40" color="#fff" />
        </template>
      </van-image>
      <div class="user-info">
        <div class="username">
          {{ userInfo.name }}
          <van-tag type="danger" round size="medium">{{ userInfo.level }}</van-tag>
        </div>
        <div class="user-stats">
          已旅行 <b>{{ userInfo.travelCount }}</b> 次
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-num">{{ userInfo.favoriteCities.length }}</div>
        <div class="stat-label">收藏城市</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">36</div>
        <div class="stat-label">景点收藏</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">128</div>
        <div class="stat-label">积分</div>
      </div>
    </div>

    <van-cell-group inset title="常用功能">
      <van-cell
        v-for="item in menuList"
        :key="item.title"
        :title="item.title"
        :icon="item.icon"
        is-link
        @click="onMenuClick(item)"
      />
    </van-cell-group>

    <div class="logout-wrap">
      <van-button round block type="danger" plain @click="onLogout">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.profile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 60px;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.avatar {
  background: rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.user-info {
  margin-left: 16px;
}

.username {
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-stats {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.9;
}

.user-stats b {
  font-size: 16px;
}

.stats-row {
  display: flex;
  background: #fff;
  padding: 20px 0;
  margin-bottom: 10px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-num {
  font-size: 24px;
  font-weight: bold;
  color: #323233;
}

.stat-label {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

.logout-wrap {
  padding: 30px 16px;
}
</style>
