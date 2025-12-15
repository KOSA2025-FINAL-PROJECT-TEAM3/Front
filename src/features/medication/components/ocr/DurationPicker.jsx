import React from 'react'
import { Alert, Box, Paper, Stack, Switch, TextField, Typography } from '@mui/material'

/**
 * 복용 기간 선택 컴포넌트 (이미지 2 참고)
 *
 * @param {Object} props
 * @param {string} props.startDate - 시작일 (YYYY-MM-DD)
 * @param {string} props.endDate - 종료일 (YYYY-MM-DD)
 * @param {(updates: { startDate?: string, endDate?: string }) => void} props.onUpdate - 업데이트 핸들러
 */
const DurationPicker = ({ startDate, endDate, onUpdate }) => {
  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const currentDay = () => {
    if (!startDate) return 1
    const start = new Date(startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)

    const diffTime = today - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, Math.min(diffDays + 1, calculateDays()))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return dateStr.replace(/-/g, '.')
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
          복용 기간{' '}
          <Box component="span" sx={{ color: 'success.main', fontWeight: 900, ml: 1 }}>
            {currentDay()}일차/{calculateDays()}일
          </Box>
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
          <Typography variant="body2">종료일</Typography>
          <Switch defaultChecked inputProps={{ 'aria-label': '종료일 토글' }} />
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
        <TextField
          type="date"
          label="시작일"
          value={startDate}
          onChange={(e) => onUpdate({ startDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
          helperText={formatDate(startDate) || ' '}
        />
        <TextField
          type="date"
          label="종료일"
          value={endDate}
          inputProps={{ min: startDate }}
          onChange={(e) => onUpdate({ endDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
          helperText={formatDate(endDate) || ' '}
        />
      </Box>

      <Alert severity="info" sx={{ bgcolor: 'grey.50' }}>
        새로 조정된 복용 기간을 확인해 주세요.
      </Alert>
    </Paper>
  )
}

export default DurationPicker
