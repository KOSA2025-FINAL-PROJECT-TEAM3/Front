import { useNavigate } from 'react-router-dom'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Stack,
    Box,
} from '@mui/material'
import {
    CheckCircle as CheckCircleIcon,
    CameraAlt as CameraIcon,
} from '@mui/icons-material'
import AppButton from '@shared/components/mui/AppButton'

/**
 * 방문 완료 후 처방전 등록 유도 모달
 *
 * PRD US-S05: 완료 버튼 클릭 시 OCR 촬영 화면으로 유도
 *
 * @param {boolean} open - 모달 열림 상태
 * @param {() => void} onClose - 모달 닫기 핸들러
 * @param {Object} appointment - 완료된 예약 정보
 * @param {boolean} loading - 로딩 상태
 */
export const CompleteActionModal = ({
    open,
    onClose,
    appointment,
    loading = false,
}) => {
    const navigate = useNavigate()

    const handleGoToOCR = () => {
        // 병원 이름을 OCR 페이지로 전달하여 자동 입력되게 함
        const hospitalName = appointment?.hospitalName || ''
        navigate(`/ocr/scan`, {
            state: {
                hospitalName,
                fromAppointment: true,
                appointmentId: appointment?.id,
            },
        })
        onClose?.()
    }

    const handleLater = () => {
        onClose?.()
    }

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                // 배경 클릭이나 ESC로 닫기 허용
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                    onClose?.()
                }
            }}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    p: 1,
                },
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
                <Box
                    sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: 'success.50',
                        mb: 1,
                    }}
                >
                    <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
                    진료는 잘 받으셨나요?
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ textAlign: 'center', pt: 1 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    처방전을 바로 등록하면
                    <br />
                    복약 알림을 받으실 수 있어요.
                </Typography>

                {appointment?.hospitalName && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        spacing={1}
                        sx={{
                            p: 1.5,
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                        }}
                    >
                        <CameraIcon color="primary" fontSize="small" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {appointment.hospitalName} 처방전 등록
                        </Typography>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 3 }}>
                <AppButton
                    variant="primary"
                    fullWidth
                    onClick={handleGoToOCR}
                    disabled={loading}
                    startIcon={<CameraIcon />}
                >
                    처방전 등록하러 가기
                </AppButton>
                <AppButton
                    variant="ghost"
                    fullWidth
                    onClick={handleLater}
                    disabled={loading}
                >
                    나중에 하기
                </AppButton>
            </DialogActions>
        </Dialog>
    )
}

export default CompleteActionModal
