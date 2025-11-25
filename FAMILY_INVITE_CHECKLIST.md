# Family Invite Frontend - 완성 체크리스트

## ✅ 완료된 작업

### API Service Layer

- [x] `inviteService.js` - createInvite, acceptInvite, startInvite

### Pages

- [x] `RoleSelectionPage.jsx` - 역할 선택 페이지 (v3.2 신규)
- [x] `RoleSelectionPage.scss` - 역할 선택 페이지 스타일링
- [x] `FamilyJoin.jsx` - 초대 수락 페이지
- [x] `FamilyJoin.scss` - 초대 수락 페이지 스타일링

### Components

- [x] `InviteMemberForm.jsx` - 초대 생성 폼 (shortCode 표시 추가)
- [x] `InviteMemberForm.scss` - 초대 생성 폼 스타일링

### Middleware & Stores

- [x] `AuthMiddleware.jsx` - customerRole 체크 및 리다이렉트
- [x] `inviteStore.js` - 초대 세션 상태 관리

### Utils

- [x] `errorHandler.js` - 초대 에러 처리 유틸리티

---

## 📋 남은 작업

### Routing

- [ ] `App.jsx`에 라우트 추가
  - `/select-role` → RoleSelectionPage
  - `/family/join` → FamilyJoin
  - AuthMiddleware 적용

### Auth Store

- [ ] `authStore.js`에 `updateUserRole` 함수 추가

### Signup Page

- [ ] `SignupPage.jsx` 수정
  - inviteSession에서 suggestedRole 가져오기
  - 역할 프리셋 (수정 불가) 처리

---

## 🔧 통합 필요 사항

1. **라우팅 설정** (`App.jsx`)
2. **Auth Store 확장** (`authStore.js`)
3. **회원가입 페이지 수정** (`SignupPage.jsx`)
4. **부모 컴포넌트에서 inviteService 연결**

---

## 📝 다음 단계

1. App.jsx 라우팅 설정
2. authStore 확장
3. SignupPage 수정
4. 통합 테스트
