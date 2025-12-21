# RN 스타일 UI/UX 이식 — 진행 현황 & 남은 작업 (Front)

목표: `Front/`(Vite + React + MUI)에서 `React-native/`(프로토타입)의 **페이지 배치/정보 리듬/내비게이션 UX**를 따라가도록, 토큰/레이아웃/스크린을 점진적으로 정렬한다.

- 대상 레포: `Front/`
- 참고(프로토타입): `React-native/`
- 업데이트 규칙: 작업 단위(1~3개 파일/기능) 완료 시 본 문서에 “완료/남은 작업/리스크”를 갱신한다.
- Last updated: 2025-12-17

---

## 1) 현재 작업 상태(요약)

### 완료(스파이크 1차: App Shell + 토큰 + 도크)
- [x] **Theme 토큰을 프로토타입 톤으로 정렬(1차)**: teal primary / slate text / divider / 카드/다이얼로그 라운딩 / safe-area 변수
  - 변경: `Front/src/styles/theme.js`
- [x] **Header 높이/블러/섀도우/세이프에어리어 반영**
  - 변경: `Front/src/shared/components/layout/Header.jsx`
- [x] **글자 크기 3단계(표준/크게/더크게) 패리티**
  - store/theme 적용: `Front/src/shared/stores/uiPreferencesStore.js`, `Front/src/styles/theme.js`, `Front/src/App.jsx`
  - UI 컨트롤: `Front/src/shared/components/layout/FloatingActionButtons.jsx`, `Front/src/features/settings/components/AccessibilitySection.jsx`
- [x] **Mobile BottomNav를 RN 도크 형태로 변경**(rounded top + maxWidth center + blur + safe-area bottom)
  - 변경: `Front/src/shared/components/layout/AdaptiveNavigation.jsx`
- [x] **AppShell 레이아웃을 RN 배치로 정렬**
  - 본문 maxWidth(데스크톱 narrow), 패딩 리듬, 도크 높이만큼 하단 여백 확보
  - 변경: `Front/src/shared/components/layout/AppShell.jsx`
- [x] **대시보드 2개 화면을 “AppShell 기준 배치”로 정리**
  - `ResponsiveContainer` 제거 및 섹션 간 리듬 조정
  - 변경: `Front/src/features/dashboard/pages/SeniorDashboard.jsx`
  - 변경: `Front/src/features/dashboard/pages/CaregiverDashboard.jsx`
- [x] **페이지 배치 프리미티브 추가**(페이지 리듬 표준화)
  - 추가: `Front/src/shared/components/layout/PageHeader.jsx`
  - 추가: `Front/src/shared/components/layout/PageStack.jsx`
- [x] **Auth 화면 배치/룩앤필을 RN 톤으로 정리**
  - 변경: `Front/src/features/auth/pages/Login.jsx`
  - 변경: `Front/src/features/auth/pages/Signup.jsx`
- [x] **Core 화면 2개를 AppShell 기준 배치로 정리**
  - 변경: `Front/src/features/medication/pages/MedicationManagement.jsx`
  - 변경: `Front/src/features/family/pages/FamilyManagement.jsx`
- [x] **요청 화면 배치 정리(통합검색/처방전/알림)**
  - 변경: `Front/src/features/search/pages/UnifiedSearchPage.jsx`
  - 변경: `Front/src/features/medication/pages/PrescriptionAddPage.jsx`
  - 변경: `Front/src/features/medication/pages/PrescriptionDetailPage.jsx`
  - 변경: `Front/src/features/notification/pages/NotificationPage.jsx` (알림 센터 하이라이트/리스트 리듬 포함)
  - 변경: `Front/src/features/notification/pages/NotificationDetailPage.jsx`
- [x] **보호자 대시보드 메뉴/활동로그 패리티(1차)**
  - 메뉴 그리드(복약/식단/질병/검색/OCR/채팅): `Front/src/features/dashboard/pages/CaregiverDashboard.jsx`
  - 최근 활동 로그 타임라인(활성 어르신 기준): `Front/src/features/dashboard/pages/CaregiverDashboard.jsx`
- [x] **Search 최근 검색어 리듬(1차)**
  - store + UI + 칩 클릭 재검색: `Front/src/features/search/store/searchHistoryStore.js`, `Front/src/features/search/pages/UnifiedSearchPage.jsx`
- [x] **전역 Search Overlay(1차)**
  - FAB/대시보드에서 overlay로 열기: `Front/src/features/search/store/searchOverlayStore.js`, `Front/src/features/search/components/SearchOverlay.jsx`, `Front/src/shared/components/layout/AppShell.jsx`
  - 더보기/큰 버튼도 overlay 진입으로 통일: `Front/src/pages/more/MorePage.jsx`, `Front/src/features/dashboard/components/LargeActionButtons.jsx`
  - 모션(슬라이드 up) + pill 탭에서 OCR 진입 버튼 제공: `Front/src/features/search/components/SearchOverlay.jsx`, `Front/src/features/search/components/PillSearchTab.jsx`
- [x] **Prescription 약 추가 모달 step UX(1차)**
  - SEARCH → DETAIL 정렬: `Front/src/features/medication/components/MedicationModal.jsx`
- [x] **Prescription 처방약 카드 밀도/순서(1차)**
  - 이미지/복용량/요일/시간 + 메모 접기/펼치기 + 우상단 액션: `Front/src/features/medication/components/MedicationCardInPrescription.jsx`
- [x] **Notification 중요/일반 섹션 분리 + diet.warning 하이라이트(1차)**
  - 중요 기준: missed* + diet.warning, 액션은 가족 채팅/오늘 복약 보기: `Front/src/features/notification/pages/NotificationPage.jsx`
- [x] **리포트/설정/더보기 배치 확장**
  - 변경: `Front/src/features/report/pages/AdherenceReportPage.jsx`
  - 변경: `Front/src/features/report/pages/WeeklyStatsPage.jsx`
  - 변경: `Front/src/features/settings/pages/Notifications/NotificationSettings.jsx`
  - 변경: `Front/src/features/settings/pages/Profile/ProfileEdit.jsx`
  - 변경: `Front/src/features/settings/pages/PrivacyPolicyPage.jsx`
  - 변경: `Front/src/features/settings/pages/TermsOfServicePage.jsx`
  - 변경: `Front/src/pages/more/MorePage.jsx`
- [x] **빌드 확인**
  - `npm -C Front run build` 성공(경고: dynamic/static import chunk 관련은 기존 상태)
- [x] **잔여 화면들의 `Container` 기반 배치 제거/통일**
  - Diet: `Front/src/features/diet/pages/FoodWarning.jsx`, `Front/src/features/diet/pages/DietLogPage.jsx`
  - Medication: `Front/src/features/medication/pages/TodayMedications.jsx`, `Front/src/features/medication/pages/MedicationAddPage.jsx`, `Front/src/features/medication/pages/MedicationEditPage.jsx`
  - OCR Scan: `Front/src/features/ocr/pages/PrescriptionScan.jsx`, `Front/src/features/medication/pages/PrescriptionScan.jsx`
  - Disease: `Front/src/features/disease/pages/Disease.jsx`, `Front/src/features/disease/pages/DiseaseDetailPage.jsx`, `Front/src/features/disease/pages/SuspectedDiseasePage.jsx`, `Front/src/features/disease/pages/DiseaseRestrictionsPage.jsx`
  - Family/Invite: `Front/src/features/family/pages/FamilyMemberDetail.jsx`, `Front/src/features/family/pages/InviteCodeEntry.jsx`
  - Auth: `Front/src/features/auth/pages/RoleSelection.jsx`, `Front/src/features/auth/pages/KakaoCallback.jsx`
  - Placeholders: `Front/src/features/search/pages/PillResultPage.jsx`, `Front/src/features/settings/pages/MyMedicationsSettingsPage.jsx`, `Front/src/features/settings/pages/MyDiseasesSettingsPage.jsx`

### 진행중
- [ ] 화면별 디테일(세이프에어리어/도크 겹침/리듬) 회귀 점검

---

## 2) 이번 스파이크에서 확정된 UI 규칙(웹 기준)

- Header: `xs=64px`, `md=72px` + `safe-area-top` padding
- Desktop 기본 내비: Header 중앙 segmented tabs(이미 구현되어 있음)
- Mobile 기본 내비: 하단 도크(rounded top, blur, shadow, max-width centered)
- Mobile dock 토큰: `--bottom-dock-height`, `--bottom-dock-gap`(+ `--safe-area-bottom`)
- Content width: Desktop은 `maxWidth=1280`(RN 프로토타입의 `max-w-7xl` 리듬)
- Safe-area: `--safe-area-*` CSS 변수로 header/dock에서 사용

---

## 3) 남은 작업(우선순위)

### P0 — 배치 일관성(프로토타입 “화면 리듬” 체감)
- [x] **미사용/레거시 레이아웃 정리**
  - `Front/src/shared/components/layout/ResponsiveContainer.jsx` 사용처 없음 → 제거(더 이상 `Container` 기반 래퍼 사용하지 않음)
- [ ] **Bottom dock 겹침 회귀 점검(수동 QA 남음)**
  - 기술적 보강: 도크 높이/간격 CSS 변수화 + `SpeedDialFab`/Dev 패널/`VoiceAssistant` 도크 회피 + `Toast` safe-area top 반영
  - 수동 점검 체크리스트: `Front/docs/REGRESSION_CHECKLIST.md`
- [ ] **Focus mode 화면(Map/Camera/Chat)**에서 safe-area/스크롤/오버레이 겹침 없는지 확인(수동 QA)
  - 수동 점검 체크리스트: `Front/docs/REGRESSION_CHECKLIST.md`

### P1 — 토큰/컴포넌트 디테일(프로토타입 느낌 강화)
- [x] elevation/shadow 규칙 정리(카드/헤더/도크 각각) — `theme.shadows` 중심 + 페이지별 과한 하드코딩 최소화
- [x] radius 스케일 정리(카드=24, paper/dialog=24, pill=999 등) — Paper/Alert/Chip 기본값 정렬
- [x] typography weight/letterSpacing 기준 통일(제목/섹션 타이틀) — heading/subtitle/button 기본 가중치 상향

### P2 — 화면별 정렬(선택한 화면부터)
- [x] `MedicationManagement` 리스트/상세 “RN 섹션” 리듬으로 재구성(밀도/CTA/빈상태)
- [x] `FamilyManagement` 카드/리스트 밀도 및 CTA 위치 정렬(헤더 CTA 우선순위 조정)
- [x] `PlaceSearchPage` 지도/리스트 공존 시 스크롤/오버레이 UX 재정렬(AppShell/PageHeader 리듬 적용)
- [x] Dashboard(역할별) 모바일/데스크톱 배치·카드 순서 정렬 + RN-style 전역 FAB 적용
- [x] SeniorDashboard: RN `HistoryTimeline` 대응 카드(“이전 기록”) 1차 도입
- [x] Notification: 알림 센터 하이라이트(긴급/요약) + 리스트 2컬럼 리듬(프로토타입 기준)
- [ ] `Search` 탭/결과 화면 리듬 정렬(placeholder → 실제 UI 연결 시)

---

## 4) 작업 로그(간단)

### 2025-12-16 — RN Shell 이식(1차)
- Theme: safe-area vars + palette/shape/overrides 정리
- Layout: AppShell header/dock 공간/폭 조정
- Navigation: Mobile bottom dock 스타일 적용
- Dashboards: Container 기반 제거, AppShell 중심 리듬 적용
- Build: 성공

### 2025-12-16 — RN 배치 확장(통합검색/처방전/알림)
- Layout primitives(PageHeader/PageStack)로 페이지 헤더/섹션 리듬 적용
- Search: 상단 헤더 + fullWidth 탭 + 콘텐츠 섹션 구성으로 정리
- Prescription: 하단 고정 액션바에 safe-area/bottom padding 반영 + 본문 스크롤 여백 확보
- Notification: 목록/상세를 PageHeader 기반으로 통일
- Build: 성공

### 2025-12-16 — RN 배치 확장(리포트/설정/더보기)
- Report: `PageHeader`(Back + 액션) + 섹션 Paper 리듬으로 통일, `Container` 제거
- Settings: 알림/프로필/약관/개인정보 페이지를 `PageHeader/PageStack` 기준으로 정리
- More: 페이지 배경/Container 제거 후 AppShell 기준 배치로 통일
- Build: 성공

### 2025-12-16 — RN 배치 통일(잔여 Container 제거)
- `Container` 기반 페이지 래퍼를 `PageHeader/PageStack` + AppShell 리듬으로 전부 통일
- OCR 스캔 플로우는 `showBottomNav={false}` + safe-area bottom padding으로 하단 sticky CTA 충돌 최소화

### 2025-12-16 — 도크/플로팅 충돌 방지(토큰화)
- Bottom dock 높이/간격을 CSS 변수로 고정(`--bottom-dock-height`, `--bottom-dock-gap`)
- `SpeedDialFab`/Dev 패널/`VoiceAssistant`는 모바일에서 기본적으로 도크 위로 떠서 겹침을 줄임
- `Toast`는 safe-area top을 반영해 헤더/노치와 충돌을 줄임

### 2025-12-16 — 글자 크기 3단계 + 알림 센터 하이라이트
- 글자 크기: store를 `fontScaleLevel(1~3)`로 확장하고 theme의 `html fontSize`에 반영
- 컨트롤: 전역 FAB 퀵메뉴 내부 ± + 설정(글자 크기) UI 제공
- 알림: RN `AlertCenter`처럼 하이라이트 카드(긴급/요약) + 리스트 2컬럼 레이아웃 정렬
- 시니어 대시보드: RN `HistoryTimeline` 대응 “이전 기록” 카드 추가

### 2025-12-16 — P1 토큰 정리 + P2 핵심 화면 RN 리듬 적용
- P1: Typography(heading/subtitle/button) weight/letterSpacing 정렬, Paper/Alert/Chip/Input radius 정렬
- P2: `MedicationManagement`/`FamilyManagement`/`PlaceSearchPage`를 `PageHeader/PageStack` 리듬으로 재정렬(CTA 우선순위/섹션 밀도/빈상태)

### 2025-12-16 — Dashboard 패리티(역할별 구성/카드 순서/FAB)
- Senior: 모바일/데스크톱 2컬럼 리듬으로 재구성(요약/퀵액션/체크/주간/전체일정)
- Caregiver: 케어 대상 배너 + 대상 전환 + 메뉴 그리드 + 어르신 복약 현황
- 전역 FAB(퀵메뉴 + 음성) 도입: `Front/src/shared/components/layout/FloatingActionButtons.jsx`

### 2025-12-17 — Search/Notification/Prescription RN 디테일 정렬(2차)
- Search Overlay
  - Search 탭을 RN처럼 `약/식단`으로 전환 + 헤더 타이틀을 탭별(약 검색/식단)로 변경
  - 헤더 좌측에 뒤로/닫기 버튼 동시 제공
  - backdrop 클릭으로 닫기 금지(버튼/ESC로만 종료) + 닫을 때 pending 초기화
  - 최근 검색어를 탭 공통으로 통일 + input 아래 섹션 배치 + 전체 삭제 1개
  - 데스크톱 overlay는 2컬럼(좌: 입력/최근, 우: 결과)로 분리
  - OCR 진입 시 `returnTo`를 전달해 등록 완료 후 원래 화면으로 복귀
- Search(`/search`)
  - 페이지형(`/search`)에서도 `약/식단` 탭 + input 아래 최근검색 + 데스크탑 2컬럼 리듬으로 overlay와 동일하게 정렬
- Pill Search(약 검색)
  - 입력 패널 버튼 배치를 일반 검색 UX로 정렬(검색은 입력과 같은 줄, 부가 액션은 아래 줄)
- Notification
  - 중요/일반 섹션을 아코디언으로 분리(중요 기본 펼침, 일반 기본 접힘)
  - 같은 날짜/같은 시간대 기준으로 그룹핑 + **오늘만 기본 확장(없으면 최신 날짜 1개만 확장)**
  - 중요 섹션 정렬 우선순위(미복용 → diet.warning → 기타) 반영
- Notification Store
  - `diet.warning`은 같은 날짜 기준으로 groupKey를 부여해 중복 알림을 묶음(클라이언트 1차)
- FAB
  - RN 퀵메뉴 항목 구성 1차 고정(PDF는 보호자만 실행) + 전역 FAB 노출 규칙을 AppShell로 일원화
  - 퀵메뉴에 “알림” 바로가기 추가
- Prescription
  - Add/Detail 공통 섹션 순서 정렬: 처방전 정보 → 복용시간 → 처방약 → 메모/결제
  - 약 추가 CTA를 처방약 카드 내부 primary 버튼으로 이동(빈 상태는 가이드+CTA 포함)
  - 하단 고정 CTA를 저장 1버튼으로 단순화(취소 제거, 삭제는 Detail 헤더에서 제공)
  - 메모는 짧으면 항상 노출, 길면 접기/펼치기 제공
- Dashboard(Senior)
  - RN QuickActionGrid(약품 검색/식단 기록/가족 채팅방) 레이아웃으로 정렬하고, 중복 CTA(큰 버튼/전체 일정)를 대시보드에서 제거
- Dashboard(Caregiver)
  - RN Guardian 기준으로 데스크탑 2컬럼(좌: 케어 대상 요약/오늘 요약/주간, 우: 케어 메뉴/최근 활동 로그) 레이아웃 적용
  - 모바일은 RN처럼 배너 + 6개 메뉴 카드 중심으로 단순화(요약/주간은 하단 카드로 제공)
  - 케어 대상(어르신/보호자)을 localStorage에 저장(재방문 시 유지) + `오늘 요약`/`지난 7일 기록` 클릭 시 선택된 대상의 복약 로그로 이동
- Family
  - 가족관리 카드의 `상세/탈퇴/알림설정(기어)` UX 정리(탈퇴 confirm 텍스트 분리, 기어는 보호자→타인 카드에서만 노출)
  - 구성원 상세에서 복약/식단 로그 조회 파라미터를 userId로 정합

---

## 5) 결정 필요(다음 작업 시작 전)

- [ ] **P2 우선 화면 1~2개 선정**
  - 후보: `MedicationManagement`, `FamilyManagement`, `PlaceSearchPage`

---

## 6) 관련 문서(기존)

- 계획/근거: `Front/docs/UX_RN_TOKENS_NAV_PLAN.md`
- 패리티 기준: `Front/docs/RN_LAYOUT_PARITY.md`
- 패리티 플랜: `Front/docs/RN_PARITY_REFACTOR_PLAN.md`
- 화면 목록: `Front/docs/SCREEN_INVENTORY.md`
- 작업 트래커: `Front/docs/UX_MUI_REFACTOR_TASKS.md`
