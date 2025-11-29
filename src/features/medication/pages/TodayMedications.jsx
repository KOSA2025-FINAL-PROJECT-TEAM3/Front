import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Container, Paper } from '@mui/material';
import { medicationApiClient } from '../../../core/services/api/medicationApiClient';
import MedicationCard from '../../../components/medication/MedicationCard';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const TodayMedications = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fetchTodaySchedule = async () => {
        try {
            setLoading(true);
            const response = await medicationApiClient.getTodaySchedule();
            setData(response.data);
        } catch (err) {
            console.error('Failed to fetch today schedule:', err);
            setError('오늘의 복용 스케줄을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodaySchedule();
    }, []);

    const handleMedicationClick = (medication) => {
        // TODO: Implement medication detail view
        console.log('Clicked medication:', medication);
    };

    const handleScheduleClick = async (schedule, medication) => {
        if (schedule.isTakenToday) {
            // Already taken, maybe show toast or alert?
            // For now, do nothing as untake is not supported yet
            return;
        }

        // Optimistic update
        const previousData = { ...data };

        // Update local state
        const newData = { ...data };
        const medIndex = newData.medications.findIndex(m => m.medicationId === medication.medicationId);
        if (medIndex !== -1) {
            const schedIndex = newData.medications[medIndex].schedules.findIndex(s => s.scheduleId === schedule.id);
            if (schedIndex !== -1) {
                newData.medications[medIndex].schedules[schedIndex].completed = true; // Update backend field name if needed, but here we map it later
                // Actually we need to update the source data structure which uses 'completed' in backend response
                // But wait, in render we map: isTakenToday: s.completed
                // So we should update s.completed

                // Also update totals
                newData.totalCompleted += 1;
                newData.completionRate = newData.totalScheduled > 0 ? newData.totalCompleted / newData.totalScheduled : 0;

                setData(newData);
            }
        }

        try {
            await medicationApiClient.logMedication({
                medicationId: medication.medicationId,
                medicationScheduleId: schedule.id,
                scheduledTime: schedule.scheduledTime || new Date().toISOString(), // Backend should provide this, or construct it
                completed: true
            });
            // Success - keep optimistic state
        } catch (err) {
            console.error('Failed to log medication:', err);
            // Revert state
            setData(previousData);
            alert('복용 체크에 실패했습니다. 다시 시도해주세요.');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    오늘의 복약
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {format(new Date(), 'M월 d일 (EEE)', { locale: ko })}
                </Typography>
            </Box>

            {data && (
                <>
                    <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    복용 현황
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    총 {data.totalScheduled}회 중 {data.totalCompleted}회 복용 완료
                                </Typography>
                            </Box>
                            <Box position="relative" display="inline-flex">
                                <CircularProgress
                                    variant="determinate"
                                    value={data.completionRate * 100}
                                    size={60}
                                    thickness={4}
                                    sx={{ color: data.completionRate === 1 ? 'success.main' : 'primary.main' }}
                                />
                                <Box
                                    top={0}
                                    left={0}
                                    bottom={0}
                                    right={0}
                                    position="absolute"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Typography variant="caption" component="div" color="text.secondary">
                                        {Math.round(data.completionRate * 100)}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    <Box>
                        {data.medications && data.medications.length > 0 ? (
                            data.medications.map((med) => (
                                <MedicationCard
                                    key={med.medicationId}
                                    medication={{
                                        ...med,
                                        // Adapt backend response to MedicationCard props if needed
                                        // Backend: schedules: [{ scheduleId, time, completed, ... }]
                                        // MedicationCard expects: schedules: [{ id, time, isTakenToday, ... }]
                                        schedules: med.schedules.map(s => ({
                                            id: s.scheduleId,
                                            time: s.time,
                                            isTakenToday: s.completed
                                        })),
                                        hasLogsToday: med.schedules.some(s => s.completed)
                                    }}
                                    onClick={handleMedicationClick}
                                    onScheduleClick={handleScheduleClick}
                                />
                            ))
                        ) : (
                            <Typography textAlign="center" color="text.secondary" py={4}>
                                오늘 예정된 복약 스케줄이 없습니다.
                            </Typography>
                        )}
                    </Box>
                </>
            )}
        </Container>
    );
};

export default TodayMedications;
