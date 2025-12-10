import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useVoiceActionStore } from '@features/voice/stores/voiceActionStore' // [Voice]
import styles from './SymptomSearchTab.module.scss'
import { searchApiClient } from '@core/services/api/searchApiClient'
import { AiWarningModal } from '@shared/components/ui/AiWarningModal'
import logger from '@core/utils/logger'

export const SymptomSearchTab = () => {
  const { consumeAction, getPendingAction } = useVoiceActionStore() // [Voice]
  const [query, setQuery] = useState('')
  const [results] = useState([])
  const [selectedSymptom, setSelectedSymptom] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAiSearch, setIsAiSearch] = useState(false)
  const selectionRef = useRef(null)
  const [warningOpen, setWarningOpen] = useState(false)
  const [warningContext, setWarningContext] = useState('')
  const location = useLocation()

  // [Voice] 상태 변경 감지 후 실행 트리거
  const [voiceTrigger, setVoiceTrigger] = useState(false)

  const showWarningModal = (context) => {
    setWarningContext(
      context || 'AI 생성 결과는 참고용입니다. 병 증세 진단은 반드시 의사와 상담해주세요.',
    )
    setWarningOpen(true)
  }

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

  const handleAiSearch = useCallback(async () => {
    const keyword = query.trim()
    if (!keyword) {
      setError('증상을 입력해주세요.')
      return
    }
    setError('')
    showWarningModal('AI 생성 증상 정보는 진단이 아니며 정확하지 않을 수 있습니다.')
    setAiLoading(true)
    setDetailLoading(true)
    selectionRef.current = keyword
    
    try {
      const info = await searchApiClient.searchSymptomsWithAI(keyword)
      
      // AI 검색 플래그 활성화 (useEffect에서 초기화되지 않도록)
      setIsAiSearch(true)
      const enriched = {
        ...info,
        aiGenerated: info?.aiGenerated ?? true,
      }
      setSelectedSymptom(enriched?.name || keyword)
      setDetail(enriched)
      
      setAiLoading(false)
      setDetailLoading(false)
    } catch (err) {
      logger.error('증상 AI 검색 실패', err)
      // 백엔드 에러 메시지 또는 코드에 따른 친화적 메시지
      const errorData = err?.response?.data
      const errorCode = errorData?.code
      const errorMsg = errorData?.message
      
      if (errorCode === 'SECURITY_005' || errorMsg?.includes('증상만')) {
        setError('증상만 입력해주세요. 예: 두통, 어지러움')
      } else if (errorMsg) {
        setError(errorMsg)
      } else {
        setError('AI 검색에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
      setAiLoading(false)
      setDetailLoading(false)
      setIsAiSearch(false)
    }
  }, [query])

  // ==========================================
  // [Voice] 음성 명령 처리 로직 (반드시 함수 정의 아래에 배치)
  // ==========================================

  // 1. 자동 검색 트리거 (Zustand)
  useEffect(() => {
    const pending = getPendingAction()
    
    if (pending && pending.code === 'AUTO_SEARCH') {
        const type = pending.params?.searchType
        // 'SYMPTOM' 타입일 때만 실행
        if (type === 'SYMPTOM') {
            const action = consumeAction('AUTO_SEARCH')
            if (action && action.params?.query) {
                const keyword = action.params.query
                setQuery(keyword)
                setVoiceTrigger(true) // handleAiSearch 호출을 위한 트리거 당김
            }
        }
    }
  }, [getPendingAction, consumeAction])

  // 2. 트리거가 당겨지면 handleAiSearch 실행
  useEffect(() => {
    if (voiceTrigger && query) {
        handleAiSearch()
        setVoiceTrigger(false)
    }
  }, [voiceTrigger, query, handleAiSearch])

  // 3. 자동 검색 (Legacy Fallback)
  useEffect(() => {
    if (location.state?.autoSearch && query === '') {
      const autoSearchQuery = location.state.autoSearch
      setQuery(autoSearchQuery)
      setTimeout(() => {
        handleAiSearch()
      }, 0)
    }
  }, [location.state, query, handleAiSearch])

  // 4. 초기 선택 처리
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
        <div className={styles.hint}>AI 검색 또는 구글 버튼을 눌러주세요. AI 정보는 참고용입니다.</div>
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.aiButton}
            onClick={handleAiSearch}
            disabled={!query.trim() || aiLoading}
            title="AI 기능은 정확하지 않습니다. 약은 약사와, 병 증세 진단은 의사와 상담하셔야 합니다."
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

      {/* 결과 영역 */}
      <section className={styles.detailSection}>
        <h2 className={styles.resultTitle}>검색 결과</h2>
        <div className={styles.detailCard}>
          {!selectedSymptom && !detail && (
            <p className={styles.empty}>AI 검색 또는 구글 검색을 통해 결과를 조회해주세요.</p>
          )}

          {selectedSymptom && (
            <>
              <div className={styles.detailHeader}>
                <div>
                  <p className={styles.detailLabel}>선택한 증상</p>
                  <h3 className={styles.detailName}>{selectedSymptom}</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {(isAiSearch || detail?.aiGenerated) && (
                    <span className={styles.aiBadge}>AI 생성</span>
                  )}
                  {detail?.severity && <span className={styles.badge}>{detail.severity}</span>}
                </div>
              </div>

              {(isAiSearch || detail?.aiGenerated) && (
                <div className={styles.noticeBox}>
                  <span className={styles.noticeIcon} aria-hidden="true">
                    ⚠️
                  </span>
                  <span>
                    AI 생성 정보는 진단이 아니며 부정확할 수 있습니다. 정확한 판단과 치료는 반드시 의료 전문가와 상담하세요.
                  </span>
                </div>
              )}

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

      <AiWarningModal
        isOpen={warningOpen}
        onClose={() => setWarningOpen(false)}
        contextMessage={warningContext || 'AI 생성 결과는 참고용입니다. 병 증세 진단은 반드시 의사와 상담해주세요.'}
      />
    </div>
  )
}

export default SymptomSearchTab
