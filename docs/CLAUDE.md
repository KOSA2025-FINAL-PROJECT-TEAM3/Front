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
- `src/components`: UI components (Button, Input, Card, Modal)
  - `common/`: Base components
  - `layout/`: Layout components (Header, Sidebar, MainLayout)
- `src/pages`: Page components
- `src/features`: Feature modules (auth, medication, family, diet)
- `src/hooks`: Custom Hooks (useAuth, useFetch, useDebounce, useLocalStorage)
- `src/features/*/store`: Zustand state management (ex: `auth/store/authStore.js`)
- `src/utils`: Utilities (validation, formatting, errorHandler)
- `src/config`: Configuration files (api.js, constants.js)
- `src/styles`: Global styles
- `src/App.jsx`: Root component
- `src/main.jsx`: Entry point

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

### Development Stages
1. **Stage 1: Project Setup** (✅ Complete)
   - Routing, Zustand, common components, Axios config, layouts

2. **Stage 2: Authentication** (Kakao OAuth)
   - Login page, role selection, auth store, JWT management

3. **Stage 3: Dashboard**
   - Senior dashboard, Caregiver dashboard

4. **Stage 4: Feature Development** (Priority Order)
   - Family care network (real-time sync)
   - Drug-food interaction alerts
   - OCR & pill reverse search
   - Medication CRUD operations

## Environment Variables
Required (`.env` file):
- `VITE_API_BASE_URL`: API server (http://localhost:8080)
- `VITE_WS_BASE_URL`: WebSocket server (ws://localhost:8080/ws)
- `VITE_KAKAO_CLIENT_ID`: Kakao OAuth client ID

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
- ❌ Use React Native (web-only)
- ❌ Commit `.env` to git
- ❌ Override existing library patterns without discussion
- ❌ Use only Context API without Zustand for global state
- ❌ Skip response data validation from API
- ❌ Create components without proper prop typing
- ❌ Use `any` type implicitly

---

Last updated: Nov 12, 2025
