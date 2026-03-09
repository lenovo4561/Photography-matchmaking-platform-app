<template>
  <wd-tabbar
    v-model="currentTab"
    fixed
    bordered
    safe-area-inset-bottom
    placeholder
    active-color="#ff6b35"
    inactive-color="#999999"
    @change="handleChange"
  >
    <wd-tabbar-item name="index" title="首页">
      <template #icon>
        <image src="/static/tab/home.png" class="tab-icon" />
      </template>
    </wd-tabbar-item>
    <wd-tabbar-item name="discover" title="发现">
      <template #icon>
        <image src="/static/tab/discover.png" class="tab-icon" />
      </template>
    </wd-tabbar-item>
    <wd-tabbar-item name="message" title="消息" :value="messageStore.totalUnread || undefined">
      <template #icon>
        <image src="/static/tab/message.png" class="tab-icon" />
      </template>
    </wd-tabbar-item>
    <wd-tabbar-item name="profile" title="我的">
      <template #icon>
        <image src="/static/tab/profile.png" class="tab-icon" />
      </template>
    </wd-tabbar-item>
  </wd-tabbar>
</template>

<script setup lang="ts">
import { useMessageStore } from '@/store'
const messageStore = useMessageStore()

const tabRouteMap: Record<string, string> = {
  index: '/pages/index/index',
  discover: '/pages/discover/index',
  message: '/pages/message/index',
  profile: '/pages/profile/index'
}

const routeTabMap: Record<string, string> = {
  'pages/index/index': 'index',
  'pages/discover/index': 'discover',
  'pages/message/index': 'message',
  'pages/profile/index': 'profile'
}

const currentTab = ref('index')

const updateCurrent = () => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const route = pages[pages.length - 1].route || ''
    currentTab.value = routeTabMap[route] || 'index'
  }
}

onMounted(() => {
  updateCurrent()
})

const handleChange = ({ value }: { value: string }) => {
  const path = tabRouteMap[value]
  if (path) {
    uni.switchTab({ url: path })
  }
}
</script>

<style lang="scss" scoped>
.tab-icon {
  width: 24px;
  height: 24px;
  display: block;
}

/* 让 badge 可以超出 tabbar-item 容器显示 */
:deep(.wd-tabbar-item) {
  overflow: visible !important;
}
:deep(.wd-tabbar) {
  overflow: visible !important;
}
</style>
