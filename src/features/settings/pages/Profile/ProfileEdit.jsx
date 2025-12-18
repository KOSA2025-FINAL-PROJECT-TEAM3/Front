import MainLayout from '@shared/components/layout/MainLayout'
import { PROFILE_EDIT_FIELDS } from '@/constants/uiConstants'
import { Button, Paper, Stack, TextField } from '@mui/material'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'

export const ProfileEditPage = () => {
  return (
    <MainLayout>
      <PageStack>
        <PageHeader leading={<BackButton />} title="프로필 편집" subtitle="연락처 정보를 최신 상태로 유지하세요." />

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }} component="form">
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
      </PageStack>
    </MainLayout>
  )
}

export default ProfileEditPage
