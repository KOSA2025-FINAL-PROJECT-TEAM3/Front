import React, { useEffect, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import CameraCapture from '../components/CameraCapture'
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography, Fade } from '@mui/material'
import RestoreIcon from '@mui/icons-material/Restore'
import PersonIcon from '@mui/icons-material/Person'
import {
  PharmacyHeader,
  MedicationCardList,
  IntakeTimePicker,
  DurationPicker,
  RegistrationInfo
} from '../components'
import { useOcrRegistration } from '../hooks/useOcrRegistration'
import PageHeader from '@shared/components/layout/PageHeader'
import PageStack from '@shared/components/layout/PageStack'
import BackButton from '@shared/components/mui/BackButton'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from '@shared/components/toast/toastStore'
import { ROUTE_PATHS } from '@core/config/routes.config'
import { fromOCRResponse } from '@/types/ocr.types'
import { useAuthStore } from '@features/auth/store/authStore'
import { ocrApiClient } from '@core/services/api/ocrApiClient'

/**
 * 처방전 스캔 및 약물 등록 페이지
 *
 * 플로우:
 * 1. select: 카메라/앨범 선택
 * 2. camera: 카메라 촬영
 * 3. preview: 이미지 미리보기
 * 4. analyzing: OCR 분석 중
 * 5. edit: 결과 확인 및 수정 (이미지 1~4 UI)
 * 6. registering: 등록 중
 */
const PrescriptionScanPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const userId = user?.id || user?.userId

  // 보호자가 어르신을 위해 등록하는 경우
  const targetUserId = location.state?.targetUserId
  const targetUserName = location.state?.targetUserName
  const isProxyRegistration = !!targetUserId && !!targetUserName

  const {
    // 상태
    step,
    previewUrl,
    formState,
    isLoading,
    error,

    // 액션
    setStep,
    handleFileSelect,
    handleCameraCapture,

    startAnalysisAsync,
    updateFormState,
    updateMedication,
    removeMedication,
    addMedication,
    updateIntakeTime,
    addIntakeTime,
    removeIntakeTime,
    handleRegister,
    reset
  } = useOcrRegistration({ targetUserId })

  const [cachedJobId, setCachedJobId] = useState(null)
  const [isRestoring, setIsRestoring] = useState(false)

  // 컴포넌트 마운트 시 캐시된 jobId 확인
  useEffect(() => {
    if (!userId) return

    try {
      const key = `ocr_result_${userId}`
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved)
        // 24시간 이내의 데이터만 유효하고, 사용자 ID가 일치해야 함
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000 && String(parsed.userId) === String(userId)) {
          setCachedJobId(parsed.jobId)
        } else {
          localStorage.removeItem(key)
        }
      }
    } catch {
      // ignore
    }
  }, [userId])

  const handleLoadCachedResult = async () => {
    if (!cachedJobId) return

    setIsRestoring(true)
    try {
      toast.info('서버에서 이전 분석 결과를 불러오는 중입니다...')
      const response = await ocrApiClient.getScanJob(cachedJobId)
      const data = (response && response.data) ? response.data : response

      if (data && data.status === 'DONE' && data.result?.medications) {
        const result = data.result
        const medications = fromOCRResponse(result.medications)

        navigate(ROUTE_PATHS.prescriptionAdd, {
          state: {
            ocrData: {
              medications,
              hospitalName: result.hospitalName || result.clinicName || '',
              pharmacyName: result.pharmacyName || '',
              startDate: result.prescribedDate || new Date().toISOString().split('T')[0]
            },
            targetUserId: targetUserId || undefined,
            targetUserName: targetUserName || undefined
          }
        })
        toast.success('이전 분석 결과를 성공적으로 불러왔습니다.')
      } else {
        throw new Error('데이터가 만료되었거나 찾을 수 없습니다.')
      }
    } catch (e) {
      console.error('OCR 복구 실패:', e)
      toast.error('이전 결과를 불러오지 못했습니다. 다시 스캔해주세요.')
      localStorage.removeItem(`ocr_result_${userId}`)
      setCachedJobId(null)
    } finally {
      setIsRestoring(false)
    }
  }

  const handleAsyncScan = () => {
    // 1. 분석 시작 알림 즉시 표시 (서버 응답 기다리지 않음)
    toast.success('처방전 분석이 시작되었습니다. 다른 작업을 하셔도 됩니다.')

    // 2. 즉시 메인 화면으로 이동
    navigate(ROUTE_PATHS.root)

    // 3. API 호출은 백그라운드에서 실행 (await 하지 않음)
    startAnalysisAsync()
  }

  const handleBack = () => {
    if (step !== 'select') {
      setStep('select')
      return
    }
    navigate(-1)
  }

  return (
    <MainLayout showBottomNav={false} fullScreen={step === 'camera'}>
      {step === 'camera' ? (
        <CameraCapture onCapture={handleCameraCapture} onCancel={() => setStep('select')} />
      ) : (
        <PageStack>
          <PageHeader
            title="처방전 등록"
            subtitle="처방전을 촬영하거나 앨범에서 선택해 등록할 수 있어요."
            leading={<BackButton onClick={handleBack} />}
          />

          {/* 대리 등록 배너 */}
          {isProxyRegistration && (
            <Alert
              severity="info"
              icon={<PersonIcon />}
              sx={{
                fontWeight: 700,
                bgcolor: '#EEF2FF',
                color: '#4F46E5',
                border: '1px solid #C7D2FE',
                '& .MuiAlert-icon': { color: '#6366F1' }
              }}
            >
              <strong>{targetUserName}</strong> 님의 처방전을 등록합니다
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => reset()}>
                  다시 시도
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {step === 'select' && (
            <Stack spacing={3} alignItems="center" textAlign="center" sx={{ py: { xs: 3, md: 5 } }}>
              <Stack spacing={2} sx={{ width: '100%', maxWidth: 420 }}>
                {cachedJobId && (
                  <Fade in={true}>
                    <Button
                      variant="contained"
                      color="warning"
                      size="large"
                      startIcon={isRestoring ? <CircularProgress size={20} color="inherit" /> : <RestoreIcon />}
                      onClick={handleLoadCachedResult}
                      disabled={isRestoring}
                      sx={{ mb: 2, fontWeight: 'bold' }}
                    >
                      {isRestoring ? '불러오는 중...' : '방금 분석한 결과 불러오기'}
                    </Button>
                  </Fade>
                )}
                <Button variant="contained" color="success" size="large" onClick={() => setStep('camera')}>
                  📷 카메라 촬영
                </Button>
                <Button variant="outlined" color="success" size="large" component="label">
                  🖼️ 앨범에서 선택
                  <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
                </Button>
              </Stack>
            </Stack>
          )}

          {step === 'preview' && (
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 900, textAlign: 'center' }}>
                이미지 확인
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: '60vh',
                    objectFit: 'contain',
                    borderRadius: 2,
                  }}
                />
              </Paper>
              <Stack direction="row" spacing={1.5}>
                <Button fullWidth variant="outlined" onClick={() => setStep('select')}>
                  다시 선택
                </Button>
                <Button fullWidth variant="contained" color="success" onClick={handleAsyncScan} disabled={isLoading}>
                  분석 시작
                </Button>
              </Stack>
            </Stack>
          )}

          {step === 'analyzing' && (
            <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: { xs: 7, md: 9 } }}>
              <CircularProgress color="success" />
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                처방전을 분석하고 있습니다...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI가 약물 정보를 추출 중입니다
              </Typography>
            </Stack>
          )}

          {step === 'edit' && (
            <Box>
              <PharmacyHeader
                pharmacyName={formState.pharmacyName}
                onNameChange={(name) => updateFormState({ pharmacyName: name })}
              />

              <MedicationCardList
                medications={formState.medications}
                onUpdate={updateMedication}
                onRemove={removeMedication}
                onAdd={addMedication}
              />

              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    일 복용 횟수{' '}
                    <Box component="span" sx={{ fontWeight: 900, color: 'success.main' }}>
                      {formState.intakeTimes.length}회
                    </Box>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formState.intakeTimes.map((t) => t.label).join(' | ')}
                  </Typography>
                </Stack>
              </Paper>

              <DurationPicker startDate={formState.startDate} endDate={formState.endDate} onUpdate={updateFormState} />

              <IntakeTimePicker
                intakeTimes={formState.intakeTimes}
                onUpdate={updateIntakeTime}
                onAdd={addIntakeTime}
                onRemove={removeIntakeTime}
              />

              <RegistrationInfo
                hospitalName={formState.hospitalName}
                pharmacyName={formState.pharmacyName}
                paymentAmount={formState.paymentAmount}
                onUpdate={updateFormState}
                createdDate={new Date().toLocaleDateString('ko-KR').replace(/\./g, '.').slice(0, -1)}
              />

              <Paper
                elevation={6}
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  mt: 2,
                  p: 2,
                  pb: 'calc(var(--safe-area-bottom) + 16px)',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <Stack direction="row" spacing={1.5}>
                  <Button fullWidth variant="outlined" onClick={() => setStep('select')}>
                    다시 촬영
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={handleRegister}
                    disabled={isLoading || formState.medications.length === 0}
                  >
                    {isLoading ? '등록 중...' : '등록 완료'}
                  </Button>
                </Stack>
              </Paper>
            </Box>
          )}

          {step === 'registering' && (
            <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: { xs: 7, md: 9 } }}>
              <CircularProgress color="success" />
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                약물을 등록하고 있습니다...
              </Typography>
            </Stack>
          )}
        </PageStack>
      )}
    </MainLayout>
  )
}

export default PrescriptionScanPage
