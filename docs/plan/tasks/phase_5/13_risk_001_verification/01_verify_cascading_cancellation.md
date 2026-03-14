# Task: Verify Atomic Transitive Cancellation on Stage Failure (Sub-Epic: 13_Risk 001 Verification)

## Covered Requirements
- [AC-RISK-001-05]

## Dependencies
- depends_on: []
- shared_components: [devs-core, devs-scheduler, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-scheduler/tests/cancellation_tests.rs` that defines a DAG with at least three levels: Stage A -> Stage B -> Stage C.
- [ ] Mock Stage A to complete with a `Failure` exit code.
- [ ] The test should use a mock `CheckpointStore` that records every write attempt.
- [ ] Assert that a single call to `stage_complete_tx` for Stage A results in exactly one `Checkpoint` write that reflects both Stage A as `Failed` AND Stages B and C as `Cancelled`.
- [ ] Verify the test fails initially because downstream stages are not yet atomically cancelled.

## 2. Task Implementation
- [ ] Modify the `StateMachine` in `devs-core` to include a recursive `cancel_downstream` method that identifies all reachable stages in the transitive fan-out of a failed stage.
- [ ] Update the `stage_complete_tx` logic in the scheduler to invoke this transitive cancellation BEFORE committing the checkpoint.
- [ ] Ensure the entire state transition (A: Failed, B: Cancelled, C: Cancelled) happens within the same `StateTransaction`.
- [ ] Verify that the `CheckpointStore` receives the updated state in a single atomic operation.

## 3. Code Review
- [ ] Verify that the transitive cancellation correctly handles complex DAG structures (e.g., diamonds, multiple entry points).
- [ ] Ensure that stages already in a terminal state (Completed, Failed, Cancelled) are not re-processed.
- [ ] Check that the `checkpoint.json` schema correctly reflects the `Cancelled` state for all affected stages.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-scheduler --test cancellation_tests`
- [ ] Ensure all existing scheduler tests pass to prevent regressions in standard DAG flow.

## 5. Update Documentation
- [ ] Update `docs/plan/requirements/8_risks_mitigation.md` to link `AC-RISK-001-05` to the new integration test.
- [ ] Add a comment to the `StateMachine` implementation explaining the atomic transitive cancellation requirement for `RISK-001`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the test annotated with `// Covers: AC-RISK-001-05` passes.
- [ ] Validate the `checkpoint.json` output of the test using a JSON schema validator to ensure structural integrity.
