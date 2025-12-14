import { Paper, Stack, Switch, Typography } from '@mui/material'
import { useUiPreferencesStore } from '@shared/stores/uiPreferencesStore'

export const AccessibilitySection = () => {
  const { accessibilityMode, toggleAccessibilityMode } = useUiPreferencesStore((state) => ({
    accessibilityMode: state.accessibilityMode,
    toggleAccessibilityMode: state.toggleAccessibilityMode,
  }))

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
            확대 모드
          </Typography>
          <Typography variant="body2" color="text.secondary">
            글자와 버튼을 더 크게 표시합니다.
          </Typography>
        </Stack>
        <Switch
          checked={accessibilityMode}
          onChange={toggleAccessibilityMode}
          inputProps={{ 'aria-label': '확대 모드' }}
          slotProps={{ input: { 'aria-label': '확대 모드' } }}
        />
      </Stack>
    </Paper>
  )
}

export default AccessibilitySection
