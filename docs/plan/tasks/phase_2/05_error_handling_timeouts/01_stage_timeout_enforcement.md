# Task: Stage Timeout Monitoring and Cancellation Sequence (Sub-Epic: 05_Error Handling & Timeouts)

## Covered Requirements
- [1_PRD-REQ-028], [2_TAS-REQ-092]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-adapters, devs-executor]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-scheduler` that mocks a `StageRun` with a 1-second `timeout_secs`.
- [ ] Mock the `StageExecutor` to run a subprocess that sleeps for 10 seconds.
- [ ] Verify that the scheduler triggers a cancellation after 1 second.
- [ ] Write an integration test that verifies the exact cancellation sequence:
    - [ ] `devs:cancel\n` written to stdin.
    - [ ] 5-second grace period (mocked clock).
    - [ ] `SIGTERM` sent.
    - [ ] 5-second grace period.
    - [ ] `SIGKILL` sent.
- [ ] Verify the stage transitions to `StageStatus::TimedOut` regardless of the exit code.

## 2. Task Implementation
- [ ] Implement a `TimeoutMonitor` in `devs-scheduler` that uses `tokio::time::sleep` for each `Running` stage based on its `timeout_secs`.
- [ ] Add a `cancel` method to the `AgentAdapter` trait (or a shared helper in `devs-adapters`) that implements the `devs:cancel\n` -> `SIGTERM` -> `SIGKILL` sequence with 5-second intervals.
- [ ] Ensure `devs-executor` can receive a cancellation signal and pass it to the adapter.
- [ ] Update the `StageStatus` state machine in `devs-core` to handle the transition to `TimedOut`.
- [ ] Ensure the scheduler records the `TimedOut` state in the checkpoint.

## 3. Code Review
- [ ] Verify that the cancellation sequence is non-blocking to the main scheduler loop.
- [ ] Confirm that the grace periods are configurable or at least strictly follow the 5-second requirement.
- [ ] Ensure the process is actually killed and no orphaned sub-processes remain (use PTY if necessary).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler`.
- [ ] Run `cargo test -p devs-adapters`.
- [ ] Verify 90% unit test coverage for the timeout logic.

## 5. Update Documentation
- [ ] Update `devs-scheduler` documentation to describe the timeout monitoring mechanism.

## 6. Automated Verification
- [ ] Run `./do test` and verify that requirements `[1_PRD-REQ-028]` and `[2_TAS-REQ-092]` are marked as covered.
