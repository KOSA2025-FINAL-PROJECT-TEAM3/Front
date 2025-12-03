import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '@shared/components/layout/MainLayout';
import { MedicationSearchModal } from '../components/MedicationSearchModal';
import { MedicationCardInPrescription } from '../components/MedicationCardInPrescription';
import { usePrescriptionStore } from '../store/prescriptionStore';
import { toast } from '@shared/components/toast/toastStore';
import { ROUTE_PATHS } from '@config/routes.config';
import styles from './PrescriptionAddPage.module.scss';

export const PrescriptionAddPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { createPrescription, loading } = usePrescriptionStore();

    // 오늘 날짜와 30일 후 날짜 계산
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const endDateDefault = thirtyDaysLater.toISOString().split('T')[0];

    const [prescriptionData, setPrescriptionData] = useState({
        pharmacyName: '',
        hospitalName: '', // null이 아니라 빈 문자열로 초기화 (controlled input 호환)
        startDate: today,
        endDate: endDateDefault,
        intakeTimes: ['08:00', '13:00', '19:00'], // HH:mm 포맷
        medications: [], // 추가된 약 목록
        paymentAmount: null,
        notes: ''
    });

    const [newTime, setNewTime] = useState('');
    const [showSearchModal, setShowSearchModal] = useState(false);

    // OCR 결과 자동 입력
    useEffect(() => {
        if (location.state?.ocrData) {
            const ocrData = location.state.ocrData;
            setPrescriptionData(prev => ({
                ...prev,
                ...ocrData,
                // 날짜 형식이 맞지 않을 경우 처리 필요할 수 있음
                startDate: ocrData.startDate || prev.startDate,
                endDate: ocrData.endDate || prev.endDate,
                intakeTimes: ocrData.intakeTimes || prev.intakeTimes,
                medications: ocrData.medications || [],
                // null 값을 빈 문자열로 변환 (controlled input 호환)
                hospitalName: ocrData.hospitalName || '',
                pharmacyName: ocrData.pharmacyName || ''
            }));

            toast.success('OCR 데이터가 입력되었습니다');
        }
    }, [location.state]);

    const handleAddTime = () => {
        if (!newTime) return;
        if (prescriptionData.intakeTimes.includes(newTime)) {
            toast.error('이미 존재하는 시간입니다');
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
        setPrescriptionData(prev => ({
            ...prev,
            medications: [...prev.medications, medication]
        }));
        setShowSearchModal(false);
        toast.success('약이 추가되었습니다');
    };

    const handleRemoveMedication = (index) => {
        setPrescriptionData(prev => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (prescriptionData.medications.length === 0) {
            toast.error('최소 1개 이상의 약을 추가해주세요');
            return;
        }

        if (prescriptionData.intakeTimes.length === 0) {
            toast.error('복용 시간을 설정해주세요');
            return;
        }

        try {
            await createPrescription(prescriptionData);
            toast.success('처방전이 등록되었습니다');
            navigate(ROUTE_PATHS.medication, { replace: true });
        } catch (error) {
            console.error('처방전 등록 실패:', error);
            toast.error('처방전 등록에 실패했습니다');
        }
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>약 등록</h1>
                    <p>처방전 정보를 입력하고 약을 추가하세요</p>
                </header>

                {/* 처방전 기본 정보 */}
                <section className={styles.prescriptionInfo}>
                    <h2>처방전 정보</h2>
                    <div className={styles.formGrid}>
                        <label>
                            약국명
                            <input
                                type="text"
                                value={prescriptionData.pharmacyName}
                                onChange={(e) => setPrescriptionData(prev => ({
                                    ...prev,
                                    pharmacyName: e.target.value
                                }))}
                                placeholder="예: 청독약국"
                            />
                        </label>

                        <label>
                            병원명
                            <input
                                type="text"
                                value={prescriptionData.hospitalName}
                                onChange={(e) => setPrescriptionData(prev => ({
                                    ...prev,
                                    hospitalName: e.target.value
                                }))}
                                placeholder="예: 서울대학교병원"
                            />
                        </label>

                        <label>
                            복용 시작일
                            <input
                                type="date"
                                value={prescriptionData.startDate}
                                onChange={(e) => setPrescriptionData(prev => ({
                                    ...prev,
                                    startDate: e.target.value
                                }))}
                                required
                            />
                        </label>

                        <label>
                            복용 종료일
                            <input
                                type="date"
                                value={prescriptionData.endDate}
                                onChange={(e) => setPrescriptionData(prev => ({
                                    ...prev,
                                    endDate: e.target.value
                                }))}
                                required
                            />
                        </label>
                    </div>

                    {/* 복용 시간 설정 */}
                    <div className={styles.intakeTimes}>
                        <h3>복용 시간 ({prescriptionData.intakeTimes.length})</h3>
                        <div className={styles.timeList}>
                            {prescriptionData.intakeTimes.map((time, index) => (
                                <div key={index} className={styles.timeItem}>
                                    {time}
                                    <button onClick={() => handleRemoveTime(time)}>×</button>
                                </div>
                            ))}
                        </div>
                        <div className={styles.addTime}>
                            <input
                                type="time"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                            />
                            <button onClick={handleAddTime} type="button">시간 추가</button>
                        </div>
                    </div>
                </section>

                {/* 약 목록 */}
                <section className={styles.medicationList}>
                    <div className={styles.listHeader}>
                        <h2>처방약 {prescriptionData.medications.length}개</h2>
                        <button
                            type="button"
                            onClick={() => setShowSearchModal(true)}
                            className={styles.addButton}
                        >
                            + 약 추가
                        </button>
                    </div>

                    <div className={styles.medications}>
                        {prescriptionData.medications.map((medication, index) => (
                            <MedicationCardInPrescription
                                key={index}
                                medication={medication}
                                intakeTimes={prescriptionData.intakeTimes}
                                onEdit={() => toast.info('수정 기능은 준비 중입니다')}
                                onRemove={() => handleRemoveMedication(index)}
                            />
                        ))}

                        {prescriptionData.medications.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>약을 추가해주세요</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 저장 버튼 */}
                <footer className={styles.footer}>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className={styles.cancelButton}
                        disabled={loading}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={styles.submitButton}
                        disabled={loading || prescriptionData.medications.length === 0}
                    >
                        {loading ? '저장 중...' : '저장'}
                    </button>
                </footer>
            </div>

            {/* 약 검색 모달 */}
            {showSearchModal && (
                <MedicationSearchModal
                    intakeTimes={prescriptionData.intakeTimes}
                    onAdd={handleAddMedication}
                    onClose={() => setShowSearchModal(false)}
                />
            )}
        </MainLayout>
    );
};

export default PrescriptionAddPage;
