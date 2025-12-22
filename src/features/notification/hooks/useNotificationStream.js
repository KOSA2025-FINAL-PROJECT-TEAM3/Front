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
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { fromOCRResponse } from '@/types/ocr.types'

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
  const user = useAuthStore((state) => state.user) // 사용자 정보 가져오기
  const userId = user?.id || user?.userId
  const addRealtimeNotification = useNotificationStore((state) => state.addRealtimeNotification)
  const setDietJobResult = useNotificationStore((state) => state.setDietJobResult)
  const setOcrJobResult = useNotificationStore((state) => state.setOcrJobResult)
  const setOcrScanning = useNotificationStore((state) => state.setOcrScanning)
  const setDietAnalyzing = useNotificationStore((state) => state.setDietAnalyzing)
  const location = useLocation()
  const navigate = useNavigate()

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
          setDietAnalyzing(false) // 분석 완료 - 전역 로딩 상태 해제

          if (data.status === 'DONE') {
            const result = data.result || (data.job && data.job.result)
            logger.info('Diet 분석 완료 알림 수신:', result)

            // 알림 목록에 추가
            addRealtimeNotification({
              id: `diet-${data.jobId}`,
              type: 'diet.job.done',
              title: '식단 분석 완료',
              message: '식단 분석이 완료되었습니다. 결과를 확인하려면 클릭하세요.',
              createdAt: new Date().toISOString(),
              read: false,
              result: result
            })

            toast.success('식단 분석이 완료되었습니다. 여기를 클릭하여 확인하세요!', {
              duration: 10000,
              onClick: () => {
                navigate(ROUTE_PATHS.dietLog, {
                  state: {
                    initialAnalysisResult: result
                  }
                })
              }
            })
          } else if (data.status === 'FAILED') {
            toast.error(`식단 분석 실패: ${data.error || '오류 발생'}`)
          }
          break
        case 'ocr.job.done':
          setOcrJobResult(data)
          setOcrScanning(false) // 분석 완료 - 전역 로딩 상태 해제
          if (data.status === 'DONE') {
            const result = data.result
            logger.info('OCR 분석 완료 알림 수신:', result)

            // 알림 목록에 추가 (휘발성 방지)
            addRealtimeNotification({
              id: `ocr-${data.jobId}`,
              type: 'ocr.job.done',
              title: 'OCR 분석 완료',
              message: '처방전 분석이 완료되었습니다. 결과를 확인하려면 클릭하세요.',
              createdAt: new Date().toISOString(),
              read: false,
              result: result // NotificationPage에서 이동할 때 사용할 데이터 포함
            })

            // 안전 장치: 사용자 ID별로 jobId만 백업 (데이터는 Redis에서 가져옴)
            if (userId && data.jobId) {
              try {
                localStorage.setItem(`ocr_result_${userId}`, JSON.stringify({
                  timestamp: Date.now(),
                  userId: userId,
                  jobId: data.jobId // 번호표만 저장
                }))
              } catch (e) {
                console.error('OCR 결과 백업 실패', e)
              }
            }

            toast.success('처방전 분석이 완료되었습니다. 여기를 클릭하여 확인하세요!', {
              duration: 10000,
              onClick: () => {
                logger.debug('분석 완료 알림 클릭됨. 결과 데이터:', result)
                if (result && result.medications) {
                  const medications = fromOCRResponse(result.medications)
                  // 약 등록 페이지로 이동하며 데이터 전달
                  // 약 등록 페이지로 이동하며 데이터 전달

                  // 저장된 메타데이터(대리 등록 대상) 확인
                  let targetMeta = {}
                  if (userId) {
                    try {
                      const savedJob = localStorage.getItem(`ocr_running_job_${userId}`)
                      if (savedJob) {
                        const parsedJob = JSON.parse(savedJob)
                        // Job ID가 일치할 때만 타겟 정보 사용
                        if (parsedJob.jobId === data.jobId && parsedJob.targetUserId) {
                          targetMeta = {
                            targetUserId: parsedJob.targetUserId,
                            targetUserName: parsedJob.targetUserName // 저장했다면 사용
                          }
                        }
                      }
                    } catch (e) {
                      console.error(e)
                    }
                  }

                  navigate(ROUTE_PATHS.prescriptionAdd, {
                    state: {
                      ...targetMeta,
                      ocrData: {
                        medications,
                        hospitalName: result.hospitalName || result.clinicName || '',
                        pharmacyName: result.pharmacyName || '',
                        startDate: result.prescribedDate || new Date().toISOString().split('T')[0]
                      }
                    }
                  })
                } else {
                  logger.warn('OCR 결과 데이터가 비어있습니다.')
                  toast.error('추출된 약물 정보가 없습니다. 수동으로 등록해주세요.')
                  navigate(ROUTE_PATHS.prescriptionAdd)
                }
              }
            })
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
  }, [isAuthenticated, token, onNotification, addRealtimeNotification, setDietJobResult, setOcrJobResult, location.pathname, navigate, setDietAnalyzing, setOcrScanning, userId])
}
