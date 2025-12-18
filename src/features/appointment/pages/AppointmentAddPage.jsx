import { useNavigate } from 'react-router-dom'
import { Box, Typography, IconButton } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useAppointmentStore } from '../store/appointmentStore'
import { AppointmentForm } from '../components/AppointmentForm'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'

/**
 * 병원 예약 등록 페이지
 */
const AppointmentAddPage = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { createAppointment, loading } = useAppointmentStore()

    const handleSubmit = async (payload) => {
        try {
            // 본인 등록이므로 userId는 현재 사용자
            const data = { ...payload, userId: user?.id }
            await createAppointment(data)
            toast.success('예약이 등록되었습니다.')
            navigate('/appointments')
        } catch (error) {
            logger.error('[AppointmentAddPage] createAppointment failed:', error)
            toast.error('예약 등록에 실패했습니다.')
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    return (
        <Box>
            {/* 헤더 */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <IconButton onClick={handleCancel} edge="start">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>
                    새 예약 등록
                </Typography>
            </Box>

            {/* 폼 */}
            <Box sx={{ p: 2 }}>
                <AppointmentForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    submitLabel="예약 등록"
                />
            </Box>
        </Box>
    )
}

export default AppointmentAddPage
