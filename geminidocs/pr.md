# 🐛 Fix: 가족 구성원 식단 기록 조회 버그 수정

## 📋 관련 이슈
Closes #169

## 📝 변경 사항

### 핵심 수정
- **`dietApiClient.js`**: `getDietLogs` 메서드에서 axios params 전달 방식 수정
  - `this.get('/logs', params)` → `this.get('/logs', { params })`
  - 이로 인해 `userId`가 쿼리 파라미터로 올바르게 전달됨

### 데이터 정규화
- **`familyStore.js`**: 백엔드 응답 정규화 함수 추가
  - `normalizeMember`: `member.user.id` → `member.userId` 평탄화
  - `normalizeGroup`: 그룹 내 멤버 정규화
  - `loadFamily`에 정규화 적용

### 방어적 코딩
- **`FamilyMemberDetail.jsx`**: `member?.userId ?? member?.user?.id` 패턴 적용
- **`FamilyMemberDietPage.jsx`**: 동일 패턴 적용
- **`useFamilyMemberDetail.js`**: 동일 패턴 적용

### 정리
- **`CaregiverDashboard.jsx`**: 디버그 로깅 코드 제거

## 🧪 테스트 결과
- ✅ 보호자 대시보드 식단 모달에서 가족 구성원 식단 표시 확인
- ✅ 가족 구성원 상세 페이지 식단 탭에서 식단 표시 확인
- ✅ API 요청에 userId 파라미터 포함 확인: `/api/diet/logs?userId=2&date=2025-12-22`

## 📸 스크린샷
테스트 전: "등록된 식단 기록이 없습니다"
테스트 후: 식단 기록 정상 표시

## ✅ 체크리스트
- [x] 버그 수정 완료
- [x] 코드 리뷰 준비
- [x] 테스트 완료
- [x] 문서 업데이트 불필요
