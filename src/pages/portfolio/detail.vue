<route lang="json5">
{
  style: {
    navigationBarTitleText: '作品集',
    navigationStyle: 'custom'
  }
}
</route>

<template>
  <scroll-view scroll-y class="portfolio-detail">
    <view v-if="portfolio">
      <!-- 封面/第一张图 -->
      <view class="cover-preview">
        <swiper class="preview-swiper" :current="swiperCurrent" @change="onSwiperChange">
          <swiper-item v-for="(item, idx) in previewItems" :key="idx">
            <image :src="item.thumbUrl || item.originalUrl" mode="aspectFit" class="preview-img" />
          </swiper-item>
        </swiper>
        <view class="swiper-indicator">{{ swiperCurrent + 1 }} / {{ previewItems.length }}</view>

        <!-- 锁定遮罩 -->
        <view class="lock-mask" v-if="isLocked">
          <text class="lock-icon">🔒</text>
          <text class="lock-text">付费解锁全部内容</text>
          <text class="lock-price">¥{{ portfolio.price }}</text>
          <button class="unlock-btn" @click="unlockPortfolio">立即解锁</button>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="info-card">
        <text class="portfolio-title">{{ portfolio.title }}</text>
        <view class="portfolio-meta">
          <text class="meta-category">📷 {{ portfolio.category }}</text>
          <view class="like-btn" @click="toggleLike">
            <text>{{ portfolio.isLiked ? '❤️' : '🤍' }} {{ likeCount }}</text>
          </view>
        </view>
      </view>

      <!-- 摄影师信息 -->
      <view class="photographer-card" @click="goPhotographer">
        <image
          :src="portfolio.photographer?.user?.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
          class="p-avatar"
        />
        <view class="p-info">
          <text class="p-name">{{ portfolio.photographer?.user?.nickname }}</text>
          <text class="p-city">📍 {{ portfolio.photographer?.serviceCity }}</text>
        </view>
        <view class="follow-btn">联系TA ›</view>
      </view>

      <!-- 图集详情（已解锁或免费） -->
      <view class="items-section" v-if="!isLocked">
        <view class="item-grid">
          <view v-for="(item, idx) in portfolio.items" :key="item.id" class="item-card" @click="swiperCurrent = idx">
            <image :src="item.thumbUrl || item.originalUrl" mode="aspectFill" class="item-img" />
            <view class="video-icon" v-if="item.fileType === 'video'">▶</view>
          </view>
        </view>
      </view>

      <!-- 解锁预览（模糊加水印） -->
      <view class="locked-preview" v-else>
        <view class="locked-items">
          <image
            v-for="i in 4"
            :key="i"
            :src="portfolio.coverImage || '/static/default-cover.png'"
            mode="aspectFill"
            class="locked-img blurred"
          />
        </view>
        <view class="locked-overlay">
          <text class="locked-count">共 {{ portfolio.itemCount || '?' }} 张</text>
          <button class="unlock-btn-big" @click="unlockPortfolio">解锁全部 ¥{{ portfolio.price }}</button>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-bar">
      <button class="chat-btn" @click="goChat">💬 咨询</button>
      <button class="order-btn" @click="goOrder">📅 预约拍摄</button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { getPortfolioDetailApi, likePortfolioApi, unlockPortfolioApi } from '@/api/photoApi'

const portfolio = ref<any>(null)
const swiperCurrent = ref(0)
const likeCount = ref(0)

const isLocked = computed(() => {
  if (!portfolio.value) return false
  if (portfolio.value.accessType === 'public') return false
  if (portfolio.value.accessType === 'private') return true
  return portfolio.value.accessType === 'paid' && !portfolio.value.isUnlocked
})

const previewItems = computed(() => {
  if (!portfolio.value?.items?.length) return [{ thumbUrl: portfolio.value?.coverImage }]
  if (isLocked.value) return portfolio.value.items.slice(0, 1)
  return portfolio.value.items
})

onMounted(async () => {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1] as any
  const id = cur.$page?.options?.id

  if (!id) return
  try {
    const res = await getPortfolioDetailApi(id)
    portfolio.value = res?.data
    likeCount.value = portfolio.value?.likeCount || 0
  } catch (e) {
    console.error(e)
  }
})

const onSwiperChange = (e: any) => {
  swiperCurrent.value = e.detail.current
}

const toggleLike = async () => {
  try {
    const res = await likePortfolioApi(portfolio.value.id)
    portfolio.value.isLiked = res?.data?.liked
    likeCount.value = res?.data?.liked ? likeCount.value + 1 : likeCount.value - 1
  } catch {}
}

const unlockPortfolio = async () => {
  uni.showModal({
    title: '确认解锁',
    content: `解锁此作品集需支付 ¥${portfolio.value.price}，将从账户余额扣除`,
    async success(res) {
      if (res.confirm) {
        try {
          await unlockPortfolioApi(portfolio.value.id)
          portfolio.value.isUnlocked = true
          uni.showToast({ title: '解锁成功', icon: 'success' })
          // 重新获取详情
          const detailRes = await getPortfolioDetailApi(portfolio.value.id)
          portfolio.value = detailRes?.data
        } catch {}
      }
    }
  })
}

const goPhotographer = () => uni.navigateTo({ url: `/pages/photographer/detail?id=${portfolio.value?.photographerId}` })
const goChat = () => {
  const p = portfolio.value?.photographer
  uni.navigateTo({ url: `/pages/chat/detail?userId=${p?.userId}&name=${p?.user?.nickname}` })
}
const goOrder = () => uni.navigateTo({ url: `/pages/photographer/detail?id=${portfolio.value?.photographerId}` })
</script>

<style scoped lang="scss">
.portfolio-detail {
  background: #000;
  min-height: 100vh;
  padding-bottom: 140rpx;

  .cover-preview {
    position: relative;
    .preview-swiper {
      height: 600rpx;
    }
    .preview-img {
      width: 100%;
      height: 600rpx;
    }
    .swiper-indicator {
      position: absolute;
      bottom: 20rpx;
      right: 24rpx;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 22rpx;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
    }

    .lock-mask {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .lock-icon {
        font-size: 80rpx;
        margin-bottom: 16rpx;
      }
      .lock-text {
        font-size: 30rpx;
        color: #fff;
        margin-bottom: 8rpx;
      }
      .lock-price {
        font-size: 40rpx;
        color: #f7931e;
        font-weight: bold;
        margin-bottom: 24rpx;
      }
      .unlock-btn {
        background: #ff6b35;
        color: #fff;
        border-radius: 48rpx;
        padding: 0 60rpx;
        height: 80rpx;
        line-height: 80rpx;
        font-size: 30rpx;
        border: none;
      }
    }
  }

  .info-card {
    background: #fff;
    padding: 24rpx 30rpx;
    margin-top: 2rpx;

    .portfolio-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 16rpx;
    }
    .portfolio-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .meta-category {
      font-size: 26rpx;
      color: #999;
    }
    .like-btn text {
      font-size: 28rpx;
      color: #666;
    }
  }

  .photographer-card {
    background: #fff;
    margin-top: 12rpx;
    padding: 24rpx 30rpx;
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
      .p-city {
        font-size: 24rpx;
        color: #999;
      }
    }
    .follow-btn {
      font-size: 28rpx;
      color: #ff6b35;
    }
  }

  .items-section {
    background: #fff;
    margin-top: 12rpx;
    padding: 24rpx;
    .item-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8rpx;
    }
    .item-card {
      width: calc(33.33% - 6rpx);
      position: relative;
    }
    .item-img {
      width: 100%;
      height: 200rpx;
      border-radius: 8rpx;
    }
    .video-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 48rpx;
      color: #fff;
    }
  }

  .locked-preview {
    background: #fff;
    margin-top: 12rpx;
    padding: 24rpx;
    position: relative;
    .locked-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8rpx;
    }
    .locked-img {
      width: calc(50% - 4rpx);
      height: 280rpx;
      border-radius: 12rpx;
    }
    .blurred {
      filter: blur(30rpx);
    }
    .locked-overlay {
      text-align: center;
      padding: 24rpx;
    }
    .locked-count {
      font-size: 28rpx;
      color: #999;
      display: block;
      margin-bottom: 16rpx;
    }
    .unlock-btn-big {
      background: linear-gradient(90deg, #ff6b35, #f7931e);
      color: #fff;
      border-radius: 48rpx;
      font-size: 32rpx;
      height: 96rpx;
      line-height: 96rpx;
      border: none;
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
    gap: 20rpx;

    .chat-btn {
      flex: 1;
      height: 88rpx;
      border-radius: 44rpx;
      border: 2rpx solid #ff6b35;
      color: #ff6b35;
      background: #fff;
      font-size: 30rpx;
    }
    .order-btn {
      flex: 2;
      height: 88rpx;
      border-radius: 44rpx;
      background: #ff6b35;
      color: #fff;
      font-size: 30rpx;
      border: none;
    }
  }
}
</style>
