import MainLayout from '@shared/components/layout/MainLayout'
import MedicationForm from '../components/MedicationForm.jsx'
import MedicationList from '../components/MedicationList.jsx'
import { useMedicationStore } from '@/stores/medicationStore'
import styles from './MedicationManagement.module.scss'

export const MedicationManagementPage = () => {
  const {
    medications,
    loading,
    addMedication,
    removeMedication,
    toggleStatus,
  } = useMedicationStore()

  const handleAdd = async (payload) => {
    await addMedication(payload)
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>약 관리</h1>
          <p>복용 중인 약을 등록하고 간편하게 상태를 관리하세요.</p>
        </header>

        <MedicationForm onSubmit={handleAdd} loading={loading} />

        <MedicationList
          medications={medications}
          onToggle={toggleStatus}
          onRemove={removeMedication}
        />
      </div>
    </MainLayout>
  )
}

export default MedicationManagementPage
