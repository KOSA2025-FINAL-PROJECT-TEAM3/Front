# Workstream 5 Closeout — Cleanup/Docs

날짜: 2025-12-15  
대상: `Front/`

---

## 범위(마감 대상)

- Tailwind/Sass/SCSS 제거 및 잔여 스타일 정리
- 미사용 레거시/테스트 페이지/라우트 정리
- 문서/체크리스트/정적 점검 스크립트 추가

---

## 완료된 변경

### 1) 스타일 정리

- `*.module.css`: 0
- `*.module.scss`: 0
- `*.scss/*.sass`: 0
- Tailwind 설정/전역 CSS/의존성 제거 완료

### 2) 레거시/미사용 정리

- TipTap/Hocuspocus 관련 devtools editor 제거
  - `Front/src/devtools/editor/components/CollaborativeEditor.jsx` 삭제
  - `@hocuspocus/provider`, `yjs` 제거(`Front/package.json`)
- WS 테스트 라우트/페이지(`/ws-test`) 제거
- 미사용 레거시 페이지 정리
  - `DoctorChatListPage`, `InviteLanding`, `PillSearchPage`, `SymptomSearch`, `RoleSelectionPage` 등
- 레거시 초대 진입점(`/invites/start`)을 `/invites/enter` 리다이렉트로 단순화

### 3) 지도 서비스(Places)

- `/places`에 Kakao Maps 기반 병원/약국 검색 UI 추가
- `VITE_KAKAO_JAVASCRIPT_KEY` 필요(`Front/.env.template` 참고)

### 4) 정적 점검 도구/문서

- `Front/scripts/static-audit.ps1` 추가(제한 환경에서 `npm` 없이도 스캔)
- `Front/docs/REGRESSION_CHECKLIST.md` 업데이트(`/places` 포함)
- `Front/docs/DesignSystem.md`, `Front/docs/SCREEN_INVENTORY.md`, `Front/docs/IA_NAV.md`, `Front/docs/FLOWS_P0.md` 정리/추가

---

## 남은 작업(마감 조건)

- 자동화 스모크(가능): `Front/scripts/run-workstream5.ps1`
- 수동 회귀 점검 권장: `Front/docs/REGRESSION_CHECKLIST.md` (특히 `/places` 키 설정 후 확인)
- (가능해지는 시점에) 의존성 스냅샷 정리
  - `npm` 실행 에러 해결 후 `package-lock.json` 재생성/정리 권장
- (가능해지는 시점에) Playwright 스모크 재실행 권장
