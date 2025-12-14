# AMA...Pill Frontend MUI 전환 + UX 구조 재설계 리팩토링 보고서

작성자: Frontend/UX Lead (GPT)
작성일: 2025-12-12
대상 리포지토리: `Front/`

---

## 0. 목적과 범위

### 목표
- **전 화면을 Material Design(MUI) 기반 UI로 통일**하고 Tailwind를 제거, 남는 SCSS는 `*.module.css`로 정리한다(가능하면 MUI로 흡수).
- **Senior / Caregiver 페르소나 중심 IA 재설계**로 핵심 작업이 1~2탭 안에서 끝나게 한다.
- **기존 JS 동작/상태/페이지 로직은 유지**하면서 UI/UX 레이어만 교체한다.
- **모바일 퍼스트 적응형(Responsive) 디자인**을 적용하고, 변경되는 라우트는 리다이렉트로 호환한다.

### 범위
- `src/shared/components/*` 및 전 feature 화면의 UI 전환.
- 라우팅/내비게이션/레이아웃 구조 재설계.
- Tailwind/SCSS 제거(또는 최소화) 및 MUI Theme 기반 Design System 확립.

---

## 1. 현재 구조 분석

### 1.1 기술/아키텍처 요약
- **React 19 + Vite + React Router**.
- **상태**: Zustand(전역) + React Query(서버 상태).
- **구조**: Feature‑First (`src/features/*`)로 잘 분리되어 있음. (`Front/docs/SRC_STRUCTURE.md`)
- **API 레이어**: `src/core/services/api/*` 추상 ApiClient + Mock 모드 지원.

### 1.2 UI/스타일링 현황
- 의존성상 **MUI는 이미 도입됨**: `@mui/material`, `@emotion/*`.
- 루트에서 ThemeProvider 적용: `Front/src/App.jsx`.
- MUI 커스텀 테마 존재: `Front/src/styles/theme.js`.
- 그러나 실제 UI는 **3계층이 혼재**:
  1) MUI 컴포넌트(주로 대시보드/일부 페이지)
  2) 커스텀 UI 프리미티브: `src/shared/components/ui/*` (Button/Input/Card/Modal/Tabs/FAB 등)
  3) Tailwind + SCSS Modules
- SCSS Modules 파일이 많음: `*.module.scss` 약 **118개**.
- 커스텀 UI 임포트 사용량도 상당: `@shared/components/ui` 매치 **44건**.

### 1.3 레이아웃/내비게이션 현황
- 전역 레이아웃: `src/shared/components/layout/MainLayout.jsx`.
  - `Header` + `BottomNavigation` + `VoiceAssistant` + children 구조.
  - Header/BottomNav는 SCSS 기반 커스텀.
- **중복된 내비게이션 구현 존재**:
  - `AdaptiveNavigation.jsx`는 MUI BottomNavigation/Drawer를 이미 사용.
  - 동시에 `BottomNavigation.jsx`(SCSS/커스텀 Icon)도 별도 유지.
  - 결과적으로 “어떤 레이아웃이 표준인가”가 불명확.
- 현재 하단탭(모바일) 구성: 홈/약/알림/초대코드/가족/더보기.
  - 탭 수가 많고(6개) “초대코드”가 상위로 노출되어 IA가 산만.
- “더보기”에서 기능이 다시 그룹화되어 있어 **탭과 메뉴의 책임이 중첩**.

### 1.4 코드/UX 부채 포인트
- **스타일 체계 혼재**로 신규 개발 시 일관성 유지 비용이 큼.
- 커스텀 UI 프리미티브는 얇은 래퍼이므로 MUI로 대체 가능하나, 현재는 두 체계가 공존해 디버깅/리뷰 비용이 증가.
- `MainLayout`에 사용되지 않는 props 전달 흔적(예: `SeniorDashboard.jsx`) 등 **컴포넌트 계약 불일치**가 보임.
- Role 기반 UX는 있으나, **역할별 IA가 충분히 분리되지 않아** caregiver에서 자주 쓰는 리포트/관리 기능이 “더보기” 깊숙이 숨겨짐.

---

## 2. UX 구조 진단

### 2.1 페르소나와 핵심 작업

**Senior(어르신)**
- 오늘/다음 복약 확인 및 “복용 완료” 처리
- 복약 일정/약 목록 확인
- 음식 경고/질환 주의 확인
- 도움이 필요할 때 가족/보호자에게 연락

**Caregiver(보호자)**
- 가족(시니어)들의 오늘 복약 상태 모니터링
- 처방/약 추가·수정·비활성화 관리
- 알림/이상징후(미복용, 위험 식품 등) 대응
- 리포트/통계 확인 및 공유
- 가족 초대/역할 관리

### 2.2 현재 IA/플로우 문제
- **Senior 플로우는 대시보드 중심으로 괜찮지만** 주요 기능 진입이 QuickAction/FAB/More 등에 분산되어 “어디서 뭘 해야 하는지” 학습이 필요.
- **Caregiver는 모니터링/관리/리포트가 핵심인데** 리포트·질환·식단·OCR이 More로 묶여 탐색 비용이 큼.
- 초대코드 진입이 하단탭으로 노출되어 **일상 사용성 대비 상위 레벨 과도**.
- 모바일/데스크톱 반응형의 표준 레이아웃이 불명확해, 화면마다 UX 밀도가 달라짐.

### 2.3 개선 기회
- 역할별 Top Task를 기준으로 탭/사이드바를 재구성.
- “가끔 쓰는 설정/초대”는 More 또는 Family 하위로 내려 **1차 내비게이션을 단순화**.
- 공통 페이지 패턴(리스트‑상세‑편집, 스텝형 입력, 빈 상태/로딩)을 MUI 기반으로 표준화.
- Senior 접근성(글자 크기, 대비, 터치 타겟)을 테마 레벨에서 보장.

---

## 3. 목표 상태(Target)

### 3.1 Design System (MUI Theme 중심)
- `src/styles/theme.js`를 단일 소스로 확장하고 **Material 토큰 기반 브랜드 테마**를 고정한다.
- 기본 폰트는 **`Noto Sans KR`**로 통일하고 타이포 스케일/대비를 접근성 기준에 맞춘다.
- Apple HIG 권장치를 타이포/터치 토큰의 기준으로 삼는다.
  - 본문(Body): 17pt
  - 제목(H1): 28pt, 소제목(H2/H3): 18–22pt, 캡션: 10–13pt
  - 버튼 레이블: 17pt Medium/Semibold
  - 최소 터치 영역: 44×44pt(≈44px)
- **동적 타입(Dynamic Type) 지원**: 확대모드 설정에 따라 타이포/간격/터치 타겟이 비율 기반으로 함께 스케일링된다.
- **접근성 “확대모드” 테마 스위칭**을 도입한다: 설정에서 온/오프, 백엔드(계정 귀속) 저장, 기본값 Senior ON / Caregiver OFF.
- **Role Accent**는 palette 슬롯으로 제공하고 화면에서는 variant/`sx`만 사용한다.
- 아이콘은 **MUI Icons + 텍스트 라벨 조합**으로 통일한다.

### 3.2 Layout/Navigation Shell
- `MainLayout`을 MUI 기반 `AppShell`로 재구성한다:
  - 상단: `AppBar` + `Toolbar` (프로필/알림/로그아웃/접근성 토글).
  - 하단(모바일): 역할별 `BottomNavigation`(Senior 3탭, Caregiver 4탭).
  - 데스크톱: `Drawer` 기반 사이드 내비(모바일과 동일 IA).
- `AdaptiveNavigation.jsx`를 표준 내비 컴포넌트로 통합하고, SCSS 기반 `Header.jsx`/`BottomNavigation.jsx`는 단계적으로 제거한다.
- `VoiceAssistant`는 전역 접근 가능하되 **카메라(OCR/DietCamera)·지도(병원검색) 화면에서는 전체 숨김**한다.
- 라우트/경로 변경이 필요한 경우 **기존 path는 리다이렉트로 호환**한다.

### 3.3 역할별 1차 내비게이션(확정)

**Senior (Mobile Bottom Tabs / 기본 랜딩)**
1. 대시보드 → `ROUTE_PATHS.seniorDashboard` (`/dashboard`)
2. 알림 → `ROUTE_PATHS.notifications` (`/notifications`)
3. 더보기 → `ROUTE_PATHS.more` (`/more`)

**Senior 대시보드(Home) 구성**
- 상단 고정 3위젯: 현재 타임 복용 현황(Hero) / 오늘의 달성률 / 복용 일정(타임라인).
- 스크롤 섹션: 이전·주간 복약 기록, 약 검색 진입, 최근 식단 요약(경고 포함).

**Senior 더보기(그룹화된 섹션, 위→아래)**
- 내정보(프로필/접근성 설정)
- 가족그룹 관리
- 복약 리포트 및 PDF 출력(본인)
- 근처 병원·약국 검색(카카오맵, 리스트/지도 토글, `tel:` 전화)
- 가족 채팅(채팅 목록)
- 약 등록(처방전 기반)
- OCR 약봉투 스캔
- 질병 관리

**Caregiver (Mobile Bottom Tabs / 기본 랜딩)**
1. 대시보드 → `ROUTE_PATHS.caregiverDashboard` (`/caregiver`)
2. 채팅 → 가족 채팅 목록(신규, 예: `/chat/family`)
3. 알림 → `ROUTE_PATHS.notifications` (`/notifications`)
4. 더보기 → `ROUTE_PATHS.more` (`/more`)

**Caregiver 대시보드(Home) 구성**
- 가족 복약 현황(시니어별 “~님 케어 현황” 카드) + 내 복약 관리 위젯.
- 허브 버튼: 복약관리(`ROUTE_PATHS.prescriptions`), 식단관리(`ROUTE_PATHS.dietLog`), 질병관리, 병원검색, OCR 약봉투, 약 등록(`ROUTE_PATHS.prescriptionAdd`).

**Caregiver 더보기(그룹화, 위→아래)**
- 로그아웃
- 내정보(수정/접근성)
- 가족그룹 관리
- 복약 리포트 및 PDF 출력
- 약 검색

※ 의사 상담/DoctorChat은 IA에서 제거하고 라우트는 P1로 보류.

### 3.4 Motion / Micro‑Interaction (확정)
- 페이지/탭 전환은 **짧고 예측 가능한 슬라이드/페이드**로 통일(MUI Transition 기반).
- 리스트→상세→편집 플로우는 동일한 enter/exit 방향으로 사용자 학습 비용을 최소화.
- P0 마이크로 인터랙션:
  - OCR 완료 후 약봉투 카드 클릭 시 **결과 패널이 확장/튀어나오는 인터랙션**(정리/수정 가능한 상태로 자연스럽게 전환).
  - 복약 완료/체크 시 Progress/Chip이 즉시 피드백.
- 카메라(OCR/식단 촬영)·지도(병원검색) 화면에서는 **모션 최소화 + VoiceAssistant 비노출**.

---

## 4. 리팩토링 실행 계획

### Phase 0. 준비/정렬 (0.5~1주)
- 현재 화면/컴포넌트 목록과 사용 빈도 매트릭스 작성.
- 기존 `Front/REFACTOR_PLAN.md`(Tailwind 전환 목표)는 **MUI 전환 목표로 재정의/아카이브**.
- 공통 컴포넌트 사용처를 전수 스캔하여 마이그레이션 난이도 산정.

### Phase 1. IA/UX 재설계 (1~2주)
- 페르소나별 Top Task 기반 **사이트맵/탭 구조/정보 구조 확정**.
- 주요 플로우 와이어프레임:
  - Senior: 오늘 복약 체크 → 일정 상세 → 복약 완료/스킵.
  - Caregiver: 시니어 선택 → 오늘 상태 확인 → 약/처방 수정 → 리포트 확인.
- 화면 공통 패턴 정의(리스트/상세/입력/모달/빈 상태).
- 빠른 사용자 검증(내부/베타) 후 IA 고정.

### Phase 2. MUI Foundation 구축 (1주)
- `theme.js` 확장: role accent, **확대모드(accessibility) 테마**, spacing/elevation, Noto Sans KR 타이포.
- 공통 UI는 **래퍼 없이 MUI 기본 컴포넌트를 직접 사용**하도록 가이드/샘플을 정리한다.
- `docs/DesignSystem.md`에 컴포넌트 사용 규칙, 아이콘/레이아웃 패턴, 접근성 기준을 문서화한다.

### Phase 3. AppShell/Navigation 교체 (1~1.5주)
- `MainLayout.jsx` → MUI 기반 `AppShell.jsx`로 변경.
- `Header.jsx`, `BottomNavigation.jsx`, `MenuGroup.jsx` 등을 MUI AppBar/BottomNavigation/List로 대체.
- `AdaptiveNavigation.jsx`를 표준 1차 내비로 통합.
- Role별 nav item 세트 구현(현재 `NAV_ITEMS` 로직 대체).

### Phase 4. Shared UI Migration (2~3주)
- `src/shared/components/ui/*` 사용처를 **직접 MUI 컴포넌트로 치환**한다.
- 치환 순서: Button/Input → Card/Paper → Dialog/Tabs → Fab/SpeedDial → Chip/List 등.
- 잔존 스타일은 MUI `sx`/styled로 흡수하고, 불가피한 경우만 `*.module.css`로 유지한다.

### Phase 5. Feature Screens Migration (우선순위 기반, 4~7주)
- **P0(이번 전환 범위)**: SeniorDashboard(재구성), CaregiverDashboard(허브 포함), Prescriptions/Medication 전체, Notifications, Family/Invite, 가족 채팅 목록+대화, OCR 스캔(ocr/medication), Diet(Log/Warning/Camera), Disease, Search(Pill/증상), 병원·약국 검색(신규).
- **P1(보류)**: 상담(counsel)·의사/AI 채팅 등 미구현 기능.
- 각 feature에서 Tailwind class 제거, 잔존 SCSS는 MUI로 흡수 후 `*.module.css`로 정리.

### Phase 6. Cleanup/Hardening (1주)
- Tailwind 의존성은 즉시 제거하고, SCSS는 **MUI 전환 후 남는 파일만 `*.module.css`로 리네임**한 뒤 `sass`를 제거한다.
- `src/styles/tailwind.css`/`base.scss`를 정리하고 전역 스타일은 MUI CssBaseline/Theme로 통합한다.
- 미사용 커스텀 UI/레이아웃, DoctorChat 관련 페이지를 삭제/정리한다.
- 접근성(확대모드), 반응형(모바일 중심), 성능 회귀 점검을 수행한다.

---

## 5. 예상 공수(러프)

전제: 디자이너 1 + 프론트 1~2명, 기능 개발 병행 없이 UI/UX 전환 집중.
- Phase 0~2: 2~4주
- Phase 3~4: 3~4주
- Phase 5~6: 4~7주

**총 2~3개월** 범위가 합리적. (화면/기능 추가가 동반되면 +α)

---

## 6. 리스크와 대응
- **대규모 UI 변경 회귀** → feature 단위 PR로 나눠 P0부터 순차 전환, 라우트 변경은 리다이렉트로 보호.
- **스타일 잔존/혼재** → Tailwind는 즉시 제거, SCSS는 MUI 흡수 후 module.css로 최소 유지.
- **확대모드(백엔드 저장) 연동 리스크** → P0에 API 계약 추가, 실패 시 local fallback.
- **카메라/지도 화면 VoiceAssistant 충돌** → 해당 라우트에서 렌더링 가드 적용.

---

## 7. DoD / 체크리스트
- Tailwind class 0건, `*.module.scss` 0건, 필요 시 `*.module.css`만 잔존.
- 모든 화면이 MUI 테마 토큰/컴포넌트 기반으로 렌더링.
- Senior 3탭 / Caregiver 4탭 내비가 AppShell에서 일관 동작.
- VoiceAssistant는 카메라/지도 화면에서 비노출.
- 확대모드 토글 저장/복원 및 모바일 접근성 기준 충족.

---

## 8. 바로 다음 액션
1. 확정 IA를 기준으로 화면 인벤토리/전환 우선순위(P0) 표 작성.
2. `AppShell`(Role별 탭/Drawer + VoiceAssistant 가드) Spike PR 생성.
3. SeniorDashboard P0 위젯 재배치부터 MUI 전환 시작.

---

## 진행 현황 (2025-12-14)

- AppShell/Navigation Spike 1차 반영: `Front/docs/WORKLOG_2025-12-14_APP_SHELL_NAV_SPIKE.md`

---

부록: 관련 파일
- 라우팅: `Front/src/App.jsx`, `Front/src/core/config/routes.config.js`
- 레이아웃: `Front/src/shared/components/layout/MainLayout.jsx`, `AdaptiveNavigation.jsx`, `BottomNavigation.jsx`
- 커스텀 UI: `Front/src/shared/components/ui/*`
- 테마: `Front/src/styles/theme.js`
