/* eslint-disable react-refresh/only-export-components */
/**
 * FamilyContext
 * - Stage 3: 가족 관리 프로토타입 (Mock 데이터 + Dev Mode 지원)
 */

import { createContext, useContext, useMemo } from 'react'
import { DEFAULT_FAMILY_GROUP, DEFAULT_FAMILY_MEMBERS } from '@/data/mockFamily'
import { useFamilyQuery } from '../hooks/useFamilyQuery'

export const FamilyContext = createContext(null)

export const FamilyProvider = ({ children }) => {
  const {
    familyGroup,
    members,
    loading,
    inviteMember,
    removeMember,
    refetch,
    error,
  } = useFamilyQuery()

  const value = useMemo(
    () => ({
      familyGroup: familyGroup ?? DEFAULT_FAMILY_GROUP,
      members: members ?? DEFAULT_FAMILY_MEMBERS,
      loading,
      error,
      inviteMember,
      removeMember,
      refetchFamily: refetch,
    }),
    [familyGroup, members, loading, error, inviteMember, removeMember, refetch],
  )

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  )
}

export const useFamilyContext = () => {
  const ctx = useContext(FamilyContext)
  if (!ctx) {
    throw new Error('useFamilyContext must be used within FamilyProvider')
  }
  return ctx
}

export default FamilyProvider
