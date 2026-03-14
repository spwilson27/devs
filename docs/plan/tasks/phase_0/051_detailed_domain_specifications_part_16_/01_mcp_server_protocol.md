# Task: MCP Server HTTP/JSON-RPC Foundation (Sub-Epic: 051_Detailed Domain Specifications (Part 16))

## Covered Requirements
- [2_TAS-REQ-126], [2_TAS-REQ-127]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp (owner — this task creates the crate skeleton), devs-core (consumer — domain types)]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/tests/json_rpc_protocol.rs` with the following test cases. Each test must include a `// Covers: 2_TAS-REQ-126` or `// Covers: 2_TAS-REQ-127` annotation as appropriate.

### Content-Type enforcement [2_TAS-REQ-126]
- [ ] `test_post_rpc_with_wrong_content_type_returns_415`: Send `POST /rpc` with `Content-Type: text/plain` and a valid JSON body. Assert HTTP status 415 Unsupported Media Type. Assert response body contains a JSON-RPC error object with `code: -32600`.
- [ ] `test_post_rpc_with_no_content_type_returns_415`: Send `POST /rpc` with no `Content-Type` header. Assert HTTP 415.
- [ ] `test_post_rpc_with_application_json_charset_accepted`: Send `POST /rpc` with `Content-Type: application/json; charset=utf-8`. Assert HTTP 200 (charset parameter is allowed per RFC 7231).

### HTTP method enforcement [2_TAS-REQ-126]
- [ ] `test_get_rpc_returns_405`: Send `GET /rpc`. Assert HTTP 405 Method Not Allowed.
- [ ] `test_put_rpc_returns_405`: Send `PUT /rpc`. Assert HTTP 405.

### Batch request rejection [2_TAS-REQ-126]
- [ ] `test_batch_request_array_rejected`: Send `POST /rpc` with body `[{"jsonrpc":"2.0","method":"list_runs","id":1},{"jsonrpc":"2.0","method":"list_runs","id":2}]`. Assert the response is a JSON-RPC error with code `-32600` ("Invalid Request") and HTTP 200 (JSON-RPC errors use 200 per spec).

### JSON-RPC 2.0 compliance [2_TAS-REQ-126, 2_TAS-REQ-127]
- [ ] `test_valid_request_returns_matching_id`: Send `{"jsonrpc":"2.0","method":"list_runs","params":{},"id":42}`. Assert the response has `"id": 42` and `"jsonrpc": "2.0"` and a `result` field.
- [ ] `test_string_id_returned_as_string`: Send request with `"id": "abc"`. Assert response `"id": "abc"`.
- [ ] `test_null_id_returns_error`: Send `{"jsonrpc":"2.0","method":"list_runs","id":null}`. Assert JSON-RPC error response with code `-32600` ("id must be non-null").
- [ ] `test_missing_id_returns_error`: Send `{"jsonrpc":"2.0","method":"list_runs","params":{}}` (no `id` field). Assert JSON-RPC error with code `-32600`.
- [ ] `test_unknown_method_returns_method_not_found`: Send `{"jsonrpc":"2.0","method":"nonexistent_tool","id":1}`. Assert JSON-RPC error with code `-32601` ("Method not found").
- [ ] `test_malformed_json_returns_parse_error`: Send `POST /rpc` with body `{invalid json`. Assert JSON-RPC error with code `-32700` ("Parse error").

### Method naming convention [2_TAS-REQ-127]
- [ ] `test_method_name_is_tool_name_directly`: Register a stub tool named `"get_run"`. Send `{"jsonrpc":"2.0","method":"get_run","params":{"run_id":"r1"},"id":1}`. Assert the response `result` field contains the stub's output. Verify no namespace prefix (e.g., no `tools/get_run` or `devs.get_run`).

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/Cargo.toml` with dependencies: `axum`, `serde`, `serde_json`, `tokio`, `tower`, `hyper`. Add `devs-core` as a workspace dependency.
- [ ] Create `crates/devs-mcp/src/lib.rs` as the crate root exporting `McpServer`.
- [ ] Define `JsonRpcRequest` struct in `crates/devs-mcp/src/protocol.rs`:
  ```rust
  pub struct JsonRpcRequest {
      pub jsonrpc: String,       // must be "2.0"
      pub method: String,
      pub params: Option<serde_json::Value>,
      pub id: serde_json::Value, // must be non-null
  }
  ```
- [ ] Define `JsonRpcResponse` struct with `jsonrpc`, `id`, `result` (Option), `error` (Option) fields. Define `JsonRpcError` struct with `code: i32`, `message: String`, `data: Option<Value>`.
- [ ] Implement standard JSON-RPC 2.0 error codes as constants: `-32700` (Parse error), `-32600` (Invalid Request), `-32601` (Method not found), `-32602` (Invalid params), `-32603` (Internal error).
- [ ] Implement an axum `Router` in `crates/devs-mcp/src/server.rs`:
  - `POST /rpc` handler that:
    1. Checks `Content-Type` header — if not `application/json` (with optional charset), return HTTP 415 with a JSON-RPC error body.
    2. Deserializes the body. If the body starts with `[`, return a JSON-RPC `-32600` error (batch not supported). If JSON parsing fails, return `-32700`.
    3. Validates `id` is present and non-null. If missing/null, return `-32600`.
    4. Validates `jsonrpc` == `"2.0"`. If not, return `-32600`.
    5. Looks up `method` in a `HashMap<String, Box<dyn ToolHandler>>`. If not found, return `-32601`.
    6. Calls the tool handler, wraps its return in `JsonRpcResponse { result: Some(output), id }`.
  - Any non-POST method returns HTTP 405.
  - Any non-`/rpc` path returns HTTP 404.
- [ ] Define `trait ToolHandler: Send + Sync` with method `async fn call(&self, params: Value) -> Result<Value, JsonRpcError>`.
- [ ] Implement `McpServer` struct with `fn register_tool(name: &str, handler: impl ToolHandler)` and `async fn serve(self, addr: SocketAddr) -> Result<()>`.
- [ ] Register a stub `list_runs` tool that returns `{"runs": []}` for initial testing.

## 3. Code Review
- [ ] Verify that HTTP handler delegates to `ToolHandler` trait — no business logic in the handler itself.
- [ ] Verify all JSON-RPC error codes match the JSON-RPC 2.0 specification (codes -32700 through -32600).
- [ ] Verify that `devs-proto` wire types do NOT appear in `devs-mcp` public API (per 2_TAS-REQ-001G); domain types from `devs-core` are used instead.
- [ ] Verify `Content-Type` checking handles case-insensitive comparison and optional parameters (e.g., `charset=utf-8`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` and ensure all 12+ protocol tests pass.
- [ ] Run `cargo clippy -p devs-mcp -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Add doc comments to `McpServer`, `JsonRpcRequest`, `JsonRpcResponse`, `ToolHandler` trait.
- [ ] Add `// Covers: 2_TAS-REQ-126` and `// Covers: 2_TAS-REQ-127` annotations to every relevant test function.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` — both must exit 0.
- [ ] Verify `target/traceability.json` contains entries for `2_TAS-REQ-126` and `2_TAS-REQ-127` with at least one test each.
