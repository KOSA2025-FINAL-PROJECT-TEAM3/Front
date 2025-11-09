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
    this.statusHandlers.forEach((wrapped) => {
      this.provider.off('status', wrapped)
    })
    this.statusHandlers.clear()
    this.provider.disconnect()
    this.doc.destroy()
  }

  static isSupported() {
    return typeof window !== 'undefined'
  }
}

export default FamilySyncService
