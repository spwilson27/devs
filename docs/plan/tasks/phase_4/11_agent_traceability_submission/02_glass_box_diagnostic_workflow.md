# Task: Glass-Box Diagnostic Workflow Implementation (Sub-Epic: 11_Agent Traceability & Submission)

## Covered Requirements
- [3_MCP_DESIGN-REQ-038]

## Dependencies
- depends_on: ["01_agent_log_streaming_error_tracking.md"]
- shared_components: [devs-proto, devs-grpc, devs-mcp, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an E2E test case `tests/e2e/test_glass_box_diagnosis.rs` that simulates a runtime logic failure (e.g., a logic regression in the `devs-scheduler` detected by a test stage).
- [ ] The test must verify that the agent executes the mandatory Glass-Box inspection sequence:
    1.  `submit_run` for a regression test or a task.
    2.  `stream_logs(follow: true)` until failure.
    3.  `get_stage_output` to retrieve full captured output (stdout, stderr, structured).
    4.  `get_run` to inspect overall run status and cross-stage results.
    5.  `list_checkpoints` to verify the state of the git-backed persistence at the time of failure.
- [ ] The test must confirm that the agent does not attempt a fix until this entire sequence is completed and the results are reconciled.

## 2. Task Implementation
- [ ] Formally define the Glass-Box diagnostic protocol as a standard workflow or prompt template in `.devs/workflows/diagnose-failure.toml`.
- [ ] Update the AI developer agent's instructions (SOP) to mandate this sequence for any non-build failure.
- [ ] Ensure the MCP server's implementation of `list_checkpoints` and `get_run` provides consistent, low-latency access to the same `ServerState` used by the scheduler, as required by [3_MCP_DESIGN-REQ-BR-002].
- [ ] Implement validation logic (or an agent check) that detects and flags "skipping" diagnostic steps.
- [ ] Verify that `get_stage_output` correctly returns the full log path for the failed stage, enabling direct file access via the filesystem MCP if necessary.

## 3. Code Review
- [ ] Verify the Mermaid sequence diagram in `docs/plan/specs/3_mcp_design.md` correctly represents the implemented behavior.
- [ ] Ensure no diagnostic step is bypassed when a logic failure occurs.
- [ ] Confirm that `get_run` returns the correct `definition_snapshot` from run start, avoiding confusion with live workflow edits.
- [ ] Check for proper error handling if any step in the diagnostic sequence fails.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test test_glass_box_diagnosis` to verify the sequence is executed correctly.
- [ ] Verify that the diagnostic session produces a `task_state.json` file reflecting the completed inspection steps.

## 5. Update Documentation
- [ ] Document the Glass-Box inspection sequence in `README.md` as the primary method for troubleshooting `devs`.
- [ ] Update the `3_mcp_design.md` spec to emphasize that this sequence is mandatory for self-hosting agents.

## 6. Automated Verification
- [ ] Run `./do test` to ensure traceability for `[3_MCP_DESIGN-REQ-038]` is updated in `target/traceability.json`.
- [ ] Verify that the E2E test achieves at least 50% line coverage of the `get_run` and `list_checkpoints` MCP handlers.
