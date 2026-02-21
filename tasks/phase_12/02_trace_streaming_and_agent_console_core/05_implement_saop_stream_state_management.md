# Task: Implement SAOP Stream State Management in Webview (Sub-Epic: 02_Trace Streaming and Agent Console Core)

## Covered Requirements
- [1_PRD-REQ-INT-009], [9_ROADMAP-TAS-703]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/store/__tests__/saop-stream-store.test.ts`, write unit tests for the Zustand store (or Redux slice) that manages SAOP stream state:
  - Test that the initial state has `thoughts: []`, `actions: []`, `observations: []`, and `connectionStatus: "disconnected"`.
  - Test that dispatching `appendThought(envelope: ThoughtEnvelope)` adds the envelope to the `thoughts` array and keeps the array sorted by `sequenceNumber` ascending.
  - Test that dispatching `appendThought` with a duplicate `sequenceNumber` (already present in state) is a no-op (idempotent).
  - Test that dispatching `appendAction(envelope: ActionEnvelope)` adds to `actions` array.
  - Test that dispatching `appendObservation(envelope: ObservationEnvelope)` adds to `observations` array.
  - Test that dispatching `clearSession()` resets all three arrays to `[]`.
  - Test that `connectionStatus` transitions correctly: `"disconnected"` → `"connecting"` → `"connected"` → `"disconnected"` via `setConnectionStatus(status)` action.
  - Test that when `thoughts.length` exceeds a configurable `maxThoughts` (default 1000), the oldest entries are evicted from the front of the array (sliding window), so the store never holds more than `maxThoughts` entries.

## 2. Task Implementation

- [ ] Install `zustand` as a dependency of `packages/webview-ui` if not already present.
- [ ] Create `packages/webview-ui/src/store/saop-stream-store.ts`.
- [ ] Import `ThoughtEnvelope`, `ActionEnvelope`, `ObservationEnvelope` from `@devs/core`.
- [ ] Define the store state interface:
  ```ts
  interface SaopStreamState {
    thoughts: ThoughtEnvelope[];
    actions: ActionEnvelope[];
    observations: ObservationEnvelope[];
    connectionStatus: "disconnected" | "connecting" | "connected";
    maxThoughts: number;
  }
  ```
- [ ] Implement Zustand store with `create<SaopStreamState & SaopStreamActions>()(...)` including actions:
  - `appendThought(envelope: ThoughtEnvelope): void`:
    - If `thoughts.some(t => t.sequenceNumber === envelope.sequenceNumber)`, return early.
    - Otherwise, append and sort by `sequenceNumber`.
    - If `thoughts.length > maxThoughts`, splice from the front: `thoughts.splice(0, thoughts.length - maxThoughts)`.
  - `appendAction(envelope: ActionEnvelope): void`: Append to `actions`.
  - `appendObservation(envelope: ObservationEnvelope): void`: Append to `observations`.
  - `clearSession(): void`: Reset all arrays to `[]`.
  - `setConnectionStatus(status: "disconnected" | "connecting" | "connected"): void`: Update `connectionStatus`.
- [ ] Create `packages/webview-ui/src/store/index.ts` exporting `useSaopStreamStore`.
- [ ] In `packages/webview-ui/src/App.tsx` (or equivalent root component), wire the store:
  - Listen to `window.addEventListener("message", handler)` for `postMessage` events from the VSCode Extension host.
  - On message `{ type: "saop:thought", envelope: ThoughtEnvelope }`: call `useSaopStreamStore.getState().appendThought(envelope)`.
  - On message `{ type: "saop:action", envelope: ActionEnvelope }`: call `appendAction`.
  - On message `{ type: "saop:observation", envelope: ObservationEnvelope }`: call `appendObservation`.
  - On message `{ type: "saop:status", status: string }`: call `setConnectionStatus`.
  - On message `{ type: "saop:clear" }`: call `clearSession`.

## 3. Code Review

- [ ] Verify the sliding window eviction uses `splice(0, count)` inside the Zustand `set()` callback to maintain Zustand's immutability contract (produce a new array reference).
- [ ] Confirm that `appendThought`'s sort is performed only when a new item is actually inserted, not on every call.
- [ ] Verify the `postMessage` listener is removed in a `useEffect` cleanup function to prevent memory leaks on Webview unmount.
- [ ] Confirm the store does not use `immer` middleware (to avoid unnecessary dependency) — use the spread/slice pattern for immutable updates.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test --workspace=packages/webview-ui -- --testPathPattern=saop-stream-store` and confirm all tests pass.
- [ ] Run `npm run typecheck --workspace=packages/webview-ui` and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/store/saop-stream-store.agent.md` documenting:
  - The store's state shape and each action's behavior.
  - The sliding window eviction strategy for `thoughts` (max 1000 entries).
  - The `postMessage` protocol used to feed data from the VSCode Extension host into the Webview store.
  - The `connectionStatus` state machine and valid transitions.

## 6. Automated Verification

- [ ] Run `npm test --workspace=packages/webview-ui -- --testPathPattern=saop-stream-store --coverage` and confirm `saop-stream-store.ts` has ≥ 90% line coverage.
- [ ] Run `npm run build --workspace=packages/webview-ui` and confirm the Webview bundle builds without errors.
