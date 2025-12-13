import logger from "@core/utils/logger"
/**
 * 약 등록 페이지
 * @page 08-medication-add
 * @component MedicationAddPage
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { MedicationForm } from '@features/medication/components/MedicationForm'
import { BackButton } from '@shared/components/ui/BackButton'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { useVoiceActionStore } from '@/features/voice/stores/voiceActionStore'
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
  
  const { consumeAction } = useVoiceActionStore()
  const [initialValues, setInitialValues] = useState(null)

  useEffect(() => {
    const action = consumeAction('AUTO_FILL_REGISTER')
    if (action && action.params?.medicationName) {
      setInitialValues({
        name: action.params.medicationName
      })
      toast.info(`'${action.params.medicationName}' 정보를 자동으로 입력했습니다.`)
    }
  }, [consumeAction])

  const handleSubmit = async (formData) => {
    try {
      await addMedication(formData)
      toast.success('약이 등록되었습니다')
      navigate(ROUTE_PATHS.medication, { replace: true })
    } catch (error) {
      logger.error('약 등록 실패:', error)
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
            initialValues={initialValues}
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
