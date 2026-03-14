# Task: Define Status Enums and State Machines (Sub-Epic: 01_Core Domain Models & State Machine)

## Covered Requirements
- [2_TAS-REQ-019], [2_TAS-REQ-020], [2_TAS-REQ-025], [2_TAS-REQ-020A]

## Dependencies
- depends_on: []
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write unit tests in `devs-core/src/models/status.rs` verifying all valid state transitions for `RunStatus` and `StageStatus`.
- [ ] Write unit tests verifying that all invalid transitions return `TransitionError::IllegalTransition { from, to }`.
- [ ] Verifies [2_TAS-REQ-019], [2_TAS-REQ-020].
- [ ] Verifies [2_TAS-REQ-020A].

## 2. Task Implementation
- [ ] Create the `devs-core` library crate in the workspace.
- [ ] Define `RunStatus` enum with variants: `Pending`, `Running`, `Paused`, `Completed`, `Failed`, `Cancelled`.
- [ ] Define `StageStatus` enum with variants: `Pending`, `Waiting`, `Eligible`, `Running`, `Paused`, `Completed`, `Failed`, `TimedOut`, `Cancelled`.
- [ ] Implement a `StateMachine` trait that defines a `transition(to: Self) -> Result<Self, TransitionError>` method.
- [ ] Implement `StateMachine` for `RunStatus` using an exhaustive match on `(self, to)` for all valid transitions:
    - `Pending` → `Running`, `Cancelled`
    - `Running` → `Paused`, `Completed`, `Failed`, `Cancelled`
    - `Paused` ↔ `Running`
- [ ] Implement `StateMachine` for `StageStatus` with all valid transitions:
    - `Pending` → `Waiting`
    - `Waiting` → `Eligible`, `Cancelled`
    - `Eligible` → `Running`, `Cancelled`
    - `Running` → `Paused`, `Completed`, `Failed`, `TimedOut`, `Cancelled`
    - `Paused` ↔ `Running`
    - `Failed` → `Pending` (retry)
    - `TimedOut` → `Pending` (retry)
- [ ] Define `TransitionError` with `IllegalTransition { from: String, to: String }`.
- [ ] Ensure all enums derive `Serialize`, `Deserialize`, `Debug`, `Clone`, `Copy`, `PartialEq`.
- [ ] Implements [2_TAS-REQ-019], [2_TAS-REQ-020], [2_TAS-REQ-020A].

## 3. Code Review
- [ ] Verify that all status transitions match the state machines defined in TAS §4.2.1 and §4.2.2.
- [ ] Ensure `StateMachine` implementation uses exhaustive matches to catch any missing variants.
- [ ] Verify that no business logic (like scheduling) is mixed into these domain types.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure all status transition tests pass.

## 5. Update Documentation
- [ ] Document the `StateMachine` trait and the status enums in `devs-core` doc comments.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` to ensure traceability for the implemented REQ IDs.
