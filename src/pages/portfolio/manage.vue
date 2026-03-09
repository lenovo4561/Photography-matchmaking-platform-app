<route lang="json5">
{
  style: {
    navigationBarTitleText: '作品集管理',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="manage-page">
    <view class="header-actions">
      <button class="add-btn" @click="goCreate">+ 新建作品集</button>
    </view>

    <scroll-view scroll-y class="portfolio-list">
      <view v-for="p in portfolios" :key="p.id" class="portfolio-card">
        <image :src="p.coverImage || '/static/default-cover.png'" mode="aspectFill" class="p-cover" />
        <view class="p-info">
          <text class="p-title">{{ p.title }}</text>
          <text class="p-category">{{ p.category }}</text>
          <view class="p-meta">
            <text class="p-type" :class="p.accessType">
              {{ { public: '公开', paid: '付费', private: '私密' }[p.accessType] }}
            </text>
            <text class="p-status" :class="`audit-${p.auditStatus}`">
              {{ { 0: '审核中', 1: '已通过', 2: '已拒绝' }[p.auditStatus] }}
            </text>
            <text class="p-likes">❤ {{ p.likeCount }}</text>
          </view>
        </view>
        <view class="p-actions">
          <text class="action-btn" @click="editPortfolio(p.id)">编辑</text>
          <text class="action-btn delete" @click="deletePortfolio(p)">删除</text>
        </view>
      </view>

      <view class="empty" v-if="portfolios.length === 0">
        <text>暂无作品集</text>
        <button class="create-first-btn" @click="goCreate">创建第一个作品集</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { getPortfolioListApi, deletePortfolioApi } from '@/api/photoApi'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const portfolios = ref<any[]>([])

onMounted(() => fetchPortfolios())

const fetchPortfolios = async () => {
  try {
    const res = await getPortfolioListApi({ myOwn: 1 })
    portfolios.value = res?.data?.list || []
  } catch {}
}

const goCreate = () => uni.navigateTo({ url: '/pages/portfolio/create' })
const editPortfolio = (id: number) => uni.navigateTo({ url: `/pages/portfolio/create?id=${id}` })

const deletePortfolio = (p: any) => {
  uni.showModal({
    title: '确认删除',
    content: `确定删除作品集《${p.title}》？`,
    async success(res) {
      if (res.confirm) {
        await deletePortfolioApi(p.id)
        portfolios.value = portfolios.value.filter((item: any) => item.id !== p.id)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.manage-page {
  min-height: 100vh;
  background: #f5f5f5;

  .header-actions {
    padding: 20rpx 30rpx;
    background: #fff;
    border-bottom: 1rpx solid #f0f0f0;
  }
  .add-btn {
    height: 80rpx;
    background: #ff6b35;
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
  }

  .portfolio-list {
    height: calc(100vh - 100rpx);

    .portfolio-card {
      background: #fff;
      margin: 16rpx;
      border-radius: 16rpx;
      display: flex;
      overflow: hidden;

      .p-cover {
        width: 180rpx;
        height: 160rpx;
        flex-shrink: 0;
      }
      .p-info {
        flex: 1;
        padding: 16rpx;
      }
      .p-title {
        display: block;
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 6rpx;
      }
      .p-category {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-bottom: 10rpx;
      }
      .p-meta {
        display: flex;
        gap: 12rpx;
      }
      .p-type {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        &.public {
          color: #4caf50;
          background: rgba(76, 175, 80, 0.1);
        }
        &.paid {
          color: #ff9800;
          background: rgba(255, 152, 0, 0.1);
        }
        &.private {
          color: #9e9e9e;
          background: rgba(158, 158, 158, 0.1);
        }
      }
      .p-status {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        &.audit-0 {
          color: #2196f3;
          background: rgba(33, 150, 243, 0.1);
        }
        &.audit-1 {
          color: #4caf50;
          background: rgba(76, 175, 80, 0.1);
        }
        &.audit-2 {
          color: #f44336;
          background: rgba(244, 67, 54, 0.1);
        }
      }
      .p-likes {
        font-size: 22rpx;
        color: #999;
      }

      .p-actions {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 16rpx;
        gap: 12rpx;
      }
      .action-btn {
        font-size: 24rpx;
        color: #ff6b35;
        padding: 8rpx 16rpx;
        border: 1rpx solid #ff6b35;
        border-radius: 20rpx;
        text-align: center;
        &.delete {
          color: #f44336;
          border-color: #f44336;
        }
      }
    }

    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 120rpx 40rpx;
      text {
        font-size: 28rpx;
        color: #999;
        margin-bottom: 32rpx;
      }
    }
    .create-first-btn {
      background: #ff6b35;
      color: #fff;
      border-radius: 44rpx;
      font-size: 28rpx;
      padding: 0 48rpx;
      height: 80rpx;
      border: none;
    }
  }
}
</style>
