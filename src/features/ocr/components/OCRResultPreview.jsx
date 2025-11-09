import styles from './OCRResultPreview.module.scss'

export const OCRResultPreview = ({ imageUrl, result }) => {
  return (
    <section className={styles.preview}>
      <div className={styles.imageFrame}>
        {imageUrl ? (
          <img src={imageUrl} alt="처방전 미리보기" />
        ) : (
          <p>이미지를 업로드하면 이곳에 미리보기가 표시됩니다.</p>
        )}
      </div>
      <div className={styles.resultPanel}>
        <h3>추출 결과</h3>
        {result ? (
          <pre>{result}</pre>
        ) : (
          <p className={styles.placeholder}>
            아직 추출된 정보가 없습니다. 이미지를 업로드하고 인식 버튼을 눌러주세요.
          </p>
        )}
      </div>
    </section>
  )
}

export default OCRResultPreview
