# MCP Tools 테스트 리포트

> **작성일**: 2025-11-20
> **목적**: Codex MCP와 Serena MCP 작동 여부 테스트 결과 기록

---

## 🎯 테스트 목표

Mock 데이터 자동 제거 시스템 구현을 위한 MCP 도구 활용 테스트

**필요한 작업**:
1. `Front/src/devtools/DeveloperModePanel.jsx` - `clearDevAuth()` 함수에 `amapill-auth-storage` 제거 추가
2. `Front/src/main.jsx` - 앱 시작 시 DEV_MODE 자동 제거 코드 추가

---

## 🧪 테스트 1: Codex MCP

### 연결 상태
```bash
$ claude mcp list
codex: codex mcp-server - ✓ Connected
serena: uvx --from git+https://github.com/oraios/serena serena start-mcp-server - ✓ Connected
```

**결과**: ✅ 연결 정상

### 첫 번째 시도 (간단한 지시)

**시간**: 14:XX
**도구**: `mcp__codex__codex`
**프롬프트**:
```
# Task: Mock 데이터 자동 제거 시스템 구현
- DeveloperModePanel.jsx 수정
- main.jsx 수정
- MOCK_DATA_REMOVAL_GUIDE.md 참고
```

**실행 결과**:
```
<system>Tool ran without output or errors</system>
```

**3분 대기 후 확인**:
- ❌ DeveloperModePanel.jsx - 변경사항 없음
- ❌ main.jsx - 변경사항 없음

### 두 번째 시도 (상세한 지시)

**시간**: 14:XX + 5분
**도구**: `mcp__codex__codex`
**프롬프트**:
```
# URGENT: localStorage Mock Data Cleanup Implementation

## Task 1: Fix DeveloperModePanel.jsx
ADD this line AFTER line 74:
window.localStorage.removeItem('amapill-auth-storage')

## Task 2: Add Auto-Cleanup to main.jsx
INSERT these lines BEFORE line 22:
if (import.meta.env.VITE_USE_MOCK_API !== 'true') {
  localStorage.removeItem('amapill_dev_mode')
  console.log('✅ DEV_MODE 자동 비활성화 (실제 API 모드)')
}
```

**실행 결과**:
```
<system>Tool ran without output or errors</system>
```

**180초 대기 후 확인**:
- ❌ DeveloperModePanel.jsx - 변경사항 없음 (line 67-75 그대로)
- ❌ main.jsx - 변경사항 없음 (line 22 그대로)

### Codex MCP 테스트 결론

**상태**: ❌ **작동 안 함**

**문제점**:
1. MCP 호출 시 에러 없이 실행되는 것처럼 보임
2. 실제로는 파일 수정이 전혀 이루어지지 않음
3. 비동기 실행이지만 180초 대기 후에도 변경 없음
4. 결과 확인 방법 없음 (conversationId 반환도 없음)

**가능한 원인**:
- Codex MCP 서버가 요청을 받지만 실제 작업을 수행하지 않음
- 작업 디렉토리 인식 문제 (`cwd` 파라미터 무시?)
- Codex 내부 에러가 silent fail 처리됨

---

## 🧪 테스트 2: Serena MCP

### 연결 상태
✅ 연결 정상 (동일)

### 프로젝트 활성화

**명령**:
```javascript
mcp__serena__activate_project({
  project: "/Volumes/D/projects/JAVA/team-project/msa-project-3rd"
})
```

**결과**:
```json
{
  "result": "Created and activated a new project with name 'msa-project-3rd' at /Volumes/D/projects/JAVA/team-project/msa-project-3rd. \nProgramming languages: java; file encoding: utf-8"
}
```

**상태**: ✅ 프로젝트 활성화 성공

### 심볼 검색 시도

**명령**:
```javascript
mcp__serena__find_symbol({
  name_path_pattern: "clearDevAuth",
  relative_path: "Front/src/devtools/DeveloperModePanel.jsx",
  include_body: true
})
```

**결과**:
```json
{
  "result": "[]"
}
```

**상태**: ❌ 심볼 찾기 실패

### Serena MCP 테스트 결론

**상태**: ❌ **작동 불가**

**문제점**:
1. 프로젝트 활성화 시 `Programming languages: java` 로만 인식
2. JavaScript/JSX 파일의 함수를 심볼로 인식하지 못함
3. Serena는 Java 전용 LSP 기반 도구로 보임

**제한사항**:
- ✅ Java 파일: Entity, Service, Controller 등 수정 가능
- ❌ JavaScript/JSX 파일: 심볼 인식 불가

---

## 📊 MCP 도구 비교표

| 항목 | Codex MCP | Serena MCP |
|------|-----------|------------|
| **연결 상태** | ✅ Connected | ✅ Connected |
| **프로젝트 활성화** | N/A (자동?) | ✅ 성공 |
| **JavaScript 지원** | ❓ 불명 | ❌ 불가 |
| **파일 수정 실행** | ❌ 실패 | ❌ 미테스트 |
| **작업 결과 확인** | ❌ 불가능 | ✅ 에러 메시지 반환 |
| **적합한 용도** | ❓ 불명확 | ✅ Java 코드 분석/수정 |

---

## 🔍 파일 현재 상태

### DeveloperModePanel.jsx (Line 67-75)

**현재 코드**:
```javascript
const clearDevAuth = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  window.localStorage.removeItem(STORAGE_KEYS.USER_DATA)
  window.localStorage.removeItem(STORAGE_KEYS.ROLE)
  window.localStorage.removeItem(STORAGE_KEYS.DEV_MODE)
  window.localStorage.removeItem(STORAGE_KEYS.FAMILY_GROUP)
  window.localStorage.removeItem(STORAGE_KEYS.FAMILY_MEMBER_DETAILS)
}
```

**필요한 수정**:
```javascript
const clearDevAuth = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  window.localStorage.removeItem(STORAGE_KEYS.USER_DATA)
  window.localStorage.removeItem(STORAGE_KEYS.ROLE)
  window.localStorage.removeItem(STORAGE_KEYS.DEV_MODE)
  window.localStorage.removeItem(STORAGE_KEYS.FAMILY_GROUP)
  window.localStorage.removeItem(STORAGE_KEYS.FAMILY_MEMBER_DETAILS)
  window.localStorage.removeItem('amapill-auth-storage')  // 🆕 추가 필요
}
```

### main.jsx (Line 21-22)

**현재 코드**:
```javascript
})

createRoot(rootElement).render(
```

**필요한 수정**:
```javascript
})

// Auto-remove DEV_MODE when VITE_USE_MOCK_API=false
if (import.meta.env.VITE_USE_MOCK_API !== 'true') {
  localStorage.removeItem('amapill_dev_mode')
  console.log('✅ DEV_MODE 자동 비활성화 (실제 API 모드)')
}

createRoot(rootElement).render(
```

---

## ✅ 권장 해결 방법

### 방법 1: Claude Code의 Edit 도구 사용 (추천) ⭐

**장점**:
- ✅ 즉시 실행 가능
- ✅ 변경사항 즉시 확인
- ✅ 에러 발생 시 즉시 피드백
- ✅ 정확한 regex 매칭으로 안전한 수정

**단점**:
- 없음

**실행 방법**:
```javascript
// 1. DeveloperModePanel.jsx 수정
Edit({
  file_path: "Front/src/devtools/DeveloperModePanel.jsx",
  old_string: "  window.localStorage.removeItem(STORAGE_KEYS.FAMILY_MEMBER_DETAILS)\n}",
  new_string: "  window.localStorage.removeItem(STORAGE_KEYS.FAMILY_MEMBER_DETAILS)\n  window.localStorage.removeItem('amapill-auth-storage')\n}"
})

// 2. main.jsx 수정
Edit({
  file_path: "Front/src/main.jsx",
  old_string: "})\n\ncreateRoot(rootElement).render(",
  new_string: "})\n\n// Auto-remove DEV_MODE when VITE_USE_MOCK_API=false\nif (import.meta.env.VITE_USE_MOCK_API !== 'true') {\n  localStorage.removeItem('amapill_dev_mode')\n  console.log('✅ DEV_MODE 자동 비활성화 (실제 API 모드)')\n}\n\ncreateRoot(rootElement).render("
})
```

### 방법 2: 수동 수정

**적합한 경우**:
- MCP 도구 학습/테스트 목적
- 코드 변경 이력을 git으로만 관리하고 싶을 때

### 방법 3: Codex MCP 재시도 (비추천)

**이유**:
- 2번 연속 실패
- 작동 여부 확인 불가
- 시간 낭비 가능성 높음

---

## 📝 결론 및 제안

### 현재 상황
- ❌ Codex MCP: 2회 시도 모두 실패
- ❌ Serena MCP: JavaScript 파일 지원 안 함
- ⏳ 수정 작업 대기 중

### 즉시 진행 가능한 방법
**Claude Code의 Edit 도구로 직접 수정** (예상 소요 시간: 1분)

### 다음 단계
1. Edit 도구로 두 파일 수정
2. 변경사항 확인
3. Mock 데이터 제거 테스트 수행
4. MOCK_DATA_REMOVAL_GUIDE.md에 테스트 결과 업데이트

---

**작성자**: Claude Code (Sonnet 4.5)
**마지막 업데이트**: 2025-11-20
**상태**: MCP 도구 테스트 완료, 수동 수정 대기 중
