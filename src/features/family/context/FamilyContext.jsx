/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react'
import { useFamilyStore } from '@/stores/familyStore'

/**
 * FamilyProvider
 * - Zustand store 초기화용 래퍼 (Context 대신 store 직접 사용)
 */
export const FamilyProvider = ({ children }) => {
  const initialize = useFamilyStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return children
}

/**
 * useFamilyContext (legacy helper)
 * - 기존 코드 호환용으로 Zustand store를 그대로 반환
 */
export const useFamilyContext = () => {
  return useFamilyStore()
}

export default FamilyProvider
