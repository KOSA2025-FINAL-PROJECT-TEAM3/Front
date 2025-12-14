# AMA...Pill Frontend 리팩토링 작업 방식 (Workstreams)

작성일: 2025-12-12  
대상: `Front/` MUI 전면 전환 + UX/IA 재설계

---

## 1. 목적

- 도메인별로 분리 가능한 작업을 **병렬 분석/설계 → 순차 머지** 방식으로 진행한다.
- UI/UX 전환 중에도 **기존 JS 동작, 상태, 라우트 호환을 유지**한다.
- Tailwind는 제거하고, MUI Theme 기반 디자인 시스템을 단일 소스로 고정한다.
- Senior/Caregiver 사용성을 최우선으로, 접근성/동적 타입/모션까지 포함해 완성한다.

---

## 2. 작업 페르소나(역할)

### 2.1 Frontend Engineer
- 기능 동작 유지, 구조/성능/접근성 기준 충족.
- MUI 전환, 라우트/상태/데이터 흐름 정합성 보장.

### 2.2 Frontend UI/UX Designer
- Senior/Caregiver 각각의 **정보 구조(IA), 화면 구성, 시각/상호작용 설계** 책임.
- **페이지 전환/이동 애니메이션, 마이크로 인터랙션** 설계.
- Apple HIG 기반 타이포/터치/동적 타입 규칙을 토큰화하고 개발과 합의.

---

## 3. Workstream 분리

각 스트림은 “서로 독립적으로 설계/스캔 가능하고, 코드 머지는 의존성 순서로 진행”한다.

1) **AppShell/Navigation**
   - `MainLayout` → MUI 기반 AppShell.
   - Senior 3탭 / Caregiver 4탭 내비 적용.
   - `AdaptiveNavigation` 표준화.
   - 가족 채팅 목록 라우트/리다이렉트(`/chat` → `/chat/family`).
   - `VoiceAssistant` 가드(카메라/OCR·식단 카메라, 지도/병원검색).

2) **Accessibility/Theme**
   - `theme.js` 확장: Noto Sans KR, role accent, 기본 컴포넌트 오버라이드.
   - **확대모드(접근성 테마 스위칭)**: 설정 토글, 계정 귀속 저장(P0), Senior 기본 ON / Caregiver 기본 OFF.
   - Apple HIG 기준 타이포/터치/동적 타입을 Theme 토큰으로 정의.

3) **Shared UI 제거**
   - `src/shared/components/ui/*` 사용처를 **직접 MUI 컴포넌트로 치환**.
   - 잔존 레거시 스타일만 `*.module.css`로 최소 유지.

4) **Feature P0 마이그레이션**
   - Dashboard(Senior/Caregiver), Prescriptions/Medication, Family/Invite/Chat,
     OCR/Diet/Camera, Disease/Search/Hospitals.
   - 각 feature는 서로 독립적으로 UI/UX 전환 가능.
   - OCR 완료 후 약봉투 클릭 시 결과가 “튀어나오는” 등 **마이크로 인터랙션 P0 포함**.

5) **Cleanup/Docs**
   - Tailwind 제거, `sass` 제거, SCSS 잔존 `module.css` 정리.
   - 라우트/IA/DesignSystem/Motion 가이드 문서 갱신.

---

## 4. 병렬 처리 원칙

### 4.1 병렬 가능한 작업
- 여러 파일/폴더 스캔 및 현황 조사.
- 도메인별 UX 플로우/컴포넌트 목록화.
- IA/와이어프레임/모션 스펙 초안.
- API 계약 정의(기존과 충돌 없는 범위).

### 4.2 순차로 머지해야 하는 작업
- 동일 파일/모듈 수정은 충돌을 피하기 위해 단일 스트림으로 처리.
- AppShell/Theme처럼 **전역 영향이 큰 변경을 먼저 머지**한 뒤 feature 작업을 진행.

---

## 5. 머지/실행 순서

1. **AppShell/Navigation**  
2. **Accessibility/Theme**  
3. **Shared UI 제거**  
4. **Feature P0 마이그레이션**(설계/스캔은 병렬, 머지는 feature 단위 순차)  
5. **Cleanup/Docs**

---

## 6. UI/UX 기준(Apple HIG 참조)

### 6.1 Typography 기준
- 본문 기본: **17pt** (웹에서는 약 16–17px/1rem 기준으로 매핑).
- 제목/소제목 계층:
  - 제목(H1): **28pt**
  - 소제목(H2/H3): **18–22pt**
  - 캡션/보조: **10–13pt**
- 버튼 레이블: **17pt**, Medium 또는 Semibold.
- **동적 타입(Dynamic Type)** 지원:
  - 사용자 설정(확대모드) 변화에 따라 타이포/간격이 **비율 기반으로 함께 스케일링**되어야 한다.

### 6.2 Touch/Hit Target 기준
- 최소 터치 영역: **44×44pt**(CSS 최소 44px에 준함).
- Senior 화면은 기본 확대모드 ON으로 터치 타겟/간격이 자동 확대되도록 한다.

---

## 7. 모션/인터랙션 기준

- 페이지 전환: MUI Transition(예: Fade/Slide) 기반으로 **짧고 예측 가능한 이동** 제공.
- 리스트→상세→편집 플로우는 동일 패턴(enter/exit 방향)으로 통일.
- 마이크로 인터랙션:
  - OCR 완료 후 약봉투 카드 클릭 시 **결과 패널이 확장/튀어나오는 애니메이션**.
  - 복약 완료/체크 시 상태 Chip/Progress가 즉시 피드백.
- 카메라/지도 같은 집중 모드에서는 **모션 최소화 + VoiceAssistant 비노출**.

---

## 8. 변경 원칙/DoD

- Tailwind class 0건, `*.module.scss` 0건(잔존 스타일은 `*.module.css`).
- 모든 화면이 MUI Theme 토큰/컴포넌트 기반.
- Senior/Caregiver IA가 AppShell에서 일관 동작.
- 확대모드 저장/복원, 모바일 접근성(대비/타깃) 충족.
- 주요 P0 플로우 수동 E2E 통과(복약완료/약등록/가족초대/채팅/병원검색/OCR).

---

## 9. 진행 현황 (Worklogs)

- 2025-12-14: AppShell/Navigation Spike — `Front/docs/WORKLOG_2025-12-14_APP_SHELL_NAV_SPIKE.md`
