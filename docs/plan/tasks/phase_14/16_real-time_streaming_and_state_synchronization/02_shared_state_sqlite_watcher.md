# Task: Implement Shared-State SQLite Watcher for CLI/VSCode Sync (Sub-Epic: 16_Real-Time Streaming and State Synchronization)

## Covered Requirements
- [9_ROADMAP-REQ-037]

## 1. Initial Test Written
- [ ] Create `src/__tests__/stateSyncWatcher.test.ts`.
- [ ] Write a unit test that instantiates two `StateSyncWatcher` instances pointing at the same in-memory (or temp-dir) `.devs/state.db` SQLite file, simulates a write via one instance, and asserts the other instance fires its `onChange` callback within 50ms.
- [ ] Write a test that verifies the `StateSyncWatcher` debounces rapid consecutive writes (10 writes in <5ms) into a single `onChange` notification rather than 10, to prevent update storms.
- [ ] Write an integration test that starts the CLI TUI subscriber and the VSCode extension subscriber simultaneously (using `worker_threads` to simulate two processes), performs a state mutation, and asserts both subscribers receive the same serialized state snapshot within one polling interval.
- [ ] Write a test that confirms the watcher gracefully handles a locked SQLite file (SQLITE_BUSY) without throwing an unhandled exception, retrying up to 3 times with exponential backoff.
- [ ] Write a test verifying that when a watcher is `dispose()`d, no further `onChange` callbacks are fired after disposal, even if the underlying file changes.

## 2. Task Implementation
- [ ] Create `src/state/stateSyncWatcher.ts` implementing a `StateSyncWatcher` class that:
  - Accepts `dbPath: string` and `onChange: (snapshot: StateSnapshot) => void` in its constructor.
  - Uses Node.js `fs.watch()` on the `.devs/` directory with `{ persistent: false }` to receive OS-level file change events for `state.db`.
  - On a change event, debounces with a 30ms timer, then opens a read-only SQLite connection via `better-sqlite3` (or the project's existing SQLite adapter) to read the current `agent_state` table snapshot.
  - Serializes the snapshot to `StateSnapshot` (defined in `src/types/stateSnapshot.ts`) and calls `onChange(snapshot)`.
  - Implements `dispose()`: clears the debounce timer, closes the SQLite read connection, and calls `fsWatcher.close()`.
- [ ] Define `StateSnapshot` in `src/types/stateSnapshot.ts`: `{ taskId: string; phase: string; status: string; updatedAt: number; checksum: string }` where `checksum` is a SHA-256 hash of the serialized state row.
- [ ] In `src/extension/stateSync.ts`, instantiate `StateSyncWatcher` when the VSCode extension activates (in `activate()`), passing a callback that dispatches a `{ type: 'stateUpdate', snapshot }` message to the active Webview panel.
- [ ] In `src/cli/stateSyncSubscriber.ts`, instantiate `StateSyncWatcher` for the CLI TUI, passing a callback that calls the existing `TUIRenderer.updateState(snapshot)` method to refresh the TUI display.
- [ ] Implement SQLITE_BUSY retry logic: wrap the read operation in a helper `retryOnBusy(fn, maxRetries=3, baseDelayMs=10)` that catches `SQLITE_BUSY` and retries with exponential backoff (10ms, 20ms, 40ms).
- [ ] Add `# [9_ROADMAP-REQ-037]` comment to the `StateSyncWatcher` class definition.

## 3. Code Review
- [ ] Verify that `fs.watch()` is initialized with `{ persistent: false }` so it does not prevent Node.js process exit.
- [ ] Confirm the debounce timer is always cleared in `dispose()` even if it hasn't fired, preventing post-dispose callbacks.
- [ ] Verify SQLite connections opened for reads are opened in read-only mode (`{ readonly: true }` for `better-sqlite3`) to avoid write conflicts.
- [ ] Confirm `StateSnapshot.checksum` is computed after serialization (not before) so it covers all fields.
- [ ] Verify that the `retryOnBusy` helper uses `await sleep()` (not a synchronous busy-wait) to avoid blocking the event loop.
- [ ] Check that no raw SQLite connection objects are leaked (all opened in try/finally with `.close()` in the finally block).
- [ ] Confirm TypeScript strict-mode compliance throughout.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=stateSyncWatcher` and confirm all tests pass.
- [ ] Run the integration test with simulated dual-process watchers and confirm both receive identical `StateSnapshot` objects (deep equality assertion).
- [ ] Run `npm run lint` on modified files and confirm zero violations.
- [ ] Run `npm run build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add `docs/architecture/state-sync.md` documenting the `StateSyncWatcher` design: OS file-watch trigger, 30ms debounce, read-only SQLite snapshot pattern, and the rationale for using `fs.watch` over polling.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "REQ-037: State synchronization uses OS-level `fs.watch` + 30ms debounce on `state.db` to achieve near-zero desync between CLI TUI and VSCode UI."
- [ ] Document the `retryOnBusy` helper in `docs/architecture/state-sync.md` with the retry schedule and the rationale for exponential backoff.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=stateSyncWatcher --coverage` and assert coverage for `src/state/stateSyncWatcher.ts` is ≥ 90%.
- [ ] Execute `node scripts/validate-all.js` and confirm exit code 0.
- [ ] In the integration test output, assert that the time delta between the write event and the second watcher's `onChange` callback is ≤ 50ms (logged to stdout and asserted in the test runner).
