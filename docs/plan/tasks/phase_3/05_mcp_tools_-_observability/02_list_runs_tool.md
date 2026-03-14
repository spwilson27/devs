# Task: Implement list_runs MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-008], [3_MCP_DESIGN-REQ-EC-OBS-001]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-scheduler (consumer)", "devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/tools/list_runs_test.rs`:
  - `test_list_runs_returns_all_runs_for_project`: create mock scheduler state with 3 runs across 2 projects, call `list_runs` with `project_id`, assert only runs for that project are returned
  - `test_list_runs_filter_by_status`: create runs with statuses `Running`, `Completed`, `Failed`, call with `status: "Running"`, assert only running runs returned
  - `test_list_runs_filter_by_workflow_name`: create runs for workflows `build` and `deploy`, filter by `workflow_name: "build"`, assert correct subset
  - `test_list_runs_no_filters_returns_all`: call with no `status`, `workflow_name`, or `project_id` filter, assert all runs across all projects returned
  - `test_list_runs_status_filter_omitted_returns_all_statuses` (covers EC-OBS-001): call with `project_id` set but `status` omitted, assert runs of all statuses are included
- [ ] In `crates/devs-mcp/tests/tools/list_runs_test.rs`:
  - `test_list_runs_response_schema`: assert response JSON contains `runs` array, each element has `run_id`, `slug`, `workflow_name`, `status`, `created_at`, `project_id`

## 2. Task Implementation
- [ ] In `crates/devs-mcp/src/tools/observability.rs` (or `mod.rs` + `list_runs.rs`), implement `list_runs` MCP tool handler:
  - Accept optional parameters: `project_id: Option<String>`, `status: Option<String>`, `workflow_name: Option<String>`
  - Call `scheduler.list_runs(project)` from the shared scheduler state
  - Apply status and workflow_name filters in-memory if provided
  - If `status` filter is omitted, do not filter by status (EC-OBS-001)
  - Serialize results as JSON array of run summary objects
- [ ] Register `list_runs` in the MCP tool registry with its JSON schema

## 3. Code Review
- [ ] Verify filter logic uses exact string match for `status` and `workflow_name`
- [ ] Verify empty result set returns `{"runs": []}`, not an error

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- list_runs` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments to the `list_runs` handler describing parameters and return schema

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
