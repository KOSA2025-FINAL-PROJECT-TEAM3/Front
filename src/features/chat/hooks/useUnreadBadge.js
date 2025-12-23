import { useQuery, useQueryClient } from '@tanstack/react-query';
import { familyChatApiClient } from '@core/services/api/familyChatApiClient';
import { familyApiClient } from '@core/services/api/familyApiClient';
import { notificationApiClient } from '@core/services/api/notificationApiClient';
import { useAuthStore } from '@features/auth/store/authStore';
import { useEffect } from 'react';
import logger from '@core/utils/logger';
import { STORAGE_KEYS } from '@config/constants';
import { isJwtExpiredOrNearExpiry, refreshAuthToken } from '@core/interceptors/authInterceptor';

/**
 * 안 읽은 채팅 메시지 개수를 조회하고 SSE 이벤트를 통해 갱신하는 Hook
 * @param {number|null} targetGroupId - 특정 그룹의 개수만 조회하려면 ID 전달, 없으면 전체 합계 조회
 * @returns {object} { unreadCount, isLoading, isError }
 */
export const useUnreadBadge = (targetGroupId = null) => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id || user?.userId;

  const { data: unreadCount = 0, isLoading, isError } = useQuery({
    queryKey: targetGroupId 
      ? ['unreadChatCount', targetGroupId, currentUserId] 
      : ['totalUnreadChatCount', currentUserId],
    queryFn: async () => {
      if (!currentUserId || !token) return 0;

      // 1. 특정 그룹 ID가 있는 경우: 해당 그룹의 개수만 조회
      if (targetGroupId) {
        try {
          return await familyChatApiClient.getUnreadCount(targetGroupId, currentUserId);
        } catch (error) {
          logger.error(`Failed to fetch unread count for group ${targetGroupId}:`, error);
          return 0;
        }
      }

      // 2. 그룹 ID가 없는 경우: 전체 그룹의 합계 조회
      const familySummary = await queryClient.fetchQuery({
        queryKey: ['familyGroups'],
        queryFn: () => familyApiClient.getSummary(),
        staleTime: 5 * 60 * 1000,
      });
      const allFamilyGroups = familySummary?.groups || [];

      let total = 0;
      for (const group of allFamilyGroups) {
        try {
          const count = await familyChatApiClient.getUnreadCount(group.id, currentUserId);
          total += count;
        } catch (error) {
          logger.error(`Failed to fetch unread count for family group ${group.id}:`, error);
        }
      }
      return total;
    },
    enabled: !!currentUserId && !!token,
    staleTime: 10 * 1000,
    refetchInterval: 60 * 1000,
  });

  // SSE 이벤트 리스너 등록
  useEffect(() => {
    if (!token || !currentUserId) {
      notificationApiClient.disconnect();
      return;
    }

    const handleSseMessage = (eventData) => {
      if (eventData.type === 'chat-update') {
        logger.info('SSE chat-update event received:', eventData);
        // 관련된 쿼리 무효화
        if (targetGroupId) {
           // 특정 그룹을 보고 있는 경우, 해당 그룹 ID가 포함된 이벤트라면 갱신하거나 단순히 갱신
           // 여기서는 간단히 해당 그룹 쿼리 무효화
           queryClient.invalidateQueries(['unreadChatCount', targetGroupId, currentUserId]);
        } else {
           // 전체 합계 보고 있는 경우
           queryClient.invalidateQueries(['totalUnreadChatCount', currentUserId]);
        }
      }
    };

    const handleError = (error) => {
      logger.error('SSE connection error in useUnreadBadge:', error);
    };

    let cancelled = false;

    const startSubscription = async () => {
      try {
        let nextToken = token;
        if (typeof window !== 'undefined') {
          nextToken = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || token;
        }

        if (nextToken && isJwtExpiredOrNearExpiry(nextToken)) {
          nextToken = await refreshAuthToken();
        }

        if (cancelled || !nextToken) {
          logger.warn('SSE chat subscription halted: missing or expired token');
          return;
        }

        notificationApiClient.subscribe(nextToken, handleSseMessage, handleError);
      } catch (error) {
        logger.error('SSE chat subscription failed:', error);
      }
    };

    startSubscription();

    return () => {
      cancelled = true;
      notificationApiClient.disconnect();
    };
  }, [token, currentUserId, queryClient, targetGroupId]);

  // 하위 호환성을 위해 totalUnreadCount로도 반환 (필요시)
  return { unreadCount, totalUnreadCount: unreadCount, isLoading, isError };
};
