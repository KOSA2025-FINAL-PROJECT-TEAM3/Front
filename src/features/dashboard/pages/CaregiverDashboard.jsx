import { useCallback, useEffect, useMemo, useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Stack, Paper, ButtonBase, useMediaQuery, useTheme } from '@mui/material'
import { ROUTE_PATHS } from '@config/routes.config'
import { useFamilyStore } from '@features/family/store/familyStore'
import { shallow } from 'zustand/shallow'
import MainLayout from '@shared/components/layout/MainLayout'
import HistoryTimelineCard from '../components/HistoryTimelineCard'
import TodaySummaryCard from '../components/TodaySummaryCard'
import { WeeklyStatsWidget } from '../components/WeeklyStatsWidget'
import { NoFamilyModal } from '../components/NoFamilyModal'
import CaregiverDashboardSkeleton from '../components/CaregiverDashboardSkeleton'
import { DietSummaryCard } from '../components/DietSummaryCard'
import { DiseaseSummaryCard } from '../components/DiseaseSummaryCard'
import { DietDetailModal } from '../components/DietDetailModal'
import { DiseaseDetailModal } from '../components/DiseaseDetailModal'
import { familyApiClient } from '@core/services/api/familyApiClient'
import { dietApiClient } from '@core/services/api/dietApiClient'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import SearchIcon from '@mui/icons-material/Search'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import ChatIcon from '@mui/icons-material/Chat'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DownloadIcon from '@mui/icons-material/Download'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Menu, MenuItem } from '@mui/material'
import logger from '@core/utils/logger'
import { endOfWeek, format, isAfter, startOfWeek, subDays, addDays } from 'date-fns'
import { parseServerLocalDateTime, formatDate } from '@core/utils/formatting'
import { useSearchOverlayStore } from '@features/search/store/searchOverlayStore'
import { useCareTargetStore } from '@features/dashboard/store/careTargetStore'
import { useAuth } from '@features/auth/hooks/useAuth'
import { USER_ROLES } from '@config/constants'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'

/**
 * CaregiverDashboard - 보호자/케어기버용 대시보드
 * 가족 구성원 상태와 알림 위젯을 연동할 예정.
 */
export function CaregiverDashboard() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const openSearchOverlay = useSearchOverlayStore((state) => state.open)

  // shallow 비교로 불필요한 리렌더링 방지
  const { familyGroups, selectedGroupId, members, loading, error, initialized, initialize, selectGroup } = useFamilyStore(
    (state) => ({
      familyGroups: state.familyGroups,
      selectedGroupId: state.selectedGroupId,
      members: state.members,
      loading: state.loading,
      error: state.error,
      initialized: state.initialized,
      initialize: state.initialize,
      selectGroup: state.selectGroup,
    }),
    shallow
  )

  const { user, token } = useAuth(
    (state) => ({ user: state.user, token: state.token }),
    shallow
  )
  const currentUserId = user?.id || user?.userId || null

  const { activeSeniorId, setActiveSeniorId } = useCareTargetStore(
    (state) => ({
      activeSeniorId: state.activeSeniorMemberId,
      setActiveSeniorId: state.setActiveSeniorMemberId,
    }),
    shallow
  )


  const [todayRate, setTodayRate] = useState(null)
  const [todayRateLoading, setTodayRateLoading] = useState(false)
  const [todayCounts, setTodayCounts] = useState({ total: 0, completed: 0 })
  const [weeklyStats, setWeeklyStats] = useState(Array(7).fill({ status: 'pending' }))
  const [weeklyLoading, setWeeklyLoading] = useState(false)
  const [recentHistoryData, setRecentHistoryData] = useState([])
  const [recentHistoryLoading, setRecentHistoryLoading] = useState(false)

  // 식단/질병 관련 상태
  const [dietModalOpen, setDietModalOpen] = useState(false)
  const [diseaseModalOpen, setDiseaseModalOpen] = useState(false)
  const [todayDietCount, setTodayDietCount] = useState(0)
  const [dietLoading, setDietLoading] = useState(false)
  const [diseaseCount, setDiseaseCount] = useState(0)
  const [diseaseLoading, setDiseaseLoading] = useState(false)

  // 가족 그룹 선택 메뉴
  const [groupMenuAnchor, setGroupMenuAnchor] = useState(null)
  const handleOpenGroupMenu = (event) => setGroupMenuAnchor(event.currentTarget)
  const handleCloseGroupMenu = () => setGroupMenuAnchor(null)
  const handleSelectGroup = (groupId) => {
    selectGroup(groupId)
    handleCloseGroupMenu()
  }

  const openActiveMemberDetail = useCallback(
    (target) => {
      if (!activeSeniorId) {
        navigate(ROUTE_PATHS.family)
        return
      }

      const memberId = String(activeSeniorId)

      if (target === 'medication') {
        navigate(ROUTE_PATHS.familyMemberMedication.replace(':id', memberId))
        return
      }
      if (target === 'diet') {
        navigate(ROUTE_PATHS.familyMemberDiet.replace(':id', memberId))
        return
      }
      if (target === 'disease') {
        navigate(ROUTE_PATHS.familyMemberDisease.replace(':id', memberId))
        return
      }

      navigate(ROUTE_PATHS.familyMemberDetail.replace(':id', memberId))
    },
    [activeSeniorId, navigate],
  )



  useEffect(() => {
    if (!initialized && token && !loading) {
      initialize().catch(() => { })
    }
  }, [initialized, initialize, token, loading])

  const groupMembers = useMemo(() => {
    if (selectedGroupId && Array.isArray(familyGroups)) {
      const group = familyGroups.find((g) => String(g?.id) === String(selectedGroupId))
      if (Array.isArray(group?.members)) return group.members
    }
    return Array.isArray(members) ? members : []
  }, [familyGroups, members, selectedGroupId])

  // 보호자 대시보드는 시니어만 모니터링 (AISTART.md: 보호자는 시니어를 관리)
  // m.role: 그룹 내 역할 (백엔드가 familyRole 대신 role로 전송)
  const targetMembers = useMemo(() => {
    const list = groupMembers
      .filter(Boolean)
      .filter((m) => m.userId != null)
      .filter((m) => normalizeCustomerRole(m.role) === USER_ROLES.SENIOR)
    if (!currentUserId) return list
    return list.filter((m) => String(m.userId) !== String(currentUserId))
  }, [currentUserId, groupMembers])

  useEffect(() => {
    if (targetMembers.length === 0) return
    if (!activeSeniorId) {
      // targetMembers는 이미 시니어만 포함하므로 별도 필터링 불필요
      const preferred = targetMembers[0]
      setActiveSeniorId(preferred?.id ?? null)
      return
    }
    const stillExists = targetMembers.some((m) => String(m.id) === String(activeSeniorId))
    if (!stillExists) {
      const preferred = targetMembers[0]
      setActiveSeniorId(preferred?.id ?? null)
    }
  }, [activeSeniorId, setActiveSeniorId, targetMembers])

  const activeSenior = useMemo(
    () =>
      targetMembers.find((m) => String(m.id) === String(activeSeniorId)) || targetMembers[0] || null,
    [activeSeniorId, targetMembers],
  )

  const handleExportPdf = useCallback(async () => {
    if (!activeSenior?.userId) {
      logger.warn('No active senior selected for PDF export')
      return
    }
    if (!selectedGroupId) {
      logger.warn('No family group selected for PDF export')
      return
    }

    try {
      logger.info('Exporting PDF for user:', activeSenior?.userId)
      const blob = await diseaseApiClient.exportPdf(activeSenior?.userId, selectedGroupId)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${activeSenior.name || 'senior'}_disease_report_${format(new Date(), 'yyyyMMdd')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      logger.info('PDF exported successfully')
    } catch (error) {
      logger.error('Failed to export PDF:', error)
    }
  }, [activeSenior?.userId, selectedGroupId])

  useEffect(() => {
    const loadRate = async () => {
      if (!activeSenior?.userId) {
        setTodayRate(null)
        setTodayCounts({ total: 0, completed: 0 })
        return
      }
      setTodayRateLoading(true)
      try {
        const today = formatDate(new Date())

        const response = await familyApiClient.getMedicationLogs(activeSenior?.userId, { date: today })
        const logs = response?.logs || response || []
        const total = logs.length
        const completed = logs.filter((l) => l.status === 'completed' || l.completed === true).length
        setTodayCounts({ total, completed })
        setTodayRate(total > 0 ? Math.round((completed / total) * 100) : 0)
      } catch (e) {
        logger.warn('[CaregiverDashboard] loadRate failed', e)
        setTodayRate(null)
        setTodayCounts({ total: 0, completed: 0 })
      } finally {
        setTodayRateLoading(false)
      }
    }
    void loadRate()
  }, [activeSenior?.userId])

  useEffect(() => {
    const loadWeekly = async () => {
      if (!activeSenior?.userId) {
        setWeeklyStats(Array(7).fill({ status: 'pending' }))
        return
      }

      setWeeklyLoading(true)
      try {
        const today = new Date()
        const start = startOfWeek(today, { weekStartsOn: 1 })
        const end = endOfWeek(today, { weekStartsOn: 1 })
        const dates = Array.from({ length: 7 }).map((_, idx) => addDays(start, idx))

        const results = await Promise.all(
          dates.map((date) => {
            if (isAfter(date, end)) return Promise.resolve([])
            return familyApiClient
              .getMedicationLogs(activeSenior?.userId, { date: format(date, 'yyyy-MM-dd') })
              .then((response) => response?.logs || response || [])
              .catch(() => [])
          }),
        )

        const stats = results.map((logs, index) => {
          const dayDate = dates[index]
          const total = logs.length
          if (total === 0) return { status: 'pending' }

          const completed = logs.filter((l) => l.status === 'completed' || l.completed === true).length

          if (completed >= total) {
            return { status: 'completed' }
          }

          // 오늘인 경우: 아직 시간이 안 된 약이 남아있다면 'pending' (진행중/예정) 처리
          const dateStr = format(dayDate, 'yyyy-MM-dd')
          const todayStr = format(new Date(), 'yyyy-MM-dd')

          if (dateStr === todayStr) {
            const now = new Date()
            const hasOverdue = logs.some((log) => {
              const isLogCompleted = log.status === 'completed' || log.completed === true
              if (isLogCompleted) return false
              if (!log.scheduledTime) return false
              const logTime = parseServerLocalDateTime(log.scheduledTime)
              // 예정 시간이 지났는데 완료되지 않음 -> Missed
              return logTime && logTime < now
            })

            if (!hasOverdue) {
              return { status: 'pending' }
            }
          }

          return { status: 'missed' }
        })

        setWeeklyStats(stats)
      } catch (e) {
        logger.warn('[CaregiverDashboard] loadWeekly failed', e)
        setWeeklyStats(Array(7).fill({ status: 'pending' }))
      } finally {
        setWeeklyLoading(false)
      }
    }

    void loadWeekly()
  }, [activeSenior?.userId])

  const loadRecentHistory = useCallback(async () => {
    if (!activeSenior?.userId) {
      setRecentHistoryData([])
      return
    }

    setRecentHistoryLoading(true)
    try {
      const endDate = format(new Date(), 'yyyy-MM-dd')
      const startDate = format(subDays(new Date(), 2), 'yyyy-MM-dd')

      const response = await familyApiClient.getMedicationLogs(activeSenior?.userId, {
        startDate,
        endDate
      })
      const logs = response?.logs || [] // response가 배열이 아니라 객체(MedicationLogsResponse)이므로 .logs로 접근

      const byDate = new Map()

      const getTimeSectionLabel = (time) => {
        const hour = parseInt(String(time || '').split(':')[0] || '0', 10)
        if (hour >= 5 && hour < 11) return '아침'
        if (hour >= 11 && hour < 17) return '점심'
        if (hour >= 17 && hour < 21) return '저녁'
        return '야간'
      }

      logs.forEach((log) => {
        const scheduledDate = log?.scheduledTime ? parseServerLocalDateTime(log.scheduledTime) : null
        if (!scheduledDate) return

        const dateKey = formatDate(scheduledDate)
        const time = format(scheduledDate, 'HH:mm')
        const label = getTimeSectionLabel(time)
        const medicationName = log?.medicationName || log?.name || '알 수 없는 약'
        const isCompleted = log?.status === 'completed' || log?.completed === true

        if (!byDate.has(dateKey)) {
          byDate.set(dateKey, { dateKey, date: scheduledDate, sections: new Map() })
        }

        const entry = byDate.get(dateKey)
        if (!entry.sections.has(label)) {
          entry.sections.set(label, { label, time, medications: [], completed: true })
        }

        const section = entry.sections.get(label)
        section.medications.push({ name: medicationName, completed: isCompleted })
        section.completed = section.completed && Boolean(isCompleted)

        if (time && section.time && time < section.time) {
          section.time = time
        }
      })

      const groups = Array.from(byDate.values())
        .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
        .map((group) => {
          const items = Array.from(group.sections.values())
            .sort((a, b) => String(a.time).localeCompare(String(b.time)))

          return {
            key: group.dateKey,
            date: group.date,
            dateLabel: group.date?.toLocaleDateString?.('ko-KR', { month: 'long', day: 'numeric' }) || group.dateKey,
            dayLabel: group.date?.toLocaleDateString?.('ko-KR', { weekday: 'long' }) || '',
            items: items.map((item) => {
              // 중복 약 이름 제거는 필요할 수 있으나 상태가 다를 수 있으므로 유지하거나 
              // 동일 약이 여러 번 있을 경우에 대한 처리가 필요하면 여기서 수행
              return {
                ...item,
                pillDetails: item.medications // 개별 약 상세 정보 전달
              }
            }),
          }
        })

      setRecentHistoryData(groups)
    } catch (e) {
      logger.warn('[CaregiverDashboard] loadRecentHistory failed', e)
      setRecentHistoryData([])
    } finally {
      setRecentHistoryLoading(false)
    }
  }, [activeSenior?.userId])

  useEffect(() => {
    loadRecentHistory().catch(() => { })
  }, [loadRecentHistory])

  // 식단 카운트 로딩
  useEffect(() => {
    const loadDietCount = async () => {
      if (!activeSenior?.userId) {
        setTodayDietCount(0)
        return
      }
      setDietLoading(true)
      try {
        const today = formatDate(new Date())
        const response = await dietApiClient.getDietLogs({ date: today, userId: activeSenior?.userId })
        const logs = Array.isArray(response) ? response : response?.logs || []
        setTodayDietCount(logs.length)
      } catch (error) {
        logger.warn('[CaregiverDashboard] loadDietCount failed', error)
        setTodayDietCount(0)
      } finally {
        setDietLoading(false)
      }
    }
    loadDietCount()
  }, [activeSenior?.userId])

  // 질병 카운트 로딩
  useEffect(() => {
    const loadDiseaseCount = async () => {
      if (!activeSenior?.userId) {
        setDiseaseCount(0)
        return
      }
      setDiseaseLoading(true)
      try {
        const response = await diseaseApiClient.listByUser(activeSenior?.userId)
        const diseases = Array.isArray(response) ? response : response?.diseases || []
        setDiseaseCount(diseases.length)
      } catch (error) {
        logger.warn('[CaregiverDashboard] loadDiseaseCount failed', error)
        setDiseaseCount(0)
      } finally {
        setDiseaseLoading(false)
      }
    }
    loadDiseaseCount()
  }, [activeSenior?.userId])

  const adherenceRate = useMemo(() => {
    if (!weeklyStats?.length) return 0
    const completed = weeklyStats.filter((d) => d.status === 'completed').length
    return Math.round((completed / weeklyStats.length) * 100)
  }, [weeklyStats])

  // targetMembers는 시니어만 포함하므로 항상 '어르신'
  const activeRoleLabel = '어르신'

  // Hook 규칙 준수: early return 이전에 모든 Hook 호출
  const hasFamilyGroup = useMemo(() => Array.isArray(familyGroups) && familyGroups.length > 0, [familyGroups])
  const shouldShowNoFamilyModal = !loading && !hasFamilyGroup && (initialized || !!token)

  if (loading && groupMembers.length === 0) {
    return <CaregiverDashboardSkeleton />
  }

  if (error) {
    return (
      <MainLayout>
        <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography color="error" variant="h6">
            데이터를 불러오지 못했습니다.
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {error.message || '잠시 후 다시 시도해주세요.'}
          </Typography>
          <ButtonBase
            onClick={() => initialize({ force: true }).catch(() => { })}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            다시 시도
          </ButtonBase>
        </Box>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      {/* 가족 그룹 없음 강제 모달 - 별도 컴포넌트로 분리 */}
      <NoFamilyModal open={shouldShowNoFamilyModal} />

      {/* 식단/질병 상세 모달 */}
      <DietDetailModal
        open={dietModalOpen}
        onClose={() => setDietModalOpen(false)}
        userId={activeSenior?.userId}
        userName={activeSenior?.name}
      />
      <DiseaseDetailModal
        open={diseaseModalOpen}
        onClose={() => setDiseaseModalOpen(false)}
        userId={activeSenior?.userId}
        userName={activeSenior?.name}
      />

      {isDesktop ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { md: '4fr 8fr' }, gap: 3 }}>
          <Stack spacing={2.5}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 3,
                p: 3,
                bgcolor: 'common.white',
              }}
            >
              <Stack spacing={2.5}>
                {/* 가족 그룹 선택 드롭다운 (Desktop) */}
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 900, color: 'text.disabled', mb: 0.5 }}>
                    가족 그룹
                  </Typography>
                  <ButtonBase
                    onClick={handleOpenGroupMenu}
                    disabled={familyGroups.length <= 1}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      typography: 'h6',
                      fontWeight: 900,
                      color: 'text.primary',
                      borderRadius: 1,
                      pl: 0.5,
                      pr: 1,
                      py: 0.5,
                      ml: -0.5, // align slightly left to match margin
                      '&:hover': familyGroups.length > 1 ? { bgcolor: 'action.hover' } : {},
                    }}
                  >
                    {familyGroups.find(g => String(g.id) === String(selectedGroupId))?.name || '가족 그룹 없음'}
                    {familyGroups.length > 1 && <KeyboardArrowDownIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
                  </ButtonBase>

                  <Menu
                    anchorEl={groupMenuAnchor}
                    open={Boolean(groupMenuAnchor)}
                    onClose={handleCloseGroupMenu}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    PaperProps={{
                      elevation: 3,
                      sx: { mt: 1, borderRadius: 3, minWidth: 160 }
                    }}
                  >
                    {familyGroups.map((group) => (
                      <MenuItem
                        key={group.id}
                        onClick={() => handleSelectGroup(group.id)}
                        selected={String(selectedGroupId) === String(group.id)}
                        sx={{ fontWeight: 700, fontSize: 14 }}
                      >
                        {group.name}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>

                {targetMembers.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.secondary', mb: 1 }}>
                      👴 어르신이 없습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      가족 그룹에 어르신을 초대하면 여기에 표시됩니다.
                    </Typography>
                  </Box>
                ) : (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 999,
                        bgcolor: '#EEF2FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 30,
                        flex: '0 0 auto',
                      }}
                      aria-hidden
                    >
                      👴
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }} noWrap>
                          {activeSenior?.name ? `${activeSenior.name} 님` : '케어 대상'}
                        </Typography>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 999,
                            bgcolor: '#EEF2FF',
                            color: '#7C8CFF',
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          {activeRoleLabel}
                        </Box>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontWeight: 700 }}>
                        오늘 복약 달성률: {todayRateLoading ? '불러오는 중…' : todayRate === null ? '-' : `${todayRate}%`}
                      </Typography>
                    </Box>
                  </Stack>
                )}

                {targetMembers.length > 1 ? (
                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 900, color: 'text.disabled', mb: 1 }}>
                      다른 가족 보기
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {targetMembers.map((member) => (
                        <ButtonBase
                          key={member.id}
                          onClick={() => setActiveSeniorId(member.id)}
                          sx={{
                            px: 1.5,
                            py: 1,
                            borderRadius: 2.5,
                            border: '1px solid',
                            borderColor: String(activeSeniorId) === String(member.id) ? '#2EC4B6' : 'divider',
                            bgcolor: String(activeSeniorId) === String(member.id) ? '#F0FDFA' : 'common.white',
                            color: 'text.primary',
                            fontWeight: 900,
                          }}
                        >
                          {member.name}
                        </ButtonBase>
                      ))}
                    </Box>
                  </Box>
                ) : null}

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                  <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 3, p: 2 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 900, color: 'text.secondary' }}>
                      오늘 복용 완료
                    </Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 900, color: 'primary.main', mt: 0.75 }}>
                      {todayRateLoading ? '…' : `${todayCounts.completed}/${todayCounts.total}`}
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 3, p: 2 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 900, color: 'text.secondary' }}>
                      주간 준수율
                    </Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 900, color: '#2EC4B6', mt: 0.75 }}>
                      {weeklyLoading ? '…' : `${adherenceRate}%`}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>

            <TodaySummaryCard
              takenCount={todayCounts.completed}
              totalCount={todayCounts.total}
              onClick={() => openActiveMemberDetail('medication')}
            />

            <WeeklyStatsWidget
              title="지난 7일 기록"
              weeklyData={weeklyStats}
              adherenceRate={adherenceRate}
              onClick={() => openActiveMemberDetail('medication')}
            />

            {/* 식단/질병 요약 카드 */}
            <DietSummaryCard
              count={todayDietCount}
              loading={dietLoading}
              onClick={() => setDietModalOpen(true)}
            />
            <DiseaseSummaryCard
              count={diseaseCount}
              loading={diseaseLoading}
              onClick={() => setDiseaseModalOpen(true)}
            />

            {/* PDF 내보내기 버튼 */}
            <Paper
              variant="outlined"
              onClick={handleExportPdf}
              sx={{
                borderRadius: 3,
                p: 2.5,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: '#E9D5FF',
                bgcolor: '#FAF5FF',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#A78BFA',
                  bgcolor: '#F3E8FF',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: '#F3E8FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DownloadIcon sx={{ fontSize: 24, color: '#8B5CF6' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 900, color: 'text.primary' }}>
                    질환 PDF 출력
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mt: 0.25 }}>
                    {activeSenior?.name || '케어 대상'}의 질환 리포트
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>

          <HistoryTimelineCard
            title="최근 활동 로그"
            emptyText={recentHistoryLoading ? '불러오는 중…' : '최근 기록이 없습니다.'}
            historyData={recentHistoryData}
            onOpenDetail={() => openActiveMemberDetail('medication')}
          />
        </Box>
      ) : (
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: { xs: 2.5, md: 3 },
              color: 'common.white',
              background: 'linear-gradient(135deg, #7C8CFF 0%, #6366F1 100%)',
              boxShadow: '0 16px 40px rgba(99, 102, 241, 0.25)',
            }}
          >
            <Stack spacing={2}>
              {/* 가족 그룹 선택 (모바일) */}
              {familyGroups.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
                  {familyGroups.map((group) => (
                    <ButtonBase
                      key={group.id}
                      onClick={() => selectGroup(group.id)}
                      sx={{
                        px: 2,
                        py: 0.75,
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                        bgcolor: String(selectedGroupId) === String(group.id) ? 'common.white' : 'rgba(255,255,255,0.2)',
                        color: String(selectedGroupId) === String(group.id) ? '#7C8CFF' : 'common.white',
                        fontWeight: 900,
                        fontSize: 14,
                      }}
                    >
                      {group.name}
                    </ButtonBase>
                  ))}
                </Box>
              )}

              {targetMembers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: 'common.white', mb: 0.5 }}>
                    👴 어르신이 없습니다
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    가족 그룹에 어르신을 초대하면 여기에 표시됩니다.
                  </Typography>
                </Box>
              ) : (
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900 }} noWrap>
                      {activeSenior?.name ? `${activeSenior.name} 님 케어 현황` : '케어 대상 없음'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                      오늘 복약 달성률: {todayRateLoading ? '불러오는 중…' : todayRate === null ? '-' : `${todayRate}%`}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    {todayRate !== null && todayRate >= 90 ? '✅' : '⚠️'}
                  </Box>
                </Stack>
              )}

              {targetMembers.length > 1 ? (
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
                  {targetMembers.map((member) => (
                    <ButtonBase
                      key={member.id}
                      onClick={() => setActiveSeniorId(member.id)}
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                        bgcolor: String(activeSeniorId) === String(member.id) ? 'common.white' : 'rgba(255,255,255,0.2)',
                        color: String(activeSeniorId) === String(member.id) ? '#6366F1' : 'common.white',
                        fontWeight: 900,
                      }}
                    >
                      {member.name}
                    </ButtonBase>
                  ))}
                </Box>
              ) : null}
            </Stack>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            <GuardianMenuCard
              title="복약 관리"
              icon={<LocalPharmacyIcon sx={{ color: '#7C8CFF' }} />}
              color="#EEF2FF"
              onClick={() => openActiveMemberDetail('medication')}
            />
            <GuardianMenuCard
              title="식단 관리"
              icon={<RestaurantIcon sx={{ color: '#F59E0B' }} />}
              color="#FFFBEB"
              onClick={() => openActiveMemberDetail('diet')}
            />
            <GuardianMenuCard
              title="질병 관리"
              icon={<HealthAndSafetyIcon sx={{ color: '#EF4444' }} />}
              color="#FEF2F2"
              onClick={() => openActiveMemberDetail('disease')}
            />
            <GuardianMenuCard
              title="통합 검색"
              icon={<SearchIcon sx={{ color: '#10B981' }} />}
              color="#ECFDF5"
              onClick={() =>
                openSearchOverlay('pill', {
                  targetUserId: activeSenior?.userId,
                  targetUserName: activeSenior?.name,
                })
              }
            />
            <GuardianMenuCard
              title="OCR 약봉투"
              icon={<CameraAltIcon sx={{ color: '#2EC4B6' }} />}
              color="#F0FDFA"
              onClick={() =>
                navigate(ROUTE_PATHS.ocrScan, {
                  state: {
                    targetUserId: activeSenior?.userId,
                    targetUserName: activeSenior?.name,
                  },
                })
              }
            />
            <GuardianMenuCard
              title="가족 채팅"
              icon={<ChatIcon sx={{ color: '#F59E0B' }} />}
              color="#FFFBEB"
              onClick={() => navigate(ROUTE_PATHS.familyChat, { state: { groupId: selectedGroupId } })}
            />
            <GuardianMenuCard
              title="질환 PDF 출력"
              icon={<DownloadIcon sx={{ color: '#8B5CF6' }} />}
              color="#F3E8FF"
              onClick={handleExportPdf}
            />
            <GuardianMenuCard
              title="진료 일정"
              icon={<CalendarMonthIcon sx={{ color: '#6366F1' }} />}
              color="#EEF2FF"
              onClick={() =>
                navigate(ROUTE_PATHS.appointmentCaregiverAdd, {
                  state: {
                    targetUserId: activeSenior?.userId,
                    targetUserName: activeSenior?.name,
                  },
                })
              }
            />
          </Box>

          <TodaySummaryCard
            takenCount={todayCounts.completed}
            totalCount={todayCounts.total}
            onClick={() => openActiveMemberDetail('medication')}
          />

          <WeeklyStatsWidget
            title="지난 7일 기록"
            weeklyData={weeklyStats}
            adherenceRate={adherenceRate}
            onClick={() => openActiveMemberDetail('medication')}
          />

          {/* 식단/질병 요약 카드 (Mobile) */}
          <DietSummaryCard
            count={todayDietCount}
            loading={dietLoading}
            onClick={() => setDietModalOpen(true)}
          />
          <DiseaseSummaryCard
            count={diseaseCount}
            loading={diseaseLoading}
            onClick={() => setDiseaseModalOpen(true)}
          />
        </Stack>
      )}

    </MainLayout>
  )
}

export default CaregiverDashboard

const GuardianMenuCard = memo(({ title, icon, color, onClick }) => {
  return (
    <Paper
      elevation={0}
      component={ButtonBase}
      onClick={onClick}
      sx={{
        p: 2,
        height: '100%',
        width: '100%',
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderColor: 'primary.main',
          bgcolor: 'primary.50',
        },
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: 'text.primary' }}
      >
        {title}
      </Typography>
    </Paper>
  )
})
