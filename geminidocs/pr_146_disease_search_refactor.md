# PR: 질병 검색 UI 및 등록 프로세스 개선 (#146)

## Summary
질병 검색 탭의 UX를 개편하여 검색에서 등록으로 이어지는 흐름을 매끄럽게 개선했습니다. '검색' 버튼을 '등록'으로 변경하여 질병 관리 페이지와의 연동성을 강화하였으며, AI 및 Google 검색 기능을 추가하여 정보 탐색 편의성을 높였습니다.

## Changes
### Frontend
*   **DiseaseSearchTab.jsx**:
    *   `검색` 버튼 -> `등록` 버튼 변경 및 `DiseasePage` 자동 이동/프리필 연동.
    *   `Google 검색` 버튼 추가 (새 탭).
    *   `AI 검색` 버튼 및 우측 결과 패널 추가 (Mock Data 적용).
    *   Placeholder 문구 수정.
*   **DiseasePage.jsx**: 
    *   `location.state.autoCreate` 수신 시 등록 폼 자동 오픈 로직 추가.
*   **SearchOverlay.jsx**:
    *   `DiseaseSearchTab` 연동 및 파일 복구.
*   **searchOverlayStore.js**:
    *   `disease` 탭 활성화를 위한 정규화 로직 수정.
*   **SeniorDashboard.jsx**:
    *   질병 검색 버튼이 오버레이를 열도록 연결.

## Verification
*   **등록 테스트**: 검색창에 '고혈압' 입력 후 '등록' 클릭 -> 질병 관리 페이지로 이동하며 '고혈압'이 입력된 등록 폼이 열리는지 확인. 
*   **AI 검색 테스트**: 'AI 검색' 클릭 -> 우측 패널에 가상의 AI 분석 결과가 표시되는지 확인.
*   **Google 검색 테스트**: 'Google 검색' 클릭 -> 구글 검색 새 탭이 열리는지 확인.
*   **오버레이 테스트**: 대시보드에서 '질병 검색' 클릭 -> 질병 탭이 활성화된 오버레이가 열리는지 확인.
