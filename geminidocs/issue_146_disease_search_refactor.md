# Issue: 질병 검색 및 등록 UI/UX 개선 (#146)

## 1. 개요
질병 검색 탭(SearchOverlay)에서 검색 기능을 수행할 때의 사용자 경험을 개선하고, 검색된 질병을 바로 등록할 수 있는 연결성을 강화합니다. 또한, Google 검색 및 AI 분석 결과를 통합하여 정보 접근성을 높입니다.

## 2. 작업 상세 내용

### 2.1. 질병 검색 탭 (DiseaseSearchTab) 개편
*   **[변경] '검색' -> '등록' 버튼**: 
    *   기존 단순 검색 버튼을 **'등록'** 버튼으로 변경했습니다.
    *   등록 버튼 클릭 시 `DiseasePage`(/disease)로 이동하며, 입력한 키워드를 **질병 등록 폼에 자동 입력**합니다.
*   **[추가] Google 검색 버튼**:
    *   클릭 시 새 브라우저 탭에서 구글 검색 결과를 제공하여 외부 정보를 쉽게 찾을 수 있도록 했습니다.
*   **[추가] AI 검색 / 우측 패널 결과 표시**:
    *   기존 페이지 이동 방식에서 벗어나, 모달 내 **우측 패널**에 AI 분석 결과(요약, 증상, 예방 방법 등)를 즉시 표시하도록 개선했습니다.
    *   현재는 Mock Data를 사용하여 UI 동작을 구현했습니다.
*   **[수정] 가이드 문구**:
    *   Placeholder 및 안내 문구를 "질병 이름이나 증상을 검색하세요"로 변경하여 사용 범위를 명확히 했습니다.

### 2.2. 질병 관리 페이지 (DiseasePage) 연동
*   **[기능] 자동 등록 폼 열기**:
    *   `location.state.autoCreate` 값이 존재할 경우, 페이지 진입 즉시 **질병 등록 모달**을 열고 전달받은 질병명을 프리필(Pre-fill)합니다.

### 2.3. 검색 오버레이 (SearchOverlay) 수정
*   **[버그 수정] 탭 전환 오류 해결**:
    *   `useSearchOverlayStore`에서 `disease` 탭으로의 전환을 막던 정규화 로직(`normalizeTab`)을 수정하여 정상적으로 탭이 변경되도록 조치했습니다.
*   **[UI] SeniorDashboard 연동**:
    *   대시보드의 '질병 검색' 버튼이 오버레이를 열도록 연결(`openSearchOverlay('disease')`)했습니다.

## 3. 관련 파일
*   `Front/src/features/search/components/DiseaseSearchTab.jsx`
*   `Front/src/features/search/components/SearchOverlay.jsx`
*   `Front/src/features/search/store/searchOverlayStore.js`
*   `Front/src/features/disease/pages/Disease.jsx`
*   `Front/src/features/dashboard/pages/SeniorDashboard.jsx`

## 4. 비고
*   AI 검색은 현재 프론트엔드 모의 데이터로 동작하며, 향후 백엔드 API 연동이 필요합니다.
