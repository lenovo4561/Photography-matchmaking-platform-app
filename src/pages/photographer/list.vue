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
            <text class="p-bio">{{ p.bio }}</text>
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
type PhotographerItem = {
  id: number
  userId: number
  certStatus: number
  category: string
  canVisit: boolean
  canUrgent: boolean
  styleTags: string
  serviceCity: string
  avgScore: number
  orderCount: number
  minPrice: number
  bio: string
  covers: string[]
  user: {
    nickname: string
    avatar: string
  }
}

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

// ── 演示数据（头像/封面全部使用远程图片，不占本地包体积）────────────────
const LOCAL_PHOTOGRAPHERS: PhotographerItem[] = [
  {
    id: 101,
    userId: 101,
    certStatus: 2,
    category: 'portrait',
    canVisit: true,
    canUrgent: true,
    styleTags: '人像写真 / 清新自然 / 氛围感',
    serviceCity: '杭州',
    avgScore: 4.9,
    orderCount: 286,
    minPrice: 699,
    bio: '擅长自然光人像与城市轻写真，适合生日照、情侣照和个人形象照。',
    covers: [
      'https://picsum.photos/seed/portrait1/400/260',
      'https://picsum.photos/seed/portrait2/400/260',
      'https://picsum.photos/seed/portrait3/400/260'
    ],
    user: { nickname: '林晓雨', avatar: 'https://i.pravatar.cc/240?img=47' }
  },
  {
    id: 102,
    userId: 102,
    certStatus: 2,
    category: 'wedding',
    canVisit: true,
    canUrgent: false,
    styleTags: '婚礼跟拍 / 纪实抓拍 / 仪式感',
    serviceCity: '上海',
    avgScore: 4.8,
    orderCount: 412,
    minPrice: 1699,
    bio: '专注婚礼全天跟拍，擅长捕捉新人与家人之间自然真实的情绪瞬间。',
    covers: [
      'https://picsum.photos/seed/wedding1/400/260',
      'https://picsum.photos/seed/wedding2/400/260',
      'https://picsum.photos/seed/wedding3/400/260'
    ],
    user: { nickname: '张明远', avatar: 'https://i.pravatar.cc/240?img=11' }
  },
  {
    id: 103,
    userId: 103,
    certStatus: 2,
    category: 'commercial',
    canVisit: true,
    canUrgent: true,
    styleTags: '商业广告 / 产品静物 / 品牌视觉',
    serviceCity: '深圳',
    avgScore: 4.9,
    orderCount: 198,
    minPrice: 1200,
    bio: '服务品牌宣传、电商产品和门店视觉升级，画面干净利落，交付稳定。',
    covers: [
      'https://picsum.photos/seed/commercial1/400/260',
      'https://picsum.photos/seed/commercial2/400/260',
      'https://picsum.photos/seed/commercial3/400/260'
    ],
    user: { nickname: '陈志豪', avatar: 'https://i.pravatar.cc/240?img=12' }
  },
  {
    id: 104,
    userId: 104,
    certStatus: 2,
    category: 'family',
    canVisit: true,
    canUrgent: false,
    styleTags: '亲子家庭 / 温馨纪实 / 成长记录',
    serviceCity: '成都',
    avgScore: 4.8,
    orderCount: 305,
    minPrice: 888,
    bio: '偏爱真实互动与轻引导拍摄，让家庭照片保留陪伴感与生活温度。',
    covers: [
      'https://picsum.photos/seed/family1/400/260',
      'https://picsum.photos/seed/family2/400/260',
      'https://picsum.photos/seed/family3/400/260'
    ],
    user: { nickname: '苏沐阳', avatar: 'https://i.pravatar.cc/240?img=48' }
  },
  {
    id: 105,
    userId: 105,
    certStatus: 2,
    category: 'graduation',
    canVisit: false,
    canUrgent: true,
    styleTags: '毕业纪念 / 校园写真 / 青春感',
    serviceCity: '武汉',
    avgScore: 4.7,
    orderCount: 154,
    minPrice: 520,
    bio: '熟悉校园取景和毕业季氛围营造，适合宿舍、操场、图书馆等场景拍摄。',
    covers: [
      'https://picsum.photos/seed/grad1/400/260',
      'https://picsum.photos/seed/grad2/400/260',
      'https://picsum.photos/seed/grad3/400/260'
    ],
    user: { nickname: '周梦琪', avatar: 'https://i.pravatar.cc/240?img=44' }
  },
  {
    id: 106,
    userId: 106,
    certStatus: 2,
    category: 'travel',
    canVisit: true,
    canUrgent: true,
    styleTags: '旅拍 / 风光纪实 / 松弛氛围',
    serviceCity: '大理',
    avgScore: 5.0,
    orderCount: 267,
    minPrice: 999,
    bio: '擅长旅行轻写真与目的地旅拍，帮助用户拍出松弛自然的在地感大片。',
    covers: [
      'https://picsum.photos/seed/travel1/400/260',
      'https://picsum.photos/seed/travel2/400/260',
      'https://picsum.photos/seed/travel3/400/260'
    ],
    user: { nickname: '何子俊', avatar: 'https://i.pravatar.cc/240?img=15' }
  }
]

onMounted(() => fetchList(true))

const fetchList = (reset = false) => {
  if (loading.value) return
  loading.value = true
  let data = [...LOCAL_PHOTOGRAPHERS]
  // 支持关键字搜索
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    data = data.filter(
      p =>
        p.user?.nickname?.toLowerCase().includes(kw) ||
        p.styleTags?.toLowerCase().includes(kw) ||
        p.serviceCity?.toLowerCase().includes(kw) ||
        p.bio?.toLowerCase().includes(kw)
    )
  }
  // 支持分类筛选
  if (filterForm.category) {
    data = data.filter(p => p.category === filterForm.category)
  }
  if (filterForm.canVisit) data = data.filter(p => p.canVisit)
  if (filterForm.canUrgent) data = data.filter(p => p.canUrgent)
  // 支持排序
  if (orderBy.value === 'score') data.sort((a, b) => b.avgScore - a.avgScore)
  else if (orderBy.value === 'orderCount') data.sort((a, b) => b.orderCount - a.orderCount)
  else if (orderBy.value === 'price') data.sort((a, b) => a.minPrice - b.minPrice)
  list.value = data
  noMore.value = true
  loading.value = false
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
          margin-bottom: 8rpx;
        }

        .p-bio {
          display: block;
          font-size: 23rpx;
          color: #888;
          line-height: 1.5;
          margin-bottom: 12rpx;
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
