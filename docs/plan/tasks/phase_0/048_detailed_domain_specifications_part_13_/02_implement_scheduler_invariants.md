# Task: Implement Scheduler Event Loop Invariants (Sub-Epic: 048_Detailed Domain Specifications (Part 13))

## Covered Requirements
- [2_TAS-REQ-112]

## Dependencies
- depends_on: []
- shared_components: [devs-scheduler (owner — creates invariant enforcement), devs-core (consumer — uses WorkflowRunState/StageRunState enums)]

## 1. Initial Test Written
- [ ] Create `devs-scheduler/src/invariants.rs` (or `devs-scheduler/tests/invariants.rs`) with the following TDD tests:
- [ ] **Test `waiting_transitions_to_eligible_when_all_deps_completed`** (invariant 1): Build a 3-stage DAG: A → B → C. Complete stage A. Assert that B transitions from `Waiting` to `Eligible` within the same scheduler tick. C remains `Waiting` because B is not yet completed. Annotate with `// Covers: 2_TAS-REQ-112`.
- [ ] **Test `waiting_transitions_to_eligible_multiple_deps`** (invariant 1): Build a DAG where stage C depends on both A and B. Complete A only. Assert C remains `Waiting`. Complete B. Assert C transitions to `Eligible` in the same tick. Annotate with `// Covers: 2_TAS-REQ-112`.
- [ ] **Test `stage_not_dispatched_unless_all_deps_completed`** (invariant 2): Build a DAG where C depends on A and B. Complete A, fail B. Assert C is never dispatched (never reaches `Running`). Assert C transitions to `Cancelled`. Annotate with `// Covers: 2_TAS-REQ-112`.
- [ ] **Test `failed_dep_cascades_cancel_to_downstream`** (invariant 3): Build a linear DAG: A → B → C → D. Fail stage A (no retry configured). Assert B, C, and D all transition to `Cancelled` immediately. Annotate with `// Covers: 2_TAS-REQ-112`.
- [ ] **Test `timed_out_dep_cascades_cancel`** (invariant 3): Same as above but A reaches `TimedOut` instead of `Failed`. Assert identical cascade behavior. Annotate with `// Covers: 2_TAS-REQ-112`.
- [ ] **Test `cancelled_dep_cascades_cancel`** (invariant 3): Same as above but A is `Cancelled`. Assert identical cascade behavior. Annotate with `// Covers: 2_TAS-REQ-112`.
- [ ] **Test `duplicate_terminal_event_is_idempotent`** (invariant 4): Complete stage A. Send a second `StageCompleted` event for A in the same tick. Assert no state change occurs on the second event — A remains `Completed`, no duplicate downstream transitions. Annotate with `// Covers: 2_TAS-REQ-112`.
- [ ] **Test `duplicate_failed_event_is_idempotent`** (invariant 4): Fail stage A. Send a second `StageFailed` event for A. Assert the second is silently discarded. Annotate with `// Covers: 2_TAS-REQ-112`.
- [ ] **Test `no_deps_stage_starts_as_eligible`**: Build a DAG with a root stage (empty `depends_on`). Assert it starts in `Eligible` state immediately on run submission.
- [ ] **Test `failed_dep_with_retry_does_not_cascade`** (invariant 3 edge case): Stage A fails but has `max_retries = 2`. Assert downstream stages remain `Waiting` (not `Cancelled`) because retry is still possible.

## 2. Task Implementation
- [ ] Implement the eligibility evaluation function in `devs-scheduler/src/engine.rs` (or `scheduler.rs`):
  ```rust
  fn evaluate_eligibility(&mut self, completed_stage: &str) {
      // For each stage that depends on completed_stage:
      //   if all deps are Completed → transition to Eligible
      //   if any dep is Failed/TimedOut/Cancelled and no retry → cascade Cancel
  }
  ```
- [ ] Integrate this function into the scheduler's event loop, called on every terminal-state event.
- [ ] Implement idempotent terminal event handling: before processing a `StageCompleted`/`StageFailed`/`StageTimedOut` event, check if the stage is already in a terminal state. If so, discard the event and log at debug level.
- [ ] Implement cascade cancellation: when a dependency reaches a terminal failure state with no remaining retries, recursively cancel all transitive downstream stages.
- [ ] Ensure stages with empty `depends_on` are initialized in `Eligible` state when the run is created.
- [ ] All state transitions must go through the `StageRunState` state machine defined in `devs-core`, using its validated transition methods.

## 3. Code Review
- [ ] Verify that the eligibility check requires ALL dependencies to be `Completed` — not just the one that triggered the event (invariant 2).
- [ ] Verify that `Failed`, `Cancelled`, and `TimedOut` are all treated identically for cascade purposes (invariant 3).
- [ ] Confirm that retry-eligible stages do not trigger downstream cancellation prematurely.
- [ ] Ensure the scheduler processes events sequentially per-run to avoid race conditions on state transitions.
- [ ] Check that the idempotency guard (invariant 4) logs discarded events for debuggability.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- invariants` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to the eligibility evaluation function documenting the four invariants from [2_TAS-REQ-112].
- [ ] Add `// Covers: 2_TAS-REQ-112` annotations to each test function.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-112' devs-scheduler/` and confirm at least 8 test functions are annotated.
- [ ] Run `./do test` and confirm the traceability report includes [2_TAS-REQ-112].
- [ ] Run `./do lint` and confirm no lint failures in the scheduler crate.
