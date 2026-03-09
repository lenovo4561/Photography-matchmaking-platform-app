<route lang="json5">
{
  style: {
    navigationBarTitleText: '聊天',
    navigationBarBackgroundColor: '#ededed',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="chat-page">
    <!-- 消息列表 -->
    <scroll-view scroll-y class="msg-list" :scroll-top="scrollTop" :scroll-with-animation="false" @tap="closeMore">
      <view class="msg-list-inner">
        <template v-for="(msg, index) in messages" :key="msg.id">
          <!-- 时间分割线 -->
          <view v-if="showTimeFor(index)" class="time-divider">
            <text class="time-divider-text">{{ formatMsgTime(msg.createdAt) }}</text>
          </view>

          <!-- 消息行 -->
          <view class="msg-row" :class="{ self: msg.isSelf }">
            <!-- 对方头像 -->
            <image
              v-if="!msg.isSelf"
              :src="otherUser?.avatar || '/static/default-avatar.png'"
              mode="aspectFill"
              class="msg-avatar"
            />

            <!-- 气泡 -->
            <view class="msg-bubble-wrap" :class="{ self: msg.isSelf }">
              <view class="msg-bubble" :class="msg.isSelf ? 'self-bubble' : 'other-bubble'">
                <text v-if="msg.msgType === 'text'" class="bubble-text" user-select>{{ msg.content }}</text>
                <image
                  v-else-if="msg.msgType === 'image'"
                  :src="msg.mediaUrl"
                  mode="widthFix"
                  class="msg-img"
                  @click="previewImg(msg.mediaUrl)"
                />
                <view v-else-if="msg.msgType === 'order'" class="order-card">
                  <text class="order-icon">📋</text>
                  <text class="order-card-title">{{ msg.content }}</text>
                </view>
              </view>
            </view>

            <!-- 自己头像 -->
            <image
              v-if="msg.isSelf"
              :src="selfAvatar || '/static/default-avatar.png'"
              mode="aspectFill"
              class="msg-avatar"
            />
          </view>
        </template>

        <!-- 底部留白防止被输入框遮挡 -->
        <view class="list-bottom-space" />
      </view>
    </scroll-view>

    <!-- 底部固定区域 -->
    <view class="bottom-bar">
      <!-- 输入栏 -->
      <view class="input-bar">
        <!-- 语音按钮 -->
        <view class="icon-btn" @click="toggleVoice">
          <text class="icon-btn-text">🎤</text>
        </view>

        <!-- 输入框 -->
        <input
          v-model="inputText"
          class="msg-input"
          placeholder="说点什么…"
          placeholder-class="input-placeholder"
          confirm-type="send"
          @confirm="sendText"
          @focus="showMore = false"
          :adjust-position="true"
        />

        <!-- 表情按钮 -->
        <view class="icon-btn" @click="toggleEmoji">
          <text class="icon-btn-text">😊</text>
        </view>

        <!-- 更多 / 发送 -->
        <view v-if="!inputText.trim()" class="icon-btn" @click="showMore = !showMore">
          <text class="icon-btn-text add-icon">＋</text>
        </view>
        <view v-else class="send-btn" @click="sendText">
          <text class="send-btn-text">发送</text>
        </view>
      </view>

      <!-- 更多功能面板 -->
      <view class="more-panel" v-if="showMore">
        <view class="more-grid">
          <view class="more-item" @click="sendImage">
            <view class="more-icon-box">
              <text class="more-icon-emoji">🖼️</text>
            </view>
            <text class="more-label">相册</text>
          </view>
          <view class="more-item" @click="sendLocation">
            <view class="more-icon-box">
              <text class="more-icon-emoji">📍</text>
            </view>
            <text class="more-label">位置</text>
          </view>
          <view class="more-item" @click="goOrder">
            <view class="more-icon-box">
              <text class="more-icon-emoji">📋</text>
            </view>
            <text class="more-label">发订单</text>
          </view>
          <view class="more-item" @click="goOrder">
            <view class="more-icon-box">
              <text class="more-icon-emoji">📸</text>
            </view>
            <text class="more-label">拍摄</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getMessageHistoryApi, sendMessageApi } from '@/api/photoApi'
import { connectSocket, onMessage } from '@/utils/socket'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const messages = ref<any[]>([])
const inputText = ref('')
const scrollTop = ref(99999)
const showMore = ref(false)
const otherUser = ref<any>(null)
const selfAvatar = ref(userStore.userInfo?.avatar || '')

let receiverId = ''
let otherName = ''
let currentSessionId = ''
let cleanupSocket: (() => void) | null = null

const buildSessionId = (a: number, b: number) => `${Math.min(a, b)}_${Math.max(a, b)}`

onMounted(async () => {
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1] as any
  const opts = cur.$page?.options || {}
  receiverId = opts.userId
  otherName = opts.name || '对方'

  uni.setNavigationBarTitle({ title: otherName })

  if (!receiverId) return
  const selfId = userStore.userInfo?.id
  if (!selfId) return
  currentSessionId = buildSessionId(Number(selfId), Number(receiverId))
  try {
    const res = await getMessageHistoryApi(currentSessionId)
    const list = res?.data?.list || []
    messages.value = list.map((m: any) => ({
      ...m,
      isSelf: m.senderId === selfId
    }))
    scrollToBottom()
  } catch {}

  // #ifdef H5
  // 实时监听新消息（只处理当前会话的消息）
  const token = uni.getStorageSync('token')
  if (token) {
    connectSocket(token)
      .then(() => {
        if (cleanupSocket) {
          cleanupSocket()
          cleanupSocket = null
        }
        cleanupSocket = onMessage((msg: any) => {
          if (msg.sessionId !== currentSessionId) return
          const selfId2 = userStore.userInfo?.id
          // 避免重复添加自己发出的消息（sendText 已 push 过）
          if (msg.senderId === selfId2) return
          messages.value.push({ ...msg, isSelf: false })
          scrollToBottom()
        })
      })
      .catch(() => {})
  }
  // #endif
})

onUnmounted(() => {
  if (cleanupSocket) {
    cleanupSocket()
    cleanupSocket = null
  }
})

const scrollToBottom = () => {
  nextTick(() => {
    scrollTop.value = 999999
  })
}

const sendText = async () => {
  const text = inputText.value.trim()
  if (!text) return
  inputText.value = ''
  showMore.value = false
  try {
    const res = await sendMessageApi({ receiverId: Number(receiverId), msgType: 'text', content: text })
    messages.value.push({ ...res?.data, isSelf: true })
    scrollToBottom()
  } catch {}
}

const sendImage = () => {
  uni.chooseImage({
    count: 1,
    async success(res) {
      const tmpPath = res.tempFilePaths[0]
      // upload and send
      try {
        const uploadRes: any = await new Promise((resolve, reject) => {
          uni.uploadFile({
            url: `${import.meta.env.VITE_SERVER_BASEURL || 'http://localhost:7001'}/api/upload/image`,
            filePath: tmpPath,
            name: 'file',
            header: { Authorization: `Bearer ${uni.getStorageSync('token')}` },
            success: r => resolve(JSON.parse(r.data)),
            fail: reject
          })
        })
        if (uploadRes?.data?.url) {
          const msgRes = await sendMessageApi({
            receiverId: Number(receiverId),
            msgType: 'image',
            mediaUrl: uploadRes.data.url,
            content: '[图片]'
          })
          messages.value.push({ ...msgRes?.data, isSelf: true })
          scrollToBottom()
        }
      } catch {}
    }
  })
}

const sendLocation = () => uni.showToast({ title: '功能开发中', icon: 'none' })
const goOrder = () => uni.showToast({ title: '功能开发中', icon: 'none' })

const toggleVoice = () => uni.showToast({ title: '语音功能开发中', icon: 'none' })
const toggleEmoji = () => uni.showToast({ title: '表情功能开发中', icon: 'none' })
const closeMore = () => {
  showMore.value = false
}

const previewImg = (url: string) => {
  uni.previewImage({ urls: [url], current: url })
}

// 同一 5 分钟内不重复显示时间戳
const showTimeFor = (index: number): boolean => {
  if (index === 0) return true
  const prev = messages.value[index - 1]
  const curr = messages.value[index]
  if (!prev?.createdAt || !curr?.createdAt) return false
  return new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime() > 5 * 60 * 1000
}

const formatMsgTime = (time: string): string => {
  if (!time) return ''
  const d = new Date(time)
  const now = new Date()
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const isToday = d.toDateString() === now.toDateString()
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === d.toDateString()
  if (isToday) return `${h}:${m}`
  if (isYesterday) return `昨天 ${h}:${m}`
  return `${d.getMonth() + 1}月${d.getDate()}日 ${h}:${m}`
}
</script>

<style scoped lang="scss">
// ===== 微信风格聊天界面 =====
$wechat-bg: #ededed;
$bubble-self: #95ec69;
$bubble-other: #ffffff;
$bubble-text: #111111;
$input-bg: #f5f5f5;
$bar-bg: #f7f7f7;

.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $wechat-bg;
  overflow: hidden;
}

// ===== 消息列表 =====
.msg-list {
  flex: 1;
  overflow: hidden;
}

.msg-list-inner {
  padding: 20rpx 16rpx 0;
}

.list-bottom-space {
  height: 200rpx; // 足够大，防止最后一条消息被底部栏遮挡
}

// ===== 底部固定区域 =====
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

// ===== 时间分割线 =====
.time-divider {
  display: flex;
  justify-content: center;
  margin: 20rpx 0 16rpx;

  .time-divider-text {
    font-size: 22rpx;
    color: #999;
    background: rgba(0, 0, 0, 0.08);
    padding: 4rpx 16rpx;
    border-radius: 6rpx;
  }
}

// ===== 消息行 =====
.msg-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;

  &.self {
    flex-direction: row-reverse;
  }
}

.msg-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

// ===== 气泡容器 =====
.msg-bubble-wrap {
  position: relative;
  margin: 0 16rpx;
  max-width: 62%;

  // 对方气泡：左侧小三角
  &:not(.self) .msg-bubble::before {
    content: '';
    position: absolute;
    top: 16rpx;
    left: -14rpx;
    border: 8rpx solid transparent;
    border-right-color: $bubble-other;
    filter: drop-shadow(-1rpx 0 0 rgba(0, 0, 0, 0.06));
  }

  // 自己气泡：右侧小三角
  &.self .msg-bubble::after {
    content: '';
    position: absolute;
    top: 16rpx;
    right: -14rpx;
    border: 8rpx solid transparent;
    border-left-color: $bubble-self;
  }
}

// ===== 气泡本体 =====
.msg-bubble {
  position: relative;
  display: inline-block;
  padding: 18rpx 22rpx;
  border-radius: 8rpx;
  word-break: break-all;
  max-width: 100%;

  &.other-bubble {
    background: $bubble-other;
    box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.08);
  }

  &.self-bubble {
    background: $bubble-self;
  }

  .bubble-text {
    font-size: 30rpx;
    line-height: 1.6;
    color: $bubble-text;
  }

  .msg-img {
    max-width: 360rpx;
    min-width: 120rpx;
    border-radius: 8rpx;
    display: block;
  }

  .order-card {
    display: flex;
    align-items: center;
    gap: 10rpx;
    background: rgba(0, 0, 0, 0.04);
    padding: 10rpx 14rpx;
    border-radius: 6rpx;

    .order-icon {
      font-size: 28rpx;
      flex-shrink: 0;
    }
    .order-card-title {
      font-size: 26rpx;
      color: #333;
      line-height: 1.5;
    }
  }
}

// ===== 输入栏 =====
.input-bar {
  background: $bar-bg;
  border-top: 1rpx solid #e0e0e0;
  padding: 16rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.icon-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8rpx;
  transition: background 0.15s;

  &:active {
    background: rgba(0, 0, 0, 0.06);
  }

  .icon-btn-text {
    font-size: 44rpx;
    line-height: 1;
  }

  .add-icon {
    font-size: 48rpx;
    color: #555;
    font-weight: 300;
  }
}

.msg-input {
  flex: 1;
  height: 72rpx;
  background: #ffffff;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 30rpx;
  color: #111;
  border: 1rpx solid #ddd;
  line-height: 72rpx;
}

.input-placeholder {
  color: #bbb;
  font-size: 30rpx;
}

.send-btn {
  height: 72rpx;
  background: #07c160;
  border-radius: 8rpx;
  padding: 0 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:active {
    background: #059b4c;
  }

  .send-btn-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: 500;
  }
}

// ===== 更多面板 =====
.more-panel {
  background: $bar-bg;
  border-top: 1rpx solid #e0e0e0;
  padding: 32rpx 28rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom)); // 兼容底部安全区
}

.more-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx 0;
}

.more-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;

  &:active .more-icon-box {
    background: #e0e0e0;
  }

  .more-icon-box {
    width: 104rpx;
    height: 104rpx;
    background: #fff;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;

    .more-icon-emoji {
      font-size: 52rpx;
    }
  }

  .more-label {
    font-size: 22rpx;
    color: #888;
  }
}
</style>
