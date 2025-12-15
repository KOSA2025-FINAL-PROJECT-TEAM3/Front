# P0 Flows (Text Wireframes)

## 1) Medication / Prescription

### 1.1 처방전 추가

1) `/prescriptions/add`
2) 복용 시간(시간대) 설정
3) 약 검색/추가(필요 시 AI 검색 + 경고 확인)
4) 저장 → `/prescriptions/:id`

### 1.2 처방전 상세(조회/편집)

1) `/prescriptions/:id`
2) 약 목록 확인(약 카드: 시간/요일/복용량/메모)
3) 약 수정/삭제, 처방전 정보 수정

### 1.3 약 개별 등록/수정

- 등록: `/medication/add`
- 수정: `/medication/:id/edit`

---

## 2) OCR Scan

1) `/ocr/scan`
2) 이미지 업로드 또는 카메라 촬영(`CameraCapture`)
3) OCR 결과 미리보기/수정
4) 처방전 생성/저장

집중 모드:
- 카메라 UI 표시 중 VoiceAssistant 비노출(상태 기반 focus mode)

---

## 3) Family / Invite

### 3.1 초대 코드 입력(통합 랜딩)

1) `/invites/enter`
2) 코드 입력/링크 처리 → 성공 시 가족 합류

### 3.2 가족 관리

1) `/family`
2) 그룹 선택/멤버 리스트 확인
3) 멤버 상세(`/family/member/:id`)에서 탭 기반 정보 확인

---

## 4) Search

1) `/search`
2) 증상/알약 검색 탭
3) 알약 검색 결과에서 상세 보기/처방전 추가

---

## 5) Reports

- `/reports/weekly`: 주간 통계
- `/reports/adherence`: 복약 리포트

---

## 6) 병원/약국(지도) 검색

1) `/places`
2) 약국/병원 탭 선택
3) 지도 표시 + 주변 검색(카테고리: 약국/병원)
4) 키워드 검색(이름/주소) + 지도/리스트 동기화
