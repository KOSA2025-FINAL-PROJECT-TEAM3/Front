import MainLayout from '@shared/components/layout/MainLayout'
import { Divider, Paper, Stack, Typography } from '@mui/material'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'

export const TermsOfServicePage = () => {
  return (
    <MainLayout>
      <PageStack>
        <PageHeader leading={<BackButton />} title="이용약관" />

        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Divider />

            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                제1조 (목적)
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                이 약관은 [회사명]이(가) 운영하는 [서비스명] 서비스의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                제2조 (정의)
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
                <br />1. &quot;서비스&quot;라 함은 구현되는 단말기(PC, TV, 휴대형단말기 등의 각종 유무선 장치를 포함)와 상관없이 &quot;회원&quot;이 이용할 수 있는 [서비스명] 및 [서비스명] 관련 제반 서비스를 의미합니다.
                <br />2. &quot;회원&quot;이라 함은 회사의 &quot;서비스&quot;에 접속하여 이 약관에 따라 &quot;회사&quot;와 이용계약을 체결하고 &quot;회사&quot;가 제공하는 &quot;서비스&quot;를 이용하는 고객을 말합니다.
              </Typography>

              {/* ... more placeholder content ... */}
            </Stack>
          </Stack>
        </Paper>
      </PageStack>
    </MainLayout>
  )
}

export default TermsOfServicePage
