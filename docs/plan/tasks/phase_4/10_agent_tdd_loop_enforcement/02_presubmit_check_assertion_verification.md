# Task: Implement Presubmit-Check Terminal Status and Output Assertion Verification (Sub-Epic: 10_Agent TDD Loop Enforcement)

## Covered Requirements
- [3_MCP_DESIGN-REQ-030], [3_MCP_DESIGN-REQ-031]

## Dependencies
- depends_on: ["01_define_core_tdd_workflows.md", "08_assert_stage_output_tool.md"]
- shared_components: [devs-mcp, devs-scheduler, devs-proto]

## 1. Initial Test Written
- [ ] Write an E2E test in `tests/mcp_tdd_loop_e2e.rs` that:
    1. Submits a `presubmit-check` run via `submit_run`.
    2. Waits for all 5 stages to reach a terminal status (`Completed` or `Failed`).
    3. Calls `assert_stage_output` for each stage to verify the individual gate results.
- [ ] Verify that even if all stages reach `Completed`, if an assertion fails (e.g., coverage gate not met), the task is considered failed at the agent level.
- [ ] Ensure that a stage that is not yet terminal returns a `failed_precondition` error for `assert_stage_output`.

## 2. Task Implementation
- [ ] Implement the `assert_stage_output` tool in `crates/devs-mcp/src/tools/testing.rs` if not already present.
- [ ] Support all specified assertion operators: `eq`, `ne`, `contains`, `not_contains`, `matches`, `json_path_eq`, `json_path_exists`, `json_path_not_exists`.
- [ ] Implement the JSONPath evaluation logic for `structured` output fields using the `jsonpath-rust` or similar crate.
- [ ] Add the terminal-status check in `assert_stage_output` to ensure assertions are only made on completed data.
- [ ] Create a `verify-presubmit-status` utility (e.g., in `devs-cli`) to simplify the agent's check: `devs wait-and-assert --run-id <run-id> --gate coverage --op eq --value true`.

## 3. Code Review
- [ ] Verify that `assert_stage_output` provides clear, actionable failure reasons in the response (including the `actual_snippet`).
- [ ] Ensure that all assertions in an array are evaluated even if earlier ones fail.
- [ ] Check for proper locking: `assert_stage_output` should acquire a read lock on the scheduler state.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test mcp_tdd_loop_e2e` and verify the full presubmit-wait-assert protocol passes.

## 5. Update Documentation
- [ ] Document the mandatory "wait and assert" protocol in `docs/plan/specs/3_mcp_design.md` section §3.2.3 and §3.1.2.

## 6. Automated Verification
- [ ] Run `./do test --package devs-mcp` and ensure the coverage for `assert_stage_output` is ≥ 90% (QG-003).
