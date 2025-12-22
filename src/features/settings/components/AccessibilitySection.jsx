import { Box, IconButton, Paper, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useUiPreferencesStore } from '@shared/stores/uiPreferencesStore'

export const AccessibilitySection = () => {
  const { fontScaleLevel, increaseFontScaleLevel, decreaseFontScaleLevel } = useUiPreferencesStore((state) => ({
    fontScaleLevel: state.fontScaleLevel,
    increaseFontScaleLevel: state.increaseFontScaleLevel,
    decreaseFontScaleLevel: state.decreaseFontScaleLevel,
  }))

  const label = fontScaleLevel === 1 ? '표준' : fontScaleLevel === 2 ? '크게' : '더크게'

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={700}>
            글자 크기
          </Typography>
          <Typography variant="body2" color="text.secondary">
            표준/크게/더크게 3단계로 조절합니다.
          </Typography>
        </Stack>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: '#F1F5F9',
            borderRadius: 999,
            border: '1px solid',
            borderColor: 'divider',
            p: 0.5,
            boxShadow: '0 2px 10px -4px rgba(0,0,0,0.05)',
          }}
        >
          <IconButton
            onClick={decreaseFontScaleLevel}
            disabled={fontScaleLevel <= 1}
            aria-label="글자 작게"
            sx={{ bgcolor: 'common.white', border: '1px solid', borderColor: 'divider' }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Box sx={{ width: 56, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, color: 'text.secondary', lineHeight: 1.2 }}>
              {label}
            </Typography>
          </Box>
          <IconButton
            onClick={increaseFontScaleLevel}
            disabled={fontScaleLevel >= 3}
            aria-label="글자 크게"
            sx={{ bgcolor: 'common.white', border: '1px solid', borderColor: 'divider' }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>
    </Paper>
  )
}

export default AccessibilitySection
