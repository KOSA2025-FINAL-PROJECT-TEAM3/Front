import { useQuery } from '@tanstack/react-query'
import { FamilyMockService } from '../services/familyService'

export const useFamilyMemberDetail = (memberId) => {
  return useQuery({
    queryKey: ['family', 'member', memberId],
    enabled: Boolean(memberId),
    queryFn: () => FamilyMockService.getMemberDetail(memberId),
  })
}

export default useFamilyMemberDetail
