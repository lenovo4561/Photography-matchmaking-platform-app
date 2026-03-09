<route lang="json5">
{
  style: {
    navigationBarTitleText: '搜索',
    navigationStyle: 'custom'
  }
}
</route>

<template>
  <view class="search-page">
    <!-- 搜索框 -->
    <view class="search-header">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input
          v-model="keyword"
          placeholder="搜索摄影师、作品、套餐..."
          focus
          @input="handleInput"
          @confirm="doSearch"
          class="search-input"
        />
        <text class="clear-btn" v-if="keyword" @click="clear">✕</text>
      </view>
      <text class="cancel-btn" @click="uni.navigateBack()">取消</text>
    </view>

    <!-- 内容区 -->
    <view class="search-content">
      <!-- 历史 / 热搜（未搜索时） -->
      <view v-if="!hasSearched && !keyword">
        <view class="hint-section" v-if="history.length">
          <view class="hint-header">
            <text class="hint-title">搜索历史</text>
            <text class="hint-clear" @click="clearHistory">清空</text>
          </view>
          <view class="hint-tags">
            <text class="hint-tag" v-for="h in history" :key="h" @click="searchWith(h)">{{ h }}</text>
          </view>
        </view>
        <view class="hint-section">
          <text class="hint-title">热门搜索</text>
          <view class="hint-tags">
            <text class="hint-tag hot" v-for="h in hotKeywords" :key="h" @click="searchWith(h)">{{ h }}</text>
          </view>
        </view>
      </view>

      <!-- 搜索结果 -->
      <view v-else-if="hasSearched">
        <!-- Tab切换 -->
        <view class="result-tabs">
          <view
            v-for="tab in resultTabs"
            :key="tab.key"
            class="result-tab"
            :class="{ active: resultTab === tab.key }"
            @click="resultTab = tab.key"
          >
            {{ tab.label }}
          </view>
        </view>

        <!-- 摄影师结果 -->
        <view v-if="resultTab === 'photographer'">
          <view v-for="p in photographers" :key="p.id" class="result-card" @click="goPhotographer(p.id)">
            <image :src="p.user?.avatar || '/static/default-avatar.png'" mode="aspectFill" class="result-avatar" />
            <view class="result-info">
              <text class="result-name">{{ p.user?.nickname }}</text>
              <text class="result-sub">{{ p.styleTag }} · {{ p.serviceCity }}</text>
              <text class="result-score">⭐ {{ p.avgScore }} | {{ p.orderCount }}单</text>
            </view>
          </view>
          <view class="empty" v-if="photographers.length === 0">无摄影师结果</view>
        </view>

        <!-- 作品集结果 -->
        <view v-if="resultTab === 'portfolio'">
          <view class="portfolio-grid">
            <view class="portfolio-item" v-for="p in portfolios" :key="p.id" @click="goPortfolio(p.id)">
              <image :src="p.coverImage || '/static/default-cover.png'" mode="aspectFill" class="portfolio-img" />
              <text class="portfolio-title">{{ p.title }}</text>
            </view>
          </view>
          <view class="empty" v-if="portfolios.length === 0">无作品集结果</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getPhotographerListApi, getPortfolioListApi } from '@/api/photoApi'

const keyword = ref('')
const hasSearched = ref(false)
const resultTab = ref('photographer')
const photographers = ref<any[]>([])
const portfolios = ref<any[]>([])
const history = ref<string[]>(uni.getStorageSync('searchHistory') || [])

const resultTabs = [
  { key: 'photographer', label: '摄影师' },
  { key: 'portfolio', label: '作品集' }
]
const hotKeywords = ['婚礼跟拍', '写真摄影', '商业拍摄', '亲子写真', '毕业照', '旅拍']

let searchTimer: any = null
const handleInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (keyword.value.trim()) doSearch()
  }, 600)
}

const doSearch = async () => {
  if (!keyword.value.trim()) return
  const kw = keyword.value.trim()
  hasSearched.value = true
  addHistory(kw)
  try {
    const [pRes, portRes] = await Promise.all([
      getPhotographerListApi({ keyword: kw, page: 1, pageSize: 20 }),
      getPortfolioListApi({ keyword: kw, page: 1, pageSize: 20 })
    ])
    photographers.value = pRes?.data?.list || []
    portfolios.value = portRes?.data?.list || []
  } catch {}
}

const searchWith = (kw: string) => {
  keyword.value = kw
  doSearch()
}
const clear = () => {
  keyword.value = ''
  hasSearched.value = false
}

const addHistory = (kw: string) => {
  const idx = history.value.indexOf(kw)
  if (idx >= 0) history.value.splice(idx, 1)
  history.value.unshift(kw)
  if (history.value.length > 10) history.value = history.value.slice(0, 10)
  uni.setStorageSync('searchHistory', history.value)
}

const clearHistory = () => {
  history.value = []
  uni.removeStorageSync('searchHistory')
}
const goPhotographer = (id: number) => uni.navigateTo({ url: `/pages/photographer/detail?id=${id}` })
const goPortfolio = (id: number) => uni.navigateTo({ url: `/pages/portfolio/detail?id=${id}` })
</script>

<style scoped lang="scss">
.search-page {
  min-height: 100vh;
  background: #f5f5f5;

  .search-header {
    background: #fff;
    padding: 16rpx 20rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;

    .search-bar {
      flex: 1;
      height: 72rpx;
      background: #f5f5f5;
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      padding: 0 20rpx;
      .search-icon {
        font-size: 32rpx;
        margin-right: 8rpx;
      }
      .search-input {
        flex: 1;
        font-size: 28rpx;
      }
      .clear-btn {
        font-size: 28rpx;
        color: #999;
      }
    }
    .cancel-btn {
      font-size: 28rpx;
      color: #333;
      flex-shrink: 0;
    }
  }

  .search-content {
    padding: 16rpx;
  }

  .hint-section {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;

    .hint-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;
    }
    .hint-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
    .hint-clear {
      font-size: 26rpx;
      color: #999;
    }

    .hint-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
    }
    .hint-tag {
      background: #f5f5f5;
      color: #666;
      font-size: 26rpx;
      padding: 10rpx 24rpx;
      border-radius: 32rpx;
      &.hot {
        background: rgba(255, 107, 53, 0.1);
        color: #ff6b35;
      }
    }
  }

  .result-tabs {
    display: flex;
    background: #fff;
    border-radius: 12rpx;
    margin-bottom: 16rpx;
    .result-tab {
      flex: 1;
      text-align: center;
      padding: 20rpx;
      font-size: 28rpx;
      color: #666;
      &.active {
        color: #ff6b35;
        font-weight: bold;
      }
    }
  }

  .result-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;

    .result-avatar {
      width: 88rpx;
      height: 88rpx;
      border-radius: 44rpx;
      margin-right: 20rpx;
    }
    .result-info {
      flex: 1;
      .result-name {
        display: block;
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
      .result-sub {
        display: block;
        font-size: 24rpx;
        color: #999;
      }
      .result-score {
        font-size: 22rpx;
        color: #ff6b35;
      }
    }
  }

  .portfolio-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }
  .portfolio-item {
    width: calc(50% - 6rpx);
    border-radius: 12rpx;
    overflow: hidden;
  }
  .portfolio-img {
    width: 100%;
    height: 260rpx;
  }
  .portfolio-title {
    display: block;
    font-size: 24rpx;
    color: #333;
    padding: 8rpx 12rpx;
    background: #fff;
  }

  .empty {
    text-align: center;
    padding: 60rpx;
    color: #999;
    font-size: 28rpx;
  }
}
</style>
