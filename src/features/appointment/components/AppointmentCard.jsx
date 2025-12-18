import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Paper,
    Stack,
    Typography,
    Chip,
    Box,
    IconButton,
} from '@mui/material'
import {
    LocalHospital as HospitalIcon,
    Schedule as ScheduleIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'

/**
 * D-Day 계산
 * @param {string} visitAt - ISO 날짜 문자열
 * @returns {{ label: string, daysRemaining: number }}
 */
const calcDDay = (visitAt) => {
    if (!visitAt) return { label: '', daysRemaining: null }

    const visit = new Date(visitAt)
    const today = new Date()

    // 시간 제거하고 날짜만 비교
    visit.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffTime = visit.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return { label: '오늘', daysRemaining: 0 }
    if (diffDays === 1) return { label: '내일', daysRemaining: 1 }
    if (diffDays === -1) return { label: '어제', daysRemaining: -1 }
    if (diffDays > 0) return { label: `D-${diffDays}`, daysRemaining: diffDays }
    return { label: `D+${Math.abs(diffDays)}`, daysRemaining: diffDays }
}

/**
 * 상태별 색상 설정
 * PRD: SCHEDULED=파랑, COMPLETED=초록, EXPIRED=주황, CANCELLED=회색
 */
const STATUS_CONFIG = {
    SCHEDULED: { color: 'info', label: '예정', bgColor: 'info.50' },
    COMPLETED: { color: 'success', label: '완료', bgColor: 'success.50' },
    EXPIRED: { color: 'warning', label: '만료', bgColor: 'warning.50' },
    CANCELLED: { color: 'default', label: '취소', bgColor: 'grey.100' },
}

/**
 * 시간 포맷팅 (예: 오후 2:30)
 */
const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

/**
 * 날짜 포맷팅 (예: 12월 25일 수요일)
 */
const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    })
}

/**
 * 병원 예약 카드 컴포넌트
 * @param {Object} appointment - 예약 데이터
 * @param {Function} onClick - 클릭 핸들러 (없으면 상세 페이지로 이동)
 * @param {boolean} compact - 컴팩트 모드 (대시보드 위젯용)
 */
export const AppointmentCard = ({ appointment, onClick, compact = false }) => {
    const navigate = useNavigate()

    const { label: dDayLabel, daysRemaining } = useMemo(
        () => calcDDay(appointment?.visitAt),
        [appointment?.visitAt]
    )

    const statusConfig = STATUS_CONFIG[appointment?.status] || STATUS_CONFIG.SCHEDULED
    const isCancelled = appointment?.status === 'CANCELLED'

    const handleClick = () => {
        if (onClick) {
            onClick(appointment)
        } else if (appointment?.id) {
            navigate(`/appointments/${appointment.id}`)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
        }
    }

    if (!appointment) return null

    return (
        <Paper
            variant="outlined"
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            sx={{
                p: compact ? 1.5 : 2,
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: isCancelled ? 0.6 : 1,
                textDecoration: isCancelled ? 'line-through' : 'none',
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    borderColor: 'primary.main',
                },
                '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                },
            }}
        >
            <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                {/* 병원 아이콘 */}
                <Box
                    sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: statusConfig.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <HospitalIcon color={statusConfig.color} />
                </Box>

                {/* 메인 컨텐츠 */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* 병원명 + D-Day 배지 */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                            variant={compact ? 'body1' : 'subtitle1'}
                            sx={{
                                fontWeight: 700,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {appointment.hospitalName}
                        </Typography>

                        {/* D-Day 배지 */}
                        {dDayLabel && (
                            <Chip
                                label={dDayLabel}
                                size="small"
                                color={
                                    daysRemaining === 0
                                        ? 'error'
                                        : daysRemaining === 1
                                            ? 'warning'
                                            : daysRemaining > 1
                                                ? 'info'
                                                : 'default'
                                }
                                sx={{ fontWeight: 700, height: 22, fontSize: 11 }}
                            />
                        )}
                    </Stack>

                    {/* 진료과/담당의 (compact 모드에서는 숨김) */}
                    {!compact && appointment.department && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.25 }}
                        >
                            {appointment.department}
                            {appointment.doctorName && ` · ${appointment.doctorName}`}
                        </Typography>
                    )}

                    {/* 날짜/시간 정보 */}
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
                        <ScheduleIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {compact ? formatTime(appointment.visitAt) : `${formatDate(appointment.visitAt)} ${formatTime(appointment.visitAt)}`}
                        </Typography>
                    </Stack>
                </Box>

                {/* 상태 칩 + 화살표 */}
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Chip
                        label={statusConfig.label}
                        size="small"
                        color={statusConfig.color}
                        variant="outlined"
                        sx={{ fontWeight: 700, height: 24 }}
                    />
                    <IconButton size="small" sx={{ color: 'text.disabled' }}>
                        <ChevronRightIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>

            {/* 메모 (compact 모드에서는 숨김) */}
            {!compact && appointment.memo && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        mt: 1,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    📝 {appointment.memo}
                </Typography>
            )}
        </Paper>
    )
}

export default AppointmentCard
