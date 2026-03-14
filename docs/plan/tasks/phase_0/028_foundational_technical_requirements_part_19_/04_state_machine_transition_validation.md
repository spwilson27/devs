# Task: Implement StateMachine Trait with Illegal Transition Rejection and Persist-Before-Notify (Sub-Epic: 028_Foundational Technical Requirements (Part 19))

## Covered Requirements
- [2_TAS-REQ-020A]

## Dependencies
- depends_on: []
- shared_components: [devs-core (owner — this task defines the StateMachine trait and state enums in devs-core)]

## 1. Initial Test Written
- [ ] Create `devs-core/src/state_machine/tests.rs` (unit tests) with the following test cases:

### WorkflowRunStatus transition tests
- [ ] **Test: valid Pending → Running succeeds** — Create a `WorkflowRunStatus::Pending`. Call `transition(Running)`. Assert it returns `Ok(Running)` and the state is now `Running`.
- [ ] **Test: valid Running → Paused succeeds** — Assert `Ok(Paused)`.
- [ ] **Test: valid Paused → Running succeeds** — Assert `Ok(Running)`.
- [ ] **Test: valid Running → Completed succeeds** — Assert `Ok(Completed)`.
- [ ] **Test: valid Running → Failed succeeds** — Assert `Ok(Failed)`.
- [ ] **Test: valid Running → Cancelled succeeds** — Assert `Ok(Cancelled)`.
- [ ] **Test: valid Pending → Cancelled succeeds** — Assert `Ok(Cancelled)`.
- [ ] **Test: illegal Completed → Running rejected** — Assert returns `Err(TransitionError::IllegalTransition { from: Completed, to: Running })`. Assert state remains `Completed`.
- [ ] **Test: illegal Failed → Running rejected** — Same pattern.
- [ ] **Test: illegal Cancelled → Running rejected** — Same pattern.
- [ ] **Test: illegal Pending → Completed rejected** — Cannot skip Running.
- [ ] **Test: illegal Paused → Completed rejected** — Must go through Running first.
- [ ] **Test: self-transition rejected** — `Running → Running` returns `IllegalTransition`.

### StageRunStatus transition tests
- [ ] **Test: valid Waiting → Eligible succeeds**.
- [ ] **Test: valid Eligible → Running succeeds**.
- [ ] **Test: valid Running → Completed succeeds**.
- [ ] **Test: valid Running → Failed succeeds**.
- [ ] **Test: valid Running → TimedOut succeeds**.
- [ ] **Test: valid Running → Cancelled succeeds**.
- [ ] **Test: valid Running → Paused succeeds**.
- [ ] **Test: valid Paused → Running succeeds**.
- [ ] **Test: valid Failed → Pending succeeds** (retry path).
- [ ] **Test: valid TimedOut → Pending succeeds** (retry path).
- [ ] **Test: valid Waiting → Cancelled succeeds**.
- [ ] **Test: valid Eligible → Cancelled succeeds**.
- [ ] **Test: valid Eligible → Failed succeeds** (capability unsatisfied).
- [ ] **Test: illegal Completed → Running rejected** — State preserved.
- [ ] **Test: illegal Cancelled → Eligible rejected** — State preserved.
- [ ] **Test: illegal Waiting → Running rejected** — Must go through Eligible.

### Persist-before-notify ordering test
- [ ] **Test: checkpoint written before event emitted** — Use a mock checkpoint writer and a mock event emitter (both record call order via a shared `Arc<Mutex<Vec<&str>>>`). Perform a valid transition. Assert the call log is `["checkpoint_write", "event_emit"]` in that exact order.
- [ ] **Test: no event emitted on illegal transition** — Attempt an illegal transition. Assert the event emitter was never called. Assert the checkpoint writer was never called.

- [ ] Mark all tests with `// Covers: 2_TAS-REQ-020A`.

## 2. Task Implementation
- [ ] Create `devs-core/src/state_machine/mod.rs` with:
  ```rust
  pub mod workflow;
  pub mod stage;
  #[cfg(test)]
  mod tests;
  ```
- [ ] Define `TransitionError` enum in `devs-core/src/state_machine/mod.rs`:
  ```rust
  #[derive(Debug, Clone, PartialEq, Eq)]
  pub enum TransitionError {
      IllegalTransition {
          from: String,
          to: String,
      },
  }
  ```
- [ ] Define the `StateMachine` trait:
  ```rust
  pub trait StateMachine: Sized {
      fn transition(&mut self, target: Self) -> Result<(), TransitionError>;
      fn is_terminal(&self) -> bool;
  }
  ```
- [ ] Implement `WorkflowRunStatus` enum in `devs-core/src/state_machine/workflow.rs`:
  - Variants: `Pending`, `Running`, `Paused`, `Completed`, `Failed`, `Cancelled`
  - Implement `StateMachine` with a match on `(current, target)` that allows only the valid transitions listed in the TAS spec (§3.5).
  - On illegal transition: return `Err(TransitionError::IllegalTransition)` without modifying `self`.
  - `is_terminal()`: returns `true` for `Completed`, `Failed`, `Cancelled`.
- [ ] Implement `StageRunStatus` enum in `devs-core/src/state_machine/stage.rs`:
  - Variants: `Waiting`, `Eligible`, `Pending`, `Running`, `Paused`, `Completed`, `Failed`, `TimedOut`, `Cancelled`
  - Valid transitions per TAS spec §3.5 stage state diagram.
  - `is_terminal()`: returns `true` for `Completed`, `Failed`, `TimedOut`, `Cancelled`.
- [ ] Both enums derive `Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize`.
- [ ] Export from `devs-core/src/lib.rs`: `pub mod state_machine;`.
- [ ] **Persist-before-notify**: Define a `TransitionHandler` trait (or use closures) with `on_transition(from, to, checkpoint_writer, event_emitter)` that enforces the ordering. This is the integration point — actual checkpoint and event implementations are injected by consumers.

## 3. Code Review
- [ ] Verify every valid transition from the TAS spec state diagrams is covered by a test.
- [ ] Verify every invalid transition tested returns `IllegalTransition` and does NOT modify state.
- [ ] Verify `is_terminal()` matches the spec exactly: `Completed | Failed | Cancelled` for workflow, `Completed | Failed | TimedOut | Cancelled` for stage.
- [ ] Verify `TransitionError` includes both `from` and `to` states for debugging.
- [ ] Verify no `unwrap()` or `panic!()` in the transition logic — all errors are returned.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- state_machine` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `StateMachine` trait explaining the contract: reject illegal transitions, preserve state on error.
- [ ] Add doc comments to each status enum listing valid transitions.
- [ ] Add `// Covers: 2_TAS-REQ-020A` to each test.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- state_machine --no-fail-fast` and assert exit code 0.
- [ ] Run `grep -rn '2_TAS-REQ-020A' devs-core/src/` and verify at least 3 matches (covering workflow, stage, and ordering tests).
