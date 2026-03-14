# Task: Implement submit_run MCP Tool (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-017], [3_MCP_DESIGN-REQ-BR-022], [3_MCP_DESIGN-REQ-BR-023], [3_MCP_DESIGN-REQ-BR-024], [3_MCP_DESIGN-REQ-BR-025], [3_MCP_DESIGN-REQ-BR-026], [3_MCP_DESIGN-REQ-BR-027], [3_MCP_DESIGN-REQ-NEW-005], [3_MCP_DESIGN-REQ-AC-2.25], [3_MCP_DESIGN-REQ-EC-CTL-006], [3_MCP_DESIGN-REQ-EC-MCP-010], [1_PRD-REQ-041]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-scheduler (consumer — uses submit_run)", "devs-core (consumer — BoundedString, state machines)", "devs-proto (consumer — wire types)", "devs-config (consumer — WorkflowDefinition, ProjectEntry)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/src/tools/control/submit_run_tests.rs`
- [ ] **Test: `test_submit_run_success`** — Call `submit_run` with valid `project_id`, `workflow_name`, `inputs: {"task": "hello"}`, and optional `run_name`. Assert response contains `run_id` (UUID format), `slug` (non-empty string), and `status: "Pending"`. Covers [3_MCP_DESIGN-REQ-017].
- [ ] **Test: `test_submit_run_auto_slug_format`** — Submit without `run_name`. Assert the auto-generated slug matches format `<workflow-name>-<YYYYMMDD>-<4 random alphanum>` (regex: `^[a-z0-9-]+-\d{8}-[a-z0-9]{4}$`). Covers [3_MCP_DESIGN-REQ-BR-026].
- [ ] **Test: `test_submit_run_duplicate_slug_rejected`** — Submit two runs with same explicit `run_name`. Assert second returns `already_exists` error with message containing the slug. Covers [3_MCP_DESIGN-REQ-BR-025].
- [ ] **Test: `test_submit_run_unknown_input_key_rejected`** — Submit with `inputs: {"nonexistent_key": "value"}` where workflow does not declare that key. Assert `invalid_argument: unknown input key 'nonexistent_key'` error. Covers [3_MCP_DESIGN-REQ-BR-027].
- [ ] **Test: `test_submit_run_missing_required_input`** — Submit without a required input key. Assert `invalid_argument` error listing the missing key. Covers [3_MCP_DESIGN-REQ-NEW-005].
- [ ] **Test: `test_submit_run_list_runs_sorted_descending`** — Submit 3 runs with small delays, then call `list_runs`. Assert results sorted descending by `created_at` (first timestamp >= second). Covers [3_MCP_DESIGN-REQ-AC-2.25], [3_MCP_DESIGN-REQ-BR-022].
- [ ] **Test: `test_submit_run_removing_project_rejected`** — Submit to a project currently being removed. Assert `failed_precondition` error. Covers [3_MCP_DESIGN-REQ-EC-CTL-006].
- [ ] **Test: `test_submit_run_during_shutdown_rejected`** — Submit after server shutdown initiated. Assert `unavailable` error. Covers [3_MCP_DESIGN-REQ-EC-MCP-010].
- [ ] **Test: `test_submit_run_json_rpc_id_required`** — Verify JSON-RPC request includes unique string `id` and params is an object (not array). Covers [3_MCP_DESIGN-REQ-BR-023], [3_MCP_DESIGN-REQ-BR-024].

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/src/tools/control/submit_run.rs` with handler function `handle_submit_run(params: SubmitRunParams, state: Arc<RwLock<ServerState>>) -> McpResult`
- [ ] Define `SubmitRunParams` struct: `project_id: String`, `workflow_name: String`, `inputs: Option<HashMap<String, serde_json::Value>>`, `run_name: Option<String>`
- [ ] Implement input validation: check all `required: true` workflow inputs are present, reject unknown keys with `invalid_argument: unknown input key '<key>'` error
- [ ] Implement slug auto-generation: format `<workflow-name>-<YYYYMMDD>-<4 random alphanum>` using `chrono::Utc::now()` and `rand` for alphanumeric chars
- [ ] Delegate to `devs-scheduler::submit_run()` for the 7-step atomic validation
- [ ] Return `SubmitRunResult` with `run_id`, `slug`, `status`
- [ ] Guard against shutdown state: check `ServerState::is_shutting_down` before proceeding
- [ ] Register tool in MCP tool router with name `"submit_run"` and JSON schema for params
- [ ] Ensure response conforms to JSON-RPC 2.0 format with matching request `id`

## 3. Code Review
- [ ] Verify no wire types (`devs-proto` generated types) leak into the tool handler's public API — conversions happen at boundary
- [ ] Verify lock acquisition follows project registry → workflow runs order
- [ ] Verify error messages use standard gRPC status code names (`invalid_argument`, `already_exists`, `failed_precondition`, `unavailable`)
- [ ] Verify slug generation uses cryptographically sufficient randomness for uniqueness

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --lib tools::control::submit_run_tests`
- [ ] All tests pass with zero failures

## 5. Update Documentation
- [ ] Add doc comments to `handle_submit_run` describing params, validation rules, and error conditions
- [ ] Update `crates/devs-mcp/src/tools/control/mod.rs` to export the new module

## 6. Automated Verification
- [ ] Run `./do test` and confirm `submit_run` tests appear in output with PASS status
- [ ] Run `./do lint` and confirm no clippy warnings in new code
