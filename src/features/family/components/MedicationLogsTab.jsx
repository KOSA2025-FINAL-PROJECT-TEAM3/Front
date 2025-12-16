import { useEffect, useState, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { familyApiClient } from '@core/services/api/familyApiClient'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import logger from '@core/utils/logger'

const getTimeCategory = (dateString) => {
  if (!dateString) return 'NIGHT'
  const hour = new Date(dateString).getHours()
  if (hour >= 5 && hour < 11) return 'MORNING'
  if (hour >= 11 && hour < 17) return 'LUNCH'
  if (hour >= 17 && hour < 21) return 'DINNER'
  return 'NIGHT'
}

export const MedicationLogsTab = ({ userId }) => {
  const [logs, setLogs] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    limit: 30,
  })
  const [expandedSections, setExpandedSections] = useState({})

  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const loadLogs = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await familyApiClient.getMedicationLogs(userId, {
        date: filters.date || undefined,
        status: filters.status || undefined,
        limit: filters.limit,
      })

      setStatistics(response?.statistics || null)
      setLogs(response?.logs || [])
    } catch (err) {
      logger.error('복약 로그 조회 실패:', err)
      setError('복약 로그를 불러오지 못했습니다.')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [userId, filters])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  useEffect(() => {
    if (logs.length > 0) {
      const currentCategory = getTimeCategory(new Date())
      const nextExpanded = {}
      const sections = ['MORNING', 'LUNCH', 'DINNER', 'NIGHT']

      sections.forEach(section => {
        if (section === currentCategory) {
          nextExpanded[section] = true
          return
        }

        const logsInSection = logs.filter(log =>
          getTimeCategory(log.scheduledTime) === section
        )

        const hasUntaken = logsInSection.some(log => log.status !== 'completed')
        nextExpanded[section] = hasUntaken
      })

      setExpandedSections(nextExpanded)
    }
  }, [logs])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#00B300'
      case 'missed':
        return '#FF0000'
      case 'pending':
        return '#FF9900'
      default:
        return '#999999'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return '복용완료'
      case 'missed':
        return '미복용'
      case 'pending':
        return '예정'
      default:
        return '미상'
    }
  }

  const handleDateChange = (e) => {
    setFilters({ ...filters, date: e.target.value })
  }

  const handleStatusChange = (e) => {
    setFilters({ ...filters, status: e.target.value })
  }

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            복약 기록을 불러오는 중입니다...
          </Typography>
        </Stack>
      </Paper>
    )
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    )
  }

  const SECTION_ORDER = sortOrder === 'desc'
    ? ['NIGHT', 'DINNER', 'LUNCH', 'MORNING']
    : ['MORNING', 'LUNCH', 'DINNER', 'NIGHT'];

  return (
    <Stack component="section" spacing={2.5} sx={{ py: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          복약 기록
        </Typography>
        {statistics ? (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Chip label={`완료 ${statistics.completedToday || 0}`} sx={{ bgcolor: 'success.50', color: 'success.dark', fontWeight: 900 }} />
            <Chip label={`예정 ${statistics.pendingToday || 0}`} sx={{ bgcolor: 'warning.50', color: 'warning.dark', fontWeight: 900 }} />
            <Chip label={`미복용 ${statistics.missedToday || 0}`} sx={{ bgcolor: 'error.50', color: 'error.dark', fontWeight: 900 }} />
          </Stack>
        ) : null}
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField type="date" value={filters.date} onChange={handleDateChange} size="small" InputLabelProps={{ shrink: true }} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="med-log-status-label">상태</InputLabel>
            <Select
              labelId="med-log-status-label"
              value={filters.status}
              label="상태"
              onChange={handleStatusChange}
            >
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="completed">완료</MenuItem>
              <MenuItem value="missed">미복용</MenuItem>
              <MenuItem value="pending">예정</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" onClick={handleSortToggle} sx={{ fontWeight: 900 }}>
            {sortOrder === 'desc' ? '최신순 (밤→아침)' : '과거순 (아침→밤)'}
          </Button>
        </Stack>
      </Paper>

      {logs.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary">
            복약 기록이 없습니다.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {SECTION_ORDER.map((sectionKey) => {
            const SECTION_LABELS = {
              MORNING: { label: '아침', sub: '05:00 - 11:00' },
              LUNCH: { label: '점심', sub: '11:00 - 17:00' },
              DINNER: { label: '저녁', sub: '17:00 - 21:00' },
              NIGHT: { label: '취침 전', sub: '21:00 - 05:00' },
            }

            const sectionLogs = logs.filter((log) => getTimeCategory(log.scheduledTime) === sectionKey)
            if (sectionLogs.length === 0) return null

            sectionLogs.sort((a, b) => {
              const dateA = new Date(a.scheduledTime)
              const dateB = new Date(b.scheduledTime)
              return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
            })

            const expanded = Boolean(expandedSections[sectionKey])

            return (
              <Accordion
                key={sectionKey}
                expanded={expanded}
                onChange={() => toggleSection(sectionKey)}
                disableGutters
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', '&:before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'common.white' }}>
                  <Stack direction="row" spacing={1} alignItems="baseline">
                    <Typography sx={{ fontWeight: 900 }}>{SECTION_LABELS[sectionKey].label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {SECTION_LABELS[sectionKey].sub}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0, bgcolor: 'common.white', borderTop: '1px solid', borderColor: 'divider' }}>
                  {sectionLogs.map((log, index) => {
                    const scheduledTime = new Date(log.scheduledTime)
                    const completedTime = log.completedTime ? new Date(log.completedTime) : null
                    const time = scheduledTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    const date = scheduledTime.toLocaleDateString('ko-KR')
                    const statusColor = getStatusColor(log.status)

                    return (
                      <Box
                        key={`${log.id}-${index}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 2,
                          px: 2,
                          py: 1.5,
                          borderLeft: '4px solid',
                          borderLeftColor: statusColor,
                          borderBottom: index === sectionLogs.length - 1 ? 'none' : '1px solid',
                          borderBottomColor: 'grey.100',
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="caption" color="text.disabled">
                            {date}
                          </Typography>
                          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 0.25, flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                              {time}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                              {log.medicationName || '알 수 없는 약'}
                            </Typography>
                          </Stack>
                        </Box>

                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexShrink: 0 }}>
                          {completedTime ? (
                            <Typography variant="caption" color="text.secondary">
                              {completedTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          ) : null}
                          <Typography variant="body2" sx={{ fontWeight: 900, color: statusColor, minWidth: 64, textAlign: 'right' }}>
                            {getStatusLabel(log.status)}
                          </Typography>
                        </Stack>
                      </Box>
                    )
                  })}
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}

export default MedicationLogsTab
