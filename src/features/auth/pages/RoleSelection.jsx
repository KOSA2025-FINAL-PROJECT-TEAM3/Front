import logger from '@core/utils/logger'

/**
 * RoleSelection Page
 * - 역할 선택 페이지(프로토타입)
 * - 어르신/보호자 선택 후 대시보드로 이동
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import { useAuth } from '@features/auth/hooks/useAuth'
import styles from './RoleSelection.module.scss'

export const RoleSelection = () => {
  const navigate = useNavigate()
  const { selectRole, customerRole } = useAuth((state) => ({
    selectRole: state.selectRole,
    customerRole: state.customerRole,
  }))

  useEffect(() => {
    if (customerRole === 'senior') {
      navigate(ROUTE_PATHS.seniorDashboard)
    } else if (customerRole === 'caregiver') {
      navigate(ROUTE_PATHS.caregiverDashboard)
    }
  }, [customerRole, navigate])

  const handleSelectRole = async (role) => {
    try {
      await selectRole(role)
      if (role === 'senior') {
        navigate(ROUTE_PATHS.seniorDashboard)
      } else if (role === 'caregiver') {
        navigate(ROUTE_PATHS.caregiverDashboard)
      }
    } catch (err) {
      logger.error('역할 선택 실패:', err)
    }
  }

  return (
    <div className={styles.roleSelectionContainer}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.logo}>💊</div>
          <h1 className={styles.title}>뭐냑? (AMA...Pill)</h1>
          <p className={styles.subtitle}>역할을 선택하고 맞춤 대시보드로 이동하세요</p>
        </div>

        <div className={styles.roleSelection}>
          <p className={styles.roleLabel}>역할을 선택해 주세요</p>

          <div className={styles.roleButtons}>
            <button className={styles.roleButton} onClick={() => handleSelectRole('senior')}>
              <span className={styles.roleIcon}>🧓</span>
              <span className={styles.roleName}>어르신(부모)</span>
              <span className={styles.roleDescription}>내 복약 일정 관리</span>
            </button>

            <button className={styles.roleButton} onClick={() => handleSelectRole('caregiver')}>
              <span className={styles.roleIcon}>👪</span>
              <span className={styles.roleName}>보호자(자녀)</span>
              <span className={styles.roleDescription}>가족 복약 모니터링</span>
            </button>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.devNote}>개발 모드 | 로그인 기능은 진행 중</p>
        </div>
      </div>
    </div>
  )
}

export default RoleSelection
