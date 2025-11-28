import { Button } from '@shared/components/ui/Button'
import styles from './DiseaseTrash.module.scss'

const formatDate = (value) => {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    )
  } catch {
    return value
  }
}

export const DiseaseTrash = ({ items = [], loading, onEmptyTrash, onRestore }) => {
  return (
    <div className={styles.trash}>
      <div className={styles.header}>
        <div>
          <h3>휴지통</h3>
          <p>삭제된 질병은 여기서 관리됩니다.</p>
        </div>
        <Button variant="danger" size="sm" onClick={onEmptyTrash} disabled={loading || !items.length}>
          휴지통 비우기
        </Button>
      </div>

      {loading && <div className={styles.hint}>휴지통을 불러오는 중입니다...</div>}

      {!loading && !items.length && (
        <div className={styles.empty}>휴지통이 비어 있습니다.</div>
      )}

      {!loading && items.length > 0 && (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <div className={styles.titleRow}>
                <div className={styles.name}>{item.name}</div>
                {item.isCritical && <span className={styles.critical}>중요</span>}
              </div>
              <div className={styles.meta}>
                <span>삭제 시각: {formatDate(item.deletedAt)}</span>
                {item.status && <span className={styles.status}>{item.status}</span>}
              </div>
              <div className={styles.actions}>
                <Button size="sm" variant="secondary" onClick={() => onRestore(item.id)}>
                  복원
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DiseaseTrash
