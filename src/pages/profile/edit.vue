<route lang="json5">
{
  style: {
    navigationBarTitleText: '编辑资料',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="edit-profile-page">
    <view class="avatar-section" @click="changeAvatar">
      <image :src="form.avatar || '/static/default-avatar.png'" mode="aspectFill" class="avatar-preview" />
      <text class="change-avatar-text">更换头像</text>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input v-model="form.nickname" placeholder="请输入昵称" class="form-input" maxlength="20" />
      </view>
      <view class="form-item">
        <text class="form-label">城市</text>
        <input v-model="form.city" placeholder="请输入城市" class="form-input" />
      </view>
      <view class="form-item">
        <text class="form-label">简介</text>
        <textarea v-model="form.bio" placeholder="介绍一下自己..." class="form-textarea" maxlength="200" />
      </view>
    </view>

    <!-- 实名认证 -->
    <view class="form-section">
      <view class="section-title-row">
        <text class="section-title">实名认证</text>
        <text class="cert-status" :class="getCertStatusClass">{{ getCertStatusText }}</text>
      </view>
      <view v-if="userStore.userInfo?.realnameStatus === 0">
        <view class="form-item">
          <text class="form-label">真实姓名</text>
          <input v-model="realname.name" placeholder="请输入真实姓名" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">身份证号</text>
          <input v-model="realname.idCard" placeholder="请输入身份证号" class="form-input" maxlength="18" />
        </view>
        <button class="realname-btn" :loading="submittingRealname" @click="submitRealname">提交实名认证</button>
      </view>
      <view v-else class="cert-done">
        <text v-if="userStore.userInfo?.realnameStatus === 1">📋 认证审核中，请耐心等待</text>
        <text v-else>✅ 已完成实名认证</text>
      </view>
    </view>

    <view class="save-area">
      <button class="save-btn" :loading="saving" @click="saveProfile">保存修改</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { updateProfileApi, realnameApi } from '@/api/authApi'

const userStore = useUserStore()
const saving = ref(false)
const submittingRealname = ref(false)

const form = ref({
  nickname: userStore.userInfo?.nickname || '',
  city: userStore.userInfo?.city || '',
  bio: '',
  avatar: userStore.userInfo?.avatar || ''
})

const realname = ref({ name: '', idCard: '' })

const getCertStatusText = computed(() => {
  const s = userStore.userInfo?.realnameStatus
  if (s === 0) return '未认证'
  if (s === 1) return '审核中'
  return '已认证'
})

const getCertStatusClass = computed(() => {
  const s = userStore.userInfo?.realnameStatus
  if (s === 0) return 'uncert'
  if (s === 1) return 'pending'
  return 'certified'
})

const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    success(res) {
      form.value.avatar = res.tempFilePaths[0]
    }
  })
}

const saveProfile = async () => {
  saving.value = true
  try {
    const res = await updateProfileApi({
      nickname: form.value.nickname,
      city: form.value.city,
      bio: form.value.bio
    })
    userStore.setUserInfo({ ...userStore.userInfo, nickname: form.value.nickname, city: form.value.city })
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 600)
  } finally {
    saving.value = false
  }
}

const submitRealname = async () => {
  if (!realname.value.name) {
    uni.showToast({ title: '请输入真实姓名', icon: 'none' })
    return
  }
  if (!realname.value.idCard || realname.value.idCard.length < 15) {
    uni.showToast({ title: '请输入有效身份证号', icon: 'none' })
    return
  }
  submittingRealname.value = true
  try {
    await realnameApi(realname.value)
    userStore.setUserInfo({ ...userStore.userInfo, realnameStatus: 1 })
    uni.showToast({ title: '提交成功，等待审核', icon: 'success' })
  } finally {
    submittingRealname.value = false
  }
}
</script>

<style scoped lang="scss">
.edit-profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;

  .avatar-section {
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48rpx 40rpx;
    margin-bottom: 16rpx;

    .avatar-preview {
      width: 160rpx;
      height: 160rpx;
      border-radius: 80rpx;
      margin-bottom: 16rpx;
      border: 4rpx solid #f0f0f0;
    }
    .change-avatar-text {
      font-size: 26rpx;
      color: #ff6b35;
    }
  }

  .form-section {
    background: #fff;
    margin: 0 0 16rpx;
    padding: 0 30rpx;

    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 0 16rpx;
      border-bottom: 1rpx solid #f5f5f5;
    }
    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
    .cert-status {
      font-size: 24rpx;
      &.uncert {
        color: #999;
      }
      &.pending {
        color: #ff9800;
      }
      &.certified {
        color: #4caf50;
      }
    }

    .form-item {
      display: flex;
      align-items: flex-start;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      &:last-child {
        border: none;
      }

      .form-label {
        width: 140rpx;
        font-size: 28rpx;
        color: #333;
        flex-shrink: 0;
        padding-top: 6rpx;
      }
      .form-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
      .form-textarea {
        flex: 1;
        height: 180rpx;
        font-size: 26rpx;
        color: #333;
        background: #f9f9f9;
        padding: 16rpx;
        border-radius: 8rpx;
      }
    }

    .realname-btn {
      margin: 20rpx 0;
      height: 80rpx;
      background: #ff6b35;
      color: #fff;
      border-radius: 40rpx;
      font-size: 28rpx;
      border: none;
    }
    .cert-done {
      padding: 24rpx 0;
      font-size: 28rpx;
      color: #666;
    }
  }

  .save-area {
    padding: 0 30rpx;
    .save-btn {
      width: 100%;
      height: 96rpx;
      background: #ff6b35;
      color: #fff;
      border-radius: 48rpx;
      font-size: 34rpx;
      border: none;
    }
  }
}
</style>
