# Task: Implement MCP and Bridge Security Types (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-MCP-001], [SEC-MCP-002], [SEC-MCP-003], [SEC-MCP-004], [SEC-MCP-005], [SEC-MCP-006], [SEC-MCP-007], [SEC-MCP-008], [SEC-MCP-009], [SEC-BRIDGE-001], [SEC-BRIDGE-002], [SEC-BRIDGE-003], [SEC-BRIDGE-004], [SEC-BRIDGE-005], [5_SECURITY_DESIGN-REQ-317], [5_SECURITY_DESIGN-REQ-318], [5_SECURITY_DESIGN-REQ-319], [5_SECURITY_DESIGN-REQ-320], [5_SECURITY_DESIGN-REQ-321], [5_SECURITY_DESIGN-REQ-322], [5_SECURITY_DESIGN-REQ-323], [5_SECURITY_DESIGN-REQ-324], [5_SECURITY_DESIGN-REQ-325], [5_SECURITY_DESIGN-REQ-326], [5_SECURITY_DESIGN-REQ-327], [5_SECURITY_DESIGN-REQ-328], [5_SECURITY_DESIGN-REQ-329], [5_SECURITY_DESIGN-REQ-330]

## Dependencies
- depends_on: ["11_redacted_wrapper_credential_security.md"]
- shared_components: [devs-core (Owner), devs-mcp (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_mcp_tool_permission_model` asserting `McpToolPermission` enum covers `ReadOnly`, `ReadWrite`, `Admin` access levels
- [ ] Write test `test_mcp_request_size_limit` asserting `MCP_MAX_REQUEST_BYTES` constant equals 1_048_576 (1 MiB)
- [ ] Write test `test_bridge_connection_spec` asserting `BridgeConnectionSpec` holds target host/port and trust level
- [ ] Write test `test_mcp_error_response_format` asserting `McpErrorResponse` serializes to `{"result":null,"error":"..."}`
- [ ] Write test `test_bridge_malformed_json_error` asserting malformed JSON input produces structured error with `fatal` flag

## 2. Task Implementation
- [ ] Define `McpToolPermission` enum in `crates/devs-core/src/security/mcp.rs` with `ReadOnly`, `ReadWrite`, `Admin` variants
- [ ] Define `McpRequestLimits` with constant `MAX_REQUEST_BYTES: usize = 1_048_576`
- [ ] Define `BridgeConnectionSpec` struct with `target_addr: SocketAddr`, `trust_level: BridgeTrustLevel`
- [ ] Define `McpErrorResponse` struct with `result: Option<serde_json::Value>`, `error: String` and `Serialize` impl
- [ ] Define `BridgeError` enum with `MalformedJson { fatal: bool, message: String }`, `ConnectionLost`, `Timeout`
- [ ] Define `McpToolRegistry` type alias for `HashMap<String, McpToolPermission>` mapping tool names to permissions

## 3. Code Review
- [ ] Verify MCP error response format matches JSON-RPC-like spec
- [ ] Verify bridge error types include fatality flag for connection-loss scenarios
- [ ] Verify no sensitive data in error messages

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- mcp` and confirm all MCP security type tests pass
- [ ] Run `cargo test -p devs-core -- bridge` and confirm all bridge type tests pass
- [ ] Run `cargo clippy --workspace -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/security/mcp.rs` explaining permission model and request size limits
- [ ] Document `BridgeError::MalformedJson { fatal }` field semantics

## 6. Automated Verification
- [ ] `cargo test -p devs-core` passes with no failures
- [ ] JSON serialization of `McpErrorResponse` matches expected format in snapshot test
- [ ] `McpRequestLimits::MAX_REQUEST_BYTES` constant value verified by test assertion
