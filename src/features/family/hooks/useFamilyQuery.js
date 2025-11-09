import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DEFAULT_FAMILY_GROUP,
  DEFAULT_FAMILY_MEMBERS,
} from '@/data/mockFamily'
import { FamilyMockService } from '../services/familyService'

const FAMILY_QUERY_KEY = ['family', 'group']

/**
 * useFamilyQuery
 * - React Query 기반 가족 데이터 훅 (Stage 3 요구사항)
 */
export const useFamilyQuery = () => {
  const queryClient = useQueryClient()

  const familyQuery = useQuery({
    queryKey: FAMILY_QUERY_KEY,
    queryFn: () => FamilyMockService.getFamily(),
  })

  const inviteMutation = useMutation({
    mutationFn: (payload) => FamilyMockService.inviteMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_QUERY_KEY })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (memberId) => FamilyMockService.removeMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_QUERY_KEY })
    },
  })

  return {
    familyGroup: familyQuery.data?.group ?? DEFAULT_FAMILY_GROUP,
    members: familyQuery.data?.members ?? DEFAULT_FAMILY_MEMBERS,
    loading: familyQuery.isLoading,
    error: familyQuery.error,
    refetch: familyQuery.refetch,
    inviteMember: inviteMutation.mutateAsync,
    removeMember: async (memberId) => {
      await removeMutation.mutateAsync(memberId)
      return memberId
    },
  }
}

export default useFamilyQuery
