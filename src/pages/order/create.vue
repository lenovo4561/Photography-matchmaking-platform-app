<route lang="json5">
{
  style: {
    navigationBarTitleText: '确认下单',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="create-order-page">
    <view v-if="service && photographer">
      <!-- 摄影师信息 -->
      <view class="section">
        <text class="section-title">摄影师</text>
        <view class="photographer-row">
          <image :src="photographer.user?.avatar || '/static/default-avatar.png'" mode="aspectFill" class="p-avatar" />
          <view class="p-info">
            <text class="p-name">{{ photographer.user?.nickname }}</text>
            <text class="p-city">📍 {{ photographer.serviceCity }}</text>
          </view>
        </view>
      </view>

      <!-- 套餐信息 -->
      <view class="section">
        <text class="section-title">服务套餐</text>
        <view class="service-info">
          <text class="service-title">{{ service.title }}</text>
          <text class="service-desc">{{ service.description }}</text>
          <text class="service-price">
            ¥{{ service.price }} / {{ { fixed: '次', hourly: '小时', per_shot: '张', daily: '天' }[service.priceType] }}
          </text>
        </view>
      </view>

      <!-- 拍摄信息 -->
      <view class="section">
        <text class="section-title">拍摄信息</text>

        <view class="form-item">
          <text class="form-label">拍摄日期</text>
          <picker mode="date" :value="form.shootDate" @change="(e: any) => (form.shootDate = e.detail.value)">
            <view class="picker-value">{{ form.shootDate || '请选择日期' }}</view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">拍摄地点</text>
          <input v-model="form.shootLocation" placeholder="请输入拍摄地点" class="form-input" />
        </view>

        <view class="form-item">
          <text class="form-label">备注要求</text>
          <textarea v-model="form.remark" placeholder="请描述您的需求（风格、场景等）" class="form-textarea" />
        </view>
      </view>

      <!-- 加购项目 -->
      <view class="section" v-if="service.addons?.length">
        <text class="section-title">加购项目（可选）</text>
        <view class="addon-list">
          <view
            v-for="addon in service.addons"
            :key="addon.name"
            class="addon-item"
            :class="{ selected: selectedAddons.includes(addon.name) }"
            @click="toggleAddon(addon)"
          >
            <text class="addon-name">{{ addon.name }}</text>
            <text class="addon-price">+¥{{ addon.price }}</text>
          </view>
        </view>
      </view>

      <!-- 费用汇总 -->
      <view class="section">
        <text class="section-title">费用汇总</text>
        <view class="price-row">
          <text>套餐费用</text>
          <text>¥{{ service.price }}</text>
        </view>
        <view class="price-row" v-for="addon in addedAddons" :key="addon.name">
          <text>{{ addon.name }}</text>
          <text>+¥{{ addon.price }}</text>
        </view>
        <view class="price-row total">
          <text class="total-label">合计</text>
          <text class="total-price">¥{{ totalAmount }}</text>
        </view>
      </view>
    </view>

    <!-- 底部确认 -->
    <view class="bottom-bar">
      <view class="total-info">
        <text class="bottom-price">¥{{ totalAmount }}</text>
        <text class="bottom-label">已选服务</text>
      </view>
      <button class="submit-btn" :loading="submitting" @click="submitOrder">确认下单</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getServiceDetailApi, getPhotographerDetailApi, createOrderApi } from '@/api/photoApi'

const service = ref<any>(null)
const photographer = ref<any>(null)
const submitting = ref(false)
const selectedAddons = ref<string[]>([])
const addedAddons = ref<any[]>([])

const form = ref({ shootDate: '', shootLocation: '', remark: '' })

const totalAmount = computed(() => {
  const base = service.value?.price || 0
  const extra = addedAddons.value.reduce((sum, a) => sum + (a.price || 0), 0)
  return base + extra
})

onMounted(async () => {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1] as any
  const { serviceId, photographerId } = cur.$page?.options || {}
  if (!serviceId || !photographerId) return
  try {
    const [sRes, pRes] = await Promise.all([getServiceDetailApi(serviceId), getPhotographerDetailApi(photographerId)])
    service.value = sRes?.data
    photographer.value = pRes?.data
  } catch {}
})

const toggleAddon = (addon: any) => {
  const idx = selectedAddons.value.indexOf(addon.name)
  if (idx >= 0) {
    selectedAddons.value.splice(idx, 1)
    addedAddons.value.splice(
      addedAddons.value.findIndex((a: any) => a.name === addon.name),
      1
    )
  } else {
    selectedAddons.value.push(addon.name)
    addedAddons.value.push(addon)
  }
}

const submitOrder = async () => {
  if (!form.value.shootDate) {
    uni.showToast({ title: '请选择拍摄日期', icon: 'none' })
    return
  }
  if (!form.value.shootLocation) {
    uni.showToast({ title: '请输入拍摄地点', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const res = await createOrderApi({
      photographerId: photographer.value.id,
      serviceId: service.value?.id,
      orderType: 'service',
      amount: totalAmount.value,
      shootDate: form.value.shootDate,
      shootLocation: form.value.shootLocation,
      remark: form.value.remark
    })
    if (res?.data?.id) {
      uni.showToast({ title: '下单成功', icon: 'success' })
      setTimeout(() => {
        uni.redirectTo({ url: `/pages/order/detail?id=${res.data.id}` })
      }, 500)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.create-order-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140rpx;

  .section {
    background: #fff;
    margin: 16rpx;
    border-radius: 16rpx;
    padding: 24rpx;

    .section-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 20rpx;
    }

    .photographer-row {
      display: flex;
      align-items: center;
    }
    .p-avatar {
      width: 88rpx;
      height: 88rpx;
      border-radius: 44rpx;
      margin-right: 20rpx;
    }
    .p-name {
      display: block;
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
    .p-city {
      font-size: 24rpx;
      color: #999;
    }

    .service-info {
      background: #f9f9f9;
      border-radius: 12rpx;
      padding: 20rpx;
    }
    .service-title {
      display: block;
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }
    .service-desc {
      display: block;
      font-size: 26rpx;
      color: #666;
      margin-bottom: 12rpx;
    }
    .service-price {
      font-size: 32rpx;
      color: #ff4444;
      font-weight: bold;
    }

    .form-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      &:last-child {
        border: none;
      }

      .form-label {
        width: 160rpx;
        font-size: 28rpx;
        color: #333;
        flex-shrink: 0;
      }
      .picker-value {
        flex: 1;
        font-size: 28rpx;
        color: #666;
        text-align: right;
      }
      .form-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        text-align: right;
      }
      .form-textarea {
        flex: 1;
        height: 160rpx;
        font-size: 26rpx;
        color: #333;
        margin-top: 8rpx;
        padding: 16rpx;
        background: #f9f9f9;
        border-radius: 8rpx;
      }
    }

    .addon-list {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
    }
    .addon-item {
      border: 2rpx solid #e5e5e5;
      border-radius: 12rpx;
      padding: 16rpx 24rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      &.selected {
        border-color: #ff6b35;
        background: rgba(255, 107, 53, 0.05);
      }
      .addon-name {
        font-size: 26rpx;
        color: #333;
      }
      .addon-price {
        font-size: 24rpx;
        color: #ff4444;
      }
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      padding: 10rpx 0;
      font-size: 28rpx;
      color: #333;
      &.total {
        margin-top: 12rpx;
        padding-top: 20rpx;
        border-top: 2rpx solid #f0f0f0;
        font-weight: bold;
      }
    }
    .total-price {
      font-size: 36rpx;
      color: #ff4444;
    }
  }

  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.08);

    .total-info {
      .bottom-price {
        font-size: 40rpx;
        color: #ff4444;
        font-weight: bold;
        display: block;
      }
      .bottom-label {
        font-size: 22rpx;
        color: #999;
      }
    }
    .submit-btn {
      background: #ff6b35;
      color: #fff;
      border-radius: 44rpx;
      font-size: 32rpx;
      height: 88rpx;
      line-height: 88rpx;
      padding: 0 60rpx;
      border: none;
      margin: 0;
    }
  }
}
</style>
