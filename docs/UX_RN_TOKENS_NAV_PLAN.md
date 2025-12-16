# Front UI/UX 보완 계획 — React-native(프로토타입) 형태로 정렬

목표: `Front/`의 기존 MUI 리팩토링 결과를 유지/확장하면서, `React-native/` 프로토타입의 **디자인 토큰 + 라우팅/네비게이션 UI/UX 패턴**을 흡수해 `Front/`를 “프로토타입과 같은 사용감”으로 보완한다.  
핵심 사용자 피드백: **데스크톱에서 좌측 고정 카테고리/사이드바(좌측 Drawer)가 불편**하며, 모바일과 일체감 있는 **하단 nav(도크)**가 더 자연스럽다.

---

## 0) 현재 상태/문제 정의

### Front(웹)
- 테마/토큰: `Front/src/styles/theme.js` (MUI `createTheme` 기반)
- 레이아웃: `Front/src/shared/components/layout/AppShell.jsx`
- 1차 내비: `Front/src/shared/components/layout/AdaptiveNavigation.jsx`
  - Mobile: `BottomNavigation`(하단 고정)
  - Desktop: `Drawer variant="permanent"`(좌측 고정 사이드바)
- 라우팅: `Front/src/App.jsx` + `Front/src/core/config/routes.config.js`

### 문제(사용자 피드백)
- 데스크톱에서 좌측 고정 내비(카테고리/사이드바)가 **불편**.
- 모바일과 일체감이 있는 **하단부 nav(도크 형태)**가 더 보기 좋고 학습 비용이 낮음.

---

## 1) 라우팅/네비게이션 방식 비교(Front vs React-native)

### 1.1 라우팅 구조(Front)
근거: `Front/src/core/config/routes.config.js`
- Router: React Router (`BrowserRouter` + `Routes`)
- “탭”의 실체는 `ROUTE_PATHS` 기반의 URL 라우트(새로고침/딥링크/히스토리 지원)
- 역할별 IA: `Front/src/shared/components/layout/primaryNavItems.jsx`에서 Senior 3 / Caregiver 4 정의

### 1.2 라우팅 구조(React-native 프로토타입)
근거: `React-native/App.tsx`
- Router 없이 단일 페이지에서 상태 기반 전환:
  - `activeTab`(예: `home`, `alert`, `more`, `family`, `chat`, `report` 등)
  - `viewState`(세부 화면 상태 전환: HOME/검색 오버레이 등)
- 장점: 전환이 빠르고 UI가 “탭 앱”처럼 느껴짐(특히 모바일)
- 한계: URL 딥링크/브라우저 히스토리와 분리(웹 서비스에서는 라우트 매핑이 필요)

### 1.3 “탭/화면” 매핑(제안)
목표: Front의 URL 라우팅은 유지하되, 사용자에게 보이는 내비 UX는 React-native의 “탭 앱” 감성으로 통일한다.

| 사용자 탭(멘탈 모델) | Front 라우트(대표) | React-native 상태(대표) |
|---|---|---|
| 홈 | `ROUTE_PATHS.seniorDashboard` / `ROUTE_PATHS.caregiverDashboard` | `activeTab='home'` |
| 약 | `ROUTE_PATHS.medication` (+ today/add/detail) | (퀵액션/카드 진입) |
| 가족 | `ROUTE_PATHS.family` (+ member detail) | `activeTab='family'`(guardian 조건) |
| 리포트(보호자) | `ROUTE_PATHS.adherenceReport` / `ROUTE_PATHS.weeklyStats` (홈의 빠른 작업/카드에서 진입) | `activeTab='report'` / `activeTab='statistics'` |
| 알림 | `ROUTE_PATHS.notifications` | `activeTab='alert'` |
| 더보기 | `ROUTE_PATHS.more` | `activeTab='more'` |
| 채팅 | `ROUTE_PATHS.familyChat` + conversation | `activeTab='chat'` |

---

## 2) 디자인 토큰 비교/정리(Front vs React-native)

### 2.1 Front 토큰 소스(현 상태)
근거: `Front/src/styles/theme.js`
- Primary가 Indigo 계열(`#6366f1`), background는 gray-50 계열(`#f9fafb`)
- 컴포넌트 기본(버튼/카드/아이콘 버튼) 최소 44px 터치 타겟 등 접근성 기반 오버라이드 존재

### 2.2 React-native(프로토타입) 토큰 “관측값”
참조 파일:
- `React-native/components/BottomNav.tsx`
- `React-native/components/Header.tsx`
- `React-native/components/FloatingActionButtons.tsx`
- `React-native/App.tsx`

#### 컬러 토큰(관측값)
- Brand/Primary: `#2EC4B6`
- Accent: `#7C8CFF`
- Background: `#F6FAFF`, Surface: `#FFFFFF`
- Surface muted: `#F1F5F9`
- Border/Divider: `#E2E8F0`
- Text: primary `#0F172A`, secondary `#475569`/`#64748B`, muted `#94A3B8`
- State: error `#EF4444`, warning `#F59E0B`, success `#10B981`

#### 형태/그림자/리듬(관측값)
- Radius: 20~24px 중심(도크/카드), 모달은 32px까지
- BottomNav shadow(위로): `0 -4px 20px rgba(0,0,0,0.03)`
- Header shadow(얕게): `0 2px 10px -4px rgba(0,0,0,0.05)`
- BottomNav height 72px + safe-area padding 패턴

### 2.3 토큰 매핑 원칙(리팩토링 방침)
- 단일 소스: 계속 `Front/src/styles/theme.js`에 귀속한다.
- RN 토큰은 “하드코딩 복제”가 아니라, **MUI 토큰(palette/shape/shadows/components)**으로 번역한다.
- 목표는 “색깔만 바꾸기”가 아니라 **내비/레이아웃의 형태·여백·그림자**까지 포함한 시각/사용감 정렬이다.

---

## 3) 네비게이션 UI/UX 비교(Front vs React-native)

### 3.1 Mobile(공통점/차이)
- 공통점: 하단 탭 기반 내비가 “기본 탐색”을 담당
- 차이:
  - RN: 도크가 “강한 형태”(rounded top + 얕은 shadow + max-width center)로 앱의 핵심 UI처럼 보임
  - Front: 기본은 MUI BottomNavigation이지만, RN만큼 “도크 감성(형태/그림자/가로 폭)”이 강하지 않을 수 있음

### 3.2 Desktop(가장 큰 차이)
- RN: 좌측 사이드바 없음. 헤더 중앙에 segmented nav(pill)로 탭 이동(학습 비용 낮음).
- Front: 좌측 permanent Drawer가 표준(카테고리 고정) → 콘텐츠 폭/시선 흐름/스크롤 UX에 악영향 가능.

결론: 데스크톱에서 **좌측 고정 Drawer를 기본에서 내리고**, RN과 동일한 “탭 앱” 방식(하단 도크 또는 헤더 segmented)으로 통일해야 한다.

---

## 4) Front(MUI)로의 리팩토링 계획(React-native 형태로 보완)

### 2.1 원칙
- “토큰의 단일 소스”는 계속 `Front/src/styles/theme.js`.
- RN 토큰은 **MUI palette/shape/shadows/components override**로 이식한다.
- 페이지/컴포넌트별 임의 컬러 하드코딩은 지양하고 `theme.palette.*`를 사용한다.

### 2.2 구체 작업(토큰)
1) 컬러: `primary`를 RN Brand로 맞추거나(권장) “brand 슬롯”을 추가한 뒤 점진 치환
   - 후보: `primary.main = #2EC4B6`, `secondary/main or info.main = #7C8CFF`
2) 배경/표면: `background.default`를 `#F6FAFF` 계열로 정렬(프로토타입의 “청량한 의료 앱” 톤)
3) 형태: radius는 전역 고정 대신 컴포넌트별로 RN 감성을 반영
   - `MuiBottomNavigation`/`MuiPaper`/`MuiCard` 중심
4) safe-area: `env(safe-area-inset-bottom)` 기반 CSS 변수/유틸을 제공해 하단 도크와 FAB 겹침을 방지
5) 그림자: RN의 “아주 얕은 shadow”를 MUI `shadows` 또는 컴포넌트 오버라이드에 반영(과한 elevation 제거)

---

### 4.1 내비게이션/레이아웃 UX 재설계(핵심)

기준 IA: `Front/docs/IA_NAV.md` (Senior 3 / Caregiver 4)

#### 목표 상태(데스크톱)
- **좌측 고정 Drawer를 기본값에서 제거**(또는 옵션화).
- 모바일과 동일한 “탭 기반 멘탈 모델” 유지:
  - 옵션 A(권장): 데스크톱에서도 **Bottom Dock Nav(하단 도크)** 기본
  - 옵션 B(차선): RN처럼 헤더 중앙에 **Segmented Top Nav(탭 pill)** 기본
  - 옵션 C(혼합): A + B 동시 제공은 과밀해질 수 있어 기본값 1개로 고정하고 실험(A/B)로 분리

#### 구현 방향(Front 코드 기준)
1) `Front/src/shared/components/layout/AdaptiveNavigation.jsx`를 “레이아웃 모드” 기반으로 재구성
   - `auto`(기본): mobile=bottom dock, desktop=(A 또는 B)
   - `bottomDock`: 전 breakpoint에서 bottom dock
   - `topSegmented`: desktop에서 header segmented nav, mobile은 bottom dock
   - `sideDrawer`: 기존 permanent drawer 유지(옵션/관리자/개발모드용)
2) `Front/src/shared/components/layout/AppShell.jsx`의 padding/overflow를 “실제 내비 노출” 기준으로 계산
   - 현재는 `showBottomNav` 중심이라 desktop에서도 불필요한 bottom padding이 남을 수 있음
3) `Front/src/shared/components/layout/Header.jsx`에 desktop primary nav 영역을 추가(옵션 B)
   - MUI 구현 후보: `Tabs`(pill 스타일) 또는 `ToggleButtonGroup`
4) Bottom dock 시각 규격을 RN과 맞추기(옵션 A/B 공통)
   - radius 20, 얕은 위쪽 shadow, maxWidth(예: 420~560) center, safe-area padding
5) “빠른 행동(Quick Action)” 패턴을 RN처럼 정렬
   - RN은 FAB + 메뉴(글자 크기/가족채팅/초대/등록/검색/내보내기 등)
   - Front는 MUI `SpeedDial` 또는 `Fab` 그룹으로 정리하고, IA 기준으로 “More”와 중복 제거

---

## 5) 실행 순서(결정 → 작업 → 검증)

### Step 0. 결정 필요한 항목 확정(Q 리스트 답변 수집)
아래 Q 리스트를 확정하기 전에는 “큰 구조”를 건드리지 않는다.

### Step 1. 토큰 정렬(Theme) 먼저(시각 일관성 확보)
- `Front/src/styles/theme.js`에서 RN 톤 반영(색/배경/라운드/섀도우/컴포넌트 오버라이드)
- 목표: Navigation 리워크에 들어가기 전에 “도크/헤더”가 RN처럼 보일 기반을 만든다.

### Step 2. 내비게이션 모드 구현(Desktop 기본값 변경)
- `AdaptiveNavigation`에 모드 도입 + `AppShell` padding/overflow 수정
- (선택) `Header`에 segmented nav 추가(옵션 B)

### Step 3. 빠른 행동(Quick Action) 패턴 정리
- RN의 FAB 메뉴 아이템을 Front IA에 맞게 재배치(“자주 쓰는 것만”)
- More/Settings와 중복되는 항목 제거

### Step 4. 회귀 검증
- `npm run build`
- `npm run test:e2e` (가능하면 스모크만)

---

## 6) 결정이 필요한 Q 리스트(작업 시작 전 확정)

### Q1. 데스크톱 기본 내비는 무엇으로 갈까?
- (A) bottom dock(하단 도크) 기본
- (B) header segmented nav(상단 pill 탭) 기본
- (C) side drawer 유지 + 개선(비권장: “불편” 피드백과 충돌)

### Q2. 데스크톱에서 bottom dock를 쓰면 “알림/더보기”는 어디에 둘까?
- (1) 도크 탭에 포함(탭 수 증가)
- (2) 헤더 아이콘으로 고정(현재 Front 방식) + 도크는 Top task만

### Q3. Caregiver IA(4탭)를 RN 형태로 어떻게 표현할까?
- RN은 mobile bottom nav가 4개(홈/알림/더보기/+가족) 중심인데,
  - Front는 caregiver에 “리포트”가 primary 탭으로 정의됨(`IA_NAV.md`)
- 결정 필요:
  - (1) caregiver bottom nav에 “리포트” 포함(4~5탭)
  - (2) 리포트는 도크에서 제외하고 홈에서 강한 진입(카드/퀵액션)으로 처리

### Q4. 테마 primary 컬러를 indigo → teal(#2EC4B6)로 “바로” 바꿀까?
- (1) 즉시 전환(프로토타입 정합성 ↑, 기존 화면 인상 변화 ↑)
- (2) brand 슬롯 추가 후 점진 치환(리스크 ↓, 작업량 ↑)

### Q5. 데스크톱의 콘텐츠 폭/밀도는 어디에 맞출까?
- (1) RN처럼 “모바일 중심 + 가운데 정렬(max-width 520 내외)” 감성
- (2) 현재 Front처럼 “대시보드형 wide(max-width 1400)” 유지 + 내비만 RN형으로
- (3) 화면별로 다르게(대시보드는 wide, 나머지는 narrow)

### Q6. RN의 “글자 크기 컨트롤”을 Front에 어떻게 반영할까?
- Front는 `useUiPreferencesStore`의 `accessibilityMode`(테마 기반) 중심
- 결정 필요:
  - (1) 현행 유지(설정에서 토글)
  - (2) RN처럼 헤더/FAB에 즉시 컨트롤 제공(학습 비용 ↓, UI 복잡도 ↑)

### Q7. Quick Action(FAB/SpeedDial) 범위 확정
- RN 메뉴(예: 가족채팅/초대/약 등록/검색/PDF 등) 중
  - “도크/More”와 중복되지 않게, “Top task 보조”로만 남길 항목 확정

---

## 6.1 결정 사항(확정)

요청 근거(페르소나/목표): `Front/docs/UX_MUI_REFACTOR_REPORT.md`

- Q1(Desktop primary nav): **B — Header segmented nav(상단 pill 탭) 기본**
- Q2(Desktop 알림/더보기): **2 — 헤더 아이콘 고정(도크는 Top task만)**
- Q3(Caregiver 리포트 진입): **2 — 도크 제외, 홈에서 강한 진입(카드/퀵액션)**
- Q4(Primary 컬러 전환): **1 — 즉시 전환(indigo → teal `#2EC4B6`)**
- Q5(Desktop 콘텐츠 폭): **1 — RN처럼 narrow 중심(max-width 520~640)**
- Q6(글자 크기 컨트롤): **1 — 현행 유지(설정/접근성 모드 중심, Senior 기본 확대모드)**
- Q7(Quick Action): **QuickActionGrid(홈 섹션) + SpeedDialFab(mobile-only, 보조 액션만)로 역할 분리**

### Q7 확정 질문(작업 진행 중 마지막으로 확정 필요)
Quick Action을 “새 UI 추가”로 확대하지 않기 위해, 아래 중 하나로만 확정한다.

확정(적용됨):
- **홈 화면 내 QuickAction 섹션**은 유지(가시적/학습 비용 낮음)
- **SpeedDialFab는 모바일에서만 노출**하고, QuickActionGrid와 **액션이 겹치지 않도록** “보조 액션(예: PDF, 스캔 등)”만 배치

## 7) Done 정의(DoD)
- 데스크톱에서 기본 내비가 **좌측 고정 Drawer가 아닌** bottom dock 또는 top segmented로 동작한다.
- mobile/desktop 간 내비 멘탈 모델이 일관(탭 단위)하며, “어디서 뭘 해야 하는지” 탐색 비용이 감소한다.
- 하단 nav가 safe-area 대응을 포함해 겹침/잘림 없이 동작한다.
- 테마 토큰이 RN 프로토타입과 시각적으로 조화(브랜드 컬러/배경 톤/라운딩/섀도우)한다.
- 기존 IA(Senior 3 / Caregiver 4)와 라우팅은 유지된다.
