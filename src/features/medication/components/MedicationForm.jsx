import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'

const initialForm = {
  name: '',
  ingredient: '',
  dosage: '',
  startDate: '',
  endDate: '',
  quantity: '',
  remaining: '',
  expiryDate: '',
  notes: '',
  schedules: [],
}

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const normalizeTime = (value) => (value ? value.substring(0, 5) : '')

const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2)
    .toString()
    .padStart(2, '0')
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
})

export const MedicationForm = ({
  initialValues,
  onSubmit,
  loading,
  submitLabel = '약 등록',
  onCancel,
  shouldResetOnSubmit = true,
}) => {
  const mergedInitial = useMemo(() => {
    const merged = {
      ...initialForm,
      ...(initialValues || {}),
    }

    if (merged.schedules) {
      merged.schedules = merged.schedules.map((s) => ({
        ...s,
        time: normalizeTime(s.time),
      }))
    }

    return merged
  }, [initialValues])

  const [form, setForm] = useState(mergedInitial)

  useEffect(() => {
    setForm(mergedInitial)
  }, [mergedInitial])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...(form.schedules || [])]
    if (!newSchedules[index]) {
      newSchedules[index] = { time: '', daysOfWeek: '', active: true }
    }
    newSchedules[index] = {
      ...newSchedules[index],
      [field]: value,
    }
    setForm((prev) => ({ ...prev, schedules: newSchedules }))
  }

  const addSchedule = () => {
    setForm((prev) => ({
      ...prev,
      schedules: [...(prev.schedules || []), { time: '', daysOfWeek: '', active: true }],
    }))
  }

  const removeSchedule = (index) => {
    const newSchedules = [...(form.schedules || [])]
    newSchedules.splice(index, 1)
    setForm((prev) => ({ ...prev, schedules: newSchedules }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.schedules && form.schedules.length > 0) {
      const timeMap = {}
      for (const schedule of form.schedules) {
        if (!schedule.time || !schedule.daysOfWeek) continue

        if (!timeMap[schedule.time]) {
          timeMap[schedule.time] = new Set()
        }

        const days = schedule.daysOfWeek.split(',')
        for (const day of days) {
          if (timeMap[schedule.time].has(day)) {
            alert(`중복된 스케줄이 있습니다: ${schedule.time} (${day})`)
            return
          }
          timeMap[schedule.time].add(day)
        }
      }
    }

    await onSubmit?.(form)
    if (shouldResetOnSubmit) {
      setForm(initialForm)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2 }}>
          기본 정보
        </Typography>
        <Stack spacing={2}>
          <TextField
            name="name"
            label="약 이름"
            value={form.name}
            onChange={handleChange}
            placeholder="예: Simvastatin"
            required
            fullWidth
          />
          <TextField
            name="ingredient"
            label="성분명"
            value={form.ingredient || ''}
            onChange={handleChange}
            placeholder="예: Simvastatin"
            fullWidth
          />
          <TextField
            name="dosage"
            label="용량"
            value={form.dosage}
            onChange={handleChange}
            placeholder="예: 20mg"
            fullWidth
          />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2 }}>
          복용 기간 및 수량
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <TextField
            type="date"
            name="startDate"
            label="시작일"
            value={form.startDate || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            name="endDate"
            label="종료일"
            value={form.endDate || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="number"
            name="quantity"
            label="총 수량"
            value={form.quantity || ''}
            onChange={handleChange}
            inputProps={{ min: 0 }}
          />
          <TextField
            type="number"
            name="remaining"
            label="남은 수량"
            value={form.remaining || ''}
            onChange={handleChange}
            inputProps={{ min: 0 }}
          />
          <TextField
            type="date"
            name="expiryDate"
            label="유효기간"
            value={form.expiryDate || ''}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            복용 스케줄
          </Typography>
          <Button type="button" variant="outlined" onClick={addSchedule} sx={{ fontWeight: 900 }}>
            + 스케줄 추가
          </Button>
        </Stack>

        {(form.schedules || []).length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            등록된 스케줄이 없습니다.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {(form.schedules || []).map((schedule, index) => {
              const selectedDays = schedule.daysOfWeek ? schedule.daysOfWeek.split(',').filter(Boolean) : []
              const disabled = Boolean(schedule.isTakenToday)

              return (
                <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: 'grey.50' }}>
                  <Stack spacing={1.5}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id={`schedule-time-${index}`}>시간</InputLabel>
                      <Select
                        labelId={`schedule-time-${index}`}
                        label="시간"
                        value={schedule.time}
                        onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
                        required
                        disabled={disabled}
                      >
                        <MenuItem value="">시간 선택</MenuItem>
                        {TIME_OPTIONS.map((timeStr) => (
                          <MenuItem key={timeStr} value={timeStr}>
                            {timeStr}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
                        요일
                      </Typography>
                      <ToggleButtonGroup
                        value={selectedDays}
                        onChange={(_, next) => {
                          const days = Array.isArray(next) ? next : []
                          const ordered = [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
                          handleScheduleChange(index, 'daysOfWeek', ordered.join(','))
                        }}
                        disabled={disabled}
                        size="small"
                        sx={{ mt: 1, flexWrap: 'wrap' }}
                      >
                        {DAY_ORDER.map((day) => (
                          <ToggleButton key={day} value={day} sx={{ fontWeight: 900 }}>
                            {day}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Box>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      {disabled ? (
                        <Chip label="복용 완료" size="small" color="success" sx={{ fontWeight: 900 }} />
                      ) : (
                        <Button type="button" color="error" variant="outlined" onClick={() => removeSchedule(index)} sx={{ fontWeight: 900 }}>
                          삭제
                        </Button>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {selectedDays.length ? `${selectedDays.length}일 선택` : '요일 미선택'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2 }}>
          기타
        </Typography>
        <TextField
          name="notes"
          label="메모 / 주의사항"
          value={form.notes || ''}
          onChange={handleChange}
          placeholder="예: 식후 30분 복용"
          multiline
          minRows={3}
          fullWidth
        />
      </Paper>

      <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
        {onCancel ? (
          <Button type="button" variant="outlined" onClick={onCancel} disabled={loading} sx={{ fontWeight: 900 }}>
            취소
          </Button>
        ) : null}
        <Button type="submit" variant="contained" disabled={loading} sx={{ fontWeight: 900 }}>
          {loading ? '저장 중...' : submitLabel}
        </Button>
      </Stack>
    </Box>
  )
}

export default MedicationForm

