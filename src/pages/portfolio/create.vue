<route lang="json5">
{
  style: {
    navigationBarTitleText: '发布作品集',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="portfolio-create-page">
    <view class="form-section">
      <text class="section-title">基本信息</text>

      <view class="form-item">
        <text class="form-label">作品集标题</text>
        <input v-model="form.title" placeholder="给作品集起个名字" class="form-input" maxlength="50" />
      </view>

      <view class="form-item">
        <text class="form-label">拍摄类型</text>
        <picker :range="categories" :value="catIdx" @change="(e: any) => (catIdx = e.detail.value)">
          <view class="picker-val">{{ categories[catIdx] }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">访问权限</text>
        <view class="access-options">
          <text
            v-for="opt in accessOptions"
            :key="opt.key"
            class="access-opt"
            :class="{ active: form.accessType === opt.key }"
            @click="form.accessType = opt.key"
          >
            {{ opt.label }}
          </text>
        </view>
      </view>

      <view class="form-item" v-if="form.accessType === 'paid'">
        <text class="form-label">解锁价格</text>
        <input v-model="form.price" type="digit" placeholder="请输入价格（元）" class="form-input" />
      </view>

      <view class="form-item">
        <text class="form-label">作品描述</text>
        <textarea v-model="form.description" placeholder="描述作品集内容..." class="form-textarea" />
      </view>
    </view>

    <!-- 封面选择 -->
    <view class="form-section">
      <text class="section-title">封面图片</text>
      <view class="cover-picker" @click="chooseCover">
        <image v-if="coverPreview" :src="coverPreview" mode="aspectFill" class="cover-preview" />
        <view v-else class="cover-placeholder">
          <text class="add-icon">+</text>
          <text class="add-text">点击添加封面</text>
        </view>
      </view>
    </view>

    <!-- 作品图片 -->
    <view class="form-section">
      <view class="section-header">
        <text class="section-title">作品图片</text>
        <text class="section-hint">最多上传50张</text>
      </view>
      <view class="img-grid">
        <view v-for="(img, i) in images" :key="i" class="img-item">
          <image :src="img" mode="aspectFill" class="img-preview" />
          <text class="del-img-btn" @click="images.splice(i, 1)">✕</text>
          <view class="sort-handle">{{ i + 1 }}</view>
        </view>
        <view class="add-img-btn" v-if="images.length < 50" @click="chooseImages">
          <text class="add-icon">+</text>
          <text class="add-text">添加图片</text>
        </view>
      </view>
    </view>

    <!-- 水印设置 -->
    <view class="form-section">
      <view class="switch-row">
        <text class="form-label">添加水印</text>
        <switch :checked="form.watermark" @change="(e: any) => (form.watermark = e.detail.value)" color="#ff6b35" />
      </view>
      <view v-if="form.watermark" class="form-item">
        <text class="form-label">水印文字</text>
        <input v-model="form.watermarkText" placeholder="如：@摄影师名" class="form-input" />
      </view>
    </view>

    <view class="submit-area">
      <button class="submit-btn" :loading="submitting" @click="submitCreate">
        {{ isEdit ? '保存修改' : '发布作品集' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { createPortfolioApi, updatePortfolioApi, getPortfolioDetailApi } from '@/api/photoApi'

const submitting = ref(false)
const isEdit = ref(false)
const coverPreview = ref('')
const images = ref<string[]>([])
const catIdx = ref(0)

const categories = ['个人写真', '婚礼婚纱', '商业广告', '亲子家庭', '毕业纪念', '旅行纪实', '风景建筑', '美食产品']

const accessOptions = [
  { key: 'public', label: '公开' },
  { key: 'paid', label: '付费解锁' },
  { key: 'private', label: '私密' }
]

const form = ref({
  title: '',
  category: '',
  accessType: 'public',
  price: '',
  description: '',
  watermark: false,
  watermarkText: ''
})

let editId = ''

onMounted(async () => {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1] as any
  const id = cur.$page?.options?.id
  if (id) {
    isEdit.value = true
    editId = id
    const res = await getPortfolioDetailApi(id)
    const data = res?.data
    if (data) {
      form.value = {
        title: data.title,
        category: data.category,
        accessType: data.accessType,
        price: data.price,
        description: data.description || '',
        watermark: false,
        watermarkText: ''
      }
      coverPreview.value = data.coverImage || ''
    }
  }
})

const chooseCover = () => {
  uni.chooseImage({
    count: 1,
    success(res) {
      coverPreview.value = res.tempFilePaths[0]
    }
  })
}

const chooseImages = () => {
  uni.chooseImage({
    count: Math.min(9, 50 - images.value.length),
    success(res) {
      images.value.push(...res.tempFilePaths)
    }
  })
}

const submitCreate = async () => {
  if (!form.value.title) {
    uni.showToast({ title: '请填写作品集标题', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const payload: any = {
      ...form.value,
      category: categories[catIdx.value],
      coverImage: coverPreview.value,
      watermarkConfig: form.value.watermark
        ? { text: form.value.watermarkText, position: 'center', opacity: 0.3 }
        : null
    }
    if (isEdit.value) {
      await updatePortfolioApi(editId, payload)
      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      await createPortfolioApi(payload)
      uni.showToast({ title: '发布成功', icon: 'success' })
    }
    setTimeout(() => uni.navigateBack(), 600)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.portfolio-create-page {
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
    .section-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;
      .section-hint {
        font-size: 22rpx;
        color: #999;
      }
    }

    .form-item {
      display: flex;
      align-items: flex-start;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      &:last-child {
        border: none;
      }
      .form-label {
        width: 160rpx;
        font-size: 28rpx;
        color: #333;
        flex-shrink: 0;
        padding-top: 4rpx;
      }
      .form-input {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
      .form-textarea {
        flex: 1;
        height: 160rpx;
        font-size: 26rpx;
        color: #333;
        background: #f9f9f9;
        padding: 16rpx;
        border-radius: 8rpx;
      }
      .picker-val {
        font-size: 28rpx;
        color: #333;
      }
      .access-options {
        display: flex;
        gap: 16rpx;
      }
      .access-opt {
        padding: 8rpx 24rpx;
        border-radius: 32rpx;
        border: 2rpx solid #e5e5e5;
        font-size: 26rpx;
        color: #666;
        &.active {
          border-color: #ff6b35;
          color: #ff6b35;
          background: rgba(255, 107, 53, 0.05);
        }
      }
    }

    .switch-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12rpx 0;
      margin-bottom: 16rpx;
      .form-label {
        font-size: 30rpx;
        color: #333;
      }
    }

    .cover-picker {
      .cover-preview {
        width: 100%;
        height: 360rpx;
        border-radius: 12rpx;
      }
      .cover-placeholder {
        height: 360rpx;
        border: 2rpx dashed #ddd;
        border-radius: 12rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .add-icon {
          font-size: 80rpx;
          color: #ccc;
        }
        .add-text {
          font-size: 26rpx;
          color: #999;
        }
      }
    }

    .img-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
    }
    .img-item {
      width: 160rpx;
      height: 160rpx;
      position: relative;
    }
    .img-preview {
      width: 160rpx;
      height: 160rpx;
      border-radius: 8rpx;
    }
    .del-img-btn {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      width: 40rpx;
      height: 40rpx;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 20rpx;
      border-radius: 20rpx;
      text-align: center;
      line-height: 40rpx;
    }
    .sort-handle {
      position: absolute;
      bottom: 4rpx;
      left: 4rpx;
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      font-size: 20rpx;
      width: 36rpx;
      height: 36rpx;
      border-radius: 18rpx;
      text-align: center;
      line-height: 36rpx;
    }
    .add-img-btn {
      width: 160rpx;
      height: 160rpx;
      border: 2rpx dashed #ddd;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .add-icon {
        font-size: 60rpx;
        color: #ccc;
      }
      .add-text {
        font-size: 22rpx;
        color: #999;
      }
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
