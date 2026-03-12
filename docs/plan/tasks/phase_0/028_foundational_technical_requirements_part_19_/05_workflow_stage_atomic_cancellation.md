# Task: Implement Atomic Workflow-to-Stage Cancellation (Sub-Epic: 028_Foundational Technical Requirements (Part 19))

## Covered Requirements
- [2_TAS-REQ-020B]

## Dependencies
- depends_on: [04_state_machine_transition_validation.md]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-core/tests/workflow_cancellation.rs`.
- [ ] Setup a `WorkflowRun` with multiple stages in `Waiting`, `Eligible`, and `Running` states.
- [ ] Transition the `WorkflowRun` to `Cancelled`.
- [ ] Verify that ALL non-terminal `StageRun` records (those NOT in `Completed`, `Failed`, `TimedOut`, `Cancelled`) are transitioned to `Cancelled` in the **same atomic write** to `checkpoint.json`.
- [ ] Verify that terminal stages (e.g., `Completed`) are NOT modified.

## 2. Task Implementation
- [ ] Implement the `cancel_workflow` method or a transition hook in `devs-core/src/state_machine/workflow.rs`.
- [ ] Implement logic to identify non-terminal `StageRun` records within the current `WorkflowRun`.
- [ ] Perform a bulk state update for all identified stages and the workflow run itself.
- [ ] Ensure that this bulk update is passed to `devs-checkpoint` as a single unit of work (e.g., using a single call to `checkpoint_store.write(...)`).
- [ ] Confirm no intermediate checkpoints with partial cancellation are ever written.

## 3. Code Review
- [ ] Verify that the definition of "terminal" matches exactly: `Completed`, `Failed`, `TimedOut`, `Cancelled`.
- [ ] Confirm that `Cancelled` status is correctly applied to `Waiting`, `Eligible`, and `Running` stages.
- [ ] Check for potential race conditions if stages are transitioning while the workflow is being cancelled.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.
- [ ] Verify that the cancellation test passes and all non-terminal stages transition correctly.
- [ ] Confirm the atomic nature by mocking the checkpoint store and asserting it only receives a single write request for the entire cancellation.

## 5. Update Documentation
- [ ] Document the workflow cancellation behavior and its atomic guarantees in the project architecture or `devs-core` documentation.

## 6. Automated Verification
- [ ] Use `insta` or a similar tool to snapshot the `checkpoint.json` content after a workflow cancellation and verify it contains all expected transitions.
