import styles from './OCRResultPreview.module.scss'

export const OCRResultPreview = ({ imageSrc, resultText, insights }) => {
  return (
    <div className={styles.preview}>
      <div className={styles.imageFrame}>
        {imageSrc ? (
          <img src={imageSrc} alt="처방전 미리보기" />
        ) : (
          <p className={styles.placeholder}>이미지를 첨부하면 미리보기를 제공합니다</p>
        )}
      </div>
      <div className={styles.resultPanel}>
        <h3>인식 결과</h3>
        {resultText ? (
          <pre>{resultText}</pre>
        ) : (
          <p className={styles.placeholder}>AI 인식 결과가 여기에 표시됩니다.</p>
        )}
        {insights && insights.length > 0 && (
          <>
            <h3>추출된 정보</h3>
            <ul>
              {insights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export default OCRResultPreview
