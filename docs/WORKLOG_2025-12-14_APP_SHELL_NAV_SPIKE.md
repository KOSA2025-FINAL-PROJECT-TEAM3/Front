# Worklog (Task) — AppShell/Navigation Spike

작성일: 2025-12-14  
대상: `Front/`  
참조 문서: `Front/docs/UX_MUI_REFACTOR_REPORT.md`, `Front/docs/WORKSTREAM_PROCESS.md`

---

## 목표 (Workstream 1)

- [x] `MainLayout`에서 **표준 1차 내비게이션을 `AdaptiveNavigation`로 통합**
- [x] **Role 기반 Primary Nav**: Senior 3탭 / Caregiver 4탭 구성
- [x] **레거시 `/chat` 경로를 `/chat/family`로 리다이렉트**
- [x] **VoiceAssistant 가드**(카메라/입력 집중 화면에서 비노출)
- [x] 헤더에서 **알림/더보기 진입점을 항상 제공**

---

## 작업 내용 (What changed)

- [x] Primary nav 아이템을 역할별로 분리: `Front/src/shared/components/layout/primaryNavItems.js`
  - [x] Senior: `홈(/dashboard)`, `약(/medication)`, `가족(/family)`
  - [x] Caregiver: `홈(/caregiver)`, `약(/medication)`, `가족(/family)`, `리포트(/reports/adherence)`
- [x] `MainLayout`에서 기존 커스텀 `BottomNavigation` 제거 → `AdaptiveNavigation` 사용
- [x] Desktop 환경에서 `AdaptiveNavigation`이 **좌측 Sidebar(영구 Drawer)**로 동작하도록 레이아웃 조정
- [x] 헤더 개선
  - [x] 알림 버튼: unread 0이어도 항상 노출(0이면 🔔 표시)
  - [x] 더보기 버튼(⋯) 추가: `/more`로 진입
- [x] VoiceAssistant 노출 가드
  - [x] `fullScreen`(채팅)에서는 비노출
  - [x] `/ocr/scan*`, `/diet/log*`에서는 비노출
  - [x] Debug 입력 UI는 `import.meta.env.DEV`에서만 표시
- [x] 라우트 호환
  - [x] `/chat` → `/chat/family` 리다이렉트(기존 진입점 보존)

---

## 변경 파일

- [x] `Front/src/shared/components/layout/MainLayout.jsx`
- [x] `Front/src/shared/components/layout/MainLayout.module.scss`
- [x] `Front/src/shared/components/layout/AdaptiveNavigation.jsx`
- [x] `Front/src/shared/components/layout/Header.jsx`
- [x] `Front/src/shared/components/layout/Header.module.scss`
- [x] `Front/src/shared/components/layout/primaryNavItems.js`
- [x] `Front/src/features/voice/components/VoiceAssistant.jsx`
- [x] `Front/src/App.jsx`

---

## 후속 작업 (Next)

- [ ] VoiceAssistant “카메라 오픈 상태” 기반 가드(페이지 단위가 아니라 컴포넌트/모달 단위)
- [ ] `/chat` 리다이렉트 이후 Doctor/AI 상담 리스트 진입 경로 재배치(필요 시 `/counsel/chat` 등)
- [x] `AppShell.jsx` 분리(헤더/사이드바/바텀탭 책임 분리) 및 `MainLayout` 단계적 제거: `Front/src/shared/components/layout/AppShell.jsx`
- [x] Shared UI(`src/shared/components/ui/*`) → MUI 기반 컴포넌트로 치환/제거 완료: `Front/docs/WORKLOG_2025-12-15_SHARED_UI_REMOVAL.md`
