import MedicationForm from './MedicationForm.jsx'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const formatDate = (value) => {
  if (!value) return '정보 없음'
  try {
    return new Date(value).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export const MedicationDetailModal = ({
  medication,
  loading,
  onClose,
  onToggle,
  onRemove,
  onSubmit,
}) => {
  const open = Boolean(medication)
  if (!open) return null

  const handleUpdate = async (values) => {
    await onSubmit?.(medication.id, values)
  }

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          onClose?.()
        }
      }}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 4, bgcolor: 'grey.50' } }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
              {medication.updatedAt ? '최근 수정' : '등록일'} · {formatDate(medication.updatedAt || medication.createdAt)}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, mt: 0.5 }}>
              {medication.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {medication.dosage || '용량 정보 없음'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={medication.active ? '복용 중' : '일시중지'}
              size="small"
              color={medication.active ? 'success' : 'default'}
              sx={{ fontWeight: 900 }}
            />
            <IconButton onClick={() => onClose?.()} aria-label="닫기">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
              복용 일정
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {medication.schedule || '미입력'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>
              주의사항
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
              {medication.instructions || '미입력'}
            </Typography>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1.5 }}>
            정보 수정
          </Typography>
          <MedicationForm
            initialValues={medication}
            onSubmit={handleUpdate}
            loading={loading}
            shouldResetOnSubmit={false}
            submitLabel="변경 저장"
            onCancel={onClose}
          />
        </Paper>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          type="button"
          variant="outlined"
          onClick={() => onToggle?.(medication.id)}
          disabled={loading}
          sx={{ fontWeight: 900 }}
        >
          {medication.active ? '일시중지' : '복용 재개'}
        </Button>
        <Button
          type="button"
          color="error"
          variant="contained"
          onClick={() => onRemove?.(medication.id)}
          disabled={loading || medication.hasLogsToday}
          title={medication.hasLogsToday ? '오늘 복용 기록이 있어 삭제할 수 없습니다.' : ''}
          sx={{ fontWeight: 900 }}
        >
          약 삭제
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MedicationDetailModal
