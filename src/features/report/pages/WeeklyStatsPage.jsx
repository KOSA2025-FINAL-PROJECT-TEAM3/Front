import { useState, useEffect } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { BackButton } from '@shared/components/ui/BackButton'
import { medicationLogApiClient } from '@/core/services/api/medicationLogApiClient'
import { medicationApiClient } from '@/core/services/api/medicationApiClient'
import { toast } from '@shared/components/toast/toastStore'
import styles from './WeeklyStatsPage.module.scss'

/**
 * 주간 통계 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const WeeklyStatsPage = () => {
  const [loading, setLoading] = useState(true)
  const [weeklyData, setWeeklyData] = useState([])
  const [medications, setMedications] = useState([])

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        setLoading(true)

        // 최근 7일 데이터
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)

        const [dailyData, meds] = await Promise.all([
          medicationLogApiClient.getDailyAdherence(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          ),
          medicationApiClient.list()
        ])

        setWeeklyData(dailyData || [])
        setMedications(meds || [])
      } catch (error) {
        console.error('주간 통계 로딩 실패:', error)
        toast.error('주간 통계를 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchWeeklyStats()
  }, [])

  const calculateWeeklyAverage = () => {
    if (weeklyData.length === 0) return 0
    const total = weeklyData.reduce((sum, day) => {
      const rate = day.total > 0 ? (day.completed / day.total) * 100 : 0
      return sum + rate
    }, 0)
    return Math.round(total / weeklyData.length)
  }

  const getDayName = (dateString) => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const date = new Date(dateString)
    return days[date.getDay()]
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

  const weeklyAverage = calculateWeeklyAverage()

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.headerWithBack}>
          <BackButton />
          <h1 className={styles.title}>주간 통계</h1>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.weeklyAverage}>
            <span className={styles.averageValue}>{weeklyAverage}%</span>
            <span className={styles.averageLabel}>주간 평균 순응도</span>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>일별 복약 현황</h2>
          <div className={styles.dailyChart}>
            {weeklyData.length === 0 ? (
              <p className={styles.noData}>최근 7일간 데이터가 없습니다</p>
            ) : (
              weeklyData.map((day, index) => {
                const rate = day.total > 0 ? (day.completed / day.total) * 100 : 0
                return (
                  <div key={index} className={styles.chartBar}>
                    <div className={styles.barContainer}>
                      <div
                        className={styles.barFill}
                        style={{
                          height: `${rate}%`,
                          backgroundColor:
                            rate === 100
                              ? '#4caf50'
                              : rate >= 50
                                ? '#ff9800'
                                : '#f44336',
                        }}
                      />
                    </div>
                    <div className={styles.barLabel}>
                      <span className={styles.dayName}>{getDayName(day.date)}</span>
                      <span className={styles.dayDate}>
                        {new Date(day.date).getDate()}
                      </span>
                      <span className={styles.dayRate}>{Math.round(rate)}%</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>약물별 복약 현황</h2>
          <div className={styles.medicationList}>
            {medications.length === 0 ? (
              <p className={styles.noData}>등록된 약물이 없습니다</p>
            ) : (
              medications.map((med) => (
                <div key={med.id} className={styles.medicationItem}>
                  <div className={styles.medInfo}>
                    <span className={styles.medName}>{med.name}</span>
                    <span className={styles.medDosage}>{med.dosage}</span>
                  </div>
                  <div className={styles.medStats}>
                    <span className={styles.medTiming}>{med.timing}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.insight}>
          <h3 className={styles.insightTitle}>📊 주간 분석</h3>
          <ul className={styles.insightList}>
            {weeklyAverage >= 90 && (
              <li>이번 주 복약 순응도가 매우 우수합니다! 🌟</li>
            )}
            {weeklyAverage >= 70 && weeklyAverage < 90 && (
              <li>이번 주 복약 순응도가 양호합니다. 조금만 더 노력하세요!</li>
            )}
            {weeklyAverage < 70 && (
              <li>이번 주 복약 순응도가 낮습니다. 알림 설정을 확인해보세요.</li>
            )}
            {weeklyData.length > 0 && (
              <li>최근 {weeklyData.length}일간의 데이터를 분석했습니다.</li>
            )}
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}

export default WeeklyStatsPage
