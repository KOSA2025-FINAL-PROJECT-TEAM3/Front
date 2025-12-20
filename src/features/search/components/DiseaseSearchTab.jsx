import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'

import { ROUTE_PATHS } from '@config/routes.config'
import { useSearchHistoryStore } from '@features/search/store/searchHistoryStore'

export const DiseaseSearchTab = ({ autoFocus = false, layout = 'page', recentSection = null, onRequestClose } = {}) => {
    const navigate = useNavigate()
    const { record, consumeRequest } = useSearchHistoryStore((state) => ({
        record: state.record,
        consumeRequest: state.consumeRequest,
    }))

    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(false)
    const [aiResult, setAiResult] = useState(null)

    // 1. Register (Navigate to DiseasePage)
    const handleRegister = useCallback(() => {
        if (!keyword.trim()) return
        record('disease', keyword)
        onRequestClose?.()
        navigate(ROUTE_PATHS.disease, { state: { autoCreate: keyword } })
    }, [keyword, navigate, record, onRequestClose])

    // 2. AI Search (Mock for now, or use real API if available later)
    const handleAiSearch = useCallback(async () => {
        if (!keyword.trim()) return
        setLoading(true)
        setAiResult(null)

        // Simulate API call
        setTimeout(() => {
            setAiResult({
                name: keyword,
                symptoms: '관련 증상: 두통, 발열, 오한 등',
                summary: `AI가 분석한 '${keyword}'에 대한 정보입니다.\n이 질병은 일반적으로 다음과 같은 특징을 가집니다...`,
                prevention: '충분한 휴식과 수분 섭취가 중요합니다.',
                isMock: true
            })
            setLoading(false)
        }, 1500)

        record('disease', keyword)
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
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'grey.50' }}>
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
                        sx={{ fontWeight: 900, minWidth: 100, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                    >
                        등록
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        disabled={!keyword.trim()}
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(keyword)}`, '_blank')}
                        sx={{ fontWeight: 900, minWidth: 100, color: '#10B981', borderColor: '#10B981', '&:hover': { borderColor: '#059669', bgcolor: '#ECFDF5' } }}
                    >
                        Google 검색
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        disabled={!keyword.trim() || loading}
                        onClick={handleAiSearch}
                        sx={{ fontWeight: 900, minWidth: 100 }}
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
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, textAlign: 'center', color: 'text.secondary', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    AI가 정보를 분석하고 있습니다...
                </Paper>
            ) : aiResult ? (
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%', overflowY: 'auto' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#10B981', mb: 1 }}>AI 검색 결과</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>{aiResult.name}</Typography>

                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>요약</Typography>
                            <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{aiResult.summary}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>주요 증상</Typography>
                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{aiResult.symptoms}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.5 }}>예방 및 관리</Typography>
                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{aiResult.prevention}</Typography>
                        </Box>
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            AI 생성 결과는 참고용입니다. 정확한 진단은 전문가와 상담하세요.
                        </Alert>
                    </Stack>
                </Paper>
            ) : (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, textAlign: 'center', color: 'text.secondary', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
