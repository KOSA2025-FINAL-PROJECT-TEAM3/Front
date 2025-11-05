# 실버케어 MVP 기능 및 DTO 명세서

> 가족 돌봄 네트워크 기반 약 관리 플랫폼
> 작성일: 2025-11-05
> 버전: 1.0

---

## 📋 목차

1. [MVP 기능 우선순위](#mvp-기능-우선순위)
2. [API 엔드포인트 목록](#api-엔드포인트-목록)
3. [DTO 명세](#dto-명세)
   - [Auth/User](#1-authuser-인증사용자)
   - [Family](#2-family-가족-관리)
   - [Medication](#3-medication-약-관리)
   - [Diet](#4-diet-식단-관리)
   - [Drug Interaction](#5-drug-interaction-약-음식-충돌)
   - [OCR](#6-ocr-약봉지-인식)
   - [Notification](#7-notification-알림)
   - [Report](#8-report-리포트)

---

## 🎯 MVP 기능 우선순위

### 필수 기능 (7주 내 완성)

| 우선순위 | 기능 | 개발 시간 | 차별화 | 상태 |
|---------|------|----------|--------|------|
| 🥇 1순위 | **가족 돌봄 네트워크** | 2주 | ⭐⭐⭐⭐⭐ | ✅ 필수 |
| 🥈 2순위 | **약-음식 충돌 경고** | 1.5주 | ⭐⭐⭐⭐⭐ | ✅ 필수 |
| 🥉 3순위 | **약봉지 OCR 자동 등록** | 1.5주 | ⭐⭐⭐⭐ | ✅ 필수 |
| 4순위 | **알약 역검색** | 1주 | ⭐⭐⭐⭐ | ✅ 필수 |
| 5순위 | 기본 CRUD (약, 스케줄, 로그) | 1주 | ⭐⭐⭐ | ✅ 필수 |

### 선택 기능 (시간 있으면)

| 우선순위 | 기능 | 개발 시간 | 차별화 | 상태 |
|---------|------|----------|--------|------|
| 6순위 | 복약 순응도 리포트 | 3일 | ⭐⭐⭐ | ⚠️ 선택 |
| 7순위 | 약값 절약 비교 | 2일 | ⭐⭐⭐ | ⚠️ 선택 |
| 8순위 | 카카오톡 알림톡 (Phase 2) | 1주 | ⭐⭐⭐⭐ | ⚠️ 선택 |

---

## 🌐 API 엔드포인트 목록

### 1. Auth/User (인증/사용자)

| Method | Endpoint | 설명 | MVP |
|--------|----------|------|-----|
| POST | `/api/auth/signup` | 회원가입 | ✅ |
| POST | `/api/auth/login` | 로그인 | ✅ |
| POST | `/api/auth/logout` | 로그아웃 | ✅ |
| POST | `/api/auth/refresh` | 토큰 갱신 | ✅ |
| GET | `/api/users/me` | 내 정보 조회 | ✅ |
| PUT | `/api/users/me` | 내 정보 수정 | ✅ |

### 2. Family (가족 관리) - MVP 1순위

| Method | Endpoint | 설명 | MVP |
|--------|----------|------|-----|
| POST | `/api/family/groups` | 가족 그룹 생성 | ✅ |
| GET | `/api/family/groups` | 내 가족 그룹 조회 | ✅ |
| POST | `/api/family/groups/{id}/members` | 가족 구성원 초대 | ✅ |
| GET | `/api/family/groups/{id}/members` | 가족 구성원 목록 | ✅ |
| DELETE | `/api/family/members/{id}` | 가족 구성원 제거 | ✅ |
| GET | `/api/family/members/{userId}/medications` | 가족 구성원 약 조회 (모니터링) | ✅ |

### 3. Medication (약 관리) - MVP 필수

| Method | Endpoint | 설명 | MVP |
|--------|----------|------|-----|
| POST | `/api/medications` | 약 등록 | ✅ |
| GET | `/api/medications` | 내 약 목록 조회 | ✅ |
| GET | `/api/medications/{id}` | 약 상세 조회 | ✅ |
| PUT | `/api/medications/{id}` | 약 수정 | ✅ |
| DELETE | `/api/medications/{id}` | 약 삭제 | ✅ |
| POST | `/api/medications/{id}/schedules` | 복용 스케줄 등록 | ✅ |
| GET | `/api/medications/{id}/schedules` | 복용 스케줄 조회 | ✅ |
| POST | `/api/medications/logs` | 복용 체크 | ✅ |
| GET | `/api/medications/logs/today` | 오늘 복용 내역 | ✅ |

### 4. Diet (식단 관리) - MVP 필수

| Method | Endpoint | 설명 | MVP |
|--------|----------|------|-----|
| POST | `/api/diet/logs` | 식단 기록 | ✅ |
| GET | `/api/diet/logs` | 식단 내역 조회 | ✅ |
| GET | `/api/diet/warnings` | 약-음식 충돌 경고 조회 | ✅ |

### 5. Drug Interaction (약-음식 충돌) - MVP 2순위

| Method | Endpoint | 설명 | MVP |
|--------|----------|------|-----|
| POST | `/api/interactions/check` | 약-음식 충돌 검사 | ✅ |
| GET | `/api/interactions/food/{foodName}` | 특정 음식 충돌 조회 | ✅ |

### 6. OCR (약봉지 인식) - MVP 3순위

| Method | Endpoint | 설명 | MVP |
|--------|----------|------|-----|
| POST | `/api/ocr/prescription` | 약봉지 OCR 인식 | ✅ |
| POST | `/api/ocr/pill-search` | 알약 역검색 (식별정보) | ✅ |

### 7. Notification (알림)

| Method | Endpoint | 설명 | MVP |
|--------|----------|------|-----|
| GET | `/api/notifications` | 알림 목록 조회 | ✅ |
| PUT | `/api/notifications/{id}/read` | 알림 읽음 처리 | ✅ |
| DELETE | `/api/notifications/{id}` | 알림 삭제 | ✅ |

### 8. Report (리포트) - 선택

| Method | Endpoint | 설명 | MVP |
|--------|----------|------|-----|
| GET | `/api/reports/adherence` | 복약 순응도 리포트 | ⚠️ 선택 |
| GET | `/api/reports/adherence/pdf` | 복약 순응도 PDF | ⚠️ 선택 |

---

## 📦 DTO 명세

### 1. Auth/User (인증/사용자)

#### 1.1 LoginRequest

```json
{
  "email": "senior@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**필드 설명**
- `email` (string, required): 이메일 (이메일 형식 검증)
- `password` (string, required): 비밀번호
- `rememberMe` (boolean, optional): 자동 로그인 여부 (기본값: false)

**Validation**
- email: `@Email`, `@NotBlank`
- password: `@NotBlank`

---

#### 1.2 LoginResponse

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": 1,
    "email": "senior@example.com",
    "name": "김시니어",
    "role": "senior"
  }
}
```

**필드 설명**
- `accessToken` (string): JWT 액세스 토큰 (유효기간 15분)
- `refreshToken` (string): JWT 리프레시 토큰 (유효기간 7일)
- `tokenType` (string): 토큰 타입 ("Bearer")
- `expiresIn` (number): 만료 시간(초)
- `user` (object): 사용자 정보

---

#### 1.3 SignupRequest

```json
{
  "email": "caregiver@example.com",
  "password": "SecureP@ss123",
  "name": "이자녀",
  "phone": "010-1234-5678",
  "role": "caregiver"
}
```

**필드 설명**
- `email` (string, required): 이메일
- `password` (string, required): 비밀번호 (8자 이상)
- `name` (string, required): 이름
- `phone` (string, optional): 전화번호
- `role` (enum, required): 사용자 역할
  - `senior`: 시니어 (약 복용자)
  - `caregiver`: 자녀/보호자

**Validation**
- email: `@Email`, `@NotBlank`, unique
- password: `@Size(min=8)`, `@Pattern` (영문+숫자+특수문자)
- name: `@NotBlank`
- role: `@NotNull`

---

#### 1.4 UserResponse

```json
{
  "id": 1,
  "email": "senior@example.com",
  "name": "김시니어",
  "phone": "010-9876-5432",
  "role": "senior",
  "createdAt": "2025-11-05T10:00:00Z"
}
```

---

### 2. Family (가족 관리)

#### 2.1 FamilyGroupRequest

```json
{
  "name": "김씨 가족"
}
```

**필드 설명**
- `name` (string, required): 가족 그룹 이름

---

#### 2.2 FamilyGroupResponse

```json
{
  "id": 1,
  "name": "김씨 가족",
  "createdBy": {
    "id": 2,
    "name": "이자녀",
    "role": "caregiver"
  },
  "members": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "김시니어",
        "email": "senior@example.com",
        "role": "senior"
      },
      "familyRole": "parent",
      "joinedAt": "2025-11-05T10:00:00Z"
    },
    {
      "id": 2,
      "user": {
        "id": 2,
        "name": "이자녀",
        "email": "caregiver@example.com",
        "role": "caregiver"
      },
      "familyRole": "child",
      "joinedAt": "2025-11-05T10:01:00Z"
    }
  ],
  "createdAt": "2025-11-05T10:00:00Z"
}
```

**필드 설명**
- `id` (number): 가족 그룹 ID
- `name` (string): 가족 그룹 이름
- `createdBy` (object): 그룹 생성자 정보
- `members` (array): 가족 구성원 목록
  - `familyRole`: `parent` (부모) 또는 `child` (자녀)

---

#### 2.3 FamilyMemberInviteRequest

```json
{
  "email": "parent@example.com",
  "familyRole": "parent"
}
```

**필드 설명**
- `email` (string, required): 초대할 사용자 이메일
- `familyRole` (enum, required): 가족 내 역할
  - `parent`: 부모/시니어
  - `child`: 자녀/보호자

---

### 3. Medication (약 관리)

#### 3.1 MedicationRequest

```json
{
  "name": "아스피린",
  "ingredient": "아세틸살리실산",
  "dosage": "100mg",
  "timing": "아침 식후",
  "startDate": "2025-11-01",
  "endDate": "2025-12-01",
  "quantity": 30,
  "remaining": 30,
  "expiryDate": "2026-10-31"
}
```

**필드 설명**
- `name` (string, required): 약 이름
- `ingredient` (string, optional): 주성분
- `dosage` (string, optional): 복용량
- `timing` (string, optional): 복용 시기
- `startDate` (date, required): 복용 시작일
- `endDate` (date, optional): 복용 종료일
- `quantity` (number, optional): 총 개수
- `remaining` (number, optional): 남은 개수
- `expiryDate` (date, optional): 유효기간

---

#### 3.2 MedicationResponse

```json
{
  "id": 1,
  "userId": 1,
  "name": "아스피린",
  "ingredient": "아세틸살리실산",
  "dosage": "100mg",
  "timing": "아침 식후",
  "startDate": "2025-11-01",
  "endDate": "2025-12-01",
  "quantity": 30,
  "remaining": 25,
  "expiryDate": "2026-10-31",
  "schedules": [
    {
      "id": 1,
      "time": "09:00:00",
      "daysOfWeek": "1,2,3,4,5",
      "active": true
    }
  ],
  "createdAt": "2025-11-01T10:00:00Z"
}
```

---

#### 3.3 MedicationScheduleRequest

```json
{
  "time": "09:00:00",
  "daysOfWeek": "1,2,3,4,5",
  "active": true
}
```

**필드 설명**
- `time` (time, required): 복용 시간 (HH:mm:ss)
- `daysOfWeek` (string, optional): 요일 (0=일요일, 1=월요일, ..., 6=토요일)
  - 예: "1,3,5" = 월,수,금
  - 빈 값 = 매일
- `active` (boolean, optional): 활성화 여부 (기본값: true)

---

#### 3.4 MedicationLogRequest

```json
{
  "medicationId": 1,
  "scheduledTime": "2025-11-05T09:00:00Z",
  "completed": true
}
```

**필드 설명**
- `medicationId` (number, required): 약 ID
- `scheduledTime` (timestamp, required): 예정 복용 시간
- `completed` (boolean, required): 복용 완료 여부

---

#### 3.5 MedicationLogResponse

```json
{
  "id": 1,
  "medicationId": 1,
  "medicationName": "아스피린",
  "userId": 1,
  "scheduledTime": "2025-11-05T09:00:00Z",
  "completedTime": "2025-11-05T09:05:32Z",
  "completed": true,
  "missed": false,
  "createdAt": "2025-11-05T09:05:32Z"
}
```

---

#### 3.6 TodayMedicationResponse

```json
{
  "date": "2025-11-05",
  "medications": [
    {
      "medicationId": 1,
      "name": "아스피린",
      "dosage": "100mg",
      "schedules": [
        {
          "time": "09:00:00",
          "scheduledTime": "2025-11-05T09:00:00Z",
          "completed": true,
          "completedTime": "2025-11-05T09:05:32Z"
        },
        {
          "time": "21:00:00",
          "scheduledTime": "2025-11-05T21:00:00Z",
          "completed": false,
          "completedTime": null
        }
      ]
    }
  ],
  "totalScheduled": 6,
  "totalCompleted": 4,
  "completionRate": 66.7
}
```

**필드 설명**
- `date` (date): 조회 날짜
- `medications` (array): 오늘 복용할 약 목록
- `totalScheduled` (number): 총 예정 복용 횟수
- `totalCompleted` (number): 완료된 복용 횟수
- `completionRate` (number): 완료율 (%)

---

### 4. Diet (식단 관리)

#### 4.1 DietLogRequest

```json
{
  "mealType": "breakfast",
  "foodName": "시금치",
  "calories": 150
}
```

**필드 설명**
- `mealType` (enum, required): 식사 종류
  - `breakfast`: 아침
  - `lunch`: 점심
  - `dinner`: 저녁
  - `snack`: 간식
- `foodName` (string, required): 음식 이름
- `calories` (number, optional): 칼로리

---

#### 4.2 DietLogResponse

```json
{
  "id": 1,
  "userId": 1,
  "mealType": "breakfast",
  "foodName": "시금치",
  "calories": 150,
  "recordedAt": "2025-11-05T08:30:00Z",
  "warnings": [
    {
      "id": 1,
      "severity": "높음",
      "message": "와파린과 시금치(비타민K)의 상호작용이 있습니다. 섭취를 제한해주세요.",
      "medication": {
        "id": 2,
        "name": "와파린"
      }
    }
  ]
}
```

---

#### 4.3 DietWarningResponse

```json
{
  "id": 1,
  "userId": 1,
  "dietLog": {
    "id": 1,
    "foodName": "시금치",
    "mealType": "breakfast",
    "recordedAt": "2025-11-05T08:30:00Z"
  },
  "medication": {
    "id": 2,
    "name": "와파린",
    "ingredient": "와파린"
  },
  "warningMessage": "와파린과 시금치(비타민K)의 상호작용이 있습니다. 섭취를 제한해주세요.",
  "severity": "높음",
  "createdAt": "2025-11-05T08:30:00Z"
}
```

---

### 5. Drug Interaction (약-음식 충돌)

#### 5.1 ConflictCheckRequest

```json
{
  "userId": 1,
  "foodName": "자몽"
}
```

**필드 설명**
- `userId` (number, required): 사용자 ID
- `foodName` (string, required): 검사할 음식 이름

---

#### 5.2 ConflictCheckResponse

```json
{
  "conflicts": [
    {
      "drugName": "심바스타틴",
      "drugIngredient": "Simvastatin",
      "foodName": "자몽",
      "foodCategory": "과일",
      "conflictIngredient": "푸라노쿠마린",
      "reason": "자몽의 푸라노쿠마린이 간 효소를 억제하여 약물 농도가 과도하게 높아질 수 있습니다.",
      "severity": "높음",
      "alternatives": "오렌지, 사과, 배 등",
      "source": "식약처 의약품안전나라"
    }
  ],
  "hasConflict": true,
  "highestSeverity": "높음"
}
```

**필드 설명**
- `conflicts` (array): 충돌 목록
- `hasConflict` (boolean): 충돌 여부
- `highestSeverity` (string): 최고 심각도
  - `높음`: 즉시 경고
  - `중간`: 주의 알림
  - `낮음`: 정보 제공

---

#### 5.3 DrugFoodInteractionResponse

```json
{
  "id": 1,
  "drugName": "와파린",
  "drugIngredient": "Warfarin",
  "foodName": "시금치",
  "foodCategory": "채소",
  "conflictIngredient": "비타민K",
  "reason": "시금치의 비타민K가 와파린의 항응고 효과를 감소시킬 수 있습니다.",
  "severity": "높음",
  "alternatives": "오이, 양상추 등 비타민K 함량이 낮은 채소",
  "source": "식약처",
  "createdAt": "2025-11-01T00:00:00Z"
}
```

---

### 6. OCR (약봉지 인식)

#### 6.1 OCRRequest

```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
  "ocrEngine": "google-vision"
}
```

**필드 설명**
- `imageBase64` (string, required): Base64 인코딩된 이미지
- `ocrEngine` (enum, optional): OCR 엔진 선택
  - `google-vision`: Google Vision API (기본값)
  - `tesseract`: Tesseract.js (Fallback)

**파일 업로드 방식** (alternative)
```
POST /api/ocr/prescription
Content-Type: multipart/form-data

image: [File]
```

---

#### 6.2 OCRResponse

```json
{
  "success": true,
  "extractedText": "처방전\n아스피린 100mg\n1일 1회 아침 식후 복용\n30정",
  "parsedMedication": {
    "name": "아스피린",
    "dosage": "100mg",
    "timing": "아침 식후",
    "quantity": 30,
    "confidence": 0.92
  },
  "ocrEngine": "google-vision",
  "processingTime": 1.2
}
```

**필드 설명**
- `success` (boolean): OCR 성공 여부
- `extractedText` (string): 추출된 원본 텍스트
- `parsedMedication` (object): 파싱된 약 정보
  - `confidence` (number): 신뢰도 (0.0 ~ 1.0)
- `ocrEngine` (string): 사용된 OCR 엔진
- `processingTime` (number): 처리 시간(초)

---

#### 6.3 PillSearchRequest (알약 역검색)

```json
{
  "shape": "원형",
  "color": "흰색",
  "printFront": "A",
  "printBack": "100"
}
```

**필드 설명**
- `shape` (string, optional): 모양 (원형, 타원형, 장방형, 사각형 등)
- `color` (string, optional): 색상
- `printFront` (string, optional): 앞면 각인
- `printBack` (string, optional): 뒷면 각인

---

#### 6.4 PillSearchResponse

```json
{
  "results": [
    {
      "itemSeq": "200001234",
      "itemName": "아스피린정100밀리그램",
      "entpName": "바이엘코리아(주)",
      "itemImage": "https://nedrug.mfds.go.kr/pbp/...",
      "chart": "원형",
      "printFront": "A",
      "printBack": "100",
      "colorClass1": "흰색",
      "formCodeName": "정제",
      "markCodeFrontAnal": "A",
      "markCodeBackAnal": "100",
      "itemIngr": "아세틸살리실산",
      "efcyQesitm": "혈전 예방, 해열, 진통",
      "useMethodQesitm": "1일 1회 100mg 경구 투여",
      "atpnQesitm": "위장 장애 주의"
    }
  ],
  "totalCount": 1,
  "source": "식약처 의약품안전나라"
}
```

---

### 7. Notification (알림)

#### 7.1 NotificationResponse

```json
{
  "id": 1,
  "userId": 1,
  "type": "medication_reminder",
  "title": "약 복용 시간입니다",
  "message": "아스피린 100mg을 복용하세요",
  "read": false,
  "createdAt": "2025-11-05T09:00:00Z"
}
```

**필드 설명**
- `type` (enum): 알림 종류
  - `medication_reminder`: 복약 알림
  - `diet_warning`: 식단 경고
  - `family_alert`: 가족 알림
  - `system`: 시스템 알림

---

### 8. Report (리포트) - 선택 기능

#### 8.1 AdherenceReportResponse

```json
{
  "userId": 1,
  "userName": "김시니어",
  "startDate": "2025-10-01",
  "endDate": "2025-10-31",
  "overallAdherence": 87.5,
  "medications": [
    {
      "medicationId": 1,
      "medicationName": "아스피린",
      "totalScheduled": 60,
      "completed": 55,
      "missed": 5,
      "adherenceRate": 91.7
    },
    {
      "medicationId": 2,
      "medicationName": "메트포르민",
      "totalScheduled": 60,
      "completed": 50,
      "missed": 10,
      "adherenceRate": 83.3
    }
  ],
  "weeklyTrends": [
    {
      "weekStart": "2025-10-01",
      "weekEnd": "2025-10-07",
      "adherenceRate": 85.7,
      "completed": 12,
      "missed": 2
    }
  ],
  "generatedAt": "2025-11-05T10:00:00Z"
}
```

---

## 🔧 공통 DTO

### ErrorResponse

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "이메일은 필수입니다",
  "timestamp": "2025-11-05T10:00:00Z",
  "path": "/api/auth/login"
}
```

---

### PageResponse<T>

```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

---

### SuccessResponse

```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다",
  "data": {...}
}
```

---

## 📚 참고 사항

### Validation 어노테이션 (Spring)

- `@NotNull`: null 불가
- `@NotBlank`: 빈 문자열 불가
- `@Email`: 이메일 형식 검증
- `@Size(min=, max=)`: 길이 제한
- `@Pattern(regexp=)`: 정규식 검증
- `@Min`, `@Max`: 숫자 범위
- `@Past`, `@Future`: 날짜 검증

### JWT 토큰 구조

```
Authorization: Bearer <accessToken>
```

- Access Token: 15분 유효
- Refresh Token: 7일 유효
- Redis에 블랙리스트 관리

### 에러 코드

| HTTP Status | 설명 |
|-------------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 찾을 수 없음 |
| 409 | 충돌 (중복 등) |
| 500 | 서버 오류 |

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-05
**작성자**: 실버케어 개발팀
**노션 복사 가능**: ✅
