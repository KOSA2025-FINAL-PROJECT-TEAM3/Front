# 실버케어 시스템 아키텍처

## 전체 시스템 구조

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Web App]
        A1[Auth Components]
        A2[Family Components]
        A3[Medication Components]
        A4[Diet Components]
        A5[Dashboard]

        A --> A1
        A --> A2
        A --> A3
        A --> A4
        A --> A5
    end

    subgraph "Real-time Sync"
        H[Hocuspocus Server]
        H1[Family WebSocket]
    end

    subgraph "Backend Layer"
        B[Spring Boot API]
        B1[Auth Controller]
        B2[Medication Controller]
        B3[Family Controller]
        B4[Diet Controller]

        B --> B1
        B --> B2
        B --> B3
        B --> B4

        S1[Medication Service]
        S2[Family Service]
        S3[Drug Interaction Service]
        S4[OCR Service]

        B2 --> S1
        B3 --> S2
        B4 --> S3
        B2 --> S4
    end

    subgraph "Event Processing"
        K[Apache Kafka]
        K1[Medication Events]
        K2[Notification Events]

        K --> K1
        K --> K2
    end

    subgraph "Database Layer"
        DB[(MySQL/PostgreSQL)]
        R[(Redis Cache)]
    end

    subgraph "External Services"
        E1[식약처 API]
        E2[Google Vision OCR]
        E3[카카오톡 API]
        E4[n8n Workflow]
    end

    A -->|REST API| B
    A -->|WebSocket| H
    H --> B

    B --> DB
    B --> R
    B --> K

    B --> E1
    S4 --> E2
    B --> E3
    K --> E4

    style A fill:#61dafb
    style B fill:#6db33f
    style K fill:#231f20
    style DB fill:#4479a1
    style R fill:#dc382d
```

## 데이터 흐름도

```mermaid
sequenceDiagram
    participant Senior as 👴 시니어
    participant SeniorApp as 시니어 앱
    participant Backend as Spring Boot
    participant DB as Database
    participant Hocuspocus as 실시간 동기화
    participant CaregiverApp as 자녀 앱
    participant Caregiver as 👨‍👩‍👧 자녀

    Note over Senior,Caregiver: 약 복용 체크 시나리오

    Senior->>SeniorApp: 약 복용 체크
    SeniorApp->>Backend: POST /medications/logs
    Backend->>DB: 복용 기록 저장
    Backend->>Hocuspocus: 상태 변경 이벤트
    Hocuspocus->>CaregiverApp: 실시간 업데이트
    CaregiverApp->>Caregiver: 알림: 부모님이 약 드셨어요! ✅

    Note over Senior,Caregiver: 자녀가 원격으로 약 등록

    Caregiver->>CaregiverApp: 부모님 약 등록
    CaregiverApp->>Backend: POST /medications
    Backend->>DB: 약 정보 저장
    Backend->>Hocuspocus: 약 추가 이벤트
    Hocuspocus->>SeniorApp: 실시간 업데이트
    SeniorApp->>Senior: 새로운 약이 등록되었습니다
```

## 약-음식 충돌 감지 플로우

```mermaid
flowchart TD
    A[사용자 식단 입력] --> B{복용 중인 약 있음?}
    B -->|Yes| C[약 목록 조회]
    B -->|No| Z[기록만 저장]

    C --> D[DrugInteractionService]
    D --> E{충돌 검사}

    E -->|충돌 발견| F[심각도 분석]
    F --> G{심각도}

    G -->|높음| H[🚨 즉시 경고<br/>대체 음식 추천]
    G -->|중간| I[⚠️ 주의 알림]
    G -->|낮음| J[ℹ️ 정보 제공]

    E -->|충돌 없음| K[✅ 안전]

    H --> L[가족에게 알림]
    I --> L
    J --> M[기록 저장]
    K --> M
    L --> M
    Z --> M

    style H fill:#ff6b6b
    style I fill:#ffd93d
    style K fill:#6bcf7f
```

## 가족 돌봄 네트워크 구조

```mermaid
graph LR
    subgraph "Family Group"
        P1[👴 부모님 1]
        P2[👵 부모님 2]
        C1[👨 자녀 1]
        C2[👩 자녀 2]
    end

    subgraph "Shared Data"
        M[약 정보]
        S[복용 스케줄]
        L[복용 로그]
        D[식단 기록]
    end

    subgraph "Real-time Sync"
        HCS[Hocuspocus Server]
    end

    P1 -->|읽기/쓰기| HCS
    P2 -->|읽기/쓰기| HCS
    C1 -->|읽기/쓰기| HCS
    C2 -->|읽기/쓰기| HCS

    HCS <--> M
    HCS <--> S
    HCS <--> L
    HCS <--> D

    style P1 fill:#ffd1dc
    style P2 fill:#ffd1dc
    style C1 fill:#b4e7f8
    style C2 fill:#b4e7f8
```

## OCR 처리 파이프라인

```mermaid
flowchart LR
    A[📸 약봉지 촬영] --> B[이미지 업로드]
    B --> C{OCR 처리}

    C -->|우선| D[Google Vision API]
    C -->|Fallback| E[Tesseract.js]

    D --> F[텍스트 추출]
    E --> F

    F --> G[약 이름 파싱]
    G --> H[식약처 API 조회]

    H --> I{매칭 성공?}
    I -->|Yes| J[✅ 자동 입력<br/>약 정보 완성]
    I -->|No| K[수동 수정 요청]

    K --> L[사용자 확인]
    L --> J

    J --> M[약 DB 저장]

    style D fill:#4285f4
    style E fill:#00a67e
    style J fill:#6bcf7f
```

## 알림 시스템 아키텍처

```mermaid
graph TB
    subgraph "알림 발생 원인"
        T1[복약 시간]
        T2[약 재고 부족]
        T3[유효기간 임박]
        T4[약-음식 충돌]
        T5[가족 이벤트]
    end

    subgraph "Event Bus"
        K[Kafka]
    end

    T1 --> K
    T2 --> K
    T3 --> K
    T4 --> K
    T5 --> K

    subgraph "Notification Service"
        N[Spring Scheduler]
        N2[n8n Workflow]
    end

    K --> N
    K --> N2

    subgraph "Phase 1 - 필수"
        P1[웹 푸시 알림]
        P2[브라우저 알림]
    end

    subgraph "Phase 2 - 선택"
        P3[카카오톡 알림톡]
    end

    N --> P1
    N --> P2
    N2 --> P3

    style P1 fill:#6bcf7f
    style P2 fill:#6bcf7f
    style P3 fill:#ffd93d
```

## 데이터베이스 ERD (간략)

```mermaid
erDiagram
    USERS ||--o{ FAMILY_MEMBERS : belongs_to
    FAMILY_GROUPS ||--o{ FAMILY_MEMBERS : contains
    USERS ||--o{ MEDICATIONS : owns
    MEDICATIONS ||--o{ MEDICATION_SCHEDULES : has
    MEDICATIONS ||--o{ MEDICATION_LOGS : tracks
    USERS ||--o{ DIET_LOGS : records
    DIET_LOGS ||--o{ DIET_WARNINGS : generates
    MEDICATIONS ||--o{ DIET_WARNINGS : causes
    USERS ||--o{ NOTIFICATIONS : receives

    USERS {
        int id PK
        string email
        string password_hash
        string name
        enum role
    }

    FAMILY_GROUPS {
        int id PK
        string name
        int created_by FK
    }

    FAMILY_MEMBERS {
        int id PK
        int family_group_id FK
        int user_id FK
        enum role
    }

    MEDICATIONS {
        int id PK
        int user_id FK
        string name
        string ingredient
        date start_date
        date end_date
    }

    MEDICATION_SCHEDULES {
        int id PK
        int medication_id FK
        time time
        string days_of_week
    }

    MEDICATION_LOGS {
        int id PK
        int medication_id FK
        int user_id FK
        timestamp scheduled_time
        boolean completed
    }

    DIET_LOGS {
        int id PK
        int user_id FK
        enum meal_type
        string food_name
        int calories
    }

    DIET_WARNINGS {
        int id PK
        int user_id FK
        int diet_log_id FK
        int medication_id FK
        text warning_message
        enum severity
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        enum type
        string title
        text message
        boolean read
    }
```

## 7주 개발 타임라인

```mermaid
gantt
    title 실버케어 개발 로드맵 (7주)
    dateFormat YYYY-MM-DD
    section 인프라
    프로젝트 초기 설정      :2025-11-05, 7d
    JWT 인증               :2025-11-05, 7d

    section 핵심 기능
    가족 돌봄 네트워크      :crit, 2025-11-12, 7d
    실시간 동기화          :crit, 2025-11-12, 7d
    약 관리 CRUD          :2025-11-19, 7d

    section 차별화 기능
    약봉지 OCR            :2025-11-26, 7d
    약-음식 충돌 경고      :2025-11-26, 7d
    알약 역검색           :2025-12-03, 7d

    section 추가 기능
    식단 관리             :2025-12-03, 7d
    복약 순응도 리포트     :2025-12-10, 7d

    section 마무리
    통합 테스트           :2025-12-10, 7d
    최종 마무리           :2025-12-17, 7d
    발표 준비             :2025-12-24, 7d
    최종 발표             :milestone, 2025-12-31, 0d
```

## 기술 스택

```mermaid
mindmap
  root((실버케어<br/>Tech Stack))
    Frontend
      React 18
      Vite
      TipTap
      Hocuspocus Provider
    Backend
      Spring Boot 3
      Spring Security
      Spring AI
      Kafka
    Database
      MySQL/PostgreSQL
      Redis
    External
      Google Vision OCR
      식약처 API
      카카오톡 API
      n8n
```

---

## 참고 사항

- **실시간 동기화**: Hocuspocus를 통한 WebSocket 기반 가족 간 데이터 동기화
- **이벤트 기반 아키텍처**: Kafka를 통한 비동기 알림 처리
- **OCR 우선순위**: Google Vision → Tesseract.js Fallback
- **약-음식 충돌**: 룰 베이스 시스템 (AI 불필요)
- **알림**: Phase 1 (웹 푸시) 필수, Phase 2 (카카오톡) 선택

**문서 버전**: 1.0
**생성일**: 2025-11-05
**상태**: Mermaid 다이어그램 완성
