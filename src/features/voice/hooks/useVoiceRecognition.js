// ==========================================
// [IMPROVED CODE - PRODUCTION]
// - Continuous recognition to prevent early cut-off
// - Debounce logic for silence detection (1.5s)
// - Improved feedback visibility (Toast) and longer delay (3s)
// ==========================================
import { useEffect, useRef, useCallback } from 'react'
import { useVoiceStore } from '../stores/voiceStore'
import { useVoiceActionStore } from '../stores/voiceActionStore'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from '@shared/components/toast/toastStore'
import { voiceApiClient } from '@core/services/api/voiceApiClient'
import { useCareTargetStore } from '@features/dashboard/store/careTargetStore'
import { useFamilyStore } from '@features/family/store/familyStore'
import { ROUTE_PATHS } from '@config/routes.config'

export const useVoiceRecognition = () => {
  const { 
    isListening, 
    setIsListening, 
    setTranscript, 
    setFeedbackMessage,
    reset 
  } = useVoiceStore()
  
  const { setPendingAction } = useVoiceActionStore()
  
  const recognitionRef = useRef(null)
  const silenceTimer = useRef(null) // 침묵 감지용 타이머
  const navigate = useNavigate()
  const location = useLocation()

  // 보호자 대시보드 컨텍스트 정보 추출
  const activeSeniorMemberId = useCareTargetStore((state) => state.activeSeniorMemberId)
  const { members } = useFamilyStore((state) => ({ members: state.members }))

  // 실제 명령 처리 로직
  const processCommand = useCallback(async (finalTranscript) => {
    if (!finalTranscript) return

    setFeedbackMessage('잠시만요, 찾아볼게요...')
    
    try {
      // 1. 현재 보호자 대시보드인지 확인 및 타겟 데이터 추출
      const isCaregiverDashboard = location.pathname === ROUTE_PATHS.caregiverDashboard
      let targetUserId = null
      let targetUserName = null

      if (isCaregiverDashboard && activeSeniorMemberId) {
        const selectedMember = members?.find(m => String(m.id) === String(activeSeniorMemberId))
        if (selectedMember) {
          targetUserId = selectedMember.userId
          targetUserName = selectedMember.nickname || selectedMember.name
        }
      }

      // 2. API 호출 시 타겟 ID 전달
      const response = await voiceApiClient.processCommand(finalTranscript, targetUserId)
      
      if (response) {
        setFeedbackMessage(response.message)
        // [Improvement] 토스트 메시지로 확실하게 안내
        toast.success(response.message)
        
        // 이동이 필요한 경우
        if (response.type === 'NAVIGATE' || response.type === 'SPEAK_AND_NAVIGATE') {
          if (response.target) {
            
            // [Zustand] 이동 전 명령 저장
            if (response.actionCode) {
              setPendingAction({
                code: response.actionCode,
                params: response.parameters,
                targetPath: response.target
              })
            }

            // 보호자 대시보드 컨텍스트 유지 (이동 시 state 전달)
            const navState = targetUserId ? { targetUserId, targetUserName } : {}

            // [Improvement] 3초 대기 (사용자가 메시지를 읽을 시간 확보)
            setTimeout(() => {
              navigate(response.target, { state: navState })
              reset()
            }, 3000)
            return
          }
        }

        setTimeout(reset, 2500)

      } else {
        setFeedbackMessage('죄송해요, 이해하지 못했어요.')
        setTimeout(reset, 1500)
      }
    } catch (e) {
      console.error('Voice API Error:', e)
      setFeedbackMessage('죄송해요, 연결이 원활하지 않아요.')
      setTimeout(reset, 1500)
    }

  }, [navigate, reset, setFeedbackMessage, setPendingAction, location.pathname, activeSeniorMemberId, members])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'ko-KR'
    // [Improvement] 끊김 방지를 위해 continuous = true 설정
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsListening(true)
      setFeedbackMessage('듣고 있어요...')
    }

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const transcript = event.results[current][0].transcript
      setTranscript(transcript)

      // [Improvement] 말하는 중에는 타이머 초기화 (Debounce)
      if (silenceTimer.current) clearTimeout(silenceTimer.current)
      
      // 1.5초간 침묵하면 인식 종료
      silenceTimer.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
      }, 1500)
    }

    recognition.onend = () => {
      setIsListening(false)
      // 타이머 정리
      if (silenceTimer.current) clearTimeout(silenceTimer.current)

      // 음성 인식이 끝나면 자동으로 명령 처리
      const finalTranscript = useVoiceStore.getState().transcript
      if (finalTranscript) {
        processCommand(finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error('음성 인식 에러:', event.error)
      // 에러 발생 시 타이머 정리
      if (silenceTimer.current) clearTimeout(silenceTimer.current)
      
      setIsListening(false)
      if (event.error === 'not-allowed') {
        toast.error('마이크 권한을 허용해주세요.')
      }
    }

    recognitionRef.current = recognition
  }, [setIsListening, setTranscript, setFeedbackMessage, processCommand])

  const startVoice = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('이미 시작됨', e)
      }
    }
  }, [isListening, setTranscript])

  const stopVoice = useCallback(() => {
    if (recognitionRef.current && isListening) {
      // 강제 종료 시에도 타이머 정리
      if (silenceTimer.current) clearTimeout(silenceTimer.current)
      recognitionRef.current.stop()
    }
  }, [isListening])

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopVoice()
    } else {
      startVoice()
    }
  }, [isListening, startVoice, stopVoice])

  return {
    isListening,
    startVoice,
    stopVoice,
    toggleVoice,
    processCommand // 테스트용: 텍스트 직접 입력 처리
  }
}
