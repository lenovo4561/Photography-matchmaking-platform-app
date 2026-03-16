<route lang="json5">
{
  layout: 'foot',
  style: {
    navigationBarTitleText: '消息',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTextStyle: 'black'
  }
}
</route>

<template>
  <view class="message-page">
    <view class="page-title">消息</view>

    <scroll-view scroll-y class="session-list" v-if="sessions.length > 0">
      <view v-for="session in sessions" :key="session.sessionId" class="session-item" @click="goChat(session)">
        <image
          :src="session.otherUser?.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
          class="session-avatar"
        />
        <view class="session-info">
          <view class="session-top">
            <text class="session-name">{{ session.otherUser?.nickname }}</text>
            <text class="session-time">{{ formatTime(session.lastMessage?.createdAt) }}</text>
          </view>
          <view class="session-bottom">
            <text class="session-last">{{ getLastMsgText(session.lastMessage) }}</text>
            <view class="unread-badge" v-if="session.unreadCount > 0">
              {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="empty-state" v-else-if="!loading && !error">
      <text class="empty-icon">💬</text>
      <text class="empty-text">暂无消息</text>
      <text class="empty-hint">去找感兴趣的摄影师聊聊吧</text>
      <button class="find-btn" @click="goDiscover">去发现</button>
    </view>

    <view class="loading-state" v-if="loading">
      <text>加载中...</text>
    </view>

    <view class="error-state" v-if="error && !loading">
      <text class="error-icon">⚠️</text>
      <text class="error-text">连接服务器失败</text>
      <button class="retry-btn" @click="fetchSessions">重试</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { connectSocket, onMessage } from '@/utils/socket'
import { useUserStore, useMessageStore } from '@/store'

const userStore = useUserStore()
const messageStore = useMessageStore()
const sessions = ref<any[]>([])
const loading = ref(false)
const error = ref(false)
let cleanupSocket: (() => void) | null = null

// 计算总未读数并同步到 store
const syncUnread = () => {
  const total = sessions.value.reduce((sum, s) => sum + (s.unreadCount || 0), 0)
  messageStore.setUnread(total)
}

onShow(() => {
  fetchSessions()

  // H5 实时监听新消息，更新会话列表
  // #ifdef H5
  connectSocket(uni.getStorageSync('token'))
    .then(() => {
      if (cleanupSocket) {
        cleanupSocket()
        cleanupSocket = null
      }
      cleanupSocket = onMessage((msg: any) => {
        const selfId = userStore.userInfo?.id
        if (!selfId) return
        // 更新对应 session 的 lastMessage 和 unreadCount
        const idx = sessions.value.findIndex(s => s.sessionId === msg.sessionId)
        if (idx >= 0) {
          // 如果是别人发来的消息，未读+1
          if (msg.senderId !== selfId) {
            sessions.value[idx].unreadCount = (sessions.value[idx].unreadCount || 0) + 1
            syncUnread()
          }
          sessions.value[idx].lastMessage = msg
          // 置顶
          const updated = sessions.value.splice(idx, 1)[0]
          sessions.value.unshift(updated)
        } else {
          // 新会话，重新拉一次
          fetchSessions()
        }
      })
    })
    .catch(() => {})
  // #endif
})

onHide(() => {
  if (cleanupSocket) {
    cleanupSocket()
    cleanupSocket = null
  }
})

// 演示用写死会话数据，头像使用远程真实人物图片
const MOCK_SESSIONS = [
  {
    sessionId: 1001,
    otherUserId: 101,
    unreadCount: 2,
    otherUser: { nickname: '林晓雨', avatar: 'https://i.pravatar.cc/240?img=47' },
    lastMessage: {
      msgType: 'text',
      content: '您好，想咨询一下写真套餐的具体内容',
      createdAt: new Date(Date.now() - 5 * 60000).toISOString()
    }
  },
  {
    sessionId: 1002,
    otherUserId: 102,
    unreadCount: 0,
    otherUser: { nickname: '张明远', avatar: 'https://i.pravatar.cc/240?img=11' },
    lastMessage: {
      msgType: 'text',
      content: '好的，档期已确认，期待和您合作！',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
    }
  },
  {
    sessionId: 1003,
    otherUserId: 103,
    unreadCount: 1,
    otherUser: { nickname: '陈志豪', avatar: 'https://i.pravatar.cc/240?img=12' },
    lastMessage: { msgType: 'image', content: '', createdAt: new Date(Date.now() - 5 * 3600000).toISOString() }
  },
  {
    sessionId: 1004,
    otherUserId: 104,
    unreadCount: 0,
    otherUser: { nickname: '苏沐阳', avatar: 'https://i.pravatar.cc/240?img=48' },
    lastMessage: {
      msgType: 'text',
      content: '样片已发给您，请查收～',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  },
  {
    sessionId: 1005,
    otherUserId: 105,
    unreadCount: 0,
    otherUser: { nickname: '周梦琪', avatar: 'https://i.pravatar.cc/240?img=44' },
    lastMessage: {
      msgType: 'text',
      content: '毕业照拍摄地点我们可以去图书馆，那里光线最好',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  }
]

const fetchSessions = () => {
  loading.value = true
  sessions.value = MOCK_SESSIONS
  syncUnread()
  loading.value = false
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${m}/${day}`
}

const getLastMsgText = (msg: any) => {
  if (!msg) return ''
  if (msg.msgType === 'text') return msg.content
  if (msg.msgType === 'image') return '[图片]'
  if (msg.msgType === 'order') return '[订单消息]'
  return ''
}

const goChat = (session: any) => {
  // 点进去清零本地未读数
  session.unreadCount = 0
  syncUnread()
  uni.navigateTo({
    url: `/pages/chat/detail?userId=${session.otherUserId}&name=${session.otherUser?.nickname}`
  })
}

const goDiscover = () => uni.switchTab({ url: '/pages/discover/index' })
</script>

<style scoped lang="scss">
.message-page {
  min-height: 100vh;
  background: #f5f5f5;

  .page-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    padding: 40rpx 30rpx 20rpx;
    background: #fff;
  }

  .session-list {
    background: #fff;
    margin-top: 16rpx;

    .session-item {
      display: flex;
      align-items: center;
      padding: 24rpx 30rpx;
      border-bottom: 1rpx solid #f5f5f5;

      .session-avatar {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50rpx;
        margin-right: 20rpx;
        flex-shrink: 0;
      }

      .session-info {
        flex: 1;
        min-width: 0;

        .session-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8rpx;

          .session-name {
            font-size: 30rpx;
            color: #333;
            font-weight: bold;
          }
          .session-time {
            font-size: 22rpx;
            color: #999;
          }
        }

        .session-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .session-last {
            font-size: 26rpx;
            color: #999;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 420rpx;
          }

          .unread-badge {
            background: #ff6b35;
            color: #fff;
            font-size: 20rpx;
            min-width: 36rpx;
            height: 36rpx;
            border-radius: 18rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 8rpx;
            flex-shrink: 0;
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120rpx 40rpx;

    .empty-icon {
      font-size: 120rpx;
      margin-bottom: 24rpx;
    }
    .empty-text {
      font-size: 34rpx;
      color: #333;
      font-weight: bold;
      margin-bottom: 12rpx;
    }
    .empty-hint {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 48rpx;
    }
    .find-btn {
      background: #ff6b35;
      color: #fff;
      border-radius: 48rpx;
      padding: 0 60rpx;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      border: none;
    }
  }

  .loading-state {
    text-align: center;
    padding: 40rpx;
    color: #999;
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120rpx 40rpx;

    .error-icon {
      font-size: 80rpx;
      margin-bottom: 20rpx;
    }
    .error-text {
      font-size: 30rpx;
      color: #999;
      margin-bottom: 40rpx;
    }
    .retry-btn {
      background: #ff6b35;
      color: #fff;
      border-radius: 48rpx;
      padding: 0 60rpx;
      height: 72rpx;
      line-height: 72rpx;
      font-size: 28rpx;
      border: none;
    }
  }
}
</style>
