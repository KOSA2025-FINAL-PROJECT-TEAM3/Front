import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@shared/components/layout/MainLayout';
import { Box, Button, Chip, CircularProgress, Divider, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
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

    const [isEditMode, setIsEditMode] = useState(false);
    const [prescriptionData, setPrescriptionData] = useState(null);
    const [newTime, setNewTime] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingMedicationIndex, setEditingMedicationIndex] = useState(null);
    const [initialMedication, setInitialMedication] = useState(null);

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
            setIsEditMode(true);
            setPrescriptionData({
                ...currentPrescription,
                medications: [...currentPrescription.medications]
            });
            setShowModal(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, currentPrescription]);

    // currentPrescription이 로드되면 prescriptionData 초기화
    useEffect(() => {
        if (currentPrescription && !prescriptionData) {
            // medications를 편집 가능한 형식으로 변환
            const normalizedMedications = (currentPrescription.medications || []).map(med => {
                // schedules에서 intakeTimeIndices 계산
                const intakeTimeIndices = med.schedules
                    ? med.schedules.map(schedule => {
                        const timeIndex = currentPrescription.intakeTimes.findIndex(t => t === schedule.time);
                        return timeIndex >= 0 ? timeIndex : null;
                    }).filter(idx => idx !== null)
                    : null;

                // schedules에서 daysOfWeek 추출 (첫 번째 schedule의 값 사용)
                const daysOfWeek = med.schedules && med.schedules.length > 0
                    ? med.schedules[0].daysOfWeek
                    : 'MON,TUE,WED,THU,FRI,SAT,SUN';

                logger.debug('[DEBUG] Normalizing medication:', med.name, 'daysOfWeek:', daysOfWeek);

                return {
                    ...med,
                    dosageAmount: parseInt(med.dosage) || 1,
                    intakeTimeIndices: intakeTimeIndices,
                    daysOfWeek: daysOfWeek
                };
            });

            setPrescriptionData({
                pharmacyName: currentPrescription.pharmacyName || '',
                hospitalName: currentPrescription.hospitalName || '',
                startDate: currentPrescription.startDate,
                endDate: currentPrescription.endDate,
                intakeTimes: currentPrescription.intakeTimes || [],
                medications: normalizedMedications,
                paymentAmount: currentPrescription.paymentAmount,
                notes: currentPrescription.notes || ''
            });
        }
    }, [currentPrescription, prescriptionData]);

    const handleEdit = () => {
        // medications를 편집 가능한 형식으로 변환
        const normalizedMedications = (currentPrescription.medications || []).map(med => {
            const intakeTimeIndices = med.schedules
                ? med.schedules.map(schedule => {
                    const timeIndex = currentPrescription.intakeTimes.findIndex(t => t === schedule.time);
                    return timeIndex >= 0 ? timeIndex : null;
                }).filter(idx => idx !== null)
                : null;

            const daysOfWeek = med.schedules && med.schedules.length > 0
                ? med.schedules[0].daysOfWeek
                : 'MON,TUE,WED,THU,FRI,SAT,SUN';

            return {
                ...med,
                dosageAmount: parseInt(med.dosage) || 1,
                intakeTimeIndices: intakeTimeIndices,
                daysOfWeek: daysOfWeek
            };
        });

        setIsEditMode(true);
        setPrescriptionData({
            ...currentPrescription,
            medications: normalizedMedications
        });
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setPrescriptionData({
            ...currentPrescription,
            medications: [...currentPrescription.medications]
        });
    };

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
            setIsEditMode(false);
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
                <Box sx={{ p: 5, textAlign: 'center' }}>
                    <Stack spacing={2} alignItems="center">
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary">
                            로딩 중...
                        </Typography>
                    </Stack>
                </Box>
            </MainLayout>
        );
    }

    if (!currentPrescription || !prescriptionData) {
        return (
            <MainLayout>
                <Box sx={{ p: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        처방전을 찾을 수 없습니다
                    </Typography>
                </Box>
            </MainLayout>
        );
    }

    const displayData = isEditMode ? prescriptionData : currentPrescription;
    const paymentValue = isEditMode
        ? (prescriptionData.paymentAmount || '')
        : (displayData.paymentAmount ? `${displayData.paymentAmount.toLocaleString()}원` : '');

    return (
        <MainLayout showBottomNav={false}>
            <Box sx={{ maxWidth: 800, mx: 'auto', px: 2.5, py: 2.5, pb: 12 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {isEditMode ? '처방전 수정' : displayData.pharmacyName || '처방전 상세'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {isEditMode
                            ? '처방전 정보를 수정하세요'
                            : `${displayData.hospitalName || ''} | ${displayData.startDate} ~ ${displayData.endDate}`}
                    </Typography>
                </Box>

                {/* 처방전 기본 정보 */}
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                    <Stack spacing={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                            처방전 정보
                        </Typography>
                        <Divider />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="약국명"
                                    value={displayData.pharmacyName || ''}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        pharmacyName: e.target.value
                                    }))}
                                    placeholder="예: 청독약국"
                                    InputProps={{ readOnly: !isEditMode }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="병원명"
                                    value={displayData.hospitalName || ''}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        hospitalName: e.target.value
                                    }))}
                                    placeholder="예: 서울대학교병원"
                                    InputProps={{ readOnly: !isEditMode }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="복용 시작일"
                                    type="date"
                                    value={displayData.startDate}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        startDate: e.target.value
                                    }))}
                                    required={isEditMode}
                                    disabled={!isEditMode}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="복용 종료일"
                                    type="date"
                                    value={displayData.endDate}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        endDate: e.target.value
                                    }))}
                                    required={isEditMode}
                                    disabled={!isEditMode}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="결제 금액"
                                    type={isEditMode ? 'number' : 'text'}
                                    value={paymentValue}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        paymentAmount: parseInt(e.target.value) || null
                                    }))}
                                    placeholder="금액 입력"
                                    InputProps={{ readOnly: !isEditMode }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="메모"
                                    value={displayData.notes || ''}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        notes: e.target.value
                                    }))}
                                    placeholder="메모 입력"
                                    InputProps={{ readOnly: !isEditMode }}
                                    multiline
                                    minRows={3}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>

                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                복용 시간 ({displayData.intakeTimes?.length || 0})
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                                {displayData.intakeTimes?.map((time) => (
                                    <Chip
                                        key={time}
                                        label={time}
                                        onDelete={isEditMode ? () => handleRemoveTime(time) : undefined}
                                    />
                                ))}
                            </Stack>

                            {isEditMode && (
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
                            )}
                        </Box>
                    </Stack>
                </Paper>

                {/* 약 목록 */}
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                처방약 {displayData.medications?.length || 0}개
                            </Typography>
                            {isEditMode && (
                                <Button
                                    type="button"
                                    variant="contained"
                                    onClick={() => {
                                        setEditingMedicationIndex(null);
                                        setInitialMedication(null);
                                        setShowModal(true);
                                    }}
                                >
                                    + 약 추가
                                </Button>
                            )}
                        </Stack>
                        <Divider />

                        <Stack spacing={1.5}>
                            {displayData.medications?.map((medication, index) => (
                                <MedicationCardInPrescription
                                    key={index}
                                    medication={medication}
                                    intakeTimes={displayData.intakeTimes}
                                    onEdit={isEditMode ? () => handleEditMedication(medication, index) : null}
                                    onRemove={isEditMode ? () => handleRemoveMedication(index) : null}
                                />
                            ))}

                            {displayData.medications?.length === 0 && (
                                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        약을 추가해주세요
                                    </Typography>
                                </Paper>
                            )}
                        </Stack>
                    </Stack>
                </Paper>

                {/* 저장 버튼 */}
                <Paper
                    elevation={6}
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                            {isEditMode ? (
                                <>
                                    <Button type="button" onClick={handleCancelEdit} variant="outlined" disabled={loading}>
                                        취소
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSave}
                                        variant="contained"
                                        disabled={loading || prescriptionData.medications.length === 0}
                                    >
                                        {loading ? '저장 중...' : '저장'}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button type="button" onClick={() => navigate(-1)} variant="outlined">
                                        뒤로
                                    </Button>
                                    <Button type="button" onClick={handleDelete} color="error" variant="contained">
                                        삭제
                                    </Button>
                                    <Button type="button" onClick={handleEdit} variant="contained">
                                        수정
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Box>
                </Paper>
            </Box>

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
