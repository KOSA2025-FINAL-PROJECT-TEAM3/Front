import { Box, Paper, Stack, Skeleton, useMediaQuery, useTheme } from '@mui/material'
import MainLayout from '@shared/components/layout/MainLayout'

function SeniorDashboardSkeleton() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    return (
        <MainLayout>
            <Box
                sx={{
                    display: { xs: 'flex', md: 'grid' },
                    flexDirection: { xs: 'column' },
                    gridTemplateColumns: { md: '1fr 1fr' },
                    gap: { xs: 3, md: 4 },
                }}
            >
                {/* Column 1 */}
                <Stack spacing={{ xs: 3, md: 4 }}>
                    {/* Hero Card Skeleton */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            minHeight: 320,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box>
                            <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width={250} height={24} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <Skeleton variant="circular" width={120} height={120} />
                        </Box>
                        <Skeleton variant="rounded" height={60} sx={{ borderRadius: 3 }} />
                    </Paper>

                    {isMobile && (
                        <>
                            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                            <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
                        </>
                    )}

                    {/* Quick Actions Skeleton */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                        <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                        <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                        <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                        <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                    </Box>

                    {!isMobile && (
                        <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                    )}
                </Stack>

                {/* Column 2 */}
                <Stack spacing={{ xs: 3, md: 4 }}>
                    {/* Checklist Skeleton */}
                    <Paper
                        variant="outlined"
                        sx={{ p: 3, borderRadius: 3, minHeight: 320 }}
                    >
                        <Skeleton variant="text" width={150} height={32} sx={{ mb: 3 }} />
                        <Stack spacing={2}>
                            {[1, 2, 3].map(i => (
                                <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                                    <Skeleton variant="circular" width={24} height={24} />
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton variant="text" width="60%" height={24} />
                                        <Skeleton variant="text" width="40%" height={20} />
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>

                    {/* Weekly Stats Skeleton */}
                    <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />

                    {!isMobile && (
                        <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
                    )}
                </Stack>
            </Box>
        </MainLayout>
    )
}

export default SeniorDashboardSkeleton
