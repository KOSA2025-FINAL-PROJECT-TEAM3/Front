import logger from '@core/utils/logger'
/**
 * 약 등록 페이지
 * @page 08-medication-add
 * @component MedicationAddPage
 */

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { MedicationForm } from '@features/medication/components/MedicationForm'
import { BackButton } from '@shared/components/mui/BackButton'
import { useVoiceActionStore } from '@/features/voice/stores/voiceActionStore'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'
import { ROUTE_PATHS } from '@config/routes.config'
import { Paper, Alert, Box, Typography } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import PageHeader from '@shared/components/layout/PageHeader'
import PageStack from '@shared/components/layout/PageStack'
import { prescriptionApiClient } from '@core/services/api/prescriptionApiClient'

/**
 * 약 등록 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const MedicationAddPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  // Navigation State에서 대상자 정보 확인
  const { addDrug, targetUserId, targetUserName } = location.state || {}

  const { consumeAction } = useVoiceActionStore()
  const [initialValues, setInitialValues] = useState(null)

  useEffect(() => {
    if (addDrug) {
      setInitialValues({
        name: addDrug.itemName,
        ingredient: addDrug.evalItemName || '',
        // AI 검색 결과 매핑 등 추가 가능
      })
    }

    const action = consumeAction('AUTO_FILL_REGISTER')
    if (action && action.params?.medicationName) {
      setInitialValues((prev) => ({
        ...prev,
        name: action.params.medicationName
      }))
      toast.info(`'${action.params.medicationName}' 정보를 자동으로 입력했습니다.`)
    }
  }, [consumeAction, addDrug])

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      // 1. Payload Construction (Logic from MedicationEntryModal)
      const uniqueIntakeTimes = [...new Set((formData.schedules || []).map(s => s.time))].sort()

      const medicationPayload = {
        medicationName: formData.name,
        ingredient: formData.ingredient,
        dosage: formData.dosage,
        quantity: formData.quantity ? Number(formData.quantity) : null,
        remaining: formData.remaining ? Number(formData.remaining) : null,
        expiryDate: formData.expiryDate,
      }

      // 요일 처리 (일괄 적용 로직)
      const allDays = (formData.schedules || []).map(s => s.daysOfWeek)
      const firstDaySet = allDays[0]
      const isUniform = allDays.every(d => d === firstDaySet)
      if (isUniform && firstDaySet) {
        medicationPayload.daysOfWeek = firstDaySet
      }

      // Calculate endDate if missing (Default 30 days)
      let endDate = formData.endDate
      if (!endDate && formData.startDate) {
        const start = new Date(formData.startDate)
        const end = new Date(start)
        end.setDate(start.getDate() + 30) // Default 30 days
        endDate = end.toISOString().split('T')[0]
      } else if (!endDate) {
        // Fallback if both missing
        const today = new Date()
        const end = new Date(today)
        end.setDate(today.getDate() + 30)
        endDate = end.toISOString().split('T')[0]
      }

      const prescriptionPayload = {
        pharmacyName: '직접 등록',
        hospitalName: '직접 등록',
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: endDate,
        intakeTimes: uniqueIntakeTimes,
        medications: [medicationPayload],
        notes: formData.notes,
      }

      // 2. API Call with targetUserId
      await prescriptionApiClient.createPrescription(prescriptionPayload, targetUserId)

      toast.success(targetUserName ? `${targetUserName} 님의 약이 등록되었습니다` : '약이 등록되었습니다')
      navigate(ROUTE_PATHS.medication, { replace: true })
    } catch (error) {
      logger.error('약 등록 실패:', error)
      toast.error('약 등록에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <MainLayout>
      <PageStack>
        <PageHeader title="약 등록" leading={<BackButton />} />
        <Paper sx={{ p: 3, borderRadius: 2, maxWidth: 600, width: '100%', mx: 'auto' }}>

          {targetUserName && (
            <Alert
              severity="info"
              icon={<PersonIcon />}
              sx={{
                mb: 3,
                fontWeight: 700,
                bgcolor: '#EEF2FF',
                color: '#4F46E5',
                border: '1px solid #C7D2FE'
              }}
            >
              <strong>{targetUserName}</strong> 님을 위한 약 등록입니다
            </Alert>
          )}

          <MedicationForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            submitLabel="등록"
            shouldResetOnSubmit={false}
          />
        </Paper>
      </PageStack>
    </MainLayout>
  )
}

export default MedicationAddPage
