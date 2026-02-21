# Task: Implement State Synchronization and Zero-Desync Guarantee Between CLI TUI and VSCode UI (Sub-Epic: 01_Real-time Event Bus Infrastructure)

## Covered Requirements
- [9_ROADMAP-REQ-037], [TAS-038], [1_PRD-REQ-MAP-005]

## 1. Initial Test Written
- [ ] Create `packages/core/src/transport/__tests__/state-sync.test.ts`.
- [ ] Write an integration test that:
  1. Instantiates both a `WsBridge` (simulating the CLI TUI consumer) and a `PostMessageBridge` mock (simulating the VSCode webview consumer).
  2. Publishes a sequence of 20 `STATE_TRANSITION` events to `EventBus` with monotonically increasing `checkpointId` values.
  3. Asserts that both consumers receive all 20 events and that the received `checkpointId` sequence is strictly monotonically increasing (no gaps, no duplicates, no reordering).
- [ ] Write a test verifying the `StateSyncManager.getLastCheckpointId(): string` returns the `checkpointId` of the most recently published `STATE_TRANSITION` event — so newly connected clients can request a replay from a given checkpoint.
- [ ] Write a test verifying `StateSyncManager.getEventsSince(checkpointId: string): DevsEvent[]` returns all events published after (exclusive) the given checkpoint, limited to the last 500 events (the rolling buffer size).
- [ ] Write a test simulating a "reconnect" scenario: a WS client connects, receives 5 events, disconnects, 10 more events are published, the client reconnects and sends `{ type: 'SYNC_REQUEST', sinceCheckpointId: 'cp-005' }` — assert the bridge responds with a `SYNC_REPLAY` message containing exactly events cp-006 through cp-015.
- [ ] Write a test verifying that when two simultaneous connections exist (CLI TUI + VSCode Sidebar), both receive the `STATE_TRANSITION` event within a 5ms window of each other (measured by timestamps recorded in the test).
- [ ] All tests must use `vitest` with real async timers (not fake timers, since we're testing actual latency properties).

## 2. Task Implementation
- [ ] Create `packages/core/src/transport/state-sync-manager.ts`:
  - Export `StateSyncManager` as a singleton (same pattern as `EventBus`).
  - Internal rolling buffer: a fixed-size circular array of `DevsEvent[]` with a max capacity of 500 events. Implemented as a class `RollingEventBuffer` with `push(event)`, `getSince(checkpointId: string): DevsEvent[]`, and `getLast(): DevsEvent | null` methods.
  - Subscribe to `EventBus` for `STATE_TRANSITION` events: on each event, push to the rolling buffer and update `lastCheckpointId`.
  - Also subscribe to ALL events to push them into the rolling buffer (for full replay support).
  - Method `getLastCheckpointId(): string | null`.
  - Method `getEventsSince(checkpointId: string): DevsEvent[]` — queries the rolling buffer.
  - Method `clear(): void` — resets buffer (for tests).
- [ ] Update `WsBridge` to handle a special incoming WebSocket message type `{ type: 'SYNC_REQUEST', sinceCheckpointId: string }`:
  - On receiving this message from an authenticated client, call `StateSyncManager.getInstance().getEventsSince(sinceCheckpointId)`.
  - Send the result back to that specific client as `{ type: 'SYNC_REPLAY', events: DevsEvent[] }`.
- [ ] Add `checkpointId` generation to `EventBus.publish()`: before dispatching, if the event does not already have a `checkpointId`, generate one using `crypto.randomUUID()` and assign it. This ensures every event is globally identifiable.
- [ ] Create `packages/core/src/transport/state-sync-manager.ts` and export from `packages/core/src/transport/index.ts`.
- [ ] Update `packages/core/src/index.ts` to include `StateSyncManager`.

## 3. Code Review
- [ ] Verify `RollingEventBuffer` does not grow unboundedly — once capacity (500) is reached, the oldest events are evicted (FIFO). Check for off-by-one errors in the circular buffer implementation.
- [ ] Verify `getEventsSince` uses strict ordering (not timestamp-based, which can collide) — prefer sequence number or checkpoint UUID lexicographic ordering if UUIDs are v4 (note: UUID v4 is NOT lexicographically ordered by time; consider using `crypto.randomUUID()` v4 but maintaining a separate monotonic sequence number as the sort key).
- [ ] Verify the `SYNC_REQUEST` handler only sends replay data to the requesting client, not to all connected clients.
- [ ] Verify that adding a `checkpointId` in `EventBus.publish()` does not mutate the caller's original event object — create a new object copy.
- [ ] Verify `StateSyncManager.clear()` also resets `lastCheckpointId` to `null` (important for test isolation).
- [ ] Confirm the 5ms simultaneous delivery guarantee: verify that `broadcastToClients` in `WsBridge` iterates synchronously and does not introduce artificial delays between client sends.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test src/transport/__tests__/state-sync.test.ts` and confirm all tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/core test --coverage` and verify line coverage for `src/transport/state-sync-manager.ts` is ≥ 90%.
- [ ] Run the full transport test suite: `pnpm --filter @devs/core test src/transport/` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a section `## State Synchronization` to `packages/core/README.md` documenting: `StateSyncManager` singleton, rolling buffer (500 events), `SYNC_REQUEST`/`SYNC_REPLAY` protocol, and the `checkpointId` guarantee.
- [ ] Update `docs/architecture/event-bus.md` with a Mermaid sequence diagram showing the reconnect/replay flow: `Client → WsBridge: SYNC_REQUEST{sinceCheckpointId} → StateSyncManager.getEventsSince() → WsBridge → Client: SYNC_REPLAY{events}`.
- [ ] Update `docs/architecture/event-bus.md` to note the 0ms desync target from [9_ROADMAP-REQ-037] and how synchronous fan-out in `broadcastToClients` achieves it within a single Node.js event loop tick.
- [ ] Append to `docs/agent-memory/decisions.md`: "Phase 12 / Task 06 — `StateSyncManager` provides a 500-event rolling buffer and `SYNC_REQUEST`/`SYNC_REPLAY` protocol over WebSocket to support zero-desync reconnects. All events receive a `checkpointId` (UUID) injected by `EventBus.publish()`. Synchronous fan-out in `WsBridge` ensures all clients receive events in the same event loop tick, meeting the 0ms desync target from [9_ROADMAP-REQ-037]."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --reporter=json --outputFile=test-results/state-sync.json` and assert the JSON contains `"numFailedTests": 0`.
- [ ] Run the end-to-end sync verification script `scripts/e2e/state-sync-e2e.ts` (create it):
  1. Start a `WsBridge`.
  2. Connect two WebSocket clients (simulating CLI TUI and VSCode).
  3. Publish 50 `STATE_TRANSITION` events.
  4. Assert both clients received all 50 events with identical ordering and no duplicates.
  5. Disconnect client 2, publish 10 more events, reconnect client 2 with `SYNC_REQUEST`.
  6. Assert client 2 receives exactly 10 replay events.
  7. Print "STATE SYNC E2E: PASS" on success; exit 1 on any assertion failure.
