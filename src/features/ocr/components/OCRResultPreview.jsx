import styles from './OCRResultPreview.module.scss'

export const OCRResultPreview = ({ imageSrc, resultText, confidence, error }) => {
  return (
    <div className={styles.preview}>
      <div className={styles.imageFrame}>
        {imageSrc ? (
          <img src={imageSrc} alt="이미지 미리보기" />
        ) : (
          <p className={styles.placeholder}>이미지를 선택하면 미리보기를 제공합니다</p>
        )}
      </div>
      <div className={styles.resultPanel}>
        <h3>인식 결과</h3>
        {error ? (
          <div className={styles.error}>
            <p>❌ {error}</p>
            <p className={styles.hint}>더 선명한 이미지를 사용하거나 조명을 개선해보세요.</p>
          </div>
        ) : resultText ? (
          <>
            <div className={styles.confidence}>
              <span>정확도: {confidence}%</span>
            </div>
            <pre className={styles.resultText}>{resultText}</pre>
            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(resultText)}
                className={styles.copyButton}
              >
                📋 텍스트 복사
              </button>
            </div>
          </>
        ) : (
          <p className={styles.placeholder}>텍스트 인식 결과가 여기에 표시됩니다.</p>
        )}
      </div>
    </div>
  )
}

export default OCRResultPreview
