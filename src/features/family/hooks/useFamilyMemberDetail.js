import logger from "@core/utils/logger"
import { useQuery } from '@tanstack/react-query'
import { useFamilyStore } from '../store/familyStore'
import { familyApiClient } from '@core/services/api/familyApiClient'

/**
 * 가족 구성원 상세 정보 및 약 목록 조회
 */
export const useFamilyMemberDetail = (memberId) => {
  const members = useFamilyStore((state) => state.members || [])
  const familyGroups = useFamilyStore((state) => state.familyGroups || [])

  return useQuery({
    queryKey: ['family', 'member', memberId],
    enabled: Boolean(memberId),
    staleTime: 60 * 1000,
    queryFn: async () => {
      // 1. 현재 선택된 그룹의 members에서 먼저 찾기
      let target = members.find(
        (m) => m?.id?.toString() === memberId?.toString(),
      )
      
      // 2. 못 찾으면 모든 그룹의 members에서 찾기
      if (!target) {
        const allMembers = familyGroups.flatMap((group) => group.members || [])
        target = allMembers.find(
          (m) => m?.id?.toString() === memberId?.toString(),
        )
      }
      
      if (!target) {
        throw new Error('구성원을 찾을 수 없습니다.')
      }

      // 가족 구성원의 약 목록 조회
      let medications = []
      try {
        if (target.userId) {
          medications = await familyApiClient.getMemberMedications(target.userId)
        }
      } catch (error) {
        logger.error('약 목록 조회 실패:', error)
      }

      return {
        member: target,
        medications: medications || [],
        adherence: 0,
      }
    },
  })
}

export default useFamilyMemberDetail
