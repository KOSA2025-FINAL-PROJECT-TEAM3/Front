import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Typography, IconButton, Paper } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useAppointmentStore } from '../store/appointmentStore'
import { AppointmentForm } from '../components/AppointmentForm'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'
import { MainLayout } from '@shared/components/layout/MainLayout'

/**
 * 병원 예약 등록 페이지
 */
const AppointmentAddPage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user } = useAuthStore()
    const { createAppointment, loading } = useAppointmentStore()
    
    // URL에서 date 파라미터 읽기 (캘린더에서 날짜 클릭 시 전달됨)
    const initialDate = searchParams.get('date') || null

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
        <MainLayout hideHeader>
            {/* 커스텀 헤더 */}
            <Paper
                elevation={0}
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                }}
            >
                <IconButton onClick={handleCancel} edge="start" sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    새 예약 등록
                </Typography>
            </Paper>

            {/* 폼 */}
            <Box sx={{ p: 2, pb: 12 }}>
                <AppointmentForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    submitLabel="예약 등록"
                    initialDate={initialDate}
                />
            </Box>
        </MainLayout>
    )
}

export default AppointmentAddPage

