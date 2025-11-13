import { createWorker } from 'tesseract.js'

/**
 * Tesseract.js OCR 서비스
 * 한글, 영어, 일본어, 중국어 등 다국어 지원
 */
class TesseractService {
  constructor() {
    this.worker = null
    this.isInitialized = false
  }

  /**
   * OCR Worker 초기화
   * @param {Array<string>} languages - 언어 코드 배열 (기본: ['kor', 'eng'])
   * @param {Function} onProgress - 진행 상태 콜백
   */
  async initialize(languages = ['kor', 'eng'], onProgress = null) {
    if (this.isInitialized) {
      return
    }

    try {
      this.worker = await createWorker(languages, 1, {
        logger: (m) => {
          if (onProgress && m.status) {
            onProgress({
              status: m.status,
              progress: m.progress || 0,
            })
          }
        },
      })

      this.isInitialized = true
    } catch (error) {
      console.error('Tesseract 초기화 실패:', error)
      throw new Error('OCR 엔진 초기화에 실패했습니다.')
    }
  }

  /**
   * 이미지에서 텍스트 인식
   * @param {File|Blob|string} image - 이미지 파일, Blob 또는 URL
   * @param {Function} onProgress - 진행 상태 콜백
   * @returns {Promise<{text: string, confidence: number}>}
   */
  async recognizeText(image, onProgress = null) {
    if (!this.isInitialized) {
      await this.initialize(['kor', 'eng'], onProgress)
    }

    try {
      const {
        data: { text, confidence },
      } = await this.worker.recognize(image)

      return {
        text: text.trim(),
        confidence: Math.round(confidence),
      }
    } catch (error) {
      console.error('텍스트 인식 실패:', error)
      throw new Error('텍스트 인식에 실패했습니다. 다시 시도해주세요.')
    }
  }

  /**
   * Worker 종료 및 리소스 정리
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
      this.isInitialized = false
    }
  }
}

// 싱글톤 인스턴스
const tesseractService = new TesseractService()

export default tesseractService
