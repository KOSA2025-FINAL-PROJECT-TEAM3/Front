import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@shared/components/layout/MainLayout'
import { PROFILE_EDIT_FIELDS } from '@/constants/uiConstants'
import { useAuth } from '@features/auth/hooks/useAuth'
import { Box, Button, Container, Paper, Stack, TextField, Typography, Avatar, IconButton } from '@mui/material'
import { toast } from '@shared/components/toast/toastStore'
import EditIcon from '@mui/icons-material/Edit'

export const ProfileEditPage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { user, updateUser, withdraw } = useAuth((state) => ({ 
    user: state.user, 
    updateUser: state.updateUser,
    withdraw: state.withdraw 
  }))

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
      setPreviewImage(user.profileImage)
    }
  }, [user])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // 미리보기 URL 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleWithdraw = async () => {
    if (window.confirm('정말 탈퇴하시겠습니까?\n탈퇴 시 계정은 비활성화되며, 14일 후 영구 삭제됩니다.')) {
      try {
        await withdraw()
        toast.success('회원 탈퇴가 완료되었습니다.')
        navigate('/') // 로그인 페이지 등으로 이동
      } catch (error) {
        console.error(error)
        toast.error('회원 탈퇴 처리에 실패했습니다.')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLoading) return

    try {
      setIsLoading(true)
      
      const payload = {
        name: formData.name,
        phone: formData.phone?.trim() || null,
        profileImageFile: selectedFile, // 파일 객체 전달
      }
      
      await updateUser(payload)
      toast.success('프로필이 업데이트되었습니다.')
      navigate(-1) // 뒤로 가기
    } catch (error) {
      console.error('Profile update failed:', error)
      const serverMessage = error.response?.data?.message || '프로필 업데이트에 실패했습니다.'
      toast.error(serverMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            프로필 편집
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            연락처 정보를 최신 상태로 유지하세요.
          </Typography>
        </Box>

        <Paper 
          variant="outlined" 
          sx={{ p: 3, borderRadius: 2 }} 
          component="form"
          onSubmit={handleSubmit}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, position: 'relative' }}>
             <Box sx={{ position: 'relative' }}>
               <Avatar 
                 src={previewImage} 
                 alt={formData.name}
                 sx={{ width: 100, height: 100, fontSize: '2rem', cursor: 'pointer', border: '2px solid #e2e8f0' }}
                 onClick={handleAvatarClick}
               >
                 {formData.name?.[0] || 'U'}
               </Avatar>
               <IconButton
                 sx={{
                   position: 'absolute',
                   bottom: 0,
                   right: 0,
                   backgroundColor: 'primary.main',
                   color: 'white',
                   width: 32,
                   height: 32,
                   '&:hover': { backgroundColor: 'primary.dark' },
                 }}
                 onClick={handleAvatarClick}
               >
                 <EditIcon sx={{ fontSize: 18 }} />
               </IconButton>
             </Box>
             <input 
               type="file" 
               ref={fileInputRef} 
               hidden 
               accept="image/*"
               onChange={handleFileChange}
             />
          </Box>

          <Stack spacing={2}>
            {PROFILE_EDIT_FIELDS.map((field) => (
              <TextField
                key={field.id}
                id={field.id}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.id] || ''}
                onChange={handleChange}
                InputProps={{ readOnly: field.readOnly }}
                disabled={field.readOnly}
                fullWidth
                required={field.id === 'name'}
              />
            ))}

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button 
                type="button" 
                variant="outlined" 
                color="inherit"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '저장'}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            color="error"
            variant="text"
            onClick={handleWithdraw}
            sx={{ textDecoration: 'underline' }}
          >
            회원탈퇴
          </Button>
        </Box>
      </Container>
    </MainLayout>
  )
}

export default ProfileEditPage