import AppButton from '@shared/components/mui/AppButton'
import { Box, Paper, Stack, Typography } from '@mui/material'

const formatDate = (value) => {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    )
  } catch {
    return value
  }
}

export const DiseaseTrash = ({ items = [], loading, onEmptyTrash, onRestore }) => {
  return (
    <Paper variant="outlined" sx={{ mt: 2.5, borderRadius: 3, p: 2, bgcolor: 'grey.50' }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            휴지통
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            삭제된 질병은 여기서 관리됩니다.
          </Typography>
        </Box>
        <AppButton variant="danger" size="sm" onClick={onEmptyTrash} disabled={loading || !items.length}>
          휴지통 비우기
        </AppButton>
      </Stack>

      {loading ? (
        <Typography variant="body2" color="text.secondary">
          휴지통을 불러오는 중입니다...
        </Typography>
      ) : null}

      {!loading && !items.length ? (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, p: 2, textAlign: 'center', bgcolor: 'common.white', borderStyle: 'dashed', color: 'text.secondary' }}
        >
          휴지통이 비어 있습니다.
        </Paper>
      ) : null}

      {!loading && items.length > 0 ? (
        <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {items.map((item) => (
            <Paper key={item.id} component="li" variant="outlined" sx={{ borderRadius: 2.5, p: 1.5, bgcolor: 'common.white' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Typography sx={{ fontWeight: 900 }}>{item.name}</Typography>
                {item.isCritical ? (
                  <Box
                    sx={{
                      bgcolor: 'error.100',
                      color: 'error.dark',
                      border: '1px solid',
                      borderColor: 'error.200',
                      px: 1,
                      py: 0.25,
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    중요
                  </Box>
                ) : null}
              </Stack>

              <Stack direction="row" spacing={1.25} sx={{ mt: 0.75, color: 'text.secondary', fontSize: 12, flexWrap: 'wrap' }}>
                <Box component="span">삭제 시각: {formatDate(item.deletedAt)}</Box>
                {item.status ? (
                  <Box
                    component="span"
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 999,
                      border: '1px solid',
                      borderColor: 'primary.100',
                      bgcolor: 'primary.50',
                      color: 'primary.dark',
                      fontWeight: 800,
                    }}
                  >
                    {item.status}
                  </Box>
                ) : null}
              </Stack>

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                <AppButton size="sm" variant="secondary" onClick={() => onRestore(item.id)}>
                  복원
                </AppButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      ) : null}
    </Paper>
  )
}

export default DiseaseTrash
