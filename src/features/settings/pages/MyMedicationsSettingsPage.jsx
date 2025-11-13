/**
 * 내 약 관리 (설정) 페이지
 * @page 38-my-medications-settings
 * @component MyMedicationsSettingsPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './MyMedicationsSettingsPage.module.scss'

/**
 * 내 약 관리 (설정) 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const MyMedicationsSettingsPage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>내 약 관리 (설정)</h1>
        <p className={styles.placeholder}>내 약 관리 (설정) 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default MyMedicationsSettingsPage
