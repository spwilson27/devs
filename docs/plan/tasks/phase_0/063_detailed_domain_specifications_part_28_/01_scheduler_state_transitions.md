# Task: Implement Scheduler Stage Dependency State Transitions (Sub-Epic: 063_Detailed Domain Specifications (Part 28))

## Covered Requirements
- [2_TAS-REQ-278], [2_TAS-REQ-279]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consumer — uses StageRunState enum and state machine)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/state_machine.rs` (or the module containing `StageRunState` transitions), create a test module `mod dependency_transition_tests`.
- [ ] **Test: `test_waiting_to_eligible_when_all_deps_completed`** — Construct a `StageRun` in `Waiting` state with `depends_on: ["stage_a", "stage_b"]`. Set both `stage_a` and `stage_b` to `Completed`. Call the scheduler tick function (or the dependency-check method). Assert the stage transitions to `Eligible`. This validates [2_TAS-REQ-278].
- [ ] **Test: `test_waiting_stays_waiting_when_dep_still_running`** — Same setup but leave `stage_b` in `Running` state. Assert the stage remains `Waiting` after a tick. This is a negative case for [2_TAS-REQ-278].
- [ ] **Test: `test_waiting_stays_waiting_when_dep_in_eligible`** — One dependency is `Eligible` (not yet `Running`). Assert the stage remains `Waiting`.
- [ ] **Test: `test_no_dispatch_when_dep_failed`** — Construct a `StageRun` in `Waiting` with one dependency in `Failed` state. Assert the stage does NOT transition to `Eligible`. It should transition to `Cancelled` per the downstream cancellation rule. This validates [2_TAS-REQ-279].
- [ ] **Test: `test_no_dispatch_when_dep_cancelled`** — Same as above but dependency is `Cancelled`. Assert the stage does NOT become `Eligible`. Validates [2_TAS-REQ-279].
- [ ] **Test: `test_no_dispatch_when_dep_timed_out`** — Same as above but dependency is `TimedOut`. Assert the stage does NOT become `Eligible`. Validates [2_TAS-REQ-279].
- [ ] **Test: `test_no_deps_immediately_eligible`** — A stage with empty `depends_on` list should be `Eligible` immediately (or after the first tick). Validates [2_TAS-REQ-278] edge case.
- [ ] **Test: `test_transition_happens_within_one_tick`** — Set up a stage with one dependency. Complete the dependency. Run exactly one scheduler tick. Assert the stage is now `Eligible`, not still `Waiting`. This validates the "within one scheduler tick" requirement of [2_TAS-REQ-278].
- [ ] Annotate all tests with `// Covers: [2_TAS-REQ-278]` or `// Covers: [2_TAS-REQ-279]` as appropriate.
- [ ] Verify all tests fail (Red phase) before implementation.

## 2. Task Implementation
- [ ] In `devs-core`, locate or create the function that evaluates whether a `Waiting` stage should transition to `Eligible`. This function takes the stage's `depends_on` list and a lookup function/map of current dependency states.
- [ ] Implement the transition rule: iterate over all entries in `depends_on`; if ALL are `Completed`, return `Eligible`. If ANY dependency is in a terminal failure state (`Failed`, `Cancelled`, `TimedOut`) with no remaining retries, return `Cancelled` (downstream propagation). Otherwise return `Waiting` (no change).
- [ ] Ensure the function signature is something like: `fn evaluate_stage_readiness(stage: &StageRun, dep_states: &HashMap<String, StageRunState>) -> StageRunState`.
- [ ] For stages with an empty `depends_on` list, the function must return `Eligible` immediately.
- [ ] Add a doc comment on the transition function referencing `[2_TAS-REQ-278]` and `[2_TAS-REQ-279]` with the exact requirement text quoted.
- [ ] Ensure the scheduler's main loop calls this function once per tick for each `Waiting` stage, guaranteeing the "within one scheduler tick" constraint.
- [ ] Do NOT add any retry logic here — that is handled by separate retry infrastructure. This function only evaluates dependency satisfaction.

## 3. Code Review
- [ ] Verify the transition function is pure (no side effects, no I/O) — it takes state in and returns a new state.
- [ ] Confirm that the function handles the edge case of a dependency name that doesn't exist in the state map (should return an error, not silently skip).
- [ ] Ensure no `unwrap()` or `panic!()` calls — use proper error handling.
- [ ] Verify all public items have doc comments.
- [ ] Check that the implementation matches the state machine diagram in `devs-core` (if one exists).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- dependency_transition_tests` to verify all 8 tests pass.
- [ ] Run `./do lint` to ensure clippy, fmt, and doc standards are met.

## 5. Update Documentation
- [ ] Add or update the module-level doc comment in the state machine module explaining the dependency evaluation rules.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` maps `2_TAS-REQ-278` and `2_TAS-REQ-279` to the new tests.
- [ ] Run `grep -r 'Covers:.*2_TAS-REQ-278' crates/` and `grep -r 'Covers:.*2_TAS-REQ-279' crates/` to confirm annotations exist.
