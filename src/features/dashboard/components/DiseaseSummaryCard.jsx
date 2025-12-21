import { memo } from 'react'
import { Paper, Box, Typography, ButtonBase } from '@mui/material'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'

/**
 * DiseaseSummaryCard - 질병 요약 카드
 * 관리 중인 질병 개수를 표시하고 클릭 시 모달을 엽니다.
 */
export const DiseaseSummaryCard = memo(function DiseaseSummaryCard({
    count = 0,
    loading = false,
    onClick
}) {
    return (
        <Paper
            component={ButtonBase}
            onClick={onClick}
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                bgcolor: 'common.white',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: '100%',
                textAlign: 'left',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    borderColor: '#EF4444',
                },
            }}
        >
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: '#FEF2F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <HealthAndSafetyIcon sx={{ color: '#EF4444', fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}
                >
                    관리 중인 질병
                </Typography>
                <Typography
                    variant="h5"
                    sx={{ fontWeight: 900, color: '#EF4444' }}
                >
                    {loading ? '...' : `${count}건`}
                </Typography>
            </Box>
            <Typography
                variant="caption"
                sx={{ color: 'text.disabled', fontWeight: 600 }}
            >
                상세보기 →
            </Typography>
        </Paper>
    )
})

export default DiseaseSummaryCard
