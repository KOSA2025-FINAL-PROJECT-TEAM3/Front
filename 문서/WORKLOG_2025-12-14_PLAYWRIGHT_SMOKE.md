# Worklog (Task) — Playwright E2E Smoke (Workstream 5)

작성일: 2025-12-14  
대상: `Front/`  
참조 문서: `Front/docs/PLAYWRIGHT_E2E_PLAN.md`, `Front/docs/PLAYWRIGHT_API_CONTRACT.md`, `Front/docs/UX_MUI_REFACTOR_TASKS.md`

---

## 목표

- [x] 프론트에서 Playwright 실행 기반 마련
- [x] DB/백엔드 없이 실행 가능한 스모크 테스트 작성
- [x] 시니어/보호자 역할별 “확대모드 기본값” 회귀 검증

---

## 구현 내용

- [x] `Front/playwright.config.js`
  - [x] Vite dev server 자동 기동(webServer) + chromium 프로젝트 구성
- [x] `Front/package.json`
  - [x] `test:e2e`, `test:e2e:ui` 스크립트 추가
- [x] `Front/tests/e2e/*`
  - [x] 시니어 스모크: 대시보드 렌더 + 확대모드 기본 ON
  - [x] 보호자 스모크: 설정 렌더 + 확대모드 기본 OFF
  - [x] `/api/**` 요청은 `page.route('**/*')` + 필터링으로 모킹(정적 리소스 충돌 방지)
  - [x] 알림 SSE(`/api/notifications/subscribe`)는 `EventSource` 스텁 + eventsource 응답으로 우회

---

## 실행 방법

- `Front/`에서 실행:
  - (npm 사용 가능 시) `npm run test:e2e -- --workers=1`
  - (npm 불가 시) `node ./node_modules/@playwright/test/cli.js test --workers=1 --reporter=list`
  - (정적 점검 + 스모크 한번에) `powershell -ExecutionPolicy Bypass -File Front/scripts/run-workstream5.ps1`

환경/브라우저:
- `Front/playwright.config.js`는 기본적으로 `PLAYWRIGHT_BROWSER_CHANNEL`의 값을 사용하며, 미지정 시 `msedge`를 사용합니다.
  - 필요 시 `PLAYWRIGHT_BROWSER_CHANNEL=chrome` 또는 `chromium` 등으로 변경 가능(설치/환경에 따라 상이)

---

## 메모(중요)

- [x] `page.route('**/api/**')` 패턴은 사용 금지
  - Vite가 `/src/**/api/**` 같은 정적 모듈 경로도 매칭될 수 있어, 앱 로딩 자체가 깨질 수 있음
  - 해결: `resourceType(xhr|fetch|eventsource)` + `pathname.startsWith('/api/')`로 필터링
- [x] 일부 API는 trailing slash가 붙을 수 있어 path normalize가 안전

---

## 후속 작업

- [ ] P0 시나리오 확장(약 등록/복용 완료/가족 그룹/식단) + 실패 케이스(401/403/400) 추가
- [ ] API 모킹 라우트/fixture를 파일 구조(`fixtures/`, `routes/`)로 분리(스케일 대비)
