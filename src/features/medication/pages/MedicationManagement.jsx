import { useEffect, useMemo, useState } from 'react'
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
    fetchMedications,
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

  // 초기 로드 시 목록 가져오기 (mock/real 자동 전환)
  useEffect(() => {
    if (!medications?.length) fetchMedications?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <p>약을 등록하고 복용 일정을 관리하세요.</p>
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

