# Task: Implement Internal State Change Exposure Feed for Full Transparency (Sub-Epic: 11_Document Approval and Requirement Linking)

## Covered Requirements
- [1_PRD-REQ-UI-018]

## 1. Initial Test Written
- [ ] In `packages/core/src/events/__tests__/stateExposureBus.test.ts`, write unit tests:
  - Test `StateExposureBus.emit(event: StateChangeEvent): void` places the event in the internal ring buffer (max 1000 entries).
  - Test `StateExposureBus.subscribe(handler: (event: StateChangeEvent) => void): Unsubscribe` delivers events to all registered handlers.
  - Test that `unsubscribe()` returned from `subscribe()` correctly stops delivery.
  - Test that emitting when no subscribers are registered does not throw.
  - Test that the ring buffer evicts the oldest event when capacity is exceeded.
  - Test `StateExposureBus.drain(): StateChangeEvent[]` returns all buffered events since last drain (useful for reconnect sync).
- [ ] In `packages/webview-ui/src/components/__tests__/StateExposureFeed.test.tsx`, write React Testing Library tests:
  - Render `<StateExposureFeed bus={mockBus} />` and assert it renders an empty state message when no events exist.
  - Emit a mock `StateChangeEvent` and assert a new list item appears with the event's `phase`, `agentId`, `description`, and ISO timestamp.
  - Emit 50 events rapidly and assert the feed displays the most recent 25 (virtualization cap).
  - Assert each event row has `role="listitem"` and `aria-label` including the event description.

## 2. Task Implementation
- [ ] Create `packages/core/src/events/stateExposureBus.ts`:
  - Export `interface StateChangeEvent { id: string; timestamp: number; phase: string; agentId: string; description: string; metadata?: Record<string, unknown> }`.
  - Export `class StateExposureBus` with a ring buffer (circular array, capacity 1000):
    - `emit(event: StateChangeEvent): void`
    - `subscribe(handler): Unsubscribe`
    - `drain(): StateChangeEvent[]`
  - Export singleton `stateExposureBus` instance for use by core agents.
- [ ] Instrument core orchestrator state transitions in `packages/core/src/orchestrator/stateManager.ts` to emit to `stateExposureBus` on every state change:
  - Include phase name, active agent ID, and a human-readable description of the transition.
- [ ] Create `packages/webview-ui/src/components/StateExposureFeed.tsx`:
  - Props: `bus: StateExposureBus`.
  - Subscribes to the bus via `useEffect`, appends events to local state (capped at 200, using `useRef` for the ring buffer to avoid re-renders on every character).
  - Renders a virtualized list using `react-window` `FixedSizeList` showing the 200 most recent events.
  - Each row: timestamp (relative, e.g., "2s ago"), phase badge, agent ID, description text.
  - Includes an "Auto-scroll to latest" toggle button.
- [ ] Wire `StateExposureFeed` into the main dashboard layout in `packages/webview-ui/src/App.tsx` as a collapsible drawer at the bottom of the screen.

## 3. Code Review
- [ ] Confirm `StateExposureBus` has no dependency on React or DOM APIs — it must be usable in Node.js core agents.
- [ ] Verify the ring buffer uses a fixed-size array and pointer arithmetic, not `Array.shift()`, to maintain O(1) insert/evict.
- [ ] Ensure the webview subscription is cleaned up in `useEffect` return to prevent memory leaks.
- [ ] Confirm `StateExposureFeed` does not cause unnecessary re-renders — event batching should use `unstable_batchedUpdates` or React 18 automatic batching.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="stateExposureBus"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="StateExposureFeed"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core run typecheck && pnpm --filter @devs/webview-ui run typecheck` to confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add section "State Exposure Bus" to `packages/core/AGENT.md` describing: the `StateChangeEvent` schema, ring buffer capacity, the `drain()` reconnect pattern, and which orchestrator transitions must emit events.
- [ ] Add section "State Exposure Feed" to `packages/webview-ui/AGENT.md` describing the virtualized list approach and the auto-scroll toggle behavior.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --coverage -- --testPathPattern="stateExposureBus"` and assert line coverage ≥ 95% for `stateExposureBus.ts`.
- [ ] Run the integration test `pnpm test:integration -- --grep "state exposure transparency"` which starts the core orchestrator in a sandbox, performs a state transition, and asserts the `StateExposureFeed` in the webview receives and displays the event within 500ms. Confirm test exits code 0.
