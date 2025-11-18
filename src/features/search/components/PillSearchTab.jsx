/**
 * 알약 검색 탭 컴포넌트
 */

import { useState } from 'react'
import styles from './PillSearchTab.module.scss'

export const PillSearchTab = () => {
  const [searchParams, setSearchParams] = useState({
    shape: '',
    color: '',
    text: '',
  })
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const handleInputChange = (field, value) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSearch = async () => {
    // 최소 하나의 필드는 입력되어야 함
    if (!searchParams.shape && !searchParams.color && !searchParams.text) {
      return
    }

    setSearching(true)
    try {
      // TODO: API 연동
      // const results = await pillSearchApi.search(searchParams)
      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 800))
      setResults([
        {
          id: 1,
          name: '타이레놀',
          shape: '원형',
          color: '흰색',
          company: '한국얀센',
          text: 'TYLENOL',
        },
        {
          id: 2,
          name: '아스피린',
          shape: '원형',
          color: '흰색',
          company: '바이엘',
          text: 'ASPIRIN',
        },
      ])
    } catch (error) {
      console.error('알약 검색 실패:', error)
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleReset = () => {
    setSearchParams({
      shape: '',
      color: '',
      text: '',
    })
    setResults([])
  }

  return (
    <div className={styles.container}>
      <section className={styles.searchBox}>
        <div className={styles.instruction}>
          알약의 모양, 색상, 각인 등을 입력하여 검색하세요.
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="pill-shape" className={styles.label}>
            모양
          </label>
          <select
            id="pill-shape"
            className={styles.select}
            value={searchParams.shape}
            onChange={(e) => handleInputChange('shape', e.target.value)}
          >
            <option value="">선택하세요</option>
            <option value="원형">원형</option>
            <option value="타원형">타원형</option>
            <option value="장방형">장방형</option>
            <option value="사각형">사각형</option>
            <option value="삼각형">삼각형</option>
            <option value="오각형">오각형</option>
            <option value="육각형">육각형</option>
            <option value="팔각형">팔각형</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="pill-color" className={styles.label}>
            색상
          </label>
          <select
            id="pill-color"
            className={styles.select}
            value={searchParams.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
          >
            <option value="">선택하세요</option>
            <option value="흰색">흰색</option>
            <option value="노란색">노란색</option>
            <option value="분홍색">분홍색</option>
            <option value="빨간색">빨간색</option>
            <option value="주황색">주황색</option>
            <option value="갈색">갈색</option>
            <option value="연두색">연두색</option>
            <option value="초록색">초록색</option>
            <option value="청록색">청록색</option>
            <option value="파란색">파란색</option>
            <option value="남색">남색</option>
            <option value="자주색">자주색</option>
            <option value="보라색">보라색</option>
            <option value="회색">회색</option>
            <option value="검은색">검은색</option>
            <option value="투명">투명</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="pill-text" className={styles.label}>
            각인 (글자/숫자)
          </label>
          <input
            id="pill-text"
            type="text"
            className={styles.input}
            value={searchParams.text}
            onChange={(e) => handleInputChange('text', e.target.value)}
            placeholder="예) TYLENOL, 500"
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleReset}
            disabled={searching}
          >
            초기화
          </button>
          <button
            type="button"
            className={styles.searchButton}
            onClick={handleSearch}
            disabled={searching || (!searchParams.shape && !searchParams.color && !searchParams.text)}
          >
            {searching ? '검색 중...' : '검색'}
          </button>
        </div>
      </section>

      {results.length > 0 && (
        <section className={styles.results}>
          <h2 className={styles.resultTitle}>검색 결과 ({results.length}건)</h2>
          <div className={styles.resultList}>
            {results.map((pill) => (
              <div key={pill.id} className={styles.pillCard}>
                <div className={styles.pillImage}>
                  <div className={styles.pillPlaceholder}>💊</div>
                </div>
                <div className={styles.pillInfo}>
                  <h3 className={styles.pillName}>{pill.name}</h3>
                  <div className={styles.pillDetails}>
                    <span className={styles.pillDetail}>
                      <strong>모양:</strong> {pill.shape}
                    </span>
                    <span className={styles.pillDetail}>
                      <strong>색상:</strong> {pill.color}
                    </span>
                    <span className={styles.pillDetail}>
                      <strong>제조사:</strong> {pill.company}
                    </span>
                    {pill.text && (
                      <span className={styles.pillDetail}>
                        <strong>각인:</strong> {pill.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {results.length === 0 && searching === false && (searchParams.shape || searchParams.color || searchParams.text) && (
        <div className={styles.empty}>검색 결과가 없습니다.</div>
      )}
    </div>
  )
}

export default PillSearchTab
