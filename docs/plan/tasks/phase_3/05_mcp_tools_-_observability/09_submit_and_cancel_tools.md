# Task: Implement submit_run and cancel_run/cancel_stage MCP tools (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-015], [3_MCP_DESIGN-REQ-016]

## Dependencies
- depends_on: ["02_list_runs_tool.md"]
- shared_components: ["devs-scheduler (consumer)", "devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/tools/submit_run_test.rs`:
  - `test_submit_run_returns_run_id_and_slug`: submit a valid workflow with inputs, assert response contains `run_id` (UUID) and `slug` (human-readable)
  - `test_submit_run_validates_inputs`: submit with missing required input, assert validation error listing the missing field
  - `test_submit_run_validates_workflow_exists`: submit with nonexistent workflow name, assert `not_found` error
  - `test_submit_run_with_custom_name`: submit with `name: "my-feature"`, assert `slug` contains `my-feature`
  - `test_submit_run_auto_generates_slug`: submit without `name`, assert `slug` is auto-generated from workflow name + timestamp
- [ ] In `crates/devs-mcp/tests/tools/cancel_test.rs`:
  - `test_cancel_run_cancels_all_stages`: submit a run, cancel it via `cancel_run`, assert all stages transition to `Cancelled`
  - `test_cancel_run_already_completed`: cancel a completed run, assert error `failed_precondition: run already in terminal state`
  - `test_cancel_stage_cancels_single_stage`: submit a multi-stage run, cancel one stage, assert only that stage is cancelled while others remain unaffected
  - `test_cancel_stage_nonexistent`: cancel a stage name that doesn't exist in the run, assert `not_found` error
  - `test_cancel_run_nonexistent`: cancel with invalid `run_id`, assert `not_found` error

## 2. Task Implementation
- [ ] In `crates/devs-mcp/src/tools/observability.rs`, implement `submit_run` handler:
  - Accept: `project_id: String`, `workflow_name: String`, `inputs: Option<Map<String, Value>>`, `name: Option<String>`
  - Delegate to `scheduler.submit_run(project, workflow, inputs, name)` which performs 7-step validation
  - Return `{"run_id": "<uuid>", "slug": "<slug>"}`
- [ ] Implement `cancel_run` handler:
  - Accept: `run_id: String`
  - Delegate to `scheduler.cancel_run(&run_id)`
  - Return `{"cancelled": true}` on success
- [ ] Implement `cancel_stage` handler:
  - Accept: `run_id: String`, `stage_name: String`
  - Delegate to `scheduler.cancel_stage(&run_id, &stage_name)`
  - Return `{"cancelled": true}` on success
- [ ] Register all three tools in MCP tool registry

## 3. Code Review
- [ ] Verify `submit_run` does not bypass scheduler validation (all 7 steps executed)
- [ ] Verify cancel operations are idempotent for already-cancelled resources

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- submit_run cancel` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments for all three tools

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
