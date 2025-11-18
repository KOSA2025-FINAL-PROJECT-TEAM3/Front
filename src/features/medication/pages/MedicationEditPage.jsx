/**
 * 약 편집 페이지
 * @page 10-medication-edit
 * @component MedicationEditPage
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { MedicationForm } from '@features/medication/components/MedicationForm'
import { useMedicationStore } from '@features/medication/store/medicationStore'
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
      // 수정 성공 시 약 관리 페이지로 이동
      navigate(ROUTE_PATHS.medication, { replace: true })
    } catch (error) {
      console.error('약 수정 실패:', error)
      // 에러는 store에서 이미 처리되므로 여기서는 로그만 출력
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
          <h1 className={styles.title}>약 편집</h1>
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
        <h1 className={styles.title}>약 편집</h1>
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
