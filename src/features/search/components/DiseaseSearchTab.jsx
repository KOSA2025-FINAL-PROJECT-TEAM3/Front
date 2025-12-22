import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'

import { ROUTE_PATHS } from '@config/routes.config'
import { useSearchHistoryStore } from '@features/search/store/searchHistoryStore'
import { searchApiClient } from '@core/services/api/searchApiClient'
import logger from '@core/utils/logger'

// Styles
const SEARCH_TAB_STYLES = {
    inputPaper: {
        p: 2,
        borderRadius: 3,
        bgcolor: 'grey.50'
    },
    registerButton: {
        fontWeight: 900,
        minWidth: 100,
        bgcolor: 'success.main',
        '&:hover': { bgcolor: 'success.dark' }
    },
    googleButton: {
        fontWeight: 900,
        minWidth: 100,
        color: 'success.main',
        borderColor: 'success.main',
        '&:hover': {
            borderColor: 'success.dark',
            bgcolor: 'success.light',
            opacity: 0.1
        }
    },
    aiButton: {
        fontWeight: 900,
        minWidth: 100
    },
    loadingPaper: {
        p: 3,
        borderRadius: 3,
        textAlign: 'center',
        color: 'text.secondary',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    resultPaper: {
        p: 2.5,
        borderRadius: 3,
        height: '100%',
        overflowY: 'auto'
    },
    aiTitle: {
        fontWeight: 900,
        color: 'success.main',
        mb: 1
    },
    emptyPaper: {
        p: 3,
        borderRadius: 3,
        textAlign: 'center',
        color: 'text.secondary',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
}

export const DiseaseSearchTab = ({ autoFocus = false, layout = 'page', recentSection = null, onRequestClose, targetUserId, targetUserName } = {}) => {
    const navigate = useNavigate()
    const { record, consumeRequest } = useSearchHistoryStore((state) => ({
        record: state.record,
        consumeRequest: state.consumeRequest,
    }))

    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(false)
    const [aiResult, setAiResult] = useState(null)
    const [error, setError] = useState(null)

    // 1. Register (Navigate to DiseasePage)
    const handleRegister = useCallback(() => {
        if (!keyword.trim()) return
        record('disease', keyword)
        onRequestClose?.()
        navigate(ROUTE_PATHS.disease, { state: { autoCreate: keyword, targetUserId, targetUserName } })
    }, [keyword, navigate, record, onRequestClose, targetUserId, targetUserName])

    // 2. Register from AI result
    const handleRegisterFromAi = useCallback(() => {
        if (!aiResult?.name) return
        record('disease', aiResult.name)
        onRequestClose?.()
        navigate(ROUTE_PATHS.disease, { state: { autoCreate: aiResult.name, targetUserId, targetUserName } })
    }, [aiResult, navigate, record, onRequestClose, targetUserId, targetUserName])

    // 3. AI Search (Real API)
    const handleAiSearch = useCallback(async () => {
        if (!keyword.trim()) return
        setLoading(true)
        setAiResult(null)
        setError(null)

        try {
            const response = await searchApiClient.searchSymptomsWithAI(keyword)
            setAiResult(response)
            record('disease', keyword)
        } catch (err) {
            logger.error('AI 검색 실패', err)
            setError('AI 검색에 실패했습니다. 다시 시도해주세요.')
        } finally {
            setLoading(false)
        }
    }, [keyword, record])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleRegister()
        }
    }

    // Pending request handler
    useEffect(() => {
        const request = consumeRequest('disease')
        if (request) {
            const term = typeof request === 'string' ? request : request?.term
            if (term) setKeyword(term)
        }
    }, [consumeRequest])

    const inputPanel = (
        <Paper variant="outlined" sx={SEARCH_TAB_STYLES.inputPaper}>
            <Box sx={{ mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    질병 검색
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    질병 이름이나 증상을 입력하세요.
                </Typography>
            </Box>

            <Stack spacing={1.25}>
                <TextField
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="예) 고혈압, 당뇨, 감기, 두통"
                    aria-label="질병 이름 또는 증상"
                    size="small"
                    fullWidth
                    autoFocus={autoFocus}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
                    <Button
                        type="button"
                        variant="contained"
                        disabled={!keyword.trim()}
                        onClick={handleRegister}
                        sx={SEARCH_TAB_STYLES.registerButton}
                    >
                        등록
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        disabled={!keyword.trim()}
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(keyword)}`, '_blank')}
                        sx={SEARCH_TAB_STYLES.googleButton}
                    >
                        Google 검색
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        disabled={!keyword.trim() || loading}
                        onClick={handleAiSearch}
                        sx={SEARCH_TAB_STYLES.aiButton}
                    >
                        {loading ? '분석 중...' : 'AI 검색'}
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    )

    const resultsPanel = (
        <Box sx={{ height: '100%', minHeight: 200 }}>
            {loading ? (
                <Paper variant="outlined" sx={SEARCH_TAB_STYLES.loadingPaper}>
                    AI가 정보를 분석하고 있습니다...
                </Paper>
            ) : error ? (
                <Paper variant="outlined" sx={SEARCH_TAB_STYLES.loadingPaper}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            ) : aiResult ? (
                <Paper variant="outlined" sx={SEARCH_TAB_STYLES.resultPaper}>
                    <Typography variant="subtitle1" sx={SEARCH_TAB_STYLES.aiTitle}>AI 검색 결과</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>{aiResult.name}</Typography>

                    <Stack spacing={2}>
                        {aiResult.description && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>설명</Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{aiResult.description}</Typography>
                            </Box>
                        )}
                        {aiResult.possibleCauses?.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>예상 원인</Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{aiResult.possibleCauses.join(', ')}</Typography>
                            </Box>
                        )}
                        {aiResult.recommendedActions?.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>권장 조치</Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{aiResult.recommendedActions.join(', ')}</Typography>
                            </Box>
                        )}
                        {aiResult.severity && (
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>심각도</Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{aiResult.severity}</Typography>
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            onClick={handleRegisterFromAi}
                            sx={SEARCH_TAB_STYLES.registerButton}
                        >
                            이 질병 등록하기
                        </Button>

                        <Alert severity="warning" sx={{ mt: 1 }}>
                            {aiResult.aiDisclaimer || 'AI 생성 결과는 참고용입니다. 정확한 진단은 전문가와 상담하세요.'}
                        </Alert>
                    </Stack>
                </Paper>
            ) : (
                <Paper variant="outlined" sx={SEARCH_TAB_STYLES.emptyPaper}>
                    질병 이름이나 증상을 검색하세요.
                </Paper>
            )}
        </Box>
    )

    const main =
        layout === 'overlay' ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '420px 1fr' }, gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {inputPanel}
                    {recentSection}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    {resultsPanel}
                </Box>
            </Box>
        ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {inputPanel}
                {recentSection}
                {resultsPanel}
            </Box>
        )

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {main}
        </Box>
    )
}

export default DiseaseSearchTab
