## 질문: AuthContext vs. Zustand 구조 결정 필요

**질문 내용**  
정의서(`md/FRONTEND_COMPONENTS_SPECIFICATION.md`, `md/SRC_STRUCTURE.md`)에는 `AuthContext.jsx` 구조가 명시돼 있지만, 현재 구현은 Zustand 스토어(`src/stores/authStore.js`)만 사용하고 있습니다. 전역 상태는 반드시 Zustand를 써야 한다는 규칙을 지키면서도 문서와 구현이 어긋난 상황을 어떻게 정리해야 할까요?

1. 문서 요구대로 `AuthContext`/`AuthProvider`를 다시 도입하되, 내부에서는 Zustand 상태를 그대로 감싸는 얇은 래퍼로 구현한다.  
2. 혹은 문서를 업데이트해 “Stage 1~3에서는 Zustand store만 사용한다”라고 명시하고, Context 없이 Zustand 단독 구조를 공식화한다.

두 방향 중 어느 쪽을 팀 표준으로 삼을지 결정이 필요합니다.

---

**시도한 방법**  
- Zustand store를 단일 소스로 재정비(`src/stores/authStore.js`, `src/features/auth/hooks/useAuth.js`)  
- Dev Mode 동작을 복구하면서 AuthContext 없이도 플로우가 동작함을 확인했지만, 문서와 구현이 계속 어긋나 있는 상태입니다.

---

**추가 정보**  
- 정의서 위치: `md/FRONTEND_COMPONENTS_SPECIFICATION.md`, `md/SRC_STRUCTURE.md`, `frontend/Front/CLAUDE.md`  
- 관련 코드: `src/stores/authStore.js`, `src/features/auth/hooks/useAuth.js`, `src/App.jsx`  
- 규칙: “전역 상태는 Zustand 사용, Context만 단독 사용 금지”

---

**긴급도**  
보통 (Medium) — Stage 2/3 QA를 위해 공식 방향 결정을 기다리고 있습니다.

---

## TODO: OCR Stage 4 플로우 재구성 필요

**배경**  
현재 `src/features/ocr/pages/PrescriptionScan.jsx`는 Dev용 Mock OCR 흐름(파일 업로드 + 임시 인식)만 제공하고, 정의서에 있는 `ImageUploader`, `OCRResultPreview`(고급 버전), `PrescriptionScan` 페이지 레이아웃이 삭제된 상태였습니다. 임시로 최소 구성 컴포넌트를 복구했지만, Stage 4 요구사항(드래그 드롭 업로더, 수동 교정, 실제 OCR API 연동)과는 여전히 차이가 큽니다.

**필요 작업**  
1. 문서에 맞춘 업로더/미리보기/수동 교정 UI를 재도입하거나 최신 기획에 맞춰 명확히 재정의  
2. 백엔드 OCR API(또는 외부 서비스) 연동 전략 수립 후 `PrescriptionScanPage`에 실제 호출 연결  
3. 약 관리 CRUD와의 연계(인식된 결과를 곧바로 등록/수정) 고민  

**차단 요소**  
- 백엔드 OCR 엔드포인트 및 응답 스키마 미정  
- Stage 4 세부 기획 안 확정 (업로더/교정 flow 정의 필요)

**긴급도**  
보통 (Medium) — CRUD 및 Dev Mode QA는 가능하지만 Stage 4 전체 데모를 위해 OCR 스펙 확정이 요구됨.

---

✅ 프로젝트 문서를 먼저 확인했습니다  
✅ 기존 질문을 검색했습니다  
✅ 충분히 구체적으로 질문을 작성했습니다
