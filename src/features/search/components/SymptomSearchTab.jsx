/**
 * 증상 검색 탭 컴포넌트
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './SymptomSearchTab.module.scss'
import { searchApiClient } from '@core/services/api/searchApiClient'

export const SymptomSearchTab = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedSymptom, setSelectedSymptom] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const selectionRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!query.trim()) {
        setResults([])
        setSelectedSymptom(null)
        setDetail(null)
        setError('')
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

  const handleSelectSymptom = useCallback(async (symptom) => {
    if (!symptom) {
      setSelectedSymptom(null)
      setDetail(null)
      return
    }
    selectionRef.current = symptom
    setSelectedSymptom(symptom)
    setDetail(null)
    setDetailLoading(true)
    try {
      const info = await searchApiClient.getSymptomDetail(symptom)
      if (selectionRef.current === symptom) {
        setDetail(info)
      }
    } catch {
      if (selectionRef.current === symptom) {
        setDetail({
          name: symptom,
          description: '자세한 정보를 불러오지 못했습니다.',
          possibleCauses: [],
          recommendedActions: [],
        })
      }
    } finally {
      if (selectionRef.current === symptom) {
        setDetailLoading(false)
      }
    }
  }, [])

  const handleManualSearch = useCallback(() => {
    const keyword = query.trim()
    if (!keyword) {
      setError('증상을 입력해주세요.')
      return
    }
    setError('')
    handleSelectSymptom(keyword)
  }, [query, handleSelectSymptom])

  const handleAiSearch = useCallback(async () => {
    const keyword = query.trim()
    if (!keyword) {
      setError('증상을 입력해주세요.')
      return
    }
    setError('')
    setAiLoading(true)
    setDetailLoading(true)
    selectionRef.current = keyword
    try {
      const info = await searchApiClient.searchSymptomsWithAI(keyword)
      setSelectedSymptom(info?.name || keyword)
      setDetail(info)
    } catch (err) {
      console.error('증상 AI 검색 실패', err)
      setError('AI 검색에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setAiLoading(false)
      setDetailLoading(false)
    }
  }, [query])

  useEffect(() => {
    if (!results.length) {
      setSelectedSymptom(null)
      setDetail(null)
      return
    }
    if (!selectedSymptom) {
      handleSelectSymptom(results[0])
    }
  }, [results, selectedSymptom, handleSelectSymptom])

  return (
    <div className={styles.container}>
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
          placeholder="예) 두통, 기침, 메스꺼움"
        />
        <div className={styles.hint}>입력하면 바로 결과가 표시됩니다.</div>
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.searchButton}
            onClick={handleManualSearch}
            disabled={!query.trim() || detailLoading || aiLoading}
          >
            {detailLoading && !aiLoading ? '검색 중...' : '검색'}
          </button>
          <button
            type="button"
            className={styles.aiButton}
            onClick={handleAiSearch}
            disabled={!query.trim() || aiLoading}
          >
            {aiLoading ? 'AI 검색 중...' : 'AI 검색'}
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </section>

      <section className={styles.results}>
        {query && (
          <>
            <h2 className={styles.resultTitle}>추천 증상</h2>
            {results.length ? (
              <ul className={styles.resultList}>
                {results.map((symptom) => (
                  <li key={symptom} className={styles.resultItem}>
                    <button
                      type="button"
                      className={`${styles.resultButton} ${
                        selectedSymptom === symptom ? styles.active : ''
                      }`}
                      onClick={() => handleSelectSymptom(symptom)}
                    >
                      {symptom}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>일치하는 결과가 없습니다.</p>
            )}
          </>
        )}
      </section>

      {selectedSymptom && (
        <section className={styles.detailSection}>
          <h2 className={styles.resultTitle}>증상 정보</h2>
          <div className={styles.detailCard}>
            <div className={styles.detailHeader}>
              <div>
                <p className={styles.detailLabel}>선택한 증상</p>
                <h3 className={styles.detailName}>{selectedSymptom}</h3>
              </div>
              {detail?.severity && <span className={styles.badge}>{detail.severity}</span>}
            </div>

            {detailLoading && (
              <p className={styles.empty}>자세한 정보를 불러오는 중입니다...</p>
            )}

            {!detailLoading && detail && (
              <div className={styles.detailBody}>
                <p className={styles.description}>{detail.description}</p>

                {detail.possibleCauses?.length > 0 && (
                  <div className={styles.detailBlock}>
                    <p className={styles.blockTitle}>가능한 원인</p>
                    <ul className={styles.chipList}>
                      {detail.possibleCauses.map((cause) => (
                        <li key={cause} className={styles.chip}>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detail.recommendedActions?.length > 0 && (
                  <div className={styles.detailBlock}>
                    <p className={styles.blockTitle}>추천 조치</p>
                    <ul className={styles.actionList}>
                      {detail.recommendedActions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default SymptomSearchTab
