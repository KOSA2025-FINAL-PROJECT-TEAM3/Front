import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import MedicationList from '../components/MedicationList.jsx'
import MedicationDetailModal from '../components/MedicationDetailModal.jsx'
import InventoryTracker from '../components/InventoryTracker.jsx'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { ROUTE_PATHS } from '@config/routes.config'
import styles from './MedicationManagement.module.scss'

export const MedicationManagementPage = () => {
  const navigate = useNavigate()
  const {
    medications,
    loading,
    fetchMedications,
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

  const handleAddClick = () => {
    navigate(ROUTE_PATHS.medicationAdd)
  }

  const handleSelectMedication = (medication) => {
    setSelectedMedicationId(medication?.id || null)
  }

  const handleCloseModal = () => {
    setSelectedMedicationId(null)
  }

  const handleUpdateMedication = async (medId, patch) => {
    await updateMedication(medId, patch)
    handleCloseModal()
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
          <div className={styles.headerContent}>
            <div>
              <h1>약 관리</h1>
              <p>약을 등록하고 복용 일정을 관리하세요.</p>
            </div>
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddClick}
              aria-label="약 등록"
            >
              <span className={styles.addIcon}>+</span>
              <span className={styles.addLabel}>약 등록</span>
            </button>
          </div>
        </header>

        <InventoryTracker medications={medications} />

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
