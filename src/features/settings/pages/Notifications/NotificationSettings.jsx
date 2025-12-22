import { useEffect, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import { Box, Button, Paper, Stack, Switch, Typography } from '@mui/material'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'
import { notificationSettingsApiClient } from '@core/services/api/notificationSettingsApiClient'
import { toast } from '@shared/components/toast/toastStore'

const defaultSettings = {
  push: true,
  kakaoDeepLink: true,
  dietWarning: true,
  medicationMissed: true,
}

export const NotificationSettingsPage = () => {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(false)

  const loadSettings = async () => {
    try {
      setLoading(true)
      const resp = await notificationSettingsApiClient.getUserSettings()
      if (resp) {
        setSettings((prev) => ({
          ...prev,
          push: resp.pushEnabled ?? prev.push,
          kakaoDeepLink: resp.kakaoDeeplinkEnabled ?? prev.kakaoDeepLink,
          dietWarning: resp.dietWarningEnabled ?? prev.dietWarning,
          medicationMissed: resp.medicationMissedEnabled ?? prev.medicationMissed,
        }))
      }
    } catch (e) {
      console.error('알림 설정 불러오기 실패', e)
      toast.error('알림 설정을 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])
  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  const save = async () => {
    try {
      setLoading(true)
      await notificationSettingsApiClient.updateUserSettings({
        pushEnabled: settings.push,
        kakaoDeeplinkEnabled: settings.kakaoDeepLink,
        dietWarningEnabled: settings.dietWarning,
        medicationMissedEnabled: settings.medicationMissed,
      })
      toast.success('알림 설정이 저장되었습니다')
    } catch (e) {
      console.error('알림 설정 저장 실패', e)
      toast.error('알림 설정 저장에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <PageStack>
        <PageHeader
          leading={<BackButton />}
          title="알림 설정"
          subtitle="받고 싶은 알림과 채널을 선택하세요."
          right={
            <Button variant="contained" onClick={save} disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </Button>
          }
        />

        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
              채널
            </Typography>
            <Stack spacing={1}>
              {[
                { id: 'push', label: '푸시 알림', description: '앱 푸시로 알림 받기' },
                { id: 'kakaoDeepLink', label: '카카오 딥링크', description: '카카오톡으로 딥링크 알림 받기' },
              ].map((channel) => (
                <Stack
                  key={channel.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {channel.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {channel.description}
                    </Typography>
                  </Box>
                  <Switch checked={!!settings[channel.id]} onChange={() => toggle(channel.id)} />
                </Stack>
              ))}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
              알림 종류
            </Typography>
            <Stack spacing={1}>
              {[
                { id: 'dietWarning', label: '식단 경고 알림', description: '식단 WARNING/DANGER 발생 시 알림/메시지' },
                { id: 'medicationMissed', label: '미복용 알림', description: '복약 누락/지연 알림' },
              ].map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                  <Switch checked={!!settings[item.id]} onChange={() => toggle(item.id)} />
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </PageStack>
    </MainLayout>
  )
}

export default NotificationSettingsPage
