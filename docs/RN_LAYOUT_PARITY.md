# RN 프로토타입(react-native/) ↔ Front 레이아웃 패리티

목적: `React-native/`(프로토타입)에서 정의된 **Header/BottomNav/콘텐츠 폭/오버레이 배치**를 `Front/`에 동일하게 맞추기 위한 기준 문서.

Last updated: 2025-12-16

---

## 1) 네비게이션 패턴

### 프로토타입 기준
- **Mobile BottomNav**
  - Elderly: `home`, `alert`, `more`
  - Guardian: `home`, `family`, `alert`, `more`
- **Desktop Header Segmented Nav**
  - Mobile과 동일한 탭 구성(Guardian만 family 포함)

### Front 반영
- Primary Nav를 위 기준으로 정렬(모바일 도크 + 데스크톱 상단 segmented tabs)
  - `Front/src/shared/components/layout/primaryNavItems.jsx`
 - 모바일 글자크기 조절은 전역 FAB/설정에서 제공(헤더에 고정 컨트롤은 두지 않음)

참고: 프로토타입의 구현은 `React-native/components/BottomNav.tsx`, `React-native/components/Header.tsx`.

---

## 2) 콘텐츠 폭(Desktop)

### 프로토타입 기준
- `p-5 md:p-8` + `max-w-7xl mx-auto` 중심(데스크톱에서 넓게 사용)

### Front 반영
- AppShell `main`의 `md` 최대 폭을 `1280`으로 확장
  - `Front/src/shared/components/layout/AppShell.jsx`
- AppShell `main`의 데스크톱 패딩을 `md: 32px` 리듬으로 정렬
  - `Front/src/shared/components/layout/AppShell.jsx`

---

## 3) 기능 접근(탭 밖 기능)

프로토타입에서 `medication`은 별도 탭이 아니라 홈/퀵액션/FAB에서 진입 가능.

Front는 Primary Nav에서 `약` 탭을 제거했기 때문에, 회귀를 막기 위해 더보기에서 명시 링크 제공:
- `약 관리`, `오늘 복약`, `가족 채팅`
  - `Front/src/pages/more/MorePage.jsx`

또한 프로토타입처럼 전역 FAB(퀵메뉴 + 음성)을 제공:
- `Front/src/shared/components/layout/FloatingActionButtons.jsx`
  - 퀵 메뉴 내부에서 글자크기 3단계(±) 조절 가능

---

## 4) 남은 패리티(수동 QA에서 확인)

- 모바일에서 도크/오버레이 겹침(VoiceAssistant/FAB/Dev 버튼/고정 CTA)
- focus-mode(Map/Camera/Chat)에서 safe-area/스크롤/오버레이 충돌

체크리스트: `Front/docs/REGRESSION_CHECKLIST.md`
