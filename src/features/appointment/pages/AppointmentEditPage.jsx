import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, IconButton, CircularProgress, Alert } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useAppointmentStore } from '../store/appointmentStore'
import { AppointmentForm } from '../components/AppointmentForm'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'

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
            toast.success('예약이 수정되었습니다.')
            navigate(`/appointments/${id}`)
        } catch (error) {
            logger.error('[AppointmentEditPage] updateAppointment failed:', error)
            toast.error('예약 수정에 실패했습니다.')
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    if (loading && !currentAppointment) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error || !currentAppointment) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">예약 정보를 불러올 수 없습니다.</Alert>
            </Box>
        )
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
                    예약 수정
                </Typography>
            </Box>

            {/* 폼 */}
            <Box sx={{ p: 2 }}>
                <AppointmentForm
                    initialValues={currentAppointment}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    submitLabel="수정 완료"
                />
            </Box>
        </Box>
    )
}

export default AppointmentEditPage
