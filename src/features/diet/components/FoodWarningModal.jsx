/**
 * 식단 경고 모달 컴포넌트
 * - 최근 24시간 내 WARNING/DANGER 레벨 음식만 표시
 * - 대시보드에서 모달로 호출
 */

import { useState, useEffect, useMemo } from 'react'
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
    IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { dietApiClient } from '@/core/services/api/dietApiClient'
import { DIET_WARNING_FILTER } from '@config/constants'
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
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [logs, setLogs] = useState([])

    useEffect(() => {
        if (!open) return

        const fetchLogs = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await dietApiClient.getDietLogs(userId ? { userId } : undefined)
                setLogs(Array.isArray(data) ? data : [])
            } catch (err) {
                logger.error('Failed to fetch diet logs:', err)
                setError('식단 기록을 불러오는데 실패했습니다.')
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [open, userId])

    // 최근 24시간 내 WARNING/DANGER 레벨만 필터링
    const filteredLogs = useMemo(() => {
        const now = Date.now()
        const windowMs = DIET_WARNING_FILTER.HOURS_WINDOW * 60 * 60 * 1000

        return logs.filter((log) => {
            // 시간 필터
            const logTime = new Date(log.createdAt || log.loggedAt || log.logTime).getTime()
            if (isNaN(logTime)) return false
            const isWithinWindow = now - logTime < windowMs

            // 경고 레벨 필터
            const level = log.overallLevel?.toUpperCase?.() || log.overallLevel
            const hasWarning = DIET_WARNING_FILTER.WARNING_LEVELS.some(
                (wl) => wl.toUpperCase() === level || wl === log.overallLevel
            )

            return isWithinWindow && hasWarning
        }).map((log) => ({
            ...log,
            drugInteractions: parseJsonSafe(log.drugInteractions),
            diseaseInteractions: parseJsonSafe(log.diseaseInteractions),
        }))
    }, [logs])

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="span" sx={{ fontWeight: 900 }}>
                    🍽️ 식단 경고 (최근 {DIET_WARNING_FILTER.HOURS_WINDOW}시간)
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
                ) : filteredLogs.length === 0 ? (
                    <Alert severity="success">
                        최근 {DIET_WARNING_FILTER.HOURS_WINDOW}시간 내 경고할 음식이 없습니다. 안심하세요! 🎉
                    </Alert>
                ) : (
                    <Stack spacing={2}>
                        {filteredLogs.map((log, idx) => (
                            <Card key={log.id || idx} variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="h6" fontWeight="bold">
                                            {log.foodName}
                                        </Typography>
                                        <Chip
                                            label={getLevelLabel(log.overallLevel)}
                                            color={getLevelColor(log.overallLevel)}
                                            size="small"
                                        />
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {log.summary}
                                    </Typography>

                                    {/* 약물 상호작용 */}
                                    {log.drugInteractions?.length > 0 && (
                                        <Box mt={2}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                                                💊 약물 상호작용 ({log.drugInteractions.length})
                                            </Typography>
                                            <Stack spacing={1}>
                                                {log.drugInteractions.map((interaction, i) => (
                                                    <Alert
                                                        key={i}
                                                        severity={interaction.level === 'DANGER' ? 'error' : 'warning'}
                                                        sx={{ py: 0.5 }}
                                                    >
                                                        <Typography variant="body2">
                                                            <strong>{interaction.medicationName}</strong>: {interaction.description}
                                                        </Typography>
                                                    </Alert>
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}

                                    {/* 질병 상호작용 */}
                                    {log.diseaseInteractions?.length > 0 && (
                                        <Box mt={2}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                                                🏥 질병 관련 주의 ({log.diseaseInteractions.length})
                                            </Typography>
                                            <Stack spacing={1}>
                                                {log.diseaseInteractions.map((interaction, i) => (
                                                    <Alert
                                                        key={i}
                                                        severity={interaction.level === 'DANGER' ? 'error' : 'warning'}
                                                        sx={{ py: 0.5 }}
                                                    >
                                                        <Typography variant="body2">
                                                            <strong>{interaction.diseaseName}</strong>: {interaction.description}
                                                        </Typography>
                                                    </Alert>
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => {
                        onRecordDiet?.()
                        onClose()
                    }}
                    sx={{ fontWeight: 800, color: 'text.secondary' }}
                >
                    식단 기록하러 가기
                </Button>
                <Button onClick={onClose} sx={{ fontWeight: 800 }}>
                    닫기
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default FoodWarningModal
