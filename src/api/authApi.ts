import ApiClient from '@/http/httpClient'

// ==================== 认证相关API ====================
export const sendSmsApi = (phone: string) => ApiClient.post('/api/auth/sendSms', { data: { phone } })

export const registerApi = (data: { phone: string; password: string; nickname?: string; inviteCode?: string }) =>
  ApiClient.post('/api/auth/register', { data })

export const loginApi = (data: { phone: string; password: string }) =>
  ApiClient.post<{ token: string; user: any }>('/api/auth/login', { data })

export const loginBySmsApi = (data: { phone: string; smsCode: string; inviteCode?: string }) =>
  ApiClient.post<{ token: string; user: any }>('/api/auth/loginBySms', { data })

export const getProfileApi = () => ApiClient.get<any>('/api/auth/profile')

export const updateProfileApi = (data: any) => ApiClient.put('/api/auth/profile', { data })

export const switchRoleApi = (role: string) => ApiClient.post('/api/auth/switch-role', { data: { role } })

export const realnameApi = (data: { realname: string; idCard: string }) =>
  ApiClient.post('/api/auth/realname', { data })
