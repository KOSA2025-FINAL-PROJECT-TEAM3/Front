# 🐛 [Bug] 가족 구성원 식단 기록이 표시되지 않는 버그

## 📝 설명
보호자 계정으로 로그인 후 가족 구성원(어르신)의 식단 기록을 조회할 때 "등록된 식단 기록이 없습니다" 메시지가 표시됩니다.
데이터베이스에는 식단 기록이 존재하지만 프론트엔드에서 표시되지 않습니다.

## 🔍 재현 방법
1. 보호자 계정(msa1@msa.com)으로 로그인
2. 보호자 대시보드에서 가족 구성원(MSA 어르신A) 선택
3. 식단 모달 또는 `/family/member/2?tab=logs` 페이지 접속
4. "등록된 식단 기록이 없습니다" 표시됨

## ✅ 예상 동작
해당 가족 구성원의 식단 기록이 정상적으로 표시되어야 함

## 🔧 원인 분석
### 핵심 버그
`dietApiClient.getDietLogs`에서 axios params가 올바르게 전달되지 않음:
```javascript
// 수정 전 (버그)
return this.get('/logs', params)  // axios가 무시함

// 수정 후 (정상)
return this.get('/logs', { params })  // 쿼리 파라미터로 전달됨
```

### 추가 문제
백엔드가 `member.user.id` 구조로 userId를 반환하지만 프론트엔드가 `member.userId`로 접근

## 📊 영향 범위
- 보호자 대시보드 식단 모달
- 가족 구성원 상세 페이지 식단 탭
- 가족 구성원 식단 페이지

## 🏷️ Labels
- bug
- frontend
- priority: high
