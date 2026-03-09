<route lang="json5">
{
  style: {
    navigationBarTitleText: '我的订单',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="order-list-page">
    <!-- 状态Tab -->
    <scroll-view scroll-x class="status-tabs">
      <view
        v-for="tab in statusTabs"
        :key="tab.key"
        class="status-tab"
        :class="{ active: currentStatus === tab.key }"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </view>
    </scroll-view>

    <!-- 订单列表 -->
    <scroll-view scroll-y class="order-list" @scrolltolower="loadMore">
      <view v-for="order in orders" :key="order.id" class="order-card" @click="goDetail(order.id)">
        <view class="order-header">
          <text class="order-no">订单 {{ order.orderNo }}</text>
          <text class="order-status" :class="getStatusClass(order.status)">{{ getStatusLabel(order.status) }}</text>
        </view>

        <view class="order-body">
          <image
            :src="order.photographer?.user?.avatar || '/static/default-avatar.png'"
            mode="aspectFill"
            class="order-avatar"
          />
          <view class="order-info">
            <text class="order-photographer">{{ order.photographer?.user?.nickname }}</text>
            <text class="order-service">
              {{ order.serviceName || `${order.orderType === 'service' ? '拍摄套餐' : '作品解锁'}` }}
            </text>
            <text class="order-date">预约：{{ order.shootDate || '待定' }}</text>
          </view>
          <text class="order-amount">¥{{ order.amount }}</text>
        </view>

        <view class="order-footer">
          <text class="order-time">{{ order.createdAt?.substr(0, 16) }}</text>
          <view class="order-actions">
            <button
              v-if="order.status === 'completed' && !order.isReviewed"
              class="action-btn review"
              @click.stop="goReview(order)"
            >
              去评价
            </button>
            <button v-if="order.status === 'pending'" class="action-btn cancel" @click.stop="cancelOrder(order)">
              取消
            </button>
            <button v-if="order.status === 'delivered'" class="action-btn confirm" @click.stop="confirmOrder(order)">
              确认收货
            </button>
            <button
              v-if="['confirmed', 'shooting'].includes(order.status)"
              class="action-btn chat"
              @click.stop="goChat(order)"
            >
              联系摄影师
            </button>
          </view>
        </view>
      </view>

      <view class="empty" v-if="orders.length === 0 && !loading">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单</text>
      </view>
      <view class="no-more" v-if="noMore && orders.length > 0">— 没有更多了 —</view>
      <view class="loading" v-if="loading">加载中...</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { getOrderListApi, cancelOrderApi, confirmOrderApi } from '@/api/photoApi'

const orders = ref<any[]>([])
const page = ref(1)
const noMore = ref(false)
const loading = ref(false)
const currentStatus = ref('')

const statusTabs = [
  { key: '', label: '全部' },
  { key: 'pending', label: '待确认' },
  { key: 'confirmed', label: '已确认' },
  { key: 'shooting', label: '拍摄中' },
  { key: 'delivered', label: '待验收' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
]

const statusMap: any = {
  pending: { label: '待摄影师确认', cls: 'pending' },
  confirmed: { label: '已确认', cls: 'confirmed' },
  shooting: { label: '拍摄中', cls: 'confirmed' },
  delivered: { label: '待验收', cls: 'warning' },
  completed: { label: '已完成', cls: 'success' },
  cancelled: { label: '已取消', cls: 'cancelled' },
  refund_pending: { label: '退款审核中', cls: 'warning' },
  refunded: { label: '已退款', cls: 'cancelled' }
}

const getStatusLabel = (s: string) => statusMap[s]?.label || s
const getStatusClass = (s: string) => statusMap[s]?.cls || ''

onMounted(() => {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1] as any
  const status = cur.$page?.options?.status
  if (status) currentStatus.value = status
  fetchOrders(true)
})

const switchTab = (status: string) => {
  currentStatus.value = status
  page.value = 1
  noMore.value = false
  fetchOrders(true)
}

const fetchOrders = async (reset = false) => {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: 15 }
    if (currentStatus.value) params.status = currentStatus.value
    const res = await getOrderListApi(params)
    const list = res?.data?.list || []
    if (reset) orders.value = list
    else orders.value.push(...list)
    if (list.length < 15) noMore.value = true
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!noMore.value) {
    page.value++
    fetchOrders()
  }
}

const cancelOrder = (order: any) => {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消这个订单吗？',
    async success(res) {
      if (res.confirm) {
        await cancelOrderApi(order.id, { reason: '买家主动取消' })
        order.status = 'cancelled'
        uni.showToast({ title: '已取消', icon: 'success' })
      }
    }
  })
}

const confirmOrder = async (order: any) => {
  await confirmOrderApi(order.id)
  order.status = 'completed'
  uni.showToast({ title: '确认成功', icon: 'success' })
}

const goDetail = (id: number) => uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
const goReview = (order: any) =>
  uni.navigateTo({ url: `/pages/review/create?orderId=${order.id}&photographerId=${order.photographerId}` })
const goChat = (order: any) =>
  uni.navigateTo({
    url: `/pages/chat/detail?userId=${order.photographer?.userId}&name=${order.photographer?.user?.nickname}`
  })
</script>

<style scoped lang="scss">
.order-list-page {
  min-height: 100vh;
  background: #f5f5f5;

  .status-tabs {
    background: #fff;
    white-space: nowrap;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    .status-tab {
      display: inline-block;
      padding: 10rpx 28rpx;
      font-size: 26rpx;
      color: #666;
      position: relative;

      &.active {
        color: #ff6b35;
        font-weight: bold;
        &::after {
          content: '';
          position: absolute;
          bottom: -16rpx;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 4rpx;
          background: #ff6b35;
          border-radius: 2rpx;
        }
      }
    }
  }

  .order-list {
    height: calc(100vh - 110rpx);

    .order-card {
      background: #fff;
      margin: 16rpx;
      border-radius: 16rpx;
      padding: 24rpx;

      .order-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16rpx;
        .order-no {
          font-size: 24rpx;
          color: #999;
        }
        .order-status {
          font-size: 26rpx;
          font-weight: bold;
          &.pending {
            color: #ff6b35;
          }
          &.confirmed {
            color: #4caf50;
          }
          &.warning {
            color: #ff9800;
          }
          &.success {
            color: #2196f3;
          }
          &.cancelled {
            color: #999;
          }
        }
      }

      .order-body {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;

        .order-avatar {
          width: 96rpx;
          height: 96rpx;
          border-radius: 48rpx;
          margin-right: 20rpx;
        }
        .order-info {
          flex: 1;
        }
        .order-photographer {
          display: block;
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 8rpx;
        }
        .order-service {
          display: block;
          font-size: 26rpx;
          color: #666;
          margin-bottom: 4rpx;
        }
        .order-date {
          display: block;
          font-size: 24rpx;
          color: #999;
        }
        .order-amount {
          font-size: 36rpx;
          color: #ff4444;
          font-weight: bold;
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1rpx solid #f5f5f5;
        padding-top: 16rpx;

        .order-time {
          font-size: 22rpx;
          color: #999;
        }
        .order-actions {
          display: flex;
          gap: 12rpx;
        }
        .action-btn {
          height: 60rpx;
          line-height: 60rpx;
          padding: 0 24rpx;
          border-radius: 30rpx;
          font-size: 24rpx;
          margin: 0;
          border: none;

          &.review {
            background: #ff6b35;
            color: #fff;
          }
          &.cancel {
            background: #fff;
            color: #999;
            border: 1rpx solid #ddd;
          }
          &.confirm {
            background: #4caf50;
            color: #fff;
          }
          &.chat {
            background: #fff;
            color: #ff6b35;
            border: 1rpx solid #ff6b35;
          }
        }
      }
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 120rpx 0;
    }
    .empty-icon {
      font-size: 120rpx;
      margin-bottom: 24rpx;
    }
    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
    .no-more,
    .loading {
      text-align: center;
      padding: 24rpx;
      color: #999;
      font-size: 26rpx;
    }
  }
}
</style>
