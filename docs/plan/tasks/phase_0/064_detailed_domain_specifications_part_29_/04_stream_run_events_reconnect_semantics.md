# Task: StreamRunEvents Reconnect Semantics with Initial Snapshot (Sub-Epic: 064_Detailed Domain Specifications (Part 29))

## Covered Requirements
- [2_TAS-REQ-288]

## Dependencies
- depends_on: []
- shared_components: ["devs-proto", "devs-scheduler", "devs-grpc"]

## 1. Initial Test Written
- [ ] Write an integration test `test_stream_run_events_sends_initial_snapshot` that:
  1. Submits a workflow run and lets it progress through at least one stage.
  2. Opens a `StreamRunEvents` gRPC call.
  3. Asserts the first message received is a full snapshot of the current run state (not a delta event).
- [ ] Write an integration test `test_stream_reconnect_receives_fresh_snapshot` that:
  1. Opens a `StreamRunEvents` stream and receives some events.
  2. Drops the stream (simulating disconnect).
  3. Opens a new `StreamRunEvents` stream for the same run.
  4. Asserts the first message of the new stream is a complete snapshot reflecting all state changes that occurred (including those during disconnect).
- [ ] Write a unit test `test_client_must_not_assume_all_intermediate_events` that:
  1. Documents (via test name and comments) that clients receiving a reconnect snapshot should reset their local state from the snapshot rather than replaying missed events.
  2. Constructs a scenario where the snapshot state differs from what incremental events alone would produce (e.g., a stage completed during disconnect) and asserts the client-side model built from the snapshot is correct.

## 2. Task Implementation
- [ ] In the `StreamRunEvents` gRPC handler (server side), ensure the first message sent on any new stream is a `RunSnapshot` message containing the complete current state of the requested run (all stages, their statuses, outputs, timestamps).
- [ ] Define the `RunSnapshot` message in the proto schema if not already present, or use an existing `WorkflowRun` message as the snapshot payload.
- [ ] After the initial snapshot, subsequent messages are incremental `RunEvent` deltas as state changes occur.
- [ ] Document in the proto file comments that clients MUST NOT assume continuous event delivery — the snapshot is the sole mechanism for state recovery after reconnect.

## 3. Code Review
- [ ] Verify the snapshot message includes all fields needed for a client to fully reconstruct run state without prior history.
- [ ] Confirm no server-side buffering of old events is required — the snapshot replaces the need for event replay.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --workspace -- stream_run_events` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on the `StreamRunEvents` RPC method describing the reconnect contract.

## 6. Automated Verification
- [ ] Run `cargo test --workspace` and verify exit code 0.
