import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ROUTE_PATHS } from '@config/routes.config'
import MainLayout from '@shared/components/layout/MainLayout'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import MemberProfileCard from '../components/MemberProfileCard.jsx'
import FamilyMedicationList from '../components/FamilyMedicationList.jsx'
import { useFamilyMemberDetail } from '../hooks/useFamilyMemberDetail'
import MedicationLogsTab from '../components/MedicationLogsTab.jsx'
import MedicationDetailTab from '../components/MedicationDetailTab.jsx'
import DietLogsTab from '../components/DietLogsTab.jsx'
import FamilyDiseasesTab from '../components/FamilyDiseasesTab.jsx'
import PageHeader from '@shared/components/layout/PageHeader'
import PageStack from '@shared/components/layout/PageStack'
import BackButton from '@shared/components/mui/BackButton'
import SettingsIcon from '@mui/icons-material/Settings'
import { useFamilyStore } from '../store/familyStore'
import { familyApiClient } from '@core/services/api/familyApiClient'
import AppDialog from '@shared/components/mui/AppDialog'
import logger from '@core/utils/logger'
import { useAuth } from '@features/auth/hooks/useAuth'
import { normalizeCustomerRole } from '@features/auth/utils/roleUtils'
import { USER_ROLES } from '@config/constants'
import { toast } from '@shared/components/toast/toastStore'

export const FamilyMemberDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { familyLoading, familyInitialized } = useFamilyStore((state) => ({
    familyLoading: state.loading,
    familyInitialized: state.initialized,
  }))
  const { data, isLoading, error } = useFamilyMemberDetail(id)
  const [activeTab, setActiveTab] = useState('medications')
  const familyGroups = useFamilyStore((state) => state.familyGroups) || []
  const currentUserId = useAuth((state) => state.user?.id || state.user?.userId)
  const customerRole = useAuth((state) => state.customerRole)
  const roleKey = normalizeCustomerRole(customerRole) || USER_ROLES.SENIOR
  const isCaregiver = roleKey === USER_ROLES.CAREGIVER

  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    kakaoEnabled: true,
    dietWarningEnabled: true,
    medicationMissedEnabled: true,
  })
  const [notificationLoading, setNotificationLoading] = useState(false)

  const member = data?.member
  const medications = data?.medications ?? []
  const targetUserId = member?.userId ? Number(member.userId) : null
  const pageLoading = familyLoading || !familyInitialized || isLoading

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam && ['medications', 'medication-logs', 'logs', 'diseases', 'detail'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // Optional: Update URL without reload to reflect tab change
    const newUrl = new URL(window.location)
    newUrl.searchParams.set('tab', tab)
    window.history.pushState({}, '', newUrl)
  }

  const familyGroupId = familyGroups.find((group) =>
    (group?.members || []).some((m) => String(m?.id) === String(id)),
  )?.id

  const canManageMemberNotifications = Boolean(
    isCaregiver && familyGroupId && member?.userId && currentUserId && String(member.userId) !== String(currentUserId),
  )

  const handleOpenNotificationSettings = async () => {
    if (!familyGroupId || !member?.userId) return
    setShowNotificationModal(true)
    setNotificationLoading(true)
    try {
      const settings = await familyApiClient.getMemberNotificationSettings(familyGroupId, member.userId)
      if (settings) {
        setNotificationSettings((prev) => ({
          ...prev,
          kakaoEnabled: settings.kakaoEnabled ?? prev.kakaoEnabled,
          dietWarningEnabled: settings.dietWarningEnabled ?? prev.dietWarningEnabled,
          medicationMissedEnabled: settings.medicationMissedEnabled ?? prev.medicationMissedEnabled,
        }))
      }
    } catch (e) {
      logger.warn('가족 구성원 알림 설정 로드 실패', e)
      toast.error('알림 설정을 불러오지 못했습니다.')
    } finally {
      setNotificationLoading(false)
    }
  }

  const handleSaveNotificationSettings = async () => {
    if (!familyGroupId || !member?.userId) return
    setNotificationLoading(true)
    try {
      await familyApiClient.updateMemberNotificationSettings(familyGroupId, member.userId, {
        familyGroupId,
        targetUserId: member.userId,
        ...notificationSettings,
      })
      toast.success('알림 설정이 저장되었습니다.')
      setShowNotificationModal(false)
    } catch (e) {
      logger.warn('가족 구성원 알림 설정 저장 실패', e)
      toast.error('알림 설정 저장에 실패했습니다.')
    } finally {
      setNotificationLoading(false)
    }
  }

  return (
    <MainLayout>
      <PageStack>
        {showNotificationModal ? (
          <AppDialog
            isOpen={showNotificationModal}
            title="가족 알림 설정"
            onClose={() => setShowNotificationModal(false)}
            footer={
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button type="button" variant="outlined" onClick={() => setShowNotificationModal(false)}>
                  취소
                </Button>
                <Button type="button" variant="contained" onClick={handleSaveNotificationSettings} disabled={notificationLoading}>
                  {notificationLoading ? '저장 중...' : '저장'}
                </Button>
              </Stack>
            }
          >
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                이 가족 그룹에서 발생하는 알림을 앱/외부 채널로 받을지 설정합니다.
              </Typography>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    채널
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.kakaoEnabled}
                        onChange={(e) => setNotificationSettings((prev) => ({ ...prev, kakaoEnabled: e.target.checked }))}
                      />
                    }
                    label="카카오톡 알림"
                  />
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    알림 종류
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.dietWarningEnabled}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({ ...prev, dietWarningEnabled: e.target.checked }))
                        }
                      />
                    }
                    label="식단 경고 알림"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.medicationMissedEnabled}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({ ...prev, medicationMissedEnabled: e.target.checked }))
                        }
                      />
                    }
                    label="미복용 알림"
                  />
                </Stack>
              </Paper>
            </Stack>
          </AppDialog>
        ) : null}

        <PageHeader
          title="구성원 상세"
          leading={<BackButton onClick={() => navigate(ROUTE_PATHS.family)} label="가족" />}
          right={
            canManageMemberNotifications ? (
              <IconButton aria-label="알림 설정" onClick={handleOpenNotificationSettings}>
                <SettingsIcon />
              </IconButton>
            ) : null
          }
        />

        {pageLoading && (
          <Paper variant="outlined" sx={{ p: 4 }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                구성원 정보를 불러오는 중입니다...
              </Typography>
            </Stack>
          </Paper>
        )}
        {!pageLoading && error ? (
          <Alert severity="error">구성원 정보를 불러오지 못했습니다. 다시 시도해 주세요.</Alert>
        ) : null}
        {!pageLoading && !error && !member ? <Alert severity="warning">구성원을 찾을 수 없습니다.</Alert> : null}

        {!pageLoading && member && (
          <>
            <MemberProfileCard member={member} />

            <Paper variant="outlined">
              <Tabs
                value={activeTab}
                onChange={(_, nextValue) => handleTabChange(nextValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="약 목록" value="medications" />
                <Tab label="복약 기록" value="medication-logs" />
                <Tab label="식단 기록" value="logs" />
                <Tab label="질병" value="diseases" />
                <Tab label="상세 정보" value="detail" />
              </Tabs>
              <Box sx={{ p: 2 }}>
                {activeTab === 'medications' && (
                  <FamilyMedicationList medications={medications} />
                )}
                {activeTab === 'medication-logs' && (
                  targetUserId ? (
                    <MedicationLogsTab userId={targetUserId} />
                  ) : (
                    <Alert severity="warning">사용자 정보를 찾을 수 없습니다.</Alert>
                  )
                )}
                {activeTab === 'logs' && (
                  targetUserId ? (
                    <DietLogsTab userId={targetUserId} />
                  ) : (
                    <Alert severity="warning">사용자 정보를 찾을 수 없습니다.</Alert>
                  )
                )}
                {activeTab === 'diseases' && (
                  targetUserId ? (
                    <FamilyDiseasesTab userId={targetUserId} />
                  ) : (
                    <Alert severity="warning">사용자 정보를 찾을 수 없습니다.</Alert>
                  )
                )}
                {activeTab === 'detail' && (
                  targetUserId ? (
                    <MedicationDetailTab userId={targetUserId} medications={medications} />
                  ) : (
                    <Alert severity="warning">사용자 정보를 찾을 수 없습니다.</Alert>
                  )
                )}
              </Box>
            </Paper>

          </>
        )}
      </PageStack>
    </MainLayout>
  )
}

export default FamilyMemberDetailPage
