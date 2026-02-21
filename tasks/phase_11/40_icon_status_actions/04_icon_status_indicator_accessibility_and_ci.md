# Task: Icon Status Indicator — Accessibility & CI (Sub-Epic: 40_Icon_Status_Actions)

## Covered Requirements

- [7_UI_UX_DESIGN-REQ-UI-DES-064-5]

## 1. Accessibility Tests (TDD)

- [ ] Create accessibility unit/integration tests:
  - `packages/ui/src/components/Icon/__tests__/icon-status-a11y.spec.tsx` — assert that status indicators are `aria-hidden="true"` when purely decorative, and consumer components expose a text fallback for screen readers (e.g., `<span className="sr-only">Status: success</span>` at `packages/app/src/components/NotificationItem.tsx`).
  - Add axe/core check in tests: use `@testing-library/jest-dom` + `jest-axe` to assert no critical violations when status dots are present.

## 2. CI Enforcement

- [ ] Add automated verifier script: `scripts/verify-icon-status-a11y.js` that runs `jest-axe` on rendered stories or sample markup and fails the PR on regression.
- [ ] Add CI step in `.github/workflows/ci.yaml` or `ci/scripts/ui-checks.sh`:
  - `npm run test --workspace packages/ui -- --testPathPattern=icon-status` (unit)
  - `npm run e2e` (integration)
  - `npm run verify:icon-status` (static verifier)

## 3. Documentation & Usage Notes

- [ ] Add a11y guidance to `docs/ui/icons.md`: when status conveys semantic meaning ensure a textual announcement or programmatic label exists in the consumer component.

## 4. Acceptance Criteria

- [ ] No new accessibility violations introduced by the status indicator and CI fails PRs that regress accessibility checks for icons.
