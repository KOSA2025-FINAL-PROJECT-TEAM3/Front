import React from 'react'
import { Box, Button, Divider, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

/**
 * 개별 약물 카드 컴포넌트 (이미지 1, 3 참고)
 *
 * @param {Object} props
 * @param {EditableMedication} props.medication - 약물 정보
 * @param {(id: string, updates: Partial<EditableMedication>) => void} props.onUpdate - 업데이트 핸들러
 * @param {(id: string) => void} props.onRemove - 삭제 핸들러
 * @param {boolean} [props.editable=true] - 편집 가능 여부
 * @param {boolean} [props.showDetail=false] - 상세 정보 표시 여부
 */
const MedicationCard = ({
  medication,
  onUpdate,
  onRemove,
  editable = true,
}) => {
  const handleChange = (field, value) => {
    onUpdate(medication.id, { [field]: value })
  }

  return (
    <Paper sx={{ p: 2, borderRadius: 3, mb: 1.5, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
        <Paper
          variant="outlined"
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {medication.imageUrl ? (
            <Box component="img" src={medication.imageUrl} alt={medication.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Box aria-hidden sx={{ fontSize: 32, userSelect: 'none' }}>
              💊
            </Box>
          )}
        </Paper>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {editable ? (
            <Stack spacing={1}>
              <TextField
                size="small"
                value={medication.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="약 이름"
                fullWidth
              />
              <TextField
                size="small"
                value={medication.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="분류 (예: 제산제)"
                fullWidth
              />
            </Stack>
          ) : (
            <Stack spacing={0.5}>
              <Typography sx={{ fontWeight: 900 }}>{medication.name}</Typography>
              {medication.category ? (
                <Typography variant="body2" color="text.secondary">
                  {medication.category}
                </Typography>
              ) : null}
            </Stack>
          )}
        </Box>

        {editable ? (
          <IconButton size="small" disabled aria-label="상세">
            <ChevronRightIcon />
          </IconButton>
        ) : null}
      </Stack>

      <Paper variant="outlined" sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 1.5, mb: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-around" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            {editable ? (
              <TextField
                type="number"
                size="small"
                value={medication.dosageAmount}
                inputProps={{ min: 1 }}
                onChange={(e) => handleChange('dosageAmount', parseInt(e.target.value) || 1)}
                sx={{ width: 80 }}
              />
            ) : (
              <Typography sx={{ fontWeight: 900 }}>{medication.dosageAmount}</Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              정씩
            </Typography>
          </Stack>

          <Divider orientation="vertical" flexItem />

          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography variant="caption" color="text.secondary">
              하루
            </Typography>
            {editable ? (
              <TextField
                type="number"
                size="small"
                value={medication.dailyFrequency}
                inputProps={{ min: 1, max: 10 }}
                onChange={(e) => handleChange('dailyFrequency', parseInt(e.target.value) || 1)}
                sx={{ width: 80 }}
              />
            ) : (
              <Typography sx={{ fontWeight: 900 }}>{medication.dailyFrequency}</Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              회
            </Typography>
          </Stack>

          <Divider orientation="vertical" flexItem />

          <Stack direction="row" alignItems="center" spacing={0.75}>
            {editable ? (
              <TextField
                type="number"
                size="small"
                value={medication.durationDays}
                inputProps={{ min: 1 }}
                onChange={(e) => handleChange('durationDays', parseInt(e.target.value) || 1)}
                sx={{ width: 80 }}
              />
            ) : (
              <Typography sx={{ fontWeight: 900 }}>{medication.durationDays}</Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              일분
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {editable ? (
        <Button fullWidth color="error" variant="outlined" onClick={() => onRemove(medication.id)} sx={{ fontWeight: 900 }}>
          삭제
        </Button>
      ) : null}
    </Paper>
  )
}

export default MedicationCard
