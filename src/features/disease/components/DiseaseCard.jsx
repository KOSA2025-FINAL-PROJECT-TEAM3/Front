import { Card, CardBody, CardFooter, CardHeader } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import styles from './DiseaseCard.module.scss'

const STATUS_LABEL = {
  ACTIVE: '치료 중',
  CURED: '완치',
  CHRONIC: '만성',
}

const formatDate = (value) => {
  if (!value) return '날짜 모름'
  try {
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}

export const DiseaseCard = ({ disease, onSelect, onDelete, onEdit }) => {
  const handleSelect = () => {
    if (typeof onSelect === 'function') {
      onSelect(disease)
    }
  }

  const handleDelete = (event) => {
    event.stopPropagation()
    if (typeof onDelete === 'function') {
      onDelete(disease)
    }
  }

  const handleEdit = (event) => {
    event.stopPropagation()
    if (typeof onEdit === 'function') {
      onEdit(disease)
    }
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      className={`${styles.card} ${disease?.isCritical ? styles.critical : ''}`}
    >
      <CardHeader className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{disease?.name}</h3>
          <div className={styles.badges}>
            {disease?.isCritical && <span className={`${styles.badge} ${styles.criticalBadge}`}>중요</span>}
            {disease?.isPrivate && <span className={`${styles.badge} ${styles.private}`}>비공개</span>}
            {disease?.status && (
              <span className={`${styles.badge} ${styles.status}`}>{STATUS_LABEL[disease.status] ?? disease.status}</span>
            )}
          </div>
        </div>
        <p className={styles.meta}>
          진단일: {disease?.isDiagnosedDateUnknown ? '날짜 모름' : formatDate(disease?.diagnosedAt)}
        </p>
      </CardHeader>

      <CardBody className={styles.body}>
        <p className={styles.description}>{disease?.description || '메모가 없습니다.'}</p>
      </CardBody>

      <CardFooter className={styles.footer}>
        <div className={styles.timestamps}>
          <span>최근 업데이트: {formatDate(disease?.updatedAt || disease?.createdAt)}</span>
        </div>
        <div className={styles.actions}>
          {disease?.canEdit && (
            <Button variant="secondary" size="sm" onClick={handleEdit}>
              수정
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            삭제
          </Button>
          <Button variant="primary" size="sm" onClick={handleSelect}>
            상세
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default DiseaseCard
