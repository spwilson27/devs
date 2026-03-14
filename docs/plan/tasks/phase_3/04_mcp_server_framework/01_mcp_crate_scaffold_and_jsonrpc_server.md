# Task: MCP Crate Scaffold and JSON-RPC HTTP Server (Sub-Epic: 04_MCP Server Framework)

## Covered Requirements
- [2_TAS-REQ-048], [2_TAS-REQ-071], [3_MCP_DESIGN-REQ-SRV-001], [3_MCP_DESIGN-REQ-003]

## Dependencies
- depends_on: []
- shared_components: ["devs-proto (consumer)", "devs-core (consumer)", "devs-scheduler (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/tests/` directory and add `jsonrpc_server_tests.rs`
- [ ] Write a test `test_mcp_server_binds_port` that starts the MCP HTTP server on an ephemeral port, sends a health-check POST to `/mcp/v1/call` with `{"jsonrpc": "2.0", "method": "ping", "params": {}, "id": 1}`, and asserts a 200 response with valid JSON-RPC 2.0 structure
- [ ] Write a test `test_mcp_server_default_port_7891` that verifies the default port constant is `7891`
- [ ] Write a test `test_mcp_accepts_only_post` that sends a GET request to `/mcp/v1/call` and asserts a 405 Method Not Allowed response
- [ ] Write a test `test_mcp_requires_json_content_type` that sends a POST with `text/plain` content-type and asserts a 415 Unsupported Media Type response
- [ ] Write a test `test_mcp_rejects_malformed_json` that sends invalid JSON and asserts a JSON-RPC parse error response (`-32700`)
- [ ] Write a test `test_mcp_rejects_invalid_jsonrpc` that sends valid JSON but missing `jsonrpc: "2.0"` field and asserts a JSON-RPC invalid request error (`-32600`)
- [ ] Write a test `test_mcp_no_authentication_required` verifying requests without any auth headers succeed (3_MCP_DESIGN-REQ-003)
- [ ] Write a test `test_mcp_unknown_method_returns_method_not_found` that sends a request with `"method": "nonexistent_tool"` and asserts a JSON-RPC method not found error (`-32601`)

## 2. Task Implementation
- [ ] Add `devs-mcp` crate to the Cargo workspace in `Cargo.toml` with dependencies: `tokio`, `hyper` (HTTP server), `serde`, `serde_json`, `tracing`
- [ ] Create `crates/devs-mcp/src/lib.rs` with the public module structure: `mod server;`, `mod jsonrpc;`, `mod tools;`, `mod error;`
- [ ] Implement `crates/devs-mcp/src/jsonrpc.rs`: define `JsonRpcRequest` struct (`jsonrpc: String`, `method: String`, `params: serde_json::Value`, `id: serde_json::Value`) and `JsonRpcResponse` struct (`jsonrpc: String`, `result: Option<Value>`, `error: Option<JsonRpcError>`, `id: Value`) with serde derive
- [ ] Implement `JsonRpcError` struct with `code: i32`, `message: String`, `data: Option<Value>` — standard codes: `-32700` (parse error), `-32600` (invalid request), `-32601` (method not found), `-32602` (invalid params), `-32603` (internal error)
- [ ] Implement `crates/devs-mcp/src/server.rs`: `McpServer` struct holding a `ToolRegistry` and server config. Method `start(addr: SocketAddr) -> Result<McpServerHandle>` that spawns a Tokio task running a hyper HTTP server
- [ ] The HTTP handler accepts only POST to `/mcp/v1/call` with `Content-Type: application/json`. It deserializes the body as `JsonRpcRequest`, validates `jsonrpc == "2.0"`, dispatches to the `ToolRegistry`, and returns a `JsonRpcResponse`
- [ ] `McpServerHandle` provides `shutdown()` method and `local_addr() -> SocketAddr` for test introspection
- [ ] Define `DEFAULT_MCP_PORT: u16 = 7891` constant
- [ ] No authentication middleware — all requests are accepted without auth checks per 3_MCP_DESIGN-REQ-003

## 3. Code Review
- [ ] Verify JSON-RPC 2.0 compliance: all responses include `jsonrpc: "2.0"` and `id` matching the request
- [ ] Verify no authentication checks exist anywhere in the request path
- [ ] Verify the server gracefully handles concurrent requests (hyper's default behavior)
- [ ] Verify all error codes follow JSON-RPC 2.0 specification

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` and verify all tests pass
- [ ] Run `cargo clippy -p devs-mcp -- -D warnings` and verify no warnings

## 5. Update Documentation
- [ ] Add doc comments to all public types and functions in devs-mcp
- [ ] Add `// Covers: 2_TAS-REQ-048` annotation to the port binding test
- [ ] Add `// Covers: 2_TAS-REQ-071` annotation to the HTTP POST endpoint test
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-SRV-001` annotation to the default port test
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-003` annotation to the no-auth test

## 6. Automated Verification
- [ ] Run `cargo test -p devs-mcp -- --nocapture 2>&1 | grep -E "test result:"` and verify `0 failed`
- [ ] Run `cargo build -p devs-mcp` and verify it compiles without errors
