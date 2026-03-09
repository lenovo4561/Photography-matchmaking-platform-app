<route lang="json5">
{
  style: {
    navigationBarTitleText: '摄影师中心',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="pg-manage-page">
    <!-- 认证状态 -->
    <view class="cert-banner" :class="certStatusClass">
      <text class="cert-icon">{{ certStatusIcon }}</text>
      <view class="cert-info">
        <text class="cert-title">摄影师认证</text>
        <text class="cert-desc">{{ certStatusText }}</text>
      </view>
      <text class="cert-action" @click="goCertify" v-if="pgInfo?.certStatus !== 'approved'">
        {{ pgInfo?.certStatus === 'pending' ? '查看进度' : '去认证' }}
      </text>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-card" v-if="pgInfo">
      <view class="stat-item" v-for="st in stats" :key="st.key">
        <text class="stat-val">{{ pgInfo[st.key] ?? 0 }}</text>
        <text class="stat-label">{{ st.label }}</text>
      </view>
    </view>

    <!-- 基本信息编辑 -->
    <view class="section-card">
      <text class="section-title">基本信息</text>
      <view class="form-item">
        <text class="form-label">摄影类型</text>
        <text class="form-val">{{ pgInfo?.styleTagsDisplay || '未设置' }}</text>
      </view>
      <view class="form-item">
        <text class="form-label">所在城市</text>
        <text class="form-val">{{ pgInfo?.city || '未设置' }}</text>
      </view>
      <view class="form-item">
        <text class="form-label">上门服务</text>
        <switch
          :checked="pgInfo?.canVisit"
          @change="(e: any) => toggleFeature('canVisit', e.detail.value)"
          color="#ff6b35"
          style="transform: scale(0.8)"
        />
      </view>
      <view class="form-item">
        <text class="form-label">加急服务</text>
        <switch
          :checked="pgInfo?.canUrgent"
          @change="(e: any) => toggleFeature('canUrgent', e.detail.value)"
          color="#ff6b35"
          style="transform: scale(0.8)"
        />
      </view>
      <view class="form-item">
        <text class="form-label">个人简介</text>
        <text class="form-val bio-val" @click="editBio">{{ pgInfo?.bio || '请补充简介 ›' }}</text>
      </view>
    </view>

    <!-- 功能模块入口 -->
    <view class="menu-card">
      <view class="menu-item" v-for="menu in menuList" :key="menu.path" @click="goPage(menu.path)">
        <text class="menu-icon">{{ menu.icon }}</text>
        <text class="menu-label">{{ menu.label }}</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>

  <!-- 简介编辑弹窗 -->
  <view class="modal-mask" v-if="showBioModal" @click.self="showBioModal = false">
    <view class="bio-modal">
      <text class="modal-title">编辑简介</text>
      <textarea v-model="bioEdit" placeholder="介绍您的摄影风格和经历..." class="bio-textarea" />
      <view class="modal-btns">
        <button class="modal-cancel" @click="showBioModal = false">取消</button>
        <button class="modal-confirm" @click="saveBio">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getPhotographerDetailApi, updatePhotographerApi } from '@/api/photoApi'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const pgInfo = ref<any>(null)
const showBioModal = ref(false)
const bioEdit = ref('')

const stats = [
  { key: 'orderCount', label: '订单数' },
  { key: 'avgScore', label: '综合评分' },
  { key: 'likeCount', label: '获赞数' },
  { key: 'portfolioCount', label: '作品集' }
]

const menuList = [
  { icon: '🖼', label: '我的作品集', path: '/pages/portfolio/manage' },
  { icon: '📦', label: '我的服务套餐', path: '/pages/service/manage' },
  { icon: '📅', label: '日程管理', path: '/pages/schedule/manage' },
  { icon: '📋', label: '我的接单', path: '/pages/order/list?role=photographer' }
]

const certStatusClass = computed(() => {
  const map: any = { approved: 'approved', pending: 'pending', rejected: 'rejected', uncertified: 'uncertified' }
  return map[pgInfo.value?.certStatus] || 'uncertified'
})
const certStatusIcon = computed(
  () => ({ approved: '✓', pending: '⏳', rejected: '✗', uncertified: '!' })[pgInfo.value?.certStatus as string] || '!'
)
const certStatusText = computed(
  () =>
    ({
      approved: '认证已通过，可正常接单',
      pending: '认证审核中，请耐心等待',
      rejected: '认证未通过，请修改后重新提交',
      uncertified: '请完成认证以开始接单'
    })[pgInfo.value?.certStatus as string] || '请完成认证'
)

onMounted(async () => {
  const pid = userStore.userInfo?.photographer?.id
  if (pid) {
    const res = await getPhotographerDetailApi(pid)
    pgInfo.value = res?.data
  }
})

const toggleFeature = async (key: string, val: boolean) => {
  await updatePhotographerApi({ [key]: val })
  if (pgInfo.value) pgInfo.value[key] = val
}

const editBio = () => {
  bioEdit.value = pgInfo.value?.bio || ''
  showBioModal.value = true
}

const saveBio = async () => {
  await updatePhotographerApi({ bio: bioEdit.value })
  if (pgInfo.value) pgInfo.value.bio = bioEdit.value
  showBioModal.value = false
  uni.showToast({ title: '保存成功', icon: 'success' })
}

const goCertify = () => {
  uni.navigateTo({ url: '/pages/photographer/apply' })
}

const goPage = (path: string) => {
  if (path.includes('?')) {
    const [p, q] = path.split('?')
    uni.navigateTo({ url: `${p}?${q}` })
  } else {
    uni.navigateTo({ url: path })
  }
}
</script>

<style scoped lang="scss">
.pg-manage-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;

  .cert-banner {
    display: flex;
    align-items: center;
    padding: 24rpx 30rpx;
    gap: 20rpx;
    .cert-icon {
      font-size: 48rpx;
      width: 64rpx;
      text-align: center;
      font-weight: bold;
    }
    .cert-info {
      flex: 1;
      .cert-title {
        font-size: 28rpx;
        font-weight: bold;
        display: block;
      }
      .cert-desc {
        font-size: 24rpx;
        display: block;
        margin-top: 4rpx;
      }
    }
    .cert-action {
      font-size: 24rpx;
      padding: 8rpx 20rpx;
      border-radius: 24rpx;
      border: 1rpx solid currentColor;
    }

    &.approved {
      background: #e8f5e9;
      color: #4caf50;
    }
    &.pending {
      background: #fff8e1;
      color: #ff9800;
    }
    &.rejected {
      background: #fce4ec;
      color: #f44336;
    }
    &.uncertified {
      background: #f5f5f5;
      color: #9e9e9e;
    }
  }

  .stats-card {
    background: #fff;
    margin: 16rpx;
    border-radius: 16rpx;
    padding: 24rpx;
    display: flex;

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat-val {
      font-size: 40rpx;
      font-weight: bold;
      color: #ff6b35;
    }
    .stat-label {
      font-size: 22rpx;
      color: #999;
      margin-top: 4rpx;
    }
  }

  .section-card {
    background: #fff;
    margin: 0 16rpx 16rpx;
    border-radius: 16rpx;
    padding: 0 24rpx;
    .section-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
      display: block;
      padding: 20rpx 0 12rpx;
    }
    .form-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-top: 1rpx solid #f5f5f5;
      .form-label {
        width: 160rpx;
        font-size: 28rpx;
        color: #333;
        flex-shrink: 0;
      }
      .form-val {
        flex: 1;
        font-size: 28rpx;
        color: #666;
        text-align: right;
      }
      .bio-val {
        white-space: normal;
        word-break: break-all;
        font-size: 26rpx;
      }
    }
  }

  .menu-card {
    background: #fff;
    margin: 0 16rpx 16rpx;
    border-radius: 16rpx;
    padding: 0 24rpx;
    .menu-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-top: 1rpx solid #f5f5f5;
      &:first-child {
        border: none;
      }
      .menu-icon {
        font-size: 36rpx;
        margin-right: 16rpx;
      }
      .menu-label {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }
      .menu-arrow {
        font-size: 32rpx;
        color: #ccc;
      }
    }
  }
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  .bio-modal {
    background: #fff;
    width: 640rpx;
    border-radius: 24rpx;
    padding: 40rpx;
  }
  .modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 24rpx;
  }
  .bio-textarea {
    width: 100%;
    height: 240rpx;
    font-size: 28rpx;
    color: #333;
    background: #f9f9f9;
    border-radius: 12rpx;
    padding: 16rpx;
    box-sizing: border-box;
  }
  .modal-btns {
    display: flex;
    gap: 16rpx;
    margin-top: 24rpx;
  }
  .modal-cancel {
    flex: 1;
    height: 88rpx;
    background: #f5f5f5;
    color: #666;
    border-radius: 44rpx;
    font-size: 30rpx;
    border: none;
  }
  .modal-confirm {
    flex: 1;
    height: 88rpx;
    background: #ff6b35;
    color: #fff;
    border-radius: 44rpx;
    font-size: 30rpx;
    border: none;
  }
}
</style>
