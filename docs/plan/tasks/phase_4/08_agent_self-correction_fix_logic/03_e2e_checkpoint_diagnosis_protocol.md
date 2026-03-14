# Task: Implement E2E Checkpoint Diagnosis Protocol (Sub-Epic: 08_Agent Self-Correction & Fix Logic)

## Covered Requirements
- [3_MCP_DESIGN-REQ-041]

## Dependencies
- depends_on: ["01_agent_session_isolation.md", "02_workflow_snapshot_integrity.md"]
- shared_components: [devs-mcp, devs-checkpoint, devs-cli]

## 1. Initial Test Written
- [ ] Create test file `crates/devs-cli/tests/e2e/e2e_checkpoint_diagnosis_tests.rs` with the following test functions:
    1. `test_agent_reads_checkpoint_on_e2e_failure()`:
        - Create a mock E2E test that intentionally triggers an unexpected state transition (e.g., a stage that should complete but instead fails).
        - Run the E2E test to failure.
        - Assert that the agent's first diagnostic action is to call the filesystem MCP `read_file` tool with path `.devs/runs/<run-id>/checkpoint.json`.
        - Verify the agent does **not** attempt to edit source code before reading the checkpoint.
    
    2. `test_agent_extracts_workflow_and_stage_state_from_checkpoint()`:
        - After the checkpoint is read, assert that the agent parses the JSON and extracts:
            - `workflow_run.state` (e.g., "Failed")
            - `workflow_run.stages[]` array with each stage's `name`, `state`, `exit_code`, `error_message`.
        - Verify the agent identifies the specific stage that diverged from expected behavior.
    
    3. `test_agent_proposes_fix_based_on_checkpoint_data()`:
        - Mock a scenario where the checkpoint shows a stage failed with `exit_code: 1` and `error_message: "Compilation failed"`.
        - Assert that the agent's proposed fix references the specific error from the checkpoint (e.g., "Stage 'build' failed with compilation error in file X").
        - Verify the agent does **not** propose generic fixes unrelated to the checkpoint data.
    
    4. `test_checkpoint_read_is_idempotent_across_retries()`:
        - Simulate a retry loop where the E2E test fails multiple times.
        - Assert that the agent reads the checkpoint only once and caches the result in its internal state.
        - Verify subsequent retries use the cached diagnosis rather than re-reading the file.
    
    5. `test_malformed_checkpoint_handled_gracefully()`:
        - Corrupt the checkpoint JSON file (e.g., truncate mid-file).
        - Run the E2E diagnosis logic.
        - Assert that the agent handles the error gracefully (logs error, falls back to alternative diagnosis) rather than crashing.

## 2. Task Implementation
- [ ] **Step 2.1: Create checkpoint diagnosis module**
    - Create `crates/devs-cli/src/diagnose/checkpoint.rs` with:
        - `pub struct CheckpointDiagnosis { pub run_id: String, pub workflow_state: String, pub failed_stages: Vec<StageFailure> }`
        - `pub struct StageFailure { pub name: String, pub state: String, pub exit_code: Option<i32>, pub error_message: Option<String> }`
        - `pub fn read_checkpoint(run_id: &str, working_dir: &Path) -> Result<CheckpointDiagnosis>` that:
            - Constructs path `.devs/runs/<run-id>/checkpoint.json`
            - Calls filesystem MCP `read_file` tool (or direct file read if MCP not available in test context)
            - Parses JSON and extracts `WorkflowRun` and `StageRun` records
            - Identifies stages with `state != "Completed"` and returns them as failures
        - `pub fn validate_checkpoint_schema(checkpoint: &serde_json::Value) -> Result<()>` that:
            - Asserts `schema_version` field is present and equals `1`
            - Asserts `run_id` field is present and matches expected run_id
            - Asserts `workflow_run` and `stages` fields are present
    
- [ ] **Step 2.2: Integrate diagnosis into agent failure handler**
    - In `crates/devs-cli/src/agent/failure_handler.rs` or equivalent:
        - Add a `Diagnosing` state to the agent's state machine.
        - When an E2E test fails, transition to `Diagnosing` state.
        - Call `read_checkpoint(run_id, working_dir)` as the first diagnostic action.
        - Store the diagnosis result in the agent's internal state (cached for retries).
        - Transition to `Editing` state **only after** diagnosis completes with `"error": null`.
    
- [ ] **Step 2.3: Implement filesystem MCP integration**
    - In `crates/devs-cli/src/mcp/filesystem_client.rs` or equivalent:
        - Add a helper function `pub async fn read_checkpoint_via_mcp(run_id: &str) -> Result<serde_json::Value>` that:
            - Connects to the filesystem MCP server (if available).
            - Calls `read_file` tool with path `.devs/runs/<run-id>/checkpoint.json`.
            - Returns parsed JSON value.
        - Handle the case where filesystem MCP is not available (fall back to direct file read).
    
- [ ] **Step 2.4: Add diagnosis tracking to task_state.json**
    - Update the `task_state.json` schema (from Task 01) to include:
        ```json
        {
          "schema_version": 1,
          "session_id": "<uuid>",
          "state": "Diagnosing",
          "current_task": "<task_name>",
          "diagnosis": {
            "run_id": "<run-id>",
            "checkpoint_read_at": "<ISO8601>",
            "failed_stages": ["stage1", "stage2"],
            "fix_proposed": false
          }
        }
        ```
    - Ensure the diagnosis state is persisted and survives process interruption.
    
- [ ] **Step 2.5: Implement fix proposal logic**
    - In `crates/devs-cli/src/diagnose/fix_generator.rs`:
        - Add `pub fn generate_fix(diagnosis: &CheckpointDiagnosis) -> FixProposal` that:
            - Analyzes the failed stages and error messages.
            - Generates a specific fix proposal (e.g., "Fix compilation error in src/foo.rs line 42").
            - Returns a `FixProposal` struct with `description`, `files_to_edit`, `expected_outcome`.
        - Ensure the fix proposal references specific checkpoint data, not generic templates.

## 3. Code Review
- [ ] Verify the agent uses filesystem MCP for reading checkpoints (as required by §4.5 of Glass-Box design).
- [ ] Confirm diagnosis logic handles missing checkpoint files (returns actionable error, not panic).
- [ ] Confirm diagnosis logic handles malformed JSON (returns parse error with line/column info).
- [ ] Ensure checkpoint access is **read-only** — agent never attempts to write or modify the checkpoint file.
- [ ] Verify that the `Diagnosing → Editing` transition is blocked until `get_stage_output` returns `"error": null` (REQ-BR-009).
- [ ] Check that diagnosis caching prevents redundant checkpoint reads on retry.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --test e2e_checkpoint_diagnosis_tests -- --nocapture`
- [ ] Run `./do test --package devs-cli` to ensure no regressions in other CLI tests.
- [ ] Verify test output shows checkpoint being read before any code edits are proposed.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` §4.5 (E2E Failure Diagnosis) to document:
    - Checkpoint file path `.devs/runs/<run-id>/checkpoint.json`.
    - Diagnosis sequence: read checkpoint → extract state → identify failed stages → propose fix.
    - `Diagnosing` state in agent state machine.
    - Caching behavior for idempotent diagnosis.
- [ ] Update `docs/plan/requirements/3_mcp_design.md` under REQ-041 linking to this task document.
- [ ] Add a diagram to `docs/plan/specs/3_mcp_design.md` showing the E2E failure diagnosis flow.

## 6. Automated Verification
- [ ] Run `./do presubmit` and ensure it passes.
- [ ] Verify `target/traceability.json` includes `3_MCP_DESIGN-REQ-041` as covered.
- [ ] Run `./do coverage --package devs-cli` and verify new test file has >90% line coverage.
- [ ] Run `./do lint` to ensure no clippy warnings in new code.
- [ ] Run `./do test` and verify `target/coverage/report.json` shows aggregate E2E coverage meets the 80% gate (QG-002).
