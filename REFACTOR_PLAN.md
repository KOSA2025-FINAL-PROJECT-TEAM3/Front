# Master Frontend Refactoring Plan (Big Bang)

**Branch**: `refactor/front-cleanup`
**Goal**: Complete structural cleanup AND remove SCSS dependency in a single pass.
**Philosophy**: "Fix it once, fix it right."

---

## 1. 🏗️ Structural Cleanup (The Skeleton)

### A. Root Directory Cleanup
-   **Target**: `src/components`, `src/pages`
-   **Action**:
    1.  **Analyze & Move**:
        -   `src/components/medication/MedicationCard.jsx` -> `features/medication/components/MedicationDisplayCard.jsx` (Rewrite with Tailwind).
        -   `src/components/medication/MedicationList.jsx` -> `features/medication/components/MedicationDisplayList.jsx` (Rewrite with Tailwind).
        -   `src/pages/WsTestPage.jsx` -> **DELETE** (Use `features/chat/pages/WsTestPage.jsx`).
    2.  **Update References**: Fix imports in `TodayMedications.jsx` etc.
    3.  **Annihilate**: Delete `src/components` and `src/pages/WsTestPage.jsx`.

### B. Deduplication
-   **OCR**: Delete `features/medication/components/ocr`. Use `features/ocr`.
-   **Dashboard**: Consolidate `features/dashboard/components/MedicationCard.jsx` if identical.

### C. Standardization
-   **Rename**: `features/family/stores` -> `features/family/store`.

---

## 2. 🎨 Style Migration (The Skin)

### A. Kill SCSS Dependency
-   **Action**: `npm uninstall sass`
-   **Impact**: SCSS compilation will fail immediately. This forces us to fix files.

### B. Mass Migration (.scss -> .css)
-   **Strategy**: For the 100+ files not being structurally refactored right now, we simply **rename** them to `.css` (CSS Modules).
-   **Logic**: Since they don't use complex SCSS features, they are valid CSS.
-   **Command**: Mass rename script.

### C. Tailwind Adoption (Spot Refactoring)
-   **Target**: The components we are moving in Step 1 (`MedicationDisplayCard`, `MedicationDisplayList`).
-   **Action**: Do NOT move their `.scss` files. Instead, **rewrite their styles using Tailwind CSS classes** directly in the JSX.
-   **Benefit**: Pure Tailwind for new/refactored components.

---

## 3. 🚀 Execution Sequence

1.  **Dependencies**: Remove `sass`.
2.  **Mass Rename**: Convert all remaining `.scss` to `.css` & update imports globally.
3.  **Refactor App.jsx**: Fix `WsTestPage` route.
4.  **Refactor Components**:
    -   Move `MedicationCard`/`List` to `features/medication`.
    -   **Convert to Tailwind** during the move.
    -   Update usages.
5.  **Cleanup**: Delete `src/components`, `features/medication/components/ocr`.
6.  **Rename**: `family/stores` -> `store`.
7.  **Verification**: `npm run build`.
