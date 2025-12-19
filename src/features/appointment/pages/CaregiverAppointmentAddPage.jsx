import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Box,
    Typography,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Stack,
    CircularProgress,
} from '@mui/material'
import { ArrowBack as ArrowBackIcon, Person as PersonIcon } from '@mui/icons-material'
import { useAppointmentStore } from '../store/appointmentStore'
import { AppointmentForm } from '../components/AppointmentForm'
import { useFamilyStore } from '@features/family/store/familyStore'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'

const EMPTY_FAMILY_GROUPS = []

/**
 * 보호자 전용 병원 예약 등록 페이지
 * - 어르신 선택 드롭다운 제공
 * - 선택한 어르신의 예약을 대리 등록
 */
const CaregiverAppointmentAddPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { createAppointment, loading } = useAppointmentStore()

    // CaregiverDashboard에서 전달받은 targetUserId
    const initialTargetUserId = location.state?.targetUserId || ''
    const initialTargetUserName = location.state?.targetUserName || ''

    // 가족 그룹에서 SENIOR 역할 멤버 목록 가져오기
    const familyGroups = useFamilyStore((state) => state.familyGroups) ?? EMPTY_FAMILY_GROUPS
    const selectedGroupId = useFamilyStore((state) => state.selectedGroupId)
    const initialized = useFamilyStore((state) => state.initialized)

    // 선택된 그룹의 시니어 멤버들만 필터링
    const seniorMembers = useMemo(() => {
        const currentGroup = familyGroups.find((g) => g.id === selectedGroupId)
        if (!currentGroup?.members) return []
        return currentGroup.members.filter((m) => m.role === 'SENIOR')
    }, [familyGroups, selectedGroupId])

    // 선택된 어르신 ID (초기값: CaregiverDashboard에서 전달받은 값)
    const [targetUserId, setTargetUserId] = useState(initialTargetUserId)

    // 시니어가 1명뿐이면 자동 선택 (초기값이 없을 때만)
    useEffect(() => {
        if (seniorMembers.length === 1 && !targetUserId) {
            setTargetUserId(seniorMembers[0].userId)
        }
    }, [seniorMembers, targetUserId])

    const handleSubmit = async (payload) => {
        if (!targetUserId) {
            toast.warning('진료 일정 대상 어르신을 선택해주세요.')
            return
        }

        try {
            const data = { ...payload, userId: targetUserId }
            await createAppointment(data)
            toast.success('진료 일정이 등록되었습니다.')
            navigate('/appointments')
        } catch (error) {
            logger.error('[CaregiverAppointmentAddPage] createAppointment failed:', error)
            toast.error('진료 일정 등록에 실패했습니다.')
        }
    }

    const handleCancel = () => {
        navigate(-1)
    }

    const handleTargetChange = (event) => {
        setTargetUserId(event.target.value)
    }

    // familyStore 초기화 대기
    if (!initialized) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    // 시니어가 없으면 안내 메시지
    if (seniorMembers.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning">
                    등록된 어르신이 없습니다. 먼저 가족 그룹에 시니어를 초대해주세요.
                </Alert>
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
                    어르신 진료 일정 등록
                </Typography>
            </Box>

            {/* 어르신 선택 */}
            <Box sx={{ p: 2, pb: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        진료 대상 선택
                    </Typography>
                </Stack>
                <FormControl fullWidth required>
                    <InputLabel id="target-senior-label">어르신 선택</InputLabel>
                    <Select
                        labelId="target-senior-label"
                        value={targetUserId}
                        onChange={handleTargetChange}
                        label="어르신 선택"
                    >
                        {seniorMembers.map((member) => (
                            <MenuItem key={member.userId} value={member.userId}>
                                {member.name} {member.email && `(${member.email})`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* 폼 */}
            <Box sx={{ p: 2 }}>
                <AppointmentForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    submitLabel="일정 등록"
                    targetUserId={targetUserId}
                />
            </Box>
        </Box>
    )
}

export default CaregiverAppointmentAddPage
