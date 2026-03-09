<route lang="json5">
{
  style: {
    navigationBarTitleText: '申请退款',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="refund-page">
    <view class="order-info-card" v-if="order">
      <text class="oi-label">关联订单</text>
      <text class="oi-no">{{ order.orderNo }}</text>
      <text class="oi-amount">¥{{ order.amount }}</text>
    </view>

    <view class="form-section">
      <text class="section-title">退款原因</text>
      <view class="reason-list">
        <view
          v-for="reason in reasons"
          :key="reason"
          class="reason-item"
          :class="{ active: form.reason === reason }"
          @click="form.reason = reason"
        >
          <text class="reason-text">{{ reason }}</text>
          <text class="reason-check" v-if="form.reason === reason">✓</text>
        </view>
      </view>
    </view>

    <view class="form-section">
      <text class="section-title">退款说明（可选）</text>
      <textarea v-model="form.remark" placeholder="请描述具体情况..." class="remark-textarea" />
    </view>

    <view class="form-section">
      <text class="section-title">上传凭证（可选）</text>
      <view class="img-uploader">
        <view class="img-item" v-for="(img, i) in evidenceImages" :key="i">
          <image :src="img" mode="aspectFill" class="evidence-img" />
          <text class="del-btn" @click="evidenceImages.splice(i, 1)">✕</text>
        </view>
        <view class="add-img-btn" @click="chooseImages" v-if="evidenceImages.length < 4">+</view>
      </view>
    </view>

    <view class="refund-note">
      <text>· 退款金额将原路退回</text>
      <text>· 审核通过后1-3个工作日到账</text>
    </view>

    <view class="submit-area">
      <button class="submit-btn" :loading="submitting" @click="submitRefund">提交退款申请</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getOrderDetailApi, applyRefundApi } from '@/api/photoApi'

const order = ref<any>(null)
const submitting = ref(false)
const evidenceImages = ref<string[]>([])

const form = ref({ reason: '', remark: '' })
const reasons = ['摄影师未按时到场', '成片质量不满意', '拍摄条件不符合约定', '双方协商退款', '其他原因']

let orderId = ''

onMounted(async () => {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1] as any
  orderId = cur.$page?.options?.orderId
  if (orderId) {
    const res = await getOrderDetailApi(orderId)
    order.value = res?.data
  }
})

const chooseImages = () => {
  uni.chooseImage({
    count: 4 - evidenceImages.value.length,
    success(res) {
      evidenceImages.value.push(...res.tempFilePaths)
    }
  })
}

const submitRefund = async () => {
  if (!form.value.reason) {
    uni.showToast({ title: '请选择退款原因', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await applyRefundApi(orderId, form.value.reason)
    uni.showToast({ title: '申请提交成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
      uni.navigateBack()
    }, 800)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.refund-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;

  .order-info-card {
    background: #fff9f0;
    padding: 24rpx 30rpx;
    display: flex;
    align-items: center;
    gap: 20rpx;
    .oi-label {
      font-size: 28rpx;
      color: #ff9800;
    }
    .oi-no {
      flex: 1;
      font-size: 26rpx;
      color: #666;
    }
    .oi-amount {
      font-size: 36rpx;
      color: #ff4444;
      font-weight: bold;
    }
  }

  .form-section {
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
    }

    .reason-list {
      .reason-item {
        display: flex;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #f5f5f5;
        &:last-child {
          border: none;
        }
        &.active {
          .reason-text {
            color: #ff6b35;
          }
        }
        .reason-text {
          flex: 1;
          font-size: 28rpx;
          color: #333;
        }
        .reason-check {
          font-size: 32rpx;
          color: #ff6b35;
        }
      }
    }

    .remark-textarea {
      width: 100%;
      height: 200rpx;
      font-size: 28rpx;
      color: #333;
      background: #f9f9f9;
      padding: 16rpx;
      border-radius: 8rpx;
      box-sizing: border-box;
    }

    .img-uploader {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
    }
    .img-item {
      position: relative;
      width: 160rpx;
      height: 160rpx;
    }
    .evidence-img {
      width: 160rpx;
      height: 160rpx;
      border-radius: 8rpx;
    }
    .del-btn {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      width: 40rpx;
      height: 40rpx;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 20rpx;
      border-radius: 20rpx;
      text-align: center;
      line-height: 40rpx;
    }
    .add-img-btn {
      width: 160rpx;
      height: 160rpx;
      border: 2rpx dashed #ddd;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60rpx;
      color: #ccc;
    }
  }

  .refund-note {
    padding: 16rpx 30rpx;
    text {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-bottom: 8rpx;
    }
  }

  .submit-area {
    padding: 0 30rpx;
    .submit-btn {
      width: 100%;
      height: 96rpx;
      background: #ff9800;
      color: #fff;
      border-radius: 48rpx;
      font-size: 34rpx;
      border: none;
    }
  }
}
</style>
