# Worklog (Task) — Settings 화면 MUI 전환 (Workstream 4)

작성일: 2025-12-14  
대상: `Front/`  
참조 문서: `Front/docs/UX_MUI_REFACTOR_REPORT.md`, `Front/docs/WORKSTREAM_PROCESS.md`, `Front/docs/UX_MUI_REFACTOR_TASKS.md`

---

## 목표

- [x] Settings 화면을 MUI 기반 레이아웃으로 전환(1차)
- [x] 레거시 SCSS/커스텀 컴포넌트 의존 제거
- [x] 접근성(확대 모드) 토글 UI의 a11y 속성 보강

---

## 변경 내용

- [x] `Front/src/features/settings/pages/Settings.jsx`
  - [x] `Paper/List/Avatar/Typography` 기반 구성으로 교체
  - [x] 메뉴 항목을 `ListItemButton`으로 통합(설명 텍스트 포함)
- [x] `Front/src/features/settings/components/AccessibilitySection.jsx`
  - [x] `Switch`에 `aria-label`을 `slotProps.input`로 반영(MUI v7 호환)
- [x] 레거시 컴포넌트/스타일 삭제
  - [x] `ProfileSection.jsx`, `SettingsMenu.jsx`
  - [x] `*.module.scss`(Settings/Profile/Menu)

---

## 확인/리스크

- [x] 레이아웃 변경은 Settings 화면에 한정(기능/라우트 유지).
- [ ] Settings 하위 페이지(`settings/profile`, `settings/notifications` 등)는 추후 화면별 전환 범위에서 별도 마이그레이션 필요.

