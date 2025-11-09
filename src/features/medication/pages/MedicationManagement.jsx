import { useMemo, useState } from 'react'
import MainLayout from '@shared/components/layout/MainLayout'
import MedicationForm from '../components/MedicationForm.jsx'
import MedicationList from '../components/MedicationList.jsx'
import MedicationDetailModal from '../components/MedicationDetailModal.jsx'
import InventoryTracker from '../components/InventoryTracker.jsx'
import { useMedicationStore } from '@/stores/medicationStore'
import styles from './MedicationManagement.module.scss'

export const MedicationManagementPage = () => {
  const {
    medications,
    loading,
    addMedication,
    removeMedication,
    toggleStatus,
    updateMedication,
  } = useMedicationStore()
  const [selectedMedicationId, setSelectedMedicationId] = useState(null)
  const selectedMedication = useMemo(
    () => medications.find((med) => med.id === selectedMedicationId) || null,
    [medications, selectedMedicationId],
  )

  const handleAdd = async (payload) => {
    await addMedication(payload)
  }

  const handleSelectMedication = (medication) => {
    setSelectedMedicationId(medication?.id || null)
  }

  const handleCloseModal = () => {
    setSelectedMedicationId(null)
  }

  const handleUpdateMedication = async (medId, patch) => {
    await updateMedication(medId, patch)
  }

  const handleRemoveMedication = async (medId) => {
    await removeMedication(medId)
    if (selectedMedicationId === medId) {
      handleCloseModal()
    }
  }

  return (
    <MainLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>약 관리</h1>
          <p>복용 중인 약을 등록하고 간편하게 상태를 관리하세요.</p>
        </header>

        <InventoryTracker medications={medications} />

        <MedicationForm onSubmit={handleAdd} loading={loading} />

        <MedicationList
          medications={medications}
          onToggle={toggleStatus}
          onRemove={handleRemoveMedication}
          onSelect={handleSelectMedication}
        />

        {selectedMedication && (
          <MedicationDetailModal
            medication={selectedMedication}
            loading={loading}
            onClose={handleCloseModal}
            onToggle={toggleStatus}
            onRemove={handleRemoveMedication}
            onSubmit={handleUpdateMedication}
          />
        )}
      </div>
    </MainLayout>
  )
}

export default MedicationManagementPage
