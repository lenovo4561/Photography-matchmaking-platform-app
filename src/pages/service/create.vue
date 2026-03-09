<route lang="json5">
{
  style: {
    navigationBarTitleText: '创建套餐',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="service-create-page">
    <view class="form-section">
      <text class="section-title">套餐信息</text>

      <view class="form-item">
        <text class="form-label">套餐名称</text>
        <input v-model="form.title" placeholder="如：全天婚礼跟拍" class="form-input" />
      </view>

      <view class="form-item">
        <text class="form-label">拍摄类型</text>
        <picker :range="categories" :value="catIdx" @change="(e: any) => (catIdx = e.detail.value)">
          <view class="picker-val">{{ categories[catIdx] }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">计价方式</text>
        <view class="price-type-opts">
          <text
            v-for="opt in priceTypes"
            :key="opt.key"
            class="pt-opt"
            :class="{ active: form.priceType === opt.key }"
            @click="form.priceType = opt.key"
          >
            {{ opt.label }}
          </text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">价格（元）</text>
        <input
          v-model="form.price"
          type="digit"
          :placeholder="`请输入/${priceUnitMap[form.priceType]}价格`"
          class="form-input"
        />
      </view>

      <view class="form-item col">
        <text class="form-label">服务描述</text>
        <textarea v-model="form.description" placeholder="详细描述套餐内容..." class="form-textarea" />
      </view>

      <view class="form-item col">
        <text class="form-label">包含内容</text>
        <view class="includes-list">
          <view v-for="(inc, i) in form.includes" :key="i" class="include-item">
            <input v-model="form.includes[i]" placeholder="如：精修10张" class="inc-input" />
            <text class="del-inc" @click="form.includes.splice(i, 1)">-</text>
          </view>
          <button class="add-include-btn" @click="form.includes.push('')">+ 添加</button>
        </view>
      </view>
    </view>

    <view class="form-section">
      <text class="section-title">加购项目（可选）</text>
      <view class="addon-list">
        <view v-for="(addon, i) in form.addons" :key="i" class="addon-row">
          <input v-model="addon.name" placeholder="项目名称" class="addon-name-input" />
          <input v-model="addon.price" type="digit" placeholder="价格" class="addon-price-input" />
          <text class="del-addon" @click="form.addons.splice(i, 1)">✕</text>
        </view>
        <button class="add-addon-btn" @click="form.addons.push({ name: '', price: '' })">+ 添加加购项</button>
      </view>
    </view>

    <view class="submit-area">
      <button class="submit-btn" :loading="submitting" @click="submitService">
        {{ isEdit ? '保存修改' : '发布套餐' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { createServiceApi, updateServiceApi, getServiceDetailApi } from '@/api/photoApi'

const submitting = ref(false)
const isEdit = ref(false)
const catIdx = ref(0)

const categories = ['个人写真', '婚礼婚纱', '商业广告', '亲子家庭', '毕业纪念', '旅行纪实', '产品静物', '活动演出']
const priceTypes = [
  { key: 'fixed', label: '一口价/次' },
  { key: 'hourly', label: '按小时' },
  { key: 'per_shot', label: '按张数' },
  { key: 'daily', label: '按天' }
]
const priceUnitMap: any = { fixed: '次', hourly: '小时', per_shot: '张', daily: '天' }

const form = ref({ title: '', priceType: 'fixed', price: '', description: '', includes: [''], addons: [] as any[] })

let editId = ''

onMounted(async () => {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1] as any
  const id = cur.$page?.options?.id
  if (id) {
    isEdit.value = true
    editId = id
    const res = await getServiceDetailApi(id)
    const d = res?.data
    if (d) {
      form.value = {
        title: d.title,
        priceType: d.priceType,
        price: d.price,
        description: d.description || '',
        includes: d.includes || [''],
        addons: d.addons || []
      }
      catIdx.value = categories.indexOf(d.category) || 0
    }
  }
})

const submitService = async () => {
  if (!form.value.title) {
    uni.showToast({ title: '请填写套餐名称', icon: 'none' })
    return
  }
  if (!form.value.price) {
    uni.showToast({ title: '请填写价格', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const payload = { ...form.value, category: categories[catIdx.value], includes: form.value.includes.filter(Boolean) }
    if (isEdit.value) {
      await updateServiceApi(editId, payload)
    } else {
      await createServiceApi(payload)
    }
    uni.showToast({ title: isEdit.value ? '修改成功' : '发布成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 600)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.service-create-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;

  .form-section {
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
    .form-item {
      display: flex;
      align-items: flex-start;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      &:last-child {
        border: none;
      }
      &.col {
        flex-direction: column;
      }
      .form-label {
        width: 160rpx;
        font-size: 28rpx;
        color: #333;
        flex-shrink: 0;
        padding-top: 4rpx;
      }
      &.col .form-label {
        margin-bottom: 12rpx;
        width: auto;
      }
      .form-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
      .picker-val {
        font-size: 28rpx;
        color: #333;
      }
      .form-textarea {
        width: 100%;
        height: 160rpx;
        font-size: 26rpx;
        color: #333;
        background: #f9f9f9;
        padding: 16rpx;
        border-radius: 8rpx;
        box-sizing: border-box;
      }
      .price-type-opts {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;
      }
      .pt-opt {
        padding: 8rpx 20rpx;
        border: 2rpx solid #e5e5e5;
        border-radius: 32rpx;
        font-size: 24rpx;
        color: #666;
        &.active {
          border-color: #ff6b35;
          color: #ff6b35;
        }
      }
    }
    .includes-list {
      width: 100%;
      .include-item {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 12rpx;
      }
      .inc-input {
        flex: 1;
        height: 72rpx;
        border: 1rpx solid #e5e5e5;
        border-radius: 8rpx;
        padding: 0 16rpx;
        font-size: 26rpx;
      }
      .del-inc {
        font-size: 40rpx;
        color: #f44336;
        width: 48rpx;
        text-align: center;
      }
    }
    .add-include-btn {
      width: 100%;
      height: 72rpx;
      border: 2rpx dashed #ff6b35;
      color: #ff6b35;
      border-radius: 8rpx;
      background: rgba(255, 107, 53, 0.05);
      font-size: 26rpx;
      margin-top: 8rpx;
    }
    .addon-list {
      .addon-row {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-bottom: 12rpx;
      }
      .addon-name-input {
        flex: 3;
        height: 72rpx;
        border: 1rpx solid #e5e5e5;
        border-radius: 8rpx;
        padding: 0 16rpx;
        font-size: 26rpx;
      }
      .addon-price-input {
        flex: 2;
        height: 72rpx;
        border: 1rpx solid #e5e5e5;
        border-radius: 8rpx;
        padding: 0 16rpx;
        font-size: 26rpx;
      }
      .del-addon {
        font-size: 36rpx;
        color: #f44336;
      }
    }
    .add-addon-btn {
      width: 100%;
      height: 72rpx;
      border: 2rpx dashed #e5e5e5;
      color: #999;
      border-radius: 8rpx;
      background: #fff;
      font-size: 26rpx;
      margin-top: 8rpx;
    }
  }

  .submit-area {
    padding: 0 30rpx;
    .submit-btn {
      width: 100%;
      height: 96rpx;
      background: #ff6b35;
      color: #fff;
      border-radius: 48rpx;
      font-size: 34rpx;
      border: none;
    }
  }
}
</style>
