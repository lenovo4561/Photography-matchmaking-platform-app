<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { connectSocket, onMessage } from '@/utils/socket'
import { useMessageStore, useUserStore } from '@/store'

let cleanupGlobalMsg: (() => void) | null = null

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
  // #ifdef H5
  const token = uni.getStorageSync('token')
  if (!token) return
  const messageStore = useMessageStore()
  const userStore = useUserStore()
  connectSocket(token)
    .then(() => {
      if (cleanupGlobalMsg) {
        cleanupGlobalMsg()
        cleanupGlobalMsg = null
      }
      cleanupGlobalMsg = onMessage((msg: any) => {
        // 如果当前不在消息列表页，才在这里累加（消息页自己会 syncUnread）
        const pages = getCurrentPages()
        const currentRoute = pages[pages.length - 1]?.route || ''
        if (currentRoute === 'pages/message/index') return
        // 排除自己发的
        if (userStore.userInfo?.id && msg.senderId === userStore.userInfo.id) return
        messageStore.increment()
      })
    })
    .catch(() => {})
  // #endif
})

onHide(() => {
  console.log('App Hide')
})
</script>
<style></style>
