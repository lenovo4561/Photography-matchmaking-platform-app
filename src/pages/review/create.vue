<route lang="json5">
{
  style: {
    navigationBarTitleText: '评价订单',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="review-page">
    <view class="section">
      <text class="section-title">评价摄影师</text>
      <view class="photographer-row">
        <image
          :src="photographerInfo?.user?.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
          class="p-avatar"
        />
        <text class="p-name">{{ photographerInfo?.user?.nickname }}</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">评分</text>
      <view class="score-row">
        <text class="score-label">作品质量</text>
        <view class="stars">
          <text
            v-for="i in 5"
            :key="i"
            class="star"
            :class="{ active: form.qualityScore >= i }"
            @click="form.qualityScore = i"
          >
            ★
          </text>
        </view>
        <text class="score-val">{{ form.qualityScore }}分</text>
      </view>
      <view class="score-row">
        <text class="score-label">服务态度</text>
        <view class="stars">
          <text
            v-for="i in 5"
            :key="i"
            class="star"
            :class="{ active: form.serviceScore >= i }"
            @click="form.serviceScore = i"
          >
            ★
          </text>
        </view>
        <text class="score-val">{{ form.serviceScore }}分</text>
      </view>
      <view class="score-row">
        <text class="score-label">准时程度</text>
        <view class="stars">
          <text
            v-for="i in 5"
            :key="i"
            class="star"
            :class="{ active: form.timeScore >= i }"
            @click="form.timeScore = i"
          >
            ★
          </text>
        </view>
        <text class="score-val">{{ form.timeScore }}分</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">文字评价</text>
      <textarea v-model="form.content" placeholder="分享您的拍摄体验..." class="review-textarea" />
    </view>

    <view class="section">
      <text class="section-title">上传照片（可选）</text>
      <view class="img-uploader">
        <view class="img-item" v-for="(img, i) in uploadedImages" :key="i">
          <image :src="img" mode="aspectFill" class="uploaded-img" />
          <text class="del-btn" @click="removeImg(i)">✕</text>
        </view>
        <view class="add-img-btn" @click="chooseImage" v-if="uploadedImages.length < 6">+</view>
      </view>
    </view>

    <view class="section">
      <view class="anonymous-row">
        <text class="anon-label">匿名评价</text>
        <switch :checked="form.isAnonymous" @change="(e: any) => (form.isAnonymous = e.detail.value)" color="#ff6b35" />
      </view>
    </view>

    <!-- 推荐标签 -->
    <view class="section">
      <text class="section-title">推荐标签</text>
      <view class="tag-list">
        <text
          v-for="tag in recommendTags"
          :key="tag"
          class="tag"
          :class="{ active: selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </text>
      </view>
    </view>

    <view class="submit-area">
      <button class="submit-btn" :loading="submitting" @click="submitReview">提交评价</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { createReviewApi, getPhotographerDetailApi } from '@/api/photoApi'

const photographerInfo = ref<any>(null)
const submitting = ref(false)
const uploadedImages = ref<string[]>([])
const selectedTags = ref<string[]>([])

const form = ref({ qualityScore: 5, serviceScore: 5, timeScore: 5, content: '', isAnonymous: false })

const recommendTags = ['作品精美', '沟通顺畅', '准时守信', '专业认真', '有创意', '性价比高', '服务周到', '后期精良']

let orderId = '',
  photographerId = ''

onMounted(async () => {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1] as any
  const opts = cur.$page?.options || {}
  orderId = opts.orderId
  photographerId = opts.photographerId
  if (photographerId) {
    const res = await getPhotographerDetailApi(photographerId)
    photographerInfo.value = res?.data
  }
})

const toggleTag = (tag: string) => {
  const i = selectedTags.value.indexOf(tag)
  if (i >= 0) selectedTags.value.splice(i, 1)
  else selectedTags.value.push(tag)
}

const chooseImage = () => {
  uni.chooseImage({
    count: 6 - uploadedImages.value.length,
    success(res) {
      uploadedImages.value.push(...res.tempFilePaths)
    }
  })
}
const removeImg = (i: number) => uploadedImages.value.splice(i, 1)

const submitReview = async () => {
  if (!form.value.content) {
    uni.showToast({ title: '请填写评价内容', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await createReviewApi({
      orderId,
      photographerId,
      ...form.value,
      tags: selectedTags.value.join(','),
      images: uploadedImages.value
    })
    uni.showToast({ title: '评价成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 800)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.review-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;

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

    .photographer-row {
      display: flex;
      align-items: center;
    }
    .p-avatar {
      width: 88rpx;
      height: 88rpx;
      border-radius: 44rpx;
      margin-right: 20rpx;
    }
    .p-name {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .score-row {
      display: flex;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      &:last-child {
        border: none;
      }

      .score-label {
        width: 160rpx;
        font-size: 28rpx;
        color: #333;
      }
      .stars {
        flex: 1;
        display: flex;
        gap: 8rpx;
        .star {
          font-size: 44rpx;
          color: #ddd;
          &.active {
            color: #f7931e;
          }
        }
      }
      .score-val {
        font-size: 26rpx;
        color: #ff6b35;
        font-weight: bold;
      }
    }

    .review-textarea {
      width: 100%;
      height: 200rpx;
      font-size: 28rpx;
      color: #333;
      background: #f9f9f9;
      border-radius: 12rpx;
      padding: 16rpx;
      box-sizing: border-box;
    }

    .img-uploader {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
      .img-item {
        position: relative;
        width: 160rpx;
        height: 160rpx;
      }
      .uploaded-img {
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

    .anonymous-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .anon-label {
        font-size: 30rpx;
        color: #333;
      }
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
    }
    .tag {
      padding: 10rpx 28rpx;
      border: 2rpx solid #e5e5e5;
      border-radius: 32rpx;
      font-size: 26rpx;
      color: #666;
      &.active {
        border-color: #ff6b35;
        color: #ff6b35;
        background: rgba(255, 107, 53, 0.05);
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
  }
}
</style>
