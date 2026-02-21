# Task: Implement SAOP Zustand Store Slice (Sub-Epic: 95_Requirement_SAOP_Models)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-093]

## 1. Initial Test Written
- [ ] In `packages/ui-hooks/src/__tests__/saop.store.test.ts`, write unit tests for the SAOP Zustand slice before implementing it:
  - **Initial state**: Assert that a freshly created store has `envelopes: []`, `agentMap: {}`, and `lastSequenceId: {}` (keyed by `agent_id`).
  - **`appendEnvelopes` action — single THOUGHT**: Dispatch `appendEnvelopes([thoughtEnvelope])`. Assert `envelopes` has length 1 and `lastSequenceId[agent_id]` equals the envelope's `sequence_id`.
  - **`appendEnvelopes` action — duplicate sequence_id**: Dispatch the same envelope twice. Assert `envelopes` still has length 1 (idempotent).
  - **`appendEnvelopes` action — ordering**: Dispatch envelopes with `sequence_id` values `[5, 3, 4]`. Assert the `envelopes` array is stored in ascending `sequence_id` order.
  - **`clearSession` action**: Populate the store, then dispatch `clearSession(session_id)`. Assert that only envelopes matching that `session_id` are removed.
  - **`selectThoughtsForAgent` selector**: Populate the store with mixed types. Assert the selector returns only `THOUGHT` envelopes for the given `agent_id`.
  - **`selectLastObservationForToolCall` selector**: Populate store with multiple `OBSERVATION` envelopes. Assert selector returns the one matching the given `tool_call_id`.
  - **Windowing**: Dispatch 600 envelopes for the same `agent_id`. Assert the store retains at most 500 envelopes per agent (oldest are evicted), per `[6_UI_UX_ARCH-REQ-046]`/`[6_UI_UX_ARCH-REQ-047]` log windowing rules.
- [ ] Write a test confirming the store is created via `create` from `zustand` (not a React context), verifiable by calling store actions outside of a React component.

## 2. Task Implementation
- [ ] Create `packages/ui-hooks/src/saop.store.ts` implementing a Zustand store slice:
  ```ts
  interface SaopState {
    envelopes: SaopEnvelope[];           // All envelopes, globally sorted by sequence_id
    lastSequenceId: Record<string, number>; // agent_id → last seen sequence_id
  }

  interface SaopActions {
    appendEnvelopes: (incoming: SaopEnvelope[]) => void;
    clearSession: (sessionId: string) => void;
  }

  export type SaopSlice = SaopState & SaopActions;
  ```
  - `appendEnvelopes`: Merges `incoming` into the existing `envelopes` array, deduplicating on `(agent_id, sequence_id)` composite key, then sorts ascending by `sequence_id`. After merge, for each `agent_id` in `incoming`, evict the oldest envelopes beyond the 500-envelope-per-agent window. Updates `lastSequenceId` for each `agent_id`.
  - `clearSession`: Filters out all envelopes where `envelope.session_id === sessionId` and resets relevant `lastSequenceId` entries.
- [ ] Create the following memoized selectors in `packages/ui-hooks/src/saop.selectors.ts`:
  - `selectEnvelopesForAgent(agentId: string): (state: SaopSlice) => SaopEnvelope[]`
  - `selectThoughtsForAgent(agentId: string): (state: SaopSlice) => SaopThought[]`
  - `selectActionsForAgent(agentId: string): (state: SaopSlice) => SaopAction[]`
  - `selectLastObservationForToolCall(toolCallId: string): (state: SaopSlice) => SaopObservation | undefined`
  - `selectIsAgentThinking(agentId: string): (state: SaopSlice) => boolean` — returns `true` if the last THOUGHT for this agent has `is_partial: true`.
  - Use `zustand/middleware` `subscribeWithSelector` to support efficient selective re-rendering.
- [ ] Integrate the SAOP slice into the global Zustand store in `packages/ui-hooks/src/store.ts` using the slice pattern (if a global store already exists) or create a standalone store. Export `useSaopStore` as the primary hook.
- [ ] Re-export `useSaopStore`, `SaopSlice`, and all selectors from `packages/ui-hooks/src/index.ts`.

## 3. Code Review
- [ ] Verify that `appendEnvelopes` is an O(n log n) operation (sort), not O(n²), even for large batches.
- [ ] Verify the 500-envelope-per-agent window is enforced in `appendEnvelopes`, not in the selector, to prevent unbounded memory growth.
- [ ] Verify selectors are pure functions with no side effects; they should not mutate state.
- [ ] Verify the composite deduplication key is `(agent_id, sequence_id)` and not just `sequence_id` alone (multiple agents can share sequence IDs).
- [ ] Confirm `clearSession` does not accidentally delete envelopes belonging to a different session.
- [ ] Verify the store file does not import any React-specific APIs (e.g., no `useState`, no JSX) — it must be usable in non-React contexts.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui-hooks test` and confirm all tests in `saop.store.test.ts` pass with zero failures.
- [ ] Run `pnpm --filter @devs/ui-hooks typecheck` and confirm zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/ui-hooks test --coverage` and confirm `saop.store.ts` and `saop.selectors.ts` each have ≥ 90% line coverage.

## 5. Update Documentation
- [ ] Add JSDoc to all exported selectors and actions, each referencing `[6_UI_UX_ARCH-REQ-093]`.
- [ ] Update `packages/ui-hooks/ui-hooks.agent.md` with: "SAOP state lives in the `SaopSlice` Zustand slice. 500-envelope-per-agent eviction window is enforced in `appendEnvelopes`. Selectors in `saop.selectors.ts`."
- [ ] Update `packages/ui-hooks/README.md` with a "SAOP Store" section documenting available selectors and the eviction policy.

## 6. Automated Verification
- [ ] Execute `pnpm --filter @devs/ui-hooks test --reporter=json > /tmp/saop_store_test_results.json` and verify exit code is `0`.
- [ ] Execute `cat /tmp/saop_store_test_results.json | jq '.numFailedTests'` and assert the value is `0`.
- [ ] Execute `pnpm --filter @devs/ui-hooks test --coverage --reporter=json > /tmp/saop_store_coverage.json` and assert line coverage for `saop.store.ts` is ≥ 90%.
