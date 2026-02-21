# Task: Implement `EventBus` for Cross-Process State Sync (Sub-Epic: 08_CLI Integration & State Control)

## Covered Requirements
- [2_TAS-REQ-018], [1_PRD-REQ-INT-004], [9_ROADMAP-REQ-037]

## 1. Initial Test Written
- [ ] Write unit tests in `packages/core/tests/eventbus.spec.ts` using `node:events` and a shared signaling mechanism (e.g., file-based watching or a local socket) to verify:
    - Running two processes that can both `emit` and `on` custom events.
    - Verifying that an event emitted in one process is received by the other.
    - Verifying that events are correctly typed according to the event schema.
    - Testing 0ms latency for event transmission (within IPC limits).

## 2. Task Implementation
- [ ] Implement the `EventBus` in `@devs/core/events`.
- [ ] Use a local IPC mechanism (e.g., `Unix Domain Sockets` or `Named Pipes`) to support cross-process signaling between CLI and VSCode.
- [ ] Define the event schema:
    - `STATE_CHANGE`: Emitted when the SQLite state is updated.
    - `PAUSE`/`RESUME`: Emitted when control commands are issued.
    - `LOG_STREAM`: Emitted during active orchestration turns.
- [ ] Create a `SharedEventBus` that abstracts the IPC and allows simple `subscribe(topic, callback)` and `publish(topic, payload)` interfaces.
- [ ] Ensure that the `EventBus` handles connection timeouts and reconnections gracefully.

## 3. Code Review
- [ ] Verify that the `EventBus` does not introduce significant overhead or block the main thread.
- [ ] Check for proper resource cleanup (e.g., closing sockets on process exit).
- [ ] Ensure that all events are strictly typed in TypeScript.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/core` and ensure `EventBus` tests pass.

## 5. Update Documentation
- [ ] Document the `EventBus` architecture and the IPC protocol used.
- [ ] Add the event schema to the technical documentation for future extension developers.

## 6. Automated Verification
- [ ] Run a test script that spawns two processes, verifies event delivery, and measures latency.
- [ ] Verify that the IPC socket file is created and cleaned up in the `.devs` folder.
