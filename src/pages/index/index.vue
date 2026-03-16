<route lang="json5" type="home">
{
  layout: 'foot',
  style: {
    navigationBarTitleText: '首页',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <scroll-view scroll-y class="index-page" @scrolltolower="loadMore">
    <!-- 顶部搜索栏 -->
    <view class="header">
      <view class="search-bar" @click="goSearch">
        <text class="search-icon">🔍</text>
        <text class="search-hint">搜索摄影师、拍摄类型...</text>
      </view>
      <view class="notif-btn" @click="goNotif">
        <text class="notif-icon">🔔</text>
      </view>
    </view>

    <!-- Banner -->
    <swiper class="banner" autoplay interval="4000" circular>
      <swiper-item v-for="(item, idx) in banners" :key="idx">
        <image :src="item.image" mode="aspectFill" class="banner-img" />
        <view class="banner-caption">{{ item.title }}</view>
      </swiper-item>
    </swiper>

    <!-- 分类快捷入口 -->
    <view class="category-bar">
      <view v-for="cat in categories" :key="cat.key" class="cat-item" @click="goCategory(cat)">
        <image :src="cat.image" mode="aspectFill" class="cat-icon-img" />
        <text class="cat-label">{{ cat.label }}</text>
      </view>
    </view>

    <!-- 推荐摄影师 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">推荐摄影师</text>
        <text class="section-more" @click="goList">查看全部 ›</text>
      </view>
      <scroll-view scroll-x class="h-scroll">
        <view class="photographer-card" v-for="p in photographers" :key="p.id" @click="goPhotographer(p.id)">
          <image :src="p.user?.avatar || '/static/default-avatar.png'" mode="aspectFill" class="photo-avatar" />
          <view class="photo-info">
            <text class="photo-name">{{ p.user?.nickname }}</text>
            <text class="photo-tags">{{ p.styleTags }}</text>
            <view class="photo-meta">
              <text class="photo-score">⭐{{ p.avgScore }}</text>
              <text class="photo-orders">{{ p.orderCount }}单</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 热门套餐 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门套餐</text>
        <text class="section-more" @click="goServiceList">更多 ›</text>
      </view>
      <view class="service-list">
        <view class="service-card" v-for="s in services" :key="s.id" @click="goService(s)">
          <image :src="s.coverImage || '/static/default-cover.png'" mode="aspectFill" class="service-img" />
          <view class="service-body">
            <text class="service-title">{{ s.title }}</text>
            <text class="service-desc">{{ s.description }}</text>
            <view class="service-footer">
              <text class="service-price">¥{{ s.price }}</text>
              <text class="service-sales">{{ s.saleCount }}人购买</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 优质作品瀑布流 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">优质作品</text>
      </view>
      <view class="portfolio-columns">
        <view class="portfolio-col">
          <view class="portfolio-item" v-for="p in leftPortfolios" :key="p.id" @click="goPortfolio(p.id)">
            <image :src="p.coverImage || '/static/default-cover.png'" mode="aspectFill" class="portfolio-img" />
            <view class="portfolio-meta">
              <text class="portfolio-title">{{ p.title }}</text>
              <text class="portfolio-like">❤ {{ p.likeCount }}</text>
            </view>
          </view>
        </view>
        <view class="portfolio-col">
          <view class="portfolio-item" v-for="p in rightPortfolios" :key="p.id" @click="goPortfolio(p.id)">
            <image :src="p.coverImage || '/static/default-cover.png'" mode="aspectFill" class="portfolio-img" />
            <view class="portfolio-meta">
              <text class="portfolio-title">{{ p.title }}</text>
              <text class="portfolio-like">❤ {{ p.likeCount }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view class="loading-more" v-if="loadingMore">
      <text>加载中...</text>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { MOCK_PHOTOGRAPHERS, MOCK_PORTFOLIOS_ALL, MOCK_SERVICES, MOCK_BANNERS, MOCK_CATEGORIES } from '@/mock/data'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const photographers = ref<any[]>([])
const services = ref<any[]>([])
const portfolios = ref<any[]>([])
const loadingMore = ref(false)
const portfolioPage = ref(1)

// 默认兜底数据（全部使用本地图片，不依赖外网）
const DEFAULT_BANNERS = [
  { image: 'https://picsum.photos/seed/banner1/750/300', title: '婚礼跟拍 · 见证最美时刻' },
  { image: 'https://picsum.photos/seed/banner2/750/300', title: '专业写真 · 定格美好瞬间' },
  { image: 'https://picsum.photos/seed/banner3/750/300', title: '商业拍摄 · 让产品更出彩' }
]

const DEFAULT_CATEGORIES = [
  { key: 'portrait', image: 'https://picsum.photos/seed/japanese-portrait/400/260', label: '日系清新' },
  { key: 'wedding', image: 'https://picsum.photos/seed/european-wedding/400/260', label: '欧美婚礼' },
  { key: 'commercial', image: 'https://picsum.photos/seed/vintage-fashion/400/260', label: '复古胶片' },
  { key: 'family', image: 'https://picsum.photos/seed/fresh-family/400/260', label: '小清新' },
  { key: 'graduation', image: 'https://picsum.photos/seed/campus-youth/400/260', label: '校园青春' },
  { key: 'travel', image: 'https://picsum.photos/seed/mori-travel/400/260', label: '森系旅拍' },
  { key: 'event', image: 'https://picsum.photos/seed/hongkong-night/400/260', label: '港风夜景' },
  { key: 'product', image: 'https://picsum.photos/seed/korean-minimal/400/260', label: '韩系极简' }
]

const banners = ref<any[]>(DEFAULT_BANNERS)
const categories = ref<any[]>(DEFAULT_CATEGORIES)

onMounted(async () => {
  loadData()
})

// ========== 推荐摄影师演示数据（本地图片） ==========
const mockPhotographers = [
  {
    id: 1,
    avgScore: 4.9,
    orderCount: 386,
    styleTags: '人像写真 · 日系清新',
    user: { nickname: '林晓雨', avatar: 'https://i.pravatar.cc/240?img=47' }
  },
  {
    id: 2,
    avgScore: 4.8,
    orderCount: 512,
    styleTags: '婚礼跟拍 · 纪实温情',
    user: { nickname: '张明远', avatar: 'https://i.pravatar.cc/240?img=11' }
  },
  {
    id: 3,
    avgScore: 4.9,
    orderCount: 274,
    styleTags: '商业广告 · 时尚大片',
    user: { nickname: '陈志豪', avatar: 'https://i.pravatar.cc/240?img=12' }
  },
  {
    id: 4,
    avgScore: 4.7,
    orderCount: 198,
    styleTags: '亲子家庭 · 温馨记录',
    user: { nickname: '苏沐阳', avatar: 'https://i.pravatar.cc/240?img=48' }
  },
  {
    id: 5,
    avgScore: 5.0,
    orderCount: 632,
    styleTags: '旅拍纪实 · 人文风光',
    user: { nickname: '周梦琪', avatar: 'https://i.pravatar.cc/240?img=44' }
  },
  {
    id: 6,
    avgScore: 4.8,
    orderCount: 341,
    styleTags: '毕业写真 · 青春定格',
    user: { nickname: '王宇轩', avatar: 'https://i.pravatar.cc/240?img=15' }
  },
  {
    id: 7,
    avgScore: 4.9,
    orderCount: 457,
    styleTags: '产品静物 · 光影艺术',
    user: { nickname: '刘思远', avatar: 'https://i.pravatar.cc/240?img=20' }
  },
  {
    id: 8,
    avgScore: 4.7,
    orderCount: 223,
    styleTags: '活动演出 · 现场抓拍',
    user: { nickname: '赵佳宁', avatar: 'https://i.pravatar.cc/240?img=25' }
  },
  {
    id: 9,
    avgScore: 4.8,
    orderCount: 389,
    styleTags: '写真胶片 · 复古风格',
    user: { nickname: '吴晴晴', avatar: 'https://i.pravatar.cc/240?img=30' }
  },
  {
    id: 10,
    avgScore: 4.9,
    orderCount: 508,
    styleTags: '儿童百天 · 成长记录',
    user: { nickname: '何子俊', avatar: 'https://i.pravatar.cc/240?img=35' }
  }
]

// 始终使用本地 Mock 数据，不发起任何网络请求
const loadData = () => {
  photographers.value = mockPhotographers
  services.value = MOCK_SERVICES.slice(0, 6)
  portfolios.value = MOCK_PORTFOLIOS_ALL.slice(0, 12)
  if (MOCK_BANNERS?.length) banners.value = MOCK_BANNERS
  if (MOCK_CATEGORIES?.length) categories.value = MOCK_CATEGORIES
}

const loadMore = () => {
  // 本地数据无需分页加载
}

const leftPortfolios = computed(() => portfolios.value.filter((_: any, idx: number) => idx % 2 === 0))
const rightPortfolios = computed(() => portfolios.value.filter((_: any, idx: number) => idx % 2 === 1))

const goSearch = () => uni.navigateTo({ url: '/pages/search/index' })
const goNotif = () => uni.navigateTo({ url: '/pages/notification/index' })
const goList = () => uni.navigateTo({ url: '/pages/photographer/list' })
const goServiceList = () => uni.navigateTo({ url: '/pages/package/list' })
const goPhotographer = (id: number) => uni.navigateTo({ url: `/pages/photographer/detail?id=${id}` })
const goPortfolio = (id: number) => uni.navigateTo({ url: `/pages/portfolio/detail?id=${id}` })
const goCategory = (cat: any) => {
  if (cat.key === 'recommend') {
    uni.navigateTo({ url: '/pages/photographer/list' })
  } else {
    uni.navigateTo({ url: `/pages/category/gallery?type=${cat.key}&title=${encodeURIComponent(cat.label)}` })
  }
}
const goService = (s: any) => uni.navigateTo({ url: `/pages/photographer/detail?id=${s.photographerId}` })
</script>

<style scoped lang="scss">
.index-page {
  background: #f5f5f5;
  min-height: 100vh;

  .header {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    background: #fff;

    .search-bar {
      flex: 1;
      height: 72rpx;
      background: #f5f5f5;
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      padding: 0 24rpx;

      .search-icon {
        font-size: 32rpx;
        margin-right: 12rpx;
      }
      .search-hint {
        color: #999;
        font-size: 28rpx;
      }
    }

    .notif-btn {
      margin-left: 20rpx;
      width: 72rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .banner {
    height: 360rpx;
    position: relative;

    .banner-img {
      width: 100%;
      height: 100%;
    }
    .banner-caption {
      position: absolute;
      bottom: 24rpx;
      left: 30rpx;
      color: #fff;
      font-size: 34rpx;
      font-weight: bold;
      text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
    }
  }

  .category-bar {
    display: flex;
    flex-wrap: wrap;
    background: #fff;
    padding: 24rpx 20rpx;
    margin-bottom: 16rpx;

    .cat-item {
      width: 25%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx 0;

      .cat-icon-img {
        width: 96rpx;
        height: 96rpx;
        border-radius: 24rpx;
        margin-bottom: 10rpx;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
      }
      .cat-label {
        font-size: 24rpx;
        color: #333;
      }
    }
  }

  .section {
    background: #fff;
    margin-bottom: 16rpx;
    padding: 24rpx 30rpx;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .section-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
      }
      .section-more {
        font-size: 26rpx;
        color: #ff6b35;
      }
    }

    .h-scroll {
      white-space: nowrap;
      .photographer-card {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        width: 200rpx;
        margin-right: 20rpx;

        .photo-avatar {
          width: 120rpx;
          height: 120rpx;
          border-radius: 60rpx;
          margin-bottom: 12rpx;
        }

        .photo-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          .photo-name {
            font-size: 26rpx;
            color: #333;
            font-weight: bold;
          }
          .photo-tags {
            font-size: 22rpx;
            color: #999;
            white-space: normal;
            text-align: center;
          }
          .photo-meta {
            display: flex;
            gap: 10rpx;
            margin-top: 6rpx;
            .photo-score,
            .photo-orders {
              font-size: 22rpx;
              color: #ff6b35;
            }
          }
        }
      }
    }

    .service-list {
      .service-card {
        display: flex;
        margin-bottom: 20rpx;
        border-radius: 12rpx;
        overflow: hidden;
        border: 1rpx solid #f0f0f0;

        .service-img {
          width: 200rpx;
          height: 160rpx;
          flex-shrink: 0;
        }
        .service-body {
          flex: 1;
          padding: 16rpx;
          display: flex;
          flex-direction: column;

          .service-title {
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
            margin-bottom: 8rpx;
          }
          .service-desc {
            font-size: 24rpx;
            color: #999;
            flex: 1;
          }
          .service-footer {
            display: flex;
            justify-content: space-between;
            margin-top: 8rpx;
            .service-price {
              font-size: 32rpx;
              color: #ff4444;
              font-weight: bold;
            }
            .service-sales {
              font-size: 22rpx;
              color: #999;
            }
          }
        }
      }
    }

    .portfolio-columns {
      display: flex;
      align-items: flex-start;

      .portfolio-col {
        flex: 1;
        min-width: 0;
      }

      .portfolio-col + .portfolio-col {
        margin-left: 2%;
      }

      .portfolio-item {
        margin-bottom: 12rpx;
        border-radius: 12rpx;
        overflow: hidden;
        position: relative;

        .portfolio-img {
          width: 100%;
          height: 300rpx;
        }
        .portfolio-meta {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16rpx;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
          display: flex;
          justify-content: space-between;

          .portfolio-title {
            font-size: 24rpx;
            color: #fff;
          }
          .portfolio-like {
            font-size: 22rpx;
            color: #fff;
          }
        }
      }
    }
  }

  .loading-more {
    text-align: center;
    padding: 24rpx;
    color: #999;
    font-size: 26rpx;
  }
}
</style>
