# CONVENTIONS.md - Git & Code Style Guide

> **Purpose**: Defines development standards for AMA...Pill frontend project.
> **For AI Agents**: Use this as reference for commit messages, branch names, and code patterns.

## 📌 Quick Reference

| Topic | Key Rule | Example |
|-------|----------|---------|
| **Branch** | `type/#issue-description-dev` | `feature/#10-user-login-junsu` |
| **Commit** | `emoji Type: description` | `✨ Feat: Add Kakao OAuth login` |
| **Component** | PascalCase + `.jsx` | `UserProfile.jsx` |
| **Function** | camelCase | `getUserData()` |
| **Hook** | `use` prefix | `useAuth()` |
| **Handler** | `handle` prefix | `handleClick()` |
| **Boolean** | `is/has` prefix | `isLoading`, `hasError` |

---

## 📋 Table of Contents

1. [Git 워크플로우](#git-워크플로우) - Branch strategy & workflow
2. [커밋 규칙](#커밋-규칙) - Commit message format
3. [브랜치 명명규칙](#브랜치-명명규칙) - Branch naming
4. [코드 스타일](#코드-스타일) - Naming & formatting
5. [컴포넌트 구조](#컴포넌트-구조) - Component patterns
6. [상태 관리](#상태-관리) - Zustand & hooks
7. [API 호출](#api-호출) - API error handling
8. [PR 규칙](#pr-pull-request-규칙) - Pull request guidelines

---

## Git 워크플로우

### 브랜치 전략

```
main (프로덕션) ← develop (통합) ← feature/* (개발)
                              ↑
                           bugfix/*
```

### 브랜치 종류

| 브랜치 | 설명 | 예시 |
|--------|------|------|
| `main` | 프로덕션 배포 (보호됨) | - |
| `develop` | 개발 통합 브랜치 (기본 브랜치) | - |
| `feature/*` | 새로운 기능 개발 | `feature/#10-user-profile-junsu` |
| `bugfix/*` | 버그 수정 | `bugfix/#15-login-error-seohee` |
| `hotfix/*` | 긴급 패치 (main에서 분기) | `hotfix/#20-critical-bug-recovery` |

---

## 커밋 규칙

### Conventional Commits 형식

```
emoji Type: brief description (50자 이내)

선택사항: 상세 설명
```

### 타입별 Emoji

| Emoji | Type | 설명 |
|-------|------|------|
| ✨ | `Feat` | 새로운 기능 |
| 🐛 | `Fix` | 버그 수정 |
| 📝 | `Docs` | 문서 업데이트 |
| 💬 | `Style` | 코드 포맷팅, 네이밍 수정 |
| ♻️ | `Refactor` | 기능 변경 없는 코드 재구성 |
| 🧪 | `Test` | 테스트 코드 추가/수정 |
| 🚀 | `Deploy` | 배포 관련 |
| 🔧 | `Config` | 설정 파일 수정 |
| 🗑️ | `Remove` | 파일/코드 삭제 |

### 커밋 메시지 예시

```bash
# 좋은 예시
✨ Feat: 카카오 OAuth 로그인 기능 추가

사용자가 카카오 계정으로 로그인할 수 있는 기능을 추가했습니다.
- 카카오 로그인 버튼 컴포넌트
- OAuth 토큰 관리
- 자동 리다이렉트 처리

# 나쁜 예시
fix bug
update code
작업완료
```

### 커밋 작성 팁

- 명령형 시제 사용: "Add" (O), "Added" (X)
- 50자 이내의 제목
- 상세 설명이 필요하면 한 줄 띄고 작성
- 관련 이슈 번호 포함 (예: #10)

---

## 브랜치 명명규칙

```
type/issue#-description-developer

type:       feature, bugfix, hotfix
issue#:     GitHub 이슈 번호
description: 하이픈으로 구분된 영어 (3~5 단어)
developer:  작업자 이름 (소문자)
```

### 예시

```bash
feature/#10-user-profile-pages-junsu
bugfix/#15-auth-token-refresh-seohee
hotfix/#20-payment-error-recovery-kim
```

---

## 코드 스타일

### 네이밍 컨벤션

#### JavaScript/React

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `UserProfile.jsx` |
| 일반 함수 | camelCase | `getUserData()` |
| 변수 | camelCase | `userName` |
| 상수 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Custom Hook | `use` 접두사 + camelCase | `useAuth()` |
| 이벤트 핸들러 | `handle` 접두사 | `handleClick()` |
| Boolean 변수 | `is`, `has` 접두사 | `isLoading`, `hasError` |

#### 폴더/파일

| 대상 | 규칙 | 예시 |
|------|------|------|
| 폴더명 | lowercase | `components`, `hooks`, `utils` |
| 컴포넌트 파일 | PascalCase | `Button.jsx`, `UserCard.jsx` |
| 유틸리티 파일 | camelCase | `validation.js`, `formatting.js` |
| CSS Module | camelCase + `.module.scss` | `Button.module.scss` |

### 코드 포맷팅

#### JavaScript 스타일

```javascript
// ✅ Good
const handleSubmit = (event) => {
  event.preventDefault()
  const userData = {
    name: event.target.name.value,
    email: event.target.email.value,
  }
  submitForm(userData)
}

// ❌ Bad
const handlesubmit=(e)=>{
  e.preventDefault()
  var data={name:e.target.name.value,email:e.target.email.value}
  submitForm(data)
}
```

#### JSX 스타일

```jsx
// ✅ Good
export const UserProfile = ({ user, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Card>
      <CardHeader title={user.name} />
      <CardBody>
        <p>이메일: {user.email}</p>
      </CardBody>
    </Card>
  )
}

// ❌ Bad
export const userProfile = ({ user, loading }) => {
  return loading ? <p>로딩중..</p> : <div><h1>{user.name}</h1><p>{user.email}</p></div>
}
```

### 주석 작성

```javascript
/**
 * 사용자 정보를 가져오는 함수
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 사용자 정보
 * @throws {Error} 사용자를 찾을 수 없는 경우
 */
export const getUserData = async (userId) => {
  // 사용자 조회 API 호출
  const response = await apiClient.get(`/users/${userId}`)
  return response.data
}
```

---

## 컴포넌트 구조

### 컴포넌트 작성 패턴

```jsx
/**
 * Button Component
 * - 다양한 스타일의 버튼
 * - 로딩, 비활성화 상태 지원
 */

import classNames from 'classnames'
import styles from './Button.module.scss'

/**
 * 재사용 가능한 버튼 컴포넌트
 * @param {string} variant - 버튼 스타일 (primary, secondary)
 * @param {React.ReactNode} children - 버튼 내용
 * @param {Function} onClick - 클릭 핸들러
 * @returns {JSX.Element} 버튼 컴포넌트
 */
export const Button = ({
  variant = 'primary',
  children,
  onClick,
  ...props
}) => {
  const buttonClasses = classNames(
    styles.button,
    styles[variant]
  )

  return (
    <button className={buttonClasses} onClick={onClick} {...props}>
      {children}
    </button>
  )
}

export default Button
```

### 폴더 구조

```
components/
├── common/          # 재사용 가능한 기본 컴포넌트
│   ├── Button.jsx
│   ├── Button.module.scss
│   ├── Input.jsx
│   ├── Input.module.scss
│   └── index.js
├── layout/          # 레이아웃 컴포넌트
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── MainLayout.jsx
└── index.js
```

### Tailwind + SCSS 사용 원칙

- 전역 토큰과 공통 유틸리티는 `tailwind.config.js`와 `src/styles/tailwind.css`에서 정의한다.
- 레이아웃/상세 스타일은 `.module.scss` 안에서 작성하되, 반복되는 여백·색상은 Tailwind utility 클래스를 우선 사용한다.
- 한 컴포넌트에서 Tailwind 클래스를 쓰는 경우, `className`에 utility를 바로 적고 SCSS 변수/믹스인은 캡슐화가 필요한 부분(애니메이션, 복잡한 상태)에만 사용한다.
- SCSS 모듈 클래스는 `styles.container`처럼 네임스페이스화하고, Tailwind utility를 함께 사용할 때는 `classNames(styles.container, 'flex gap-4')` 패턴을 따른다.

---

## 상태 관리

### Zustand Store 작성

```javascript
/**
 * User Store
 * - 사용자 정보 관리
 */

import { create } from 'zustand'

export const useUserStore = create((set) => ({
  // 상태
  user: null,
  loading: false,
  error: null,

  // 액션
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // 복합 액션
  logout: () => set({
    user: null,
    error: null,
  }),
}))
```

### Custom Hook 작성

```javascript
/**
 * useUser Hook
 * - 사용자 정보 관리 훅
 */

import { useUserStore } from '@stores/userStore'

export const useUser = () => {
  const { user, loading, error, setUser, logout } = useUserStore()

  return {
    user,
    loading,
    error,
    setUser,
    logout,
  }
}
```

---

## API 호출

### useFetch Hook 사용

```javascript
// ✅ Good
const MyComponent = () => {
  const { data: user, loading, error } = useFetch('/api/users/me')

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return <UserProfile user={user} />
}
```

### API 에러 처리

```javascript
import { getErrorMessage } from '@utils/errorHandler'

const handleApiCall = async () => {
  try {
    const response = await apiClient.post('/api/auth/login', userData)
    return response.data
  } catch (error) {
    const userFriendlyMessage = getErrorMessage(error)
    console.error('로그인 실패:', userFriendlyMessage)
    throw error
  }
}
```

---

## PR (Pull Request) 규칙

### PR 제목

```
Type: brief description

✨ Feat: 새로운 기능 추가
🐛 Fix: 버그 수정
```

### PR 체크리스트

- [ ] 브랜치명 규칙 준수
- [ ] 커밋 메시지 규칙 준수
- [ ] 코드 리뷰 최소 1명 이상
- [ ] 테스트 완료
- [ ] 문서 업데이트 (필요시)

---

## 참고 자료

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [React Docs](https://react.dev)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

마지막 업데이트: 2025년 11월 8일
