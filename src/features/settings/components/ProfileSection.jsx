import { useState } from 'react'
import { useAuth } from '@features/auth/hooks/useAuth'
import styles from './ProfileSection.module.scss'

export const ProfileSection = ({ user }) => {
  const { updateUser, withdraw } = useAuth((state) => ({ 
    updateUser: state.updateUser,
    withdraw: state.withdraw 
  }))
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  // 초기화 및 편집 모드 진입
  const handleEditClick = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
    })
    setIsEditing(true)
  }

  const handleWithdraw = async () => {
    if (window.confirm('정말 탈퇴하시겠습니까?\n탈퇴 시 계정은 비활성화되며, 14일 후 영구 삭제됩니다.')) {
      try {
        await withdraw()
        alert('회원 탈퇴가 완료되었습니다.')
      } catch (error) {
        console.error(error)
        alert('회원 탈퇴 처리에 실패했습니다.')
      }
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) return

    try {
      setIsLoading(true)
      await updateUser({
        name: formData.name,
        phone: formData.phone,
        // profileImage는 추후 파일 업로드 구현 시 추가
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('프로필 수정에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <section className={styles.profileSection}>
        <div className={styles.avatarPlaceholder}>?</div>
        <div>
          <p className={styles.name}>게스트</p>
          <p className={styles.email}>로그인이 필요합니다</p>
        </div>
      </section>
    )
  }

  const initials = user.name?.[0] ?? 'U'

  return (
    <section className={styles.profileSection}>
      <div className={styles.avatar}>
        {user.profileImage ? (
          <img src={user.profileImage} alt="Profile" className={styles.avatarImage} />
        ) : (
          initials
        )}
      </div>

      {isEditing ? (
        <div className={styles.editForm}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>닉네임</label>
            <input
              type="text"
              name="name"
              className={styles.input}
              value={formData.name}
              onChange={handleChange}
              placeholder="닉네임을 입력하세요"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>전화번호</label>
            <input
              type="tel"
              name="phone"
              className={styles.input}
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-1234-5678"
            />
          </div>
          <div className={styles.actions}>
            <button 
              className={styles.cancelButton} 
              onClick={handleCancel}
              disabled={isLoading}
            >
              취소
            </button>
            <button 
              className={styles.saveButton} 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.info}>
            <p className={styles.name}>{user.name}</p>
            <p className={styles.email}>{user.email}</p>
            {user.phone && <p className={styles.phone}>{user.phone}</p>}
          </div>
          <button className={styles.editButton} onClick={handleEditClick}>
            수정
          </button>
          <button 
            onClick={handleWithdraw}
            style={{ 
              display: 'block', 
              marginTop: '12px', 
              color: '#ff4444', 
              fontSize: '0.9rem', 
              background: 'none', 
              border: 'none', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              width: '100%'
            }}
          >
            회원탈퇴
          </button>
        </>
      )}
    </section>
  )
}

export default ProfileSection
