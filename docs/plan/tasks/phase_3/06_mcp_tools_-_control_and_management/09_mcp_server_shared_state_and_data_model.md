# Task: MCP Server Shared State, Data Model Exposure, and Protocol Foundation (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-001], [3_MCP_DESIGN-REQ-BR-002], [3_MCP_DESIGN-REQ-BR-005], [3_MCP_DESIGN-REQ-NEW-001], [3_MCP_DESIGN-REQ-NEW-004], [3_MCP_DESIGN-REQ-088], [3_MCP_DESIGN-REQ-092], [3_MCP_DESIGN-REQ-EC-MCP-001], [3_MCP_DESIGN-REQ-EC-MCP-005], [3_MCP_DESIGN-REQ-EC-MCP-007], [3_MCP_DESIGN-REQ-EC-MCP-008], [3_MCP_DESIGN-REQ-EC-MCP-014], [3_MCP_DESIGN-REQ-EC-MCP-017]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-scheduler (consumer — Arc<RwLock<ServerState>>)", "devs-proto (consumer — wire types for data model)", "Shared State & Concurrency Patterns (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/src/server/state_tests.rs`
- [ ] **Test: `test_glass_box_always_active`** — Verify there is no feature flag or configuration option to disable the MCP Glass-Box interface. Assert the MCP server module has no conditional compilation guards. Covers [3_MCP_DESIGN-REQ-BR-001].
- [ ] **Test: `test_shared_state_with_grpc`** — Initialize `Arc<RwLock<ServerState>>` and pass it to both gRPC and MCP server constructors. Mutate state via gRPC, read via MCP. Assert MCP sees the mutation (same Arc, no separate "MCP view"). Covers [3_MCP_DESIGN-REQ-BR-002].
- [ ] **Test: `test_bridge_single_connection`** — Start `devs-mcp-bridge`, verify it opens exactly one HTTP connection to the MCP server and holds it for its lifetime (no reconnection pool). Covers [3_MCP_DESIGN-REQ-BR-005].
- [ ] **Test: `test_data_model_fully_exposed`** — Call each observation tool and verify all data model entity fields defined in [3_MCP_DESIGN-REQ-NEW-001] are present in responses: WorkflowRun (run_id, slug, project_id, workflow_name, status, created_at, stages, etc.), StageRun, PoolState, AgentStatus. Covers [3_MCP_DESIGN-REQ-NEW-001].
- [ ] **Test: `test_json_rpc_request_format`** — Send a request with `id` as integer (should work), `id` as string (should work), missing `id` (should fail), `params` as array (should fail — must be object). Covers [3_MCP_DESIGN-REQ-NEW-004].
- [ ] **Test: `test_get_run_mid_transition_consistency`** — Start a state transition, concurrently call `get_run`. Assert response is either fully pre-transition or fully post-transition (never partial). Covers [3_MCP_DESIGN-REQ-EC-MCP-001].
- [ ] **Test: `test_request_over_1mib_rejected`** — Send a JSON-RPC request body exceeding 1 MiB. Assert `invalid_argument: request too large` error. Covers [3_MCP_DESIGN-REQ-EC-MCP-005].
- [ ] **Test: `test_server_restart_bridge_reconnect`** — Restart MCP server while bridge is connected. Assert bridge detects disconnect and reports error (does not silently hang). Covers [3_MCP_DESIGN-REQ-EC-MCP-007].
- [ ] **Test: `test_list_runs_invalid_project_id`** — Call `list_runs` with nonexistent project_id. Assert `not_found` error. Covers [3_MCP_DESIGN-REQ-EC-MCP-008].
- [ ] **Test: `test_server_restart_same_port`** — Stop and restart MCP server on same port. Assert new connections work. Covers [3_MCP_DESIGN-REQ-EC-MCP-014].
- [ ] **Test: `test_get_run_cross_project`** — Call `get_run` with a run_id belonging to a different project. Assert `not_found` or `permission_denied` error (no cross-project leakage). Covers [3_MCP_DESIGN-REQ-EC-MCP-017].
- [ ] **Test: `test_req_088_092`** — Verify requirements [3_MCP_DESIGN-REQ-088] and [3_MCP_DESIGN-REQ-092] are met by the server initialization and data model structure.

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/src/server/mod.rs` — MCP HTTP server setup accepting `Arc<RwLock<ServerState>>` (same instance shared with gRPC)
- [ ] Implement JSON-RPC 2.0 request parsing: validate `id` field present, `params` is object (not array), reject requests >1 MiB
- [ ] Implement tool router: dispatch JSON-RPC method names to handler functions
- [ ] Ensure no feature flags wrap the MCP server — it is always compiled and active
- [ ] Implement data model serialization: all entity fields from NEW-001 table are included in JSON responses
- [ ] Configure `devs-mcp-bridge` to hold a single persistent HTTP connection (no connection pool)
- [ ] Set `SO_REUSEADDR` on MCP server socket for clean port reuse on restart

## 3. Code Review
- [ ] Verify `Arc<RwLock<ServerState>>` is the exact same instance for gRPC and MCP (no clone of inner state)
- [ ] Verify no `#[cfg(feature = "...")]` guards around MCP server code
- [ ] Verify JSON-RPC params validation rejects arrays
- [ ] Verify 1 MiB request size limit is enforced at the HTTP layer

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --lib server::state_tests`

## 5. Update Documentation
- [ ] Doc comments on shared state architecture, JSON-RPC protocol constraints, and bridge connection model

## 6. Automated Verification
- [ ] Run `./do test` — all state/protocol tests pass
- [ ] Run `./do lint` — zero warnings
