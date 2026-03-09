<route lang="json5">
{
  style: {
    navigationBarTitleText: '摄影师认证',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="apply-page">
    <view class="apply-banner">
      <text class="banner-title">成为专业摄影师</text>
      <text class="banner-desc">加入平台，开启接单之旅</text>
    </view>

    <view class="section">
      <text class="section-title">基本信息</text>
      <view class="form-item">
        <text class="form-label">擅长风格</text>
        <view class="tag-select">
          <text
            v-for="tag in styleTags"
            :key="tag"
            class="tag"
            :class="{ active: selectedStyles.includes(tag) }"
            @click="toggleStyle(tag)"
          >
            {{ tag }}
          </text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">服务城市</text>
        <input v-model="form.serviceCity" placeholder="请输入您的服务城市" class="form-input" />
      </view>

      <view class="form-item col">
        <text class="form-label">个人简介</text>
        <textarea v-model="form.bio" placeholder="请描述您的拍摄风格、经验等..." class="form-textarea" />
      </view>
    </view>

    <view class="section">
      <text class="section-title">特殊服务</text>
      <view class="checkbox-row">
        <view class="checkbox-item" @click="form.canVisit = !form.canVisit">
          <text class="checkbox" :class="{ checked: form.canVisit }">{{ form.canVisit ? '☑' : '☐' }}</text>
          <text class="checkbox-label">提供上门拍摄</text>
        </view>
        <view class="checkbox-item" @click="form.canUrgent = !form.canUrgent">
          <text class="checkbox" :class="{ checked: form.canUrgent }">{{ form.canUrgent ? '☑' : '☐' }}</text>
          <text class="checkbox-label">支持加急服务</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">证件照片（选填）</text>
      <text class="section-hint">上传证书、获奖证明等可提高信任度</text>
      <view class="img-uploader">
        <view class="img-item" v-for="(img, i) in certImages" :key="i">
          <image :src="img" mode="aspectFill" class="cert-img" />
          <text class="del-btn" @click="certImages.splice(i, 1)">✕</text>
        </view>
        <view class="add-img-btn" @click="chooseCertImg" v-if="certImages.length < 4">+</view>
      </view>
    </view>

    <view class="agreement-row">
      <switch :checked="agreed" @change="(e: any) => (agreed = e.detail.value)" color="#ff6b35" />
      <text class="agreement-text">
        我已阅读并同意
        <text class="link">《摄影师服务协议》</text>
      </text>
    </view>

    <view class="submit-area">
      <button class="submit-btn" :loading="submitting" :disabled="!agreed" @click="submitApply">提交申请</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { applyPhotographerApi } from '@/api/photoApi'

const agreed = ref(false)
const submitting = ref(false)
const selectedStyles = ref<string[]>([])
const certImages = ref<string[]>([])

const form = ref({ serviceCity: '', bio: '', canVisit: false, canUrgent: false })

const styleTags = [
  '人像写真',
  '婚礼婚纱',
  '商业广告',
  '亲子家庭',
  '毕业纪念',
  '旅行纪实',
  '风景建筑',
  '美食产品',
  '时尚大片',
  '街头纪实'
]

const toggleStyle = (tag: string) => {
  const i = selectedStyles.value.indexOf(tag)
  if (i >= 0) selectedStyles.value.splice(i, 1)
  else if (selectedStyles.value.length < 5) selectedStyles.value.push(tag)
  else uni.showToast({ title: '最多选5个风格', icon: 'none' })
}

const chooseCertImg = () => {
  uni.chooseImage({
    count: 4 - certImages.value.length,
    success(res) {
      certImages.value.push(...res.tempFilePaths)
    }
  })
}

const submitApply = async () => {
  if (!form.value.serviceCity) {
    uni.showToast({ title: '请填写服务城市', icon: 'none' })
    return
  }
  if (!form.value.bio) {
    uni.showToast({ title: '请填写个人简介', icon: 'none' })
    return
  }
  if (selectedStyles.value.length === 0) {
    uni.showToast({ title: '请选择擅长风格', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await applyPhotographerApi({
      styleTags: selectedStyles.value.join(','),
      serviceCity: form.value.serviceCity,
      bio: form.value.bio,
      canVisit: form.value.canVisit,
      canUrgent: form.value.canUrgent,
      certImages: certImages.value
    })
    uni.showToast({ title: '申请成功，等待审核', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.apply-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;

  .apply-banner {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    padding: 80rpx 40rpx;
    text-align: center;
    .banner-title {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      color: #fff;
      margin-bottom: 12rpx;
    }
    .banner-desc {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.7);
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
      margin-bottom: 8rpx;
    }
    .section-hint {
      font-size: 22rpx;
      color: #999;
      display: block;
      margin-bottom: 16rpx;
    }

    .form-item {
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      display: flex;
      align-items: center;
      &:last-child {
        border: none;
      }
      &.col {
        flex-direction: column;
        align-items: flex-start;
      }

      .form-label {
        width: 160rpx;
        font-size: 28rpx;
        color: #333;
        flex-shrink: 0;
        margin-bottom: 0;
      }
      &.col .form-label {
        margin-bottom: 12rpx;
      }
      .form-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
      .form-textarea {
        width: 100%;
        height: 180rpx;
        font-size: 26rpx;
        color: #333;
        background: #f9f9f9;
        padding: 16rpx;
        border-radius: 8rpx;
        box-sizing: border-box;
      }

      .tag-select {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;
      }
      .tag {
        padding: 8rpx 24rpx;
        border: 2rpx solid #e5e5e5;
        border-radius: 32rpx;
        font-size: 24rpx;
        color: #666;
        &.active {
          border-color: #ff6b35;
          color: #ff6b35;
          background: rgba(255, 107, 53, 0.05);
        }
      }
    }

    .checkbox-row {
      display: flex;
      gap: 40rpx;
      padding: 12rpx 0;
    }
    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 12rpx;
    }
    .checkbox {
      font-size: 36rpx;
      color: #ccc;
      &.checked {
        color: #ff6b35;
      }
    }
    .checkbox-label {
      font-size: 28rpx;
      color: #333;
    }

    .img-uploader {
      margin-top: 20rpx;
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
    }
    .img-item {
      position: relative;
      width: 160rpx;
      height: 160rpx;
    }
    .cert-img {
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

  .agreement-row {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    .agreement-text {
      font-size: 26rpx;
      color: #666;
      margin-left: 12rpx;
    }
    .link {
      color: #ff6b35;
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
      &[disabled] {
        background: #ccc;
      }
    }
  }
}
</style>
