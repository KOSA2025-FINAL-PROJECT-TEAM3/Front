# Regression Checklist (Manual)

`npm` 실행이 불가하거나 제한된 환경에서, 수동으로 최소 회귀 점검을 진행하기 위한 체크리스트.

---

## 0) 자동화(대체) 점검

- 정적 점검 + Playwright 스모크를 한 번에 실행:
  - `powershell -ExecutionPolicy Bypass -File Front/scripts/run-workstream5.ps1`

---

## 1) 라우팅/내비게이션

- 로그인/역할선택 후
  - Senior: `/dashboard` 진입 및 하단 내비 동작
  - Caregiver: `/caregiver` 진입 및 하단 내비 동작
- `/chat` 진입 시 `/chat/family`로 리다이렉트

---

## 2) P0 플로우

- Medication
  - 처방전 추가(`/prescriptions/add`) → 약 추가/저장
  - 처방전 상세(`/prescriptions/:id`) → 필드/약 수정 후 저장 + 삭제 + 약 추가
  - 약 추가(`/medication/add`) / 수정(`/medication/:id/edit`)
  - 처방전 약 추가 모달: SEARCH → DETAIL step 및 “다른 약 찾기(뒤로)” 동작
- OCR
  - `/ocr/scan`에서 파일 업로드/카메라 촬영 → 결과 미리보기/등록
- Family
  - 초대 코드 입력(`/invites/enter`) → 초대 처리
  - 가족 관리(`/family`) → 멤버/그룹 UI 확인
- Search
  - 통합 검색(`/search`)에서 약/식단 탭 동작
  - `/search`에서도 input 아래에 “최근 검색어” 섹션이 노출되는지 확인
  - 최근 검색어 저장/칩 클릭 재검색/전체 삭제 동작
  - FAB/대시보드에서 Search Overlay가 열리고, 닫으면 원래 화면 유지
  - Search Overlay는 backdrop 클릭으로 닫히지 않는지(버튼/ESC로만 종료)
  - 더보기(`/more`)의 “통합 검색”에서도 overlay가 열리는지 확인
  - 시니어 대시보드 “약품 검색” 카드가 `/search` 이동이 아니라 overlay를 여는지 확인
  - Search Overlay의 “OCR 약봉투” 버튼이 `/ocr/scan`으로 이동하는지 확인
  - OCR 등록 완료 후 `returnTo`가 있으면 원래 화면으로 복귀하는지 확인
- Report
  - 주간 통계(`/reports/weekly`), 복약 리포트(`/reports/adherence`) 진입
- Notifications
  - 목록에서 중요/일반 섹션이 분리되어 보이는지 확인
  - 중요 기본 펼침/일반 기본 접힘 + 날짜/시간대 그룹핑(과거 날짜 접힘) 확인
  - diet.warning 알림이 있을 때 “식이 경고” 하이라이트 카드가 뜨고 `/diet/warning`으로 이동하는지 확인
- Places
  - 병원/약국 지도 검색(`/places`) 진입(필수: `VITE_KAKAO_JAVASCRIPT_KEY`)

---

## 2.1) Dashboard 레이아웃(수동)

- Senior(`/dashboard`)
  - 모바일: Hero → 오늘 요약 → Quick Actions(약품 검색/식단 기록/가족 채팅방) → 오늘 일정 → 주간 → 이전 기록
  - 데스크탑: 좌(히어로/퀵액션), 우(오늘 요약/오늘 일정/주간/이전 기록)
- Caregiver(`/caregiver`)
  - 모바일: 케어 현황 배너 + 케어 대상 전환 + 메뉴 6개 카드
  - 데스크탑: 좌(케어 대상 프로필/오늘 요약/주간), 우(케어 메뉴/최근 활동 로그)

---

## 3) 집중 모드/전역 FAB(퀵메뉴/음성)

- OCR 카메라(`CameraCapture`)가 열려있는 동안 전역 FAB가 보이지 않아야 함
- OCR/식단 로그 화면에서도 전역 FAB 비노출 동작 확인
- 채팅 화면(`/chat*`)에서 전역 FAB 비노출 동작 확인
- 처방전 플로우(`/prescriptions*`)에서 전역 FAB 비노출 동작 확인

### 3.1) 글자 크기 3단계(표준/크게/더크게)

- 전역 FAB 퀵메뉴 내부 `- / +`로 동일하게 변경되는지 확인
- 설정 > 글자 크기에서도 동일하게 변경/유지(localStorage persist)되는지 확인

---

## 3.2) Bottom dock / 오버레이 겹침(모바일 수동 QA)

권장 뷰포트: iPhone 13/14(390x844), Galaxy S22(360x800) 등 2종.

- Bottom dock 위로 떠야 하는 요소 겹침 확인
  - `SpeedDialFab` (대시보드/질병 관리 등)
  - 전역 FAB(퀵메뉴/음성) 버튼 + 음성 listening 오버레이
  - Dev Mode 버튼(DEV에서만)
- 고정 CTA(하단 sticky/fixed) 겹침 확인
  - 처방전 추가(`/prescriptions/add`) 하단 버튼바
  - 처방전 상세(`/prescriptions/:id`) 하단 버튼바
- Toast 위치 확인
  - 노치/상단 safe-area와 겹치지 않는지(토스트가 헤더 아래로 내려오는지)

---

## 4) 정적 점검(대체)

- `Front/scripts/static-audit.ps1` 실행:
  - `*.module.css`, `*.module.scss`, `*.scss/*.sass` 0건 유지
