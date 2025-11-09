import MainLayout from '@shared/components/layout/MainLayout'
import styles from './ProfileEdit.module.scss'

const mockFields = [
  { id: 'name', label: '이름', type: 'text', placeholder: '홍길동' },
  { id: 'email', label: '이메일', type: 'email', placeholder: 'hong@example.com', readOnly: true },
  { id: 'phone', label: '전화번호', type: 'tel', placeholder: '010-0000-0000' },
]

export const ProfileEditPage = () => {
  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>프로필 편집</h1>
          <p>연락처 정보를 최신 상태로 유지하세요.</p>
        </header>

        <form className={styles.form}>
          {mockFields.map((field) => (
            <label key={field.id} className={styles.formGroup}>
              <span>{field.label}</span>
              <input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                readOnly={field.readOnly}
              />
            </label>
          ))}

          <div className={styles.actionRow}>
            <button type="button" className={styles.secondary}>
              취소
            </button>
            <button type="submit" className={styles.primary}>
              저장
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default ProfileEditPage
