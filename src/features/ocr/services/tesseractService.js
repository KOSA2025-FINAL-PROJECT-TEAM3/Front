import { createWorker } from 'tesseract.js'

/**
 * 이미지 전처리 - OCR 정확도 향상
 * @param {File|Blob} imageFile - 원본 이미지 파일
 * @returns {Promise<string>} - 전처리된 이미지 Data URL
 */
async function preprocessImage(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target.result

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // 원본 크기 유지 (너무 작으면 확대)
        const scale = Math.max(1, 2000 / Math.max(img.width, img.height))
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // 대비 및 밝기 조정
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          // 대비 증가 (1.5배)
          data[i] = Math.min(255, ((data[i] - 128) * 1.5) + 128)     // R
          data[i + 1] = Math.min(255, ((data[i + 1] - 128) * 1.5) + 128) // G
          data[i + 2] = Math.min(255, ((data[i + 2] - 128) * 1.5) + 128) // B

          // 그레이스케일 변환 (선명도 향상)
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          data[i] = data[i + 1] = data[i + 2] = gray
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }

      img.onerror = reject
    }

    reader.onerror = reject
    reader.readAsDataURL(imageFile)
  })
}

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
      // 이미지 전처리 (File/Blob인 경우만)
      let processedImage = image
      if (image instanceof File || image instanceof Blob) {
        if (onProgress) {
          onProgress({ status: 'preprocessing image', progress: 0.1 })
        }
        processedImage = await preprocessImage(image)
      }

      const {
        data: { text, confidence },
      } = await this.worker.recognize(processedImage)

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
