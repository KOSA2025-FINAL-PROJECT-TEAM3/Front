import React from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import CameraCapture from '@/features/ocr/components/CameraCapture'
import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material'
import {
  PharmacyHeader,
  MedicationCardList,
  IntakeTimePicker,
  DurationPicker,
  RegistrationInfo
} from '../components/ocr'
import { useOcrRegistration } from '../hooks/useOcrRegistration'

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
    startAnalysis,
    updateFormState,
    updateMedication,
    removeMedication,
    addMedication,
    updateIntakeTime,
    addIntakeTime,
    removeIntakeTime,
    handleRegister,
    reset
  } = useOcrRegistration()

  return (
    <MainLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', pb: 10 }}>
        {/* 에러 메시지 */}
        {error && (
          <Container maxWidth="md" sx={{ pt: 2 }}>
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
          </Container>
        )}

        {/* Step 1: 선택 화면 */}
        {step === 'select' && (
          <Container maxWidth="sm" sx={{ py: 6 }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  처방전 등록
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  처방전을 촬영하거나 앨범에서 선택해주세요.
                </Typography>
              </Box>
              <Stack spacing={2} sx={{ width: '100%', maxWidth: 420 }}>
                <Button variant="contained" color="success" size="large" onClick={() => setStep('camera')}>
                  📷 카메라 촬영
                </Button>
                <Button variant="outlined" color="success" size="large" component="label">
                  🖼️ 앨범에서 선택
                  <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
                </Button>
              </Stack>
            </Stack>
          </Container>
        )}

        {/* Step 2: 카메라 */}
        {step === 'camera' && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onCancel={() => setStep('select')}
          />
        )}

        {/* Step 3: 미리보기 */}
        {step === 'preview' && (
          <Container maxWidth="md" sx={{ py: 2 }}>
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
                <Button fullWidth variant="contained" color="success" onClick={startAnalysis} disabled={isLoading}>
                  분석 시작
                </Button>
              </Stack>
            </Stack>
          </Container>
        )}

        {/* Step 4: 분석 중 */}
        {step === 'analyzing' && (
          <Container maxWidth="sm" sx={{ py: 10 }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <CircularProgress color="success" />
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                처방전을 분석하고 있습니다...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI가 약물 정보를 추출 중입니다
              </Typography>
            </Stack>
          </Container>
        )}

        {/* Step 5: 결과 편집 (메인 UI - 이미지 1~4) */}
        {step === 'edit' && (
          <Container maxWidth="md" sx={{ py: 2 }}>
            {/* 헤더: 약국명 */}
            <PharmacyHeader
              pharmacyName={formState.pharmacyName}
              onNameChange={(name) => updateFormState({ pharmacyName: name })}
            />

            {/* 약물 목록 카드 */}
            <MedicationCardList
              medications={formState.medications}
              onUpdate={updateMedication}
              onRemove={removeMedication}
              onAdd={addMedication}
            />

            {/* 일 복용 횟수 / 시간 요약 */}
            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  일 복용 횟수 <Box component="span" sx={{ fontWeight: 900, color: 'success.main' }}>{formState.intakeTimes.length}회</Box>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formState.intakeTimes.map((t) => t.label).join(' | ')}
                </Typography>
              </Stack>
            </Paper>

            {/* 복용 기간 */}
            <DurationPicker
              startDate={formState.startDate}
              endDate={formState.endDate}
              onUpdate={updateFormState}
            />

            {/* 복용 시간 상세 설정 */}
            <IntakeTimePicker
              intakeTimes={formState.intakeTimes}
              onUpdate={updateIntakeTime}
              onAdd={addIntakeTime}
              onRemove={removeIntakeTime}
            />

            {/* 등록 정보 */}
            <RegistrationInfo
              hospitalName={formState.hospitalName}
              pharmacyName={formState.pharmacyName}
              paymentAmount={formState.paymentAmount}
              onUpdate={updateFormState}
              createdDate={new Date().toLocaleDateString('ko-KR').replace(/\./g, '.').slice(0, -1)}
            />

            {/* 하단 버튼 */}
            <Paper
              elevation={6}
              sx={{
                position: 'sticky',
                bottom: 0,
                left: 0,
                right: 0,
                mt: 2,
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
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
          </Container>
        )}

        {/* Step 6: 등록 중 */}
        {step === 'registering' && (
          <Container maxWidth="sm" sx={{ py: 10 }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <CircularProgress color="success" />
              <Typography variant="body1" sx={{ fontWeight: 800 }}>
                약물을 등록하고 있습니다...
              </Typography>
            </Stack>
          </Container>
        )}
      </Box>
    </MainLayout>
  )
}

export default PrescriptionScanPage
