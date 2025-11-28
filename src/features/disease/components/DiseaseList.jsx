import { useMemo, useState } from 'react'
import DiseaseCard from './DiseaseCard'
import styles from './DiseaseList.module.scss'

const FILTERS = [
  { key: 'ALL', label: '전체' },
  { key: 'ACTIVE', label: '치료중' },
  { key: 'CURED', label: '완치' },
  { key: 'CRITICAL', label: '중요' },
]

const toTime = (value) => {
  if (!value) return 0
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

export const DiseaseList = ({ diseases = [], loading, onSelect, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return (diseases || [])
      .filter((item) => {
        const matchesQuery = !query || (item?.name || '').toLowerCase().includes(query)
        const matchesFilter =
          statusFilter === 'ALL' ||
          (statusFilter === 'CRITICAL' ? item?.isCritical : item?.status === statusFilter)
        return matchesQuery && matchesFilter
      })
      .sort((a, b) => {
        if (a?.isCritical !== b?.isCritical) return a?.isCritical ? -1 : 1
        const dateDiff = toTime(b?.diagnosedAt) - toTime(a?.diagnosedAt)
        if (dateDiff !== 0) return dateDiff
        return (Number(b?.id) || 0) - (Number(a?.id) || 0)
      })
  }, [diseases, searchTerm, statusFilter])

  const isFiltered = Boolean(searchTerm.trim() || statusFilter !== 'ALL')
  const emptyMessage = isFiltered ? '검색 결과가 없습니다.' : '등록된 질병이 없습니다.'

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="질병 검색"
          className={styles.searchInput}
          aria-label="질병 검색"
        />
        <div className={styles.filters}>
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setStatusFilter(filter.key)}
              className={`${styles.filterButton} ${
                statusFilter === filter.key ? styles.active : ''
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.hint}>질병 목록을 불러오는 중입니다...</div>
      ) : filtered.length ? (
        <div className={styles.list}>
          {filtered.map((disease) => (
            <DiseaseCard
              key={disease.id}
              disease={disease}
              onSelect={onSelect}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>{emptyMessage}</div>
      )}
    </div>
  )
}

export default DiseaseList
