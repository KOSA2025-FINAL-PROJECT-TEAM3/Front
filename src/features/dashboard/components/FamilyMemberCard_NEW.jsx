/**
 * FamilyMemberCard Component (MUI Refactored)
 * - 가족 구성원 카드 (어르신 복약 현황)
 * - 아코디언 형태로 상세 일정 표시
 */

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Divider,
  Chip,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { RoundedCard } from '@shared/components/mui/RoundedCard'
import { StatusBadge } from '@shared/components/mui/StatusBadge'
import { familyApiClient } from '@core/services/api/familyApiClient'
import logger from '@core/utils/logger'
import PropTypes from 'prop-types'

const TIME_SECTIONS = {
  MORNING: { label: '아침', range: '05:00 - 11:00' },
  LUNCH: { label: '점심', range: '11:00 - 17:00' },
  DINNER: { label: '저녁', range: '17:00 - 21:00' },
  NIGHT: { label: '취침 전', range: '21:00 - 05:00' },
}

const getTimeCategory = (dateString) => {
  if (!dateString) return 'NIGHT'
  const hour = new Date(dateString).getHours()
  if (hour >= 5 && hour < 11) return 'MORNING'
  if (hour >= 11 && hour < 17) return 'LUNCH'
  if (hour >= 17 && hour < 21) return 'DINNER'
  return 'NIGHT'
}

export const FamilyMemberCard = ({ member, onDetail }) => {
  const [expanded, setExpanded] = useState(false)
  const [medications, setMedications] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})

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

  // 오늘 복약 로그 조회
  const loadTodayLogs = async () => {
    if (expanded) {
      setExpanded(false)
      return
    }

    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await familyApiClient.getMedicationLogs(member.userId, { date: today })
      const logs = response?.logs || response || []
      setTodayLogs(logs)
      initializeExpandedState(logs)
      setExpanded(true)
    } catch (error) {
      logger.error('Failed to load today logs:', error)
      setTodayLogs([])
      setExpanded(true)
    } finally {
      setLoading(false)
    }
  }

  const initializeExpandedState = (currentLogs) => {
    const currentCategory = getTimeCategory(new Date())
    const nextExpanded = {}
    const sections = ['MORNING', 'LUNCH', 'DINNER', 'NIGHT']

    sections.forEach((section) => {
      if (section === currentCategory) {
        nextExpanded[section] = true
        return
      }

      const logsInSection = currentLogs.filter(
        (log) => getTimeCategory(log.scheduledTime) === section
      )
      const hasUntaken = logsInSection.some((log) => log.status !== 'completed')
      nextExpanded[section] = hasUntaken
    })

    setExpandedSections(nextExpanded)
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const completedToday = todayLogs.filter((l) => l.status === 'completed').length
  const pendingToday = todayLogs.filter((l) => l.status === 'pending').length
  const missedToday = todayLogs.filter((l) => l.status === 'missed').length

  return (
    <RoundedCard elevation={1} padding="default">
      <Stack spacing={2}>
        {/* 헤더 */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {member.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {relation}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              onClick={loadTodayLogs}
              endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />}
            >
              {expanded ? '접기' : '일정 보기'}
            </Button>
            <Button size="small" variant="outlined" onClick={onDetail}>
              자세히
            </Button>
          </Stack>
        </Stack>

        {/* 아코디언 - 복약 일정 */}
        {expanded && (
          <Box>
            {/* 통계 요약 */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Chip label={`완료 ${completedToday}`} color="success" size="small" />
              <Chip label={`예정 ${pendingToday}`} color="warning" size="small" />
              <Chip label={`미복용 ${missedToday}`} color="error" size="small" />
            </Stack>

            {loading ? (
              <Typography variant="body2" color="text.secondary">
                로딩 중...
              </Typography>
            ) : todayLogs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                오늘 복약 일정이 없습니다.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {['MORNING', 'LUNCH', 'DINNER', 'NIGHT'].map((sectionKey) => {
                  const sectionLogs = todayLogs
                    .filter((log) => {
                      const isCorrectTime = getTimeCategory(log.scheduledTime) === sectionKey
                      if (!isCorrectTime) return false

                      const medication = medications.find((m) => m.id === log.medicationId)
                      if (medication && medication.active === false) return false

                      return true
                    })
                    .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))

                  if (sectionLogs.length === 0) return null

                  const isSectionExpanded = expandedSections[sectionKey]
                  const sectionInfo = TIME_SECTIONS[sectionKey]

                  return (
                    <Accordion
                      key={sectionKey}
                      expanded={isSectionExpanded}
                      onChange={() => toggleSection(sectionKey)}
                      disableGutters
                      elevation={0}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        '&:before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" justifyContent="space-between" sx={{ width: '100%', pr: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {sectionInfo.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {sectionInfo.range}
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List disablePadding>
                          {sectionLogs.map((log, index) => {
                            const time = new Date(log.scheduledTime).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })

                            return (
                              <Box key={`${member.id}-${log.id || index}`}>
                                <ListItem sx={{ px: 0, py: 1 }}>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                    sx={{ width: '100%' }}
                                  >
                                    <Typography variant="body2" fontWeight={500} sx={{ minWidth: 50 }}>
                                      {time}
                                    </Typography>
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                      {log.medicationName || '알 수 없는 약'}
                                    </Typography>
                                    <StatusBadge status={log.status} size="small" showIcon={false} />
                                  </Stack>
                                </ListItem>
                                {index < sectionLogs.length - 1 && <Divider />}
                              </Box>
                            )
                          })}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  )
                })}
              </Stack>
            )}
          </Box>
        )}
      </Stack>
    </RoundedCard>
  )
}

FamilyMemberCard.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string,
    relation: PropTypes.string,
  }).isRequired,
  onDetail: PropTypes.func,
}

export default FamilyMemberCard
