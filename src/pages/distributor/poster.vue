<route lang="json5">
{
  style: {
    navigationBarTitleText: '推广海报',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="poster-page">
    <view class="poster-preview" v-if="posterData">
      <image
        :src="posterData.posterUrl || '/static/poster-placeholder.png'"
        mode="aspectFill"
        class="poster-img"
        id="posterImg"
      />
      <view class="invite-overlay">
        <text class="invite-code-label">邀请码</text>
        <text class="invite-code">{{ posterData.inviteCode }}</text>
        <view class="qr-placeholder">
          <text class="qr-tip">扫码加入</text>
        </view>
      </view>
    </view>

    <view class="skeleton-poster" v-else>
      <view class="sk-img"></view>
    </view>

    <view class="actions-card">
      <text class="actions-title">分享推广</text>
      <view class="action-btns">
        <view class="action-btn" @click="savePoster">
          <text class="action-icon">⬇</text>
          <text class="action-label">保存海报</text>
        </view>
        <view class="action-btn" @click="copyInvite">
          <text class="action-icon">📋</text>
          <text class="action-label">复制邀请码</text>
        </view>
        <view class="action-btn" @click="shareMiniProg">
          <text class="action-icon">🔗</text>
          <text class="action-label">分享小程序</text>
        </view>
      </view>
    </view>

    <view class="invite-info-card" v-if="posterData">
      <view class="info-row">
        <text class="info-label">我的邀请码</text>
        <view class="code-box">
          <text class="code-val">{{ posterData.inviteCode }}</text>
          <text class="copy-btn" @click="copyInvite">复制</text>
        </view>
      </view>
      <view class="info-row">
        <text class="info-label">分享链接</text>
        <text class="link-text ellipsis">{{ posterData.shareUrl || '生成中...' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getDistributorPosterApi } from '@/api/photoApi'

const posterData = ref<any>(null)

onMounted(async () => {
  const res = await getDistributorPosterApi()
  posterData.value = res?.data
})

const savePoster = () => {
  if (!posterData.value?.posterUrl) return
  uni.downloadFile({
    url: posterData.value.posterUrl,
    success(res) {
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success() {
          uni.showToast({ title: '已保存到相册', icon: 'success' })
        }
      })
    }
  })
}

const copyInvite = () => {
  uni.setClipboardData({
    data: posterData.value?.inviteCode || '',
    success() {
      uni.showToast({ title: '已复制邀请码', icon: 'none' })
    }
  })
}

const shareMiniProg = () => {
  uni.showToast({ title: '请使用右上角分享', icon: 'none' })
}
</script>

<style scoped lang="scss">
.poster-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;

  .poster-preview {
    position: relative;
    margin: 24rpx auto;
    width: 560rpx;
    height: 840rpx;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.1);
    display: block;
    .poster-img {
      width: 100%;
      height: 100%;
    }
    .invite-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.5);
      padding: 24rpx;
      display: flex;
      align-items: center;
      gap: 16rpx;
    }
    .invite-code-label {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.7);
    }
    .invite-code {
      font-size: 40rpx;
      font-weight: bold;
      color: #ff6b35;
      flex: 1;
    }
    .qr-placeholder {
      width: 100rpx;
      height: 100rpx;
      background: #fff;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-tip {
      font-size: 20rpx;
      color: #333;
    }
  }

  .skeleton-poster {
    margin: 24rpx auto;
    width: 560rpx;
    .sk-img {
      width: 100%;
      height: 840rpx;
      background: #f0f0f0;
      border-radius: 24rpx;
    }
  }

  .actions-card {
    background: #fff;
    margin: 0 24rpx 16rpx;
    border-radius: 16rpx;
    padding: 24rpx;
    .actions-title {
      font-size: 28rpx;
      color: #999;
      display: block;
      margin-bottom: 20rpx;
    }
    .action-btns {
      display: flex;
      justify-content: space-around;
    }
    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12rpx;
    }
    .action-icon {
      font-size: 48rpx;
    }
    .action-label {
      font-size: 24rpx;
      color: #666;
    }
  }

  .invite-info-card {
    background: #fff;
    margin: 0 24rpx;
    border-radius: 16rpx;
    padding: 24rpx;
    .info-row {
      display: flex;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f5f5f5;
      &:last-child {
        border: none;
      }
    }
    .info-label {
      width: 160rpx;
      font-size: 28rpx;
      color: #333;
      flex-shrink: 0;
    }
    .code-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16rpx;
      .code-val {
        font-size: 36rpx;
        font-weight: bold;
        color: #ff6b35;
      }
      .copy-btn {
        padding: 6rpx 20rpx;
        border: 1rpx solid #ff6b35;
        color: #ff6b35;
        border-radius: 24rpx;
        font-size: 24rpx;
      }
    }
    .link-text {
      flex: 1;
      font-size: 24rpx;
      color: #666;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
