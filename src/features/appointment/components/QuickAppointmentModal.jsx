import { useState, useMemo, useCallback } from 'react'
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Paper,
    Typography,
    IconButton,
    Chip,
} from '@mui/material'
import {
    Close as CloseIcon,
    LocalHospital as HospitalIcon,
    Schedule as ScheduleIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
} from '@mui/icons-material'
import AppButton from '@shared/components/mui/AppButton'
import { useAppointmentStore } from '../store/appointmentStore'
import { useAuthStore } from '@features/auth/store/authStore'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'

/**
 * 오늘 날짜(YYYY-MM-DD) 계산
 */
const getTodayDate = () => new Date().toISOString().split('T')[0]

/**
 * 현재 시간(HH:mm) 계산 (1시간 뒤로 기본값)
 */
const getDefaultTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    return now.toTimeString().slice(0, 5)
}

/**
 * 날짜+시간을 ISO 형식으로 결합
 */
const combineDateTime = (date, time) => {
    if (!date || !time) return null
    return `${date}T${time}:00`
}

/**
 * 카카오 장소 카테고리에서 진료과 추출
 * 예: "의료,건강 > 병원 > 정형외과" → "정형외과"
 */
const extractDepartment = (categoryName) => {
    if (!categoryName) return ''
    const parts = categoryName.split('>').map((s) => s.trim())
    // 마지막 요소가 진료과인 경우가 많음
    return parts[parts.length - 1] || ''
}

/**
 * 지도 검색 결과에서 바로 예약 등록하는 경량 모달
 * 
 * @param {boolean} open - 모달 열림 상태
 * @param {() => void} onClose - 모달 닫기 핸들러
 * @param {Object} placeData - 카카오 Places API 결과 객체
 * @param {() => void} onSuccess - 예약 성공 시 콜백 (선택)
 */
export const QuickAppointmentModal = ({ open, onClose, placeData, onSuccess }) => {
    const { user } = useAuthStore()
    const { createAppointment, loading } = useAppointmentStore()

    // 폼 상태 (날짜/시간/메모만 사용자 입력)
    const [visitDate, setVisitDate] = useState(getTodayDate())
    const [visitTime, setVisitTime] = useState(getDefaultTime())
    const [memo, setMemo] = useState('')
    const [errors, setErrors] = useState({})

    // placeData에서 병원 정보 추출
    const hospitalInfo = useMemo(() => {
        if (!placeData) return null
        return {
            name: placeData.place_name || '',
            address: placeData.road_address_name || placeData.address_name || '',
            phone: placeData.phone || '',
            latitude: parseFloat(placeData.y) || null,
            longitude: parseFloat(placeData.x) || null,
            department: extractDepartment(placeData.category_name),
        }
    }, [placeData])

    // 유효성 검사
    const validate = useCallback(() => {
        const newErrors = {}

        if (!visitDate) {
            newErrors.visitDate = '방문 날짜를 선택해주세요.'
        } else if (visitDate < getTodayDate()) {
            newErrors.visitDate = '과거 날짜는 선택할 수 없습니다.'
        }

        if (!visitTime) {
            newErrors.visitTime = '방문 시간을 선택해주세요.'
        }

        // 오늘 날짜면 시간도 현재 시간 이후인지 확인
        if (visitDate === getTodayDate() && visitTime) {
            const now = new Date()
            const inputTime = new Date()
            const [hours, minutes] = visitTime.split(':').map(Number)
            inputTime.setHours(hours, minutes, 0, 0)
            if (inputTime <= now) {
                newErrors.visitTime = '현재 시간 이후로 선택해주세요.'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [visitDate, visitTime])

    const canSubmit = useMemo(
        () => hospitalInfo && visitDate && visitTime,
        [hospitalInfo, visitDate, visitTime]
    )

    const handleSubmit = async () => {
        if (!validate() || !hospitalInfo) return

        const visitAt = combineDateTime(visitDate, visitTime)

        const payload = {
            userId: user?.id,
            hospitalName: hospitalInfo.name,
            department: hospitalInfo.department || null,
            visitAt,
            address: hospitalInfo.address || null,
            phoneNumber: hospitalInfo.phone || null,
            latitude: hospitalInfo.latitude,
            longitude: hospitalInfo.longitude,
            memo: memo.trim() || null,
        }

        try {
            await createAppointment(payload)
            toast.success(`${hospitalInfo.name} 예약이 등록되었습니다.`)

            // 상태 초기화
            setVisitDate(getTodayDate())
            setVisitTime(getDefaultTime())
            setMemo('')
            setErrors({})

            onClose?.()
            onSuccess?.()
        } catch (error) {
            logger.error('[QuickAppointmentModal] createAppointment failed:', error)
            toast.error('예약 등록에 실패했습니다.')
        }
    }

    const handleClose = () => {
        setErrors({})
        onClose?.()
    }

    if (!hospitalInfo) return null

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                <HospitalIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
                    빠른 예약 등록
                </Typography>
                <IconButton onClick={handleClose} edge="end" size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5}>
                    {/* 병원 정보 (읽기 전용) */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                        }}
                    >
                        <Stack spacing={1}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {hospitalInfo.name}
                            </Typography>
                            {hospitalInfo.department && (
                                <Chip
                                    label={hospitalInfo.department}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ width: 'fit-content' }}
                                />
                            )}
                            {hospitalInfo.address && (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <LocationIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        {hospitalInfo.address}
                                    </Typography>
                                </Stack>
                            )}
                            {hospitalInfo.phone && (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <PhoneIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                        {hospitalInfo.phone}
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>
                    </Paper>

                    {/* 날짜/시간 선택 */}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <ScheduleIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                방문 일시
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                type="date"
                                label="날짜"
                                value={visitDate}
                                onChange={(e) => {
                                    setVisitDate(e.target.value)
                                    if (errors.visitDate) setErrors((prev) => ({ ...prev, visitDate: null }))
                                }}
                                error={Boolean(errors.visitDate)}
                                helperText={errors.visitDate}
                                inputProps={{ min: getTodayDate() }}
                                InputLabelProps={{ shrink: true }}
                                required
                                fullWidth
                                size="small"
                            />
                            <TextField
                                type="time"
                                label="시간"
                                value={visitTime}
                                onChange={(e) => {
                                    setVisitTime(e.target.value)
                                    if (errors.visitTime) setErrors((prev) => ({ ...prev, visitTime: null }))
                                }}
                                error={Boolean(errors.visitTime)}
                                helperText={errors.visitTime}
                                InputLabelProps={{ shrink: true }}
                                required
                                fullWidth
                                size="small"
                            />
                        </Stack>
                    </Box>

                    {/* 메모 (선택) */}
                    <TextField
                        label="메모 (선택)"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="예: 공복 상태 유지, 신분증 지참"
                        multiline
                        minRows={2}
                        fullWidth
                        size="small"
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <AppButton variant="ghost" onClick={handleClose} disabled={loading}>
                    취소
                </AppButton>
                <AppButton
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!canSubmit || loading}
                    loading={loading}
                >
                    예약 등록
                </AppButton>
            </DialogActions>
        </Dialog>
    )
}

export default QuickAppointmentModal
