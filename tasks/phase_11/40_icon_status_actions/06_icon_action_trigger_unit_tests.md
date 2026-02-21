# Task: Icon Action Trigger — Unit Tests (Sub-Epic: 40_Icon_Status_Actions)

## Covered Requirements

- [7_UI_UX_DESIGN-REQ-UI-DES-064-6]

## 1. Unit Tests to Write (TDD-first)

- [ ] Create: `packages/ui/src/components/Icon/__tests__/icon-action-trigger.spec.tsx`
  - Test 1: Render `<Icon name="close" onClick={mockFn} actionLabel="Close" />` and `fireEvent.click(getByTestId('icon-action'))` should call `mockFn` once.
  - Test 2: Simulate keyboard activation: `fireEvent.keyDown(getByTestId('icon-action'), { key: 'Enter' })` and `{ key: ' ' }` should call `mockFn`.
  - Test 3: When `disabled` prop true, both click and key events should NOT call handler and `aria-disabled="true"` should be present.
  - Test 4: Accessibility: assert `aria-label` is present and focus order is correct.

## 2. Test Utilities

- [ ] If the UI package uses a custom render wrapper, add `packages/ui/src/components/Icon/__tests__/test-utils.tsx` to provide theme/context for tests.

## 3. Run Tests and Observe Failure

- [ ] Run `pnpm --filter packages/ui test -- --testPathPattern=icon-action-trigger` and confirm tests fail before implementation.

## 4. After Implementation

- [ ] Re-run tests and ensure they pass and cover keyboard + mouse + disabled cases.

## 5. CI Integration

- [ ] Ensure these tests run in PR CI for `packages/ui`.
