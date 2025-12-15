# Spring Boot Controller 엔드포인트 ↔ Front API 비교 리포트

작성일: 2025-12-15 07:54

## 스캔 범위
- Backend: `spring-boot/src/main/java/**/**Controller.java` (18 files)
- Front: `Front/src/core/services/api/*ApiClient.js` (16 files)

## 요약
- Backend 추출 엔드포인트(중복 제거): 83
- Front 추출 엔드포인트(중복 제거, 클라이언트 기준): 85
- Front → SpringBoot 미매칭(전체): 17
  - 타 서비스로 추정(인증/채팅 등): 14
  - SpringBoot 불일치(검증 필요): 3
- SpringBoot → Front 미사용(참고): 15

## Front → SpringBoot 불일치(검증 필요)
- `GET` `/api/notifications/{id}` → `/notifications/{id}` / `src\core\services\api\notificationApiClient.js`
- `POST` `/api/reports/adherence` → `/reports/adherence` / `src\core\services\api\reportApiClient.js`
- `GET` `/api/reports/weekly` → `/reports/weekly` / `src\core\services\api\reportApiClient.js`

## 프론트에서는 엔드포인트 무조건 /api를 붙여야 함

## /counsel => 의사 상담 관련이라면 필요없으니 삭제.

## /auth => auth-service 레포지토리

## /chat => [text](../../spring-boot/src/main/java/com/amapill/backend/domain/chat) 이거 확인 바람.

## Front → SpringBoot 미매칭(타 서비스로 추정)
- `POST` `/counsel/submit` / `src\core\services\api\counselApiClient.js` ((미구현 또는 별도 서비스))
- `POST` `/auth/deeplink/resolve` / `src\core\services\api\authApiClient.js` (auth-service/게이트웨이(인증))
- `POST` `/auth/kakao-login` / `src\core\services\api\authApiClient.js` (auth-service/게이트웨이(인증))
- `POST` `/auth/login` / `src\core\services\api\authApiClient.js` (auth-service/게이트웨이(인증))
- `POST` `/auth/logout` / `src\core\services\api\authApiClient.js` (auth-service/게이트웨이(인증))
- `POST` `/auth/refresh` / `src\core\services\api\authApiClient.js` (auth-service/게이트웨이(인증))
- `POST` `/auth/select-role` / `src\core\services\api\authApiClient.js` (auth-service/게이트웨이(인증))
- `POST` `/auth/signup` / `src\core\services\api\authApiClient.js` (auth-service/게이트웨이(인증))
- `GET` `/chat/rooms` / `src\core\services\api\chatApiClient.js` (별도 채팅 서비스/게이트웨이)
- `POST` `/chat/rooms` / `src\core\services\api\chatApiClient.js` (별도 채팅 서비스/게이트웨이)
- `DELETE` `/chat/rooms/{roomId}` / `src\core\services\api\chatApiClient.js` (별도 채팅 서비스/게이트웨이)
- `GET` `/chat/rooms/{roomId}/messages` / `src\core\services\api\chatApiClient.js` (별도 채팅 서비스/게이트웨이)
- `POST` `/chat/rooms/{roomId}/messages` / `src\core\services\api\chatApiClient.js` (별도 채팅 서비스/게이트웨이)
- `PATCH` `/chat/rooms/{roomId}/messages/{messageId}/read` / `src\core\services\api\chatApiClient.js` (별도 채팅 서비스/게이트웨이)



## 설정/라우팅 의심 포인트
- 아래 클라이언트는 `baseURL` 기본값이 `localhost:8082`(core)인데 `basePath`가 `/api/...` 입니다.
  - core(8082)는 `server.servlet.context-path=/` 이므로 `/api` prefix가 없으면 정상입니다.
  - 운영/로컬에서 gateway(8080)로 우회한다면 괜찮지만, 기본값으로는 404 위험이 있습니다.
  - `src\core\services\api\chatApiClient.js`: baseURL `import.meta.env.VITE_CHAT_API_URL||'http://localhost:8082'` / basePath `/api/chat`
  - `src\core\services\api\counselApiClient.js`: baseURL `import.meta.env.VITE_API_BASE_URL||'http://localhost:8082'` / basePath `/api/counsel`
  - `src\core\services\api\dietApiClient.js`: baseURL `import.meta.env.VITE_DIET_API_URL||'http://localhost:8082'` / basePath `/api/diet`
  - `src\core\services\api\medicationApiClient.js`: baseURL `import.meta.env.VITE_MEDICATION_API_URL||'http://localhost:8082'` / basePath `/api/medications`
  - `src\core\services\api\medicationLogApiClient.js`: baseURL `import.meta.env.VITE_MEDICATION_API_URL||'http://localhost:8082'` / basePath `/api/medications/logs`
  - `src\core\services\api\ocrApiClient.js`: baseURL `import.meta.env.VITE_API_BASE_URL||'http://localhost:8082'` / basePath `/api/ocr`

## SpringBoot → Front 미사용(참고)
- `GET` `/family-chat/rooms/{familyGroupId}/messages/search` / `src\main\java\com\amapill\backend\domain\chat\api\FamilyChatRestController.java`
- `GET` `/disease/debug/{userId}` / `src\main\java\com\amapill\backend\domain\disease\api\DiseaseController.java`
- `DELETE` `/disease/{diseaseId}/medications/{medicationId}` / `src\main\java\com\amapill\backend\domain\disease\api\DiseaseController.java`
- `POST` `/disease/{diseaseId}/medications/{medicationId}` / `src\main\java\com\amapill\backend\domain\disease\api\DiseaseController.java`
- `GET` `/family/groups/{id}` / `src\main\java\com\amapill\backend\domain\family\api\FamilyController.java`
- `GET` `/family/groups/{id}/members` / `src\main\java\com\amapill\backend\domain\family\api\FamilyController.java`
- `POST` `/family/groups/{id}/members` / `src\main\java\com\amapill\backend\domain\family\api\FamilyController.java`
- `GET` `/family/members/{userId}/medications/logs` / `src\main\java\com\amapill\backend\domain\family\api\FamilyController.java`
- `GET` `/medications/search/symptoms/ai` / `src\main\java\com\amapill\backend\domain\interaction\api\SymptomSearchController.java`
- `POST` `/dev/kafka/medication-missed-aggregated` / `src\main\java\com\amapill\backend\domain\medication\api\DevKafkaTestController.java`
- `GET` `/medications/{productCode}/safety` / `src\main\java\com\amapill\backend\domain\medication\api\MedicationController.java`
- `GET` `/notifications/subscribe` / `src\main\java\com\amapill\backend\domain\notification\api\NotificationController.java`
- `POST` `/ocr/extract` / `src\main\java\com\amapill\backend\domain\ocr\api\OcrController.java`
- `GET` `/reports/adherence` / `src\main\java\com\amapill\backend\domain\report\api\ReportController.java`
- `GET` `/admin/abuse/users/{userId}` / `src\main\java\com\amapill\backend\domain\security\api\AbuseAdminController.java`

## 부록: Backend 엔드포인트(Controller 기준)

### `src\main\java\com\amapill\backend\domain\chat\api\FamilyChatRestController.java`
- `GET` `/family-chat/rooms/{familyGroupId}/init` (gateway: `/api/family-chat/rooms/{familyGroupId}/init`)
- `GET` `/family-chat/rooms/{familyGroupId}/messages` (gateway: `/api/family-chat/rooms/{familyGroupId}/messages`)
- `POST` `/family-chat/rooms/{familyGroupId}/messages` (gateway: `/api/family-chat/rooms/{familyGroupId}/messages`)
- `POST` `/family-chat/rooms/{familyGroupId}/messages/image` (gateway: `/api/family-chat/rooms/{familyGroupId}/messages/image`)
- `GET` `/family-chat/rooms/{familyGroupId}/messages/search` (gateway: `/api/family-chat/rooms/{familyGroupId}/messages/search`)

### `src\main\java\com\amapill\backend\domain\diet\api\DietController.java`
- `POST` `/diet/analyze` (gateway: `/api/diet/analyze`)
- `POST` `/diet/analyze/jobs` (gateway: `/api/diet/analyze/jobs`)
- `GET` `/diet/analyze/jobs/{jobId}` (gateway: `/api/diet/analyze/jobs/{jobId}`)
- `GET` `/diet/logs` (gateway: `/api/diet/logs`)
- `POST` `/diet/logs` (gateway: `/api/diet/logs`)
- `POST` `/diet/logs/image` (gateway: `/api/diet/logs/image`)
- `DELETE` `/diet/logs/{logId}` (gateway: `/api/diet/logs/{logId}`)
- `PATCH` `/diet/logs/{logId}` (gateway: `/api/diet/logs/{logId}`)
- `GET` `/diet/warnings` (gateway: `/api/diet/warnings`)

### `src\main\java\com\amapill\backend\domain\disease\api\DiseaseController.java`
- `POST` `/disease` (gateway: `/api/disease`)
- `GET` `/disease/debug/{userId}` (gateway: `/api/disease/debug/{userId}`)
- `GET` `/disease/user/{userId}` (gateway: `/api/disease/user/{userId}`)
- `GET` `/disease/user/{userId}/export/pdf` (gateway: `/api/disease/user/{userId}/export/pdf`)
- `DELETE` `/disease/user/{userId}/trash` (gateway: `/api/disease/user/{userId}/trash`)
- `GET` `/disease/user/{userId}/trash` (gateway: `/api/disease/user/{userId}/trash`)
- `DELETE` `/disease/{diseaseId}/medications/{medicationId}` (gateway: `/api/disease/{diseaseId}/medications/{medicationId}`)
- `POST` `/disease/{diseaseId}/medications/{medicationId}` (gateway: `/api/disease/{diseaseId}/medications/{medicationId}`)
- `DELETE` `/disease/{id}` (gateway: `/api/disease/{id}`)
- `GET` `/disease/{id}` (gateway: `/api/disease/{id}`)
- `PUT` `/disease/{id}` (gateway: `/api/disease/{id}`)
- `POST` `/disease/{id}/restore` (gateway: `/api/disease/{id}/restore`)

### `src\main\java\com\amapill\backend\domain\family\api\FamilyController.java`
- `GET` `/family/groups` (gateway: `/api/family/groups`)
- `POST` `/family/groups` (gateway: `/api/family/groups`)
- `DELETE` `/family/groups/{id}` (gateway: `/api/family/groups/{id}`)
- `GET` `/family/groups/{id}` (gateway: `/api/family/groups/{id}`)
- `GET` `/family/groups/{id}/members` (gateway: `/api/family/groups/{id}/members`)
- `POST` `/family/groups/{id}/members` (gateway: `/api/family/groups/{id}/members`)
- `DELETE` `/family/members/{id}` (gateway: `/api/family/members/{id}`)
- `PUT` `/family/members/{memberId}/role` (gateway: `/api/family/members/{memberId}/role`)
- `GET` `/family/members/{userId}/medications` (gateway: `/api/family/members/{userId}/medications`)
- `GET` `/family/members/{userId}/medications/logs` (gateway: `/api/family/members/{userId}/medications/logs`)
- `GET` `/family/members/{userId}/medications/{medicationId}` (gateway: `/api/family/members/{userId}/medications/{medicationId}`)

### `src\main\java\com\amapill\backend\domain\family\api\FamilyInviteController.java`
- `GET` `/family/invites` (gateway: `/api/family/invites`)
- `POST` `/family/invites` (gateway: `/api/family/invites`)
- `POST` `/family/invites/accept` (gateway: `/api/family/invites/accept`)
- `DELETE` `/family/invites/{inviteId}` (gateway: `/api/family/invites/{inviteId}`)
- `PUT` `/family/invites/{inviteId}` (gateway: `/api/family/invites/{inviteId}`)

### `src\main\java\com\amapill\backend\domain\family\api\FamilyNotificationSettingsController.java`
- `GET` `/family/{familyGroupId}/members/{targetUserId}/notification-settings` (gateway: `/api/family/{familyGroupId}/members/{targetUserId}/notification-settings`)
- `PUT` `/family/{familyGroupId}/members/{targetUserId}/notification-settings` (gateway: `/api/family/{familyGroupId}/members/{targetUserId}/notification-settings`)

### `src\main\java\com\amapill\backend\domain\family\api\PublicInviteController.java`
- `GET` `/family/public/invites/info` (gateway: `/api/family/public/invites/info`)
- `GET` `/family/public/invites/start` (gateway: `/api/family/public/invites/start`)

### `src\main\java\com\amapill\backend\domain\interaction\api\SymptomSearchController.java`
- `GET` `/medications/search/symptoms/ai` (gateway: `/api/medications/search/symptoms/ai`)

### `src\main\java\com\amapill\backend\domain\medication\api\DevKafkaTestController.java`
- `POST` `/dev/kafka/medication-missed-aggregated` (gateway: `/api/dev/kafka/medication-missed-aggregated`)

### `src\main\java\com\amapill\backend\domain\medication\api\MedicationController.java`
- `GET` `/medications` (gateway: `/api/medications`)
- `POST` `/medications` (gateway: `/api/medications`)
- `GET` `/medications/search` (gateway: `/api/medications/search`)
- `GET` `/medications/search/ai` (gateway: `/api/medications/search/ai`)
- `GET` `/medications/today` (gateway: `/api/medications/today`)
- `DELETE` `/medications/{id}` (gateway: `/api/medications/{id}`)
- `PATCH` `/medications/{id}` (gateway: `/api/medications/{id}`)
- `GET` `/medications/{productCode}/safety` (gateway: `/api/medications/{productCode}/safety`)

### `src\main\java\com\amapill\backend\domain\medication\api\MedicationLogController.java`
- `GET` `/medications/logs` (gateway: `/api/medications/logs`)
- `POST` `/medications/logs` (gateway: `/api/medications/logs`)
- `GET` `/medications/logs/adherence/daily` (gateway: `/api/medications/logs/adherence/daily`)
- `GET` `/medications/logs/adherence/medication/{medicationId}` (gateway: `/api/medications/logs/adherence/medication/{medicationId}`)
- `GET` `/medications/logs/adherence/summary` (gateway: `/api/medications/logs/adherence/summary`)
- `PATCH` `/medications/logs/{scheduleId}/complete` (gateway: `/api/medications/logs/{scheduleId}/complete`)

### `src\main\java\com\amapill\backend\domain\medication\api\PrescriptionController.java`
- `GET` `/prescriptions` (gateway: `/api/prescriptions`)
- `POST` `/prescriptions` (gateway: `/api/prescriptions`)
- `DELETE` `/prescriptions/{id}` (gateway: `/api/prescriptions/{id}`)
- `GET` `/prescriptions/{id}` (gateway: `/api/prescriptions/{id}`)
- `PUT` `/prescriptions/{id}` (gateway: `/api/prescriptions/{id}`)
- `POST` `/prescriptions/{id}/medications` (gateway: `/api/prescriptions/{id}/medications`)
- `DELETE` `/prescriptions/{id}/medications/{medicationId}` (gateway: `/api/prescriptions/{id}/medications/{medicationId}`)
- `PATCH` `/prescriptions/{id}/toggle-active` (gateway: `/api/prescriptions/{id}/toggle-active`)

### `src\main\java\com\amapill\backend\domain\notification\api\NotificationController.java`
- `GET` `/notifications` (gateway: `/api/notifications`)
- `GET` `/notifications/subscribe` (gateway: `/api/notifications/subscribe`)
- `DELETE` `/notifications/{id}` (gateway: `/api/notifications/{id}`)
- `PATCH` `/notifications/{id}/read` (gateway: `/api/notifications/{id}/read`)

### `src\main\java\com\amapill\backend\domain\notification\api\NotificationSettingsController.java`
- `GET` `/notifications/settings` (gateway: `/api/notifications/settings`)
- `PUT` `/notifications/settings` (gateway: `/api/notifications/settings`)

### `src\main\java\com\amapill\backend\domain\ocr\api\OcrController.java`
- `POST` `/ocr/extract` (gateway: `/api/ocr/extract`)
- `POST` `/ocr/scan` (gateway: `/api/ocr/scan`)
- `POST` `/ocr/scan/jobs` (gateway: `/api/ocr/scan/jobs`)
- `GET` `/ocr/scan/jobs/{jobId}` (gateway: `/api/ocr/scan/jobs/{jobId}`)

### `src\main\java\com\amapill\backend\domain\report\api\ReportController.java`
- `GET` `/reports/adherence` (gateway: `/api/reports/adherence`)

### `src\main\java\com\amapill\backend\domain\security\api\AbuseAdminController.java`
- `GET` `/admin/abuse/users/{userId}` (gateway: `/api/admin/abuse/users/{userId}`)

### `src\main\java\com\amapill\backend\domain\voice\api\VoiceController.java`
- `POST` `/voice/process` (gateway: `/api/voice/process`)


## 부록: Front API 엔드포인트(ApiClient 기준)

### `src\core\services\api\authApiClient.js`
- basePath: `/api/auth`
- baseURL(표현식): `envConfig.AUTH_API_URL`
- `POST` `/api/auth/deeplink/resolve` (controller compare: `/auth/deeplink/resolve`)
- `POST` `/api/auth/kakao-login` (controller compare: `/auth/kakao-login`)
- `POST` `/api/auth/login` (controller compare: `/auth/login`)
- `POST` `/api/auth/logout` (controller compare: `/auth/logout`)
- `POST` `/api/auth/refresh` (controller compare: `/auth/refresh`)
- `POST` `/api/auth/select-role` (controller compare: `/auth/select-role`)
- `POST` `/api/auth/signup` (controller compare: `/auth/signup`)

### `src\core\services\api\chatApiClient.js`
- basePath: `/api/chat`
- baseURL(표현식): `import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8082'`
- `GET` `/api/chat/rooms` (controller compare: `/chat/rooms`)
- `POST` `/api/chat/rooms` (controller compare: `/chat/rooms`)
- `DELETE` `/api/chat/rooms/{roomId}` (controller compare: `/chat/rooms/{roomId}`)
- `GET` `/api/chat/rooms/{roomId}/messages` (controller compare: `/chat/rooms/{roomId}/messages`)
- `POST` `/api/chat/rooms/{roomId}/messages` (controller compare: `/chat/rooms/{roomId}/messages`)
- `PATCH` `/api/chat/rooms/{roomId}/messages/{messageId}/read` (controller compare: `/chat/rooms/{roomId}/messages/{messageId}/read`)

### `src\core\services\api\counselApiClient.js`
- basePath: `/api/counsel`
- baseURL(표현식): `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'`
- `POST` `/api/counsel/submit` (controller compare: `/counsel/submit`)

### `src\core\services\api\dietApiClient.js`
- basePath: `/api/diet`
- baseURL(표현식): `import.meta.env.VITE_DIET_API_URL || 'http://localhost:8082'`
- `POST` `/api/diet/analyze` (controller compare: `/diet/analyze`)
- `POST` `/api/diet/analyze/jobs` (controller compare: `/diet/analyze/jobs`)
- `GET` `/api/diet/analyze/jobs/{jobId}` (controller compare: `/diet/analyze/jobs/{jobId}`)
- `GET` `/api/diet/logs` (controller compare: `/diet/logs`)
- `POST` `/api/diet/logs` (controller compare: `/diet/logs`)
- `POST` `/api/diet/logs/image` (controller compare: `/diet/logs/image`)
- `DELETE` `/api/diet/logs/{logId}` (controller compare: `/diet/logs/{logId}`)
- `PATCH` `/api/diet/logs/{logId}` (controller compare: `/diet/logs/{logId}`)
- `GET` `/api/diet/warnings` (controller compare: `/diet/warnings`)

### `src\core\services\api\diseaseApiClient.js`
- basePath: `/api/disease`
- baseURL(표현식): `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'`
- `POST` `/api/disease` (controller compare: `/disease`)
- `GET` `/api/disease/user/{userId}` (controller compare: `/disease/user/{userId}`)
- `GET` `/api/disease/user/{userId}/export/pdf` (controller compare: `/disease/user/{userId}/export/pdf`)
- `DELETE` `/api/disease/user/{userId}/trash` (controller compare: `/disease/user/{userId}/trash`)
- `GET` `/api/disease/user/{userId}/trash` (controller compare: `/disease/user/{userId}/trash`)
- `DELETE` `/api/disease/{diseaseId}` (controller compare: `/disease/{diseaseId}`)
- `GET` `/api/disease/{diseaseId}` (controller compare: `/disease/{diseaseId}`)
- `PUT` `/api/disease/{diseaseId}` (controller compare: `/disease/{diseaseId}`)
- `POST` `/api/disease/{diseaseId}/restore` (controller compare: `/disease/{diseaseId}/restore`)

### `src\core\services\api\familyApiClient.js`
- basePath: `/api/family`
- baseURL(표현식): `import.meta.env.VITE_FAMILY_API_URL || 'http://localhost:8080'`
- `GET` `/api/family/groups` (controller compare: `/family/groups`)
- `POST` `/api/family/groups` (controller compare: `/family/groups`)
- `DELETE` `/api/family/groups/{groupId}` (controller compare: `/family/groups/{groupId}`)
- `GET` `/api/family/invites{query}` (controller compare: `/family/invites`)
- `POST` `/api/family/invites` (controller compare: `/family/invites`)
- `POST` `/api/family/invites/accept` (controller compare: `/family/invites/accept`)
- `DELETE` `/api/family/invites/{inviteId}` (controller compare: `/family/invites/{inviteId}`)
- `PUT` `/api/family/invites/{inviteId}` (controller compare: `/family/invites/{inviteId}`)
- `DELETE` `/api/family/members/{memberId}` (controller compare: `/family/members/{memberId}`)
- `PUT` `/api/family/members/{memberId}/role` (controller compare: `/family/members/{memberId}/role`)
- `GET` `/api/family/members/{userId}/medications` (controller compare: `/family/members/{userId}/medications`)
- `GET` `/api/family/members/{userId}/medications/{medicationId}` (controller compare: `/family/members/{userId}/medications/{medicationId}`)
- `GET` `/api/family/{groupId}/members/{memberId}/notification-settings` (controller compare: `/family/{groupId}/members/{memberId}/notification-settings`)
- `PUT` `/api/family/{groupId}/members/{memberId}/notification-settings` (controller compare: `/family/{groupId}/members/{memberId}/notification-settings`)

### `src\core\services\api\familyChatApiClient.js`
- basePath: `/api/family-chat`
- baseURL(표현식): `import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8080'`
- `GET` `/api/family-chat/rooms/{familyGroupId}/init` (controller compare: `/family-chat/rooms/{familyGroupId}/init`)
- `GET` `/api/family-chat/rooms/{familyGroupId}/messages` (controller compare: `/family-chat/rooms/{familyGroupId}/messages`)
- `POST` `/api/family-chat/rooms/{familyGroupId}/messages` (controller compare: `/family-chat/rooms/{familyGroupId}/messages`)
- `POST` `/api/family-chat/rooms/{familyGroupId}/messages/image` (controller compare: `/family-chat/rooms/{familyGroupId}/messages/image`)

### `src\core\services\api\medicationApiClient.js`
- basePath: `/api/medications`
- baseURL(표현식): `import.meta.env.VITE_MEDICATION_API_URL || 'http://localhost:8082'`
- `GET` `/api/medications` (controller compare: `/medications`)
- `POST` `/api/medications` (controller compare: `/medications`)
- `GET` `/api/medications/search` (controller compare: `/medications/search`)
- `GET` `/api/medications/search/ai` (controller compare: `/medications/search/ai`)
- `GET` `/api/medications/today` (controller compare: `/medications/today`)
- `DELETE` `/api/medications/{id}` (controller compare: `/medications/{id}`)
- `PATCH` `/api/medications/{id}` (controller compare: `/medications/{id}`)

### `src\core\services\api\medicationLogApiClient.js`
- basePath: `/api/medications/logs`
- baseURL(표현식): `import.meta.env.VITE_MEDICATION_API_URL || 'http://localhost:8082'`
- `GET` `/api/medications/logs` (controller compare: `/medications/logs`)
- `POST` `/api/medications/logs` (controller compare: `/medications/logs`)
- `GET` `/api/medications/logs/adherence/daily` (controller compare: `/medications/logs/adherence/daily`)
- `GET` `/api/medications/logs/adherence/medication/{medicationId}` (controller compare: `/medications/logs/adherence/medication/{medicationId}`)
- `GET` `/api/medications/logs/adherence/summary` (controller compare: `/medications/logs/adherence/summary`)
- `PATCH` `/api/medications/logs/{scheduleId}/complete` (controller compare: `/medications/logs/{scheduleId}/complete`)

### `src\core\services\api\notificationApiClient.js`
- basePath: `/api/notifications`
- baseURL(표현식): `envConfig.NOTIFICATION_API_URL || envConfig.API_BASE_URL`
- `GET` `/api/notifications` (controller compare: `/notifications`)
- `DELETE` `/api/notifications/{id}` (controller compare: `/notifications/{id}`)
- `GET` `/api/notifications/{id}` (controller compare: `/notifications/{id}`)
- `PATCH` `/api/notifications/{id}/read` (controller compare: `/notifications/{id}/read`)

### `src\core\services\api\notificationSettingsApiClient.js`
- basePath: `/api/notifications/settings`
- baseURL(표현식): `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'`
- `GET` `/api/notifications/settings` (controller compare: `/notifications/settings`)
- `PUT` `/api/notifications/settings` (controller compare: `/notifications/settings`)

### `src\core\services\api\ocrApiClient.js`
- basePath: `/api/ocr`
- baseURL(표현식): `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'`
- `POST` `/api/ocr/scan` (controller compare: `/ocr/scan`)
- `POST` `/api/ocr/scan/jobs` (controller compare: `/ocr/scan/jobs`)
- `GET` `/api/ocr/scan/jobs/{jobId}` (controller compare: `/ocr/scan/jobs/{jobId}`)

### `src\core\services\api\prescriptionApiClient.js`
- basePath: `/api/prescriptions`
- `GET` `/api/prescriptions` (controller compare: `/prescriptions`)
- `POST` `/api/prescriptions` (controller compare: `/prescriptions`)
- `DELETE` `/api/prescriptions/{id}` (controller compare: `/prescriptions/{id}`)
- `GET` `/api/prescriptions/{id}` (controller compare: `/prescriptions/{id}`)
- `PUT` `/api/prescriptions/{id}` (controller compare: `/prescriptions/{id}`)
- `PATCH` `/api/prescriptions/{id}/toggle-active` (controller compare: `/prescriptions/{id}/toggle-active`)
- `POST` `/api/prescriptions/{prescriptionId}/medications` (controller compare: `/prescriptions/{prescriptionId}/medications`)
- `DELETE` `/api/prescriptions/{prescriptionId}/medications/{medicationId}` (controller compare: `/prescriptions/{prescriptionId}/medications/{medicationId}`)

### `src\core\services\api\publicInviteApiClient.js`
- basePath: `/api/family/public/invites`
- `GET` `/api/family/public/invites/info?code={encodeURIComponent_code}` (controller compare: `/family/public/invites/info`)
- `GET` `/api/family/public/invites/start?token={encodeURIComponent_token}` (controller compare: `/family/public/invites/start`)

### `src\core\services\api\reportApiClient.js`
- basePath: `/api/reports`
- baseURL(표현식): `envConfig.REPORT_API_URL || envConfig.API_BASE_URL`
- `POST` `/api/reports/adherence` (controller compare: `/reports/adherence`)
- `GET` `/api/reports/weekly` (controller compare: `/reports/weekly`)

### `src\core\services\api\voiceApiClient.js`
- basePath: `/api/voice`
- baseURL(표현식): `import.meta.env.VITE_API_URL || 'http://localhost:8080'`
- `POST` `/api/voice/process` (controller compare: `/voice/process`)
