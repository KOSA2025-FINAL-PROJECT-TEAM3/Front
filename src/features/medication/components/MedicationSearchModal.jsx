import { useState } from 'react';
import { medicationApiClient } from '@core/services/api/medicationApiClient';
import { toast } from '@shared/components/toast/toastStore';
import styles from './MedicationSearchModal.module.scss';

export const MedicationSearchModal = ({ intakeTimes, onAdd, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [medicationDetails, setMedicationDetails] = useState({
        dosageAmount: 1,
        intakeTimeIndices: [], // intakeTimes의 인덱스
        daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN',
        notes: ''
    });
    const [searching, setSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('약 이름을 입력해주세요');
            return;
        }

        setSearching(true);
        try {
            // TODO: 실제 API 연동 시 검색 API 호출
            // 현재는 더미 데이터 또는 기존 API 활용
            // const results = await medicationApiClient.searchMedications(searchQuery);

            // 임시 더미 데이터 (API가 준비되지 않았을 경우)
            const results = [
                { name: searchQuery, ingredient: '일반의약품', itemSeq: '12345' },
                { name: `${searchQuery} 500mg`, ingredient: '전문의약품', itemSeq: '67890' }
            ];

            setSearchResults(results);
        } catch (error) {
            console.error('약 검색 실패:', error);
            toast.error('약 검색에 실패했습니다');
        } finally {
            setSearching(false);
        }
    };

    const handleAISearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('약 이름을 입력해주세요');
            return;
        }

        setSearching(true);
        try {
            const result = await medicationApiClient.searchMedicationsWithAI(searchQuery);
            setSearchResults([result]);
        } catch (error) {
            console.error('AI 검색 실패:', error);
            toast.error('AI 검색에 실패했습니다');
        } finally {
            setSearching(false);
        }
    };

    const handleSelectMedication = (medication) => {
        setSelectedMedication(medication);
        // 기본값 설정
        setMedicationDetails({
            dosageAmount: 1,
            intakeTimeIndices: intakeTimes.map((_, i) => i), // 모든 시간 선택
            daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN',
            notes: medication.notes || ''
        });
    };

    const handleAddMedication = () => {
        if (!selectedMedication) {
            toast.error('약을 선택해주세요');
            return;
        }

        const medicationData = {
            name: selectedMedication.name,
            category: selectedMedication.ingredient,
            dosageAmount: medicationDetails.dosageAmount,
            intakeTimeIndices: medicationDetails.intakeTimeIndices,
            daysOfWeek: medicationDetails.daysOfWeek,
            notes: medicationDetails.notes,
            totalIntakes: 30 // 기본값, 실제로는 계산 필요할 수 있음
        };

        onAdd(medicationData);
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2>약 검색</h2>
                    <button onClick={onClose} className={styles.closeButton}>✕</button>
                </header>

                {/* 검색 입력 */}
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="약 이름을 입력하세요"
                        className={styles.searchInput}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className={styles.searchButton}
                    >
                        {searching ? '검색 중...' : '검색'}
                    </button>
                    <button
                        onClick={handleAISearch}
                        disabled={searching}
                        className={styles.aiButton}
                    >
                        AI 검색
                    </button>
                </div>

                {/* 검색 결과 */}
                <div className={styles.searchResults}>
                    {searchResults.length === 0 && !searching && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                            검색 결과가 없습니다
                        </div>
                    )}

                    {searchResults.map((result, index) => (
                        <div
                            key={index}
                            className={`${styles.resultItem} ${selectedMedication?.name === result.name ? styles.selected : ''}`}
                            onClick={() => handleSelectMedication(result)}
                        >
                            <h3>{result.name}</h3>
                            <p>{result.ingredient}</p>
                        </div>
                    ))}
                </div>

                {/* 선택된 약 상세 설정 */}
                {selectedMedication && (
                    <div className={styles.detailsForm}>
                        <h3>{selectedMedication.name} 복용 정보</h3>

                        <label>
                            1회 복용량
                            <input
                                type="number"
                                min="1"
                                value={medicationDetails.dosageAmount}
                                onChange={(e) => setMedicationDetails(prev => ({
                                    ...prev,
                                    dosageAmount: parseInt(e.target.value) || 1
                                }))}
                            />
                            정
                        </label>

                        <label>
                            복용 시간
                            <div className={styles.timeSelector}>
                                {intakeTimes.length === 0 && <span style={{ fontSize: '0.85rem', color: '#999' }}>처방전의 복용 시간을 먼저 설정해주세요</span>}
                                {intakeTimes.map((time, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`${styles.timeButton} ${medicationDetails.intakeTimeIndices.includes(index) ? styles.selected : ''
                                            }`}
                                        onClick={() => {
                                            setMedicationDetails(prev => ({
                                                ...prev,
                                                intakeTimeIndices: prev.intakeTimeIndices.includes(index)
                                                    ? prev.intakeTimeIndices.filter(i => i !== index)
                                                    : [...prev.intakeTimeIndices, index]
                                            }));
                                        }}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </label>

                        <label>
                            복용 요일
                            <div className={styles.daySelector}>
                                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`${styles.dayButton} ${medicationDetails.daysOfWeek.includes(day) ? styles.selected : ''
                                            }`}
                                        onClick={() => {
                                            const days = medicationDetails.daysOfWeek.split(',');
                                            let newDays;
                                            if (days.includes(day)) {
                                                newDays = days.filter(d => d !== day);
                                            } else {
                                                newDays = [...days, day];
                                            }
                                            setMedicationDetails(prev => ({
                                                ...prev,
                                                daysOfWeek: newDays.join(',')
                                            }));
                                        }}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </label>

                        <label>
                            메모
                            <textarea
                                value={medicationDetails.notes}
                                onChange={(e) => setMedicationDetails(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                                placeholder="복용 시 주의사항 등"
                            />
                        </label>

                        <button
                            onClick={handleAddMedication}
                            className={styles.addButton}
                        >
                            등록
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicationSearchModal;
