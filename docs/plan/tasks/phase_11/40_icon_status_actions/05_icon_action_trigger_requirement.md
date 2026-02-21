# Task: Implement Icon Action Trigger (Sub-Epic: 40_Icon_Status_Actions)

## Covered Requirements

- [7_UI_UX_DESIGN-REQ-UI-DES-064-6] Icon action trigger

## 1. Initial Test Written

- [ ] Create a unit test file at `packages/ui/src/components/Icon/__tests__/icon-action-trigger.spec.tsx` using Jest + React Testing Library.
  - Test A: Render `<Icon name="close" onClick={mockFn} actionLabel="Close" />` and assert the rendered element has `role="button"` or is a `<button>` and responds to `click` and keyboard activation (Enter/Space) by calling `mockFn`.
  - Test B: Assert `aria-label` equals provided `actionLabel` when present (`aria-label="Close"`).
  - Test C: Assert that when `disabled` prop is true, clicks and keypresses do not invoke handler and appropriate `aria-disabled` is present.
  - Tests MUST be written first and must fail before implementation (TDD).

## 2. Task Implementation

- [ ] Update `packages/ui/src/components/Icon/Icon.tsx` to accept props `onClick?: () => void`, `actionLabel?: string`, `disabled?: boolean` and to render a semantic interactive control when `onClick` is provided:
  - Prefer rendering a `<button data-testid="icon-action" aria-label={actionLabel} disabled={disabled}>` wrapping the icon SVG OR forward `role="button"` + keyboard handlers if an element wrapper is required.
- [ ] Add keyboard handler util at `packages/ui/src/components/Icon/use-icon-action.ts` to handle `Enter`/`Space` activation consistently.
- [ ] Add story `packages/ui/stories/Icon/IconAction.stories.tsx` showing clickable and disabled variants.

## 3. Code Review

- [ ] Ensure interactive semantics (role, tabindex, aria-label, aria-disabled) are properly set and covered by tests.
- [ ] Ensure we do not introduce layout shifts or unexpected focus styles; leave styling to theme tokens.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter packages/ui test -- --testPathPattern=icon-action-trigger` and ensure tests fail before implementation and pass after.

## 5. Update Documentation

- [ ] Update `docs/ui/icons.md` and `packages/ui/README.md` with guidance on interactive icons, ARIA usage, keyboard behavior, and examples.

## 6. Automated Verification

- [ ] Add `scripts/verify-icon-actions.js` that scans code for icons with `onClick` missing an accessible label and fail the PR; add npm script `verify:icon-actions` and include in CI.
