# Issue: 로그아웃 시 클라이언트 데이터 완전 파기 (#148)

## 1. 개요
로그아웃 버튼 클릭 시 LocalStorage뿐 아니라 SessionStorage 및 Cookie에 저장된 `amapill` 관련 데이터를 모두 삭제하여 보안성을 강화합니다.

## 2. 문제점
기존 `clearAuthState` 함수는 LocalStorage의 일부 키만 삭제했습니다:
- `AUTH_TOKEN`, `REFRESH_TOKEN`, `USER_DATA`, `ROLE`, `KAKAO_STATE`
- `amapill-auth-storage-v2`, `amapill-care-target-v1`

**누락된 항목:**
- `FAMILY_GROUP`, `FAMILY_MEMBER_DETAILS`, `DIET_LOGS` 키
- SessionStorage에 저장된 모든 `amapill` 관련 데이터
- Cookie에 저장된 모든 `amapill` 관련 데이터

## 3. 작업 상세 내용

### 3.1. `clearAuthState` 함수 개선 (`authStore.js`)
*   **[추가] LocalStorage 개별 키 삭제**:
    - `FAMILY_GROUP`, `FAMILY_MEMBER_DETAILS`, `DIET_LOGS` 추가
*   **[추가] LocalStorage 와일드카드 삭제**:
    - `amapill`로 시작하는 모든 키 삭제 (향후 확장성 대비)
*   **[추가] SessionStorage 전체 삭제**:
    - `amapill`로 시작하는 모든 키 삭제
*   **[추가] Cookie 전체 삭제**:
    - `amapill`로 시작하는 모든 쿠키 만료 처리

## 4. 관련 파일
*   `Front/src/features/auth/store/authStore.js`

## 5. 검증 방법
1. 로그인 후 DevTools > Application 탭에서 LocalStorage, SessionStorage, Cookies 확인
2. 로그아웃 버튼 클릭 (헤더 또는 더보기 페이지)
3. 모든 `amapill` 관련 데이터가 삭제되었는지 확인

## 6. 추가 수정 사항 (2025-12-20)
*   **[Refactor] `CaregiverDashboard`**: `NoFamilyModal` 컴포넌트 분리 및 리다이렉트 타이머 로직 개선
*   **[Fix] `MealInputForm`**: 식사 수정 시 `analysisResult` 상태가 초기화되는 버그 수정 (기존 데이터에서 복원)