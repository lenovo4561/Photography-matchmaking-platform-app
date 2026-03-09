<route lang="json5">
{
  layout: 'foot',
  style: {
    navigationBarTitleText: '我的',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="profile-page">
    <!-- 用户信息 -->
    <view class="user-card">
      <view class="user-info" v-if="userStore.isLoggedIn">
        <image
          :src="userStore.userInfo?.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
          class="avatar"
          @click="editProfile"
        />
        <view class="user-detail">
          <text class="nickname">{{ userStore.userInfo?.nickname || '未设置昵称' }}</text>
          <text class="phone">{{ userStore.userInfo?.phone }}</text>
          <view class="role-badge">
            <text>{{ userStore.userInfo?.currentRole === 'photographer' ? '📷 摄影师' : '👤 用户' }}</text>
          </view>
        </view>
        <view class="edit-btn" @click="editProfile">
          <text>编辑 ›</text>
        </view>
      </view>
      <view class="login-prompt" v-else @click="goLogin">
        <view class="default-avatar">👤</view>
        <text class="prompt-text">点击登录</text>
      </view>
    </view>

    <!-- 认证状态 -->
    <view class="cert-banner" v-if="userStore.isLoggedIn && userStore.userInfo?.realnameStatus !== 2">
      <text class="cert-text">
        {{ userStore.userInfo?.realnameStatus === 1 ? '实名认证审核中...' : '⚠️ 完成实名认证，解锁全部功能' }}
      </text>
      <text class="cert-btn" v-if="userStore.userInfo?.realnameStatus !== 1" @click="goRealname">去认证</text>
    </view>

    <!-- 订单入口 -->
    <view class="menu-section">
      <view class="menu-header">我的订单</view>
      <view class="order-tabs">
        <view v-for="tab in orderTabs" :key="tab.status" class="order-tab" @click="goOrderList(tab.status)">
          <text class="order-tab-icon">{{ tab.icon }}</text>
          <text class="order-tab-label">{{ tab.label }}</text>
        </view>
      </view>
    </view>

    <!-- 摄影师中心（已认证摄影师显示） -->
    <view class="menu-section" v-if="userStore.isPhotographer">
      <view class="menu-header">摄影师中心</view>
      <view class="menu-list">
        <view class="menu-item" @click="goManage">
          <text class="menu-icon">📷</text>
          <text class="menu-text">作品集管理</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goServiceManage">
          <text class="menu-icon">📋</text>
          <text class="menu-text">套餐管理</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goSchedule">
          <text class="menu-icon">📅</text>
          <text class="menu-text">档期管理</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 其他功能 -->
    <view class="menu-section">
      <view class="menu-list">
        <view class="menu-item" @click="goAccount">
          <text class="menu-icon">💰</text>
          <text class="menu-text">我的钱包</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goDistributor">
          <text class="menu-icon">🎁</text>
          <text class="menu-text">推广中心</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goNotification">
          <text class="menu-icon">🔔</text>
          <text class="menu-text">消息通知</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" v-if="!userStore.isPhotographer" @click="goApply">
          <text class="menu-icon">✨</text>
          <text class="menu-text">申请成为摄影师</text>
          <text class="menu-arrow">›</text>
        </view>
        <view
          class="menu-item"
          v-if="userStore.isPhotographer && userStore.userInfo?.currentRole !== 'photographer'"
          @click="switchToPhotographer"
        >
          <text class="menu-icon">🔄</text>
          <text class="menu-text">切换为摄影师角色</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" v-if="userStore.isLoggedIn" @click="logout">退出登录</view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { switchRoleApi } from '@/api/authApi'

const userStore = useUserStore()

const orderTabs = [
  { status: 'pending', icon: '🕐', label: '待处理' },
  { status: 'confirmed', icon: '✅', label: '进行中' },
  { status: 'delivered', icon: '📸', label: '待确认' },
  { status: 'completed', icon: '🎉', label: '已完成' }
]

const goLogin = () => uni.navigateTo({ url: '/pages/auth/login' })
const editProfile = () => uni.navigateTo({ url: '/pages/profile/edit' })
const goRealname = () => uni.navigateTo({ url: '/pages/profile/edit?tab=realname' })
const goOrderList = (status: string) => uni.navigateTo({ url: `/pages/order/list?status=${status}` })
const goManage = () => uni.navigateTo({ url: '/pages/portfolio/manage' })
const goServiceManage = () => uni.navigateTo({ url: '/pages/service/manage' })
const goSchedule = () => uni.navigateTo({ url: '/pages/schedule/manage' })
const goAccount = () => uni.navigateTo({ url: '/pages/account/index' })
const goDistributor = () => uni.navigateTo({ url: '/pages/distributor/index' })
const goNotification = () => uni.navigateTo({ url: '/pages/notification/index' })
const goApply = () => uni.navigateTo({ url: '/pages/photographer/apply' })

const switchToPhotographer = async () => {
  try {
    await switchRoleApi('photographer')
    userStore.setUserInfo({ ...userStore.userInfo, currentRole: 'photographer' })
    uni.showToast({ title: '已切换为摄影师角色', icon: 'success' })
  } catch {}
}

const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success(res) {
      if (res.confirm) {
        uni.removeStorageSync('token')
        userStore.clearUserInfo()
        uni.switchTab({ url: '/pages/index/index' })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;

  .user-card {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    padding: 60rpx 30rpx 40rpx;

    .user-info {
      display: flex;
      align-items: center;

      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        border: 4rpx solid rgba(255, 255, 255, 0.6);
        margin-right: 24rpx;
      }

      .user-detail {
        flex: 1;

        .nickname {
          display: block;
          font-size: 36rpx;
          font-weight: bold;
          color: #fff;
          margin-bottom: 8rpx;
        }
        .phone {
          display: block;
          font-size: 26rpx;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8rpx;
        }
        .role-badge text {
          font-size: 22rpx;
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.2);
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
        }
      }

      .edit-btn {
        color: rgba(255, 255, 255, 0.8);
        font-size: 26rpx;
      }
    }

    .login-prompt {
      display: flex;
      align-items: center;
      padding: 20rpx 0;

      .default-avatar {
        font-size: 96rpx;
        margin-right: 24rpx;
      }
      .prompt-text {
        font-size: 36rpx;
        color: #fff;
        font-weight: bold;
      }
    }
  }

  .cert-banner {
    background: #fff7ed;
    padding: 20rpx 30rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1rpx solid #ffe0c4;

    .cert-text {
      font-size: 26rpx;
      color: #ff6b35;
    }
    .cert-btn {
      font-size: 26rpx;
      color: #fff;
      background: #ff6b35;
      padding: 8rpx 24rpx;
      border-radius: 20rpx;
    }
  }

  .menu-section {
    background: #fff;
    margin-top: 16rpx;

    .menu-header {
      padding: 24rpx 30rpx 16rpx;
      font-size: 28rpx;
      color: #999;
      border-bottom: 1rpx solid #f5f5f5;
    }

    .order-tabs {
      display: flex;
      padding: 20rpx 0;

      .order-tab {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16rpx 0;

        .order-tab-icon {
          font-size: 48rpx;
          margin-bottom: 8rpx;
        }
        .order-tab-label {
          font-size: 24rpx;
          color: #333;
        }
      }
    }

    .menu-list {
      .menu-item {
        display: flex;
        align-items: center;
        padding: 28rpx 30rpx;
        border-bottom: 1rpx solid #f5f5f5;

        .menu-icon {
          font-size: 38rpx;
          margin-right: 20rpx;
        }
        .menu-text {
          flex: 1;
          font-size: 30rpx;
          color: #333;
        }
        .menu-arrow {
          font-size: 32rpx;
          color: #ccc;
        }
      }
    }
  }

  .logout-btn {
    margin: 40rpx 30rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border: 2rpx solid #ff4444;
    color: #ff4444;
    border-radius: 44rpx;
    font-size: 32rpx;
  }
}
</style>
