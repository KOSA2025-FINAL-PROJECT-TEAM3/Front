## JWT Auth Interceptor (Front)

목표: axios 요청에서 **JWT(access token)** 기반으로 로그인 상태를 체크하고,
만료(또는 임박) 시 **refresh** 후 재시도하거나, 불가능하면 **로그아웃/로그인 이동**한다.

### 적용 위치

- axios 인스턴스: `Front/src/core/services/api/httpClient.js`
- 인터셉터:
  - `Front/src/core/interceptors/authInterceptor.js`
  - `Front/src/core/interceptors/errorInterceptor.js`

### 동작 요약

- Request 단계
  - 공개 엔드포인트(`PUBLIC_ENDPOINTS`)는 토큰을 붙이지 않음
  - 토큰이 있고 `exp`가 만료(또는 30초 이내 만료)면 `/api/auth/refresh`로 갱신 시도
  - 토큰이 없으면 보호 리소스 요청 전에 `logout()`(스토어 주입 시) 또는 fallback으로 스토리지 정리 후 `/login` 이동

- Response 단계
  - 401 발생 시 refresh 가능하면 1회 재시도(`_retry`)
  - refresh 실패/불가면 로그아웃 처리
  - 최종적으로 남은 401은 `errorInterceptor`에서 로그인으로 리다이렉트

### 주의

- response interceptor는 **등록 역순으로 실행**되므로, refresh를 먼저 처리하려면
  `attachErrorInterceptor()` → `attachAuthInterceptor()` 순으로 붙어야 한다.
