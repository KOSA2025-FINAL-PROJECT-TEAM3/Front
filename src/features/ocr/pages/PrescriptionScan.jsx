import { useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import ImageUploader from '../components/ImageUploader.jsx'
import OCRResultPreview from '../components/OCRResultPreview.jsx'
import OCRControlPanel from '../components/OCRControlPanel.jsx'
import styles from './PrescriptionScan.module.scss'

const MOCK_RESULT = `Simvastatin 20mg
1정씩 저녁 식후 30분
주의사항: 자몽 주스와 함께 복용하지 마세요.`

export const PrescriptionScanPage = () => {
  const [imageUrl, setImageUrl] = useState(null)
  const [result, setResult] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleUpload = (url) => {
    setImageUrl(url)
    setResult('')
  }

  const handleRecognize = async () => {
    if (!imageUrl) {
      alert('이미지를 먼저 업로드해주세요.')
      return
    }
    setProcessing(true)
    setTimeout(() => {
      setResult(MOCK_RESULT)
      setProcessing(false)
    }, 1200)
  }

  const handleReset = () => {
    setImageUrl(null)
    setResult('')
  }

  return (
    <MainLayout className={styles.ocrLayout}>
      <div className={styles.hero}>
        <div>
          <p className={styles.kicker}>Prescription OCR</p>
          <h1>처방전·약봉투를 스캔해 복약 정보를 자동으로 등록하세요.</h1>
          <p>AI가 약 이름, 용량, 주의사항을 인식하고 오류 수정이 가능하도록 도와줍니다.</p>
        </div>
        <div className={styles.heroCard}>
          <p>Tip: 스캔 후 바로 약-음식 경고와 연결됩니다.</p>
          <OCRControlPanel
            onRecognize={handleRecognize}
            onReset={handleReset}
            isProcessing={processing}
          />
        </div>
      </div>

      <div className={styles.workspace}>
        <ImageUploader onUpload={handleUpload} />
        <OCRResultPreview imageUrl={imageUrl} result={result} />
      </div>
    </MainLayout>
  )
}

export default PrescriptionScanPage
