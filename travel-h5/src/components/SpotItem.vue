<script setup>
defineProps({
  name: {
    type: String,
    default: ''
  },
  desc: {
    type: String,
    default: ''
  },
  cost: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="spot-item">
    <div class="spot-icon">
      <van-icon name="location" color="#4facfe" size="24" />
    </div>
    <div class="spot-info">
      <div class="spot-name">{{ name }}</div>
      <div class="spot-desc">{{ desc }}</div>
    </div>
    <div class="spot-cost">
      <span v-if="cost > 0" class="cost-amount">¥{{ cost }}</span>
      <span v-else class="cost-free">免费</span>
    </div>
  </div>
</template>

<style scoped>
.spot-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
}

.spot-item:last-child {
  border-bottom: none;
}

.spot-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f4fe;
  border-radius: 50%;
  flex-shrink: 0;
}

.spot-info {
  flex: 1;
  margin: 0 12px;
  min-width: 0;
}

.spot-name {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
}

.spot-desc {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spot-cost {
  flex-shrink: 0;
}

.cost-amount {
  color: #ee0a24;
  font-weight: bold;
  font-size: 15px;
}

.cost-free {
  color: #07c160;
  font-size: 13px;
}
</style>
