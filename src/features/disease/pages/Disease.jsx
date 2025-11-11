import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import styles from './Disease.module.scss'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'

export const DiseasePage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const list = await diseaseApiClient.listMyDiseases()
        if (!cancelled) setItems(Array.isArray(list) ? list : [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>질환</h1>
          <p>등록된 질환과 주의사항을 확인하세요 (Mock)</p>
        </header>

        {loading && <div className={styles.hint}>불러오는 중입니다...</div>}

        {!loading && (
          <ul className={styles.list}>
            {items.map((d) => (
              <Link to={`/disease/${d.id}`} key={d.id} className={styles.cardLink}>
                <li className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.name}>{d.name}</h2>
                    <span className={styles.date}>{d.updatedAt}</span>
                  </div>
                  {d.notes && <p className={styles.notes}>{d.notes}</p>}
                  <div className={styles.restrictions}>
                    {d.restrictions?.length ? (
                      d.restrictions.map((r, i) => (
                        <span key={i} className={styles.badge}>
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className={styles.empty}>등록된 주의사항이 없습니다.</span>
                    )}
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  )
}

export default DiseasePage

