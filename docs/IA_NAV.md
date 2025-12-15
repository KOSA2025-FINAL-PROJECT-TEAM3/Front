# IA — Primary Navigation (Senior 3 / Caregiver 4)

목표: 역할별 Top Task 기준으로 1차 내비게이션을 단순화하고, 나머지 기능은 2차 진입(더보기/설정)으로 분리한다.

---

## Senior (3 Tabs)

1) **홈** (`/dashboard`)
   - 오늘 복약/다음 복약 확인 + “복용 완료”
   - 주간 현황 요약

2) **약** (`/medication`, `/prescriptions/*`)
   - 약/처방전 관리, OCR 스캔 진입

3) **가족** (`/family`)
   - 가족 초대/관리, 가족 채팅 진입

---

## Caregiver (4 Tabs)

1) **홈** (`/caregiver`)
   - 가족(시니어) 현황/알림/요약

2) **약** (`/medication`, `/prescriptions/*`)
   - 처방/약 추가·수정·비활성화 관리

3) **가족** (`/family`)
   - 가족 초대/역할 관리

4) **리포트(진입점)** (`/reports/adherence`, `/reports/weekly`)
   - 1차 내비게이션에서 제외하고 **홈(빠른 작업/카드)**에서 강하게 진입한다.

---

## 구현 위치

- Primary nav item 정의: `Front/src/shared/components/layout/primaryNavItems.jsx`
- 렌더링: `Front/src/shared/components/layout/AdaptiveNavigation.jsx`
