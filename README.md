# AMApill (뭐냑?) Frontend

> **"약 먹을 시간이에요?"** - 노인 부모와 성인 자녀를 위한 가족 중심 약 관리 플랫폼

React 19 + Vite + MUI 기반 프론트엔드 애플리케이션입니다.

---

## Quick Reference 

| 항목 | 정보 |
|------|------|
| **프로젝트명** | AMApill (뭐냑?) Frontend |
| **기술 스택** | React 19 + Vite 5 + MUI 7 + Zustand |
| **개발 서버** | `npm run dev` → http://localhost:5173 |
| **API Gateway** | http://localhost:8080 (Nginx 프록시) |
| **브랜치 전략** | `main` ← `develop` ← `feature/#이슈-설명` |
| **커밋 규칙** | `emoji Type: description` |

### 주요 명령어

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (http://localhost:5173)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 실행
npm run test:e2e     # Playwright E2E 테스트
```

---

## Quick Start

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.template .env
```

**필수 환경 변수:**

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `VITE_API_BASE_URL` | API Gateway 주소 | `http://localhost:8080` |
| `VITE_USE_NGINX` | Nginx 프록시 사용 여부 | `false` |
| `VITE_KAKAO_CLIENT_ID` | 카카오 OAuth 클라이언트 ID | - |

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

> 배포 및 Nginx 설정은 **[DEPLOYMENT.md](./DEPLOYMENT.md)** 참조

---

## 프로젝트 개요

### 주요 기능

| 기능 | 설명 |
|------|------|
| **가족 케어 네트워크** | 시니어와 보호자 간 실시간 약 복용 현황 동기화 |
| **약-음식 상호작용 경고** | 복용 약과 음식의 부작용 알림 |
| **AI 증상 검색** | AI 기반 증상 분석 및 질병 추천 |
| **OCR 처방전 등록** | 이미지 인식을 통한 자동 약 정보 입력 |
| **알약 역검색** | 모양/색상으로 약 식별 |
| **복약 순응도 리포트** | 복약 이행률 추적 및 통계 |
| **병원 예약 관리** | 진료 예약 알림 및 관리 |

### 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| **프레임워크** | React | 19.1 |
| **빌드 도구** | Vite | 5.4 |
| **UI 라이브러리** | MUI (Material UI) | 7.3 |
| **상태 관리** | Zustand | 4.4 |
| **HTTP 클라이언트** | Axios | 1.6 |
| **라우팅** | React Router DOM | 6.20 |
| **폼 관리** | React Hook Form + Zod | 7.48 / 3.22 |
| **데이터 페칭** | TanStack React Query | 5.90 |
| **날짜 처리** | date-fns | 2.30 |
| **E2E 테스트** | Playwright | 1.57 |

---

## 프로젝트 구조

```
Front/
├── src/
│   ├── core/                  # 핵심 설정
│   │   ├── config/            # 라우트, 환경설정, API 설정
│   │   ├── services/api/      # API 클라이언트
│   │   ├── interceptors/      # HTTP 인터셉터
│   │   ├── routing/           # PrivateRoute, 네비게이션
│   │   └── utils/             # 공용 유틸리티
│   │
│   ├── features/              # 기능 모듈 (15개)
│   │   ├── auth/              # 인증 (Kakao OAuth)
│   │   ├── dashboard/         # 대시보드 (Senior/Caregiver)
│   │   ├── medication/        # 약/처방전 관리
│   │   ├── family/            # 가족 그룹/초대
│   │   ├── diet/              # 식단 관리
│   │   ├── disease/           # 질병 관리
│   │   ├── search/            # 약/증상 검색 (AI 포함)
│   │   ├── ocr/               # OCR 처방전 스캔
│   │   ├── chat/              # 가족 채팅
│   │   ├── notification/      # 알림
│   │   ├── appointment/       # 병원 예약
│   │   ├── places/            # 병원 검색
│   │   ├── report/            # 리포트
│   │   ├── settings/          # 설정
│   │   └── voice/             # 음성 인식
│   │
│   ├── shared/                # 공용 컴포넌트
│   │   └── components/
│   │       ├── ui/            # Button, Card, Modal, Icon 등
│   │       ├── layout/        # Header, MainLayout, FAB
│   │       └── feedback/      # Toast, Error 등
│   │
│   ├── hooks/                 # 공용 Custom Hooks
│   ├── styles/                # 전역 스타일, MUI Theme
│   ├── App.jsx                # 루트 컴포넌트 (라우트 정의)
│   └── main.jsx               # 엔트리 포인트
│
├── docs/                      # 프로젝트 문서
├── DEPLOYMENT.md              # 배포 가이드
├── TROUBLESHOOTING.md         # 문제 해결 가이드
└── README.md                  # 이 파일
```

---

## 개발 가이드

### 브랜치 전략

```
main (프로덕션)
 └─ develop (통합)
     ├─ feature/#이슈-설명
     └─ bugfix/#이슈-설명
```

### 커밋 메시지 규칙

```
emoji Type: description

✨ Feat: 새로운 기능
🐛 Fix: 버그 수정
📝 Docs: 문서 업데이트
♻️ Refactor: 코드 리팩토링
🔧 Chore: 빌드/설정 변경
✅ Test: 테스트 코드
```

**예시**: `✨ Feat: Add AI symptom search`

---

### 코딩 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| **컴포넌트 파일** | PascalCase | `UserProfile.jsx` |
| **함수/변수** | camelCase | `getUserData` |
| **상수** | UPPER_SNAKE_CASE | `API_BASE_URL` |
| **Custom Hook** | `use` 접두사 | `useAuth()` |
| **이벤트 핸들러** | `handle` 접두사 | `handleClick()` |
| **Boolean** | `is/has` 접두사 | `isLoading` |

### 스타일링 가이드

- **MUI (Material UI)**: 컴포넌트 라이브러리
- **sx prop**: 인라인 스타일링 (MUI 테마 토큰 사용)
- **Theme**: `src/styles/theme.js`에 색상/타이포그래피 정의

```jsx
// MUI sx prop 스타일링 예시
<Button
  variant="contained"
  sx={{ 
    px: 2, 
    py: 1, 
    bgcolor: 'primary.main',
    '&:hover': { bgcolor: 'primary.dark' }
  }}
>
  Submit
</Button>
```

> ⚠️ **하드코딩 금지**: 색상은 반드시 MUI 테마 토큰 사용 (`primary.main`, `text.secondary` 등)

---

## 주요 Store

| Store | 위치 | 역할 |
|-------|------|------|
| `authStore` | `features/auth/store/` | 사용자 인증 정보 |
| `familyStore` | `features/family/store/` | 가족 그룹/멤버 |
| `careTargetStore` | `features/family/store/` | 활성 시니어 선택 |
| `medicationStore` | `features/medication/store/` | 복약 목록 |
| `diseaseStore` | `features/disease/store/` | 질병 목록 |

---

## API 연동

### API Client 구조

```
src/core/services/api/
├── ApiClient.js           # 베이스 클래스
├── authApiClient.js       # 인증 API
├── medicationApiClient.js # 복약 API
├── familyApiClient.js     # 가족 API
├── dietApiClient.js       # 식단 API
├── diseaseApiClient.js    # 질병 API
├── searchApiClient.js     # 검색 API (AI 포함)
├── notificationApiClient.js # 알림 API
└── ...
```

### 환경별 API 경로

| 환경 | 경로 |
|------|------|
| **개발** | Vite 프록시 → `http://localhost:8080` |
| **프로덕션** | Nginx → Spring Cloud Gateway |

---

## 문서

| 문서 | 설명 |
|------|------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 배포 및 Nginx 설정 가이드 |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 문제 해결 가이드 |

---

## 연관 리포지토리

| 리포지토리 | 설명 |
|------------|------|
| [spring-boot](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/spring-boot) | Backend API 서버 (Spring Boot) |
| [auth-service](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/auth-service) | 인증 서비스 |
| [spring-cloud-api-gateway](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/spring-cloud-api-gateway) | API Gateway |
| [.github](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github) | 팀 문서 및 설계 |

---

**Last Updated**: 2025-12-21
