/**
 * 알약 검색 탭 (약품명 기반 검색)
 * AI 경고 시스템 + 처방전 선택 기능 통합 버전
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { STORAGE_KEYS } from '@config/constants'
import { ROUTE_PATHS } from '@config/routes.config'
import { searchApiClient } from '@core/services/api/searchApiClient'
import logger from '@core/utils/logger'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { useVoiceActionStore } from '@features/voice/stores/voiceActionStore'
import AppDialog from '@shared/components/mui/AppDialog'
import AiWarningDialog from '@shared/components/mui/AiWarningDialog'
import { toast } from '@shared/components/toast/toastStore'
import { useSearchHistoryStore } from '@features/search/store/searchHistoryStore'
import CameraAltIcon from '@mui/icons-material/CameraAlt'

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

const DetailBlock = ({ label, value }) => {
  const content = normalizeText(value)
  if (!content) return null

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3, bgcolor: 'grey.50' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.75 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {content}
      </Typography>
    </Paper>
  )
}

export const PillSearchTab = ({ autoFocus = false, onOpenOcr, layout = 'page', recentSection = null, onRequestClose, targetUserId, targetUserName } = {}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const pendingAction = useVoiceActionStore((state) => state.pendingAction)
  const { consumeAction } = useVoiceActionStore()
  const { record, consumeRequest, pendingPill } = useSearchHistoryStore((state) => ({
    record: state.record,
    consumeRequest: state.consumeRequest,
    pendingPill: state.pending?.pill,
  }))

  const [itemName, setItemName] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  const [pendingAiDrug, setPendingAiDrug] = useState(null)
  const [warningOpen, setWarningOpen] = useState(false)
  const [warningContext, setWarningContext] = useState('')
  const [isAiResult, setIsAiResult] = useState(false)

  const { medications, fetchMedications } = useMedicationStore((state) => ({
    medications: state.medications,
    fetchMedications: state.fetchMedications,
  }))

  useEffect(() => {
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token || medications.length > 0) return

    fetchMedications().catch((err) => {
      logger.error('복용약 목록 조회 실패', err)
    })
  }, [fetchMedications, medications.length])

  const executeSearch = useCallback(async (keyword) => {
    if (!keyword) {
      setError('약품명을 입력해주세요.')
      setResults([])
      setHasSearched(false)
      return
    }

    record('pill', keyword)

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
          logger.error('약품 검색 타임아웃 후 AI 검색 실패', fallbackErr)
        }
      }

      logger.error('약품 검색 실패', err)
      setError('약품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [record])

  const handleAISearch = useCallback(async (overrideKeyword) => {
    const keyword = (typeof overrideKeyword === 'string' ? overrideKeyword : itemName).trim()
    if (!keyword) {
      setError('약품명을 입력해주세요.')
      return
    }

    record('pill', keyword)

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
      const aiWrapped = result ? [{ ...result, aiGenerated: true }] : []
      setIsAiResult(true)
      setResults(aiWrapped)
      toast.success('AI 검색 완료! 약 정보를 확인해주세요.')
    } catch (err) {
      logger.error('AI 검색 실패', err)
      const errorData = err?.response?.data
      const errorCode = errorData?.code
      const errorMsg = errorData?.message

      if (errorCode === 'SECURITY_004' || errorMsg?.includes('약물명만') || errorMsg?.includes('약품명만')) {
        setError('약물명만 입력해주세요. 예: 타이레놀, 아스피린')
        toast.error('약물명만 입력해주세요.')
      } else if (errorMsg) {
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        setError('AI 검색에 실패했습니다. 잠시 후 다시 시도해주세요.')
        toast.error('AI 검색에 실패했습니다.')
      }
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [itemName, record])

  const handleSearch = (event) => {
    event?.preventDefault?.()
    executeSearch(itemName.trim())
  }

  useEffect(() => {
    if (pendingAction && pendingAction.code === 'AUTO_SEARCH') {
      const type = pendingAction.params?.searchType
      if (!type || type === 'PILL') {
        const action = consumeAction('AUTO_SEARCH')
        if (action && action.params?.query) {
          const keyword = action.params.query
          setItemName(keyword)
          executeSearch(keyword)
        }
      }
    }
  }, [pendingAction, consumeAction, executeSearch])

  useEffect(() => {
    if (!pendingPill) return
    const request = consumeRequest('pill')
    if (!request) return

    const term = typeof request === 'string' ? request : request?.term
    const variant = typeof request === 'string' ? 'default' : request?.variant
    if (!term) return

    setItemName(term)
    if (variant === 'ai') {
      handleAISearch(term)
      return
    }
    executeSearch(term)
  }, [pendingPill, consumeRequest, executeSearch, handleAISearch])

  useEffect(() => {
    if (location.state?.autoSearch) {
      const keyword = location.state.autoSearch
      setItemName(keyword)
      executeSearch(keyword)
    }
  }, [location.state, executeSearch])

  const emptyState = useMemo(
    () => hasSearched && !loading && !error && results.length === 0,
    [hasSearched, loading, error, results],
  )

  const handleRegisterMedication = async (drug) => {
    const token = window.localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!token) {
      toast.error('로그인 후 약을 등록할 수 있습니다.')
      return
    }

    if (drug?.aiGenerated) {
      setPendingAiDrug(drug)
      setWarningContext('AI 생성 정보로 등록하려고 합니다. 전문가 상담을 권장합니다.')
      setWarningOpen(true)
      return
    }

    // Directly navigate to prescription add page
    navigate(ROUTE_PATHS.prescriptionAdd, {
      state: { addDrug: drug, targetUserId, targetUserName },
    })
    onRequestClose?.() // Close overlay if exists
  }

  const confirmAiRegister = () => {
    if (!pendingAiDrug) return
    setWarningOpen(false)
    navigate(ROUTE_PATHS.prescriptionAdd, {
      state: { addDrug: { ...pendingAiDrug, aiGenerated: false }, targetUserId, targetUserName },
    })
    setPendingAiDrug(null)
    onRequestClose?.() // Close overlay if exists
  }

  const inputPanel = (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'grey.50' }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          약품명으로 검색
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          모양/색상 역검색은 지원하지 않아요. 약품명을 입력해 조회해주세요.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSearch}>
        <Stack spacing={1.5}>
          <TextField
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="약품명만 입력 (예: 타이레놀)"
            aria-label="약품명 검색어"
            size="small"
            fullWidth
            autoFocus={autoFocus}
          />

          <Stack direction="row" spacing={1} sx={{ '& > *': { flex: 1 } }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !itemName.trim()}
              sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}
            >
              {loading ? '검색 중...' : '검색'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={handleAISearch}
              disabled={loading || !itemName.trim()}
              title="AI 기능은 정확하지 않습니다. 약은 약사와, 병 증세 진단은 의사와 상담하셔야 합니다."
              sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}
            >
              {loading ? '검색 중...' : 'AI 검색'}
            </Button>
            {onOpenOcr ? (
              <Button
                type="button"
                variant="outlined"
                onClick={() => onOpenOcr()}
                sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}
                startIcon={<CameraAltIcon />}
              >
                OCR 약봉투
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        💡 약품명만 입력해주세요. "부작용", "효능" 등 추가 지시는 넣지 마세요.
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error}
        </Alert>
      ) : null}
    </Paper>
  )

  const resultsPanel = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {loading ? (
        <Typography variant="body2" color="text.secondary">
          검색 중입니다...
        </Typography>
      ) : null}

      {!loading && results.length > 0 ? (
        <Stack spacing={1.5}>
          {results.map((drug) => {
            const isAiGenerated = isAiResult || Boolean(drug.aiGenerated)
            const key = drug.itemSeq || drug.itemName || drug.name

            return (
              <Card key={key} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ display: 'flex', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: 3,
                      bgcolor: 'grey.100',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {drug.itemImage ? (
                      <Box
                        component="img"
                        src={drug.itemImage}
                        alt={`${drug.itemName} 이미지`}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: 36, color: 'text.secondary' }}>💊</Typography>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        {drug.itemName}
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.75 }}>
                        {isAiGenerated ? <Chip size="small" label="AI 생성" color="warning" sx={{ fontWeight: 900 }} /> : null}
                        {drug.entpName ? <Chip size="small" label={drug.entpName} variant="outlined" /> : null}
                      </Stack>
                    </Box>

                    {drug.itemSeq ? (
                      <Typography variant="caption" color="text.secondary">
                        품목기준코드: {drug.itemSeq}
                      </Typography>
                    ) : null}

                    {drug.efcyQesitm ? (
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        {summarize(drug.efcyQesitm)}
                      </Typography>
                    ) : null}
                  </Box>
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1.25 }}>
                  <Button
                    type="button"
                    variant="contained"
                    color="success"
                    onClick={() => handleRegisterMedication(drug)}
                    sx={{ fontWeight: 900 }}
                    title={isAiGenerated ? 'AI 생성 정보는 참고용입니다.' : undefined}
                  >
                    처방전에 추가
                  </Button>
                  <Button type="button" variant="outlined" onClick={() => setSelected(drug)} sx={{ fontWeight: 900 }}>
                    상세 보기
                  </Button>
                </CardActions>
              </Card>
            )
          })}
        </Stack>
      ) : null}

      {emptyState ? (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, textAlign: 'center', color: 'text.secondary' }}>
          검색 결과가 없습니다.
        </Paper>
      ) : null}
    </Box>
  )

  const main =
    layout === 'overlay' ? (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '420px 1fr' }, gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {inputPanel}
          {recentSection}
        </Box>
        <Box sx={{ minWidth: 0 }}>{resultsPanel}</Box>
      </Box>
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {inputPanel}
        {recentSection}
        {resultsPanel}
      </Box>
    )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {main}

      <AppDialog
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.itemName}
        description={selected?.entpName ? `제조사: ${selected.entpName}` : undefined}
        maxWidth="md"
      >
        {(isAiResult || selected?.aiGenerated) ? (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            AI 생성 정보는 참고용이며 부정확할 수 있습니다. 약 정보는 반드시 약사와 상담해주세요.
          </Alert>
        ) : null}

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
          {selected?.itemSeq ? <Chip size="small" label={`품목코드 ${selected.itemSeq}`} /> : null}
          {selected?.openDe ? <Chip size="small" label={`공개일자 ${selected.openDe}`} /> : null}
          {selected?.updateDe ? <Chip size="small" label={`수정일자 ${selected.updateDe}`} /> : null}
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1.5 }}>
          <DetailBlock label="효능" value={selected?.efcyQesitm} />
          <DetailBlock label="사용법" value={selected?.useMethodQesitm} />
          <DetailBlock label="주의사항" value={selected?.atpnQesitm} />
          <DetailBlock label="약/음식 주의" value={selected?.intrcQesitm} />
          <DetailBlock label="부작용" value={selected?.seQesitm} />
          <DetailBlock label="보관 방법" value={selected?.depositMethodQesitm} />
        </Box>
      </AppDialog>

      <AiWarningDialog
        isOpen={warningOpen}
        onClose={() => {
          setWarningOpen(false)
          setPendingAiDrug(null)
        }}
        contextMessage={warningContext || 'AI 생성 결과는 참고용입니다. 약 정보는 반드시 약사와 상담해주세요.'}
        footer={
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => {
                setWarningOpen(false)
                setPendingAiDrug(null)
              }}
              sx={{ fontWeight: 900 }}
            >
              취소
            </Button>
            <Button variant="contained" onClick={confirmAiRegister} disabled={!pendingAiDrug} sx={{ fontWeight: 900 }}>
              계속 진행
            </Button>
          </Stack>
        }
      />


    </Box>
  )
}

export default PillSearchTab
