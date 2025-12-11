/**
 * DeveloperModePanel
 * - 개발 모드 진입/바로가기 패널 (UI는 SCSS 모듈)
 * - 실제 API 연동 환경에서는 단순 페이지 이동 숏컷 역할만 수행합니다.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './DeveloperModePanel.module.scss'

const DEV_MODE_ENABLED = import.meta.env.VITE_ENABLE_DEV_MODE !== 'false'

export const DeveloperModePanel = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  if (!DEV_MODE_ENABLED) return null

  const handleShortcut = (path) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        🧪 Dev Mode
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>개발자 바로가기</span>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setOpen(false)}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
          <ul className={styles.shortcutList}>
            {/* 대시보드 접근 */}
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(ROUTE_PATHS.seniorDashboard)}
              >
                어르신 대시보드
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(ROUTE_PATHS.caregiverDashboard)}
              >
                보호자 대시보드
              </button>
            </li>

            {/* URL 직입으로만 접근 가능한 페이지들 */}
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(ROUTE_PATHS.weeklyStats)}
              >
                주간 통계 (/reports/weekly)
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(ROUTE_PATHS.pillResult)}
              >
                알약 검색 결과 (/pills/result)
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(ROUTE_PATHS.suspectedDisease)}
              >
                의심 질환 (/disease/suspected)
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(ROUTE_PATHS.diseaseRestrictions)}
              >
                질병별 제약 (/disease/restrictions)
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(ROUTE_PATHS.myMedicationsSettings)}
              >
                내 약 관리 (설정, /settings/medications)
              </button>
            </li>
            <li>
              <button
                type="button"
                className={styles.shortcutButton}
                onClick={() => handleShortcut(ROUTE_PATHS.myDiseasesSettings)}
              >
                내 질병 관리 (설정, /settings/diseases)
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default DeveloperModePanel