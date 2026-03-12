# Task: Implement submit_run MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-015], [3_MCP_DESIGN-REQ-EC-OBS-DBG-004]

## Dependencies
- depends_on: [05_pool_workflow_obs.md]
- shared_components: [devs-core, devs-mcp, devs-scheduler]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/tools_obs.rs` (Wait, this is a control tool, but user assigned it here).
- [ ] Test `submit_run`:
    - Submit valid workflow, verify `run_id` and `slug` are returned.
    - Verify all inputs are validated before creation.
    - Test submission with invalid inputs (expect `invalid_argument`).
- [ ] Write E2E test: verify that a submission via MCP correctly triggers the scheduler and starts the run. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-004] (Partial)

## 2. Task Implementation
- [ ] Implement `submit_run` handler in `crates/devs-mcp/src/tools/ctl.rs`.
- [ ] Implement input validation logic.
- [ ] Call `ServerState::create_run` and notify the `devs-scheduler`.
- [ ] Ensure the `run_id` is a UUID v4 and the `slug` follows the required format.

## 3. Code Review
- [ ] Verify that `submit_run` acquires a write lock on `ServerState`.
- [ ] Ensure that the response is returned only after the initial checkpoint is written.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test -p devs-mcp`.

## 5. Update Documentation
- [ ] Update the `submit_run` schema in the design spec.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
