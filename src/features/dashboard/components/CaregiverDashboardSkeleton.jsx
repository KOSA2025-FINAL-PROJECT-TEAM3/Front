import { Box, Paper, Stack, Skeleton } from '@mui/material'
import MainLayout from '@shared/components/layout/MainLayout'

function CaregiverDashboardSkeleton() {
    return (
        <MainLayout>
            <Box sx={{ display: 'grid', gridTemplateColumns: { md: '4fr 8fr' }, gap: 3 }}>
                <Stack spacing={2.5}>
                    <Paper
                        variant="outlined"
                        sx={{
                            borderRadius: 3,
                            p: 3,
                            bgcolor: 'common.white',
                        }}
                    >
                        <Stack spacing={2.5}>
                            {/* Group Select */}
                            <Box>
                                <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
                                <Stack direction="row" spacing={1}>
                                    <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: 2.5 }} />
                                    <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: 2.5 }} />
                                </Stack>
                            </Box>

                            {/* Active Senior Profile */}
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Skeleton variant="circular" width={64} height={64} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width={120} height={32} />
                                    <Skeleton variant="text" width={150} height={20} sx={{ mt: 0.5 }} />
                                </Box>
                            </Stack>

                            {/* Other Members */}
                            <Box>
                                <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
                                <Stack direction="row" spacing={1}>
                                    <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 2.5 }} />
                                    <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 2.5 }} />
                                </Stack>
                            </Box>

                            {/* Stats Grid */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
                                <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
                            </Box>
                        </Stack>
                    </Paper>

                    {/* Widgets */}
                    <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
                    <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
                    <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
                    <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
                </Stack>

                {/* Timeline */}
                <Paper
                    variant="outlined"
                    sx={{
                        borderRadius: 3,
                        p: 3,
                        bgcolor: 'white',
                        border: 'none',
                        boxShadow: 'none',
                    }}
                >
                    <Skeleton variant="text" width={150} height={32} sx={{ mb: 3 }} />
                    <Stack spacing={4}>
                        {[1, 2, 3].map((i) => (
                            <Box key={i}>
                                <Skeleton variant="text" width={100} height={24} sx={{ mb: 2 }} />
                                <Stack spacing={2}>
                                    <Skeleton variant="rounded" height={60} sx={{ borderRadius: 2 }} />
                                    <Skeleton variant="rounded" height={60} sx={{ borderRadius: 2 }} />
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </Paper>
            </Box>
        </MainLayout>
    )
}

export default CaregiverDashboardSkeleton
