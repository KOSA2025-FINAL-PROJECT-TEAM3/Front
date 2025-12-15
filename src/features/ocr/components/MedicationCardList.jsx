import React from 'react'
import MedicationCard from './MedicationCard'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'

/**
 * 약물 카드 리스트 컴포넌트 (이미지 1, 3 참고)
 *
 * @param {Object} props
 * @param {EditableMedication[]} props.medications - 약물 목록
 * @param {(id: string, updates: object) => void} props.onUpdate - 업데이트 핸들러
 * @param {(id: string) => void} props.onRemove - 삭제 핸들러
 * @param {() => void} props.onAdd - 추가 핸들러
 * @param {boolean} [props.editable=true] - 편집 가능 여부
 */
const MedicationCardList = ({
  medications,
  onUpdate,
  onRemove,
  onAdd,
  editable = true
}) => {
  if (!medications || medications.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="body2" color="text.secondary">
          인식된 약 정보가 없습니다.
        </Typography>
        {editable ? (
          <Button variant="outlined" sx={{ mt: 2, borderStyle: 'dashed', fontWeight: 900 }} onClick={onAdd}>
            + 약 추가
          </Button>
        ) : null}
      </Paper>
    )
  }

  return (
    <Box sx={{ px: { xs: 0, md: 2.5 } }}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={2} sx={{ mb: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
          처방약{' '}
          <Box component="span" sx={{ color: 'success.main', fontWeight: 900 }}>
            {medications.length}개
          </Box>
        </Typography>
        <Stack direction="row" spacing={2} sx={{ color: 'text.disabled', fontSize: 12 }}>
          <Box component="span" sx={{ minWidth: 40, textAlign: 'center' }}>
            복용량
          </Box>
          <Box component="span" sx={{ minWidth: 40, textAlign: 'center' }}>
            횟수
          </Box>
          <Box component="span" sx={{ minWidth: 40, textAlign: 'center' }}>
            일수
          </Box>
        </Stack>
      </Stack>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {medications.map((medication) => (
          <MedicationCard
            key={medication.id}
            medication={medication}
            onUpdate={onUpdate}
            onRemove={onRemove}
            editable={editable}
          />
        ))}
      </Stack>

      {/* 약 추가 버튼 */}
      {editable ? (
        <Button
          fullWidth
          variant="outlined"
          onClick={onAdd}
          sx={{ py: 1.75, borderStyle: 'dashed', borderRadius: 3, fontWeight: 900 }}
        >
          + 약 추가
        </Button>
      ) : null}
    </Box>
  )
}

export default MedicationCardList
