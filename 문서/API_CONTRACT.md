# API Contract (REST)

이 문서는 프론트엔드에서 구현된 기능들이 백엔드와 통신하기 위해 기대하는 API 엔드포인트 명세를 정의합니다.

## 1. 공통 사항
- **Base URL**: `/api`
- **Date Format**: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **Auth**: 모든 요청 헤더에 `Authorization: Bearer <token>` 포함 (로그인 제외)

---

## 2. 리포트 API (`/api/reports`)

### 2.1 주간 복용 통계 조회
- **Endpoint**: `GET /api/reports/weekly`
- **Description**: 사용자의 지난 7일간 복용 통계 및 요일별 현황 조회
- **Query Parameters**:
  - `userId` (optional): 조회할 사용자 ID (기본값: 본인)
  - `date` (optional): 기준 날짜 (기본값: 오늘)
- **Response**:
  ```json
  {
    "id": "report-weekly-1",
    "startDate": "2025-11-05",
    "endDate": "2025-11-11",
    "overallAdherence": 82,
    "dailyBreakdown": [
      { "date": "2025-11-05", "adherence": 85, "takenDoses": 3, "scheduledDoses": 3 }
    ],
    "insights": [
      { "type": "POSITIVE", "description": "..." }
    ]
  }
  ```

### 2.2 복약 순응도 리포트 생성
- **Endpoint**: `POST /api/reports/adherence`
- **Description**: 특정 기간의 복약 순응도 상세 리포트 요청
- **Request Body**:
  ```json
  {
    "userId": "user-1",
    "startDate": "2025-11-01",
    "endDate": "2025-11-30"
  }
  ```
- **Response**:
  ```json
  {
    "id": "report-adherence-1",
    "adherenceRate": 85,
    "takenMedications": []
  }
  ```

---

## 3. 알림 API (`/api/notifications`)

### 3.1 알림 목록 조회
- **Endpoint**: `GET /api/notifications`
- **Description**: 사용자의 알림 목록 조회
- **Response**:
  ```json
  [
    {
      "id": "notif-1",
      "title": "약 복용 시간",
      "message": "...",
      "type": "MEDICATION_REMINDER",
      "status": "UNREAD",
      "createdAt": "2025-11-12T18:00:00Z"
    }
  ]
  ```

### 3.2 알림 상세 조회
- **Endpoint**: `GET /api/notifications/:id`
- **Description**: 특정 알림의 상세 정보 조회
- **Response**: 알림 목록과 동일한 구조의 단일 객체

### 3.3 알림 읽음 처리
- **Endpoint**: `PATCH /api/notifications/:id/read`
- **Description**: 특정 알림을 읽음 상태로 변경
- **Response**:
  ```json
  { "success": true, "id": "notif-1" }
  ```

---

## 4. 검색 API (`/api/search`)

### 4.1 알약 검색 (텍스트)
- **Endpoint**: `GET /api/search/pills`
- **Description**: 알약 이름 또는 특징으로 검색
- **Query Parameters**: `query` (검색어)
- **Response**:
  ```json
  [
    {
      "id": "pill-1",
      "name": "타이레놀정 500mg",
      "imageUrl": "...",
      "manufacturer": "(주)얀센"
    }
  ]
  ```

### 4.2 알약 상세 정보
- **Endpoint**: `GET /api/search/pills/:id`
- **Description**: 알약의 상세 효능, 용법, 주의사항 조회
- **Response**:
  ```json
  {
    "id": "pill-1",
    "name": "타이레놀정 500mg",
    "efficacy": "해열, 진통...",
    "usage": "1회 1~2정...",
    "precautions": "..."
  }
  ```

---

## 5. 질병 API (`/api/disease`)

### 5.1 질병별 제약 사항 조회
- **Endpoint**: `GET /api/disease/restrictions/:id`
- **Description**: 특정 질병에 대한 피해야 할 음식/약물 정보 조회
- **Response**:
  ```json
  {
    "id": "disease-1",
    "name": "편두통",
    "avoidFoods": [],
    "avoidMedications": []
  }
  ```

---

## 6. 약물 API (`/api/medications`)

### 6.1 약물 목록 조회
- **Endpoint**: `GET /api/medications`
- **Description**: 사용자의 등록된 약물 목록 조회

### 6.2 약물 등록
- **Endpoint**: `POST /api/medications`
- **Description**: 새로운 약물 등록

### 6.3 약물 수정
- **Endpoint**: `PATCH /api/medications/:id`
- **Description**: 약물 정보 수정

### 6.4 약물 삭제
- **Endpoint**: `DELETE /api/medications/:id`
- **Description**: 약물 삭제

---
