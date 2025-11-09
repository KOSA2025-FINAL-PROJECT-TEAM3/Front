/**
 * useFamilySync
 * - Stage 3 mock hook (Hocuspocus 없이도 동작)
 * - Stage 4에서 실제 Hocuspocus 연동 시 교체
 */

import { useEffect, useState } from 'react'
import { useFamily } from './useFamily'

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

  const [lastSyncTime, setLastSyncTime] = useState(new Date())

  useEffect(() => {
    setLastSyncTime(new Date())
  }, [familyGroup, members])

  return {
    familyGroup,
    members,
    inviteMember,
    removeMember,
    refetchFamily,
    loading,
    error,
    isConnected: true,
    isSyncing: loading,
    lastSyncTime,
  }
}

export default useFamilySync
