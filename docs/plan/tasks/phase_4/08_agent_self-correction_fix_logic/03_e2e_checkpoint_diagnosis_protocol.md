# Task: Implement E2E Checkpoint Diagnosis Protocol (Sub-Epic: 08_Agent Self-Correction & Fix Logic)

## Covered Requirements
- [3_MCP_DESIGN-REQ-041]

## Dependencies
- depends_on: [01_agent_session_isolation.md, 02_workflow_snapshot_integrity.md]
- shared_components: [devs-mcp, devs-checkpoint]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-cli/tests/e2e_diagnosis_tests.rs` that:
    1. Simulate an E2E test failure involving an unexpected state transition (e.g., a stage transitions to `Failed` instead of `Completed`).
    2. Verify that the agent (or orchestrator) automatically reads the checkpoint file from `.devs/runs/<run-id>/checkpoint.json` via the filesystem MCP as its first diagnostic step (REQ-041).
    3. Verify that the agent successfully extracts the `WorkflowRun` and `StageRun` records from the checkpoint to identify the exact point of divergence.
    4. Mock a "diagnosed" state transition error and verify that the agent proposes a fix based on the checkpoint data rather than speculative code edits.

## 2. Task Implementation
- [ ] Implement the E2E diagnosis logic in `crates/devs-cli/src/diagnose/checkpoint.rs` as specified in §4.5 of the Glass-Box design.
- [ ] Add the logic to the agent's failure handling routine to:
    1. Detect an E2E test failure.
    2. Retrieve the `run_id` for the failed E2E run.
    3. Call the filesystem MCP `read_file` tool to load `.devs/runs/<run-id>/checkpoint.json`.
    4. Parse the checkpoint and compare the actual run state with the expected state defined in the TUI/CLI/MCP E2E test expectations.
- [ ] Ensure the agent's "Diagnosing" state correctly tracks the findings from the checkpoint analysis to prevent re-reading on retry.

## 3. Code Review
- [ ] Verify that the agent uses the filesystem MCP for reading checkpoints as required by §4.5.
- [ ] Confirm that the diagnosis logic correctly handles missing or malformed checkpoint files without crashing.
- [ ] Ensure that the agent does not attempt to modify the checkpoint file (access should be read-only).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test e2e_diagnosis_tests` to verify the diagnostic protocol.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` to formalize the checkpoint analysis sequence for E2E failures.

## 6. Automated Verification
- [ ] Run `./do test --package devs-cli` and ensure 100% pass rate for diagnosis tests.
