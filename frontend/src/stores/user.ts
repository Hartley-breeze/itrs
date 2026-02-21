// stores/user.ts - 用户状态管理
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo, getRole, getToken } from '@/utils/storage'

interface UserInfo {
  id?: number
  username?: string
  nickname?: string
  avatar?: string
  email?: string
  phone?: string
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(getUserInfo())
  const role = ref<number | null>(getRole())
  const token = ref<string | null>(getToken())
  const isLoggedIn = ref(!!getToken())

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  const setRole = (newRole: number) => {
    role.value = newRole
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    isLoggedIn.value = true
  }

  const clearUser = () => {
    userInfo.value = null
    role.value = null
    token.value = null
    isLoggedIn.value = false
  }

  return {
    userInfo,
    role,
    token,
    isLoggedIn,
    setUserInfo,
    setRole,
    setToken,
    clearUser,
  }
})
