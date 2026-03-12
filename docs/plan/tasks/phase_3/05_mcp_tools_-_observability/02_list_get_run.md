# Task: Implement list_runs and get_run MCP tools (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-008], [3_MCP_DESIGN-REQ-009], [3_MCP_DESIGN-REQ-EC-OBS-001], [3_MCP_DESIGN-REQ-EC-OBS-002]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/tools_obs.rs`.
- [ ] Test `list_runs`:
    - Call with no params, assert results are sorted by `created_at` descending.
    - Call with `status` filter, assert only runs with that status are returned.
    - Call with missing `status` filter (optional), assert all runs are returned. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-001]
- [ ] Test `get_run`:
    - Call with valid `run_id`, assert full `WorkflowRun` record is returned.
    - Call with `run_id` that does not exist, assert `not_found` error. // Covers: [3_MCP_DESIGN-REQ-EC-OBS-002]

## 2. Task Implementation
- [ ] Implement `list_runs` handler in `crates/devs-mcp/src/tools/obs.rs`.
- [ ] Implement filtering logic for `status`, `workflow_name`, and `project_id`.
- [ ] Implement `get_run` handler in `crates/devs-mcp/src/tools/obs.rs`.
- [ ] Use `ServerState` (shared component `devs-core`) to fetch run data.
- [ ] Ensure `get_run` returns all `StageRun` records with current statuses, elapsed times, and outputs.

## 3. Code Review
- [ ] Verify that no internal fields are withheld from responses.
- [ ] Ensure unpopulated optional fields are returned as JSON `null`.
- [ ] Verify that the handlers acquire only read locks on `ServerState`.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test -p devs-mcp`.

## 5. Update Documentation
- [ ] Update MCP tool definitions in `docs/plan/specs/3_mcp_design.md` if any schema changes were needed.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
