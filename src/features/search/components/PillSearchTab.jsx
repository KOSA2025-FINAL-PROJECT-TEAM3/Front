/**
 * 알약 검색 탭 (약품명 기반 검색)
 */

import { useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '@config/constants'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { searchApiClient } from '@core/services/api/searchApiClient'
import Modal from '@shared/components/ui/Modal'
import { toast } from '@shared/components/toast/toastStore'
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
  const [itemName, setItemName] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [registeringId, setRegisteringId] = useState(null)

  const { addMedication, medications, fetchMedications } = useMedicationStore((state) => ({
    addMedication: state.addMedication,
    medications: state.medications,
    fetchMedications: state.fetchMedications,
  }))

  useEffect(() => {
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token || medications.length > 0) return

    fetchMedications().catch((err) => {
      console.error('복용약 목록 조회 실패', err)
    })
  }, [fetchMedications, medications.length])

  const handleSearch = async (event) => {
    event?.preventDefault?.()
    const keyword = itemName.trim()
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
    setLoading(true)
    setHasSearched(true)
    try {
      const list = await searchApiClient.searchDrugs(keyword)
      setResults(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('약품 검색 실패', err)
      setError('약품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const emptyState = useMemo(
    () => hasSearched && !loading && !error && results.length === 0,
    [hasSearched, loading, error, results],
  )

  const handleRegisterMedication = async (drug) => {
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token) {
      toast.error('로그인 후 복용약을 등록할 수 있습니다.')
      return
    }

    const key = drug.itemSeq || drug.itemName
    if (!key) return

    const alreadyExists = medications.some(
      (med) => (drug.itemSeq && med.itemSeq === drug.itemSeq) || med.name === drug.itemName,
    )
    if (alreadyExists) {
      toast.success('이미 복용약에 등록된 약입니다.')
      return
    }

    setRegisteringId(key)
    try {
      const payload = {
        name: drug.itemName || '',
        ingredient: drug.entpName || '',
        dosage: normalizeText(drug.useMethodQesitm)?.split('\n')?.[0] || '',
        notes: normalizeText(drug.efcyQesitm),
        active: true,
      }
      await addMedication(payload)
      toast.success('내 복용약에 등록했습니다.')
    } catch (err) {
      console.error('복용약 등록 실패', err)
      toast.error('복용약 등록에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setRegisteringId(null)
    }
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
        </form>
        <p className={styles.hint}>식약처(MFDS) 데이터 기준으로 약품 정보를 검색합니다.</p>
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
                      {drug.entpName && <span className={styles.manufacturer}>{drug.entpName}</span>}
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
                        disabled={isRegistering || isRegistered}
                      >
                        {isRegistering ? '등록 중...' : isRegistered ? '등록됨' : '내 복용약에 등록'}
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

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.itemName}
        description={selected?.entpName ? `제조사: ${selected.entpName}` : undefined}
      >
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
    </div>
  )
}

export default PillSearchTab
