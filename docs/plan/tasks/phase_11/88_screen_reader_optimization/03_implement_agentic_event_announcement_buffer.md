# Task: Implement Non-Visual Agentic Event Announcement Buffer (Sub-Epic: 88_Screen_Reader_Optimization)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-084-3]

## 1. Initial Test Written
- [ ] Create `packages/vscode/src/webview/hooks/useAgenticEventAnnouncer/useAgenticEventAnnouncer.test.ts` and write unit tests using `@testing-library/react-hooks` (or `renderHook` from `@testing-library/react` ≥ 13) that:
  - Assert that `useAgenticEventAnnouncer` returns `{ announcement: string, announce: (event: AgenticEvent) => void }`.
  - Assert that calling `announce({ type: 'TASK_FAILED', taskId: 'T-102', phase: 'Red' })` sets `announcement` to the human-readable string `"Task T-102 Failed at Red Phase"` within the same act() tick.
  - Assert that calling `announce({ type: 'TASK_SUCCEEDED', taskId: 'T-102', phase: 'Green' })` sets `announcement` to `"Task T-102 Succeeded at Green Phase"`.
  - Assert that calling `announce({ type: 'PHASE_STARTED', phaseId: '11', phaseName: 'Interface' })` sets `announcement` to `"Phase 11 Interface started"`.
  - Assert that `announcement` resets to `''` after a configurable `clearDelay` (default: 5000ms), simulated via `jest.useFakeTimers()` and `jest.advanceTimersByTime(5001)`.
  - Assert that a newly mounted `<AgenticEventAnnouncerPortal />` component renders a visually-hidden `<div aria-live="polite" aria-atomic="true">` in the document body (via React portal), NOT inline in the component tree, so it never disrupts focus order.
- [ ] Create `packages/vscode/src/webview/components/AgenticEventAnnouncerPortal/AgenticEventAnnouncerPortal.test.tsx` and assert:
  - The portal element is appended to `document.body` (not the Webview root).
  - The portal element carries `aria-live="polite"` `aria-atomic="true"` `id="agentic-event-announcer"`.
  - The portal is removed from the DOM when the component unmounts.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/hooks/useAgenticEventAnnouncer/useAgenticEventAnnouncer.ts`:
  - Define `AgenticEvent` discriminated union:
    ```typescript
    export type AgenticEvent =
      | { type: 'TASK_FAILED'; taskId: string; phase: string }
      | { type: 'TASK_SUCCEEDED'; taskId: string; phase: string }
      | { type: 'PHASE_STARTED'; phaseId: string; phaseName: string }
      | { type: 'PHASE_COMPLETED'; phaseId: string; phaseName: string }
      | { type: 'AGENT_LOOP_DETECTED'; agentId: string }
      | { type: 'REVIEW_REQUIRED'; taskId: string };
    ```
  - Implement `formatAgenticEvent(event: AgenticEvent): string` — a pure function that converts each event type to a concise, human-readable announcement string (e.g., `"Task T-102 Failed at Red Phase"`). This function must be separately unit-testable.
  - Implement `useAgenticEventAnnouncer(clearDelay = 5000)` React hook:
    - Maintains `announcement` state (string).
    - Exposes `announce(event: AgenticEvent)` function that calls `formatAgenticEvent` and sets `announcement`.
    - Sets a timeout to clear `announcement` to `''` after `clearDelay` ms.
    - Clears the timeout on unmount and on re-announcement to avoid stale resets.
- [ ] Create `packages/vscode/src/webview/components/AgenticEventAnnouncerPortal/AgenticEventAnnouncerPortal.tsx`:
  - Use `ReactDOM.createPortal` to render a `<div>` into `document.body`.
  - The portal `<div>` must have: `aria-live="polite"` `aria-atomic="true"` `id="agentic-event-announcer"` and the `.sr-only` CSS class.
  - Accept `announcement: string` as a prop and render it as the `<div>`'s text content.
  - On mount, create the portal target element and append it to `document.body`. On unmount, remove it.
- [ ] Mount `<AgenticEventAnnouncerPortal announcement={announcement} />` from the Webview root (`App.tsx`), wiring it to the `useAgenticEventAnnouncer` hook instance stored in the Zustand store or a React Context so all child components can call `announce()` without prop drilling.
- [ ] Connect the `announce()` function to the existing event bus (`postMessage` handler in the Webview) so that events of type `AgenticEvent` dispatched from the Extension Host automatically trigger announcements.

## 3. Code Review
- [ ] Verify `formatAgenticEvent` is a pure function with no side effects — it must be easily testable in isolation with zero React dependencies.
- [ ] Verify the portal is attached to `document.body` and not to any Webview Shadow DOM container, ensuring AT can access it regardless of Shadow DOM isolation boundaries.
- [ ] Confirm `AgenticEvent` types cover all Agentic Event types listed in the phase 11 spec (TASK_FAILED, TASK_SUCCEEDED, PHASE_STARTED, PHASE_COMPLETED, AGENT_LOOP_DETECTED, REVIEW_REQUIRED at minimum).
- [ ] Confirm the `clearDelay` timer is properly cleaned up on re-announce (old timeout cancelled, new timeout started) to prevent announcement text from being erased prematurely.
- [ ] Verify the portal's `<div>` does not receive keyboard focus or appear in the tab order.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="useAgenticEventAnnouncer|AgenticEventAnnouncerPortal"` and confirm all tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/vscode test:coverage -- --collectCoverageFrom="src/webview/hooks/useAgenticEventAnnouncer/**"` and confirm ≥ 95% line coverage for `formatAgenticEvent` and the hook.

## 5. Update Documentation
- [ ] Create `packages/vscode/src/webview/hooks/useAgenticEventAnnouncer/README.md` documenting: the hook API, the `AgenticEvent` union, `formatAgenticEvent` output strings for each event type, and the `clearDelay` parameter.
- [ ] Update `specs/accessibility.md` with entry: `[7_UI_UX_DESIGN-REQ-UI-DES-084-3] — AgenticEventAnnouncerPortal (React portal in document.body) with aria-live="polite" aria-atomic="true" announces all AgenticEvents without disrupting focus. Events cleared after 5000ms.`
- [ ] Add entry in `tasks/phase_11/DECISIONS.md`: "Agentic event announcer uses a React portal into document.body to escape Shadow DOM isolation and guarantee AT discoverability. The polite priority was chosen to avoid interrupting the user's active screen reader context."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="useAgenticEventAnnouncer|AgenticEventAnnouncerPortal" --verbose 2>&1 | grep -E "PASS|FAIL"` and assert output contains `PASS` and zero `FAIL` lines.
- [ ] Run `grep -rn 'id="agentic-event-announcer"' packages/vscode/src/webview/` and assert exactly one match exists.
- [ ] Run `node -e "const {formatAgenticEvent} = require('./packages/vscode/dist/webview/hooks/useAgenticEventAnnouncer'); console.assert(formatAgenticEvent({type:'TASK_FAILED',taskId:'T-102',phase:'Red'}) === 'Task T-102 Failed at Red Phase');"` and assert exit code 0.
