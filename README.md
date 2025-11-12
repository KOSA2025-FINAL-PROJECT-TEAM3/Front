# AMA...Pill Frontend

> **"Is it time to take medicine?"** - 노인 부모와 성인 자식을 위한 가족 중심 약 관리 플랫폼

React 19 기반 프론트엔드 애플리케이션입니다.

---

## 🤖 AI Agent Quick Reference

> Claude Code, Cursor, Windsurf 등 MCP Agent를 위한 핵심 정보

| 항목 | 정보 |
|------|------|
| **프로젝트명** | AMA...Pill Frontend |
| **기술 스택** | React 19 + Vite + Zustand + React Router + Tailwind CSS |
| **개발 서버** | `npm run dev` → http://localhost:5173 |
| **브랜치 전략** | `main` ← `develop` ← `feature/#이슈-설명-개발자` |
| **커밋 규칙** | `emoji Type: description` (예: `✨ Feat: Add login`) |
| **문서 위치** | [`docs/`](./docs/) 폴더 참조 |

### 주요 명령어
```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (http://localhost:5173)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 실행
```

### AI Agent를 위한 문서 가이드
프론트엔드 개발 시 아래 문서를 **순서대로** 참조하세요:

1. **[docs/CLAUDE.md](./docs/CLAUDE.md)** - AI Agent 전용 개발 가이드 (프로젝트 개요, 규칙, Do's and Don'ts)
2. **[docs/CONVENTIONS.md](./docs/CONVENTIONS.md)** - Git & 코드 컨벤션 (브랜치, 커밋, 네이밍)
3. **[docs/SRC_STRUCTURE.md](./docs/SRC_STRUCTURE.md)** - 소스 코드 구조 및 아키텍처
4. **[docs/FRONTEND_COMPONENTS_SPECIFICATION.md](./docs/FRONTEND_COMPONENTS_SPECIFICATION.md)** - 34개 화면 컴포넌트 명세
5. **[docs/CHAT_API_SPECIFICATION.md](./docs/CHAT_API_SPECIFICATION.md)** - WebSocket 실시간 통신 API
6. **[docs/OCR_API_SPECIFICATION.md](./docs/OCR_API_SPECIFICATION.md)** - OCR 처방전 인식 API
7. **[docs/PROJECT_SPECIFICATION.md](./docs/PROJECT_SPECIFICATION.md)** - 전체 요구사항 명세

### 외부 문서 참조 (.github 저장소)
프로젝트 전체 문서는 [.github Repository](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/tree/dev)에서 확인:

- **UI/UX 설계**
  - [`WIREFRAME_SCREENS.md`](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/blob/dev/WIREFRAME_SCREENS.md) - 10개 주요 화면 와이어프레임
  - [`FIGMA_GUIDE.md`](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/blob/dev/FIGMA_GUIDE.md) - Figma 플러그인 설치 가이드

- **백엔드 연동**
  - [`MVP_DTO_SPECIFICATION.md`](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/blob/dev/documents/MVP_DTO_SPECIFICATION.md) - API 엔드포인트 & DTO 명세
  - [`DB스킬.md`](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/blob/dev/DB스킬.md) - 데이터베이스 스키마 & ERD
  - [Backend Repository](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/Back) - Spring Boot 백엔드 코드

- **보안 & 표준**
  - [`SECURITY_GUIDELINES.md`](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/blob/dev/SECURITY_GUIDELINES.md) - KISA 보안 가이드라인

---

## 🚀 Quick Start

### 1. 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.template .env
```

필수 환경 변수:
- `VITE_API_BASE_URL`: API 서버 주소 (기본: http://localhost:8080)
- `VITE_WS_BASE_URL`: WebSocket 서버 주소 (기본: ws://localhost:8080/ws)
- `VITE_KAKAO_CLIENT_ID`: 카카오 OAuth 클라이언트 ID

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 http://localhost:5173 접속

상세한 설정은 **[QUICKSTART.md](./QUICKSTART.md)** 참조

---

## 📋 프로젝트 개요

### 주요 기능
1. **가족 케어 네트워크** - 노인과 보호자 간 실시간 약 복용 현황 동기화
2. **약-음식 상호작용 경고** - 복용 중인 약과 음식의 부작용 알림
3. **OCR 처방전 등록** - 이미지 인식을 통한 자동 약 정보 입력
4. **알약 역검색** - 모양/색상으로 약 식별
5. **복약 순응도 리포트** - 복약 이행률 추적 및 통계

### 기술 스택
| 분류 | 기술 |
|------|------|
| **프레임워크** | React 19 |
| **빌드 도구** | Vite 5.0+ |
| **언어** | JavaScript (ES Modules) |
| **상태 관리** | Zustand (전역), React Hooks (로컬) |
| **HTTP 클라이언트** | Axios (Interceptor 적용) |
| **스타일링** | Tailwind CSS + CSS Modules |
| **라우팅** | React Router |
| **실시간 통신** | WebSocket (Hocuspocus + TipTap) |

---

## 📁 프로젝트 구조

```
/
├── src/
│   ├── core/                # 핵심 설정
│   │   ├── config/          # routes.config.js, constants.js
│   │   ├── services/        # API 클라이언트, WebSocket 서비스
│   │   └── utils/           # 공용 유틸리티 (validation, formatting)
│   ├── features/            # 기능 단위 모듈
│   │   ├── auth/            # 인증 (Kakao OAuth)
│   │   ├── family/          # 가족 관리
│   │   ├── medication/      # 복약 관리
│   │   ├── diet/            # 식단 관리
│   │   ├── disease/         # 질병 관리
│   │   ├── search/          # 약 검색
│   │   └── settings/        # 설정
│   ├── shared/              # 공용 컴포넌트
│   │   └── components/
│   │       ├── ui/          # Button, Input, Card, Modal
│   │       ├── layout/      # Header, Sidebar, MainLayout
│   │       └── editor/      # TipTap 에디터
│   ├── hooks/               # 공용 Custom Hooks
│   ├── pages/               # 공통 페이지 (에러 페이지 등)
│   ├── styles/              # 전역 스타일 (Tailwind, SCSS)
│   ├── App.jsx              # 루트 컴포넌트
│   └── main.jsx             # 엔트리 포인트
├── docs/                    # 프로젝트 문서
├── README.md                # 이 파일
└── QUICKSTART.md            # 빠른 시작 가이드
```

상세 구조는 **[docs/SRC_STRUCTURE.md](./docs/SRC_STRUCTURE.md)** 참조

---

## 🎨 개발 가이드

### Git 워크플로우

#### 브랜치 전략
```
main (프로덕션) ← develop (통합) ← feature/#이슈-설명-개발자
                              ↑
                           bugfix/#이슈-설명-개발자
```

#### 브랜치 명명 규칙
```
feature/#10-user-login-junsu
bugfix/#15-auth-error-seohee
```

#### 커밋 메시지 규칙
```
emoji Type: description (50자 이내)

✨ Feat: 새로운 기능
🐛 Fix: 버그 수정
📝 Docs: 문서 업데이트
💬 Style: 코드 스타일 수정
♻️ Refactor: 코드 리팩토링
🧪 Test: 테스트 코드
```

**예시**: `✨ Feat: Add Kakao OAuth login`

상세 규칙은 **[docs/CONVENTIONS.md](./docs/CONVENTIONS.md)** 참조

---

### 코딩 컨벤션

#### 네이밍 규칙
| 대상 | 규칙 | 예시 |
|------|------|------|
| **컴포넌트 파일** | PascalCase | `UserProfile.jsx` |
| **함수/변수** | camelCase | `getUserData`, `userName` |
| **상수** | UPPER_SNAKE_CASE | `API_BASE_URL` |
| **Custom Hook** | `use` 접두사 | `useAuth()` |
| **이벤트 핸들러** | `handle` 접두사 | `handleClick()` |
| **Boolean** | `is/has` 접두사 | `isLoading`, `hasError` |
| **폴더명** | lowercase | `components`, `hooks` |

#### 코드 예시

**✅ Good**:
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

**❌ Bad**:
```javascript
const handlesubmit=(e)=>{var data={name:e.target.name.value}}
```

---

### 스타일링 가이드

- **Tailwind CSS**: 레이아웃, 여백, 색상 등 공통 스타일
- **CSS Modules**: 컴포넌트별 상세 스타일 (`.module.scss`)
- **Design System**: `tailwind.config.js`에 색상/폰트 토큰 정의

```scss
// Button.module.scss
.button {
  @apply px-4 py-2 rounded-lg transition-colors;

  &.primary {
    @apply bg-blue-500 text-white hover:bg-blue-600;
  }
}
```

---

## 🔧 주요 기능

### Custom Hooks
- **`useAuth()`**: 사용자 인증 상태 관리
- **`useDebounce(value, delay)`**: 검색/필터링 시 값 변경 지연
- **`useLocalStorage(key, initialValue)`**: 로컬 스토리지 동기화
- **`useFetch(url, options)`**: API 호출 (로딩/에러/데이터 관리)

### Zustand Store
- `src/features/auth/store/authStore.js`: 인증 정보
- `src/features/family/store/familyStore.js`: 가족 구성원/초대
- `src/features/medication/store/medicationStore.js`: 복약 목록 CRUD

### 공용 컴포넌트
- **`<Button>`**: primary, secondary, danger, ghost 스타일
- **`<Input>`**: 텍스트 입력 (에러/라벨/힌트 지원)
- **`<Card>`**: 콘텐츠 컨테이너 (Header, Body, Footer)
- **`<Modal>`**: 모달 다이얼로그

---

## 🔗 연관 리포지토리

- [**Backend (Spring Boot)**](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/Back) - API 서버
- [**.github (Organization Docs)**](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github) - 프로젝트 전체 문서 및 설계

---

## 📚 추가 문서

| 문서 | 설명 |
|------|------|
| [QUICKSTART.md](./QUICKSTART.md) | 5분 안에 프로젝트 시작하기 |
| [docs/CLAUDE.md](./docs/CLAUDE.md) | AI Agent 개발 가이드 |
| [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) | Git & 코드 컨벤션 |
| [docs/SRC_STRUCTURE.md](./docs/SRC_STRUCTURE.md) | 소스 코드 구조 |
| [docs/FRONTEND_COMPONENTS_SPECIFICATION.md](./docs/FRONTEND_COMPONENTS_SPECIFICATION.md) | 컴포넌트 명세 (34 screens) |
| [docs/PROJECT_SPECIFICATION.md](./docs/PROJECT_SPECIFICATION.md) | 프로젝트 요구사항 |
| [docs/CHAT_API_SPECIFICATION.md](./docs/CHAT_API_SPECIFICATION.md) | WebSocket API |
| [docs/OCR_API_SPECIFICATION.md](./docs/OCR_API_SPECIFICATION.md) | OCR API |

---

## 📧 Contact

팀3 개발자에게 연락주세요.

---

**Last Updated**: 2025-11-12
