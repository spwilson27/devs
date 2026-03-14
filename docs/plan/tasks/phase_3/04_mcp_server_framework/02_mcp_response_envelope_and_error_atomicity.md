# Task: MCP Response Envelope and Error Atomicity (Sub-Epic: 04_MCP Server Framework)

## Covered Requirements
- [2_TAS-REQ-049], [3_MCP_DESIGN-REQ-004], [3_MCP_DESIGN-REQ-005]

## Dependencies
- depends_on: ["01_mcp_crate_scaffold_and_jsonrpc_server.md"]
- shared_components: ["devs-core (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/response_envelope_tests.rs`, write `test_success_response_has_error_null` that invokes a mock tool returning success and asserts the response JSON contains `"error": null` at the top level (not absent — explicitly null)
- [ ] Write `test_error_response_has_result_null` that invokes a tool that fails and asserts the response contains `"result": null` and `"error"` is a non-null string
- [ ] Write `test_response_always_contains_error_field` that invokes multiple tools (success and failure) and asserts every single response object contains the key `"error"` (never omitted)
- [ ] Write `test_response_always_contains_result_field` that asserts every response contains the key `"result"` (never omitted)
- [ ] Write `test_mutation_tool_atomic_success` that registers a mock mutation tool, invokes it, verifies state was mutated, and `"error"` is null
- [ ] Write `test_mutation_tool_atomic_failure_no_state_change` that registers a mock mutation tool that fails mid-operation, verifies state was NOT mutated, and `"error"` is non-null
- [ ] Write `test_no_partial_mutation_on_error` using a mock tool that modifies two fields — if the second modification fails, assert neither field was changed (rollback semantics)

## 2. Task Implementation
- [ ] Define `McpToolResponse` struct in `crates/devs-mcp/src/response.rs` with fields: `result: Option<serde_json::Value>` and `error: Option<String>`. Implement custom `Serialize` that always emits both fields (never skips null). Use `#[serde(serialize_with = ...)]` or manual impl to guarantee `"error": null` appears in output
- [ ] Implement `McpToolResponse::success(value: Value) -> Self` that sets `result = Some(value)`, `error = None`
- [ ] Implement `McpToolResponse::error(msg: impl Into<String>) -> Self` that sets `result = None`, `error = Some(msg.into())`
- [ ] Update the JSON-RPC dispatch in `server.rs` to wrap all tool handler returns in `McpToolResponse`, then embed into the `JsonRpcResponse.result` field
- [ ] Implement an `AtomicToolContext` wrapper that tool handlers receive. For mutation tools, it provides a `commit()` method. If the handler returns an error before calling `commit()`, all staged mutations are discarded. This enforces atomicity per 3_MCP_DESIGN-REQ-005
- [ ] Add a unit test helper `assert_response_envelope(value: &Value)` that checks both `"result"` and `"error"` keys exist at the top level of the tool response

## 3. Code Review
- [ ] Verify `McpToolResponse` serialization never omits the `error` or `result` field — test with `serde_json::to_string` directly
- [ ] Verify no tool handler path can return `error: null` when a mutation was not applied
- [ ] Verify no tool handler path can return `error: non-null` when a mutation WAS applied (partial mutation)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` and verify all tests pass including the new response envelope tests

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-049` to the response conformance tests
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-004` to the error-field-always-present tests
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-005` to the atomicity tests

## 6. Automated Verification
- [ ] Run `cargo test -p devs-mcp -- --nocapture 2>&1 | grep -E "test result:"` and verify `0 failed`
- [ ] Grep the serialized output of `McpToolResponse::success(json!({}))` for `"error":null` to confirm the field is present
