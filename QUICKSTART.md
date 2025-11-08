# 🚀 실버케어 빠른 시작 가이드

> 5분 안에 실버케어 개발 환경 구축하기

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

### 3단계: Frontend 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (React 19 + Vite)
npm run dev
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

## 🧪 테스트 API 호출

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
**작성자**: 실버케어 개발팀
