import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Typography,
    Stack,
    Fab,
    CircularProgress,
    Alert,
    Paper,
    IconButton,
} from '@mui/material'
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useAppointmentStore } from '../store/appointmentStore'
import { AppointmentCalendarView } from '../components/AppointmentCalendarView'
import { AppointmentCard } from '../components/AppointmentCard'
import { useAuthStore } from '@features/auth/store/authStore'
import { MainLayout } from '@shared/components/layout/MainLayout'

/**
 * 병원 예약 목록 페이지
 *
 * - 월간 캘린더 뷰
 * - 선택한 날짜의 예약 카드 목록
 * - FAB으로 새 예약 추가
 */
const AppointmentListPage = () => {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const userId = user?.id

    const {
        appointments,
        calendarDays,
        loading,
        error,
        fetchAppointments,
        fetchCalendar,
    } = useAppointmentStore()

    // 현재 보고 있는 년/월
    const today = new Date()
    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth() + 1)
    const [selectedDate, setSelectedDate] = useState(null)

    // 초기 로드
    useEffect(() => {
        if (!userId) return
        fetchCalendar(userId, year, month)
        // 전체 월의 예약 목록도 가져옴
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const lastDay = new Date(year, month, 0).getDate()
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        fetchAppointments(userId, { startDate, endDate })
    }, [userId, year, month, fetchCalendar, fetchAppointments])

    // 월 변경 핸들러
    const handleMonthChange = useCallback((newYear, newMonth) => {
        setYear(newYear)
        setMonth(newMonth)
        setSelectedDate(null) // 날짜 선택 해제
    }, [])

    // 날짜 선택 핸들러 - 미래 날짜 클릭 시 예약 추가 페이지로 이동
    const handleDateSelect = useCallback((date) => {
        // 과거 날짜는 무시 (이미 캘린더에서 클릭 비활성화됨)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const selected = new Date(date)
        selected.setHours(0, 0, 0, 0)

        if (selected < today) {
            return // 과거 날짜는 클릭 불가
        }

        // 미래/오늘 날짜 클릭 시 예약 추가 페이지로 이동
        navigate(`/appointments/add?date=${date}`)
    }, [navigate])

    // 선택된 날짜의 예약 필터링
    const filteredAppointments = useMemo(() => {
        if (!selectedDate) return appointments
        return appointments.filter((app) => app.visitAt?.startsWith(selectedDate))
    }, [appointments, selectedDate])

    // 새 예약 추가
    const handleAddAppointment = () => {
        navigate('/appointments/add')
    }

    if (!userId) {
        return (
            <MainLayout>
                <Box sx={{ p: 3 }}>
                    <Alert severity="warning">로그인이 필요합니다.</Alert>
                </Box>
            </MainLayout>
        )
    }

    return (
        <MainLayout hideHeader>
            {/* 헤더 */}
            <Paper
                elevation={0}
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    p: 2,
                    pb: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton onClick={() => navigate(-1)} edge="start">
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            병원 진료 일정
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            진료 일정을 관리하고 알림을 받으세요
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* 캘린더 */}
            <Box sx={{ px: 2, pb: 2 }}>
                <AppointmentCalendarView
                    year={year}
                    month={month}
                    calendarDays={calendarDays}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onMonthChange={handleMonthChange}
                    loading={loading}
                />
            </Box>

            {/* 선택된 날짜 표시 */}
            {selectedDate && (
                <Box sx={{ px: 2, pb: 1 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                        {selectedDate.replace(/-/g, '. ')} 진료
                    </Typography>
                </Box>
            )}

            {/* 예약 목록 */}
            <Box sx={{ px: 2, pb: 16 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={32} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        진료 일정을 불러오는 중 오류가 발생했습니다.
                    </Alert>
                ) : filteredAppointments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.disabled">
                            {selectedDate ? '이 날짜에 진료 일정이 없습니다.' : '등록된 진료 일정이 없습니다.'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            아래 + 버튼을 눌러 진료 일정을 추가해보세요
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={1.5}>
                        {filteredAppointments.map((appointment) => (
                            <AppointmentCard key={appointment.id} appointment={appointment} />
                        ))}
                    </Stack>
                )}
            </Box>

            {/* FAB - 새 예약 추가 */}
            <Fab
                color="primary"
                aria-label="새 진료 일정 추가"
                onClick={handleAddAppointment}
                sx={{
                    position: 'fixed',
                    bottom: 80,
                    right: 16,
                }}
            >
                <AddIcon />
            </Fab>
        </MainLayout>
    )
}

export default AppointmentListPage
