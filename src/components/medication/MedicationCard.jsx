import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * 약물 카드 컴포넌트
 * 약물 정보를 카드 형태로 표시합니다.
 * 
 * @param {Object} props
 * @param {Object} props.medication - 약물 정보
 * @param {Function} props.onClick - 클릭 핸들러
 * @param {string} props.className - 추가 CSS 클래스
 */
const MedicationCard = ({ medication, onClick, onScheduleClick, className }) => {
    const {
        name,
        ingredient,
        dosage,
        timing,
        imageUrl,
        schedules = [],
        hasLogsToday,
        active,
    } = medication;

    const handleClick = () => {
        if (onClick) {
            onClick(medication);
        }
    };

    const handleScheduleClick = (e, schedule) => {
        e.stopPropagation(); // Prevent card click
        if (onScheduleClick) {
            onScheduleClick(schedule, medication);
        }
    };

    return (
        <div
            className={classNames(
                'medication-card',
                'bg-white rounded-lg shadow-sm border border-gray-200 p-4',
                'hover:shadow-md transition-shadow cursor-pointer',
                { 'opacity-60': !active },
                className
            )}
            onClick={handleClick}
        >
            <div className="flex gap-4 items-start">
                {/* Pill Image */}
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<span class="text-gray-400 text-xs">${name?.charAt(0) || '약'}</span>`;
                                }}
                            />
                        ) : (
                            <span className="text-gray-400 text-2xl font-semibold">
                                {name?.charAt(0) || '약'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Medication Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {name}
                    </h3>

                    {ingredient && (
                        <p className="text-sm text-gray-500 mt-0.5 truncate">
                            {ingredient}
                        </p>
                    )}

                    {/* Dosage Information */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                        {dosage && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {dosage}
                            </span>
                        )}
                        {timing && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {timing}
                            </span>
                        )}
                        {schedules.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {schedules.length}회 스케줄
                            </span>
                        )}
                    </div>
                </div>

                {/* Today's Status */}
                <div className="flex-shrink-0">
                    {hasLogsToday ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            복용완료
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                            미복용
                        </span>
                    )}
                </div>
            </div>

            {/* Schedule Times */}
            {schedules.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-2 flex-wrap">
                        {schedules.map((schedule) => (
                            <button
                                key={schedule.id}
                                onClick={(e) => handleScheduleClick(e, schedule)}
                                className={classNames(
                                    'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                                    schedule.isTakenToday
                                        ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                )}
                                title={schedule.isTakenToday ? '복용 완료' : '복용 체크'}
                            >
                                {schedule.time}
                                {schedule.isTakenToday && (
                                    <span className="ml-1 text-green-600">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

MedicationCard.propTypes = {
    medication: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string.isRequired,
        ingredient: PropTypes.string,
        dosage: PropTypes.string,
        timing: PropTypes.string,
        imageUrl: PropTypes.string,
        schedules: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                time: PropTypes.string,
                isTakenToday: PropTypes.bool,
            })
        ),
        hasLogsToday: PropTypes.bool,
        active: PropTypes.bool,
    }).isRequired,
    onClick: PropTypes.func,
    onScheduleClick: PropTypes.func,
    className: PropTypes.string,
};

export default MedicationCard;
