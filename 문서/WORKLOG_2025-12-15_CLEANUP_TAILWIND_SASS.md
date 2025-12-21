# Worklog (Task) — Tailwind 제거 + SCSS 제거(완료) (Workstream 5)

작성일: 2025-12-15  
대상: `Front/`  
참조 문서: `Front/docs/UX_MUI_REFACTOR_TASKS.md`, `Front/docs/WORKSTREAM_PROCESS.md`

---

## 목표

- [x] Tailwind 설정/전역 CSS/의존성 제거
- [x] `*.module.scss` → 0건 (CSS Modules로 컴파일/전환)
- [x] `sass` devDependency 제거

---

## 변경 내용

- Tailwind 제거
  - 삭제: `Front/tailwind.config.js`
  - 삭제: `Front/src/styles/tailwind.css`
  - 제거: `Front/src/main.jsx`의 Tailwind import
  - 제거: `Front/package.json`의 `tailwindcss`, `@tailwindcss/forms`
- SCSS 제거
  - `src/**/*.scss`를 `src/**/*.css`로 변환하고 import를 `.css`로 치환
  - 결과: `src/**/*.scss` 0건, `src/**/*.module.scss` 0건
  - 제거: `Front/package.json`의 `sass`
- 정리
  - Tailwind 기반 레거시 컴포넌트 제거 및 MUI 기반 UI로 치환: `Front/src/features/medication/pages/TodayMedications.jsx`
  - 삭제(미사용/깨진 devtools): `Front/src/devtools/RealtimeEditorDemo.jsx`

---

## 참고

- `Front/package-lock.json`은 `npm install` 실행 시 의존성 제거가 반영되도록 재생성이 필요할 수 있습니다.

---

## 추가 정리

- (삭제) WS 테스트 라우트/페이지(`/ws-test`)
  - `Front/src/App.jsx`
  - `Front/src/pages/WsTestPage.jsx`
  - `Front/src/features/chat/pages/WsTestPage.jsx`
- (추가) 제한 환경용 정적 점검 스크립트/체크리스트
  - `Front/scripts/static-audit.ps1`
  - `Front/docs/REGRESSION_CHECKLIST.md`
- (정리) 레거시 초대 진입점(`/invites/start`) → `/invites/enter` 리다이렉트로 단순화
- (삭제) 미사용 레거시 페이지 정리
  - `Front/src/features/chat/pages/DoctorChatListPage.jsx`
  - `Front/src/features/family/pages/InviteLanding.jsx`
  - `Front/src/features/search/pages/PillSearchPage.jsx`
  - `Front/src/features/search/pages/SymptomSearch.jsx`
