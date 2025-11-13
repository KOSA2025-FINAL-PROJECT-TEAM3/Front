/**
 * 내 질병 관리 (설정) 페이지
 * @page 39-my-diseases-settings
 * @component MyDiseasesSettingsPage
 */

import MainLayout from '@shared/components/layout/MainLayout'
import styles from './MyDiseasesSettingsPage.module.scss'

/**
 * 내 질병 관리 (설정) 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const MyDiseasesSettingsPage = () => {
  return (
    <MainLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>내 질병 관리 (설정)</h1>
        <p className={styles.placeholder}>내 질병 관리 (설정) 페이지 - 구현 예정</p>
      </div>
    </MainLayout>
  )
}

export default MyDiseasesSettingsPage
