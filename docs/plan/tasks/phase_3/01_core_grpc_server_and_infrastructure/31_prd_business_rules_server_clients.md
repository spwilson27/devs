# Task: PRD Business Rules for Server and Client Interfaces (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [3_PRD-BR-001], [3_PRD-BR-002], [3_PRD-BR-003], [3_PRD-BR-004], [3_PRD-BR-005], [3_PRD-BR-006], [3_PRD-BR-007], [3_PRD-BR-008], [3_PRD-BR-009], [3_PRD-BR-010], [3_PRD-BR-011], [3_PRD-BR-012], [3_PRD-BR-014], [3_PRD-BR-018], [3_PRD-BR-019], [3_PRD-BR-020], [3_PRD-BR-023], [3_PRD-BR-024], [3_PRD-BR-025], [3_PRD-BR-026], [3_PRD-BR-027], [3_PRD-BR-028], [3_PRD-BR-029], [3_PRD-BR-037], [3_PRD-BR-038], [3_PRD-BR-039], [3_PRD-BR-044], [3_PRD-BR-045], [3_PRD-BR-046], [3_PRD-BR-047], [3_PRD-BR-048], [3_PRD-BR-049], [3_PRD-BR-050], [3_PRD-BR-051], [3_PRD-BR-052]

## Dependencies
- depends_on: ["01_devs_grpc_crate_scaffold_and_server_service.md", "04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["devs-grpc (consumer)", "devs-mcp (consumer)", "devs-config (consumer)", "devs-scheduler (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-server/tests/prd_business_rules_test.rs` with tests for server business rules: gRPC server runs as background process (BR-001), gRPC API exposes all client interfaces (BR-002), remote client connections supported (BR-003), server configuration via TOML (BR-004).
- [ ] Write tests for client interface rules: CLI connects over gRPC (BR-005), TUI connects over gRPC (BR-006), MCP clients connect to MCP port (BR-007), all interfaces support remote operation (BR-008).
- [ ] Write tests for protocol rules: gRPC reflection enabled (BR-009), server discovery protocol (BR-010), explicit address overrides auto-discovery (BR-011), health check endpoint (BR-012).
- [ ] Write tests for run management rules: workflow run submission via CLI (BR-014), run listing (BR-018), run status query (BR-019), log streaming (BR-020).
- [ ] Write tests for scheduling rules: multi-project support (BR-023), project priority (BR-024), pool sharing across projects (BR-025), agent concurrency limits (BR-026), capability-based routing (BR-027), fallback order (BR-028), rate limit handling (BR-029).
- [ ] Write tests for execution rules: completion signal handling (BR-037), structured output parsing (BR-038), MCP tool call completion (BR-039).
- [ ] Write tests for persistence rules: checkpoint git persistence (BR-044), configurable checkpoint branch (BR-045), workflow snapshot on run start (BR-046), log retention policy (BR-047), run name deduplication (BR-048), discovery file management (BR-049), outbound webhooks (BR-050), webhook event types (BR-051), notification target configuration (BR-052).

## 2. Task Implementation
- [ ] Verify all PRD business rules are enforced through integration tests across the server, gRPC, and MCP components.
- [ ] Implement any missing enforcement for business rules not yet covered by existing task implementations.
- [ ] Ensure server-level integration tests cover cross-component business rule interactions.

## 3. Code Review
- [ ] Verify each business rule has at least one test that would fail if the rule were violated.
- [ ] Confirm business rules are enforced at the correct layer (config validation, scheduler, gRPC handler).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server -- prd_business` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 3_PRD-BR-XXX` annotations to all test functions.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
