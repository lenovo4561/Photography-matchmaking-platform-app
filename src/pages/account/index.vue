<route lang="json5">
{
  style: {
    navigationBarTitleText: '我的钱包',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="account-page">
    <!-- 余额卡片 -->
    <view class="balance-card">
      <text class="balance-label">账户余额</text>
      <text class="balance-amount">¥{{ account.balance || '0.00' }}</text>
      <view class="balance-sub">
        <text>冻结中：¥{{ account.frozenBalance || 0 }}</text>
        <text>累计收入：¥{{ account.totalIncome || 0 }}</text>
      </view>
      <button class="withdraw-btn" @click="goWithdraw">申请提现</button>
    </view>

    <!-- 收支明细 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">收支明细</text>
      </view>

      <scroll-view scroll-y class="bill-list" @scrolltolower="loadMore">
        <view v-for="bill in bills" :key="bill.id" class="bill-item">
          <view class="bill-left">
            <text class="bill-type-icon">{{ getBillIcon(bill.billType) }}</text>
            <view class="bill-info">
              <text class="bill-type">{{ getBillTypeName(bill.billType) }}</text>
              <text class="bill-date">{{ bill.createdAt?.substr(0, 16) }}</text>
            </view>
          </view>
          <view class="bill-right">
            <text class="bill-amount" :class="bill.amount > 0 ? 'income' : 'expense'">
              {{ bill.amount > 0 ? '+' : '' }}¥{{ Math.abs(bill.amount).toFixed(2) }}
            </text>
            <text class="bill-balance">余: ¥{{ bill.balance?.toFixed(2) }}</text>
          </view>
        </view>

        <view class="no-more" v-if="noMore">— 没有更多了 —</view>
        <view class="loading" v-if="loading">加载中...</view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getBalanceApi, getBillsApi } from '@/api/photoApi'

const account = ref<any>({})
const bills = ref<any[]>([])
const page = ref(1)
const noMore = ref(false)
const loading = ref(false)

const billTypeMap: any = {
  order_income: { name: '订单收入', icon: '💰' },
  artwork_income: { name: '作品收入', icon: '🖼️' },
  commission: { name: '推广佣金', icon: '🎁' },
  platform_fee: { name: '平台服务费', icon: '🏢' },
  withdraw: { name: '提现', icon: '🏦' },
  refund: { name: '退款', icon: '↩️' }
}
const getBillIcon = (type: string) => billTypeMap[type]?.icon || '💵'
const getBillTypeName = (type: string) => billTypeMap[type]?.name || type

onMounted(async () => {
  try {
    const res = await getBalanceApi()
    account.value = res?.data || {}
  } catch {}
  fetchBills(true)
})

const fetchBills = async (reset = false) => {
  loading.value = true
  try {
    const res = await getBillsApi({ page: page.value, pageSize: 20 })
    const list = res?.data?.list || []
    if (reset) bills.value = list
    else bills.value.push(...list)
    if (list.length < 20) noMore.value = true
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!noMore.value) {
    page.value++
    fetchBills()
  }
}
const goWithdraw = () => uni.navigateTo({ url: '/pages/account/withdraw' })
</script>

<style scoped lang="scss">
.account-page {
  min-height: 100vh;
  background: #f5f5f5;

  .balance-card {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    padding: 60rpx 40rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    .balance-label {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 16rpx;
    }
    .balance-amount {
      font-size: 80rpx;
      color: #fff;
      font-weight: bold;
      margin-bottom: 16rpx;
    }
    .balance-sub {
      display: flex;
      gap: 40rpx;
      margin-bottom: 32rpx;
      text {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.7);
      }
    }
    .withdraw-btn {
      width: 240rpx;
      height: 80rpx;
      background: #fff;
      color: #ff6b35;
      border-radius: 40rpx;
      font-size: 28rpx;
      font-weight: bold;
      border: none;
    }
  }

  .section {
    background: #fff;
    margin-top: 16rpx;

    .section-header {
      padding: 24rpx 30rpx 16rpx;
      border-bottom: 1rpx solid #f5f5f5;
    }
    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .bill-list {
    height: calc(100vh - 400rpx);

    .bill-item {
      display: flex;
      align-items: center;
      padding: 24rpx 30rpx;
      border-bottom: 1rpx solid #f9f9f9;

      .bill-left {
        display: flex;
        align-items: center;
        flex: 1;
      }
      .bill-type-icon {
        font-size: 48rpx;
        margin-right: 20rpx;
      }
      .bill-info {
        .bill-type {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 6rpx;
        }
        .bill-date {
          font-size: 22rpx;
          color: #999;
        }
      }

      .bill-right {
        text-align: right;
      }
      .bill-amount {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        &.income {
          color: #4caf50;
        }
        &.expense {
          color: #ff4444;
        }
      }
      .bill-balance {
        display: block;
        font-size: 20rpx;
        color: #999;
        margin-top: 4rpx;
      }
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
