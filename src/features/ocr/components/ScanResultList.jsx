import React from 'react';
import styles from './ScanResultList.module.scss';

const ScanResultList = ({ results, onChange, onRemove }) => {
    if (!results || results.length === 0) {
        return <div className={styles.empty}>인식된 약 정보가 없습니다.</div>;
    }

    const handleChange = (index, field, value) => {
        const newResults = [...results];
        newResults[index] = { ...newResults[index], [field]: value };
        onChange(newResults);
    };

    return (
        <div className={styles.listContainer}>
            {results.map((med, index) => (
                <div key={index} className={styles.card}>
                    <div className={styles.header}>
                        <input
                            type="text"
                            value={med.name || ''}
                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                            className={styles.nameInput}
                            placeholder="약 이름"
                        />
                        <button className={styles.removeBtn} onClick={() => onRemove(index)}>
                            삭제
                        </button>
                    </div>
                    <div className={styles.body}>
                        <div className={styles.field}>
                            <label>복용량</label>
                            <input
                                type="text"
                                value={med.dosage || ''}
                                onChange={(e) => handleChange(index, 'dosage', e.target.value)}
                                placeholder="예: 1정"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>횟수</label>
                            <input
                                type="text"
                                value={med.frequency || ''}
                                onChange={(e) => handleChange(index, 'frequency', e.target.value)}
                                placeholder="예: 하루 3회"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>일수</label>
                            <input
                                type="number"
                                value={med.duration || ''}
                                onChange={(e) => handleChange(index, 'duration', parseInt(e.target.value) || 0)}
                                placeholder="일"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>분류</label>
                            <input
                                type="text"
                                value={med.classification || ''}
                                onChange={(e) => handleChange(index, 'classification', e.target.value)}
                                placeholder="예: 감기약"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ScanResultList;
