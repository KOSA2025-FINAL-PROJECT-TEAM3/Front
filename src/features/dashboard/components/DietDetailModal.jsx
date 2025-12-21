import { useCallback, useEffect, useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    List,
    ListItem,
    ListItemText,
    Chip,
    CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import { format, subDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { dietApiClient } from '@core/services/api/dietApiClient'
import logger from '@core/utils/logger'

/**
 * DietDetailModal - 식단 상세 모달
 * 오늘/어제 날짜만 선택 가능하며 해당 날짜의 식단 기록을 표시합니다.
 */
export function DietDetailModal({ open, onClose, userId, userName }) {
    const [selectedDate, setSelectedDate] = useState('today')
    const [dietLogs, setDietLogs] = useState([])
    const [loading, setLoading] = useState(false)

    // today, yesterday를 렌더링마다 새로 만들지 않고 getDateString 내부에서 처리하거나
    // 컴포넌트 외부 상수로 정의하면 좋으나, 날짜 변경 대응을 위해 useMemo 사용
    // 혹은 단순히 getDateString 안에서 new Date() 호출 (가장 안전)

    // UI 표시용 날짜
    const [today] = useState(() => new Date())
    const [yesterday] = useState(() => subDays(new Date(), 1))

    const getDateString = useCallback((dateType) => {
        if (dateType === 'today') return format(new Date(), 'yyyy-MM-dd')
        return format(subDays(new Date(), 1), 'yyyy-MM-dd')
    }, [])

    const loadDietLogs = useCallback(async () => {
        if (!userId) return
        setLoading(true)
        try {
            const dateStr = getDateString(selectedDate)
            const response = await dietApiClient.getDietLogs({ date: dateStr, userId })
            setDietLogs(Array.isArray(response) ? response : response?.logs || [])
        } catch (error) {
            logger.warn('[DietDetailModal] Failed to load diet logs', error)
            setDietLogs([])
        } finally {
            setLoading(false)
        }
    }, [userId, selectedDate, getDateString])

    useEffect(() => {
        if (open) {
            loadDietLogs()
        }
    }, [open, loadDietLogs])

    const handleDateChange = (_, newValue) => {
        if (newValue) {
            setSelectedDate(newValue)
        }
    }

    const getMealTypeLabel = (mealType) => {
        const labels = {
            BREAKFAST: '아침',
            LUNCH: '점심',
            DINNER: '저녁',
            SNACK: '간식',
        }
        return labels[mealType] || mealType || '기타'
    }

    const getWarningColor = (level) => {
        if (level === 'HIGH' || level === 'DANGER') return 'error'
        if (level === 'MEDIUM' || level === 'WARNING') return 'warning'
        return 'default'
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                <RestaurantIcon sx={{ color: '#F59E0B' }} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {userName ? `${userName} 님의 식단 기록` : '식단 기록'}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <ToggleButtonGroup
                        value={selectedDate}
                        exclusive
                        onChange={handleDateChange}
                        size="small"
                        fullWidth
                        sx={{
                            '& .MuiToggleButton-root': {
                                fontWeight: 700,
                                py: 1,
                            },
                            '& .Mui-selected': {
                                bgcolor: '#FFFBEB !important',
                                color: '#F59E0B !important',
                                borderColor: '#F59E0B !important',
                            },
                        }}
                    >
                        <ToggleButton value="today">
                            오늘 ({format(today, 'M/d', { locale: ko })})
                        </ToggleButton>
                        <ToggleButton value="yesterday">
                            어제 ({format(yesterday, 'M/d', { locale: ko })})
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={32} sx={{ color: '#F59E0B' }} />
                    </Box>
                ) : dietLogs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <Typography>기록된 식단이 없습니다.</Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {dietLogs.map((log, index) => (
                            <ListItem
                                key={log.id || index}
                                sx={{
                                    bgcolor: '#F8FAFC',
                                    borderRadius: 2,
                                    mb: 1,
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    <Chip
                                        label={getMealTypeLabel(log.mealType)}
                                        size="small"
                                        sx={{ fontWeight: 700, bgcolor: '#FFFBEB', color: '#F59E0B' }}
                                    />
                                    {log.overallLevel && log.overallLevel !== 'SAFE' && (
                                        <Chip
                                            label={log.overallLevel}
                                            size="small"
                                            color={getWarningColor(log.overallLevel)}
                                            sx={{ fontWeight: 700 }}
                                        />
                                    )}
                                </Box>
                                <ListItemText
                                    primary={log.foodName || '음식명 없음'}
                                    secondary={log.notes || null}
                                    primaryTypographyProps={{ fontWeight: 700, mt: 0.5 }}
                                    secondaryTypographyProps={{ fontSize: 12 }}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default DietDetailModal
