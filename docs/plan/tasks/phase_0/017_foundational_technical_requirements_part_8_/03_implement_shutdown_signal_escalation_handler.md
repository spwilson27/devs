# Task: Implement Shutdown Signal Escalation Handler (Sub-Epic: 017_Foundational Technical Requirements (Part 8))

## Covered Requirements
- [2_TAS-REQ-002D]

## Dependencies
- depends_on: [docs/plan/tasks/phase_0/017_foundational_technical_requirements_part_8_/02_implement_shutdown_state_persistence_logic.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/src/shutdown_escalator.rs` for signal state transitions:
  - Test that the initial state is `NotShuttingDown`.
  - Test that a first `SIGTERM` transition results in `GracefulShutdown`.
  - Test that a second `SIGTERM` transition during `GracefulShutdown` results in `ImmediateEscalation`.
  - Test that subsequent `SIGTERM` signals remain in `ImmediateEscalation`.
- [ ] Test the "decision logic":
  - Verify that during `GracefulShutdown`, the policy is to wait for agent termination.
  - Verify that during `ImmediateEscalation`, the policy is to immediately send `SIGKILL`.

## 2. Task Implementation
- [ ] Implement a `ShutdownEscalator` state machine in `crates/devs-core/src/shutdown_escalator.rs`.
- [ ] Define the `ShutdownMode` enum: `None`, `Graceful`, `Immediate`.
- [ ] Implement a method `handle_signal(&mut self, signal: Signal)` that updates the mode according to [2_TAS-REQ-002D].
- [ ] Implement a method `should_escalate(&self) -> bool` that returns true if the second signal was received.
- [ ] Note: The actual subprocess killing with `SIGKILL` will be done by `devs-adapters` or the server binary, but the state machine logic that *decides* when to escalate based on signal count belongs in `devs-core`.

## 3. Code Review
- [ ] Verify that the state transition from `Graceful` to `Immediate` is correct and idempotent.
- [ ] Ensure that the logic is thread-safe (e.g., using `std::sync::atomic` or `Arc<Mutex>` if intended for shared use).
- [ ] Confirm that the escalation results in the correct policy (skip the grace period and send `SIGKILL`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib shutdown_escalator` and ensure the signal state transition tests pass.

## 5. Update Documentation
- [ ] Add doc comments explaining the signal escalation policy and its mapping to requirement [2_TAS-REQ-002D].

## 6. Automated Verification
- [ ] Run `grep -r "2_TAS-REQ-002D" crates/devs-core/` to verify traceability of the signal escalation requirement.
