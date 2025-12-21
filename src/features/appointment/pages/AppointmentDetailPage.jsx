import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Box,
    Typography,
    Stack,
    Paper,
    IconButton,
    Button,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Schedule as ScheduleIcon,
    LocalHospital as HospitalIcon,
} from '@mui/icons-material'
import { useAppointmentStore } from '../store/appointmentStore'
import { CompleteActionModal } from '../components/CompleteActionModal'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'
import { MainLayout } from '@shared/components/layout/MainLayout'

/**
 * 날짜+시간 포맷팅
 */
const formatDateTime = (dateTime) => {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

/**
 * 병원 예약 상세 페이지
 */
const AppointmentDetailPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const {
        currentAppointment,
        loading,
        error,
        fetchAppointment,
        cancelAppointment,
        completeAppointment,
        clearCurrentAppointment,
    } = useAppointmentStore()

    const [showCompleteModal, setShowCompleteModal] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // 데이터 로드
    useEffect(() => {
        if (id) {
            fetchAppointment(Number(id))
        }
        return () => clearCurrentAppointment()
    }, [id, fetchAppointment, clearCurrentAppointment])

    // 수정 페이지로 이동
    const handleEdit = () => {
        navigate(`/appointments/${id}/edit`)
    }

    // 삭제 (취소)
    const handleDelete = useCallback(async () => {
        if (!window.confirm('이 진료 일정을 취소하시겠습니까?')) return
        setActionLoading(true)
        try {
            await cancelAppointment(Number(id))
            toast.success('진료 일정이 취소되었습니다.')
            navigate('/appointments')
        } catch (error) {
            logger.error('[AppointmentDetailPage] cancelAppointment failed:', error)
            toast.error('진료 일정 취소에 실패했습니다.')
        } finally {
            setActionLoading(false)
        }
    }, [id, cancelAppointment, navigate])

    // 방문 완료
    const handleComplete = useCallback(async () => {
        setActionLoading(true)
        try {
            await completeAppointment(Number(id))
            toast.success('방문 완료 처리되었습니다.')
            setShowCompleteModal(true)
        } catch (error) {
            logger.error('[AppointmentDetailPage] completeAppointment failed:', error)
            toast.error('완료 처리에 실패했습니다.')
        } finally {
            setActionLoading(false)
        }
    }, [id, completeAppointment])

    // 카카오맵 열기
    const handleOpenMap = () => {
        const { latitude, longitude, hospitalName } = currentAppointment || {}
        if (latitude && longitude) {
            window.open(
                `https://map.kakao.com/link/map/${encodeURIComponent(hospitalName)},${latitude},${longitude}`,
                '_blank'
            )
        } else if (hospitalName) {
            window.open(
                `https://map.kakao.com/link/search/${encodeURIComponent(hospitalName)}`,
                '_blank'
            )
        }
    }

    // 전화 걸기
    const handleCall = () => {
        if (currentAppointment?.phoneNumber) {
            window.location.href = `tel:${currentAppointment.phoneNumber}`
        }
    }

    if (loading) {
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
                    <Button onClick={() => navigate('/appointments')} sx={{ mt: 2 }}>
                        목록으로 돌아가기
                    </Button>
                </Box>
            </MainLayout>
        )
    }

    const isCompleted = currentAppointment.status === 'COMPLETED'
    const isCancelled = currentAppointment.status === 'CANCELLED'
    const isActive = currentAppointment.status === 'SCHEDULED'

    return (
        <MainLayout>
            <Box sx={{ pb: 4 }}>
                {/* 헤더 */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Stack direction="row" alignItems="center">
                        <IconButton onClick={() => navigate(-1)} edge="start">
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>
                            진료 일정 상세
                        </Typography>
                    </Stack>
                    {isActive && (
                        <Stack direction="row" spacing={1}>
                            <IconButton onClick={handleEdit} color="primary">
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={handleDelete} color="error" disabled={actionLoading}>
                                <DeleteIcon />
                            </IconButton>
                        </Stack>
                    )}
                </Box>

                {/* 메인 컨텐츠 */}
                <Box sx={{ p: 2 }}>
                    <Stack spacing={2}>
                        {/* 병원명 카드 */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: isCompleted ? 'success.50' : isCancelled ? 'grey.100' : 'info.50',
                                    }}
                                >
                                    <HospitalIcon
                                        sx={{
                                            fontSize: 32,
                                            color: isCompleted ? 'success.main' : isCancelled ? 'grey.500' : 'info.main',
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {currentAppointment.hospitalName}
                                    </Typography>
                                    {currentAppointment.department && (
                                        <Typography variant="body2" color="text.secondary">
                                            {currentAppointment.department}
                                            {currentAppointment.doctorName && ` · ${currentAppointment.doctorName}`}
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                        </Paper>

                        {/* 날짜/시간 */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <ScheduleIcon color="action" />
                                <Typography sx={{ fontWeight: 600 }}>
                                    {formatDateTime(currentAppointment.visitAt)}
                                </Typography>
                            </Stack>
                        </Paper>

                        {/* 위치 정보 */}
                        {currentAppointment.address && (
                            <Paper
                                variant="outlined"
                                sx={{ p: 2, borderRadius: 3, cursor: 'pointer' }}
                                onClick={handleOpenMap}
                            >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <LocationIcon color="primary" />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontWeight: 600 }}>
                                            {currentAppointment.address}
                                        </Typography>
                                        {currentAppointment.addressDetail && (
                                            <Typography variant="body2" color="text.secondary">
                                                {currentAppointment.addressDetail}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Paper>
                        )}

                        {/* 전화번호 */}
                        {currentAppointment.phoneNumber && (
                            <Paper
                                variant="outlined"
                                sx={{ p: 2, borderRadius: 3, cursor: 'pointer' }}
                                onClick={handleCall}
                            >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <PhoneIcon color="primary" />
                                    <Typography sx={{ fontWeight: 600 }}>
                                        {currentAppointment.phoneNumber}
                                    </Typography>
                                </Stack>
                            </Paper>
                        )}

                        {/* 메모 */}
                        {currentAppointment.memo && (
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    메모
                                </Typography>
                                <Typography>{currentAppointment.memo}</Typography>
                            </Paper>
                        )}

                        <Divider sx={{ my: 1 }} />

                        {/* 액션 버튼 */}
                        {isActive && (
                            <Button
                                variant="contained"
                                color="success"
                                size="large"
                                startIcon={<CheckIcon />}
                                onClick={handleComplete}
                                disabled={actionLoading}
                                sx={{ fontWeight: 700 }}
                            >
                                방문 완료
                            </Button>
                        )}

                        {isCompleted && (
                            <Alert severity="success" icon={<CheckIcon />}>
                                {formatDateTime(currentAppointment.completedAt)}에 방문 완료되었습니다.
                            </Alert>
                        )}

                        {isCancelled && (
                            <Alert severity="warning">이 진료 일정은 취소되었습니다.</Alert>
                        )}
                    </Stack>
                </Box>

                {/* 완료 후 OCR 유도 모달 */}
                <CompleteActionModal
                    open={showCompleteModal}
                    onClose={() => setShowCompleteModal(false)}
                    appointment={currentAppointment}
                    loading={actionLoading}
                />
            </Box>
        </MainLayout>
    )
}

export default AppointmentDetailPage
