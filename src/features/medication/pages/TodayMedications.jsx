import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Container, Paper } from '@mui/material';
import { medicationApiClient } from '../../../core/services/api/medicationApiClient';
import { medicationLogApiClient } from '../../../core/services/api/medicationLogApiClient';
import MedicationCard from '../../../components/medication/MedicationCard';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import logger from '@core/utils/logger';

const TodayMedications = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);
    const [medications, setMedications] = useState([]);

    const fetchTodayLogs = async () => {
        try {
            setLoading(true);
            const today = format(new Date(), 'yyyy-MM-dd');

            // 오늘 날짜의 로그 조회
            const logsResponse = await medicationLogApiClient.getByDate(today);
            setLogs(logsResponse || []);

            // 약 정보 조회 (로그에서 약 이름 표시용)
            const medsResponse = await medicationApiClient.list();
            setMedications(medsResponse.data || []);
        } catch (err) {
            logger.error('Failed to fetch today logs:', err);
            setError('오늘의 복용 기록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayLogs();
    }, []);

    const handleMedicationClick = () => {
        // TODO: Implement medication detail view
        logger.debug('Clicked medication:');
    };

    const handleScheduleClick = async (schedule) => {
        if (schedule.isTakenToday) {
            // Already taken
            return;
        }

        // Optimistic update
        const previousLogs = [...logs];

        // Update local state
        const newLogs = logs.map(log =>
            log.medicationScheduleId === schedule.id
                ? { ...log, completed: true, completedTime: new Date().toISOString() }
                : log
        );
        setLogs(newLogs);

        try {
            await medicationLogApiClient.completeMedication(schedule.id);
            // Success - keep optimistic state
        } catch (err) {
            logger.error('Failed to complete medication:', err);
            // Revert state
            setLogs(previousLogs);
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

    // 로그를 약별로 그룹화
    const medicationGroups = logs.reduce((acc, log) => {
        const medId = log.medicationId;
        if (!acc[medId]) {
            const medication = medications.find(m => m.id === medId);
            acc[medId] = {
                medicationId: medId,
                medicationName: medication?.name || log.medicationName || '알 수 없는 약',
                dosage: medication?.dosage,
                schedules: []
            };
        }

        // 로그를 스케줄 형태로 변환
        acc[medId].schedules.push({
            id: log.medicationScheduleId,
            time: log.scheduledTime ? format(new Date(log.scheduledTime), 'HH:mm') : '',
            scheduledTime: log.scheduledTime,
            isTakenToday: log.completed,
            completedTime: log.completedTime
        });

        return acc;
    }, {});

    const medicationList = Object.values(medicationGroups);

    // 통계 계산
    const totalScheduled = logs.length;
    const totalCompleted = logs.filter(log => log.completed).length;
    const completionRate = totalScheduled > 0 ? totalCompleted / totalScheduled : 0;

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

            <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            복용 현황
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            총 {totalScheduled}회 중 {totalCompleted}회 복용 완료
                        </Typography>
                    </Box>
                    <Box position="relative" display="inline-flex">
                        <CircularProgress
                            variant="determinate"
                            value={completionRate * 100}
                            size={60}
                            thickness={4}
                            sx={{ color: completionRate === 1 ? 'success.main' : 'primary.main' }}
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
                                {Math.round(completionRate * 100)}%
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            <Box>
                {medicationList.length > 0 ? (
                    medicationList.map((med) => (
                        <MedicationCard
                            key={med.medicationId}
                            medication={{
                                medicationId: med.medicationId,
                                name: med.medicationName,
                                dosage: med.dosage,
                                schedules: med.schedules,
                                hasLogsToday: med.schedules.some(s => s.isTakenToday)
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
        </Container>
    );
};

export default TodayMedications;
