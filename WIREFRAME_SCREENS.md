# 실버케어 와이어프레임 - 전체 화면 목록

## 📱 MVP 핵심 화면 (Phase 1)

### 🔐 인증 (Auth)
1. **로그인 페이지** - `05-login`
2. **회원가입 페이지** - `06-signup`
3. **역할 선택 (시니어/보호자)** - `07-role-selection`

### 🏠 대시보드 (Dashboard)
4. **시니어 대시보드** - `01-dashboard-senior` ✅
5. **보호자 대시보드** - `02-dashboard-caregiver` ✅

### 💊 약 관리 (Medication)
6. **약 관리 메인** - `03-medications` ✅
7. **약 등록 폼** - `08-medication-add`
8. **약 상세 정보** - `09-medication-detail`
9. **약 편집** - `10-medication-edit`

### 📷 처방전 스캔 (OCR)
10. **처방전 스캔** - `11-prescription-scan`
11. **OCR 결과 확인/수정** - `12-ocr-result`

### 🔍 알약 검색 (Pill Search)
12. **알약 역검색** - `13-pill-search`
13. **검색 결과** - `14-pill-result`
14. **약 상세 모달** - `15-pill-detail-modal`

### 🍽️ 식단 & 충돌 경고 (Diet)
15. **식단 입력** - `16-meal-input`
16. **음식 충돌 경고** - `17-food-warning`
17. **대체 음식 제안** - `18-alternative-suggestion`

### 👨‍👩‍👧 가족 관리 (Family)
18. **가족 관리 메인** - `04-family` ✅
19. **가족 초대** - `19-family-invite`
20. **가족 구성원 상세** - `20-family-member-detail`

### 📊 리포트 (Report)
21. **복약 순응도 리포트** - `21-adherence-report`
22. **주간 통계** - `22-weekly-stats`

### 🔔 알림 (Notifications)
23. **알림 목록** - `23-notifications`
24. **알림 상세** - `24-notification-detail`

### ⚙️ 설정 (Settings)
25. **설정 메인** - `25-settings`
26. **프로필 편집** - `26-profile-edit`
27. **알림 설정** - `27-notification-settings`

---

## 🔄 프로토타입 플로우 (Prototype Flows)

### 메인 플로우
```
로그인 → 역할 선택 → 대시보드 (시니어/보호자)
```

### 시니어 플로우
```
시니어 대시보드 → 약 관리 → 약 복용 체크
시니어 대시보드 → 가족 → 가족 구성원 확인
시니어 대시보드 → 알림 → 알림 확인
```

### 보호자 플로우
```
보호자 대시보드 → 약 관리 → 약 원격 등록
보호자 대시보드 → 약 관리 → 복용 현황 모니터링
보호자 대시보드 → 리포트 → 주간 통계
보호자 대시보드 → 가족 → 가족 초대
```

### 약 등록 플로우
```
약 관리 → 약 등록 → 처방전 스캔 → OCR 결과 → 저장 완료
약 관리 → 약 등록 → 알약 검색 → 검색 결과 → 선택 → 저장
약 관리 → 약 등록 → 수동 입력 → 저장
```

### 식단 입력 플로우
```
대시보드 → 식단 입력 → 자동 충돌 체크 → 경고 없음 → 저장
대시보드 → 식단 입력 → 충돌 발견 → 경고 표시 → 대체 제안 → 저장/취소
```

### 가족 네트워크 플로우
```
가족 관리 → 가족 초대 → 초대 링크 생성 → 공유
가족 관리 → 구성원 선택 → 상세 정보 → 역할 변경
```

---

## 🎨 디자인 요구사항

### 공통 요소
- **Header**: 로고, 사용자 이름, 알림 아이콘
- **Navigation**: 홈, 약 관리, 가족, 설정
- **Footer**: 저작권, 이용약관, 개인정보처리방침

### 색상 시스템
- Primary (성공): `#4CAF50` (초록)
- Secondary (정보): `#2196F3` (파랑)
- Warning (주의): `#FF9800` (주황)
- Danger (위험): `#F44336` (빨강)
- Accent: `#E91E63` (핑크)

### 타이포그래피
- H1: 32px Bold
- H2: 24px Bold
- Body Large: 20px Regular
- Body Medium: 16px Regular
- Body Small: 14px Regular
- Caption: 12px Regular

### 간격 시스템 (8px Grid)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 20px
- xl: 30px
- 2xl: 40px

---

## ✅ 구현 우선순위

### 🔥 Phase 1 (Week 1-2) - 필수 핵심
- [x] 로그인
- [x] 회원가입
- [x] 시니어 대시보드
- [x] 보호자 대시보드
- [x] 약 관리 메인
- [x] 약 등록 (기본)
- [x] 가족 관리

### ⭐ Phase 2 (Week 3-4) - 차별화 기능
- [ ] 처방전 OCR 스캔
- [ ] 알약 역검색
- [ ] 식단 입력 & 충돌 경고
- [ ] 실시간 동기화 (Hocuspocus)

### 💎 Phase 3 (Week 5-6) - 고도화
- [ ] 복약 순응도 리포트
- [ ] 알림 시스템
- [ ] 설정 페이지
- [ ] PDF 다운로드

---

## 📐 화면 크기
- **Desktop**: 1200px x 800px
- **Mobile**: 375px x 667px (추후)
- **Tablet**: 768px x 1024px (추후)

---

**작성일**: 2025-11-05
**버전**: 1.0
**상태**: 진행중
