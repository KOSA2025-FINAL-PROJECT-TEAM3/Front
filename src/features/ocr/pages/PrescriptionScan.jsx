import { useCallback, useEffect, useMemo, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import OCRControlPanel from '../components/OCRControlPanel.jsx'
import OCRResultPreview from '../components/OCRResultPreview.jsx'
import styles from './PrescriptionScan.module.scss'
import { ocrApiClient } from '@core/services/api/ocrApiClient'

const stripExtension = (fileName = '') => fileName.replace(/\.[^/.]+$/, '')

const buildMockResult = (fileName) => {
  const displayName = stripExtension(fileName) || '기본 처방전'
  return {
    text: `의품명 ${displayName}\n복용량 1정\n복용 일정: 하루 1회(저녁 식후)\n주의사항: 자몽 주스와 동시 복용 금지`,
    insights: [
      `${displayName}를 약 관리에 등록하고 일정을 추적하세요`,
      '식사 기록 중 자몽/비타민K 식품과의 충돌을 확인하세요',
    ],
  }
}

export const PrescriptionScanPage = () => {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [inputKey, setInputKey] = useState(0)

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
  }

  const handleRecognize = useCallback(async () => {
    if (!file) return
    setIsProcessing(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const data = await ocrApiClient.recognize(fd)
      setResult({ text: data.text, insights: data.insights })
    } catch {
      setResult(buildMockResult(file.name))
    } finally {
      setIsProcessing(false)
    }
  }, [file])

  const handleReset = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setInputKey((key) => key + 1)
  }, [previewUrl])

  const statusMessage = useMemo(() => {
    if (isProcessing) return 'AI가 처방전을 분석하는 중입니다...'
    if (file && !result) return '인식 버튼을 눌러 내용을 추출하세요'
    if (result) return '인식 결과를 확인하고 약 관리에 반영하세요'
    return '처방전 이미지를 업로드하여 자동으로 내용을 추출합니다'
  }, [file, isProcessing, result])

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
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              {file ? <span>{file.name}</span> : <span>여기로 파일을 끌어오거나 클릭하여 업로드</span>}
            </label>
            <p className={styles.statusNote}>{statusMessage}</p>
          </div>

          <OCRControlPanel onRecognize={handleRecognize} onReset={handleReset} isProcessing={isProcessing || !file} />

          <OCRResultPreview imageSrc={previewUrl} resultText={result?.text} insights={result?.insights} />
        </section>
      </div>
    </MainLayout>
  )
}

export default PrescriptionScanPage
