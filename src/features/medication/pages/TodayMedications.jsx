import React, { useEffect, useState, useCallback } from 'react'
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
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { medicationApiClient } from '../../../core/services/api/medicationApiClient'
import { medicationLogApiClient } from '../../../core/services/api/medicationLogApiClient'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import logger from '@core/utils/logger'
import MainLayout from '@shared/components/layout/MainLayout'
import { PageHeader } from '@shared/components/layout/PageHeader'
import { PageStack } from '@shared/components/layout/PageStack'
import { BackButton } from '@shared/components/mui/BackButton'
import { HeroMedicationCard } from '@features/dashboard/components/HeroMedicationCard'

const TodayMedicationCard = ({ medication, onClick, onScheduleClick }) => {
  const name = medication?.name || '알 수 없는 약'
  const dosage = medication?.dosage
  const schedules = Array.isArray(medication?.schedules) ? medication.schedules : []
  const hasLogsToday = Boolean(medication?.hasLogsToday)

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'grey.50' },
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
              label={hasLogsToday ? '복용완료' : '미복용'}
              color={hasLogsToday ? 'success' : 'default'}
            />
            {schedules.length > 0 && (
              <Chip size="small" label={`${schedules.length}회 스케줄`} />
            )}
          </Stack>

          {schedules.length > 0 && (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderTopColor: 'divider' }}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {schedules.map((schedule) => (
                  <Button
                    key={schedule.id}
                    type="button"
                    size="small"
                    variant={schedule.isTakenToday ? 'contained' : 'outlined'}
                    color={schedule.isTakenToday ? 'success' : 'inherit'}
                    onClick={(e) => {
                      e.stopPropagation()
                      onScheduleClick?.(schedule)
                    }}
                    disabled={schedule.isTakenToday}
                  >
                    {schedule.time || '시간 미정'}
                  </Button>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}

const getTimeCategory = (dateString = null) => {
    const date = dateString ? new Date(dateString) : new Date();
    const hour = date.getHours();

    if (hour >= 5 && hour < 11) return 'MORNING'; // 05:00 ~ 10:59
    if (hour >= 11 && hour < 17) return 'LUNCH';  // 11:00 ~ 16:59
    if (hour >= 17 && hour < 21) return 'DINNER'; // 17:00 ~ 20:59
    return 'NIGHT'; // 21:00 ~ 04:59
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
    const pendingAction = useVoiceActionStore((state) => state.pendingAction); // [Voice] Subscribe
    const { consumeAction } = useVoiceActionStore(); // [Voice]
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inlineAlert, setInlineAlert] = useState(null);
    const [logs, setLogs] = useState([]);
    const [medications, setMedications] = useState([]);
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        const initializeExpandedState = (currentLogs) => {
            const currentCategory = getTimeCategory(); // 현재 시간대
            const nextExpanded = {};

            SECTION_ORDER.forEach(section => {
                if (section === currentCategory) {
                    nextExpanded[section] = true;
                    return;
                }

                const logsInSection = currentLogs.filter(log =>
                    getTimeCategory(log.scheduledTime) === section
                );

                const hasUntaken = logsInSection.some(log => !log.completed);
                nextExpanded[section] = hasUntaken;
            });
            setExpanded(nextExpanded);
        };

        const fetchTodayLogs = async () => {
            try {
                setLoading(true);
                const today = format(new Date(), 'yyyy-MM-dd');

                const logsResponse = await medicationLogApiClient.getByDate(today);
                const fetchedLogs = logsResponse || [];
                setLogs(fetchedLogs);

                const medsResponse = await medicationApiClient.list();
                setMedications(medsResponse.data || []);

                initializeExpandedState(fetchedLogs);
            } catch (err) {
                logger.error('Failed to fetch today logs:', err);
                setError('오늘의 복용 기록을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchTodayLogs();
    }, []);

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(prev => ({ ...prev, [panel]: isExpanded }));
    };

    const handleScheduleClick = useCallback(async (schedule) => {
        if (schedule.isTakenToday) {
            return;
        }

        const previousLogs = [...logs];

        const newLogs = logs.map(log =>
            log.medicationScheduleId === schedule.id
                ? { ...log, completed: true, completedTime: new Date().toISOString() }
                : log
        );
        setLogs(newLogs);

        try {
            await medicationLogApiClient.completeMedication(schedule.id);
            setInlineAlert(null);
        } catch (err) {
            logger.error('Failed to complete medication:', err);
            setLogs(previousLogs);
            setInlineAlert({
                title: ALERT_TITLE,
                subtitle: '복용 체크에 실패했습니다. 다시 시도해주세요.'
            });
        }
    }, [logs]);

    // [Voice] 음성 명령 처리 (자동 복용 체크) - Zustand 버전
    useEffect(() => {
        if (!loading && logs.length > 0 && pendingAction?.code === 'AUTO_COMPLETE') {
            const action = consumeAction('AUTO_COMPLETE');

            if (action) {
                const { params } = action;
                const timeSlot = params?.timeSlot || 'NOW'; // MORNING, LUNCH, DINNER, NOW
                const targetMedName = params?.medicationName; // [New] 특정 약 이름

                const now = new Date();
                const currentHour = now.getHours();

                const targetLogs = logs.filter(log => {
                    if (log.completed) return false; // 이미 먹은 건 패스

                    if (targetMedName) {
                        const logName = (log.medicationName || '').replace(/\s+/g, '');
                        const queryName = targetMedName.replace(/\s+/g, '');
                        if (!logName.includes(queryName)) {
                            return false;
                        }
                    }

                    const scheduleHour = log.scheduledTime ? new Date(log.scheduledTime).getHours() : 0;

                    if (timeSlot === 'MORNING') return scheduleHour >= 5 && scheduleHour < 11;
                    if (timeSlot === 'LUNCH') return scheduleHour >= 11 && scheduleHour < 15;
                    if (timeSlot === 'DINNER') return scheduleHour >= 17 && scheduleHour < 22;
                    if (timeSlot === 'NOW') {
                        return Math.abs(scheduleHour - currentHour) <= 2;
                    }
                    return false;
                });

                if (targetLogs.length > 0) {
                    targetLogs.forEach(log => {
                        const schedule = { id: log.medicationScheduleId, isTakenToday: false };
                        handleScheduleClick(schedule);
                    });

                    const countMsg = targetMedName ? `'${targetMedName}'` : `${targetLogs.length}건`;
                    toast.success(`${timeSlot === 'NOW' ? '현재' : timeSlot} 시간대 ${countMsg}을(를) 복용 처리했습니다.`);
                } else {
                    const failMsg = targetMedName ? `'${targetMedName}'` : '해당 시간대에 복용할 약';
                    toast.info(`${failMsg}이(가) 없거나 이미 드셨습니다.`);
                }
            }
        }
    }, [loading, logs, consumeAction, pendingAction, handleScheduleClick]);

    const handleMedicationClick = (medication) => {
        // TODO: Implement medication detail view
        logger.debug('Clicked medication:', medication);
    };

    if (loading) {
        return (
            <MainLayout>
                <PageStack>
                    <PageHeader leading={<BackButton />} title="오늘의 복약" subtitle="오늘의 복약 기록을 불러오는 중..." />
                    <Paper variant="outlined" sx={{ p: 4 }}>
                        <Stack spacing={2} alignItems="center">
                            <CircularProgress />
                            <Typography variant="body2" color="text.secondary">
                                로딩 중...
                            </Typography>
                        </Stack>
                    </Paper>
                </PageStack>
            </MainLayout>
        )
    }

    if (error) {
        return (
            <MainLayout>
                <PageStack>
                    <PageHeader leading={<BackButton />} title="오늘의 복약" subtitle="오늘의 복약 기록을 불러오지 못했습니다." />
                    <HeroMedicationCard
                        title={ALERT_TITLE}
                        subtitle={error}
                        sx={{ minHeight: ALERT_CARD_MIN_HEIGHT }}
                    />
                </PageStack>
            </MainLayout>
        )
    }
    // 로그를 시간대별 -> 약별로 그룹화
    const groupedLogs = logs.reduce((acc, log) => {
        const category = getTimeCategory(log.scheduledTime);
        const medId = log.medicationId;

        if (!acc[category]) {
            acc[category] = {};
        }

        if (!acc[category][medId]) {
            const medication = medications.find(m => m.id === medId);

            // "복용 중단"된 약은 제외 (상세 정보가 있고 active가 false인 경우)
            if (medication && medication.active === false) {
                return acc;
            }

            // 스케줄 단위 비활성화 체크
            const currentSchedule = medication?.schedules?.find(s => s.id === log.medicationScheduleId);
            if (currentSchedule && currentSchedule.active === false) {
                return acc;
            }

            acc[category][medId] = {
                medicationId: medId,
                medicationName: medication?.name || log.medicationName || '알 수 없는 약',
                dosage: medication?.dosage,
                schedules: []
            };
        } else {
            // 이미 약 그룹이 존재하는 경우에도 스케줄 active 체크 필요
            const medication = medications.find(m => m.id === medId);
            const currentSchedule = medication?.schedules?.find(s => s.id === log.medicationScheduleId);
            if (currentSchedule && currentSchedule.active === false) {
                return acc;
            }
        }

        acc[category][medId].schedules.push({
            id: log.medicationScheduleId,
            time: log.scheduledTime ? format(new Date(log.scheduledTime), 'HH:mm') : '',
            scheduledTime: log.scheduledTime,
            isTakenToday: log.completed,
            completedTime: log.completedTime
        });

        return acc;
    }, {});

    // 통계 계산
    const totalScheduled = logs.length;
    const totalCompleted = logs.filter(log => log.completed).length;
    const completionRate = totalScheduled > 0 ? totalCompleted / totalScheduled : 0;

    return (
        <MainLayout>
            <PageStack>
                <PageHeader
                    leading={<BackButton />}
                    title="오늘의 복약"
                    subtitle={format(new Date(), 'M월 d일 (EEE)', { locale: ko })}
                />

                {inlineAlert && (
                    <HeroMedicationCard
                        title={inlineAlert.title}
                        subtitle={inlineAlert.subtitle}
                        sx={{ minHeight: ALERT_CARD_MIN_HEIGHT }}
                    />
                )}

                <Paper variant="outlined" sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h6" gutterBottom fontWeight={900}>
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
                    {logs.length === 0 ? (
                        <Typography textAlign="center" color="text.secondary" py={4}>
                            오늘 예정된 복약 스케줄이 없습니다.
                        </Typography>
                    ) : (
                        SECTION_ORDER.map(sectionKey => {
                            const sectionData = groupedLogs[sectionKey];
                            if (!sectionData) return null;

                            const medicationList = Object.values(sectionData)
                                .map(med => ({
                                    ...med,
                                    schedules: med.schedules.sort((a, b) =>
                                        (a.scheduledTime || '').localeCompare(b.scheduledTime || '')
                                    )
                                }))
                                .sort((a, b) => a.medicationName.localeCompare(b.medicationName));

                            if (medicationList.length === 0) return null;

                            return (
                                <Accordion
                                    key={sectionKey}
                                    expanded={!!expanded[sectionKey]}
                                    onChange={handleAccordionChange(sectionKey)}
                                    disableGutters
                                    elevation={0}
                                    sx={{
                                        mb: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: '12px !important',
                                        '&:before': { display: 'none' }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{ bgcolor: 'background.paper', borderRadius: '12px' }}
                                    >
                                        <Box display="flex" alignItems="baseline">
                                            <Typography variant="h6" fontWeight={900} mr={1}>
                                                {SECTION_LABELS[sectionKey].label}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {SECTION_LABELS[sectionKey].sub}
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ pt: 0 }}>
                                        <Box display="flex" flexDirection="column" gap={2}>
                                            {medicationList.map((med) => (
                                                <TodayMedicationCard
                                                    key={`${sectionKey}-${med.medicationId}`}
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
                                            ))}
                                        </Box>
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
