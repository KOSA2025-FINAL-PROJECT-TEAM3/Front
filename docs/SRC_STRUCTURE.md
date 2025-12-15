# AMA...Pill Frontend 소스 구조

> React 19 + Vite 기반 프론트엔드 프로젝트 구조

---

## 📐 Architecture Overview

이 프로젝트는 **Feature-Based Architecture**를 따르며, 각 기능 모듈이 독립적으로 관리됩니다.

### 설계 원칙
- **Feature-First**: 기능별 모듈 분리 (auth, medication, family 등)
- **Single Responsibility**: 각 파일/모듈은 하나의 책임만 담당
- **Dependency Inversion**: API 클라이언트는 추상 클래스를 상속
- **Separation of Concerns**: UI, 상태, API 로직 분리

---

## 🗂️ 프로젝트 루트 구조

```
Front/
├── public/                      # 정적 파일
├── src/                         # 소스 코드
├── docs/                        # 프로젝트 문서
├── index.html                   # HTML 엔트리
├── package.json                 # 의존성 정의
├── vite.config.js               # Vite 설정
├── eslint.config.js             # ESLint 설정
├── nginx.conf                   # Nginx 배포 설정
├── docker-compose.nginx.yml     # Docker 배포 설정
├── .env.template                # 환경변수 템플릿
└── .env.production.template     # 프로덕션 환경변수 템플릿
```

---

## 🎨 src/ 디렉토리 구조

```
src/
├── App.jsx                      # 루트 컴포넌트 (라우팅 정의)
├── main.jsx                     # 애플리케이션 엔트리 포인트
│
├── core/                        # 핵심 인프라스트럭처
│   ├── config/                  # 설정 파일
│   │   ├── api.config.js        # API 기본 URL 설정
│   │   ├── routes.config.js     # 라우트 경로 정의 (40+ 라우트)
│   │   ├── constants.js         # 전역 상수 (Enum, 역할, 상태)
│   │   └── environment.config.js # 환경변수 설정
│   │
│   ├── services/                # 서비스 레이어
│   │   └── api/                 # API 클라이언트 (12개)
│   │       ├── ApiClient.js     # 추상 API 클라이언트 (Mock 지원)
│   │       ├── httpClient.js    # Axios 래퍼
│   │       ├── authApiClient.js # 인증 API
│   │       ├── medicationApiClient.js
│   │       ├── familyApiClient.js
│   │       ├── dietApiClient.js
│   │       ├── diseaseApiClient.js
│   │       ├── searchApiClient.js
│   │       ├── ocrApiClient.js
│   │       ├── chatApiClient.js
│   │       ├── counselApiClient.js
│   │       ├── reportApiClient.js
│   │       └── notificationApiClient.js
│   │
│   ├── interceptors/            # HTTP 인터셉터
│   │   ├── authInterceptor.js   # JWT 토큰 주입
│   │   └── errorInterceptor.js  # 전역 에러 처리
│   │
│   ├── routing/                 # 라우팅 유틸리티
│   │   ├── PrivateRoute.jsx     # 인증 필요 라우트 보호
│   │   └── navigation.js        # 프로그래매틱 네비게이션
│   │
│   └── utils/                   # 유틸리티 함수
│       ├── index.js             # 유틸리티 re-export
│       ├── formatting.js        # 날짜/숫자/문자열 포매팅
│       ├── validation.js        # Zod 스키마 검증
│       ├── errorHandler.js      # 에러 파싱
│       └── stringUtils.js       # 문자열 유틸리티
│
├── features/                    # 기능 모듈 (13개 도메인)
│   ├── auth/                    # 인증
│   │   ├── pages/               # Login, Signup, RoleSelection, KakaoCallback
│   │   ├── components/          # KakaoLoginButton
│   │   ├── hooks/               # useAuth
│   │   ├── store/               # authStore (Zustand)
│   │   └── utils/               # roleUtils
│   │
│   ├── dashboard/               # 대시보드
│   │   ├── pages/               # SeniorDashboard, CaregiverDashboard
│   │   └── components/          # MedicationCard, FamilyMemberCard
│   │
│   ├── medication/              # 약 관리
│   │   ├── pages/               # Management, Add, Edit
│   │   ├── components/          # Form, List, DetailModal, InventoryTracker
│   │   └── store/               # medicationStore
│   │
│   ├── family/                  # 가족 관리
│   │   ├── pages/               # Management, Invite, MemberDetail
│   │   ├── components/          # List, Card, Profile, InviteForm, AdherenceChart
│   │   ├── hooks/               # useFamily, useFamilyMemberDetail, useFamilySync
│   │   ├── services/            # familyService, familySyncService
│   │   ├── context/             # FamilyContext (Provider)
│   │   └── store/               # familyStore
│   │
│   ├── diet/                    # 식단 관리
│   │   ├── pages/               # DietLogPage, FoodWarning
│   │   └── components/          # MealInputForm, MealHistory, FoodConflictWarning
│   │
│   ├── disease/                 # 질병 관리
│   │   └── pages/               # Disease, DetailPage, SuspectedDiseasePage, RestrictionsPage
│   │
│   ├── search/                  # 검색
│   │   ├── pages/               # SymptomSearch, PillSearchPage, PillResultPage
│   │   └── components/          # (검색 관련 컴포넌트)
│   │
│   ├── ocr/                     # 처방전 스캔
│   │   ├── pages/               # PrescriptionScan
│   │   └── components/          # OCRControlPanel, OCRResultPreview
│   │
│   ├── chat/                    # 채팅
│   │   ├── pages/               # DoctorChatListPage, ChatConversationPage
│   │   └── components/          # ChatMessage, ChatInput, ChatRoomCard
│   │
│   ├── counsel/                 # 상담
│   │   └── pages/               # DoctorCounsel
│   │
│   ├── notification/            # 알림
│   │   ├── pages/               # NotificationList
│   │   └── store/               # notificationStore
│   │
│   ├── report/                  # 리포트
│   │   └── pages/               # AdherenceReportPage, WeeklyStatsPage
│   │
│   ├── settings/                # 설정
│   │   ├── pages/               # Settings, ProfileEdit, NotificationSettings
│   │   │   ├── Notifications/   # 알림 설정
│   │   │   └── Profile/         # 프로필 설정
│   │   └── components/          # SettingsMenu, ProfileSection
│   │
│   └── index.js                 # features re-export
│
├── shared/                      # 공유 컴포넌트
│   └── components/
│       ├── ErrorBoundary.jsx    # 에러 경계
│       ├── ErrorFallback.jsx    # 에러 폴백 UI
│       │
│       ├── layout/              # 레이아웃 컴포넌트
│       │   ├── MainLayout.jsx   # 앱 레이아웃 (Header + BottomNav)
│       │   ├── Header.jsx       # 상단 네비게이션
│       │   └── BottomNavigation.jsx  # 하단 네비게이션 (4개 탭)
│       │
│       ├── ui/                  # 기본 UI 컴포넌트
│       │   ├── index.js         # UI 컴포넌트 re-export
│       │   ├── Button.jsx       # 버튼 (variants, sizes)
│       │   ├── Card.jsx         # 카드 컨테이너
│       │   ├── Input.jsx        # 폼 입력
│       │   ├── Modal.jsx        # 모달 다이얼로그
│       │   ├── Icon.jsx         # SVG 아이콘 시스템
│       │   ├── BackButton.jsx   # 뒤로가기 버튼
│       │   ├── FAB.jsx          # Floating Action Button
│       │   ├── MenuGroup.jsx    # 메뉴 그룹
│       │   ├── QuickActions.jsx # 빠른 액션 버튼
│       │   └── Tabs.jsx         # 탭 컴포넌트
│       │
│       └── toast/               # 토스트 알림
│           ├── Toast.jsx        # 토스트 컴포넌트
│           ├── ToastContainer.jsx
│           └── toastStore.js    # 토스트 상태 관리
│
├── hooks/                       # 전역 커스텀 훅
│   ├── index.js                 # 훅 re-export
│   ├── useDebounce.js           # 디바운스 (검색 입력 지연)
│   ├── useFetch.js              # 데이터 페칭 (loading/error/data)
│   └── useLocalStorage.js       # localStorage 동기화
│
├── pages/                       # 공통 페이지
│   ├── errors/                  # 에러 페이지
│   │   ├── NotFound.jsx         # 404 페이지
│   │   └── ServerError.jsx      # 500 페이지
│   └── more/                    # 더보기 페이지
│       └── MorePage.jsx
│
├── data/                        # Mock 데이터 (11개 파일)
│   ├── mockMedications.js       # 약 샘플 데이터
│   ├── mockFamily.js            # 가족 그룹/멤버 데이터
│   ├── mockDiet.js              # 식단 로그
│   ├── mockDiseases.js          # 질병 데이터베이스
│   ├── mockSymptoms.js          # 증상 검색 데이터
│   ├── mockNotifications.js     # 알림 메시지
│   ├── mockFoodWarnings.js      # 약-음식 상호작용
│   ├── mockChats.js             # 채팅 메시지
│   ├── mockChat.js              # 단일 채팅 데이터
│   ├── mockPillDetails.js       # 알약 외형 데이터
│   ├── mockReports.js           # 순응도 통계
│   ├── mockSearchResults.js     # 검색 결과
│   └── mockOcr.js               # OCR 결과 샘플
│
├── devtools/                    # 개발자 도구
│   ├── DeveloperModePanel.jsx   # 개발자 모드 패널
│   └── editor/                  # 협업 에디터
│       └── components/
│           └── CollaborativeEditor.jsx
│
├── assets/                      # 정적 자원
│   └── react.svg
│
└── styles/                      # 전역 스타일
    ├── base.css                # 기본 스타일
```

---

## 📦 Features 모듈 상세

### auth/ - 인증 모듈
```
features/auth/
├── pages/
│   ├── Login.jsx                # 로그인 페이지
│   ├── Signup.jsx               # 회원가입 페이지
│   ├── RoleSelection.jsx        # 역할 선택 (SENIOR/CAREGIVER)
│   └── KakaoCallback.jsx        # 카카오 OAuth 콜백
├── components/
│   └── KakaoLoginButton.jsx     # 카카오 로그인 버튼
├── hooks/
│   └── useAuth.js               # 인증 상태 훅
├── store/
│   └── authStore.js             # Zustand 인증 스토어
└── utils/
    └── roleUtils.js             # 역할 관련 유틸리티
```

### medication/ - 약 관리 모듈
```
features/medication/
├── pages/
│   ├── MedicationManagement.jsx # 약 관리 메인
│   ├── MedicationAddPage.jsx    # 약 등록
│   └── MedicationEditPage.jsx   # 약 수정
├── components/
│   ├── MedicationCard.jsx       # 약 카드
│   ├── MedicationList.jsx       # 약 목록
│   ├── MedicationForm.jsx       # 약 폼
│   ├── MedicationDetailModal.jsx # 약 상세 모달
│   └── InventoryTracker.jsx     # 재고 추적
└── store/
    └── medicationStore.js       # Zustand 약 스토어
```

### family/ - 가족 관리 모듈
```
features/family/
├── pages/
│   ├── FamilyManagement.jsx     # 가족 관리 메인
│   ├── FamilyInvite.jsx         # 가족 초대
│   └── FamilyMemberDetail.jsx   # 가족 구성원 상세
├── components/
│   ├── FamilyGroupCard.jsx      # 가족 그룹 카드
│   ├── FamilyMemberCard.jsx     # 가족 멤버 카드
│   ├── FamilyMemberList.jsx     # 가족 멤버 목록
│   ├── FamilyMedicationList.jsx # 가족 약 목록
│   ├── FamilyAdherenceChart.jsx # 가족 순응도 차트
│   ├── InviteMemberForm.jsx     # 초대 폼
│   ├── MemberProfileCard.jsx    # 멤버 프로필 카드
│   └── MemberRoleSelector.jsx   # 역할 선택기
├── hooks/
│   ├── useFamily.js             # 가족 데이터 훅
│   ├── useFamilyMemberDetail.js # 가족 멤버 상세 훅
│   └── useFamilySync.js         # 실시간 동기화 훅
├── services/
│   ├── familyService.js         # 가족 서비스
│   └── familySyncService.js     # 동기화 서비스
├── context/
│   ├── FamilyContext.jsx        # 가족 컨텍스트 Provider
│   ├── familyContextObject.js   # 컨텍스트 객체
│   └── useFamilyContext.js      # 컨텍스트 훅
└── store/
    └── familyStore.js           # Zustand 가족 스토어
```

---

## 🔧 Core 모듈 상세

### API 클라이언트 아키텍처

```javascript
// ApiClient.js - Mock/Real 모드 지원
class ApiClient {
  async request(endpoint, options) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      return this.mockResponse()  // Mock 데이터 반환
    }
    return httpClient.request(endpoint, options)  // 실제 API 호출
  }
}
```

### 12개 API 클라이언트

| 클라이언트 | 담당 | Mock 데이터 |
|-----------|------|-------------|
| authApiClient | 로그인/회원가입/Kakao OAuth | - |
| medicationApiClient | 약 CRUD | mockMedications.js |
| familyApiClient | 가족 관리 | mockFamily.js |
| dietApiClient | 식단 관리 | mockDiet.js |
| diseaseApiClient | 질병 관리 | mockDiseases.js |
| searchApiClient | 약/증상 검색 | mockSearchResults.js |
| ocrApiClient | 처방전 OCR | mockOcr.js |
| chatApiClient | 채팅 | mockChats.js |
| counselApiClient | 상담 예약 | - |
| reportApiClient | 순응도 리포트 | mockReports.js |
| notificationApiClient | 알림 | mockNotifications.js |
| httpClient | Axios 래퍼 | - |

---

## 🔄 상태 관리

### Zustand Stores (3개)

```javascript
// authStore.js - 인증 상태
useAuthStore
  - State: user, token, isAuthenticated, role
  - Actions: login(), signup(), logout(), selectRole()
  - Persist: localStorage

// medicationStore.js - 약 상태
useMedicationStore
  - State: medications[], isLoading, error
  - Actions: fetchMedications(), addMedication(), updateMedication(), deleteMedication()

// familyStore.js - 가족 상태
useFamilyStore
  - State: familyGroup, members[], invitations[], initialized
  - Actions: initialize(), addMember(), inviteMember(), updateMember()
```

### Context API

```javascript
// FamilyContext.jsx - 가족 데이터 제공
FamilyProvider
  - App.jsx에서 전체 앱을 래핑
  - 모든 라우트에 가족 데이터 제공
  - 마운트 시 자동 fetch
```

---

## 🎨 스타일링

### 스타일 구조
- **Tailwind CSS**: 유틸리티 클래스 (레이아웃, 여백, 색상)
- **CSS Modules**: 컴포넌트별 스타일 (`*.module.css`)
- **전역 스타일**: `base.css`

### 디자인 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| Primary | `#2563eb` | 주요 액션 |
| Senior | `#f9a8d4` | 시니어 테마 |
| Caregiver | `#a5b4fc` | 보호자 테마 |
| Warning | `#f97316` | 경고 |
| Danger | `#ef4444` | 위험 |
| Success | `#22c55e` | 성공 |

---

## 📝 네이밍 컨벤션

### 파일 네이밍
- **컴포넌트**: PascalCase + `.jsx` (UserProfile.jsx)
- **훅**: camelCase + `use` 접두사 + `.js` (useAuth.js)
- **스토어**: camelCase + `Store` 접미사 + `.js` (authStore.js)
- **서비스**: camelCase + `Service` 접미사 + `.js` (familyService.js)
- **유틸리티**: camelCase + `.js` (formatting.js)
- **스타일**: 컴포넌트명 + `.module.css` (Button.module.css)

### 변수/함수 네이밍
- **컴포넌트**: PascalCase (MedicationCard)
- **함수/변수**: camelCase (getUserData, userName)
- **상수**: UPPER_SNAKE_CASE (API_BASE_URL)
- **이벤트 핸들러**: `handle` 접두사 (handleClick)
- **Boolean**: `is/has` 접두사 (isLoading, hasError)

---

## 🚀 환경 변수

```bash
# .env 파일
VITE_API_BASE_URL=http://localhost:8080     # API 서버
VITE_WS_BASE_URL=ws://localhost:8080/ws     # WebSocket 서버
VITE_KAKAO_CLIENT_ID=your_kakao_client_id   # 카카오 OAuth
VITE_USE_MOCK_API=true                       # Mock 모드 토글
VITE_DEBUG=false                             # 디버그 모드
```

---

**Version**: 2.0
**Last Updated**: 2025-11-22
**Author**: AMA...Pill Development Team
