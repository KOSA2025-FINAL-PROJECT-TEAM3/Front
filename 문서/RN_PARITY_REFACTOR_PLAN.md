# RN 프로토타입 패리티 이식/리팩토링 플랜 (Front)

목표: `React-native/` 프로토타입의 **Desktop/Mobile 구성, 카드 순서(정보 리듬), FAB 위치/동작, 역할별 대시보드 구성**을 `Front/`에 1:1로 맞춘다.

- 기준(프로토타입): `React-native/App.tsx`, `React-native/components/*`
- 현재 상태/진행: `Front/docs/RN_WEB_UI_MIGRATION_STATUS.md`
- 레이아웃/네비 패리티 기준: `Front/docs/RN_LAYOUT_PARITY.md`
- 결정사항(Decision Log): `Front/docs/RN_PARITY_DECISIONS.md`
- 수동 QA는 마지막에 일괄: `Front/docs/REGRESSION_CHECKLIST.md`

Last updated: 2025-12-17

---

## 0) 현재 관측된 “배치 불일치” 유형

1. **Desktop/Mobile 컴포넌트 배열이 다름**
   - 프로토타입: mobile 1컬럼, desktop 2컬럼/그리드로 카드 위치가 바뀜
   - Front: 페이지마다 그리드/섹션 분기 기준이 제각각
2. **카드 순서(정보 리듬)가 다름**
   - 프로토타입: “오늘의 핵심 → 요약 → 액션 → 리스트/기록” 고정 리듬
3. **FAB 위치/동작이 다름**
   - 프로토타입: bottom-right, bottom dock 위(모바일), 메뉴+음성 2개 버튼, 퀵 메뉴 오버레이
4. **역할별 Dashboard 구성 차이**
   - Elderly vs Guardian: 탭 노출/가족 전환/배너/메뉴 그리드/리스트 구성 차이

---

## 1) RN → Front 패리티 매핑(핵심 컴포넌트)

| RN(프로토) | Front(대상) | 상태 | 비고 |
| --- | --- | --- | --- |
| `Header` | `Front/src/shared/components/layout/Header.jsx` | 진행 | 탭/우측 아이콘 패리티(모바일 글자크기는 FAB/설정으로 제공) |
| `BottomNav` | `Front/src/shared/components/layout/AdaptiveNavigation.jsx` | 진행 | 탭 구성(홈/가족?/알림/더보기) |
| `FloatingActionButtons` | `Front/src/shared/components/layout/FloatingActionButtons.jsx` | 진행 | 메뉴+음성 + dock 회피 + **글자크기(±, 3단계)** |
| `NextMedCard` | `HeroMedicationCard` | 진행 | 문구/상태/CTA 리듬 정렬 |
| `TodaySummaryCard` | `Front/src/features/dashboard/components/TodaySummaryCard.jsx` | 진행 | 모바일/데스크톱 위치 분기 |
| `ScheduleList` | `TodayMedicationCheckbox` + `MyMedicationSchedule` | 진행 | 리스트 밀도/그룹핑 패리티 |
| `WeeklyStats/Adherence` | `WeeklyStatsWidget` | 진행 | 카드 타이틀/순서/배치 |
| `HistoryTimeline` | `Front/src/features/dashboard/components/HistoryTimelineCard.jsx` | 진행 | RN의 “이전 기록” 타임라인 카드 패리티(시니어 대시보드 적용) |
| `SearchOverlay` | `UnifiedSearchPage` | 진행 | overlay/검색바/최근검색/결과 리듬 + 탭(약/식단) 패리티 |
| `AlertCenter` | `NotificationPage` | 진행 | 알림 센터 2컬럼(하이라이트/리스트) + 긴급 카드 리듬 |

---

## 1.1) 서브 플로우(통합검색/처방전/알림) 갭 체크리스트

### Search (`SearchOverlay` ↔ `UnifiedSearchPage`)
- [x] Search 탭을 RN처럼 `약/식단`으로 전환(증상 탭은 패리티 범위에서 제외)
- [x] RN의 “검색바 + 최근 검색어 + 전체 삭제” 리듬을 Front에도 추가(탭 공통 최근검색)
- [x] RN의 “카메라(촬영) CTA”와 Front의 OCR 진입 동선을 일관되게 통일(알약 탭에서 OCR CTA)
- [x] Search Overlay: 데스크톱 2컬럼(입력/최근 vs 결과) + backdrop 클릭 닫기 금지

### Prescription (`MedicationRegister` ↔ `PrescriptionAddPage`)
- [x] RN의 “약 추가(검색/AI 카메라) 모달 2단계(SEARCH→DETAIL)” UX를 Front 모달과 정렬
- [x] 처방약 카드(이미지/용량/요일/시간) 정보 밀도 및 카드 순서 패리티 강화(1차)
- [ ] 하단 고정 CTA(저장) safe-area + 도크 충돌 회귀 체크(수동 QA에서 일괄)
- [x] Add/Detail 섹션 순서 정렬(처방전 정보 → 복용시간 → 처방약 → 메모/결제) + 약 추가 CTA를 카드 내부 primary로 이동

### Notification (`AlertCenter` ↔ `NotificationPage`)
- [x] 하이라이트(긴급/요약) + 리스트 2컬럼 리듬 도입
- [x] RN처럼 “중요/일반” 섹션 분리 + 기본 접기 상태(중요 펼침/일반 접힘) + 날짜/시간대 그룹핑

---

## 2) 작업 백로그(우선순위)

### P0 — 전체 패리티(레이아웃/구성)
- [x] **Dashboard(시니어)**: Mobile/ Desktop 카드 순서 고정(프로토 기준, 1차)
- [x] **Dashboard(보호자)**: 케어 대상 배너 + 대상 전환 + 메뉴 그리드(6개) 리듬 고정
- [x] **FAB**: 프로토 메뉴 항목/가시 조건/오버레이 패리티(페이지별 노출 규칙 1차)
- [x] **Header/BottomNav**: role별 탭 구성/선택 상태 패리티(1차)

### P1 — 디테일(토큰/밀도)
- [ ] Card padding/radius/shadow를 프로토 기준으로 정렬(“24px 카드” 리듬)
- [ ] Typography 스케일(특히 heading/subtitle) + letterSpacing 규칙 확정
- [ ] List 밀도(행 높이/간격/구분선) 통일
- [x] 글자 크기 3단계(표준/크게/더크게) + 헤더/전역 FAB 컨트롤 패리티

### P2 — 서브 플로우 패리티
- [x] Search: overlay 느낌/최근 검색/결과 리듬(overlay 중심) 2차 정렬
- [x] Alert(Notifications): 중요/일반 섹션 분리 + 날짜/시간대 그룹핑 2차 정렬
- [x] Search: `/search` 라우트에서도 RN 정보 리듬(입력 → 최근 → 결과, 데스크탑 2컬럼) 정렬
- [x] Notification: “같은 메시지/동일 원인” 중복 알림 수집 규칙(클라이언트 1차) 적용
- [x] HistoryTimeline(시니어 복약): RN “이전 기록” 타임라인 카드 1차 도입
- [ ] HistoryTimeline(식단/가족): RN 타임라인 카드 확장 여부 결정
- [x] Caregiver: “최근 활동 로그” 타임라인 1차 도입(활성 어르신 기준)

---

## 3) 실행 순서(권장)

1) RN 화면/컴포넌트 매핑 확정(이 문서 표 보완)  
2) Navigation 패리티 고정(탭/라우트/더보기 동선)  
3) FAB/음성/글자크기(접근성) UX를 RN과 동일하게 고정  
4) Senior → Caregiver 순으로 대시보드 카드 순서/그리드 분기 정렬  
5) Search/Alert 서브 플로우 정렬  
6) 수동 QA 일괄 진행
