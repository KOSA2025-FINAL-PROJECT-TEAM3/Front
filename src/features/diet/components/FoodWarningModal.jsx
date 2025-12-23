/**
 * 식단 경고/분석 모달 컴포넌트
 * - 가장 최근 식단 기록의 상세 분석 결과(약물/질병 상호작용)를 표시
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@config/routes.config'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Alert,
    Box,
    Typography,
    Chip,
    Stack,
    Card,
    CardContent,
    Divider,
    IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { dietApiClient } from '@/core/services/api/dietApiClient'
import logger from '@core/utils/logger'

const getLevelColor = (level) => {
    const normalized = level?.toUpperCase?.() || level
    switch (normalized) {
        case 'DANGER':
        case '경고':
            return 'error'
        case 'WARNING':
        case '주의':
            return 'warning'
        case 'GOOD':
        case '안전':
            return 'success'
        default:
            return 'default'
    }
}

const getLevelLabel = (level) => {
    const normalized = level?.toUpperCase?.() || level
    switch (normalized) {
        case 'DANGER':
            return '경고'
        case 'WARNING':
            return '주의'
        case 'GOOD':
            return '안전'
        default:
            return level
    }
}

const parseJsonSafe = (value, fallback = []) => {
    if (!value) return fallback
    if (typeof value !== 'string') return value
    try {
        return JSON.parse(value)
    } catch (e) {
        logger.error('Failed to parse JSON', e)
        return fallback
    }
}

export const FoodWarningModal = ({ open, onClose, userId, onRecordDiet }) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [recentLog, setRecentLog] = useState(null)

    useEffect(() => {
        if (!open) return

        const fetchLatestLog = async () => {
            try {
                setLoading(true)
                setError(null)
                // 단순히 가장 최근 로그 1개만 가져오거나 리스트 중 0번째 사용
                const data = await dietApiClient.getDietLogs(userId ? { userId } : undefined)

                if (Array.isArray(data) && data.length > 0) {
                    const latest = data[0]
                    setRecentLog({
                        ...latest,
                        drugInteractions: parseJsonSafe(latest.drugInteractions),
                        diseaseInteractions: parseJsonSafe(latest.diseaseInteractions),
                    })
                } else {
                    setRecentLog(null)
                }
            } catch (err) {
                logger.error('Failed to fetch diet logs:', err)
                setError('식단 기록을 불러오는데 실패했습니다.')
            } finally {
                setLoading(false)
            }
        }

        fetchLatestLog()
    }, [open, userId])

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="span" sx={{ fontWeight: 900 }}>
                    🍽️ 최근 식단 분석 결과
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : !recentLog ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="text.secondary" gutterBottom>
                            아직 기록된 식단이 없습니다.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            식단을 기록하고 AI 분석 결과를 확인해보세요!
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={3}>
                        {/* Main Summary Card */}
                        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'primary.light', borderWidth: 1 }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="h6" fontWeight="bold">
                                        {recentLog.foodName}
                                    </Typography>
                                    <Chip
                                        label={getLevelLabel(recentLog.overallLevel)}
                                        color={getLevelColor(recentLog.overallLevel)}
                                        size="small"
                                    />
                                </Box>
                                <Stack direction="row" spacing={1} mb={2}>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(recentLog.createdAt || recentLog.loggedAt).toLocaleString('ko-KR')}
                                    </Typography>
                                    <Divider orientation="vertical" flexItem />
                                    <Typography variant="caption" color="text.secondary">
                                        {recentLog.mealType}
                                    </Typography>
                                </Stack>

                                <Typography variant="body2" color="text.primary" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                                    {recentLog.summary}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Interactions */}
                        {(recentLog.drugInteractions?.length > 0 || recentLog.diseaseInteractions?.length > 0) ? (
                            <Box>
                                {/* Drug Interactions */}
                                {recentLog.drugInteractions?.length > 0 && (
                                    <Box mb={2}>
                                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                                            💊 약물 상호작용
                                            <Chip label={recentLog.drugInteractions.length} size="small" color="error" variant="outlined" />
                                        </Typography>
                                        <Stack spacing={1}>
                                            {recentLog.drugInteractions.map((interaction, idx) => (
                                                <Alert
                                                    key={idx}
                                                    severity={interaction.level === 'DANGER' ? 'error' : 'warning'}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {interaction.medicationName} ({getLevelLabel(interaction.level)})
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        {interaction.description}
                                                    </Typography>
                                                    {interaction.recommendation && (
                                                        <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                            💡 {interaction.recommendation}
                                                        </Typography>
                                                    )}
                                                </Alert>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                {/* Disease Interactions */}
                                {recentLog.diseaseInteractions?.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                                            🏥 질병 관련 주의사항
                                            <Chip label={recentLog.diseaseInteractions.length} size="small" color="warning" variant="outlined" />
                                        </Typography>
                                        <Stack spacing={1}>
                                            {recentLog.diseaseInteractions.map((interaction, idx) => (
                                                <Alert
                                                    key={idx}
                                                    severity={interaction.level === 'DANGER' ? 'error' : 'warning'}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {interaction.diseaseName} ({getLevelLabel(interaction.level)})
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        {interaction.description}
                                                    </Typography>
                                                    {interaction.recommendation && (
                                                        <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                            💡 {interaction.recommendation}
                                                        </Typography>
                                                    )}
                                                </Alert>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                                발견된 위험 상호작용이 없습니다. 안심하고 드셔도 됩니다!
                            </Alert>
                        )}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => {
                        navigate(ROUTE_PATHS.dietWarning)
                        onClose()
                    }}
                    sx={{ fontWeight: 800, color: 'primary.main' }}
                >
                    식단 기록 보기
                </Button>
                <Button
                    onClick={() => {
                        onRecordDiet?.()
                        onClose()
                    }}
                    sx={{ fontWeight: 800, color: 'primary.main' }}
                >
                    새로운 식단 기록하기
                </Button>
                <Button onClick={onClose} sx={{ fontWeight: 800 }}>
                    닫기
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default FoodWarningModal
