# Task: Icon Status Indicator — Unit Tests (Sub-Epic: 40_Icon_Status_Actions)

## Covered Requirements

- [7_UI_UX_DESIGN-REQ-UI-DES-064-5]

## 1. Initial Tests to Write (TDD-first)

- [ ] Create: `packages/ui/src/components/Icon/__tests__/icon-status-indicator.spec.tsx`
  - Test 1: Render `<Icon name="check" status="success" />` and assert `container.querySelector('[data-icon-status]')` returns an element with value `success`.
  - Test 2: Render `<Icon name="x" status="error" />` and assert `getByTestId('icon-status-dot')` exists and has class `icon__status--error`.
  - Test 3: Render `<Icon name="bell" status={undefined} />` and assert no `data-icon-status` attribute, or assert `data-icon-status="none"` depending on chosen default (document the chosen default in the test).
  - Test 4: Snapshot test for icon with each status variant.

## 2. Test Helpers

- [ ] Add test util (if needed): `packages/ui/src/components/Icon/__tests__/test-utils.tsx` to render Icon with theme provider / context wrappers used by the UI package.

## 3. Run and Observe Failure

- [ ] Run `pnpm --filter packages/ui test -- --testPathPattern=icon-status-indicator` and confirm the new tests fail before implementation.

## 4. After Implementation

- [ ] Re-run tests and ensure they now pass; update tests only if spec clarifications require it.

## 5. CI Integration

- [ ] Ensure test command is covered by CI for `packages/ui` and that the new tests run in PR pipelines.
