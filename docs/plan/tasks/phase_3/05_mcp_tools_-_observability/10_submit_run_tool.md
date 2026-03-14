# Task: Implement submit_run MCP tool (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-015], [3_PRD-BR-043]

## Dependencies
- depends_on: ["02_list_runs_tool.md"]
- shared_components: ["devs-scheduler (consumer)", "devs-proto (consumer)", "devs-config (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/tools/submit_run_test.rs`:
  - `test_submit_run_creates_run_with_valid_inputs`: register a project with a workflow `build`, call `submit_run` with `project_id`, `workflow_name: "build"`, and valid inputs, assert response contains `run_id` and `slug`
  - `test_submit_run_generates_slug_when_name_omitted`: call `submit_run` without `name` parameter, assert response contains auto-generated slug in format `<workflow-name>-<timestamp>-<uuid>`
  - `test_submit_run_with_custom_name`: call `submit_run` with `name: "my-custom-run"`, assert response slug includes the custom name
  - `test_submit_run_invalid_workflow_returns_not_found`: call with nonexistent `workflow_name`, assert `not_found` error
  - `test_submit_run_invalid_project_returns_not_found`: call with nonexistent `project_id`, assert `not_found` error
  - `test_submit_run_missing_required_input_returns_validation_error`: workflow declares required input `branch: String`, call without it, assert `invalid_argument` error listing missing inputs
  - `test_submit_run_invalid_input_type_returns_validation_error`: workflow declares `verbose: bool`, call with `verbose: "true"` (string), assert `invalid_argument` error
  - `test_submit_run_duplicate_name_returns_conflict` (covers 3_PRD-BR-043): submit a run with name `test-run`, then submit another with the same name for the same project before the first completes, assert second call returns `already_exists` error with no race condition window
  - `test_submit_run_concurrent_same_name_atomicity` (covers 3_PRD-BR-043): spawn 5 parallel `submit_run` calls with identical `project_id` and `name`, assert exactly one succeeds and 4 return `already_exists` — no window where both could pass validation

## 2. Task Implementation
- [ ] In `crates/devs-mcp/src/tools/control.rs` (or `mod.rs` + `submit_run.rs`), implement `submit_run` MCP tool handler:
  - Accept: `project_id: String`, `workflow_name: String`, `inputs: Option<HashMap<String, Value>>`, `name: Option<String>`
  - Validate workflow exists in project registry
  - Validate all required inputs are present and have correct types
  - Check for duplicate run name under per-project lock (3_PRD-BR-043 atomicity)
  - Call `scheduler.submit_run(project, workflow, inputs, name)` to create the run
  - Return `{"run_id": "<uuid>", "slug": "<name-or-auto-slug>"}` on success
- [ ] Implement per-project locking in scheduler for atomic run creation (3_PRD-BR-043):
  - Use `DashMap<ProjectId, Arc<Mutex<()>>>` or similar for fine-grained per-project locks
  - Hold lock during validation + creation to prevent TOCTOU race
- [ ] Register `submit_run` in the MCP tool registry with JSON schema including optional `name` and `inputs` params

## 3. Code Review
- [ ] Verify slug generation produces URL-safe strings (lowercase, hyphens, no consecutive hyphens)
- [ ] Verify per-project lock is released even on error paths (no deadlock)
- [ ] Verify input validation errors list all missing/invalid inputs, not just the first one
- [ ] Verify concurrent submission test demonstrates atomicity (no duplicate names created)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- submit_run` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments describing the slug generation format and validation error response schema

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
