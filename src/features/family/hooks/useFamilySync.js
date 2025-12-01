/**
 * useFamilySync
 * - Stage 3 mock hook (Hocuspocus 없이도 동작)
 * - Stage 4에서 실제 Hocuspocus 연동 시 교체
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFamily } from './useFamily'
import { useAuth } from '@features/auth/hooks/useAuth'
import { toast } from '@shared/components/toast/toastStore'
import { FamilySyncService } from '../services/familySyncService'

export const useFamilySync = () => {
  const {
    familyGroups,
    selectedGroupId,
    inviteMember,
    removeMember,
    refetchFamily,
    loading,
    error,
  } = useFamily()
  
  // [Fixed] Derive current familyGroup from store state
  const familyGroup = useMemo(() => {
    return familyGroups?.find((g) => g.id === selectedGroupId) || null
  }, [familyGroups, selectedGroupId])

  // [Fixed] Derive members from the selected family group
  const members = useMemo(() => familyGroup?.members || [], [familyGroup])

  const { user, token } = useAuth((state) => ({
    user: state.user,
    token: state.token,
  }))

  const [connectionStatus, setConnectionStatus] = useState('disabled')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [lastSyncTime, setLastSyncTime] = useState(new Date())
  const [syncEvents, setSyncEvents] = useState([])

  const pushSyncEvent = useCallback((event) => {
    setSyncEvents((prev) => {
      const next = [
        {
          id: `${event.type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          timestamp: new Date(),
          ...event,
        },
        ...prev,
      ]
      return next.slice(0, 6)
    })
  }, [])

  const realtimeEnabled = useMemo(() => {
    const flag = import.meta.env.VITE_ENABLE_REALTIME !== 'false'
    const ws = import.meta.env.VITE_WS_BASE_URL
    return flag && Boolean(ws)
  }, [])

  useEffect(() => {
    if (!realtimeEnabled || !familyGroup?.id || !token || !FamilySyncService.isSupported()) {
      const nextStatus = realtimeEnabled ? 'waiting' : 'disabled'
      setConnectionStatus(nextStatus)
      pushSyncEvent({ type: 'status', status: nextStatus })
      return
    }

    const wsUrl = import.meta.env.VITE_WS_BASE_URL
    const service = new FamilySyncService({
      groupId: familyGroup.id,
      userId: user?.id || 'anonymous',
      token,
      wsUrl,
    })

    const disposers = [
      service.onStatusChange((status) => {
        setConnectionStatus(status)
        if (status === 'connected') {
          setLastSyncTime(new Date())
        }
        pushSyncEvent({ type: 'status', status })
      }),
      service.subscribeToOnlineUsers((users) => {
        setOnlineUsers(users || [])
      }),
      service.onError((error) => {
        console.error('[useFamilySync] Sync error:', error)
        toast.error(`실시간 동기화 오류: ${error.message}`)
        pushSyncEvent({ type: 'error', message: error.message })
      }),
    ]

    return () => {
      disposers.forEach((dispose) => dispose?.())
      service.disconnect()
    }
  }, [familyGroup?.id, token, user?.id, realtimeEnabled, pushSyncEvent])

  useEffect(() => {
    setLastSyncTime(new Date())
    if (members?.length) {
      pushSyncEvent({ type: 'members', count: members.length })
    }
  }, [familyGroup, members, pushSyncEvent])

  const derivedOnlineIds = useMemo(() => {
    if (onlineUsers?.length) {
      return onlineUsers.map((user) => user?.id || user)
    }
    // fallback: everyone considered online when realtime disabled
    return members.map((member) => member.id)
  }, [onlineUsers, members])

  return {
    familyGroup,
    members,
    inviteMember,
    removeMember,
    refetchFamily,
    loading,
    error,
    onlineUsers,
    onlineMemberIds: derivedOnlineIds,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isSyncing: loading || connectionStatus === 'connecting',
    lastSyncTime,
    syncEvents,
  }
}

export default useFamilySync
