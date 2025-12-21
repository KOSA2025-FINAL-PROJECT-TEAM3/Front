# RN 패리티 Decision Log (Front)

목적: `React-native/` 프로토타입을 기준으로 `Front/`의 **UI 배치/정보 리듬/내비게이션 UX**를 맞추는 과정에서, 팀 합의가 필요한 지점을 기록한다.

Last updated: 2025-12-17

---

## D1. 모바일 글자 크기 컨트롤 위치

- **결정**: 모바일 헤더에는 글자 크기 컨트롤을 두지 않는다.
- **근거**: 전역 FAB 퀵메뉴에서 이미 제공되며(중복 UI), 헤더 복잡도를 낮춘다.
- **구현**
  - 전역 FAB: `Front/src/shared/components/layout/FloatingActionButtons.jsx`
  - 설정: `Front/src/features/settings/components/AccessibilitySection.jsx`

---

## D2. Caregiver(보호자) 대시보드 메뉴 그리드 구성

- **결정(목표)**: RN 프로토타입의 Guardian 메뉴 카드 구성/순서를 우선한다.
- **메뉴 카드(6개)**:
  1) 복약 관리 → `ROUTE_PATHS.medication`
  2) 식단 관리/기록 → `ROUTE_PATHS.dietLog`
  3) 질병 관리 → `ROUTE_PATHS.disease`
  4) 통합 검색 → `ROUTE_PATHS.search`
  5) OCR 약봉투 → `ROUTE_PATHS.ocrScan`
  6) 가족 채팅 → `ROUTE_PATHS.familyChat`
- **비고**: 가족 관리는 하단 탭(`/family`)로 접근 가능하므로 그리드에서 중복 노출하지 않는다.

## D2.1 전역 FAB(퀵메뉴) 기본 항목

- **결정**: RN 프로토타입의 퀵메뉴(가족 채팅/가족 초대/약 등록/통합 검색/PDF) 구성을 기본으로 한다.
- **예외**: PDF는 보호자 전용 기능으로 제한하고(메뉴는 노출), 비보호자 클릭 시 안내 토스트를 보여준다.

## D2.2 전역 FAB 노출 규칙(1차)

- **결정**: 다음 화면에서는 전역 FAB를 숨긴다(도크/오버레이/집중 모드 충돌 방지).
  - 채팅(`/chat*`)
  - 처방전(`/prescriptions*`)
  - OCR(`/ocr/scan*`)
  - 식단 로그(`/diet/log*`)
  - 질병(`/disease*`)
  - 리포트(`/reports*`)
  - 설정(`/settings*`)
- **구현**: `Front/src/shared/components/layout/floatingActionsVisibility.js`

---

## D3. Search 패리티 범위

- **결정**: RN 프로토타입과 동일하게 Search 탭을 **`약/식단`**으로 전환한다.
- **비고**: 기존 `SymptomSearchTab`(증상 검색)은 RN 패리티 범위에서 제외하고, 필요 시 별도 라우트/기능으로 유지한다(현재 Search UI에서는 미노출).

### 세부 결정(Overlay 1:1 디테일)
- 헤더: 좌측에 **뒤로 + 닫기(X)** 둘 다 노출(둘 다 overlay 종료 역할)
- 타이틀: 탭에 따라 **“약 검색 / 식단”**으로 변경
- 데스크톱: Dialog를 더 넓게(`lg`) + 내부는 **2컬럼(좌: 입력/최근, 우: 결과)** 분리
- 최근 검색어: **탭 공통(전체 최근검색)**으로 통일, input 아래 섹션으로 노출
- 전체 삭제: “전체 삭제” 1개만 제공
- 닫기 동작: **backdrop 클릭으로 닫기 금지**, 닫을 때 pending/입력 상태는 다음 오픈 시 초기화
- OCR: 약 탭에만 CTA 제공, OCR 완료/취소 후 **원래 화면으로 복귀(returnTo 전달)**

## D6. Senior Dashboard Quick Actions(어르신)

- **결정**: RN 프로토타입의 QuickActionGrid(약품 검색/식단 기록/가족 채팅방) 레이아웃을 우선한다.
- **결정(진입)**
  - 약품 검색: Search Overlay 열기(기본 탭 `pill`)
  - 식단 기록: `/diet/log`
  - 가족 채팅방: `/chat/family`

## D7. Caregiver Dashboard Layout(보호자)

- **결정**: RN Guardian 대시보드 레이아웃을 따른다.
- **모바일**: 케어 현황 배너 + 케어 대상 전환 + 6개 메뉴 카드(2컬럼) 중심
- **데스크탑**: 2컬럼(좌: 케어 대상 프로필/요약/주간, 우: 케어 메뉴/최근 활동 로그)

## D8. Notification 중복 수집(클라이언트 1차)

- **결정**: `diet.warning` 알림은 “같은 날” 기준으로 묶어 리스트에서 중복 노출을 줄인다.
- **구현**: `Front/src/features/notification/store/notificationStore.js`

### 현재 적용(부분 실행)

- 전역 Search Overlay(닫으면 원래 화면 유지) + 최근 검색어(저장/칩 클릭 재검색/전체삭제) UX를 도입.
  - `Front/src/features/search/store/searchHistoryStore.js`
  - `Front/src/features/search/store/searchOverlayStore.js`
  - `Front/src/features/search/components/SearchOverlay.jsx`
  - `Front/src/features/search/pages/UnifiedSearchPage.jsx`
  - `Front/src/features/search/components/PillSearchTab.jsx`
  - `Front/src/features/search/components/DietSearchTab.jsx`
  - 주요 진입점: 전역 FAB / 대시보드(시니어·보호자) / 더보기(통합 검색) / 시니어 큰 버튼(약품 검색)
  - 디테일: 슬라이드 up 모션 + pill 탭에서 `OCR 약봉투` 진입 버튼 제공

---

## D5. Notification 중요/일반 분리 기준 + 액션(카톡 불가)

- **결정(중요 기준)**: `type`이 `missed*` 계열이거나 `diet.warning`이면 “중요 알림”으로 분리한다.
- **결정(액션)**
  - “복용 처리 확인/복용하러 가기”는 `/medication/today`로 이동한다(로그 ID 없이도 동작).
  - “카톡 알림”은 제공하지 않고, 보호자 액션은 “가족 채팅”(`/chat/family`)으로 대체한다.
- **결정(리스트 UX)**
  - 중요/일반 섹션은 분리하고 **중요 기본 펼침 + 일반 기본 접힘**
  - 중요 정렬 우선순위: **미복용(missed*) → diet.warning → 기타**, 그 외는 최신순
  - 날짜/시간대 기준 그룹핑: **같은 날짜/같은 시간대**로 묶고 **과거 날짜는 기본 접힘**
- **구현**
  - `Front/src/features/notification/pages/NotificationPage.jsx`
  - diet.warning 하이라이트 카드 포함(식이 경고 보기 → `/diet/warning`)

---

## D4. Prescription(약 등록) 패리티 범위

- **미결정**: RN `MedicationRegister`는 “약 추가 모달 2단계(SEARCH→DETAIL)”가 핵심.
- **선택지**
  - A) 기존 `MedicationModal` 흐름을 RN처럼 정렬(2단계/카드 밀도/CTA)
  - B) 현재 구조 유지 + 정보 리듬만 정렬

### 현재 적용(부분 실행)

- `MedicationModal`을 2단계(step) UX로 정렬: SEARCH → DETAIL, DETAIL에서 “다른 약 찾기(뒤로)” 제공.
  - `Front/src/features/medication/components/MedicationModal.jsx`

- 처방약 카드 정보 밀도 1차 정렬(이미지/복용량/요일/시간 + 메모 접기/펼치기 + 우상단 액션)
  - `Front/src/features/medication/components/MedicationCardInPrescription.jsx`

### 세부 결정(Add/Detail 레이아웃/CTA)
- Add/Detail 공통 섹션 순서: **처방전 정보 → 복용시간 → 처방약 목록 → 메모/결제**
- “약 추가” CTA: 처방약 카드 내부 **primary CTA(크게, fullWidth)**로 제공(빈 상태에도 동일 CTA 포함)
- 하단 고정 CTA: **저장 1버튼(primary)**로 단순화(취소는 Back으로 대체)
- Detail 편집: 별도 “편집 모드 토글” 없이 **바로 수정 가능**(필드/카드에서 즉시 편집)
- 메모: 짧으면 항상 노출, 길면 접기/펼치기
