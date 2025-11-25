import ApiClient from './ApiClient'
import { createMockOcrResponse } from '@/data/mockOcr'

/**
 * OCR API 클라이언트
 *
 * 백엔드 엔드포인트:
 * - POST /api/ocr/scan - 처방전 스캔
 * - POST /api/ocr/extract - 약물 이미지 OCR
 */
class OcrApiClient extends ApiClient {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082',
      basePath: '/api/ocr',
    })
  }

  /**
   * 처방전 이미지 스캔
   *
   * @param {FormData} formData - 이미지 파일 (key: 'file')
   * @returns {Promise<Object>} OCR 응답
   *
   * 응답 형식:
   * {
   *   success: boolean,
   *   data: {
   *     medications: [
   *       {
   *         name: string,         // 약품명
   *         dosage: string,       // 용량 (예: "500mg")
   *         frequency: string,    // 빈도 (예: "1일 3회")
   *         duration: string,     // 기간 (예: "7일")
   *         sideEffects: string | null,
   *         precautions: string | null,
   *         interactions: string | null
   *       }
   *     ],
   *     confidence: number,       // 신뢰도 (0-1)
   *     rawText: string,          // 원본 추출 텍스트
   *     ocrEngine: string,        // 사용된 OCR 엔진
   *     processingTime: number    // 처리 시간 (초)
   *   },
   *   message: string | null,
   *   timestamp: string
   * }
   */
  scan(formData) {
    return this.post('/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60초 타임아웃
    }, {
      mockResponse: () => createMockOcrResponse(formData?.get('file')?.name),
    })
  }

  /**
   * 약물 이미지 OCR
   *
   * @param {FormData} formData - 이미지 파일
   * @returns {Promise<Object>} OCR 응답
   */
  extract(formData) {
    return this.post('/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60초 타임아웃
    }, {
      mockResponse: () => createMockOcrResponse(formData?.get('file')?.name),
    })
  }
}

export const ocrApiClient = new OcrApiClient()
export { OcrApiClient }
