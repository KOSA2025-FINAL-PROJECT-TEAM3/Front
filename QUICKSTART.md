# 🚀 뭐냑? (AMA...Pill) 빠른 시작 가이드

> 백엔드 없이도 5분 안에 프런트 프로토타입 실행하기  
> **Dev Mode는 백엔드가 완성되면 VITE_ENABLE_DEV_MODE=false로 비활성화하고, 필요 시 컴포넌트를 제거하세요.**

---

## ⚡ 빠른 실행 (Docker Compose 추천)

### 1단계: 환경 설정

```bash
# 저장소 클론
git clone https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/Front.git
cd Front

# 환경 변수 파일 생성
cp .env.example .env
```

### 2단계: Docker Compose로 전체 스택 실행

```bash
# 모든 서비스 시작 (MySQL, PostgreSQL, Redis, Kafka, 9개 마이크로서비스)
docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

> **주의**: 현재 프로젝트는 **프런트엔드 선행 개발**을 기본 흐름으로 잡았습니다. 백엔드가 준비되기 전까지 Dev Mode로 화면을 검증하고, 이후 실제 API를 붙입니다.

### 3단계: Frontend 실행 (Dev Mode 우선)

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (React 19 + Vite)
npm run dev
```

Dev Mode가 필요한 이유와 절차는 아래 “🔑 Developer Mode (Frontend-first)” 섹션을 참고하세요.
```

### 4단계: 브라우저에서 확인

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761

---

## 🗄️ 데이터베이스 초기화

### MySQL (트랜잭션 DB)

```bash
# Docker 컨테이너에서 스키마 실행
docker exec -i silvercare-mysql mysql -u root -psilvercare_root_2025 silvercare < database-schema-mysql.sql

# 또는 MySQL 클라이언트로 직접 연결
mysql -h localhost -P 3306 -u silvercare_app -psilvercare_pass_2025 silvercare < database-schema-mysql.sql
```

### PostgreSQL (실시간 동기화 DB)

```bash
# Docker 컨테이너에서 스키마 실행
docker exec -i silvercare-postgresql psql -U silvercare_sync_app -d silvercare_sync -f /docker-entrypoint-initdb.d/01-schema.sql

# 또는 psql 클라이언트로 직접 연결
psql -h localhost -p 5432 -U silvercare_sync_app -d silvercare_sync -f database-schema-postgresql.sql
# 비밀번호: silvercare_sync_pass_2025
```

---

## 🔍 서비스 확인

### 헬스 체크

```bash
# API Gateway
curl http://localhost:8080/actuator/health

# Auth Service
curl http://localhost:8081/actuator/health

# Medication Service
curl http://localhost:8082/actuator/health

# Eureka 등록 확인
curl http://localhost:8761/eureka/apps
```

### 데이터베이스 연결 테스트

```bash
# MySQL
docker exec -it silvercare-mysql mysql -u silvercare_app -psilvercare_pass_2025 -e "USE silvercare; SHOW TABLES;"

# PostgreSQL
docker exec -it silvercare-postgresql psql -U silvercare_sync_app -d silvercare_sync -c "\dt"

# Redis
docker exec -it silvercare-redis redis-cli ping
```

---

## 🛑 서비스 중지

```bash
# 모든 서비스 중지
docker-compose down

# 볼륨까지 삭제 (데이터 초기화)
docker-compose down -v
```

---

## 📦 개별 서비스만 실행하기

### 데이터베이스만 실행

```bash
docker-compose up -d mysql postgresql redis
```

### Kafka만 실행

```bash
docker-compose up -d zookeeper kafka
```

### Spring Cloud 인프라만 실행

```bash
docker-compose up -d config-server eureka-server api-gateway
```

---

## 🔧 개발 환경 설정

### Frontend 개발 (React 19)

```bash
cd Front
npm install
npm run dev
# http://localhost:5173
```

### Backend 개발 (Spring Boot)

```bash
# 각 마이크로서비스 디렉토리에서
cd auth-service
mvn spring-boot:run

# 또는 IDE에서 실행
# IntelliJ IDEA: Run → Edit Configurations → Spring Boot
```

### Hocuspocus 서버 개발 (Node.js)

```bash
cd hocuspocus-server
npm install
npm run dev
# ws://localhost:1234
```

---

## 🔑 Developer Mode (Frontend-first)

백엔드가 아직 없더라도 Stage 1~3 작업을 진행할 수 있도록 **Developer Mode**를 제공합니다.  
Stage 4(실시간 동기화·실제 API 연동) 이후에는 Dev Mode를 제거하거나 비활성화해야 합니다.

### 왜 필요한가?
- UI/UX를 앞당겨 검증하기 위해 프런트가 먼저 구축되는 구조입니다.
- 실서비스 API가 준비되지 않아도 로그인·역할 선택·가족 관리 화면을 확인할 수 있어야 합니다.

### 동작 방식
1. `npm run dev`로 프런트 서버를 띄우면 `localStorage`에 Dev Mode 플래그를 심어 임시 토큰/사용자 정보를 저장합니다.
2. Axios 인터셉터는 Dev Mode가 감지되면 실제 API 호출을 막고 Mock 응답을 반환합니다.
3. AuthStore + FamilyContext는 Dev Mode 데이터를 이용해 역할·가족 ID 등을 재현합니다.

### 사용 방법
- **1)** 브라우저에서 `http://localhost:5173` 접속
- **2)** 화면 왼쪽 아래 `⚙️ Dev Mode` 버튼 클릭 → 원하는 경로 선택 (현재 제공: Role Selection, Senior Dashboard, Guardian Dashboard, Family Management)
- **3)** Dev Mode 해제: Dev Mode 메뉴의 “토큰 초기화” 버튼을 누르거나 `localStorage.clear()` 실행
- **환경 변수로 비활성화**: `.env`에서 `VITE_ENABLE_DEV_MODE=false`로 설정하면 버튼이 렌더링되지 않습니다.

### 실제 백엔드 연결로 전환
1. `.env`에서 `VITE_USE_MOCK_API=false` 설정 (기본값)
2. Dev Mode 플래그(`localStorage.setItem('amapill_dev_mode', 'false')`) 제거
3. Stage 4 이후에는 `DeveloperModePanel` 자체를 삭제하거나 `VITE_ENABLE_DEV_MODE=false`로 고정

### Kakao OAuth 설정
1. `.env`에 `VITE_KAKAO_CLIENT_ID`와 `VITE_KAKAO_REDIRECT_URI`를 입력합니다. (기본 콜백: `http://localhost:5173/auth/kakao/callback`)
2. 카카오 개발자 콘솔에서 Redirect URI를 동일하게 등록합니다.
3. 로그인 화면의 “카카오로 로그인” 버튼을 누르면 카카오 인증 후 콜백 페이지가 자동으로 `/role-selection`까지 안내합니다.

### Stage 3 참고 (Family Prototype)
- Family 상태는 `src/stores/familyStore.js`(Zustand)에서 관리하며, Dev Mode에서는 `FamilyMockService`가 localStorage 기반 데이터를 공급합니다.
- FamilyProvider는 store 초기화만 담당하며, 화면에서는 `useFamily` 훅을 통해 상태를 구독합니다.
- Stage 4에서 API/실시간 연동 시 동일한 store 액션(loadFamily/invite/remove)을 실제 엔드포인트로 교체하면 됩니다.

### Stage 4 실시간 동기화
- `VITE_WS_BASE_URL`에 Hocuspocus 서버 주소를 입력하고, `VITE_ENABLE_REALTIME`(기본값 true)을 유지하면 `useFamilySync`가 `FamilySyncService`를 통해 실시간 상태를 구독합니다.
- WS URL이 비어 있거나 `VITE_ENABLE_REALTIME=false`로 설정하면 Stage 3와 동일한 Mock 동작을 유지합니다.
- Dev Mode에서는 여전히 Mock 데이터를 주입하지만, 실 WS가 연결되어 있을 경우 Dev 계정도 동일한 `family-group-{id}` 룸에 입장합니다.

---

## 🧪 테스트 API 호출 (백엔드 준비 후)

### 회원가입

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@silvercare.com",
    "password": "password123",
    "name": "테스트 사용자",
    "role": "senior"
  }'
```

### 로그인

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@silvercare.com",
    "password": "password123"
  }'
```

---

## 📚 다음 단계

1. **아키텍처 이해하기**: [MICROSERVICES_SETUP.md](./MICROSERVICES_SETUP.md)
2. **API 명세 확인**: [MVP_DTO_SPECIFICATION.md](./MVP_DTO_SPECIFICATION.md)
3. **개발 로드맵**: [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)

---

## 🚧 남은 단계 (Frontend 기준)

1. **Medication API 연동**: `src/stores/medicationStore.js`가 mock 데이터를 사용하는 상태라, Stage 4 CRUD 완료를 위해 `src/core/services/api/medicationApiClient.js`와 실제 엔드포인트를 연결해야 합니다.
2. **OCR 플로우 완성**: `src/features/ocr/pages/PrescriptionScan.jsx`는 최소 플로우만 복구된 상태입니다. 정의서의 `ImageUploader`/`ManualCorrection` UI와 실제 OCR API 연동, 약 관리와의 연결 로직이 필요합니다.
3. **Diet 모듈 확장**: 현재 `FoodWarningPage` 하나만 존재하므로 정의서에 명시된 `DietLogPage`, `HospitalDietResourcesPage` 및 관련 컴포넌트를 추가해야 합니다.
4. **API 서비스 확장**: `src/core/services/api`에 Auth/Medication/Family/Diet/OCR 클라이언트를 추가했지만, 각 스토어/서비스에서 실제로 사용하도록 단계별 치환이 필요합니다.
5. **Stage 4 QA**: Dev Mode로 기본 동작 확인은 가능하지만, 실제 백엔드 연동이 완료되면 통합 QA 시나리오를 갱신하고 `VITE_USE_MOCK_API`/Dev Mode 설정을 정리해야 합니다.

---

## 🆘 문제 해결

### Docker 컨테이너가 시작되지 않음

```bash
# 기존 컨테이너 및 볼륨 삭제
docker-compose down -v

# Docker 시스템 정리
docker system prune -a

# 다시 시작
docker-compose up -d
```

### 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :8080
lsof -i :3306
lsof -i :5432

# 프로세스 종료
kill -9 <PID>
```

### npm install 실패

```bash
# 캐시 삭제
rm -rf node_modules package-lock.json
npm cache clean --force

# 재설치
npm install
```

---

**최종 수정일**: 2025-11-06
**작성자**: 뭐냑? (AMA...Pill) 개발팀
