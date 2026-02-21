# Task: State Restored Toast Notification (Sub-Epic: 13_Animation Performance and Guardrails)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-058], [7_UI_UX_DESIGN-REQ-UI-DES-058-2]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/__tests__/animations/`, create `state-restored-toast.test.tsx`.
- [ ] Write a unit test that renders `AppShell` (with `ToastProvider`), dispatches a `{ type: 'REWIND_COMPLETE', payload: { taskId: 'task-042' } }` action to the Zustand store, and asserts that a `<div data-testid="toast-state-restored">` element becomes visible in the DOM within 100ms.
- [ ] Assert the toast text content matches `"State Restored – Task task-042"` (or equivalent format).
- [ ] Write a test verifying the toast element's computed `transform` starts at `translateY(100%)` and transitions to `translateY(0)` using Vitest fake timers and checking the inline style or CSS class.
- [ ] Write a test asserting the toast automatically disappears (removed from DOM or `opacity: 0`) after 4000ms.
- [ ] Write a test asserting the toast disappears immediately when the user clicks it (dismiss on click).
- [ ] Write a test that when `useReducedMotion()` returns `true`, the toast appears instantly (no slide transition) but is otherwise fully functional.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/Toast/StateRestoredToast.tsx`:
  - Props: `taskId: string`, `onDismiss: () => void`.
  - Renders a `<div data-testid="toast-state-restored">` positioned `fixed` at `bottom: 24px; left: 50%; transform: translateX(-50%)`.
  - Uses a CSS class `toast-enter` (defined in `StateRestoredToast.module.css`) that animates `transform: translateY(100%) -> translateY(0)` over `300ms cubic-bezier(0.4, 0, 0.2, 1)` on mount.
  - When `useReducedMotion()` is `true`, skip the `toast-enter` animation class.
  - Auto-dismiss via `setTimeout(onDismiss, 4000)` stored in a `useRef` for cleanup.
  - Calls `onDismiss` immediately on click.
- [ ] Create `packages/webview-ui/src/components/Toast/StateRestoredToast.module.css` with the `toast-enter` keyframe definition.
- [ ] In `packages/webview-ui/src/store/uiSlice.ts`, add `restoredTaskId: string | null` field and an action `setRestoredTaskId(taskId: string | null)`.
- [ ] Subscribe to the `REWIND_COMPLETE` event from the `EventBus` in the store middleware and dispatch `setRestoredTaskId(event.payload.taskId)`, then automatically dispatch `setRestoredTaskId(null)` after 4000ms.
- [ ] In `packages/webview-ui/src/components/AppShell/AppShell.tsx`, conditionally render `<StateRestoredToast taskId={restoredTaskId} onDismiss={() => setRestoredTaskId(null)} />` when `restoredTaskId` is non-null.

## 3. Code Review
- [ ] Verify `StateRestoredToast` clears its auto-dismiss `setTimeout` in a `useEffect` cleanup to prevent state updates after unmount.
- [ ] Confirm the `fixed` positioning and `translateX(-50%)` centering work correctly at all Webview viewport widths (test at 400px, 800px, 1200px).
- [ ] Ensure the toast has `role="status"` and `aria-live="polite"` for screen reader compatibility.
- [ ] Check that the toast `z-index` is set above the `DAGCanvas` and all panel overlays (recommend `z-index: 9999`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test --reporter=verbose packages/webview-ui/src/__tests__/animations/state-restored-toast.test.tsx` and confirm all assertions pass.

## 5. Update Documentation
- [ ] Update the `## Rewind & State Recovery` section of `packages/webview-ui/AGENT.md` to include the `REWIND_COMPLETE` event contract and `StateRestoredToast` component API.
- [ ] Add a `StateRestoredToast` entry to the UI component catalog in `docs/ui-components.md` (create if absent), describing its props, animation behavior, and accessibility attributes.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test:ci` and verify exit code is `0`.
- [ ] Run the Playwright E2E test `state-restored-toast.spec.ts` (create if absent) that triggers a full rewind via `devs rewind --task task-042`, waits for the glitch animation (≥600ms), and then asserts:
  1. `page.locator('[data-testid="toast-state-restored"]')` is visible.
  2. Its text includes `"task-042"`.
  3. After 4200ms, the toast is no longer visible.
  All assertions must pass with exit code `0`.
