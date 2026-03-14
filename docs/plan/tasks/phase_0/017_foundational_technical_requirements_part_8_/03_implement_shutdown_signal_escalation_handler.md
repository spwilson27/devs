# Task: Implement Shutdown Signal Escalation State Machine (Sub-Epic: 017_Foundational Technical Requirements (Part 8))

## Covered Requirements
- [2_TAS-REQ-002D]

## Dependencies
- depends_on: [02_implement_shutdown_state_persistence_logic.md]
- shared_components: [devs-core (owner — this task adds the signal escalation state machine used by the server shutdown sequence)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/shutdown_escalator.rs` and add `mod shutdown_escalator;` to `crates/devs-core/src/lib.rs`.
- [ ] Write the following unit tests (all should fail initially):

### State Transition Tests
- [ ] `test_initial_state_is_not_shutting_down`: Create a `ShutdownEscalator::new()`. Assert `mode()` returns `ShutdownMode::None`.
- [ ] `test_first_sigterm_transitions_to_graceful`: Call `escalator.handle_sigterm()`. Assert `mode()` returns `ShutdownMode::Graceful`.
- [ ] `test_second_sigterm_transitions_to_immediate`: Call `handle_sigterm()` twice. Assert `mode()` returns `ShutdownMode::Immediate`.
- [ ] `test_third_sigterm_stays_immediate`: Call `handle_sigterm()` three times. Assert `mode()` is still `ShutdownMode::Immediate` (idempotent).
- [ ] `test_is_shutting_down_false_initially`: Assert `escalator.is_shutting_down()` returns `false`.
- [ ] `test_is_shutting_down_true_after_first_signal`: After one `handle_sigterm()`, assert `is_shutting_down()` returns `true`.

### Escalation Decision Tests
- [ ] `test_should_force_kill_false_during_graceful`: After one `handle_sigterm()`, assert `should_force_kill()` returns `false`.
- [ ] `test_should_force_kill_true_during_immediate`: After two `handle_sigterm()` calls, assert `should_force_kill()` returns `true`. This indicates the server must send SIGKILL to all agent subprocesses without waiting for the grace period.
- [ ] `test_shutdown_reason_maps_correctly`: After one signal, assert `shutdown_reason()` returns `ShutdownReason::GracefulShutdown`. After two signals, assert it returns `ShutdownReason::ImmediateEscalation`. This connects to the `ShutdownReason` type from task 02.

### Thread Safety Tests
- [ ] `test_escalator_is_send_and_sync`: Static assertion: `fn assert_send_sync<T: Send + Sync>() {} assert_send_sync::<ShutdownEscalator>();`. The escalator will be shared across async tasks in the server.
- [ ] `test_concurrent_signal_handling`: Spawn two threads, each calling `handle_sigterm()` on a shared `Arc<ShutdownEscalator>`. Assert that after both complete, `mode()` is `ShutdownMode::Immediate` (two signals received regardless of ordering).

## 2. Task Implementation
- [ ] Define the `ShutdownMode` enum in `crates/devs-core/src/shutdown_escalator.rs`:
  ```rust
  #[derive(Debug, Clone, Copy, PartialEq, Eq)]
  pub enum ShutdownMode {
      None,
      Graceful,
      Immediate,
  }
  ```
- [ ] Implement `ShutdownEscalator` struct using `AtomicU8` for lock-free thread safety:
  ```rust
  pub struct ShutdownEscalator {
      signal_count: AtomicU8,
  }
  ```
- [ ] Implement the following methods:
  - `pub fn new() -> Self` — initializes with `signal_count = 0`.
  - `pub fn handle_sigterm(&self) -> ShutdownMode` — atomically increments `signal_count` (capped at 2 to avoid overflow), returns the new mode. Uses `fetch_update` or `fetch_add` with `Ordering::SeqCst`.
  - `pub fn mode(&self) -> ShutdownMode` — maps `signal_count`: 0 → `None`, 1 → `Graceful`, ≥2 → `Immediate`.
  - `pub fn is_shutting_down(&self) -> bool` — returns `signal_count >= 1`.
  - `pub fn should_force_kill(&self) -> bool` — returns `signal_count >= 2`. Per [2_TAS-REQ-002D], when true the server must SIGKILL all agent subprocesses without waiting for grace period, then proceed to checkpoint flush and exit.
  - `pub fn shutdown_reason(&self) -> Option<ShutdownReason>` — returns `None` if not shutting down, `Some(GracefulShutdown)` for graceful, `Some(ImmediateEscalation)` for immediate. Reuses the `ShutdownReason` enum from task 02's `shutdown.rs`.
- [ ] Add `// Covers: 2_TAS-REQ-002D` comment above `handle_sigterm` and `should_force_kill`.
- [ ] Re-export `ShutdownEscalator` and `ShutdownMode` from `crates/devs-core/src/lib.rs`.

## 3. Code Review
- [ ] Verify that the state transition from `Graceful` to `Immediate` is correct: exactly the second signal triggers escalation, not the third.
- [ ] Verify that `AtomicU8` with `SeqCst` ordering provides correct behavior under concurrent access — no lost updates.
- [ ] Confirm that `signal_count` is capped (e.g., `min(count + 1, 2)`) to prevent overflow if many signals arrive.
- [ ] Verify that `ShutdownEscalator` is `Send + Sync` (required for `Arc<ShutdownEscalator>` sharing).
- [ ] Confirm no `unwrap()`, `expect()`, or panic paths in non-test code.
- [ ] Verify no async runtime dependency — this is pure synchronous logic usable from signal handlers.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib shutdown_escalator` and ensure all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and ensure no warnings.

## 5. Update Documentation
- [ ] Add module-level doc comment to `shutdown_escalator.rs` explaining: this module implements the double-SIGTERM escalation policy per [2_TAS-REQ-002D]. First SIGTERM triggers graceful shutdown (wait for agents, then checkpoint). Second SIGTERM triggers immediate SIGKILL of all agents followed by checkpoint flush.
- [ ] Add doc comments to each public type and method.

## 6. Automated Verification
- [ ] Run `grep -rn "Covers:.*2_TAS-REQ-002D" crates/devs-core/src/` and verify at least one match.
- [ ] Run `cargo test -p devs-core --lib shutdown_escalator 2>&1 | tail -1` and verify it shows `test result: ok`.
