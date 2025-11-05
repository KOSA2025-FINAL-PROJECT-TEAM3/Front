# 실버케어 시스템 아키텍처

> 가족 돌봄 네트워크 기반 약 관리 플랫폼

## 📁 다이어그램 파일 목록

모든 Mermaid 다이어그램은 `diagrams/` 폴더에 개별 파일로 저장되어 있습니다.

| 파일명 | 설명 | 용도 |
|--------|------|------|
| `01-system-architecture.mmd` | 전체 시스템 구조 | Frontend, Backend, Database, External Services |
| `02-data-flow.mmd` | 데이터 흐름도 | 시니어-자녀 간 실시간 동기화 시퀀스 |
| `03-drug-food-interaction.mmd` | 약-음식 충돌 감지 | 충돌 검사 및 경고 플로우차트 |
| `04-family-network.mmd` | 가족 돌봄 네트워크 | Hocuspocus 기반 실시간 공유 구조 |
| `05-ocr-pipeline.mmd` | OCR 처리 파이프라인 | 약봉지 인식 → 자동 등록 플로우 |
| `06-notification-system.mmd` | 알림 시스템 | Kafka 이벤트 기반 알림 아키텍처 |
| `07-database-erd.mmd` | 데이터베이스 ERD | Mermaid 버전 (간략) |
| `08-development-timeline.mmd` | 7주 개발 타임라인 | Gantt 차트 |
| `09-tech-stack.mmd` | 기술 스택 | Mindmap 형식 |

---

## 1️⃣ 전체 시스템 구조

**파일**: `diagrams/01-system-architecture.mmd`

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

### 주요 구성 요소

- **Frontend**: React 18 + Vite (JSX only, React Native 사용 금지)
- **Backend**: Spring Boot 3 + Spring Security + Spring AI
- **Real-time**: Hocuspocus Server (WebSocket 기반 가족 간 동기화)
- **Event Bus**: Apache Kafka (비동기 이벤트 처리)
- **Database**: MySQL/PostgreSQL (주 DB), Redis (캐시/세션)
- **External**: 식약처 API, Google Vision OCR, 카카오톡 알림톡, n8n

---

## 2️⃣ 데이터 흐름도

**파일**: `diagrams/02-data-flow.mmd`

```mermaid
sequenceDiagram
    participant Senior as 👴 시니어
    participant SeniorWeb as 시니어 웹
    participant Backend as Spring Boot
    participant DB as Database
    participant Hocuspocus as 실시간 동기화
    participant CaregiverWeb as 자녀 웹
    participant Caregiver as 👨‍👩‍👧 자녀

    Note over Senior,Caregiver: 약 복용 체크 시나리오

    Senior->>SeniorWeb: 약 복용 체크
    SeniorWeb->>Backend: POST /medications/logs
    Backend->>DB: 복용 기록 저장
    Backend->>Hocuspocus: 상태 변경 이벤트
    Hocuspocus->>CaregiverWeb: 실시간 업데이트
    CaregiverWeb->>Caregiver: 알림: 부모님이 약 드셨어요! ✅

    Note over Senior,Caregiver: 자녀가 원격으로 약 등록

    Caregiver->>CaregiverWeb: 부모님 약 등록
    CaregiverWeb->>Backend: POST /medications
    Backend->>DB: 약 정보 저장
    Backend->>Hocuspocus: 약 추가 이벤트
    Hocuspocus->>SeniorWeb: 실시간 업데이트
    SeniorWeb->>Senior: 새로운 약이 등록되었습니다
```

### 핵심 시나리오

1. **시니어 → 자녀**: 부모님이 약 복용 체크 → 자녀에게 실시간 알림
2. **자녀 → 시니어**: 자녀가 원격으로 약 등록 → 부모님 웹에 즉시 반영

---

## 3️⃣ 약-음식 충돌 감지 플로우

**파일**: `diagrams/03-drug-food-interaction.mmd`

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

### 차별화 기능

- 룰 베이스 시스템 (AI 불필요)
- 심각도별 차등 대응 (높음/중간/낮음)
- 가족에게 즉시 알림 (높음/중간 등급)

---

## 4️⃣ 가족 돌봄 네트워크 구조

**파일**: `diagrams/04-family-network.mmd`

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

### 핵심 가치

- 떨어져 있어도 부모님 건강 관리 가능
- 실시간 양방향 동기화 (WebSocket)
- 권한 관리 (읽기/쓰기 분리 가능)

---

## 5️⃣ OCR 처리 파이프라인

**파일**: `diagrams/05-ocr-pipeline.mmd`

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

### OCR 전략

- **우선순위 1**: Google Vision API (무료 1,000건/월, 인식률 95%+)
- **Fallback**: Tesseract.js (완전 무료, 인식률 80%)
- Naver Clova OCR 제외 (유료)

---

## 6️⃣ 알림 시스템 아키텍처

**파일**: `diagrams/06-notification-system.mmd`

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

### 알림 전략

- **Phase 1 (필수)**: 웹 푸시 알림, 브라우저 알림
- **Phase 2 (선택)**: 카카오톡 알림톡 (시간 있으면)
- React Native 사용 금지 → 모바일 네이티브 알림 불가

---

## 7️⃣ 데이터베이스 ERD

**파일**: `diagrams/07-database-erd.mmd`

상세한 ERD는 `database-erd.dbml` 파일 참조 (dbdiagram.io 형식)

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
```

### 주요 테이블 (10개)

1. `users` - 사용자 정보
2. `family_groups` - 가족 그룹
3. `family_members` - 가족 구성원 매핑
4. `medications` - 약 정보
5. `medication_schedules` - 복용 일정
6. `medication_logs` - 복용 기록
7. `drug_food_interactions` - 약-음식 충돌 정보
8. `diet_logs` - 식단 기록
9. `diet_warnings` - 식단-약 충돌 경고
10. `notifications` - 알림

---

## 8️⃣ 7주 개발 타임라인

**파일**: `diagrams/08-development-timeline.mmd`

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

### 주요 마일스톤

- **Week 1-2**: 인프라 + 가족 돌봄 네트워크 (핵심!)
- **Week 3-4**: 약 관리 + 차별화 기능 (OCR, 약-음식 충돌)
- **Week 5-6**: 추가 기능 + 통합 테스트
- **Week 7-8**: 마무리 + 발표 준비
- **12/31**: 최종 발표일 🎉

---

## 9️⃣ 기술 스택

**파일**: `diagrams/09-tech-stack.mmd`

```mermaid
mindmap
  root((실버케어<br/>Tech Stack))
    Frontend
      React 18
      Vite
      TipTap
      Hocuspocus Provider
    Backend
      Java 21 LTS
      Spring Boot 3.4.7
      Spring Cloud 2024.0.2
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

### 백엔드 기술 스택 선정 이유

#### Java 21 LTS
- **장기 지원**: 2029년까지 지원 보장
- **Virtual Threads**: 고성능 동시성 처리
- **ZGC**: 저지연 가비지 컬렉션
- **프로덕션 검증**: 충분히 안정화된 LTS 버전

#### Spring Boot 3.4.7 (2025년 6월)
- **안정성**: 6개월 이상 검증된 안정 버전
- **버그 수정**: 49개 버그 수정 및 의존성 업그레이드
- **프로덕션 준비**: 실무 환경에서 충분히 검증됨
- **3.5.0 제외 이유**: 너무 최신 (2025년 5월 출시, 검증 부족)

#### Spring Cloud 2024.0.2 (Moorgate)
- **Spring Boot 3.4.x 완벽 호환**
- **Spring Framework 6.2.0 통합**
- **Eureka Server 최신 기능 지원**
- **마이크로서비스 아키텍처 대비**

---

## 📖 사용 방법

### GitHub에서 보기
GitHub는 `.md` 파일 내의 Mermaid 코드 블록을 자동 렌더링합니다.

### VS Code에서 보기
1. Mermaid 플러그인 설치
2. `.mmd` 파일 또는 `.md` 파일 열기
3. 미리보기 패널에서 확인

### Mermaid Live Editor
1. https://mermaid.live 접속
2. `diagrams/*.mmd` 파일 내용 복사
3. 실시간 편집 및 내보내기 (PNG, SVG)

### Notion/Obsidian
Mermaid 코드 블록을 복사해서 붙여넣기

---

## 📝 참고 사항

- **실시간 동기화**: Hocuspocus (WebSocket)
- **이벤트 기반**: Kafka (비동기 처리)
- **OCR**: Google Vision → Tesseract Fallback
- **약-음식 충돌**: 룰 베이스 시스템
- **알림**: Phase 1 필수, Phase 2 선택
- **React Native 금지**: 웹 앱만 사용

---

**문서 버전**: 2.0 (개별 파일 분리)
**생성일**: 2025-11-05
**상태**: Mermaid 다이어그램 완성 (9개 파일)
