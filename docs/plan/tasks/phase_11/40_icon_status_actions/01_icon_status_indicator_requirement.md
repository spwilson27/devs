# Task: Implement Icon Status Indicator (Sub-Epic: 40_Icon_Status_Actions)

## Covered Requirements

- [7_UI_UX_DESIGN-REQ-UI-DES-064-5] Icon status indicator

## 1. Initial Test Written

- [ ] Create a unit test file at packages/ui/src/components/Icon/__tests__/icon-status-indicator.spec.tsx using Jest + React Testing Library.
  - Test A: Render <Icon name="alert" status="success" /> and assert the rendered root element includes attribute `data-icon-status="success"`.
  - Test B: Render <Icon name="alert" status="error" /> and assert `data-icon-status="error"` and the status-dot element exists with `data-testid="icon-status-dot"`.
  - Test C: Render <Icon name="alert" /> (no status) and assert no `data-icon-status` attribute or `data-icon-status="none"` behavior as decided by spec.
  - Tests MUST be written first and must fail before implementation (TDD).

## 2. Task Implementation

- [ ] Add helper: `packages/ui/src/components/Icon/icon-status-utils.ts` with `export function normalizeIconStatus(status?: string): 'success'|'warning'|'error'|'none'`.
- [ ] Update component: `packages/ui/src/components/Icon/Icon.tsx` to accept prop `status?: 'success' | 'warning' | 'error'` and set `data-icon-status={normalizeIconStatus(status)}` on the root wrapper; when status !== 'none' render a status element: `<span data-testid="icon-status-dot" className={`icon__status icon__status--${status}`} aria-hidden="true" />`.
- [ ] Add styles: `packages/ui/src/components/Icon/icon-status.module.css` (or `.scss`) with classes `.icon__status--success`, `.icon__status--warning`, `.icon__status--error` that reference theme tokens only.
- [ ] Storybook example: `packages/ui/stories/Icon/StatusIndicator.stories.tsx` showing each status variant.

## 3. Code Review

- [ ] Ensure `normalizeIconStatus` is pure, typed, and covered by unit tests for edge cases (null/undefined/unknown values).
- [ ] Ensure no hard-coded color values; use theme variables.
- [ ] Ensure tests were written first and were failing before implementation.

## 4. Run Automated Tests to Verify

- [ ] Run unit tests for the UI package:
  - `pnpm --filter packages/ui test -- --testPathPattern=icon-status-indicator` OR
  - `yarn test packages/ui --testPathPattern=icon-status-indicator` OR
  - `npm run test --workspace packages/ui -- --testPathPattern=icon-status-indicator`
- [ ] Tests should fail initially and pass after implementation.

## 5. Update Documentation

- [ ] Update `docs/ui/icons.md` and `packages/ui/README.md` with API for `status` prop, usage examples, and migration notes.

## 6. Automated Verification

- [ ] Add verifier script: `scripts/verify-icon-status.js` that scans `src/**/*.{tsx,ts,jsx,js}` for `data-icon-status` usage and enforces normalized values; add npm script `verify:icon-status` and include it in PR CI.
