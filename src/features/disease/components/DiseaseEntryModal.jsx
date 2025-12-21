import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, Box, Alert } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import DiseaseForm from './DiseaseForm'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import { toast } from '@shared/components/toast/toastStore'
import logger from '@core/utils/logger'

export const DiseaseEntryModal = ({ open, onClose, targetUserId, targetUserName }) => {
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (formData) => {
        if (!targetUserId) {
            toast.error('대상 사용자 정보가 없습니다.')
            return
        }

        setSubmitting(true)
        try {
            await diseaseApiClient.create({
                ...formData,
                userId: targetUserId,
            })

            toast.success('질병 정보가 성공적으로 등록되었습니다.')
            onClose?.()
        } catch (error) {
            logger.error('질병 등록 실패:', error)
            toast.error('질병 등록에 실패했습니다.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography component="div" variant="h6" sx={{ fontWeight: 900 }}>
                    질병 등록
                </Typography>
                <IconButton onClick={onClose} disabled={submitting}>
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
                        <strong>{targetUserName}</strong> 님의 질병을 등록합니다
                    </Alert>
                )}
                <DiseaseForm
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    submitting={submitting}
                />
            </DialogContent>
        </Dialog>
    )
}
