# SilverCare Frontend

SilverCare는 노인 부모와 성인 자식을 위한 약 관리 플랫폼입니다. 이 리포지토리는 SilverCare의 React 19 기반 프론트엔드 입니다.

## 📋 개요

- **기술 스택**: React 19, Vite, Zustand, React Router, Tailwind CSS, CSS Modules
- **상태 관리**: Zustand (전역 상태), React Hooks (로컬 상태)
- **스타일링**: CSS Modules + Tailwind CSS
- **HTTP 클라이언트**: Axios (인터셉터 포함)
- **빌드 도구**: Vite 5.0+

## 🚀 빠른 시작

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 미리보기

```bash
npm run preview
```

### 코드 린트

```bash
npm run lint
```

## 📁 프로젝트 구조

```
src/
├── shared/
│   └── components/      # 재사용 UI (ui/, layout/, editor/)
├── pages/               # 페이지 컴포넌트
│   └── errors/          # 에러 페이지 (404, 500)
├── hooks/               # Custom Hooks (공통)
│   ├── useAuth.js       # 인증 관리
│   ├── useDebounce.js   # 디바운싱
│   ├── useLocalStorage.js # 로컬 스토리지
│   └── useFetch.js      # API 호출
├── stores/              # Zustand 저장소
│   ├── authStore.js     # 인증 상태 관리
│   ├── familyStore.js   # 가족 관리 상태
│   └── medicationStore.js # 약 목록/CRUD
├── core/
│   └── api/
│       └── axiosConfig.js # Axios 인스턴스 & 인터셉터
├── utils/               # 유틸리티 함수
│   ├── validation.js    # 데이터 검증
│   ├── formatting.js    # 데이터 형식 변환
│   ├── stringUtils.js   # 문자열 처리
│   └── errorHandler.js  # 에러 처리
├── config/
│   └── constants.js     # 전역 상수
├── devtools/            # 개발 모드 도구
│   └── DeveloperModePanel.jsx
├── features/            # Feature 모듈 (auth, family, editor 등)
├── styles/              # 전역 스타일 (tailwind.css + base.scss)
├── App.jsx              # 메인 앱 컴포넌트
└── main.jsx             # 엔트리 포인트
```

## 🎨 스타일 가이드

- `tailwind.config.js` : Design System 색상/폰트/라운딩 토큰 정의
- `src/styles/tailwind.css` : `@tailwind base/components/utilities` 선언
- `src/styles/base.scss` : 최소한의 reset + root 변수 정의
- 컴포넌트 스타일은 `.module.scss`에서 작성하며, 반복되는 여백/색상은 Tailwind utility를 조합해 사용합니다.

## 🔧 주요 기능

### Custom Hooks
- **useAuth**: 인증 상태 관리
- **useDebounce**: 값 변경 지연 (검색, 필터링 등)
- **useLocalStorage**: 로컬 스토리지 동기화
- **useFetch**: API 호출 처리 (로딩, 에러, 데이터)

### Zustand Store
- **authStore**: 사용자 인증 정보 관리

### 공용 컴포넌트
- **Button**: 다양한 스타일의 버튼 (primary, secondary, danger, ghost)
- **Input**: 텍스트 입력 필드 (에러, 라벨, 힌트 지원)
- **Card**: 콘텐츠 컨테이너 (CardHeader, CardBody, CardFooter)

## 🌍 환경 변수 설정

`.env` 파일을 생성하고 `.env.template`을 참고하여 다음을 설정합니다:

```bash
cp .env.template .env
```

필수 환경 변수:
- `VITE_API_BASE_URL`: API 서버 주소 (기본값: http://localhost:8080)
- `VITE_WS_BASE_URL`: WebSocket 서버 주소
- `VITE_KAKAO_CLIENT_ID`: 카카오 OAuth 클라이언트 ID

## 📝 Git 워크플로우

### 브랜치 전략
- `main`: 프로덕션 배포
- `develop`: 개발 통합 브랜치
- `feature/*`: 새로운 기능 개발
- `bugfix/*`: 버그 수정

### 커밋 규칙

Conventional Commits 형식을 사용합니다:

```
emoji Type: brief description

✨ Feat: 새로운 기능
🐛 Fix: 버그 수정
📝 Docs: 문서 업데이트
💬 Style: 코드 스타일 수정
♻️ Refactor: 코드 리팩토링
🧪 Test: 테스트 코드
🚀 Deploy: 배포 관련
```

**예시**: `✨ Feat: 사용자 로그인 기능 추가`

### 브랜치 명명규칙

```
type/issue#-description-developer

feature/#10-user-login-junsu
bugfix/#15-auth-error-seohee
```

## 🎨 코딩 컨벤션

### 네이밍
- **Component**: PascalCase (`UserProfile.jsx`)
- **function/variable**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Hook**: `use` 접두사 (`useAuth`)
- **Event handler**: `handle` 접두사 (`handleClick`)

### 폴더/파일
- **폴더명**: lowercase (`components`, `hooks`)
- **파일명**: PascalCase (컴포넌트), camelCase (모듈)

## 🔗 연관 리포지토리

- [SilverCare Backend](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/Back) - Spring Boot 백엔드
- [SilverCare .github](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github) - 문서 및 설계

## 📧 문의

팀3 개발자에게 연락주세요.

---

마지막 업데이트: 2025년 11월 8일
