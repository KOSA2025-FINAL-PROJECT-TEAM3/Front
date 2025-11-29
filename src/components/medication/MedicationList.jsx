import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import MedicationCard from './MedicationCard';

/**
 * 약물 목록 컴포넌트
 * 약물 카드들을 목록 형태로 표시합니다.
 * 
 * @param {Object} props
 * @param {Array} props.medications - 약물 목록
 * @param {Function} props.onMedicationClick - 약물 클릭 핸들러
 * @param {string} props.className - 추가 CSS 클래스
 * @param {string} props.emptyMessage - 약물이 없을 때 표시할 메시지
 */
const MedicationList = ({
    medications = [],
    onMedicationClick,
    className,
    emptyMessage = '등록된 약물이 없습니다'
}) => {
    // Filter active medications
    const activeMedications = medications.filter(m => m.active !== false);

    return (
        <div className={classNames('medication-list', className)}>
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    복약 내역
                    <span className="ml-2 text-sm font-normal text-gray-500">
                        ({activeMedications.length}개)
                    </span>
                </h2>
                <div className="mt-2 border-b border-gray-200"></div>
            </div>

            {/* Medication Cards */}
            {activeMedications.length === 0 ? (
                <div className="text-center py-12">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">{emptyMessage}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activeMedications.map((medication) => (
                        <MedicationCard
                            key={medication.id}
                            medication={medication}
                            onClick={onMedicationClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

MedicationList.propTypes = {
    medications: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            name: PropTypes.string.isRequired,
            active: PropTypes.bool,
        })
    ),
    onMedicationClick: PropTypes.func,
    className: PropTypes.string,
    emptyMessage: PropTypes.string,
};

export default MedicationList;
