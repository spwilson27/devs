# Task: Aria-Live Assertive Region for Task Completion Announcements (Sub-Epic: 14_Loop Detection and Accessibility)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-140-2]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/a11y/__tests__/LiveRegion.assertive.test.tsx`, write RTL unit tests covering:
  - `<LiveRegion politeness="assertive">` renders a `<div>` with `aria-live="assertive"`, `aria-atomic="true"`, and `role="alert"`.
  - The component is visually hidden (same CSS utility as the polite variant).
  - When the `message` prop updates to `"Task TASK-42 Completed Successfully"`, that exact text appears in the DOM within the live region.
  - When `message` resets to `''`, the live region is empty.
- [ ] In `packages/webview-ui/src/components/console/__tests__/AgentConsole.taskSuccess.a11y.test.tsx`, write an integration test:
  - The `<AgentConsole>` (or `<StatusBar>` / `<Orchestrator>` host component, whichever fires task-complete events) renders an assertive `<LiveRegion>` with `id="task-success-live"`.
  - When a `task:completed` event fires with payload `{ taskId: 'TASK-42' }`, the `<LiveRegion>` message updates to `"Task TASK-42 Completed Successfully"`.
  - The live region message resets to `''` after 4000ms (to prevent re-announcement on future renders), verified by using `jest.useFakeTimers()` and advancing timers.
  - A `task:failed` event does NOT update the assertive live region (failure announcements are handled separately).

## 2. Task Implementation
- [ ] Reuse the `<LiveRegion>` component created in task 03 (`packages/webview-ui/src/components/a11y/LiveRegion.tsx`) — no new component is needed; only integration wiring is required.
- [ ] In `packages/webview-ui/src/components/console/AgentConsole.tsx` (or the appropriate host component):
  - Add state: `const [taskSuccessMessage, setTaskSuccessMessage] = useState('')`.
  - Subscribe to the EventBus `task:completed` event.
  - On receipt, call `setTaskSuccessMessage(`Task ${event.payload.taskId} Completed Successfully`)`.
  - Schedule a `setTimeout(() => setTaskSuccessMessage(''), 4000)` to clear the message after announcement (store the timer ID and clear it in cleanup to prevent memory leaks).
  - Render `<LiveRegion id="task-success-live" politeness="assertive" message={taskSuccessMessage} />` in the component tree (alongside the polite region from task 03).
- [ ] Ensure the 4-second reset timer is cleaned up in the component's `useEffect` cleanup function to prevent state updates on unmounted components.

## 3. Code Review
- [ ] Verify `role="alert"` is used for the assertive live region (not `role="status"`), per ARIA spec — alerts interrupt the user immediately.
- [ ] Confirm the announcement string format is exactly `"Task {ID} Completed Successfully"` as specified in the requirement, with no trailing punctuation variation.
- [ ] Verify the 4-second auto-clear timer uses `useRef` to store the timeout ID and is cancelled in the `useEffect` cleanup.
- [ ] Confirm the assertive live region is NOT triggered by `task:failed`, `task:retry`, or any other non-success event.
- [ ] Confirm that the `LiveRegion` component itself requires no changes (this task is purely integration wiring).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=LiveRegion.assertive` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=AgentConsole.taskSuccess.a11y` and confirm all tests pass.
- [ ] Run the full webview-ui test suite: `pnpm --filter @devs/webview-ui test --ci` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `docs/ui/accessibility.md` to add a subsection `#### Task Completion Assertive Announcement` documenting:
  - The event name (`task:completed`), payload shape (`{ taskId: string }`), and announcement string format.
  - The 4-second auto-clear behavior and rationale.
  - Why `assertive` is chosen for task completion (time-sensitive, high-importance user feedback).

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --ci --forceExit` and assert exit code `0`.
- [ ] Run `grep -rn "aria-live=\"assertive\"" packages/webview-ui/src/` to confirm the rendered output contains an assertive live region.
- [ ] Run `grep -rn "task-success-live" packages/webview-ui/src/components/console/AgentConsole.tsx` to confirm the assertive live region is wired to the task completion event.
- [ ] Run `grep -rn "Completed Successfully" packages/webview-ui/src/components/console/AgentConsole.tsx` to verify the exact announcement string is used.
