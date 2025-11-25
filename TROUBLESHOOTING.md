# API Connection Troubleshooting Guide

## Table of Contents
1. [Frontend Won't Start](#frontend-wont-start)
2. [Backend Not Responding](#backend-not-responding)
3. [API Requests Failing](#api-requests-failing)
4. [Authentication Issues](#authentication-issues)
5. [CORS Errors](#cors-errors)
6. [Docker Issues](#docker-issues)
7. [Network Issues](#network-issues)

---

## Frontend Won't Start

### Symptom: `npm run dev` gives errors

#### Solution 1: Missing Dependencies

```bash
cd D:\3rd3rd\front

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

#### Solution 2: Missing .env File

```bash
# Copy template
copy .env.template .env

# Edit and set:
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK_API=false
```

#### Solution 3: Port Already in Use

```bash
# If port 5173 is taken, run on different port
npm run dev -- --port 3000

# Or find what's using 5173
netstat -ano | findstr :5173
# Then kill the process
taskkill /PID <PID> /F
```

#### Solution 4: Node Version Mismatch

```bash
# Check Node version
node --version
# Should be v16+ (ideally v18+)

# If too old, upgrade Node.js
# Visit: https://nodejs.org/
```

---

## Backend Not Responding

### Symptom: `Connection refused` when calling `http://localhost:8080`

#### Solution 1: Backend Not Running

```bash
# Check if Spring Boot is running
curl http://localhost:8080/actuator/health

# If fails, start backend
cd <backend-repo>
mvn spring-boot:run
# OR
gradle bootRun

# Wait 30 seconds for startup, then retry curl
```

#### Solution 2: Backend on Different Port

```bash
# Check what port it's listening on
netstat -ano | findstr LISTENING | findstr java

# If it's not 8080, update .env
VITE_API_BASE_URL=http://localhost:9090  # (example)
```

#### Solution 3: Backend Database Not Ready

```bash
# Check docker-compose services
docker-compose ps

# If MySQL/PostgreSQL not running:
cd D:\3rd3rd\silvercare-docker-compose
docker-compose up -d

# Wait 15 seconds for database startup
# Then start backend
```

---

## API Requests Failing

### Symptom: Component calls API, gets error response

#### Diagnosis: Open Network Tab

**Steps**:
1. Open DevTools (F12)
2. Click "Network" tab
3. Make a request (e.g., login)
4. Click the request in Network list
5. Examine Response & Headers tabs

#### Symptom 1: 404 Not Found

```
Status: 404
Response: "Cannot GET /api/medications"
```

**Cause**: Endpoint doesn't exist on backend

**Fix**:
```javascript
// Check endpoint exists on backend
// Backend should have implemented:
// GET /api/medications
// POST /api/medications
// etc.

// Verify endpoint path matches
// Frontend calls: GET /api/medications
// Backend should have: @GetMapping("/medications")
```

#### Symptom 2: 500 Internal Server Error

```
Status: 500
Response: {"error": "...exception..."}
```

**Cause**: Backend error (bug in code or database issue)

**Fix**:
```bash
# Check backend logs
# Terminal where backend is running should show error
# Look for stack trace

# If database error, check docker-compose
docker-compose logs mysql
docker-compose logs postgresql
```

#### Symptom 3: Empty Response

```
Status: 200
Response: (empty) or (loading forever)
```

**Cause**: Frontend waiting for response that never comes

**Fix**:
```bash
# Check if backend is actually responding
curl -X GET http://localhost:8080/api/medications

# Check for network timeout
# In .env, increase timeout:
VITE_API_TIMEOUT=20000  # 20 seconds
```

#### Symptom 4: Malformed JSON

```
Status: 200
Parse Error: "Unexpected token < in JSON"
```

**Cause**: Backend returning HTML instead of JSON (e.g., error page)

**Fix**:
```bash
# Test endpoint directly
curl http://localhost:8080/api/medications

# Should return JSON array: [...]
# Not HTML: <!DOCTYPE html>...
```

---

## Authentication Issues

### Symptom 1: "401 Unauthorized"

```
Status: 401
Response: {"error": "Unauthorized"}
```

#### Check Token is Being Sent

```javascript
// In DevTools Console
console.log('Token:', localStorage.getItem('amapill_token'))

// Should NOT be null/undefined
// Should look like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Check Token is in Request Headers

```
// In DevTools → Network → Select request → Headers
// Look for:
Authorization: Bearer eyJhbGc...

// If missing, auth interceptor not working
```

#### Check Token Format

```javascript
// Token should have 3 parts separated by dots
const token = localStorage.getItem('amapill_token')
const parts = token.split('.')

if (parts.length !== 3) {
  console.error('Invalid token format')
  localStorage.removeItem('amapill_token')
  // Need to re-login
}
```

#### Fix: Re-login

```javascript
// Clear bad token and login again
localStorage.removeItem('amapill_token')
localStorage.removeItem('amapill_refresh_token')

// Navigate to login page
window.location.href = '/login'
```

---

### Symptom 2: "403 Forbidden"

```
Status: 403
Response: {"error": "Forbidden"}
```

**Cause**: Token valid but user lacks permission

**Fix**:
```javascript
// Check user role
const user = JSON.parse(localStorage.getItem('user'))
console.log('User role:', user?.role)

// If wrong role, may need to:
// 1. Select different role
// 2. Or endpoint requires specific role
```

---

### Symptom 3: Token Always Expires

```
Status: 401
Message: "Token expired"
```

**Check**: Is backend issuing short-lived tokens?

```javascript
// Decode token to check expiration
// Use: https://jwt.io/

// Look for "exp" field (expiration time)
// If very soon, backend may be issuing 5-minute tokens
```

**Fix**: Implement token refresh

```javascript
// In error interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Try refreshing token
      const refreshToken = localStorage.getItem('amapill_refresh_token')
      if (refreshToken) {
        // Call refresh endpoint
        const newToken = await refreshTokenAsync(refreshToken)
        localStorage.setItem('amapill_token', newToken)

        // Retry original request
        return axiosInstance(error.config)
      }
    }
    return Promise.reject(error)
  }
)
```

---

## CORS Errors

### Symptom: Browser console shows CORS error

```
Access to XMLHttpRequest at 'http://localhost:8080/api/medications'
from origin 'http://localhost:5173' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Cause**: Backend not configured for frontend's origin

#### Quick Frontend Fix (Development Only)

```javascript
// In src/core/config/api.config.js
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  withCredentials: true,  // Allow credentials with CORS
}
```

⚠️ **Not recommended for production!**

#### Proper Backend Fix

**Spring Boot** (`application.yml`):

```yaml
server:
  servlet:
    context-path: /

spring:
  web:
    cors:
      allowed-origins: http://localhost:5173
      allowed-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
      allowed-headers: "*"
      allow-credentials: true
      max-age: 3600
```

**Or in Controller**:

```java
@RestController
@CrossOrigin(
  origins = "http://localhost:5173",
  allowCredentials = "true",
  methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, ...}
)
public class MedicationController {
  // ...
}
```

---

## Docker Issues

### Symptom: `docker-compose ps` shows services as "exited"

```
CONTAINER ID   STATUS
mysql          Exited (1)
postgresql     Exited (1)
```

#### Check Logs

```bash
cd D:\3rd3rd\silvercare-docker-compose

# See error logs
docker-compose logs mysql
docker-compose logs postgresql

# Common errors:
# - Port already in use
# - Insufficient disk space
# - Permission denied
```

#### Solution: Restart

```bash
# Stop all
docker-compose down

# Remove old containers/volumes
docker system prune -a

# Start fresh
docker-compose up -d

# Verify
docker-compose ps
```

---

### Symptom: Can't connect to MySQL from backend

```
Connection refused: localhost:3306
```

#### Check MySQL is Running

```bash
docker-compose ps
# Should show: mysql ... Up

# If not up, check logs
docker-compose logs mysql
```

#### Use Container Hostname

```
// INSIDE docker network (in backend)
jdbc:mysql://mysql:3306/mydb

// NOT localhost (that won't work)
jdbc:mysql://localhost:3306/mydb  ← WRONG
```

---

## Network Issues

### Symptom: Frontend can reach backend sometimes, but not consistently

**Cause**: Network connectivity issues

#### Diagnose

```bash
# Test connectivity
ping localhost

# Or from frontend to backend
curl http://localhost:8080/actuator/health

# Test DNS (if using hostnames)
nslookup localhost
```

#### Fix

```bash
# Restart network
# Windows:
ipconfig /flushdns
ipconfig /release
ipconfig /renew

# Mac/Linux:
sudo systemctl restart networking
```

---

### Symptom: "Network request failed" in browser console

```javascript
// Check
console.log(error.message)
// "Network request failed" or "ERR_NETWORK"
```

**Causes**:
- Backend crashed
- Network disconnected
- Firewall blocking
- Wrong URL

**Fix**:

```bash
# Verify backend is running
curl http://localhost:8080/actuator/health

# Check firewall isn't blocking
# Windows Defender Firewall:
# Settings → Firewall → Allow app → check node.exe & java

# Verify correct URL
# .env should have:
VITE_API_BASE_URL=http://localhost:8080
```

---

## Request Interceptor Issues

### Symptom: Auth Interceptor Not Adding Token

```
// Expected:
Authorization: Bearer eyJhbGc...

// Actual:
(no Authorization header)
```

#### Check Interceptor Code

```javascript
// File: src/core/interceptors/authInterceptor.js
// Should have:
config.headers.Authorization = `Bearer ${token}`

// If not, add it:
export const attachAuthInterceptor = (axiosInstance) =>
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = window.localStorage.getItem('amapill_token')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )
```

#### Check httpClient Uses Interceptor

```javascript
// File: src/core/services/api/httpClient.js
import { attachAuthInterceptor } from '@core/interceptors/authInterceptor'

export const httpClient = axios.create({...})
attachAuthInterceptor(httpClient)  // ← Must be called
```

---

## Mock API Issues

### Symptom: Always getting mock data, never real API

```javascript
// Getting mock response even though backend is up
const medications = await medicationApiClient.list()
// Returns: MOCK_MEDICATIONS (not from backend)
```

#### Check Mock Settings

```bash
# .env should have:
VITE_USE_MOCK_API=false

# Check it's actually false:
cat D:\3rd3rd\front\.env | grep VITE_USE_MOCK_API
```

#### Check Dev Mode

```javascript
// In browser console
localStorage.getItem('DEV_MODE')

// Should be null or 'false'
// If 'true', mock API is enabled

// To disable:
localStorage.removeItem('DEV_MODE')
location.reload()
```

---

## Testing API Manually

### Using cURL

```bash
# GET request
curl http://localhost:8080/api/medications

# POST request with auth
curl -X POST http://localhost:8080/api/medications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Aspirin","dosage":"500mg"}'

# Check response headers
curl -i http://localhost:8080/api/medications
```

### Using Postman

1. **Download**: https://www.postman.com/downloads/
2. **New Request**:
   - Method: `GET`
   - URL: `http://localhost:8080/api/medications`
3. **Add Auth**:
   - Headers tab
   - Key: `Authorization`
   - Value: `Bearer <YOUR_TOKEN>`
4. **Send**
5. **Check Response**

### Using Browser Console

```javascript
// Simple GET
fetch('http://localhost:8080/api/medications')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// With auth
const token = localStorage.getItem('amapill_token')
fetch('http://localhost:8080/api/medications', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// POST request
fetch('http://localhost:8080/api/medications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Aspirin',
    dosage: '500mg',
    frequency: 'twice daily'
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## Quick Debug Checklist

```
Before reporting a bug, verify:

[ ] Frontend is running (npm run dev → http://localhost:5173)
[ ] Backend is running (curl http://localhost:8080/actuator/health)
[ ] .env file exists with VITE_API_BASE_URL=http://localhost:8080
[ ] VITE_USE_MOCK_API=false in .env
[ ] Docker services running (docker-compose ps)
[ ] Token exists in localStorage (DevTools console)
[ ] Authorization header in Network tab
[ ] Backend endpoint exists (curl the endpoint)
[ ] No CORS errors in browser console
[ ] Backend logs show no errors
```

---

## Still Stuck?

1. **Check logs**:
   - Frontend: Browser DevTools Console
   - Backend: Terminal where `mvn spring-boot:run` is running
   - Docker: `docker-compose logs <service>`

2. **Check guide**: `D:\3rd3rd\SILVERCARE_API_GUIDE.md`

3. **Test manually**: Use cURL or Postman to test endpoints

4. **Isolate problem**:
   - Is frontend working? (loads at localhost:5173)
   - Is backend working? (curl http://localhost:8080/actuator/health)
   - Do they communicate? (call API from browser console)
