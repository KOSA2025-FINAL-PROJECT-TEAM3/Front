/**
 * RoleSelection Page
 * - 개발자용 역할 선택 페이지 (임시)
 * - 시니어/보호자 선택 후 각 대시보드로 이동
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './RoleSelection.module.css'

/**
 * 역할 선택 페이지
 * @returns {JSX.Element} 역할 선택 페이지
 */
export const RoleSelection = () => {
  const navigate = useNavigate()
  const { selectRole } = useAuth()

  const handleSelectRole = async (role) => {
    try {
      await selectRole(role)
      if (role === 'senior') {
        navigate('/dashboard')
      } else if (role === 'guardian') {
        navigate('/guardian')
      }
    } catch (err) {
      console.error('역할 선택 실패:', err)
    }
  }

  return (
    <div className={styles.roleSelectionContainer}>
      <div className={styles.content}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.logo}>💊</div>
          <h1 className={styles.title}>뭐냑? (AMA...Pill)</h1>
          <p className={styles.subtitle}>역할을 선택하고 맞춤 대시보드로 이동하세요</p>
        </div>

        {/* 역할 선택 */}
        <div className={styles.roleSelection}>
          <p className={styles.roleLabel}>역할을 선택해주세요</p>

          <div className={styles.roleButtons}>
            {/* 시니어 버튼 */}
            <button
              className={styles.roleButton}
              onClick={() => handleSelectRole('senior')}
            >
              <span className={styles.roleIcon}>👴</span>
              <span className={styles.roleName}>시니어</span>
              <span className={styles.roleDescription}>약 복용 일정 관리</span>
            </button>

            {/* 보호자 버튼 */}
            <button
              className={styles.roleButton}
              onClick={() => handleSelectRole('guardian')}
            >
              <span className={styles.roleIcon}>👩‍👩‍👧‍👦</span>
              <span className={styles.roleName}>보호자</span>
              <span className={styles.roleDescription}>가족 약 복용 모니터링</span>
            </button>
          </div>
        </div>

        {/* 푸터: 개발 정보 */}
        <div className={styles.footer}>
          <p className={styles.devNote}>
            🚀 개발자 모드 | 로그인 기능은 나중에 구현 예정입니다
          </p>
        </div>
      </div>
    </div>
  )
}

export default RoleSelection
