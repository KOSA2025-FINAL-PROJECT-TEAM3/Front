import { useCallback, useEffect, useMemo, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import OCRControlPanel from '../components/OCRControlPanel.jsx'
import OCRResultPreview from '../components/OCRResultPreview.jsx'
import styles from './PrescriptionScan.module.scss'
import tesseractService from '../services/tesseractService'

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

  const handleRecognize = useCallback(async () => {
    if (!file) return
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      // Tesseract.js로 텍스트 인식 (한글, 영어 지원)
      const { text, confidence } = await tesseractService.recognizeText(
        file,
        (progressData) => {
          setProgress(progressData)
        }
      )

      if (!text || text.trim().length === 0) {
        throw new Error('텍스트를 인식할 수 없습니다. 더 선명한 이미지를 사용해주세요.')
      }

      // 결과 저장
      setResult({
        text,
        confidence,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      console.error('OCR 처리 오류:', err)
      setError(err.message || '텍스트 인식에 실패했습니다.')
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
      if (progress.status === 'loading language traineddata') {
        return `언어 데이터 로딩 중... ${Math.round(progress.progress * 100)}%`
      }
      if (progress.status === 'recognizing text') {
        return `텍스트 인식 중... ${Math.round(progress.progress * 100)}%`
      }
      return 'AI가 이미지를 분석하는 중입니다...'
    }
    if (file && !result) return '인식 버튼을 눌러 텍스트를 추출하세요'
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
            <label className={styles.fileDrop}>
              <input
                key={inputKey}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              {file ? <span>{file.name}</span> : <span>📷 카메라로 촬영 또는 갤러리에서 선택</span>}
            </label>
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
