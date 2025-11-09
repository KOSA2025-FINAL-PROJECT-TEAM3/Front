/**
 * useFamilySync
 * - Stage 3 mock hook (Hocuspocus 없이도 동작)
 * - Stage 4에서 실제 Hocuspocus 연동 시 교체
 */

import { useEffect, useMemo, useState } from 'react'
import { useFamily } from './useFamily'
import { useAuth } from '@features/auth/hooks/useAuth'
import { FamilySyncService } from '../services/familySyncService'

export const useFamilySync = () => {
  const {
    familyGroup,
    members,
    inviteMember,
    removeMember,
    refetchFamily,
    loading,
    error,
  } = useFamily()
  const { user, token } = useAuth((state) => ({
    user: state.user,
    token: state.token,
  }))

  const [connectionStatus, setConnectionStatus] = useState('disabled')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [lastSyncTime, setLastSyncTime] = useState(new Date())

  const realtimeEnabled = useMemo(() => {
    const flag = import.meta.env.VITE_ENABLE_REALTIME !== 'false'
    const ws = import.meta.env.VITE_WS_BASE_URL
    return flag && Boolean(ws)
  }, [])

  useEffect(() => {
    if (!realtimeEnabled || !familyGroup?.id || !token || !FamilySyncService.isSupported()) {
      setConnectionStatus(realtimeEnabled ? 'waiting' : 'disabled')
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
      }),
      service.subscribeToOnlineUsers((users) => {
        setOnlineUsers(users || [])
      }),
    ]

    return () => {
      disposers.forEach((dispose) => dispose?.())
      service.disconnect()
    }
  }, [familyGroup?.id, token, user?.id, realtimeEnabled])

  useEffect(() => {
    setLastSyncTime(new Date())
  }, [familyGroup, members])

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
  }
}

export default useFamilySync
