/**
 * 약 편집 페이지
 * @page 10-medication-edit
 * @component MedicationEditPage
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { MedicationForm } from '@features/medication/components/MedicationForm'
import { BackButton } from '@shared/components/ui/BackButton'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { toast } from '@shared/components/toast/toastStore'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './MedicationEditPage.module.scss'

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
      console.error('약 수정 실패:', error)
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
        <div className={styles.container}>
          <div className={styles.headerWithBack}>
            <BackButton />
            <h1 className={styles.title}>약 편집</h1>
          </div>
          <p className={styles.placeholder}>
            {loading ? '약 정보를 불러오는 중...' : '약 정보를 찾을 수 없습니다.'}
          </p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.headerWithBack}>
          <BackButton />
          <h1 className={styles.title}>약 편집</h1>
        </div>
        <div className={styles.formWrapper}>
          <MedicationForm
            initialValues={medication}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            submitLabel="수정"
            shouldResetOnSubmit={false}
          />
        </div>
      </div>
    </MainLayout>
  )
}

export default MedicationEditPage
