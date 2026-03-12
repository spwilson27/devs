# Task: Implement In-Flight Run Recovery Logic (Sub-Epic: 07_Agent Diagnostic Behaviors)

## Covered Requirements
- [3_MCP_DESIGN-REQ-028]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-checkpoint]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-cli/tests/recovery_tests.rs` that simulates a session restart with an in-flight workflow run.
- [ ] Verify that the agent correctly calls `list_runs(status=running)` and `get_run` for the in-flight run before submitting any new work.
- [ ] Test the priority order for reconstruction: 
    1. `list_runs` (running).
    2. `get_run` (outputs/status).
    3. `list_checkpoints` (state).
- [ ] Verify that the agent does NOT call `submit_run` when a resumable run exists.

## 2. Task Implementation
- [ ] Implement the task recovery state machine in a script or tool (e.g., `crates/devs-cli/src/recovery.rs`) as defined in [3_MCP_DESIGN-REQ-NEW-026].
- [ ] Implement the call sequence: `list_runs` -> `get_run` -> `get_stage_output`.
- [ ] Add logic to cross-reference found runs with the session's recorded `run_id` (from previous sessions, if available) to ensure the agent only resumes its own work.
- [ ] Implement the `cancel_run` and resubmission logic for non-resumable runs (e.g., storage corruption or ambiguous state).

## 3. Code Review
- [ ] Ensure that the agent logs a warning and proceeds if session files belong to different tasks (per [3_MCP_DESIGN-REQ-060]).
- [ ] Verify that the recovery tool uses the `WorkflowRun.definition_snapshot` to avoid version mismatch issues as per [3_MCP_DESIGN-REQ-051].
- [ ] Check that the polling for cancellation uses the correct intervals and timeouts (500 ms / 30 s) as per [3_MCP_DESIGN-REQ-061].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test recovery_tests` to verify the recovery sequence.

## 5. Update Documentation
- [ ] Document the session recovery procedure in the project's development workflow guide.

## 6. Automated Verification
- [ ] Run `./do test --package devs-cli` and ensure all recovery-related tests pass.
