<route lang="json5">
{
  style: {
    navigationBarTitleText: '订单详情',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="order-detail-page" v-if="order">
    <!-- 状态栏 -->
    <view class="status-hero" :class="getStatusClass(order.status)">
      <text class="status-icon">{{ getStatusIcon(order.status) }}</text>
      <text class="status-text">{{ getStatusLabel(order.status) }}</text>
      <text class="status-hint">{{ getStatusHint(order.status) }}</text>
    </view>

    <!-- 摄影师信息 -->
    <view class="section">
      <text class="section-title">摄影师</text>
      <view class="photographer-row" @click="goPhotographer">
        <image
          :src="order.photographer?.user?.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
          class="p-avatar"
        />
        <view class="p-info">
          <text class="p-name">{{ order.photographer?.user?.nickname }}</text>
          <text class="p-phone">{{ order.photographer?.user?.phone }}</text>
        </view>
        <button class="chat-btn" @click.stop="goChat">联系</button>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="section">
      <text class="section-title">订单信息</text>
      <view class="info-rows">
        <view class="info-row">
          <text class="info-label">订单号</text>
          <text class="info-value copyable" @click="copy(order.orderNo)">{{ order.orderNo }} 复制</text>
        </view>
        <view class="info-row">
          <text class="info-label">订单类型</text>
          <text class="info-value">{{ order.orderType === 'service' ? '拍摄服务' : '作品解锁' }}</text>
        </view>
        <view class="info-row" v-if="order.serviceName">
          <text class="info-label">服务套餐</text>
          <text class="info-value">{{ order.serviceName }}</text>
        </view>
        <view class="info-row" v-if="order.shootDate">
          <text class="info-label">拍摄日期</text>
          <text class="info-value">{{ order.shootDate }}</text>
        </view>
        <view class="info-row" v-if="order.shootLocation">
          <text class="info-label">拍摄地点</text>
          <text class="info-value">{{ order.shootLocation }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ order.createdAt?.substr(0, 16) }}</text>
        </view>
      </view>
    </view>

    <!-- 价格信息 -->
    <view class="section">
      <text class="section-title">费用明细</text>
      <view class="price-rows">
        <view class="price-row">
          <text>服务费用</text>
          <text>¥{{ order.amount }}</text>
        </view>
        <view class="price-row" v-if="order.platformFee">
          <text>平台服务费</text>
          <text>¥{{ order.platformFee }}</text>
        </view>
        <view class="price-row total">
          <text>实付</text>
          <text class="total-price">¥{{ order.amount }}</text>
        </view>
      </view>
    </view>

    <!-- 备注 -->
    <view class="section" v-if="order.remark">
      <text class="section-title">备注</text>
      <text class="remark-text">{{ order.remark }}</text>
    </view>

    <!-- 操作按钮 -->
    <view class="bottom-bar">
      <button class="btn cancel" v-if="order.status === 'pending'" @click="cancelOrder">取消订单</button>
      <button class="btn refund" v-if="['confirmed', 'shooting'].includes(order.status)" @click="applyRefund">
        申请退款
      </button>
      <button class="btn confirm" v-if="order.status === 'delivered'" @click="confirmOrder">确认完成</button>
      <button class="btn review" v-if="order.status === 'completed' && !order.isReviewed" @click="goReview">
        去评价
      </button>
      <button class="btn chat" v-if="!['cancelled', 'refunded'].includes(order.status)" @click="goChat">
        联系摄影师
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getOrderDetailApi, cancelOrderApi, confirmOrderApi } from '@/api/photoApi'

const order = ref<any>(null)

const statusConfig: any = {
  pending: { label: '等待摄影师确认', icon: '⏳', hint: '摄影师接受后订单生效', cls: 'pending' },
  confirmed: { label: '订单已确认', icon: '✅', hint: '摄影师已接受，等待拍摄', cls: 'confirmed' },
  shooting: { label: '拍摄中', icon: '📸', hint: '摄影师正在进行拍摄', cls: 'confirmed' },
  delivered: { label: '待验收', icon: '🖼️', hint: '摄影师已交付成果，请验收', cls: 'warning' },
  completed: { label: '已完成', icon: '🎉', hint: '订单已完成，感谢您的信任', cls: 'success' },
  cancelled: { label: '已取消', icon: '❌', hint: '订单已取消', cls: 'cancelled' },
  refund_pending: { label: '退款审核中', icon: '🔎', hint: '退款申请处理中', cls: 'warning' },
  refunded: { label: '已退款', icon: '💸', hint: '退款已处理', cls: 'cancelled' }
}

const getStatusLabel = (s: string) => statusConfig[s]?.label || s
const getStatusIcon = (s: string) => statusConfig[s]?.icon || ''
const getStatusHint = (s: string) => statusConfig[s]?.hint || ''
const getStatusClass = (s: string) => statusConfig[s]?.cls || ''

onMounted(async () => {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1] as any
  const id = cur.$page?.options?.id
  if (!id) return
  try {
    const res = await getOrderDetailApi(id)
    order.value = res?.data
  } catch {}
})

const copy = (text: string) => {
  uni.setClipboardData({ data: text })
  uni.showToast({ title: '已复制', icon: 'success' })
}
const goPhotographer = () => uni.navigateTo({ url: `/pages/photographer/detail?id=${order.value?.photographerId}` })
const goChat = () =>
  uni.navigateTo({
    url: `/pages/chat/detail?userId=${order.value?.photographer?.userId}&name=${order.value?.photographer?.user?.nickname}`
  })
const goReview = () =>
  uni.navigateTo({
    url: `/pages/review/create?orderId=${order.value?.id}&photographerId=${order.value?.photographerId}`
  })

const cancelOrder = () => {
  uni.showModal({
    title: '取消订单',
    content: '确定取消订单？',
    async success(res) {
      if (res.confirm) {
        await cancelOrderApi(order.value.id, { reason: '买家取消' })
        order.value.status = 'cancelled'
        uni.showToast({ title: '已取消', icon: 'success' })
      }
    }
  })
}

const confirmOrder = async () => {
  await confirmOrderApi(order.value.id)
  order.value.status = 'completed'
  uni.showToast({ title: '已确认完成', icon: 'success' })
}

const applyRefund = () => uni.navigateTo({ url: `/pages/order/refund?orderId=${order.value?.id}` })
</script>

<style scoped lang="scss">
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;

  .status-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 30rpx;
    &.pending {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
    }
    &.confirmed {
      background: linear-gradient(135deg, #4caf50, #8bc34a);
    }
    &.warning {
      background: linear-gradient(135deg, #ff9800, #ffc107);
    }
    &.success {
      background: linear-gradient(135deg, #2196f3, #03a9f4);
    }
    &.cancelled {
      background: linear-gradient(135deg, #9e9e9e, #bdbdbd);
    }

    .status-icon {
      font-size: 80rpx;
      margin-bottom: 16rpx;
    }
    .status-text {
      font-size: 40rpx;
      font-weight: bold;
      color: #fff;
      margin-bottom: 8rpx;
    }
    .status-hint {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .section {
    background: #fff;
    margin: 16rpx;
    border-radius: 16rpx;
    padding: 24rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 20rpx;
      border-left: 6rpx solid #ff6b35;
      padding-left: 16rpx;
    }

    .photographer-row {
      display: flex;
      align-items: center;
      .p-avatar {
        width: 88rpx;
        height: 88rpx;
        border-radius: 44rpx;
        margin-right: 20rpx;
      }
      .p-info {
        flex: 1;
        .p-name {
          display: block;
          font-size: 30rpx;
          font-weight: bold;
          color: #333;
        }
        .p-phone {
          font-size: 24rpx;
          color: #999;
        }
      }
      .chat-btn {
        background: #ff6b35;
        color: #fff;
        border-radius: 32rpx;
        font-size: 24rpx;
        padding: 0 24rpx;
        height: 60rpx;
        line-height: 60rpx;
        border: none;
        margin: 0;
      }
    }

    .info-rows {
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 12rpx 0;
        border-bottom: 1rpx solid #f5f5f5;
        &:last-child {
          border: none;
        }
      }
      .info-label {
        font-size: 28rpx;
        color: #999;
      }
      .info-value {
        font-size: 28rpx;
        color: #333;
        .copyable {
          color: #ff6b35;
        }
      }
    }

    .price-rows {
      .price-row {
        display: flex;
        justify-content: space-between;
        padding: 12rpx 0;
        &.total {
          border-top: 2rpx solid #f0f0f0;
          margin-top: 8rpx;
          font-weight: bold;
        }
        text {
          font-size: 28rpx;
          color: #333;
        }
      }
      .total-price {
        color: #ff4444;
        font-size: 36rpx;
      }
    }

    .remark-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
    }
  }

  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
    display: flex;
    gap: 16rpx;

    .btn {
      flex: 1;
      height: 88rpx;
      border-radius: 44rpx;
      font-size: 28rpx;
      margin: 0;
      border: none;
      &.cancel {
        background: #fff;
        color: #999;
        border: 2rpx solid #ddd;
      }
      &.refund {
        background: #fff;
        color: #ff9800;
        border: 2rpx solid #ff9800;
      }
      &.confirm {
        background: #4caf50;
        color: #fff;
      }
      &.review {
        background: #ff6b35;
        color: #fff;
      }
      &.chat {
        background: #fff;
        color: #ff6b35;
        border: 2rpx solid #ff6b35;
      }
    }
  }
}
</style>
