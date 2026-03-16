<route lang="json5">
{
  layout: 'foot',
  style: {
    navigationBarTitleText: '发现',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="discover-page">
    <!-- 顶部筛选 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view
          v-for="cat in categories"
          :key="cat.key"
          class="filter-item"
          :class="{ active: activeCategory === cat.key }"
          @click="selectCategory(cat.key)"
        >
          {{ cat.label }}
        </view>
      </scroll-view>
    </view>

    <!-- 瀑布流作品 -->
    <scroll-view scroll-y class="portfolio-scroll" @scrolltolower="loadMore">
      <waterfall class="waterfall">
        <cell v-for="item in portfolioList" :key="item.id">
          <view class="portfolio-card" @click="goDetail(item.id)">
            <image
              :src="item.coverImage || '/static/default-cover.png'"
              mode="widthFix"
              class="portfolio-img"
              @load="onImgLoad"
            />
            <view class="card-body">
              <text class="card-title">{{ item.title }}</text>
              <view class="card-meta">
                <view class="author" @click.stop="goPhotographer(item.photographer?.id)">
                  <image
                    :src="item.photographer?.user?.avatar || '/static/default-avatar.png'"
                    mode="aspectFill"
                    class="author-avatar"
                  />
                  <text class="author-name">{{ item.photographer?.user?.nickname }}</text>
                </view>
                <view class="card-actions">
                  <text class="like-btn" @click.stop="toggleLike(item)">
                    {{ item.isLiked ? '❤️' : '🤍' }} {{ item.likeCount }}
                  </text>
                </view>
              </view>
              <view v-if="item.accessType !== 'public'" class="lock-badge">
                🔒 {{ item.accessType === 'paid' ? `¥${item.price}` : '私密' }}
              </view>
            </view>
          </view>
        </cell>
      </waterfall>

      <view class="loading-more" v-if="loadingMore">加载中...</view>
      <view class="no-more" v-if="noMore">— 没有更多了 —</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { getPortfolioListApi, likePortfolioApi } from '@/api/photoApi'
import { MOCK_PORTFOLIOS_BY_CATEGORY as mockMap } from '@/mock/data'

const activeCategory = ref('all')
const portfolioList = ref<any[]>([])
const page = ref(1)
const loadingMore = ref(false)
const noMore = ref(false)

const categories = [
  { key: 'all', label: '全部' },
  { key: 'portrait', label: '人像写真' },
  { key: 'wedding', label: '婚礼婚纱' },
  { key: 'commercial', label: '商业广告' },
  { key: 'family', label: '亲子家庭' },
  { key: 'graduation', label: '毕业纪念' },
  { key: 'travel', label: '旅行纪实' },
  { key: 'event', label: '活动演出' },
  { key: 'product', label: '产品静物' }
]

onMounted(() => fetchList(true))

const selectCategory = (key: string) => {
  activeCategory.value = key
  page.value = 1
  noMore.value = false
  fetchList(true)
}

const fetchList = async (reset = false) => {
  if (loadingMore.value) return
  loadingMore.value = true
  try {
    const params: any = { page: page.value, pageSize: 20 }
    if (activeCategory.value !== 'all') params.category = activeCategory.value
    const res = await getPortfolioListApi(params)
    const apiList = res?.data?.list || []

    // API 有数据优先用真实数据，否则用分类 mock 演示数据
    const list = apiList.length > 0 ? apiList : mockMap[activeCategory.value] || []
    if (reset) portfolioList.value = list
    else portfolioList.value.push(...list)
    noMore.value = true // mock 数据一次性加载完
  } catch {
    // 请求失败时直接展示 mock 数据
    const list = mockMap[activeCategory.value] || []
    if (reset) portfolioList.value = list
    noMore.value = true
  } finally {
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (noMore.value) return
  page.value++
  fetchList()
}

const onImgLoad = () => {}

const toggleLike = async (item: any) => {
  try {
    if (item.id?.toString().startsWith('m')) {
      // mock 数据本地切换
      item.isLiked = !item.isLiked
      item.likeCount += item.isLiked ? 1 : -1
      return
    }
    const res = await likePortfolioApi(item.id)
    item.isLiked = res?.data?.liked
    item.likeCount = res?.data?.liked ? item.likeCount + 1 : item.likeCount - 1
  } catch {}
}

const goDetail = (id: number) => uni.navigateTo({ url: `/pages/portfolio/detail?id=${id}` })
const goPhotographer = (id: number) => uni.navigateTo({ url: `/pages/photographer/detail?id=${id}` })
</script>

<style scoped lang="scss">
.discover-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  .filter-bar {
    background: #fff;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    .filter-scroll {
      white-space: nowrap;
      padding: 0 20rpx;
    }

    .filter-item {
      display: inline-block;
      padding: 10rpx 28rpx;
      font-size: 26rpx;
      color: #666;
      border-radius: 32rpx;
      margin-right: 12rpx;
      background: #f5f5f5;

      &.active {
        background: #ff6b35;
        color: #fff;
      }
    }
  }

  .portfolio-scroll {
    flex: 1;
    overflow: hidden;
  }

  .waterfall {
    padding: 12rpx;
  }

  .portfolio-card {
    margin: 0 6rpx 12rpx;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;

    .portfolio-img {
      width: 100%;
    }

    .card-body {
      padding: 16rpx;

      .card-title {
        font-size: 26rpx;
        color: #333;
        font-weight: bold;
        display: block;
        margin-bottom: 10rpx;
      }

      .card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .author {
          display: flex;
          align-items: center;

          .author-avatar {
            width: 44rpx;
            height: 44rpx;
            border-radius: 22rpx;
            margin-right: 8rpx;
          }
          .author-name {
            font-size: 22rpx;
            color: #999;
          }
        }

        .like-btn {
          font-size: 24rpx;
          color: #999;
        }
      }

      .lock-badge {
        margin-top: 8rpx;
        background: rgba(255, 107, 53, 0.1);
        color: #ff6b35;
        font-size: 22rpx;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        display: inline-block;
      }
    }
  }

  .loading-more,
  .no-more {
    text-align: center;
    padding: 24rpx;
    color: #999;
    font-size: 26rpx;
  }
}
</style>
