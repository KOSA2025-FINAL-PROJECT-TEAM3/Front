/**
 * 전역 상수 정의
 * - 사용자 역할, 알림 유형, 약 복용 상태 등
 */

// 사용자 역할
export const USER_ROLES = {
  SENIOR: 'SENIOR',           // 노인 부모
  CAREGIVER: 'CAREGIVER',     // 성인 자식 (보호자)
}

// 사용자 역할 라벨
export const USER_ROLE_LABELS = {
  [USER_ROLES.SENIOR]: '부모 (어르신)',
  [USER_ROLES.CAREGIVER]: '자녀 (보호자)',
}

// 약 복용 상태
export const MEDICATION_STATUS = {
  PENDING: 'PENDING',         // 대기 중
  COMPLETED: 'COMPLETED',     // 복용 완료
  SKIPPED: 'SKIPPED',         // 건너뜀
  MISSED: 'MISSED',           // 놓침
}

// 약 복용 상태 라벨
export const MEDICATION_STATUS_LABELS = {
  [MEDICATION_STATUS.PENDING]: '대기 중',
  [MEDICATION_STATUS.COMPLETED]: '복용 완료',
  [MEDICATION_STATUS.SKIPPED]: '건너뜀',
  [MEDICATION_STATUS.MISSED]: '놓침',
}

// 알림 유형
export const NOTIFICATION_TYPES = {
  MEDICATION_REMINDER: 'MEDICATION_REMINDER',     // 복약 알림
  DIET_WARNING: 'DIET_WARNING',                   // 식단 경고
  FAMILY_ALERT: 'FAMILY_ALERT',                   // 가족 알림
  SYSTEM: 'SYSTEM',                              // 시스템
}

// 알림 유형 라벨
export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPES.MEDICATION_REMINDER]: '복약 알림',
  [NOTIFICATION_TYPES.DIET_WARNING]: '식단 경고',
  [NOTIFICATION_TYPES.FAMILY_ALERT]: '가족 알림',
  [NOTIFICATION_TYPES.SYSTEM]: '시스템',
}

// 약-음식 충돌 심각도
export const CONFLICT_SEVERITY = {
  HIGH: 'HIGH',           // 높음
  MEDIUM: 'MEDIUM',       // 중간
  LOW: 'LOW',             // 낮음
}

// 약-음식 충돌 심각도 라벨 및 색상
export const CONFLICT_SEVERITY_CONFIG = {
  [CONFLICT_SEVERITY.HIGH]: {
    label: '높음',
    color: '#ef4444',     // red-500
    bgColor: '#fee2e2',   // red-100
  },
  [CONFLICT_SEVERITY.MEDIUM]: {
    label: '중간',
    color: '#f59e0b',     // amber-500
    bgColor: '#fef3c7',   // amber-100
  },
  [CONFLICT_SEVERITY.LOW]: {
    label: '낮음',
    color: '#8b5cf6',     // violet-500
    bgColor: '#ede9fe',   // violet-100
  },
}

// 식사 종류
export const MEAL_TYPES = {
  BREAKFAST: 'BREAKFAST',     // 아침
  LUNCH: 'LUNCH',             // 점심
  DINNER: 'DINNER',           // 저녁
  SNACK: 'SNACK',             // 간식
}

// 식사 종류 라벨
export const MEAL_TYPE_LABELS = {
  [MEAL_TYPES.BREAKFAST]: '아침',
  [MEAL_TYPES.LUNCH]: '점심',
  [MEAL_TYPES.DINNER]: '저녁',
  [MEAL_TYPES.SNACK]: '간식',
}

// API 응답 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
}

// 페이지네이션
export const PAGINATION = {
  ITEMS_PER_PAGE: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '10'),
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'), // 5MB
}

// 알림 표시 시간 (ms)
export const NOTIFICATION_TIMEOUT = parseInt(import.meta.env.VITE_NOTIFICATION_TIMEOUT || '5000')

// 재시도 설정
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
}

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  AUTH_TOKEN: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'amapill_token',
  REFRESH_TOKEN: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'amapill_refresh_token',
  USER_DATA: 'amapill_user',
  FAMILY_GROUP: 'amapill_family',
  DEV_MODE: 'amapill_dev_mode',
  ROLE: 'amapill_role',
}
