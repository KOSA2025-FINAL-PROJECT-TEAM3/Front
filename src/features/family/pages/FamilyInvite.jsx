import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Modal from '@shared/components/ui/Modal'
import InviteMemberForm from '../components/InviteMemberForm.jsx'
import { useFamily } from '../hooks/useFamily'
import styles from './FamilyInvite.module.scss'

export const FamilyInvitePage = () => {
  const navigate = useNavigate()
  const { familyGroup, inviteMember } = useFamily()
  const [submitting, setSubmitting] = useState(false)
  const inviteLink = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const origin = window.location.origin
    return `${origin}/join?code=${familyGroup?.id ?? 'family-group-1'}`
  }, [familyGroup])

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    try {
      await inviteMember(formData)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      alert('초대 링크가 복사되었습니다.')
    } catch (err) {
      console.warn('초대 링크 복사 실패:', err)
      alert('복사에 실패했습니다. 직접 선택하여 복사해주세요.')
    }
  }

  return (
    <Modal
      title="가족 초대"
      description="이름, 이메일을 입력하거나 초대 링크를 복사해 가족을 초대하세요."
      onClose={() => navigate('/family', { replace: true })}
    >
      <InviteMemberForm onSubmit={handleSubmit} loading={submitting} />
      <div className={styles.linkSection}>
        <label htmlFor="invite-link">초대 링크</label>
        <div className={styles.linkRow}>
          <input
            id="invite-link"
            type="text"
            value={inviteLink}
            readOnly
            onFocus={(e) => e.target.select()}
          />
          <button type="button" onClick={handleCopy}>
            복사
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default FamilyInvitePage
