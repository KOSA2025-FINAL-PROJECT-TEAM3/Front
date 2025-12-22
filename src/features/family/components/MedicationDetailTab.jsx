import { useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { familyApiClient } from '@core/services/api/familyApiClient'
import logger from '@core/utils/logger'

export const MedicationDetailTab = ({ userId, medications = [] }) => {
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [medicationDetail, setMedicationDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSelectMedication = async (medication) => {
    setSelectedMedication(medication)
    setLoading(true)
    setError(null)
    setMedicationDetail(null)

    try {
      const detail = await familyApiClient.getMedicationDetail(userId, medication.id)
      setMedicationDetail(detail)
    } catch (err) {
      logger.error('약 세부 정보 조회 실패:', err)
      setError('약 정보를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatDaysOfWeek = (daysString) => {
    if (!daysString) return ''

    const dayMap = {
      'MON': '월',
      'TUE': '화',
      'WED': '수',
      'THU': '목',
      'FRI': '금',
      'SAT': '토',
      'SUN': '일'
    }

    return daysString
      .split(',')
      .map(day => dayMap[day.trim()] || day.trim())
      .join(', ')
  }

  const [showInactive, setShowInactive] = useState(false)

  // Filter medications based on showInactive state
  const filteredMedications = medications
    .filter(med => showInactive ? true : med.active)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

  return (
    <Box component="section" sx={{ py: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '250px 1fr' },
          gap: 3,
        }}
      >
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, height: 'fit-content' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
              약 목록
            </Typography>
            <FormControlLabel
              control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} size="small" />}
              label="중단된 약 포함"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: 12, color: 'text.secondary' } }}
            />
          </Stack>

          {filteredMedications.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">
                등록된 약이 없습니다.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={1}>
              {filteredMedications.map((med) => {
                const selected = selectedMedication?.id === med.id
                return (
                  <Paper
                    key={med.id}
                    variant="outlined"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectMedication(med)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelectMedication(med)
                    }}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      borderColor: selected ? 'primary.main' : 'divider',
                      bgcolor: selected ? 'primary.50' : !med.active ? 'grey.50' : 'common.white',
                      opacity: !med.active ? 0.8 : 1,
                      '&:hover': { bgcolor: selected ? 'primary.50' : 'grey.50' },
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 900 }} noWrap>
                          {med.name || '알 수 없는 약'}
                        </Typography>
                        {!med.active ? <Chip label="중단" size="small" sx={{ height: 20, fontWeight: 900 }} /> : null}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {med.dosage || ''}
                      </Typography>
                    </Stack>
                  </Paper>
                )
              })}
            </Stack>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, minHeight: 420 }}>
          {!selectedMedication ? (
            <Paper variant="outlined" sx={{ borderStyle: 'dashed', borderRadius: 3, p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">
                약을 선택하여 세부 정보를 확인하세요.
              </Typography>
            </Paper>
          ) : loading ? (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                약 정보를 불러오는 중입니다...
              </Typography>
            </Stack>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : medicationDetail ? (
            <Stack spacing={3}>
              <Box sx={{ pb: 2, borderBottom: '2px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {medicationDetail.medicationName}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'text.secondary' }}>
                  기본 정보
                </Typography>
                <Stack spacing={1.25}>
                  {medicationDetail.ingredient ? (
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                        주요 성분
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {medicationDetail.ingredient}
                      </Typography>
                    </Paper>
                  ) : null}
                  {medicationDetail.dosage ? (
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                        용법·용량
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {medicationDetail.dosage}
                      </Typography>
                    </Paper>
                  ) : null}
                  {medicationDetail.timing ? (
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                        복용 시점
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {medicationDetail.timing}
                      </Typography>
                    </Paper>
                  ) : null}
                </Stack>
              </Box>

              {(medicationDetail.startDate || medicationDetail.endDate) ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'text.secondary' }}>
                    복용 기간
                  </Typography>
                  <Stack spacing={1.25}>
                    {medicationDetail.startDate ? (
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                          시작일
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {new Date(medicationDetail.startDate).toLocaleDateString('ko-KR')}
                        </Typography>
                      </Paper>
                    ) : null}
                    {medicationDetail.endDate ? (
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                          종료일
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {new Date(medicationDetail.endDate).toLocaleDateString('ko-KR')}
                        </Typography>
                      </Paper>
                    ) : null}
                  </Stack>
                </Box>
              ) : null}

              {(medicationDetail.quantity !== undefined || medicationDetail.remaining !== undefined) ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'text.secondary' }}>
                    보유 수량
                  </Typography>
                  <Stack spacing={1.25}>
                    {medicationDetail.quantity !== undefined ? (
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                          총 수량
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {medicationDetail.quantity}개
                        </Typography>
                      </Paper>
                    ) : null}
                    {medicationDetail.remaining !== undefined ? (
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                          남은 수량
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {medicationDetail.remaining}개
                        </Typography>
                      </Paper>
                    ) : null}
                  </Stack>
                </Box>
              ) : null}

              {medicationDetail.schedules?.length ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'text.secondary' }}>
                    복용 스케줄
                  </Typography>
                  <Stack spacing={1.25}>
                    {medicationDetail.schedules.map((schedule, idx) => (
                      <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                          <Typography sx={{ fontWeight: 900 }}>{schedule.time}</Typography>
                          {schedule.active ? (
                            <Chip label="활성" size="small" sx={{ bgcolor: 'success.100', color: 'success.dark', fontWeight: 900 }} />
                          ) : (
                            <Chip label="비활성" size="small" variant="outlined" sx={{ fontWeight: 900 }} />
                          )}
                        </Stack>
                        {schedule.daysOfWeek ? (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {formatDaysOfWeek(schedule.daysOfWeek)}
                          </Typography>
                        ) : null}
                        {schedule.completionRate !== undefined ? (
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              복용률
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                              {typeof schedule.completionRate === 'number' ? schedule.completionRate.toFixed(1) : 0}%
                            </Typography>
                          </Stack>
                        ) : null}
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              ) : null}

              {medicationDetail.statistics ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: 0.5, textTransform: 'uppercase', color: 'text.secondary' }}>
                    복용 통계
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                    {[
                      { label: '총 복용 횟수', value: medicationDetail.statistics.totalDoses || 0 },
                      { label: '실제 복용', value: medicationDetail.statistics.takenDoses || 0 },
                      { label: '미복용', value: medicationDetail.statistics.missedDoses || 0 },
                      {
                        label: '복용률',
                        value: `${typeof medicationDetail.statistics.overallCompletionRate === 'number'
                          ? medicationDetail.statistics.overallCompletionRate.toFixed(1)
                          : 0}%`,
                      },
                    ].map((item) => (
                      <Paper key={item.label} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.50', borderColor: 'primary.100' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ mt: 1, fontSize: 24, fontWeight: 900, color: 'primary.main', textAlign: 'center' }}>
                          {item.value}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              ) : null}
            </Stack>
          ) : null}
        </Paper>
      </Box>
    </Box>
  )
}

export default MedicationDetailTab
