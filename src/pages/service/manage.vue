<route lang="json5">
{
  style: {
    navigationBarTitleText: '服务套餐',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="service-manage-page">
    <view class="header-actions">
      <button class="add-btn" @click="goCreate">+ 新建套餐</button>
    </view>

    <scroll-view scroll-y class="service-list">
      <view v-for="s in services" :key="s.id" class="service-card">
        <view class="service-info">
          <view class="service-header">
            <text class="service-title">{{ s.title }}</text>
            <text class="service-price">¥{{ s.price }}/{{ priceTypeMap[s.priceType] }}</text>
          </view>
          <text class="service-desc">{{ s.description }}</text>
          <text class="service-category">{{ s.category }}</text>
          <view class="service-status">
            <text class="status-badge" :class="s.status === 1 ? 'online' : 'offline'">
              {{ s.status === 1 ? '上架中' : '已下架' }}
            </text>
          </view>
        </view>
        <view class="service-actions">
          <text class="action-btn" @click="editService(s.id)">编辑</text>
          <text
            class="action-btn"
            :class="s.status === 1 ? 'offline-action' : 'online-action'"
            @click="toggleStatus(s)"
          >
            {{ s.status === 1 ? '下架' : '上架' }}
          </text>
        </view>
      </view>

      <view class="empty" v-if="services.length === 0">
        <text>暂无套餐</text>
        <button class="create-btn" @click="goCreate">创建套餐</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { getServiceListApi, updateServiceApi } from '@/api/photoApi'

const services = ref<any[]>([])
const priceTypeMap: any = { fixed: '次', hourly: '小时', per_shot: '张', daily: '天' }

onMounted(fetchServices)

async function fetchServices() {
  const res = await getServiceListApi({ myOwn: 1 })
  services.value = res?.data?.list || []
}

const goCreate = () => uni.navigateTo({ url: '/pages/service/create' })
const editService = (id: number) => uni.navigateTo({ url: `/pages/service/create?id=${id}` })
const toggleStatus = async (s: any) => {
  const newStatus = s.status === 1 ? 0 : 1
  await updateServiceApi(s.id, { status: newStatus })
  s.status = newStatus
}
</script>

<style scoped lang="scss">
.service-manage-page {
  min-height: 100vh;
  background: #f5f5f5;

  .header-actions {
    padding: 20rpx 30rpx;
    background: #fff;
  }
  .add-btn {
    background: #ff6b35;
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;
    height: 80rpx;
    border: none;
  }

  .service-list {
    height: calc(100vh - 100rpx);

    .service-card {
      background: #fff;
      margin: 16rpx;
      border-radius: 16rpx;
      padding: 24rpx;
      display: flex;

      .service-info {
        flex: 1;
      }
      .service-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8rpx;
      }
      .service-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
      .service-price {
        font-size: 30rpx;
        color: #ff4444;
        font-weight: bold;
      }
      .service-desc {
        display: block;
        font-size: 26rpx;
        color: #666;
        margin-bottom: 8rpx;
      }
      .service-category {
        display: block;
        font-size: 22rpx;
        color: #999;
        margin-bottom: 12rpx;
      }
      .status-badge {
        font-size: 22rpx;
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        &.online {
          color: #4caf50;
          background: rgba(76, 175, 80, 0.1);
        }
        &.offline {
          color: #999;
          background: #f5f5f5;
        }
      }

      .service-actions {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 12rpx;
        padding-left: 16rpx;
      }
      .action-btn {
        font-size: 24rpx;
        color: #ff6b35;
        padding: 8rpx 16rpx;
        border: 1rpx solid #ff6b35;
        border-radius: 20rpx;
        text-align: center;
        &.offline-action {
          color: #999;
          border-color: #999;
        }
        &.online-action {
          color: #4caf50;
          border-color: #4caf50;
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
        margin-bottom: 40rpx;
      }
    }
    .create-btn {
      background: #ff6b35;
      color: #fff;
      border-radius: 44rpx;
      font-size: 28rpx;
      height: 80rpx;
      border: none;
      padding: 0 48rpx;
    }
  }
}
</style>
