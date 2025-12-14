# Worklog (Task) — Shared UI 제거 인벤토리 (Workstream 3)

작성일: 2025-12-14  
대상: `Front/`  
참조 문서: `Front/docs/WORKSTREAM_PROCESS.md`, `Front/docs/UX_MUI_REFACTOR_TASKS.md`

---

## 목표

- [x] `src/shared/components/ui/*` 구성 요소 목록/사용처 수량 파악
- [ ] 컴포넌트별 MUI 대체 매핑 정의(우선순위 포함)
- [ ] 우선순위 순으로 치환 → `ui/*` 제거

---

## Shared UI 컴포넌트 목록

- `AiWarningModal.jsx`
- `BackButton.jsx`
- `Button.jsx`
- `Card.jsx` (+ CardHeader/CardBody/CardFooter)
- `FAB.jsx`
- `Icon.jsx`
- `Input.jsx`
- `MenuGroup.jsx`
- `Modal.jsx`
- `QuickActions.jsx`
- `ResponsiveGrid.jsx`
- `RoundedCard.jsx`
- `StatusBadge.jsx`
- `Tabs.jsx`

---

## 사용처 카운트(2025-12-14 스캔)

스캔 기준: `rg \"from '@shared/components/ui\" src`

- `RoundedCard`: 7
- `BackButton`: 6
- `FAB`: 5
- `Modal`: 5
- `Button`: 5
- `QuickActions`: 3
- `Card`: 3
- `AiWarningModal`: 2
- `StatusBadge`: 2
- `Tabs`: 1
- `Icon`: 1
- `MenuGroup`: 1
- `@shared/components/ui`(index export 직접 import): 2

---

## 우선순위(제안)

1) `Button`, `BackButton` (단순 치환 → 전역 영향/효과 큼)  
2) `Modal` (Dialog로 치환, 사용처는 제한적)  
3) `RoundedCard`, `Card`, `StatusBadge` (Paper/Chip 기반으로 정리)  
4) `FAB`, `QuickActions` (SpeedDial/Fab + Grid 패턴으로 재설계 필요)  
5) `Tabs` (MUI Tabs로 직접 치환)  

---

## 후속 작업(체크리스트)

- [ ] 컴포넌트별 “MUI 대체안 + props 매핑표” 작성(필요 시 호환 래퍼의 최소 기간 정의)
- [ ] 사용처가 적은 페이지부터 치환(Errors/More 등) → 대시보드/핵심 플로우로 확장
- [ ] 치환 완료 후 `src/shared/components/ui/*` 삭제 및 import 정리

