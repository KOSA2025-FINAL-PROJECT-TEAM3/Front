import { useMemo, useState } from 'react'
import { Box, Checkbox, FormControlLabel, MenuItem, Stack, TextField } from '@mui/material'
import AppButton from '@shared/components/mui/AppButton'

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: '치료 중' },
  { value: 'CURED', label: '완치' },
  { value: 'CHRONIC', label: '만성' },
]

const normalizeDate = (value) => {
  if (!value) return ''
  return value.slice(0, 10)
}

export const DiseaseForm = ({ initialValue, onSubmit, onCancel, submitting = false }) => {
  const values = initialValue || {}
  const [form, setForm] = useState({
    name: values.name || '',
    diagnosedAt: values.diagnosedAt || '',
    isDiagnosedDateUnknown: values.isDiagnosedDateUnknown || false,
    status: values.status || 'ACTIVE',
    isPrivate: values.isPrivate || false,
    isCritical: values.isCritical || false,
    description: values.description || '',
  })
  const [errors, setErrors] = useState({})

  const canSubmit = useMemo(() => form.name.trim().length > 0, [form.name])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) {
      setErrors({ name: '병명은 필수입니다.' })
      return
    }
    setErrors({})
    if (typeof onSubmit === 'function') {
      await onSubmit({
        ...form,
        diagnosedAt: form.isDiagnosedDateUnknown ? null : form.diagnosedAt || null,
      })
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <TextField
        id="name"
        name="name"
        label="병명 *"
        value={form.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="예) 고혈압"
        required
        error={Boolean(errors.name)}
        helperText={errors.name || ' '}
        fullWidth
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 1.25 }}>
        <TextField
          id="status"
          name="status"
          label="상태"
          select
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value)}
          fullWidth
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <TextField
          id="diagnosedAt"
          type="date"
          name="diagnosedAt"
          label="진단일"
          value={normalizeDate(form.diagnosedAt)}
          onChange={(e) => handleChange('diagnosedAt', e.target.value)}
          disabled={form.isDiagnosedDateUnknown}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160, flex: 1 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={form.isDiagnosedDateUnknown}
              onChange={(e) => handleChange('isDiagnosedDateUnknown', e.target.checked)}
            />
          }
          label="날짜 모름"
          sx={{ whiteSpace: 'nowrap' }}
        />
        <FormControlLabel
          control={<Checkbox size="small" checked={form.isCritical} onChange={(e) => handleChange('isCritical', e.target.checked)} />}
          label="중요 질병"
          sx={{ whiteSpace: 'nowrap' }}
        />
        <FormControlLabel
          control={<Checkbox size="small" checked={form.isPrivate} onChange={(e) => handleChange('isPrivate', e.target.checked)} />}
          label="비공개"
          sx={{ whiteSpace: 'nowrap' }}
        />
      </Stack>

      <TextField
        id="description"
        name="description"
        label="설명"
        value={form.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="증상이나 특이사항을 입력하세요."
        multiline
        minRows={3}
        fullWidth
      />

      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <AppButton variant="ghost" type="button" onClick={onCancel}>
          취소
        </AppButton>
        <AppButton variant="primary" type="submit" disabled={!canSubmit} loading={submitting}>
          {initialValue?.id ? '수정' : '등록'}
        </AppButton>
      </Stack>
    </Box>
  )
}

export default DiseaseForm
