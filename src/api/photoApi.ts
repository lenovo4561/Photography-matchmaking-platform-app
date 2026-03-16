import ApiClient from '@/http/httpClient'

// ==================== 鎽勫奖甯圓PI ====================
export const applyPhotographerApi = (data: any) => ApiClient.post('/api/photographer/apply', { data })

export const updatePhotographerApi = (data: any) => ApiClient.put('/api/photographer/profile', { data })

export const getPhotographerListApi = (params: any) => ApiClient.get<any>('/api/photographer/list', { query: params })

export const getPhotographerDetailApi = (id: number) => ApiClient.get<any>(`/api/photographer/${id}`)

export const getNearbyPhotographersApi = (params: any) =>
  ApiClient.get<any>('/api/photographer/nearby', { query: params })

// ==================== 浣滃搧闆咥PI ====================
export const createPortfolioApi = (data: any) => ApiClient.post('/api/portfolio', { data })

export const updatePortfolioApi = (id: number, data: any) => ApiClient.put(`/api/portfolio/${id}`, { data })

export const getPortfolioListApi = (params: any) => ApiClient.get<any>('/api/portfolio/list', { query: params })

export const getPortfolioDetailApi = (id: number) => ApiClient.get<any>(`/api/portfolio/${id}`)

export const deletePortfolioApi = (id: number) => ApiClient.delete(`/api/portfolio/${id}`)

export const unlockPortfolioApi = (id: number) => ApiClient.post(`/api/portfolio/${id}/unlock`, { data: {} })

export const likePortfolioApi = (id: number) => ApiClient.post(`/api/portfolio/${id}/like`, { data: {} })

export const reportPortfolioApi = (id: number, data: any) => ApiClient.post(`/api/portfolio/${id}/report`, { data })

export const setWatermarkApi = (id: number, data: any) => ApiClient.post(`/api/portfolio/${id}/watermark`, { data })

// ==================== 濂楅API ====================
export const createServiceApi = (data: any) => ApiClient.post('/api/service', { data })

export const updateServiceApi = (id: number, data: any) => ApiClient.put(`/api/service/${id}`, { data })

export const getServiceListApi = (params: any) => ApiClient.get<any>('/api/service/list', { query: params })

export const getServiceDetailApi = (id: number) => ApiClient.get<any>(`/api/service/${id}`)

export const deleteServiceApi = (id: number) => ApiClient.delete(`/api/service/${id}`)

// ==================== 妗ｆ湡API ====================
export const batchSetScheduleApi = (schedules: any[]) => ApiClient.post('/api/schedule/batch', { data: { schedules } })

export const getScheduleApi = (photographerId: number, params?: any) =>
  ApiClient.get<any>(`/api/schedule/${photographerId}`, { query: params })

// ==================== 璁㈠崟API ====================
export const createOrderApi = (data: any) => ApiClient.post('/api/order', { data })

export const getOrderListApi = (params: any) => ApiClient.get<any>('/api/order/list', { query: params })

export const getOrderDetailApi = (id: number) => ApiClient.get<any>(`/api/order/${id}`)

export const acceptOrderApi = (id: number) => ApiClient.put(`/api/order/${id}/accept`, { data: {} })

export const rejectOrderApi = (id: number, reason: string) =>
  ApiClient.put(`/api/order/${id}/reject`, { data: { reason } })

export const deliverOrderApi = (id: number, deliveryFiles: string[]) =>
  ApiClient.put(`/api/order/${id}/deliver`, { data: { deliveryFiles } })

export const confirmOrderApi = (id: number) => ApiClient.put(`/api/order/${id}/confirm`, { data: {} })

export const cancelOrderApi = (id: number, reason: string) =>
  ApiClient.put(`/api/order/${id}/cancel`, { data: { reason } })

export const applyRefundApi = (id: number, reason: string) =>
  ApiClient.post(`/api/order/${id}/refund`, { data: { reason } })

export const approveRefundApi = (id: number) => ApiClient.put(`/api/order/${id}/refund/approve`, { data: {} })

// ==================== 娑堟伅API ====================
export const getSessionsApi = () => ApiClient.get<any>('/api/message/sessions')

export const getMessageHistoryApi = (sessionId: string, params?: any) =>
  ApiClient.get<any>(`/api/message/${sessionId}`, { query: params })

export const sendMessageApi = (data: { receiverId: number; content: string; msgType?: string }) =>
  ApiClient.post('/api/message/send', { data })

// ==================== 璇勪环API ====================
export const createReviewApi = (data: any) => ApiClient.post('/api/review', { data })

export const getReviewListApi = (photographerId: number, params?: any) =>
  ApiClient.get<any>(`/api/review/photographer/${photographerId}`, { query: params })

export const replyReviewApi = (id: number, reply: string) =>
  ApiClient.put(`/api/review/${id}/reply`, { data: { reply } })

// ==================== 鍒嗛攢API ====================
export const joinDistributorApi = () => ApiClient.post('/api/distributor/join', { data: {} })

export const getDistributorProfileApi = () => ApiClient.get<any>('/api/distributor/profile')

export const getDistributorStatsApi = () => ApiClient.get<any>('/api/distributor/stats')

export const getCommissionsApi = (params?: any) => ApiClient.get<any>('/api/distributor/commissions', { query: params })

export const getDistributorPosterApi = () => ApiClient.get<any>('/api/distributor/poster')

export const distributorWithdrawApi = (data: any) => ApiClient.post('/api/distributor/withdraw', { data })

// ==================== 璐︽埛API ====================
export const getBalanceApi = () => ApiClient.get<any>('/api/account/balance')

export const getBillsApi = (params?: any) => ApiClient.get<any>('/api/account/bills', { query: params })

export const withdrawApi = (data: any) => ApiClient.post('/api/account/withdraw', { data })

export const getWithdrawalsApi = (params?: any) => ApiClient.get<any>('/api/account/withdrawals', { query: params })

// ==================== 閫氱煡API ====================
export const getNotificationsApi = (params?: any) => ApiClient.get<any>('/api/notification/list', { query: params })

export const readAllNotificationsApi = () => ApiClient.put('/api/notification/read-all', { data: {} })

// ==================== 系统配置API（Banner / 分类） ====================
export const getBannersApi = () => ApiClient.get<any>('/api/config/banners')
export const getCategoriesApi = () => ApiClient.get<any>('/api/config/categories')

// ==================== 文件上传API ====================
export const uploadImageApi = (filePath: string): Promise<{ url: string }> => {
  // 演示模式：直接返回本地占位图，不上传
  if (import.meta.env.VITE_DEMO === 'true') {
    return Promise.resolve({ url: 'https://picsum.photos/seed/portrait/400/260' })
  }
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    uni.uploadFile({
      url: `${import.meta.env.VITE_SERVER_BASEURL}/api/upload/image`,
      filePath,
      name: 'file',
      header: { Authorization: `Bearer ${token}` },
      success: res => {
        const data = JSON.parse(res.data)
        if (data.success) resolve(data.data)
        else reject(data)
      },
      fail: reject
    })
  })
}
