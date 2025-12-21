# Spring Boot Controller 엔드포인트 ↔ Front API 비교 리포트

Last updated: 2025-12-17

## 스캔 범위
- Backend: `spring-boot/src/main/java/**/**Controller.java` (19 files)
- Front: `Front/src/core/services/api/*ApiClient.js` (15 files)

## 결론(연결 안 된 것)

### 1) Front에서 호출하지만 spring-boot Controller에 없는 엔드포인트
- (현재 없음) SymptomSearch는 `GET /medications/search/symptoms/ai`만 사용하도록 정리

### 2) Gateway 라우팅은 있는데 spring-boot에 Controller가 없는 케이스(실제로는 404)
- (의도적으로 제거) `/api/chat/**` (1:1/상담 채팅 기능은 원래 없음, `family-chat`만 유지)

### 3) spring-boot가 아닌 서비스(정상)
- `/api/auth/**`는 `auth-service(8081)`로 라우팅됨(게이트웨이 dev 설정 기준) → spring-boot에 없어도 정상

## 참고: `/api` prefix 규칙
- spring-boot(8082)는 `server.servlet.context-path=/`로 동작하며, 컨트롤러 매핑도 `/diet`, `/medications`처럼 **`/api`가 없음**.
- Front는 기본적으로 API Gateway(8080)를 기본값으로 사용하며(`Front/src/core/services/api/ApiClient.js`), Gateway가 `StripPrefix=1`로 `/api`를 제거한 뒤 spring-boot로 라우팅하는 구조임.

## Front → SpringBoot 미매칭(정리)

- `/api/auth/**`
  - Gateway(dev): `8081`로 라우팅(auth-service) → spring-boot에 없어도 정상
- `/api/chat/**`
  - 결정: **비노출/리다이렉트**로 정리(라우팅도 제거)
- `/api/family/invites?groupId=...`
  - spring-boot는 `GET /family/invites` + optional `groupId`를 제공(`FamilyInviteController`) → 정상(정적 스캔에서 query-string 때문에 false positive 가능)

## 설정/라우팅 의심 포인트
- Gateway(dev) 기준 `/api/**` 요청은 `StripPrefix=1`로 `/`로 변환되어 spring-boot(8082)로 전달됨.
- 로컬에서 `VITE_API_BASE_URL=http://localhost:8082`처럼 **spring-boot를 직접 찍으면** Front의 `/api/*` 호출은 404가 될 수 있음(게이트웨이 우회).

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
- `GET` `/family-chat/rooms/{familyGroupId}/unread-count` (gateway: `/api/family-chat/rooms/{familyGroupId}/unread-count`)
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
