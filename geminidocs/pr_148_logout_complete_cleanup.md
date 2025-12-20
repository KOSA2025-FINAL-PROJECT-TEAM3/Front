# [Feat] 로그아웃 시 클라이언트 데이터 완전 파기 (#148)

## ✨ PR 요약
로그아웃 시 LocalStorage, SessionStorage, Cookie에 저장된 모든 `amapill` 관련 데이터를 완전히 삭제하도록 `clearAuthState` 함수를 개선했습니다. 이를 통해 로그아웃 후 민감한 사용자 데이터가 클라이언트에 남지 않도록 보안을 강화합니다.

## 🔗 관련 이슈
Closes #148

## 🛠️ 변경 내용

### Frontend
*   **authStore.js** (`clearAuthState` 함수):
    *   **LocalStorage 개별 키 추가**: `FAMILY_GROUP`, `FAMILY_MEMBER_DETAILS`, `DIET_LOGS`
    *   **LocalStorage 와일드카드 삭제**: `amapill`로 시작하는 모든 키 순회 삭제
    *   **SessionStorage 삭제**: `amapill`로 시작하는 모든 키 순회 삭제
    *   **Cookie 삭제**: `amapill`로 시작하는 모든 쿠키를 만료 처리하여 삭제

## ✅ 체크리스트
- [x] 코드가 스타일 가이드라인을 따릅니다.
- [x] 자체 코드 리뷰를 완료했습니다.
- [x] 주석을 추가했습니다 (특히 복잡한 로직).
- [x] 관련 이슈를 링크했습니다.
- [x] 커밋 메시지가 명확합니다.

## 🙋 리뷰어에게
*   **테스트 방법**:
    1. 로그인 후 브라우저 DevTools > Application 탭에서 Storage 확인
    2. 헤더 또는 더보기 페이지에서 로그아웃 클릭
    3. LocalStorage, SessionStorage, Cookies에서 `amapill` 관련 항목이 모두 삭제되었는지 확인
*   **참고**: 와일드카드 삭제 로직은 향후 새로운 스토리지 키가 추가되어도 자동으로 정리됩니다.
