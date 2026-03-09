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
      <view class="portfolio-grid">
        <view class="portfolio-item" v-for="p in portfolios" :key="p.id" @click="goPortfolio(p.id)">
          <image :src="p.coverImage || '/static/default-cover.png'" mode="aspectFill" class="portfolio-img" />
          <view class="portfolio-meta">
            <text class="portfolio-title">{{ p.title }}</text>
            <text class="portfolio-like">❤ {{ p.likeCount }}</text>
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
import {
  getPhotographerListApi,
  getServiceListApi,
  getPortfolioListApi,
  getBannersApi,
  getCategoriesApi
} from '@/api/photoApi'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const photographers = ref<any[]>([])
const services = ref<any[]>([])
const portfolios = ref<any[]>([])
const loadingMore = ref(false)
const portfolioPage = ref(1)

// 默认兜底数据（接口失败时使用）
const DEFAULT_BANNERS = [
  {
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=750&auto=format&fit=crop&q=80',
    title: '婚礼跟拍 · 见证最美时刻'
  },
  {
    image: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=750&auto=format&fit=crop&q=80',
    title: '专业写真 · 定格美好瞬间'
  },
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=750&auto=format&fit=crop&q=80',
    title: '商业拍摄 · 让产品更出彩'
  }
]

const DEFAULT_CATEGORIES = [
  {
    key: 'portrait',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80',
    label: '个人写真'
  },
  {
    key: 'wedding',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&auto=format&fit=crop&q=80',
    label: '婚礼跟拍'
  },
  {
    key: 'commercial',
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200&auto=format&fit=crop&q=80',
    label: '商业拍摄'
  },
  {
    key: 'family',
    image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=200&auto=format&fit=crop&q=80',
    label: '亲子家庭'
  },
  {
    key: 'graduation',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&auto=format&fit=crop&q=80',
    label: '毕业照'
  },
  {
    key: 'travel',
    image: 'https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?w=200&auto=format&fit=crop&q=80',
    label: '旅拍'
  },
  {
    key: 'event',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&auto=format&fit=crop&q=80',
    label: '活动会议'
  },
  {
    key: 'product',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    label: '产品拍摄'
  }
]

const banners = ref<any[]>(DEFAULT_BANNERS)
const categories = ref<any[]>(DEFAULT_CATEGORIES)

onMounted(async () => {
  loadData()
})

// ========== 推荐摄影师演示数据 ==========
const mockPhotographers = [
  {
    id: 'mp1',
    avgScore: 4.9,
    orderCount: 386,
    styleTags: '人像写真 · 日系清新',
    user: {
      nickname: '林晓薇',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'mp2',
    avgScore: 4.8,
    orderCount: 512,
    styleTags: '婚礼跟拍 · 纪实温情',
    user: {
      nickname: '陈俊豪',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'mp3',
    avgScore: 4.9,
    orderCount: 274,
    styleTags: '商业广告 · 时尚大片',
    user: {
      nickname: '张雅琴',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'mp4',
    avgScore: 4.7,
    orderCount: 198,
    styleTags: '亲子家庭 · 温馨记录',
    user: {
      nickname: '王建国',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'mp5',
    avgScore: 5.0,
    orderCount: 632,
    styleTags: '旅拍纪实 · 人文风光',
    user: {
      nickname: '李梦婷',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'mp6',
    avgScore: 4.8,
    orderCount: 341,
    styleTags: '毕业写真 · 青春定格',
    user: {
      nickname: '赵宇轩',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'mp7',
    avgScore: 4.9,
    orderCount: 457,
    styleTags: '产品静物 · 光影艺术',
    user: {
      nickname: '吴佳慧',
      avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=160&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'mp8',
    avgScore: 4.7,
    orderCount: 223,
    styleTags: '活动演出 · 现场抓拍',
    user: {
      nickname: '刘志远',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'mp9',
    avgScore: 4.8,
    orderCount: 389,
    styleTags: '写真胶片 · 复古风格',
    user: {
      nickname: '徐晨曦',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=160&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'mp10',
    avgScore: 4.9,
    orderCount: 508,
    styleTags: '儿童百天 · 成长记录',
    user: {
      nickname: '周雪莹',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80'
    }
  }
]

const loadData = async () => {
  try {
    const [photoRes, serviceRes, portfolioRes, bannerRes, categoryRes] = await Promise.all([
      getPhotographerListApi({ page: 1, pageSize: 10 }),
      getServiceListApi({ page: 1, pageSize: 6 }),
      getPortfolioListApi({ page: 1, pageSize: 12 }),
      getBannersApi(),
      getCategoriesApi()
    ])
    const apiPhotographers = photoRes?.data?.list || []
    photographers.value = apiPhotographers.length > 0 ? apiPhotographers : mockPhotographers
    services.value = serviceRes?.data?.list || []
    portfolios.value = portfolioRes?.data?.list || []
    if (bannerRes?.data?.length) banners.value = bannerRes.data
    if (categoryRes?.data?.length) categories.value = categoryRes.data
  } catch (e) {
    photographers.value = mockPhotographers
  }
}

const loadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  portfolioPage.value++
  try {
    const res = await getPortfolioListApi({ page: portfolioPage.value, pageSize: 12 })
    portfolios.value.push(...(res?.data?.list || []))
  } finally {
    loadingMore.value = false
  }
}

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

    .portfolio-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;

      .portfolio-item {
        width: calc(50% - 6rpx);
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
