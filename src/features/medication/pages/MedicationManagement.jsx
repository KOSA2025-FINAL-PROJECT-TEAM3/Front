import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MainLayout } from '@shared/components/layout/MainLayout'
import { MedicationList } from '../components/MedicationList'
import { MedicationDetailModal } from '../components/MedicationDetailModal'
import { InventoryTracker } from '../components/InventoryTracker'
import { useMedicationStore } from '@features/medication/store/medicationStore'
import { ROUTE_PATHS } from '@config/routes.config'
import { toast } from '@shared/components/toast/toastStore'
import styles from './MedicationManagement.module.scss'

export const MedicationManagement = () => {
  const navigate = useNavigate()
  const location = useLocation()
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
    fetchMedications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle navigation state for opening specific medication
  useEffect(() => {
    if (location.state?.selectedMedicationId) {
      setSelectedMedicationId(location.state.selectedMedicationId)
      // Clear the state after using it
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

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
    try {
      await removeMedication(medId)
      if (selectedMedicationId === medId) {
        handleCloseModal()
      }
      toast.success('약이 삭제되었습니다.')
    } catch (error) {
      console.error('약 삭제 실패:', error)
      if (error.response?.data?.code === 'MEDICATION_SCHEDULE_002') {
        toast.error('오늘 복용 기록이 있어 삭제할 수 없습니다.')
      } else {
        toast.error('약 삭제에 실패했습니다.')
      }
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

export default MedicationManagement
