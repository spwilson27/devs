# Task: Protocol State Machines Implementation (Sub-Epic: 034_Foundational Technical Requirements (Part 25))

## Covered Requirements
- [2_TAS-REQ-086E]

## Dependencies
- depends_on: []
- shared_components: [devs-core (owner of state machine types)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/state_machine.rs` (or extend existing module) with a test submodule.
- [ ] **Run Status transitions**: Write a parameterized test that asserts every valid transition from the normative diagram:
  - `Pending -> Running` (first stage becomes Eligible)
  - `Pending -> Cancelled` (CancelRun before any stage starts)
  - `Running -> Paused` (PauseRun)
  - `Running -> Completed` (all stages Completed)
  - `Running -> Failed` (any stage Failed, no retry remaining)
  - `Running -> Cancelled` (CancelRun)
  - `Paused -> Running` (ResumeRun)
  - `Paused -> Cancelled` (CancelRun)
- [ ] **Run Status illegal transitions**: Write a test that exhaustively checks all (source, target) pairs NOT in the valid set above return `Err(TransitionError::IllegalTransition { from, to })`. Specifically test:
  - `Pending -> Paused`, `Pending -> Completed`, `Pending -> Failed`
  - `Running -> Pending`
  - `Paused -> Pending`, `Paused -> Completed`, `Paused -> Failed`
  - `Completed -> *` (all targets), `Failed -> *`, `Cancelled -> *`
- [ ] **Stage Status transitions**: Write a parameterized test asserting every valid transition:
  - `Pending -> Waiting` (run transitions to Running)
  - `Waiting -> Eligible` (all depends_on Completed)
  - `Eligible -> Running` (pool slot acquired, agent spawned)
  - `Running -> Paused`, `Running -> Completed`, `Running -> Failed`, `Running -> TimedOut`, `Running -> Cancelled`
  - `Paused -> Running`, `Paused -> Cancelled`
  - `Failed -> Pending` (retry scheduled, attempt < max_attempts)
  - `TimedOut -> Pending` (retry scheduled, attempt < max_attempts)
- [ ] **Stage Status illegal transitions**: Exhaustively test all invalid (source, target) pairs return `Err(TransitionError::IllegalTransition { from, to })`. Key cases:
  - `Pending -> Eligible` (must go through Waiting)
  - `Waiting -> Running` (must go through Eligible)
  - `Completed -> *`, `Cancelled -> *` (terminal states)
  - `Failed -> Running` (must go through Pending first for retry)
- [ ] **Terminal state verification**: Test that `RunStatus::is_terminal()` returns true for `Completed`, `Failed`, `Cancelled` and false for all others. Same for `StageStatus`.
- [ ] Annotate every test with `// Covers: 2_TAS-REQ-086E`.

## 2. Task Implementation
- [ ] Define `RunStatus` enum: `Pending`, `Running`, `Paused`, `Completed`, `Failed`, `Cancelled`.
- [ ] Define `StageStatus` enum: `Pending`, `Waiting`, `Eligible`, `Running`, `Paused`, `Completed`, `Failed`, `TimedOut`, `Cancelled`.
- [ ] Define `TransitionError` enum with variant `IllegalTransition { from: String, to: String }`.
- [ ] Implement `RunStatus::try_transition(&self, to: RunStatus) -> Result<RunStatus, TransitionError>` that encodes the valid transitions as an exhaustive match. Invalid transitions return `TransitionError::IllegalTransition`.
- [ ] Implement `StageStatus::try_transition(&self, to: StageStatus) -> Result<StageStatus, TransitionError>` with the same pattern.
- [ ] Implement `is_terminal(&self) -> bool` on both enums.
- [ ] Implement `Display` for both enums returning lowercase strings (e.g., `"running"`, `"timed_out"`).
- [ ] Ensure these types are `#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]`.
- [ ] Export from `devs-core` public API.

## 3. Code Review
- [ ] Verify that `try_transition` uses exhaustive `match` on both `self` and `to` — no wildcard catch-all arms that could silently allow illegal transitions.
- [ ] Verify that the `TransitionError` message includes both `from` and `to` states for debuggability.
- [ ] Verify no business logic in this module (no pool acquisition, no checkpoint saving — pure state transition validation only).
- [ ] Verify `Display` output matches the lowercase convention required by [2_TAS-REQ-086J] serialization rules.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- state_machine` and verify all tests pass.
- [ ] Verify that the total number of transition tests covers all valid + a representative set of invalid transitions.

## 5. Update Documentation
- [ ] Add doc comments to `RunStatus`, `StageStatus`, `try_transition`, and `TransitionError` explaining the normative state machines and referencing [2_TAS-REQ-086E].

## 6. Automated Verification
- [ ] Run `./do lint` to ensure clippy, formatting, and doc comment standards are met.
- [ ] Run `./do test` and verify that `target/traceability.json` correctly maps [2_TAS-REQ-086E] to the new tests.
