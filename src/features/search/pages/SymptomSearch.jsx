import { useEffect, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import styles from './SymptomSearch.module.scss'
import { searchApiClient } from '@/core/services/api/searchApiClient'

export const SymptomSearchPage = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }
      const list = await searchApiClient.suggestSymptoms(query)
      if (!cancelled) setResults(list)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>증상 검색</h1>
          <p>증상을 입력하고 관련 정보를 빠르게 찾아보세요.</p>
        </header>

        <section className={styles.searchBox}>
          <label htmlFor="symptom-input" className={styles.label}>
            증상 입력
          </label>
          <input
            id="symptom-input"
            type="text"
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 두통, 기침, 메스꺼움"
          />

          <div className={styles.hint}>입력하면 바로 결과가 표시됩니다.</div>
        </section>

        <section className={styles.results}>
          {query && (
            <>
              <h2 className={styles.resultTitle}>추천 증상</h2>
              {results.length ? (
                <ul className={styles.resultList}>
                  {results.map((s) => (
                    <li key={s} className={styles.resultItem}>
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>일치하는 결과가 없습니다.</p>
              )}
            </>
          )}
        </section>
      </div>
    </MainLayout>
  )
}

export default SymptomSearchPage

