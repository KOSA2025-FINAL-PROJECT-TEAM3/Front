/**
 * 약 등록 페이지
 * @page 08-medication-add
 * @component MedicationAddPage
 */

import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { MedicationForm } from '@features/medication/components/MedicationForm'
import { BackButton } from '@shared/components/ui/BackButton'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { toast } from '@shared/components/toast/toastStore'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './MedicationAddPage.module.scss'

/**
 * 약 등록 페이지 컴포넌트
 * @returns {JSX.Element}
 */
export const MedicationAddPage = () => {
  const navigate = useNavigate()
  const { addMedication, loading } = useMedicationStore((state) => ({
    addMedication: state.addMedication,
    loading: state.loading,
  }))

  const handleSubmit = async (formData) => {
    try {
      await addMedication(formData)
      toast.success('약이 등록되었습니다')
      navigate(ROUTE_PATHS.medication, { replace: true })
    } catch (error) {
      console.error('약 등록 실패:', error)
      toast.error('약 등록에 실패했습니다')
    }
  }

  const handleCancel = () => {
    navigate(ROUTE_PATHS.medication)
  }

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.headerWithBack}>
          <BackButton />
          <h1 className={styles.title}>약 등록</h1>
        </div>
        <div className={styles.formWrapper}>
          <MedicationForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
            submitLabel="등록"
            shouldResetOnSubmit={false}
          />
        </div>
      </div>
    </MainLayout>
  )
}

export default MedicationAddPage
