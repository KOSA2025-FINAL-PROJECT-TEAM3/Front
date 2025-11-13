/**
 * 알림 Mock 데이터
 * @file mockNotifications.js
 * @description 알림 목록 및 상세 페이지용 Mock 데이터
 */

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: '약 복용 시간입니다',
    message: '오늘 저녁 6시에 Simvastatin을 복용할 시간입니다.',
    type: 'MEDICATION_REMINDER',
    status: 'UNREAD',
    createdAt: new Date('2025-11-12T18:00:00Z').toISOString(),
    relatedMedicationId: 'med-1',
  },
  {
    id: 'notif-2',
    title: '약물 상호작용 경고',
    message: '자몽 주스와 Simvastatin의 상호작용이 감지되었습니다. 즉시 상담이 필요합니다.',
    type: 'DRUG_INTERACTION_WARNING',
    status: 'UNREAD',
    createdAt: new Date('2025-11-12T12:30:00Z').toISOString(),
    relatedMedicationId: 'med-1',
    severity: 'HIGH',
  },
  {
    id: 'notif-3',
    title: '식단 기록 완료 확인',
    message: '오늘 점심 식단 기록이 저장되었습니다.',
    type: 'DIET_LOG_RECORDED',
    status: 'READ',
    createdAt: new Date('2025-11-11T13:00:00Z').toISOString(),
  },
  {
    id: 'notif-4',
    title: '보호자 메시지',
    message: '엄마, 어제 약을 잘 챙겨드셨어요?',
    type: 'CAREGIVER_MESSAGE',
    status: 'READ',
    createdAt: new Date('2025-11-10T10:00:00Z').toISOString(),
    senderId: 'caregiver-1',
  },
  {
    id: 'notif-5',
    title: '약 리필 알림',
    message: 'Metformin의 재고가 7일분 남았습니다. 약국에 방문하거나 배송을 신청하세요.',
    type: 'MEDICATION_REFILL',
    status: 'READ',
    createdAt: new Date('2025-11-09T09:00:00Z').toISOString(),
    relatedMedicationId: 'med-2',
  },
]

export default MOCK_NOTIFICATIONS
