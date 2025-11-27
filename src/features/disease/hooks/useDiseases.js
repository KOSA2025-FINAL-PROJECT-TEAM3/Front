import { useEffect, useMemo } from 'react'
import { STORAGE_KEYS } from '@config/constants'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useDiseaseStore } from '../store/diseaseStore'

const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.USER_DATA)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useDiseases = (userIdOverride = null) => {
  const { user } = useAuth((state) => ({ user: state.user }))
  const {
    diseases,
    trash,
    loading,
    trashLoading,
    fetchDiseases,
    fetchTrash,
    deleteDisease,
    emptyTrash,
    setUserId,
    createDisease,
    updateDisease,
    restoreDisease,
  } = useDiseaseStore()

  const userId = useMemo(() => {
    const stored = getStoredUser()
    return (
      userIdOverride ??
      user?.id ??
      user?.userId ??
      stored?.id ??
      stored?.userId ??
      null
    )
  }, [userIdOverride, user])

  useEffect(() => {
    if (!userId) return
    setUserId(userId)
    fetchDiseases(userId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return {
    userId,
    diseases,
    trash,
    loading,
    trashLoading,
    refresh: () => (userId ? fetchDiseases(userId) : undefined),
    refreshTrash: () => (userId ? fetchTrash(userId) : undefined),
    deleteDisease: (diseaseId) => deleteDisease(diseaseId, userId),
    emptyTrash: () => emptyTrash(userId),
    createDisease: (payload) => createDisease(payload),
    updateDisease: (diseaseId, payload) => updateDisease(diseaseId, payload),
    restoreDisease: (diseaseId) => restoreDisease(diseaseId, userId),
  }
}

export default useDiseases
