import ApiClient from './ApiClient'

class OcrApiClient extends ApiClient {
  constructor() {
    super({ basePath: '/api/ocr' })
  }

  recognize(formData) {
    const mockResponse = () => ({
      text: `약품명: ${formData?.get('file')?.name || '신규 처방약'}
복용량: 1정
복용 일정: 하루 1회 (저녁 식후)
주의사항: 자몽 주스와 동시 복용 금지`,
      insights: [
        '인식한 내용을 약 관리 CRUD에 바로 등록하세요.',
        '식단 기록시 자몽, 비타민 K 음식과 충돌 여부를 확인하세요.',
      ],
    })

    return this.post('/recognize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }, { mockResponse })
  }
}

export const ocrApiClient = new OcrApiClient()
export { OcrApiClient }
