import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type UserInfo = {
  id?: number
  phone?: string
  nickname?: string
  avatar?: string
  accessToken?: string
  refreshToken?: string
  currentRole?: string // 'user' | 'photographer'
  realnameStatus?: number
  isAdmin?: number
  city?: string
  photographer?: any
  isVip?: boolean
  userBtnPermission?: string[]
}

const initState: UserInfo = {
  id: undefined,
  phone: '',
  nickname: '',
  avatar: '',
  accessToken: '',
  currentRole: 'user',
  realnameStatus: 0,
  isAdmin: 0,
  city: '',
  photographer: null
}

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<UserInfo>({ ...initState })

    const setUserInfo = (val: UserInfo): void => {
      userInfo.value = { ...userInfo.value, ...val }
    }

    const clearUserInfo = (): void => {
      userInfo.value = { ...initState }
      uni.removeStorageSync('token')
    }

    const isLoggedIn = computed(() => !!userInfo.value.accessToken)
    const isPhotographer = computed(() => userInfo.value.currentRole === 'photographer')

    // 兼容旧模板：路由权限判断所需
    const getUserPermissionKeys = computed(() => {
      const keys: string[] = []
      if (userInfo.value.accessToken) keys.push('logined')
      if (userInfo.value.currentRole === 'photographer') keys.push('photographer')
      if (userInfo.value.isVip) keys.push('vip')
      return keys
    })

    // 兼容旧模板：按钮权限判断所需
    const getUserBtnPermission = computed(() => {
      return userInfo.value.userBtnPermission || []
    })

    return {
      userInfo,
      setUserInfo,
      clearUserInfo,
      isLoggedIn,
      isPhotographer,
      getUserPermissionKeys,
      getUserBtnPermission
    }
  },
  {
    persist: {
      storage: {
        getItem: (key: string) => uni.getStorageSync(key),
        setItem: (key: string, value: string) => uni.setStorageSync(key, value)
      }
    }
  }
)
