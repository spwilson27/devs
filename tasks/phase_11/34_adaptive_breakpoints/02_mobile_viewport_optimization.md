# Task: Implement mobile viewport optimization (Sub-Epic: 34_Adaptive_Breakpoints)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-081-1]

## 1. Initial Test Written
- [ ] Write component-level tests for the top-level Layout component at src/ui/layout/__tests__/Layout.mobile.test.tsx:
  - Render Layout inside a test harness and simulate a mobile viewport by setting window.innerWidth = 375 and dispatching window.dispatchEvent(new Event('resize')).
  - Assert that Layout root element has a mobile-specific class or data attribute (e.g., data-testid="layout-root" and classList.contains('layout--mobile') or data-layout="mobile").
  - Assert that non-critical panes (e.g., ROADMAP or RESEARCH side panels) are either hidden or moved behind a collapsible menu (queryByTestId('sidebar') should be null or have aria-hidden="true").
- [ ] Add an E2E Playwright test e2e/viewport/mobile.spec.ts that launches the web app (or Storybook) in a mobile emulation (iPhone 12) and asserts the same visible state and touch-target sizes (>=24px) for the primary interactive elements.

## 2. Task Implementation
- [ ] Modify src/ui/layout/Layout.tsx (or equivalent) to:
  - Consume useBreakpoint() from the breakpoints task and set a mobile mode when breakpoint === 'mobile'.
  - In mobile mode: collapse or hide non-essential panes (sidebar -> hamburger menu), reduce type scale by one step (use CSS variables or Tailwind utility classes), and ensure main content fills the viewport width.
  - Add data-testid attributes to root elements and sidebar so tests can target them deterministically.
- [ ] Tailwind/CSS changes:
  - Add responsive classes for mobile breakpoints to hide side panes (e.g., `md:hidden`, but using project breakpoints defined earlier).
  - Ensure touch-target sizes remain >=24px (apply `min-h`/`min-w` where necessary).
- [ ] Accessibility:
  - Ensure that hidden panes are aria-hidden and focusable elements are moved into an accessible mobile menu.
  - Ensure keyboard navigation and focus order remain logical when panes collapse.

## 3. Code Review
- [ ] Confirm mobile styles are mobile-first and do not regress desktop layout.
- [ ] Confirm there are no hard-coded pixel values that conflict with BREAKPOINTS; prefer utility classes and CSS variables.
- [ ] Confirm accessibility: collapsed panes must use aria-hidden and focus trap patterns when required.

## 4. Run Automated Tests to Verify
- [ ] Run component/unit tests: npx jest src/ui/layout/__tests__/Layout.mobile.test.tsx OR npx vitest run ...
- [ ] Run Playwright E2E: npx playwright test e2e/viewport/mobile.spec.ts --project=webkit (or an equivalent mobile project configured in playwright.config.ts)

## 5. Update Documentation
- [ ] Update docs/ui/breakpoints.md with a "Mobile Optimization" section describing expected layout changes, touch target requirements, and a short screenshot or Storybook story reference.

## 6. Automated Verification
- [ ] Add an automated E2E job that runs the Playwright mobile spec in CI and fails the job if the mobile layout assertions fail.
- [ ] Add a small visual regression check (optional): capture a screenshot during the Playwright run and compare to a stored baseline using pixelmatch or Playwright's toMatchSnapshot utility.
