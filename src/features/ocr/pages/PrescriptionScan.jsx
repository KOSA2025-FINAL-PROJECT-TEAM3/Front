import { useCallback, useEffect, useMemo, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import OCRControlPanel from '../components/OCRControlPanel.jsx'
import OCRResultPreview from '../components/OCRResultPreview.jsx'
import styles from './PrescriptionScan.module.scss'
import ocrApiService from '../services/ocrApiService'

export const PrescriptionScanPage = () => {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [inputKey, setInputKey] = useState(0)
  const [progress, setProgress] = useState({ status: '', progress: 0 })
  const [error, setError] = useState(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(nextFile)
    setPreviewUrl(URL.createObjectURL(nextFile))
    setResult(null)
    setError(null)
    setProgress({ status: '', progress: 0 })
  }

  const handleCameraClick = () => {
    document.getElementById('camera-input').click()
  }

  const handleGalleryClick = () => {
    document.getElementById('gallery-input').click()
  }

  const handleRecognize = useCallback(async () => {
    if (!file) return
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      // 백엔드 OCR API 호출 (OpenAI GPT-4o-mini)
      const ocrResult = await ocrApiService.extractMedication(
        file,
        (progressData) => {
          setProgress(progressData)
        }
      )

      if (!ocrResult.medications || ocrResult.medications.length === 0) {
        throw new Error('약물 정보를 추출할 수 없습니다. 더 선명한 이미지를 사용해주세요.')
      }

      // 결과 저장 (medications 배열을 텍스트로 변환)
      const medicationText = ocrResult.medications
        .map((med, idx) => `${idx + 1}. ${med.name || '알 수 없음'} - ${med.dosage || ''} ${med.frequency || ''}`.trim())
        .join('\n')

      setResult({
        text: medicationText || ocrResult.rawText,
        confidence: ocrResult.confidence,
        timestamp: new Date().toISOString(),
        medications: ocrResult.medications,
        ocrEngine: ocrResult.ocrEngine,
      })
    } catch (err) {
      console.error('OCR 처리 오류:', err)
      setError(err.message || '약물 정보 추출에 실패했습니다.')
    } finally {
      setIsProcessing(false)
      setProgress({ status: 'done', progress: 100 })
    }
  }, [file])

  const handleReset = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setProgress({ status: '', progress: 0 })
    setInputKey((key) => key + 1)
  }, [previewUrl])

  const statusMessage = useMemo(() => {
    if (error) return `오류: ${error}`
    if (isProcessing) {
      if (progress.status === 'uploading') {
        return '이미지 업로드 중...'
      }
      if (progress.status === 'processing') {
        return 'AI가 약물 정보를 분석하는 중입니다...'
      }
      return 'AI가 이미지를 분석하는 중입니다...'
    }
    if (file && !result) return '인식 버튼을 눌러 약물 정보를 추출하세요'
    if (result) return `인식 완료! (정확도: ${result.confidence}%)`
    return '카메라로 촬영하거나 갤러리에서 이미지를 선택하세요'
  }, [file, isProcessing, result, error, progress])

  return (
    <MainLayout>
      <div className={styles.ocrLayout}>
        <section className={styles.hero}>
          <div className={styles.heroCard}>
            <p className={styles.kicker}>Stage 4 · OCR</p>
            <h1>처방전 스캔</h1>
            <p>{statusMessage}</p>
          </div>
        </section>

        <section className={styles.workspace}>
          <div className={styles.workspaceCard}>
            <p className={styles.label}>이미지 선택</p>

            {/* 숨겨진 파일 입력 */}
            <input
              id="camera-input"
              key={`camera-${inputKey}`}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <input
              id="gallery-input"
              key={`gallery-${inputKey}`}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />

            {/* 버튼 영역 */}
            <div className={styles.buttonGroup}>
              <button type="button" onClick={handleCameraClick} className={styles.captureButton}>
                📷 카메라로 촬영
              </button>
              <button type="button" onClick={handleGalleryClick} className={styles.uploadButton}>
                🖼️ 갤러리에서 선택
              </button>
            </div>

            {file && (
              <div className={styles.fileInfo}>
                <span>선택된 파일: {file.name}</span>
              </div>
            )}

            <p className={styles.statusNote}>{statusMessage}</p>
            {isProcessing && progress.progress > 0 && (
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress.progress * 100}%` }}
                />
              </div>
            )}
          </div>

          <OCRControlPanel onRecognize={handleRecognize} onReset={handleReset} isProcessing={isProcessing || !file} />

          <OCRResultPreview
            imageSrc={previewUrl}
            resultText={result?.text}
            confidence={result?.confidence}
            error={error}
          />
        </section>
      </div>
    </MainLayout>
  )
}

export default PrescriptionScanPage
