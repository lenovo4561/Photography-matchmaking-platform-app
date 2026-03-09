<route lang="json5">
{
  style: {
    navigationBarTitleText: '登录',
    navigationStyle: 'custom'
  }
}
</route>

<template>
  <view class="login-page">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">摄影撮合平台</text>
      <text class="subtitle">专业摄影师 · 高品质拍摄</text>
    </view>

    <view class="login-form">
      <!-- 手机号 -->
      <view class="input-group">
        <text class="input-label">手机号</text>
        <input v-model="form.phone" type="number" maxlength="11" placeholder="请输入手机号" class="input" />
      </view>

      <!-- 密码/验证码 -->
      <view class="input-group" v-if="loginType === 'password'">
        <text class="input-label">密码</text>
        <input v-model="form.password" type="password" placeholder="请输入密码" class="input" />
      </view>

      <view class="input-group sms-group" v-else>
        <text class="input-label">验证码</text>
        <input v-model="form.smsCode" type="number" maxlength="6" placeholder="请输入验证码" class="input" />
        <button class="sms-btn" :disabled="smsCountdown > 0" @click="sendSms">
          {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
        </button>
      </view>

      <!-- 邀请码（可选） -->
      <view class="input-group">
        <text class="input-label">邀请码</text>
        <input v-model="form.inviteCode" type="text" placeholder="选填邀请码" class="input" />
      </view>

      <button class="login-btn" :loading="loading" @click="handleLogin">
        {{ loginType === 'password' ? '登 录 / 注 册' : '验证码登录' }}
      </button>

      <view class="switch-type" @click="switchType">
        {{ loginType === 'password' ? '使用验证码登录' : '使用密码登录/注册' }}
      </view>
    </view>

    <view class="login-agreement">
      登录即同意
      <text class="link">《用户协议》</text>
      和
      <text class="link">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { loginApi, loginBySmsApi, sendSmsApi, registerApi } from '@/api/authApi'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const loading = ref(false)
const loginType = ref<'password' | 'sms'>('sms')
const smsCountdown = ref(0)

const form = ref({
  phone: '',
  password: '',
  smsCode: '',
  inviteCode: ''
})

const switchType = () => {
  loginType.value = loginType.value === 'password' ? 'sms' : 'password'
}

let smsTimer: any = null
const sendSms = async () => {
  if (!form.value.phone || form.value.phone.length !== 11) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  try {
    await sendSmsApi(form.value.phone)
    uni.showToast({ title: '验证码：1234（测试）', icon: 'none' })
    smsCountdown.value = 60
    smsTimer = setInterval(() => {
      smsCountdown.value--
      if (smsCountdown.value <= 0) clearInterval(smsTimer)
    }, 1000)
  } catch {}
}

const handleLogin = async () => {
  if (!form.value.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  loading.value = true
  try {
    let res: any
    if (loginType.value === 'password') {
      if (!form.value.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' })
        return
      }
      res = await loginApi({ phone: form.value.phone, password: form.value.password })
    } else {
      if (!form.value.smsCode) {
        uni.showToast({ title: '请输入验证码', icon: 'none' })
        return
      }
      res = await loginBySmsApi({
        phone: form.value.phone,
        smsCode: form.value.smsCode,
        inviteCode: form.value.inviteCode
      })
    }

    if (res?.data) {
      const { token, user } = res.data
      uni.setStorageSync('token', token)
      userStore.setUserInfo({ ...user, accessToken: token })
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 500)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  flex-direction: column;
  padding: 60rpx 40rpx;

  .login-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 0 60rpx;

    .logo {
      width: 160rpx;
      height: 160rpx;
      border-radius: 32rpx;
      margin-bottom: 20rpx;
    }

    .title {
      font-size: 48rpx;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 12rpx;
    }

    .subtitle {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .login-form {
    background: #ffffff;
    border-radius: 24rpx;
    padding: 48rpx 40rpx;

    .input-group {
      margin-bottom: 32rpx;
      position: relative;

      .input-label {
        font-size: 28rpx;
        color: #666;
        display: block;
        margin-bottom: 12rpx;
      }

      .input {
        width: 100%;
        height: 88rpx;
        border: 2rpx solid #e5e5e5;
        border-radius: 12rpx;
        padding: 0 24rpx;
        font-size: 30rpx;
        box-sizing: border-box;
      }

      &.sms-group {
        display: flex;
        flex-direction: column;

        .input {
          flex: 1;
        }

        .sms-btn {
          position: absolute;
          right: 0;
          bottom: 0;
          height: 88rpx;
          width: 200rpx;
          background: #ff6b35;
          color: #fff;
          font-size: 26rpx;
          border-radius: 0 12rpx 12rpx 0;
          margin: 0;
          padding: 0;
          line-height: 88rpx;
          &[disabled] {
            background: #ccc;
          }
        }
      }
    }

    .login-btn {
      width: 100%;
      height: 96rpx;
      background: linear-gradient(90deg, #ff6b35, #f7931e);
      color: #fff;
      font-size: 34rpx;
      font-weight: bold;
      border-radius: 48rpx;
      margin-top: 16rpx;
      border: none;
    }

    .switch-type {
      text-align: center;
      color: #ff6b35;
      font-size: 28rpx;
      margin-top: 24rpx;
    }
  }

  .login-agreement {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 24rpx;
    margin-top: 32rpx;

    .link {
      color: #ff6b35;
    }
  }
}
</style>
