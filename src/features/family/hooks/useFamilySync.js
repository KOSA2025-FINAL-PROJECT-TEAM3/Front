

/**
 * useFamilySync
 * - 실시간 동기화는 현재 비활성/대기 상태이며, 설정된 WS 환경이 있을 때만 활성화 가능
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFamily } from './useFamily'
import { useAuth } from '@features/auth/hooks/useAuth'

export const useFamilySync = () => {
  const {
    familyGroups,
    selectedGroupId,
    inviteMember,
    removeMember,
    updateMemberRole,
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
    if (!realtimeEnabled || !familyGroup?.id || !token) {
      const nextStatus = realtimeEnabled ? 'waiting' : 'disabled'
      setConnectionStatus(nextStatus)
      pushSyncEvent({ type: 'status', status: nextStatus })
      return
    }
  }, [familyGroup?.id, token, user?.id, realtimeEnabled, pushSyncEvent])

  useEffect(() => {
    setLastSyncTime(new Date())
    if (members?.length) {
      pushSyncEvent({ type: 'members', count: members.length })
    }
  }, [familyGroup, members, pushSyncEvent])


  return {
    familyGroup,
    members,
    inviteMember,
    removeMember,
    updateMemberRole,
    refetchFamily,
    loading,
    error,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isSyncing: loading || connectionStatus === 'connecting',
    lastSyncTime,
    syncEvents,
  }
}

export default useFamilySync
