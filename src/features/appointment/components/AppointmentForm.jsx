import { useState, useMemo, useEffect, useCallback } from 'react'
import {
    Box,
    TextField,
    Stack,
    Paper,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
} from '@mui/material'
import {
    LocalHospital as HospitalIcon,
    Schedule as ScheduleIcon,
    LocationOn as LocationIcon,
    Notes as NotesIcon,
    Search as SearchIcon,
} from '@mui/icons-material'
import AppButton from '@shared/components/mui/AppButton'
import { HospitalSearchModal } from './HospitalSearchModal'

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
 * ISO DateTime에서 날짜만 추출
 */
const extractDate = (dateTime) => {
    if (!dateTime) return ''
    return dateTime.split('T')[0]
}

/**
 * ISO DateTime에서 시간만 추출
 */
const extractTime = (dateTime) => {
    if (!dateTime) return ''
    const timePart = dateTime.split('T')[1]
    return timePart ? timePart.slice(0, 5) : ''
}

const initialFormState = {
    hospitalName: '',
    department: '',
    doctorName: '',
    visitDate: getTodayDate(),
    visitTime: getDefaultTime(),
    address: '',
    addressDetail: '',
    phoneNumber: '',
    memo: '',
}

/**
 * 병원 예약 폼 컴포넌트
 *
 * @param {Object} initialValues - 수정 시 초기값 (visitAt 포함)
 * @param {(data: Object) => Promise} onSubmit - 제출 핸들러
 * @param {() => void} onCancel - 취소 핸들러
 * @param {boolean} loading - 로딩 상태
 * @param {string} submitLabel - 제출 버튼 라벨
 * @param {number} targetUserId - 예약 대상 사용자 ID (대리 등록 시)
 * @param {string} initialDate - 초기 날짜 (YYYY-MM-DD) - 캘린더에서 날짜 선택 시 전달
 */
export const AppointmentForm = ({
    initialValues,
    onSubmit,
    onCancel,
    loading = false,
    submitLabel = '일정 등록',
    targetUserId,
    initialDate,
}) => {
    const [form, setForm] = useState(() => {
        if (initialValues) {
            return {
                hospitalName: initialValues.hospitalName || '',
                department: initialValues.department || '',
                doctorName: initialValues.doctorName || '',
                visitDate: extractDate(initialValues.visitAt),
                visitTime: extractTime(initialValues.visitAt),
                address: initialValues.address || '',
                addressDetail: initialValues.addressDetail || '',
                phoneNumber: initialValues.phoneNumber || '',
                memo: initialValues.memo || '',
            }
        }
        return {
            ...initialFormState,
            // initialDate가 있으면 해당 날짜 사용 (캘린더에서 선택 시)
            visitDate: initialDate || getTodayDate(),
        }
    })

    const [errors, setErrors] = useState({})

    // 병원 검색 모달 상태
    const [hospitalSearchOpen, setHospitalSearchOpen] = useState(false)

    // 병원 선택 시 폼 자동 입력
    const handleHospitalSelect = useCallback((hospital) => {
        setForm((prev) => ({
            ...prev,
            hospitalName: hospital.name || '',
            address: hospital.address || '',
            phoneNumber: hospital.phone || '',
        }))
        // 에러 클리어
        setErrors((prev) => ({ ...prev, hospitalName: null }))
    }, [])

    // initialValues 변경 시 폼 업데이트 (수정 모드)
    useEffect(() => {
        if (initialValues) {
            setForm({
                hospitalName: initialValues.hospitalName || '',
                department: initialValues.department || '',
                doctorName: initialValues.doctorName || '',
                visitDate: extractDate(initialValues.visitAt),
                visitTime: extractTime(initialValues.visitAt),
                address: initialValues.address || '',
                addressDetail: initialValues.addressDetail || '',
                phoneNumber: initialValues.phoneNumber || '',
                memo: initialValues.memo || '',
            })
        }
    }, [initialValues])

    // 유효성 검사
    const validate = () => {
        const newErrors = {}

        if (!form.hospitalName.trim()) {
            newErrors.hospitalName = '병원명을 입력해주세요.'
        }

        if (!form.visitDate) {
            newErrors.visitDate = '방문 날짜를 선택해주세요.'
        } else {
            const today = getTodayDate()
            if (form.visitDate < today) {
                newErrors.visitDate = '과거 날짜는 선택할 수 없습니다.'
            }
        }

        if (!form.visitTime) {
            newErrors.visitTime = '방문 시간을 선택해주세요.'
        }

        // 오늘 날짜면 시간도 현재 시간 이후인지 확인
        if (form.visitDate === getTodayDate() && form.visitTime) {
            const now = new Date()
            const inputTime = new Date()
            const [hours, minutes] = form.visitTime.split(':').map(Number)
            inputTime.setHours(hours, minutes, 0, 0)
            if (inputTime <= now) {
                newErrors.visitTime = '현재 시간 이후로 선택해주세요.'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const canSubmit = useMemo(
        () => form.hospitalName.trim() && form.visitDate && form.visitTime,
        [form.hospitalName, form.visitDate, form.visitTime]
    )

    const handleChange = (field) => (event) => {
        const value = event.target.value
        setForm((prev) => ({ ...prev, [field]: value }))
        // 에러 클리어
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }))
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!validate()) return

        const visitAt = combineDateTime(form.visitDate, form.visitTime)

        const payload = {
            hospitalName: form.hospitalName.trim(),
            department: form.department.trim() || null,
            doctorName: form.doctorName.trim() || null,
            visitAt,
            address: form.address.trim() || null,
            addressDetail: form.addressDetail.trim() || null,
            phoneNumber: form.phoneNumber.trim() || null,
            memo: form.memo.trim() || null,
        }

        // 대리 등록 시 userId 추가
        if (targetUserId) {
            payload.userId = targetUserId
        }

        await onSubmit?.(payload)
    }

    return (
        <>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    {/* 병원 정보 섹션 */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <HospitalIcon color="primary" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                병원 정보
                            </Typography>
                        </Stack>

                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <TextField
                                    label="붑원명"
                                    value={form.hospitalName}
                                    onChange={handleChange('hospitalName')}
                                    error={Boolean(errors.hospitalName)}
                                    helperText={errors.hospitalName}
                                    placeholder="예: 서울대학교붑원"
                                    required
                                    fullWidth
                                />
                                <AppButton
                                    variant="secondary"
                                    onClick={() => setHospitalSearchOpen(true)}
                                    sx={{
                                        mt: 1,
                                        minWidth: 'auto',
                                        px: 2,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <SearchIcon sx={{ mr: 0.5 }} />
                                    검색
                                </AppButton>
                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="진료과"
                                    value={form.department}
                                    onChange={handleChange('department')}
                                    placeholder="예: 내과"
                                    fullWidth
                                />
                                <TextField
                                    label="담당의"
                                    value={form.doctorName}
                                    onChange={handleChange('doctorName')}
                                    placeholder="예: 홍길동"
                                    fullWidth
                                />
                            </Stack>

                            <TextField
                                label="전화번호"
                                value={form.phoneNumber}
                                onChange={handleChange('phoneNumber')}
                                placeholder="예: 02-1234-5678"
                                fullWidth
                            />
                        </Stack>
                    </Paper>

                    {/* 날짜/시간 섹션 */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <ScheduleIcon color="primary" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                방문 일시
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <TextField
                                type="date"
                                label="날짜"
                                value={form.visitDate}
                                onChange={handleChange('visitDate')}
                                error={Boolean(errors.visitDate)}
                                helperText={errors.visitDate}
                                inputProps={{ min: getTodayDate() }}
                                InputLabelProps={{ shrink: true }}
                                required
                                fullWidth
                            />
                            <TextField
                                type="time"
                                label="시간"
                                value={form.visitTime}
                                onChange={handleChange('visitTime')}
                                error={Boolean(errors.visitTime)}
                                helperText={errors.visitTime}
                                InputLabelProps={{ shrink: true }}
                                required
                                fullWidth
                            />
                        </Stack>
                    </Paper>

                    {/* 위치 정보 섹션 (선택) */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <LocationIcon color="primary" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                위치 정보
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                (선택)
                            </Typography>
                        </Stack>

                        <Stack spacing={2}>
                            <TextField
                                label="주소"
                                value={form.address}
                                onChange={handleChange('address')}
                                placeholder="예: 서울시 종로구 대학로 101"
                                fullWidth
                            />
                            <TextField
                                label="상세 주소"
                                value={form.addressDetail}
                                onChange={handleChange('addressDetail')}
                                placeholder="예: 본관 3층"
                                fullWidth
                            />
                        </Stack>
                    </Paper>

                    {/* 메모 섹션 */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <NotesIcon color="primary" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                메모
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                (선택)
                            </Typography>
                        </Stack>

                        <TextField
                            value={form.memo}
                            onChange={handleChange('memo')}
                            placeholder="예: 공복 상태 유지, 신분증 지참"
                            multiline
                            minRows={2}
                            fullWidth
                        />
                    </Paper>

                    {/* 과거 날짜 경고 */}
                    {errors.visitDate && errors.visitDate.includes('과거') && (
                        <Alert severity="warning">
                            과거 날짜에는 진료 일정을 등록할 수 없습니다. 리마인더 기능에 집중하는 앱이기 때문입니다.
                        </Alert>
                    )}

                    {/* 액션 버튼 */}
                    <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ pt: 1 }}>
                        {onCancel && (
                            <AppButton variant="ghost" type="button" onClick={onCancel} disabled={loading}>
                                취소
                            </AppButton>
                        )}
                        <AppButton
                            variant="primary"
                            type="submit"
                            disabled={!canSubmit || loading}
                            loading={loading}
                        >
                            {submitLabel}
                        </AppButton>
                    </Stack>
                </Stack>
            </Box>

            {/* 붑원 검색 모달 */}
            <HospitalSearchModal
                open={hospitalSearchOpen}
                onClose={() => setHospitalSearchOpen(false)}
                onSelect={handleHospitalSelect}
            />
        </>
    )
}

export default AppointmentForm
