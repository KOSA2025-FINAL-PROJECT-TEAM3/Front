import { useState } from 'react'
import { Avatar, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '@features/auth/hooks/useAuth'
import logger from '@core/utils/logger'

// Styles
const STYLES = {
  section: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 2.5,
    borderRadius: 4,
    bgcolor: 'background.paper',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    fontSize: '1.5rem',
    fontWeight: 600,
    bgcolor: 'primary.main',
    color: 'white',
    flexShrink: 0,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    fontSize: '1.5rem',
    fontWeight: 600,
    bgcolor: 'grey.300',
    color: 'text.secondary',
    flexShrink: 0,
  },
  name: {
    fontWeight: 600,
    fontSize: '1.125rem',
    color: 'text.primary',
  },
  email: {
    fontSize: '0.875rem',
    color: 'text.secondary',
    mt: 0.5,
  },
  phone: {
    fontSize: '0.8125rem',
    color: 'text.disabled',
    mt: 0.25,
  },
  editButton: {
    bgcolor: 'grey.100',
    color: 'text.secondary',
    fontWeight: 500,
    fontSize: '0.8125rem',
    px: 1.5,
    py: 0.75,
    borderRadius: 1.5,
    textTransform: 'none',
    '&:hover': {
      bgcolor: 'grey.200',
      color: 'text.primary',
    },
  },
  saveButton: {
    fontWeight: 500,
    fontSize: '0.8125rem',
    px: 1.5,
    py: 0.75,
    borderRadius: 1.5,
    textTransform: 'none',
  },
  cancelButton: {
    fontWeight: 500,
    fontSize: '0.8125rem',
    px: 1.5,
    py: 0.75,
    borderRadius: 1.5,
    textTransform: 'none',
    color: 'text.secondary',
    borderColor: 'divider',
  },
  withdrawButton: {
    display: 'block',
    mt: 1.5,
    color: 'error.main',
    fontSize: '0.9rem',
    textDecoration: 'underline',
    textTransform: 'none',
    width: '100%',
    '&:hover': {
      bgcolor: 'transparent',
      textDecoration: 'underline',
    },
  },
}

export const ProfileSection = ({ user }) => {
  const { updateUser, withdraw } = useAuth((state) => ({
    updateUser: state.updateUser,
    withdraw: state.withdraw,
  }))
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

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
        logger.error('회원 탈퇴 실패:', error)
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
      })
      setIsEditing(false)
    } catch (error) {
      logger.error('프로필 수정 실패:', error)
      alert('프로필 수정에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Paper sx={STYLES.section}>
        <Avatar sx={STYLES.avatarPlaceholder}>?</Avatar>
        <Box>
          <Typography sx={STYLES.name}>게스트</Typography>
          <Typography sx={STYLES.email}>로그인이 필요합니다</Typography>
        </Box>
      </Paper>
    )
  }

  const initials = user.name?.[0] ?? 'U'

  return (
    <Paper sx={STYLES.section}>
      <Avatar src={user.profileImage} sx={STYLES.avatar}>
        {!user.profileImage && initials}
      </Avatar>

      {isEditing ? (
        <Stack spacing={1} sx={{ flex: 1 }}>
          <TextField
            size="small"
            label="닉네임"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="닉네임을 입력하세요"
            fullWidth
          />
          <TextField
            size="small"
            label="전화번호"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="010-1234-5678"
            fullWidth
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              sx={STYLES.cancelButton}
              onClick={handleCancel}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              variant="contained"
              sx={STYLES.saveButton}
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </Stack>
        </Stack>
      ) : (
        <>
          <Box sx={{ flex: 1 }}>
            <Typography sx={STYLES.name}>{user.name}</Typography>
            <Typography sx={STYLES.email}>{user.email}</Typography>
            {user.phone && <Typography sx={STYLES.phone}>{user.phone}</Typography>}
          </Box>
          <Button sx={STYLES.editButton} onClick={handleEditClick}>
            수정
          </Button>
          <Button sx={STYLES.withdrawButton} onClick={handleWithdraw}>
            회원탈퇴
          </Button>
        </>
      )}
    </Paper>
  )
}

export default ProfileSection
