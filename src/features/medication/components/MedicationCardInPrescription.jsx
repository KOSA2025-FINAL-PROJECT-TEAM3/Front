import styles from './MedicationCardInPrescription.module.scss';

export const MedicationCardInPrescription = ({ medication, intakeTimes, onEdit, onRemove }) => {
    // 복용 시간 텍스트 생성
    const getIntakeTimesText = () => {
        // intakeTimeIndices가 있는 경우 (편집 모드 또는 추가된 약)
        if (medication.intakeTimeIndices && medication.intakeTimeIndices.length > 0) {
            const times = medication.intakeTimeIndices
                .filter(idx => idx >= 0 && idx < intakeTimes.length)
                .map(idx => intakeTimes[idx]);

            if (times.length === 0) return '시간 설정 필요';
            return times.join(', ');
        }

        // schedules가 있는 경우 (뷰 모드 - 백엔드에서 로드된 약)
        if (medication.schedules && medication.schedules.length > 0) {
            const times = medication.schedules.map(schedule => schedule.time);
            return times.join(', ');
        }

        // 둘 다 없으면 모든 시간
        return '모든 시간';
    };

    // 요일 텍스트 생성
    const getDaysOfWeekText = () => {
        // daysOfWeek가 직접 있는 경우 (편집 모드)
        let daysOfWeek = medication.daysOfWeek;

        // schedules에서 가져오기 (뷰 모드)
        if (!daysOfWeek && medication.schedules && medication.schedules.length > 0) {
            daysOfWeek = medication.schedules[0].daysOfWeek;
        }

        if (!daysOfWeek) return '매일';

        const days = daysOfWeek.split(',');
        if (days.length === 7) return '매일';

        const dayMap = {
            'MON': '월', 'TUE': '화', 'WED': '수', 'THU': '목', 'FRI': '금', 'SAT': '토', 'SUN': '일'
        };

        return days.map(d => dayMap[d] || d).join(', ');
    };

    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div className={styles.imageWrapper}>
                        {medication.imageUrl ? (
                            <img
                                src={medication.imageUrl}
                                alt={medication.name}
                                className={styles.image}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className={styles.placeholder}
                            style={{ display: medication.imageUrl ? 'none' : 'flex' }}
                        >
                            💊
                        </div>
                    </div>
                    <div className={styles.titleInfo}>
                        <h3>{medication.name}</h3>
                        <p className={styles.category}>{medication.category || '분류 없음'}</p>
                    </div>
                </div>

                <div className={styles.details}>
                    <div className={styles.detailItem}>
                        <span>복용량:</span> {medication.dosage || `${medication.dosageAmount}정`}
                    </div>
                    <div className={styles.detailItem}>
                        <span>시간:</span> {getIntakeTimesText()}
                    </div>
                    <div className={styles.detailItem}>
                        <span>요일:</span> {getDaysOfWeekText()}
                    </div>
                </div>

                {medication.notes && (
                    <div className={styles.notes}>
                        {medication.notes}
                    </div>
                )}
            </div>

            {(onEdit || onRemove) && (
                <div className={styles.actions}>
                    {onEdit && (
                        <button
                            className={styles.editButton}
                            onClick={() => onEdit(medication)}
                        >
                            수정
                        </button>
                    )}
                    {onRemove && (
                        <button
                            className={styles.removeButton}
                            onClick={onRemove}
                        >
                            삭제
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MedicationCardInPrescription;
