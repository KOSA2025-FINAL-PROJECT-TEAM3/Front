import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@shared/components/layout/MainLayout';
import { MedicationCardInPrescription } from '../components/MedicationCardInPrescription';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { toast } from '@shared/components/toast/toastStore';
import { ROUTE_PATHS } from '@config/routes.config';
import styles from './PrescriptionDetailPage.module.scss';

export const PrescriptionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentPrescription, fetchPrescription, deletePrescription, loading, error } = usePrescriptionStore();

    useEffect(() => {
        if (id) {
            fetchPrescription(id).catch(err => {
                console.error('처방전 로딩 실패:', err);
                toast.error('처방전 정보를 불러오는데 실패했습니다');
                navigate(ROUTE_PATHS.medication);
            });
        }
    }, [id, fetchPrescription, navigate]);

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
        // TODO: 처방전 수정 페이지로 이동
        toast.info('처방전 수정 기능은 준비 중입니다');
        // navigate(ROUTE_PATHS.prescriptionEdit.replace(':id', id));
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

    return (
        <MainLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>{currentPrescription.pharmacyName || '약국명 미입력'}</h1>
                    <div className={styles.meta}>
                        <span>{currentPrescription.hospitalName || '병원명 미입력'}</span>
                        <span>{currentPrescription.startDate} ~ {currentPrescription.endDate}</span>
                    </div>
                </header>

                <section className={styles.section}>
                    <h2>기본 정보</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>복용 기간</span>
                            <span className={styles.value}>
                                {currentPrescription.startDate} ~ {currentPrescription.endDate}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>결제 금액</span>
                            <span className={styles.value}>
                                {currentPrescription.paymentAmount
                                    ? `${currentPrescription.paymentAmount.toLocaleString()}원`
                                    : '-'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>메모</span>
                            <span className={styles.value}>{currentPrescription.notes || '-'}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <span className={styles.label} style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>
                            복용 시간
                        </span>
                        <div className={styles.intakeTimes}>
                            {currentPrescription.intakeTimes?.map((time, index) => (
                                <span key={index} className={styles.timeChip}>{time}</span>
                            ))}
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>처방약 목록 ({currentPrescription.medications?.length || 0})</h2>
                    <div className={styles.medicationList}>
                        {currentPrescription.medications?.map((medication) => (
                            <MedicationCardInPrescription
                                key={medication.id}
                                medication={{
                                    ...medication,
                                    category: medication.ingredient, // DTO 매핑 차이 보정
                                    dosageAmount: parseInt(medication.dosage) || 1,
                                    // 서버 응답에는 intakeTimeIndices가 없으므로 계산하거나 표시 방식 조정 필요
                                    // 여기서는 단순 표시용으로 처리
                                }}
                                intakeTimes={currentPrescription.intakeTimes}
                                onEdit={() => toast.info('개별 약 수정은 준비 중입니다')}
                                onRemove={() => toast.info('개별 약 삭제는 준비 중입니다')}
                            />
                        ))}
                    </div>
                </section>

                <div className={styles.actions}>
                    <button onClick={handleDelete} className={styles.deleteButton}>
                        처방전 삭제
                    </button>
                    <button onClick={handleEdit} className={styles.editButton}>
                        처방전 수정
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};

export default PrescriptionDetailPage;
