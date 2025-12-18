## ✨ PR 요약
병원 예약(보호자/어르신) 기능 작업과 함께, 알림 페이지에서 대량 렌더링으로 발생하던 렉을 줄이기 위해 **페이지네이션 기반 무한 스크롤**을 적용했습니다.

## 🔗 관련 이슈
Closes #115

## 🏥 변경 내용 (병원 예약)
- `src/features/appointment/`: 예약 목록/상세/추가/수정 페이지 및 컴포넌트/스토어 신규 추가
- `src/core/config/routes.config.js`: 예약 라우트 추가 (`/appointments/*`, 보호자 추가 플로우 포함)

## 🛠️ 변경 내용 (알림 무한 스크롤)
- `src/core/services/api/notificationApiClient.js`: `list(page, size)` 기본 page size를 `VITE_NOTIFICATION_PAGE_SIZE`로 중앙화.
- `src/features/notification/store/notificationStore.js`
  - 초기 로딩(`initialLoading`)과 추가 로딩(`loadingMore`) 분리
  - 추가 로드 실패 시 자동 재시도 루프 방지(`loadMorePaused`) + 재시도 액션 제공
- `src/features/notification/pages/NotificationPage.jsx`
  - IntersectionObserver로 스크롤 하단 감지 → 다음 페이지 요청
  - 초기 로드 실패/추가 로드 실패 UI + 재시도 버튼
  - 더 이상 데이터 없음 표시
- `src/core/config/constants.js`: `NOTIFICATION_PAGINATION.PAGE_SIZE` 추가
- `.env.template`, `.env.production.template`: `VITE_NOTIFICATION_PAGE_SIZE` 추가

## ✅ 검증
- `npm run lint`
- `npm run build`

## 🙋 리뷰어에게
알림 무한 스크롤은 기존 UI(아코디언/그룹핑)를 유지하면서, 초기에는 제한된 개수만 로드하고 스크롤 시 점진적으로 로드하도록 구성했습니다.
