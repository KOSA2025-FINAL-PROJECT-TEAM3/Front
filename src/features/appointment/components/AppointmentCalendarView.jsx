import { useMemo, useCallback } from 'react'
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Stack,
    Badge,
    useTheme,
    alpha,
} from '@mui/material'
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/**
 * 월간 캘린더 그리드 생성
 * @param {number} year
 * @param {number} month - 1-12
 * @returns {Array<Array<Date|null>>} 6주 x 7일 배열
 */
const buildCalendarGrid = (year, month) => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const startDayOfWeek = firstDay.getDay() // 0-6 (일-토)
    const totalDays = lastDay.getDate()

    const grid = []
    let currentDay = 1

    for (let week = 0; week < 6; week++) {
        const row = []
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            const cellIndex = week * 7 + dayOfWeek
            if (cellIndex >= startDayOfWeek && currentDay <= totalDays) {
                row.push(new Date(year, month - 1, currentDay))
                currentDay++
            } else {
                row.push(null)
            }
        }
        grid.push(row)
        // 마지막 날을 채웠으면 더 이상 주 추가 안함
        if (currentDay > totalDays) break
    }

    return grid
}

/**
 * 날짜 키 생성 (YYYY-MM-DD)
 */
const dateKey = (date) => {
    if (!date) return null
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * 날짜가 오늘인지 확인
 */
const isToday = (date) => {
    if (!date) return false
    const today = new Date()
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    )
}

/**
 * 날짜가 과거인지 확인 (오늘 이전)
 */
const isPast = (date) => {
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
    return target < today
}

/**
 * 병원 예약 월간 캘린더 컴포넌트
 *
 * @param {number} year - 현재 연도
 * @param {number} month - 현재 월 (1-12)
 * @param {Array} calendarDays - API에서 받은 날짜별 예약 카운트 [{ date: 'YYYY-MM-DD', count: N }]
 * @param {string} selectedDate - 선택된 날짜 ('YYYY-MM-DD')
 * @param {(date: string) => void} onDateSelect - 날짜 선택 핸들러
 * @param {(year: number, month: number) => void} onMonthChange - 월 변경 핸들러
 * @param {boolean} loading - 로딩 상태
 */
export const AppointmentCalendarView = ({
    year,
    month,
    calendarDays = [],
    selectedDate,
    onDateSelect,
    onMonthChange,
    loading = false,
}) => {
    const theme = useTheme()

    // 월간 그리드 생성
    const calendarGrid = useMemo(() => buildCalendarGrid(year, month), [year, month])

    // 날짜별 예약 카운트 맵
    const countMap = useMemo(() => {
        const map = {}
        if (Array.isArray(calendarDays)) {
            calendarDays.forEach(({ date, count }) => {
                if (date && count > 0) {
                    map[date] = count
                }
            })
        }
        return map
    }, [calendarDays])

    // 이전/다음 월 이동
    const handlePrevMonth = useCallback(() => {
        const prevMonth = month === 1 ? 12 : month - 1
        const prevYear = month === 1 ? year - 1 : year
        onMonthChange?.(prevYear, prevMonth)
    }, [year, month, onMonthChange])

    const handleNextMonth = useCallback(() => {
        const nextMonth = month === 12 ? 1 : month + 1
        const nextYear = month === 12 ? year + 1 : year
        onMonthChange?.(nextYear, nextMonth)
    }, [year, month, onMonthChange])

    // 날짜 클릭
    const handleDateClick = useCallback(
        (date) => {
            if (!date) return
            const key = dateKey(date)
            onDateSelect?.(key)
        },
        [onDateSelect]
    )

    return (
        <Paper
            variant="outlined"
            sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: 3,
                opacity: loading ? 0.6 : 1,
                transition: 'opacity 0.2s',
            }}
        >
            {/* 헤더: 월 네비게이션 */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <IconButton onClick={handlePrevMonth} size="small">
                    <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {year}년 {month}월
                </Typography>
                <IconButton onClick={handleNextMonth} size="small">
                    <ChevronRightIcon />
                </IconButton>
            </Stack>

            {/* 요일 헤더 */}
            <Stack direction="row" sx={{ mb: 1 }}>
                {WEEKDAYS.map((day, idx) => (
                    <Box
                        key={day}
                        sx={{
                            flex: 1,
                            textAlign: 'center',
                            py: 0.5,
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 600,
                                color: idx === 0 ? 'error.main' : idx === 6 ? 'info.main' : 'text.secondary',
                            }}
                        >
                            {day}
                        </Typography>
                    </Box>
                ))}
            </Stack>

            {/* 날짜 그리드 */}
            {calendarGrid.map((week, weekIdx) => (
                <Stack key={weekIdx} direction="row">
                    {week.map((date, dayIdx) => {
                        const key = dateKey(date)
                        const count = countMap[key] || 0
                        const isSelected = selectedDate === key
                        const isTodayDate = isToday(date)
                        const isPastDate = isPast(date)

                        return (
                            <Box
                                key={dayIdx}
                                onClick={() => !isPastDate && handleDateClick(date)}
                                sx={{
                                    flex: 1,
                                    // aspectRatio: '1 / 1', // Too tall
                                    height: 44, // Fixed height for compact view
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: date && !isPastDate ? 'pointer' : 'default',
                                    borderRadius: 2,
                                    mx: 0.25,
                                    my: 0.25,
                                    transition: 'all 0.15s',
                                    opacity: isPastDate ? 0.4 : 1,
                                    bgcolor: isSelected
                                        ? 'primary.main'
                                        : isTodayDate
                                            ? alpha(theme.palette.primary.main, 0.1)
                                            : isPastDate
                                                ? alpha(theme.palette.grey[500], 0.08)
                                                : 'transparent',
                                    '&:hover': date && !isPastDate
                                        ? {
                                            bgcolor: isSelected
                                                ? 'primary.dark'
                                                : alpha(theme.palette.primary.main, 0.15),
                                        }
                                        : {},
                                }}
                            >
                                {date && (
                                    <>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: isTodayDate || isSelected ? 700 : 500,
                                                color: isSelected
                                                    ? 'primary.contrastText'
                                                    : dayIdx === 0
                                                        ? 'error.main'
                                                        : dayIdx === 6
                                                            ? 'info.main'
                                                            : 'text.primary',
                                            }}
                                        >
                                            {date.getDate()}
                                        </Typography>
                                        {/* 예약 있는 날짜에 Dot 표시 */}
                                        {count > 0 && (
                                            <Badge
                                                badgeContent={count > 3 ? '3+' : count}
                                                color={isSelected ? 'secondary' : 'primary'}
                                                sx={{
                                                    '& .MuiBadge-badge': {
                                                        position: 'relative',
                                                        transform: 'none',
                                                        fontSize: 9,
                                                        height: 14,
                                                        minWidth: 14,
                                                        mt: 0.25,
                                                    },
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </Box>
                        )
                    })}
                </Stack>
            ))}
        </Paper>
    )
}

export default AppointmentCalendarView
