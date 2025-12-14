import logger from "@core/utils/logger"
/**
 * Senior Dashboard Page
 * - 어르신용 개인 복용 일정 대시보드 (실제 API 기반)
 */

import { useMemo, useState } from 'react'
import { MainLayout } from '@shared/components/layout/MainLayout'
import { MyMedicationSchedule } from '../components/MyMedicationSchedule'
import { QuickActions } from '@shared/components/ui/QuickActions'
import { FAB } from '@shared/components/ui/FAB'
import { SENIOR_QUICK_ACTIONS, SENIOR_FAB_ACTIONS } from '@/constants/uiConstants'
import { useAuth } from '@features/auth/hooks/useAuth'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import { toast } from '@shared/components/toast/toastStore'
import styles from './SeniorDashboard.module.scss'

export const SeniorDashboard = () => {
  const { user } = useAuth((state) => ({ user: state.user }))
  const [exporting, setExporting] = useState(false)

  // 오늘 날짜
  const today = useMemo(() => new Date(), [])

  const handleExportPdf = async () => {
    const userId = user?.id || user?.userId
    if (!userId) {
      toast.error('사용자 정보를 찾을 수 없습니다.')
      return
    }

    setExporting(true)
    try {
      const blob = await diseaseApiClient.exportPdf(userId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'diseases.pdf'
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('PDF 다운로드를 시작합니다.')
    } catch (error) {
      logger.error('PDF 다운로드 실패', error)
      toast.error('PDF 다운로드에 실패했습니다.')
    } finally {
      setExporting(false)
    }
  }

  const fabActions = SENIOR_FAB_ACTIONS.map((action) => {
    if (action.id === 'pdf_export') {
      return {
        ...action,
        label: exporting ? '다운로드 중...' : action.label,
        onClick: () => !exporting && handleExportPdf(),
      }
    }
    return action
  })

  const todayDate = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <MainLayout>
      <div className={styles.dashboardContent}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>오늘의 복용</h1>
          <p className={styles.dateInfo}>{todayDate}</p>
        </div>

        <QuickActions actions={SENIOR_QUICK_ACTIONS} />

        <MyMedicationSchedule title="오늘의 복용" showEmptyState={true} />

        <FAB actions={fabActions} />
      </div>
    </MainLayout>
  )
}

export default SeniorDashboard
