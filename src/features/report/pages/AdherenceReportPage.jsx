import logger from "@core/utils/logger"
import { useState, useEffect } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { BackButton } from '@shared/components/ui/BackButton'
import { medicationLogApiClient } from '@/core/services/api/medicationLogApiClient'
import { toast } from '@shared/components/toast/toastStore'
import styles from './AdherenceReportPage.module.scss'

/**
 * 복약 순응도 리포트 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const AdherenceReportPage = () => {
  const [loading, setLoading] = useState(true)
  const [adherenceData, setAdherenceData] = useState(null)
  const [recentHistory, setRecentHistory] = useState([])

  useEffect(() => {
    const fetchAdherenceData = async () => {
      try {
        setLoading(true)

        // 최근 30일 순응도 요약
        const summary = await medicationLogApiClient.getAdherenceSummary(30)

        // 최근 14일 일별 순응도
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 14)

        const dailyData = await medicationLogApiClient.getDailyAdherence(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )

        setAdherenceData(summary)
        setRecentHistory(dailyData || [])
      } catch (error) {
        logger.error('순응도 데이터 로딩 실패:', error)
        toast.error('순응도 데이터를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchAdherenceData()
  }, [])

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return '✓ 완료'
      case 'partial':
        return '⚠ 일부'
      case 'missed':
        return '✕ 누락'
      default:
        return ''
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return styles.completed
      case 'partial':
        return styles.partial
      case 'missed':
        return styles.missed
      default:
        return ''
    }
  }

  const calculateStatus = (completed, total) => {
    if (total === 0) return 'missed'
    const rate = completed / total
    if (rate === 1) return 'completed'
    if (rate > 0) return 'partial'
    return 'missed'
  }

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.container}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      </MainLayout>
    )
  }

  if (!adherenceData) {
    return (
      <MainLayout>
        <div className={styles.container}>
          <div className={styles.error}>데이터를 불러올 수 없습니다</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.headerWithBack}>
          <BackButton />
          <h1 className={styles.title}>복약 순응도 리포트</h1>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.overallScore}>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreValue}>
                {adherenceData.overall || 0}%
              </span>
            </div>
            <p className={styles.scoreLabel}>전체 복약 순응도</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {adherenceData.thisWeek || 0}%
              </span>
              <span className={styles.statLabel}>이번 주</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {adherenceData.thisMonth || 0}%
              </span>
              <span className={styles.statLabel}>이번 달</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {adherenceData.streak || 0}일
              </span>
              <span className={styles.statLabel}>연속 복용</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>최근 복약 기록</h2>
          <div className={styles.historyList}>
            {recentHistory.length === 0 ? (
              <p className={styles.noData}>최근 복약 기록이 없습니다</p>
            ) : (
              recentHistory.map((day, index) => {
                const status = calculateStatus(day.completed || day.count, day.total)
                return (
                  <div
                    key={index}
                    className={`${styles.historyItem} ${getStatusClass(status)}`}
                  >
                    <div className={styles.historyDate}>
                      <span className={styles.dayLabel}>
                        {new Date(day.date).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className={styles.weekday}>
                        {new Date(day.date).toLocaleDateString('ko-KR', {
                          weekday: 'short',
                        })}
                      </span>
                    </div>
                    <div className={styles.historyProgress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${((day.completed || day.count) / day.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className={styles.progressText}>
                        {day.completed || day.count}/{day.total}
                      </span>
                    </div>
                    <span className={styles.historyStatus}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className={styles.insight}>
          <h3 className={styles.insightTitle}>💡 인사이트</h3>
          <ul className={styles.insightList}>
            {adherenceData.overall >= 80 && (
              <li>지난 한 달간 꾸준히 복용하고 계십니다! 잘하고 계세요. 👏</li>
            )}
            {adherenceData.overall < 80 && adherenceData.overall >= 50 && (
              <li>복약 순응도를 높이기 위해 알림 설정을 활용해보세요.</li>
            )}
            {adherenceData.overall < 50 && (
              <li>복약 누락이 많습니다. 건강을 위해 규칙적인 복용이 중요합니다.</li>
            )}
            {adherenceData.streak >= 7 && (
              <li>연속 {adherenceData.streak}일 복용 중! 계속 유지하세요! 🎉</li>
            )}
            {adherenceData.thisWeek < adherenceData.thisMonth && (
              <li>이번 주 순응도가 낮습니다. 주말 복약에 특히 주의하세요.</li>
            )}
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}

export default AdherenceReportPage
