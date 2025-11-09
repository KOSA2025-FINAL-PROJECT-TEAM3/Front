import styles from './ImageUploader.module.scss'

export const ImageUploader = ({ onUpload }) => {
  const handleChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      onUpload?.(URL.createObjectURL(file), file)
    }
  }

  return (
    <label className={styles.uploader}>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className={styles.input}
      />
      <span role="img" aria-hidden>📷</span>
      <p>
        처방전 또는 약 봉투 사진을 업로드하세요
        <br />
        <small>(jpg, png 허용)</small>
      </p>
    </label>
  )
}

export default ImageUploader
