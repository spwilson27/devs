# Task: Workflow and Stage Run State Machines (Sub-Epic: 046_Detailed Domain Specifications (Part 11))

## Covered Requirements
- [2_TAS-REQ-102]

## Dependencies
- depends_on: []
- shared_components: [devs-core (owner — creates StateMachine trait and implementations)]

## 1. Initial Test Written
- [ ] Create `devs-core/src/state_machine_tests.rs` (or `#[cfg(test)] mod tests` in `state_machine.rs`) with the following tests:
- [ ] **Valid WorkflowRun transitions**: Test each legal transition path:
    - `Pending` → `Start` → `Running`
    - `Running` → `Pause` → `Paused`
    - `Paused` → `Resume` → `Running`
    - `Running` → `Complete` → `Completed`
    - `Running` → `Fail` → `Failed`
    - `Running` → `Cancel` → `Cancelled`
    - `Pending` → `Cancel` → `Cancelled`
    - `Paused` → `Cancel` → `Cancelled`
- [ ] **Invalid WorkflowRun transitions**: For each terminal state (`Completed`, `Failed`, `Cancelled`), assert that calling `transition()` with any event returns `Err(TransitionError)` with correct `from` and `event` string fields. Specifically test EC-C03-03: `Completed` + `Complete` → `Err`.
- [ ] **Valid StageRun transitions**: Test each legal path from the spec:
    - `Waiting` → `MakeEligible` → `Eligible`
    - `Eligible` → `Dispatch` → `Running`
    - `Running` → `Pause` → `Paused`
    - `Paused` → `Resume` → `Running`
    - `Running` → `Complete` → `Completed`
    - `Running` → `Fail` → `Failed`
    - `Running` → `TimeOut` → `TimedOut`
    - `Running` → `Cancel` → `Cancelled`
    - `Paused` → `Cancel` → `Cancelled`
    - `Eligible` → `Cancel` → `Cancelled`
    - `Waiting` → `Cancel` → `Cancelled`
    - `Failed` → `ScheduleRetry` → `Waiting` (reset for retry)
    - `TimedOut` → `ScheduleRetry` → `Waiting` (reset for retry)
- [ ] **Invalid StageRun transitions**: Assert `Waiting` + `Complete` → `Err`, `Completed` + `Dispatch` → `Err`, `Cancelled` + `Resume` → `Err`. Verify error carries both `from` and `event` as `String` display values.
- [ ] **`is_terminal()` tests**: Assert `Completed`, `Failed`, `Cancelled` return `true` for WorkflowRun. Assert `Completed`, `Failed`, `TimedOut`, `Cancelled` return `true` for StageRun. Assert all non-terminal states return `false`.
- [ ] **Exhaustiveness**: Write a test that iterates all `(state, event)` pairs and asserts every pair either succeeds or returns `Err` — no panics, no unreachable branches.
- [ ] Annotate each test with `// Covers: 2_TAS-REQ-102`.

## 2. Task Implementation
- [ ] Define `pub trait StateMachine` in `devs-core/src/state_machine.rs` with exact signature:
    ```rust
    pub trait StateMachine {
        type Event;
        type Error;
        fn transition(&mut self, event: Self::Event) -> Result<(), Self::Error>;
        fn is_terminal(&self) -> bool;
    }
    ```
- [ ] Define `pub enum WorkflowRunStatus { Pending, Running, Paused, Completed, Failed, Cancelled }` with `Debug, Clone, Copy, PartialEq, Eq, Display` derives.
- [ ] Define `pub enum WorkflowRunEvent { Start, Pause, Resume, Complete, Fail, Cancel }` with `Debug, Clone, Copy, PartialEq, Eq, Display` derives.
- [ ] Define `pub enum StageRunStatus { Waiting, Eligible, Running, Paused, Completed, Failed, TimedOut, Cancelled }` with same derives.
- [ ] Define `pub enum StageRunEvent { MakeEligible, Dispatch, Pause, Resume, Complete, Fail, TimeOut, Cancel, ScheduleRetry }` with same derives.
- [ ] Define `TransitionError` struct with `pub from: String` and `pub event: String` fields, implementing `Debug` and `std::fmt::Display` / `std::error::Error`.
- [ ] Implement `StateMachine` for a `WorkflowRunState` struct (wrapping `WorkflowRunStatus`) using exhaustive match arms. Every `(state, event)` pair is explicitly handled — no wildcard `_` catch-all.
- [ ] Implement `StateMachine` for a `StageRunState` struct (wrapping `StageRunStatus`) using exhaustive match arms. The `Cancel` event must be valid from `Running`, `Paused`, `Eligible`, and `Waiting`. `ScheduleRetry` is valid only from `Failed` and `TimedOut`, transitioning back to `Waiting`.
- [ ] Re-export all public types from `devs-core/src/lib.rs`.

## 3. Code Review
- [ ] Confirm no wildcard `_` match arms in `transition()` implementations — all branches are explicit.
- [ ] Verify `TransitionError` includes both `from` (display of current state) and `event` (display of attempted event) as documented.
- [ ] Confirm `is_terminal()` returns `true` only for the specified terminal states.
- [ ] Verify all types derive `Debug` at minimum; status enums also derive `Clone, Copy, PartialEq, Eq`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- state_machine` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Add doc comments to `StateMachine` trait, all enum variants, and `TransitionError` explaining the state machine semantics.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the `target/traceability.json` output includes coverage for `2_TAS-REQ-102`.
- [ ] Run `./do lint` and confirm zero errors.
