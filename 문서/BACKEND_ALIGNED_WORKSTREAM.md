# Backend Aligned Front Workstream (Front ↔ spring-boot)

목표: 프론트 기능을 **최대한 spring-boot 구현(엔드포인트/권한/데이터 모델)**에 맞춰 리팩토링하고, 백엔드가 제공하는 정보를 활용해 UI를 표현한다.

Last updated: 2025-12-17

---

## 원칙

- 프론트는 `/api/*` 경로를 사용하고, Gateway(기본 8080)가 `StripPrefix=1`로 spring-boot(8082)로 라우팅하는 구조를 기본 전제로 한다.
- 백엔드에 없는 기능은 **(1) 제거/대체 (2) 백엔드 추가** 중 하나로 결정하고, 결정사항을 여기 기록한다.
- 빌드/테스트는 스킵(요청사항). 수동 QA는 마지막에 일괄.

---

## 진행 현황 (요구사항 1~13)

### P0 (기능 연결/회귀 영향 큼)

- [x] 1) 복약관리 → **가족(어르신) 복약관리 페이지**로 전환
- [x] 2) 식단관리 → **가족(어르신) 식단관리 페이지**로 전환
- [x] 3) 질병관리 → **가족(어르신) 질병관리 페이지**로 전환
- [x] 4) 어르신은 폰트크기 기본값을 **“더 크게(3)”**
- [x] 5) 가족 탭 ↔ 가족 구성원 상세 페이지 연결 누락 해결
- [x] 6) 기어 버튼(알람설정) 노출/연결(가족 구성원 알림 설정 포함)
- [x] 7) 가족 채팅 UI: MUI + RN 형태 적용(레이아웃/버튼/타이포/리듬) + `/chat/family` 진입 시 선택 그룹으로 정규화 + familyMemberId 정합
- [x] 8) 알림 페이지 “모두 읽음” 버튼 2개 → 1개로 합병
- [x] 9) 알림 페이지 “모두 읽음” 동작 구현(백엔드 포함)
- [x] 10) 알림 페이지 “모두 삭제” 구현(백엔드 포함)
- [x] 11) 보호자/시니어 대시보드 카드 클릭 시 디테일 페이지로 이동
- [x] 12) 모든 라우팅 페이지에 뒤로 돌아가기 버튼 제공(PageHeader leading)
- [x] 13) 오버레이/팝업: 좌상단 뒤로 + 우상단 닫기 패턴 통일

### P1 (정리/사용성 개선)
- [x] Chat(1:1) `/api/chat/**` 불일치 정리(비노출/게이트웨이 라우트 제거)
- [x] Symptom 검색 관련 엔드포인트 불일치 정리(AI 엔드포인트만 사용)

---

## 백엔드 기준(주요 API) 메모

### 가족(모니터링)
- `GET /family/members/{userId}/medications`
- `GET /family/members/{userId}/medications/logs?date&status&limit`
- `GET/PUT /family/{familyGroupId}/members/{targetUserId}/notification-settings`

### 식단
- `GET /diet/logs?userId={targetUserId}` (보호자 권한 체크 포함)

### 알림
- `GET /notifications`
- `PATCH /notifications/{id}/read`
- `DELETE /notifications/{id}`
- `PATCH /notifications/read-all` (bulk read)
- `DELETE /notifications` (사용자 전체 삭제)

---

## RN 패리티(확정된 디테일)

### Search Overlay
- 탭: `약` / `식단` (증상 탭은 P1에서 정리)
- 헤더: 좌상단 `뒤로` + `닫기`, 배경 클릭 닫기 금지, 닫을 때 상태 초기화
- 데스크탑: `lg` 폭 + 내부 2컬럼(좌: 입력/최근, 우: 결과)

### Notification
- 중요/일반 분리: 중요 = `MEDICATION_MISSED*` + `DIET_WARNING` (프론트는 타입을 소문자/언더스코어로 정규화하여 처리)
- 중요 정렬: `미복용 우선 → diet.warning → 기타` + 최신순
- 일반 섹션: 기본 접힘
- bulk 액션: `모두 읽음` 1개 + `모두 삭제` 1개
- 미복약 알림 클릭 동작: **상세 대신 바로 복약 화면으로 이동**
- 식단 경고 진입(보호자): spring-boot 딥링크와 동일하게 `/diet/warning?userId={senior.userId}` 우선 사용

### Prescription
- 카드 정보: `이미지 + 1회 용량 + 요일 + 시간` 모두 노출(정보 밀도 우선)
- 메모: 짧으면 바로 노출, 길면 펼침/접힘

---

## 결정 필요(질문)

1) **가족 복약/식단/질병 관리 페이지의 URL/IA**
   - 제안 A: `family member detail` 내부 탭으로 (Medication/Diet/Disease)
   - 제안 B: 별도 라우트 3개로 분리(`/family/member/:id/medication`, `/family/member/:id/diet`, `/family/member/:id/disease`)
   - ✅ 결정: **B** (별도 라우트 분리, 기존 탭 방식은 레거시로 유지 가능)

2) “대시보드 카드 클릭 시 디테일”의 기준
   - 시니어: Hero(오늘 복약) → `/medication/today`, 주간 통계 → `/reports/weekly`, 이전 기록 → `/reports/adherence` 등으로 고정?
   - 보호자: 메뉴 카드(복약/식단/질병) → “가족 대상 선택” 화면을 먼저 보여줄지, 마지막 선택 대상 기준으로 바로 진입할지?

3) `/api/chat/**`는 어떤 백엔드에 붙는 게 맞나?
   - spring-boot에 Controller 추가 vs 라우트 제거/비노출 vs 별도 서비스로 분리
   - ✅ 결정: **제거/비노출** (1:1/상담 채팅 기능은 원래 없음. `family-chat`만 유지)

---

## 작업 로그

- 2025-12-17: spring-boot Controller와 Front ApiClient 정적 비교 결과를 `Front/docs/SPRINGBOOT_ENDPOINTS_COMPARE.md`로 갱신
- 2025-12-17: 알림 bulk 액션(읽음/삭제) spring-boot + Front 연결 완료
- 2025-12-17: 가족 탭/멤버 상세/알림설정 기어 버튼/시니어 기본 폰트/대시보드 카드 딥링크 반영
- 2025-12-17: FamilyChat unread-count 엔드포인트 추가(spring-boot)로 뱃지 호출 정합성 회복
- 2025-12-17: FloatingActionButtons에 알림 바로가기(FAB) 추가 + HistoryTimeline은 최신(오늘 우선)만 기본 확장
- 2025-12-17: 가족 관리(복약/식단/질병) 별도 라우트 분리 + 보호자 대시보드/알림 CTA 연결
- 2025-12-17: 카카오 미복용 알림(보호자) 딥링크가 userId를 사용하던 버그를 FamilyMember.id 기반으로 수정
- 2025-12-17: 가족 채팅 `/chat/family`가 그룹ID=1로 고정되던 라우팅 버그 제거(선택 그룹으로 리다이렉트) + 채팅 API/소켓 payload에서 familyMemberId를 실제 FamilyMember.id로 전송하도록 정합
- 2025-12-17: 알림 타입 `DIET_WARNING`가 프론트에서 `diet.warning`로 처리되던 불일치 수정(언더스코어 정규화로 중요 섹션/하이라이트 정상 노출)
- 2025-12-17: 공개/인증 플로우(로그인/회원가입/역할선택/초대코드/카카오/딥링크) 페이지에도 뒤로 버튼 추가로 “모든 라우팅 페이지 뒤로가기” 충족
- 2025-12-17: 약 검색 입력영역 버튼 배치 정렬 + 가족관리(탈퇴 confirm/기어 노출) 보완 + 가족 구성원 상세의 복약/식단 로그 조회가 memberId가 아닌 userId 기반으로 동작하도록 정합
- 2025-12-17: 보호자 대시보드 케어 대상 선택을 저장(재방문 시 유지) + 오늘 요약/주간 기록 카드가 선택된 케어대상 복약 로그로 이동하도록 연결
- 2025-12-17: 보호자 대시보드 케어 대상 후보를 어르신뿐 아니라 다른 보호자까지 확장(가족 구성원 기준) + 역할 레거시 값(parent/child) 정규화

---

## 수동 QA 체크리스트(작업 후 일괄)

- 가족 채팅: `/chat/family` 진입 시 현재 선택된 가족 그룹으로 자동 이동되는지(그룹ID=1 고정 방지)
- 가족 채팅: 메시지 전송/읽음 처리에서 내 말풍선 판정이 정상인지(familyMemberId 정합)
- 알림: `DIET_WARNING`가 중요 섹션/하이라이트 카드에 잡히는지
- 알림: `모두 읽음` / `모두 삭제` 동작이 백엔드까지 반영되는지
- 카카오 딥링크: 보호자 미복용 알림 → `/family/member/{familyMemberId}/medication`로 정상 랜딩되는지
- 가족 구성원 상세: `복약 기록`/`식단 기록` 탭이 `memberId`가 아닌 `userId` 기반으로 정상 조회되는지
