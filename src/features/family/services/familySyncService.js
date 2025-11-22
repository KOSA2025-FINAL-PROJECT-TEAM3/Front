import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'

const buildRoomName = (groupId) => `family-group-${groupId}`

export class FamilySyncService {
  constructor({ groupId, userId, token, wsUrl }) {
    this.doc = new Y.Doc()
    this.provider = new HocuspocusProvider({
      url: wsUrl,
      name: buildRoomName(groupId),
      document: this.doc,
      token,
      parameters: {
        userId,
      },
    })

    this.onlineUsers = this.doc.getArray('onlineUsers')
    this.changeLog = this.doc.getArray('changeLog')
    this.statusHandlers = new Map()
    this.errorHandlers = new Map()

    // 에러 이벤트 리스닝 초기화
    this.setupErrorHandling()
  }

  setupErrorHandling() {
    // Hocuspocus Provider 에러 이벤트
    this.provider.on('connection-error', (error) => {
      this.notifyError(new Error(`WebSocket 연결 실패: ${error.message}`))
    })

    this.provider.on('sync-error', (error) => {
      this.notifyError(new Error(`동기화 에러: ${error.message}`))
    })

    this.provider.on('error', (error) => {
      this.notifyError(error)
    })
  }

  notifyError(error) {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error)
      } catch (e) {
        console.error('[FamilySyncService] Error in error handler:', e)
      }
    })
  }

  onStatusChange(handler) {
    const wrapped = (payload) => handler(payload.status)
    this.provider.on('status', wrapped)
    this.statusHandlers.set(handler, wrapped)
    return () => {
      this.provider.off('status', wrapped)
      this.statusHandlers.delete(handler)
    }
  }

  onError(handler) {
    this.errorHandlers.set(handler, handler)
    return () => {
      this.errorHandlers.delete(handler)
    }
  }

  subscribeToOnlineUsers(handler) {
    const observe = () => handler(this.onlineUsers.toArray())
    observe()
    const disposer = () => this.onlineUsers.unobserve(observe)
    this.onlineUsers.observe(observe)
    return disposer
  }

  subscribeToChanges(handler) {
    const observe = () => handler(this.changeLog.toArray())
    this.changeLog.observe(observe)
    return () => this.changeLog.unobserve(observe)
  }

  disconnect() {
    // 상태 핸들러 정리
    this.statusHandlers.forEach((wrapped) => {
      this.provider.off('status', wrapped)
    })
    this.statusHandlers.clear()

    // 에러 핸들러 정리
    this.errorHandlers.clear()

    // Provider 이벤트 리스너 제거
    this.provider.off('connection-error')
    this.provider.off('sync-error')
    this.provider.off('error')

    this.provider.disconnect()
    this.doc.destroy()
  }

  static isSupported() {
    return typeof window !== 'undefined'
  }
}

export default FamilySyncService
