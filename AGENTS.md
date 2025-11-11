<!-- encoding: utf-8 -->

# AGENTS.md

Repository-wide guidance for agents and contributors. This file governs the full repo at the 3rd3rd root.

## Scope & Precedence
- Scope: Entire repository (rooted at 3rd3rd).
- Document precedence for conflicts:
  1) `front/*.md` (authoritative for frontend)
  2) `.github/*.md` (general project docs)
  3) Other materials

## Branching
- Stage 4.1 working branch: `feature/stage-4-1-prototype`.
- Keep changes focused and small; align naming with existing conventions.

## Routing & Navigation
- Use `src/core/config/routes.config.js` `ROUTE_PATHS` for all navigation.
- Prefer SPA navigation via `navigate(...)`; avoid forced page reloads.

## API Mock Toggle
- The API client auto-selects mocks when either is true:
  - `VITE_USE_MOCK_API === 'true'`
  - Developer Mode flag in `localStorage` is set (`STORAGE_KEYS.DEV_MODE === 'true'`).
- Set `VITE_USE_MOCK_API=false` and disable Dev Mode to hit real HTTP later.

## Encoding & EOL (Cross‑platform)
- Encoding: UTF-8 only.
- Line endings: LF normalized in repo. Windows developers keep LF in working tree (see `.gitattributes`).
- Editor defaults (VS Code): `files.encoding=utf8`, `files.eol=\n`.

## Terminology (Korean UI)
- Roles: “어르신”, “보호자”.
- Status labels: “복용 완료”, “미복용”, “예정”, “건너뜀”.
- Keep UI text consistent with `front/PROJECT_SPECIFICATION.md` and `front/FRONTEND_COMPONENTS_SPECIFICATION.md`.

## Stage Status
- Stage 1–3 are considered complete per specs, except explicitly recorded exceptions in `front/issues.md` and `front/CLAUDE.md`.
- Stage 4 focuses on feature build‑out with mock‑first approach; backend can be swapped in later without structural changes.

## Contribution Checklist
- Use `ROUTE_PATHS`; remove hardcoded routes.
- Preserve UTF‑8 + LF; fix mojibake if spotted.
- Follow Dev Mode + mock policy; avoid overbuilding mock content.
- Keep labels and messages aligned with definitions; prefer Korean terms.

## Next Session Handoff

- Branch
  - Working branch: `feature/stage-4-1-prototype`.

- Routing/Navigation
  - `ROUTE_PATHS` enforced across App, error pages, Kakao callback, BottomNavigation.
  - BottomNavigation revised: Korean labels, Disease tab added, role-based home mapping (caregiver → guardian, senior → dashboard).
  - A11y: `aria-current="page"` on active tab; focus-visible rings in SCSS.

- Family/Dashboard
  - CaregiverDashboard pulls members from `useFamilyStore` and seeds via `initialize()` (mock or real depending on toggles).
  - FamilyMemberDetail texts normalized; uses `useFamilyMemberDetail(id)`.
  - SeniorDashboard consumes member detail via `useFamilyMemberDetail()` and maps to MedicationCard structure from mock detail; currently targets the first SENIOR member.
  - Planned: map SeniorDashboard target via `useAuth` (authenticated user ↔ family member policy), define multi-senior selection.

- Disease Module
  - `features/disease/pages/Disease.jsx` added; `diseaseApiClient` with mock data (`src/data/mockDiseases.js`).
  - App route `ROUTE_PATHS.disease` → DiseasePage wired. Real API used when mock is off.

- Mock/Dev Mode
  - `VITE_USE_MOCK_API=true` or `localStorage[amapill_dev_mode]='true'` → mock responses.
  - Set `VITE_USE_MOCK_API=false` and ensure Dev Mode off to call real endpoints.

- Pending Next Actions
  - Icon component migration: replace BottomNavigation emoji with `<Icon name="..." />` (inline SVG, currentColor).
  - Role-based tab visibility: use `roles` metadata to hide/show tabs per role if required.
  - Mojibake sweep: `src/core/config/constants.js`, DevMode panel, Settings subpages.
  - ROUTE_PATHS extensions (disease suspected/my/restrictions) if spec requires; add pages/shells accordingly.
  - Build/lint run to catch residual JSX/parse issues.
  - Backend wiring: when backend ready, add real endpoints for disease/family detail and verify interceptors/auth propagation.
  - Folder compliance pass:
    - ✅ `src/utils` → `src/core/utils` (files moved, exports intact, no `@/utils` imports remain).
    - ✅ Remove unused root `src/contexts` (feature-level contexts already exist).
    - ✅ Relocate `src/pages/Dashboard/*` into `features/dashboard/pages` per spec (App imports updated).
    - [ ] Reconcile spec vs reality for `features/chat`/`features/notifications`; add shells or update docs.
    - ✅ Keep experimental editors under `src/devtools` (no stray `features/editor` usage in app bundle).

- Quick How-To
  - Real API mode: set `.env` `VITE_USE_MOCK_API=false`, disable Dev Mode (`VITE_ENABLE_DEV_MODE=false` and clear localStorage), start app.
  - Dev Mode reset: use DeveloperModePanel “초기화” or `localStorage.clear()`.
## Frontend Alias & Routing Policy (Stage 4.1)

- Aliases
  - Use: `@`, `@features`, `@shared`, `@components`, `@devtools`, `@hooks`, `@pages`, `@styles`, `@utils` (points to `@core/utils`), `@config`, `@core`.
  - Do not add `@data`. For mock data, keep `@/data/*` (since `@` maps to `src`).
  - Remove/avoid `@/utils/*` imports; use `@core/utils/*` instead.

- Routing
  - Always import paths from `src/core/config/routes.config.js` via `@config/routes.config`.
  - Use correct keys (e.g., `ROUTE_PATHS.chatConversation`, not `CHAT_CONVERSATION`).
  - No hardcoded string routes in components.

- SPA Navigation
  - Prefer SPA navigation for redirects. Interceptors must not use `window.location.href` directly.
  - Use helper in `src/core/routing/navigation.js` (`setNavigator`, `navigateTo`).
  - Register navigator once in `App.jsx` with a registrar component before `<Routes>`.

- Folder Compliance
  - Dashboard pages live under `src/features/dashboard/pages/*` and should be imported via `@features/dashboard/pages/*`.

- Encoding/EOL & Docs
  - Keep files UTF-8 (no BOM) + LF. Fix mojibake when spotted.
  - Track documentation sync and code consistency tasks in `md/plan.md` and `md/checklist.md`.
