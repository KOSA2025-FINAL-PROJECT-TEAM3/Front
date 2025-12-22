import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material'

import { MEAL_TYPES, MEAL_TYPE_LABELS, USER_ROLES } from '@config/constants'
import { ROUTE_PATHS } from '@config/routes.config'
import { dietApiClient } from '@core/services/api/dietApiClient'
import logger from '@core/utils/logger'
import DietAnalysisModal from '@features/diet/components/DietAnalysisModal'
import { useSearchHistoryStore } from '@features/search/store/searchHistoryStore'
import { useFamilyStore } from '@features/family/store/familyStore'
import { useAuth } from '@features/auth/hooks/useAuth'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const extractPayload = (resp) => (resp && resp.data ? resp.data : resp)

const pollAnalysisJob = async (jobId) => {
  const maxAttempts = 20
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const resp = extractPayload(await dietApiClient.getAnalysisJob(jobId))
    if (resp?.status === 'DONE') return resp.result
    if (resp?.status === 'FAILED') throw new Error(resp.error || '분석에 실패했습니다.')
    await wait(1000)
  }
  throw new Error('분석이 지연되고 있습니다. 잠시 후 다시 시도해주세요.')
}

export const DietSearchTab = ({ autoFocus = false, layout = 'page', recentSection = null, onRequestClose } = {}) => {
  const navigate = useNavigate()
  const customerRole = useAuth((state) => state.customerRole)
  const roleKey = normalizeCustomerRole(customerRole) || USER_ROLES.SENIOR
  const isCaregiver = roleKey === USER_ROLES.CAREGIVER
  const familyMembers = useFamilyStore((state) => state.members || [])
  const { record, consumeRequest, pendingDiet } = useSearchHistoryStore((state) => ({
    record: state.record,
    consumeRequest: state.consumeRequest,
    pendingDiet: state.pending?.diet,
  }))

  const [mealType, setMealType] = useState(MEAL_TYPES.BREAKFAST)
  const [foodName, setFoodName] = useState('')

  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const lastRequestRef = useRef(null)

  const handleAnalyze = useCallback(
    async (overrideFoodName) => {
      const keyword = String(typeof overrideFoodName === 'string' ? overrideFoodName : foodName || '').trim()
      if (!keyword) {
        setAnalysisError('음식 이름을 입력해주세요.')
        return
      }

      record('diet', keyword)

      setAnalysisError('')
      setAnalysisLoading(true)
      setAnalysisOpen(true)

      try {
        lastRequestRef.current = { mealType, foodName: keyword }
        const jobResp = extractPayload(await dietApiClient.startAnalysisJob(null, mealType, keyword))
        const jobId = jobResp?.jobId
        if (!jobId) {
          throw new Error('분석 요청에 실패했습니다.')
        }
        const result = await pollAnalysisJob(jobId)
        setAnalysisResult(result)
      } catch (err) {
        logger.error('[DietSearchTab] analyze failed', err)
        setAnalysisResult(null)
        setAnalysisError(err?.message || '음식 분석에 실패했습니다.')
      } finally {
        setAnalysisLoading(false)
      }
    },
    [foodName, mealType, record],
  )

  const handleRetry = useCallback(async () => {
    const req = lastRequestRef.current
    if (!req?.foodName) {
      setAnalysisError('다시 시도할 요청이 없습니다.')
      return
    }
    await handleAnalyze(req.foodName)
  }, [handleAnalyze])

  useEffect(() => {
    if (!pendingDiet) return
    const request = consumeRequest('diet')
    if (!request) return
    const term = typeof request === 'string' ? request : request?.term
    if (!term) return
    setFoodName(term)
    handleAnalyze(term)
  }, [consumeRequest, handleAnalyze, pendingDiet])

  const counts = useMemo(() => {
    const drugCount = Array.isArray(analysisResult?.drugInteractions) ? analysisResult.drugInteractions.length : 0
    const diseaseCount = Array.isArray(analysisResult?.diseaseInteractions) ? analysisResult.diseaseInteractions.length : 0
    return { drugCount, diseaseCount }
  }, [analysisResult])

  const inputPanel = (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'grey.50' }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          식단 분석
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          음식 이름을 입력하면 복용약/질병과의 주의사항을 분석합니다.
        </Typography>
      </Box>

      <Stack spacing={1.25}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.75 }}>
            식사 구분
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.values(MEAL_TYPES).map((type) => (
              <Chip
                key={type}
                label={MEAL_TYPE_LABELS[type]}
                onClick={() => setMealType(type)}
                color={mealType === type ? 'primary' : 'default'}
                variant={mealType === type ? 'filled' : 'outlined'}
                clickable
                sx={{ borderRadius: 2, fontWeight: mealType === type ? 900 : 700 }}
              />
            ))}
          </Stack>
        </Box>

        <TextField
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          placeholder="예) 사과, 라면, 김치찌개"
          aria-label="음식 이름"
          size="small"
          fullWidth
          autoFocus={autoFocus}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
          <Button
            type="button"
            variant="contained"
            disabled={analysisLoading || !foodName.trim()}
            onClick={() => handleAnalyze()}
            sx={{ fontWeight: 900, minWidth: 120 }}
          >
            {analysisLoading ? '분석 중...' : '분석'}
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              onRequestClose?.()
              navigate(ROUTE_PATHS.dietLog)
            }}
            sx={{ fontWeight: 900, minWidth: 120 }}
          >
            식단 기록
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="warning"
            onClick={() => {
              onRequestClose?.()
              if (isCaregiver) {
                const senior = (familyMembers || []).find((m) => m.role === 'SENIOR') || null
                if (senior?.userId) {
                  navigate(`${ROUTE_PATHS.dietWarning}?userId=${encodeURIComponent(String(senior.userId))}`)
                  return
                }
              }
              navigate(ROUTE_PATHS.dietWarning)
            }}
            sx={{ fontWeight: 900, minWidth: 120 }}
          >
            식단 경고
          </Button>
        </Stack>

        {analysisError ? <Alert severity="error">{analysisError}</Alert> : null}
      </Stack>
    </Paper>
  )

  const resultsPanel = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {analysisResult ? (
        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            최근 분석 결과
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {analysisResult?.foodName ? <Chip size="small" label={analysisResult.foodName} /> : null}
            {analysisResult?.overallLevel ? <Chip size="small" color="warning" label={`주의 ${analysisResult.overallLevel}`} /> : null}
            <Chip size="small" label={`약물 ${counts.drugCount}`} />
            <Chip size="small" label={`질병 ${counts.diseaseCount}`} />
          </Stack>
          {analysisResult?.summary ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {analysisResult.summary}
            </Typography>
          ) : null}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5 }}>
            <Button type="button" variant="outlined" onClick={() => setAnalysisOpen(true)} sx={{ fontWeight: 900 }}>
              상세 보기
            </Button>
            <Button type="button" variant="contained" onClick={() => setAnalysisOpen(true)} sx={{ fontWeight: 900 }}>
              기록으로 저장
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, textAlign: 'center', color: 'text.secondary' }}>
          음식 이름을 입력하고 분석을 실행하세요.
        </Paper>
      )}
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

      <DietAnalysisModal
        isOpen={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
        analysisResult={analysisResult}
        isLoading={analysisLoading}
        errorMessage={analysisError || null}
        onRetry={analysisError ? handleRetry : undefined}
        onSave={(result) => {
          setAnalysisOpen(false)
          if (!result) return
          onRequestClose?.()
          navigate(ROUTE_PATHS.dietLog, {
            state: {
              autoFillData: { foodName: result.foodName, mealType: result.mealType },
              initialAnalysisResult: result,
            },
          })
        }}
      />
    </Box>
  )
}

export default DietSearchTab
