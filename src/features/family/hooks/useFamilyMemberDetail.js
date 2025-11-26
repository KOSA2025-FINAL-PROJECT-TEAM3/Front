import { useQuery } from '@tanstack/react-query'
import { useFamilyStore } from '../store/familyStore'

/**
 * 가족 구성원 상세 (프론트 로컬 스토어 기반)
 * 백엔드에서 별도 상세 API가 없으므로, 이미 로드된 members 배열에서 찾아 반환한다.
 */
export const useFamilyMemberDetail = (memberId) => {
  const members = useFamilyStore((state) => state.members || [])

  return useQuery({
    queryKey: ['family', 'member', memberId, members],
    enabled: Boolean(memberId),
    staleTime: 60 * 1000,
    queryFn: async () => {
      const target = members.find(
        (m) => m?.id?.toString() === memberId?.toString(),
      )
      if (!target) {
        throw new Error('구성원을 찾을 수 없습니다.')
      }

      // 상세 데이터(복약/순응도)는 아직 목 기반이므로 비워둔다.
      return {
        member: target,
        medications: [],
        adherence: 0,
      }
    },
  })
}

export default useFamilyMemberDetail
