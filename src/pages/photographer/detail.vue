<route lang="json5">
{
  style: {
    navigationBarTitleText: '摄影师详情',
    navigationStyle: 'custom'
  }
}
</route>

<template>
  <scroll-view scroll-y class="detail-page" @scrolltolower="() => {}">
    <view v-if="photographer">
      <!-- 顶部封面 -->
      <view class="cover-area">
        <image :src="photographer.user?.avatar || '/static/default-avatar.png'" mode="aspectFill" class="cover-bg" />
        <view class="cover-overlay" />
        <view class="cover-info">
          <image :src="photographer.user?.avatar || '/static/default-avatar.png'" mode="aspectFill" class="avatar" />
          <view class="info-right">
            <text class="name">{{ photographer.user?.nickname }}</text>
            <text class="city">📍 {{ photographer.serviceCity }}</text>
            <view class="badges">
              <text class="badge" v-if="photographer.certStatus === 2">✓ 已认证</text>
              <text class="badge" v-if="photographer.canVisit">🚗 可上门</text>
              <text class="badge" v-if="photographer.canUrgent">⚡ 可加急</text>
            </view>
          </view>
        </view>
        <view class="stats-bar">
          <view class="stat-item">
            <text class="stat-num">{{ photographer.orderCount }}</text>
            <text class="stat-label">接单</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ photographer.avgScore || 5.0 }}</text>
            <text class="stat-label">评分</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">Lv{{ photographer.level }}</text>
            <text class="stat-label">等级</text>
          </view>
        </view>
      </view>

      <!-- Tab切换 -->
      <view class="tab-bar">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </view>
      </view>

      <!-- 简介 -->
      <view class="tab-content" v-if="activeTab === 'intro'">
        <view class="section">
          <text class="section-title">摄影师简介</text>
          <text class="bio-text">{{ photographer.bio || '暂无简介' }}</text>
        </view>
        <view class="section">
          <text class="section-title">擅长风格</text>
          <view class="tag-list">
            <text class="tag" v-for="(tag, i) in photographer.styleTags?.split(',') || []" :key="i">{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 套餐 -->
      <view class="tab-content" v-if="activeTab === 'service'">
        <view class="service-card" v-for="s in services" :key="s.id">
          <view class="service-header">
            <text class="service-title">{{ s.title }}</text>
            <text class="service-price">
              ¥{{ s.price }}
              <text class="price-unit">
                /{{ { fixed: '次', hourly: '小时', per_shot: '张', daily: '天' }[s.priceType] }}
              </text>
            </text>
          </view>
          <text class="service-desc">{{ s.description }}</text>
          <button class="book-btn" @click="createOrder(s)">立即预约</button>
        </view>
        <view class="empty" v-if="!services.length">暂无套餐</view>
      </view>

      <!-- 作品集 -->
      <view class="tab-content" v-if="activeTab === 'portfolio'">
        <view class="portfolio-grid">
          <view class="portfolio-item" v-for="p in portfolios" :key="p.id" @click="goPortfolio(p.id)">
            <image :src="p.coverImage || '/static/default-cover.png'" mode="aspectFill" class="portfolio-img" />
            <view class="portfolio-info">
              <text class="portfolio-title">{{ p.title }}</text>
              <text v-if="p.accessType === 'paid'" class="portfolio-price">¥{{ p.price }}</text>
            </view>
          </view>
        </view>
        <view class="empty" v-if="!portfolios.length">暂无作品集</view>
      </view>

      <!-- 评价 -->
      <view class="tab-content" v-if="activeTab === 'review'">
        <view class="review-card" v-for="r in reviews" :key="r.id">
          <view class="review-header">
            <image :src="r.buyer?.avatar || '/static/default-avatar.png'" mode="aspectFill" class="reviewer-avatar" />
            <view class="reviewer-info">
              <text class="reviewer-name">{{ r.isAnonymous ? '匿名用户' : r.buyer?.nickname }}</text>
              <text class="review-score">{{ '⭐'.repeat(Math.round(r.totalScore)) }}</text>
            </view>
            <text class="review-date">{{ r.createdAt?.substr(0, 10) }}</text>
          </view>
          <text class="review-content">{{ r.content }}</text>
          <view class="review-reply" v-if="r.reply">
            <text class="reply-label">摄影师回复：</text>
            <text>{{ r.reply }}</text>
          </view>
        </view>
        <view class="empty" v-if="!reviews.length">暂无评价</view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="photographer">
      <button class="chat-btn" @click="goChat">💬 发消息</button>
      <button class="book-btn" @click="createOrder(services[0])">📅 立即预约</button>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { getPhotographerDetailApi, getServiceListApi, getPortfolioListApi, getReviewListApi } from '@/api/photoApi'
import { MOCK_PHOTOGRAPHERS, MOCK_SERVICES, MOCK_PORTFOLIOS_ALL, MOCK_REVIEWS } from '@/mock/data'

const IS_DEMO = import.meta.env.VITE_DEMO === 'true'
const photographer = ref<any>(null)
const services = ref<any[]>([])
const portfolios = ref<any[]>([])
const reviews = ref<any[]>([])
const activeTab = ref('intro')

const tabs = [
  { key: 'intro', label: '简介' },
  { key: 'service', label: '套餐' },
  { key: 'portfolio', label: '作品集' },
  { key: 'review', label: '评价' }
]

onLoad(async opts => {
  const id = opts?.id
  if (!id) return

  // 演示模式：直接从本地 mock 数据取，完全不走网络
  if (IS_DEMO) {
    const numId = parseInt(String(id))
    photographer.value = MOCK_PHOTOGRAPHERS.find(p => p.id === numId) || MOCK_PHOTOGRAPHERS[0]
    services.value = MOCK_SERVICES.filter(s => s.photographerId === photographer.value.id)
    portfolios.value = MOCK_PORTFOLIOS_ALL.filter(p => p.photographer?.id === photographer.value.id)
    if (portfolios.value.length === 0) portfolios.value = MOCK_PORTFOLIOS_ALL.slice(0, 4)
    reviews.value = MOCK_REVIEWS
    return
  }

  try {
    const [pRes, sRes, portRes, rRes] = await Promise.all([
      getPhotographerDetailApi(id),
      getServiceListApi({ photographerId: id }),
      getPortfolioListApi({ photographerId: id }),
      getReviewListApi({ photographerId: id })
    ])
    photographer.value = pRes?.data
    services.value = sRes?.data?.list || []
    portfolios.value = portRes?.data?.list || []
    reviews.value = rRes?.data?.list || []
  } catch (e) {
    // 兜底
    const numId = parseInt(String(id))
    photographer.value = MOCK_PHOTOGRAPHERS.find(p => p.id === numId) || MOCK_PHOTOGRAPHERS[0]
    services.value = MOCK_SERVICES.filter(s => s.photographerId === photographer.value.id)
    portfolios.value = MOCK_PORTFOLIOS_ALL.slice(0, 4)
    reviews.value = MOCK_REVIEWS
  }
})

const goPortfolio = (id: number) => uni.navigateTo({ url: `/pages/portfolio/detail?id=${id}` })
const goChat = () => {
  const p = photographer.value
  uni.navigateTo({ url: `/pages/chat/detail?userId=${p.userId}&name=${p.user?.nickname}` })
}
const createOrder = (service: any) => {
  if (!service) return
  uni.navigateTo({ url: `/pages/order/create?serviceId=${service.id}&photographerId=${photographer.value.id}` })
}
</script>

<style scoped lang="scss">
.detail-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 140rpx;

  .cover-area {
    position: relative;
    .cover-bg {
      width: 100%;
      height: 500rpx;
      filter: blur(20rpx);
      transform: scale(1.05);
    }
    .cover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
    }
    .cover-info {
      position: absolute;
      top: 60rpx;
      left: 30rpx;
      display: flex;
      align-items: flex-end;
      .avatar {
        width: 160rpx;
        height: 160rpx;
        border-radius: 80rpx;
        border: 4rpx solid #fff;
        margin-right: 24rpx;
      }
      .info-right {
        .name {
          display: block;
          font-size: 40rpx;
          font-weight: bold;
          color: #fff;
          margin-bottom: 8rpx;
        }
        .city {
          display: block;
          font-size: 26rpx;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 12rpx;
        }
        .badges {
          display: flex;
          gap: 12rpx;
        }
        .badge {
          font-size: 22rpx;
          color: #fff;
          background: rgba(255, 255, 255, 0.2);
          padding: 4rpx 14rpx;
          border-radius: 20rpx;
        }
      }
    }
    .stats-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      padding: 16rpx 0;
      .stat-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .stat-num {
        font-size: 36rpx;
        font-weight: bold;
        color: #fff;
      }
      .stat-label {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }

  .tab-bar {
    background: #fff;
    display: flex;
    border-bottom: 1rpx solid #f0f0f0;
    .tab-item {
      flex: 1;
      text-align: center;
      padding: 24rpx;
      font-size: 28rpx;
      color: #666;
      position: relative;
      &.active {
        color: #ff6b35;
        font-weight: bold;
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60rpx;
          height: 4rpx;
          background: #ff6b35;
          border-radius: 2rpx;
        }
      }
    }
  }

  .tab-content {
    padding: 24rpx;
    .section {
      background: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;
    }
    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 16rpx;
    }
    .bio-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;
    }
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
    }
    .tag {
      background: rgba(255, 107, 53, 0.1);
      color: #ff6b35;
      font-size: 24rpx;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
    }

    .service-card {
      background: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;
      .service-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12rpx;
      }
      .service-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
      .service-price {
        font-size: 36rpx;
        color: #ff4444;
        font-weight: bold;
      }
      .price-unit {
        font-size: 22rpx;
        color: #999;
      }
      .service-desc {
        font-size: 26rpx;
        color: #999;
        margin-bottom: 16rpx;
        display: block;
      }
      .book-btn {
        background: #ff6b35;
        color: #fff;
        border-radius: 32rpx;
        font-size: 26rpx;
        border: none;
        height: 72rpx;
        line-height: 72rpx;
      }
    }

    .portfolio-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      .portfolio-item {
        width: calc(50% - 6rpx);
      }
      .portfolio-img {
        width: 100%;
        height: 260rpx;
        border-radius: 12rpx;
      }
      .portfolio-info {
        padding: 8rpx 4rpx;
        display: flex;
        justify-content: space-between;
      }
      .portfolio-title {
        font-size: 24rpx;
        color: #333;
      }
      .portfolio-price {
        font-size: 24rpx;
        color: #ff4444;
      }
    }

    .review-card {
      background: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;
      .review-header {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;
      }
      .reviewer-avatar {
        width: 72rpx;
        height: 72rpx;
        border-radius: 36rpx;
        margin-right: 16rpx;
      }
      .reviewer-info {
        flex: 1;
      }
      .reviewer-name {
        display: block;
        font-size: 28rpx;
        color: #333;
      }
      .review-score {
        font-size: 22rpx;
      }
      .review-date {
        font-size: 22rpx;
        color: #999;
      }
      .review-content {
        font-size: 28rpx;
        color: #333;
        line-height: 1.6;
      }
      .review-reply {
        background: #f9f9f9;
        padding: 16rpx;
        border-radius: 8rpx;
        margin-top: 12rpx;
        font-size: 26rpx;
        color: #666;
      }
      .reply-label {
        font-weight: bold;
      }
    }

    .empty {
      text-align: center;
      color: #999;
      padding: 60rpx;
      font-size: 28rpx;
    }
  }

  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx 30rpx;
    display: flex;
    gap: 20rpx;
    box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.1);
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

    .chat-btn {
      flex: 1;
      height: 88rpx;
      border-radius: 44rpx;
      border: 2rpx solid #ff6b35;
      color: #ff6b35;
      background: #fff;
      font-size: 30rpx;
    }
    .book-btn {
      flex: 2;
      height: 88rpx;
      border-radius: 44rpx;
      border: none;
      background: #ff6b35;
      color: #fff;
      font-size: 30rpx;
    }
  }
}
</style>
