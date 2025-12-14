import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Container, Stack, Chip, IconButton, Collapse, Button } from '@mui/material'
import { ROUTE_PATHS } from '@config/routes.config'
import { useFamilyStore } from '@features/family/store/familyStore'
import MainLayout from '@shared/components/layout/MainLayout'
import { RoundedCard } from '@shared/components/ui/RoundedCard'
import { ResponsiveContainer } from '@shared/components/layout/ResponsiveContainer'
import { MyMedicationSchedule } from '../components/MyMedicationSchedule'
import { QuickActions } from '@shared/components/ui/QuickActions'
import { FAB } from '@shared/components/ui/FAB'
import { CAREGIVER_QUICK_ACTIONS, CAREGIVER_FAB_ACTIONS } from '@/constants/uiConstants'
import { useAuth } from '@features/auth/hooks/useAuth'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
	import { familyApiClient } from '@core/services/api/familyApiClient'
	import { toast } from '@shared/components/toast/toastStore'
	import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
	import logger from '@core/utils/logger'

/**
 * CaregiverDashboard - 보호자/케어기버용 대시보드
 * 가족 구성원 상태와 알림 위젯을 연동할 예정.
 */
export function CaregiverDashboard() {
  const navigate = useNavigate()
  const { members, loading, error, initialized, initialize } = useFamilyStore((state) => ({
    members: state.members,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    initialize: state.initialize,
  }))
  const { user } = useAuth((state) => ({ user: state.user }))
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!initialized) {
      initialize().catch(() => { })
    }
  }, [initialized, initialize])

  const seniorMembers = useMemo(
    () => members.filter((member) => member.role === 'SENIOR'),
    [members],
  )

  const handleViewDetail = (memberId) => {
    navigate(ROUTE_PATHS.familyMemberDetail.replace(':id', memberId))
  }

  const handleExportPdf = async () => {
    const userId = user?.id || user?.userId
    if (!userId) {
      toast.error('사용자 정보를 찾을 수 없습니다.')
      return
    }

    setExporting(true)
    try {
      const blob = await diseaseApiClient.exportPdf(userId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'diseases.pdf'
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success('PDF 다운로드를 시작합니다.')
    } catch (error) {
      logger.error('PDF 다운로드 실패', error)
      toast.error('PDF 다운로드에 실패했습니다.')
    } finally {
      setExporting(false)
    }
  }

  const fabActions = CAREGIVER_FAB_ACTIONS.map((action) => {
    if (action.id === 'pdf_export') {
      return {
        ...action,
        label: exporting ? '다운로드 중...' : action.label,
        onClick: () => !exporting && handleExportPdf(),
      }
    }
    return action
  })

  if (loading && members.length === 0) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 4 } }}>
          <Typography>가족 데이터를 불러오는 중...</Typography>
        </Container>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 4 } }}>
          <Typography color="error">가족 데이터를 불러오지 못했습니다. {error.message}</Typography>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <ResponsiveContainer maxWidth="lg">
        <Stack spacing={4}>
          {/* 헤더 */}
          <Box>
            <Typography 
              variant="h4" 
              component="h1"
              fontWeight={700}
              gutterBottom
              sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}
            >
              보호자 대시보드
            </Typography>
            <Typography variant="body1" color="text.secondary">
              가족 구성원의 오늘 복약 상태를 빠르게 확인할 수 있습니다.
            </Typography>
          </Box>

          <QuickActions actions={CAREGIVER_QUICK_ACTIONS} />

          <MyMedicationSchedule title="내 복용 일정" showEmptyState={false} />

          <RoundedCard elevation={2} padding="large">
            <Typography variant="h5" fontWeight={700} gutterBottom>
              어르신 복약 현황
            </Typography>
            {seniorMembers.length === 0 && (
              <Typography color="text.secondary">등록된 어르신이 없습니다.</Typography>
            )}

            <Stack spacing={2}>
              {seniorMembers.map((member) => (
                <SeniorMedicationSnapshot
                  key={member.id}
                  member={member}
                  onDetail={() => handleViewDetail(member.id)}
                />
              ))}
            </Stack>
          </RoundedCard>

          <FAB actions={fabActions} />
        </Stack>
      </ResponsiveContainer>
    </MainLayout>
  )
}

export default CaregiverDashboard

const SeniorMedicationSnapshot = ({ member, onDetail }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [medications, setMedications] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const relation = member.relation || (member.role === 'SENIOR' ? '어르신' : '보호자')

  // 약 목록 조회
  useEffect(() => {
    const loadMedications = async () => {
      try {
        const meds = await familyApiClient.getMemberMedications(member.userId)
        setMedications(meds || [])
      } catch (error) {
        logger.error('Failed to load medications:', error)
        setMedications([])
      }
    }

    if (member.userId) {
      loadMedications()
    }
  }, [member.userId])

  const [expandedSections, setExpandedSections] = useState({})

  const getTimeCategory = (dateString) => {
    if (!dateString) return 'NIGHT';
    const hour = new Date(dateString).getHours();
    if (hour >= 5 && hour < 11) return 'MORNING';
    if (hour >= 11 && hour < 17) return 'LUNCH';
    if (hour >= 17 && hour < 21) return 'DINNER';
    return 'NIGHT';
  };

  const initializeExpandedState = (currentLogs) => {
    const currentCategory = getTimeCategory(new Date());
    const nextExpanded = {};
    const sections = ['MORNING', 'LUNCH', 'DINNER', 'NIGHT'];

    sections.forEach(section => {
      if (section === currentCategory) {
        nextExpanded[section] = true;
        return;
      }

      const logsInSection = currentLogs.filter(log =>
        getTimeCategory(log.scheduledTime) === section
      );

      const hasUntaken = logsInSection.some(log => log.status !== 'completed');
      if (hasUntaken) {
        nextExpanded[section] = true;
      } else {
        nextExpanded[section] = false;
      }
    });
    setExpandedSections(nextExpanded);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const loadTodayLogs = async () => {
    if (isExpanded) {
      setIsExpanded(false)
      return
    }

    setLogsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await familyApiClient.getMedicationLogs(member.userId, {
        date: today
      })
      const logs = response?.logs || response || []
      setTodayLogs(logs)
      initializeExpandedState(logs)
      setIsExpanded(true)
    } catch (error) {
      logger.error('Failed to load today logs:', error)
      setTodayLogs([])
      setIsExpanded(true)
    } finally {
      setLogsLoading(false)
    }
  }

  const completedToday = todayLogs.filter((l) => l.status === 'completed').length
  const pendingToday = todayLogs.filter((l) => l.status === 'pending').length
  const missedToday = todayLogs.filter((l) => l.status === 'missed').length

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return '복용 완료'
      case 'missed':
        return '미복용'
      case 'pending':
      default:
        return '복용 예정'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#00B300'
      case 'missed':
        return '#FF0000'
      case 'pending':
      default:
        return '#FF9900'
    }
  }

  return (
    <RoundedCard elevation={1} padding="default">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {member.name}
          </Typography>
          <Chip 
            label={relation} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={loadTodayLogs}
            color="primary"
            aria-label="복약 일정 펼치기"
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            onClick={onDetail}
          >
            자세히
          </Button>
        </Box>
      </Box>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Chip 
              label={`완료 ${completedToday}`}
              color="success"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={`예정 ${pendingToday}`}
              color="warning"
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={`미복용 ${missedToday}`}
              color="error"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          {logsLoading ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              오늘 복약 일정을 불러오는 중...
            </Typography>
          ) : todayLogs.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              오늘 복약 일정이 없습니다.
            </Typography>
          ) : (
            ['MORNING', 'LUNCH', 'DINNER', 'NIGHT'].map(sectionKey => {
              const SECTION_LABELS = {
                MORNING: { label: '아침', sub: '05:00 - 11:00' },
                LUNCH: { label: '점심', sub: '11:00 - 17:00' },
                DINNER: { label: '저녁', sub: '17:00 - 21:00' },
                NIGHT: { label: '취침 전', sub: '21:00 - 05:00' }
              };

              const sectionLogs = todayLogs.filter(log => {
                const isCorrectTime = getTimeCategory(log.scheduledTime) === sectionKey;
                if (!isCorrectTime) return false;

                const medication = medications.find(m => m.id === log.medicationId);
                if (medication && medication.active === false) return false;

                return true;
              });
              if (sectionLogs.length === 0) return null;

              sectionLogs.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
              const isSectionExpanded = expandedSections[sectionKey];

              return (
                <Box key={sectionKey} sx={{ mb: 2 }}>
                  <Box
                    onClick={() => toggleSection(sectionKey)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {SECTION_LABELS[sectionKey].label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {SECTION_LABELS[sectionKey].sub}
                      </Typography>
                    </Box>
                    <ExpandMoreIcon
                      sx={{
                        transform: isSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s',
                      }}
                    />
                  </Box>

                  <Collapse in={isSectionExpanded} timeout="auto" unmountOnExit>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {sectionLogs.map((log, index) => {
                        const statusLabel = getStatusLabel(log.status)
                        const time = new Date(log.scheduledTime).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })

                        return (
                          <Box
                            key={`${member.id}-${log.id || index}`}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              p: 1.5,
                              borderLeft: 4,
                              borderLeftColor: getStatusColor(log.status),
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ minWidth: 60 }}
                            >
                              {time}
                            </Typography>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {log.medicationName || '알 수 없는 약'}
                            </Typography>
                            <Chip
                              label={statusLabel}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(log.status),
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                        )
                      })}
                    </Stack>
                  </Collapse>
                </Box>
              );
            })
          )}
        </Box>
      </Collapse>
    </RoundedCard>
  )
}
