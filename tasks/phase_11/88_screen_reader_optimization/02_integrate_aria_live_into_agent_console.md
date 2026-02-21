# Task: Integrate Aria-Live Regions into Agent Console ThoughtStreamer (Sub-Epic: 88_Screen_Reader_Optimization)

## Covered Requirements
- [4_USER_FEATURES-REQ-045], [7_UI_UX_DESIGN-REQ-UI-DES-140]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/console/__tests__/ThoughtStreamer.a11y.test.tsx`, write the following tests:
  - Test that when a new agent thought is appended to the `ThoughtStreamer`, the `useAriaLive` hook is called with the thought's summary text and `priority: 'polite'` within one render cycle (mock `useAriaLive` and assert `announce` was called).
  - Test that when an "Assertive Intervention" event (e.g., `type: 'HITL_REQUIRED'` or `type: 'TASK_FAILED'`) is dispatched, `useAriaLive` is called with a human-readable summary string and `priority: 'assertive'`.
  - Test that the assertive announcement for a task failure formats correctly as `"Task [task_id] Failed at [phase] Phase"` (e.g., `"Task T-102 Failed at Red Phase"`).
  - Test that the assertive announcement for a completed task formats correctly as `"Task [task_id] Completed Successfully"`.
  - Test that agent thoughts longer than 120 characters are truncated to 120 characters with an ellipsis before being passed to `announce()` to prevent verbose screen reader interruptions.
  - Test that rapid bursts of ≥ 5 thought messages within 500ms result in only 1 `announce()` call for polite priority (verifying the debounce in `AriaLiveAnnouncer` is leveraged, not bypassed).
  - Test that when `ThoughtStreamer` is unmounted, no pending announcement timers fire (use `jest.useFakeTimers` and assert no `announce` calls after unmount).

## 2. Task Implementation

- [ ] In `packages/webview-ui/src/components/console/ThoughtStreamer.tsx`:
  - Import and call `useAriaLive()` at the top of the component.
  - Add a `useEffect` that watches the Zustand store slice for new thought entries (subscribe via selector `state => state.thoughts[taskId]`).
  - When a new thought entry is detected (compare previous length vs current length), extract the latest thought's text content. Truncate to 120 characters with `'…'` suffix if needed. Call `announce(truncatedText, 'polite')`.
  - Add a second `useEffect` watching for `AgentEvent` messages of type `TASK_FAILED`, `TASK_COMPLETED`, and `HITL_REQUIRED` from the Zustand event queue.
    - `TASK_FAILED`: call `announce(\`Task ${event.taskId} Failed at ${event.phase} Phase\`, 'assertive')`.
    - `TASK_COMPLETED`: call `announce(\`Task ${event.taskId} Completed Successfully\`, 'assertive')`.
    - `HITL_REQUIRED`: call `announce(\`Human input required: ${event.reason}\`, 'assertive')`.
  - Ensure no announcement is triggered during the initial mount/hydration of historical thoughts — only announce new thoughts arriving after mount. Use a `isInitialized` ref gated by a `useLayoutEffect` that sets it to `true` after the first render.

- [ ] In `packages/webview-ui/src/store/useProjectStore.ts` (or the relevant Zustand store file):
  - Confirm or add an `agentEvents` queue slice of type `AgentEvent[]` that buffers `TASK_FAILED`, `TASK_COMPLETED`, and `HITL_REQUIRED` events received via `postMessage` from the extension host.
  - Ensure events are consumed (dequeued) after being processed by `ThoughtStreamer` to avoid re-announcing on re-render.

- [ ] In `packages/webview-ui/src/types/agentEvents.ts` (create if absent):
  - Define `AgentEvent` discriminated union type:
    ```ts
    type AgentEvent =
      | { type: 'TASK_FAILED'; taskId: string; phase: string }
      | { type: 'TASK_COMPLETED'; taskId: string }
      | { type: 'HITL_REQUIRED'; reason: string };
    ```

## 3. Code Review

- [ ] Verify that announcement logic is isolated to a `useEffect` with proper dependency arrays to prevent stale closure bugs.
- [ ] Confirm that `isInitialized` ref pattern correctly suppresses announcements on mount for pre-loaded historical thoughts.
- [ ] Verify the 120-character truncation logic uses Unicode-aware slicing (e.g., `[...text].slice(0, 120).join('')`) to avoid splitting multi-byte characters.
- [ ] Confirm that `AgentEvent` types dispatched from the extension host match the type definitions in `agentEvents.ts` — no implicit `any`.
- [ ] Verify that the `useAriaLive` hook is not called conditionally (React rules of hooks compliance).
- [ ] Confirm the Zustand event queue is properly dequeued; no event should be announced more than once.
- [ ] Ensure there are no accessibility regressions: the `ThoughtStreamer` visual content is unchanged; only non-visual `aria-live` announcements are added.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ThoughtStreamer.a11y"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test` to confirm no regressions in existing `ThoughtStreamer` tests.

## 5. Update Documentation

- [ ] Update `packages/webview-ui/src/components/console/ThoughtStreamer.agent.md` (create if absent) to document:
  - The `aria-live` announcement behavior: polite for thoughts, assertive for task lifecycle events.
  - The 120-character truncation rule for thought text passed to announcer.
  - The `isInitialized` ref pattern that prevents historical thought announcements on mount.
  - The `AgentEvent` types that trigger assertive announcements and their message formats.
- [ ] Update `packages/webview-ui/src/types/agentEvents.ts` with a top-level JSDoc comment explaining the discriminated union and its role in the announcement pipeline.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="ThoughtStreamer"` and confirm the new announcement logic branches achieve ≥ 85% coverage.
- [ ] Run `pnpm --filter @devs/webview-ui build` to confirm zero TypeScript compilation errors.
- [ ] Verify the `.agent.md` file exists: `test -f packages/webview-ui/src/components/console/ThoughtStreamer.agent.md && echo "AOD OK"`.
