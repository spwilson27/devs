# Task: Implement Diagnostic Sequence and Speculative Edit Enforcement (Sub-Epic: 10_Agent TDD Loop Enforcement)

## Covered Requirements
- [3_MCP_DESIGN-REQ-034], [3_MCP_DESIGN-REQ-035]

## Dependencies
- depends_on: ["01_define_core_tdd_workflows.md"]
- shared_components: [devs-mcp, devs-cli]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-cli/tests/enforcement_tests.rs` that:
    1. Simulates a `tdd-green` run failure.
    2. Verifies that an agent attempting to `write_file` or `submit_run` BEFORE calling the mandatory 4-step diagnostic sequence (`get_run` -> `get_stage_output` -> etc.) is blocked or flagged.
    3. Verifies that reading partial logs (not the full `stderr` and `stdout`) before an edit triggers a "speculative-edit" warning or block.
- [ ] Use a mock MCP server that records call history to verify the sequence enforcement.

## 2. Task Implementation
- [ ] Implement an `enforce-diagnostic-sequence` check in the `devs-cli` or as a standalone stage in `presubmit-check`.
- [ ] The check must read the MCP audit logs (or a local `task_state.json` history) to verify the sequence:
    1. Failed run detected.
    2. `get_run` called for that run.
    3. `get_stage_output` called for the failed stage.
    4. Full output read (not just truncated).
    5. No `write_file` or `submit_run` calls occurred between (1) and (4).
- [ ] Implement a `devs-mcp` audit log tool that returns the recent tool-call history for a given `session_id`.
- [ ] Enforce the rule by failing the `enforcement` stage in `presubmit-check` if the diagnostic protocol was bypassed.

## 3. Code Review
- [ ] Ensure that the enforcement logic does not block legitimate manual interventions by human developers (e.g., bypass flag).
- [ ] Verify that the audit log is stored in-memory (per-session) to avoid excessive disk I/O, but persisted to `.devs/agent-state/` for recovery.
- [ ] Check that `get_stage_output` truncation is handled: if the output was truncated, the agent MUST have read the full log via `stream_logs` or `get_stage_output` to avoid the "partial information" violation.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test enforcement_tests` and verify the sequence is correctly audited and enforced.

## 5. Update Documentation
- [ ] Document the mandatory diagnostic loop and the "No Speculative Edits" rule in `docs/plan/specs/3_mcp_design.md` section §4.1.

## 6. Automated Verification
- [ ] Run `./do test --package devs-cli` and ensure the enforcement utility correctly identifies a compliant vs. non-compliant agent session.
