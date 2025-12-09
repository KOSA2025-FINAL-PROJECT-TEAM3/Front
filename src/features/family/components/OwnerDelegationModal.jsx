import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import styles from './OwnerDelegationModal.module.scss'

/**
 * 소유자 양도 모달
 * - 그룹 소유자가 CAREGIVER → SENIOR로 역할 전환 시
 * - 새 소유자를 선택해야 함
 */
const OwnerDelegationModal = ({
  isOpen,
  onClose,
  onConfirm,
  members = [],
  currentOwnerId,
  isLoading = false,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState(null)

  // 새 소유자 후보: CAREGIVER 역할을 가진 다른 멤버들 (본인 제외)
  const eligibleMembers = useMemo(() => {
    return members.filter((m) => {
      // CAREGIVER만 소유자가 될 수 있음
      if (m.role !== 'CAREGIVER') return false
      
      // 현재 소유자 제외 (userId 또는 id로 비교)
      const memberUserId = String(m.userId || '')
      const memberId = String(m.id || '')
      const ownerIdStr = String(currentOwnerId || '')
      
      if (ownerIdStr && (memberUserId === ownerIdStr || memberId === ownerIdStr)) {
        return false
      }
      
      return true
    })
  }, [members, currentOwnerId])

  const handleConfirm = () => {
    if (selectedMemberId) {
      onConfirm(selectedMemberId)
    }
  }

  const handleClose = () => {
    setSelectedMemberId(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>그룹 소유자 양도</h3>
          <button className={styles.closeBtn} onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            그룹 소유자가 어르신(SENIOR) 역할로 전환하려면<br />
            새로운 소유자를 지정해야 합니다.
          </p>

          {eligibleMembers.length === 0 ? (
            <div className={styles.noMembers}>
              <p>양도 가능한 보호자(CAREGIVER)가 없습니다.</p>
              <p className={styles.hint}>
                다른 보호자를 그룹에 먼저 초대해주세요.
              </p>
            </div>
          ) : (
            <div className={styles.memberList}>
              <label className={styles.label}>새 소유자 선택:</label>
              {eligibleMembers.map((member) => (
                <div
                  key={member.id}
                  className={`${styles.memberItem} ${
                    selectedMemberId === member.id ? styles.selected : ''
                  }`}
                  onClick={() => setSelectedMemberId(member.id)}
                >
                  <div className={styles.radio}>
                    <input
                      type="radio"
                      name="newOwner"
                      checked={selectedMemberId === member.id}
                      onChange={() => setSelectedMemberId(member.id)}
                    />
                  </div>
                  <div className={styles.memberInfo}>
                    <span className={styles.name}>{member.name}</span>
                    <span className={styles.email}>{member.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelBtn}
            onClick={handleClose}
            disabled={isLoading}
          >
            취소
          </button>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!selectedMemberId || isLoading || eligibleMembers.length === 0}
          >
            {isLoading ? '처리 중...' : '양도하고 역할 변경'}
          </button>
        </div>
      </div>
    </div>
  )
}

OwnerDelegationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  members: PropTypes.array,
  currentOwnerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isLoading: PropTypes.bool,
}

export default OwnerDelegationModal
