# 실버케어 프론트엔드 컴포넌트 정의서

> Frontend Components Specification for SilverCare Platform
>
> React 19 + Vite + JSX Architecture

---

## 📋 목차

1. [개요](#-개요)
2. [프로젝트 구조](#-프로젝트-구조)
3. [화면별 컴포넌트 트리](#-화면별-컴포넌트-트리)
4. [공통 컴포넌트 라이브러리](#-공통-컴포넌트-라이브러리)
5. [상태 관리](#-상태-관리)
6. [API 연동](#-api-연동)
7. [라우팅 구조](#-라우팅-구조)
8. [컴포넌트 Props 명세](#-컴포넌트-props-명세)

---

## 🎯 개요

### 기술 스택
- **Framework**: React 19 (JSX only, NO TypeScript)
- **번들러**: Vite
- **상태 관리**: ~~Context API + React Query~~ → Zustand + React Query (전역 상태는 각 feature의 `store/` 디렉터리에서 정의된 Zustand 훅으로 관리하고, 서버 상태는 React Query가 담당)
- **스타일링**: SCSS Modules
- **실시간 동기화**: Hocuspocus + Y.js
- **폼 관리**: React Hook Form
- **날짜 처리**: date-fns
- **HTTP 클라이언트**: Axios

### 디자인 시스템
- **화면 크기**: 1200px × 800px (Desktop First)
- **그리드**: 8px 기반
- **색상**: Green (#4CAF50), Blue (#2196F3), Red (#F44336), Orange (#FF9800)
- **폰트**: Inter (Bold, SemiBold, Regular, Medium)
- **코너 반경**: 12px (카드), 8px (버튼)

### Tailwind Theme 매핑
| 토큰 | 값 | Tailwind key |
|------|-----|--------------|
| Primary | `#2563eb` | `theme.colors.primary` |
| Caregiver Accent | `#a5b4fc` | `theme.colors.caregiver` |
| Senior Accent | `#f9a8d4` | `theme.colors.senior` |
| Warning | `#f97316` | `theme.colors.warning` |
| Danger | `#ef4444` | `theme.colors.danger` |
| Success | `#22c55e` | `theme.colors.success` |
| Font | `Inter, system-ui` | `theme.fontFamily.sans` |
| Radii | 12px / 8px | `theme.borderRadius.card`, `theme.borderRadius.control` |

> 전역 스타일은 `src/styles/tailwind.css` + `src/styles/base.scss`에서 초기화하며, 레이아웃/모듈 디자인은 SCSS Modules로 구성한다.

---

## 📂 프로젝트 구조

```
frontend/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── main.jsx                      # Entry point
│   ├── App.jsx                       # Root component
│   │
│   ├── core/                         # Core utilities
│   │   ├── config/
│   │   │   ├── api.config.js
│   │   │   ├── routes.config.js
│   │   │   └── constants.js
│   │   ├── services/
│   │   │   └── api/
│   │   │       ├── ApiClient.js
│   │   │       ├── AuthApiClient.js
│   │   │       ├── MedicationApiClient.js
│   │   │       ├── FamilyApiClient.js
│   │   │       ├── DietApiClient.js
│   │   │       └── OCRApiClient.js
│   │   ├── interceptors/
│   │   │   ├── authInterceptor.js
│   │   │   └── errorInterceptor.js
│   │   └── utils/
│   │       ├── dateUtils.js
│   │       ├── validationUtils.js
│   │       └── formatUtils.js
│   │
│   ├── features/                     # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── KakaoLoginButton.jsx
│   │   │   │   └── RoleSelector.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.js
│   │   │   ├── context/
│   │   │   │   └── AuthContext.jsx
│   │   │   └── pages/
│   │   │       ├── KakaoLoginPage.jsx
│   │   │       └── RoleSelectionPage.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── senior/
│   │   │   │   │   ├── TodayMedicationChecklist.jsx
│   │   │   │   │   ├── AvoidFoodList.jsx
│   │   │   │   │   ├── DiseaseList.jsx
│   │   │   │   │   └── MedicationScheduleTimeline.jsx
│   │   │   │   └── caregiver/
│   │   │   │       ├── SeniorStatusCard.jsx
│   │   │   │       ├── AlertCenter.jsx
│   │   │   │       ├── WeeklyAdherenceChart.jsx
│   │   │   │       └── QuickActionButtons.jsx
│   │   │   └── pages/
│   │   │       ├── SeniorDashboard.jsx
│   │   │       └── CaregiverDashboard.jsx
│   │   │
│   │   ├── medication/
│   │   │   ├── components/
│   │   │   │   ├── MedicationList.jsx
│   │   │   │   ├── MedicationCard.jsx
│   │   │   │   ├── MedicationForm.jsx
│   │   │   │   ├── MedicationDetailModal.jsx
│   │   │   │   ├── ScheduleInput.jsx
│   │   │   │   └── InventoryTracker.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useMedications.js
│   │   │   │   ├── useMedicationLogs.js
│   │   │   │   └── useMedicationSchedule.js
│   │   │   └── pages/
│   │   │       ├── MedicationListPage.jsx
│   │   │       ├── MedicationAddPage.jsx
│   │   │       ├── MedicationDetailPage.jsx
│   │   │       └── MedicationReviewsPage.jsx
│   │   │
│   │   ├── ocr/
│   │   │   ├── components/
│   │   │   │   ├── ImageUploader.jsx
│   │   │   │   ├── OCRResultPreview.jsx
│   │   │   │   └── ManualCorrection.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useOCR.js
│   │   │   └── pages/
│   │   │       ├── PrescriptionScanPage.jsx
│   │   │       └── PillSearchPage.jsx
│   │   │
│   │   ├── diet/
│   │   │   ├── components/
│   │   │   │   ├── MealInputForm.jsx
│   │   │   │   ├── MealHistory.jsx
│   │   │   │   ├── FoodConflictWarning.jsx
│   │   │   │   └── AlternativeSuggestion.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDiet.js
│   │   │   │   └── useConflictCheck.js
│   │   │   └── pages/
│   │   │       ├── DietLogPage.jsx
│   │   │       └── HospitalDietResourcesPage.jsx
│   │   │
│   │   ├── family/
│   │   │   ├── components/
│   │   │   │   ├── FamilyGroupCard.jsx
│   │   │   │   ├── FamilyMemberCard.jsx
│   │   │   │   ├── InviteMemberForm.jsx
│   │   │   │   └── MemberRoleSelector.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFamily.js
│   │   │   │   └── useFamilySync.js
│   │   │   └── pages/
│   │   │       └── FamilyManagementPage.jsx
│   │   │
│   │   ├── disease/
│   │   │   ├── components/
│   │   │   │   ├── SymptomSearchInput.jsx
│   │   │   │   ├── SuspectedDiseaseCard.jsx
│   │   │   │   ├── DiseaseRestrictionsList.jsx
│   │   │   │   └── PharmacyRecommendation.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useDiseases.js
│   │   │   └── pages/
│   │   │       ├── SymptomSearchPage.jsx
│   │   │       ├── SuspectedDiseasePage.jsx
│   │   │       ├── PharmacyAdvicePage.jsx
│   │   │       ├── MyDiseasesPage.jsx
│   │   │       └── DiseaseRestrictionsPage.jsx
│   │   │
│   │   ├── chat/
│   │   │   ├── components/
│   │   │   │   ├── ChatRoomList.jsx
│   │   │   │   ├── ChatRoomCard.jsx
│   │   │   │   ├── ChatMessage.jsx
│   │   │   │   └── ChatInput.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useChat.js
│   │   │   └── pages/
│   │   │       ├── PharmacistChatListPage.jsx
│   │   │       └── ChatConversationPage.jsx
│   │   │
│   │   ├── report/
│   │   │   ├── components/
│   │   │   │   ├── AdherenceChart.jsx
│   │   │   │   ├── WeeklyTrendChart.jsx
│   │   │   │   └── PDFDownloadButton.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useAdherenceReport.js
│   │   │   └── pages/
│   │   │       └── AdherenceReportPage.jsx
│   │   │
│   │   ├── settings/
│   │   │   ├── components/
│   │   │   │   ├── SettingsMenu.jsx
│   │   │   │   ├── ProfileEditForm.jsx
│   │   │   │   └── NotificationSettings.jsx
│   │   │   └── pages/
│   │   │       ├── SettingsPage.jsx
│   │   │       ├── ProfileEditPage.jsx
│   │   │       ├── NotificationSettingsPage.jsx
│   │   │       ├── MyMedicationsSettingsPage.jsx
│   │   │       └── MyDiseasesSettingsPage.jsx
│   │   │
│   │   └── notifications/
│   │       ├── components/
│   │       │   ├── NotificationBell.jsx
│   │       │   ├── NotificationList.jsx
│   │       │   └── NotificationItem.jsx
│   │       ├── hooks/
│   │       │   └── useNotifications.js
│   │       └── pages/
│   │           ├── NotificationListPage.jsx
│   │           └── NotificationDetailPage.jsx
│   │
│   ├── shared/                       # Shared components
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   └── ProgressBar.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── BottomNavigation.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── MainLayout.jsx
│   │   │   └── feedback/
│   │   │       ├── EmptyState.jsx
│   │   │       ├── ErrorBoundary.jsx
│   │   │       └── LoadingOverlay.jsx
│   │   └── hooks/
│   │       ├── useDebounce.js
│   │       ├── useLocalStorage.js
│   │       └── useMediaQuery.js
│   │
│   ├── routing/
│   │   ├── AppRouter.jsx
│   │   ├── PrivateRoute.jsx
│   │   ├── PublicRoute.jsx
│   │   └── routes.js
│   │
│   └── styles/
│       ├── main.scss
│       ├── variables.scss
│       ├── mixins.scss
│       └── components/
│
└── package.json
```

---

## 🌲 화면별 컴포넌트 트리

### 1. 인증 (Auth)

#### 01. 카카오 로그인 (`/login`)
```
KakaoLoginPage
└── MainLayout (no nav)
    ├── Header
    └── KakaoLoginButton
        └── Button (variant="kakao")
```

#### 02. 역할 선택 (`/role-selection`)
```
RoleSelectionPage
└── MainLayout (no nav)
    ├── Header
    └── RoleSelector
        ├── Card (senior)
        └── Card (caregiver)
```

---

### 2. 대시보드 (Dashboard)

#### 03. 시니어 대시보드 (`/dashboard/senior`)
```
SeniorDashboard
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    │   └── NotificationBell
    ├── CameraButton (OCR 스캔)
    ├── AvoidFoodList
    │   └── Card[]
    ├── TodayMedicationChecklist
    │   └── MedicationCheckItem[]
    │       ├── Card
    │       └── CheckboxButton
    ├── DiseaseList
    │   └── Badge[]
    ├── MedicationScheduleTimeline
    │   └── TimelineItem[]
    └── BottomNavigation
```

#### 04. 보호자 대시보드 (`/dashboard/caregiver`)
```
CaregiverDashboard
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    │   └── NotificationBell
    ├── SeniorStatusCard
    │   ├── Avatar
    │   ├── StatusBadge
    │   └── ProgressBar (복약률)
    ├── AlertCenter
    │   └── Alert[]
    ├── FamilyMemberList
    │   └── FamilyMemberCard[]
    ├── WeeklyAdherenceChart
    │   └── BarChart
    ├── QuickActionButtons
    │   ├── Button (약 등록)
    │   └── Button (가족 초대)
    └── BottomNavigation
```

---

### 3. 약 관리 (Medication)

#### 05. 약 관리 메인 (`/medications`)
```
MedicationListPage
└── MainLayout (BottomNav: 약관리 활성화)
    ├── Header
    │   └── Button (+ 약 등록)
    ├── SearchInput
    ├── FilterTabs
    │   ├── Tab (전체)
    │   ├── Tab (복용 중)
    │   └── Tab (종료)
    ├── MedicationList
    │   └── MedicationCard[]
    │       ├── Card
    │       ├── Badge (타이밍)
    │       ├── InventoryTracker
    │       │   └── ProgressBar
    │       └── ButtonGroup
    │           ├── Button (편집)
    │           └── Button (삭제)
    └── BottomNavigation
```

#### 06. 약 등록 (`/medications/add`)
```
MedicationAddPage
└── MainLayout (BottomNav: 약관리 활성화)
    ├── Header
    ├── TabGroup
    │   ├── Tab (OCR 스캔)
    │   ├── Tab (알약 검색)
    │   └── Tab (수동 입력)
    ├── [Tab Content]
    │   ├── ImageUploader (OCR)
    │   ├── PillSearchForm (검색)
    │   └── MedicationForm (수동)
    └── BottomNavigation
```

#### 17. 약 리뷰 게시판 (`/medications/reviews`)
```
MedicationReviewsPage
└── MainLayout (BottomNav: 약관리 활성화)
    ├── Header
    ├── SearchInput
    ├── ReviewList
    │   └── ReviewCard[]
    │       ├── Card
    │       ├── Rating (별점)
    │       ├── UserAvatar
    │       └── ReviewText
    └── BottomNavigation
```

#### 18. 약 상세 정보 (`/medications/:id`)
```
MedicationDetailPage
└── MainLayout (BottomNav: 약관리 활성화)
    ├── Header
    ├── MedicationDetailCard
    │   ├── Card
    │   ├── Image (약 이미지)
    │   ├── InfoSection
    │   │   ├── Field (약 이름)
    │   │   ├── Field (주성분)
    │   │   ├── Field (복용량)
    │   │   └── Field (효능)
    │   ├── ScheduleSection
    │   │   └── ScheduleItem[]
    │   ├── InventorySection
    │   │   └── ProgressBar
    │   └── ButtonGroup
    │       ├── Button (편집)
    │       └── Button (삭제)
    └── BottomNavigation
```

---

### 4. OCR 및 알약 검색

#### 11. 처방전 스캔 (`/prescription/scan`)
```
PrescriptionScanPage
└── MainLayout (no nav during scan)
    ├── Header
    ├── ImageUploader
    │   ├── DragDropZone
    │   ├── FileInput
    │   └── PreviewImage
    ├── Button (스캔 시작)
    └── LoadingSpinner (처리 중)
```

#### 12. OCR 결과 확인 (`/prescription/result`)
```
OCRResultPage
└── MainLayout (no nav)
    ├── Header
    ├── OCRResultPreview
    │   ├── Card
    │   ├── ExtractedText
    │   └── ParsedData
    ├── ManualCorrection
    │   └── MedicationForm (수정)
    ├── ButtonGroup
    │   ├── Button (저장)
    │   └── Button (다시 스캔)
    └── BottomNavigation
```

#### 13. 알약 역검색 (`/pill/search`)
```
PillSearchPage
└── MainLayout (BottomNav: 약관리 활성화)
    ├── Header
    ├── PillSearchForm
    │   ├── Select (모양)
    │   ├── Select (색상)
    │   ├── Input (앞면 각인)
    │   └── Input (뒷면 각인)
    ├── Button (검색)
    ├── SearchResultList
    │   └── PillCard[]
    │       ├── Card
    │       ├── Image (알약 사진)
    │       └── InfoSection
    └── BottomNavigation
```

#### 14. 검색 결과 (`/pill/results`)
```
PillResultPage
└── MainLayout (BottomNav: 약관리 활성화)
    ├── Header
    ├── ResultCount
    ├── PillResultList
    │   └── PillCard[]
    │       ├── Card
    │       ├── Image
    │       ├── InfoSection
    │       └── Button (선택)
    └── BottomNavigation
```

#### 15. 약 상세 모달 (`/pill/:id/detail`)
```
PillDetailModal (Overlay)
├── Modal
│   ├── ModalHeader
│   │   └── CloseButton
│   ├── ModalBody
│   │   ├── Image (약 사진)
│   │   ├── InfoGrid
│   │   │   ├── Field (제품명)
│   │   │   ├── Field (제조사)
│   │   │   ├── Field (성분)
│   │   │   ├── Field (효능)
│   │   │   ├── Field (용법)
│   │   │   └── Field (주의사항)
│   │   └── ConflictWarningSection
│   │       └── Alert[]
│   └── ModalFooter
│       └── Button (이 약 등록하기)
```

---

### 5. 식단 관리 (Diet)

#### 21. 식단 입력 (`/diet/log`)
```
DietLogPage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    ├── MealInputForm
    │   ├── Select (식사 구분)
    │   ├── Input (음식 이름)
    │   ├── Input (칼로리)
    │   └── Button (추가)
    ├── MealHistory
    │   └── MealCard[]
    │       ├── Card
    │       ├── Badge (식사 구분)
    │       └── ButtonGroup
    └── BottomNavigation
```

#### 22. 음식 충돌 경고 (`/diet/warning`)
```
FoodWarningPage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    ├── FoodConflictWarning
    │   ├── Alert (severity: high)
    │   ├── ConflictDetails
    │   │   ├── FoodInfo
    │   │   ├── MedicationInfo
    │   │   └── ReasonText
    │   └── SeverityBadge
    ├── AlternativeSuggestion
    │   └── Card[]
    │       └── FoodAlternativeItem
    └── BottomNavigation
```

#### 24. 병원 공식 식단 자료 (`/diet/hospital-resources`)
```
HospitalDietResourcesPage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    ├── SearchInput
    ├── CategoryTabs
    │   ├── Tab (당뇨)
    │   ├── Tab (고혈압)
    │   └── Tab (신장질환)
    ├── ResourceList
    │   └── ResourceCard[]
    │       ├── Card
    │       ├── Image (썸네일)
    │       ├── InfoSection
    │       └── Button (다운로드)
    └── BottomNavigation
```

---

### 6. 가족 관리 (Family)

#### 07. 가족 관리 (`/family`)
```
FamilyManagementPage
└── MainLayout (BottomNav: 가족 활성화)
    ├── Header
    │   └── Button (+ 가족 초대)
    ├── FamilyGroupCard
    │   ├── Card
    │   ├── GroupName
    │   └── CreatedBy
    ├── FamilyMemberList
    │   └── FamilyMemberCard[]
    │       ├── Card
    │       ├── Avatar
    │       ├── InfoSection
    │       │   ├── Name
    │       │   ├── RoleBadge
    │       │   └── JoinedDate
    │       └── ButtonGroup
    │           ├── Button (상세)
    │           └── Button (제거)
    └── BottomNavigation
```

#### 26. 가족 초대 (`/family/invite`)
```
FamilyInvitePage (Modal)
├── Modal
│   ├── ModalHeader
│   ├── ModalBody
│   │   ├── InviteMemberForm
│   │   │   ├── Input (이메일)
│   │   │   └── Select (역할)
│   │   └── InviteLinkSection
│   │       ├── Input (readonly)
│   │       └── Button (복사)
│   └── ModalFooter
│       ├── Button (취소)
│       └── Button (초대)
```

#### 27. 가족 구성원 상세 (`/family/member/:id`)
```
FamilyMemberDetailPage
└── MainLayout (BottomNav: 가족 활성화)
    ├── Header
    ├── MemberProfileCard
    │   ├── Card
    │   ├── Avatar
    │   └── InfoSection
    ├── MedicationList
    │   └── MedicationCard[] (read-only)
    ├── AdherenceChart
    └── BottomNavigation
```

---

### 7. 증상 검색 & 질병 관리 (Disease)

#### 11. 증상 검색 (`/symptom/search`)
```
SymptomSearchPage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    ├── SymptomSearchInput
    │   ├── Input (증상 입력)
    │   └── Button (검색)
    ├── PopularSymptoms
    │   └── Badge[] (클릭 가능)
    └── BottomNavigation
```

#### 12. 의심 질환 결과 (`/disease/suspected`)
```
SuspectedDiseasePage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    ├── SearchedSymptoms
    │   └── Badge[]
    ├── SuspectedDiseaseList
    │   └── SuspectedDiseaseCard[]
    │       ├── Card
    │       ├── DiseaseName
    │       ├── MatchRate
    │       │   └── ProgressBar
    │       ├── Description
    │       └── Button (상세 보기)
    └── BottomNavigation
```

#### 13. 약국 상담 추천 (`/pharmacy/advice`)
```
PharmacyAdvicePage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    ├── Alert (경고: 진단 대신 상담)
    ├── PharmacyRecommendation
    │   └── PharmacyCard[]
    │       ├── Card
    │       ├── PharmacyName
    │       ├── Address
    │       ├── Distance
    │       └── ButtonGroup
    │           ├── Button (전화)
    │           └── Button (채팅 상담)
    └── BottomNavigation
```

#### 19. 내 질병 관리 (`/diseases/my`)
```
MyDiseasesPage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    │   └── Button (+ 질병 추가)
    ├── DiseaseList
    │   └── DiseaseCard[]
    │       ├── Card
    │       ├── DiseaseName
    │       ├── RegisteredDate
    │       └── Button (제한사항 보기)
    └── BottomNavigation
```

#### 20. 질병별 기피 음식/약 (`/diseases/:id/restrictions`)
```
DiseaseRestrictionsPage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    ├── DiseaseInfoCard
    │   ├── Card
    │   └── DiseaseName
    ├── TabGroup
    │   ├── Tab (기피 음식)
    │   └── Tab (주의 약물)
    ├── RestrictionsList
    │   └── RestrictionCard[]
    │       ├── Card
    │       ├── ItemName
    │       ├── Reason
    │       └── SeverityBadge
    └── BottomNavigation
```

---

### 8. 약사 채팅 (Pharmacist Chat)

#### 09. 약사 채팅 목록 (`/chat/pharmacist`)
```
PharmacistChatListPage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    │   └── Button (+ 새 상담)
    ├── ChatRoomList
    │   └── ChatRoomCard[]
    │       ├── Card
    │       ├── PharmacistAvatar
    │       ├── InfoSection
    │       │   ├── PharmacistName
    │       │   ├── LastMessage
    │       │   └── Timestamp
    │       └── UnreadBadge
    └── BottomNavigation
```

#### 10. 약사 1:1 대화 (`/chat/:roomId`)
```
ChatConversationPage (No Bottom Nav)
└── MainLayout
    ├── ChatHeader
    │   ├── BackButton
    │   ├── PharmacistInfo
    │   └── MenuButton
    ├── ChatMessageList
    │   └── ChatMessage[]
    │       ├── Avatar (상대방)
    │       ├── MessageBubble
    │       └── Timestamp
    ├── ChatInput
    │   ├── TextArea
    │   ├── AttachButton
    │   └── SendButton
    └── TypingIndicator
```

---

### 9. 리포트 (Report)

#### 21. 복약 순응도 리포트 (`/report/adherence`)
```
AdherenceReportPage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    │   └── PDFDownloadButton
    ├── DateRangePicker
    ├── OverallAdherenceCard
    │   ├── Card
    │   ├── ProgressBar (전체 순응도)
    │   └── StatusBadge
    ├── MedicationBreakdown
    │   └── MedicationAdherenceCard[]
    │       ├── Card
    │       ├── MedicationName
    │       ├── ProgressBar
    │       └── Stats (복용/미복용)
    ├── WeeklyTrendChart
    │   └── LineChart
    └── BottomNavigation
```

---

### 10. 알림 (Notifications)

#### 33. 알림 목록 (`/notifications`)
```
NotificationListPage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    │   └── Button (모두 읽음)
    ├── FilterTabs
    │   ├── Tab (전체)
    │   ├── Tab (약 복용)
    │   ├── Tab (식단 경고)
    │   └── Tab (가족 알림)
    ├── NotificationList
    │   └── NotificationItem[]
    │       ├── Card
    │       ├── Icon (type별)
    │       ├── InfoSection
    │       │   ├── Title
    │       │   ├── Message
    │       │   └── Timestamp
    │       └── ReadBadge
    └── BottomNavigation
```

#### 34. 알림 상세 (`/notifications/:id`)
```
NotificationDetailPage
└── MainLayout (BottomNav: 홈 활성화)
    ├── Header
    ├── NotificationDetailCard
    │   ├── Card
    │   ├── Icon
    │   ├── Title
    │   ├── Message
    │   ├── Timestamp
    │   └── RelatedData (약/식단 정보)
    ├── ActionButtons
    │   └── Button (관련 페이지 이동)
    └── BottomNavigation
```

---

### 11. 설정 (Settings)

#### 08. 설정 메인 (`/settings`)
```
SettingsPage
└── MainLayout (BottomNav: 설정 활성화)
    ├── Header
    ├── ProfileSection
    │   ├── Avatar
    │   ├── Name
    │   └── Email
    ├── SettingsMenu
    │   ├── MenuItem (프로필 편집)
    │   ├── MenuItem (알림 설정)
    │   ├── MenuItem (내 약 관리)
    │   ├── MenuItem (내 질병 관리)
    │   ├── MenuItem (개인정보처리방침)
    │   ├── MenuItem (이용약관)
    │   └── MenuItem (로그아웃)
    └── BottomNavigation
```

#### 36. 프로필 편집 (`/settings/profile`)
```
ProfileEditPage
└── MainLayout (BottomNav: 설정 활성화)
    ├── Header
    ├── ProfileEditForm
    │   ├── AvatarUploader
    │   ├── Input (이름)
    │   ├── Input (이메일, readonly)
    │   ├── Input (전화번호)
    │   └── Button (저장)
    └── BottomNavigation
```

#### 37. 알림 설정 (`/settings/notifications`)
```
NotificationSettingsPage
└── MainLayout (BottomNav: 설정 활성화)
    ├── Header
    ├── NotificationSettings
    │   ├── ToggleItem (약 복용 알림)
    │   ├── ToggleItem (식단 경고)
    │   ├── ToggleItem (가족 알림)
    │   └── ToggleItem (시스템 알림)
    └── BottomNavigation
```

#### 19. 내 약 관리 설정 (`/settings/medications`)
```
MyMedicationsSettingsPage
└── MainLayout (BottomNav: 설정 활성화)
    ├── Header
    ├── MedicationList
    │   └── MedicationCard[]
    └── BottomNavigation
```

#### 20. 내 질병 관리 설정 (`/settings/diseases`)
```
MyDiseasesSettingsPage
└── MainLayout (BottomNav: 설정 활성화)
    ├── Header
    ├── DiseaseList
    │   └── DiseaseCard[]
    └── BottomNavigation
```

---

## 🧩 공통 컴포넌트 라이브러리

### UI 기본 컴포넌트

#### Button
```jsx
// src/shared/components/ui/Button.jsx
<Button
  variant="primary|secondary|danger|kakao|outline"
  size="sm|md|lg"
  fullWidth={boolean}
  disabled={boolean}
  loading={boolean}
  onClick={function}
  icon={ReactNode}
>
  children
</Button>
```

#### Input
```jsx
// src/shared/components/ui/Input.jsx
<Input
  type="text|password|email|number|tel|date|time"
  placeholder={string}
  value={string}
  onChange={function}
  error={string}
  disabled={boolean}
  icon={ReactNode}
  fullWidth={boolean}
/>
```

#### Card
```jsx
// src/shared/components/ui/Card.jsx
<Card
  variant="default|outlined|elevated"
  padding="sm|md|lg"
  onClick={function}
  hoverable={boolean}
>
  children
</Card>
```

#### Modal
```jsx
// src/shared/components/ui/Modal.jsx
<Modal
  isOpen={boolean}
  onClose={function}
  size="sm|md|lg|xl"
  closeOnOverlay={boolean}
  title={string}
>
  children
</Modal>
```

#### Select
```jsx
// src/shared/components/ui/Select.jsx
<Select
  options={[{value, label}]}
  value={string}
  onChange={function}
  placeholder={string}
  error={string}
  disabled={boolean}
/>
```

#### Badge
```jsx
// src/shared/components/ui/Badge.jsx
<Badge
  variant="primary|success|warning|danger|info"
  size="sm|md|lg"
>
  children
</Badge>
```

#### Alert
```jsx
// src/shared/components/ui/Alert.jsx
<Alert
  type="success|info|warning|error"
  title={string}
  closable={boolean}
  onClose={function}
>
  children
</Alert>
```

#### Spinner
```jsx
// src/shared/components/ui/Spinner.jsx
<Spinner
  size="sm|md|lg"
  color="primary|secondary|white"
/>
```

#### Toast
```jsx
// src/shared/components/ui/Toast.jsx
// Usage: toast.success(message), toast.error(message)
```

#### ProgressBar
```jsx
// src/shared/components/ui/ProgressBar.jsx
<ProgressBar
  value={number} // 0-100
  max={number}
  color="primary|success|warning|danger"
  showLabel={boolean}
/>
```

---

### 레이아웃 컴포넌트

#### MainLayout
```jsx
// src/shared/components/layout/MainLayout.jsx
<MainLayout
  showBottomNav={boolean}
  showHeader={boolean}
>
  children
</MainLayout>
```

#### Header
```jsx
// src/shared/components/layout/Header.jsx
<Header>
  <HeaderLeft>
    <Logo />
  </HeaderLeft>
  <HeaderCenter>
    <PageTitle />
  </HeaderCenter>
  <HeaderRight>
    <NotificationBell />
    <UserAvatar />
  </HeaderRight>
</Header>
```

#### BottomNavigation
```jsx
// src/shared/components/layout/BottomNavigation.jsx
<BottomNavigation>
  <NavItem icon={HomeIcon} label="홈" to="/dashboard" />
  <NavItem icon={PillIcon} label="약관리" to="/medications" />
  <NavItem icon={FamilyIcon} label="가족" to="/family" />
  <NavItem icon={SettingsIcon} label="설정" to="/settings" />
  <QuickAction icon="🚪" label="로그아웃" onClick={logout} />
</BottomNavigation>
```

---

### 피드백 컴포넌트

#### EmptyState
```jsx
// src/shared/components/feedback/EmptyState.jsx
<EmptyState
  icon={ReactNode}
  title={string}
  description={string}
  action={ReactNode}
/>
```

#### ErrorBoundary
```jsx
// src/shared/components/feedback/ErrorBoundary.jsx
<ErrorBoundary fallback={ReactNode}>
  children
</ErrorBoundary>
```

#### LoadingOverlay
```jsx
// src/shared/components/feedback/LoadingOverlay.jsx
<LoadingOverlay
  loading={boolean}
  text={string}
/>
```

---

## 🔄 상태 관리

### Context API 구조

#### AuthContext
```javascript
// src/features/auth/context/AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = async (kakaoToken) => { /* ... */ };
  const logout = async () => { /* ... */ };
  const selectRole = async (role) => { /* ... */ };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      selectRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

#### FamilyContext
```javascript
// src/features/family/context/FamilyContext.jsx
const FamilyContext = createContext();

export const FamilyProvider = ({ children }) => {
  const [familyGroup, setFamilyGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFamilyGroup = async () => { /* ... */ };
  const inviteMember = async (email, role) => { /* ... */ };
  const removeMember = async (memberId) => { /* ... */ };

  return (
    <FamilyContext.Provider value={{
      familyGroup,
      members,
      loading,
      fetchFamilyGroup,
      inviteMember,
      removeMember
    }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => useContext(FamilyContext);
```

---

### React Query 사용

```javascript
// src/features/medication/hooks/useMedications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationApi } from '@/core/services/api/MedicationApiClient';

export const useMedications = () => {
  const queryClient = useQueryClient();

  // 약 목록 조회
  const { data: medications, isLoading, error } = useQuery({
    queryKey: ['medications'],
    queryFn: medicationApi.getAll
  });

  // 약 등록
  const createMutation = useMutation({
    mutationFn: medicationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
    }
  });

  // 약 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => medicationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
    }
  });

  // 약 삭제
  const deleteMutation = useMutation({
    mutationFn: medicationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
    }
  });

  return {
    medications,
    isLoading,
    error,
    createMedication: createMutation.mutate,
    updateMedication: updateMutation.mutate,
    deleteMedication: deleteMutation.mutate
  };
};
```

---

## 🌐 API 연동

### API Client 구조

#### ApiClient (Base)
```javascript
// src/core/services/api/ApiClient.js
import axios from 'axios';
import { API_BASE_URL } from '@/core/config/api.config';

export class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      async (error) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          // Refresh token logic
        }
        return Promise.reject(error);
      }
    );
  }

  async get(url, config) {
    return this.client.get(url, config);
  }

  async post(url, data, config) {
    return this.client.post(url, data, config);
  }

  async put(url, data, config) {
    return this.client.put(url, data, config);
  }

  async delete(url, config) {
    return this.client.delete(url, config);
  }
}
```

#### MedicationApiClient
```javascript
// src/core/services/api/MedicationApiClient.js
import { ApiClient } from './ApiClient';

class MedicationApiClient extends ApiClient {
  async getAll() {
    return this.get('/api/medications');
  }

  async getById(id) {
    return this.get(`/api/medications/${id}`);
  }

  async create(data) {
    return this.post('/api/medications', data);
  }

  async update(id, data) {
    return this.put(`/api/medications/${id}`, data);
  }

  async delete(id) {
    return this.delete(`/api/medications/${id}`);
  }

  async getSchedules(medicationId) {
    return this.get(`/api/medications/${medicationId}/schedules`);
  }

  async createSchedule(medicationId, data) {
    return this.post(`/api/medications/${medicationId}/schedules`, data);
  }

  async logCompletion(data) {
    return this.post('/api/medications/logs', data);
  }

  async getTodayLogs() {
    return this.get('/api/medications/logs/today');
  }
}

export const medicationApi = new MedicationApiClient();
```

---

## 🚦 라우팅 구조

### Routes Configuration
```javascript
// src/routing/routes.js
export const routes = {
  // Auth
  LOGIN: '/login',
  ROLE_SELECTION: '/role-selection',

  // Dashboard
  DASHBOARD_SENIOR: '/dashboard/senior',
  DASHBOARD_CAREGIVER: '/dashboard/caregiver',

  // Medications
  MEDICATIONS: '/medications',
  MEDICATION_ADD: '/medications/add',
  MEDICATION_DETAIL: '/medications/:id',
  MEDICATION_EDIT: '/medications/:id/edit',
  MEDICATION_REVIEWS: '/medications/reviews',

  // OCR & Search
  PRESCRIPTION_SCAN: '/prescription/scan',
  OCR_RESULT: '/prescription/result',
  PILL_SEARCH: '/pill/search',
  PILL_RESULTS: '/pill/results',
  PILL_DETAIL: '/pill/:id',

  // Diet
  DIET_LOG: '/diet/log',
  DIET_WARNING: '/diet/warning',
  HOSPITAL_DIET: '/diet/hospital-resources',

  // Family
  FAMILY: '/family',
  FAMILY_INVITE: '/family/invite',
  FAMILY_MEMBER_DETAIL: '/family/member/:id',

  // Disease
  SYMPTOM_SEARCH: '/symptom/search',
  SUSPECTED_DISEASE: '/disease/suspected',
  PHARMACY_ADVICE: '/pharmacy/advice',
  MY_DISEASES: '/diseases/my',
  DISEASE_RESTRICTIONS: '/diseases/:id/restrictions',

  // Chat
  PHARMACIST_CHAT_LIST: '/chat/pharmacist',
  CHAT_CONVERSATION: '/chat/:roomId',

  // Report
  ADHERENCE_REPORT: '/report/adherence',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_DETAIL: '/notifications/:id',

  // Settings
  SETTINGS: '/settings',
  PROFILE_EDIT: '/settings/profile',
  NOTIFICATION_SETTINGS: '/settings/notifications',
  MY_MEDICATIONS_SETTINGS: '/settings/medications',
  MY_DISEASES_SETTINGS: '/settings/diseases'
};
```

### AppRouter
```javascript
// src/routing/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { routes } from './routes';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path={routes.LOGIN} element={<KakaoLoginPage />} />
          <Route path={routes.ROLE_SELECTION} element={<RoleSelectionPage />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path={routes.DASHBOARD_SENIOR} element={<SeniorDashboard />} />
          <Route path={routes.DASHBOARD_CAREGIVER} element={<CaregiverDashboard />} />
          <Route path={routes.MEDICATIONS} element={<MedicationListPage />} />
          {/* ... more routes */}
        </Route>

        {/* Redirect */}
        <Route path="/" element={<Navigate to={routes.LOGIN} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

---

## 📝 컴포넌트 Props 명세

### MedicationCard Props
```javascript
// src/features/medication/components/MedicationCard.jsx
MedicationCard.propTypes = {
  medication: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    dosage: PropTypes.string,
    timing: PropTypes.string,
    remaining: PropTypes.number,
    quantity: PropTypes.number
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onClick: PropTypes.func
};
```

### Button Props
```javascript
// src/shared/components/ui/Button.jsx
Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'kakao', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

Button.defaultProps = {
  variant: 'primary',
  size: 'md',
  fullWidth: false,
  disabled: false,
  loading: false,
  type: 'button'
};
```

### Card Props
```javascript
// src/shared/components/ui/Card.jsx
Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated']),
  padding: PropTypes.oneOf(['sm', 'md', 'lg']),
  onClick: PropTypes.func,
  hoverable: PropTypes.bool
};

Card.defaultProps = {
  variant: 'default',
  padding: 'md',
  hoverable: false
};
```

---

## 🎨 스타일링 가이드

### SCSS Variables
```scss
// src/styles/variables.scss

// Colors
$color-primary: #4CAF50;      // Green
$color-secondary: #2196F3;    // Blue
$color-danger: #F44336;       // Red
$color-warning: #FF9800;      // Orange
$color-kakao: #FEE500;        // Kakao Yellow

$color-gray-50: #FAFAFA;
$color-gray-100: #F5F5F5;
$color-gray-200: #EEEEEE;
$color-gray-300: #E0E0E0;
$color-gray-400: #BDBDBD;
$color-gray-500: #9E9E9E;
$color-gray-600: #757575;
$color-gray-700: #616161;
$color-gray-800: #424242;
$color-gray-900: #212121;

// Spacing (8px grid)
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 20px;
$spacing-xl: 30px;
$spacing-2xl: 40px;

// Border Radius
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-xl: 16px;
$radius-full: 9999px;

// Shadows
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

// Typography
$font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-md: 16px;
$font-size-lg: 20px;
$font-size-xl: 24px;
$font-size-2xl: 32px;

$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// Breakpoints
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
```

### SCSS Mixins
```scss
// src/styles/mixins.scss

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin card {
  background: white;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: $spacing-md;
}

@mixin button-reset {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  outline: none;
}

@mixin truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin line-clamp($lines) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 🚀 실시간 동기화 (Hocuspocus)

### Hocuspocus Provider 설정
```javascript
// src/core/services/realtime/HocuspocusProvider.js
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';

export class FamilySyncService {
  constructor(familyGroupId, userId) {
    this.doc = new Y.Doc();
    this.provider = new HocuspocusProvider({
      url: 'ws://your-server.com',
      name: `family-group-${familyGroupId}`,
      document: this.doc,
      token: localStorage.getItem('accessToken')
    });

    this.medicationLogs = this.doc.getMap('medicationLogs');
    this.onlineUsers = this.doc.getArray('onlineUsers');
  }

  // 복용 체크 동기화
  logMedicationCompletion(medicationId, timestamp) {
    this.medicationLogs.set(`${medicationId}-${timestamp}`, {
      medicationId,
      timestamp,
      completed: true
    });
  }

  // 실시간 변경사항 구독
  subscribeToChanges(callback) {
    this.medicationLogs.observe((event) => {
      callback(event.changes);
    });
  }

  // 연결 해제
  disconnect() {
    this.provider.disconnect();
  }
}
```

---

## 📖 참고 문서

- [SRC_STRUCTURE.md](./SRC_STRUCTURE.md) - 전체 소스 구조
- [WIREFRAME_SCREENS.md](./WIREFRAME_SCREENS.md) - 와이어프레임 명세
- [MVP_DTO_SPECIFICATION.md](./MVP_DTO_SPECIFICATION.md) - API 및 DTO 명세
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [Figma Exports](./figma-exports/v2/) - 디자인 파일

---

**작성일**: 2025-11-07
**버전**: 1.0
**작성자**: 실버케어 개발팀
**상태**: 초안 완성
