# Project Overview

**"Is it time to take medicine?"** - Family-centered medication management platform for elderly parents & adult children remote care.

- **Team**: 3 developers
- **Period**: Nov 5 - Dec 31, 2025 (~7 weeks dev)
- **Key Features**: Family care network, drug-food interaction alerts, OCR prescription auto-registration, pill reverse search, compliance reports

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
- `src/stores`: Zustand state management (authStore)
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
   - Senior dashboard, Guardian dashboard

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

## References
- [CONVENTIONS.md](./CONVENTIONS.md) - Git & code conventions (detailed)
- [.github repo](https://github.com/KOSA2025-FINAL-PROJECT-TEAM3/.github) - Full project docs
  - QUICKSTART.md - Dev setup
  - SRC_STRUCTURE.md - Architecture
  - FRONTEND_COMPONENTS_SPECIFICATION.md - 34 screens
  - MVP_DTO_SPECIFICATION.md - API endpoints

## Do Not
- ❌ Use React Native (web-only)
- ❌ Commit `.env` to git
- ❌ Override existing library patterns without discussion
- ❌ Use only Context API without Zustand for global state
- ❌ Skip response data validation from API
- ❌ Create components without proper prop typing
- ❌ Use `any` type implicitly

---

Last updated: Nov 8, 2025
