# Frontend 결정 사항 (증상 검색 기능)

## 2025-12-11: 프론트 로깅 컨벤션 업데이트

- 모든 프론트엔드 코드에서 `console.*` 대신 `@core/utils/logger` 사용 (`logger.error`는 항상 출력, 나머지는 `VITE_DEBUG`/`VITE_ENABLE_API_LOGGING`에 따름).
- 로깅 규칙을 `docs/shadow/conventions.md`, `docs/FRONTEND_WORKFLOW.md`에 반영 완료.

## 2025-12-12: 가족 멤버 User ID 매핑 버그 수정

- `GET /api/family/groups` 응답에서 `member.id`는 **FamilyMember ID**이고, 실제 사용자 ID는 `member.user.id`임.
- 프론트의 `familyApiClient.getSummary()`/`createGroup()`에서 `userId`를 `member.id`로 대체하던 하위 호환 fallback을 제거하고, `member.user.id`(또는 `member.userId`)만 사용하도록 수정.
- 효과: 보호자 대시보드에서 `/members/{familyMemberId}/medications`로 잘못 호출되어 `UnauthorizedException`(500) 발생하던 문제 해소.

## 2025-12-12: WebSocket 기본 엔드포인트 자동 보정

- `.env`의 `VITE_WS_BASE_URL`이 호스트만(`ws://localhost:8080`) 설정되면 STOMP 연결이 루트로 시도되어 실패함.
- `environment.config.js`에서 WS_BASE_URL을 정규화하여, 경로가 없으면 자동으로 `/ws`를 붙이도록 변경.
- 효과: 채팅 페이지 진입 시 `ws://.../ws`로 정상 연결, 백엔드 STOMP 엔드포인트(`/ws`, `/ws/`)와 일치.

## 2025-12-03: 증상 AI 검색 mock 제거 & 약 등록 폼 AI 버튼 제거

- **증상 AI 검색** (`src/core/services/api/searchApiClient.js`)
  - `searchSymptomsWithAI`의 mock 응답을 삭제하고 `useMock: false`로 고정하여 항상 백엔드 실제 호출만 사용.
  - 이유: 스트레스/피로/수면 부족 등 하드코딩된 목업 응답이 노출되는 문제 방지.
- **약 등록 폼** (`src/features/medication/components/MedicationForm.jsx`)
  - 약 이름 옆 AI 검색 버튼 및 관련 상태/모달 의존성 제거. 단순 수기 입력만 남김.
  - 이유: AI 버튼 제거 요구사항 및 참조 오류(AiWarningModal undefined) 해소.

## 이슈 #54: 증상 검색 기능 개선

### 1. 검색 방식 변경
- **변경 전**: 글자 입력할 때마다 자동으로 비동기 검색 실행
- **변경 후**: 사용자가 "검색" 또는 "AI 검색" 버튼을 클릭했을 때만 검색 실행

### 2. 컴포넌트 구조 개선
**파일**: `src/features/search/components/SymptomSearchTab.jsx`

#### 상태 관리
```javascript
const [isAiSearch, setIsAiSearch] = useState(false)  // AI 검색 플래그
```
- AI 검색 후 상태가 useEffect에서 초기화되는 것을 방지하기 위한 플래그
- AI 검색과 일반 검색의 동작을 구분

#### 검색 함수
1. **handleManualSearch()**: 일반 검색 (약품/증상 목록 조회)
2. **handleAiSearch()**: AI 검색 (AI 생성 정보)

### 3. UI/UX 개선
- 안내 메시지: "검색 혹은 AI 검색 버튼을 누르고 잠시 기다려주세요."
- 결과 영역을 항상 표시 (조건부 렌더링 제거)
- 결과가 없을 때: "검색 또는 AI 검색을 통해 결과를 조회해주세요." 메시지 표시

### 4. API 클라이언트 통합
**파일**: `src/core/services/api/searchApiClient.js`

#### 변경 사항
- `SymptomSearchTab`의 증상 검색 메서드들이 `medicationSearchClient` 사용
- API 경로 통일: `/api/medications/search/symptoms/*`

#### 메서드
```javascript
suggestSymptoms(query)              // 증상 제안
getSymptomDetail(symptomName)       // 증상 상세 정보
searchSymptomsWithAI(query)         // AI 증상 검색
```

### 5. SCSS 추가
**파일**: `src/features/search/components/SymptomSearchTab.module.scss`

```scss
.detailBody {
  margin-top: 16px;
}
```
- 상세 정보 영역 스타일 추가 (레이아웃 개선)

### 6. 규칙 준수
- ✅ 컴포넌트명: `PascalCase` (`SymptomSearchTab`)
- ✅ 파일명: 컴포넌트명과 일치 (`.jsx` 확장자)
- ✅ 이벤트 핸들러: `handle` prefix (`handleAiSearch`, `handleManualSearch`)
- ✅ Boolean 변수: `is/has` prefix (`isAiSearch`, `detailLoading`)
- ✅ 상태 관리: `useState` 사용 (로컬 상태)
- ✅ 파일 구조: `features/search/components/` (도메인별 분류)
- ✅ 스타일: SCSS modules 사용 (인라인 스타일 금지)
- ✅ 언어: 한국어 주석 및 메시지

## 배포 정보
- **프론트 이슈**: #54
- **마지막 수정**: 2025-11-30
- **빌드 상태**: ✅ SUCCESS
