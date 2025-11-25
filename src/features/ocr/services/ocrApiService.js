import { ApiClient } from '@core/services/api/apiclient'

const apiClient = new ApiClient({ basePath: '/api/ocr' })

/**
 * 백엔드 OCR API 서비스
 * OpenAI GPT-4o-mini 기반 약물 정보 추출
 */
class OcrApiService {
    /**
     * 이미지에서 약물 정보 추출
     * @param {File|Blob} imageFile - 이미지 파일
     * @param {Function} onProgress - 진행 상태 콜백 (선택)
     * @returns {Promise<{medications: Array, confidence: number, rawText: string}>}
     */
    async extractMedication(imageFile, onProgress = null) {
        try {
            if (onProgress) {
                onProgress({ status: 'uploading', progress: 0.1 })
            }

            const formData = new FormData()
            formData.append('file', imageFile)

            if (onProgress) {
                onProgress({ status: 'processing', progress: 0.3 })
            }

            const response = await apiClient.post('/extract', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // 60초 대기
            })

            if (onProgress) {
                onProgress({ status: 'done', progress: 1.0 })
            }

            // ApiResponse<OCRResponse> 구조에서 데이터 추출
            const ocrData = response.data || response

            return {
                medications: ocrData.medications || [],
                confidence: ocrData.confidence || 0,
                rawText: ocrData.rawText || '',
                ocrEngine: ocrData.ocrEngine || 'OpenAI GPT-4o-mini',
                processingTime: ocrData.processingTime || 0,
            }
        } catch (error) {
            console.error('OCR API 호출 실패:', error)

            if (error.response) {
                // 서버 응답 오류
                throw new Error(
                    error.response.data?.message ||
                    `서버 오류 (${error.response.status}): 이미지 분석에 실패했습니다.`
                )
            } else if (error.request) {
                // 네트워크 오류
                throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
            } else {
                // 기타 오류
                throw new Error(error.message || '이미지 분석에 실패했습니다.')
            }
        }
    }

    /**
     * 처방전 스캔 (기존 API와 호환)
     * @param {File|Blob} imageFile - 이미지 파일
     * @param {Function} onProgress - 진행 상태 콜백
     * @returns {Promise<{medications: Array, confidence: number, rawText: string}>}
     */
    async scanPrescription(imageFile, onProgress = null) {
        try {
            if (onProgress) {
                onProgress({ status: 'uploading', progress: 0.1 })
            }

            const formData = new FormData()
            formData.append('file', imageFile)

            if (onProgress) {
                onProgress({ status: 'processing', progress: 0.3 })
            }

            const response = await apiClient.post('/scan', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            if (onProgress) {
                onProgress({ status: 'done', progress: 1.0 })
            }

            const ocrData = response.data || response

            return {
                medications: ocrData.medications || [],
                confidence: ocrData.confidence || 0,
                rawText: ocrData.rawText || '',
                ocrEngine: ocrData.ocrEngine || 'OpenAI GPT-4o-mini',
                processingTime: ocrData.processingTime || 0,
            }
        } catch (error) {
            console.error('처방전 스캔 API 호출 실패:', error)
            throw new Error(error.response?.data?.message || '처방전 분석에 실패했습니다.')
        }
    }
}

// 싱글톤 인스턴스
const ocrApiService = new OcrApiService()

export default ocrApiService
