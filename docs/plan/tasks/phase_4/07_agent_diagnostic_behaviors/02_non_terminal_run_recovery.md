# Task: Implement In-Flight Run Recovery Logic (Sub-Epic: 07_Agent Diagnostic Behaviors)

## Covered Requirements
- [3_MCP_DESIGN-REQ-028], [3_MCP_DESIGN-REQ-049], [3_MCP_DESIGN-REQ-050]

## Dependencies
- depends_on: ["01_diagnostic_investigation_sequence.md"]
- shared_components: [devs-mcp, devs-checkpoint, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-cli/tests/run_recovery_tests.rs` that simulates a session restart with an in-flight workflow run and verifies the following behaviors:
    1. **Test 1.1 - Running Run Detection**: Start a workflow run, then simulate agent session restart. Verify the agent calls `list_runs(status="running")` and correctly identifies the in-flight run.
    2. **Test 1.2 - Run Record Retrieval**: After detecting the running run, verify the agent calls `get_run(run_id)` to retrieve full state including all stage outputs.
    3. **Test 1.3 - Checkpoint Cross-Reference**: Verify the agent calls `list_checkpoints(project_id, run_id)` to cross-reference the run state with committed checkpoints.
    4. **Test 1.4 - No Duplicate Submit**: Verify the agent does NOT call `submit_run` when a resumable running run exists for the same task.
    5. **Test 1.5 - Session Run ID Matching**: Simulate a session with a recorded `run_id` from previous session. Verify the agent matches the found running run with the session's recorded `run_id` to ensure it's resuming its own work (not another agent's run).
    6. **Test 1.6 - Ambiguous State Handling**: Simulate a scenario where multiple running runs exist. Verify the agent logs a warning and requires explicit disambiguation before proceeding.
    7. **Test 1.7 - Traceability Annotation Check**: After recovering a run, verify the agent checks that all test files have valid `// Covers:` annotations (links to REQ-028 test annotation requirement).
- [ ] Use a mock MCP server that tracks all tool calls and can simulate multiple running runs.
- [ ] Verify the priority order: `list_runs` → `get_run` → `list_checkpoints` → `get_stage_output`.

## 2. Task Implementation
- [ ] Implement the run recovery state machine in `crates/devs-cli/src/recovery/run_recovery.rs`:
    - `struct RunRecovery` - manages the recovery process
    - `async fn recover_session(&self, session_id: &str) -> Result<RecoveryResult, RecoveryError>` - executes full recovery sequence
    - `RecoveryResult` enum: `ResumableRun { run: WorkflowRun, last_checkpoint: Checkpoint }`, `NoRunningRuns`, `AmbiguousState { runs: Vec<WorkflowRun> }`, `SessionMismatch { expected_run_id: String, found_run_id: String }`
    - `RecoveryError` enum: `McpConnectionFailed`, `ListRunsFailed`, `GetRunFailed`, `CheckpointReadFailed`
- [ ] Implement step 1 (running runs listing) in `crates/devs-cli/src/recovery/step1_list_runs.rs`:
    - `async fn list_running_runs(mcp: &McpClient, project_id: Option<&str>) -> Result<Vec<WorkflowRunSummary>>`
    - Filter by status="running"
    - Extract: run_id, workflow_name, status, started_at, stages_completed, total_stages
- [ ] Implement step 2 (run record retrieval) in `crates/devs-cli/src/recovery/step2_get_run.rs`:
    - `async fn get_run(mcp: &McpClient, run_id: &str) -> Result<WorkflowRun>`
    - Extract full record including all StageRun records with their statuses and outputs
    - Load workflow snapshot from `workflow_snapshot.json` committed at run start (per workflow snapshotting requirement)
- [ ] Implement step 3 (checkpoint cross-reference) in `crates/devs-cli/src/recovery/step3_checkpoints.rs`:
    - `async fn list_checkpoints(mcp: &McpClient, project_id: &str, run_id: &str) -> Result<Vec<Checkpoint>>`
    - Find the last valid checkpoint (most recent with valid state)
    - Read checkpoint JSON to inspect `WorkflowRun` + `StageRun` records at that point
- [ ] Implement the session run ID matcher in `crates/devs-cli/src/recovery/session_matcher.rs`:
    - `struct SessionMatcher` - matches running runs to session records
    - `match_run_to_session(run: &WorkflowRun, session_run_id: Option<&str>) -> Result<MatchResult>`
    - `MatchResult` enum: `ExactMatch`, `NoSessionRecord`, `Mismatch`, `MultipleRunsFound`
    - Log warning if session files belong to different tasks (per [3_MCP_DESIGN-REQ-060])
- [ ] Implement the duplicate submit guard in `crates/devs-cli/src/recovery/duplicate_guard.rs`:
    - `check_no_resumable_run(running_runs: &[WorkflowRun], session_id: &str) -> Result<(), RecoveryError>`
    - If resumable run found: return error `RUN_EXISTS: Resumable run <run_id> found for session <session_id> - resume instead of submit`
    - Block `submit_run` call until run is cancelled or completed
- [ ] Implement the cancel and resubmit logic in `crates/devs-cli/src/recovery/cancel_resubmit.rs`:
    - `async fn cancel_and_resubmit(mcp: &McpClient, old_run_id: &str, workflow: &str, inputs: &HashMap<String, Value>) -> Result<String>`
    - Call `cancel_run(old_run_id)` and poll until status="Cancelled" (500ms intervals, 30s timeout per [3_MCP_DESIGN-REQ-061])
    - Call `submit_run(workflow, inputs)` with same inputs as cancelled run
    - Return new run_id
- [ ] Implement the traceability annotation checker in `crates/devs-cli/src/recovery/annotation_check.rs`:
    - `check_test_annotations(test_paths: &[Path], spec_paths: &[Path]) -> Result<AnnotationReport>`
    - Verify all test files have valid `// Covers: <REQ-ID>` annotations
    - Link to task 05 (test annotation enforcement) for the actual validation logic
- [ ] Update the session initialization in `crates/devs-cli/src/session/init.rs`:
    - On session start: call `recover_session(session_id)`
    - If `ResumableRun` found: present recovery options to agent (resume, cancel+resubmit, abandon)
    - If `NoRunningRuns`: proceed with normal task flow
    - If `AmbiguousState`: require agent to explicitly select which run to resume
    - If `SessionMismatch`: log warning and require explicit confirmation

## 3. Code Review
- [ ] Ensure that the agent logs a warning and proceeds if session files belong to different tasks (per [3_MCP_DESIGN-REQ-060]).
- [ ] Verify that the recovery tool uses the `WorkflowRun.definition_snapshot` to avoid version mismatch issues (per [3_MCP_DESIGN-REQ-051]).
- [ ] Check that the polling for cancellation uses the correct intervals and timeouts (500ms polling, 30s timeout per [3_MCP_DESIGN-REQ-061]).
- [ ] Confirm that the `// Covers:` annotation check correctly validates requirement IDs against spec documents.
- [ ] Verify that ambiguous state (multiple running runs) is handled safely (no automatic selection).
- [ ] Check that the workflow snapshot is loaded from the checkpoint, not the live definition.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --test run_recovery_tests` to verify recovery sequence.
- [ ] Run `cargo test --package devs-cli --lib recovery` to verify unit tests for each component.
- [ ] Manually test the recovery workflow:
    1. Start a workflow run, let it run 2-3 stages
    2. Simulate session restart (kill agent process, start new session)
    3. Verify agent detects the running run
    4. Verify agent presents recovery options
    5. Verify agent can resume the run without duplicate submit

## 5. Update Documentation
- [ ] Update `docs/agent_development.md` with the following sections:
    - "Session Recovery After Restart" - explain the recovery process
    - "In-Flight Run Detection" - how running runs are found and matched to sessions
    - "Handling Ambiguous State" - what to do when multiple running runs exist
    - "Cancel and Resubmit" - when and how to cancel a run and resubmit
- [ ] Document the recovery priority order:
    1. `list_runs(status="running")` - find all running runs
    2. `get_run(run_id)` - get full state of each running run
    3. `list_checkpoints(project_id, run_id)` - cross-reference with committed state
    4. `get_stage_output(run_id, stage_name)` - inspect specific stage outputs
- [ ] Add example recovery session output:
    ```
    INFO: Recovering session sess-abc123
    INFO: Found 1 running run: run-def456 (workflow: presubmit-check, stages: 3/5)
    INFO: Last checkpoint: cp-003 at 2026-03-14T10:34:00Z, sha: ghi789
    INFO: Session run_id matches found run - safe to resume
    INFO: Recovery complete - run is resumable
    ```

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify all tests pass including the new run recovery tests.
- [ ] Run `./do lint` and verify no clippy warnings or formatting issues in the new code.
- [ ] Verify traceability: ensure all new test functions have `// Covers: 3_MCP_DESIGN-REQ-028` annotation.
- [ ] Run `./do coverage` and verify the new code achieves ≥90% unit coverage.
- [ ] Create an E2E test that simulates session restart with running run (counts toward 50% CLI E2E gate).
