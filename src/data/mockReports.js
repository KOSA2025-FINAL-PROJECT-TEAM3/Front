/**
 * 리포트 Mock 데이터
 * @file mockReports.js
 * @description 복약 순응도 리포트 및 주간 통계용 Mock 데이터
 */

// 복약 순응도 페이지용 요약 데이터
export const MOCK_ADHERENCE_PAGE_DATA = {
  overall: 87,
  thisWeek: 92,
  lastWeek: 85,
  thisMonth: 87,
  streak: 14,
  totalDays: 90,
  completedDays: 78,
  missedDays: 12,
}

// 최근 복약 히스토리
export const MOCK_RECENT_HISTORY = [
  { date: '2025-01-18', status: 'completed', count: 3, total: 3 },
  { date: '2025-01-17', status: 'completed', count: 3, total: 3 },
  { date: '2025-01-16', status: 'partial', count: 2, total: 3 },
  { date: '2025-01-15', status: 'completed', count: 3, total: 3 },
  { date: '2025-01-14', status: 'missed', count: 1, total: 3 },
  { date: '2025-01-13', status: 'completed', count: 3, total: 3 },
  { date: '2025-01-12', status: 'completed', count: 3, total: 3 },
]

export const MOCK_ADHERENCE_REPORT = {
  id: 'report-adherence-1',
  period: '2025-11-12',
  adherenceRate: 85,
  totalMedications: 3,
  takenMedications: [
    {
      medicationId: 'med-1',
      name: 'Simvastatin',
      dosage: '20mg',
      schedule: '매일 저녁 식후',
      compliance: 100,
      takenDates: [
        '2025-11-08', '2025-11-09', '2025-11-10',
        '2025-11-11', '2025-11-12'
      ],
    },
    {
      medicationId: 'med-2',
      name: 'Metformin',
      dosage: '500mg',
      schedule: '하루 2회 (아침/저녁)',
      compliance: 80,
      takenDates: [
        '2025-11-08', '2025-11-09', '2025-11-10',
        '2025-11-11', '2025-11-12'
      ],
      missedDates: ['2025-11-09 evening'],
    },
    {
      medicationId: 'med-3',
      name: 'Vitamin D',
      dosage: '1000IU',
      schedule: '매일 아침',
      compliance: 60,
      takenDates: ['2025-11-08', '2025-11-10', '2025-11-11'],
      missedDates: ['2025-11-09', '2025-11-12'],
    },
  ],
  warnings: [
    {
      type: 'LOW_COMPLIANCE',
      medication: 'Vitamin D',
      message: 'Vitamin D의 복약 순응도가 낮습니다.',
    },
  ],
  generatedAt: new Date().toISOString(),
}

export const MOCK_WEEKLY_STATS = {
  id: 'report-weekly-1',
  startDate: '2025-11-05',
  endDate: '2025-11-11',
  totalDays: 7,
  overallAdherence: 82,
  medicationStats: [
    {
      medicationId: 'med-1',
      name: 'Simvastatin',
      scheduledDoses: 7,
      takenDoses: 7,
      adherence: 100,
      trend: 'STABLE',
    },
    {
      medicationId: 'med-2',
      name: 'Metformin',
      scheduledDoses: 14,
      takenDoses: 12,
      adherence: 86,
      trend: 'IMPROVING',
    },
    {
      medicationId: 'med-3',
      name: 'Vitamin D',
      scheduledDoses: 7,
      takenDoses: 4,
      adherence: 57,
      trend: 'DECLINING',
    },
  ],
  dailyBreakdown: [
    { date: '2025-11-05', adherence: 85, takenDoses: 3, scheduledDoses: 3 },
    { date: '2025-11-06', adherence: 75, takenDoses: 3, scheduledDoses: 4 },
    { date: '2025-11-07', adherence: 90, takenDoses: 3, scheduledDoses: 3 },
    { date: '2025-11-08', adherence: 88, takenDoses: 3, scheduledDoses: 3 },
    { date: '2025-11-09', adherence: 80, takenDoses: 3, scheduledDoses: 4 },
    { date: '2025-11-10', adherence: 85, takenDoses: 3, scheduledDoses: 3 },
    { date: '2025-11-11', adherence: 78, takenDoses: 3, scheduledDoses: 4 },
  ],
  insights: [
    {
      title: '복약 순응도 개선',
      description: 'Metformin의 순응도가 지난주 대비 8% 증가했습니다.',
      type: 'POSITIVE',
    },
    {
      title: 'Vitamin D 복약 누락 증가',
      description: 'Vitamin D 복약이 최근 2일 연속 누락되었습니다. 알림 설정을 확인해주세요.',
      type: 'WARNING',
    },
  ],
  generatedAt: new Date().toISOString(),
}

export default { MOCK_ADHERENCE_REPORT, MOCK_WEEKLY_STATS }
