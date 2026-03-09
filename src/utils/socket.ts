/**
 * Socket.IO 客户端工具（H5 实时推送 + 非H5轮询兜底）
 * 维护单例连接，供聊天页面使用
 */

// 判断是否是 H5 平台
const isH5 = typeof window !== 'undefined' && typeof WebSocket !== 'undefined'

type MessageHandler = (msg: any) => void

let socket: any = null
const messageHandlers: Set<MessageHandler> = new Set()

const BASE_URL: string = (() => {
  try {
    // @ts-ignore
    return import.meta.env?.VITE_SERVER_BASEURL || 'http://localhost:7001'
  } catch {
    return 'http://localhost:7001'
  }
})()

export function getSocket() {
  return socket
}

export async function connectSocket(token: string): Promise<any> {
  if (!isH5) return null
  if (socket?.connected) return socket

  if (socket) {
    socket.disconnect()
    socket = null
  }

  // 动态导入 socket.io-client（只在 H5 环境下加载）
  // v2 使用默认导出
  const ioModule = await import('socket.io-client')
  const io = (ioModule as any).default || ioModule

  socket = io(BASE_URL, {
    transports: ['websocket', 'polling'],
    query: { token }, // v2 用 query 传 token，v3+ 用 auth
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 10000
  })

  socket.on('connect', () => {
    console.log('[Socket] 已连接，id:', socket.id)
  })

  socket.on('disconnect', (reason: string) => {
    console.log('[Socket] 断开连接:', reason)
  })

  socket.on('connect_error', (err: Error) => {
    console.warn('[Socket] 连接错误:', err.message)
  })

  // 统一分发给所有监听者
  socket.on('message', (msg: any) => {
    messageHandlers.forEach(handler => handler(msg))
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * 注册消息监听，返回取消函数
 */
export function onMessage(handler: MessageHandler): () => void {
  messageHandlers.add(handler)
  return () => {
    messageHandlers.delete(handler)
  }
}
