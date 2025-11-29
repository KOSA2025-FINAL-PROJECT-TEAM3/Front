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
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAiSearch, setIsAiSearch] = useState(false)  // AI 검색 플래그
  const selectionRef = useRef(null)

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

  const handleManualSearch = useCallback(async () => {
    const keyword = query.trim()
    if (!keyword) {
      setError('증상을 입력해주세요.')
      return
    }
    setError('')
    setSearchLoading(true)
    try {
      const list = await searchApiClient.suggestSymptoms(keyword)
      setResults(list)
      if (list.length > 0) {
        await handleSelectSymptom(list[0])
      }
    } catch (err) {
      console.error('증상 검색 실패', err)
      setError('검색에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSearchLoading(false)
    }
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
      
      // AI 검색 플래그 활성화 (useEffect에서 초기화되지 않도록)
      setIsAiSearch(true)
      setSelectedSymptom(info?.name || keyword)
      setDetail(info)
      
      setAiLoading(false)
      setDetailLoading(false)
    } catch (err) {
      console.error('증상 AI 검색 실패', err)
      setError('AI 검색에 실패했습니다. 잠시 후 다시 시도해주세요.')
      setAiLoading(false)
      setDetailLoading(false)
      setIsAiSearch(false)
    }
  }, [query])

  useEffect(() => {
    // AI 검색 중일 때는 초기화하지 않음
    if (isAiSearch) {
      return
    }
    
    if (!results.length) {
      setSelectedSymptom(null)
      setDetail(null)
      return
    }
    if (!selectedSymptom) {
      handleSelectSymptom(results[0])
    }
  }, [results, selectedSymptom, handleSelectSymptom, isAiSearch])

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
        <div className={styles.hint}>검색 혹은 AI 검색 버튼을 누르고 잠시 기다려주세요.</div>
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.searchButton}
            onClick={handleManualSearch}
            disabled={!query.trim() || detailLoading || aiLoading || searchLoading}
          >
            {searchLoading ? '검색 중...' : '검색'}
          </button>
          <button
            type="button"
            className={styles.aiButton}
            onClick={handleAiSearch}
            disabled={!query.trim() || aiLoading || searchLoading}
          >
            {aiLoading ? 'AI 검색 중...' : 'AI 검색'}
          </button>
          <button
            type="button"
            className={styles.googleButton}
            onClick={() => {
              const keyword = query.trim()
              if (keyword && keyword.length <= 100) {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(keyword)}`, '_blank')
              }
            }}
            disabled={!query.trim() || query.trim().length > 100}
            title="구글에서 검색 (100자 이하)"
          >
            🔍 구글
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </section>

      <section className={styles.results}>
        {results.length > 0 && (
          <>
            <h2 className={styles.resultTitle}>추천 증상</h2>
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
          </>
        )}
      </section>

      {/* 항상 렌더링되는 결과 영역 */}
      <section className={styles.detailSection}>
        <h2 className={styles.resultTitle}>검색 결과</h2>
        <div className={styles.detailCard}>
          {!selectedSymptom && !detail && (
            <p className={styles.empty}>검색 또는 AI 검색을 통해 결과를 조회해주세요.</p>
          )}

          {selectedSymptom && (
            <>
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
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default SymptomSearchTab
