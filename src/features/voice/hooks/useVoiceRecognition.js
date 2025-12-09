// ==========================================
// [ORIGINAL CODE - PRODUCTION]
// ==========================================
import { useEffect, useRef, useCallback } from 'react'
import { useVoiceStore } from '../stores/voiceStore'
import { useVoiceActionStore } from '../stores/voiceActionStore' // [New]
import { matchVoiceCommand } from '../utils/voiceCommandMatcher'
import { setNavigator } from '@core/routing/navigation'
import { useNavigate } from 'react-router-dom'
import { toast } from '@shared/components/toast/toastStore'
import { medicationApiClient } from '@core/services/api/medicationApiClient'
import { medicationLogApiClient } from '@core/services/api/medicationLogApiClient'
import { voiceApiClient } from '@core/services/api/voiceApiClient'

export const useVoiceRecognition = () => {
  const { 
    isListening, 
    setIsListening, 
    setTranscript, 
    setFeedbackMessage,
    reset 
  } = useVoiceStore()
  
  const { setPendingAction } = useVoiceActionStore() // [New]
  
  const recognitionRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'ko-KR'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsListening(true)
      setFeedbackMessage('듣고 있어요...')
    }

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const transcript = event.results[current][0].transcript
      setTranscript(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error('음성 인식 에러:', event.error)
      setIsListening(false)
      if (event.error === 'not-allowed') {
        toast.error('마이크 권한을 허용해주세요.')
      }
    }

    recognitionRef.current = recognition
  }, [setIsListening, setTranscript, setFeedbackMessage])

  // 실제 명령 처리 로직
  const processCommand = useCallback(async (finalTranscript) => {
    if (!finalTranscript) return

    setFeedbackMessage('잠시만요, 찾아볼게요...')
    
    try {
      const response = await voiceApiClient.processCommand(finalTranscript)
      
      if (response) {
        setFeedbackMessage(response.message)
        
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

            setTimeout(() => {
              navigate(response.target) // state 없이 깔끔하게 이동
              reset()
            }, 2000)
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

  }, [navigate, reset, setFeedbackMessage, setPendingAction])

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
      recognitionRef.current.stop()
      // 수동 종료 시 현재까지 인식된 텍스트로 명령 처리 시도
      const currentTranscript = useVoiceStore.getState().transcript
      processCommand(currentTranscript)
    }
  }, [isListening, processCommand])

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

// // ==========================================
// // [TEST CODE - SIMULATION MODE]
// // ==========================================
// import { useEffect, useCallback } from 'react'
// import { useVoiceStore } from '../stores/voiceStore'
// import { matchVoiceCommand } from '../utils/voiceCommandMatcher'
// import { useNavigate } from 'react-router-dom'

// export const useVoiceRecognition = () => {
//   const { 
//     isListening, 
//     setIsListening, 
//     setTranscript, 
//     setFeedbackMessage,
//     reset 
//   } = useVoiceStore()
  
//   const navigate = useNavigate()

//   // [TEST] 시뮬레이션: 마이크 없이 텍스트 입력 처리
//   const simulateVoiceInput = useCallback((text) => {
//     setIsListening(true)
//     setFeedbackMessage('테스트 명령 듣는 중...')
//     setTranscript('') // 초기화

//     // 1. 조금 있다가 텍스트 입력되는 척
//     setTimeout(() => {
//       setTranscript(text)
//     }, 500)

//     // 2. 1.5초 뒤 인식 완료 처리
//     setTimeout(() => {
//       setIsListening(false)
//       processCommand(text)
//     }, 1500)
//   }, [setIsListening, setTranscript, setFeedbackMessage])

//   const processCommand = useCallback((finalTranscript) => {
//     if (!finalTranscript) return

//     const command = matchVoiceCommand(finalTranscript)
    
//     if (command) {
//       setFeedbackMessage(command.message)
      
//       setTimeout(() => {
//         if (command.type === 'NAVIGATE') {
//           navigate(command.target)
//         } else if (command.type === 'ACTION' && command.target === 'GO_BACK') {
//           navigate(-1)
//         }
//         reset()
//       }, 1000)
//     } else {
//       setFeedbackMessage('잘 못 알아들었어요. 다시 말씀해주세요.')
//     }
//   }, [navigate, reset, setFeedbackMessage])

//   // [TEST] 토글 시 무조건 시뮬레이션 실행
//   const toggleVoice = useCallback(() => {
//     if (isListening) {
//       // 강제 종료 (사실 시뮬레이션에서는 별 의미 없음)
//       setIsListening(false)
//     } else {
//       // ★ 테스트할 명령어를 여기서 바꾸세요 ★
//       const testCommands = [
//         "약 목록 보여줘", 
//         "홈으로 가", 
//         "가족 화면", 
//         "설정으로 이동",
//         "채팅방"
//       ]
//       // 랜덤하게 하나 골라서 테스트
//       const randomCmd = testCommands[Math.floor(Math.random() * testCommands.length)]
      
//       simulateVoiceInput(randomCmd)
//     }
//   }, [isListening, simulateVoiceInput])

//   return {
//     isListening,
//     startVoice: () => {}, // 테스트 모드에선 빈 함수
//     stopVoice: () => {},  // 테스트 모드에선 빈 함수
//     toggleVoice
//   }
// }