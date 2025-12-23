import logger from "@core/utils/logger"
import { useEffect, useState, useCallback } from 'react'
import { useLocation, Link } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { MealInputForm } from '../components/MealInputForm'
import { dietApiClient } from '@core/services/api/dietApiClient'
import { useVoiceActionStore } from '@features/voice/stores/voiceActionStore'
import { Box, Typography, Alert, Button, Collapse, Stack, Card, CardContent, Chip, Divider } from '@mui/material'
import { toast } from '@shared/components/toast/toastStore'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'
import { ROUTE_PATHS } from '@config/routes.config'

export const DietLogPage = () => {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [editingMeal, setEditingMeal] = useState(null)
  const [recentLog, setRecentLog] = useState(null) // Only show the most recent log

  // Recovery State
  const [recoveredJob, setRecoveredJob] = useState(null)
  const [initialAnalysis, setInitialAnalysis] = useState(null)

  // Voice Action State
  const [autoFillData, setAutoFillData] = useState(null)
  const pendingAction = useVoiceActionStore((state) => state.pendingAction)
  const { consumeAction } = useVoiceActionStore()

  useEffect(() => {
    const navAutoFill = location.state?.autoFillData
    if (navAutoFill && (navAutoFill.foodName || navAutoFill.mealType)) {
      setAutoFillData(navAutoFill)
    }
    if (location.state?.initialAnalysisResult) {
      setInitialAnalysis(location.state.initialAnalysisResult)
    }
  }, [location.state])

  // [Recovery] Check for pending analysis job
  useEffect(() => {
    const checkRecovery = async () => {
      const lastJobId = localStorage.getItem('last_diet_job_id')
      if (!lastJobId) return

      try {
        const resp = await dietApiClient.getAnalysisJob(lastJobId)
        const jobData = (resp && resp.data) ? resp.data : resp

        if (jobData && jobData.status === 'DONE' && jobData.result) {
          logger.info('Found recoverable diet job:', jobData)
          setRecoveredJob({
            id: lastJobId,
            result: jobData.result
          })
        } else if (jobData && jobData.status === 'FAILED') {
          localStorage.removeItem('last_diet_job_id')
        }
      } catch (error) {
        logger.warn('Failed to check recovery job:', error)
        localStorage.removeItem('last_diet_job_id')
      }
    }

    checkRecovery()
  }, [])

  const handleApplyRecovery = () => {
    if (recoveredJob && recoveredJob.result) {
      setInitialAnalysis(recoveredJob.result)
      setRecoveredJob(null)
      localStorage.removeItem('last_diet_job_id')
      toast.success('분석 결과를 불러왔습니다.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDiscardRecovery = () => {
    setRecoveredJob(null)
    localStorage.removeItem('last_diet_job_id')
  }

  // Voice Command Handling (Auto Fill)
  useEffect(() => {
    if (pendingAction && pendingAction.code === 'AUTO_LOG_DIET') {
      const action = consumeAction('AUTO_LOG_DIET')
      if (action && action.params) {
        logger.info('🎤 Voice Action Auto-Fill:', action)
        setAutoFillData({
          foodName: action.params.foodName,
          mealType: action.params.mealType
        })
      }
    }
  }, [pendingAction, consumeAction])

  const fetchRecentLog = useCallback(async () => {
    setLoading(true)
    try {
      const logs = await dietApiClient.getDietLogs()
      if (logs && logs.length > 0) {
        const latest = logs[0]

        let drugInteractions = []
        let diseaseInteractions = []

        try {
          drugInteractions = typeof latest.drugInteractions === 'string'
            ? JSON.parse(latest.drugInteractions)
            : latest.drugInteractions || []
        } catch (e) {
          logger.error('Failed to parse drugInteractions', e)
        }

        try {
          diseaseInteractions = typeof latest.diseaseInteractions === 'string'
            ? JSON.parse(latest.diseaseInteractions)
            : latest.diseaseInteractions || []
        } catch (e) {
          logger.error('Failed to parse diseaseInteractions', e)
        }

        setRecentLog({
          ...latest,
          drugInteractions,
          diseaseInteractions
        })
      } else {
        setRecentLog(null)
      }
    } catch (error) {
      logger.error('Failed to fetch diet logs:', error)
      toast.error('식단 기록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecentLog()
  }, [fetchRecentLog])


  const handleAddMeal = useCallback(
    async (newMeal) => {
      try {
        await dietApiClient.addDietLog(newMeal)
        setEditingMeal(null)
        fetchRecentLog() // Update to show the newest log
      } catch (error) {
        logger.error('Failed to add diet log:', error)
        toast.error('식단 기록 추가에 실패했습니다.')
      }
    },
    [fetchRecentLog],
  )

  const handleUpdateMeal = useCallback(
    async (mealId, updatedData) => {
      try {
        await dietApiClient.updateDietLog(mealId, updatedData)
        setEditingMeal(null)
        fetchRecentLog()
      } catch (error) {
        logger.error('Failed to update diet log:', error)
        toast.error('식단 기록 수정에 실패했습니다.')
      }
    },
    [fetchRecentLog],
  )

  const handleCancelEdit = useCallback(() => {
    setEditingMeal(null)
  }, [])

  // Helpers for Warning Display
  const getLevelColor = (level) => {
    switch (level) {
      case 'DANGER': return 'error'
      case 'WARNING': return 'warning'
      case 'GOOD': return 'success'
      default: return 'default'
    }
  }

  const getLevelLabel = (level) => {
    switch (level) {
      case 'DANGER': return '경고'
      case 'WARNING': return '주의'
      case 'GOOD': return '안전'
      default: return level
    }
  }

  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          leading={<BackButton />}
          title={editingMeal ? '식단 수정' : '식단 기록'}
          subtitle={editingMeal ? '선택한 식단을 수정하세요.' : '오늘의 식단을 기록하고 결과를 확인하세요.'}
        />

        {/* Recovery Alert */}
        <Collapse in={!!recoveredJob}>
          {recoveredJob && (
            <Alert
              severity="info"
              sx={{ mb: 3 }}
              action={
                <Stack direction="row" spacing={1}>
                  <Button color="inherit" size="small" onClick={handleDiscardRecovery}>
                    무시
                  </Button>
                  <Button variant="contained" color="primary" size="small" onClick={handleApplyRecovery}>
                    불러오기
                  </Button>
                </Stack>
              }
            >
              방금 분석 완료된 식단 결과가 있습니다.
            </Alert>
          )}
        </Collapse>

        {/* Input Form */}
        <Box sx={{ mb: 4 }}>
          <MealInputForm
            onAddMeal={handleAddMeal}
            onUpdateMeal={handleUpdateMeal}
            editingMeal={editingMeal}
            onCancelEdit={handleCancelEdit}
            autoFillData={autoFillData}
            initialAnalysisResult={initialAnalysis}
          />
        </Box>

        {/* Latest Warning / Result Section */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              🔍 최근 식단 분석 결과
            </Typography>
            <Link to={ROUTE_PATHS.dietWarning} style={{ textDecoration: 'none' }}>
              <Button size="small" variant="text">
                전체 히스토리 보기 {'>'}
              </Button>
            </Link>
          </Box>

          {loading ? (
            <Typography textAlign="center" color="text.secondary" sx={{ py: 3 }}>
              분석 결과를 불러오는 중...
            </Typography>
          ) : !recentLog ? (
            <Card variant="outlined" sx={{ borderStyle: 'dashed', borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  최근 기록된 식단이 없습니다.<br />
                  위에서 식단을 추가해보세요!
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={3}>
              {/* Main Summary Card */}
              <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'primary.light', borderWidth: 1 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {recentLog.foodName}
                    </Typography>
                    <Chip
                      label={recentLog.overallLevel}
                      color={getLevelColor(recentLog.overallLevel === '주의' ? 'WARNING' : recentLog.overallLevel === '경고' ? 'DANGER' : 'GOOD')}
                      size="small"
                    />
                  </Box>
                  <Stack direction="row" spacing={1} mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(recentLog.recordedAt || recentLog.createdAt).toLocaleString('ko-KR')}
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography variant="caption" color="text.secondary">
                      {recentLog.mealType}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.primary" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                    {recentLog.summary}
                  </Typography>
                </CardContent>
              </Card>

              {/* Interactions */}
              {(recentLog.drugInteractions.length > 0 || recentLog.diseaseInteractions.length > 0) ? (
                <Box>
                  {/* Drug Interactions */}
                  {recentLog.drugInteractions.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                        💊 약물 상호작용
                        <Chip label={recentLog.drugInteractions.length} size="small" color="error" variant="outlined" />
                      </Typography>
                      <Stack spacing={1}>
                        {recentLog.drugInteractions.map((interaction, idx) => (
                          <Alert
                            key={idx}
                            severity={interaction.level === 'DANGER' ? 'error' : 'warning'}
                            sx={{ borderRadius: 2 }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold">
                              {interaction.medicationName} ({getLevelLabel(interaction.level)})
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {interaction.description}
                            </Typography>
                            {interaction.recommendation && (
                              <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
                                💡 {interaction.recommendation}
                              </Typography>
                            )}
                          </Alert>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Disease Interactions */}
                  {recentLog.diseaseInteractions.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                        🏥 질병 관련 주의사항
                        <Chip label={recentLog.diseaseInteractions.length} size="small" color="warning" variant="outlined" />
                      </Typography>
                      <Stack spacing={1}>
                        {recentLog.diseaseInteractions.map((interaction, idx) => (
                          <Alert
                            key={idx}
                            severity={interaction.level === 'DANGER' ? 'error' : 'warning'}
                            sx={{ borderRadius: 2 }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold">
                              {interaction.diseaseName} ({getLevelLabel(interaction.level)})
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {interaction.description}
                            </Typography>
                            {interaction.recommendation && (
                              <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
                                💡 {interaction.recommendation}
                              </Typography>
                            )}
                          </Alert>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              ) : (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  발견된 위험 상호작용이 없습니다. 안심하고 드셔도 됩니다!
                </Alert>
              )}
            </Stack>
          )}
        </Box>
      </PageStack>
    </MainLayout>
  )
}

export default DietLogPage
