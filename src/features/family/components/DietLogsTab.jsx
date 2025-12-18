
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Alert, Box, Chip, Paper, Stack, Typography } from '@mui/material'
import { dietApiClient } from '@core/services/api/dietApiClient'

const DietLogsTab = ({ userId }) => {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchLogs = async () => {
            if (!userId) return
            try {
                setLoading(true)
                setError(null)
                const data = await dietApiClient.getDietLogs({ userId })
                const logArray = Array.isArray(data) ? data : []

                // Sort by recordedAt (or createdAt) descending
                logArray.sort((a, b) => {
                    const dateA = new Date(a.recordedAt || a.createdAt)
                    const dateB = new Date(b.recordedAt || b.createdAt)
                    return dateB - dateA
                })

                setLogs(logArray)
            } catch (err) {
                console.error('Failed to fetch diet logs:', err)
                const status = err?.response?.status
                if (status === 401 || status === 403) {
                    setError('식단 기록 조회 권한이 없습니다.')
                } else {
                    setError('식단 기록을 불러오지 못했습니다.')
                }
                setLogs([])
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [userId])

    if (loading) {
        return (
            <Typography variant="body2" color="text.secondary">
                식단 기록을 불러오는 중...
            </Typography>
        )
    }
    if (error) {
        return <Alert severity="error">{error}</Alert>
    }
    if (logs.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderStyle: 'dashed', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    등록된 식단 기록이 없습니다.
                </Typography>
            </Paper>
        )
    }

    return (
        <Stack spacing={2}>
            {logs.map((log) => {
                // Parse interactions if needed (backend might return string or json)
                let drugInteractions = []
                let diseaseInteractions = []
                try {
                    drugInteractions = typeof log.drugInteractions === 'string' ? JSON.parse(log.drugInteractions) : log.drugInteractions || []
                } catch (e) {
                    console.warn('Failed to parse drugInteractions:', e)
                    drugInteractions = []
                }
                try {
                    diseaseInteractions = typeof log.diseaseInteractions === 'string' ? JSON.parse(log.diseaseInteractions) : log.diseaseInteractions || []
                } catch (e) {
                    console.warn('Failed to parse diseaseInteractions:', e)
                    diseaseInteractions = []
                }

                const overallLevel = log.overallLevel || log.analysisResult?.overallLevel
                const levelLabel = overallLevel ? getLevelLabel(overallLevel) : null
                const levelColor =
                    overallLevel === 'GOOD' || overallLevel === '좋음'
                        ? 'success'
                        : overallLevel === 'WARNING' || overallLevel === '주의'
                            ? 'warning'
                            : overallLevel === 'DANGER' || overallLevel === '위험' || overallLevel === '경고'
                                ? 'error'
                                : 'default'

                return (
                    <Paper key={log.id} variant="outlined" sx={{ borderRadius: 4, p: 2, borderColor: 'divider' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                            <Typography sx={{ fontWeight: 900 }}>{getMealTypeLabel(log.mealType)}</Typography>
                            <Typography variant="caption" color="text.disabled">
                                {formatDate(log.recordedAt || log.createdAt)}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1.5} alignItems="center">
                            {log.imageUrl && (
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        bgcolor: 'grey.100',
                                    }}
                                >
                                    <Box component="img" src={log.imageUrl} alt={log.foodName} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>
                                        {log.foodName}
                                    </Typography>
                                    {levelLabel ? (
                                        <Chip
                                            label={levelLabel}
                                            size="small"
                                            color={levelColor}
                                            variant={levelColor === 'default' ? 'outlined' : 'filled'}
                                            sx={{ fontWeight: 900 }}
                                        />
                                    ) : null}
                                </Stack>

                                {log.summary ? (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {log.summary}
                                    </Typography>
                                ) : null}

                                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                                    {drugInteractions.length > 0 ? (
                                        <Chip
                                            size="small"
                                            label={`💊 약물 ${drugInteractions.length}`}
                                            sx={{ bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}
                                        />
                                    ) : null}
                                    {diseaseInteractions.length > 0 ? (
                                        <Chip
                                            size="small"
                                            label={`🏥 질병 ${diseaseInteractions.length}`}
                                            sx={{ bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}
                                        />
                                    ) : null}
                                </Stack>
                            </Box>
                        </Stack>
                    </Paper>
                )
            })}
        </Stack>
    )
}

const getMealTypeLabel = (type) => {
    const map = {
        BREAKFAST: '아침',
        LUNCH: '점심',
        DINNER: '저녁',
        SNACK: '간식',
    }
    return map[type] || type
}

const getLevelLabel = (level) => {
    if (level === 'GOOD') return '좋음'
    if (level === 'WARNING') return '주의'
    if (level === 'DANGER') return '위험'
    return level
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

DietLogsTab.propTypes = {
    userId: PropTypes.number.isRequired,
}

export default DietLogsTab
