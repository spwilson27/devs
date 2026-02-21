# Task: Implement Bottom Console Minimization (Sub-Epic: 35_Viewport_Constraints)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-082], [4_USER_FEATURES-REQ-048]

## 1. Initial Test Written
- [ ] Create unit tests at packages/webview/src/components/Console/__tests__/console-minimize.spec.tsx:
  - Render Console inside LayoutProvider; simulate viewport heights above and below 600px.
  - Assert that when viewport height < 600px the console is minimized to a `status bar` mode (32px), with `aria-hidden` handled and a visible compact summary (active task ID + progress pulse).
  - Add Playwright test to verify minimize-on-small-height behavior in a headless browser and persistence of the minimized state.

## 2. Task Implementation
- [ ] Implement Console behavior in src/components/Console/Console.tsx:
  - Provide minimized/expanded modes with CSS classes: `.console-statusbar { height: 32px }` and `.console-expanded { height: auto; min-height: 120px }`.
  - Watch viewport height via ResizeObserver or window.innerHeight; automatically switch to status bar when height < 600px.
  - Add user toggle to expand/minimize; persist user preference to Zustand.
  - Ensure drag-to-resize is supported when expanded, with minHeight 120px and snap-to-statusbar when dragged below threshold.

## 3. Code Review
- [ ] Verify automatic minimize only triggers on height < 600px and that explicit user expand overrides automatic minimize until next reload (or per documented policy).
- [ ] Ensure status bar remains accessible: keyboard focusable, screen-reader text for collapsed summary, and aria-controls/aria-expanded on the toggle.
- [ ] Confirm console does not overlap critical UI and respects z-index layering rules.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests and Playwright E2E: npx vitest run packages/webview/src/components/Console/__tests__/console-minimize.spec.tsx && npx playwright test tests/e2e/console-minimize.spec.ts

## 5. Update Documentation
- [ ] Document the console minimization policy, the 600px height threshold, CSS classes, persistence key, and how to override via user action or settings.

## 6. Automated Verification
- [ ] Add scripts/verify-console-minimize.js (Playwright) that runs the app at multiple heights and verifies the minimized class, visibility of the compact summary, and persistence; expose as `verify:console`.
