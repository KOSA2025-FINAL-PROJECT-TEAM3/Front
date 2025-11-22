/**
 * OCR Mock 데이터
 * @file mockOcr.js
 * @description 처방전 OCR 인식 결과 Mock 데이터
 */

export const MOCK_OCR_RESPONSE = {
  text: `약품명: 신규 처방약
복용량: 1정
복용 일정: 하루 1회 (저녁 식후)
주의사항: 자몽 주스와 동시 복용 금지`,
  insights: [
    '인식한 내용을 약 관리 CRUD에 바로 등록하세요.',
    '식단 기록시 자몽, 비타민 K 음식과 충돌 여부를 확인하세요.',
  ],
}

// OCR 응답 생성 헬퍼 (파일 이름 기반)
export const createMockOcrResponse = (fileName = '신규 처방약') => ({
  text: `약품명: ${fileName}
복용량: 1정
복용 일정: 하루 1회 (저녁 식후)
주의사항: 자몽 주스와 동시 복용 금지`,
  insights: [
    '인식한 내용을 약 관리 CRUD에 바로 등록하세요.',
    '식단 기록시 자몽, 비타민 K 음식과 충돌 여부를 확인하세요.',
  ],
})

export default { MOCK_OCR_RESPONSE, createMockOcrResponse }
