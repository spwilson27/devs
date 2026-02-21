# Task: Implement Optimistic State Rollback with Snap-Back Animation (Sub-Epic: 99_Resilience_Skeleton_Rollback)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-086-3], [7_UI_UX_DESIGN-REQ-UI-DES-086]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/hooks/__tests__/useOptimisticState.test.ts`, create unit tests for the `useOptimisticState` hook:
  - **Test: Optimistic commit updates local state immediately**: Call `commit(newValue)` and assert that `currentValue` equals `newValue` synchronously, before any async persistence.
  - **Test: Successful persistence confirms state**: After `commit(newValue)`, simulate a successful `persistenceResult` (Promise resolves), and assert `currentValue` remains `newValue` and `rollbackPending === false`.
  - **Test: Failed persistence triggers rollback**: After `commit(newValue)`, simulate `persistenceResult` rejecting, and assert that `currentValue` reverts to the pre-commit value.
  - **Test: `rollbackPending` flag set during rollback**: Assert `rollbackPending === true` between persistence failure and rollback completion.
  - **Test: `snapBackAnimation` flag triggered on rollback**: Assert `snapBackAnimation === true` for exactly 300ms after rollback begins, then `false` (use `jest.useFakeTimers()`).
  - **Test: `persistenceFailureVisible` flag set on rollback**: Assert `persistenceFailureVisible === true` after a failed persistence, requiring explicit user dismissal.
- [ ] In `packages/vscode/src/webview/components/feedback/__tests__/PersistenceFailureWarning.test.tsx`:
  - Write a test that renders `<PersistenceFailureWarning visible={true} />` and asserts `data-testid="persistence-failure-warning"` is present with text `"Persistence Failure"`.
  - Write a test that renders `<PersistenceFailureWarning visible={false} />` and asserts the warning is NOT in the DOM.
  - Write a test confirming `role="alert"` and `aria-live="assertive"` are set on the warning element.
  - Write a test confirming a dismiss button (`data-testid="dismiss-persistence-warning"`) is rendered and that clicking it invokes the `onDismiss` callback prop.
- [ ] In `packages/vscode/src/webview/styles/__tests__/snapBack.css.test.ts`:
  - Write a test asserting the `snap-back` CSS class defines a `@keyframes` animation with a 300ms duration.
  - Write a test confirming the animation uses `transform: translateX()` offsets consistent with a "snap back" visual (initial offset away from neutral, then return to origin).

## 2. Task Implementation
- [ ] **`useOptimisticState` hook**: Create `packages/vscode/src/webview/hooks/useOptimisticState.ts`:
  ```ts
  function useOptimisticState<T>(
    persistedValue: T,
    persist: (value: T) => Promise<void>
  ): {
    currentValue: T;
    commit: (newValue: T) => void;
    rollbackPending: boolean;
    snapBackAnimation: boolean;
    persistenceFailureVisible: boolean;
    dismissPersistenceFailure: () => void;
  }
  ```
  - `commit(newValue)`: Immediately set `currentValue` to `newValue` (optimistic), then call `persist(newValue)`.
    - On `persist` resolve: No further action (state is confirmed).
    - On `persist` reject: Set `rollbackPending = true`, revert `currentValue` to `persistedValue`, set `snapBackAnimation = true`, set `persistenceFailureVisible = true`.
  - `snapBackAnimation`: Set to `true` on rollback, then reset to `false` after exactly 300ms using `setTimeout`.
  - `dismissPersistenceFailure`: Sets `persistenceFailureVisible = false`.
- [ ] **Snap-back CSS animation**: In `packages/vscode/src/webview/styles/snapBack.css`, define:
  ```css
  @keyframes snap-back {
    0%   { transform: translateX(0); }
    20%  { transform: translateX(-8px); }
    40%  { transform: translateX(8px); }
    60%  { transform: translateX(-4px); }
    80%  { transform: translateX(4px); }
    100% { transform: translateX(0); }
  }
  .snap-back-active {
    animation: snap-back 300ms ease-in-out;
  }
  ```
  - Ensure `prefers-reduced-motion` disables this animation: add `@media (prefers-reduced-motion: reduce) { .snap-back-active { animation: none; } }` per `7_UI_UX_DESIGN-REQ-UI-DES-085-4`.
- [ ] **`PersistenceFailureWarning` component**: Create `packages/vscode/src/webview/components/feedback/PersistenceFailureWarning.tsx`:
  - Props: `visible: boolean`, `onDismiss: () => void`.
  - When `visible`: Render `<div data-testid="persistence-failure-warning" role="alert" aria-live="assertive">` with:
    - Text: `"Persistence Failure: The last action could not be saved. State has been restored."`.
    - A dismiss button: `<button data-testid="dismiss-persistence-warning" onClick={onDismiss}>Dismiss</button>`.
    - Styled using `--vscode-notificationsErrorIcon-foreground` and `--vscode-notifications-background` tokens.
  - When not `visible`: render `null`.
- [ ] **Integration in `DirectiveWhisperer`**: In `packages/vscode/src/webview/components/controls/DirectiveWhisperer.tsx`:
  - Use `useOptimisticState` to manage the submitted directive value.
  - The `persist` function calls the MCP bridge to write the directive to `state.sqlite`.
  - Apply `className={snapBackAnimation ? 'snap-back-active' : ''}` to the input container.
  - Render `<PersistenceFailureWarning visible={persistenceFailureVisible} onDismiss={dismissPersistenceFailure} />` below the input.
- [ ] **Persistence bridge**: In `packages/vscode/src/webview/bridge/mcpBridge.ts`:
  - Expose an `async persistDirective(directive: string): Promise<void>` function that sends a `TOOL_CALL` to the extension host and waits for an `ACK` or `NACK` response.
  - On `NACK` or timeout (5s): reject the Promise so `useOptimisticState` triggers rollback.

## 3. Code Review
- [ ] Verify `useOptimisticState` never leaves `currentValue` in an indeterminate state: it must always be either the optimistic value (pending confirmation) or the last confirmed `persistedValue` (after rollback).
- [ ] Verify the snap-back animation duration is exactly 300ms as specified in `7_UI_UX_DESIGN-REQ-UI-DES-086-3`, with no hardcoded pixel values outside the keyframe definition.
- [ ] Verify `@media (prefers-reduced-motion: reduce)` fully disables `snap-back-active` animation, consistent with `7_UI_UX_DESIGN-REQ-UI-DES-085-4`.
- [ ] Verify `PersistenceFailureWarning` uses only VSCode design token colors (no hardcoded values).
- [ ] Verify the persistence timeout is 5 seconds — not shorter (prevents false rollbacks on slow networks) and not longer (prevents indefinite UI lock).
- [ ] Verify `persistenceFailureVisible` requires an explicit user `dismissPersistenceFailure()` action to clear — it must NOT auto-dismiss after a timer.
- [ ] Verify `useOptimisticState` is generic (`<T>`) and not hardcoded to directive strings, ensuring reusability for other optimistic UI interactions.

## 4. Run Automated Tests to Verify
- [ ] Run: `pnpm --filter @devs/vscode test -- --testPathPattern="useOptimisticState|PersistenceFailureWarning|snapBack"` and confirm all tests pass with zero failures.
- [ ] Run the full webview test suite: `pnpm --filter @devs/vscode test` and confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/vscode/src/webview/hooks/useOptimisticState.agent.md` documenting:
  - The hook API (all parameters and return values).
  - The rollback flow diagram (as ASCII or Mermaid).
  - The persistence timeout (5s) and snap-back animation duration (300ms).
  - The reduced-motion compliance note.
- [ ] Create `packages/vscode/src/webview/components/feedback/README.agent.md` documenting `PersistenceFailureWarning` props and the invariant that it requires explicit user dismissal.
- [ ] Add an entry to `tasks/phase_11/agent_memory.md`: "`7_UI_UX_DESIGN-REQ-UI-DES-086-3` fulfilled by `useOptimisticState` hook. Snap-back is 300ms, reduced-motion safe. `PersistenceFailureWarning` requires manual dismissal."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="useOptimisticState|PersistenceFailureWarning|snapBack"` and assert line coverage ≥ 90% for all new files.
- [ ] Run `grep -r "setTimeout.*[0-9]" packages/vscode/src/webview/hooks/useOptimisticState.ts` and assert the only timeout is exactly `300` (ms) for the snap-back flag reset.
- [ ] Run `grep "prefers-reduced-motion" packages/vscode/src/webview/styles/snapBack.css` and assert at least one match (confirming the reduced-motion media query is present).
- [ ] Run `pnpm --filter @devs/vscode build` and confirm zero TypeScript or CSS compilation errors.
