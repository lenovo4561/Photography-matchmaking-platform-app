<route lang="json5">
{
  style: {
    navigationBarTitleText: '热门套餐',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="package-page">
    <!-- 顶部筛选 -->
    <view class="filter-section">
      <!-- 分类标签 -->
      <scroll-view scroll-x class="category-tabs">
        <view
          v-for="tab in categoryTabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: activeCategory === tab.value }"
          @click="switchCategory(tab.value)"
        >
          <text class="tab-icon">{{ tab.icon }}</text>
          <text class="tab-text">{{ tab.label }}</text>
        </view>
      </scroll-view>

      <!-- 价格/排序筛选 -->
      <view class="sort-bar">
        <view
          v-for="s in sortOptions"
          :key="s.value"
          class="sort-item"
          :class="{ active: activeSort === s.value }"
          @click="switchSort(s.value)"
        >
          {{ s.label }}
          <text v-if="s.hasArrow" class="arrow">{{ activeSortDir === 'asc' ? '↑' : '↓' }}</text>
        </view>
        <view class="filter-btn" @click="showPriceFilter = true">筛选 ▾</view>
      </view>
    </view>

    <!-- 套餐列表 -->
    <scroll-view scroll-y class="package-list">
      <!-- 精选推荐 Banner -->
      <view class="recommend-banner">
        <view class="banner-tag">🔥 限时特惠</view>
        <text class="banner-title">新人首单立减 ¥100</text>
        <text class="banner-sub">满500可用 · 仅限首单</text>
      </view>

      <!-- 套餐卡片 -->
      <view class="package-card" v-for="pkg in filteredPackages" :key="pkg.id" @click="goPackageDetail(pkg)">
        <!-- 封面图 -->
        <view class="card-cover">
          <image :src="pkg.coverImage" mode="aspectFill" class="cover-img" />
          <view class="cover-tags">
            <text class="badge hot" v-if="pkg.isHot">🔥 热门</text>
            <text class="badge new" v-if="pkg.isNew">✨ 新品</text>
            <text class="badge discount" v-if="pkg.discountRate">{{ pkg.discountRate }}折</text>
          </view>
          <view class="cover-duration">{{ pkg.duration }}</view>
        </view>

        <!-- 套餐信息 -->
        <view class="card-body">
          <text class="pkg-title">{{ pkg.title }}</text>
          <text class="pkg-desc">{{ pkg.description }}</text>

          <!-- 套餐亮点 -->
          <view class="highlights">
            <text class="highlight-item" v-for="h in pkg.highlights" :key="h">✓ {{ h }}</text>
          </view>

          <!-- 摄影师信息 -->
          <view class="photographer-bar">
            <image :src="pkg.photographer.avatar" mode="aspectFill" class="pg-avatar" />
            <view class="pg-info">
              <text class="pg-name">{{ pkg.photographer.name }}</text>
              <text class="pg-level">{{ pkg.photographer.level }}</text>
            </view>
            <view class="pg-score">
              <text class="score-star">⭐</text>
              <text class="score-num">{{ pkg.photographer.score }}</text>
              <text class="order-count">{{ pkg.photographer.orders }}单</text>
            </view>
          </view>

          <!-- 价格和操作 -->
          <view class="card-footer">
            <view class="price-block">
              <text class="price-cur">¥{{ pkg.price }}</text>
              <text class="price-ori" v-if="pkg.originalPrice">¥{{ pkg.originalPrice }}</text>
              <text class="price-sales">{{ pkg.saleCount }}人已购</text>
            </view>
            <button class="btn-book" @click.stop="goBook(pkg)">立即预约</button>
          </view>
        </view>
      </view>

      <!-- 没有更多 -->
      <view class="no-more" v-if="filteredPackages.length > 0">
        <text>— 已显示全部套餐 —</text>
      </view>
      <view class="empty" v-if="filteredPackages.length === 0">
        <text class="empty-icon">📷</text>
        <text class="empty-text">暂无相关套餐</text>
      </view>
    </scroll-view>

    <!-- 价格区间筛选弹出层 -->
    <view class="price-mask" v-if="showPriceFilter" @click="showPriceFilter = false">
      <view class="price-panel" @click.stop>
        <text class="panel-title">价格区间</text>
        <view class="price-options">
          <view
            class="price-option"
            v-for="opt in priceOptions"
            :key="opt.value"
            :class="{ active: activePriceRange === opt.value }"
            @click="selectPrice(opt.value)"
          >
            {{ opt.label }}
          </view>
        </view>
        <button class="btn-confirm" @click="confirmFilter">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const activeCategory = ref('all')
const activeSort = ref('recommend')
const activeSortDir = ref<'asc' | 'desc'>('desc')
const showPriceFilter = ref(false)
const activePriceRange = ref('all')

const categoryTabs = [
  { value: 'all', icon: '🌟', label: '全部' },
  { value: 'portrait', icon: '🧍', label: '个人写真' },
  { value: 'wedding', icon: '💒', label: '婚礼跟拍' },
  { value: 'commercial', icon: '🏢', label: '商业拍摄' },
  { value: 'family', icon: '👨‍👩‍👧', label: '亲子家庭' },
  { value: 'graduation', icon: '🎓', label: '毕业照' },
  { value: 'travel', icon: '✈️', label: '旅拍' },
  { value: 'event', icon: '🎪', label: '活动会议' },
  { value: 'product', icon: '📦', label: '产品拍摄' }
]

const sortOptions = [
  { value: 'recommend', label: '推荐', hasArrow: false },
  { value: 'sales', label: '销量', hasArrow: true },
  { value: 'price', label: '价格', hasArrow: true },
  { value: 'score', label: '评分', hasArrow: true }
]

const priceOptions = [
  { value: 'all', label: '不限' },
  { value: '0-500', label: '500元以下' },
  { value: '500-1000', label: '500-1000元' },
  { value: '1000-2000', label: '1000-2000元' },
  { value: '2000-5000', label: '2000-5000元' },
  { value: '5000+', label: '5000元以上' }
]

// 测试数据
const packages = ref([
  {
    id: 1,
    category: 'portrait',
    title: '日系胶片写真套餐',
    description: '精选日系胶片风格，城市取景+室内棚拍两场景，专业灯光+后期精修',
    highlights: ['2小时拍摄', '精修30张', '2套服装', '含妆造'],
    coverImage: 'https://picsum.photos/seed/portrait/400/260',
    price: 688,
    originalPrice: 888,
    discountRate: '7',
    duration: '2h',
    saleCount: 342,
    isHot: true,
    isNew: false,
    photographer: {
      name: '林晓雨',
      avatar: 'https://i.pravatar.cc/240?img=47',
      level: '金牌摄影师',
      score: 4.9,
      orders: 842
    }
  },
  {
    id: 2,
    category: 'wedding',
    title: '婚礼全程跟拍套餐',
    description: '婚礼全天候跟拍，双机位拍摄，精修500张，制作相册一本，永久云存储',
    highlights: ['全天跟拍8h', '双机位', '精修500张', '赠精装相册'],
    coverImage: 'https://picsum.photos/seed/wedding/400/260',
    price: 3888,
    originalPrice: 5800,
    discountRate: '6',
    duration: '8h',
    saleCount: 156,
    isHot: true,
    isNew: false,
    photographer: {
      name: '周浩',
      avatar: 'https://i.pravatar.cc/240?img=473',
      level: '铂金摄影师',
      score: 5.0,
      orders: 623
    }
  },
  {
    id: 3,
    category: 'portrait',
    title: '清新户外写真套餐',
    description: '城市公园取景，清新自然风格，胶片质感后期，适合25岁以下年轻女性',
    highlights: ['3小时拍摄', '精修50张', '不限服装', '2个取景地'],
    coverImage: 'https://picsum.photos/seed/portrait/400/260',
    price: 398,
    originalPrice: 598,
    discountRate: '6',
    duration: '3h',
    saleCount: 687,
    isHot: false,
    isNew: true,
    photographer: {
      name: '陈思远',
      avatar: 'https://i.pravatar.cc/240?img=11',
      level: '银牌摄影师',
      score: 4.7,
      orders: 389
    }
  },
  {
    id: 4,
    category: 'commercial',
    title: '企业团队形象拍摄',
    description: '适合10-50人团队，企业文化照+个人形象照，提供专业布景，当天出样片',
    highlights: ['半天拍摄4h', '个人10张精修', '团队合照5张', '含简单化妆'],
    coverImage: 'https://picsum.photos/seed/commercial/400/260',
    price: 2980,
    originalPrice: 3980,
    discountRate: '7',
    duration: '4h',
    saleCount: 98,
    isHot: false,
    isNew: false,
    photographer: {
      name: '魏大勇',
      avatar: 'https://i.pravatar.cc/240?img=115',
      level: '商业摄影师',
      score: 4.8,
      orders: 267
    }
  },
  {
    id: 5,
    category: 'family',
    title: '全家福&亲子写真套餐',
    description: '儿童专属场景布置，互动式拍摄，让孩子开心玩耍中留下珍贵回忆',
    highlights: ['2小时拍摄', '精修40张', '儿童道具', '含宝宝造型'],
    coverImage: 'https://picsum.photos/seed/family/400/260',
    price: 1280,
    originalPrice: 1680,
    discountRate: '7',
    duration: '2h',
    saleCount: 445,
    isHot: true,
    isNew: false,
    photographer: {
      name: '钟晓燕',
      avatar: 'https://i.pravatar.cc/240?img=127',
      level: '金牌摄影师',
      score: 4.9,
      orders: 534
    }
  },
  {
    id: 6,
    category: 'graduation',
    title: '毕业季写真套餐',
    description: '校园青春纪念，学士服+汉服双LOOK，记录最美毕业季',
    highlights: ['3小时拍摄', '精修40张', '2套服装换装', '含学士帽道具'],
    coverImage: 'https://picsum.photos/seed/graduation/400/260',
    price: 588,
    originalPrice: 788,
    discountRate: '7',
    duration: '3h',
    saleCount: 823,
    isHot: true,
    isNew: false,
    photographer: {
      name: '刘子骏',
      avatar: 'https://i.pravatar.cc/240?img=441',
      level: '银牌摄影师',
      score: 4.8,
      orders: 477
    }
  },
  {
    id: 7,
    category: 'travel',
    title: '云南旅拍套餐（2天1夜）',
    description: '大理、洱海、古城经典打卡地，摄影师随行拍摄，让你专注享受旅行',
    highlights: ['2天随行拍摄', '精修100张', '3个经典取景地', '含接送服务'],
    coverImage: 'https://picsum.photos/seed/travel/400/260',
    price: 2580,
    originalPrice: 3200,
    discountRate: '8',
    duration: '2天',
    saleCount: 234,
    isHot: true,
    isNew: false,
    photographer: {
      name: '白志远',
      avatar: 'https://i.pravatar.cc/240?img=47',
      level: '旅拍专家',
      score: 4.9,
      orders: 312
    }
  },
  {
    id: 8,
    category: 'product',
    title: '电商产品精拍套餐（20件）',
    description: '白底主图+场景图拍摄，支持多种产品类型，1-3个工作日交付，含基础修图',
    highlights: ['20件产品拍摄', '每件5-8张视角', '白底+场景各一', '含基础精修'],
    coverImage: 'https://picsum.photos/seed/product/400/260',
    price: 1980,
    originalPrice: 2600,
    discountRate: '7',
    duration: '1天',
    saleCount: 389,
    isHot: false,
    isNew: true,
    photographer: {
      name: '柴静',
      avatar: 'https://i.pravatar.cc/240?img=115',
      level: '商业摄影师',
      score: 4.7,
      orders: 556
    }
  },
  {
    id: 9,
    category: 'event',
    title: '企业年会活动跟拍套餐',
    description: '年会全程记录，舞台表演+互动环节+颁奖仪式，专业摄影+摄像双机位',
    highlights: ['全场活动跟拍', '含摄像剪辑5min', '精修200张', '当晚出精选100张'],
    coverImage: 'https://picsum.photos/seed/event/400/260',
    price: 4800,
    originalPrice: 6000,
    discountRate: '8',
    duration: '一整天',
    saleCount: 67,
    isHot: false,
    isNew: false,
    photographer: {
      name: '黄海冰',
      avatar: 'https://i.pravatar.cc/240?img=473',
      level: '商业摄影师',
      score: 4.8,
      orders: 189
    }
  },
  {
    id: 10,
    category: 'portrait',
    title: '高端棚拍写真套餐',
    description: '专业影棚多套背景随意选，配备专业灯光组，多种风格：商务/艺术/时尚',
    highlights: ['3小时棚拍', '精修60张', '5套灯光方案', '专业妆造'],
    coverImage: 'https://picsum.photos/seed/portrait/400/260',
    price: 1288,
    originalPrice: 1888,
    discountRate: '6',
    duration: '3h',
    saleCount: 267,
    isHot: false,
    isNew: true,
    photographer: {
      name: '李浩然',
      avatar: 'https://i.pravatar.cc/240?img=44',
      level: '金牌摄影师',
      score: 4.9,
      orders: 712
    }
  }
])

const filteredPackages = computed(() => {
  let list = packages.value

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    list = list.filter(p => p.category === activeCategory.value)
  }

  // 按价格区间筛选
  if (activePriceRange.value !== 'all') {
    const [min, max] = activePriceRange.value.split('-').map(v => (v === '5000+' ? 999999 : parseInt(v)))
    if (activePriceRange.value === '5000+') {
      list = list.filter(p => p.price >= 5000)
    } else {
      list = list.filter(p => p.price >= min && p.price < max)
    }
  }

  // 按排序
  return [...list].sort((a, b) => {
    const dir = activeSortDir.value === 'asc' ? 1 : -1
    if (activeSort.value === 'sales') return (b.saleCount - a.saleCount) * dir
    if (activeSort.value === 'price') return (a.price - b.price) * dir
    if (activeSort.value === 'score') return (b.photographer.score - a.photographer.score) * dir
    // recommend: hot first
    if (b.isHot !== a.isHot) return b.isHot ? 1 : -1
    return b.saleCount - a.saleCount
  })
})

const switchCategory = (val: string) => {
  activeCategory.value = val
}

const switchSort = (val: string) => {
  if (activeSort.value === val && val !== 'recommend') {
    activeSortDir.value = activeSortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    activeSort.value = val
    activeSortDir.value = 'desc'
  }
}

const selectPrice = (val: string) => {
  activePriceRange.value = val
}

const confirmFilter = () => {
  showPriceFilter.value = false
}

const goPackageDetail = (pkg: any) => {
  uni.navigateTo({ url: `/pages/photographer/detail?id=${pkg.photographer.orders}` })
}

const goBook = (pkg: any) => {
  uni.showToast({ title: '预约成功！摄影师将联系您', icon: 'success', duration: 2000 })
}
</script>

<style scoped lang="scss">
.package-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;

  .filter-section {
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 100;

    .category-tabs {
      white-space: nowrap;
      padding: 16rpx 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      .tab-item {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        padding: 10rpx 24rpx 16rpx;
        border-bottom: 4rpx solid transparent;

        .tab-icon {
          font-size: 36rpx;
          margin-bottom: 6rpx;
        }
        .tab-text {
          font-size: 22rpx;
          color: #666;
        }

        &.active {
          border-bottom-color: #ff6b35;
          .tab-text {
            color: #ff6b35;
            font-weight: bold;
          }
        }
      }
    }

    .sort-bar {
      display: flex;
      align-items: center;
      padding: 16rpx 30rpx;

      .sort-item {
        flex: 1;
        text-align: center;
        font-size: 26rpx;
        color: #666;
        padding: 10rpx 0;

        &.active {
          color: #ff6b35;
          font-weight: bold;
        }
        .arrow {
          margin-left: 4rpx;
          font-size: 22rpx;
        }
      }

      .filter-btn {
        font-size: 26rpx;
        color: #333;
        padding: 10rpx 20rpx;
        border: 1rpx solid #ddd;
        border-radius: 30rpx;
      }
    }
  }

  .package-list {
    flex: 1;
    padding: 20rpx 24rpx;

    .recommend-banner {
      background: linear-gradient(135deg, #ff6b35, #ff8c5a);
      border-radius: 20rpx;
      padding: 30rpx 36rpx;
      margin-bottom: 24rpx;
      position: relative;
      overflow: hidden;

      &::after {
        content: '🎁';
        position: absolute;
        right: 30rpx;
        top: 50%;
        transform: translateY(-50%);
        font-size: 80rpx;
        opacity: 0.3;
      }

      .banner-tag {
        display: inline-block;
        background: rgba(255, 255, 255, 0.25);
        color: #fff;
        font-size: 22rpx;
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        margin-bottom: 12rpx;
      }
      .banner-title {
        display: block;
        color: #fff;
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 8rpx;
      }
      .banner-sub {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .package-card {
      background: #fff;
      border-radius: 20rpx;
      overflow: hidden;
      margin-bottom: 24rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

      .card-cover {
        position: relative;
        .cover-img {
          width: 100%;
          height: 360rpx;
        }
        .cover-tags {
          position: absolute;
          top: 20rpx;
          left: 20rpx;
          display: flex;
          gap: 10rpx;

          .badge {
            padding: 6rpx 16rpx;
            border-radius: 20rpx;
            font-size: 22rpx;
            &.hot {
              background: rgba(255, 60, 60, 0.85);
              color: #fff;
            }
            &.new {
              background: rgba(80, 180, 255, 0.85);
              color: #fff;
            }
            &.discount {
              background: rgba(255, 140, 0, 0.9);
              color: #fff;
            }
          }
        }
        .cover-duration {
          position: absolute;
          right: 20rpx;
          bottom: 20rpx;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          font-size: 24rpx;
          padding: 6rpx 18rpx;
          border-radius: 20rpx;
        }
      }

      .card-body {
        padding: 28rpx;

        .pkg-title {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          display: block;
          margin-bottom: 10rpx;
        }
        .pkg-desc {
          font-size: 26rpx;
          color: #999;
          display: block;
          margin-bottom: 20rpx;
          line-height: 1.6;
        }

        .highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 12rpx;
          margin-bottom: 24rpx;

          .highlight-item {
            font-size: 22rpx;
            color: #ff6b35;
            background: #fff5f0;
            padding: 6rpx 16rpx;
            border-radius: 20rpx;
          }
        }

        .photographer-bar {
          display: flex;
          align-items: center;
          gap: 16rpx;
          padding: 20rpx;
          background: #f9f9f9;
          border-radius: 16rpx;
          margin-bottom: 24rpx;

          .pg-avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 40rpx;
            flex-shrink: 0;
          }
          .pg-info {
            flex: 1;
            .pg-name {
              display: block;
              font-size: 28rpx;
              font-weight: bold;
              color: #333;
            }
            .pg-level {
              font-size: 22rpx;
              color: #ff8c35;
            }
          }
          .pg-score {
            display: flex;
            align-items: center;
            gap: 4rpx;
            .score-star {
              font-size: 24rpx;
            }
            .score-num {
              font-size: 28rpx;
              color: #ff6b35;
              font-weight: bold;
            }
            .order-count {
              font-size: 22rpx;
              color: #999;
              margin-left: 8rpx;
            }
          }
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .price-block {
            .price-cur {
              font-size: 44rpx;
              font-weight: bold;
              color: #ff4444;
              margin-right: 10rpx;
            }
            .price-ori {
              font-size: 26rpx;
              color: #ccc;
              text-decoration: line-through;
              margin-right: 10rpx;
            }
            .price-sales {
              font-size: 22rpx;
              color: #999;
              display: block;
              margin-top: 4rpx;
            }
          }

          .btn-book {
            width: 200rpx;
            height: 80rpx;
            background: linear-gradient(135deg, #ff6b35, #ff8c5a);
            color: #fff;
            border-radius: 40rpx;
            border: none;
            font-size: 28rpx;
            font-weight: bold;
            flex-shrink: 0;
          }
        }
      }
    }

    .no-more {
      text-align: center;
      padding: 30rpx;
      color: #ccc;
      font-size: 24rpx;
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 100rpx 0;

      .empty-icon {
        font-size: 120rpx;
        margin-bottom: 20rpx;
      }
      .empty-text {
        font-size: 28rpx;
        color: #ccc;
      }
    }
  }

  .price-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    .price-panel {
      background: #fff;
      border-radius: 32rpx 32rpx 0 0;
      padding: 40rpx 30rpx 60rpx;

      .panel-title {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        text-align: center;
        margin-bottom: 30rpx;
      }

      .price-options {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        margin-bottom: 40rpx;

        .price-option {
          padding: 14rpx 30rpx;
          border: 1rpx solid #ddd;
          border-radius: 30rpx;
          font-size: 26rpx;
          color: #666;

          &.active {
            border-color: #ff6b35;
            color: #ff6b35;
            background: #fff5f0;
          }
        }
      }

      .btn-confirm {
        width: 100%;
        height: 96rpx;
        background: linear-gradient(135deg, #ff6b35, #ff8c5a);
        color: #fff;
        border-radius: 48rpx;
        border: none;
        font-size: 32rpx;
        font-weight: bold;
      }
    }
  }
}
</style>
