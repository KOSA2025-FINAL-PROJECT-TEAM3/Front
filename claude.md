# SilverCare Frontend Project

## Project Overview
**"Is it time to take medicine?"** - Family-centered medication management platform for elderly parents & adult children remote care.

- **Team**: 3 developers
- **Period**: Nov 5 - Dec 31, 2025 (~7 weeks dev)
- **Key Features**: Family care network, drug-food interaction alerts, OCR prescription auto-registration, pill reverse search, compliance reports

## Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite 5.0+
- **State Management**: Zustand (global), React Hooks (local)
- **HTTP Client**: Axios + Interceptors
- **Styling**: CSS Modules + Tailwind CSS
- **Routing**: React Router
- **Real-time**: WebSocket (Hocuspocus + TipTap for collaborative editing)

## Project Structure
```
src/
├── components/       # UI components (Button, Input, Card)
│   ├── common/      # Base components
│   └── layout/      # Layout (Header, Sidebar, MainLayout)
├── pages/           # Page components
├── features/        # Feature modules (TBD)
├── hooks/           # Custom Hooks (useAuth, useFetch, useDebounce, useLocalStorage)
├── stores/          # Zustand stores (authStore)
├── utils/           # Utilities (validation, formatting, errorHandler)
├── config/          # Config (api.js, constants.js)
├── styles/          # Global styles
├── App.jsx          # Root component
└── main.jsx         # Entry point
```

## Key Commands
- `npm install` - Install dependencies (first-time only)
- `npm run dev` - Start dev server (http://localhost:5173)
- `npm run build` - Production build
- `npm run preview` - Preview build locally
- `npm run lint` - Run ESLint

## Code Style & Conventions

### Naming Convention
- **Components**: PascalCase (`UserProfile.jsx`)
- **Functions/Variables**: camelCase (`getUserData`, `userName`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Custom Hooks**: `use` prefix (`useAuth`)
- **Event Handlers**: `handle` prefix (`handleClick`)
- **Booleans**: `is/has` prefix (`isLoading`, `hasError`)
- **Folders**: lowercase (`components`, `hooks`)

### Git Workflow
**Branch strategy**:
```
main (production) ← develop (integration) ← feature/* (dev)
                                       ↑
                                    bugfix/*
```

**Branch naming** (see CONVENTIONS.md):
```
type/issue#-description-developer
feature/#10-user-profile-junsu
bugfix/#15-auth-error-seohee
```

**Commit format** (Conventional Commits):
```
emoji Type: description (≤50 chars)

✨ Feat: New feature
🐛 Fix: Bug fix
📝 Docs: Documentation
♻️ Refactor: Code refactor
🧪 Test: Tests
```

## Development Stages

### Stage 1: Project Setup
- ✅ Routing structure (React Router)
- ✅ Zustand state management base
- ✅ Common components (Button, Input, Card, Modal)
- ✅ Axios Interceptor setup
- ✅ Layout components (Header, Navigation)

### Stage 2: Authentication (Kakao OAuth)
- [ ] Kakao login page (`/login`)
- [ ] Role selection (`/role-selection` - Senior/Guardian)
- [ ] Auth store implementation
- [ ] JWT token management

### Stage 3: Dashboard
- [ ] Senior dashboard (today's meds, avoided foods, schedule timeline)
- [ ] Guardian dashboard (senior status card, notifications, weekly compliance)

### Stage 4: Feature Development (Priority Order)
**4-1. Family Care Network** (Priority 1 ⭐⭐⭐⭐⭐)
- [ ] Family group management (create, invite, manage)
- [ ] Real-time sync (Hocuspocus + WebSocket)

**4-2. Drug-Food Interaction Alerts** (Priority 2 ⭐⭐⭐⭐⭐)
- [ ] Diet input page
- [ ] Interaction warning UI
- [ ] Alternative food suggestions

**4-3. OCR & Pill Reverse Search** (Priority 3 ⭐⭐⭐⭐)
- [ ] Prescription scan page
- [ ] OCR result editing UI
- [ ] Pill search (shape, color, imprint)

**4-4. Medication CRUD** (Priority 4)
- [ ] Medication list (search, filter)
- [ ] Add medication (OCR/search/manual)
- [ ] Medication details & reviews
- [ ] Schedule management

## Environment Variables

Required (`.env` file):
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080/ws
VITE_KAKAO_CLIENT_ID=your_client_id
```

## Important References

**Core Docs** (.github repo):
- [QUICKSTART.md](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/blob/main/QUICKSTART.md) - Dev setup
- [SRC_STRUCTURE.md](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/blob/main/SRC_STRUCTURE.md) - Architecture
- [FRONTEND_COMPONENTS_SPECIFICATION.md](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/blob/main/FRONTEND_COMPONENTS_SPECIFICATION.md) - 34 screens spec
- [MVP_DTO_SPECIFICATION.md](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/blob/main/MVP_DTO_SPECIFICATION.md) - API endpoints
- [DEVELOPMENT_ROADMAP.md](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github/blob/main/DEVELOPMENT_ROADMAP.md) - 7-week roadmap

**Front Repo**:
- [CONVENTIONS.md](./CONVENTIONS.md) - Git & code conventions

## Core Features

### Family Care Network
- Guardians remotely add meds to senior's schedule
- Real-time sync via Hocuspocus
- Instant completion confirmation
- Emergency alert after 3-hour no-check

### Drug-Food Interaction Alerts
- Auto-detect on food input
- 50-100 major drug interactions DB
- Alternative food recommendations

### Prescription OCR Auto-Registration
- Photo → auto-recognition
- Google Cloud Vision API (1K/month free)
- Tesseract.js fallback (free)
- Auto-generate 30-day schedule

### Pill Reverse Search
- Search by color/shape/imprint
- Uses gov't medicine ID API

### Compliance Reports
- Auto-aggregate 30-day records
- PDF export for doctors

## Do Not
- ❌ Use React Native (web-only)
- ❌ Commit `.env` to git
- ❌ Override existing library patterns
- ❌ Use only Context API without Zustand
- ❌ Skip response data validation

## Backend Integration

**API Gateway**: Spring Cloud Gateway (http://localhost:8080)

**Microservices**:
- Auth Service (JWT)
- Medication Service
- Family Service
- Diet Service
- Notification Service
- OCR Service

**WebSocket**: `/ws` endpoint

---

Last updated: Nov 8, 2025
