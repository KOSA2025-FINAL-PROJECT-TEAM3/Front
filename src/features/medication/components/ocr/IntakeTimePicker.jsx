import React from 'react'
import { Box, Button, IconButton, Paper, Stack, Switch, TextField, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import NotificationsIcon from '@mui/icons-material/Notifications'

/**
 * 복용 시간 선택 컴포넌트 (이미지 2, 4 참고)
 *
 * @param {Object} props
 * @param {IntakeTimeSlot[]} props.intakeTimes - 복용 시간 슬롯
 * @param {(index: number, updates: object) => void} props.onUpdate - 업데이트 핸들러
 * @param {() => void} props.onAdd - 추가 핸들러
 * @param {(index: number) => void} props.onRemove - 삭제 핸들러
 * @param {boolean} [props.hasAlarmToggle=true] - 알림 토글 표시 여부
 */
const IntakeTimePicker = ({
  intakeTimes,
  onUpdate,
  onAdd,
  onRemove,
  hasAlarmToggle = true
}) => {
  const formatTimeLabel = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours < 12 ? '오전' : '오후'
    const displayHours = hours % 12 || 12
    return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`
  }

  return (
    <Paper sx={{ p: 2.5, borderRadius: 3, mb: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
          하루 복용 횟수{' '}
          <Box component="span" sx={{ color: 'success.main', fontWeight: 900 }}>
            {intakeTimes.length}회
          </Box>
        </Typography>
        {hasAlarmToggle ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
            <Typography variant="body2">알림</Typography>
            <Switch defaultChecked inputProps={{ 'aria-label': '알림 토글' }} />
          </Stack>
        ) : null}
      </Stack>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {intakeTimes.map((slot, index) => (
          <Paper key={slot.index} variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.secondary', minWidth: 44 }}>
                {index + 1}회
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 220 }}>
                <TextField
                  type="time"
                  size="small"
                  value={slot.time}
                  onChange={(e) =>
                    onUpdate(index, {
                      time: e.target.value,
                      label: formatTimeLabel(e.target.value),
                    })
                  }
                  sx={{ minWidth: 140 }}
                />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {slot.label}
                </Typography>
              </Stack>

              {intakeTimes.length > 1 ? (
                <IconButton size="small" onClick={() => onRemove(index)} aria-label="시간 삭제">
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : null}

              {hasAlarmToggle ? (
                <IconButton
                  size="small"
                  onClick={() => onUpdate(index, { hasAlarm: !slot.hasAlarm })}
                  aria-label={slot.hasAlarm ? '알림 끄기' : '알림 켜기'}
                  sx={{
                    color: slot.hasAlarm ? 'success.main' : 'text.disabled',
                    bgcolor: slot.hasAlarm ? 'rgba(0, 200, 83, 0.08)' : 'transparent',
                    border: '1px solid',
                    borderColor: slot.hasAlarm ? 'success.200' : 'divider',
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                </IconButton>
              ) : null}
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Button
        variant="outlined"
        onClick={onAdd}
        disabled={intakeTimes.length >= 10}
        fullWidth
        sx={{
          py: 1.5,
          borderStyle: 'dashed',
          borderRadius: 2,
          fontWeight: 900,
        }}
      >
        복용 횟수 추가
      </Button>
    </Paper>
  )
}

export default IntakeTimePicker
