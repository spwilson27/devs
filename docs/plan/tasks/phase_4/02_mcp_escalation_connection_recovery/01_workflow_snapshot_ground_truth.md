# Task: Agent Workflow Snapshot Ground Truth (Sub-Epic: 02_MCP Escalation & Connection Recovery)

## Covered Requirements
- [3_MCP_DESIGN-REQ-051]
- [3_MCP_DESIGN-REQ-NEW-028]
- [3_MCP_DESIGN-REQ-NEW-029]
- [3_MCP_DESIGN-REQ-062]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (WorkflowDefinition types), devs-checkpoint (snapshot storage), devs-mcp (filesystem MCP tools)]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-core/tests/agent_recovery.rs` that validates snapshot-based debugging behavior.
- [ ] The test MUST verify the following scenarios:
    - [ ] **Scenario 1: Snapshot exists and differs from live definition**
        - [ ] Create a mock workflow run with `run_id = "550e8400-e29b-41d4-a716-446655440000"`.
        - [ ] Write `workflow_snapshot.json` to `.devs/runs/550e8400-e29b-41d4-a716-446655440000/workflow_snapshot.json` with:
            - `schema_version: 1`
            - `captured_at: "2026-03-10T14:23:05.123Z"`
            - `run_id: "550e8400-e29b-41d4-a716-446655440000"`
            - `definition` containing a stage named `"plan"` with `prompt: "Plan the feature..."`
        - [ ] Mock the live workflow definition to have a different stage name (e.g., `"planning"`) and different prompt.
        - [ ] Call the agent's `read_workflow_snapshot(run_id)` function.
        - [ ] Assert that the returned definition contains `"plan"` (from snapshot), NOT `"planning"` (from live).
        - [ ] Assert that `captured_at` and `schema_version` fields are correctly parsed.
    - [ ] **Scenario 2: Snapshot missing for non-terminal run**
        - [ ] Create a run with `run_id` that has no `workflow_snapshot.json`.
        - [ ] Mock `list_checkpoints` to return an empty array.
        - [ ] Assert that the agent logs `ERROR: snapshot missing for run <id>` and does NOT fall back to live definition.
        - [ ] Assert that the agent would call `cancel_run` for this run (per [3_MCP_DESIGN-REQ-062]).
    - [ ] **Scenario 3: Malformed snapshot JSON**
        - [ ] Write a `workflow_snapshot.json` with invalid JSON syntax.
        - [ ] Assert that parsing fails with a descriptive error, NOT a panic.
        - [ ] Assert that the agent does NOT fall back to the live definition.
    - [ ] **Scenario 4: Schema version mismatch**
        - [ ] Write a `workflow_snapshot.json` with `schema_version: 2` (unsupported).
        - [ ] Assert that the agent rejects the file with `ERROR: unsupported schema_version 2`.

## 2. Task Implementation
- [ ] Implement the `read_workflow_snapshot` function in `crates/devs-core/src/agent/diagnostics.rs` (or equivalent module).
- [ ] The function signature MUST be:
    ```rust
    pub async fn read_workflow_snapshot(
        run_id: &str,
        checkpoint_branch: &str,
        mcp_client: &dyn McpClient,
    ) -> Result<WorkflowSnapshot, AgentDiagnosticError>
    ```
- [ ] The `WorkflowSnapshot` struct MUST match the schema from §5.3.1:
    ```rust
    pub struct WorkflowSnapshot {
        pub schema_version: u32,
        pub captured_at: DateTime<Utc>,
        pub run_id: String,
        pub definition: WorkflowDefinition,
    }
    ```
- [ ] Implementation MUST:
    - [ ] Construct the path: `.devs/runs/<run-id>/workflow_snapshot.json` on the checkpoint branch.
    - [ ] Use the filesystem MCP `read_file` tool to retrieve content.
    - [ ] Parse JSON with strict schema validation:
        - [ ] Reject if `schema_version != 1`.
        - [ ] Reject if `run_id` does not match the requested run.
        - [ ] Reject if `captured_at` is not valid RFC 3339.
        - [ ] Reject if `definition` is missing or malformed.
    - [ ] Return `AgentDiagnosticError::SnapshotMissing` if file does not exist.
    - [ ] Return `AgentDiagnosticError::SnapshotMalformed(String)` if parsing fails.
    - [ ] **NEVER** fall back to the live workflow definition for debugging existing runs.
- [ ] Implement the `handle_missing_snapshot` function per [3_MCP_DESIGN-REQ-062]:
    - [ ] Call `list_checkpoints(run_id)` via MCP.
    - [ ] If zero commits exist, log `ERROR: no checkpoints for run <id>` and recommend `cancel_run`.
    - [ ] If commits exist but no snapshot file, attempt to retrieve `workflow_snapshot.json` from the earliest commit.
- [ ] Integrate into the agent's `diagnose_run_failure` loop:
    - [ ] As the first step, call `read_workflow_snapshot(run_id)`.
    - [ ] Use the snapshot's stage names, dependencies, and configuration for all diagnostic reasoning.
    - [ ] Log which snapshot version is being used for transparency.

## 3. Code Review
- [ ] Verify that no code path allows falling back to the live configuration when debugging an existing run.
- [ ] Ensure `WorkflowDefinition` parsing correctly handles `null` fields vs absent fields per [3_MCP_DESIGN-REQ-NEW-028].
- [ ] Confirm that the checkpoint branch is correctly used as the source for the snapshot (not the working branch unless configured).
- [ ] Verify that all error cases are handled without panics and with descriptive error messages.
- [ ] Check that the `captured_at` timestamp is parsed and validated correctly (RFC 3339 with `Z` suffix).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test agent_recovery` and ensure all scenarios pass.
- [ ] Run `cargo test -p devs-core --lib agent::diagnostics` to verify unit tests.
- [ ] Verify that no tests are marked `#[ignore]` or `#[skip]`.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` section 5.3 to confirm implementation matches spec.
- [ ] Add a code example to `crates/devs-core/src/agent/diagnostics.rs` showing usage of `read_workflow_snapshot`.
- [ ] Document the error types in `AgentDiagnosticError` with clear guidance on how agents should respond to each.

## 6. Automated Verification
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-051" crates/devs-core/` to verify traceability annotations are present in both implementation and tests.
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-NEW-028" crates/devs-core/` to verify schema validation is covered.
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-062" crates/devs-core/` to verify missing-snapshot handling is covered.
- [ ] Run `./do test` and verify `target/traceability.json` shows these requirements as `"covered": true`.
