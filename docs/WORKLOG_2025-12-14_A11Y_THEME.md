# Worklog (Task) — Accessibility/Theme (Workstream 2)

작성일: 2025-12-14  
대상: `Front/`  
참조 문서: `Front/docs/UX_MUI_REFACTOR_REPORT.md`, `Front/docs/WORKSTREAM_PROCESS.md`, `Front/docs/UX_MUI_REFACTOR_TASKS.md`

---

## 목표

- [x] 확대모드(접근성) 테마 스위칭 기반 마련
- [x] 설정 화면에서 확대모드 토글 제공
- [x] Senior 기본 ON / Caregiver 기본 OFF 규칙 반영(초기 기본값)

---

## 구현 내용

- [x] `Front/src/shared/stores/uiPreferencesStore.js`
  - [x] `accessibilityMode`(확대모드) + persist 저장
  - [x] `ensureDefaultForRole(customerRole)`로 역할 기반 기본값 1회 설정
- [x] `Front/src/styles/theme.js`
  - [x] `createAppTheme({ accessibilityMode })` 도입
  - [x] `MuiCssBaseline`에서 `html` 폰트 크기 스케일링(기본 16px / 확대 18px)
  - [x] 터치 타깃 최소값 보강(`MuiButton`, `MuiIconButton` min 44px)
- [x] `Front/src/App.jsx`
  - [x] auth hydration 이후 역할 기반 기본값 확정
  - [x] 확대모드 상태에 따라 ThemeProvider theme를 동적으로 생성(useMemo)
- [x] `Front/src/features/settings/pages/Settings.jsx`
  - [x] 설정 페이지에 `AccessibilitySection`(Switch) 추가
- [x] `Front/src/features/settings/components/AccessibilitySection.jsx`

---

## 후속 작업

- [ ] “계정 귀속 저장(P0)” 연동(백엔드 계약 확정 후)
- [ ] 확대모드에서 spacing/컴포넌트 밀도까지 함께 스케일링(현재는 rem 기반 폰트 스케일 중심)

