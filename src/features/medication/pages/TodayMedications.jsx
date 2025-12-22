import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useVoiceActionStore } from '../../../features/voice/stores/voiceActionStore' // [Voice] Zustand 스토어
import { toast } from '@shared/components/toast/toastStore'
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack,
    Typography,
    TextField,
    Divider,
    Skeleton,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { medicationApiClient } from '../../../core/services/api/medicationApiClient'
import { medicationLogApiClient } from '../../../core/services/api/medicationLogApiClient'
import { format, getDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import logger from '@core/utils/logger'
import MainLayout from '@shared/components/layout/MainLayout'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'
import { HeroMedicationCard } from '@features/dashboard/components/HeroMedicationCard'

// 요일 매핑 (date-fns getDay: 0=일, 1=월 ... 6=토)
const DAY_MAP = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// [UX] Skeleton Component for Medication Card
const TodayMedicationSkeleton = () => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={28} />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={80} height={24} />
                </Stack>
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={1}>
                        <Skeleton variant="rounded" width={80} height={32} />
                        <Skeleton variant="rounded" width={80} height={32} />
                    </Stack>
                </Box>
            </Box>
        </Stack>
    </Paper>
);

// [Optimization] React.memo applied to prevent unnecessary re-renders
const TodayMedicationCard = React.memo(({ medication, onClick, onScheduleClick, isFuture, readOnly }) => {
    const name = medication?.name || '알 수 없는 약'
    const dosage = medication?.dosage
    const schedules = Array.isArray(medication?.schedules) ? medication.schedules : []

    const allTaken = schedules.every(s => s.isTakenToday);
    const hasSchedules = schedules.length > 0;

    let statusLabel = '미복용';
    let statusColor = 'default';

    if (isFuture) {
        statusLabel = '복용 예정';
        statusColor = 'info';
    } else if (hasSchedules && allTaken) {
        statusLabel = '복용 완료';
        statusColor = 'success';
    } else if (hasSchedules && !allTaken) {
        statusLabel = '미복용';
        statusColor = 'error';
    }

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'grey.50' },
                borderColor: (!isFuture && !allTaken) ? 'error.light' : 'divider'
            }}
            onClick={() => onClick?.(medication)}
        >
            <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar sx={{ bgcolor: 'grey.200', color: 'text.primary' }}>
                    {name?.charAt(0) || '약'}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={800} noWrap>
                            {name}
                        </Typography>
                        {dosage && <Chip size="small" label={dosage} variant="outlined" />}
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mt: 1, flexWrap: 'wrap' }}
                    >
                        <Chip
                            size="small"
                            label={statusLabel}
                            color={statusColor}
                            variant={isFuture ? 'outlined' : 'filled'}
                        />
                        {schedules.length > 0 && (
                            <Chip size="small" label={`${schedules.length}회 스케줄`} />
                        )}
                    </Stack>

                    {schedules.length > 0 && (
                        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderTopColor: 'divider' }}>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {schedules.map((schedule) => {
                                    let btnText = schedule.time || '시간 미정';
                                    let btnVariant = 'outlined';
                                    let btnColor = 'inherit';

                                    if (isFuture) {
                                        btnColor = 'info';
                                        btnText += ' (예정)';
                                    } else if (schedule.isTakenToday) {
                                        btnVariant = 'contained';
                                        btnColor = 'success';
                                        btnText += ' 완료';
                                    } else {
                                        btnColor = 'error';
                                        btnText += ' 미복용';
                                    }

                                    return (
                                        <Button
                                            key={schedule.id}
                                            type="button"
                                            size="small"
                                            variant={btnVariant}
                                            color={btnColor}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onScheduleClick?.(schedule)
                                            }}
                                            disabled={isFuture || schedule.isTakenToday || readOnly}
                                        >
                                            {btnText}
                                        </Button>
                                    );
                                })}
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Stack>
        </Paper>
    )
});

const getTimeCategoryFromStr = (timeStr) => {
    if (!timeStr) return 'NIGHT';
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour >= 5 && hour < 11) return 'MORNING';
    if (hour >= 11 && hour < 17) return 'LUNCH';
    if (hour >= 17 && hour < 21) return 'DINNER';
    return 'NIGHT';
};

const getTimeCategory = (dateString = null) => {
    const date = dateString ? new Date(dateString) : new Date();
    const hour = date.getHours();
    if (hour >= 5 && hour < 11) return 'MORNING';
    if (hour >= 11 && hour < 17) return 'LUNCH';
    if (hour >= 17 && hour < 21) return 'DINNER';
    return 'NIGHT';
};

const SECTION_LABELS = {
    MORNING: { label: '아침', sub: '05:00 - 11:00' },
    LUNCH: { label: '점심', sub: '11:00 - 17:00' },
    DINNER: { label: '저녁', sub: '17:00 - 21:00' },
    NIGHT: { label: '취침 전', sub: '21:00 - 05:00' }
};

const SECTION_ORDER = ['MORNING', 'LUNCH', 'DINNER', 'NIGHT'];
const ALERT_TITLE = '복약 알림';
const ALERT_CARD_MIN_HEIGHT = 220;

const TodayMedications = () => {
    const pendingAction = useVoiceActionStore((state) => state.pendingAction);
    const { consumeAction } = useVoiceActionStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inlineAlert, setInlineAlert] = useState(null);
    const [logs, setLogs] = useState([]);
    const [medications, setMedications] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

    const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
    const isFuture = selectedDate > todayStr;
    const isPast = selectedDate < todayStr;
    const isToday = !isFuture && !isPast;
    const selectedDateLabel = format(new Date(`${selectedDate}T00:00:00`), 'M월 d일 (EEE)', { locale: ko });

    // Medications Fetch
    useEffect(() => {
        const fetchMedications = async () => {
            try {
                const medsResponse = await medicationApiClient.list();
                const data = Array.isArray(medsResponse) ? medsResponse : (medsResponse?.data || []);
                setMedications(Array.isArray(data) ? data : []);
            } catch (err) {
                logger.error('Failed to fetch medications:', err);
            }
        };
        fetchMedications();
    }, []);

    // Logs Fetch
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                setError(null);
                const logsResponse = await medicationLogApiClient.getByDate(selectedDate);
                setLogs(Array.isArray(logsResponse) ? logsResponse : []);
                
                const currentCategory = getTimeCategory();
                setExpanded(prev => ({ ...prev, [currentCategory]: true }));
            } catch (err) {
                logger.error('Failed to fetch medication logs:', err);
                setError('선택한 날짜의 복용 기록을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [selectedDate]);

    const handleAccordionChange = useCallback((panel) => (event, isExpanded) => {
        setExpanded(prev => ({ ...prev, [panel]: isExpanded }));
    }, []);

    const handleScheduleClick = useCallback(async (schedule) => {
        if (isFuture) {
            toast.info('미래 날짜는 복용 예정 상태입니다.');
            return;
        }
        if (!isToday) {
             toast.info('지난 날짜의 기록은 수정할 수 없습니다.');
             return;
        }
        if (schedule.isTakenToday) return;

        const previousLogs = [...logs];
        const existingLog = logs.find(l => l.medicationScheduleId === schedule.id);

        if (existingLog) {
            setLogs(prev => prev.map(log =>
                log.medicationScheduleId === schedule.id
                    ? { ...log, completed: true, completedTime: new Date().toISOString() }
                    : log
            ));
        } else {
            setLogs(prev => [...prev, { medicationScheduleId: schedule.id, completed: true, completedTime: new Date().toISOString() }]);
        }

        try {
            await medicationLogApiClient.completeMedication(schedule.id);
            setInlineAlert(null);
            toast.success('복용 체크 완료!');
        } catch (err) {
            logger.error('Failed to complete medication:', err);
            setLogs(previousLogs);
            setInlineAlert({ title: ALERT_TITLE, subtitle: '복용 체크에 실패했습니다. 다시 시도해주세요.' });
        }
    }, [logs, isToday, isFuture]);

    const handleMedicationClick = useCallback((medication) => {
        logger.debug('Clicked medication:', medication);
    }, []);

    // [Optimization] Heavy data processing moved to useMemo
    const { groupedData, hasItems, totalScheduledCount, totalCompletedCount } = useMemo(() => {
        const targetDayIndex = getDay(new Date(selectedDate));
        const targetDayStr = DAY_MAP[targetDayIndex];
        
        const result = { MORNING: {}, LUNCH: {}, DINNER: {}, NIGHT: {} };
        let hasItemsFound = false;
        let totalScheduled = 0;
        let totalCompleted = 0;

        medications.forEach(med => {
            if (med.active === false) return;

            // Date Range Validation
            if (med.startDate && selectedDate < med.startDate) return;
            if (med.endDate && selectedDate > med.endDate) return;

            const relevantSchedules = (med.schedules || []).filter(sch => {
                if (sch.active === false) return false;
                const days = sch.daysOfWeek || sch.weekDays;
                return days && days.includes(targetDayStr);
            });

            if (relevantSchedules.length === 0) return;

            relevantSchedules.forEach(sch => {
                const log = logs.find(l => l.medicationScheduleId === sch.id);
                const timeCategory = getTimeCategoryFromStr(sch.time);
                if (!result[timeCategory]) return;

                if (!result[timeCategory][med.id]) {
                    result[timeCategory][med.id] = {
                        medicationId: med.id,
                        name: med.name,
                        dosage: med.dosage,
                        schedules: []
                    };
                }

                const isTaken = !!log?.completed;
                result[timeCategory][med.id].schedules.push({
                    id: sch.id,
                    time: sch.time ? sch.time.substring(0, 5) : '',
                    isTakenToday: isTaken,
                });

                hasItemsFound = true;
                totalScheduled++;
                if (isTaken) totalCompleted++;
            });
        });

        // Sorting
        SECTION_ORDER.forEach(key => {
            result[key] = Object.values(result[key]).map(med => ({
                ...med,
                schedules: med.schedules.sort((a, b) => a.time.localeCompare(b.time))
            })).sort((a, b) => a.name.localeCompare(b.name));
        });

        return { groupedData: result, hasItems: hasItemsFound, totalScheduledCount: totalScheduled, totalCompletedCount: totalCompleted };
    }, [medications, logs, selectedDate]);

    const completionRate = useMemo(() => {
        return totalScheduledCount > 0 ? (totalCompletedCount / totalScheduledCount) * 100 : 0;
    }, [totalScheduledCount, totalCompletedCount]);

    if (error && medications.length === 0) {
        return (
             <MainLayout>
                <PageStack>
                    <PageHeader leading={<BackButton />} title="오늘의 복약" />
                    <HeroMedicationCard title="오류 발생" subtitle={error} />
                </PageStack>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <PageStack>
                <PageHeader
                    leading={<BackButton />}
                    title="오늘의 복약"
                    subtitle={selectedDateLabel}
                />

                {/* Date Picker */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <TextField
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            sx={{ width: 180, bgcolor: 'white' }}
                        />
                        <Typography variant="subtitle2" fontWeight="bold">
                            {isToday ? '📅 오늘' : isFuture ? '🔮 미래' : '🕰️ 과거'}
                        </Typography>
                        <Divider orientation="vertical" flexItem />
                        {!isToday && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                {isFuture ? '미래 일정은 "예정" 상태로 표시됩니다.' : '과거 기록은 수정할 수 없습니다.'}
                            </Typography>
                        )}
                    </Stack>
                </Box>

                {inlineAlert && (
                    <HeroMedicationCard title={inlineAlert.title} subtitle={inlineAlert.subtitle} sx={{ mb: 3 }} />
                )}

                {/* Statistics Card */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h6" fontWeight={900}>
                                {isFuture ? '복용 예정' : '복용 현황'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isFuture ? `총 ${totalScheduledCount}회 예정` : `총 ${totalScheduledCount}회 중 ${totalCompletedCount}회 완료`}
                            </Typography>
                        </Box>
                        <Box position="relative" display="inline-flex">
                            <CircularProgress
                                variant="determinate"
                                value={isFuture ? 0 : completionRate}
                                size={60}
                                thickness={5}
                                sx={{ color: isFuture ? 'grey.200' : (completionRate === 100 ? 'success.main' : 'primary.main') }}
                            />
                            <Box top={0} left={0} bottom={0} right={0} position="absolute" display="flex" alignItems="center" justifyContent="center">
                                <Typography variant="caption" fontWeight="bold">{isFuture ? '-' : `${Math.round(completionRate)}%`}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                {/* Medication List with Skeleton */}
                <Box>
                    {loading && medications.length === 0 ? (
                        <Stack spacing={2}>
                            {[1, 2, 3].map(i => <TodayMedicationSkeleton key={i} />)}
                        </Stack>
                    ) : !hasItems ? (
                        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                            <Typography color="text.secondary">예정된 복약 스케줄이 없습니다.</Typography>
                        </Paper>
                    ) : (
                        SECTION_ORDER.map(sectionKey => {
                            const sectionItems = groupedData[sectionKey];
                            if (!sectionItems || sectionItems.length === 0) return null;

                            return (
                                <Accordion
                                    key={sectionKey}
                                    expanded={!!expanded[sectionKey]}
                                    onChange={handleAccordionChange(sectionKey)}
                                    disableGutters
                                    elevation={0}
                                    sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: '12px !important', '&:before': { display: 'none' } }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'grey.50', borderRadius: '12px' }}>
                                        <Box display="flex" alignItems="baseline">
                                            <Typography variant="subtitle1" fontWeight={900} mr={1}>{SECTION_LABELS[sectionKey].label}</Typography>
                                            <Typography variant="caption" color="text.secondary">{SECTION_LABELS[sectionKey].sub}</Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ pt: 2 }}>
                                        <Stack spacing={2}>
                                            {sectionItems.map((med) => (
                                                <TodayMedicationCard
                                                    key={`${sectionKey}-${med.medicationId}`}
                                                    medication={med}
                                                    onClick={handleMedicationClick}
                                                    onScheduleClick={handleScheduleClick}
                                                    isFuture={isFuture}
                                                    readOnly={!isToday}
                                                />
                                            ))}
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })
                    )}
                </Box>
            </PageStack>
        </MainLayout>
    )
};

export default TodayMedications;
