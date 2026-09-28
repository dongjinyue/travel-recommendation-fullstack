<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  budget: {
    type: Number,
    default: 0
  }
})

const days = computed(() => {
  return props.items.map(d => ({
    day: d.day,
    cost: d.spots.reduce((s, sp) => s + sp.cost, 0)
  }))
})

const isOverBudget = computed(() => props.total > props.budget)
const remaining = computed(() => props.budget - props.total)
</script>

<template>
  <div class="budget-table">
    <div v-for="d in days" :key="d.day" class="budget-row">
      <span class="budget-day">第{{ d.day }}天</span>
      <span class="budget-cost">¥{{ d.cost }}</span>
    </div>

    <van-divider />

    <div class="budget-summary">
      <div class="summary-item">
        <span class="label">总花费</span>
        <span class="value total">¥{{ total }}</span>
      </div>
      <div class="summary-item">
        <span class="label">预算</span>
        <span class="value">¥{{ budget }}</span>
      </div>
      <div class="summary-item">
        <span class="label">{{ isOverBudget ? '超出' : '剩余' }}</span>
        <span class="value" :class="{ over: isOverBudget }">
          ¥{{ Math.abs(remaining) }}
        </span>
      </div>
    </div>

    <van-progress
      :percentage="Math.min(Math.round((total / Math.max(budget, 1)) * 100), 100)"
      :color="isOverBudget ? '#ee0a24' : '#07c160'"
      class="budget-progress"
    />
  </div>
</template>

<style scoped>
.budget-table {
  padding: 8px 0;
}

.budget-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.budget-day {
  color: #646566;
  font-size: 14px;
}

.budget-cost {
  color: #323233;
  font-weight: 500;
}

.budget-summary {
  padding: 8px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
}

.summary-item .label {
  color: #969799;
}

.summary-item .value {
  color: #323233;
  font-weight: 500;
}

.summary-item .value.total {
  font-size: 18px;
  color: #ee0a24;
}

.summary-item .value.over {
  color: #ee0a24;
}

.budget-progress {
  margin-top: 12px;
}
</style>
