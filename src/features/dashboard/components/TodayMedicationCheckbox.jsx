/**
 * TodayMedicationCheckbox Component
 * - 오늘 복약 체크박스 (큼직하게)
 * - 아침/점심/저녁/밤 체크 상태
 */

import { Box, Typography, Stack, Checkbox } from '@mui/material'
import { RoundedCard } from '@shared/components/mui/RoundedCard'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { parseServerLocalDateTime } from '@core/utils/formatting'
import PropTypes from 'prop-types'
import { memo } from 'react'

export const TodayMedicationCheckbox = memo(({ schedules = [], onToggle }) => {
  const now = new Date()

  // 시간대별 그룹화
  const groupedByTime = {
    morning: schedules.filter(s => s.section === 'morning'),
    lunch: schedules.filter(s => s.section === 'lunch'),
    dinner: schedules.filter(s => s.section === 'dinner'),
    night: schedules.filter(s => s.section === 'night'),
  }

  const timeLabels = {
    morning: '아침 완료',
    lunch: '점심 완료',
    dinner: '저녁 완료',
    night: '취침 전 완료',
  }

  return (
    <RoundedCard elevation={2} padding="large">
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        오늘 복약
      </Typography>

      <Stack spacing={2}>
        {Object.entries(groupedByTime).map(([timeKey, items]) => {
          if (items.length === 0) return null

          const allCompleted = items.every(item => item.status === 'completed')
          const someCompleted = items.some(item => item.status === 'completed')
          const validTimeItems = items.filter((item) => item.log?.scheduledTime)
          const isFutureSection =
            validTimeItems.length > 0 &&
            validTimeItems.every((item) => {
              const scheduledDate = parseServerLocalDateTime(item.log.scheduledTime)
              if (!scheduledDate) return false
              return scheduledDate.getTime() - now.getTime() > 60 * 60 * 1000
            })
          const isDisabled = isFutureSection && !allCompleted

          return (
            <Box
              key={timeKey}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                border: '2px solid',
                borderColor: allCompleted ? 'success.main' : 'grey.300',
                bgcolor: allCompleted ? 'success.light' : 'background.paper',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.6 : 1,
                transition: 'all 0.2s',
                ...(isDisabled
                  ? {}
                  : {
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'grey.50',
                    },
                  }),
              }}
              onClick={() => !isDisabled && onToggle && onToggle(timeKey, items)}
            >
              <Checkbox
                checked={allCompleted}
                indeterminate={someCompleted && !allCompleted}
                disabled={isDisabled}
                icon={<RadioButtonUncheckedIcon sx={{ fontSize: 32 }} />}
                checkedIcon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
                sx={{
                  color: 'grey.400',
                  '&.Mui-checked': {
                    color: 'success.main',
                  },
                  '&.MuiCheckbox-indeterminate': {
                    color: 'warning.main',
                  },
                }}
              />
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  ml: 2,
                  color: allCompleted ? 'success.dark' : 'text.primary',
                }}
              >
                {timeLabels[timeKey]}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: 'auto' }}
              >
                {items.length}개
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </RoundedCard>
  )
})

TodayMedicationCheckbox.propTypes = {
  schedules: PropTypes.arrayOf(
    PropTypes.shape({
      section: PropTypes.string,
      status: PropTypes.string,
    })
  ),
  onToggle: PropTypes.func,
}

export default TodayMedicationCheckbox
