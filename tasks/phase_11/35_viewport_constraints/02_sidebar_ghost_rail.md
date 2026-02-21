# Task: Implement Sidebar Ghost Rail (collapse behavior) (Sub-Epic: 35_Viewport_Constraints)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-049-2], [4_USER_FEATURES-REQ-048]

## 1. Initial Test Written
- [ ] Create unit tests at packages/webview/src/components/Sidebar/__tests__/sidebar-ghost-rail.spec.tsx:
  - Render Sidebar inside LayoutProvider with different layout modes.
  - Verify presence/absence of `sidebar-ghost` class and `aria-expanded` state.
  - Simulate toggle clicks and keyboard activation; assert focus management and persistence (localStorage or Zustand persisted state).
  - Add a Playwright E2E test to load the app at 2560x1440 and check the sidebar collapses to a thin rail (icon-only), and that expanding restores full width.

## 2. Task Implementation
- [ ] Implement CSS and behavior:
  - Add `.sidebar-ghost { width: 56px; }` and expanded `.sidebar-expanded { width: 240px; }` using Tailwind utilities or component styles.
  - Implement SidebarCollapseController in src/components/Sidebar/Sidebar.tsx that:
    - Reads layout mode from LayoutProvider; enables Ghost Rail mode for `ultrawide` (>=1920px) and for `narrow` when configured.
    - Exposes toggle control with accessible button (aria-expanded, aria-controls).
    - Persists user preference to Zustand store persisted to localStorage.
- [ ] Ensure keyboard support (Enter/Space toggles) and proper aria-labels.

## 3. Code Review
- [ ] Verify collapse logic is deterministic and testable (no ad-hoc width magic in multiple places).
- [ ] Ensure the collapsed rail only shows icons and tooltips; no truncation of critical labels on collapse.
- [ ] Confirm animation durations and reduced-motion respect user preferences.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests and Playwright E2E: npx playwright test tests/e2e/sidebar-ghost-rail.spec.ts --project=ultrawide
- [ ] Verify persistence across reloads and that layout content reflows correctly when sidebar toggles.

## 5. Update Documentation
- [ ] Document the Ghost Rail behavior, default breakpoints that trigger it, the persistence key in Zustand/localStorage, and CSS class names in the component README.

## 6. Automated Verification
- [ ] Add scripts/verify-sidebar-ghost.js (Playwright) that builds the webview, opens at 2560x1440, verifies `.sidebar-ghost` present, toggles expansion and confirms the DOM and localStorage values; expose as `verify:sidebar` npm script.
