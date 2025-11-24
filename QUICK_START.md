# SilverCare Quick Start - Frontend & Docker Setup

## 30-Second Overview

```
Docker Compose (Backend Infrastructure)
├─ MySQL, PostgreSQL, Redis, Kafka
└─ Runs on: silvercare-network

Frontend (React)
├─ Makes HTTP requests to: http://localhost:8080
└─ Runs on: localhost:5173

API Clients
├─ Axios-based HTTP layer
├─ Auto-adds JWT token to all requests
└─ Supports mock data for offline dev
```

---

## Quick Start (5 Minutes)

### 1. Start Backend Infrastructure

```bash
cd D:\3rd3rd\silvercare-docker-compose
docker-compose up -d
# Verify: docker-compose ps
```

### 2. Configure Frontend

```bash
cd D:\3rd3rd\front

# Create .env file
copy .env.template .env

# Edit .env - make sure these are set:
# VITE_API_BASE_URL=http://localhost:8080
# VITE_USE_MOCK_API=false
```

### 3. Start Frontend

```bash
npm install  # First time only
npm run dev
# Opens: http://localhost:5173
```

### 4. Test Connection

**In browser console** (F12):

```javascript
// Check token storage
console.log('Token:', localStorage.getItem('amapill_token'))

// Make a test request (after login)
fetch('http://localhost:8080/api/medications', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('amapill_token')}`
  }
}).then(r => r.json()).then(console.log)
```

**Or open DevTools Network tab** and check:
- Requests go to `http://localhost:8080/api/*`
- Response status is 200 (success) or 401 (auth needed)
- Headers include `Authorization: Bearer TOKEN`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│           REACT FRONTEND (localhost:5173)                │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Components (Login, Medication, Family, etc.)      │ │
│  └────────────────────────────────────────────────────┘ │
│                         ↓                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  API Clients                                       │ │
│  │  ├─ authApiClient.login()                         │ │
│  │  ├─ medicationApiClient.list()                    │ │
│  │  ├─ familyApiClient.invite()                      │ │
│  │  └─ ...                                            │ │
│  └────────────────────────────────────────────────────┘ │
│                         ↓                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Axios HTTP Client (httpClient.js)                │ │
│  │  ├─ Auth Interceptor (adds Bearer token)          │ │
│  │  └─ Error Interceptor (handles errors)            │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         ↓
        HTTP POST/GET/PATCH/DELETE to
        http://localhost:8080/api/*
                         ↓
┌─────────────────────────────────────────────────────────┐
│       SPRING BOOT API (localhost:8080)                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  REST Controllers                                  │ │
│  │  ├─ POST   /api/auth/login                        │ │
│  │  ├─ GET    /api/medications                       │ │
│  │  ├─ POST   /api/medications                       │ │
│  │  ├─ PATCH  /api/medications/:id                   │ │
│  │  ├─ DELETE /api/medications/:id                   │ │
│  │  └─ ...                                            │ │
│  └────────────────────────────────────────────────────┘ │
│                         ↓                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Services (Business Logic)                         │ │
│  └────────────────────────────────────────────────────┘ │
│                         ↓                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Docker Network Services (silvercare-network)     │ │
│  │  ├─ MySQL Database                                │ │
│  │  ├─ PostgreSQL Database                           │ │
│  │  ├─ Redis Cache                                   │ │
│  │  ├─ Kafka Message Queue                           │ │
│  │  └─ Other services...                             │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## API Client Examples

### Example 1: Login Flow

```javascript
// In Login.jsx component
import { authApiClient } from '@core/services/api/authApiClient'

async function handleLogin(email, password) {
  try {
    const response = await authApiClient.login(email, password)
    // response = { user: {...}, accessToken: "...", role: null }

    localStorage.setItem('amapill_token', response.accessToken)
    navigate('/dashboard')
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

**What happens**:
1. `authApiClient.login()` calls `ApiClient.post('/login', data)`
2. Auth interceptor adds token (if exists)
3. Request sent: `POST http://localhost:8080/api/auth/login`
4. Backend validates, returns token
5. Frontend stores token in localStorage
6. Next requests automatically include token in `Authorization` header

---

### Example 2: Fetch Medications

```javascript
// In MedicationList.jsx component
import { medicationApiClient } from '@core/services/api/medicationApiClient'
import { useEffect, useState } from 'react'

export function MedicationList() {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    medicationApiClient.list()
      .then(data => setMedications(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <ul>
      {medications.map(med => (
        <li key={med.id}>{med.name} - {med.dosage}</li>
      ))}
    </ul>
  )
}
```

**What happens**:
1. Component mounts, `useEffect` runs
2. Calls `medicationApiClient.list()`
3. Which calls `ApiClient.get('/api/medications', ...)`
4. Auth interceptor adds `Authorization: Bearer TOKEN`
5. Request: `GET http://localhost:8080/api/medications`
   - Headers: `Authorization: Bearer eyJhbGc...`
6. Backend validates token, checks permissions
7. Backend returns medication list from MySQL database
8. Frontend receives data, updates state, renders list

---

### Example 3: Create Medication

```javascript
import { medicationApiClient } from '@core/services/api/medicationApiClient'

async function handleAddMedication(formData) {
  try {
    const newMed = await medicationApiClient.create({
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      startDate: formData.startDate,
    })

    console.log('Created:', newMed)
    // { id: "med-1731400000", status: "ACTIVE", name: "...", ... }

    setMedications([...medications, newMed])
  } catch (error) {
    console.error('Failed to create medication:', error)
  }
}
```

**Request Details**:
```
POST http://localhost:8080/api/medications
Headers:
  Content-Type: application/json
  Authorization: Bearer <TOKEN>

Body:
{
  "name": "Aspirin",
  "dosage": "500mg",
  "frequency": "2x daily",
  "startDate": "2025-11-12"
}

Response (201 Created):
{
  "id": "med-1731400000",
  "status": "ACTIVE",
  "name": "Aspirin",
  "dosage": "500mg",
  "frequency": "2x daily",
  "startDate": "2025-11-12",
  "createdAt": "2025-11-12T13:40:00Z"
}
```

---

## Debugging Checklist

### ❌ "Cannot GET /api/medications"

```bash
# 1. Is backend running?
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}

# 2. Is .env correct?
cat D:\3rd3rd\front\.env | grep VITE_API_BASE_URL
# Should be: http://localhost:8080

# 3. Is endpoint implemented on backend?
curl http://localhost:8080/api/medications
# Should return: [...] (list) or 401/403 (auth issue)
```

### ❌ "401 Unauthorized"

```javascript
// Check token exists
console.log(localStorage.getItem('amapill_token'))
// Should not be null/undefined

// Check interceptor working
// DevTools → Network → Select request → Headers
// Should see: Authorization: Bearer eyJhbGc...
```

### ❌ CORS Error

Backend needs to allow localhost:5173:

```yaml
# In Spring Boot application.yml
cors:
  allowed-origins: http://localhost:5173
  allowed-methods: GET,POST,PUT,PATCH,DELETE
  allowed-headers: "*"
  allow-credentials: true
```

---

## Environment Variables Reference

**File**: `D:\3rd3rd\front\.env`

```env
# ===== REQUIRED =====

# Backend API URL
VITE_API_BASE_URL=http://localhost:8080

# WebSocket for real-time features
VITE_WS_BASE_URL=ws://localhost:8080

# Kakao OAuth
VITE_KAKAO_CLIENT_ID=your_client_id_here
VITE_KAKAO_REDIRECT_URI=http://localhost:5173/auth/kakao/callback

# ===== OPTIONAL =====

# Use mock data (set to 'true' for offline development)
VITE_USE_MOCK_API=false

# Mock request delay in ms
VITE_MOCK_DELAY=250

# API timeout in ms
VITE_API_TIMEOUT=10000

# Token storage keys
VITE_TOKEN_STORAGE_KEY=amapill_token
VITE_REFRESH_TOKEN_KEY=amapill_refresh_token
```

---

## Docker Compose Commands

```bash
cd D:\3rd3rd\silvercare-docker-compose

# Start all services
docker-compose up -d

# Start specific profile (core only)
docker-compose --profile core up -d

# See running containers
docker-compose ps

# View logs
docker-compose logs -f mysql
docker-compose logs -f kafka

# Stop all
docker-compose down

# Restart specific service
docker-compose restart mysql

# Remove volumes (⚠️ deletes data)
docker-compose down -v
```

---

## Common Endpoints

### Authentication
```
POST   /api/auth/login
POST   /api/auth/signup
POST   /api/auth/kakao-login
POST   /api/auth/select-role
POST   /api/auth/logout
```

### Medications
```
GET    /api/medications
POST   /api/medications
PATCH  /api/medications/:id
DELETE /api/medications/:id
```

### Family
```
GET    /api/family/members
POST   /api/family/invite
PATCH  /api/family/members/:id
GET    /api/family/members/:id
```

### Diet
```
GET    /api/diet/logs
POST   /api/diet/logs
DELETE /api/diet/logs/:id
```

### Disease
```
GET    /api/disease
GET    /api/disease/:id
POST   /api/disease/search
```

### Search
```
GET    /api/search/symptoms
GET    /api/search/pills
```

### Counsel (Doctor)
```
GET    /api/counsel/available
POST   /api/counsel/book
```

### Chat
```
GET    /api/chat/conversations
POST   /api/chat/messages
GET    /api/chat/conversations/:id/messages
```

### OCR (Prescription Scan)
```
POST   /api/ocr/scan (multipart/form-data with image)
```

---

## Need Help?

Check the full guide: `D:\3rd3rd\SILVERCARE_API_GUIDE.md`

Key files:
- Backend config: `src/core/config/api.config.js`
- HTTP client: `src/core/services/api/httpClient.js`
- Auth interceptor: `src/core/interceptors/authInterceptor.js`
- API clients: `src/core/services/api/*ApiClient.js`
- Environment template: `.env.template`
