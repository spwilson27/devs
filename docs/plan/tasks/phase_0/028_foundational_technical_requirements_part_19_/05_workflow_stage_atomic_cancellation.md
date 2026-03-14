# Task: Implement Atomic Cascade Cancellation of Non-Terminal Stages (Sub-Epic: 028_Foundational Technical Requirements (Part 19))

## Covered Requirements
- [2_TAS-REQ-020B]

## Dependencies
- depends_on: [04_state_machine_transition_validation.md]
- shared_components: [devs-core (owner — extends state machine with cascade logic), devs-checkpoint (consumer — uses atomic checkpoint write)]

## 1. Initial Test Written
- [ ] Create `devs-core/tests/cascade_cancellation.rs` (integration test) with the following test cases:

### Basic cascade on Cancelled
- [ ] **Test: workflow Cancelled cascades to all non-terminal stages** — Set up a `WorkflowRun` with 5 stages: stage-A (`Completed`), stage-B (`Running`), stage-C (`Waiting`), stage-D (`Eligible`), stage-E (`Failed`). Transition the workflow to `Cancelled`. Assert: stage-A remains `Completed` (terminal), stage-B becomes `Cancelled`, stage-C becomes `Cancelled`, stage-D becomes `Cancelled`, stage-E remains `Failed` (terminal).

### Basic cascade on Failed
- [ ] **Test: workflow Failed cascades to all non-terminal stages** — Same setup but transition workflow to `Failed`. Assert: stage-B (`Running`) → `Cancelled`, stage-C (`Waiting`) → `Cancelled`, stage-D (`Eligible`) → `Cancelled`. Terminal stages (stage-A `Completed`, stage-E `Failed`) unchanged.

### Terminal stage preservation
- [ ] **Test: Completed stages are NOT modified** — Workflow has 3 stages all `Completed`. Transition workflow to `Cancelled`. Assert all 3 stages remain `Completed`.
- [ ] **Test: TimedOut stages are NOT modified** — Stage in `TimedOut` state. Workflow transitions to `Failed`. Assert stage remains `TimedOut`.
- [ ] **Test: already-Cancelled stages are NOT modified** — Stage already `Cancelled`. Workflow transitions to `Cancelled`. Assert stage remains `Cancelled` (no error, no double-transition).

### Paused stage cascade
- [ ] **Test: Paused stages are cancelled** — Stage in `Paused` state (non-terminal). Workflow transitions to `Cancelled`. Assert stage becomes `Cancelled`.

### Atomicity verification
- [ ] **Test: single checkpoint write for workflow + all stages** — Use a mock checkpoint writer that records every call. Transition workflow with 4 non-terminal stages to `Cancelled`. Assert the checkpoint writer received exactly ONE call containing the workflow status AND all 4 stage status updates. NOT 5 separate calls.
- [ ] **Test: no partial checkpoint on error** — Mock checkpoint writer that fails (returns error). Attempt cascade cancellation. Assert that no stage transitions are visible (state is rolled back or never applied externally). The in-memory states should reflect the pre-cancellation state since the checkpoint failed.

### Edge cases
- [ ] **Test: workflow with zero stages** — Transition workflow to `Cancelled`. Assert it succeeds with no stage updates.
- [ ] **Test: workflow with all stages terminal** — All stages in `Completed`/`Failed`/`TimedOut`/`Cancelled`. Transition workflow to `Cancelled`. Assert success, no stage modifications, checkpoint write contains only the workflow transition.

- [ ] Mark all tests with `// Covers: 2_TAS-REQ-020B`.

## 2. Task Implementation
- [ ] Add a method to the workflow run type in `devs-core/src/state_machine/workflow.rs`:
  ```rust
  pub fn cancel_with_cascade(&mut self, stages: &mut [StageRun]) -> CascadeResult {
      // 1. Validate workflow can transition to target state (Cancelled or Failed)
      // 2. Collect all non-terminal stages
      // 3. Build a CascadeResult containing:
      //    - The workflow transition
      //    - All stage transitions (from current → Cancelled)
      // 4. Apply all transitions in memory
      // 5. Return CascadeResult for atomic checkpoint write
  }
  ```
- [ ] Define `CascadeResult` struct:
  ```rust
  pub struct CascadeResult {
      pub workflow_transition: (WorkflowRunStatus, WorkflowRunStatus), // (from, to)
      pub stage_transitions: Vec<(String, StageRunStatus, StageRunStatus)>, // (stage_name, from, to)
  }
  ```
- [ ] The `CascadeResult` is passed as a single unit to the checkpoint writer. The checkpoint writer serializes the entire workflow state (workflow + all stages) in one atomic `checkpoint.json` write (temp file + rename).
- [ ] Terminal stage check: `fn is_terminal(status: &StageRunStatus) -> bool` matches exactly `Completed | Failed | TimedOut | Cancelled`. This reuses the `is_terminal()` method from the `StateMachine` trait implemented in task 04.
- [ ] If any individual stage transition would be illegal (which shouldn't happen since we're going from non-terminal to Cancelled, and all non-terminal states can transition to Cancelled per the spec), return an error without applying any transitions.
- [ ] If the checkpoint write fails, the caller must handle the error. The in-memory state will already reflect the transitions (this is acceptable since the caller can retry the checkpoint write or crash — documented as a design decision).

## 3. Code Review
- [ ] Verify the terminal set is exactly `{Completed, Failed, TimedOut, Cancelled}` — no other states are excluded from cancellation.
- [ ] Verify `Paused` is NOT in the terminal set (it should be cancelled).
- [ ] Verify the checkpoint write receives ALL transitions (workflow + stages) in a single call.
- [ ] Verify no intermediate checkpoint is written between the workflow transition and the stage transitions.
- [ ] Verify the cascade only fires when the workflow transitions to `Failed` or `Cancelled` — not for any other terminal state like `Completed`.
- [ ] Verify `Completed` workflow transition does NOT cascade-cancel stages (all stages should already be terminal if the workflow completed).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- cascade_cancellation` and confirm all tests pass.
- [ ] Run `cargo test -p devs-core` (full suite) to ensure no regressions.

## 5. Update Documentation
- [ ] Add doc comments to `cancel_with_cascade` explaining the atomicity guarantee and terminal state definition.
- [ ] Add `// Covers: 2_TAS-REQ-020B` to each test.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- cascade_cancellation --no-fail-fast` and assert exit code 0.
- [ ] Run `grep -rn '2_TAS-REQ-020B' devs-core/` and verify at least one match.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and assert exit code 0.
