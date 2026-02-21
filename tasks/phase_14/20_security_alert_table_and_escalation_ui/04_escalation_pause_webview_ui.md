# Task: Escalation Pause Webview UI (Sub-Epic: 20_Security Alert Table and Escalation UI)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-083]
- [1_PRD-REQ-GOAL-003]

## 1. Initial Test Written
- [ ] In `src/webview/__tests__/EscalationPauseModal.test.tsx`, write React Testing Library tests for an `<EscalationPauseModal />` component:
  - Test that the modal is NOT rendered when `isVisible` prop is `false`.
  - Test that the modal IS rendered when `isVisible` prop is `true`.
  - Test that the modal displays the `taskId`, the attempt count (`5 attempts`), and the human-readable task title.
  - Test that the modal shows the failure history: a list of the last 5 failure reasons (from `failureHistory: string[]` prop).
  - Test that clicking the "Resume with New Directive" button calls `onResumeWithDirective()` callback.
  - Test that clicking the "Skip Task" button calls `onSkip()` callback.
  - Test that clicking the "Abort Project" button calls `onAbort()` callback with a confirmation dialog appearing first (mock `window.confirm` to return `true`).
  - Test that the modal is not dismissible by clicking the backdrop (it is a blocking modal – `onClose` is absent).
  - All tests must be written and failing before implementation.
- [ ] In `src/webview/__tests__/DashboardPanel.escalation.test.tsx`:
  - Test that when the extension host sends a `TASK_ESCALATED` message, the `<EscalationPauseModal />` becomes visible with the correct `taskId` and `failureHistory`.
  - Test that after `onResumeWithDirective` is called, the panel dispatches `RESUME_TASK` message with `{ taskId, directive: string }` to the extension host.

## 2. Task Implementation
- [ ] Create `src/webview/components/EscalationPauseModal.tsx`:
  - Props: `{ isVisible: boolean; taskId: string; taskTitle: string; attemptCount: number; failureHistory: string[]; onResumeWithDirective: (directive: string) => void; onSkip: () => void; onAbort: () => void; }`.
  - Render a full-screen semi-transparent overlay with a centered card when `isVisible`.
  - Card layout:
    - Header: Red warning icon + "🚨 Implementation Stalled" title.
    - Body section 1: Task info – `taskId`, `taskTitle`, `Attempt X of 5`.
    - Body section 2: Collapsible "Failure History" list – renders each `failureHistory` string as a `<pre>` code block.
    - Body section 3: A `<textarea>` labeled "Provide a new directive or clarification:" bound to local state `directive: string`.
    - Footer: Three action buttons: "Resume with New Directive" (primary, disabled if `directive.trim()` is empty), "Skip Task" (secondary), "Abort Project" (destructive, requires `window.confirm`).
  - The modal must trap focus (implement a `FocusTrap` via `useEffect` with `tabindex` management or use the `focus-trap-react` library if already in the project's dependencies).
  - Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby` for accessibility.
- [ ] Modify `src/webview/panels/DashboardPanel.tsx`:
  - Add `escalationState: { taskId: string; taskTitle: string; attemptCount: number; failureHistory: string[] } | null` to local state (default `null`).
  - On `TASK_ESCALATED` message: set `escalationState` from the message payload.
  - Render `<EscalationPauseModal isVisible={escalationState !== null} {...escalationState} onResumeWithDirective={...} onSkip={...} onAbort={...} />`.
  - `onResumeWithDirective(directive)`: dispatch `RESUME_TASK` message `{ taskId: escalationState.taskId, directive }`, then set `escalationState = null`.
  - `onSkip()`: dispatch `SKIP_TASK` message `{ taskId: escalationState.taskId }`, then set `escalationState = null`.
  - `onAbort()`: dispatch `ABORT_PROJECT` message, then set `escalationState = null`.
- [ ] In `src/extension/webviewMessageHandler.ts`:
  - When `TaskRunner` emits `'escalation'`, build the payload (fetch task title + last 5 failure log entries from DB), then `webviewPanel.webview.postMessage({ command: 'TASK_ESCALATED', payload })`.
  - Handle `RESUME_TASK` message: call `taskRunner.resume(taskId)` with the `directive` injected into the task context.
  - Handle `SKIP_TASK` message: mark task as `SKIPPED` in DB and advance the queue.

## 3. Code Review
- [ ] Verify the modal is truly blocking – no click-away-to-close, no ESC key dismiss.
- [ ] Verify `onResumeWithDirective` is only callable when `directive.trim().length > 0`.
- [ ] Verify accessibility attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the modal title `id`.
- [ ] Verify the `TASK_ESCALATED` payload includes `taskTitle` (not just `taskId`) to give meaningful context to the user.
- [ ] Verify no business logic (DB reads, task state updates) is placed inside the React component.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="EscalationPauseModal|DashboardPanel.escalation"` and confirm all tests pass.
- [ ] Run `npm run lint` and `npm run typecheck` with zero errors.
- [ ] Run `npm run build:webview` and confirm successful compilation.

## 5. Update Documentation
- [ ] Create `src/webview/components/EscalationPauseModal.agent.md`:
  - Document props, the three user actions, and when the modal appears.
  - Document the `TASK_ESCALATED` / `RESUME_TASK` / `SKIP_TASK` / `ABORT_PROJECT` message protocol.
- [ ] Update `src/webview/README.md` to list `EscalationPauseModal` in the component inventory.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="EscalationPauseModal|DashboardPanel.escalation" --coverage` and confirm coverage ≥ 90% for `src/webview/components/EscalationPauseModal.tsx`.
- [ ] Run the E2E escalation scenario: `npx playwright test tests/e2e/escalation-modal.spec.ts` (or equivalent) that drives 5 mock failures and asserts the modal appears and the "Resume" flow completes successfully.
