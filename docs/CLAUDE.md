# CLAUDE.md - AI Agent Development Guide

> **Purpose**: Claude Code 및 MCP Agent를 위한 개발 컨텍스트 제공
> **Target**: AI 코드 생성, 디버깅, 아키텍처 결정 지원

## 📋 목차

1. [Quick Reference](#-quick-reference)
2. [Project Overview](#-project-overview)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Key Commands](#key-commands)
6. [Code Style](#code-style)
7. [Development Guidelines](#development-guidelines)
8. [Environment Variables](#environment-variables)
9. [Related Documentation](#-related-documentation)
10. [Do Not](#do-not)

---

## 📌 Quick Reference

| 항목 | 내용 |
|------|------|
| **프로젝트** | AMA...Pill - 가족 중심 약 관리 플랫폼 |
| **팀** | 3명 개발자 |
| **타임라인** | 2025년 11월 ~ 12월 |
| **주요 기능** | 가족 케어 네트워크, 약-음식 경고, OCR 처방전, 알약 검색 |
| **개발 서버** | `npm run dev` → http://localhost:5173 |

---

## 🎯 Project Overview

**"약 먹을 시간이에요?"** - 노인 부모와 성인 자녀를 위한 가족 중심 약 관리 플랫폼

### 주요 기능
1. **가족 케어 네트워크** - 시니어와 보호자 간 실시간 동기화
2. **약-음식 상호작용 경고** - 복용 중인 약과 음식 조합 안전 경고
3. **OCR 처방전 등록** - 이미지 인식을 통한 자동 약 정보 입력
4. **알약 역검색** - 모양/색상으로 약 식별
5. **복약 순응도 리포트** - 복약 이행률 추적 및 통계

## Tech Stack

| 분류 | 기술 |
|------|------|
| **Framework** | React 19 |
| **Build Tool** | Vite 5.0+ |
| **Language** | JavaScript (ES Modules) |
| **State Management** | Zustand (전역), React Hooks (로컬) |
| **HTTP Client** | Axios with Interceptors |
| **Styling** | Tailwind CSS + SCSS Modules |
| **Routing** | React Router DOM |
| **Real-time** | Hocuspocus + Y.js |
| **Form** | React Hook Form + Zod |

## Project Structure

```
src/
├── App.jsx                          # 메인 라우팅 (40+ 라우트)
├── main.jsx                         # 엔트리 포인트
│
├── core/                            # 핵심 인프라
│   ├── config/
│   │   ├── constants.js             # Enum, 역할, 상태, 스토리지 키
│   │   ├── routes.config.js         # 라우트 경로 정의
│   │   ├── api.config.js            # API 기본 URL
│   │   └── environment.config.js    # 환경변수 설정
│   │
│   ├── services/api/                # API 클라이언트 (12개)
│   │   ├── ApiClient.js             # 추상 클래스 (Mock 지원)
│   │   ├── httpClient.js            # Axios 래퍼
│   │   ├── authApiClient.js         # 로그인/회원가입/Kakao OAuth
│   │   ├── medicationApiClient.js
│   │   ├── familyApiClient.js
│   │   ├── chatApiClient.js
│   │   ├── dietApiClient.js
│   │   ├── diseaseApiClient.js
│   │   ├── searchApiClient.js
│   │   ├── ocrApiClient.js
│   │   ├── counselApiClient.js
│   │   ├── reportApiClient.js
│   │   └── notificationApiClient.js
│   │
│   ├── interceptors/
│   │   ├── authInterceptor.js       # Bearer 토큰 주입
│   │   └── errorInterceptor.js      # 전역 에러 처리
│   │
│   ├── routing/
│   │   ├── PrivateRoute.jsx         # 인증 필요 라우트 보호
│   │   └── navigation.js            # 프로그래매틱 네비게이션
│   │
│   └── utils/
│       ├── formatting.js            # 날짜/숫자/문자열 포매팅
│       ├── validation.js            # Zod 스키마
│       ├── errorHandler.js          # 에러 파싱
│       └── stringUtils.js           # 문자열 유틸리티
│
├── features/                        # 기능 모듈 (13개 도메인)
│   ├── auth/                        # 인증
│   │   ├── pages/                   # Login, Signup, RoleSelection, KakaoCallback
│   │   ├── components/              # KakaoLoginButton
│   │   ├── hooks/                   # useAuth
│   │   ├── store/                   # authStore (Zustand)
│   │   └── utils/                   # roleUtils
│   │
│   ├── dashboard/                   # 역할별 대시보드
│   │   ├── pages/                   # SeniorDashboard, CaregiverDashboard
│   │   └── components/              # MedicationCard, FamilyMemberCard
│   │
│   ├── medication/                  # 약 관리
│   │   ├── pages/                   # Management, Add, Edit
│   │   ├── components/              # Form, List, DetailModal, InventoryTracker
│   │   └── store/                   # medicationStore
│   │
│   ├── family/                      # 가족 관리
│   │   ├── pages/                   # Management, Invite, MemberDetail
│   │   ├── components/              # List, Card, Profile, InviteForm, AdherenceChart
│   │   ├── hooks/                   # useFamily, useFamilyMemberDetail, useFamilySync
│   │   ├── services/                # familyService, familySyncService
│   │   ├── context/                 # FamilyContext (Provider)
│   │   └── store/                   # familyStore
│   │
│   ├── diet/                        # 식단 관리
│   │   ├── pages/                   # DietLogPage, FoodWarning
│   │   └── components/              # MealInputForm, MealHistory, FoodConflictWarning
│   │
│   ├── disease/                     # 질병 관리
│   │   └── pages/                   # Disease, DetailPage, SuspectedDiseasePage
│   │
│   ├── search/                      # 검색
│   │   ├── pages/                   # SymptomSearch, PillSearchPage, PillResultPage
│   │   └── components/
│   │
│   ├── ocr/                         # 처방전 스캔
│   │   ├── pages/                   # PrescriptionScan
│   │   └── components/              # OCRControlPanel, OCRResultPreview
│   │
│   ├── chat/                        # 채팅
│   │   ├── pages/                   # DoctorChatListPage, ChatConversationPage
│   │   └── components/              # ChatMessage, ChatInput, ChatRoomCard
│   │
│   ├── counsel/                     # 상담
│   │   └── pages/                   # DoctorCounsel
│   │
│   ├── notification/                # 알림
│   │   ├── pages/                   # NotificationList
│   │   └── store/                   # notificationStore
│   │
│   ├── report/                      # 리포트
│   │   └── pages/                   # AdherenceReportPage, WeeklyStatsPage
│   │
│   └── settings/                    # 설정
│       ├── pages/                   # Settings, ProfileEdit, NotificationSettings
│       └── components/              # SettingsMenu, ProfileSection
│
├── shared/                          # 공유 컴포넌트
│   └── components/
│       ├── ErrorBoundary.jsx        # 에러 경계
│       ├── ErrorFallback.jsx        # 에러 폴백 UI
│       ├── layout/
│       │   ├── MainLayout.jsx       # 앱 레이아웃
│       │   ├── Header.jsx           # 상단 네비게이션
│       │   └── BottomNavigation.jsx # 하단 네비게이션 (4개 탭)
│       ├── ui/                      # 기본 UI 컴포넌트
│       │   ├── Button.jsx           # 버튼 (variants, sizes)
│       │   ├── Card.jsx             # 카드 컨테이너
│       │   ├── Input.jsx            # 폼 입력
│       │   ├── Modal.jsx            # 모달 다이얼로그
│       │   ├── Icon.jsx             # SVG 아이콘
│       │   ├── BackButton.jsx       # 뒤로가기 버튼
│       │   ├── FAB.jsx              # Floating Action Button
│       │   ├── MenuGroup.jsx        # 메뉴 그룹
│       │   ├── QuickActions.jsx     # 빠른 액션
│       │   └── Tabs.jsx             # 탭 컴포넌트
│       └── toast/                   # 토스트 알림
│           ├── Toast.jsx
│           ├── ToastContainer.jsx
│           └── toastStore.js
│
├── hooks/                           # 전역 커스텀 훅
│   ├── useDebounce.js               # 디바운스 (검색 지연)
│   ├── useFetch.js                  # 데이터 페칭
│   └── useLocalStorage.js           # localStorage 동기화
│
├── pages/                           # 공통 페이지
│   ├── errors/                      # NotFound, ServerError
│   └── more/                        # MorePage
│
├── data/                            # Mock 데이터 (13개 파일)
│   ├── mockMedications.js
│   ├── mockFamily.js
│   ├── mockDiet.js
│   ├── mockDiseases.js
│   ├── mockSymptoms.js
│   ├── mockNotifications.js
│   ├── mockFoodWarnings.js
│   ├── mockChats.js
│   ├── mockChat.js
│   ├── mockPillDetails.js
│   ├── mockReports.js
│   ├── mockSearchResults.js
│   └── mockOcr.js
│
├── devtools/                        # 개발자 도구
│   ├── DeveloperModePanel.jsx
│   └── editor/components/
│
├── assets/                          # 정적 자원
└── styles/                          # 전역 스타일
    ├── base.scss
    └── tailwind.css
```

## Key Commands

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (http://localhost:5173)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 미리보기
npm run lint         # ESLint 실행
```

## Code Style

### 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| **컴포넌트 파일** | PascalCase + `.jsx` | `UserProfile.jsx` |
| **함수/변수** | camelCase | `getUserData`, `userName` |
| **상수** | UPPER_SNAKE_CASE | `API_BASE_URL` |
| **Custom Hook** | `use` 접두사 | `useAuth()` |
| **이벤트 핸들러** | `handle` 접두사 | `handleClick()` |
| **Boolean** | `is/has` 접두사 | `isLoading`, `hasError` |
| **스토어** | camelCase + `Store` | `authStore.js` |
| **서비스** | camelCase + `Service` | `familyService.js` |

### 코드 예시

**JavaScript**:
```javascript
const handleSubmit = (event) => {
  event.preventDefault()
  const userData = {
    name: event.target.name.value,
    email: event.target.email.value,
  }
  submitForm(userData)
}
```

**JSX**:
```jsx
export const UserProfile = ({ user, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Card>
      <CardHeader title={user.name} />
      <CardBody>
        <p>Email: {user.email}</p>
      </CardBody>
    </Card>
  )
}
```

## Development Guidelines

### Git Workflow

- **브랜치 전략**: `main` ← `develop` ← `feature/#이슈-설명-개발자`
- **브랜치 네이밍**: `feature/#10-user-login-junsu` 또는 `bugfix/#15-auth-error-seohee`
- **커밋 규칙**: `emoji Type: description` (50자 이내)
  - ✨ Feat: 새로운 기능
  - 🐛 Fix: 버그 수정
  - 📝 Docs: 문서 업데이트
  - ♻️ Refactor: 코드 리팩토링
  - 🧪 Test: 테스트 코드

### 구현 현황

#### 완료
- React 19 + Vite + Tailwind CSS 설정
- React Router (40+ 라우트)
- Zustand stores (auth, medication, family)
- Axios with interceptors
- MainLayout, Header, BottomNavigation
- UI 컴포넌트 (Button, Card, Input, Modal, Icon, FAB, Tabs 등)
- 인증 (Login, Signup, RoleSelection, KakaoCallback)
- 대시보드 (SeniorDashboard, CaregiverDashboard)
- 약 관리 UI (CRUD)
- 가족 관리 UI (목록, 초대, 상세)
- 설정 페이지

#### 진행 중
- 실제 API 연동
- WebSocket 실시간 동기화
- OCR 처방전 스캔

## Environment Variables

`.env` 파일 필수 설정:

```bash
VITE_API_BASE_URL=http://localhost:8080     # API 서버 주소
VITE_WS_BASE_URL=ws://localhost:8080/ws     # WebSocket 서버 주소
VITE_KAKAO_CLIENT_ID=your_kakao_client_id   # 카카오 OAuth 클라이언트 ID
VITE_USE_MOCK_API=true                       # Mock/Real API 토글
VITE_DEBUG=false                             # 디버그 모드
VITE_NOTIFICATION_TIMEOUT=5000              # 알림 지속 시간 (ms)
VITE_ITEMS_PER_PAGE=10                       # 페이지네이션 기본값
VITE_MAX_FILE_SIZE=5242880                   # 최대 파일 크기 (5MB)
```

### Mock API 토글

```bash
VITE_USE_MOCK_API=true   # Mock 데이터 사용 (백엔드 없이 개발)
VITE_USE_MOCK_API=false  # 실제 API 사용 (백엔드 필요)
```

## 상태 관리

### Zustand Stores

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
  - App.jsx에서 전체 앱 래핑
  - 모든 라우트에 가족 데이터 제공
  - 마운트 시 자동 fetch
```

## 📚 Related Documentation

### 로컬 문서
- **[README.md](../README.md)** - 프로젝트 개요
- **[QUICKSTART.md](../QUICKSTART.md)** - 빠른 시작 가이드
- **[SRC_STRUCTURE.md](./SRC_STRUCTURE.md)** - 디렉토리 구조
- **[FRONTEND_COMPONENTS_SPECIFICATION.md](./FRONTEND_COMPONENTS_SPECIFICATION.md)** - 컴포넌트 명세
- **[CHAT_API_SPECIFICATION.md](./CHAT_API_SPECIFICATION.md)** - WebSocket API
- **[OCR_API_SPECIFICATION.md](./OCR_API_SPECIFICATION.md)** - OCR API

### 외부 링크
- **[Backend Repository](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/Back)** - Spring Boot 백엔드
- **[.github Repository](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github)** - 조직 전체 문서

## Do Not

### 보안 & 모범 사례
- ❌ `.env` 파일을 git에 커밋하지 마세요 (`.env.template` 사용)
- ❌ API 키나 비밀값을 코드에 하드코딩하지 마세요
- ❌ 입력 검증을 건너뛰지 마세요 (`validation.js`의 Zod 스키마 사용)
- ❌ 에러 메시지에 민감한 사용자 데이터를 노출하지 마세요

### 아키텍처 & 패턴
- ❌ React Native를 사용하지 마세요 (웹 전용 프로젝트)
- ❌ 전역 상태에 Context API를 사용하지 마세요 (Zustand 사용)
- ❌ `ApiClient` 추상 클래스를 상속하지 않고 새 API 클라이언트를 만들지 마세요
- ❌ Mock API 아키텍처를 우회하지 마세요

### 코드 품질
- ❌ `var`를 사용하지 마세요 (`const`/`let` 사용)
- ❌ 상태를 직접 변경하지 마세요 (Zustand `set()` 사용)
- ❌ 인라인 스타일을 사용하지 마세요 (Tailwind 또는 SCSS 모듈 사용)

### 파일 구조
- ❌ 진정으로 전역적인 경우가 아니면 feature 디렉토리 외부에 파일을 만들지 마세요
- ❌ feature 특화 코드를 `/shared` 디렉토리에 넣지 마세요
- ❌ 중복 유틸리티 함수를 만들지 마세요 (`/core/utils` 먼저 확인)

### Git 워크플로우
- ❌ `main` 또는 `develop` 브랜치에 직접 커밋하지 마세요
- ❌ 커밋 메시지에서 이모지를 생략하지 마세요
- ❌ 이슈 번호 없이 브랜치를 만들지 마세요
- ❌ `npm run lint` 실행 없이 푸시하지 마세요

## AI 개발 팁

### 새 기능 추가 시
1. `/shared/components/ui`에 유사한 컴포넌트가 있는지 확인
2. 기존 API 클라이언트 패턴 사용 (`ApiClient` 상속)
3. `/src/data/mock*.js`에 테스트용 Mock 데이터 추가
4. 네이밍 컨벤션 준수

### 디버깅 시
1. 브라우저 콘솔에서 React 에러 확인
2. `VITE_USE_MOCK_API` 환경변수 설정 확인
3. localStorage에 auth 토큰 존재 여부 확인
4. `src/core/interceptors/errorInterceptor.js`에서 API 에러 확인

### 파일 참조 형식
코드 변경 제안 시 다음 형식 사용:
- `src/features/auth/pages/Login.jsx:42` - Login 컴포넌트, 42번째 줄
- `src/core/services/api/authApiClient.js:15` - Auth 클라이언트, 15번째 줄

---

**Last Updated**: 2025-11-22
