import logger from "@core/utils/logger"
import { useState, useEffect } from 'react';
import { searchApiClient } from '@core/services/api/searchApiClient';
import { toast } from '@shared/components/toast/toastStore';
import styles from './MedicationModal.module.scss';

export const MedicationModal = ({ intakeTimes, onAdd, onClose, initialMedication = null, mode = 'add' }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMedication, setSelectedMedication] = useState(initialMedication);
    const [medicationDetails, setMedicationDetails] = useState({
        dosageAmount: 1,
        intakeTimeIndices: intakeTimes ? intakeTimes.map((_, i) => i) : [], // intakeTimes가 없으면 빈 배열
        daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN',
        notes: ''
    });
    const [searching, setSearching] = useState(false);

    // initialMedication이 변경되면 선택 상태 업데이트
    useEffect(() => {
        if (initialMedication) {
            setSelectedMedication(initialMedication);
            // 기존 데이터로 details 초기화 (수정 모드일 때 중요)
            setMedicationDetails({
                dosageAmount: initialMedication.dosageAmount || 1,
                intakeTimeIndices: initialMedication.intakeTimeIndices || (intakeTimes ? intakeTimes.map((_, i) => i) : []),
                daysOfWeek: initialMedication.daysOfWeek || 'MON,TUE,WED,THU,FRI,SAT,SUN',
                notes: initialMedication.notes || ''
            });
        }
    }, [initialMedication, intakeTimes]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('약 이름을 입력해주세요');
            return;
        }

        setSearching(true);
        try {
            const results = await searchApiClient.searchDrugs(searchQuery);
            setSearchResults(Array.isArray(results) ? results : []);
            if (results.length === 0) {
                toast.info('검색 결과가 없습니다');
            }
        } catch (error) {
            logger.error('약 검색 실패:', error);
            toast.error('약 검색에 실패했습니다');
            setSearchResults([]);
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
            const result = await searchApiClient.searchDrugsWithAI(searchQuery);
            setSearchResults(result ? [result] : []);
            if (result) {
                toast.success('AI 검색 완료!');
            } else {
                toast.info('검색 결과가 없습니다');
            }
        } catch (error) {
            logger.error('AI 검색 실패:', error);
            toast.error('AI 검색에 실패했습니다');
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectMedication = (medication) => {
        setSelectedMedication(medication);
        // 기본값 설정 (새로 선택 시)
        setMedicationDetails({
            dosageAmount: 1,
            intakeTimeIndices: intakeTimes.map((_, i) => i), // 모든 시간 선택
            daysOfWeek: 'MON,TUE,WED,THU,FRI,SAT,SUN',
            notes: ''
        });
    };

    const handleSubmit = () => {
        if (!selectedMedication) {
            toast.error('약을 선택해주세요');
            return;
        }

        const medicationData = {
            ...selectedMedication, // 기존 정보 유지
            name: selectedMedication.itemName || selectedMedication.name,
            category: selectedMedication.entpName || selectedMedication.category || selectedMedication.ingredient,
            dosageAmount: medicationDetails.dosageAmount,
            intakeTimeIndices: medicationDetails.intakeTimeIndices,
            daysOfWeek: medicationDetails.daysOfWeek,
            notes: medicationDetails.notes,
            imageUrl: selectedMedication.itemImage || selectedMedication.imageUrl || null,
            totalIntakes: 30 // 기본값
        };

        onAdd(medicationData);
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2>{mode === 'edit' ? '약 정보 수정' : '약 검색'}</h2>
                    <button onClick={onClose} className={styles.closeButton}>✕</button>
                </header>

                {/* 검색 입력 (추가 모드일 때만 표시) */}
                {mode === 'add' && (
                    <>
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
                                    className={`${styles.resultItem} ${selectedMedication?.itemSeq === result.itemSeq ? styles.selected : ''}`}
                                    onClick={() => handleSelectMedication(result)}
                                >
                                    {result.itemImage && (
                                        <img
                                            src={result.itemImage}
                                            alt={result.itemName}
                                            className={styles.resultImage}
                                        />
                                    )}
                                    <div className={styles.resultInfo}>
                                        <h3>{result.itemName}</h3>
                                        <p>{result.entpName}</p>
                                        {result.itemSeq && <span className={styles.itemSeq}>품목코드: {result.itemSeq}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* 선택된 약 상세 설정 */}
                {selectedMedication && (
                    <div className={styles.detailsForm}>
                        <h3>{selectedMedication.itemName || selectedMedication.name} 복용 정보</h3>

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
                            onClick={handleSubmit}
                            className={styles.addButton}
                        >
                            {mode === 'edit' ? '수정 완료' : '등록'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicationModal;
