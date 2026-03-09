<route lang="json5">
{
  style: {
    navigationBarTitleText: '档期管理',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="schedule-page">
    <!-- 月份切换 -->
    <view class="month-header">
      <text class="month-nav" @click="prevMonth">‹</text>
      <text class="month-title">{{ year }}年{{ month }}月</text>
      <text class="month-nav" @click="nextMonth">›</text>
    </view>

    <!-- 日历 -->
    <view class="calendar">
      <view class="weekdays">
        <text v-for="w in weekdays" :key="w" class="weekday">{{ w }}</text>
      </view>
      <view class="days">
        <view
          v-for="(day, i) in calDays"
          :key="i"
          class="day-cell"
          :class="[day.status, { today: day.isToday, empty: !day.date, past: day.isPast }]"
          @click="day.date && !day.isPast && toggleDay(day)"
        >
          <text class="day-num">{{ day.date }}</text>
          <text class="day-status-dot" v-if="day.date && day.status">
            {{ { available: '●', booked: '●', rest: '●' }[day.status] }}
          </text>
        </view>
      </view>
    </view>

    <!-- 图例 -->
    <view class="legend">
      <view class="legend-item" v-for="lv in legend" :key="lv.key">
        <text class="legend-dot" :class="lv.key">●</text>
        <text class="legend-label">{{ lv.label }}</text>
      </view>
    </view>

    <!-- 批量设置 -->
    <view class="batch-section" v-if="selectedDates.length > 0">
      <text class="batch-hint">已选 {{ selectedDates.length }} 天</text>
      <view class="batch-btns">
        <button class="batch-btn available" @click="batchSet('available')">设为可约</button>
        <button class="batch-btn rest" @click="batchSet('rest')">标记休息</button>
        <button class="batch-btn clear" @click="selectedDates = []">取消</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getScheduleApi, batchSetScheduleApi } from '@/api/photoApi'

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth() + 1)
const schedules = ref<any[]>([])
const selectedDates = ref<string[]>([])

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const legend = [
  { key: 'available', label: '可约' },
  { key: 'booked', label: '已约' },
  { key: 'rest', label: '休息' }
]

const calDays = computed(() => {
  const firstDay = new Date(year.value, month.value - 1, 1)
  const lastDay = new Date(year.value, month.value, 0)
  const cells: any[] = []

  // padding for first weekday
  for (let i = 0; i < firstDay.getDay(); i++) cells.push({ date: null })

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year.value}-${String(month.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const sch = schedules.value.find((s: any) => s.date === dateStr)
    const cellDate = new Date(year.value, month.value - 1, d)
    const isToday = cellDate.toDateString() === today.toDateString()
    const isPast = cellDate < today && !isToday
    cells.push({
      date: d,
      dateStr,
      isToday,
      isPast,
      status: sch?.status || '',
      selected: selectedDates.value.includes(dateStr)
    })
  }
  return cells
})

onMounted(() => fetchSchedule())

const fetchSchedule = async () => {
  const res = await getScheduleApi({ year: year.value, month: month.value })
  schedules.value = res?.data || []
}

const prevMonth = () => {
  if (month.value === 1) {
    year.value--
    month.value = 12
  } else month.value--
  fetchSchedule()
}

const nextMonth = () => {
  if (month.value === 12) {
    year.value++
    month.value = 1
  } else month.value++
  fetchSchedule()
}

const toggleDay = (day: any) => {
  const idx = selectedDates.value.indexOf(day.dateStr)
  if (idx >= 0) selectedDates.value.splice(idx, 1)
  else selectedDates.value.push(day.dateStr)
}

const batchSet = async (status: string) => {
  await batchSetScheduleApi({ dates: selectedDates.value, status })
  selectedDates.value.forEach(d => {
    const existing = schedules.value.find((s: any) => s.date === d)
    if (existing) existing.status = status
    else schedules.value.push({ date: d, status })
  })
  selectedDates.value = []
  uni.showToast({ title: '设置成功', icon: 'success' })
}
</script>

<style scoped lang="scss">
.schedule-page {
  min-height: 100vh;
  background: #f5f5f5;

  .month-header {
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx;
    gap: 60rpx;
    .month-nav {
      font-size: 48rpx;
      color: #ff6b35;
      width: 60rpx;
      text-align: center;
    }
    .month-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      min-width: 280rpx;
      text-align: center;
    }
  }

  .calendar {
    background: #fff;
    margin: 16rpx;
    border-radius: 16rpx;
    padding: 24rpx;

    .weekdays {
      display: flex;
      margin-bottom: 16rpx;
    }
    .weekday {
      flex: 1;
      text-align: center;
      font-size: 24rpx;
      color: #999;
    }

    .days {
      display: flex;
      flex-wrap: wrap;
    }
    .day-cell {
      width: calc(100% / 7);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12rpx 0;
      border-radius: 8rpx;
      position: relative;

      .day-num {
        font-size: 28rpx;
        color: #333;
      }
      .day-status-dot {
        font-size: 16rpx;
        margin-top: 4rpx;
      }

      &.today .day-num {
        color: #ff6b35;
        font-weight: bold;
      }
      &.past .day-num {
        color: #ccc;
      }
      &.available {
        background: rgba(76, 175, 80, 0.05);
        .day-num {
          color: #333;
        }
        .day-status-dot {
          color: #4caf50;
        }
      }
      &.booked {
        background: rgba(255, 107, 53, 0.05);
        .day-status-dot {
          color: #ff6b35;
        }
      }
      &.rest {
        background: rgba(158, 158, 158, 0.05);
        .day-status-dot {
          color: #9e9e9e;
        }
      }
      &.empty {
        visibility: hidden;
      }
    }
  }

  .legend {
    background: #fff;
    margin: 0 16rpx 16rpx;
    border-radius: 16rpx;
    padding: 16rpx 24rpx;
    display: flex;
    gap: 40rpx;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
    }
    .legend-dot {
      font-size: 24rpx;
      &.available {
        color: #4caf50;
      }
      &.booked {
        color: #ff6b35;
      }
      &.rest {
        color: #9e9e9e;
      }
    }
    .legend-label {
      font-size: 24rpx;
      color: #666;
    }
  }

  .batch-section {
    background: #fff;
    margin: 0 16rpx;
    border-radius: 16rpx;
    padding: 24rpx;

    .batch-hint {
      font-size: 28rpx;
      color: #333;
      display: block;
      margin-bottom: 16rpx;
    }
    .batch-btns {
      display: flex;
      gap: 16rpx;
    }
    .batch-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 26rpx;
      border: none;
      margin: 0;
      &.available {
        background: #4caf50;
        color: #fff;
      }
      &.rest {
        background: #9e9e9e;
        color: #fff;
      }
      &.clear {
        background: #f5f5f5;
        color: #666;
      }
    }
  }
}
</style>
