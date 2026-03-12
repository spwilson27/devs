# Task: Implement Global Checkpoint Restoration Service (Sub-Epic: 02_State Recovery and Lifecycle)

## Covered Requirements
- [1_PRD-REQ-031], [2_TAS-REQ-026], [2_TAS-REQ-001]

## Dependencies
- depends_on: [docs/plan/tasks/phase_3/02_state_recovery_and_lifecycle/01_crash_recovery_logic.md]
- shared_components: [devs-checkpoint, devs-config, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-server/src/recovery/` that mocks a `ProjectRegistry` and a `CheckpointStore`.
- [ ] Prepare test data with several mock projects, each having multiple runs in various stages.
- [ ] Call the recovery service and assert that it returns a collection of `WorkflowRun` objects that have had the recovery rules applied.
- [ ] Assert that errors loading one project do not stop the entire recovery process and are logged.

## 2. Task Implementation
- [ ] Implement a `RestorationService` (or similar) in `devs-server` that takes a `ProjectRegistry` and `CheckpointStore` as inputs.
- [ ] Use `devs-config` to get the list of registered projects.
- [ ] For each project, fetch its `checkpoint_branch` and all `checkpoint.json` files using `devs-checkpoint`.
- [ ] Apply the state recovery transformation logic implemented in the previous task.
- [ ] Handle logging of restoration failures per project at the `ERROR` level as required by [2_TAS-REQ-001].
- [ ] Return the fully restored state as a collection of `WorkflowRun`s ready for scheduling.

## 3. Code Review
- [ ] Verify that I/O operations (fetching checkpoints) are done in parallel where possible but respect project boundaries.
- [ ] Check for proper error handling and logging coverage.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-server`

## 5. Update Documentation
- [ ] Update `devs-server` architecture notes explaining how checkpoints are restored during the boot sequence.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `1_PRD-REQ-031` and `2_TAS-REQ-026` are covered by tests.
