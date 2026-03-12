# Task: Robustness Testing for StateMachine and TemplateResolver (Sub-Epic: 095_Acceptance Criteria & Roadmap (Part 6))

## Covered Requirements
- [AC-ROAD-P0-004], [AC-ROAD-P0-005]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Implement an exhaustive unit test `devs-core/src/state_machine_tests.rs` (or within the existing state machine module) that iterates through all possible `(RunStatus, RunEvent)` and `(StageStatus, StageEvent)` pairs.
- [ ] For every pair not explicitly defined as a valid transition, assert that `StateMachine::transition()` returns `Err(TransitionError::IllegalTransition)`.
- [ ] Ensure the test explicitly asserts that NO transition causes a `panic!`.
- [ ] Implement a unit test `devs-core/src/template_tests.rs` that calls `TemplateResolver::resolve()` with a template string referencing a nonexistent variable (e.g., `{{stage.unknown.field}}`).
- [ ] Assert that the result is `Err(TemplateError::UnknownVariable)`.
- [ ] Explicitly verify that the resolver NEVER returns `Ok("")` (empty string) in place of a missing variable.

## 2. Task Implementation
- [ ] Review the existing `StateMachine` transition logic in `devs-core`.
- [ ] Ensure that the transition tables for `RunStatus` and `StageStatus` are correctly implemented.
- [ ] If any illegal transitions were causing panics, refactor them to return the `IllegalTransition` error variant.
- [ ] Review the `TemplateResolver` logic.
- [ ] Ensure the variable lookup logic in `TemplateResolver::resolve()` correctly identifies missing variables and returns the `UnknownVariable` error.
- [ ] Ensure that default values or silent fallbacks to empty strings are not present in the code.

## 3. Code Review
- [ ] Verify that `StateMachine` uses exhaustive pattern matching or a clearly defined state-event table.
- [ ] Confirm that `TemplateResolver` implements the 7-priority level resolution engine correctly (if already implemented) or at least handles basic variable lookup with proper error signaling.
- [ ] Ensure all code follows the `devs` project's documentation and styling standards.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and confirm that all exhaustive transition tests and template error tests pass.
- [ ] Run `cargo doc -p devs-core` to verify that the documentation for these types is accurate.

## 5. Update Documentation
- [ ] Add doc comments to `StateMachine` and `TemplateResolver` reflecting these robustness guarantees.
- [ ] Ensure these tests are annotated with `/// Verifies [AC-ROAD-P0-004]` and `/// Verifies [AC-ROAD-P0-005]`.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure AC-ROAD-P0-004 and AC-ROAD-P0-005 are correctly tracked.
