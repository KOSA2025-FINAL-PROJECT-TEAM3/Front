# Playwright E2E 계획 (Frontend)

이 문서는 프론트 레포지토리에서 **Playwright 테스트를 “어떤 순서/방식으로” 구축할지**에 대한 실행 계획입니다.  
API 요청/응답 스키마(모킹 JSON 포함)는 `Front/docs/PLAYWRIGHT_API_CONTRACT.md`를 기준으로 합니다.

---

## 1) 목표/원칙

- UI 기능을 **회귀 테스트** 가능하게 만들기(네트워크/외부 API 변동에 흔들리지 않기).
- 기본은 **네트워크 모킹**(안정성/속도). 필요 시에만 “실백엔드 통합(E2E-lite)”을 추가.
- 테스트 실패 원인이 “백엔드 환경”이 아닌 “UI 변경”에 최대한 수렴하도록 설계.

---

## 2) 테스트 타입 분리(권장)

### A. Mock 기반 E2E (기본)
- `page.route('**/*', ...)` + `pathname.startsWith('/api/')` 필터로 URL별 응답을 고정(권장).
- 파일 업로드/AI/외부 API(`/ocr/*`, `/diet/analyze*`, `/medications/search*`)는 무조건 모킹.

### B. Real backend 기반 E2E-lite (선택)
- 가능한 단순화: **core(8082) 직접 호출 + `X-User-Id` 헤더 주입**.
- 게이트웨이/인증까지 포함한 풀스택 E2E는 마지막에 별도 파이프라인으로 분리(불안정/느림).

---

## 3) 구현 순서(우선순위)

> 아래 시나리오들은 `Front/docs/PLAYWRIGHT_API_CONTRACT.md`의 “시나리오 플랜”과 1:1로 매칭됩니다.

1. **Smoke**: 대시보드 진입 + `GET /medications/today` 렌더 확인
2. 약 등록 플로우: `POST /medications/` → `GET /medications/`
3. 복용 완료 플로우: `PATCH /medications/logs/{scheduleId}/complete` → `GET /medications/today`
4. 가족 그룹 플로우: `POST /family/groups` → `GET /family/groups` → `GET /family/groups/{id}`
5. 식단 플로우: `POST /diet/logs` → `GET /diet/logs` → `GET /diet/warnings`

각 시나리오는 “성공 케이스 1개 + 실패 케이스 1개(권한/검증)”를 최소 단위로 합니다.

---

## 4) 모킹 설계(실전 가이드)

### 4.1 라우트 테이블(핵심)
- 테스트 파일에서 URL별 핸들러를 map으로 관리합니다.
- “상태(state)”가 필요한 경우(예: 약 등록 후 목록 반영)에는 **메모리 state**를 둡니다.

주의(중요):
- `page.route('**/api/**', ...)` 패턴은 사용하지 않습니다.
  - Vite/React 환경에서 정적 자원 경로(`/src/**/api/**`)까지 매칭되어 모듈 로딩이 깨질 수 있습니다.
  - 대신 `page.route('**/*')`로 받은 뒤 `resourceType(xhr|fetch|eventsource)` + `pathname.startsWith('/api/')`로 안전하게 필터링합니다.
  - 일부 API는 trailing slash(`/api/foo/`)로 호출될 수 있어 `pathname`을 normalize하는 것이 안전합니다.

권장 state 예시:
- `medications: MedicationResponse[]`
- `today: TodayMedicationResponse`
- `notifications: NotificationResponse[]`
- `dietLogs: DietLogResponse[]`

### 4.2 고정 fixture ID
UI가 특정 요소를 선택할 때, id 기반 상태를 유지하기 위해 아래를 고정합니다.
- `userId=1`, `medicationId=10`, `scheduleId=100`, `familyGroupId=1000`, `familyMemberId=2000` …

### 4.3 에러/권한 케이스
- `ErrorResponse` 포맷으로 고정하여 UI 에러 메시지/토스트를 검증합니다.
- 예: `X-User-Id` 없는 요청을 모킹해서 `401` 반환 → 로그인 유도/에러 UI 확인.

---

## 5) 폴더 구조 제안(프론트)

- `Front/tests/e2e/`
  - `fixtures/`
    - `api.ts` (DTO mock 생성 함수)
    - `state.ts` (메모리 state + reset)
  - `routes/`
    - `mockApiRoutes.ts` (`page.route` 등록 유틸)
  - `specs/`
    - `dashboard.spec.ts`
    - `medications.spec.ts`
    - `family.spec.ts`
    - `diet.spec.ts`

---

## 6) 환경 변수/실행 모드(권장)

### Mock 모드
- 프론트만 실행(Vite) + Playwright는 API 전부 모킹
- 가장 빠르고 안정적

### Real backend 모드(E2E-lite)
- `baseURL`을 core 서비스(8082)로 두고
- 테스트에서 `extraHTTPHeaders`로 `X-User-Id` 등 주입
- 단, UI는 여전히 `/api/**`로 호출할 가능성이 있으니:
  - (권장) Playwright에서 `/api`를 8082로 프록시/리라이트하거나
  - (대안) 게이트웨이(8080)까지 띄우고 `/api/**` 유지

---

## 7) 완료 기준(Definition of Done)

- Smoke + Medication + Family + Diet 시나리오가 CI에서 안정적으로 통과
- 실패 케이스(401/403/400) 최소 1개씩 포함
- 테스트가 외부 API/네트워크/시간에 의존하지 않음(필요 시 시간 고정)
