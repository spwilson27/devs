# Task: Atomic Cancellation of All Active Stages on WorkflowRun Cancel (Sub-Epic: 084_Detailed Domain Specifications (Part 49))

## Covered Requirements
- [2_TAS-REQ-495]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consume — state machine enums and transition methods), devs-checkpoint (consume — checkpoint persistence)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/state_machine/tests.rs` (or equivalent), write a test `test_cancel_workflow_cancels_all_active_stages_atomically` that:
  1. Creates a `WorkflowRun` with 5 `StageRun` records: one `Waiting`, one `Eligible`, one `Running`, one `Completed`, one `Failed`.
  2. Calls the cancellation method on the `WorkflowRun`.
  3. Asserts the `WorkflowRun` status is now `Cancelled`.
  4. Asserts stages that were `Waiting`, `Eligible`, or `Running` now have status `Cancelled`.
  5. Asserts the `Completed` stage remains `Completed` and the `Failed` stage remains `Failed`.
- [ ] Write a test `test_cancel_workflow_produces_single_checkpoint_snapshot` that:
  1. Creates a `WorkflowRun` with 3 `Running` stages.
  2. Implements a mock/spy `CheckpointWriter` trait that records each call and the full serialized state passed.
  3. Calls the cancellation method.
  4. Asserts exactly one call was made to the checkpoint writer.
  5. Deserializes the written checkpoint and verifies all 3 stages are `Cancelled` in that single write.
- [ ] Write a test `test_cancel_preserves_terminal_stage_states` that:
  1. Creates a `WorkflowRun` with stages in `Completed`, `Failed`, and `Running`.
  2. Cancels the workflow.
  3. Verifies `Completed` and `Failed` stages are untouched; only `Running` becomes `Cancelled`.

## 2. Task Implementation
- [ ] In `devs-core`, add or modify a `cancel(&mut self)` method on `WorkflowRun` that:
  1. Iterates all `StageRun` records.
  2. For each stage with status in `{Waiting, Eligible, Running}`, transitions it to `Cancelled`.
  3. Sets the `WorkflowRun` status to `Cancelled`.
  4. Returns the updated `WorkflowRun` as a single consistent snapshot ready for persistence.
- [ ] Ensure the method performs all mutations before returning — no yield points, no async boundaries, no intermediate persistence calls within the loop.
- [ ] In the caller (scheduler or server layer), pass the complete updated `WorkflowRun` to `CheckpointStore::save_checkpoint` in a single call after `cancel()` returns.
- [ ] Add `// Covers: 2_TAS-REQ-495` annotation to each test.

## 3. Code Review
- [ ] Verify the cancellation method is synchronous (no `.await` between stage updates) to guarantee atomicity within the in-memory state.
- [ ] Confirm that terminal states (`Completed`, `Failed`, `Cancelled`) are never overwritten by the cancellation logic.
- [ ] Verify the checkpoint write receives the full, post-cancellation state — not a reference that could be mutated concurrently.
- [ ] Check that the method is protected by the appropriate lock (workflow run lock) per the shared state concurrency patterns.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- cancel` and verify all new cancellation tests pass.
- [ ] Run `cargo test -p devs-checkpoint` to confirm no regressions in checkpoint logic.

## 5. Update Documentation
- [ ] Add a doc comment on the `WorkflowRun::cancel` method explaining the atomicity guarantee: all active stages are cancelled in a single state mutation before any persistence occurs.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Grep test files for `// Covers: 2_TAS-REQ-495` to verify traceability annotation is present.
