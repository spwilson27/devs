# Task: Implement Workflow Definition Snapshot Integrity (Sub-Epic: 08_Agent Self-Correction & Fix Logic)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-007]

## Dependencies
- depends_on: [01_agent_session_isolation.md]
- shared_components: [devs-core, devs-checkpoint, devs-mcp]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/snapshot_tests.rs` for `get_run`:
    1. Verify that `definition_snapshot` in the `get_run` response exactly matches the `workflow_snapshot.json` stored in the checkpoint directory `.devs/runs/<run-id>/`.
    2. Start a workflow, modify the workflow definition on disk while it's `Running`, and verify that `get_run` still returns the original snapshot, not the updated version (REQ-BR-007).
    3. Verify that the snapshot remains consistent even after a server restart (reading from the checkpoint branch).

## 2. Task Implementation
- [ ] In `crates/devs-core/src/state.rs`, ensure that the `WorkflowRun` stores the complete `WorkflowDefinition` at the time of creation as a snapshot.
- [ ] In `crates/devs-checkpoint/src/store.rs`, implement atomic writing of the `workflow_snapshot.json` to the project's state branch at the beginning of a run.
- [ ] In the MCP `get_run` tool (`crates/devs-mcp/src/tools/workflow.rs`), ensure that the `definition_snapshot` field is populated from the run's stored snapshot, not by re-reading the definition from the filesystem.
- [ ] Implement a validation check that ensures the snapshot is immutable after the run transitions from `Pending` to `Running`.

## 3. Code Review
- [ ] Verify that the snapshot is captured *before* the first stage is dispatched.
- [ ] Confirm that `get_run` response schema explicitly includes the `definition_snapshot` field as required by §4.9.1.
- [ ] Ensure that large snapshots do not cause performance regressions in `get_run`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test snapshot_tests` to verify snapshot immutability and consistency.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` with the snapshot schema version.

## 6. Automated Verification
- [ ] Run `./do test --package devs-mcp` and ensure all snapshot tests pass.
