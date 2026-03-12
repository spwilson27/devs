# Task: Implement Fan-out Expansion logic (Sub-Epic: 032_Foundational Technical Requirements (Part 23))

## Covered Requirements
- [2_TAS-REQ-030C]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-scheduler/src/fan_out.rs` (or equivalent) that mocks a fan-out stage with `N=3`.
- [ ] Verify that when `expand_fan_out` is called, it returns a list of 3 `StageRun` objects.
- [ ] Verify that each `StageRun` has the correct `fan_out_index` (0, 1, 2) and the same `stage_name`.
- [ ] Create a test for the completion logic: Verify that the parent stage remains `Running` until the 3rd sub-run completes.
- [ ] Verify that if index 1 fails, the parent `StageRun` records index 1 in its `failed_indices` and transitions to `Failed` (assuming no custom merge handler).

## 2. Task Implementation
- [ ] Define the `fan_out_index` field in the `StageRun` struct (likely in `devs-core` or `devs-scheduler`).
- [ ] Implement `fan_out_sub_runs` field (a `Vec<StageRun>`) on the parent `StageRun` struct to store sub-executions.
- [ ] Implement the `expand_fan_out` function in `devs-scheduler` that performs the expansion logic.
- [ ] Implement the terminal-state tracking logic: Use a counter or check the `fan_out_sub_runs` array to determine if all sub-executions are done.
- [ ] Implement the default failure logic: If any sub-execution fails, mark the parent as `Failed` and populate the error payload with `failed_indices`.
- [ ] Ensure that sub-executions are treated as independent dispatchable units but linked to the parent for state tracking.

## 3. Code Review
- [ ] Verify that `StageRun` is NOT duplicated in the top-level `WorkflowRun.stage_runs` for sub-executions; they must stay within `fan_out_sub_runs`.
- [ ] Ensure that the logic handles the case where `N=0` (though validation should prevent this).
- [ ] Verify that the implementation follows the state machine transitions defined in [2_TAS-REQ-030C].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler` to verify the fan-out expansion and completion logic.

## 5. Update Documentation
- [ ] Update `devs-scheduler`'s internal documentation (doc comments) explaining the fan-out expansion mechanism.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure no regressions and 100% traceability.
