# Task: MCP Tool Registry, Categorization, and Data Model Completeness (Sub-Epic: 04_MCP Server Framework)

## Covered Requirements
- [2_TAS-REQ-050], [2_TAS-REQ-051], [3_MCP_DESIGN-REQ-001], [3_MCP_DESIGN-REQ-002]

## Dependencies
- depends_on: ["01_mcp_crate_scaffold_and_jsonrpc_server.md", "02_mcp_response_envelope_and_error_atomicity.md"]
- shared_components: ["devs-scheduler (consumer)", "devs-pool (consumer)", "devs-core (consumer)", "devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/tool_registry_tests.rs`, write `test_tool_registry_dispatches_by_method_name` that registers a tool with name `"list_runs"` and a handler, sends a JSON-RPC request with `method: "list_runs"`, and asserts the handler was invoked
- [ ] Write `test_tool_registry_unknown_method_returns_error` that sends a request for an unregistered method and gets a `-32601` error
- [ ] Write `test_tool_categories_observation` that verifies tools `list_runs`, `get_run`, `get_stage_output`, `list_stages`, `get_pool_state`, `list_workflows`, `get_workflow`, `get_traceability`, `get_coverage_report`, `get_config` are all categorized as `ToolCategory::Observation`
- [ ] Write `test_tool_categories_control` that verifies `submit_run`, `cancel_run`, `pause_run`, `resume_run`, `pause_stage`, `resume_stage`, `retry_stage`, `write_workflow_definition` are categorized as `ToolCategory::Control`
- [ ] Write `test_tool_categories_testing` that verifies `inject_stage_input` (and future testing tools) are categorized as `ToolCategory::Testing`
- [ ] Write `test_tool_categories_midrun` that verifies `report_progress`, `signal_completion` are categorized as `ToolCategory::MidRun`
- [ ] Write `test_get_run_returns_all_fields_no_omission` that creates a workflow run with all fields populated, calls `get_run`, and asserts every field from the data model is present in the response (including optional fields as explicit `null`)
- [ ] Write `test_get_run_unpopulated_optional_fields_are_null_not_absent` that creates a run with minimal fields, calls `get_run`, and asserts optional fields like `completed_at`, `error_message` appear as `null` in the JSON (not missing keys)
- [ ] Write `test_mcp_remains_responsive_during_workflow_run` that starts a long-running mock workflow, concurrently sends MCP observation requests, and asserts responses arrive within 500ms

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/src/tools/mod.rs` defining `ToolCategory` enum: `Observation`, `Control`, `Testing`, `MidRun`
- [ ] Define `trait McpTool: Send + Sync` with methods: `fn name(&self) -> &str`, `fn category(&self) -> ToolCategory`, `fn execute(&self, params: Value, ctx: &ToolContext) -> Result<Value, String>`
- [ ] Implement `ToolRegistry` struct: `register(tool: Box<dyn McpTool>)`, `dispatch(method: &str, params: Value, ctx: &ToolContext) -> McpToolResponse`, `list_tools() -> Vec<ToolDescriptor>` (returns name + category for each registered tool)
- [ ] Create `ToolContext` struct holding `Arc` references to scheduler, pool manager, and other shared state needed by tool handlers
- [ ] Create stub tool files under `crates/devs-mcp/src/tools/`: `observation.rs`, `control.rs`, `testing.rs`, `midrun.rs` — each registering placeholder implementations of their respective tools that return `McpToolResponse::error("not yet implemented")`
- [ ] Register all 20 tools by name in the registry with correct categories per 2_TAS-REQ-050
- [ ] In all observation tool response serializers, ensure every field from the corresponding proto/core type is included. Use `#[serde(serialize_with = "serialize_always")]` or equivalent to force optional fields to serialize as `null` rather than being omitted — this satisfies 2_TAS-REQ-051 and 3_MCP_DESIGN-REQ-001
- [ ] Ensure the MCP server handler runs on a separate Tokio task from workflow execution, so observation queries are never blocked by in-flight stages (3_MCP_DESIGN-REQ-002). The server's hyper handler must use its own task pool

## 3. Code Review
- [ ] Verify all 20 tools are registered in the registry
- [ ] Verify tool categories match the specification in 2_TAS-REQ-050
- [ ] Verify no `#[serde(skip_serializing_if = "Option::is_none")]` appears on any MCP response type
- [ ] Verify the MCP HTTP handler is not running on the same task as the scheduler event loop

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` and verify all tests pass

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-050` to the tool categorization tests
- [ ] Add `// Covers: 2_TAS-REQ-051` to the data model completeness tests
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-001` to the no-field-omission tests
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-002` to the responsiveness test

## 6. Automated Verification
- [ ] Run `cargo test -p devs-mcp -- --nocapture 2>&1 | grep -E "test result:"` and verify `0 failed`
- [ ] Run a grep to confirm no `skip_serializing_if` on MCP response structs: `grep -r "skip_serializing_if" crates/devs-mcp/src/` should return 0 matches
