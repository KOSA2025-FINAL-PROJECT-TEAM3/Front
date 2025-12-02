import { useEffect, useState } from 'react'
import { familyApiClient } from '@core/services/api/familyApiClient'
import styles from './MedicationDetailTab.module.scss'

export const MedicationDetailTab = ({ userId, medications = [] }) => {
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [medicationDetail, setMedicationDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSelectMedication = async (medication) => {
    setSelectedMedication(medication)
    setLoading(true)
    setError(null)
    setMedicationDetail(null)

    try {
      const detail = await familyApiClient.getMedicationDetail(userId, medication.id)
      setMedicationDetail(detail)
    } catch (err) {
      console.error('약 세부 정보 조회 실패:', err)
      setError('약 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={styles.detailTab}>
      <div className={styles.container}>
        {/* 약 목록 */}
        <div className={styles.medicationList}>
          <h3>약 목록</h3>
          {medications.length === 0 ? (
            <p className={styles.empty}>등록된 약이 없습니다.</p>
          ) : (
            <ul className={styles.list}>
              {medications.map((med) => (
                <li
                  key={med.id}
                  className={`${styles.item} ${selectedMedication?.id === med.id ? styles.active : ''}`}
                  onClick={() => handleSelectMedication(med)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectMedication(med)
                    }
                  }}
                >
                  <span className={styles.name}>{med.name || '알 수 없는 약'}</span>
                  <span className={styles.dosage}>{med.dosage || ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 세부 정보 */}
        <div className={styles.detailView}>
          {!selectedMedication ? (
            <div className={styles.placeholder}>
              <p>약을 선택하여 세부 정보를 확인하세요.</p>
            </div>
          ) : loading ? (
            <div className={styles.loading}>
              <p>약 정보를 불러오는 중입니다...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          ) : medicationDetail ? (
            <div className={styles.detail}>
              <div className={styles.header}>
                <h3>{medicationDetail.medicationName}</h3>
                {medicationDetail.manufacturer && (
                  <p className={styles.manufacturer}>{medicationDetail.manufacturer}</p>
                )}
              </div>

              {/* 기본 정보 */}
              <div className={styles.section}>
                <h4>기본 정보</h4>
                <div className={styles.infoGrid}>
                  {medicationDetail.ingredient && (
                    <div className={styles.infoItem}>
                      <label>주요 성분</label>
                      <p>{medicationDetail.ingredient}</p>
                    </div>
                  )}
                  {medicationDetail.dosage && (
                    <div className={styles.infoItem}>
                      <label>용법·용량</label>
                      <p>{medicationDetail.dosage}</p>
                    </div>
                  )}
                  {medicationDetail.indication && (
                    <div className={styles.infoItem}>
                      <label>효능·효과</label>
                      <p>{medicationDetail.indication}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 주의사항 */}
              {medicationDetail.sideEffects && (
                <div className={styles.section}>
                  <h4>부작용</h4>
                  <p className={styles.text}>{medicationDetail.sideEffects}</p>
                </div>
              )}

              {medicationDetail.precautions && (
                <div className={styles.section}>
                  <h4>주의사항</h4>
                  <p className={styles.text}>{medicationDetail.precautions}</p>
                </div>
              )}

              {/* 복용 스케줄 */}
              {medicationDetail.schedules && medicationDetail.schedules.length > 0 && (
                <div className={styles.section}>
                  <h4>복용 스케줄</h4>
                  <div className={styles.schedules}>
                    {medicationDetail.schedules.map((schedule, idx) => (
                      <div key={idx} className={styles.schedule}>
                        <div className={styles.scheduleHeader}>
                          <span className={styles.time}>{schedule.time}</span>
                          {schedule.active ? (
                            <span className={styles.badge}>활성</span>
                          ) : (
                            <span className={styles.badgeInactive}>비활성</span>
                          )}
                        </div>
                        {schedule.daysOfWeek && schedule.daysOfWeek.length > 0 && (
                          <p className={styles.days}>{schedule.daysOfWeek.join(', ')}</p>
                        )}
                        {schedule.completionRate !== undefined && (
                          <div className={styles.completionRate}>
                            <span>복용률</span>
                            <span className={styles.rate}>
                              {typeof schedule.completionRate === 'number'
                                ? schedule.completionRate.toFixed(1)
                                : 0}
                              %
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 통계 */}
              {medicationDetail.statistics && (
                <div className={styles.section}>
                  <h4>복용 통계</h4>
                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                      <label>총 복용 횟수</label>
                      <span className={styles.value}>{medicationDetail.statistics.totalDoses || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <label>실제 복용</label>
                      <span className={styles.value}>{medicationDetail.statistics.takenDoses || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <label>미복용</label>
                      <span className={styles.value}>{medicationDetail.statistics.missedDoses || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <label>복용률</label>
                      <span className={styles.value}>
                        {typeof medicationDetail.statistics.overallCompletionRate === 'number'
                          ? medicationDetail.statistics.overallCompletionRate.toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default MedicationDetailTab
