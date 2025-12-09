import { useEffect, useState, useCallback } from 'react'
import { familyApiClient } from '@core/services/api/familyApiClient'
import styles from './MedicationLogsTab.module.scss'
import logger from '@core/utils/logger'

export const MedicationLogsTab = ({ userId }) => {
  const [logs, setLogs] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    limit: 30,
  })

  const loadLogs = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await familyApiClient.getMedicationLogs(userId, {
        date: filters.date || undefined,
        status: filters.status || undefined,
        limit: filters.limit,
      })

      setStatistics(response?.statistics || null)
      setLogs(response?.logs || [])
    } catch (err) {
      logger.error('복약 로그 조회 실패:', err)
      setError('복약 로그를 불러오지 못했습니다.')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [userId, filters])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#00B300'
      case 'missed':
        return '#FF0000'
      case 'pending':
        return '#FF9900'
      default:
        return '#999999'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return '복용완료'
      case 'missed':
        return '미복용'
      case 'pending':
        return '예정'
      default:
        return '미상'
    }
  }

  const handleDateChange = (e) => {
    setFilters({ ...filters, date: e.target.value })
  }

  const handleStatusChange = (e) => {
    setFilters({ ...filters, status: e.target.value })
  }

  if (loading) {
    return (
      <section className={styles.logsTab}>
        <p className={styles.loading}>복약 기록을 불러오는 중입니다...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.logsTab}>
        <p className={styles.error}>{error}</p>
      </section>
    )
  }

  return (
    <section className={styles.logsTab}>
      <div className={styles.header}>
        <h3>복약 기록</h3>
        {statistics && (
          <div className={styles.stats}>
            <span className={styles.stat}>
              <strong style={{ color: '#00B300' }}>{statistics.completedToday || 0}</strong>
              <small>완료</small>
            </span>
            <span className={styles.stat}>
              <strong style={{ color: '#FF9900' }}>{statistics.pendingToday || 0}</strong>
              <small>예정</small>
            </span>
            <span className={styles.stat}>
              <strong style={{ color: '#FF0000' }}>{statistics.missedToday || 0}</strong>
              <small>미복용</small>
            </span>
          </div>
        )}
      </div>

      <div className={styles.filters}>
        <input
          type="date"
          value={filters.date}
          onChange={handleDateChange}
          className={styles.filterInput}
        />
        <select
          value={filters.status}
          onChange={handleStatusChange}
          className={styles.filterSelect}
        >
          <option value="">상태 선택 (전체)</option>
          <option value="completed">완료</option>
          <option value="missed">미복용</option>
          <option value="pending">예정</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <p className={styles.empty}>복약 기록이 없습니다.</p>
      ) : (
        <ul className={styles.logsList}>
          {logs.map((log, index) => {
            const scheduledTime = new Date(log.scheduledTime)
            const completedTime = log.completedTime ? new Date(log.completedTime) : null
            const time = scheduledTime.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })
            const date = scheduledTime.toLocaleDateString('ko-KR')

            return (
              <li
                key={`${log.id}-${index}`}
                className={styles.logRow}
                style={{ borderLeftColor: getStatusColor(log.status) }}
              >
                <div className={styles.logInfo}>
                  <span className={styles.date}>{date}</span>
                  <span className={styles.time}>{time}</span>
                  <span className={styles.medicationName}>{log.medicationName || '알 수 없는 약'}</span>
                </div>
                <div className={styles.logDetails}>
                  {completedTime && (
                    <span className={styles.completedTime}>
                      {completedTime.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                  <span
                    className={styles.status}
                    style={{ color: getStatusColor(log.status) }}
                  >
                    {getStatusLabel(log.status)}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default MedicationLogsTab
