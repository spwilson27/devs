# Task: Implement get_run MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-009], [3_MCP_DESIGN-REQ-EC-OBS-002]

## Dependencies
- depends_on: ["02_list_runs_tool.md"]
- shared_components: ["devs-scheduler (consumer)", "devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/tools/get_run_test.rs`:
  - `test_get_run_returns_full_record`: create a run with 3 stages in various states, call `get_run` with its `run_id`, assert response includes all `StageRun` records with `status`, `elapsed_time_ms`, and `outputs`
  - `test_get_run_includes_stage_elapsed_times`: assert each stage record has `elapsed_time_ms` field (0 for not-yet-started stages)
  - `test_get_run_includes_stage_outputs`: assert completed stages include their `output` field (structured JSON or null)
  - `test_get_run_deleted_run_returns_not_found` (covers EC-OBS-002): delete a run via retention sweep, call `get_run` with the deleted `run_id`, assert error response with code `not_found` and message indicating the run was deleted or does not exist
  - `test_get_run_invalid_run_id_returns_not_found`: call with a UUID that was never created, assert `not_found` error

## 2. Task Implementation
- [ ] In `crates/devs-mcp/src/tools/observability.rs`, implement `get_run` MCP tool handler:
  - Accept required parameter: `run_id: String`
  - Look up run in scheduler state via `scheduler.get_run(&run_id)`
  - If not found, return MCP error `{"error": "not_found: run does not exist or has been deleted"}` (EC-OBS-002)
  - Serialize full `WorkflowRun` record including all `StageRun` children with `status`, `elapsed_time_ms`, `outputs`, `attempt`
- [ ] Register `get_run` in the MCP tool registry

## 3. Code Review
- [ ] Verify `elapsed_time_ms` is computed as wall-clock duration from stage start to now (if running) or stage start to completion (if terminal)
- [ ] Verify deleted/nonexistent runs return consistent error format, not a panic

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- get_run` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments describing the full response schema

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
