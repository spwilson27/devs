# Task: MCP Client and Bridge Features (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [4_USER_FEATURES-MCP-BR-T001], [4_USER_FEATURES-MCP-BR-T002], [4_USER_FEATURES-MCP-BR-T003], [4_USER_FEATURES-MCP-BR-T004], [4_USER_FEATURES-MCP-BR-T005], [4_USER_FEATURES-MCP-BR-T006], [4_USER_FEATURES-MCP-BR-T007], [4_USER_FEATURES-MCP-BR-T008], [4_USER_FEATURES-MCP-DBG-BR-017], [4_USER_FEATURES-AC-3-MCP-001], [4_USER_FEATURES-AC-3-MCP-002], [4_USER_FEATURES-AC-3-MCP-003], [4_USER_FEATURES-AC-3-MCP-004], [4_USER_FEATURES-AC-3-MCP-005], [4_USER_FEATURES-AC-3-MCP-006], [4_USER_FEATURES-AC-3-MCP-007], [4_USER_FEATURES-AC-3-MCP-008], [4_USER_FEATURES-AC-3-MCP-009], [4_USER_FEATURES-AC-3-MCP-010]

## Dependencies
- depends_on: ["25_mcp_acceptance_criteria_group1_server_protocol.md"]
- shared_components: ["devs-mcp (consumer)", "devs-mcp-bridge (owner)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp-bridge/tests/bridge_test.rs` with tests for: stdio JSON-RPC forwarding (AC-3-MCP-001), request routing to MCP server (AC-3-MCP-002), response forwarding back to stdout (AC-3-MCP-003), error handling for malformed JSON (AC-3-MCP-004), connection management (AC-3-MCP-005).
- [ ] Write tests for MCP bridge business rules: bridge discovers MCP port (MCP-BR-T001), bridge validates JSON before forwarding (MCP-BR-T002), bridge handles server disconnection (MCP-BR-T003), bridge supports concurrent requests (MCP-BR-T004), bridge propagates push notifications (MCP-BR-T005), bridge exits cleanly on stdin EOF (MCP-BR-T006), bridge logs to stderr (MCP-BR-T007), bridge supports DEVS_DISCOVERY_FILE (MCP-BR-T008).
- [ ] Write tests for MCP tool accessibility: all 20 tools accessible via bridge (AC-3-MCP-006), tool schema discoverable (AC-3-MCP-007), push notifications received (AC-3-MCP-008), debug tools accessible (AC-3-MCP-009), testing tools accessible (AC-3-MCP-010).
- [ ] Write test for MCP debug bridge rule: MCP-DBG-BR-017 per its definition.

## 2. Task Implementation
- [ ] Implement `devs-mcp-bridge` crate with stdin/stdout JSON-RPC transport.
- [ ] Implement HTTP client connecting to MCP server port.
- [ ] Implement request forwarding: read JSON-RPC from stdin, POST to MCP server, write response to stdout.
- [ ] Implement push notification forwarding from MCP server to stdout.
- [ ] Implement server discovery (DEVS_DISCOVERY_FILE) for MCP port resolution.
- [ ] Implement error handling: malformed JSON, server disconnection, stdin EOF.
- [ ] Implement logging to stderr (not stdout, which is the transport).

## 3. Code Review
- [ ] Verify bridge never writes non-JSON-RPC content to stdout.
- [ ] Confirm bridge handles partial JSON reads correctly.
- [ ] Ensure bridge process exits cleanly with code 0 on stdin EOF.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp-bridge` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 19 requirements.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
