# Task: MCP Acceptance Criteria Group 1 — Server Protocol and Infrastructure (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [3_MCP_DESIGN-REQ-AC-1.02], [3_MCP_DESIGN-REQ-AC-1.03], [3_MCP_DESIGN-REQ-AC-1.04], [3_MCP_DESIGN-REQ-AC-1.05], [3_MCP_DESIGN-REQ-AC-1.06], [3_MCP_DESIGN-REQ-AC-1.07], [3_MCP_DESIGN-REQ-AC-1.08], [3_MCP_DESIGN-REQ-AC-1.09], [3_MCP_DESIGN-REQ-AC-1.10], [3_MCP_DESIGN-REQ-AC-1.11], [3_MCP_DESIGN-REQ-AC-1.12], [3_MCP_DESIGN-REQ-AC-1.13], [3_MCP_DESIGN-REQ-AC-1.14], [3_MCP_DESIGN-REQ-AC-1.15], [3_MCP_DESIGN-REQ-AC-1.16], [3_MCP_DESIGN-REQ-AC-1.17], [3_MCP_DESIGN-REQ-AC-1.18]

## Dependencies
- depends_on: ["01_devs_grpc_crate_scaffold_and_server_service.md", "04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["devs-grpc (consumer)", "devs-mcp (consumer)", "devs-proto (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/tests/ac_group1_test.rs` with tests verifying each AC-1 acceptance criterion: MCP server binds to configured port (AC-1.02), JSON-RPC protocol compliance (AC-1.03), all 20 MCP tools are registered and discoverable (AC-1.04), tool schema validation rejects malformed requests (AC-1.05), correct error response format (AC-1.06).
- [ ] Write tests for MCP server lifecycle: startup binding (AC-1.07), shutdown cleanup (AC-1.08), concurrent request handling (AC-1.09).
- [ ] Write tests for MCP protocol edge cases: unknown method returns error (AC-1.10), missing params returns error (AC-1.11), large payload handling (AC-1.12), request ID propagation (AC-1.13).
- [ ] Write tests for MCP push notifications: notification delivery to connected clients (AC-1.14), notification format compliance (AC-1.15), client disconnect cleanup (AC-1.16).
- [ ] Write tests for MCP bridge compatibility: stdio transport forwarding (AC-1.17), bridge error handling (AC-1.18).

## 2. Task Implementation
- [ ] Implement all MCP server protocol acceptance criteria in `devs-mcp` crate, ensuring JSON-RPC compliance, tool registration, schema validation, and error handling.
- [ ] Implement push notification infrastructure for mid-run updates to connected MCP clients.
- [ ] Ensure MCP server lifecycle is correctly wired into the server startup/shutdown sequence.
- [ ] Implement request ID propagation through the MCP request/response cycle.
- [ ] Implement concurrent request handling with proper isolation between requests.

## 3. Code Review
- [ ] Verify JSON-RPC responses strictly follow the `{"result": {...}, "error": null}` format.
- [ ] Confirm all 20 MCP tools are registered and respond to discovery requests.
- [ ] Ensure error responses include meaningful error codes and messages.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- ac_group1` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 3_MCP_DESIGN-REQ-AC-1.XX` annotations to all test functions.
- [ ] Document MCP server protocol in module-level doc comments.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
