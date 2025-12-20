import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, IconButton, CircularProgress, Alert, Paper } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useAppointmentStore } from '../store/appointmentStore'
import { AppointmentForm } from '../components/AppointmentForm'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'
import { MainLayout } from '@shared/components/layout/MainLayout'

/**
 * 병원 예약 수정 페이지
 */
const AppointmentEditPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const {
        currentAppointment,
        loading,
        error,
        fetchAppointment,
        updateAppointment,
        clearCurrentAppointment,
    } = useAppointmentStore()

    // 데이터 로드
    useEffect(() => {
        if (id) {
            fetchAppointment(Number(id))
        }
        return () => clearCurrentAppointment()
    }, [id, fetchAppointment, clearCurrentAppointment])

    const handleSubmit = async (payload) => {
        try {
            await updateAppointment(Number(id), payload)
            toast.success('진료 일정이 수정되었습니다.')
            navigate(`/appointments/${id}`)
        } catch (error) {
            logger.error('[AppointmentEditPage] updateAppointment failed:', error)
            toast.error('진료 일정 수정에 실패했습니다.')
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    if (loading && !currentAppointment) {
        return (
            <MainLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            </MainLayout>
        )
    }

    if (error || !currentAppointment) {
        return (
            <MainLayout>
                <Box sx={{ p: 3 }}>
                    <Alert severity="error">진료 일정 정보를 불러올 수 없습니다.</Alert>
                </Box>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            {/* 헤더 */}
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
                    진료 일정 수정
                </Typography>
            </Paper>

            {/* 폼 */}
            <Box sx={{ p: 2, pb: 12 }}>
                <AppointmentForm
                    initialValues={currentAppointment}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    submitLabel="수정 완료"
                />
            </Box>
        </MainLayout>
    )
}

export default AppointmentEditPage
