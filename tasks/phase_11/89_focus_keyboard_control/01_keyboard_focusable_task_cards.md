# Task: Implement Keyboard Focus & Activation on Task Card Components (Sub-Epic: 89_Focus_Keyboard_Control)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-100]

## 1. Initial Test Written

- [ ] In `packages/vscode/src/webview/components/__tests__/TaskCard.test.tsx`, write the following tests using React Testing Library + `@testing-library/user-event`:
  - **Focusability**: Render `<TaskCard />` and assert `getByRole('button')` (or `getByRole('article')` if using `role="article"` with `tabIndex`) receives focus when `userEvent.tab()` is called.
  - **Enter key activation**: Focus the card element, simulate `{Enter}`, and assert the `onSelect` callback prop was called once with the correct task ID.
  - **Space key activation**: Focus the card element, simulate `{Space}`, and assert the `onSelect` callback prop was called once with the correct task ID.
  - **No double-fire**: Simulate a keydown of `{Enter}` followed by keyup and assert `onSelect` is called exactly once (preventing repeat-key spam).
  - **Disabled state**: When the `disabled` prop is `true`, assert focus still works (tabIndex remains) but `onSelect` is NOT called on `{Enter}` or `{Space}`.
  - **aria-selected**: When the card is the selected/active task, assert `aria-selected="true"` is on the element. Otherwise `aria-selected="false"`.

## 2. Task Implementation

- [ ] Open `packages/vscode/src/webview/components/TaskCard.tsx`.
- [ ] Ensure the root element is an interactive HTML element or assign `role="button"` with `tabIndex={0}` to make it keyboard-reachable.
  - If the root is a `<div>`, change it to use `role="button" tabIndex={0}` or refactor to `<button>` (preferred for native keyboard support).
- [ ] Add an `onKeyDown` handler:
  ```tsx
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // prevent page scroll on Space
      onSelect(task.id);
    }
  };
  ```
- [ ] Wire the `onKeyDown` handler and `onClick` to the same underlying `onSelect` call.
- [ ] Add `aria-selected={isSelected}` to the root element.
- [ ] Ensure `aria-disabled={disabled}` is set when `disabled` is true.
- [ ] Do NOT set `tabIndex={-1}` on the card unless it is intentionally excluded from focus order (e.g., when inside a managed focus container handled by a separate roving-tabindex hook).

## 3. Code Review

- [ ] Verify no raw `<div onClick>` pattern is used without a paired `onKeyDown` — a linter rule (`jsx-a11y/click-events-have-key-events`) should catch this.
- [ ] Verify the `role` is semantically correct: `role="button"` if the card performs an action; `role="option"` if it is part of a listbox select group.
- [ ] Verify the `onKeyDown` handler calls `e.preventDefault()` for `Space` to prevent scroll-jump in the webview.
- [ ] Confirm no focus-outline CSS rule on the root element suppresses the browser default (e.g., no `outline: none` without a replacement — this is handled in Task 03).
- [ ] Confirm tests use `userEvent` not `fireEvent` for key interactions (userEvent more accurately simulates real browser behaviour).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=TaskCard` from the monorepo root.
- [ ] All new tests MUST pass with zero failures.
- [ ] Run the full unit test suite for the webview package (`pnpm --filter @devs/vscode test`) and confirm no regressions.

## 5. Update Documentation

- [ ] Update `packages/vscode/src/webview/components/TaskCard.tsx` JSDoc to note: `onSelect` is triggered by click, Enter, and Space key events.
- [ ] Add an entry to `docs/accessibility.md` (create if absent) under a "Keyboard Navigation" section: "TaskCard components are keyboard-focusable and activatable via Enter/Space per [6_UI_UX_ARCH-REQ-100]."

## 6. Automated Verification

- [ ] CI pipeline step: `pnpm --filter @devs/vscode test --ci --coverage` must report TaskCard coverage ≥ 90% for the keyboard interaction branches.
- [ ] Run `pnpm --filter @devs/vscode lint` and confirm zero `jsx-a11y` violations.
- [ ] Optionally run a Playwright E2E smoke test: open the dashboard webview, tab to the first task card, press Enter, and assert the detail panel opens.
