import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { dietApiClient } from '@core/services/api/dietApiClient'
import logger from '@core/utils/logger'
import styles from './DietLogsTab.module.scss'

const DietLogsTab = ({ userId }) => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLogs = async () => {
      if (!userId) return
      try {
        setLoading(true)
        setError(null)
        const data = await dietApiClient.getDietLogs({ userId })
        const logArray = Array.isArray(data) ? data : []

        // Sort by recordedAt (or createdAt) descending
        logArray.sort((a, b) => {
          const dateA = new Date(a.recordedAt || a.createdAt)
          const dateB = new Date(b.recordedAt || b.createdAt)
          return dateB - dateA
        })

        setLogs(logArray)
      } catch (err) {
        logger.error('Failed to fetch diet logs:', err)
        const status = err?.response?.status
        if (status === 401 || status === 403) {
          setError('식단 기록 조회 권한이 없습니다.')
        } else {
          setError('식단 기록을 불러오지 못했습니다.')
        }
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [userId])

  if (loading) return <div className={styles.loading}>식단 기록을 불러오는 중...</div>
  if (error) return <div className={styles.error}>{error}</div>
  if (logs.length === 0) return <div className={styles.empty}>등록된 식단 기록이 없습니다.</div>

  return (
    <div className={styles.container}>
      {logs.map((log) => {
        // Parse interactions if needed (backend might return string or json)
        let drugInteractions = []
        let diseaseInteractions = []
        try {
          drugInteractions = typeof log.drugInteractions === 'string'
            ? JSON.parse(log.drugInteractions)
            : log.drugInteractions || []
        } catch (e) {
          logger.warn('Failed to parse drugInteractions:', e)
          drugInteractions = []
        }
        try {
          diseaseInteractions = typeof log.diseaseInteractions === 'string'
            ? JSON.parse(log.diseaseInteractions)
            : log.diseaseInteractions || []
        } catch (e) {
          logger.warn('Failed to parse diseaseInteractions:', e)
          diseaseInteractions = []
        }

        const overallLevel = log.overallLevel || log.analysisResult?.overallLevel

        return (
          <div key={log.id} className={styles.logCard}>
            <div className={styles.header}>
              <span className={styles.mealType}>{getMealTypeLabel(log.mealType)}</span>
              <span className={styles.date}>{formatDate(log.recordedAt || log.createdAt)}</span>
            </div>
            <div className={styles.content}>
              {log.imageUrl && (
                <div className={styles.imageWrapper}>
                  <img src={log.imageUrl} alt={log.foodName} className={styles.foodImage} />
                </div>
              )}
              <div className={styles.details}>
                <div className={styles.titleRow}>
                  <h3>{log.foodName}</h3>
                  {overallLevel && (
                    <span className={`${styles.statusBadge} ${styles[getLevelClass(overallLevel)]}`}>
                      {getLevelLabel(overallLevel)}
                    </span>
                  )}
                </div>
                {log.summary && <p className={styles.summary}>{log.summary}</p>}

                <div className={styles.interactions}>
                  {drugInteractions.length > 0 && (
                    <span className={styles.interactionChip}>💊 약물 {drugInteractions.length}</span>
                  )}
                  {diseaseInteractions.length > 0 && (
                    <span className={styles.interactionChip}>🏥 질병 {diseaseInteractions.length}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const getMealTypeLabel = (type) => {
  const map = {
    BREAKFAST: '아침',
    LUNCH: '점심',
    DINNER: '저녁',
    SNACK: '간식',
  }
  return map[type] || type
}

const getLevelClass = (level) => {
  if (level === '좋음' || level === 'GOOD') return 'GOOD'
  if (level === '주의' || level === 'WARNING') return 'WARNING'
  if (level === '위험' || level === '경고' || level === 'DANGER') return 'DANGER'
  return 'default'
}

const getLevelLabel = (level) => {
  if (level === 'GOOD') return '좋음'
  if (level === 'WARNING') return '주의'
  if (level === 'DANGER') return '위험'
  return level
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

DietLogsTab.propTypes = {
  userId: PropTypes.number.isRequired,
}

export default DietLogsTab
