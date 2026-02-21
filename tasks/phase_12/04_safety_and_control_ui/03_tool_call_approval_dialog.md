# Task: Tool Call Approval Dialog UI (Sub-Epic: 04_Safety and Control UI)

## Covered Requirements
- [1_PRD-REQ-UI-007], [5_SECURITY_DESIGN-REQ-SEC-SD-071]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/safety/__tests__/ToolCallApprovalDialog.test.tsx`, write React Testing Library tests:
  - Test that `<ToolCallApprovalDialog />` does not render when no pending approval exists (`pendingApproval: null`).
  - Test that when a `pendingApproval` object is provided (with `callId`, `toolName`, `args`, `timestamp`), the dialog renders visibly with `role="dialog"` and `aria-modal="true"`.
  - Test that the dialog displays the tool name (e.g., "write_file") and a human-readable description of the args (e.g., a formatted JSON block for `{ path: "/project/src/foo.ts", content: "..." }`).
  - Test that clicking the "Approve" button fires the `onApprove(callId)` callback prop.
  - Test that clicking the "Deny" button fires the `onDeny(callId)` callback prop.
  - Test that pressing Escape key fires the `onDeny(callId)` callback.
  - Test that focus is trapped within the dialog while it is open (focus trap behavior).
  - Test that the dialog announces itself via `aria-live="assertive"` when it appears.
  - Test that a countdown timer (default 5 minutes) is shown, decrementing each second.
  - Test that when the countdown reaches 0, `onDeny(callId)` is called automatically.
- [ ] In `packages/webview-ui/src/store/__tests__/safetySlice.test.ts` (extend existing):
  - Test that `setPendingApproval(approval)` sets `state.safety.pendingApproval`.
  - Test that `clearPendingApproval()` sets `state.safety.pendingApproval` to `null`.
  - Test that `selectPendingApproval` selector returns the current pending approval.

## 2. Task Implementation
- [ ] Extend `packages/webview-ui/src/store/safetySlice.ts`:
  - Add to state: `pendingApproval: { callId: string; toolName: string; args: Record<string, unknown>; timestamp: number } | null`, initial: `null`.
  - Add actions: `setPendingApproval(approval)`, `clearPendingApproval()`.
  - Add selector: `selectPendingApproval`.
  - In the webview's EventBus listener (`packages/webview-ui/src/messaging/eventBusListener.ts`), on receiving `hitl:awaiting_approval` message from the extension host, dispatch `setPendingApproval(payload)`.
- [ ] Create `packages/webview-ui/src/components/safety/ToolCallApprovalDialog.tsx`:
  - Props: `pendingApproval: PendingApproval | null`, `onApprove: (callId: string) => void`, `onDeny: (callId: string) => void`, `timeoutSeconds?: number` (default: 300).
  - When `pendingApproval` is null, return `null`.
  - Render a modal overlay with `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby` IDs.
  - Title: "Safety Mode — Approval Required".
  - Body: show `toolName` with an icon, a `<pre>` block with syntax-highlighted JSON of `args` (use existing `<JsonHighlight />` primitive if available, else plain `<pre><code>`).
  - Show a countdown timer in `mm:ss` format (e.g., "4:59"), updating via `setInterval`.
  - "Approve" button: primary variant, calls `onApprove(pendingApproval.callId)` and dispatches `clearPendingApproval()`.
  - "Deny" button: destructive variant, calls `onDeny(pendingApproval.callId)` and dispatches `clearPendingApproval()`.
  - Implement focus trap using a `useFocusTrap` hook (create in `packages/webview-ui/src/hooks/useFocusTrap.ts` if not existing).
  - On mount, move focus to the "Deny" button (safer default).
  - On Escape key, call `onDeny`.
  - On countdown expiry, call `onDeny` automatically.
- [ ] Mount `<ToolCallApprovalDialog />` in the app root (`packages/webview-ui/src/App.tsx`), connected to Redux store and dispatching `postMessage({ type: "APPROVE_TOOL_CALL", payload: { callId } })` or `DENY_TOOL_CALL`.
- [ ] In the extension host message handler, handle `APPROVE_TOOL_CALL` → `orchestrator.safetyInterceptor.approve(callId)` and `DENY_TOOL_CALL` → `orchestrator.safetyInterceptor.deny(callId)`.

## 3. Code Review
- [ ] Verify the dialog is a true modal: background interaction is blocked (via overlay or `inert` attribute on siblings).
- [ ] Confirm the countdown `setInterval` is cleared on unmount to prevent memory leaks.
- [ ] Confirm `aria-live="assertive"` is placed in a persistent region in the DOM (not mounted conditionally) so screen readers announce the dialog appearance.
- [ ] Verify the auto-deny on timeout calls `clearPendingApproval()` to prevent stale state.
- [ ] Confirm no sensitive data (full file content) is shown raw — truncate `args` content fields to 500 characters with "… (truncated)" suffix.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ToolCallApprovalDialog|safetySlice"` and confirm 0 failures.
- [ ] Run `pnpm --filter @devs/webview-ui test:coverage` and confirm `ToolCallApprovalDialog.tsx` has ≥ 90% branch coverage.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/components/safety/ToolCallApprovalDialog.agent.md` documenting:
  - Dialog lifecycle: how it is triggered (EventBus → Redux → render).
  - The message contract: `APPROVE_TOOL_CALL` and `DENY_TOOL_CALL` with payloads.
  - Accessibility requirements (focus trap, aria roles, assertive live region).
  - Timeout behavior and rationale (5-minute default).

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ToolCallApprovalDialog" --json --outputFile=/tmp/approval_dialog_results.json` and confirm `"numFailedTests": 0`.
- [ ] Run `grep -rn "APPROVE_TOOL_CALL\|DENY_TOOL_CALL" packages/extension/src/messaging/messageHandler.ts` to confirm both message types are handled (exit code 0).
