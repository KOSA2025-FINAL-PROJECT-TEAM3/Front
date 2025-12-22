/**
 * MedicationTimeline Component
 * - 오늘의 복약 일정을 타임라인 형태로 표시
 * - 시간대별 그룹화 (아침/점심/저녁/밤)
 */

import {
  Box,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { RoundedCard } from '@shared/components/mui/RoundedCard'
import { StatusBadge } from '@shared/components/mui/StatusBadge'
import PropTypes from 'prop-types'

const TIME_SECTIONS = {
  morning: { label: '아침', range: '05:00 - 11:00' },
  lunch: { label: '점심', range: '11:00 - 17:00' },
  dinner: { label: '저녁', range: '17:00 - 21:00' },
  night: { label: '취침 전', range: '21:00 - 05:00' },
}

export const MedicationTimeline = ({
  title = '전체 일정',
  schedules = [],
  onItemClick,
}) => {
  // 시간대별 그룹화
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const section = schedule.section || 'morning'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(schedule)
    return acc
  }, {})

  return (
    <RoundedCard elevation={2}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        {title}
      </Typography>

      <Stack spacing={2}>
        {Object.entries(TIME_SECTIONS).map(([key, section]) => {
          const items = groupedSchedules[key] || []
          
          if (items.length === 0) return null

          return (
            <Box key={key}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {section.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {section.range}
                </Typography>
              </Stack>

              <List disablePadding>
                {items.map((item, index) => (
                  <Box key={item.id || index}>
                    <ListItem
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 2,
                        cursor: onItemClick ? 'pointer' : 'default',
                        '&:hover': onItemClick ? {
                          bgcolor: 'grey.50',
                        } : {},
                      }}
                      onClick={() => onItemClick && onItemClick(item)}
                    >
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                        <Typography variant="body2" fontWeight={500} sx={{ minWidth: 50 }}>
                          {item.time}
                        </Typography>
                        <ListItemText
                          primary={item.medicationName}
                          secondary={item.dosage}
                          primaryTypographyProps={{
                            fontWeight: 500,
                          }}
                        />
                        <StatusBadge status={item.status} size="small" />
                      </Stack>
                    </ListItem>
                    {index < items.length - 1 && <Divider sx={{ ml: 2 }} />}
                  </Box>
                ))}
              </List>
            </Box>
          )
        })}
      </Stack>

      {schedules.length === 0 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            오늘 복약 일정이 없습니다.
          </Typography>
        </Box>
      )}
    </RoundedCard>
  )
}

MedicationTimeline.propTypes = {
  title: PropTypes.string,
  schedules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      time: PropTypes.string.isRequired,
      medicationName: PropTypes.string.isRequired,
      dosage: PropTypes.string,
      status: PropTypes.oneOf(['completed', 'pending', 'missed', 'skipped']).isRequired,
      section: PropTypes.oneOf(['morning', 'lunch', 'dinner', 'night']),
    })
  ),
  onItemClick: PropTypes.func,
}

export default MedicationTimeline
