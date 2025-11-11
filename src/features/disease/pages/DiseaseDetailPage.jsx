import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import styles from './DiseaseDetailPage.module.scss'

export const DiseaseDetailPage = () => {
  const { diseaseId } = useParams()
  const [disease, setDisease] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const detail = await diseaseApiClient.getDiseaseDetail(diseaseId)
        if (!cancelled) setDisease(detail)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [diseaseId])

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.page}>
          <div className={styles.hint}>불러오는 중입니다...</div>
        </div>
      </MainLayout>
    )
  }

  if (!disease) {
    return (
      <MainLayout>
        <div className={styles.page}>
          <div className={styles.hint}>질환 정보를 찾을 수 없습니다.</div>
          <Link to="/disease">목록으로 돌아가기</Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>{disease.name}</h1>
          <p>등록일: {disease.updatedAt}</p>
        </header>

        <div className={styles.card}>
          <h2>메모</h2>
          <p>{disease.notes || '등록된 메모가 없습니다.'}</p>
        </div>

        <div className={styles.card}>
          <h2>주의사항</h2>
          <div className={styles.restrictions}>
            {disease.restrictions?.length ? (
              disease.restrictions.map((r, i) => (
                <span key={i} className={styles.badge}>
                  {r}
                </span>
              ))
            ) : (
              <span>등록된 주의사항이 없습니다.</span>
            )}
          </div>
        </div>

        <Link to="/disease" className={styles.backLink}>
          목록으로 돌아가기
        </Link>
      </div>
    </MainLayout>
  )
}

export default DiseaseDetailPage