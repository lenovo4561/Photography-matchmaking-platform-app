<route lang="json5">
{
  style: {
    navigationBarTitleText: '分销中心',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="distributor-page">
    <!-- 未加入 -->
    <view class="join-section" v-if="!distributor">
      <view class="join-banner">
        <text class="join-title">成为推广大使</text>
        <text class="join-desc">邀请好友，轻松赚佣金</text>
        <view class="join-benefits">
          <view class="benefit-item" v-for="b in benefits" :key="b.text">
            <text class="benefit-icon">{{ b.icon }}</text>
            <text class="benefit-text">{{ b.text }}</text>
          </view>
        </view>
        <view class="commission-rate">
          <text>L1佣金：5%</text>
          <text>直接邀请好友下单即可获得</text>
        </view>
      </view>
      <view class="invite-code-input" v-if="needInvite">
        <input v-model="inviteCode" placeholder="请输入邀请码（可选）" class="invite-input" />
      </view>
      <button class="join-btn" :loading="joining" @click="joinDistributor">立即加入</button>
    </view>

    <!-- 已加入 -->
    <view class="dist-content" v-else>
      <!-- 数据概览 -->
      <view class="stats-card">
        <view class="stat-row">
          <view class="stat-item">
            <text class="stat-num">{{ distributor.inviteCount }}</text>
            <text class="stat-label">邀请人数</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">¥{{ distributor.pendingCommission }}</text>
            <text class="stat-label">待结算</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">¥{{ distributor.settledCommission }}</text>
            <text class="stat-label">已结算</text>
          </view>
        </view>
        <view class="code-row">
          <text class="code-label">我的邀请码：</text>
          <text class="code-value">{{ distributor.code }}</text>
          <text class="copy-btn" @click="copyCode">复制</text>
        </view>
      </view>

      <!-- 推广操作 -->
      <view class="action-cards">
        <view class="action-card" @click="goPoster">
          <text class="action-icon">🖼️</text>
          <text class="action-label">生成海报</text>
        </view>
        <view class="action-card" @click="shareLink">
          <text class="action-icon">🔗</text>
          <text class="action-label">分享链接</text>
        </view>
        <view class="action-card" @click="goWithdraw">
          <text class="action-icon">💰</text>
          <text class="action-label">佣金提现</text>
        </view>
        <view class="action-card" @click="showCommissions = true">
          <text class="action-icon">📊</text>
          <text class="action-label">佣金记录</text>
        </view>
      </view>

      <!-- 等级说明 -->
      <view class="level-section">
        <text class="level-title">等级体系</text>
        <view class="level-items">
          <view
            v-for="lv in levels"
            :key="lv.level"
            class="level-item"
            :class="{ current: distributor.level === lv.level }"
          >
            <text class="lv-badge">Lv{{ lv.level }}</text>
            <text class="lv-name">{{ lv.name }}</text>
            <text class="lv-req">{{ lv.req }}</text>
          </view>
        </view>
      </view>

      <!-- 佣金记录弹窗 -->
      <view class="commission-popup" v-if="showCommissions">
        <view class="popup-mask" @click="showCommissions = false" />
        <view class="popup-panel">
          <view class="popup-title">佣金记录</view>
          <scroll-view scroll-y class="commission-list">
            <view v-for="c in commissions" :key="c.id" class="commission-item">
              <view class="cm-info">
                <text class="cm-type">{{ c.commissionType === 'l1' ? '直接佣金' : '团队佣金' }}</text>
                <text class="cm-date">{{ c.createdAt?.substr(0, 10) }}</text>
              </view>
              <text class="cm-amount" :class="c.status === 'settled' ? 'settled' : 'pending'">
                +¥{{ c.amount }} {{ c.status === 'settled' ? '已结算' : '待结算' }}
              </text>
            </view>
            <view class="no-more" v-if="commissions.length === 0">暂无佣金记录</view>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getDistributorProfileApi, joinDistributorApi, getCommissionsApi } from '@/api/photoApi'

const distributor = ref<any>(null)
const joining = ref(false)
const inviteCode = ref('')
const needInvite = ref(false)
const showCommissions = ref(false)
const commissions = ref<any[]>([])

const benefits = [
  { icon: '💰', text: '推广返佣，轻松赚钱' },
  { icon: '📈', text: '团队收益，持续增长' },
  { icon: '🏆', text: '等级晋升，奖励丰厚' }
]

const levels = [
  { level: 1, name: '推广大使', req: '任何人均可加入' },
  { level: 2, name: '城市合伙人', req: '邀请20人 / 完成50单' },
  { level: 3, name: '超级合伙人', req: '邀请100人 / 完成300单' }
]

onMounted(async () => {
  try {
    const res = await getDistributorProfileApi()
    distributor.value = res?.data
    if (distributor.value) {
      const cRes = await getCommissionsApi()
      commissions.value = cRes?.data?.list || []
    }
  } catch {}
})

const joinDistributor = async () => {
  joining.value = true
  try {
    const res = await joinDistributorApi({ inviteCode: inviteCode.value })
    distributor.value = res?.data
    uni.showToast({ title: '加入成功', icon: 'success' })
  } finally {
    joining.value = false
  }
}

const copyCode = () => {
  uni.setClipboardData({ data: distributor.value.code })
  uni.showToast({ title: '已复制邀请码', icon: 'success' })
}
const shareLink = () => uni.showToast({ title: '功能开发中', icon: 'none' })
const goPoster = () => uni.navigateTo({ url: '/pages/distributor/poster' })
const goWithdraw = () => uni.navigateTo({ url: '/pages/account/withdraw' })
</script>

<style scoped lang="scss">
.distributor-page {
  min-height: 100vh;
  background: #f5f5f5;

  .join-section {
    padding: 30rpx;

    .join-banner {
      background: linear-gradient(135deg, #f7931e, #ff6b35);
      border-radius: 24rpx;
      padding: 48rpx 40rpx;
      margin-bottom: 30rpx;
      color: #fff;
      .join-title {
        font-size: 48rpx;
        font-weight: bold;
        display: block;
        margin-bottom: 12rpx;
      }
      .join-desc {
        font-size: 30rpx;
        opacity: 0.9;
        display: block;
        margin-bottom: 32rpx;
      }
      .join-benefits {
        margin-bottom: 32rpx;
        .benefit-item {
          display: flex;
          align-items: center;
          margin-bottom: 16rpx;
          .benefit-icon {
            font-size: 36rpx;
            margin-right: 12rpx;
          }
          .benefit-text {
            font-size: 28rpx;
          }
        }
      }
      .commission-rate {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12rpx;
        padding: 16rpx 24rpx;
        text {
          display: block;
          font-size: 26rpx;
        }
      }
    }

    .invite-code-input {
      margin-bottom: 20rpx;
      .invite-input {
        height: 88rpx;
        border: 2rpx solid #e5e5e5;
        border-radius: 12rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
        background: #fff;
      }
    }
    .join-btn {
      height: 96rpx;
      background: linear-gradient(90deg, #ff6b35, #f7931e);
      color: #fff;
      border-radius: 48rpx;
      font-size: 36rpx;
      font-weight: bold;
      border: none;
    }
  }

  .dist-content {
    padding: 16rpx;

    .stats-card {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      border-radius: 24rpx;
      padding: 40rpx 30rpx;
      margin-bottom: 16rpx;
      .stat-row {
        display: flex;
        margin-bottom: 32rpx;
      }
      .stat-item {
        flex: 1;
        text-align: center;
        .stat-num {
          display: block;
          font-size: 48rpx;
          font-weight: bold;
          color: #fff;
        }
        .stat-label {
          font-size: 22rpx;
          color: rgba(255, 255, 255, 0.8);
        }
      }
      .code-row {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12rpx;
        padding: 16rpx 20rpx;
        display: flex;
        align-items: center;
        .code-label {
          font-size: 26rpx;
          color: rgba(255, 255, 255, 0.8);
        }
        .code-value {
          flex: 1;
          font-size: 36rpx;
          font-weight: bold;
          color: #fff;
          letter-spacing: 4rpx;
        }
        .copy-btn {
          font-size: 26rpx;
          color: #fff;
          background: rgba(255, 255, 255, 0.3);
          padding: 6rpx 20rpx;
          border-radius: 20rpx;
        }
      }
    }

    .action-cards {
      display: flex;
      gap: 16rpx;
      margin-bottom: 16rpx;
      .action-card {
        flex: 1;
        background: #fff;
        border-radius: 16rpx;
        padding: 24rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        .action-icon {
          font-size: 56rpx;
          margin-bottom: 12rpx;
        }
        .action-label {
          font-size: 24rpx;
          color: #333;
        }
      }
    }

    .level-section {
      background: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      .level-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 20rpx;
      }
      .level-items {
        display: flex;
        gap: 12rpx;
      }
      .level-item {
        flex: 1;
        border: 2rpx solid #e5e5e5;
        border-radius: 12rpx;
        padding: 20rpx 12rpx;
        text-align: center;
        &.current {
          border-color: #ff6b35;
          background: rgba(255, 107, 53, 0.05);
        }
        .lv-badge {
          display: block;
          font-size: 28rpx;
          font-weight: bold;
          color: #ff6b35;
          margin-bottom: 8rpx;
        }
        .lv-name {
          display: block;
          font-size: 24rpx;
          color: #333;
          margin-bottom: 8rpx;
        }
        .lv-req {
          display: block;
          font-size: 20rpx;
          color: #999;
          line-height: 1.4;
        }
      }
    }
  }

  .commission-popup {
    position: fixed;
    inset: 0;
    z-index: 1000;
    .popup-mask {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
    }
    .popup-panel {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: #fff;
      border-radius: 24rpx 24rpx 0 0;
      padding: 32rpx 30rpx;
      max-height: 70vh;
      .popup-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 24rpx;
      }
      .commission-list {
        height: 50vh;
      }
      .commission-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16rpx 0;
        border-bottom: 1rpx solid #f5f5f5;
      }
      .cm-type {
        display: block;
        font-size: 28rpx;
        color: #333;
      }
      .cm-date {
        font-size: 22rpx;
        color: #999;
      }
      .cm-amount {
        font-size: 30rpx;
        font-weight: bold;
        &.settled {
          color: #4caf50;
        }
        &.pending {
          color: #ff9800;
        }
      }
      .no-more {
        text-align: center;
        padding: 40rpx;
        color: #999;
        font-size: 26rpx;
      }
    }
  }
}
</style>
