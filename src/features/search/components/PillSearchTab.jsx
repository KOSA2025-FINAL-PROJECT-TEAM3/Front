/**
 * 알약 검색 탭 (약품명 기반 검색)
 * AI 경고 시스템 + 처방전 선택 기능 통합 버전
 */

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { STORAGE_KEYS } from '@config/constants'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { usePrescriptionStore } from '@features/medication/store/prescriptionStore'
import { searchApiClient } from '@core/services/api/searchApiClient'
import { ROUTE_PATHS } from '@config/routes.config'
import Modal from '@shared/components/ui/Modal'
import { AiWarningModal } from '@shared/components/ui/AiWarningModal'
import { toast } from '@shared/components/toast/toastStore'
import { useVoiceActionStore } from '@features/voice/stores/voiceActionStore' // [Voice]
import styles from './PillSearchTab.module.scss'

const normalizeText = (text = '') =>
  text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/\s{2,}/g, ' ')
    .trim()

const summarize = (text = '', limit = 140) => {
  const plain = normalizeText(text)
  if (plain.length <= limit) return plain
  return `${plain.slice(0, limit)}…`
}

export const PillSearchTab = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { consumeAction, getPendingAction } = useVoiceActionStore() // [Voice]
  const [itemName, setItemName] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [registeringId, setRegisteringId] = useState(null)
  
  // AI 경고 관련 상태
  const [pendingAiDrug, setPendingAiDrug] = useState(null)
  const [warningOpen, setWarningOpen] = useState(false)
  const [warningContext, setWarningContext] = useState('')
  const [isAiResult, setIsAiResult] = useState(false)
  
  // 처방전 선택 관련 상태
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState(null)

  const { addMedication, medications, fetchMedications } = useMedicationStore((state) => ({
    addMedication: state.addMedication,
    medications: state.medications,
    fetchMedications: state.fetchMedications,
  }))

  const { prescriptions, fetchPrescriptions } = usePrescriptionStore((state) => ({
    prescriptions: state.prescriptions,
    fetchPrescriptions: state.fetchPrescriptions,
  }))

  useEffect(() => {
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token || medications.length > 0) return

    fetchMedications().catch((err) => {
      console.error('복용약 목록 조회 실패', err)
    })
  }, [fetchMedications, medications.length])

  // 실제 검색 로직 (재사용 가능)
  const executeSearch = useCallback(async (keyword) => {
    if (!keyword) {
      setError('약품명을 입력해주세요.')
      setResults([])
      setHasSearched(false)
      return
    }

    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token) {
      setError('로그인 후 검색할 수 있습니다.')
      toast.error('로그인 후 검색할 수 있습니다.')
      setResults([])
      setHasSearched(false)
      return
    }

    setError('')
    setIsAiResult(false)
    setLoading(true)
    setHasSearched(true)
    
    try {
      const list = await searchApiClient.searchDrugs(keyword)
      setResults(Array.isArray(list) ? list : [])
    } catch (err) {
      const isTimeout =
        err?.code === 'ECONNABORTED' ||
        err?.message?.toLowerCase?.().includes('timeout') ||
        err?.response?.status === 504
      const isAuthError = err?.response?.status === 401 || err?.response?.status === 403
      const shouldFallback = !isAuthError

      if (isTimeout || shouldFallback) {
        try {
          const aiResult = await searchApiClient.searchDrugsWithAI(keyword)
          const aiWrapped = aiResult ? [{ ...aiResult, aiGenerated: true }] : []
          setIsAiResult(true)
          setResults(aiWrapped)
          setWarningContext('기본 검색 실패로 AI 생성 정보를 대신 보여줍니다.')
          setWarningOpen(true)
          toast.success('AI 검색 결과를 가져왔습니다. 내용 확인 후 전문가와 상담하세요.')
          return
        } catch (fallbackErr) {
          console.error('약품 검색 타임아웃 후 AI 검색 실패', fallbackErr)
        }
      }

      console.error('약품 검색 실패', err)
      setError('약품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // 폼 제출 핸들러
  const handleSearch = (event) => {
    event?.preventDefault?.()
    executeSearch(itemName.trim())
  }

  // [Voice] 자동 검색 (Zustand)
  useEffect(() => {
    // 1. 대기 중인 액션 확인 (삭제하지 않고 조회만)
    const pending = getPendingAction()
    
    // 2. 내 타입('PILL')이거나 타입이 없을 때만 실행
    if (pending && pending.code === 'AUTO_SEARCH') {
        const type = pending.params?.searchType
        if (!type || type === 'PILL') {
            // 3. 내 것이 확실하므로 소비(삭제)하고 실행
            const action = consumeAction('AUTO_SEARCH')
            if (action && action.params?.query) {
                const keyword = action.params.query
                setItemName(keyword)
                executeSearch(keyword)
            }
        }
    }
  }, [getPendingAction, consumeAction, executeSearch])

  // 자동 검색 (location.state.autoSearch 감지)
  useEffect(() => {
    if (location.state?.autoSearch) {
      const keyword = location.state.autoSearch
      setItemName(keyword) // 검색어 입력창에 표시
      executeSearch(keyword) // 검색 실행
      
      // 중복 실행 방지 (선택 사항: state를 비우는 로직은 navigate replace 등을 써야 하므로 여기선 생략)
    }
  }, [location.state, executeSearch])

  const handleAISearch = async () => {
    const keyword = itemName.trim()
    if (!keyword) {
      setError('약품명을 입력해주세요.')
      return
    }

    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token) {
      setError('로그인 후 검색할 수 있습니다.')
      toast.error('로그인 후 검색할 수 있습니다.')
      return
    }

    setError('')
    setLoading(true)
    setHasSearched(true)
    try {
      const result = await searchApiClient.searchDrugsWithAI(keyword)
      // AI 검색 결과를 배열로 변환
      const aiWrapped = result ? [{ ...result, aiGenerated: true }] : []
      setIsAiResult(true)
      setResults(aiWrapped)
      toast.success('AI 검색 완료! 약 정보를 확인해주세요.')
    } catch (err) {
      console.error('AI 검색 실패', err)
      setError('AI 검색에 실패했습니다. 잠시 후 다시 시도해주세요.')
      setResults([])
      toast.error('AI 검색에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const emptyState = useMemo(
    () => hasSearched && !loading && !error && results.length === 0,
    [hasSearched, loading, error, results],
  )

  // 처방전 선택 프로세스로 진행
  const proceedToPrescriptionSelection = async (drug) => {
    setSelectedDrug(drug)
    setShowPrescriptionModal(true)
    
    try {
      await fetchPrescriptions()
    } catch (err) {
      console.error('처방전 목록 조회 실패', err)
      toast.error('처방전 목록을 불러오지 못했습니다.')
    }
  }

  const handleRegisterMedication = async (drug) => {
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token) {
      toast.error('로그인 후 약을 등록할 수 있습니다.')
      return
    }

    // AI 생성 약품이면 경고 먼저 표시
    if (drug?.aiGenerated) {
      setPendingAiDrug(drug)
      setWarningContext('AI 생성 정보로 등록하려고 합니다. 전문가 상담을 권장합니다.')
      setWarningOpen(true)
      return
    }

    // 일반 약품은 바로 처방전 선택으로 진행
    await proceedToPrescriptionSelection(drug)
  }

  // AI 경고 확인 후 처방전 선택으로 진행
  const confirmAiRegister = () => {
    if (!pendingAiDrug) return
    setWarningOpen(false)
    proceedToPrescriptionSelection({ ...pendingAiDrug, aiGenerated: false })
    setPendingAiDrug(null)
  }

  const handleAddToPrescription = (prescriptionId) => {
    // 처방전 상세 페이지로 이동하면서 약 정보 전달
    navigate(ROUTE_PATHS.prescriptionDetail.replace(':id', prescriptionId), {
      state: { addDrug: selectedDrug }
    })
    setShowPrescriptionModal(false)
  }

  const handleCreateNewPrescription = () => {
    // 새 처방전 등록 페이지로 이동하면서 약 정보 전달
    navigate(ROUTE_PATHS.prescriptionAdd, {
      state: { addDrug: selectedDrug }
    })
    setShowPrescriptionModal(false)
  }

  const renderDetailBlock = (label, value) => {
    const content = normalizeText(value)
    if (!content) return null
    return (
      <div className={styles.detailBlock} key={label}>
        <p className={styles.detailLabel}>{label}</p>
        <div className={styles.detailText}>
          {content.split('\n').map((line, idx) => (
            <p key={`${label}-${idx}`}>{line}</p>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <section className={styles.searchBox}>
        <div>
          <h2 className={styles.title}>약품명으로 검색</h2>
          <p className={styles.description}>모양/색상 역검색은 지원하지 않아요. 약품명을 입력해 조회해주세요.</p>
        </div>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.input}
            placeholder="예) 타이레놀, 아스피린"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            aria-label="약품명 검색어"
          />
          <button
            type="submit"
            className={styles.searchButton}
            disabled={loading || !itemName.trim()}
          >
            {loading ? '검색 중...' : '검색'}
          </button>
          <button
            type="button"
            className={styles.aiSearchButton}
            onClick={handleAISearch}
            disabled={loading || !itemName.trim()}
            title="AI 기능은 정확하지 않습니다. 약은 약사와, 병 증세 진단은 의사와 상담하셔야 합니다."
          >
            {loading ? '검색 중...' : 'AI 검색'}
          </button>
        </form>
        <p className={styles.hint}>검색 혹은 AI 검색 버튼을 누르고 잠시 기다려주세요.</p>
        {error && <p className={styles.error}>{error}</p>}
      </section>

      <section className={styles.resultsSection}>
        {loading && <p className={styles.hint}>검색 중입니다...</p>}

        {!loading && results.length > 0 && (
          <div className={styles.resultList}>
            {results.map((drug) => {
              const key = drug.itemSeq || drug.itemName
              const isRegistered = medications.some(
                (med) => (drug.itemSeq && med.itemSeq === drug.itemSeq) || med.name === drug.itemName,
              )
              const isRegistering = registeringId === key
              const isAiGenerated = isAiResult || !!drug.aiGenerated

              return (
                <article key={`${drug.itemSeq}-${drug.itemName}`} className={styles.resultCard}>
                  <div className={styles.thumbnail}>
                    {drug.itemImage ? (
                      <img src={drug.itemImage} alt={`${drug.itemName} 이미지`} />
                    ) : (
                      <div className={styles.placeholder}>💊</div>
                    )}
                  </div>
                  <div className={styles.resultContent}>
                    <div className={styles.resultHeader}>
                      <h3 className={styles.resultTitle}>{drug.itemName}</h3>
                      <div className={styles.headerChips}>
                        {isAiGenerated && <span className={styles.aiBadge}>AI 생성</span>}
                        {drug.entpName && <span className={styles.manufacturer}>{drug.entpName}</span>}
                      </div>
                    </div>
                    {drug.itemSeq && <p className={styles.meta}>품목기준코드: {drug.itemSeq}</p>}
                    {drug.efcyQesitm && (
                      <p className={styles.summary}>{summarize(drug.efcyQesitm)}</p>
                    )}
                    <div className={styles.resultActions}>
                      <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => handleRegisterMedication(drug)}
                        disabled={isRegistering}
                        title={isAiGenerated ? 'AI 생성 정보는 참고용입니다.' : undefined}
                      >
                        {isRegistering ? '처리 중...' : '처방전에 추가'}
                      </button>
                      <button
                        type="button"
                        className={styles.detailButton}
                        onClick={() => setSelected(drug)}
                      >
                        상세 보기
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {emptyState && <div className={styles.empty}>검색 결과가 없습니다.</div>}
      </section>

      {/* 약품 상세 정보 모달 */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.itemName}
        description={selected?.entpName ? `제조사: ${selected.entpName}` : undefined}
      >
        {(isAiResult || selected?.aiGenerated) && (
          <div className={styles.noticeBox}>
            <span className={styles.noticeIcon} aria-hidden="true">
              ⚠️
            </span>
            <span>
              AI 생성 정보는 참고용이며 부정확할 수 있습니다. 약 정보는 반드시 약사와 상담해주세요.
            </span>
          </div>
        )}
        <div className={styles.detailMeta}>
          {selected?.itemSeq && <span>품목코드 {selected.itemSeq}</span>}
          {selected?.openDe && <span>공개일자 {selected.openDe}</span>}
          {selected?.updateDe && <span>수정일자 {selected.updateDe}</span>}
        </div>
        <div className={styles.detailGrid}>
          {renderDetailBlock('효능', selected?.efcyQesitm)}
          {renderDetailBlock('사용법', selected?.useMethodQesitm)}
          {renderDetailBlock('주의사항', selected?.atpnQesitm)}
          {renderDetailBlock('약/음식 주의', selected?.intrcQesitm)}
          {renderDetailBlock('부작용', selected?.seQesitm)}
          {renderDetailBlock('보관 방법', selected?.depositMethodQesitm)}
        </div>
      </Modal>

      {/* AI 경고 모달 */}
      <AiWarningModal
        isOpen={warningOpen}
        onClose={() => {
          setWarningOpen(false)
          setPendingAiDrug(null)
        }}
        contextMessage={warningContext || 'AI 생성 결과는 참고용입니다. 약 정보는 반드시 약사와 상담해주세요.'}
        footer={
          <div className={styles.confirmActions}>
            <button
              type="button"
              className={styles.detailButton}
              onClick={() => {
                setWarningOpen(false)
                setPendingAiDrug(null)
              }}
            >
              취소
            </button>
            <button
              type="button"
              className={styles.addButton}
              onClick={confirmAiRegister}
              disabled={
                pendingAiDrug &&
                registeringId === (pendingAiDrug.itemSeq || pendingAiDrug.itemName)
              }
            >
              계속 진행
            </button>
          </div>
        }
      />

      {/* 처방전 선택 모달 */}
      <Modal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        title="처방전 선택"
        description={selectedDrug ? `${selectedDrug.itemName}을(를) 추가할 처방전을 선택하세요` : undefined}
      >
        <div className={styles.prescriptionList}>
          {prescriptions.length === 0 && (
            <p className={styles.emptyMessage}>등록된 처방전이 없습니다.</p>
          )}
          {prescriptions.map((prescription) => (
            <button
              key={prescription.id}
              className={styles.prescriptionItem}
              onClick={() => handleAddToPrescription(prescription.id)}
            >
              <div className={styles.prescriptionInfo}>
                <h4>{prescription.pharmacyName || '약국명 미입력'}</h4>
                <p>{prescription.hospitalName || '병원명 미입력'}</p>
                <span className={styles.period}>
                  {prescription.startDate} ~ {prescription.endDate}
                </span>
              </div>
              <span className={styles.arrow}>→</span>
            </button>
          ))}
          <button
            className={styles.newPrescriptionButton}
            onClick={handleCreateNewPrescription}
          >
            + 새 처방전 만들기
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default PillSearchTab
