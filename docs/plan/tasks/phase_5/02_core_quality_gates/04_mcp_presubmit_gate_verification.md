# Task: MCP Presubmit Gate Verification (Sub-Epic: 02_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-082]

## Dependencies
- depends_on: [02_core_quality_gates/03_mcp_assertion_snippet_truncation.md]
- shared_components: [devs-mcp, devs-scheduler, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create an E2E test in `crates/devs-mcp/tests/e2e_presubmit_protocol.rs` that:
    - Submits a "presubmit-check" workflow run.
    - Waits for the run to reach `Completed` status.
    - Calls `assert_stage_output` on a stage that has *failed* its internal logic (e.g., a coverage gate failure) but has an exit code of 0 (simulating how a clean exit doesn't mean success).
    - Asserts that the assertion tool correctly returns `passed: false` with the appropriate failure records.
    - Verifies that the agent *must* check the assertion result even if the stage status is `Completed`.

## 2. Task Implementation
- [ ] Update the MCP test suite to include a scenario where a stage with `completion: structured_output` returns valid JSON but with a failed internal gate (e.g., `{"overall_passed": false}`).
- [ ] Implement or verify that the `assert_stage_output` tool correctly interprets these internal failures as `passed: false` in its response.
- [ ] Add an integration test that simulates the agent's behavior of calling `assert_stage_output` for *every* stage of a multi-stage run and aggregating the results.

## 3. Code Review
- [ ] Confirm that `assert_stage_output` tool returns `passed: false` for logic-level failures, not just tool-level errors.
- [ ] Ensure that "completed" status for a run/stage is treated as a necessary but not sufficient condition for overall success.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test e2e_presubmit_protocol`.
- [ ] Execute a full presubmit run manually and use the MCP client to inspect its stage outputs.

## 5. Update Documentation
- [ ] Update `GEMINI.md` and the developer protocol documentation to emphasize that `assert_stage_output` is mandatory for verifying presubmit runs.

## 6. Automated Verification
- [ ] Verify that a `Completed` run with a failing `assert_stage_output` result is correctly flagged as a failure by the protocol.
