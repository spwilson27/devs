# Task: MCP Observability, Orchestration, Debug, and Miscellaneous Requirements (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [3_MCP_DESIGN-REQ-OBS-001], [3_MCP_DESIGN-REQ-OBS-002], [3_MCP_DESIGN-REQ-OBS-003], [3_MCP_DESIGN-REQ-OBS-004], [3_MCP_DESIGN-REQ-OBS-005], [3_MCP_DESIGN-REQ-OBS-006], [3_MCP_DESIGN-REQ-OBS-007], [3_MCP_DESIGN-REQ-OBS-008], [3_MCP_DESIGN-REQ-ORK-001], [3_MCP_DESIGN-REQ-ORK-002], [3_MCP_DESIGN-REQ-ORK-003], [3_MCP_DESIGN-REQ-ORK-004], [3_MCP_DESIGN-REQ-ORK-005], [3_MCP_DESIGN-REQ-ORK-006], [3_MCP_DESIGN-REQ-ORK-007], [3_MCP_DESIGN-REQ-DBG-BR-002], [3_MCP_DESIGN-REQ-DBG-BR-003], [3_MCP_DESIGN-REQ-DBG-BR-004], [3_MCP_DESIGN-REQ-DBG-BR-005], [3_MCP_DESIGN-REQ-NEW-007], [3_MCP_DESIGN-REQ-NEW-008], [3_MCP_DESIGN-REQ-NEW-009], [3_MCP_DESIGN-REQ-NNN], [MCP-057], [MCP-061], [MCP-075], [MCP-BR-004], [MCP-BR-040], [MCP-BR-042], [MCP-BR-043], [MCP-DBG-BR-005], [MCP-DBG-BR-015], [MCP-DBG-BR-016]

## Dependencies
- depends_on: ["01_devs_grpc_crate_scaffold_and_server_service.md", "04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["devs-mcp (consumer)", "devs-scheduler (consumer)", "devs-pool (consumer)", "devs-executor (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/tests/observability_test.rs` with tests for: full internal state exposure via MCP (OBS-001), agent state observation (OBS-002), stage output observation (OBS-003), log streaming (OBS-004), pool state observation (OBS-005), workflow definition reading (OBS-006), checkpoint state observation (OBS-007), real-time event streaming (OBS-008).
- [ ] Create `crates/devs-mcp/tests/orchestration_test.rs` with tests for: workflow run submission via MCP (ORK-001), run cancellation (ORK-002), run pause/resume (ORK-003), stage control (ORK-004), completion signaling (ORK-005), progress reporting (ORK-006), workflow definition management (ORK-007).
- [ ] Create `crates/devs-mcp/tests/debug_rules_test.rs` with tests for: debug tool access control (DBG-BR-002), debug output sanitization (DBG-BR-003), debug tool isolation from production state (DBG-BR-004), debug session management (DBG-BR-005).
- [ ] Write tests for MCP business rules: tool naming conventions (MCP-BR-004), error code consistency (MCP-BR-040), request validation (MCP-BR-042), response format consistency (MCP-BR-043).
- [ ] Write tests for MCP debug business rules: debug tool performance (MCP-DBG-BR-005), debug log filtering (MCP-DBG-BR-015), debug state snapshot (MCP-DBG-BR-016).
- [ ] Write tests for new MCP requirements: NEW-007, NEW-008, NEW-009 per their definitions in phase_3.md.
- [ ] Write a test covering MCP-NNN placeholder requirement: verify the MCP tool registry is extensible for future tools.
- [ ] Write tests for MCP requirements: MCP-057, MCP-061, MCP-075 per their definitions.

## 2. Task Implementation
- [ ] Implement full Glass-Box observability: every internal state category accessible via MCP tools.
- [ ] Implement orchestration tool handlers wired to the scheduler API.
- [ ] Implement debug tool handlers with state isolation and output sanitization.
- [ ] Enforce MCP business rules: consistent naming, error codes, validation, and response formats.
- [ ] Implement debug business rules: performance limits, log filtering, state snapshots.
- [ ] Ensure the MCP tool registry is designed for extensibility.

## 3. Code Review
- [ ] Verify Glass-Box observability is comprehensive — no internal state category is hidden.
- [ ] Confirm debug tools cannot modify production workflow state.
- [ ] Ensure all MCP responses follow consistent formatting rules.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp` and confirm all related tests pass.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 33 requirements.
- [ ] Document the Glass-Box observability model in module-level doc comments.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
