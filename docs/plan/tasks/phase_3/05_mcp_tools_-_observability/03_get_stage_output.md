# Task: Implement get_stage_output MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-010], [3_MCP_DESIGN-REQ-EC-OBS-003], [3_MCP_DESIGN-REQ-EC-OBS-DBG-003], [3_MCP_DESIGN-REQ-EC-OBS-DBG-009], [3_MCP_DESIGN-REQ-EC-OBS-DBG-011]

## Dependencies
- depends_on: [02_list_get_run.md]
- shared_components: [devs-core, devs-mcp, devs-checkpoint]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/tools_obs.rs`.
- [ ] Test `get_stage_output`:
    - For a completed stage: assert `stdout`, `stderr`, `structured`, `exit_code`, and `log_path` are correct.
    - For a retried stage: verify `attempt` parameter selects the correct output. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-003]
    - For a fan-out stage: verify `fan_out_index` selects the correct sub-agent output. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-003]
    - For a `Waiting` or `Eligible` stage: assert `failed_precondition` error. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-009]
- [ ] Test truncation: verify `stdout`/`stderr` fields are truncated to 1 MiB in the MCP response but the full log remains accessible. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-DBG-011]

## 2. Task Implementation
- [ ] Implement `get_stage_output` handler in `crates/devs-mcp/src/tools/obs.rs`.
- [ ] Load logs from `devs-checkpoint` store if they are not in the in-memory buffer.
- [ ] Implement logic to handle `attempt` and `fan_out_index` parameters.
- [ ] Implement 1 MiB truncation for the response fields.
- [ ] Ensure `stdout` and `stderr` fields are never `null` (empty string if no output).

## 3. Code Review
- [ ] Verify that the tool correctly identifies the project and run for the requested stage.
- [ ] Ensure that large log reads from disk are performed outside the main state lock.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test -p devs-mcp`.

## 5. Update Documentation
- [ ] Ensure the tool response schema matches the spec exactly.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
