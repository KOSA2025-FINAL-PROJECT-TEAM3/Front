import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@shared/components/layout/MainLayout';
import { MedicationCardInPrescription } from '../components/MedicationCardInPrescription';
import { MedicationModal } from '../components/MedicationModal';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { toast } from '@shared/components/toast/toastStore';
import { ROUTE_PATHS } from '@config/routes.config';
import styles from './PrescriptionAddPage.module.scss'; // Reuse AddPage styles

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
                console.error('처방전 로딩 실패:', err);
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

                console.log('[DEBUG] Normalizing medication:', med.name, 'daysOfWeek:', daysOfWeek);

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
                console.error('삭제 실패:', err);
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

            console.log('[DEBUG] Saving prescription with medications:', formattedData.medications.map(m => ({
                name: m.name,
                daysOfWeek: m.daysOfWeek
            })));

            const response = await updatePrescription(id, formattedData);
            console.log('[DEBUG] Update response medications:', response?.medications?.map(m => ({
                name: m.name,
                schedules: m.schedules?.map(s => ({ time: s.time, daysOfWeek: s.daysOfWeek }))
            })));
            toast.success('처방전이 수정되었습니다');
            setIsEditMode(false);
            setPrescriptionData(null); // Reset to allow useEffect to re-initialize
            await fetchPrescription(id);
        } catch (error) {
            console.error('처방전 수정 실패:', error);
            toast.error('처방전 수정에 실패했습니다');
        }
    };

    if (loading && !currentPrescription) {
        return (
            <MainLayout>
                <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>
            </MainLayout>
        );
    }

    if (!currentPrescription || !prescriptionData) {
        return (
            <MainLayout>
                <div style={{ padding: '40px', textAlign: 'center' }}>처방전을 찾을 수 없습니다</div>
            </MainLayout>
        );
    }

    const displayData = isEditMode ? prescriptionData : currentPrescription;

    return (
        <MainLayout showBottomNav={false}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>{isEditMode ? '처방전 수정' : displayData.pharmacyName || '처방전 상세'}</h1>
                    <p>{isEditMode ? '처방전 정보를 수정하세요' : `${displayData.hospitalName || ''} | ${displayData.startDate} ~ ${displayData.endDate}`}</p>
                </header>

                {/* 처방전 기본 정보 */}
                <section className={styles.prescriptionInfo}>
                    <h2>처방전 정보</h2>
                    <div className={styles.formGrid}>
                        <label>
                            약국명
                            {isEditMode ? (
                                <input
                                    type="text"
                                    value={prescriptionData.pharmacyName}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        pharmacyName: e.target.value
                                    }))}
                                    placeholder="예: 청독약국"
                                />
                            ) : (
                                <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                                    {displayData.pharmacyName || '-'}
                                </div>
                            )}
                        </label>

                        <label>
                            병원명
                            {isEditMode ? (
                                <input
                                    type="text"
                                    value={prescriptionData.hospitalName}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        hospitalName: e.target.value
                                    }))}
                                    placeholder="예: 서울대학교병원"
                                />
                            ) : (
                                <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                                    {displayData.hospitalName || '-'}
                                </div>
                            )}
                        </label>

                        <label>
                            복용 시작일
                            {isEditMode ? (
                                <input
                                    type="date"
                                    value={prescriptionData.startDate}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        startDate: e.target.value
                                    }))}
                                    required
                                />
                            ) : (
                                <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                                    {displayData.startDate}
                                </div>
                            )}
                        </label>

                        <label>
                            복용 종료일
                            {isEditMode ? (
                                <input
                                    type="date"
                                    value={prescriptionData.endDate}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        endDate: e.target.value
                                    }))}
                                    required
                                />
                            ) : (
                                <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                                    {displayData.endDate}
                                </div>
                            )}
                        </label>

                        <label>
                            결제 금액
                            {isEditMode ? (
                                <input
                                    type="number"
                                    value={prescriptionData.paymentAmount || ''}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        paymentAmount: parseInt(e.target.value) || null
                                    }))}
                                    placeholder="금액 입력"
                                />
                            ) : (
                                <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                                    {displayData.paymentAmount ? `${displayData.paymentAmount.toLocaleString()}원` : '-'}
                                </div>
                            )}
                        </label>

                        <label>
                            메모
                            {isEditMode ? (
                                <textarea
                                    value={prescriptionData.notes}
                                    onChange={(e) => setPrescriptionData(prev => ({
                                        ...prev,
                                        notes: e.target.value
                                    }))}
                                    placeholder="메모 입력"
                                    rows={3}
                                />
                            ) : (
                                <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px', minHeight: '60px' }}>
                                    {displayData.notes || '-'}
                                </div>
                            )}
                        </label>
                    </div>

                    {/* 복용 시간 설정 */}
                    <div className={styles.intakeTimes}>
                        <h3>복용 시간 ({displayData.intakeTimes?.length || 0})</h3>
                        <div className={styles.timeList}>
                            {displayData.intakeTimes?.map((time, index) => (
                                <div key={index} className={styles.timeItem}>
                                    {time}
                                    {isEditMode && (
                                        <button onClick={() => handleRemoveTime(time)}>×</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {isEditMode && (
                            <div className={styles.addTime}>
                                <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                />
                                <button onClick={handleAddTime} type="button">시간 추가</button>
                            </div>
                        )}
                    </div>
                </section>

                {/* 약 목록 */}
                <section className={styles.medicationList}>
                    <div className={styles.listHeader}>
                        <h2>처방약 {displayData.medications?.length || 0}개</h2>
                        {isEditMode && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingMedicationIndex(null);
                                    setInitialMedication(null);
                                    setShowModal(true);
                                }}
                                className={styles.addButton}
                            >
                                + 약 추가
                            </button>
                        )}
                    </div>

                    <div className={styles.medications}>
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
                            <div className={styles.emptyState}>
                                <p>약을 추가해주세요</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 저장 버튼 */}
                <footer className={styles.footer}>
                    {isEditMode ? (
                        <>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className={styles.cancelButton}
                                disabled={loading}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className={styles.submitButton}
                                disabled={loading || prescriptionData.medications.length === 0}
                            >
                                {loading ? '저장 중...' : '저장'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className={styles.cancelButton}
                            >
                                뒤로
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className={styles.cancelButton}
                                style={{ background: '#dc3545' }}
                            >
                                삭제
                            </button>
                            <button
                                type="button"
                                onClick={handleEdit}
                                className={styles.submitButton}
                            >
                                수정
                            </button>
                        </>
                    )}
                </footer>
            </div>

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
