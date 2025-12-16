import MainLayout from '@shared/components/layout/MainLayout'
import { PROFILE_EDIT_FIELDS } from '@/constants/uiConstants'
import { Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material'

export const ProfileEditPage = () => {
  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            프로필 편집
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            연락처 정보를 최신 상태로 유지하세요.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }} component="form">
          <Stack spacing={2}>
            {PROFILE_EDIT_FIELDS.map((field) => (
              <TextField
                key={field.id}
                id={field.id}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                InputProps={{ readOnly: field.readOnly }}
                fullWidth
              />
            ))}

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button type="button" variant="outlined" color="inherit">
                취소
              </Button>
              <Button type="submit" variant="contained">
                저장
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </MainLayout>
  )
}

export default ProfileEditPage
