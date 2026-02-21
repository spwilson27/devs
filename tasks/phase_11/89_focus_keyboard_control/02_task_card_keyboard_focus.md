# Task: TaskCard Component Keyboard Focusability and Operability (Sub-Epic: 89_Focus_Keyboard_Control)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-100]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/TaskCard/TaskCard.test.tsx`, write unit tests using React Testing Library that verify:
  - The root element of `<TaskCard>` has `tabIndex={0}`.
  - The root element has `role="article"` or `role="button"` (choose `role="button"` if the card itself is the primary interaction target, otherwise `role="article"` with inner action buttons having `role="button"`).
  - Pressing `Enter` on a focused `TaskCard` fires the `onExpand` callback with the correct task ID.
  - Pressing `Space` on a focused `TaskCard` also fires `onExpand` and calls `event.preventDefault()`.
  - Pressing `Escape` on a focused `TaskCard` calls blur on the element.
  - The card has a non-empty `aria-label` that includes the task name and current status.
- [ ] Write a test that renders a list of 5 `TaskCard` components inside a `TaskList` container and verifies all 5 cards appear in the document tab order.

## 2. Task Implementation
- [ ] In `packages/vscode/src/webview/components/TaskCard/TaskCard.tsx`:
  - Add `tabIndex={0}` to the root `<div>` of the card.
  - Add `role="button"` to the root element (or keep `role="article"` and ensure inner interactive elements are separately focusable; use `role="button"` for simplicity since the whole card is clickable).
  - Add `aria-label={`Task: ${task.name}, Status: ${task.status}`}` computed from props.
  - Add `aria-expanded` if the card has an expandable section, reflecting the current expanded state.
  - Add a `onKeyDown` handler:
    - For `Enter` and `Space`: call `onExpand(task.id)` and call `event.preventDefault()`.
    - For `Escape`: call `(event.currentTarget as HTMLElement).blur()`.
  - Ensure that interactive child elements (e.g., action buttons inside the card) do not have `tabIndex={0}` removed; they should remain independently focusable.
- [ ] In `packages/vscode/src/webview/components/TaskCard/TaskList.tsx` (or equivalent list container):
  - Ensure task cards are rendered in a `<ul>` with `role="list"` and each card is wrapped in `<li>` for semantic correctness.
  - Confirm no wrapper element has `tabIndex` that would absorb focus before individual cards.

## 3. Code Review
- [ ] Verify `tabIndex={0}` is on the card root element and not duplicated on inner non-interactive wrappers.
- [ ] Verify `aria-label` is non-empty and correctly reflects task name and status from props; it must not be a static string.
- [ ] Confirm `event.preventDefault()` is called for `Space` keydown to prevent scroll.
- [ ] Confirm inner action buttons (if any) retain their own focus and keyboard handlers and are not broken by the card-level `onKeyDown`.
- [ ] Ensure the `onKeyDown` callback is wrapped in `useCallback` to avoid re-creating it on every render.
- [ ] Verify that the `TaskList` renders semantic `<ul>/<li>` structure.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="TaskCard|TaskList"` and confirm all new tests pass with zero failures.
- [ ] Run the full webview test suite: `pnpm --filter @devs/vscode test` and confirm no regressions.

## 5. Update Documentation
- [ ] Update or create `packages/vscode/src/webview/components/TaskCard/TaskCard.agent.md` documenting:
  - The keyboard interaction model for TaskCard (Tab to navigate, Enter/Space to expand, Escape to blur).
  - The `role="button"` and `aria-label` pattern.
  - How `aria-expanded` maps to the card's expanded state.
- [ ] Update `docs/phases/phase_11.agent.md` (create if absent) to note that TaskCard keyboard navigation is implemented per `6_UI_UX_ARCH-REQ-100`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="TaskCard"` and confirm coverage for keyboard handler branches in `TaskCard.tsx` is ≥ 90%.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm no TypeScript compilation errors.
- [ ] Add a `jest-axe` accessibility check in `TaskCard.test.tsx` that renders a single card and asserts `await axe(container)` returns no violations.
