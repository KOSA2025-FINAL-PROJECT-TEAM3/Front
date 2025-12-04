import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@shared/components/layout/MainLayout';
import { MedicationCardInPrescription } from '../components/MedicationCardInPrescription';
import { MedicationSearchModal } from '../components/MedicationSearchModal';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { toast } from '@shared/components/toast/toastStore';
import { ROUTE_PATHS } from '@config/routes.config';
import styles from './PrescriptionDetailPage.module.scss';

export const PrescriptionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        currentPrescription,
        fetchPrescription,
        deletePrescription,
        addMedicationToPrescription,
        removeMedicationFromPrescription,
        loading
    } = usePrescriptionStore();

    const [showSearchModal, setShowSearchModal] = useState(false);
    const [initialMedication, setInitialMedication] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedPrescription, setEditedPrescription] = useState(null);

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
        if (location.state?.addDrug) {
            setInitialMedication(location.state.addDrug);
            setShowSearchModal(true);
            // state 초기화 (새로고침 시 다시 뜨지 않도록)
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

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

    const handleEdit = () => {
        setIsEditMode(true);
        setEditedPrescription({
            ...currentPrescription,
            medications: [...currentPrescription.medications]
        });
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditedPrescription(null);
    };

    const handleSaveEdit = async () => {
        if (!editedPrescription) return;

        try {
            // 수정된 처방전 데이터를 백엔드 형식으로 변환
            const updateData = {
                pharmacyName: editedPrescription.pharmacyName,
                hospitalName: editedPrescription.hospitalName,
                startDate: editedPrescription.startDate,
                endDate: editedPrescription.endDate,
                intakeTimes: editedPrescription.intakeTimes.map(time => time + ':00'),
                paymentAmount: editedPrescription.paymentAmount,
                notes: editedPrescription.notes,
                medications: editedPrescription.medications.map(med => ({
                    name: med.name,
                    category: med.ingredient,
                    dosageAmount: parseInt(med.dosage) || 1,
                    totalIntakes: med.quantity || null,
                    daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN',
                    intakeTimeIndices: null,
                    notes: med.notes,
                    imageUrl: med.imageUrl
                }))
            };

            await usePrescriptionStore.getState().updatePrescription(id, updateData);
            toast.success('처방전이 수정되었습니다');
            setIsEditMode(false);
            setEditedPrescription(null);
            await fetchPrescription(id);
        } catch (error) {
            console.error('처방전 수정 실패:', error);
            toast.error('처방전 수정에 실패했습니다');
        }
    };

    const handleAddMedication = async (medicationData) => {
        try {
            await addMedicationToPrescription(id, medicationData);
            toast.success('약이 추가되었습니다');
            setShowSearchModal(false);
            setInitialMedication(null);
        } catch (error) {
            console.error('약 추가 실패:', error);
            toast.error('약 추가에 실패했습니다');
        }
    };

    const handleRemoveMedication = (medicationId) => {
        if (isEditMode) {
            // 편집 모드에서는 프론트엔드 상태에서만 삭제
            setEditedPrescription(prev => ({
                ...prev,
                medications: prev.medications.filter(med => med.id !== medicationId)
            }));
            toast.info('약이 제거되었습니다. 저장 버튼을 눌러 변경사항을 반영하세요.');
        }
    };

    if (loading && !currentPrescription) {
        return (
            <MainLayout>
                <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>
            </MainLayout>
        );
    }

    if (!currentPrescription) {
        return (
            <MainLayout>
                <div style={{ padding: '40px', textAlign: 'center' }}>처방전을 찾을 수 없습니다</div>
            </MainLayout>
        );
    }

    const displayPrescription = isEditMode ? editedPrescription : currentPrescription;

    return (
        <MainLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>{displayPrescription.pharmacyName || '약국명 미입력'}</h1>
                    <div className={styles.meta}>
                        <span>{displayPrescription.hospitalName || '병원명 미입력'}</span>
                        <span>{displayPrescription.startDate} ~ {displayPrescription.endDate}</span>
                    </div>
                </header>

                <section className={styles.section}>
                    <h2>기본 정보</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>복용 기간</span>
                            <span className={styles.value}>
                                {displayPrescription.startDate} ~ {displayPrescription.endDate}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>결제 금액</span>
                            <span className={styles.value}>
                                {displayPrescription.paymentAmount
                                    ? `${displayPrescription.paymentAmount.toLocaleString()}원`
                                    : '-'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>메모</span>
                            <span className={styles.value}>{displayPrescription.notes || '-'}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <span className={styles.label} style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>
                            복용 시간
                        </span>
                        <div className={styles.intakeTimes}>
                            {displayPrescription.intakeTimes?.map((time, index) => (
                                <span key={index} className={styles.timeChip}>{time}</span>
                            ))}
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ margin: 0 }}>처방약 목록 ({displayPrescription.medications?.length || 0})</h2>
                        {!isEditMode && (
                            <button
                                onClick={() => {
                                    setInitialMedication(null);
                                    setShowSearchModal(true);
                                }}
                                style={{
                                    padding: '6px 12px',
                                    backgroundColor: '#4A90E2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                + 약 추가
                            </button>
                        )}
                    </div>
                    <div className={styles.medicationList}>
                        {displayPrescription.medications?.map((medication) => (
                            <MedicationCardInPrescription
                                key={medication.id}
                                medication={{
                                    ...medication,
                                    category: medication.ingredient,
                                    dosageAmount: parseInt(medication.dosage) || 1,
                                }}
                                intakeTimes={displayPrescription.intakeTimes}
                                onEdit={() => toast.info('개별 약 수정은 준비 중입니다')}
                                onRemove={isEditMode ? () => handleRemoveMedication(medication.id) : null}
                            />
                        ))}
                    </div>
                </section>

                <div className={styles.actions}>
                    {isEditMode ? (
                        <>
                            <button onClick={handleCancelEdit} className={styles.deleteButton}>
                                취소
                            </button>
                            <button onClick={handleSaveEdit} className={styles.editButton}>
                                저장
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleDelete} className={styles.deleteButton}>
                                처방전 삭제
                            </button>
                            <button onClick={handleEdit} className={styles.editButton}>
                                처방전 수정
                            </button>
                        </>
                    )}
                </div>
            </div>

            {showSearchModal && (
                <MedicationSearchModal
                    intakeTimes={currentPrescription.intakeTimes}
                    onAdd={handleAddMedication}
                    onClose={() => {
                        setShowSearchModal(false);
                        setInitialMedication(null);
                    }}
                    initialMedication={initialMedication}
                />
            )}
        </MainLayout>
    );
};

export default PrescriptionDetailPage;
