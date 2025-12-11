
import { useState, useEffect } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { dietApiClient } from '@/core/services/api/dietApiClient'
import styles from './FoodWarning.module.scss'
import { CircularProgress, Alert, Box, Typography, Chip, Stack, Divider, Card, CardContent } from '@mui/material'
import { useSearchParams } from 'react-router-dom'

export const FoodWarningPage = () => {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentLog, setRecentLog] = useState(null)

  useEffect(() => {
    const fetchRecentLog = async () => {
      try {
        setLoading(true)
        const userIdParam = searchParams.get('userId')
        const logs = await dietApiClient.getDietLogs(userIdParam ? { userId: userIdParam } : undefined)
        if (logs && logs.length > 0) {
          const latest = logs[0]

          // Parse JSON strings if they are strings
          let drugInteractions = []
          let diseaseInteractions = []

          try {
            drugInteractions = typeof latest.drugInteractions === 'string'
              ? JSON.parse(latest.drugInteractions)
              : latest.drugInteractions || []
          } catch (e) {
            console.error('Failed to parse drugInteractions', e)
          }

          try {
            diseaseInteractions = typeof latest.diseaseInteractions === 'string'
              ? JSON.parse(latest.diseaseInteractions)
              : latest.diseaseInteractions || []
          } catch (e) {
            console.error('Failed to parse diseaseInteractions', e)
          }

          setRecentLog({
            ...latest,
            drugInteractions,
            diseaseInteractions
          })
        }
      } catch (err) {
        console.error('Failed to fetch diet logs:', err)
        setError('식단 기록을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentLog()
  }, [])

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
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>음식 충돌 경고</h1>
          <p>최근 기록된 식단과 복용 중인 약물 정보를 기반으로 자동 분석합니다.</p>
        </header>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !recentLog ? (
          <Alert severity="info">최근 식단 기록이 없습니다.</Alert>
        ) : (
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {recentLog.foodName}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {recentLog.summary}
                </Typography>
                <Chip
                  label={recentLog.overallLevel}
                  color={getLevelColor(recentLog.overallLevel === '주의' ? 'WARNING' : recentLog.overallLevel === '경고' ? 'DANGER' : 'GOOD')}
                  size="small"
                />
              </CardContent>
            </Card>

            {/* Drug Interactions */}
            {recentLog.drugInteractions.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  💊 약물 상호작용
                  <Chip label={recentLog.drugInteractions.length} size="small" />
                </Typography>
                <Stack spacing={2}>
                  {recentLog.drugInteractions.map((interaction, idx) => (
                    <Card key={idx} variant="outlined" sx={{ borderRadius: 2, borderColor: interaction.level === 'DANGER' ? 'error.main' : 'warning.main', borderWidth: 1 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {interaction.medicationName}
                          </Typography>
                          <Chip
                            label={getLevelLabel(interaction.level)}
                            color={getLevelColor(interaction.level)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" paragraph>
                          {interaction.description}
                        </Typography>
                        {interaction.recommendation && (
                          <Alert severity="info" sx={{ mt: 1, py: 0 }}>
                            <Typography variant="body2">
                              <strong>권장:</strong> {interaction.recommendation}
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Disease Interactions */}
            {recentLog.diseaseInteractions.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  🏥 질병 관련 주의사항
                  <Chip label={recentLog.diseaseInteractions.length} size="small" />
                </Typography>
                <Stack spacing={2}>
                  {recentLog.diseaseInteractions.map((interaction, idx) => (
                    <Card key={idx} variant="outlined" sx={{ borderRadius: 2, borderColor: interaction.level === 'DANGER' ? 'error.main' : 'warning.main', borderWidth: 1 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {interaction.diseaseName}
                          </Typography>
                          <Chip
                            label={getLevelLabel(interaction.level)}
                            color={getLevelColor(interaction.level)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" paragraph>
                          {interaction.description}
                        </Typography>
                        {interaction.recommendation && (
                          <Alert severity="info" sx={{ mt: 1, py: 0 }}>
                            <Typography variant="body2">
                              <strong>권장:</strong> {interaction.recommendation}
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}

            {recentLog.drugInteractions.length === 0 && recentLog.diseaseInteractions.length === 0 && (
              <Alert severity="success">발견된 상호작용 위험이 없습니다.</Alert>
            )}
          </Stack>
        )}
      </div>
    </MainLayout>
  )
}

export default FoodWarningPage
