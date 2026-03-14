# Task: Implement Workflow Definition Snapshot Integrity (Sub-Epic: 08_Agent Self-Correction & Fix Logic)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-007]

## Dependencies
- depends_on: ["01_agent_session_isolation.md"]
- shared_components: [devs-core, devs-checkpoint, devs-mcp, devs-scheduler]

## 1. Initial Test Written
- [ ] Create test file `crates/devs-mcp/tests/e2e/workflow_snapshot_integrity_tests.rs` with the following test functions:
    1. `test_definition_snapshot_matches_checkpoint_file()`:
        - Submit a workflow run using `devs submit presubmit-check --name test-snapshot`.
        - Wait for run to reach `Running` state.
        - Call MCP `get_run(run_id)` and extract `definition_snapshot` field.
        - Read the checkpoint file from `.devs/runs/<run-id>/checkpoint.json` (or `.devs/runs/<run-id>/workflow_snapshot.json`).
        - Assert that the `definition_snapshot` in the MCP response exactly matches the JSON content of the checkpoint file (byte-for-byte or canonicalized JSON comparison).
    
    2. `test_snapshot_immutable_after_run_starts()`:
        - Submit a workflow run with a known workflow definition (e.g., `build-only.toml`).
        - Wait for run to reach `Running` state (first stage started).
        - Modify the workflow definition file on disk (e.g., add a comment or change a prompt string).
        - Call MCP `get_run(run_id)` again.
        - Assert that `definition_snapshot` still returns the **original** definition, not the modified version.
        - Assert that the snapshot hash/ID remains unchanged.
    
    3. `test_snapshot_persists_across_server_restart()`:
        - Submit a workflow run and let it reach `Running` state.
        - Stop the `devs-server` process gracefully (SIGTERM).
        - Restart `devs-server`.
        - Call MCP `get_run(run_id)` after restart.
        - Assert that `definition_snapshot` is still present and matches the original snapshot (not lost on restart).
        - Verify the snapshot is loaded from the checkpoint branch, not from in-memory state.
    
    4. `test_get_run_schema_includes_definition_snapshot()`:
        - Assert that the `get_run` MCP tool response includes a `definition_snapshot` field.
        - Validate the field is not `null` and contains a valid workflow definition structure.
        - Assert field presence (not just non-null) as required by REQ-BR-006.

## 2. Task Implementation
- [ ] **Step 2.1: Ensure WorkflowRun stores snapshot**
    - In `crates/devs-core/src/state.rs` or `crates/devs-core/src/workflow.rs`:
        - Verify `WorkflowRun` struct has a `definition_snapshot: WorkflowDefinition` field.
        - If not present, add the field and update constructors.
        - Ensure the snapshot is cloned (not referenced) at run creation time.
    
- [ ] **Step 2.2: Atomic snapshot write at run start**
    - In `crates/devs-checkpoint/src/store.rs` or `crates/devs-checkpoint/src/snapshot.rs`:
        - Implement `pub fn snapshot_workflow_definition(run_id: &str, definition: &WorkflowDefinition) -> Result<SnapshotId>` that:
            - Creates directory `.devs/runs/<run-id>/` on the checkpoint branch.
            - Writes `workflow_snapshot.json` atomically (temp file + rename).
            - Commits to git with message `"Snapshot workflow definition for run <run-id>"`.
        - Call this function in the scheduler's `submit_run` logic **before** dispatching the first stage.
        - Ensure the snapshot is written to the **checkpoint branch** (configured per project, may be working branch or dedicated state branch).
    
- [ ] **Step 2.3: Update MCP get_run tool**
    - In `crates/devs-mcp/src/tools/workflow.rs` or `crates/devs-mcp/src/handlers.rs`:
        - Locate the `get_run` MCP tool implementation.
        - Ensure the response includes `definition_snapshot` field populated from `WorkflowRun.definition_snapshot`.
        - **Do NOT** re-read the definition from filesystem — use the in-memory snapshot stored in `WorkflowRun`.
        - Add schema validation to ensure the field is always present (not optional).
    
- [ ] **Step 2.4: Enforce snapshot immutability**
    - In `crates/devs-scheduler/src/run_manager.rs` or equivalent:
        - Add a guard that prevents modification of `definition_snapshot` after run transitions from `Pending` to `Running`.
        - Add a test that attempts to modify the snapshot and asserts it fails.
    
- [ ] **Step 2.5: Restore snapshot on server restart**
    - In `crates/devs-checkpoint/src/restore.rs`:
        - Ensure `restore_checkpoints()` reads `workflow_snapshot.json` for each run.
        - Populate `WorkflowRun.definition_snapshot` from the file.
        - Verify the restored snapshot matches the git history (integrity check).

## 3. Code Review
- [ ] Verify snapshot is captured **before** the first stage is dispatched (check lock acquisition order: snapshot write → stage dispatch).
- [ ] Confirm `get_run` response schema in protobuf (`devs-proto/src/proto/workflow.proto`) includes `definition_snapshot` as a required field.
- [ ] Ensure large workflow definitions (e.g., 100+ stages) do not cause performance issues in `get_run` (measure latency).
- [ ] Verify atomic write pattern: temp file → fsync → rename → git commit.
- [ ] Check that snapshot is never re-read from disk after run starts (always from in-memory `WorkflowRun`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-mcp --test workflow_snapshot_integrity_tests -- --nocapture`
- [ ] Run `./do test --package devs-checkpoint` to ensure checkpoint write/restore logic is correct.
- [ ] Run `./do test --package devs-scheduler` to ensure run state machine handles snapshot correctly.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` §4.9 (Glass-Box MCP Tools) to document:
    - `definition_snapshot` field in `get_run` response schema.
    - Snapshot immutability guarantee after run starts.
    - Filesystem path `.devs/runs/<run-id>/workflow_snapshot.json`.
- [ ] Add schema version to the snapshot file format documentation.
- [ ] Update `docs/plan/requirements/3_mcp_design.md` under REQ-BR-007 linking to this task document.

## 6. Automated Verification
- [ ] Run `./do presubmit` and ensure it passes.
- [ ] Verify `target/traceability.json` includes `3_MCP_DESIGN-REQ-BR-007` as covered.
- [ ] Run `./do coverage --package devs-mcp` and verify new test file has >90% line coverage.
- [ ] Run `./do lint` to ensure no clippy warnings in new code.
