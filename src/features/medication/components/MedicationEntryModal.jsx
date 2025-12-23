import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box, Alert } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import MedicationForm from './MedicationForm'
import { prescriptionApiClient } from '@core/services/api/prescriptionApiClient'
import { toast } from '@shared/components/toast/toastStore'
import { formatDate } from '@core/utils/formatting'
import logger from '@core/utils/logger'

export const MedicationEntryModal = ({ open, onClose, targetUserId, targetUserName }) => {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData) => {
        if (!targetUserId) {
            toast.error('대상 사용자 정보가 없습니다.')
            return
        }

        setLoading(true)
        try {
            // 1. Convert form data to PrescriptionRequest format
            // MedicationForm generates a single medication object structure, but backend expects strict DTO

            const intakeTimes = (formData.schedules || [])
                .map(s => s.time)
                .filter(Boolean)
                .sort()

            // Deduplicate times
            const uniqueIntakeTimes = [...new Set(intakeTimes)]

            if (uniqueIntakeTimes.length === 0) {
                toast.error('최소 1개 이상의 복용 시간을 설정해주세요.')
                setLoading(false)
                return
            }

            const medicationPayload = {
                name: formData.name,
                category: formData.ingredient || '기타', // DTO requires category/ingredient
                dosageAmount: 1, // Default 1 tablet per intake if not specified strictly
                frequency: uniqueIntakeTimes.length,
                dosePerIntake: 1, // Default
                totalIntakes: parseInt(formData.quantity) || 30,
                daysOfWeek: null, // "Quick Add" assumes every day for now, or we can parse schedules more deeply if mixed
                intakeTimeIndices: null, // Apply to all defined times
                notes: formData.notes,
                imageUrl: null,
            }

            // If needed, we can parse `formData.schedules` more accurately to determine `daysOfWeek`.
            // For simplicity in "Quick Add", if all schedules have same days, use that.
            // Else default to Every Day (null).
            const allDays = (formData.schedules || []).map(s => s.daysOfWeek)
            const firstDaySet = allDays[0]
            const isUniform = allDays.every(d => d === firstDaySet)
            if (isUniform && firstDaySet) {
                medicationPayload.daysOfWeek = firstDaySet
            }

            // Calculate endDate if missing (Default 30 days)
            let endDate = formData.endDate
            if (!endDate && formData.startDate) {
                const start = new Date(formData.startDate)
                const end = new Date(start)
                end.setDate(start.getDate() + 30) // Default 30 days
                endDate = formatDate(end)
            } else if (!endDate) {
                // Fallback if both missing
                const today = new Date()
                const end = new Date(today)
                end.setDate(today.getDate() + 30)
                endDate = formatDate(end)
            }

            const prescriptionPayload = {
                pharmacyName: '직접 등록',
                hospitalName: '직접 등록',
                startDate: formData.startDate || formatDate(new Date()),
                endDate: endDate,
                intakeTimes: uniqueIntakeTimes,
                medications: [medicationPayload],
                notes: formData.notes,
            }

            await prescriptionApiClient.createPrescription(prescriptionPayload, targetUserId)

            toast.success('약이 성공적으로 등록되었습니다.')
            onClose?.()
        } catch (error) {
            logger.error('약 등록 실패:', error)
            toast.error(error.message || '약 등록에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography component="div" variant="h6" sx={{ fontWeight: 900 }}>
                    약 등록 (직접 입력)
                </Typography>
                <IconButton onClick={onClose} disabled={loading}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                {targetUserName && (
                    <Alert
                        severity="info"
                        icon={<PersonIcon />}
                        sx={{
                            mb: 2,
                            fontWeight: 700,
                            bgcolor: '#EEF2FF',
                            color: '#4F46E5',
                            border: '1px solid #C7D2FE'
                        }}
                    >
                        <strong>{targetUserName}</strong> 님에게 약을 등록합니다
                    </Alert>
                )}
                <MedicationForm
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    loading={loading}
                    submitLabel="등록하기"
                    // We can provide initial values for simplified "Quick Add" experience if needed
                    initialValues={{
                        startDate: formatDate(new Date()),
                        // Default 7 days?
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}
