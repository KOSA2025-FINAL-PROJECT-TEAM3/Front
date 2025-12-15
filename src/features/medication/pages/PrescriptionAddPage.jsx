import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@shared/components/layout/MainLayout';
import { Box, Button, Chip, Divider, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { MedicationModal } from '../components/MedicationModal';
import { MedicationCardInPrescription } from '../components/MedicationCardInPrescription';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { toast } from '@shared/components/toast/toastStore';
import { ROUTE_PATHS } from '@config/routes.config';
import logger from '@core/utils/logger';

export const PrescriptionAddPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        createPrescription,
        updatePrescription,
        fetchPrescription,
        loading,
        resetState
    } = usePrescriptionStore();

    // 수정 모드인지 확인
    const editPrescriptionId = location.state?.editPrescriptionId;
    const isEditMode = !!editPrescriptionId;

    // 오늘 날짜와 30일 후 날짜 계산
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const endDateDefault = thirtyDaysLater.toISOString().split('T')[0];

    const [prescriptionData, setPrescriptionData] = useState({
        pharmacyName: '',
        hospitalName: '',
        startDate: today,
        endDate: endDateDefault,
        intakeTimes: ['08:00', '13:00', '19:00'],
        medications: [],
        paymentAmount: null,
        notes: ''
    });

    const [newTime, setNewTime] = useState('');
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [editingMedicationIndex, setEditingMedicationIndex] = useState(null);

    // 마운트 시 상태 초기화 (loading 상태 리셋)
    useEffect(() => {
        resetState();
    }, [resetState]);

    // 수정 모드일 경우 기존 데이터 로드
    useEffect(() => {
        if (isEditMode) {
            const loadPrescription = async () => {
                try {
                    const data = await fetchPrescription(editPrescriptionId);
                    setPrescriptionData({
                        pharmacyName: data.pharmacyName || '',
                        hospitalName: data.hospitalName || '',
                        startDate: data.startDate,
                        endDate: data.endDate,
                        intakeTimes: data.intakeTimes || [],
                        medications: (data.medications || []).map(med => ({
                            ...med,
                            category: med.ingredient, // DTO 매핑 차이 보정
                            dosageAmount: parseInt(med.dosage) || 1,
                            // 서버 응답에는 intakeTimeIndices가 없으므로 계산 필요하지만,
                            // 여기서는 단순화를 위해 null로 설정하거나 기존 로직 유지
                            intakeTimeIndices: null
                        })),
                        paymentAmount: data.paymentAmount,
                        notes: data.notes || ''
                    });
                } catch (error) {
                    logger.error('처방전 로드 실패:', error);
                    toast.error('처방전 정보를 불러오는데 실패했습니다');
                    navigate(-1);
                }
            };
            loadPrescription();
        }
    }, [isEditMode, editPrescriptionId, fetchPrescription, navigate]);

    // OCR 결과 또는 약 검색 결과 자동 입력
    useEffect(() => {
        if (location.state?.ocrData) {
            const ocrData = location.state.ocrData;
            logger.debug('🔄 OCR 데이터 로드 시작:', ocrData);

            // OCR 데이터 중복 약물 제거
            const uniqueMedications = [];
            const seenNames = new Set();
            
            if (ocrData.medications) {
                ocrData.medications.forEach(med => {
                    if (!seenNames.has(med.name)) {
                        seenNames.add(med.name);
                        uniqueMedications.push(med);
                    }
                });
            }

            setPrescriptionData(prev => ({
                ...prev,
                ...ocrData,
                startDate: ocrData.startDate || prev.startDate,
                endDate: ocrData.endDate || prev.endDate,
                intakeTimes: ocrData.intakeTimes || prev.intakeTimes,
                medications: uniqueMedications,
                hospitalName: ocrData.hospitalName || '',
                pharmacyName: ocrData.pharmacyName || ''
            }));

            toast.success('OCR 데이터가 입력되었습니다');
        } else if (location.state?.addDrug) {
            // 약 검색에서 온 경우
            const drug = location.state.addDrug;
            logger.debug('🔄 약 검색 데이터 로드:', drug);

            const medicationData = {
                name: drug.itemName,
                category: drug.entpName,
                dosageAmount: 1,
                intakeTimeIndices: null, // 모든 시간
                daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN',
                notes: '',
                imageUrl: drug.itemImage,
                totalIntakes: 30
            };

            setPrescriptionData(prev => ({
                ...prev,
                medications: [medicationData]
            }));

            toast.success(`${drug.itemName}이(가) 추가되었습니다`);
        }
    }, [location.state]);

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
        // 중복 약물 체크
        const isDuplicate = prescriptionData.medications.some(
            existing => existing.name === medication.name
        );

        if (isDuplicate) {
            toast.error('이미 추가된 약입니다. 복용량을 조절해주세요.');
            return;
        }

        setPrescriptionData(prev => ({
            ...prev,
            medications: [...prev.medications, medication]
        }));
        setShowSearchModal(false);
        toast.success('약이 추가되었습니다');
    };

    const handleRemoveMedication = (indexToRemove) => {
        setPrescriptionData(prev => ({
            ...prev,
            medications: prev.medications.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleEditMedication = (index) => {
        setEditingMedicationIndex(index);
        setShowSearchModal(true);
    };

    const handleUpdateMedication = (updatedMedication) => {
        setPrescriptionData(prev => {
            const newMedications = [...prev.medications];
            newMedications[editingMedicationIndex] = updatedMedication;
            return {
                ...prev,
                medications: newMedications
            };
        });
        handleCloseModal();
        toast.success('약 정보가 수정되었습니다');
    };

    const handleCloseModal = () => {
        setShowSearchModal(false);
        setEditingMedicationIndex(null);
    };

    const handleSubmit = async () => {
        if (prescriptionData.medications.length === 0) {
            toast.error('최소 1개 이상의 약을 등록해주세요');
            return;
        }

        try {
            if (isEditMode) {
                logger.debug('📤 처방전 수정 요청:', prescriptionData);
                await updatePrescription(editPrescriptionId, prescriptionData);
                toast.success('처방전이 수정되었습니다');
                navigate(ROUTE_PATHS.prescriptionDetail.replace(':id', editPrescriptionId), { replace: true });
            } else {
                logger.debug('📤 처방전 등록 요청:', prescriptionData);
                await createPrescription(prescriptionData);
                toast.success('처방전이 등록되었습니다');
                navigate(ROUTE_PATHS.medication, { replace: true });
            }
        } catch (error) {
            logger.error('❌ 처방전 저장 실패:', error);
            toast.error(error.message || '처방전 저장에 실패했습니다');
        }
    };

    return (
        <MainLayout showBottomNav={false}>
            <Box sx={{ maxWidth: 800, mx: 'auto', px: 2.5, py: 2.5, pb: 12 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {isEditMode ? '처방전 수정' : '약 등록'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {isEditMode ? '처방전 정보를 수정하세요' : '처방전 정보를 입력하고 약을 추가하세요'}
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
                                    value={prescriptionData.pharmacyName}
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
                                    value={prescriptionData.hospitalName}
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

                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                복용 시간 ({prescriptionData.intakeTimes.length})
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                                {prescriptionData.intakeTimes.map((time) => (
                                    <Chip key={time} label={time} onDelete={() => handleRemoveTime(time)} />
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
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                                처방약 {prescriptionData.medications.length}개
                            </Typography>
                            <Button type="button" variant="contained" onClick={() => setShowSearchModal(true)}>
                                + 약 추가
                            </Button>
                        </Stack>
                        <Divider />

                        <Stack spacing={1.5}>
                            {prescriptionData.medications.map((medication, index) => (
                                <MedicationCardInPrescription
                                    key={index}
                                    medication={medication}
                                    intakeTimes={prescriptionData.intakeTimes}
                                    onEdit={() => handleEditMedication(index)}
                                    onRemove={() => handleRemoveMedication(index)}
                                />
                            ))}

                            {prescriptionData.medications.length === 0 && (
                                <Paper
                                    variant="outlined"
                                    sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}
                                >
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
                            <Button
                                type="button"
                                onClick={() => navigate(-1)}
                                variant="outlined"
                                disabled={loading}
                            >
                                취소
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                variant="contained"
                                disabled={loading || prescriptionData.medications.length === 0}
                            >
                                {loading ? '저장 중...' : '저장'}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Box>

            {showSearchModal && (
                <MedicationModal
                    intakeTimes={prescriptionData.intakeTimes}
                    onAdd={editingMedicationIndex !== null ? handleUpdateMedication : handleAddMedication}
                    onClose={handleCloseModal}
                    initialMedication={editingMedicationIndex !== null ? prescriptionData.medications[editingMedicationIndex] : null}
                    mode={editingMedicationIndex !== null ? 'edit' : 'add'}
                />
            )}
        </MainLayout>
    );
};

export default PrescriptionAddPage;
