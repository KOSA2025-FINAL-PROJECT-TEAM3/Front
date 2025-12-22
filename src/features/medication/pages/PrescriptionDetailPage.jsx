import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@shared/components/layout/MainLayout';
import { Box, Button, Chip, CircularProgress, Divider, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { PageHeader } from '@shared/components/layout/PageHeader';
import { PageStack } from '@shared/components/layout/PageStack';
import { BackButton } from '@shared/components/mui/BackButton';
import { MedicationCardInPrescription } from '../components/MedicationCardInPrescription';
import { MedicationModal } from '../components/MedicationModal';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { toast } from '@shared/components/toast/toastStore';
import { ROUTE_PATHS } from '@config/routes.config';
import logger from '@core/utils/logger';

export const PrescriptionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        currentPrescription,
        fetchPrescription,
        deletePrescription,
        updatePrescription,
        loading
    } = usePrescriptionStore();

    const [prescriptionData, setPrescriptionData] = useState(null);
    const [newTime, setNewTime] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingMedicationIndex, setEditingMedicationIndex] = useState(null);
    const [initialMedication, setInitialMedication] = useState(null);
    const [notesExpanded, setNotesExpanded] = useState(false);

    const normalizePrescriptionForEdit = (prescription) => {
        const intakeTimes = prescription?.intakeTimes || [];
        const normalizedMedications = (prescription?.medications || []).map(med => {
            const intakeTimeIndices = med.schedules
                ? med.schedules.map(schedule => {
                    const timeIndex = intakeTimes.findIndex(t => t === schedule.time);
                    return timeIndex >= 0 ? timeIndex : null;
                }).filter(idx => idx !== null)
                : null;

            const daysOfWeek = med.schedules && med.schedules.length > 0
                ? med.schedules[0].daysOfWeek
                : 'MON,TUE,WED,THU,FRI,SAT,SUN';

            return {
                ...med,
                dosageAmount: med.dosePerIntake || parseInt(med.dosage) || 1,
                frequency: med.frequency || med.schedules?.length || 1,
                dosePerIntake: med.dosePerIntake || parseInt(med.dosage) || 1,
                intakeTimeIndices: intakeTimeIndices,
                daysOfWeek: daysOfWeek
            };
        });

        return {
            pharmacyName: prescription?.pharmacyName || '',
            hospitalName: prescription?.hospitalName || '',
            startDate: prescription?.startDate,
            endDate: prescription?.endDate,
            intakeTimes: intakeTimes,
            medications: normalizedMedications,
            paymentAmount: prescription?.paymentAmount ?? null,
            notes: prescription?.notes || ''
        };
    };

    useEffect(() => {
        if (id) {
            fetchPrescription(id).catch(err => {
                logger.error('처방전 로딩 실패:', err);
                toast.error('처방전 정보를 불러오는데 실패했습니다');
                navigate(ROUTE_PATHS.medication);
            });
        }
    }, [id, fetchPrescription, navigate]);

    // 약 검색 탭에서 넘어온 경우 처리
    useEffect(() => {
        if (location.state?.addDrug && currentPrescription) {
            setInitialMedication(location.state.addDrug);
            setPrescriptionData(normalizePrescriptionForEdit(currentPrescription));
            setShowModal(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, currentPrescription]);

    // currentPrescription이 로드되면 prescriptionData 초기화
    useEffect(() => {
        if (currentPrescription && !prescriptionData) {
            setPrescriptionData(normalizePrescriptionForEdit(currentPrescription));
        }
    }, [currentPrescription, prescriptionData]);

    const handleDelete = async () => {
        if (window.confirm('정말 이 처방전을 삭제하시겠습니까? 포함된 모든 약 복용 기록도 함께 삭제됩니다.')) {
            try {
                await deletePrescription(id);
                toast.success('처방전이 삭제되었습니다');
                navigate(ROUTE_PATHS.medication);
            } catch (err) {
                logger.error('삭제 실패:', err);
                toast.error('처방전 삭제에 실패했습니다');
            }
        }
    };

    const handleAddTime = () => {
        if (!newTime) return;
        if (prescriptionData.intakeTimes.includes(newTime)) {
            toast.error('이미 등록된 시간입니다');
            return;
        }
        setPrescriptionData(prev => ({
            ...prev,
            intakeTimes: [...prev.intakeTimes, newTime].sort()
        }));
        setNewTime('');
    };

    const handleRemoveTime = (timeToRemove) => {
        setPrescriptionData(prev => ({
            ...prev,
            intakeTimes: prev.intakeTimes.filter(time => time !== timeToRemove)
        }));
    };

    const handleAddMedication = (medication) => {
        if (editingMedicationIndex !== null) {
            // 수정 모드
            setPrescriptionData(prev => ({
                ...prev,
                medications: prev.medications.map((med, idx) =>
                    idx === editingMedicationIndex ? medication : med
                )
            }));
            toast.success('약이 수정되었습니다');
        } else {
            // 추가 모드
            setPrescriptionData(prev => ({
                ...prev,
                medications: [...prev.medications, medication]
            }));
            toast.success('약이 추가되었습니다');
        }
        setShowModal(false);
        setEditingMedicationIndex(null);
        setInitialMedication(null);
    };

    const handleEditMedication = (medication, index) => {
        setEditingMedicationIndex(index);
        setInitialMedication(medication);
        setShowModal(true);
    };

    const handleRemoveMedication = (indexToRemove) => {
        setPrescriptionData(prev => ({
            ...prev,
            medications: prev.medications.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSave = async () => {
        if (prescriptionData.medications.length === 0) {
            toast.error('최소 1개 이상의 약을 등록해주세요');
            return;
        }

        try {
            // Backend 형식으로 데이터 변환
            const formattedData = {
                pharmacyName: prescriptionData.pharmacyName,
                hospitalName: prescriptionData.hospitalName,
                startDate: prescriptionData.startDate,
                endDate: prescriptionData.endDate,
                // intakeTimes 포맷 확인 및 수정 (HH:mm 형식으로 통일)
                intakeTimes: prescriptionData.intakeTimes.map(time => {
                    // 이미 HH:mm:ss 형식이면 HH:mm만 추출
                    if (time.length > 5) {
                        return time.substring(0, 5);
                    }
                    return time;
                }),
                paymentAmount: prescriptionData.paymentAmount,
                notes: prescriptionData.notes,
                // medications를 backend가 기대하는 형식으로 변환
                medications: prescriptionData.medications.map(med => ({
                    name: med.name,
                    category: med.ingredient || med.category,
                    dosageAmount: med.dosageAmount || parseInt(med.dosage) || 1,
                    totalIntakes: med.quantity || med.totalIntakes || null,
                    daysOfWeek: med.daysOfWeek || 'MON,TUE,WED,THU,FRI,SAT,SUN',
                    intakeTimeIndices: med.intakeTimeIndices || null,
                    notes: med.notes || '',
                    imageUrl: med.imageUrl || null
                }))
            };

            logger.debug('[DEBUG] Saving prescription with medications:', formattedData.medications.map(m => ({
                name: m.name,
                daysOfWeek: m.daysOfWeek
            })));

            const response = await updatePrescription(id, formattedData);
            logger.debug('[DEBUG] Update response medications:', response?.medications?.map(m => ({
                name: m.name,
                schedules: m.schedules?.map(s => ({ time: s.time, daysOfWeek: s.daysOfWeek }))
            })));
            toast.success('처방전이 수정되었습니다');
            setPrescriptionData(null); // Reset to allow useEffect to re-initialize
            await fetchPrescription(id);
        } catch (error) {
            logger.error('처방전 수정 실패:', error);
            toast.error('처방전 수정에 실패했습니다');
        }
    };

    if (loading && !currentPrescription) {
        return (
            <MainLayout>
                <PageStack>
                    <PageHeader leading={<BackButton />} title="처방전" subtitle="처방전 정보를 불러오는 중..." />
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
        );
    }

    if (!currentPrescription && !loading) {
        return (
            <MainLayout>
                <PageStack>
                    <PageHeader leading={<BackButton />} title="처방전" subtitle="처방전을 찾을 수 없습니다." />
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            처방전을 찾을 수 없습니다.
                        </Typography>
                    </Paper>
                </PageStack>
            </MainLayout>
        );
    }

    if (!prescriptionData) {
        return (
            <MainLayout>
                <PageStack>
                    <PageHeader leading={<BackButton />} title="처방전" subtitle="처방전 정보를 준비하는 중..." />
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
        );
    }

    return (
        <MainLayout showBottomNav={false}>
            <Box sx={{ pb: 'calc(72px + var(--safe-area-bottom) + 24px)' }}>
                <PageStack>
                    <PageHeader
                        leading={<BackButton />}
                        title={prescriptionData.pharmacyName || '처방전'}
                        subtitle={`${prescriptionData.hospitalName || ''} | ${prescriptionData.startDate} ~ ${prescriptionData.endDate}`}
                        right={(
                            <Button type="button" color="error" variant="text" onClick={handleDelete} sx={{ fontWeight: 900 }}>
                                삭제
                            </Button>
                        )}
                    />

                    {/* 처방전 기본 정보 */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                처방전 정보
                            </Typography>
                            <Divider />

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="약국명"
                                        value={prescriptionData.pharmacyName || ''}
                                        onChange={(e) => setPrescriptionData(prev => ({
                                            ...prev,
                                            pharmacyName: e.target.value
                                        }))}
                                        placeholder="예: 청독약국"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="병원명"
                                        value={prescriptionData.hospitalName || ''}
                                        onChange={(e) => setPrescriptionData(prev => ({
                                            ...prev,
                                            hospitalName: e.target.value
                                        }))}
                                        placeholder="예: 서울대학교병원"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="복용 시작일"
                                        type="date"
                                        value={prescriptionData.startDate}
                                        onChange={(e) => setPrescriptionData(prev => ({
                                            ...prev,
                                            startDate: e.target.value
                                        }))}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="복용 종료일"
                                        type="date"
                                        value={prescriptionData.endDate}
                                        onChange={(e) => setPrescriptionData(prev => ({
                                            ...prev,
                                            endDate: e.target.value
                                        }))}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Stack>
                    </Paper>

                    {/* 복용 시간 */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                복용시간
                            </Typography>
                            <Divider />

                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                    복용 시간 ({prescriptionData.intakeTimes?.length || 0})
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                                    {prescriptionData.intakeTimes?.map((time) => (
                                        <Chip
                                            key={time}
                                            label={time}
                                            onDelete={() => handleRemoveTime(time)}
                                        />
                                    ))}
                                </Stack>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                                    <TextField
                                        type="time"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <Button type="button" variant="outlined" onClick={handleAddTime}>
                                        시간 추가
                                    </Button>
                                </Stack>
                            </Box>
                        </Stack>
                    </Paper>

                    {/* 약 목록 */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                처방약 {prescriptionData.medications?.length || 0}개
                            </Typography>
                            <Divider />

                            <Stack spacing={1.5}>
                                {prescriptionData.medications?.map((medication, index) => (
                                    <MedicationCardInPrescription
                                        key={index}
                                        medication={medication}
                                        intakeTimes={prescriptionData.intakeTimes}
                                        onEdit={() => handleEditMedication(medication, index)}
                                        onRemove={() => handleRemoveMedication(index)}
                                    />
                                ))}

                                {prescriptionData.medications?.length === 0 && (
                                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', bgcolor: 'grey.50' }}>
                                        <Typography sx={{ fontSize: 34 }} aria-hidden="true">
                                            💊
                                        </Typography>
                                        <Typography sx={{ fontWeight: 900, mt: 1 }}>
                                            처방약을 추가해주세요
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                                            약품명을 검색해서 처방전에 추가할 수 있어요.
                                        </Typography>
                                        <Button
                                            type="button"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            onClick={() => {
                                                setEditingMedicationIndex(null);
                                                setInitialMedication(null);
                                                setShowModal(true);
                                            }}
                                            sx={{ fontWeight: 900, borderRadius: 3 }}
                                        >
                                            + 약 추가
                                        </Button>
                                    </Paper>
                                )}

                                {prescriptionData.medications?.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                        onClick={() => {
                                            setEditingMedicationIndex(null);
                                            setInitialMedication(null);
                                            setShowModal(true);
                                        }}
                                        sx={{ fontWeight: 900, borderRadius: 3, mt: 0.5 }}
                                    >
                                        + 약 추가
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </Paper>

                    {/* 메모/결제 */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                메모/결제
                            </Typography>
                            <Divider />

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="결제 금액"
                                        type="number"
                                        value={prescriptionData.paymentAmount ?? ''}
                                        onChange={(e) => setPrescriptionData(prev => ({
                                            ...prev,
                                            paymentAmount: e.target.value === '' ? null : parseInt(e.target.value) || null
                                        }))}
                                        placeholder="금액 입력"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    {String(prescriptionData.notes || '').length > 60 && !notesExpanded ? (
                                        <Paper
                                            variant="outlined"
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setNotesExpanded(true)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setNotesExpanded(true);
                                                }
                                            }}
                                            sx={{ p: 2, borderRadius: 3, bgcolor: 'grey.50', cursor: 'pointer' }}
                                        >
                                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                                                메모
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                                {String(prescriptionData.notes || '').slice(0, 60)}…
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, fontWeight: 800 }}>
                                                탭하여 펼치기
                                            </Typography>
                                        </Paper>
                                    ) : (
                                        <Box>
                                            <TextField
                                                label="메모"
                                                value={prescriptionData.notes || ''}
                                                onChange={(e) => setPrescriptionData(prev => ({
                                                    ...prev,
                                                    notes: e.target.value
                                                }))}
                                                placeholder="메모 입력"
                                                multiline
                                                minRows={2}
                                                fullWidth
                                            />
                                            {String(prescriptionData.notes || '').length > 60 ? (
                                                <Button
                                                    type="button"
                                                    variant="text"
                                                    onClick={() => setNotesExpanded(false)}
                                                    sx={{ fontWeight: 900, mt: 0.5 }}
                                                >
                                                    접기
                                                </Button>
                                            ) : null}
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Stack>
                    </Paper>
                </PageStack>
            </Box>

            {/* 저장 버튼 */}
            <Paper
                elevation={6}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    px: 2.5,
                    pt: 2,
                    pb: 'calc(var(--safe-area-bottom) + 16px)',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(16px)',
                }}
            >
                <Box sx={{ maxWidth: 520, mx: 'auto' }}>
                    <Button
                        type="button"
                        onClick={handleSave}
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading || prescriptionData.medications.length === 0}
                        sx={{ fontWeight: 900, borderRadius: 3 }}
                    >
                        {loading ? '저장 중...' : '저장'}
                    </Button>
                </Box>
            </Paper>

            {/* 약 검색/수정 모달 */}
            {showModal && (
                <MedicationModal
                    intakeTimes={prescriptionData.intakeTimes}
                    onAdd={handleAddMedication}
                    onClose={() => {
                        setShowModal(false);
                        setEditingMedicationIndex(null);
                        setInitialMedication(null);
                    }}
                    initialMedication={initialMedication}
                    mode={editingMedicationIndex !== null ? 'edit' : 'add'}
                />
            )}
        </MainLayout>
    );
};

export default PrescriptionDetailPage;
