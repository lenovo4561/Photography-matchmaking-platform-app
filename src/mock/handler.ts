/**
 * 演示模式 Mock HTTP 处理器
 * 当 VITE_DEMO=true 时，所有 API 请求均由此处返回本地假数据，不发起任何网络请求
 */

import {
  MOCK_PHOTOGRAPHERS,
  MOCK_PORTFOLIOS_ALL,
  MOCK_PORTFOLIOS_BY_CATEGORY,
  MOCK_SERVICES,
  MOCK_BANNERS,
  MOCK_CATEGORIES,
  MOCK_REVIEWS,
  MOCK_USER,
  MOCK_SESSIONS
} from './data'

/** 统一成功响应格式 */
const ok = (data: any) => ({ code: 0, data, msg: 'ok' })

/** 构造一个兼容 httpClient 返回格式的 mock Promise 对象 */
export function mockHttp<T = any>(dataPayload: any) {
  const promise = Promise.resolve<any>(ok(dataPayload))
  return Object.assign(promise, {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
    abort: () => {}
  })
}

/**
 * 根据请求 URL + method 匹配并返回 mock 数据
 */
export function handleMockRequest(url: string, method: string, data?: any): ReturnType<typeof mockHttp> {
  const path = url.replace(/\?.*$/, '') // 去掉 query string
  const m = method?.toUpperCase() || 'GET'

  // ── 认证 ──────────────────────────────────────────────────
  if (path.includes('/api/auth/login') || path.includes('/api/auth/loginBySms')) {
    return mockHttp({ token: MOCK_USER.accessToken, user: MOCK_USER, ...MOCK_USER })
  }
  if (path.includes('/api/auth/register')) {
    return mockHttp({ token: MOCK_USER.accessToken, user: MOCK_USER, ...MOCK_USER })
  }
  if (path.includes('/api/auth/sendSms')) {
    return mockHttp({ smsCode: '1234' })
  }
  if (path.includes('/api/auth/profile') && m === 'GET') {
    return mockHttp(MOCK_USER)
  }
  if (path.includes('/api/auth/profile') && m === 'PUT') {
    return mockHttp(MOCK_USER)
  }
  if (path.includes('/api/auth/switch-role')) {
    return mockHttp({ ...MOCK_USER, currentRole: data?.role || 'user' })
  }
  if (path.includes('/api/auth/realname')) {
    return mockHttp({ realnameStatus: 1 })
  }
  if (path.includes('/api/auth/refresh')) {
    return mockHttp({ accessToken: MOCK_USER.accessToken, refreshToken: MOCK_USER.refreshToken })
  }

  // ── 摄影师 ────────────────────────────────────────────────
  if (path.includes('/api/photographer/list') || path.includes('/api/photographer/nearby')) {
    return mockHttp({ list: MOCK_PHOTOGRAPHERS, total: MOCK_PHOTOGRAPHERS.length })
  }
  if (path.includes('/api/photographer/apply') || path.includes('/api/photographer/profile')) {
    return mockHttp(MOCK_PHOTOGRAPHERS[0])
  }
  // 摄影师详情  /api/photographer/:id
  const photographerMatch = path.match(/\/api\/photographer\/(\d+)$/)
  if (photographerMatch) {
    const id = parseInt(photographerMatch[1])
    const p = MOCK_PHOTOGRAPHERS.find(x => x.id === id) || MOCK_PHOTOGRAPHERS[0]
    return mockHttp(p)
  }

  // ── 作品集 ────────────────────────────────────────────────
  if (path.includes('/api/portfolio/list')) {
    // 从 url 读 category 参数
    const catMatch = url.match(/[?&]category=([^&]+)/)
    const cat = catMatch ? catMatch[1] : 'all'
    const list = MOCK_PORTFOLIOS_BY_CATEGORY[cat] || MOCK_PORTFOLIOS_ALL
    return mockHttp({ list, total: list.length })
  }
  if (path.match(/\/api\/portfolio\/\d+\/like/)) {
    return mockHttp({ liked: true })
  }
  if (path.match(/\/api\/portfolio\/\d+\/unlock/)) {
    return mockHttp({ unlocked: true })
  }
  if (path.match(/\/api\/portfolio\/\d+\/watermark/)) {
    return mockHttp({})
  }
  if (path.match(/\/api\/portfolio\/\d+\/report/)) {
    return mockHttp({})
  }
  const portfolioIdMatch = path.match(/\/api\/portfolio\/(\d+|[a-z][a-z0-9]*)$/)
  if (portfolioIdMatch) {
    const found = MOCK_PORTFOLIOS_ALL.find(x => String(x.id) === portfolioIdMatch[1]) || MOCK_PORTFOLIOS_ALL[0]
    return mockHttp({ ...found, images: [found.coverImage, found.coverImage] })
  }
  if (path.includes('/api/portfolio') && m === 'POST') {
    return mockHttp({ id: 999 })
  }
  if (path.includes('/api/portfolio') && m === 'PUT') {
    return mockHttp({})
  }
  if (path.includes('/api/portfolio') && m === 'DELETE') {
    return mockHttp({})
  }

  // ── 套餐 ──────────────────────────────────────────────────
  if (path.includes('/api/service/list')) {
    return mockHttp({ list: MOCK_SERVICES, total: MOCK_SERVICES.length })
  }
  const serviceIdMatch = path.match(/\/api\/service\/(\d+)$/)
  if (serviceIdMatch) {
    const found = MOCK_SERVICES.find(x => String(x.id) === serviceIdMatch[1]) || MOCK_SERVICES[0]
    return mockHttp(found)
  }
  if (path.includes('/api/service') && m === 'POST') {
    return mockHttp({ id: 999 })
  }
  if (path.includes('/api/service') && (m === 'PUT' || m === 'DELETE')) {
    return mockHttp({})
  }

  // ── 档期 ──────────────────────────────────────────────────
  if (path.includes('/api/schedule')) {
    return mockHttp({ schedules: [] })
  }

  // ── 订单 ──────────────────────────────────────────────────
  if (path.includes('/api/order/list')) {
    return mockHttp({ list: [], total: 0 })
  }
  if (path.includes('/api/order') && m === 'POST') {
    return mockHttp({ id: 8001, status: 'pending' })
  }
  if (path.match(/\/api\/order\/\d+/)) {
    return mockHttp({ id: 8001, status: 'pending', totalAmount: 599 })
  }

  // ── 消息 ──────────────────────────────────────────────────
  if (path.includes('/api/message/sessions')) {
    return mockHttp(MOCK_SESSIONS)
  }
  if (path.includes('/api/message/send')) {
    return mockHttp({ id: Date.now() })
  }
  if (path.match(/\/api\/message\//)) {
    return mockHttp({ list: [], total: 0 })
  }

  // ── 评价 ──────────────────────────────────────────────────
  if (path.includes('/api/review')) {
    return mockHttp({ list: MOCK_REVIEWS, total: MOCK_REVIEWS.length })
  }

  // ── 分销 ──────────────────────────────────────────────────
  if (path.includes('/api/distributor/join')) {
    return mockHttp({})
  }
  if (path.includes('/api/distributor/profile')) {
    return mockHttp(null)
  }
  if (path.includes('/api/distributor/stats')) {
    return mockHttp({ totalCommission: 0, pendingCommission: 0, referralCount: 0 })
  }
  if (path.includes('/api/distributor/commissions')) {
    return mockHttp({ list: [], total: 0 })
  }
  if (path.includes('/api/distributor/poster')) {
    return mockHttp({ posterUrl: '/static/poster-placeholder.png' })
  }
  if (path.includes('/api/distributor/withdraw')) {
    return mockHttp({})
  }

  // ── 账户 ──────────────────────────────────────────────────
  if (path.includes('/api/account/balance')) {
    return mockHttp({ balance: 0, frozenBalance: 0 })
  }
  if (path.includes('/api/account/bills')) {
    return mockHttp({ list: [], total: 0 })
  }
  if (path.includes('/api/account/withdraw')) {
    return mockHttp({})
  }
  if (path.includes('/api/account/withdrawals')) {
    return mockHttp({ list: [], total: 0 })
  }

  // ── 通知 ──────────────────────────────────────────────────
  if (path.includes('/api/notification')) {
    return mockHttp({ list: [], total: 0 })
  }

  // ── 系统配置 ──────────────────────────────────────────────
  if (path.includes('/api/config/banners')) {
    return mockHttp(MOCK_BANNERS)
  }
  if (path.includes('/api/config/categories')) {
    return mockHttp(MOCK_CATEGORIES)
  }

  // ── 文件上传（上传直接返回演示图片URL） ──────────────────
  if (path.includes('/api/upload')) {
    return mockHttp({ url: 'https://picsum.photos/seed/portrait/400/260' })
  }

  // ── 默认兜底 ──────────────────────────────────────────────
  console.warn(`[MockHandler] 未匹配路由: ${m} ${path}`)
  return mockHttp({})
}
