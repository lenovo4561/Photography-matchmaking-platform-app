<route lang="json5">
{
  style: {
    navigationBarTitleText: '找摄影师',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="list-page">
    <!-- 搜索+筛选 -->
    <view class="search-header">
      <view class="search-bar">
        <input v-model="keyword" placeholder="搜索摄影师/城市" @input="handleSearch" />
      </view>
    </view>

    <!-- 筛选条件 -->
    <view class="filter-row">
      <view class="filter-btn" :class="{ active: orderBy === 'score' }" @click="sortBy('score')">评分</view>
      <view class="filter-btn" :class="{ active: orderBy === 'orderCount' }" @click="sortBy('orderCount')">接单量</view>
      <view class="filter-btn" :class="{ active: orderBy === 'price' }" @click="sortBy('price')">价格↑</view>
      <view class="filter-btn" @click="showFilter = true">筛选 ▼</view>
    </view>

    <!-- 列表 -->
    <scroll-view scroll-y class="photographer-list" @scrolltolower="loadMore">
      <view class="photographer-card" v-for="p in list" :key="p.id" @click="goDetail(p.id)">
        <view class="p-main">
          <image :src="p.user?.avatar || '/static/default-avatar.png'" mode="aspectFill" class="p-avatar" />
          <view class="p-body">
            <view class="p-top">
              <text class="p-name">{{ p.user?.nickname }}</text>
              <view class="cert-badge" v-if="p.certStatus === 2">
                <text>✓ 已认证</text>
              </view>
            </view>
            <text class="p-tags">{{ p.styleTags }}</text>
            <text class="p-city">📍 {{ p.serviceCity }}</text>
            <view class="p-stats">
              <text class="p-score">⭐ {{ p.avgScore }}</text>
              <text class="p-orders">{{ p.orderCount }} 单</text>
              <text class="p-price">起价 ¥{{ p.minPrice || '--' }}</text>
            </view>
          </view>
          <view class="p-actions">
            <button class="contact-btn" @click.stop="goChat(p)">联系</button>
          </view>
        </view>
        <!-- 作品封面缩略图 -->
        <view class="p-covers" v-if="p.covers?.length">
          <image v-for="(cv, ci) in p.covers.slice(0, 3)" :key="ci" :src="cv" mode="aspectFill" class="p-cover-img" />
        </view>
      </view>

      <view class="no-more" v-if="noMore">— 没有更多了 —</view>
      <view class="loading" v-if="loading">加载中...</view>
    </scroll-view>

    <!-- 筛选弹窗 -->
    <view class="filter-popup" v-if="showFilter">
      <view class="filter-mask" @click="showFilter = false" />
      <view class="filter-panel">
        <view class="filter-panel-title">筛选</view>
        <view class="filter-section">
          <text class="filter-label">拍摄类型</text>
          <view class="filter-options">
            <text
              v-for="cat in categories"
              :key="cat.key"
              class="filter-option"
              :class="{ active: filterForm.category === cat.key }"
              @click="filterForm.category = cat.key === filterForm.category ? '' : cat.key"
            >
              {{ cat.label }}
            </text>
          </view>
        </view>
        <view class="filter-section">
          <text class="filter-label">特殊服务</text>
          <view class="filter-options">
            <text
              class="filter-option"
              :class="{ active: filterForm.canVisit }"
              @click="filterForm.canVisit = !filterForm.canVisit"
            >
              上门拍摄
            </text>
            <text
              class="filter-option"
              :class="{ active: filterForm.canUrgent }"
              @click="filterForm.canUrgent = !filterForm.canUrgent"
            >
              加急拍摄
            </text>
          </view>
        </view>
        <view class="filter-btns">
          <button class="reset-btn" @click="resetFilter">重置</button>
          <button class="confirm-btn" @click="applyFilter">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getPhotographerListApi } from '@/api/photoApi'

const list = ref<any[]>([])
const page = ref(1)
const noMore = ref(false)
const loading = ref(false)
const showFilter = ref(false)
const keyword = ref('')
const orderBy = ref('score')

const filterForm = reactive({ category: '', canVisit: false, canUrgent: false })

const categories = [
  { key: 'portrait', label: '人像写真' },
  { key: 'wedding', label: '婚礼婚纱' },
  { key: 'commercial', label: '商业广告' },
  { key: 'family', label: '亲子家庭' },
  { key: 'graduation', label: '毕业纪念' },
  { key: 'travel', label: '旅拍' }
]

// ── 本地 Mock 数据（后端无数据时兜底展示）──────────────────────────────
const MOCK_LIST = [
  {
    id: 1,
    userId: 1,
    certStatus: 2,
    styleTags: '人像写真,小清新,胶片',
    serviceCity: '北京',
    avgScore: 4.9,
    orderCount: 328,
    minPrice: 599,
    covers: ['/static/mock/cover_portrait.png', '/static/mock/cover_wedding.png', '/static/mock/cover_travel.png'],
    user: { nickname: '林晓雨', avatar: '/static/mock/avatar1.png' }
  },
  {
    id: 2,
    userId: 2,
    certStatus: 2,
    styleTags: '婚礼跟拍,纪实,轻奢',
    serviceCity: '上海',
    avgScore: 4.8,
    orderCount: 215,
    minPrice: 1280,
    covers: ['/static/mock/cover_wedding.png', '/static/mock/cover_portrait.png', '/static/mock/cover_family.png'],
    user: { nickname: '张明远', avatar: '/static/mock/avatar2.png' }
  },
  {
    id: 3,
    userId: 3,
    certStatus: 2,
    styleTags: '商业广告,产品,建筑',
    serviceCity: '广州',
    avgScore: 4.7,
    orderCount: 180,
    minPrice: 800,
    covers: ['/static/mock/cover_commercial.png', '/static/mock/cover_product.png', '/static/mock/cover_event.png'],
    user: { nickname: '陈志豪', avatar: '/static/mock/avatar3.png' }
  },
  {
    id: 4,
    userId: 4,
    certStatus: 0,
    styleTags: '旅拍,风光,极简',
    serviceCity: '成都',
    avgScore: 4.9,
    orderCount: 412,
    minPrice: 450,
    covers: ['/static/mock/cover_travel.png', '/static/mock/cover_portrait.png', '/static/mock/cover_graduation.png'],
    user: { nickname: '苏沐阳', avatar: '/static/mock/avatar4.png' }
  },
  {
    id: 5,
    userId: 5,
    certStatus: 2,
    styleTags: '亲子家庭,儿童,纪实',
    serviceCity: '杭州',
    avgScore: 4.6,
    orderCount: 97,
    minPrice: 680,
    covers: ['/static/mock/cover_family.png', '/static/mock/cover_portrait.png', '/static/mock/cover_travel.png'],
    user: { nickname: '周梦琪', avatar: '/static/mock/avatar5.png' }
  },
  {
    id: 6,
    userId: 6,
    certStatus: 2,
    styleTags: '毕业纪念,校园,青春',
    serviceCity: '南京',
    avgScore: 4.7,
    orderCount: 156,
    minPrice: 380,
    covers: ['/static/mock/cover_graduation.png', '/static/mock/cover_portrait.png', '/static/mock/cover_family.png'],
    user: { nickname: '王宇轩', avatar: '/static/mock/avatar6.png' }
  },
  {
    id: 7,
    userId: 7,
    certStatus: 2,
    styleTags: '活动会议,企业,演出',
    serviceCity: '深圳',
    avgScore: 4.5,
    orderCount: 263,
    minPrice: 600,
    covers: ['/static/mock/cover_event.png', '/static/mock/cover_commercial.png', '/static/mock/cover_product.png'],
    user: { nickname: '刘思远', avatar: '/static/mock/avatar7.png' }
  },
  {
    id: 8,
    userId: 8,
    certStatus: 0,
    styleTags: '产品拍摄,静物,电商',
    serviceCity: '武汉',
    avgScore: 4.8,
    orderCount: 189,
    minPrice: 350,
    covers: ['/static/mock/cover_product.png', '/static/mock/cover_commercial.png', '/static/mock/cover_event.png'],
    user: { nickname: '赵佳宁', avatar: '/static/mock/avatar8.png' }
  },
  {
    id: 9,
    userId: 9,
    certStatus: 2,
    styleTags: '人像写真,日系,复古',
    serviceCity: '西安',
    avgScore: 4.9,
    orderCount: 301,
    minPrice: 520,
    covers: ['/static/mock/cover_portrait.png', '/static/mock/cover_travel.png', '/static/mock/cover_graduation.png'],
    user: { nickname: '吴晴晴', avatar: '/static/mock/avatar9.png' }
  },
  {
    id: 10,
    userId: 10,
    certStatus: 2,
    styleTags: '婚礼跟拍,中式,唯美',
    serviceCity: '成都',
    avgScore: 4.7,
    orderCount: 134,
    minPrice: 1500,
    covers: ['/static/mock/cover_wedding.png', '/static/mock/cover_portrait.png', '/static/mock/cover_travel.png'],
    user: { nickname: '何子俊', avatar: '/static/mock/avatar10.png' }
  },
  {
    id: 11,
    userId: 11,
    certStatus: 0,
    styleTags: '旅拍,人文,纪实',
    serviceCity: '重庆',
    avgScore: 4.6,
    orderCount: 78,
    minPrice: 400,
    covers: ['/static/mock/cover_travel.png', '/static/mock/cover_event.png', '/static/mock/cover_family.png'],
    user: { nickname: '郑欣悦', avatar: '/static/mock/avatar11.png' }
  },
  {
    id: 12,
    userId: 12,
    certStatus: 2,
    styleTags: '商业广告,时尚,室内',
    serviceCity: '北京',
    avgScore: 4.8,
    orderCount: 224,
    minPrice: 900,
    covers: ['/static/mock/cover_commercial.png', '/static/mock/cover_product.png', '/static/mock/cover_portrait.png'],
    user: { nickname: '孟浩然', avatar: '/static/mock/avatar12.png' }
  }
]
// ────────────────────────────────────────────────────────────────────────────

onMounted(() => fetchList(true))

const fetchList = async (reset = false) => {
  if (loading.value) return
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: 15, orderBy: orderBy.value }
    if (keyword.value) params.keyword = keyword.value
    if (filterForm.category) params.category = filterForm.category
    if (filterForm.canVisit) params.canVisit = 1
    if (filterForm.canUrgent) params.canUrgent = 1
    const res = await getPhotographerListApi(params)
    let data = res?.data?.list || []
    // API 无数据时用本地 mock 兜底（仅第一页且未搜索/筛选时）
    if (data.length === 0 && reset && page.value === 1 && !keyword.value && !filterForm.category) {
      data = MOCK_LIST
    }
    if (reset) list.value = data
    else list.value.push(...data)
    if (data.length < 15) noMore.value = true
  } finally {
    loading.value = false
  }
}

let searchTimer: any = null
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    noMore.value = false
    fetchList(true)
  }, 500)
}

const sortBy = (field: string) => {
  orderBy.value = field
  page.value = 1
  noMore.value = false
  fetchList(true)
}

const loadMore = () => {
  if (!noMore.value) {
    page.value++
    fetchList()
  }
}

const resetFilter = () => {
  Object.assign(filterForm, { category: '', canVisit: false, canUrgent: false })
}
const applyFilter = () => {
  showFilter.value = false
  page.value = 1
  noMore.value = false
  fetchList(true)
}

const goDetail = (id: number) => uni.navigateTo({ url: `/pages/photographer/detail?id=${id}` })
const goChat = (p: any) => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.navigateTo({ url: '/pages/auth/login' })
    return
  }
  uni.navigateTo({ url: `/pages/chat/detail?userId=${p.userId}&name=${p.user?.nickname}` })
}
</script>

<style scoped lang="scss">
.list-page {
  min-height: 100vh;
  background: #f5f5f5;

  .search-header {
    background: #fff;
    padding: 16rpx 30rpx;
    .search-bar {
      background: #f5f5f5;
      border-radius: 36rpx;
      padding: 0 24rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      input {
        flex: 1;
        font-size: 28rpx;
      }
    }
  }

  .filter-row {
    background: #fff;
    display: flex;
    padding: 16rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    gap: 16rpx;

    .filter-btn {
      padding: 8rpx 24rpx;
      border-radius: 32rpx;
      font-size: 26rpx;
      color: #666;
      background: #f5f5f5;
      &.active {
        color: #ff6b35;
        background: rgba(255, 107, 53, 0.1);
      }
    }
  }

  .photographer-list {
    height: calc(100vh - 200rpx);

    .photographer-card {
      background: #fff;
      margin: 12rpx 16rpx;
      border-radius: 16rpx;
      overflow: hidden;

      .p-main {
        padding: 24rpx;
        display: flex;
        align-items: flex-start;
      }

      .p-covers {
        display: flex;
        gap: 4rpx;
        padding: 0 0 0 0;
        .p-cover-img {
          flex: 1;
          height: 150rpx;
        }
      }

      .p-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        margin-right: 20rpx;
        flex-shrink: 0;
      }

      .p-body {
        flex: 1;
        min-width: 0;

        .p-top {
          display: flex;
          align-items: center;
          gap: 12rpx;
          margin-bottom: 8rpx;
          .p-name {
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
          }
          .cert-badge text {
            font-size: 20rpx;
            color: #4caf50;
            background: rgba(76, 175, 80, 0.1);
            padding: 4rpx 12rpx;
            border-radius: 8rpx;
          }
        }

        .p-tags {
          display: block;
          font-size: 24rpx;
          color: #999;
          margin-bottom: 6rpx;
        }
        .p-city {
          display: block;
          font-size: 24rpx;
          color: #666;
          margin-bottom: 10rpx;
        }

        .p-stats {
          display: flex;
          gap: 16rpx;
          .p-score,
          .p-orders,
          .p-price {
            font-size: 22rpx;
            color: #ff6b35;
          }
        }
      }

      .p-actions {
        .contact-btn {
          background: #ff6b35;
          color: #fff;
          font-size: 24rpx;
          border-radius: 32rpx;
          padding: 0 24rpx;
          height: 60rpx;
          line-height: 60rpx;
          border: none;
          margin: 0;
        }
      }
    }

    .no-more,
    .loading {
      text-align: center;
      padding: 24rpx;
      color: #999;
      font-size: 26rpx;
    }
  }

  .filter-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;

    .filter-mask {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
    }

    .filter-panel {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 520rpx;
      background: #fff;
      overflow-y: auto;
      padding: 40rpx 30rpx;

      .filter-panel-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 32rpx;
      }

      .filter-section {
        margin-bottom: 32rpx;
        .filter-label {
          font-size: 28rpx;
          color: #666;
          display: block;
          margin-bottom: 16rpx;
        }
        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 16rpx;
        }
        .filter-option {
          padding: 10rpx 24rpx;
          border-radius: 32rpx;
          font-size: 26rpx;
          color: #666;
          border: 1rpx solid #e5e5e5;
          &.active {
            color: #ff6b35;
            border-color: #ff6b35;
            background: rgba(255, 107, 53, 0.05);
          }
        }
      }

      .filter-btns {
        display: flex;
        gap: 20rpx;
        margin-top: 40rpx;
        .reset-btn {
          flex: 1;
          height: 88rpx;
          border: 2rpx solid #e5e5e5;
          border-radius: 44rpx;
          font-size: 30rpx;
          background: #fff;
        }
        .confirm-btn {
          flex: 2;
          height: 88rpx;
          background: #ff6b35;
          color: #fff;
          border-radius: 44rpx;
          font-size: 30rpx;
          border: none;
        }
      }
    }
  }
}
</style>
