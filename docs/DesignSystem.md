# Design System (Front) — MUI 기반

목표: 화면/컴포넌트 UI를 **MUI + Theme 토큰**으로 통일하고, 커스텀 CSS(특히 `*.module.css`) 없이도 일관된 UX를 유지한다.

---

## 1) 기본 원칙

- **MUI 컴포넌트를 직접 사용**한다(불필요한 wrapper/별도 UI 레이어 지양).
- 스타일은 **`sx` 우선**(필요 시 `styled`, 전역 규칙은 `GlobalStyles`).
- 터치 타겟은 최소 **44×44px**을 보장한다.
- 페이지 패턴은 “리스트 → 상세 → 입력/편집”을 기본으로, 로딩/빈상태/에러 UI를 표준화한다.

---

## 2) Layout 패턴

### 2.1 페이지 래퍼

- 기본 페이지는 `MainLayout`(= `AppShell`) 내부에서 렌더링한다.
- 페이지 본문은 `Paper`/`Card`를 적절히 사용하고, 최상단에는 제목/설명을 배치한다.
- `Stack`을 기본 레이아웃 primitive로 사용한다.

권장:
- `Stack spacing={2}`로 섹션 간격 구성
- 큰 섹션은 `Paper variant="outlined" sx={{ p: 2~3, borderRadius: 3~4 }}`로 감싼다

### 2.2 집중 모드(카메라/지도)

- 전체화면 오버레이/지도/카메라 등에서는 **VoiceAssistant를 숨겨야** 한다.
- 페이지 라우트가 아니라 **상태 기반**으로 토글한다.

사용:
- `useFocusModeStore().enterFocusMode('camera')` / `exitFocusMode('camera')`
- `AppShell`은 focus mode 활성화 시 VoiceAssistant를 자동 비노출한다.

---

## 3) 상태 UI 표준

- Loading: 텍스트보다는 `Skeleton`/`CircularProgress`를 우선(페이지 단위는 중앙 정렬).
- Empty: `Paper variant="outlined"` + 안내 문구 + “다음 행동” 버튼.
- Error: `Alert severity="error"` + 재시도 버튼(가능한 경우).

---

## 4) 입력 폼 패턴

- `TextField`/`Select`/`ToggleButtonGroup`을 사용하고, 버튼은 우측 정렬한다.
- 날짜는 `TextField type="date"` + `InputLabelProps={{ shrink: true }}` 사용.
- destructive action은 `color="error"` + `variant="contained|outlined"`로 강조한다.

---

## 5) 모달/다이얼로그 패턴

- 작은 선택/확인: `AppDialog` 또는 MUI `Dialog`
- 제목(`DialogTitle`) + 본문(`DialogContent`) + 액션(`DialogActions`) 구조를 유지한다.
- “취소/닫기”는 왼쪽, “확인/저장”은 오른쪽 정렬을 기본으로 한다.

---

## 6) 컴포넌트 사용 가이드(추천)

- 섹션 컨테이너: `Paper`, `Card`
- 정보 태그: `Chip`
- 리스트: `List` + `ListItemButton`(터치 타겟 확보)
- 헤더: `Typography variant="h6"` + `fontWeight: 900`(필요 시)
- 버튼: `Button` + `sx={{ fontWeight: 900 }}`(중요 CTA)

