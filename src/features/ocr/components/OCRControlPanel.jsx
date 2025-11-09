import styles from './OCRControlPanel.module.scss'

export const OCRControlPanel = ({ onRecognize, onReset, isProcessing }) => {
  return (
    <div className={styles.controlPanel}>
      <button
        type="button"
        className={styles.primary}
        onClick={onRecognize}
        disabled={isProcessing}
      >
        {isProcessing ? '인식 중...' : 'AI로 인식하기'}
      </button>
      <button
        type="button"
        className={styles.secondary}
        onClick={onReset}
        disabled={isProcessing}
      >
        초기화
      </button>
    </div>
  )
}

export default OCRControlPanel
