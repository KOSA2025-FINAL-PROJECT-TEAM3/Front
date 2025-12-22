import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material'
import { useVoiceActionStore } from '@features/voice/stores/voiceActionStore' // [Voice]
import { searchApiClient } from '@core/services/api/searchApiClient'
import AiWarningDialog from '@shared/components/mui/AiWarningDialog'
import logger from '@core/utils/logger'
import { useSearchHistoryStore } from '@features/search/store/searchHistoryStore'

export const SymptomSearchTab = ({ autoFocus = false, layout = 'page', recentSection = null } = {}) => {
  const pendingAction = useVoiceActionStore((state) => state.pendingAction) // [Voice] Subscribe
  const { consumeAction } = useVoiceActionStore()
  const { record, consumeRequest, pendingSymptom } = useSearchHistoryStore((state) => ({
    record: state.record,
    consumeRequest: state.consumeRequest,
    pendingSymptom: state.pending?.symptom,
  }))
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
      const info = await searchApiClient.searchSymptomsWithAI(symptom)
      if (selectionRef.current === symptom) {
        setIsAiSearch(true)
        setDetail({
          ...info,
          aiGenerated: info?.aiGenerated ?? true,
        })
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
    record('symptom', keyword)
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
  }, [query, record])

  // ==========================================
  // [Voice] 음성 명령 처리 로직 (반드시 함수 정의 아래에 배치)
  // ==========================================

  // 1. 자동 검색 트리거 (Zustand Reactive)
  useEffect(() => {
    if (pendingAction && pendingAction.code === 'AUTO_SEARCH') {
        const type = pendingAction.params?.searchType
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
  }, [pendingAction, consumeAction])

  // 2. 트리거가 당겨지면 handleAiSearch 실행
  useEffect(() => {
    if (voiceTrigger && query) {
        handleAiSearch()
        setVoiceTrigger(false)
    }
  }, [voiceTrigger, query, handleAiSearch])

  useEffect(() => {
    if (!pendingSymptom) return
    const request = consumeRequest('symptom')
    if (!request) return
    const term = typeof request === 'string' ? request : request?.term
    if (!term) return
    setQuery(term)
    setVoiceTrigger(true)
  }, [pendingSymptom, consumeRequest])

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

  const inputPanel = (
    <Paper
      component="section"
      variant="outlined"
      sx={{ bgcolor: 'grey.50', borderRadius: 3.5, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
        증상 입력
      </Typography>

      <TextField
        id="symptom-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="예) 두통, 기침, 메스꺼움"
        size="small"
        fullWidth
        autoFocus={autoFocus}
      />

      <Typography variant="caption" color="text.secondary">
        AI 검색 또는 구글 버튼을 눌러주세요. AI 정보는 참고용입니다.
      </Typography>

      <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap' }}>
        <Button
          type="button"
          variant="contained"
          color="secondary"
          onClick={handleAiSearch}
          disabled={!query.trim() || aiLoading}
          title="AI 기능은 정확하지 않습니다. 약은 약사와, 병 증세 진단은 의사와 상담하셔야 합니다."
          sx={{ fontWeight: 900 }}
        >
          {aiLoading ? 'AI 검색 중...' : 'AI 검색'}
        </Button>
        <Button
          type="button"
          variant="contained"
          color="warning"
          onClick={() => {
            const keyword = query.trim()
            if (keyword && keyword.length <= 100) {
              window.open(`https://www.google.com/search?q=${encodeURIComponent(keyword)}`, '_blank')
            }
          }}
          disabled={!query.trim() || query.trim().length > 100}
          title="구글에서 검색 (100자 이하)"
          sx={{ fontWeight: 900 }}
        >
          🔍 구글
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
    </Paper>
  )

  const resultsPanel = (
    <Box component="section" sx={{ mt: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1.5 }}>
        검색 결과
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          p: 2.5,
          bgcolor: 'common.white',
          boxShadow: '0 10px 35px rgba(15, 23, 42, 0.05)',
        }}
      >
        {!selectedSymptom && !detail ? (
          <Typography variant="body2" color="text.secondary">
            AI 검색 또는 구글 검색을 통해 결과를 조회해주세요.
          </Typography>
        ) : null}

        {selectedSymptom ? (
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography variant="caption" color="text.disabled">
                  선택한 증상
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, mt: 0.25 }}>
                  {selectedSymptom}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {(isAiSearch || detail?.aiGenerated) ? (
                  <Chip
                    label="AI 생성"
                    size="small"
                    sx={{
                      bgcolor: 'warning.100',
                      color: 'warning.dark',
                      fontWeight: 900,
                      border: '1px solid',
                      borderColor: 'warning.200',
                    }}
                  />
                ) : null}
                {detail?.severity ? (
                  <Chip
                    label={detail.severity}
                    size="small"
                    sx={{ bgcolor: 'success.100', color: 'success.dark', fontWeight: 900 }}
                  />
                ) : null}
              </Stack>
            </Stack>

            {(isAiSearch || detail?.aiGenerated) ? (
              <Alert severity="warning">
                AI 생성 정보는 진단이 아니며 부정확할 수 있습니다. 정확한 판단과 치료는 반드시 의료 전문가와 상담하세요.
              </Alert>
            ) : null}

            {detailLoading ? (
              <Typography variant="body2" color="text.secondary">
                자세한 정보를 불러오는 중입니다...
              </Typography>
            ) : null}

            {!detailLoading && detail ? (
              <Stack spacing={2}>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {detail.description}
                </Typography>

                {detail.possibleCauses?.length > 0 ? (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                      가능한 원인
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {detail.possibleCauses.map((cause) => (
                        <Chip key={cause} label={cause} size="small" sx={{ bgcolor: 'grey.100', fontWeight: 700 }} />
                      ))}
                    </Stack>
                  </Box>
                ) : null}

                {detail.recommendedActions?.length > 0 ? (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                      추천 조치
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
                      {detail.recommendedActions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </Box>
                  </Box>
                ) : null}
              </Stack>
            ) : null}
          </Stack>
        ) : null}
      </Paper>
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
      <Stack spacing={2}>
        {inputPanel}
        {recentSection}
        {resultsPanel}
      </Stack>
    )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {main}

      <AiWarningDialog
        isOpen={warningOpen}
        onClose={() => setWarningOpen(false)}
        contextMessage={warningContext || 'AI 생성 결과는 참고용입니다. 병 증세 진단은 반드시 의사와 상담해주세요.'}
      />
    </Box>
  )
}

export default SymptomSearchTab
