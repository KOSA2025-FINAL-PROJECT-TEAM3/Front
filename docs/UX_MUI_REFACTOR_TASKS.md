# UX/MUI 리팩토링 Task Tracker (Front)

참조: `Front/docs/UX_MUI_REFACTOR_REPORT.md`, `Front/docs/WORKSTREAM_PROCESS.md`  
업데이트 원칙: PR/커밋 단위로 **체크박스 갱신 + Worklog 링크 추가**

---

## 현재 상태 스냅샷 (2025-12-16)

- [x] Workstream 1(AppShell/Navigation) — 1차 Spike 반영: `Front/docs/WORKLOG_2025-12-14_APP_SHELL_NAV_SPIKE.md`
- [x] Workstream 2(Accessibility/Theme) — 글자 크기(3단계) 기반 토큰 정비(확대모드 → font scale level): `Front/docs/WORKLOG_2025-12-14_A11Y_THEME.md`
- [x] Workstream 3(Shared UI 제거) — 제거 완료: `Front/docs/WORKLOG_2025-12-15_SHARED_UI_REMOVAL.md`
- [x] Workstream 4(Feature P0) — 화면별 MUI 전환(완료: Settings 1차 + Family/Medication/Search/OCR/Devtools + Places placeholder):
  - `Front/docs/WORKLOG_2025-12-14_SETTINGS_MUI.md`
  - `Front/docs/WORKLOG_2025-12-15_FAMILY_MEDICATION_P0_MUI.md`
- [x] Workstream 5(Cleanup/Docs) — Cleanup(Tailwind/Sass/SCSS) 완료 + Playwright 스모크(E2E)/문서 정리(마감):
  - `Front/docs/WORKLOG_2025-12-15_CLEANUP_TAILWIND_SASS.md`
  - `Front/docs/WORKLOG_2025-12-14_PLAYWRIGHT_SMOKE.md`
  - `Front/docs/WORKLOG_2025-12-15_WORKSTREAM5_CLOSEOUT.md`

현실 상태(근거):
- `*.module.scss` 파일: 0개
- `*.module.css` 파일: 0개
- Tailwind 설정/전역 CSS 제거 완료: `Front/tailwind.config.js`, `Front/src/styles/tailwind.css` (삭제됨)
- `sass`, `tailwindcss` devDependency 제거 완료
- `src/shared/components/ui/*` 제거 완료(잔존 0건) → `src/shared/components/mui/*`로 치환

---

## Phase 체크리스트

### Phase 0. 준비/정렬
- [x] 화면/컴포넌트 인벤토리(페이지별: UI 패턴/의존/난이도/우선순위) 작성: `Front/docs/SCREEN_INVENTORY.md`
- [x] Tailwind/SCSS 사용처 현황 스캔/정리(삭제/치환/유지 기준 수립): `Front/docs/WORKLOG_2025-12-15_CLEANUP_TAILWIND_SASS.md`
- [x] 전환 규칙 확정(“MUI 우선, module.css 최소”): `Front/docs/DesignSystem.md`

### Phase 1. IA/UX 재설계
- [x] Senior 3탭 / Caregiver 4탭 IA 확정(Top Task 기준): `Front/docs/IA_NAV.md`
- [x] 주요 플로우 와이어프레임(복약/약관리/가족/리포트) 정리: `Front/docs/FLOWS_P0.md`
- [x] 공통 화면 패턴 정의(리스트/상세/입력/빈상태/에러/로딩): `Front/docs/DesignSystem.md`

### Phase 2. MUI Foundation 구축
- [x] `Front/src/styles/theme.js` 토큰 확장(타이포/간격/컬러/컴포넌트 오버라이드)
- [x] 접근성(글자 크기 3단계) 테마 스위칭 초안 + 저장 방식(로컬) 확정
- [x] Design System 문서(`docs/DesignSystem.md`) 작성/갱신

### Phase 3. AppShell/Navigation 교체
- [x] `AdaptiveNavigation` 표준 1차 내비로 통합(모바일 BottomNav + 데스크톱 Sidebar)
- [x] Role 기반 Primary Nav 기본 세트 구현(Senior 3 / Caregiver 4)
- [x] 레거시 `/chat` → `/chat/family` 리다이렉트
- [x] VoiceAssistant 비노출 가드(채팅 `/chat*`, 처방전 `/prescriptions*`, OCR/식단 로그, focus-mode 활성 시)
- [x] `AppShell.jsx`로 책임 분리(MainLayout 점진 제거): `Front/src/shared/components/layout/AppShell.jsx`
- [x] 레거시 `BottomNavigation.jsx`/SCSS 정리(삭제)
- [x] “카메라/지도 집중 모드” 가드 보강(페이지 단위 → 컴포넌트/상태 단위)

### Phase 4. Shared UI Migration
- [x] `src/shared/components/ui/*` 사용처 목록화(우선순위/대체 MUI 컴포넌트 매핑): `Front/docs/WORKLOG_2025-12-14_SHARED_UI_INVENTORY.md`
- [x] Button/Input부터 순차 치환 → Dialog/Tabs/FAB 등 확장(필요 최소 컴포넌트 추가)
- [x] 치환 후 `ui/*` 제거 및 import 정리: `Front/docs/WORKLOG_2025-12-15_SHARED_UI_REMOVAL.md`

### Phase 5. Feature P0 Migration
- [x] Dashboard(Senior/Caregiver) MUI 전환/정렬
  - [x] `Front/src/features/dashboard/components/MedicationCard.jsx`
  - [x] `Front/src/features/dashboard/components/MyMedicationSchedule.jsx`
  - [x] `Front/src/features/dashboard/components/FamilyMemberCard.jsx`
- [x] Prescriptions/Medication UI 전환
  - [x] `Front/src/features/medication/pages/MedicationManagement.jsx`
  - [x] `Front/src/features/medication/pages/TodayMedications.jsx`
  - [x] `Front/src/features/medication/pages/PrescriptionAddPage.jsx`
  - [x] `Front/src/features/medication/pages/PrescriptionDetailPage.jsx`
  - [x] `Front/src/features/medication/pages/MedicationAddPage.jsx`
  - [x] `Front/src/features/medication/pages/MedicationEditPage.jsx`
  - [x] `Front/src/features/medication/pages/PrescriptionScan.jsx`
  - [x] `Front/src/features/medication/components/MedicationForm.jsx`
  - [x] `Front/src/features/medication/components/MedicationModal.jsx`
  - [x] `Front/src/features/medication/components/MedicationDetailModal.jsx`
  - [x] `Front/src/features/medication/components/MedicationCardInPrescription.jsx`
- [x] Family/Invite/Chat UI 전환
  - [x] `Front/src/features/family/pages/InviteCodeEntry.jsx`
  - [x] `Front/src/features/family/pages/InviteLanding.jsx`
  - [x] `Front/src/features/family/pages/FamilyInvite.jsx`
  - [x] `Front/src/features/family/pages/FamilyManagement.jsx`
  - [x] `Front/src/features/family/pages/FamilyMemberDetail.jsx`
  - [x] `Front/src/features/chat/pages/FamilyChatConversationPage.jsx`
  - [x] `Front/src/features/chat/pages/DoctorChatListPage.jsx`
  - [x] `Front/src/features/chat/pages/ChatConversationPage.jsx`
  - [x] `Front/src/features/chat/components/ChatInput.jsx`
  - [x] `Front/src/features/chat/components/ChatMessage.jsx`
  - [x] `Front/src/features/chat/components/ChatRoomCard.jsx`
  - [x] `Front/src/features/family/components/FamilyGroupCard.jsx`
  - [x] `Front/src/features/family/components/MemberProfileCard.jsx`
  - [x] `Front/src/features/family/components/FamilyMemberList.jsx`
  - [x] `Front/src/features/family/components/FamilyMemberCard.jsx`
  - [x] `Front/src/features/family/components/FamilyAdherenceChart.jsx`
  - [x] `Front/src/features/family/components/GroupSelectionModal.jsx`
  - [x] `Front/src/features/family/components/OwnerDelegationModal.jsx`
  - [x] `Front/src/features/family/components/FamilyMedicationList.jsx`
- [x] OCR/Diet/Camera UI 전환(+ 마이크로 인터랙션 P0)
  - [x] `Front/src/features/ocr/pages/PrescriptionScan.jsx`
  - [x] `Front/src/features/diet/pages/DietLogPage.jsx`
  - [x] `Front/src/features/diet/pages/FoodWarning.jsx`
  - [x] `Front/src/features/ocr/components/DurationPicker.jsx`
  - [x] `Front/src/features/ocr/components/IntakeTimePicker.jsx`
  - [x] `Front/src/features/ocr/components/RegistrationInfo.jsx`
  - [x] `Front/src/features/ocr/components/PharmacyHeader.jsx`
  - [x] `Front/src/features/ocr/components/CameraCapture.jsx`
- [x] Disease/Search UI 전환
  - [x] `Front/src/features/disease/pages/Disease.jsx`
  - [x] `Front/src/features/disease/pages/DiseaseDetailPage.jsx`
  - [x] `Front/src/features/disease/pages/DiseaseRestrictionsPage.jsx` (placeholder)
  - [x] `Front/src/features/disease/pages/SuspectedDiseasePage.jsx` (placeholder)
  - [x] `Front/src/features/disease/components/DiseaseList.jsx`
  - [x] `Front/src/features/disease/components/DiseaseCard.jsx`
  - [x] `Front/src/features/disease/components/DiseaseForm.jsx`
  - [x] `Front/src/features/disease/components/DiseaseTrash.jsx`
  - [x] `Front/src/features/search/pages/UnifiedSearchPage.jsx`
  - [x] `Front/src/features/search/pages/SymptomSearch.jsx`
  - [x] `Front/src/features/search/components/SymptomSearchTab.jsx`
  - [x] `Front/src/features/search/components/PillSearchTab.jsx`
  - [x] `Front/src/features/search/pages/PillSearchPage.jsx` (placeholder)
  - [x] `Front/src/features/search/pages/PillResultPage.jsx` (placeholder)
- [x] 병원/약국 검색(지도) UX/UI 전환(Kakao Maps): `Front/src/features/places/pages/PlaceSearchPage.jsx`

### Phase 6. Cleanup/Hardening
- [x] Tailwind 제거(설정/전역 CSS/의존성): `Front/docs/WORKLOG_2025-12-15_CLEANUP_TAILWIND_SASS.md`
- [x] `sass` 제거 + `*.module.scss` → 0건(`*.module.css` 최소 유지): `Front/docs/WORKLOG_2025-12-15_CLEANUP_TAILWIND_SASS.md`
- [x] Layout/Toast/Error UI의 CSS Module 제거(진행): `Front/docs/WORKLOG_2025-12-15_FAMILY_MEDICATION_P0_MUI.md`
- [x] Devtools(DeveloperModePanel/CollaborativeEditor) CSS Module 제거
- [x] Devtools realtime/editor 데모 제거(TipTap/Hocuspocus 미사용)
- [x] (정리) WS 테스트 페이지/라우트 제거(`/ws-test`)
- [x] 미사용 레거시 컴포넌트/라우트 삭제 및 리다이렉트 정리
- [x] 접근성/반응형/성능 회귀 점검 체크리스트 완료(자동화 스모크/정적 점검): `Front/docs/REGRESSION_CHECKLIST.md`

---

## Worklogs

- 2025-12-14: AppShell/Navigation Spike — `Front/docs/WORKLOG_2025-12-14_APP_SHELL_NAV_SPIKE.md`
- 2025-12-14: Accessibility/Theme(글자 크기/확대모드) — `Front/docs/WORKLOG_2025-12-14_A11Y_THEME.md`
- 2025-12-14: Shared UI 인벤토리(Workstream 3) — `Front/docs/WORKLOG_2025-12-14_SHARED_UI_INVENTORY.md`
- 2025-12-14: Settings 화면 MUI 전환(1차) — `Front/docs/WORKLOG_2025-12-14_SETTINGS_MUI.md`
- 2025-12-14: Playwright E2E Smoke(시니어/보호자) — `Front/docs/WORKLOG_2025-12-14_PLAYWRIGHT_SMOKE.md`
- 2025-12-15: Shared UI 제거(완료) — `Front/docs/WORKLOG_2025-12-15_SHARED_UI_REMOVAL.md`
- 2025-12-15: Tailwind 제거 + SCSS 제거(완료) — `Front/docs/WORKLOG_2025-12-15_CLEANUP_TAILWIND_SASS.md`
- 2025-12-15: Family/Medication P0 MUI 전환(2차) — `Front/docs/WORKLOG_2025-12-15_FAMILY_MEDICATION_P0_MUI.md`
