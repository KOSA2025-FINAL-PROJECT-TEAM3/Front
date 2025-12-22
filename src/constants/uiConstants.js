/**
 * UI 상수 Mock 데이터
 * @file uiConstants.js
 * @description 대시보드, 설정 등의 UI 상수 데이터
 */

import { ROUTE_PATHS } from '@config/routes.config'

// 시니어 대시보드 빠른 액션
export const SENIOR_QUICK_ACTIONS = [
  { icon: '🔍', label: '약/식단 검색', path: ROUTE_PATHS.search },
  { icon: '🍽️', label: '식단 기록', path: ROUTE_PATHS.dietLog },
  { icon: '💬', label: '가족 채팅', path: ROUTE_PATHS.familyChat },
  { icon: '📸', label: '처방전 스캔', path: ROUTE_PATHS.ocrScan },
]

// 시니어 대시보드 FAB 액션
export const SENIOR_FAB_ACTIONS = [
  { icon: '📷', label: '처방전 스캔', path: ROUTE_PATHS.ocrScan },
  { id: 'pdf_export', icon: '📄', label: 'PDF 내보내기' },
]

// 보호자 대시보드 빠른 액션
export const CAREGIVER_QUICK_ACTIONS = [
  { icon: '👥', label: '가족 관리', path: ROUTE_PATHS.family },
  { icon: '💊', label: '약 관리', path: ROUTE_PATHS.medication },
  { icon: '🔍', label: '검색', path: ROUTE_PATHS.search },
  { icon: '📊', label: '리포트', path: ROUTE_PATHS.adherenceReport },
]

// 보호자 대시보드 FAB 액션
export const CAREGIVER_FAB_ACTIONS = [
  { icon: '👥', label: '가족 초대', path: ROUTE_PATHS.familyInvite },
  { icon: '💊', label: '약 등록', path: ROUTE_PATHS.prescriptionAdd },
  { id: 'pdf_export', icon: '📄', label: 'PDF 내보내기' },
]

// 설정 메뉴 정의
export const SETTINGS_MENU_DEFINITIONS = [
  {
    id: 'profile',
    label: '프로필 편집',
    icon: '👤',
    description: '기본 정보 · 연락처 설정',
    path: ROUTE_PATHS.settingsProfile,
  },
  {
    id: 'notifications',
    label: '알림 설정',
    icon: '🔔',
    description: '푸시 · 이메일 알림 토글',
    path: ROUTE_PATHS.settingsNotifications,
  },
  {
    id: 'privacy',
    label: '개인정보 처리방침',
    icon: '🔒',
    path: ROUTE_PATHS.privacyPolicy,
  },
  {
    id: 'terms',
    label: '이용약관',
    icon: '📜',
    path: ROUTE_PATHS.termsOfService,
  },
]

// 알림 설정 채널
export const NOTIFICATION_CHANNELS = [
  { id: 'push', label: '푸시 알림', description: '앱 푸시로 복약 알림 받기' },
  { id: 'email', label: '이메일 알림', description: '약 일정 요약 메일' },
  { id: 'sms', label: 'SMS 알림', description: '긴급 미복약 알림' },
]

// 프로필 편집 필드
export const PROFILE_EDIT_FIELDS = [
  { id: 'name', label: '이름', type: 'text', placeholder: '홍길동' },
  { id: 'email', label: '이메일', type: 'email', placeholder: 'hong@example.com', readOnly: true },
  { id: 'phone', label: '전화번호', type: 'tel', placeholder: '010-0000-0000' },
]

// 멤버 역할 옵션
export const MEMBER_ROLE_OPTIONS = [
  { value: 'SENIOR', label: '시니어', icon: '👴' },
  { value: 'CAREGIVER', label: '보호자', icon: '👨‍👩‍👧' },
]

// 개발자 프로필
export const DEV_PROFILES = {
  SENIOR: {
    id: 'dev-senior',
    name: '김어르신',
    email: 'senior@amapill.dev',
    customerRole: 'SENIOR',
    userRole: 'ROLE_USER',
  },
  CAREGIVER: {
    id: 'dev-caregiver',
    name: '홍보호자',
    email: 'caregiver@amapill.dev',
    customerRole: 'CAREGIVER',
    userRole: 'ROLE_USER',
  },
}

export default {
  SENIOR_QUICK_ACTIONS,
  SENIOR_FAB_ACTIONS,
  CAREGIVER_QUICK_ACTIONS,
  CAREGIVER_FAB_ACTIONS,
  SETTINGS_MENU_DEFINITIONS,
  NOTIFICATION_CHANNELS,
  PROFILE_EDIT_FIELDS,
  MEMBER_ROLE_OPTIONS,
  DEV_PROFILES,
}
