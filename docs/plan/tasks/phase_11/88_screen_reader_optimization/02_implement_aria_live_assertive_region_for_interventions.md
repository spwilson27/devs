# Task: Implement aria-live Assertive Region for HITL Interventions and Critical Alerts (Sub-Epic: 88_Screen_Reader_Optimization)

## Covered Requirements
- [4_USER_FEATURES-REQ-045]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/AgentConsole/AgentConsole.test.tsx`, add unit tests using `@testing-library/react` that:
  - Assert a DOM element with `aria-live="assertive"` and `role="alert"` and `aria-atomic="true"` exists when the component renders.
  - Assert that when an intervention event is dispatched (e.g., `{ type: 'HITL_REQUIRED', message: 'Human review required for Task T-007' }`), the content of the `aria-live="assertive"` region updates immediately (within the same `act()` tick, no debounce).
  - Assert that when the intervention is dismissed (event `{ type: 'HITL_DISMISSED' }`), the `aria-live="assertive"` region is cleared (empty string content), preventing stale announcements.
  - Assert the assertive region is visually hidden via the `.sr-only` CSS class pattern and does not occupy layout space.
  - Assert the polite region (from `ThoughtStreamer`, task 01) is NOT used for intervention messages — only the assertive region fires.
- [ ] In `packages/vscode/src/webview/components/AgentConsole/AgentConsole.test.tsx`, add a test that confirms a sandbox breach alert (`{ type: 'SANDBOX_BREACH', message: 'Scope boundary violated' }`) also populates the assertive region and NOT the polite region.

## 2. Task Implementation
- [ ] In `packages/vscode/src/webview/components/AgentConsole/AgentConsole.tsx`:
  - Add a visually-hidden `<div>` with `aria-live="assertive"` `aria-atomic="true"` `role="alert"` `aria-label="Agent Intervention Alert"`. Apply the `.sr-only` CSS class.
  - Subscribe to the Zustand global store (or the `postMessage` event bus from the extension host) for events of types: `HITL_REQUIRED`, `HITL_DISMISSED`, `SANDBOX_BREACH`, and any other intervention-class events defined in `packages/core/src/events/event-types.ts` under the `InterventionEvent` union type.
  - When an `InterventionEvent` arrives, set local state `alertMessage` to the human-readable `event.message` string. Render `{alertMessage}` inside the assertive `<div>`. Do NOT debounce — interventions must be announced immediately.
  - When `HITL_DISMISSED` or equivalent clear event fires, reset `alertMessage` to `''`. Briefly (100ms) set it to a non-empty string like `' '` first if needed to force AT re-announcement on re-trigger (reset trick).
  - Ensure `InterventionEvent` type is imported from `@devs/core` and is properly typed — do not use `any`.
- [ ] Define `InterventionEvent` in `packages/core/src/events/event-types.ts` if it does not exist:
  ```typescript
  export type InterventionEvent =
    | { type: 'HITL_REQUIRED'; message: string; taskId?: string }
    | { type: 'HITL_DISMISSED' }
    | { type: 'SANDBOX_BREACH'; message: string };
  ```

## 3. Code Review
- [ ] Verify `aria-live="assertive"` is only on the intervention region — no other element in the component tree must carry `assertive`, as multiple assertive regions cause unpredictable AT behavior.
- [ ] Confirm `aria-atomic="true"` is set so the entire alert message (not partial text nodes) is read when updated.
- [ ] Confirm the component correctly distinguishes between intervention-class events (→ assertive) and thought-class events (→ polite in ThoughtStreamer) with no cross-contamination.
- [ ] Confirm event subscriptions are cleaned up on component unmount (no memory leaks or dangling listeners).
- [ ] Verify that `InterventionEvent` types are exhaustive — add a compile-time check or ESLint rule `@typescript-eslint/switch-exhaustiveness-check` for the event handler switch/if block.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=AgentConsole` and confirm all new and existing tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/core build` to ensure the `InterventionEvent` type compiles without errors.

## 5. Update Documentation
- [ ] Update `packages/vscode/src/webview/components/AgentConsole/README.md` (create if absent) with a section "Accessibility: Intervention Alerts" describing the assertive aria-live region and the event types it responds to.
- [ ] Update `specs/accessibility.md` with an entry: `[4_USER_FEATURES-REQ-045] — AgentConsole uses aria-live="assertive" with aria-atomic="true" for HITL_REQUIRED, SANDBOX_BREACH interventions. No debounce — immediate announcement.`
- [ ] Add an entry in `tasks/phase_11/DECISIONS.md`: "Assertive aria-live region is isolated to AgentConsole for intervention events only. ThoughtStreamer owns the polite region. Cross-contamination of event types is prohibited."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=AgentConsole --verbose 2>&1 | grep -E "PASS|FAIL"` and assert output contains `PASS` with zero `FAIL` lines.
- [ ] Run `grep -rn 'aria-live="assertive"' packages/vscode/src/webview/` and assert exactly one match is found (enforcing the single-assertive-region rule).
- [ ] Run `pnpm --filter @devs/core tsc --noEmit` and assert exit code 0, confirming `InterventionEvent` type is valid.
