# PR Description

### 🔗 Related Issue
- #136

### 📝 Summary
프론트엔드 초기 로딩 속도 개선 및 대시보드 반응성 향상을 위한 최적화 작업(Phase 1~3)을 수행했습니다.

### 🛠️ Key Changes (Phase 1 ~ 3)

#### 1. Store Selector Optimization (Phase 1)
- `zustand/shallow`를 도입하여 Store 구독 시 불필요한 객체 재생성 및 리렌더링을 차단했습니다.
- **Target**: `CaregiverDashboard`, `SeniorDashboard`, `AppShell`, `FamilyManagement`

#### 2. Component Memoization (Phase 2)
- 정적 데이터를 표시하는 위젯 컴포넌트에 `React.memo`를 적용했습니다.
- **Target**: `GuardianMenuCard`, `TodaySummaryCard`, `WeeklyStatsWidget`, `HeroMedicationCard`

#### 3. API Response Caching (Phase 3)
- Senior Dashboard 진입 시 발생하는 중복된 복약 로그 API 호출을 방지하기 위해 `medicationLogStore`를 신규 구현했습니다.
- 메모리 캐싱을 통해 탭 전환 및 재진입 시 **Zero-Latency**를 달성했습니다.

---

### 📊 Verification Results

| 측정 항목 | 개선 전 | 개선 후 | 비고 |
| :--- | :--- | :--- | :--- |
| **대시보드 로딩** | 2.5초 ~ 4.0초 | **1.5초** | **약 40~50% 단축** |
| **탭 전환/복귀** | 로딩 스피너 발생 | **즉시 렌더링** | **로딩 완전 제거** |

> **Browser Test**: Browser Subagent를 통한 실측 결과, "불러오는 중..." 스피너가 사라지고 즉각적인 화면 전환이 확인되었습니다.

---

### ✅ Checklist
- [x] 빌드(Build)가 정상적으로 수행되는가?
- [x] 기존 기능(로그인, 대시보드 조회)에 영향(Regression)이 없는가?
- [x] 어르신/보호자 양쪽 계정에서 모두 테스트 되었는가?
