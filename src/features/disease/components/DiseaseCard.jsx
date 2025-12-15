import AppButton from '@shared/components/mui/AppButton'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'

const STATUS_LABEL = {
  ACTIVE: '치료 중',
  CURED: '완치',
  CHRONIC: '만성',
}

const formatDate = (value) => {
  if (!value) return '날짜 모름'
  try {
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}

export const DiseaseCard = ({ disease, onSelect, onDelete, onEdit }) => {
  const handleSelect = () => {
    if (typeof onSelect === 'function') {
      onSelect(disease)
    }
  }

  const handleDelete = (event) => {
    event.stopPropagation()
    if (typeof onDelete === 'function') {
      onDelete(disease)
    }
  }

  const handleEdit = (event) => {
    event.stopPropagation()
    if (typeof onEdit === 'function') {
      onEdit(disease)
    }
  }

  return (
    <Paper
      variant="outlined"
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleSelect()
        }
      }}
      sx={{
        p: 2,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': { borderColor: 'primary.200', boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)' },
        borderColor: disease?.isCritical ? 'error.200' : 'divider',
        boxShadow: disease?.isCritical ? '0 6px 20px rgba(248, 113, 113, 0.18)' : 'none',
      }}
    >
      <Stack spacing={0.75}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
            {disease?.name}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {disease?.isCritical ? (
              <Chip
                label="중요"
                size="small"
                sx={{ bgcolor: 'error.100', color: 'error.dark', border: '1px solid', borderColor: 'error.200', fontWeight: 900 }}
              />
            ) : null}
            {disease?.isPrivate ? (
              <Chip
                label="비공개"
                size="small"
                sx={{ bgcolor: 'grey.200', color: 'text.primary', border: '1px solid', borderColor: 'grey.300', fontWeight: 900 }}
              />
            ) : null}
            {disease?.status ? (
              <Chip
                label={STATUS_LABEL[disease.status] ?? disease.status}
                size="small"
                sx={{ bgcolor: 'primary.50', color: 'primary.dark', border: '1px solid', borderColor: 'primary.100', fontWeight: 900 }}
              />
            ) : null}
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          진단일: {disease?.isDiagnosedDateUnknown ? '날짜 모름' : formatDate(disease?.diagnosedAt)}
        </Typography>
      </Stack>

      <Box>
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {disease?.description || '메모가 없습니다.'}
        </Typography>
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography variant="caption" color="text.secondary" noWrap>
          최근 업데이트: {formatDate(disease?.updatedAt || disease?.createdAt)}
        </Typography>
        <Stack direction="row" spacing={1}>
          {disease?.canEdit ? (
            <AppButton variant="secondary" size="sm" onClick={handleEdit}>
              수정
            </AppButton>
          ) : null}
          <AppButton variant="ghost" size="sm" onClick={handleDelete}>
            삭제
          </AppButton>
          <AppButton variant="primary" size="sm" onClick={handleSelect}>
            상세
          </AppButton>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default DiseaseCard
