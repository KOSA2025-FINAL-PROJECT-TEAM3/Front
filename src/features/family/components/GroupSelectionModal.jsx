/**
 * GroupSelectionModal
 * - 여러 가족 그룹 중 하나를 선택하는 모달
 * - Dashboard, FamilyManagement 진입 시 표시
 */

import { useState } from 'react'
import Modal from '@shared/components/ui/Modal'
import { useFamilyStore } from '../store/familyStore'
import styles from './GroupSelectionModal.module.scss'

export const GroupSelectionModal = ({ isOpen, onClose, onSelect }) => {
  const familyGroups = useFamilyStore((state) => state.familyGroups)
  const selectedGroupId = useFamilyStore((state) => state.selectedGroupId)
  const selectGroup = useFamilyStore((state) => state.selectGroup)
  const [localSelectedId, setLocalSelectedId] = useState(selectedGroupId)

  const handleSelect = () => {
    if (localSelectedId) {
      selectGroup(localSelectedId)
      onSelect?.(localSelectedId)
      onClose()
    }
  }

  const handleGroupClick = (groupId) => {
    setLocalSelectedId(groupId)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="가족 그룹 선택"
      footer={
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.selectButton}
            onClick={handleSelect}
            disabled={!localSelectedId}
          >
            선택
          </button>
        </div>
      }
    >
      <div className={styles.modalContent}>
        {familyGroups.length === 0 ? (
          <p className={styles.emptyMessage}>가족 그룹이 없습니다.</p>
        ) : (
          <div className={styles.groupList}>
            {familyGroups.map((group, index) => (
              <button
                key={group.id}
                type="button"
                className={`${styles.groupCard} ${
                  localSelectedId === group.id ? styles.selected : ''
                }`}
                onClick={() => handleGroupClick(group.id)}
              >
                <div className={styles.groupHeader}>
                  <span className={styles.groupNumber}>#{index + 1}</span>
                  <h3 className={styles.groupName}>{group.name}</h3>
                </div>
                <div className={styles.groupInfo}>
                  <span className={styles.memberCount}>
                    구성원 {group.members?.length || 0}명
                  </span>
                  <span className={styles.createdAt}>
                    생성일: {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default GroupSelectionModal
