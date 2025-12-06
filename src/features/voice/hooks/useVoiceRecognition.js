// ==========================================
// [ORIGINAL CODE - PRODUCTION]
// ==========================================
import { useEffect, useRef, useCallback } from 'react'
import { useVoiceStore } from '../stores/voiceStore'
import { matchVoiceCommand } from '../utils/voiceCommandMatcher'
import { setNavigator } from '@core/routing/navigation' // 전역 네비게이터 사용
import { useNavigate } from 'react-router-dom'
import { toast } from '@shared/components/toast/toastStore'
import { medicationApiClient } from '@core/services/api/medicationApiClient'
import { medicationLogApiClient } from '@core/services/api/medicationLogApiClient'

export const useVoiceRecognition = () => {
  const { 
    isListening, 
    setIsListening, 
    setTranscript, 
    setFeedbackMessage,
    reset 
  } = useVoiceStore()
  
  const recognitionRef = useRef(null)
  const navigate = useNavigate() // 훅 내부 네비게이터

  useEffect(() => {
    // 브라우저 호환성 체크
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'ko-KR' // 한국어 설정
    recognition.continuous = false // 한 문장 끝나면 인식 종료
    recognition.interimResults = true // 중간 결과(말하는 중) 받기

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
      // onend 시점에서 마지막 transcript를 가져오는 로직은 onresult에서 처리됨
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

  // API 명령 처리 핸들러
  const handleApiCommand = useCallback(async (command) => {
    console.log('[Voice] API Command:', command)

    if (command.target === 'COMPLETE_MEDICATION') {
      // 1. 투약 완료 처리
      try {
        setFeedbackMessage('투약 기록을 확인하고 있습니다...')
        const response = await medicationApiClient.getTodayMedications()
        
        // 응답 구조가 { schedules: [...] } 라고 가정 (백엔드 응답에 따라 조정 필요)
        // 만약 List<Response>라면 response 자체가 배열일 수 있음. 안전하게 처리.
        const schedules = response.schedules || (Array.isArray(response) ? response : [])
        
        // 아직 복용하지 않은(isTaken === false) 첫 번째 스케줄 찾기
        // (더 정교하게 하려면 현재 시간과 가장 가까운 스케줄을 찾아야 함)
        const pendingSchedule = schedules.find(s => !s.isTaken)

        if (pendingSchedule) {
          await medicationLogApiClient.completeMedication(pendingSchedule.id)
          
          // 약 이름이 있으면 이름을 포함해서 피드백
          const medName = pendingSchedule.medicationName || '약'
          setFeedbackMessage(`${medName} 복용을 기록했습니다.`)
          
          setTimeout(() => {
            navigate('/medication') // 확인을 위해 약 관리 화면으로 이동
          }, 1500)
        } else {
          setFeedbackMessage('오늘 예정된 약은 이미 모두 드셨거나 일정이 없습니다.')
        }
      } catch (e) {
        console.error('투약 완료 처리 실패:', e)
        setFeedbackMessage('투약 기록 중 오류가 발생했습니다.')
      }

    } else if (command.target === 'SEARCH_SYMPTOM') {
      // 2. 증상 검색
      // "머리가 아파" -> "머리가 아파" 텍스트를 가지고 검색 화면으로 이동
      // 검색 화면에서 location.state.query를 받아 검색하도록 구현 필요
      navigate('/search', { state: { autoSearch: command.originalText } })
    }
  }, [navigate, setFeedbackMessage])

  // 실제 명령 처리 로직 (음성 인식이 끝났을 때 호출하거나, 버튼을 다시 눌렀을 때 처리)
  const processCommand = useCallback((finalTranscript) => {
    if (!finalTranscript) return

    const command = matchVoiceCommand(finalTranscript)
    
    if (command) {
      setFeedbackMessage(command.message)
      
      // 0.5초 뒤 실행 (사용자가 메시지를 볼 시간 확보)
      setTimeout(() => {
        if (command.type === 'NAVIGATE') {
          navigate(command.target)
        } else if (command.type === 'ACTION' && command.target === 'GO_BACK') {
          navigate(-1)
        } else if (command.type === 'API_CALL') {
          handleApiCommand(command)
          // API 호출은 비동기일 수 있으므로 reset() 타이밍 주의 (여기선 간단히 처리)
        }
        
        if (command.type !== 'API_CALL') { // API 호출은 내부에서 피드백 주므로 여기선 리셋 안함
           reset() 
        }
      }, 800)
    } else {
      setFeedbackMessage('잘 못 알아들었어요. 다시 말씀해주세요.')
    }
  }, [navigate, reset, setFeedbackMessage, handleApiCommand])

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
    toggleVoice
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