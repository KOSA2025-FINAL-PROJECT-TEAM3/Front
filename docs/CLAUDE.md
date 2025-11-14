<!-- encoding: utf-8 -->
# CLAUDE.md - AI Agent Development Guide

> **Purpose**: This file provides context for Claude Code and other MCP agents to assist with development.
> **Target**: AI assistants helping with code generation, debugging, and architecture decisions.

## 📋 Table of Contents

1. [Quick Reference](#-quick-reference) - Essential project info
2. [Project Overview](#-project-overview) - Features & goals
3. [Tech Stack](#tech-stack) - Technologies used
4. [Project Structure](#project-structure) - Directory layout
5. [Key Commands](#key-commands) - Common tasks
6. [Code Style](#code-style) - Naming & patterns
7. [Development Guidelines](#development-guidelines) - Git workflow & stages
8. [Environment Variables](#environment-variables) - Required config
9. [Related Documentation](#-related-documentation) - Links to all docs
10. [Do Not](#do-not) - Things to avoid

---

## 📌 Quick Reference

| Category | Key Information |
|----------|----------------|
| **Project** | AMA...Pill - Family medication management platform |
| **Team** | 3 developers |
| **Timeline** | Nov 5 - Dec 31, 2025 (~7 weeks) |
| **Main Features** | Family care network, drug-food alerts, OCR prescription, pill search |
| **Dev Server** | `npm run dev` → http://localhost:5173 |

---

## 🎯 Project Overview

**"Is it time to take medicine?"** - Family-centered medication management platform for elderly parents & adult children remote care.

### Key Features
1. **Family Care Network** - Real-time sync between seniors and caregivers
2. **Drug-Food Interaction Alerts** - Safety warnings for medication + food combinations
3. **OCR Prescription Registration** - Automatic medication entry via image recognition
4. **Pill Reverse Search** - Identify pills by shape/color
5. **Compliance Reports** - Medication adherence tracking

## Tech Stack
- Framework: React 19
- Build Tool: Vite 5.0+
- Language: JavaScript (ES modules)
- State Management: Zustand (global), React Hooks (local)
- HTTP Client: Axios with Interceptors
- Styling: CSS Modules + Tailwind CSS
- Routing: React Router
- Real-time: WebSocket (Hocuspocus + TipTap for collaborative editing)

## Project Structure

```
src/
├── App.jsx                          # Main routing (40 routes defined)
├── main.jsx                         # Entry point
├── index.jsx                        # React render target
├── core/                            # Core infrastructure
│   ├── config/                      # Configuration
│   │   ├── constants.js             # Enums, roles, statuses, storage keys
│   │   ├── routes.config.js         # Route definitions (39 paths)
│   │   └── api.config.js            # API base URL
│   ├── services/                    # API clients (10 clients)
│   │   └── api/
│   │       ├── ApiClient.js         # Base class with mock support
│   │       ├── authApiClient.js     # Login/signup/Kakao OAuth
│   │       ├── medicationApiClient.js
│   │       ├── familyApiClient.js
│   │       ├── chatApiClient.js
│   │       ├── dietApiClient.js
│   │       ├── diseaseApiClient.js
│   │       ├── searchApiClient.js
│   │       ├── ocrApiClient.js
│   │       ├── counselApiClient.js
│   │       └── httpClient.js        # Axios wrapper
│   ├── interceptors/                # HTTP interceptors
│   │   ├── authInterceptor.js       # Bearer token injection
│   │   └── errorInterceptor.js      # Error handling
│   ├── routing/
│   │   ├── PrivateRoute.jsx         # Auth-required routes
│   │   └── navigation.js            # Programmatic navigation
│   └── utils/                       # Utility functions
│       ├── formatting.js            # Date/number/string formatting
│       ├── validation.js            # Zod schemas
│       ├── errorHandler.js          # Error parsing
│       ├── stringUtils.js           # String operations
│       └── index.js
├── features/                        # Feature modules (13 domains)
│   ├── auth/                        # Authentication
│   │   ├── pages/                   # Login, Signup, RoleSelection, KakaoCallback
│   │   ├── components/              # KakaoLoginButton
│   │   ├── hooks/                   # useAuth
│   │   └── store/                   # authStore (Zustand)
│   ├── dashboard/                   # Role-specific dashboards
│   │   ├── pages/                   # SeniorDashboard, CaregiverDashboard
│   │   └── components/              # MedicationCard, FamilyMemberCard
│   ├── medication/                  # Drug management
│   │   ├── pages/                   # Management, Add, Edit
│   │   ├── components/              # Form, List, DetailModal, InventoryTracker
│   │   └── store/                   # medicationStore
│   ├── family/                      # Family group management
│   │   ├── pages/                   # Management, Invite, MemberDetail
│   │   ├── components/              # List, Card, Profile, InviteForm, AdherenceChart
│   │   ├── hooks/                   # useFamily, useFamilyMemberDetail, useFamilySync
│   │   ├── services/                # familyService, familySyncService
│   │   ├── context/                 # FamilyContext (Provider wrapper)
│   │   └── store/                   # familyStore
│   ├── diet/                        # Dietary tracking
│   │   ├── pages/                   # DietLogPage, FoodWarning
│   │   └── components/              # MealInputForm, MealHistory, FoodConflictWarning
│   ├── search/                      # Pill search
│   │   └── pages/                   # SymptomSearch, PillSearchPage, PillResultPage
│   ├── disease/                     # Condition management
│   │   └── pages/                   # Disease, DetailPage, SuspectedDiseasePage
│   ├── ocr/                         # Prescription scanning
│   │   ├── pages/                   # PrescriptionScan
│   │   └── components/              # OCRControlPanel, OCRResultPreview
│   ├── chat/                        # Doctor consultations
│   │   ├── pages/                   # DoctorChatListPage, ChatConversationPage
│   │   └── components/              # ChatMessage, ChatInput, ChatRoomCard
│   ├── counsel/                     # Medical consultation
│   ├── notification/                # In-app alerts
│   ├── report/                      # Analytics (AdherenceReportPage, WeeklyStatsPage)
│   ├── settings/                    # User preferences
│   │   ├── pages/                   # Settings, ProfileEdit, NotificationSettings, etc.
│   │   └── components/              # SettingsMenu, ProfileSection
│   └── index.js
├── shared/                          # Reusable components
│   └── components/
│       ├── layout/
│       │   ├── MainLayout.jsx       # App-wide layout
│       │   ├── Header.jsx           # Top navigation
│       │   └── BottomNavigation.jsx # Mobile nav (4 items)
│       └── ui/                      # Base UI components
│           ├── Button.jsx           # Styled button (variants, sizes)
│           ├── Card.jsx             # Container component
│           ├── Input.jsx            # Form input
│           ├── Modal.jsx            # Dialog wrapper
│           └── Icon.jsx             # SVG icon system
├── hooks/                           # Global custom hooks
│   ├── useDebounce.js
│   ├── useFetch.js                  # Data fetching with error handling
│   └── useLocalStorage.js
├── pages/                           # Top-level error pages
│   └── errors/                      # NotFound, ServerError
├── data/                            # Mock data (11 files, ~1K lines)
│   ├── mockMedications.js
│   ├── mockFamily.js
│   ├── mockDiet.js
│   ├── mockDiseases.js
│   └── ... (7 more mock files)
├── assets/                          # Static images/icons
└── styles/                          # Global styles
    ├── base.scss
    └── tailwind.css
```

## Key Commands
- `npm install` - Install dependencies (first-time only)
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Production build
- `npm run preview` - Preview build locally
- `npm run lint` - Run ESLint

## Code Style
- Use ES modules (import/export)
- All new components must be function components with Hooks
- Prefer arrow functions for component definitions
- Use descriptive variable names (no single letters except loops)
- Add JSDoc comments for all exported functions and components

### Naming Convention
- **Components**: PascalCase (`UserProfile.jsx`)
- **Functions/Variables**: camelCase (`getUserData`, `userName`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Custom Hooks**: `use` prefix (`useAuth`)
- **Event Handlers**: `handle` prefix (`handleClick`)
- **Booleans**: `is/has` prefix (`isLoading`, `hasError`)

### Code Examples

**✅ Good JavaScript**:
```javascript
const handleSubmit = (event) => {
  event.preventDefault()
  const userData = {
    name: event.target.name.value,
    email: event.target.email.value,
  }
  submitForm(userData)
}
```

**✅ Good JSX**:
```jsx
export const UserProfile = ({ user, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Card>
      <CardHeader title={user.name} />
      <CardBody>
        <p>Email: {user.email}</p>
      </CardBody>
    </Card>
  )
}
```

**✅ Good Comments**:
```javascript
/**
 * Fetch user data by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User info
 * @throws {Error} If user not found
 */
export const getUserData = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`)
  return response.data
}
```

## Development Guidelines

### Git Workflow
- **Branch strategy**: main (production) ← develop (integration) ← feature/* (dev)
- **Branch naming**: `feature/#10-description-developer` or `bugfix/#15-description-developer`
- **Commit format**: `emoji Type: description` (max 50 chars)
  - ✨ Feat: New feature
  - 🐛 Fix: Bug fix
  - 📝 Docs: Documentation
  - ♻️ Refactor: Code refactor
  - 🧪 Test: Tests

### Development Stages & Implementation Status

#### ✅ Stage 1: Project Setup (COMPLETE)
- ✅ React 19 + Vite + Tailwind CSS setup
- ✅ React Router (40 routes defined)
- ✅ Zustand stores (auth, medication, family)
- ✅ Axios with interceptors (auth + error handling)
- ✅ MainLayout, Header, BottomNavigation
- ✅ UI components (Button, Card, Input, Modal, Icon)
- ✅ Path aliases (@features, @shared, @utils, @config, @core)

#### ✅ Stage 2: Authentication (COMPLETE)
- ✅ Login/Signup pages with form validation
- ✅ Kakao OAuth integration (KakaoCallback page)
- ✅ Role selection (SENIOR/CAREGIVER)
- ✅ Auth store with localStorage persistence
- ✅ JWT token management via interceptors
- ✅ PrivateRoute component for protected routes

#### ✅ Stage 3: Dashboard (COMPLETE)
- ✅ SeniorDashboard (medication schedule view)
- ✅ CaregiverDashboard (family oversight)
- ✅ MedicationCard, FamilyMemberCard components
- ✅ Mock data integration

#### 🔄 Stage 4: Core Features (IN PROGRESS)

**✅ Medication Management (COMPLETE - UI)**
- ✅ CRUD operations (Add, Edit, Delete, List)
- ✅ MedicationDetailModal
- ✅ Inventory tracking UI
- ⏳ Real API integration pending

**✅ Family Management (COMPLETE - UI)**
- ✅ Family member list/detail pages
- ✅ Invite member form
- ✅ FamilyContext + familyStore
- ✅ useFamilySync hook (skeleton)
- ⏳ Real-time sync pending WebSocket

**🔄 Diet & Food Warnings (PARTIAL)**
- ✅ Meal logging UI (DietLogPage)
- ✅ Food conflict warning display
- ⏳ Backend integration pending

**🔄 Disease Management (PARTIAL)**
- ✅ Disease list/detail pages
- ✅ Suspected disease page
- ⏳ API integration pending

**🔄 Search Features (PARTIAL)**
- ✅ Symptom search UI
- ✅ Pill search by appearance UI
- ✅ Results display page
- ⏳ Real search API pending

**🔄 Chat & Consultation (PARTIAL)**
- ✅ Chat list and conversation pages
- ✅ Mock messages display
- ⏳ WebSocket integration pending
- ⏳ Doctor consultation booking pending

**🔄 OCR Prescription (WIREFRAME)**
- ✅ PrescriptionScan page UI
- ⏳ Camera integration pending
- ⏳ OCR API integration pending

**✅ Settings (COMPLETE - UI)**
- ✅ Profile edit
- ✅ Notification settings
- ✅ My medications/diseases settings
- ✅ Privacy policy & terms pages

**🔄 Reports & Analytics (PARTIAL)**
- ✅ Adherence report page UI
- ✅ Weekly stats page UI
- ⏳ Real data calculation pending

## Environment Variables
Required (`.env` file):
- `VITE_API_BASE_URL`: API server (default: http://localhost:8080)
- `VITE_WS_BASE_URL`: WebSocket server (default: ws://localhost:8080/ws)
- `VITE_KAKAO_CLIENT_ID`: Kakao OAuth client ID
- `VITE_USE_MOCK_API`: Toggle mock/real API (true/false)
- `VITE_DEBUG`: Enable debug mode (true/false)
- `VITE_NOTIFICATION_TIMEOUT`: Alert duration in ms (default: 5000)
- `VITE_ITEMS_PER_PAGE`: Pagination limit (default: 10)
- `VITE_MAX_FILE_SIZE`: Max upload size in bytes (default: 5242880 = 5MB)

## Mock API Architecture

All API clients inherit from `ApiClient` base class supporting dual-mode operation:

### How It Works
```javascript
// ApiClient.js - Base class pattern
class ApiClient {
  async request(endpoint, options) {
    if (import.meta.env.VITE_USE_MOCK_API === 'true') {
      return this.mockResponse()  // Return mock data
    }
    return httpClient.request(endpoint, options)  // Real API call
  }
}
```

### Toggle Mock Mode
```bash
# .env file
VITE_USE_MOCK_API=true   # Use mock data (no backend needed)
VITE_USE_MOCK_API=false  # Use real API (requires backend)
```

### 10 API Clients

| Client | Endpoints | Mock Data | Real API |
|--------|-----------|-----------|----------|
| **authApiClient** | `/auth/login`, `/auth/signup`, `/auth/kakao-login`, `/auth/select-role`, `/auth/logout` | ✅ | ✅ |
| **medicationApiClient** | `/medications` (GET/POST/PATCH/DELETE) | ✅ `mockMedications.js` | ⏳ |
| **familyApiClient** | `/family`, `/family/members`, `/family/invite` | ✅ `mockFamily.js` | ⏳ |
| **dietApiClient** | `/diet/meals`, `/diet/warnings` | ✅ `mockDiet.js` | ⏳ |
| **diseaseApiClient** | `/diseases`, `/diseases/{id}` | ✅ `mockDiseases.js` | ⏳ |
| **searchApiClient** | `/search/pills`, `/search/symptoms` | ✅ `mockSearchResults.js` | ⏳ |
| **ocrApiClient** | `/ocr/prescription` (POST image) | ✅ | ⏳ |
| **chatApiClient** | `/chat/rooms`, `/chat/messages` | ✅ `mockChats.js` | ⏳ |
| **counselApiClient** | `/counsel/doctors`, `/counsel/book` | ✅ | ⏳ |
| **notificationApiClient** | `/notifications` | ✅ `mockNotifications.js` | ⏳ |

### Mock Data Location
```
src/data/
├── mockMedications.js      # Sample medication entries
├── mockFamily.js           # Family group + members (120 lines)
├── mockDiet.js             # Meal logs + food warnings
├── mockDiseases.js         # Disease database
├── mockSymptoms.js         # Symptom search data (52 lines)
├── mockNotifications.js    # Alert messages (55 lines)
├── mockFoodWarnings.js     # Drug-food interactions (32 lines)
├── mockChats.js            # Chat messages (154 lines)
├── mockPillDetails.js      # Pill appearance data (185 lines)
├── mockReports.js          # Adherence statistics (112 lines)
└── mockSearchResults.js    # Search results (243 lines)
```

### State Management

**Zustand Stores** (3 global stores):
```javascript
// src/features/auth/store/authStore.js
useAuthStore
  - State: user, token, isAuthenticated, role
  - Actions: login(), signup(), logout(), selectRole()
  - Persist: localStorage (STORAGE_KEYS.AUTH_TOKEN)

// src/features/medication/store/medicationStore.js
useMedicationStore
  - State: medications[], isLoading, error
  - Actions: fetchMedications(), addMedication(), updateMedication(), deleteMedication()

// src/features/family/store/familyStore.js
useFamilyStore
  - State: familyGroup, members[], invitations[]
  - Actions: initialize(), addMember(), inviteMember(), updateMember()
```

**React Context**:
```javascript
// src/features/family/context/FamilyContext.jsx
FamilyProvider
  - Wraps entire app in App.jsx
  - Provides family data to all routes
  - Auto-fetches on mount
```

### Custom Hooks

**Global Hooks** (`src/hooks/`):
- `useFetch(url, options)` - Generic data fetching with loading/error states
- `useDebounce(value, delay)` - Debounce search inputs (default 300ms)
- `useLocalStorage(key, initialValue)` - Sync state with localStorage

**Feature-Specific Hooks**:
- `useAuth()` - Auth state selector from authStore
- `useFamily()` - Family operations (add/invite/remove members)
- `useFamilyMemberDetail(memberId)` - Single member data
- `useFamilySync()` - Real-time WebSocket sync (skeleton)

## 📚 Related Documentation

### Local Files (This Repository)
- **[README.md](../README.md)** - User-facing project overview (root)
- **[QUICKSTART.md](../QUICKSTART.md)** - Quick setup guide (root)
- **[CONVENTIONS.md](./CONVENTIONS.md)** - Git workflow & code style (detailed)
- **[SRC_STRUCTURE.md](./SRC_STRUCTURE.md)** - Directory structure & architecture
- **[FRONTEND_COMPONENTS_SPECIFICATION.md](./FRONTEND_COMPONENTS_SPECIFICATION.md)** - 34 screens, props, routing
- **[PROJECT_SPECIFICATION.md](./PROJECT_SPECIFICATION.md)** - Full requirements
- **[CHAT_API_SPECIFICATION.md](./CHAT_API_SPECIFICATION.md)** - WebSocket API
- **[OCR_API_SPECIFICATION.md](./OCR_API_SPECIFICATION.md)** - OCR API

### External Links
- **[.github Repository](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/tree/dev)** - Organization-wide docs
  - `WIREFRAME_SCREENS.md` - UI wireframes (10 screens)
  - `FIGMA_GUIDE.md` - Figma plugin setup
  - `DB스킬.md` - Database schema & ERD
  - `SECURITY_GUIDELINES.md` - Security standards (KISA)
  - `MVP_DTO_SPECIFICATION.md` - API endpoints & DTOs
- **[Backend Repository](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/Back)** - Spring Boot backend

## Do Not

### Security & Best Practices
- ❌ **DO NOT** commit `.env` file to git (use `.env.template` instead)
- ❌ **DO NOT** hardcode API keys or secrets in code
- ❌ **DO NOT** skip input validation (use Zod schemas in `validation.js`)
- ❌ **DO NOT** trust API responses without validation
- ❌ **DO NOT** expose sensitive user data in error messages

### Architecture & Patterns
- ❌ **DO NOT** use React Native (this is web-only)
- ❌ **DO NOT** override existing library patterns without team discussion
- ❌ **DO NOT** use Context API for global state (use Zustand stores instead)
- ❌ **DO NOT** create new API clients without extending `ApiClient` base class
- ❌ **DO NOT** bypass mock API architecture (support both mock/real modes)

### Code Quality
- ❌ **DO NOT** create components without proper JSDoc comments
- ❌ **DO NOT** use implicit `any` types or loose type checking
- ❌ **DO NOT** use `var` (use `const`/`let` only)
- ❌ **DO NOT** mutate state directly (use Zustand `set()` method)
- ❌ **DO NOT** use inline styles (use Tailwind classes or SCSS modules)

### File Organization
- ❌ **DO NOT** create files outside feature directories unless truly global
- ❌ **DO NOT** mix feature-specific code in `/shared` directory
- ❌ **DO NOT** create duplicate utility functions (check `/core/utils` first)
- ❌ **DO NOT** bypass path aliases (use `@features`, `@shared`, etc.)

### Git Workflow
- ❌ **DO NOT** commit directly to `main` or `develop` branches
- ❌ **DO NOT** skip emoji in commit messages (follow convention)
- ❌ **DO NOT** create branches without issue number (`feature/#10-description-developer`)
- ❌ **DO NOT** push without running `npm run lint` first

## Key Development Tips for AI Assistants

### When Adding New Features
1. ✅ Check if similar component exists in `/shared/components/ui`
2. ✅ Use existing API client patterns (extend `ApiClient`)
3. ✅ Add mock data to `/src/data/mock*.js` for testing
4. ✅ Follow naming conventions (PascalCase for components, camelCase for functions)
5. ✅ Add JSDoc comments for all exported functions

### When Debugging
1. ✅ Check browser console for React errors
2. ✅ Verify `VITE_USE_MOCK_API` env variable setting
3. ✅ Check if auth token exists in localStorage (`STORAGE_KEYS.AUTH_TOKEN`)
4. ✅ Review Zustand DevTools for state changes
5. ✅ Check `src/core/interceptors/errorInterceptor.js` for API errors

### When Integrating Real APIs
1. ✅ Update API client `request()` method to call real endpoint
2. ✅ Keep mock response for fallback testing
3. ✅ Update DTO validation schemas in `validation.js`
4. ✅ Test error handling for 401/403/500 responses
5. ✅ Update environment variables in `.env.template`

### File References
When suggesting code changes, reference files using this format:
- `src/features/auth/pages/Login.jsx:42` - Login component, line 42
- `src/core/services/api/authApiClient.js:15` - Auth client, line 15
- `src/shared/components/ui/Button.jsx` - Button component

---

**Last Updated**: 2025-11-14 (Auto-generated from codebase analysis)
