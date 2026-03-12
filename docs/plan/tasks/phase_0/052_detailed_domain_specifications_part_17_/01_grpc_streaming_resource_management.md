# Task: Implement gRPC StreamRunEvents Semantics and Streaming Resource Management (Sub-Epic: 052_Detailed Domain Specifications (Part 17))

## Covered Requirements
- [2_TAS-REQ-131], [2_TAS-REQ-132]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-core, devs-grpc]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-grpc` that mocks a `WorkflowRun` stream and verifies:
    - The first message received is the full `WorkflowRun` state.
    - Subsequent `RunEvent` messages are received correctly.
    - The stream closes with `OK` status when a terminal state is reached.
    - A `NOT_FOUND` error is returned if a non-existent `run_id` is requested.
- [ ] Write an integration test using a mock gRPC client that disconnects mid-stream and verifies (via a mock subscription registry) that the subscription is deregistered within 500ms, ensuring no leaked resources.

## 2. Task Implementation
- [ ] In `devs-grpc`, implement the `StreamRunEvents` method in the `RunService` implementation.
    - Use `tokio-stream` to create a stream from a broadcast channel or similar mechanism provided by the scheduler.
    - Ensure the first message sent is the current snapshot of the `WorkflowRun`.
    - Implement a subscription registry or use a robust channel-per-client pattern to track active streams.
    - Ensure that when the run reaches `Completed`, `Failed`, or `Cancelled`, the stream sends a final event and then terminates.
- [ ] Implement resource cleanup logic using `tokio::select!` or similar patterns to detect client disconnection (stream drop) and immediately deregister the subscription from the scheduler/registry.
- [ ] Ensure all gRPC status codes match [2_TAS-REQ-131] (e.g., `NOT_FOUND` for missing runs).

## 3. Code Review
- [ ] Verify that no `devs-proto` wire types leak into the public API of `devs-scheduler` or `devs-core` during this implementation.
- [ ] Confirm that the subscription registry is thread-safe and does not introduce deadlock risks (check lock acquisition order: `SchedulerState` → `PoolState`).
- [ ] Ensure the implementation uses `tonic::Status` with correct codes as per [2_TAS-REQ-131].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc` to verify the streaming logic and resource management.
- [ ] Verify that the gRPC reflection correctly exposes the `StreamRunEvents` method using `grpcurl` if a local server can be started.

## 5. Update Documentation
- [ ] Document the gRPC streaming resource management strategy in `docs/architecture/grpc_streaming.md` (if it exists) or update the `devs-grpc` README.
- [ ] Update the internal agent "memory" regarding the implementation of `StreamRunEvents`.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure no documentation or style violations.
- [ ] Run `./do test` and check `target/traceability.json` to ensure [2_TAS-REQ-131] and [2_TAS-REQ-132] are fully covered.
