# Task: Implement get_stage_output MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-010], [3_MCP_DESIGN-REQ-EC-OBS-003], [3_MCP_DESIGN-REQ-EC-OBS-DBG-003], [3_MCP_DESIGN-REQ-EC-OBS-DBG-009], [3_MCP_DESIGN-REQ-EC-OBS-DBG-011]

## Dependencies
- depends_on: ["03_get_run_tool.md"]
- shared_components: ["devs-scheduler (consumer)", "devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/tools/get_stage_output_test.rs`:
  - `test_get_stage_output_returns_complete_record`: create a completed stage with stdout, stderr, structured JSON output, and exit_code, call `get_stage_output`, assert response has fields: `stdout`, `stderr`, `structured`, `exit_code`, `log_path`, `truncated`
  - `test_get_stage_output_truncates_stdout_at_1mib`: create a stage with 2 MiB stdout, assert returned `stdout` is ≤1 MiB and `truncated` is `true`
  - `test_get_stage_output_truncates_stderr_at_1mib`: same for stderr
  - `test_get_stage_output_structured_null_when_absent`: stage with exit_code completion (no structured output), assert `structured` is `null`
  - `test_get_stage_output_retried_stage_no_attempt_returns_latest` (EC-OBS-003): stage retried 3 times, call without `attempt` param, assert output from the latest attempt (attempt 3) is returned
  - `test_get_stage_output_retried_stage_with_attempt`: call with `attempt: 1`, assert output from attempt 1
  - `test_get_stage_output_fanout_parent_no_index_returns_merged` (EC-OBS-DBG-003): fan-out stage with 3 sub-agents, call without `fan_out_index`, assert merged output (JSON array of 3 results) is returned
  - `test_get_stage_output_fanout_with_index`: call with `fan_out_index: 1`, assert output from sub-agent 1 (0-based)
  - `test_get_stage_output_stage_not_started_returns_precondition_error` (EC-OBS-DBG-009): stage in `Waiting` status, call `get_stage_output`, assert error `"failed_precondition: stage has not yet started; no output available"`
  - `test_get_stage_output_stage_eligible_returns_precondition_error` (EC-OBS-DBG-009): stage in `Eligible` status, same assertion
  - `test_get_stage_output_truncated_stderr_full_via_filesystem` (EC-OBS-DBG-011): stage with >1 MiB stderr, assert `truncated: true` in response, verify `.devs/logs/<run-id>/<stage-name>/attempt_<N>/stderr.log` file contains full unbounded stderr

## 2. Task Implementation
- [ ] In `crates/devs-mcp/src/tools/observability.rs`, implement `get_stage_output` handler:
  - Accept: `run_id: String`, `stage_name: String`, `attempt: Option<u32>`, `fan_out_index: Option<u32>`
  - Look up run and stage; if stage status is `Waiting` or `Eligible`, return `failed_precondition` error (EC-OBS-DBG-009)
  - If `attempt` not specified and stage has retries, return latest attempt output (EC-OBS-003)
  - If `fan_out_index` not specified on a fan-out stage, return merged output (EC-OBS-DBG-003); if specified, return that sub-agent's output
  - Truncate `stdout` and `stderr` fields to 1 MiB; set `truncated: true` if either was truncated
  - Include `log_path` pointing to `.devs/logs/<run-id>/<stage-name>/attempt_<N>/` directory
  - Full untruncated stderr is always available at `stderr.log` in that path (EC-OBS-DBG-011)
- [ ] Register `get_stage_output` in the MCP tool registry with JSON schema including optional `attempt` and `fan_out_index` params

## 3. Code Review
- [ ] Verify 1 MiB truncation is applied to UTF-8 byte boundary (not mid-character)
- [ ] Verify `fan_out_index` out of bounds returns a clear error, not a panic
- [ ] Verify `attempt` out of bounds returns a clear error

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- get_stage_output` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments documenting the truncation behavior and filesystem fallback for full output

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
