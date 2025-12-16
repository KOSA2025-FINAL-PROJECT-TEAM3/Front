# Worklog (Task) — Shared UI 제거(완료) (Workstream 3)

작성일: 2025-12-15  
대상: `Front/`  
참조 문서: `Front/docs/UX_MUI_REFACTOR_TASKS.md`, `Front/docs/WORKLOG_2025-12-14_SHARED_UI_INVENTORY.md`

---

## 목표

- [x] `src/shared/components/ui/*` 사용처를 MUI 기반 컴포넌트로 치환
- [x] `src/shared/components/ui/*` 및 관련 `*.module.scss` 제거
- [x] 기존 페이지/기능 동작 유지(라우팅/상태/이벤트 흐름 변경 없음)

---

## 변경 내용 요약

- 신규 MUI 기반 컴포넌트 추가: `Front/src/shared/components/mui/*`
  - `AppButton`, `BackButton`, `AppDialog`, `SpeedDialFab`, `RoundedCard`, `StatusBadge`, `ResponsiveGrid`, `AiWarningDialog`
- 기존 Shared UI 사용 페이지/컴포넌트 치환
  - `FAB` → `SpeedDialFab`
  - `Modal` → `AppDialog`
  - `AiWarningModal` → `AiWarningDialog`
  - `Button`/`BackButton`/`Card`/`Tabs` 등 커스텀 UI 의존 제거
- `MorePage`는 MUI List 기반으로 재작성하여 `MenuGroup` 제거
- `src/shared/components/ui/*` 폴더 전체 삭제

---

## 변경 파일(핵심)

- 추가: `Front/src/shared/components/mui/*`
- 삭제: `Front/src/shared/components/ui/*`
- 치환:
  - `Front/src/features/dashboard/pages/SeniorDashboard.jsx`
  - `Front/src/features/dashboard/pages/CaregiverDashboard.jsx`
  - `Front/src/features/disease/pages/Disease.jsx`
  - `Front/src/features/search/pages/UnifiedSearchPage.jsx`
  - `Front/src/features/search/components/PillSearchTab.jsx`
  - `Front/src/features/search/components/SymptomSearchTab.jsx`
  - `Front/src/features/family/pages/FamilyManagement.jsx`
  - `Front/src/features/family/pages/FamilyInvite.jsx`
  - `Front/src/pages/more/MorePage.jsx`

---

## 잔여 과제

- Tailwind 제거 완료 + `*.module.scss` 0건 완료: `Front/docs/WORKLOG_2025-12-15_CLEANUP_TAILWIND_SASS.md`
- Feature P0 화면별 MUI 전환(리포트/알림/가족/검색 등 일부는 아직 SCSS 기반)
