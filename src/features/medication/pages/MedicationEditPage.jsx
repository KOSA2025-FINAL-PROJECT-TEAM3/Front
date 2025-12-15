import logger from '@core/utils/logger'
/**
 * 약 편집 페이지
 * @page 10-medication-edit
 * @component MedicationEditPage
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { MedicationForm } from '@features/medication/components/MedicationForm'
import { BackButton } from '@shared/components/mui/BackButton'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { toast } from '@shared/components/toast/toastStore'
import { ROUTE_PATHS } from '@config/routes.config'
import { Container, Paper, Stack, Typography } from '@mui/material'

/**
 * 약 편집 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const MedicationEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [medication, setMedication] = useState(null)

  const { medications, updateMedication, fetchMedications, loading } = useMedicationStore(
    (state) => ({
      medications: state.medications,
      updateMedication: state.updateMedication,
      fetchMedications: state.fetchMedications,
      loading: state.loading,
    })
  )

  useEffect(() => {
    // 약 목록이 비어있으면 fetch
    if (medications.length === 0) {
      fetchMedications()
    }
  }, [medications.length, fetchMedications])

  useEffect(() => {
    // 약 ID로 해당 약 찾기
    const foundMedication = medications.find((med) => med.id === id)
    if (foundMedication) {
      setMedication(foundMedication)
    } else if (medications.length > 0) {
      // 약 목록에 해당 ID가 없으면 목록 페이지로 이동
      navigate(ROUTE_PATHS.medication, { replace: true })
    }
  }, [id, medications, navigate])

  const handleSubmit = async (formData) => {
    try {
      await updateMedication(id, formData)
      toast.success('약이 수정되었습니다')
      navigate(ROUTE_PATHS.medication, { replace: true })
    } catch (error) {
      logger.error('약 수정 실패:', error)
      if (error.response?.data?.code === 'MEDICATION_SCHEDULE_002') {
        toast.error('오늘 복용 기록이 있어 수정할 수 없습니다.')
      } else {
        toast.error('약 수정에 실패했습니다')
      }
    }
  }

  const handleCancel = () => {
    navigate(ROUTE_PATHS.medication)
  }

  // 로딩 중이거나 약 정보를 아직 못 찾았을 때
  if (!medication) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <BackButton />
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              약 편집
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {loading ? '약 정보를 불러오는 중...' : '약 정보를 찾을 수 없습니다.'}
          </Typography>
        </Container>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <BackButton />
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            약 편집
          </Typography>
        </Stack>
        <Paper sx={{ p: 3, borderRadius: 2, maxWidth: 600 }}>
          <MedicationForm
            initialValues={medication}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            submitLabel="수정"
            shouldResetOnSubmit={false}
          />
        </Paper>
      </Container>
    </MainLayout>
  )
}

export default MedicationEditPage
