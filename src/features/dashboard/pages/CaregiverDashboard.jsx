import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Stack, Paper, ButtonBase, useMediaQuery, useTheme } from '@mui/material'
import { ROUTE_PATHS } from '@config/routes.config'
import { useFamilyStore } from '@features/family/store/familyStore'
import MainLayout from '@shared/components/layout/MainLayout'
import HistoryTimelineCard from '../components/HistoryTimelineCard'
import TodaySummaryCard from '../components/TodaySummaryCard'
import { WeeklyStatsWidget } from '../components/WeeklyStatsWidget'
import { familyApiClient } from '@core/services/api/familyApiClient'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import SearchIcon from '@mui/icons-material/Search'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import ChatIcon from '@mui/icons-material/Chat'
import logger from '@core/utils/logger'
import { endOfWeek, format, isAfter, startOfWeek, subDays, addDays } from 'date-fns'
import { parseServerLocalDateTime } from '@core/utils/formatting'
import { useSearchOverlayStore } from '@features/search/store/searchOverlayStore'
import { useCareTargetStore } from '@features/dashboard/store/careTargetStore'
import { useAuth } from '@features/auth/hooks/useAuth'

/**
 * CaregiverDashboard - 보호자/케어기버용 대시보드
 * 가족 구성원 상태와 알림 위젯을 연동할 예정.
 */
export function CaregiverDashboard() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const openSearchOverlay = useSearchOverlayStore((state) => state.open)
  const { familyGroups, selectedGroupId, members, loading, error, initialized, initialize } = useFamilyStore((state) => ({
    familyGroups: state.familyGroups,
    selectedGroupId: state.selectedGroupId,
    members: state.members,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    initialize: state.initialize,
  }))
  const currentUserId = useAuth((state) => state.user?.id || state.user?.userId || null)
  const { activeSeniorId, setActiveSeniorId } = useCareTargetStore((state) => ({
    activeSeniorId: state.activeSeniorMemberId,
    setActiveSeniorId: state.setActiveSeniorMemberId,
  }))
  const [todayRate, setTodayRate] = useState(null)
  const [todayRateLoading, setTodayRateLoading] = useState(false)
  const [todayCounts, setTodayCounts] = useState({ total: 0, completed: 0 })
  const [weeklyStats, setWeeklyStats] = useState(Array(7).fill({ status: 'pending' }))
  const [weeklyLoading, setWeeklyLoading] = useState(false)
  const [recentHistoryData, setRecentHistoryData] = useState([])
  const [recentHistoryLoading, setRecentHistoryLoading] = useState(false)

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
    if (!initialized) {
      initialize().catch(() => { })
    }
  }, [initialized, initialize])

  const groupMembers = useMemo(() => {
    if (selectedGroupId && Array.isArray(familyGroups)) {
      const group = familyGroups.find((g) => String(g?.id) === String(selectedGroupId))
      if (Array.isArray(group?.members)) return group.members
    }
    return Array.isArray(members) ? members : []
  }, [familyGroups, members, selectedGroupId])

  const targetMembers = useMemo(() => {
    const list = groupMembers.filter(Boolean).filter((m) => m.userId != null)
    if (!currentUserId) return list
    return list.filter((m) => String(m.userId) !== String(currentUserId))
  }, [currentUserId, groupMembers])

  useEffect(() => {
    if (targetMembers.length === 0) return
    if (!activeSeniorId) {
      const preferred = targetMembers.find((m) => m.role === 'SENIOR') || targetMembers[0]
      setActiveSeniorId(preferred?.id ?? null)
      return
    }
    const stillExists = targetMembers.some((m) => String(m.id) === String(activeSeniorId))
    if (!stillExists) {
      const preferred = targetMembers.find((m) => m.role === 'SENIOR') || targetMembers[0]
      setActiveSeniorId(preferred?.id ?? null)
    }
  }, [activeSeniorId, setActiveSeniorId, targetMembers])

  const activeSenior = useMemo(
    () =>
      targetMembers.find((m) => String(m.id) === String(activeSeniorId)) || targetMembers[0] || null,
    [activeSeniorId, targetMembers],
  )

  useEffect(() => {
    const loadRate = async () => {
      if (!activeSenior?.userId) {
        setTodayRate(null)
        setTodayCounts({ total: 0, completed: 0 })
        return
      }
      setTodayRateLoading(true)
      try {
        const today = new Date().toISOString().split('T')[0]
        const response = await familyApiClient.getMedicationLogs(activeSenior.userId, { date: today })
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
              .getMedicationLogs(activeSenior.userId, { date: format(date, 'yyyy-MM-dd') })
              .then((response) => response?.logs || response || [])
              .catch(() => [])
          }),
        )

        const stats = results.map((logs) => {
          const total = logs.length
          if (total === 0) return { status: 'pending' }
          const completed = logs.filter((l) => l.status === 'completed' || l.completed === true).length
          return completed >= total ? { status: 'completed' } : { status: 'missed' }
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
      const dates = []
      for (let i = 0; i <= 2; i += 1) {
        const d = subDays(new Date(), 1 + i)
        dates.push(format(d, 'yyyy-MM-dd'))
      }

      const results = await Promise.all(
        dates.map((date) =>
          familyApiClient
            .getMedicationLogs(activeSenior.userId, { date })
            .then((response) => response?.logs || response || [])
            .catch(() => []),
        ),
      )
      const logs = results.flat().filter(Boolean)

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

        const dateKey = format(scheduledDate, 'yyyy-MM-dd')
        const time = format(scheduledDate, 'HH:mm')
        const label = getTimeSectionLabel(time)
        const medicationName = log?.medicationName || log?.name || '알 수 없는 약'
        const isCompleted = log?.status === 'completed' || log?.completed === true

        if (!byDate.has(dateKey)) {
          byDate.set(dateKey, { dateKey, date: scheduledDate, sections: new Map() })
        }

        const entry = byDate.get(dateKey)
        if (!entry.sections.has(label)) {
          entry.sections.set(label, { label, time, names: [], completed: true })
        }

        const section = entry.sections.get(label)
        section.names.push(medicationName)
        section.completed = section.completed && Boolean(isCompleted)
        if (time && section.time && time < section.time) {
          section.time = time
        }
      })

      const groups = Array.from(byDate.values())
        .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
        .map((group) => {
          const items = Array.from(group.sections.values()).sort((a, b) => String(a.time).localeCompare(String(b.time)))
          return {
            key: group.dateKey,
            date: group.date,
            dateLabel: group.date?.toLocaleDateString?.('ko-KR', { month: 'long', day: 'numeric' }) || group.dateKey,
            dayLabel: group.date?.toLocaleDateString?.('ko-KR', { weekday: 'long' }) || '',
            items: items.map((item) => ({
              ...item,
              names: Array.from(new Set(item.names)).join(', '),
            })),
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
    loadRecentHistory().catch(() => {})
  }, [loadRecentHistory])

  const adherenceRate = useMemo(() => {
    if (!weeklyStats?.length) return 0
    const completed = weeklyStats.filter((d) => d.status === 'completed').length
    return Math.round((completed / weeklyStats.length) * 100)
  }, [weeklyStats])

  const activeRoleLabel = activeSenior?.role === 'CAREGIVER' ? '보호자' : '어르신'

  if (loading && groupMembers.length === 0) {
    return (
      <MainLayout>
        <Box sx={{ py: 4 }}>
          <Typography>가족 데이터를 불러오는 중...</Typography>
        </Box>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <Box sx={{ py: 4 }}>
          <Typography color="error">가족 데이터를 불러오지 못했습니다. {error.message}</Typography>
        </Box>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
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
          </Stack>

          <Stack spacing={2.5}>
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2 }}>
                케어 메뉴
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
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
                  onClick={() => openSearchOverlay('pill')}
                />
                <GuardianMenuCard
                  title="OCR 약봉투"
                  icon={<CameraAltIcon sx={{ color: '#2EC4B6' }} />}
                  color="#F0FDFA"
                  onClick={() => navigate(ROUTE_PATHS.ocrScan)}
                />
                <GuardianMenuCard
                  title="가족 채팅"
                  icon={<ChatIcon sx={{ color: '#F59E0B' }} />}
                  color="#FFFBEB"
                  onClick={() => navigate(ROUTE_PATHS.familyChat)}
                />
              </Box>
            </Paper>

            <HistoryTimelineCard
              title="최근 활동 로그"
              emptyText={recentHistoryLoading ? '불러오는 중…' : '최근 기록이 없습니다.'}
              historyData={recentHistoryData}
              onOpenDetail={() => openActiveMemberDetail('medication')}
            />
          </Stack>
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
              onClick={() => openSearchOverlay('pill')}
            />
            <GuardianMenuCard
              title="OCR 약봉투"
              icon={<CameraAltIcon sx={{ color: '#2EC4B6' }} />}
              color="#F0FDFA"
              onClick={() => navigate(ROUTE_PATHS.ocrScan)}
            />
            <GuardianMenuCard
              title="가족 채팅"
              icon={<ChatIcon sx={{ color: '#F59E0B' }} />}
              color="#FFFBEB"
              onClick={() => navigate(ROUTE_PATHS.familyChat)}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
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
          </Box>
        </Stack>
      )}
    </MainLayout>
  )
}

export default CaregiverDashboard

const GuardianMenuCard = ({ title, icon, color, onClick }) => {
  return (
    <ButtonBase onClick={onClick} sx={{ width: '100%', textAlign: 'center', borderRadius: 3 }}>
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          p: { xs: 1.5, md: 2.25 },
          borderRadius: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: { xs: 'center', md: 'flex-start' },
          gap: { xs: 1, md: 2 },
          transition: 'all 160ms ease',
          '&:hover': { boxShadow: 2, borderColor: 'primary.light' },
        }}
      >
        <Box
          sx={{
            width: { xs: 40, md: 48 },
            height: { xs: 40, md: 48 },
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: color,
            color: 'text.primary',
            flex: '0 0 auto',
            '& .MuiSvgIcon-root': {
              fontSize: { xs: 20, md: 24 }
            }
          }}
        >
          {icon}
        </Box>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 900,
            fontSize: { xs: 12, md: 16 },
            whiteSpace: 'nowrap',
            textAlign: 'center'
          }}
        >
          {title}
        </Typography>
      </Paper>
    </ButtonBase>
  )
}
