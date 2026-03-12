# Task: MCP Server Core Foundation (Sub-Epic: 04_MCP Server Framework)

## Covered Requirements
- [1_PRD-REQ-040], [2_TAS-REQ-049], [2_TAS-REQ-050], [2_TAS-REQ-071], [3_MCP_DESIGN-REQ-001], [3_MCP_DESIGN-REQ-002], [3_MCP_DESIGN-REQ-003], [3_MCP_DESIGN-REQ-004], [3_MCP_DESIGN-REQ-005], [3_MCP_DESIGN-REQ-SRV-001], [3_MCP_DESIGN-REQ-SRV-002]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config, devs-proto]

## 1. Initial Test Written
- [ ] Create a new unit test in `crates/devs-mcp/src/server.rs` (or similar) that mocks the `ServerState` and verifies the JSON-RPC 2.0 dispatcher.
- [ ] The test must verify that a valid request (e.g., `initialize`) returns a valid response with `error: null` and a `result` object.
- [ ] The test must verify that an invalid request (e.g., non-existent method) returns an error object with `result: null` and a non-null `error` string.
- [ ] The test must verify that the server correctly identifies its capabilities during the `initialize` handshake.
- [ ] // Covers: [2_TAS-REQ-071], [3_MCP_DESIGN-REQ-004], [3_MCP_DESIGN-REQ-SRV-002]

## 2. Task Implementation
- [ ] Create a new crate `devs-mcp`.
- [ ] Implement an HTTP server using `axum` and `tower-http` that listens on the configured MCP port (defaulting to 3000 if not specified, but should be configurable).
- [ ] Implement a JSON-RPC 2.0 dispatcher that routes incoming POST requests to `/mcp/v1/call` to internal tool handlers.
- [ ] Ensure the dispatcher has access to the shared `ServerState` via `Arc<RwLock<ServerState>>` from `devs-core`.
- [ ] Implement the `initialize` method to handle MCP capability negotiation and server identification.
- [ ] Implement a standardized response envelope that enforces the mutual exclusivity of `result` and `error` fields.
- [ ] Ensure that no authentication is required for MCP requests at this stage.
- [ ] Add `devs-mcp` as a dependency to `devs-server` and integrate its startup into the main server lifecycle.
- [ ] // Covers: [1_PRD-REQ-040], [2_TAS-REQ-049], [2_TAS-REQ-050], [3_MCP_DESIGN-REQ-001], [3_MCP_DESIGN-REQ-003], [3_MCP_DESIGN-REQ-SRV-001]

## 3. Code Review
- [ ] Verify that all tool responses include `"error": null` when successful.
- [ ] Ensure the dispatcher is robust against malformed JSON and enforces the 1 MiB request body limit.
- [ ] Check that `ServerState` locks are held for the minimum duration necessary.
- [ ] Confirm that no feature flags are required to enable the MCP interface.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` to verify the JSON-RPC dispatcher and basic tool plumbing.
- [ ] Run a manual integration test by starting the server and using `curl` to call the `initialize` endpoint.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3/04_mcp_server_framework/README.md` (if it exists) or create it to document the `devs-mcp` crate architecture.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the traceability report shows 100% coverage for the mapped requirements.
