<route lang="json5">
{
  style: {
    navigationBarTitleText: '通知消息',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="notification-page">
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </view>
    </view>

    <scroll-view scroll-y class="notif-list" @scrolltolower="loadMore">
      <view
        v-for="n in notifications"
        :key="n.id"
        class="notif-item"
        :class="{ unread: !n.isRead }"
        @click="goDetail(n)"
      >
        <text class="notif-icon">{{ getIcon(n.notifyType) }}</text>
        <view class="notif-content">
          <text class="notif-title">{{ n.title }}</text>
          <text class="notif-body">{{ n.content }}</text>
          <text class="notif-time">{{ n.createdAt?.substr(0, 16) }}</text>
        </view>
        <view class="unread-dot" v-if="!n.isRead" />
      </view>

      <view class="empty" v-if="notifications.length === 0 && !loading">
        <text>暂无通知</text>
      </view>
    </scroll-view>

    <view class="read-all-bar" v-if="unreadCount > 0">
      <button class="read-all-btn" @click="readAll">全部已读</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getNotificationsApi, readAllNotificationsApi } from '@/api/photoApi'

const notifications = ref<any[]>([])
const activeTab = ref('all')
const page = ref(1)
const loading = ref(false)

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'order', label: '订单' },
  { key: 'review', label: '评价' },
  { key: 'commission', label: '佣金' },
  { key: 'system', label: '系统' }
]

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

const iconMap: any = { order: '📋', review: '⭐', commission: '💰', audit: '🔍', system: '📢' }
const getIcon = (type: string) => iconMap[type] || '🔔'

onMounted(() => fetchNotifs(true))

const switchTab = (key: string) => {
  activeTab.value = key
  page.value = 1
  fetchNotifs(true)
}

const fetchNotifs = async (reset = false) => {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: 20 }
    if (activeTab.value !== 'all') params.notifyType = activeTab.value
    const res = await getNotificationsApi(params)
    const list = res?.data?.list || []
    if (reset) notifications.value = list
    else notifications.value.push(...list)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  page.value++
  fetchNotifs()
}

const readAll = async () => {
  await readAllNotificationsApi()
  notifications.value.forEach(n => (n.isRead = true))
  uni.showToast({ title: '已全部标记已读', icon: 'success' })
}

const goDetail = (n: any) => {
  n.isRead = true
  if (n.notifyType === 'order' && n.relatedId) uni.navigateTo({ url: `/pages/order/detail?id=${n.relatedId}` })
}
</script>

<style scoped lang="scss">
.notification-page {
  min-height: 100vh;
  background: #f5f5f5;

  .tab-bar {
    background: #fff;
    display: flex;
    padding: 12rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    .tab-item {
      flex: 1;
      text-align: center;
      padding: 16rpx;
      font-size: 26rpx;
      color: #666;
      &.active {
        color: #ff6b35;
        font-weight: bold;
      }
    }
  }

  .notif-list {
    height: calc(100vh - 120rpx);

    .notif-item {
      background: #fff;
      display: flex;
      align-items: flex-start;
      padding: 24rpx 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      position: relative;

      &.unread {
        background: #fff9f6;
      }

      .notif-icon {
        font-size: 48rpx;
        margin-right: 20rpx;
        flex-shrink: 0;
      }
      .notif-content {
        flex: 1;
      }
      .notif-title {
        display: block;
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 8rpx;
      }
      .notif-body {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-bottom: 8rpx;
        line-height: 1.5;
      }
      .notif-time {
        font-size: 22rpx;
        color: #999;
      }

      .unread-dot {
        width: 16rpx;
        height: 16rpx;
        background: #ff6b35;
        border-radius: 8rpx;
        flex-shrink: 0;
        margin-top: 8rpx;
      }
    }

    .empty {
      text-align: center;
      padding: 120rpx;
      color: #999;
      font-size: 28rpx;
    }
  }

  .read-all-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
    .read-all-btn {
      height: 88rpx;
      background: #ff6b35;
      color: #fff;
      border-radius: 44rpx;
      font-size: 30rpx;
      border: none;
    }
  }
}
</style>
