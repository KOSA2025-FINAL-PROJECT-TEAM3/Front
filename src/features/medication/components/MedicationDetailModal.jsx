import MedicationForm from './MedicationForm.jsx'
import styles from './MedicationDetailModal.module.scss'

const formatDate = (value) => {
  if (!value) return '정보 없음'
  try {
    return new Date(value).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export const MedicationDetailModal = ({
  medication,
  loading,
  onClose,
  onToggle,
  onRemove,
  onSubmit,
}) => {
  if (!medication) return null

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.()
    }
  }

  const handleUpdate = async (values) => {
    await onSubmit?.(medication.id, values)
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal}>
        <header className={styles.header}>
          <div>
            <p className={styles.meta}>
              {medication.updatedAt ? '최근 수정' : '등록일'} ·{' '}
              {formatDate(medication.updatedAt || medication.createdAt)}
            </p>
            <h2 className={styles.title}>{medication.name}</h2>
            <p className={styles.subtitle}>{medication.dosage}</p>
          </div>
          <div className={styles.headerActions}>
            <span className={`${styles.statusBadge} ${medication.active ? styles.active : styles.paused}`}>
              {medication.active ? '복용 중' : '일시중지'}
            </span>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </header>

        <section className={styles.infoGrid}>
          <div>
            <p className={styles.label}>복용 일정</p>
            <p className={styles.value}>{medication.schedule || '미입력'}</p>
          </div>
          <div>
            <p className={styles.label}>주의사항</p>
            <p className={styles.value}>
              {medication.instructions || '미입력'}
            </p>
          </div>
        </section>

        <section className={styles.formSection}>
          <h3>정보 수정</h3>
          <MedicationForm
            initialValues={medication}
            onSubmit={handleUpdate}
            loading={loading}
            shouldResetOnSubmit={false}
            submitLabel="변경 저장"
            onCancel={onClose}
          />
        </section>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => onToggle?.(medication.id)}
            disabled={loading}
          >
            {medication.active ? '일시중지' : '복용 재개'}
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => onRemove?.(medication.id)}
            disabled={loading || medication.hasLogsToday}
            title={medication.hasLogsToday ? '오늘 복용 기록이 있어 삭제할 수 없습니다.' : ''}
          >
            약 삭제
          </button>
        </footer>
      </div>
    </div>
  )
}

export default MedicationDetailModal
