# UX/MUI 리팩토링 Task Tracker (Front)

참조: `Front/docs/UX_MUI_REFACTOR_REPORT.md`, `Front/docs/WORKSTREAM_PROCESS.md`  
업데이트 원칙: PR/커밋 단위로 **체크박스 갱신 + Worklog 링크 추가**

---

## 현재 상태 스냅샷 (2025-12-14)

- [x] Workstream 1(AppShell/Navigation) — 1차 Spike 반영: `Front/docs/WORKLOG_2025-12-14_APP_SHELL_NAV_SPIKE.md`
- [x] Workstream 2(Accessibility/Theme) — 확대모드/토큰 정비(1차): `Front/docs/WORKLOG_2025-12-14_A11Y_THEME.md`
- [ ] Workstream 3(Shared UI 제거) — `src/shared/components/ui/*` 제거 및 사용처 치환
- [ ] Workstream 4(Feature P0) — 화면별 MUI 전환(진행중: Settings 1차): `Front/docs/WORKLOG_2025-12-14_SETTINGS_MUI.md`
- [ ] Workstream 5(Cleanup/Docs) — Playwright 스모크(E2E) 기반 + 문서 정리(진행중): `Front/docs/WORKLOG_2025-12-14_PLAYWRIGHT_SMOKE.md`

현실 상태(근거):
- `*.module.scss` 파일: 118개 (잔존)
- Tailwind 설정/전역 CSS 잔존: `Front/tailwind.config.js`, `Front/src/styles/tailwind.css`
- `sass`, `tailwindcss` devDependency 잔존

---

## Phase 체크리스트

### Phase 0. 준비/정렬
- [ ] 화면/컴포넌트 인벤토리(페이지별: UI 패턴/의존/난이도/우선순위) 작성
- [ ] Tailwind/SCSS 사용처 현황 스캔(삭제/치환/유지 기준 수립)
- [ ] 전환 규칙 확정(“MUI 우선, module.css 최소”)

### Phase 1. IA/UX 재설계
- [ ] Senior 3탭 / Caregiver 4탭 IA 확정(Top Task 기준)
- [ ] 주요 플로우 와이어프레임(복약/약관리/가족/리포트) 정리
- [ ] 공통 화면 패턴 정의(리스트/상세/입력/빈상태/에러/로딩)

### Phase 2. MUI Foundation 구축
- [ ] `Front/src/styles/theme.js` 토큰 확장(타이포/간격/컬러/컴포넌트 오버라이드)
- [x] 접근성(확대모드) 테마 스위칭 초안 + 저장 방식(로컬) 확정
- [ ] Design System 문서(`docs/DesignSystem.md`) 작성/갱신

### Phase 3. AppShell/Navigation 교체
- [x] `AdaptiveNavigation` 표준 1차 내비로 통합(모바일 BottomNav + 데스크톱 Sidebar)
- [x] Role 기반 Primary Nav 기본 세트 구현(Senior 3 / Caregiver 4)
- [x] 레거시 `/chat` → `/chat/family` 리다이렉트
- [x] VoiceAssistant 비노출 가드(채팅 fullScreen, OCR/식단 로그 페이지)
- [ ] `AppShell.jsx`로 책임 분리(MainLayout 점진 제거)
- [x] 레거시 `BottomNavigation.jsx`/SCSS 정리(삭제)
- [ ] “카메라/지도 집중 모드” 가드 보강(페이지 단위 → 컴포넌트/상태 단위)

### Phase 4. Shared UI Migration
- [ ] `src/shared/components/ui/*` 사용처 목록화(우선순위/대체 MUI 컴포넌트 매핑)
- [ ] Button/Input부터 순차 치환 → Dialog/Tabs/FAB 등 확장
- [ ] 치환 후 `ui/*` 제거 및 import 정리

### Phase 5. Feature P0 Migration
- [ ] Dashboard(Senior/Caregiver) MUI 전환/정렬
- [ ] Prescriptions/Medication UI 전환
- [ ] Family/Invite/Chat UI 전환
- [ ] OCR/Diet/Camera UI 전환(+ 마이크로 인터랙션 P0)
- [ ] Disease/Search UI 전환
- [ ] 병원/약국 검색(지도) UX/UI 전환

### Phase 6. Cleanup/Hardening
- [ ] Tailwind 제거(설정/전역 CSS/의존성)
- [ ] `sass` 제거 + `*.module.scss` → 0건(`*.module.css` 최소 유지)
- [ ] 미사용 레거시 컴포넌트/라우트 삭제 및 리다이렉트 정리
- [ ] 접근성/반응형/성능 회귀 점검 체크리스트 완료

---

## Worklogs

- 2025-12-14: AppShell/Navigation Spike — `Front/docs/WORKLOG_2025-12-14_APP_SHELL_NAV_SPIKE.md`
- 2025-12-14: Accessibility/Theme(확대모드) — `Front/docs/WORKLOG_2025-12-14_A11Y_THEME.md`
- 2025-12-14: Settings 화면 MUI 전환(1차) — `Front/docs/WORKLOG_2025-12-14_SETTINGS_MUI.md`
- 2025-12-14: Playwright E2E Smoke(시니어/보호자) — `Front/docs/WORKLOG_2025-12-14_PLAYWRIGHT_SMOKE.md`
