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
  - 처방전 상세(`/prescriptions/:id`) → 수정/삭제/약 추가
  - 약 추가(`/medication/add`) / 수정(`/medication/:id/edit`)
- OCR
  - `/ocr/scan`에서 파일 업로드/카메라 촬영 → 결과 미리보기/등록
- Family
  - 초대 코드 입력(`/invites/enter`) → 초대 처리
  - 가족 관리(`/family`) → 멤버/그룹 UI 확인
- Search
  - 통합 검색(`/search`)에서 증상/알약 검색 탭 동작
- Report
  - 주간 통계(`/reports/weekly`), 복약 리포트(`/reports/adherence`) 진입
- Places
  - 병원/약국 지도 검색(`/places`) 진입(필수: `VITE_KAKAO_JAVASCRIPT_KEY`)

---

## 3) 집중 모드/VoiceAssistant

- OCR 카메라(`CameraCapture`)가 열려있는 동안 VoiceAssistant가 보이지 않아야 함
- OCR/식단 로그 화면에서도 VoiceAssistant 비노출 동작 확인

---

## 4) 정적 점검(대체)

- `Front/scripts/static-audit.ps1` 실행:
  - `*.module.css`, `*.module.scss`, `*.scss/*.sass` 0건 유지
