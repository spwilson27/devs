# Task: Define responsive breakpoints and layout detection (Sub-Epic: 35_Viewport_Constraints)

## Covered Requirements
- [4_USER_FEATURES-REQ-048], [7_UI_UX_DESIGN-REQ-UI-DES-049-1]

## 1. Initial Test Written
- [ ] Create unit tests at packages/webview/src/components/Layout/__tests__/breakpoints.spec.tsx using Vitest + React Testing Library:
  - Render the top-level Layout component (data-testid="app-root").
  - Programmatically set window.innerWidth to 1280, 1920, 2560 and dispatch a resize event for each.
  - Assert the root element has the expected layout class: `layout-standard` at 1280, `layout-ultrawide` at >=1920, and `layout-ultrawide-xl` at >=2560.
  - Add a unit test for src/ui/breakpoints.ts verifying exported BREAKPOINTS and getLayoutMode(width) return expected strings.

## 2. Task Implementation
- [ ] Add src/ui/breakpoints.ts exporting:
  - const BREAKPOINTS = { sm:640, md:1024, lg:1280, xl:1440, ultrawide:1920, ultrawide_xl:2560 }
  - function getLayoutMode(width:number): 'narrow'|'standard'|'ultrawide'|'ultrawide-xl'
- [ ] Update tailwind.config.js to add custom screens: `ultrawide: '1920px'`, `ultrawide-xl: '2560px'` and document the change.
- [ ] Implement LayoutProvider (src/components/Layout/LayoutProvider.tsx) that listens to resize (ResizeObserver/window.resize), computes layout mode via getLayoutMode and exposes it via context or Zustand store.
- [ ] Update main Layout component to add `data-testid="app-root"` and conditional classNames: `layout-standard`, `layout-ultrawide`, `layout-ultrawide-xl` and enforce `max-width: 1200px; margin: 0 auto;` for the main reading container when width > 1920px.

## 3. Code Review
- [ ] Ensure breakpoints and layout logic are centralized (single source of truth in src/ui/breakpoints.ts).
- [ ] Verify Tailwind screen additions are in the root config and do not use inline styles.
- [ ] Confirm LayoutProvider cleans up listeners and does not cause reflow thrashing (use rAF/debounce where appropriate).

## 4. Run Automated Tests to Verify
- [ ] Run the webview package tests (example commands):
  - cd packages/webview && npm ci && npm test
  - or npx vitest run packages/webview/src/components/Layout/__tests__/breakpoints.spec.tsx
- [ ] Ensure the breakpoint unit tests pass locally and in CI.

## 5. Update Documentation
- [ ] Add docs/webview/breakpoints.md (or tasks/phase_11/35_viewport_constraints/breakpoints.md) containing a table of breakpoints, Tailwind snippets, the LayoutProvider API, and example DOM classes.

## 6. Automated Verification
- [ ] Add scripts/verify-viewports.js (Playwright or Puppeteer) that serves the built webview and validates the root element's layout class at widths [1280,1920,2560]; fail the script when mismatches occur and expose an npm script `verify:viewports`.
