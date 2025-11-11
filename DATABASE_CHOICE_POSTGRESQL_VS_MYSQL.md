# PostgreSQL vs MySQL 선택 가이드

> AMA...Pill 프로젝트에 최적화된 데이터베이스 선택
>
> **최초 분석**: PostgreSQL 추천 ⭐
> **최종 결정**: **MySQL 8.0+ 선택** ✅ (팀 경험 및 초기 개발 속도 우선)

---

## 🎯 프로젝트 요구사항 분석

### 데이터 특성

| 요구사항 | 설명 | 중요도 |
|---------|------|--------|
| **JSON 데이터** | `medication.warnings`, `diet.alternatives`, `symptoms` 등 | 🔴 HIGH |
| **복잡한 쿼리** | 약-음식 충돌, 질병별 제한사항 조인 | 🔴 HIGH |
| **GIS 검색** | 약국 위치 검색 (위도/경도) | 🟡 MEDIUM |
| **Full-text 검색** | 증상 검색, 약품명 검색 | 🟡 MEDIUM |
| **ACID 트랜잭션** | 가족 동기화, 복약 기록 | 🔴 HIGH |
| **데이터 무결성** | 외래키, 제약조건 | 🔴 HIGH |

---

## 📊 PostgreSQL vs MySQL 비교

### 1. JSON 지원 ⭐⭐⭐⭐⭐

| 항목 | PostgreSQL | MySQL | 승자 |
|------|-----------|-------|------|
| **JSON 타입** | `jsonb` (Binary JSON) | `json` (텍스트) | **PostgreSQL** |
| **인덱싱** | GIN/GiST 인덱스 지원 | ⚠️ 제한적 (5.7+) | **PostgreSQL** |
| **쿼리 성능** | 매우 빠름 | 느림 | **PostgreSQL** |
| **JSON 함수** | 50+ 함수 | 기본만 | **PostgreSQL** |

**실제 쿼리 예시**:

```sql
-- PostgreSQL (빠름)
SELECT * FROM medications
WHERE warnings @> '["자몽 주스"]'::jsonb;

-- MySQL (느림, 인덱스 안 탐)
SELECT * FROM medications
WHERE JSON_CONTAINS(warnings, '"자몽 주스"');
```

**프로젝트에 필요한 JSON 필드**:
- `medications.warnings` (array)
- `medications.side_effects` (array)
- `medications.timing` (array)
- `drug_food_interactions.alternatives` (array)
- `disease_info.symptoms` (array)
- `adherence_reports.medication_breakdown` (object)
- `adherence_reports.weekly_trend` (array)
- `symptom_searches.symptoms` (array)
- `suspected_diseases.matched_symptoms` (array)

**승자**: **PostgreSQL** (프로젝트에 JSON이 9개 필드!)

---

### 2. GIS 기능 (약국 검색) ⭐⭐⭐⭐

| 항목 | PostgreSQL | MySQL | 승자 |
|------|-----------|-------|------|
| **GIS 확장** | PostGIS (최강) | Spatial Extensions | **PostgreSQL** |
| **거리 계산** | 네이티브 지원 | 복잡한 쿼리 | **PostgreSQL** |
| **성능** | 매우 빠름 | 보통 | **PostgreSQL** |

**실제 쿼리 예시**:

```sql
-- PostgreSQL + PostGIS (간단)
SELECT name, address
FROM pharmacies
WHERE ST_DWithin(
  location,
  ST_MakePoint(127.0276, 37.4979)::geography,
  3000  -- 3km 반경
)
ORDER BY location <-> ST_MakePoint(127.0276, 37.4979)::geography
LIMIT 10;

-- MySQL (복잡)
SELECT name, address,
  (6371 * acos(cos(radians(37.4979)) * cos(radians(latitude))
  * cos(radians(longitude) - radians(127.0276))
  + sin(radians(37.4979)) * sin(radians(latitude)))) AS distance
FROM pharmacies
HAVING distance < 3
ORDER BY distance
LIMIT 10;
```

**승자**: **PostgreSQL** (PostGIS 훨씬 강력)

---

### 3. Full-text 검색 (증상/약품명) ⭐⭐⭐

| 항목 | PostgreSQL | MySQL | 승자 |
|------|-----------|-------|------|
| **한글 지원** | ✅ (pg_trgm) | ⚠️ 제한적 | **PostgreSQL** |
| **유사도 검색** | ✅ similarity() | ❌ | **PostgreSQL** |
| **성능** | GIN 인덱스 | FULLTEXT | **PostgreSQL** |

**실제 쿼리 예시**:

```sql
-- PostgreSQL (한글 잘 됨)
SELECT name, similarity(name, '두통약') as score
FROM medications
WHERE name % '두통약'  -- % = 유사도 검색
ORDER BY score DESC;

-- MySQL (한글 약함)
SELECT name, MATCH(name) AGAINST('두통약' IN NATURAL LANGUAGE MODE) as score
FROM medications
WHERE MATCH(name) AGAINST('두통약')
ORDER BY score DESC;
```

**승자**: **PostgreSQL** (한글 검색 우수)

---

### 4. 데이터 무결성 & 트랜잭션 ⭐⭐⭐⭐⭐

| 항목 | PostgreSQL | MySQL | 승자 |
|------|-----------|-------|------|
| **외래키 제약** | 완벽 지원 | ✅ (InnoDB만) | 동등 |
| **CHECK 제약** | ✅ | ⚠️ 8.0+ | **PostgreSQL** |
| **트랜잭션 격리** | MVCC (우수) | MVCC (보통) | **PostgreSQL** |
| **동시성** | 매우 높음 | 보통 | **PostgreSQL** |

**프로젝트 중요 포인트**:
```sql
-- CHECK 제약 예시 (데이터 무결성)
CREATE TABLE medications (
  id bigint PRIMARY KEY,
  dosage varchar(100),
  remaining_quantity int,
  total_quantity int,
  CHECK (remaining_quantity <= total_quantity),
  CHECK (remaining_quantity >= 0)
);
```

**가족 동기화 시나리오**:
- 부모님이 복약 체크
- 자녀가 동시에 리포트 조회
- 동시성 제어 필수

**승자**: **PostgreSQL** (MVCC 성능 우수)

---

### 5. 복잡한 쿼리 성능 ⭐⭐⭐⭐

| 항목 | PostgreSQL | MySQL | 승자 |
|------|-----------|-------|------|
| **CTE (WITH)** | ✅ 최적화 | ⚠️ 느림 | **PostgreSQL** |
| **Window 함수** | ✅ 완벽 | ✅ 8.0+ | 동등 |
| **서브쿼리** | 빠름 | 느림 | **PostgreSQL** |
| **쿼리 플래너** | 매우 우수 | 보통 | **PostgreSQL** |

**실제 필요한 복잡한 쿼리**:

```sql
-- 약-음식-질병 3중 조인 (복잡!)
WITH user_meds AS (
  SELECT m.id, m.name, m.ingredient
  FROM medications m
  WHERE m.user_id = 123 AND m.is_active = true
),
user_diseases AS (
  SELECT d.id, d.disease_name
  FROM user_diseases ud
  JOIN disease_info d ON ud.disease_id = d.id
  WHERE ud.user_id = 123 AND ud.is_active = true
)
SELECT DISTINCT
  dfi.food_name,
  dfi.reason,
  dfi.severity,
  dfi.alternatives
FROM diet_logs dl
JOIN user_meds um ON true
JOIN drug_food_interactions dfi
  ON dfi.drug_ingredient = um.ingredient
  AND dfi.food_name = dl.food_name
WHERE dl.user_id = 123
UNION ALL
SELECT
  dr.restriction_name,
  dr.reason,
  dr.severity,
  dr.alternatives
FROM diet_logs dl
JOIN user_diseases ud ON true
JOIN disease_restrictions dr
  ON dr.disease_id = ud.id
  AND dr.restriction_name = dl.food_name
WHERE dl.user_id = 123;
```

**승자**: **PostgreSQL** (복잡한 쿼리 최적화 우수)

---

### 6. 확장성 & 에코시스템 ⭐⭐⭐

| 항목 | PostgreSQL | MySQL | 승자 |
|------|-----------|-------|------|
| **확장 기능** | PostGIS, pg_trgm, uuid 등 | 제한적 | **PostgreSQL** |
| **타입 시스템** | 매우 풍부 (Array, JSONB 등) | 제한적 | **PostgreSQL** |
| **커스텀 함수** | ✅ PL/pgSQL | ✅ 프로시저 | 동등 |
| **Spring Boot** | ✅ 완벽 지원 | ✅ 완벽 지원 | 동등 |

**프로젝트에 유용한 PostgreSQL 확장**:
```sql
-- UUID v7 (시간순 정렬 가능)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text 한글 검색
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 약국 GIS 검색
CREATE EXTENSION IF NOT EXISTS postgis;

-- 암호화
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

**승자**: **PostgreSQL** (확장 생태계 우수)

---

### 7. 라이선스 & 비용 ⭐⭐

| 항목 | PostgreSQL | MySQL | 비고 |
|------|-----------|-------|------|
| **라이선스** | PostgreSQL License (MIT 유사) | GPL / Commercial | PostgreSQL 우수 |
| **상용화** | ✅ 자유 | ⚠️ Oracle 소유 | PostgreSQL 우수 |
| **비용** | 완전 무료 | 기본 무료 | 동등 |

**승자**: **PostgreSQL** (라이선스 제약 없음)

---

## 🏆 최종 점수

| 항목 | PostgreSQL | MySQL |
|------|-----------|-------|
| JSON 지원 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| GIS 검색 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Full-text 검색 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 데이터 무결성 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 복잡한 쿼리 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 확장성 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 라이선스 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **총점** | **33/35** | **23/35** |

---

## 🎯 프로젝트별 권장

### ✅ PostgreSQL 추천 (AMA...Pill)

**이유**:
1. **JSON 필드 9개** → jsonb 인덱싱 필수
2. **약국 GIS 검색** → PostGIS 필수
3. **복잡한 쿼리** → 약-음식-질병 3중 조인
4. **한글 검색** → pg_trgm 우수
5. **데이터 무결성** → CHECK 제약 필요
6. **동시성** → 가족 동기화 시 중요

**단점**:
- 초기 학습 곡선 (MySQL보다 복잡)
- 설정 복잡함

---

### ⚠️ MySQL을 선택하는 경우

**적합한 프로젝트**:
- JSON 거의 안 씀
- GIS 불필요
- 단순한 쿼리 위주
- 팀이 MySQL 경험 많음

**AMA...Pill에는 부적합**:
- JSON 많음 (9개 필드)
- GIS 필요 (약국 검색)
- 복잡한 쿼리 많음

---

## 🚀 실무 구현 가이드

### PostgreSQL 설정

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:16-3.4  # PostGIS 포함
    environment:
      POSTGRES_DB: amapill
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    command:
      - "postgres"
      - "-c"
      - "shared_preload_libraries=pg_stat_statements"
      - "-c"
      - "max_connections=200"
```

### Spring Boot 설정

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/amapill
    username: admin
    password: secure_password
    driver-class-name: org.postgresql.Driver
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        use_sql_comments: true
```

```gradle
// build.gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'org.postgresql:postgresql:42.7.1'

    // PostGIS 지원
    implementation 'org.hibernate:hibernate-spatial:6.4.1'
}
```

### 초기 확장 설치

```sql
-- 확장 설치 (최초 1회)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID 생성
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- 한글 검색
CREATE EXTENSION IF NOT EXISTS "postgis";        -- GIS 검색
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- 암호화

-- 인덱스 생성 예시
CREATE INDEX idx_medications_warnings ON medications USING GIN (warnings);
CREATE INDEX idx_pharmacy_location ON pharmacies USING GIST (location);
CREATE INDEX idx_medication_name_trgm ON medications USING GIN (name gin_trgm_ops);
```

---

## 📊 성능 벤치마크 (예상)

### JSON 쿼리

| 작업 | PostgreSQL | MySQL | 비율 |
|------|-----------|-------|------|
| JSON 배열 검색 | 2ms | 15ms | **7.5배 빠름** |
| JSON 필드 추출 | 1ms | 5ms | **5배 빠름** |
| JSON 인덱스 스캔 | 3ms | 50ms | **16배 빠름** |

### GIS 쿼리

| 작업 | PostgreSQL | MySQL | 비율 |
|------|-----------|-------|------|
| 3km 반경 검색 | 5ms | 25ms | **5배 빠름** |
| 거리 정렬 | 8ms | 40ms | **5배 빠름** |

### 복잡한 조인

| 작업 | PostgreSQL | MySQL | 비율 |
|------|-----------|-------|------|
| 3개 테이블 조인 | 10ms | 25ms | **2.5배 빠름** |
| CTE 쿼리 | 15ms | 60ms | **4배 빠름** |

---

## 🎓 학습 리소스

### PostgreSQL

- [공식 문서](https://www.postgresql.org/docs/)
- [PostGIS 가이드](https://postgis.net/documentation/)
- [Spring Data JPA + PostgreSQL](https://spring.io/guides/gs/accessing-data-jpa/)

### JSON 쿼리

```sql
-- 배열에 값 포함 여부
SELECT * FROM medications
WHERE warnings @> '["자몽 주스"]'::jsonb;

-- 배열 요소 개수
SELECT name, jsonb_array_length(warnings) as count
FROM medications;

-- 중첩 JSON 접근
SELECT
  medication_breakdown->>'medication_name' as name,
  (medication_breakdown->>'adherence_rate')::decimal as rate
FROM adherence_reports;
```

---

## 📝 결론

### ✅ PostgreSQL 선택

**근거**:
1. JSON 필드 9개 → jsonb 필수
2. 약국 GIS → PostGIS 필수
3. 복잡한 쿼리 → 최적화 우수
4. 한글 검색 → pg_trgm 우수
5. 프로젝트 특성과 완벽 매치

### 예상 효과

- JSON 쿼리 **5-15배 빠름**
- GIS 쿼리 **5배 빠름**
- 복잡한 조인 **2-4배 빠름**
- 한글 검색 품질 **50% 향상**

---

**권장 액션**:
1. ✅ PostgreSQL 16 + PostGIS 설치
2. ✅ DATABASE_ERD_V3.dbml → PostgreSQL DDL 변환
3. ✅ Spring Boot 설정 업데이트
4. ✅ 확장 설치 (uuid, pg_trgm, postgis)

**작성일**: 2025-11-10
**권장**: PostgreSQL 16 + PostGIS 3.4

---

## 🎯 최종 결정 (2025-11-10)

### ✅ MySQL 8.0+ 선택

**결정 사유**:

1. **팀 숙련도 우선**
   - 팀 멤버들의 MySQL 경험이 더 풍부
   - 초기 개발 속도를 우선시
   - 러닝 커브 최소화

2. **MySQL 8.0+ JSON 지원 충분**
   - JSON 타입 네이티브 지원
   - JSON 함수 및 인덱싱 가능
   - 프로젝트 초기 단계에서는 성능 차이 미미

3. **GIS 대안 가능**
   - MySQL Spatial 타입으로 약국 위치 검색 구현 가능
   - `ST_Distance_Sphere()` 함수로 거리 계산
   - 초기 요구사항 충족 가능

4. **마이그레이션 유연성**
   - 향후 성능 이슈 발생 시 PostgreSQL로 마이그레이션 가능
   - DBML 기반 스키마로 DB 변경 용이

### 구현 방침

**DB 설정**:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/amapill?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
```

**JSON 필드 매핑**:
```java
@Column(columnDefinition = "JSON")
private String warnings; // JPA에서 String으로 받아서 Jackson으로 변환
```

**Spatial 타입 매핑**:
```java
@Column(columnDefinition = "POINT")
private Point location; // org.locationtech.jts.geom.Point
```

### 향후 고려사항

- **모니터링**: JSON 쿼리 성능 모니터링
- **인덱싱**: 자주 조회되는 JSON 필드에 Generated Column + Index 활용
- **스케일링**: 트래픽 증가 시 PostgreSQL 마이그레이션 검토

---

**최종 결정일**: 2025-11-10  
**선택**: MySQL 8.0+ (팀 경험 및 초기 개발 속도 우선)  
**향후**: 성능 요구사항에 따라 PostgreSQL 마이그레이션 검토
