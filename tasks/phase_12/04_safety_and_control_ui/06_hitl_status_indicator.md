# Task: HITL Awaiting Approval Status Indicator (Sub-Epic: 04_Safety and Control UI)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-071]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/safety/__tests__/HitlStatusBanner.test.tsx`, write React Testing Library tests:
  - Test that `<HitlStatusBanner />` renders nothing when `pendingApproval` is `null`.
  - Test that when `pendingApproval` is set, a banner renders with `role="status"`, `aria-live="assertive"`, and the text "Agent is paused — waiting for your approval".
  - Test that the banner displays the `toolName` from `pendingApproval` (e.g., "Waiting on: write_file").
  - Test that the banner includes a direct link/button "Review →" that scrolls or focuses the `<ToolCallApprovalDialog />`.
  - Test that a pulsing visual indicator (CSS class `hitl-pulse`) is applied to the banner when `pendingApproval` is set.
  - Test that the banner disappears (renders null) after `pendingApproval` is cleared.
- [ ] In `packages/core/src/safety/__tests__/HitlEventEmitter.test.ts`, write unit tests:
  - Test that when `SafetyInterceptor.intercept()` blocks a call, the `hitl:awaiting_approval` event is emitted on the `EventBus` within 50ms of the call being intercepted.
  - Test that the event payload contains all required fields: `callId` (UUID v4 format), `toolName` (string), `args` (object), `timestamp` (unix ms, within 1 second of `Date.now()`).
  - Test that the `hitl:approved` event is emitted within 50ms of `approve(callId)` being called.
  - Test that the `hitl:denied` event is emitted within 50ms of `deny(callId)` being called.

## 2. Task Implementation
- [ ] Create `packages/webview-ui/src/components/safety/HitlStatusBanner.tsx`:
  - Props: `pendingApproval: PendingApproval | null`, `onReviewClick: () => void`.
  - When `pendingApproval` is null, return `null`.
  - Render a fixed-position banner (top of viewport, below the `<ControlBar />`) with `role="status"` and `aria-live="assertive"`.
  - Content: warning icon + "Agent is paused — waiting for your approval" + "Waiting on: {toolName}" + a "Review →" button that calls `onReviewClick`.
  - Apply a CSS keyframe animation class `hitl-pulse` (an attention-getting glow/border pulse using CSS custom properties from the design token set).
  - Define the `hitl-pulse` animation in `packages/webview-ui/src/styles/animations.css` (or equivalent global stylesheet).
- [ ] Mount `<HitlStatusBanner />` in `packages/webview-ui/src/App.tsx`, connected to `selectPendingApproval` from the Redux store. The `onReviewClick` handler should focus the Approve button in `<ToolCallApprovalDialog />` via a `useRef` forwarded ref.
- [ ] In the extension host's event bridge (`packages/extension/src/messaging/EventBridge.ts`), ensure `hitl:awaiting_approval`, `hitl:approved`, and `hitl:denied` events from the core `EventBus` are forwarded to the webview via `panel.webview.postMessage()`:
  - Message type: `"HITL_EVENT"`, payload: `{ eventName: "hitl:awaiting_approval" | "hitl:approved" | "hitl:denied", data: { callId, toolName?, args?, timestamp } }`.
- [ ] In the webview's EventBus listener (`packages/webview-ui/src/messaging/eventBusListener.ts`), handle `HITL_EVENT`:
  - On `hitl:awaiting_approval`: dispatch `setPendingApproval(data)`.
  - On `hitl:approved` or `hitl:denied`: dispatch `clearPendingApproval()`.

## 3. Code Review
- [ ] Confirm the `hitl-pulse` animation does not exceed 5 animation iterations (after 5 pulses, the animation settles to a steady warning state to avoid distraction — per animation guardrails in phase requirements).
- [ ] Verify the `aria-live="assertive"` region is persistent in the DOM (rendered at app root even when `pendingApproval` is null, with empty content) — do NOT conditionally mount the live region, only conditionally show content inside it, to ensure screen reader announcements work reliably.
- [ ] Confirm the `EventBridge` uses a debounce or queue to prevent flooding the webview with duplicate `HITL_EVENT` messages if the EventBus emits rapidly.
- [ ] Verify that the `callId` forwarded in the HITL event is a valid UUID v4 string — add a runtime assertion in `SafetyInterceptor`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="HitlStatusBanner"` and confirm 0 failures.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="HitlEventEmitter"` and confirm 0 failures.

## 5. Update Documentation
- [ ] Create `packages/webview-ui/src/components/safety/HitlStatusBanner.agent.md` documenting:
  - The component's role in the HITL approval flow.
  - Why `aria-live="assertive"` is used and how the persistent empty region pattern works.
  - The `hitl-pulse` animation specification and guardrails.
- [ ] Update `packages/core/src/safety/SafetyInterceptor.agent.md` to add the event payload contract for `hitl:awaiting_approval` (extends the document created in task 01).
- [ ] Update `packages/extension/src/messaging/EventBridge.agent.md` (or create it) documenting which core EventBus events are forwarded to the webview and their transformed message shapes.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="HitlStatusBanner" --json --outputFile=/tmp/hitl_banner_results.json` and confirm `"numFailedTests": 0`.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="HitlEventEmitter" --json --outputFile=/tmp/hitl_emitter_results.json` and confirm `"numFailedTests": 0`.
- [ ] Run `grep -rn "hitl:awaiting_approval" packages/extension/src/messaging/EventBridge.ts` to confirm the event is forwarded (exit code 0).
