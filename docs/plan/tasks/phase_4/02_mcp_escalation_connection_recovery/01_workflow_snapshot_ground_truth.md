# Task: Agent Workflow Snapshot Ground Truth (Sub-Epic: 02_MCP Escalation & Connection Recovery)

## Covered Requirements
- [3_MCP_DESIGN-REQ-051]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-checkpoint, devs-mcp]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-core/tests/agent_recovery.rs` (or equivalent agent-logic test file) that simulates a debugging scenario.
- [ ] The test should:
    - [ ] Create a mock workflow run with a specific `run_id`.
    - [ ] Write a `workflow_snapshot.json` to `.devs/runs/<run-id>/workflow_snapshot.json` containing a known workflow definition.
    - [ ] Modify the "live" workflow definition in the project configuration to be different from the snapshot.
    - [ ] Assert that when the agent's "diagnose failure" function is called for that `run_id`, it explicitly reads the snapshot file via the filesystem MCP rather than using the live configuration.
    - [ ] Verify that the agent uses the snapshot's stage names and dependencies for its diagnostic reasoning.

## 2. Task Implementation
- [ ] Implement the `read_workflow_snapshot` method in the agent's diagnostic module (likely in `crates/devs-core/src/agent/diagnostics.rs`).
- [ ] The method MUST:
    - [ ] Construct the path `.devs/runs/<run-id>/workflow_snapshot.json`.
    - [ ] Use the filesystem MCP `read_file` tool to retrieve the content.
    - [ ] Parse the content as a `WorkflowDefinition` (schema version 1).
    - [ ] Log an error if the file is missing or malformed, but do NOT fall back to the live definition for debugging old runs.
- [ ] Ensure the agent's `diagnose_run_failure` loop calls this method as the first step when `run_id` is provided.
- [ ] Implementation MUST follow the "Glass-Box" invariant that the snapshot is the ground truth for in-flight or completed runs.

## 3. Code Review
- [ ] Verify that no "live" configuration is used when the intent is to debug an existing run.
- [ ] Ensure the `WorkflowDefinition` parsing correctly handles `null` fields vs absent fields per [3_MCP_DESIGN-REQ-NEW-028].
- [ ] Confirm that the checkpoint branch is correctly used as the source for the snapshot.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test agent_recovery` and ensure the snapshot-priority test passes.

## 5. Update Documentation
- [ ] Update `docs/plan/summaries/3_mcp_design.md` or internal agent documentation to reflect that the agent now strictly enforces snapshot-based debugging.

## 6. Automated Verification
- [ ] Run `grep -r "3_MCP_DESIGN-REQ-051" crates/devs-core/` to verify traceability annotations are present in both implementation and tests.
