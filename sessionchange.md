SESSION_CHANGES_REVIEW_REQUEST.md                                              │
│                                                                                │
│ # Code Review Request - Session Changes Summary                                │
│                                                                                │
│ ## Context                                                                     │
│ **Project**: AMApill Frontend (React 19 + Vite + Zustand)                      │
│ **Session Date**: 2025-11-21                                                   │
│ **Reviewer**: Please validate all changes for bugs, security issues, and       │
│ architectural soundness                                                        │
│                                                                                │
│ ---                                                                            │
│                                                                                │
│ ## Changes Made This Session                                                   │
│                                                                                │
│ ### 1. ESLint Fixes (4 files)                                                  │
│ - `Front/src/shared/components/ErrorBoundary.jsx:27` - Changed arrow function  │
│ to regular method                                                              │
│ - `Front/src/features/auth/pages/KakaoCallback.jsx:10` - Removed unused        │
│ `useAuthStore` import                                                          │
│ - `Front/src/features/dashboard/pages/SeniorDashboard.jsx:7` - Removed unused  │
│ `useNavigate` import                                                           │
│ - `Front/src/features/notification/pages/NotificationDetailPage.jsx:7` -       │
│ Removed unused `useParams` import                                              │
│                                                                                │
│ ### 2. Auth Login Mock Fix                                                     │
│ **File**: `Front/src/core/services/api/authApiClient.js`                       │
│                                                                                │
│ **Problem**: Direct signup users lost role on login (role-selection page       │
│ appeared)                                                                      │
│ **Solution**: Read stored `customerRole` from localStorage on login            │
│                                                                                │
│ ```javascript                                                                  │
│ // BEFORE                                                                      │
│ login(email, password) {                                                       │
│   const mockResponse = () => ({                                                │
│     customerRole: null  // Always null                                         │
│   })                                                                           │
│ }                                                                              │
│                                                                                │
│ // AFTER                                                                       │
│ login(email, password) {                                                       │
│   const mockResponse = () => {                                                 │
│     const storedUserData = window.localStorage.getItem('amapill-user-data')    │
│     const storedRole = storedUserData ?                                        │
│ JSON.parse(storedUserData).customerRole : null                                 │
│                                                                                │
│     return {                                                                   │
│       customerRole: storedRole  // Persist role from signup                    │
│     }                                                                          │
│   }                                                                            │
│ }                                                                              │
│ ```                                                                            │
│                                                                                │
│ ### 3. Port Configuration Refactor (MAJOR)                                     │
│                                                                                │
│ #### Architecture Change                                                       │
│ - **Auth Service**: Port 8081 (separated)                                      │
│ - **Other Services**: Port 8082 (medication, family, diet, search, chat,       │
│ notification)                                                                  │
│ - **WebSocket**: Port 8080                                                     │
│ - **Production**: Nginx on port 80                                             │
│                                                                                │
│ #### Modified Files                                                            │
│                                                                                │
│ **A. `Front/src/core/config/environment.config.js`**                           │
│                                                                                │
│ Key changes:                                                                   │
│ ```javascript                                                                  │
│ // Added VITE_USE_NGINX toggle                                                 │
│ const useNginx = import.meta.env.VITE_USE_NGINX === 'true'                     │
│                                                                                │
│ // Updated service ports                                                       │
│ AUTH_API_URL: getServiceURL('VITE_AUTH_API_URL', 8081),      // Was 8090       │
│ MEDICATION_API_URL: getServiceURL('VITE_MEDICATION_API_URL', 8082),  // Was    │
│ 8090                                                                           │
│ FAMILY_API_URL: getServiceURL('VITE_FAMILY_API_URL', 8082),  // Was 8090       │
│ // ... other services to 8082                                                  │
│                                                                                │
│ // Auto-detection logic for Nginx mode                                         │
│ if (useNginx && typeof window !== 'undefined') {                               │
│   return window.location.origin  // Use Nginx proxy                            │
│ }                                                                              │
│ return `http://localhost:${port}`  // Direct port access                       │
│ ```                                                                            │
│                                                                                │
│ **B. `Front/.env`**                                                            │
│ ```env                                                                         │
│ # NEW: Nginx toggle                                                            │
│ VITE_USE_NGINX=false                                                           │
│                                                                                │
│ # NEW: Service-specific URLs                                                   │
│ VITE_AUTH_API_URL=http://localhost:8081                                        │
│ VITE_MEDICATION_API_URL=http://localhost:8082                                  │
│ VITE_FAMILY_API_URL=http://localhost:8082                                      │
│ # ... other services                                                           │
│                                                                                │
│ # UPDATED: API base changed from 8081 to 8082                                  │
│ VITE_API_BASE_URL=http://localhost:8082                                        │
│                                                                                │
│ # UPDATED: WebSocket changed from 8081 to 8080                                 │
│ VITE_WS_BASE_URL=ws://localhost:8080                                           │
│ ```                                                                            │
│                                                                                │
│ **C. `Front/.env.template` & `Front/.env.production.template`**                │
│ - Added `VITE_USE_NGINX` toggle                                                │
│ - Updated all service URLs to new port structure                               │
│ - Added documentation comments                                                 │
│                                                                                │
│ **D. `Front/nginx.conf`**                                                      │
│                                                                                │
│ Changed upstream blocks:                                                       │
│ ```nginx                                                                       │
│ # BEFORE                                                                       │
│ upstream api_gateway {                                                         │
│     server localhost:8090;                                                     │
│ }                                                                              │
│                                                                                │
│ # AFTER                                                                        │
│ upstream auth_service {                                                        │
│     server localhost:8081;  # Auth only                                        │
│ }                                                                              │
│                                                                                │
│ upstream other_services {                                                      │
│     server localhost:8082;  # All other services                               │
│ }                                                                              │
│ ```                                                                            │
│                                                                                │
│ Added CORS headers for dual-port setup:                                        │
│ ```nginx                                                                       │
│ # Auth Service                                                                 │
│ location /api/auth/ {                                                          │
│     proxy_pass http://auth_service;                                            │
│     add_header Access-Control-Allow-Origin "http://localhost:5173" always;     │
│     add_header Access-Control-Allow-Credentials "true" always;                 │
│     # ...                                                                      │
│ }                                                                              │
│                                                                                │
│ # Other Services                                                               │
│ location /api/ {                                                               │
│     proxy_pass http://other_services;                                          │
│     add_header Access-Control-Allow-Origin "http://localhost:5173" always;     │
│     add_header Access-Control-Allow-Credentials "true" always;                 │
│     # ...                                                                      │
│ }                                                                              │
│ ```                                                                            │
│                                                                                │
│ **E. Documentation Updates**                                                   │
│ - `Front/README.md` - Updated port references                                  │
│ - `Front/QUICKSTART.md` - Updated setup instructions                           │
│ - `Front/CORS_SETUP.md` - NEW file with CORS configuration guide               │
│                                                                                │
│ ---                                                                            │
│                                                                                │
│ ## Review Request                                                              │
│                                                                                │
│ ### Critical Questions                                                         │
│                                                                                │
│ 1. **Port Separation Architecture**                                            │
│    - Is separating Auth (8081) from others (8082) sound?                       │
│    - Any edge cases in `environment.config.js` logic?                          │
│    - Will auto-detection work in all deployment scenarios?                     │
│                                                                                │
│ 2. **CORS Configuration**                                                      │
│    - Are CORS headers correct for dual-port setup?                             │
│    - Any security vulnerabilities?                                             │
│    - Will this work in production behind Nginx?                                │
│                                                                                │
│ 3. **Mock API Role Persistence**                                               │
│    - Does reading from localStorage introduce security risks?                  │
│    - Should there be additional validation?                                    │
│    - Any race conditions or bugs?                                              │
│                                                                                │
│ 4. **Environment Detection Logic**                                             │
│    - Check `getServiceURL()` function in `environment.config.js:115-140`       │
│    - What happens if `window` is undefined (SSR)?                              │
│    - What happens if `VITE_API_BASE_URL` is missing in Nginx mode?             │
│    - What happens if `useNginx=true` but backend is on different port?         │
│                                                                                │
│ 5. **ESLint Fixes**                                                            │
│    - Are the fixes correct?                                                    │
│    - Any unintended side effects?                                              │
│                                                                                │
│ ### Specific Code to Review                                                    │
│                                                                                │
│ **Priority 1 - Critical**                                                      │
│ ```                                                                            │
│ Front/src/core/config/environment.config.js                                    │
│   - Lines 17, 122-129 (useNginx detection)                                     │
│   - Lines 115-140 (getServiceURL function)                                     │
│   - Lines 147-152 (service URL assignments)                                    │
│ ```                                                                            │
│                                                                                │
│ **Priority 2 - High**                                                          │
│ ```                                                                            │
│ Front/nginx.conf                                                               │
│   - Lines 5-18 (upstream blocks)                                               │
│   - Lines 62-102 (Auth proxy + CORS)                                           │
│   - Lines 106-146 (Other services proxy + CORS)                                │
│ ```                                                                            │
│                                                                                │
│ **Priority 3 - Medium**                                                        │
│ ```                                                                            │
│ Front/src/core/services/api/authApiClient.js                                   │
│   - Lines 15-42 (login mock with localStorage)                                 │
│                                                                                │
│ Front/.env                                                                     │
│   - All VITE_* variables (consistency check)                                   │
│ ```                                                                            │
│                                                                                │
│ ### Test Scenarios to Validate                                                 │
│                                                                                │
│ 1. **Dev Mode - Direct Access**                                                │
│    - `VITE_USE_NGINX=false`                                                    │
│    - Frontend calls `localhost:8081` (Auth) and `localhost:8082` (Others)      │
│ directly                                                                       │
│    - Expected: CORS works, all APIs reachable                                  │
│                                                                                │
│ 2. **Dev Mode - Nginx Proxy**                                                  │
│    - `VITE_USE_NGINX=true`                                                     │
│    - Frontend calls `localhost:80/api/*` → Nginx proxies to                    │
│ `localhost:8081/8082`                                                          │
│    - Expected: CORS works, Nginx routing correct                               │
│                                                                                │
│ 3. **Production - Nginx**                                                      │
│    - `VITE_USE_NGINX=true`                                                     │
│    - `VITE_API_BASE_URL=https://api.amapill.com`                               │
│    - Expected: window.location.origin used, CORS headers match production URL  │
│                                                                                │
│ 4. **Edge Case - SSR**                                                         │
│    - `typeof window === 'undefined'`                                           │
│    - Expected: Fallback to localhost without crash                             │
│                                                                                │
│ 5. **Edge Case - Missing Env Var**                                             │
│    - `VITE_USE_NGINX=true` but `VITE_API_BASE_URL` not set                     │
│    - Expected: Should error or fallback gracefully?                            │
│                                                                                │
│ ---                                                                            │
│                                                                                │
│ ## Known Issues from Previous Review                                           │
│                                                                                │
│ A comprehensive review was already done with the following findings:           │
│                                                                                │
│ ### 🔴 Critical Issues Identified                                              │
│ 1. **Nginx auto-detection may fail** in Docker/EC2 environments                │
│ 2. **Missing error handling** if `VITE_API_BASE_URL` is undefined in Nginx     │
│ mode                                                                           │
│                                                                                │
│ ### 🟠 Major Concerns                                                          │
│ 3. **Service name mapping** not centralized (hardcoded 'auth' check)           │
│ 4. **Mock API localStorage** can be manipulated client-side (dev-only risk)    │
│                                                                                │
│ ### 🟢 Minor Issues                                                            │
│ 5. Debug logging should use log levels                                         │
│ 6. Missing JSDoc comments                                                      │
│                                                                                │
│ **Question**: Do you agree with these findings? Any additional issues?         │
│                                                                                │
│ ---                                                                            │
│                                                                                │
│ ## Validation Checklist                                                        │
│                                                                                │
│ Please verify:                                                                 │
│                                                                                │
│ - [ ] **Logic Correctness**: All conditional branches work as intended         │
│ - [ ] **Security**: No XSS, injection, or CORS vulnerabilities                 │
│ - [ ] **Edge Cases**: SSR, missing env vars, wrong ports                       │
│ - [ ] **CORS**: Dual-port setup allows `localhost:5173` → `8081/8082`          │
│ - [ ] **Production Ready**: Will work behind Nginx on port 80                  │
│ - [ ] **Breaking Changes**: Backward compatibility maintained                  │
│ - [ ] **Code Quality**: ESLint fixes are correct                               │
│ - [ ] **Documentation**: CORS_SETUP.md is accurate                             │
│                                                                                │
│ ---                                                                            │
│                                                                                │
│ ## Files to Review                                                             │
│                                                                                │
│ **Core Logic**:                                                                │
│ 1. `Front/src/core/config/environment.config.js` (205 lines)                   │
│ 2. `Front/src/core/services/api/authApiClient.js` (124 lines)                  │
│                                                                                │
│ **Configuration**:                                                             │
│ 3. `Front/.env` (31 lines)                                                     │
│ 4. `Front/.env.template` (82 lines)                                            │
│ 5. `Front/.env.production.template` (55 lines)                                 │
│                                                                                │
│ **Infrastructure**:                                                            │
│ 6. `Front/nginx.conf` (248 lines) - Focus on lines 5-146                       │
│                                                                                │
│ **Bug Fixes**:                                                                 │
│ 7. `Front/src/shared/components/ErrorBoundary.jsx`                             │
│ 8. `Front/src/features/auth/pages/KakaoCallback.jsx`                           │
│ 9. `Front/src/features/dashboard/pages/SeniorDashboard.jsx`                    │
│ 10. `Front/src/features/notification/pages/NotificationDetailPage.jsx`         │
│                                                                                │
│ **Total**: 10 files modified, ~800 lines of changes                            │
│                                                                                │
│ ---                                                                            │
│                                                                                │
│ ## Expected Outcome                                                            │
│                                                                                │
│ Provide a review report with:                                                  │
│                                                                                │
│ 1. **Risk Assessment**: LOW / MEDIUM / HIGH                                    │
│ 2. **Deploy Recommendation**: APPROVED / APPROVED WITH CHANGES / BLOCKED       │
│ 3. **Critical Issues**: List any showstoppers                                  │
│ 4. **Recommendations**: Suggested improvements                                 │
│ 5. **Alternative Approaches**: Better ways to implement this?                  │
│                                                                                │
│ ---                                                                            │
│                                                                                │
│ **Session ID**: 2025-11-21-frontend-port-refactor                              │
│ **Reviewer Instructions**: Be thorough and critical. This will go to           │
│ production.                         