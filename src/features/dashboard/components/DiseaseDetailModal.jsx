import { useCallback, useEffect, useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Chip,
    CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import { diseaseApiClient } from '@core/services/api/diseaseApiClient'
import logger from '@core/utils/logger'

/**
 * DiseaseDetailModal - 질병 상세 모달
 * 사용자가 관리 중인 질병 목록을 표시합니다.
 */
export function DiseaseDetailModal({ open, onClose, userId, userName }) {
    const [diseases, setDiseases] = useState([])
    const [loading, setLoading] = useState(false)

    const loadDiseases = useCallback(async () => {
        if (!userId) return
        setLoading(true)
        try {
            const response = await diseaseApiClient.listByUser(userId)
            setDiseases(Array.isArray(response) ? response : response?.diseases || [])
        } catch (error) {
            logger.warn('[DiseaseDetailModal] Failed to load diseases', error)
            setDiseases([])
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        if (open) {
            loadDiseases()
        }
    }, [open, loadDiseases])

    const getSeverityColor = (severity) => {
        if (severity === 'HIGH' || severity === 'SEVERE') return 'error'
        if (severity === 'MEDIUM' || severity === 'MODERATE') return 'warning'
        return 'info'
    }

    const getSeverityLabel = (severity) => {
        const labels = {
            HIGH: '심각',
            SEVERE: '심각',
            MEDIUM: '보통',
            MODERATE: '보통',
            LOW: '경미',
            MILD: '경미',
        }
        return labels[severity] || severity || ''
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
                <HealthAndSafetyIcon sx={{ color: '#EF4444' }} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {userName ? `${userName} 님의 질병 관리` : '질병 관리'}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={32} sx={{ color: '#EF4444' }} />
                    </Box>
                ) : diseases.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        <Typography>등록된 질병이 없습니다.</Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            질병 기록은 약물 상호작용 경고에 활용됩니다.
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {diseases.map((disease, index) => (
                            <ListItem
                                key={disease.id || index}
                                sx={{
                                    bgcolor: '#FEF2F2',
                                    borderRadius: 2,
                                    mb: 1,
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    <Typography sx={{ fontWeight: 900, flex: 1 }}>
                                        {disease.name || disease.diseaseName || '질병명 없음'}
                                    </Typography>
                                    {disease.severity && (
                                        <Chip
                                            label={getSeverityLabel(disease.severity)}
                                            size="small"
                                            color={getSeverityColor(disease.severity)}
                                            sx={{ fontWeight: 700 }}
                                        />
                                    )}
                                </Box>
                                <ListItemText
                                    secondary={
                                        <>
                                            {disease.diagnosedDate && (
                                                <Typography component="span" variant="caption" sx={{ mr: 2 }}>
                                                    진단일: {disease.diagnosedDate}
                                                </Typography>
                                            )}
                                            {disease.notes && (
                                                <Typography component="span" variant="caption">
                                                    {disease.notes}
                                                </Typography>
                                            )}
                                        </>
                                    }
                                    secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default DiseaseDetailModal
