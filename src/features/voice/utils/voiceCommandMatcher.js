import { ROUTE_PATHS } from '@config/routes.config'

/**
 * 음성 명령을 분석하여 실행할 액션을 반환합니다.
 * @param {string} transcript - 인식된 텍스트
 * @returns {Object|null} - { type: 'NAVIGATE' | 'ACTION', target: string, message: string }
 */
export const matchVoiceCommand = (transcript) => {
  const cleanText = transcript.trim().replace(/\s+/g, '').toLowerCase() // 공백 제거 및 소문자화

  // 1. 네비게이션 명령 (페이지 이동)
  const navCommands = [
    {
      keywords: ['홈', '메인', '처음', '대시보드'],
      target: ROUTE_PATHS.seniorDashboard,
      message: '홈 화면으로 이동합니다.'
    },
    {
      keywords: ['약', '복용', '먹을거'],
      target: ROUTE_PATHS.medication,
      message: '약 관리 화면으로 이동합니다.'
    },
    {
      keywords: ['가족', '아들', '딸', '보호자'],
      target: ROUTE_PATHS.family,
      message: '가족 목록을 보여드릴게요.'
    },
    {
      keywords: ['검색', '찾아', '뭐야'],
      target: ROUTE_PATHS.search,
      message: '통합 검색 화면을 엽니다.'
    },
    {
      keywords: ['상담', '의사', '선생님'],
      target: ROUTE_PATHS.counsel,
      message: '상담 화면으로 연결합니다.'
    },
    {
      keywords: ['식단', '밥', '음식'],
      target: ROUTE_PATHS.dietLog,
      message: '식단 기록 화면으로 갑니다.'
    },
    {
      keywords: ['설정', '내정보', '바꿔'],
      target: ROUTE_PATHS.settings,
      message: '설정 화면입니다.'
    },
    {
        keywords: ['채팅', '대화', '이야기'],
        target: ROUTE_PATHS.chatList,
        message: '채팅 목록으로 이동합니다.'
    }
  ]

  for (const cmd of navCommands) {
    if (cmd.keywords.some(k => cleanText.includes(k))) {
      return { type: 'NAVIGATE', target: cmd.target, message: cmd.message }
    }
  }

  // 2. 기능 명령 (예: 뒤로가기)
  if (cleanText.includes('뒤로') || cleanText.includes('이전')) {
    return { type: 'ACTION', target: 'GO_BACK', message: '이전 화면으로 갑니다.' }
  }

  // 3. API 실행 명령 (투약 체크, 증상 검색)
  const actionCommands = [
    {
      // 투약 완료: "약 먹었어", "복용 완료"
      keywords: ['먹었어', '완료', '체크', '했어'],
      requiredContext: ['약', '복용'],
      type: 'API_CALL',
      target: 'COMPLETE_MEDICATION',
      message: '약을 복용하셨군요! 기록을 확인합니다.'
    },
    {
      // 증상/약 검색: "머리 아파", "이 약 뭐야", "배 아픈데"
      keywords: ['아파', '증상', '때문에', '효능', '부작용', '뭐야'],
      requiredContext: ['약', '머리', '배', '허리', '다리', '검색', '알려줘'],
      type: 'API_CALL',
      target: 'SEARCH_SYMPTOM',
      message: '관련 증상이나 약 정보를 검색해 드릴게요.'
    }
  ]

  for (const cmd of actionCommands) {
    const hasContext = cmd.requiredContext ? cmd.requiredContext.some(k => cleanText.includes(k)) : true
    const hasKeyword = cmd.keywords.some(k => cleanText.includes(k))
    
    if (hasContext && hasKeyword) {
      return { type: cmd.type, target: cmd.target, message: cmd.message, originalText: cleanText }
    }
  }

  return null // 매칭되는 명령 없음
}
