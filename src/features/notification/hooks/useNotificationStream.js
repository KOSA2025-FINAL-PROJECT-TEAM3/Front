import logger from "@core/utils/logger"
/**
 * useNotificationStream Hook
 * - SSE 연결 관리
 * - 자동 연결/해제
 * - 토큰 갱신 시 재연결
 * - Store에 실시간 알림 추가
 */

import { useEffect } from 'react'
import { useAuthStore } from '@features/auth/store/authStore'
import { useNotificationStore } from '@features/notification/store/notificationStore'
import { notificationApiClient } from '@core/services/api/notificationApiClient'
import { toast } from '@shared/components/toast/toastStore'
import { useLocation } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'

const PUBLIC_PATHS = new Set([
  ROUTE_PATHS.login,
  ROUTE_PATHS.signup,
  ROUTE_PATHS.root,
  ROUTE_PATHS.inviteCodeEntry,
  ROUTE_PATHS.inviteAccept,
  ROUTE_PATHS.kakaoCallback,
])

export const useNotificationStream = (onNotification) => {
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const addRealtimeNotification = useNotificationStore((state) => state.addRealtimeNotification)
  const setDietJobResult = useNotificationStore((state) => state.setDietJobResult)
  const setOcrJobResult = useNotificationStore((state) => state.setOcrJobResult)
  const location = useLocation()

  useEffect(() => {
    // SSE 연결 조건: 인증되었고 토큰이 있어야 함, 그리고 public 페이지가 아니어야 함
    const isPublic = PUBLIC_PATHS.has(location.pathname)
    if (!isAuthenticated || !token || isPublic) {
      return
    }

    const handleMessage = (data) => {
      // Store에 실시간 알림 추가
      addRealtimeNotification(data)

      if (onNotification) {
        onNotification(data)
      }

      // 알림 타입별 처리
      switch (data.type) {
        case 'medication.logged':
          // 약 복용 성공 알림 (성공 토스트)
          toast.success(data.message || '약을 복용했습니다')
          break

        case 'medication.missed':
          // 약 복용 누락 알림 (경고 토스트 - 지속)
          toast.warning(data.message || '약 복용 시간을 놓쳤습니다', {
            duration: 0, // 수동 해제 필요
          })
          break
        case 'medication.missed.aggregated':
          // 여러 약 미복용 알림 (경고 토스트 - 지속)
          toast.warning(data.message || '여러 약 복용 시간을 놓쳤습니다', {
            duration: 0,
          })
          break
        case 'diet.warning':
          toast.warning(data.message || '식단 경고가 도착했습니다')
          break
        case 'diet.job.done':
          setDietJobResult(data)
          if (data.status === 'DONE') {
            toast.success('식단 분석이 완료되었습니다')
          } else if (data.status === 'FAILED') {
            toast.error(`식단 분석 실패: ${data.error || '오류 발생'}`)
          }
          break
        case 'ocr.job.done':
          setOcrJobResult(data)
          if (data.status === 'DONE') {
            toast.success('OCR 처리가 완료되었습니다')
          } else if (data.status === 'FAILED') {
            toast.error(`OCR 처리 실패: ${data.error || '오류 발생'}`)
          }
          break

        case 'invite.accepted':
          // 초대 수락 알림 - 보낸 초대 목록에서 제거
          import('@features/family/store/familyStore').then(({ useFamilyStore }) => {
            useFamilyStore.getState().removeInviteById(data.inviteId)
          })
          toast.success(data.message || '초대가 수락되었습니다')
          break

        default:
          // 기타 알림 (정보 토스트)
          toast.info(data.message || '새로운 알림이 있습니다')
          break
      }
    }

    const handleError = (error) => {
      logger.error('Notification stream error:', error)
      // 토큰 만료 등의 에러는 auth interceptor가 처리
    }

    try {
      notificationApiClient.subscribe(token, handleMessage, handleError)
    } catch (error) {
      logger.error('Failed to subscribe to notifications:', error)
    }

    // Cleanup: 언마운트 시 연결 해제
    return () => {
      notificationApiClient.disconnect()
    }
  }, [isAuthenticated, token, onNotification, addRealtimeNotification, setDietJobResult, setOcrJobResult, location.pathname])
}
