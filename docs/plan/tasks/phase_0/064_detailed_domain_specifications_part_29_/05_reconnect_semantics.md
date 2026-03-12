# Task: Implement StreamRunEvents reconnect semantics (Sub-Epic: 064_Detailed Domain Specifications (Part 29))

## Covered Requirements
- [2_TAS-REQ-288]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-grpc, devs-core]

## 1. Initial Test Written
- [ ] Create a test in `devs-grpc` (or a server integration test) that simulates a client connecting to `StreamRunEvents`, receiving an initial snapshot, and then disconnecting.
- [ ] The test then simulates a reconnect and verifies that the client again receives a full state snapshot (initial message) that allows it to synchronize without knowing about any missed intermediate events.

## 2. Task Implementation
- [ ] Implement the `StreamRunEvents` method in the `WorkflowService` so that the first message sent on any new stream is a full snapshot of the current state for the requested run.
- [ ] Ensure that subsequent messages on that same stream are delta updates (events).
- [ ] Implement client-side logic in the TUI/CLI to handle a stream reconnect by discarding any previous partial state and rebuilding from the new snapshot.
- [ ] Explicitly avoid any reliance on an "event log" for reconnect synchronization on the client side, as per REQ-288.

## 3. Code Review
- [ ] Verify that the snapshot message is truly self-contained and sufficient to synchronize a fresh client.
- [ ] Confirm that the server does not try to "resume" a stream; every new call starts with a full snapshot.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` in the relevant service and client crates and ensure the reconnect and synchronization tests pass.

## 5. Update Documentation
- [ ] Update the `WorkflowService` comments in `devs.proto` to explicitly document this "re-snapshot on connect" behavior and the client's responsibility during reconnect.

## 6. Automated Verification
- [ ] Run `./do test` to ensure that standard run monitoring remains functional and respects the new reconnect semantics.
