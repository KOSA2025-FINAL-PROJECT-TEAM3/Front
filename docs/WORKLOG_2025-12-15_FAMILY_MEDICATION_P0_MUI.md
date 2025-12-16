# Worklog — Family/Medication P0 MUI 전환 (2차)

날짜: 2025-12-15  
범위: `Front/` (Workstream 4: Feature P0 Migration)

---

## 목표

- Family 초대 플로우와 Medication(약/처방전) 핵심 화면을 **MUI 기반 UI로 전환**하고, 해당 화면의 `*.module.css` 의존을 제거한다.

---

## 변경 요약

### Family — Invite Flow

- `Front/src/features/family/pages/InviteCodeEntry.jsx`
  - CSS Module 기반 화면을 MUI(`Container/Paper/Stack/TextField/Button/Chip/Alert`)로 전환
  - `InviteCodeEntry.module.css` 삭제
- `Front/src/features/family/pages/InviteLanding.jsx`
  - CSS Module 기반 상태 화면을 MUI로 전환(검증/수락/성공/에러)
  - `InviteLanding.module.css` 삭제
- `Front/src/features/family/pages/FamilyInvite.jsx`
  - AppDialog 내부 리스트/액션 UI를 MUI로 전환(보낸 초대/받은 초대)
  - `FamilyInvite.module.css` 삭제
- `Front/src/features/family/components/InviteMemberForm.jsx`
  - MUI 기반 입력 폼으로 전환(react-hook-form 유지)
  - `InviteMemberForm.module.css` 삭제
- `Front/src/features/family/components/SelectedInviteDetails.jsx`
  - MUI 기반 초대 상세/공유/역할 수정 UI로 전환
  - 링크 복사 피드백을 `toast`로 통일
- 레거시 역할 선택 컴포넌트 제거(InviteMemberForm 내 MUI ToggleButtonGroup로 대체)
  - `Front/src/features/family/components/MemberRoleSelector.jsx` 삭제
  - `Front/src/features/family/components/MemberRoleCard.module.css` 삭제
  - (미사용) `Front/src/features/family/components/MemberRoleSelector.module.css` 삭제
- `Front/src/features/family/pages/FamilyManagement.jsx`
  - 페이지 상단/모달/에러/로딩 UI를 MUI로 전환(하위 컴포넌트는 점진 전환)
  - `FamilyManagement.module.css` 삭제
- `Front/src/features/family/pages/FamilyMemberDetail.jsx`
  - 탭 UI를 MUI `Tabs`로 전환
  - `FamilyMemberDetail.module.css` 삭제

### Chat — P0 Pages

- `Front/src/features/chat/pages/DoctorChatListPage.jsx`
  - 리스트/빈상태/에러/로딩 UI를 MUI로 전환
  - `DoctorChatListPage.module.css` 삭제
- `Front/src/features/chat/pages/ChatConversationPage.jsx`
  - 페이지 레이아웃/헤더/에러 UI를 MUI로 전환
  - `ChatConversationPage.module.css` 삭제
  - (추가) `loadMessages` 선언 순서 오류(TDZ) 수정
- `Front/src/features/chat/pages/FamilyChatConversationPage.jsx`
  - 페이지 레이아웃을 MUI로 전환
  - `FamilyChatConversationPage.module.css` 삭제
  - IntersectionObserver 대상 선택을 CSS-module class → 고정 class(`family-chat-message-item`)로 변경

### Medication — Core Pages

- `Front/src/features/medication/pages/MedicationManagement.jsx`
  - 헤더/리스트/빈상태/로딩 UI를 MUI로 전환, 글로벌 class 기반 status 제거 → `Chip`로 대체
  - `MedicationManagement.module.css` 삭제
- `Front/src/features/medication/pages/PrescriptionAddPage.jsx`
  - 처방전 입력/복용시간/약 목록/하단 저장 버튼 영역을 MUI로 전환(동작 로직 유지)
  - `PrescriptionAddPage.module.css` 삭제
- `Front/src/features/medication/pages/PrescriptionDetailPage.jsx`
  - 삭제된 `PrescriptionAddPage.module.css` 재사용 의존 제거(빌드/런타임 오류 방지)
  - 상세/수정 UI를 MUI로 전환(동작 로직 유지)
  - `PrescriptionDetailPage.module.css` 삭제(미사용)
- `Front/src/features/medication/pages/MedicationAddPage.jsx`
  - 페이지 래퍼(헤더/컨테이너)를 MUI로 전환(`MedicationForm` 유지)
  - `MedicationAddPage.module.css` 삭제
- `Front/src/features/medication/pages/MedicationEditPage.jsx`
  - 페이지 래퍼(헤더/컨테이너/placeholder)를 MUI로 전환(`MedicationForm` 유지)
  - `MedicationEditPage.module.css` 삭제
- `Front/src/features/ocr/pages/PrescriptionScan.jsx`
  - 처방전 스캔 플로우(선택/미리보기/로딩/편집/등록) 페이지 UI를 MUI로 전환(하위 컴포넌트 유지)
  - `Front/src/features/ocr/pages/PrescriptionScan.module.css` 삭제
- `Front/src/features/medication/pages/PrescriptionScan.jsx`
  - 처방전 스캔 플로우(선택/미리보기/로딩/편집/등록) 페이지 UI를 MUI로 전환(하위 컴포넌트 유지)
  - `Front/src/features/medication/pages/PrescriptionScan.module.css` 삭제

### Diet — P0 Pages

- `Front/src/features/diet/pages/DietLogPage.jsx`
  - 페이지 레이아웃/헤더/상태 UI를 MUI로 전환
  - `DietLogPage.module.css` 삭제
  - alert 기반 에러 표시를 `toast`로 전환
- `Front/src/features/diet/pages/FoodWarning.jsx`
  - 페이지 레이아웃/헤더를 MUI로 전환
  - `FoodWarning.module.css` 삭제

### Disease — P0 Pages

- `Front/src/features/disease/pages/Disease.jsx`
  - 페이지 레이아웃/헤더 래퍼를 MUI로 전환(기존 `DiseaseList/DiseaseTrash/DiseaseForm` 유지)
  - `Disease.module.css` 삭제
- `Front/src/features/disease/pages/DiseaseDetailPage.jsx`
  - 상세 화면을 MUI로 전환(Chip/Stack/Paper 기반)
  - `DiseaseDetailPage.module.css` 삭제
- `Front/src/features/disease/pages/DiseaseRestrictionsPage.jsx`
  - 플레이스홀더 페이지를 MUI로 전환
  - `DiseaseRestrictionsPage.module.css` 삭제
- `Front/src/features/disease/pages/SuspectedDiseasePage.jsx`
  - 플레이스홀더 페이지를 MUI로 전환
  - `SuspectedDiseasePage.module.css` 삭제

### Search — P0 Pages

- `Front/src/features/search/pages/UnifiedSearchPage.jsx`
  - 페이지 레이아웃/헤더를 MUI로 전환
  - `UnifiedSearchPage.module.css` 삭제
- `Front/src/features/search/pages/SymptomSearch.jsx`
  - 입력/결과/상세 UI를 MUI로 전환
  - `SymptomSearch.module.css` 삭제
- `Front/src/features/search/pages/PillSearchPage.jsx`
  - 플레이스홀더 페이지를 MUI로 전환
  - `PillSearchPage.module.css` 삭제
- `Front/src/features/search/pages/PillResultPage.jsx`
  - 플레이스홀더 페이지를 MUI로 전환
  - `PillResultPage.module.css` 삭제

### Auth — Core Pages

- `Front/src/features/auth/pages/Login.jsx`
  - 로그인 페이지를 MUI로 전환
  - `Login.module.css` 삭제
- `Front/src/features/auth/pages/Signup.jsx`
  - 회원가입 페이지를 MUI로 전환(역할 선택을 MUI RadioGroup로 전환)
  - `Signup.module.css` 삭제
- `Front/src/features/auth/pages/RoleSelection.jsx`
  - 역할 선택 페이지를 MUI로 전환
  - `RoleSelection.module.css` 삭제
- `Front/src/features/auth/pages/KakaoCallback.jsx`
  - 카카오 콜백 상태 화면을 MUI로 전환
  - `KakaoCallback.module.css` 삭제

### Settings — Core Pages

- `Front/src/features/settings/pages/Notifications/NotificationSettings.jsx`
  - 채널/알림종류 토글 UI를 MUI로 전환
  - `Front/src/features/settings/pages/Notifications/NotificationSettings.module.css` 삭제
- `Front/src/features/settings/pages/Profile/ProfileEdit.jsx`
  - 프로필 편집 폼 UI를 MUI로 전환
  - `Front/src/features/settings/pages/Profile/ProfileEdit.module.css` 삭제
- `Front/src/features/settings/pages/PrivacyPolicyPage.jsx`
  - 약관/정책 문서 페이지 UI를 MUI로 전환
- `Front/src/features/settings/pages/TermsOfServicePage.jsx`
  - 약관/정책 문서 페이지 UI를 MUI로 전환
- `Front/src/features/settings/pages/MyDiseasesSettingsPage.jsx`
  - 플레이스홀더 페이지를 MUI로 전환
  - `MyDiseasesSettingsPage.module.css` 삭제
- `Front/src/features/settings/pages/MyMedicationsSettingsPage.jsx`
  - 플레이스홀더 페이지를 MUI로 전환
  - `MyMedicationsSettingsPage.module.css` 삭제
- (정리) `Front/src/features/settings/pages/LegalPage.module.css` 삭제(더 이상 사용되지 않음)

### Cleanup — Remove Counsel

- `Front/src/features/counsel/pages/DoctorCounsel.jsx` 삭제
- `Front/src/features/counsel/pages/DoctorCounsel.module.css` 삭제
- `Front/src/core/services/api/counselApiClient.js` 삭제
- 라우트/메뉴/음성 명령에서 `/counsel` 진입점 제거:
  - `Front/src/core/config/routes.config.js`
  - `Front/src/App.jsx`
  - `Front/src/pages/more/MorePage.jsx`
  - `Front/src/features/voice/utils/voiceCommandMatcher.js`

---

## 현황 스냅샷(변경 후)

- `*.module.scss`: 0개
- `*.module.css`: 0개

---

## 추가 진행(이어진 작업)

### Chat — Components

- `Front/src/features/chat/components/ChatInput.jsx`
  - MUI(`Paper/IconButton/Box sx`) 기반으로 정리 + `allowImageUpload` 옵션 추가
  - `ChatInput.module.css` 삭제
- `Front/src/features/chat/components/ChatMessage.jsx`
  - CSS Module 기반 말풍선 UI를 MUI `sx`로 전환(ReactMarkdown 유지)
  - `ChatMessage.module.css` 삭제
- `Front/src/features/chat/components/ChatRoomCard.jsx`
  - CSS Module 기반 카드 UI를 MUI(`Paper/Avatar/Chip`)로 전환
  - `ChatRoomCard.module.css` 삭제
- `Front/src/features/chat/pages/ChatConversationPage.jsx`
  - 1:1 의사/AI 채팅은 이미지 전송 미지원으로 `allowImageUpload={false}` 적용

### Auth — Components

- `Front/src/features/auth/components/KakaoLoginButton.jsx`
  - CSS Module 버튼 → MUI `Button`로 전환(기존 OAuth 로직 유지)
  - `KakaoLoginButton.module.css` 삭제

### Cleanup — Unused CSS 삭제

- (미사용) `Front/src/features/diet/components/MealCard.module.css` 삭제
- (미사용) `Front/src/features/diet/components/MealHistory.module.css` 삭제
- (미사용) `Front/src/features/diet/components/MealInputForm.module.css` 삭제

### Dashboard — Components

- `Front/src/features/dashboard/components/MedicationCard.jsx`
  - CSS Module 기반 카드 → MUI(`Paper/Checkbox/Button/Chip`) 기반으로 전환
  - `MedicationCard.module.css` 삭제
- `Front/src/features/dashboard/components/MyMedicationSchedule.jsx`
  - 섹션/로딩/빈상태 UI를 MUI로 전환
  - `MyMedicationSchedule.module.css` 삭제
- `Front/src/features/dashboard/components/FamilyMemberCard.jsx`
  - CSS Module 기반 카드 → MUI(`Paper/Stack/Divider/Button`) 기반으로 전환
  - `FamilyMemberCard.module.css` 삭제

### Layout/Toast/Error/Disease/Family/OCR — module.css 추가 감소

- Layout/Voice/Toast/Error:
  - `Front/src/shared/components/layout/AppShell.jsx` (MainLayout CSS 제거)
  - `Front/src/shared/components/layout/Header.jsx` (Header CSS 제거)
  - `Front/src/features/voice/components/VoiceAssistant.jsx` (CSS 제거)
  - `Front/src/shared/components/toast/Toast.jsx`, `Front/src/shared/components/toast/ToastContainer.jsx` (CSS 제거)
  - `Front/src/shared/components/ErrorFallback.jsx` (CSS 제거)
  - `Front/src/pages/errors/NotFound.jsx`, `Front/src/pages/errors/ServerError.jsx` (ErrorPage CSS 제거)
- Search:
  - `Front/src/features/search/components/SymptomSearchTab.jsx` (CSS 제거)
- Disease:
  - `Front/src/features/disease/components/DiseaseList.jsx`
  - `Front/src/features/disease/components/DiseaseCard.jsx`
  - `Front/src/features/disease/components/DiseaseForm.jsx`
  - `Front/src/features/disease/components/DiseaseTrash.jsx`
- Family:
  - `Front/src/features/family/components/FamilyGroupCard.jsx`
  - `Front/src/features/family/components/MemberProfileCard.jsx`
  - `Front/src/features/family/components/FamilyMemberList.jsx`
  - `Front/src/features/family/components/FamilyMemberCard.jsx`
  - `Front/src/features/family/components/FamilyAdherenceChart.jsx`
  - `Front/src/features/family/components/GroupSelectionModal.jsx`
  - `Front/src/features/family/components/OwnerDelegationModal.jsx`
  - `Front/src/features/family/components/FamilyMedicationList.jsx`
- OCR:
  - `Front/src/features/ocr/components/DurationPicker.jsx`
  - `Front/src/features/ocr/components/IntakeTimePicker.jsx`
  - `Front/src/features/ocr/components/RegistrationInfo.jsx`
  - `Front/src/features/ocr/components/PharmacyHeader.jsx`
  - `Front/src/features/medication/components/ocr/DurationPicker.jsx`
  - `Front/src/features/medication/components/ocr/IntakeTimePicker.jsx`
  - `Front/src/features/medication/components/ocr/RegistrationInfo.jsx`
  - `Front/src/features/medication/components/ocr/PharmacyHeader.jsx`

---

## 리스크/메모

- (완료) 잔존 `*.module.css` 0개: 마지막 잔여( MedicationForm/MedicationModal/MedicationDetailModal/MedicationCardInPrescription, PillSearchTab, CameraCapture, DeveloperModePanel, CollaborativeEditor )까지 MUI로 전환.
- npm 실행 에러로 인해 `npm` 기반 빌드/테스트는 스킵(정적 스캔으로 import 누락만 확인).

---

## 추가 진행(3차 — 잔여 module.css 0화)

- Medication 컴포넌트 UI를 MUI로 전환:
  - `Front/src/features/medication/components/MedicationModal.jsx`
  - `Front/src/features/medication/components/MedicationDetailModal.jsx`
  - `Front/src/features/medication/components/MedicationCardInPrescription.jsx`
  - `Front/src/features/medication/components/MedicationForm.jsx` (기존 MUI 전환본 기준으로 잔여 CSS 삭제)
- OCR/Camera: `Front/src/features/ocr/components/CameraCapture.jsx` MUI 기반 전체화면 UI로 전환
- Search: `Front/src/features/search/components/PillSearchTab.jsx` MUI 전환(검색/결과/상세/경고/처방전 선택)
- Devtools: `Front/src/devtools/DeveloperModePanel.jsx`, `Front/src/devtools/editor/components/CollaborativeEditor.jsx` MUI 전환 + TipTap 스타일은 `GlobalStyles`로 흡수
- Places(Kakao Maps): `Front/src/features/places/pages/PlaceSearchPage.jsx` 추가 + `MorePage` 진입 메뉴 추가 + `VITE_KAKAO_JAVASCRIPT_KEY` 연동

### 후속 정리

- (삭제) `Front/src/devtools/editor/components/CollaborativeEditor.jsx`
  - TipTap / Hocuspocus 관련 기능 미사용으로 판단되어 devtools editor 자체 제거
- (추가) 카메라 집중 모드(상태 기반)로 VoiceAssistant 자동 비노출
  - `Front/src/shared/stores/focusModeStore.js`
  - `Front/src/features/ocr/components/CameraCapture.jsx`
  - `Front/src/shared/components/layout/AppShell.jsx`
- (정리) 사용되지 않는 의존성 제거: `@hocuspocus/provider`, `yjs` (package.json)
