# Project Overview

**"Is it time to take medicine?"** - Family-centered medication management platform for elderly parents & adult children remote care.

- **Team**: 3 developers
- **Period**: Nov 5 - Dec 31, 2025 (~7 weeks dev)
- **Key Features**: Family care network, drug-food interaction alerts, OCR prescription auto-registration, pill reverse search, compliance reports

## Tech Stack
- Framework: React 19
- Build Tool: Vite 5.0+
- Language: JavaScript (ES modules)
- State Management: Zustand (global), React Hooks (local)
- HTTP Client: Axios with Interceptors
- Styling: CSS Modules + Tailwind CSS
- Routing: React Router
- Real-time: WebSocket (Hocuspocus + TipTap for collaborative editing)

## Project Structure
- `src/components`: UI components (Button, Input, Card, Modal)
  - `common/`: Base components
  - `layout/`: Layout components (Header, Sidebar, MainLayout)
- `src/pages`: Page components
- `src/features`: Feature modules (auth, medication, family, diet)
- `src/hooks`: Custom Hooks (useAuth, useFetch, useDebounce, useLocalStorage)
- `src/stores`: Zustand state management (authStore)
- `src/utils`: Utilities (validation, formatting, errorHandler)
- `src/config`: Configuration files (api.js, constants.js)
- `src/styles`: Global styles
- `src/App.jsx`: Root component
- `src/main.jsx`: Entry point

## Key Commands
- `npm install` - Install dependencies (first-time only)
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Production build
- `npm run preview` - Preview build locally
- `npm run lint` - Run ESLint

## Code Style
- Use ES modules (import/export)
- All new components must be function components with Hooks
- Prefer arrow functions for component definitions
- Use descriptive variable names (no single letters except loops)
- Add JSDoc comments for all exported functions and components

### Naming Convention
- **Components**: PascalCase (`UserProfile.jsx`)
- **Functions/Variables**: camelCase (`getUserData`, `userName`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Custom Hooks**: `use` prefix (`useAuth`)
- **Event Handlers**: `handle` prefix (`handleClick`)
- **Booleans**: `is/has` prefix (`isLoading`, `hasError`)

### Code Examples

**✅ Good JavaScript**:
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

**✅ Good JSX**:
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

**✅ Good Comments**:
```javascript
/**
 * Fetch user data by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User info
 * @throws {Error} If user not found
 */
export const getUserData = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`)
  return response.data
}
```

## Development Guidelines

### Git Workflow
- **Branch strategy**: main (production) ← develop (integration) ← feature/* (dev)
- **Branch naming**: `feature/#10-description-developer` or `bugfix/#15-description-developer`
- **Commit format**: `emoji Type: description` (max 50 chars)
  - ✨ Feat: New feature
  - 🐛 Fix: Bug fix
  - 📝 Docs: Documentation
  - ♻️ Refactor: Code refactor
  - 🧪 Test: Tests

### Development Stages (Frontend-first plan)
1. **Stage 1: Prototype Shell**
   - React/Vite setup, routing, base layout, Zustand scaffolding, Axios config
   - Goal: 빠르게 UI 골격 확보, 백엔드 없이도 페이지 이동·상태 흐름을 확인

2. **Stage 2: Auth & Dev Mode**
   - Kakao OAuth 버튼 + `/auth/kakao/callback` 처리, 이메일 로그인/회원가입, 역할 선택 흐름 확립
   - 백엔드가 없을 때를 대비해 **Developer Mode**(로컬 storage 토큰/더미 계정)로 화면 접근 가능하도록 구현  
     _(※ Dev Mode 가이드는 Stage가 올라갈 때마다 갱신되며, 백엔드가 완성되면 제거합니다.)_

3. **Stage 3: Family Prototype**
   - 가족 관리 페이지, 멤버 카드/초대/상세 UI, Dev Mode 데이터로 동작하는 리액트 쿼리 mock
   - 실시간 동기화 훅(`useFamilySync`)은 Hocuspocus 서버 준비 전까지 Mock Provider로 대체

4. **Stage 4: Feature Build-out**
   - 본 기능 개발(순서): 가족 실시간 네트워크 → 약-음식 경고 → OCR/역검색 → Medication CRUD
   - Backend API 준비되면 Dev Mode 토글 없이 실제 엔드포인트로 전환

## Environment Variables
Required (`.env` file):
- `VITE_API_BASE_URL`: API server (http://localhost:8080)
- `VITE_WS_BASE_URL`: WebSocket server (ws://localhost:8080/ws)
- `VITE_KAKAO_CLIENT_ID`: Kakao OAuth client ID

## References
- [CONVENTIONS.md](./CONVENTIONS.md) - Git & code conventions (detailed)
- [.github repo](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github) - Full project docs
  - QUICKSTART.md - Dev setup
  - SRC_STRUCTURE.md - Architecture
  - FRONTEND_COMPONENTS_SPECIFICATION.md - 34 screens
  - MVP_DTO_SPECIFICATION.md - API endpoints

## Do Not
- ❌ Use React Native (web-only)
- ❌ Commit `.env` to git
- ❌ Override existing library patterns without discussion
- ❌ Use only Context API without Zustand for global state
- ❌ Skip response data validation from API
- ❌ Create components without proper prop typing
- ❌ Use `any` type implicitly

---

Last updated: Nov 8, 2025

---

## Stage 1–3 Cleanup Plan (Prototype Consistency)

Goal: Unify with specs/definitions, fix encoding issues, and keep mocks until backend is ready. No Stage 4 features in this pass.

- Step 1: Use route constants everywhere
  - Replace hardcoded paths with `ROUTE_PATHS` in app, auth flows, and devtools.
  - Acceptance: No string paths remain in routing; navigation works as before.

- Step 2: Fix mojibake in UI strings
  - Normalize Korean labels/titles/messages across visible components.
  - Acceptance: All user-facing text renders correctly in UTF‑8.

- Step 3: Align terminology to definitions
  - Roles: “어르신(부모)”, “보호자(자녀)”; Status: “미복용/복용 완료/예정/건너뜀”.
  - Acceptance: Labels match definitions in `front/PROJECT_SPECIFICATION.md` and `front/FRONTEND_COMPONENTS_SPECIFICATION.md`.

- Step 4: Apply `ROUTE_PATHS` in devtools/auth
  - Use constants in DeveloperModePanel, Kakao callback/navigation.
  - Acceptance: Dev Mode shortcuts and OAuth callback use constants.

- Step 5: Keep mocks; skip backend coupling
  - Maintain Dev Mode + Mock behavior; no real API/WS wiring yet.
  - Acceptance: `VITE_USE_MOCK_API=true` remains default; flows operate offline.

- Step 6 (optional, follow‑up): Structure consistency
  - Consider moving `src/pages/Dashboard/*` under feature modules to reduce split.
  - Acceptance: Agreed migration plan; change deferred to avoid large diff now.

- Step 7: QA checklist (Dev Mode)
  - Role selection → dashboards → family/manage → medication CRUD.
  - Refresh persistence, error boundaries, and navigation paths verified.

Notes
- Env toggles: `VITE_USE_MOCK_API=true` uses mocks; `false` hits real API. `VITE_ENABLE_DEV_MODE=false` hides dev panel.

---

## Stage 4.1 Plan (Frontend Prototype Cleanup)

- Routing constants rollout
  - Ensure all routes/navigations use `ROUTE_PATHS` (App, Dev Mode, Auth, Settings, Family, Medication).
- Mojibake and terminology sweep
  - Normalize Korean UI texts per definitions (roles: 어르신/보호자; statuses: 복용 완료/미복용/예정/건너뜀).
  - Fix malformed JSX and broken tags found during build.
- API client switches (mock-first)
  - Family/Medication store operations call ApiClients with mock enabled via `VITE_USE_MOCK_API=true` (or Dev Mode).
  - Document toggle semantics in Quickstart; backend swap later by setting `VITE_USE_MOCK_API=false`.
- New pages (shells) wired
  - 증상 검색, 의사와 상담: minimal OCR-like shells with clients; no deep mocks.
- Encoding/EOL policy
  - Enforce UTF-8 + LF via `.editorconfig`, `.gitattributes`, and VS Code settings; fix legacy mojibake in files we touch.

Acceptance
- Build passes without JSX/parse errors.
- Navigation works via `navigate` without reloads.
- UI labels match spec terms across touched pages.

---

## Stage 4 Scope (전체 범위)

- Medication CRUD 실서버 연동
  - 목록/등록/수정/삭제, 상태 토글(활성/중지), 초기 로드와 낙관적 업데이트.
- OCR 처방전 스캔 플로우
  - 업로드 → 인식 → 결과 매핑/교정 → 약 등록 연동.
- 식이/상호작용 경고
  - `dietApiClient` 연동, 약 상세·목록에 경고 배지/패널 표시.
- 증상 검색
  - 자동완성/검색 결과 → 연관 질환·상담 진입 동선.
- 의사 상담
  - 상담 요청 생성/목록·상세 조회(진행 상태/답변).
- 가족 대시보드
  - 구성원별 복용현황·요약 통계, 상세 이동, 초대/제외 후 재계산.
- 인증/역할 라우팅
  - 카카오 콜백 후 토큰 교환/역할 라우팅, 용어 일관화(어르신/보호자).
- 운영 옵션
  - 프로덕션에서 Dev Mode 비노출, Mock 토글 해제 시 실서버 전환.

## Stage 4.1 Sprint Scope (현재)

- 라우트 상수화 검증
  - `ROUTE_PATHS` 전면 적용, SPA 내비게이션 일관화.
- 빌드 브레이커 해소
  - GuardianDashboard, SymptomSearch, DoctorCounsel, MedicationManagement, MedicationCard JSX/텍스트 교정.
- 텍스트/라벨 정리
  - 한글 모지바케 정리, 정의서 용어 통일(복용 완료/미복용/예정/건너뜀, 보호자/어르신).
- Store → ApiClient 스위치(모의 우선)
  - Family/Medication 스토어를 ApiClient로 호출, 초기 fetch 정상화.
- Mock 정책 명시
  - `VITE_USE_MOCK_API=true`(mock), Dev Mode 시 mock 강제; 실서버는 false로 전환.
- 문서 반영
  - Quickstart/CLAUDE에 변경 기록, 루트 `AGENTS.md` 규칙 추가.
- 품질 체크(가벼운)
  - 페이지 전환/상세 진입, 오류 토스트/에러 경계 동작 확인.

### 4.1 남은 마무리(추천)
- 잔여 모지바케 스캔: Family/Settings 하위 컴포넌트, DevMode 패널 텍스트.
- 접근성 보완: ARIA 라벨/역할 간단 정리.
- 에러 처리 공통화: ApiClient 에러 메시지 매핑 유틸 경량 추가.

### 4.2 Preview (실서버 연동)
- ApiClient 엔드포인트 매핑, 토큰 전파(interceptor), 응답 스키마 검증.
- Medication CRUD/상담/식이 경고 실서버 연결 및 QA.

---

## Next Actions (Append)

- Icon components migration
  - Create shared/icons/Icon.jsx (inline SVG map: home/pill/search/family/disease/diet/ocr/counsel/settings/logout).
  - Replace BottomNavigation emoji with <Icon name="..." />; keep currentColor for theme consistency.
- Role-based tab visibility
  - Use oles metadata on menu items to hide tabs per role if required by spec; confirm final policy and apply filter.
- A11y polish
  - Already added ria-current and focus ring; consider tooltips/visually-hidden labels where icons appear without text.
- ROUTE_PATHS audit follow-up
  - Kakao callback and error pages updated; re-scan after merges to catch any new hardcoded paths.
- Disease module expansion (spec sync)
  - If needed by spec, add routes: suspected list (ROUTE_PATHS.suspectedDisease), my diseases (ROUTE_PATHS.myDiseases), restrictions (ROUTE_PATHS.diseaseRestrictions) and wire minimal pages.
- Mojibake cleanup (remaining)
  - src/core/config/constants.js labels, DevMode panel strings, Settings subpages quick sweep and save as UTF-8.
- Build/lint sanity
  - Run Vite build and ESLint to ensure no JSX/syntax regressions after refactors.
- Backend readiness
  - With VITE_USE_MOCK_API=false and Dev Mode off, disease APIs call real endpoints; confirm base URL and CORS; handle 401 via interceptor.

- SeniorDashboard targeting rule
  - Use authenticated user context (useAuth) to map to corresponding SENIOR member instead of "first SENIOR" fallback; define policy for multiple seniors.
- Member details text cleanup
  - Normalize mojibake in src/data/mockFamily.js (DEFAULT_MEMBER_DETAILS) and ensure UTF-8 saving; align status labels to definitions.
