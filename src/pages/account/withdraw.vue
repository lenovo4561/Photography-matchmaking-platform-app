<route lang="json5">
{
  style: {
    navigationBarTitleText: '申请提现',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="withdraw-page">
    <view class="balance-tip">
      <text class="tip-label">可提现余额</text>
      <text class="tip-amount">¥{{ balance }}</text>
    </view>

    <view class="section">
      <text class="section-title">提现金额</text>
      <view class="amount-input-row">
        <text class="currency">¥</text>
        <input v-model="form.amount" type="digit" placeholder="0.00" class="amount-input" />
        <text class="all-btn" @click="setAll">全部</text>
      </view>
      <text class="amount-hint">最低提现：¥1.00 · 手续费：0元</text>
    </view>

    <view class="section">
      <text class="section-title">提现方式</text>
      <view class="channel-list">
        <view
          v-for="ch in channels"
          :key="ch.key"
          class="channel-item"
          :class="{ active: form.channel === ch.key }"
          @click="form.channel = ch.key"
        >
          <text class="ch-icon">{{ ch.icon }}</text>
          <text class="ch-label">{{ ch.label }}</text>
          <text class="ch-check" v-if="form.channel === ch.key">✓</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">收款账号</text>
      <view class="form-item">
        <text class="form-label">账号</text>
        <input v-model="form.account" placeholder="请输入收款账号" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">姓名</text>
        <input v-model="form.accountName" placeholder="请输入真实姓名" class="form-input" />
      </view>
    </view>

    <view class="submit-area">
      <button class="submit-btn" :loading="submitting" @click="submitWithdraw">确认提现</button>
      <text class="withdraw-note">提现将在1-3个工作日内到账</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getBalanceApi, withdrawApi } from '@/api/photoApi'

const balance = ref('0.00')
const submitting = ref(false)
const form = ref({ amount: '', channel: 'alipay', account: '', accountName: '' })

const channels = [
  { key: 'alipay', icon: '💙', label: '支付宝' },
  { key: 'wechat', icon: '💚', label: '微信' },
  { key: 'bank', icon: '🏦', label: '银行卡' }
]

onMounted(async () => {
  const res = await getBalanceApi()
  balance.value = res?.data?.balance || '0.00'
})

const setAll = () => {
  form.value.amount = String(balance.value)
}

const submitWithdraw = async () => {
  if (!form.value.amount || parseFloat(form.value.amount) <= 0) {
    uni.showToast({ title: '请输入提现金额', icon: 'none' })
    return
  }
  if (parseFloat(form.value.amount) > parseFloat(String(balance.value))) {
    uni.showToast({ title: '余额不足', icon: 'none' })
    return
  }
  if (!form.value.account) {
    uni.showToast({ title: '请输入收款账号', icon: 'none' })
    return
  }
  if (!form.value.accountName) {
    uni.showToast({ title: '请输入真实姓名', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await withdrawApi(form.value)
    uni.showToast({ title: '申请成功，1-3个工作日到账', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.withdraw-page {
  min-height: 100vh;
  background: #f5f5f5;

  .balance-tip {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    padding: 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    .tip-label {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 12rpx;
    }
    .tip-amount {
      font-size: 72rpx;
      font-weight: bold;
      color: #fff;
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
    }

    .amount-input-row {
      display: flex;
      align-items: center;
      border-bottom: 2rpx solid #f0f0f0;
      padding: 16rpx 0;
      .currency {
        font-size: 48rpx;
        color: #333;
        margin-right: 12rpx;
      }
      .amount-input {
        flex: 1;
        font-size: 56rpx;
        color: #333;
      }
      .all-btn {
        font-size: 26rpx;
        color: #ff6b35;
      }
    }
    .amount-hint {
      font-size: 22rpx;
      color: #999;
      display: block;
      margin-top: 12rpx;
    }

    .channel-list {
      display: flex;
      gap: 20rpx;
    }
    .channel-item {
      flex: 1;
      border: 2rpx solid #e5e5e5;
      border-radius: 12rpx;
      padding: 20rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      &.active {
        border-color: #ff6b35;
        background: rgba(255, 107, 53, 0.03);
      }
      .ch-icon {
        font-size: 48rpx;
        margin-bottom: 8rpx;
      }
      .ch-label {
        font-size: 24rpx;
        color: #333;
      }
      .ch-check {
        position: absolute;
        top: 8rpx;
        right: 8rpx;
        color: #ff6b35;
        font-size: 24rpx;
      }
    }

    .form-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      &:last-child {
        border: none;
      }
      .form-label {
        width: 120rpx;
        font-size: 28rpx;
        color: #333;
        flex-shrink: 0;
      }
      .form-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
    }
  }

  .submit-area {
    padding: 0 30rpx;
    .submit-btn {
      width: 100%;
      height: 96rpx;
      background: #ff6b35;
      color: #fff;
      border-radius: 48rpx;
      font-size: 34rpx;
      border: none;
    }
    .withdraw-note {
      display: block;
      text-align: center;
      font-size: 22rpx;
      color: #999;
      margin-top: 24rpx;
    }
  }
}
</style>
