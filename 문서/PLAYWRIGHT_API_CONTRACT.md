# Spring Boot API 계약 (Request/Response DTO) - Front Playwright 테스트용

이 문서는 프론트 레포지토리에서 Playwright 테스트 작성에 바로 쓰기 위해 `Front/docs/`로 이동했습니다.

프론트엔드에서 Playwright(E2E) 테스트를 작성할 때, **네트워크 모킹/실서버 호출** 모두에 사용할 수 있도록 Spring Boot(코어 서비스, `8082`)의 **요청/응답 DTO 스키마**와 **요청 처리 규칙**을 정리한 문서입니다.

> 컨트롤러 기준: `spring-boot/src/main/java/com/amapill/backend/domain/**/api/*Controller.java`
>
> DTO 기준: `spring-boot/src/main/java/com/amapill/backend/domain/**/application/dto/**`

---

## 0) 테스트 관점의 권장 전략 (Playwright 계획)

### A. UI/E2E “모킹 기반” (가장 안정적)
- Playwright에서 `page.route('**/*', ...)`를 사용하고 `pathname.startsWith('/api/')`로 필터링해 백엔드 응답을 고정(권장).
- **외부 의존(OpenAI/MFDS/DUR/Google Vision/S3/Kafka/Redis)** 을 모두 우회 가능.
- 이 문서의 DTO 예시 JSON을 그대로 `fulfill({ json })`에 사용.

### B. UI/E2E “백엔드 실호출” (데이터/환경 세팅 필요)
- 게이트웨이(8080) + auth-service(8081) + core(8082)까지 띄우고, 실제 로그인 토큰 기반으로 호출.
- 또는 **코어 서비스(8082) 직접 호출 + `X-User-*` 헤더를 테스트에서 강제로 주입**(권장).
  - 코어 서비스는 JWT를 직접 파싱하지 않고, 게이트웨이가 넣어주는 `X-User-*` 헤더만 신뢰합니다(`SecurityUtil`).

---

## 1) Base URL / 라우팅

### 게이트웨이 경유(프론트 실제 경로)
- 프론트 기준 호출: `/api/**`
- 게이트웨이가 `/api`를 제거하고 코어 서비스(8082)로 전달: 예) `/api/medications` → core `/medications`

### 코어 서비스 직접 호출(테스트 단순화)
- base: `http://localhost:8082`
- path: 컨트롤러에 선언된 경로 그대로 사용(예: `/medications`, `/family`, `/diet`)

---

## 2) 인증/인가: `X-User-*` 헤더 규칙 (Playwright에서 가장 중요)

코어 서비스는 `SecurityUtil`로 아래 헤더를 읽습니다.

### 필수 헤더
- `X-User-Id: <number>` (**없으면 401**)

### 선택 헤더(일부 기능/로그에서 사용)
- `X-User-Email: <string>`
- `X-User-Name: <string>` (게이트웨이에서 URL 인코딩될 수 있음; 서버에서 디코딩 시도)
- `X-User-Role: <string>` (예: `ROLE_USER`)
- `X-Customer-Role: <string>` (예: `CAREGIVER`/`SENIOR`)

### Playwright 예시(코어 직접 호출)
```ts
// playwright.config.ts 또는 test setup
use: {
  baseURL: 'http://localhost:8082',
  extraHTTPHeaders: {
    'X-User-Id': '1',
    'X-User-Email': 'e2e@example.com',
    'X-User-Name': encodeURIComponent('E2E User'),
    'X-User-Role': 'ROLE_USER',
    'X-Customer-Role': 'CAREGIVER',
  },
}
```

---

## 3) 공통 응답 타입

### 3.1 ErrorResponse (전역 예외 포맷)
파일: `spring-boot/src/main/java/com/amapill/backend/global/exception/ErrorResponse.java`

```json
{
  "code": "MEDICATION_001",
  "message": "약 정보를 찾을 수 없습니다.",
  "status": 404,
  "timestamp": "2025-12-14T09:00:00",
  "details": "optional"
}
```

### 3.2 ApiResponse<T> (일부 API만 사용: OCR)
파일: `spring-boot/src/main/java/com/amapill/backend/domain/common/application/dto/response/ApiResponse.java`

```json
{ "success": true, "message": "Success", "data": { /* T */ } }
```

### 3.3 JobResponse<T> (비동기 Job)
파일: `spring-boot/src/main/java/com/amapill/backend/domain/common/application/dto/response/JobResponse.java`

```json
{
  "jobId": "job_123",
  "status": "PENDING",
  "result": null,
  "error": null
}
```

### 3.4 상태 코드/실패 포맷 규칙 (테스트 기대값)
- 성공 응답: 컨트롤러가 `ResponseEntity`로 바로 DTO를 반환하는 형태가 대부분입니다. (예외: OCR은 `ApiResponse<T>` 래퍼)
- 자주 쓰는 성공 코드:
  - `200 OK`: 조회/수정/액션 성공
  - `201 Created`: 생성 성공 (`POST /medications/`, `POST /medications/logs`, `POST /prescriptions`, `POST /diet/logs`, `POST /diet/logs/image`)
  - `202 Accepted`: 비동기 Job 생성 (`/diet/analyze/jobs`, `/ocr/scan/jobs`)
  - `204 No Content`: 삭제/취소 등 body 없음
- 실패 응답(JSON):
  - 대부분 `ErrorResponse`를 반환합니다(`GlobalExceptionHandler`, `InviteExceptionHandler`).
  - 단, 컨트롤러에서 `IllegalArgumentException` 등을 직접 던지는 경로는 `500`으로 떨어질 수 있으므로(E2E 모킹 시) 의도적으로 `400 ErrorResponse`로 고정하는 편이 안전합니다.

---

## 4) 날짜/시간 직렬화 포맷

- `LocalDate`: `"yyyy-MM-dd"` (예: `"2025-12-14"`)
- `LocalTime`: `"HH:mm:ss"` 또는 `"HH:mm"` 형태로 들어올 수 있음(처방전 `intakeTimes`)
- `LocalDateTime`: ISO-8601 (예: `"2025-12-14T09:30:00"`)
- `Instant`: ISO-8601 (예: `"2025-12-14T00:00:00Z"`) — 채팅 메시지 `createdAt`

---

## 5) Medication (약 관리)

컨트롤러: `spring-boot/src/main/java/com/amapill/backend/domain/medication/api/MedicationController.java`

### 5.1 `POST /medications/` 약 등록
- Auth: `X-User-Id` 필요
- Request DTO: `MedicationRequest`
  - `name?: string` (max 200)
  - `ingredient?: string` (max 500)
  - `dosage?: string` (max 100)
  - `timing?: string` (max 100)
  - `startDate?: string(yyyy-MM-dd)`
  - `endDate?: string(yyyy-MM-dd)`
  - `quantity?: number` (min 0)
  - `remaining?: number` (min 0)
  - `expiryDate?: string(yyyy-MM-dd)`
  - `active?: boolean`
  - `notes?: string`
  - `schedules?: MedicationScheduleRequest[]`
    - `time: string(HH:mm:ss)`
    - `daysOfWeek?: string` (예: `"1,2,3,4,5"` 또는 `"MON,TUE"`)
    - `active?: boolean` (default true)
- Response(201): `MedicationResponse`

Mock 예시(응답):
```json
{
  "id": 10,
  "userId": 1,
  "prescriptionId": null,
  "name": "타이레놀",
  "ingredient": "아세트아미노펜",
  "dosage": "1정",
  "timing": "식후",
  "startDate": "2025-12-14",
  "endDate": "2025-12-20",
  "quantity": 21,
  "remaining": 21,
  "expiryDate": "2026-12-31",
  "notes": "졸림 주의",
  "imageUrl": null,
  "active": true,
  "schedules": [
    {
      "id": 100,
      "medicationId": 10,
      "time": "07:00:00",
      "daysOfWeek": "1,2,3,4,5,6,7",
      "active": true,
      "isTakenToday": false,
      "createdAt": "2025-12-14T09:00:00"
    }
  ],
  "createdAt": "2025-12-14T09:00:00",
  "updatedAt": "2025-12-14T09:00:00",
  "hasLogsToday": false
}
```

### 5.2 `GET /medications/` 내 약 목록 조회
- Response(200): `MedicationResponse[]`

### 5.3 `PATCH /medications/{id}` 약 수정(부분 수정)
- Request/Response: `MedicationRequest` / `MedicationResponse`

### 5.4 `DELETE /medications/{id}` 약 삭제
- Response(204): body 없음

### 5.5 `GET /medications/today` 오늘 복용 스케줄
- Response(200): `TodayMedicationResponse`
  - `date: string(yyyy-MM-dd)`
  - `medications: MedicationWithSchedules[]`
  - `totalScheduled: number`
  - `totalCompleted: number`
  - `completionRate: number`

Mock 예시:
```json
{
  "date": "2025-12-14",
  "medications": [
    {
      "medicationId": 10,
      "name": "타이레놀",
      "dosage": "1정",
      "imageUrl": null,
      "schedules": [
        {
          "scheduleId": 100,
          "time": "07:00:00",
          "scheduledTime": "2025-12-14T07:00:00",
          "completed": false,
          "completedTime": null
        }
      ]
    }
  ],
  "totalScheduled": 1,
  "totalCompleted": 0,
  "completionRate": 0.0
}
```

### 5.6 `GET /medications/search?itemName=...&numOfRows=10` (MFDS 프록시)
- Response(200): `DrugInfoResponse[]` (필드가 많음)
  - 주요 필드: `itemSeq`, `itemName`, `entpName`, `itemImage`, `efcyQesitm`, `useMethodQesitm` 등

### 5.7 `GET /medications/search/ai?itemName=...` (AI 생성)
- Response(200): `DrugInfoResponse`
- 테스트에서는 외부 호출(OpenAI) 회피를 위해 **프론트 모킹 권장**

### 5.8 `GET /medications/{productCode}/safety` (DUR)
- Response(200): `DrugSafetyInfoResponse`
  - `productCode: string`
  - `combinationTaboo: DURItem[]`
  - `pregnancyTaboo: DURItem[]`
  - `ageTaboo: DURItem[]`
  - `elderlyWarning: DURItem[]`

---

## 6) Medication Logs (복용 기록/순응도)

컨트롤러: `spring-boot/src/main/java/com/amapill/backend/domain/medication/api/MedicationLogController.java`

### 6.1 `POST /medications/logs` 복용 기록 생성
- Request DTO: `MedicationLogRequest`
  - `medicationId: number` (required)
  - `medicationScheduleId?: number`
  - `scheduledTime: string(date-time)` (required)
  - `completed: boolean` (required)
- Response(201): `MedicationLogResponse`

### 6.2 `GET /medications/logs?date=YYYY-MM-DD` 내 복용 기록 조회
- Response(200): `MedicationLogResponse[]`

### 6.3 `PATCH /medications/logs/{scheduleId}/complete` 스케줄 복용 완료 처리
- Response(200): `MedicationLogResponse`

### 6.4 `GET /medications/logs/adherence/summary?days=30` 요약
- Response(200): `AdherenceSummaryResponse`

### 6.5 `GET /medications/logs/adherence/daily?startDate=...&endDate=...`
- Response(200): `DailyAdherenceResponse[]`

### 6.6 `GET /medications/logs/adherence/medication/{medicationId}?days=30`
- Response(200): `AdherenceSummaryResponse`

---

## 7) Prescriptions (처방전)

컨트롤러: `spring-boot/src/main/java/com/amapill/backend/domain/medication/api/PrescriptionController.java`

### 7.1 `POST /prescriptions` 처방전 등록
- Request DTO: `PrescriptionRequest`
  - `pharmacyName?: string` (max 100)
  - `hospitalName?: string` (max 100)
  - `startDate: string(yyyy-MM-dd)` (required)
  - `endDate: string(yyyy-MM-dd)` (required)
  - `intakeTimes: string[]` (required, min 1, max 10)
  - `medications: MedicationInPrescription[]` (required, min 1)
    - `name: string` (required)
    - `category?: string`
    - `dosageAmount: number` (required, min 1)
    - `totalIntakes?: number`
    - `daysOfWeek?: string`
    - `intakeTimeIndices?: number[]`
    - `notes?: string`
    - `imageUrl?: string`
  - `paymentAmount?: number`
  - `notes?: string` (max 1000)
- Response(201): `PrescriptionDetailResponse` (처방전 + `MedicationResponse[]`)

### 7.2 `GET /prescriptions` 내 처방전 목록
- Response(200): `PrescriptionResponse[]`

### 7.3 `GET /prescriptions/{id}` 처방전 상세
- Response(200): `PrescriptionDetailResponse`

### 7.4 `PUT /prescriptions/{id}` 처방전 수정(전체)
- Request/Response: `PrescriptionRequest` / `PrescriptionDetailResponse`

### 7.5 `DELETE /prescriptions/{id}` 처방전 삭제
- Response(204)

### 7.6 `POST /prescriptions/{id}/medications` 처방전에 약 추가
- Request: `PrescriptionRequest.MedicationInPrescription`
- Response(201): `MedicationResponse`

### 7.7 `DELETE /prescriptions/{id}/medications/{medicationId}` 처방전에서 약 제거
- Response(204)

### 7.8 `PATCH /prescriptions/{id}/toggle-active` 복용 중단/재개
- Response(200): `PrescriptionDetailResponse`

---

## 8) Reports (리포트)

컨트롤러: `spring-boot/src/main/java/com/amapill/backend/domain/report/api/ReportController.java`

### `GET /reports/adherence?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- Response(200): `AdherenceReportResponse`

---

## 9) Diet (식단/상호작용)

컨트롤러: `spring-boot/src/main/java/com/amapill/backend/domain/diet/api/DietController.java`

### 9.1 `POST /diet/logs` 식단 기록 등록
- Request DTO: `DietLogRequest`
  - `mealType: "breakfast" | "lunch" | "dinner" | "snack"` (required)
  - `foodName: string` (required, max 200)
  - `overallLevel?: string` (예: `GOOD|WARNING|DANGER`)
  - `summary?: string`
  - `drugInteractions?: string` (JSON 문자열)
  - `diseaseInteractions?: string` (JSON 문자열)
  - `imageUrl?: string` (max 500)
- Response(201): `DietLogResponse`

### 9.2 `GET /diet/logs?userId=...` 식단 목록
- 본인 또는 caregiver가 family 권한이 있으면 타인 조회 가능
- Response(200): `DietLogResponse[]`

### 9.3 `PATCH /diet/logs/{logId}` 식단 수정
- Request/Response: `DietLogRequest` / `DietLogResponse`

### 9.4 `DELETE /diet/logs/{logId}` 식단 삭제
- Response(204)

### 9.5 `POST /diet/logs/image` 식단 이미지 업로드 (multipart)
- Request: `multipart/form-data` with `file`
- Response(201): `DietImageUploadResponse { imageUrl: string }`
- 테스트에서는 S3 업로드가 포함되므로 **모킹 권장**

### 9.6 `POST /diet/analyze` 음식 이미지/텍스트 분석 (multipart)
- Request: `multipart/form-data`
  - `file?`: 이미지 파일(optional)
  - `mealType`: string(required)
  - `foodName`: string(required)
- Response(200): `DietAnalysisResponse`
  - `isFood: boolean`
  - `foodName: string`
  - `mealType: string`
  - `overallLevel: "GOOD"|"WARNING"|"DANGER"`
  - `drugInteractions: DrugInteractionResult[]`
  - `diseaseInteractions: DiseaseInteractionResult[]`
  - `summary: string`

### 9.7 `POST /diet/analyze/jobs` 비동기 분석 Job 생성
- Response(202): `JobResponse<Void>`

### 9.8 `GET /diet/analyze/jobs/{jobId}` Job 상태 조회
- Response(200): `JobResponse<DietAnalysisResponse>`

### 9.9 `GET /diet/warnings` 약-음식 충돌 경고 조회
- Response(200): `DietWarningResponse[]`

---

## 10) OCR (처방전/약 이미지 분석)

컨트롤러: `spring-boot/src/main/java/com/amapill/backend/domain/ocr/api/OcrController.java`

> OCR 계열은 `ApiResponse<T>` 래퍼를 사용합니다.

### 10.1 `POST /ocr/scan` 처방전 스캔(동기)
- Request: `multipart/form-data` with `file`
- Response(200): `ApiResponse<OCRResponse>`

### 10.2 `POST /ocr/scan/jobs` 처방전 스캔(비동기)
- Response(202): `JobResponse<Void>`

### 10.3 `GET /ocr/scan/jobs/{jobId}` OCR Job 조회
- Response(200): `JobResponse<OCRResponse>`

### 10.4 `POST /ocr/extract` 약물 이미지 OCR
- Request: `multipart/form-data` with `file`
- Response(200): `ApiResponse<OCRResponse>`

Mock 예시(`ApiResponse<OCRResponse>`):
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "success": true,
    "medications": [
      {
        "name": "타이레놀",
        "dosage": "1정",
        "frequency": "1일 3회",
        "duration": "7일",
        "category": "해열진통제",
        "sideEffects": null,
        "precautions": "식후 복용",
        "interactions": null,
        "imageUrl": null
      }
    ],
    "clinicName": "OO의원",
    "hospitalName": "OO의원",
    "pharmacyName": "OO약국",
    "totalAmount": "15000",
    "paymentAmount": 15000,
    "confidence": 0.8,
    "rawText": null,
    "ocrEngine": "mock",
    "processingTime": 0.1,
    "errorMessage": null
  }
}
```

---

## 11) Disease (질병)

컨트롤러: `spring-boot/src/main/java/com/amapill/backend/domain/disease/api/DiseaseController.java`

### 11.1 `POST /disease` 질병 등록
- Request DTO: `DiseaseRequest`
  - `name: string` (required)
  - `code?: string`
  - `diagnosedAt?: string(yyyy-MM-dd)`
  - `isDiagnosedDateUnknown?: boolean`
  - `status?: string`
  - `isPrivate?: boolean`
  - `isCritical?: boolean`
  - `description?: string`
- Response(201): `DiseaseResponse`

### 11.2 `GET /disease/user/{userId}` 사용자 질병 목록
- Response(200): `DiseaseResponse[]`

### 11.3 `GET /disease/{id}` 질병 상세
- Response(200): `DiseaseResponse`

### 11.4 `PUT /disease/{id}` 질병 수정
- Request/Response: `DiseaseRequest` / `DiseaseResponse`

### 11.5 `DELETE /disease/{id}` 질병 삭제(소프트)
- Response(204)

### 11.6 `POST /disease/{id}/restore` 질병 복원
- Response(200) body 없음

### 11.7 `POST /disease/{diseaseId}/medications/{medicationId}` 질병-약 연결
- Response(200) body 없음

### 11.8 `DELETE /disease/{diseaseId}/medications/{medicationId}` 연결 해제
- Response(204)

### 11.9 `GET /disease/user/{userId}/export/pdf`
- Response(200): `application/pdf` (바이너리)

### 11.10 `GET /disease/user/{userId}/trash` / `DELETE /disease/user/{userId}/trash`
- Response(200): `DiseaseResponse[]` / Response(204)

---

## 12) Family (가족 그룹/모니터링)

컨트롤러: `spring-boot/src/main/java/com/amapill/backend/domain/family/api/FamilyController.java`

### 12.1 `POST /family/groups` 가족 그룹 생성
- Request DTO: `FamilyGroupRequest { name: string, familyRole?: string }`
- Response(201): `FamilyGroupResponse`

### 12.2 `GET /family/groups` 내 그룹 목록
- Response(200): `FamilyGroupResponse[]`

### 12.3 `GET /family/groups/{id}` 그룹 상세
- Response(200): `FamilyGroupResponse`

### 12.4 `POST /family/groups/{id}/members` 구성원 초대(레거시)
- Request DTO: `FamilyMemberInviteRequest { email: string, familyRole: string }`
- Response(200): `FamilyGroupResponse`

### 12.5 `GET /family/groups/{id}/members` 구성원 목록(그룹 상세 재사용)
- Response(200): `FamilyGroupResponse`

### 12.6 `DELETE /family/members/{id}` 구성원 제거/탈퇴
- Response(204)

### 12.7 `PUT /family/members/{memberId}/role` 멤버 역할 변경
- Request DTO: `UpdateMemberRoleRequest { familyRole: string, newOwnerMemberId?: number }`
- Response(200) body 없음

### 12.8 `DELETE /family/groups/{id}` 그룹 삭제(해산)
- Response(204)

### 12.9 `GET /family/members/{userId}/medications` 가족 구성원 약 조회(모니터링)
- Response(200): `MedicationResponse[]`

### 12.10 `GET /family/members/{userId}/medications/logs?date=&status=&limit=30` 복약 로그(모니터링)
- Response(200): `MedicationLogsResponse`

### 12.11 `GET /family/members/{userId}/medications/{medicationId}` 약 세부(모니터링)
- Response(200): `MedicationDetailResponse`

---

## 13) Family Invite (Double Code System)

컨트롤러: `spring-boot/src/main/java/com/amapill/backend/domain/family/api/FamilyInviteController.java`,
`spring-boot/src/main/java/com/amapill/backend/domain/family/api/PublicInviteController.java`

### 13.1 (인증) `POST /family/invites` 초대 생성
- Request DTO: `CreateInviteRequest`
  - `groupId: number` (required)
  - `intendedForEmail?: string` (alias: `email`)
  - `suggestedRole: "SENIOR"|"CAREGIVER"` (alias: `role`)
  - `name?: string`
- Response(200): `InviteResponse { id, shortCode, longToken, expiresAt }`

### 13.2 (인증) `POST /family/invites/accept` 초대 수락
- Request DTO: `AcceptInviteRequest { shortCode?: string, token?: string }`
- Response(200): `AcceptInviteResponse { memberId, groupId, groupName, role }`

### 13.3 (인증) `GET /family/invites?groupId=...` 내가 만든 초대 목록
- Response(200): `InvitationDetailResponse[]`

### 13.4 (인증) `PUT /family/invites/{inviteId}` 초대 역할 수정
- Request DTO: `UpdateInviteRequest { suggestedRole: "SENIOR"|"CAREGIVER" }`
- Response(204)

### 13.5 (인증) `DELETE /family/invites/{inviteId}` 초대 취소
- Response(204)

### 13.6 (공개) `GET /family/public/invites/start?token=...`
- Response(200): `StartInviteResponse { shortCode, suggestedRole, groupName, inviterName, expiresAt }`
- Side effect: `Set-Cookie: invite_short_code=...; HttpOnly; Path=/; Max-Age=86400`

### 13.7 (공개) `GET /family/public/invites/info?code=...`
- Response(200): `StartInviteResponse`

---

## 14) Notifications (알림 + 설정)

컨트롤러: `spring-boot/src/main/java/com/amapill/backend/domain/notification/api/NotificationController.java`,
`spring-boot/src/main/java/com/amapill/backend/domain/notification/api/NotificationSettingsController.java`,
`spring-boot/src/main/java/com/amapill/backend/domain/family/api/FamilyNotificationSettingsController.java`

### 14.1 `GET /notifications` 알림 목록
- Response(200): `NotificationResponse[]`

### 14.2 `PATCH /notifications/{id}/read` 읽음 처리
- Response(200): `NotificationResponse`

### 14.3 `DELETE /notifications/{id}` 삭제
- Response(204)

### 14.4 `GET /notifications/subscribe?token=...` SSE 구독
- Response: `text/event-stream`
- 테스트/Playwright에서는 보통 **구독 자체를 차단하거나 모킹**하는 편이 안정적입니다.

### 14.5 `GET /notifications/settings` / `PUT /notifications/settings`
- Response(200): `NotificationSettingsDto`

### 14.6 `GET /family/{familyGroupId}/members/{targetUserId}/notification-settings`
###      `PUT /family/{familyGroupId}/members/{targetUserId}/notification-settings`
- Response(200): `FamilyNotificationSettingsDto`

---

## 15) Chat (가족 채팅 REST)

컨트롤러: `spring-boot/src/main/java/com/amapill/backend/domain/chat/api/FamilyChatRestController.java`

### 15.1 `GET /family-chat/rooms/{familyGroupId}/messages?page=0&size=50`
- Response(200): `FamilyChatMessageResponse[]`

### 15.2 `GET /family-chat/rooms/{familyGroupId}/init?familyMemberId=...`
- Response(200): `FamilyChatInitialLoadResponse`

### 15.3 `POST /family-chat/rooms/{familyGroupId}/messages`
- Request: `FamilyChatMessageRequest`
- Response(201): `FamilyChatMessageResponse`

### 15.4 `GET /family-chat/rooms/{familyGroupId}/messages/search?keyword=...`
- Response(200): `FamilyChatMessageResponse[]`

### 15.5 `POST /family-chat/rooms/{familyGroupId}/messages/image`
- Request: `multipart/form-data` with `file`, `familyMemberId`, `content?`
- Response(200): `string` (imageUrl)

---

## 16) Voice / Symptom AI / Admin

### 16.1 `POST /voice/process`
- Request: `VoiceCommandRequest { text: string }`
- Response: `VoiceCommandResponse { type, message, target, actionCode, parameters }`

### 16.2 `GET /medications/search/symptoms/ai?query=...`
- Response: `SymptomAiResponse`
- 테스트에서는 외부 호출(OpenAI) 회피를 위해 **모킹 권장**

### 16.3 `GET /admin/abuse/users/{userId}` / `POST /admin/abuse/users/{userId}/reset`
- Response: `AbuseStatusResponse` / `200 OK`

---

## 17) Playwright 모킹 체크리스트

- `Authorization`(JWT) 흐름 대신, 테스트에서 **코어(8082) 직접 호출 + `X-User-Id` 헤더**로 단순화.
- 외부 의존이 있는 엔드포인트(`/ocr/*`, `/diet/analyze*`, `/medications/search*`)는 기본적으로 모킹.
- 파일 업로드(multipart)는 UI에서만 트리거하고, 네트워크는 `route.fulfill()`로 대체.
- 실패 케이스 테스트는 `ErrorResponse` 포맷으로 `status`/`code`를 고정해 검증.

---

## 18) Playwright E2E 시나리오 플랜(권장 우선순위)

### 공통: 테스트 데이터(고정 fixture) 권장값
- `userId`: `1` (기본 로그인 사용자)
- `familyGroupId`: `1000`
- `familyMemberId`: `2000`
- `medicationId`: `10`
- `medicationScheduleId`: `100`
- `notificationId`: `500`
- `dietLogId`: `700`

### 시나리오 1: “대시보드 기본 진입 + 오늘 복용” (최우선 smoke)
1. `GET /medications/today` → `TodayMedicationResponse`로 “오늘 스케줄” 카드 렌더 확인
2. (선택) `GET /notifications` → 알림 뱃지/리스트 렌더 확인

### 시나리오 2: “약 등록 → 목록 반영”
1. `POST /medications/` → `MedicationResponse`(201)
2. `GET /medications/` → 등록된 약이 포함된 배열
3. (선택) `GET /medications/today` → 스케줄이 오늘 카드에 반영되는지

### 시나리오 3: “복용 완료 처리”
1. `PATCH /medications/logs/{scheduleId}/complete` → `MedicationLogResponse`
2. `GET /medications/today` → 해당 스케줄 `completed: true`로 반영
3. `GET /medications/logs/adherence/summary` → 요약 수치 업데이트(모킹이면 고정값)

### 시나리오 4: “가족 그룹 생성 → 멤버 조회”
1. `POST /family/groups` → `FamilyGroupResponse`(201)
2. `GET /family/groups` → 배열에 생성 그룹 포함
3. `GET /family/groups/{id}` → 멤버 목록 렌더(생성자 포함)

### 시나리오 5: “초대 생성 → 초대 수락(퍼블릭)”
1. (인증) `POST /family/invites` → `InviteResponse`(200)
2. (공개) `GET /family/public/invites/start?token=...` → `StartInviteResponse`(+ 쿠키)
3. (인증) `POST /family/invites/accept` → `AcceptInviteResponse`

### 시나리오 6: “식단 기록 + 경고 렌더”
1. `POST /diet/logs` → `DietLogResponse`(201)
2. `GET /diet/logs` → 기록이 목록에 노출
3. `GET /diet/warnings` → `DietWarningResponse[]` 렌더

---

## 19) Playwright 네트워크 모킹 템플릿(실전 패턴)

### 19.1 “라우트 테이블” 방식(추천)
- 테스트가 커질수록, URL별로 핸들러를 딕셔너리로 분리하면 유지보수가 쉽습니다.
- 특히 `GET /medications/today`, `GET /medications/`, `POST /medications/`, `PATCH /medications/logs/*` 는 UI flow에서 반복 호출되는 경우가 많습니다.

예시(개념):
```ts
await page.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  const method = route.request().method();

  if (method === 'GET' && url.pathname.endsWith('/api/medications/today')) {
    return route.fulfill({ status: 200, json: /* TodayMedicationResponse */ {} });
  }

  return route.continue();
});
```

### 19.2 multipart 업로드는 “UI만 테스트 + 응답 모킹”
- `POST /ocr/*`, `POST /diet/*/image`, `POST /diet/analyze*`, `POST /family-chat/*/image`
- 파일 업로드 자체는 Playwright에서 파일 선택/드래그 UI를 검증하고,
- 네트워크는 즉시 `200/201`로 `imageUrl` 또는 `ApiResponse<OCRResponse>`를 반환하도록 모킹하는 편이 안정적입니다.

---

## 20) 인가(권한) 규칙 요약(실패 케이스 설계용)

- `X-User-Id` 누락/파싱 실패: `401` (`ErrorCode.UNAUTHORIZED`)
- `GET /diet/logs?userId=다른사람`
  - caregiver가 같은 가족 그룹이면 허용
  - 아니면 `403` (`DIET_LOG_UNAUTHORIZED`)
- `GET /family/members/{userId}/medications*` 모니터링
  - 같은 가족 그룹이거나 본인이면 허용
  - 아니면 `403` (`FAMILY_MEMBER_UNAUTHORIZED`)
