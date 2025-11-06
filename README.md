# 🏥 실버케어 (SilverCare)

> 가족 돌봄 네트워크 기반 약 관리 플랫폼
>
> 떨어져 있어도 부모님 건강을 지킬 수 있습니다

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.7-6db33f?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21%20LTS-orange?logo=openjdk)](https://openjdk.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1?logo=mysql)](https://www.mysql.com/)

---

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [핵심 기능](#-핵심-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [문서 가이드](#-문서-가이드)
- [팀 정보](#-팀-정보)

---

## 🎯 프로젝트 소개

**실버케어**는 혼자 사시는 부모님의 약 복용을 자녀가 원격으로 관리하고 모니터링할 수 있는 **가족 돌봄 네트워크** 플랫폼입니다.

### 해결하는 문제

- 🏠 혼자 사시는 부모님이 약을 잘 안 드심
- 📱 자녀가 챙겨드리고 싶지만 물리적으로 멀리 떨어짐
- 👴 부모님은 복잡한 앱 사용이 어려움
- ⚠️ 기존 약 관리 앱은 개인용이며 가족 연동이 없음

### 핵심 차별점

| 기존 앱 (알약, 똑닥) | 실버케어 |
|-------------------|---------|
| ❌ 개인 사용자만 | ✅ 시니어 + 자녀 양면 시장 |
| ❌ 가족 연동 없음 | ✅ 실시간 돌봄 네트워크 |
| ❌ 약-약 상호작용만 | ✅ **약-음식 충돌 자동 경고** |
| ❌ 수동 입력만 | ✅ **OCR 자동 인식** |
| ❌ 의료진 소통 없음 | ✅ 복약 순응도 리포트 |

---

## 💡 핵심 기능

### 1. 가족 돌봄 네트워크 (MVP 1순위)
- 자녀가 원격으로 부모님 약 스케줄 등록
- 실시간 복용 현황 모니터링 (Hocuspocus WebSocket)
- 약 미복용 시 자녀에게 즉시 알림

### 2. 약-음식 충돌 경고 (MVP 2순위)
- 룰 베이스 시스템으로 약-음식 상호작용 자동 검사
- 심각도별 경고 (높음/중간/낮음)
- 대체 음식 추천

### 3. 약봉지 OCR 자동 등록 (MVP 3순위)
- Google Vision API로 처방전 자동 인식
- Tesseract.js Fallback
- 약 정보 자동 파싱 및 등록

### 4. 알약 역검색
- 식약처 API 연동
- 모양, 색상, 각인으로 약 식별

### 5. 복약 순응도 리포트
- 주간/월간 복약 통계
- PDF 리포트 생성
- 의료진 공유 가능

---

## 🛠 기술 스택

### Frontend
- **Framework**: React 18 + Vite (JSX only)
- **실시간 동기화**: Hocuspocus + TipTap
- **스타일링**: SCSS / CSS Modules

### Backend
- **Language**: Java 21 LTS (Virtual Threads, ZGC)
- **Framework**: Spring Boot 3.4.7
- **Cloud**: Spring Cloud 2024.0.2 (Moorgate)
- **보안**: Spring Security (JWT)
- **메시징**: Apache Kafka

### Database
- **관계형 DB**: MySQL 8.0
- **캐싱**: Redis

### External API
- **OCR**: Google Vision API / Tesseract.js
- **약 정보**: 식약처 의약품안전나라 API
- **알림**: 카카오톡 알림톡 (Phase 2)

---

## 🚀 시작하기

### Prerequisites

```bash
# Frontend
Node.js 18+
npm 9+

# Backend
Java 21 LTS
Maven 3.8+
MySQL 8.0
Redis 7+
```

### Installation

```bash
# Clone repository
git clone https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/Front.git
cd Front

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm install` – Install dependencies
- `npm run dev` – Start local development server
- `npm run build` – Build production bundle
- `npm run preview` – Preview production build
- `npm run lint` – Lint JavaScript and JSX files

---

## 📚 문서 가이드

### 📖 프로젝트 기획 및 명세

| 문서 | 설명 | 링크 |
|------|------|------|
| **프로젝트 명세서** | 전체 프로젝트 요구사항, 기능 정의, 기술 스택 결정 | [PROJECT_SPECIFICATION.md](./PROJECT_SPECIFICATION.md) |
| **MVP & DTO 명세** | MVP 기능 우선순위, API 엔드포인트, DTO 정의 (40개 이상) | [MVP_DTO_SPECIFICATION.md](./MVP_DTO_SPECIFICATION.md) |
| **개발 로드맵** | 7주 개발 일정, 마일스톤, 팀 역할 분담 | [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) |

### 🏗️ 아키텍처 및 설계

| 문서 | 설명 | 링크 |
|------|------|------|
| **시스템 아키텍처** | Mermaid 다이어그램 (9개), 기술 스택 선정 이유 | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **소스 구조 가이드** | Frontend/Backend 디렉토리 구조, SOLID 원칙, AOP 패턴 | [SRC_STRUCTURE.md](./SRC_STRUCTURE.md) |

### 🗄️ 데이터베이스

| 문서 | 설명 | 링크 |
|------|------|------|
| **ERD (DBML)** | dbdiagram.io 형식 (10개 테이블) | [database-erd.dbml](./database-erd.dbml) |
| **MySQL Schema** | 실행 가능한 DDL, Triggers, Procedures | [database-schema-mysql.sql](./database-schema-mysql.sql) |

### 🎨 디자인 및 와이어프레임

| 문서 | 설명 | 링크 |
|------|------|------|
| **와이어프레임 설명** | 10개 화면 구성 및 기능 설명 | [WIREFRAME_SCREENS.md](./WIREFRAME_SCREENS.md) |
| **Figma Import 가이드** | JSON 파일 Figma로 가져오는 방법 | [FIGMA_IMPORT_GUIDE.md](./FIGMA_IMPORT_GUIDE.md) |
| **프로토타입 플로우 가이드** | Figma 화살표 연결 가이드 | [피그마_화살표_가이드.md](./피그마_화살표_가이드.md) |

### 📊 다이어그램 파일

모든 Mermaid 다이어그램은 [`diagrams/`](./diagrams/) 폴더에 개별 파일로 저장:

1. `01-system-architecture.mmd` - 전체 시스템 구조
2. `02-data-flow.mmd` - 데이터 흐름 시퀀스
3. `03-drug-food-interaction.mmd` - 약-음식 충돌 플로우
4. `04-family-network.mmd` - 가족 네트워크 구조
5. `05-ocr-pipeline.mmd` - OCR 처리 파이프라인
6. `06-notification-system.mmd` - 알림 시스템
7. `07-database-erd.mmd` - ERD (Mermaid)
8. `08-development-timeline.mmd` - 7주 Gantt 차트
9. `09-tech-stack.mmd` - 기술 스택 Mindmap

### 📝 회의록 및 이력

| 문서 | 설명 | 링크 |
|------|------|------|
| **초기 브레인스토밍** | 2025-11-05 팀 전체 회의록 (기능 논의, 법적 리스크) | [readthis.pdf](./readthis.pdf) |

---

## 📁 프로젝트 구조

```
Front/
├── diagrams/              # Mermaid 다이어그램 파일 (9개)
├── figma-exports/         # Figma JSON 와이어프레임 (10개 화면)
├── figma-plugin/          # Figma 플러그인 코드
├── public/                # 정적 파일
├── src/                   # React 소스 코드
│   ├── components/        # 공통 컴포넌트
│   ├── assets/            # 이미지, 아이콘
│   ├── App.jsx            # Root 컴포넌트
│   └── main.jsx           # Entry point
├── *.md                   # 문서 파일들
├── database-erd.dbml      # DB ERD (dbdiagram.io)
├── database-schema-mysql.sql  # MySQL DDL
├── package.json
└── vite.config.js
```

자세한 디렉토리 구조는 [SRC_STRUCTURE.md](./SRC_STRUCTURE.md) 참조

---

## 🎯 개발 현황

### 완료된 작업
- ✅ 프로젝트 기획 및 명세 작성
- ✅ 시스템 아키텍처 설계
- ✅ 데이터베이스 스키마 설계 (ERD, DDL)
- ✅ API 엔드포인트 및 DTO 정의
- ✅ 와이어프레임 제작 (10개 화면)
- ✅ 기술 스택 확정

### 진행 예정
- [ ] Frontend 개발 (React)
- [ ] Backend 개발 (Spring Boot)
- [ ] 실시간 동기화 구현 (Hocuspocus)
- [ ] OCR 연동 (Google Vision)
- [ ] 약-음식 충돌 룰 엔진 구현
- [ ] 통합 테스트 및 배포

---

## 🔒 보안 및 법적 고려사항

- **개인정보보호**: AES-256 암호화, HTTPS 강제
- **인증/인가**: JWT 기반 (Access 15분, Refresh 7일)
- **의료 정보 보호**: 명시적 동의 필수, 접근 로그 기록
- **약사법 준수**: 약 추천 금지, 정보 제공만
- **허위/과장 광고 금지**: 식약처 공식 정보만 표시

자세한 내용은 [PROJECT_SPECIFICATION.md](./PROJECT_SPECIFICATION.md) 참조

---

## 👥 팀 정보

### KOSA 2025 Final Project - Team 3

**프로젝트 기간**: 2025년 11월 5일 ~ 2025년 12월 31일 (7주)

**발표일**: 2025년 12월 31일

### 역할 분담

- **팀원 1**: Frontend Lead (React, Hocuspocus)
- **팀원 2**: Backend Lead + AI (Spring Boot, OCR, Kafka)
- **팀원 3**: Database + DevOps (MySQL, Redis, CI/CD)

---

## 📞 연락처

- **GitHub Repository**: [KOSA2025-FINAL-PROJECT-TEAM3/Front](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/Front)
- **Backend Repository**: (Backend 저장소 URL)

---

## 📝 License

이 프로젝트는 교육 목적으로 제작되었습니다.

---

## 🙏 감사의 말

- 식약처 의약품안전나라 공공 API
- Google Cloud Vision API
- Spring Boot & React Community
- KOSA 부트캠프 멘토님들

---

**최종 수정일**: 2025-11-05
**문서 버전**: 2.0
**작성자**: 실버케어 개발팀
