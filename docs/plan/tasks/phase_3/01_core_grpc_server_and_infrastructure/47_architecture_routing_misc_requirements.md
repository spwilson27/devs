# Task: Architecture, Routing, ASCII Art Business Rules, and Miscellaneous Requirements (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [ARCH-AC-009], [ARCH-BR-001], [ARCH-BR-008], [UI-ARCH-PATH-004], [UI-ROUTE-018], [UI-ROUTE-023], [UI-ASCII-BR-001], [UI-ASCII-BR-002], [UI-ASCII-BR-003], [UI-ASCII-BR-004], [UI-ASCII-BR-005], [UI-ASCII-BR-006], [UI-ASCII-BR-007], [UI-ASCII-BR-008], [UI-ASCII-BR-009], [UI-ASCII-BR-010], [UI-ASCII-BR-011], [UI-ASCII-BR-012], [UI-ASCII-BR-013], [UI-ASCII-BR-014], [UI-ASCII-BR-015], [UI-ASCII-BR-016], [UI-ASCII-BR-017], [UI-ASCII-BR-018], [UI-ASCII-BR-019], [UI-ASCII-BR-020], [UI-ASCII-BR-021], [UI-ASCII-BR-022], [UI-ASCII-BR-023], [UI-ASCII-BR-024], [UI-ASCII-BR-025]

## Dependencies
- depends_on: ["01_devs_grpc_crate_scaffold_and_server_service.md", "33_tui_interface_features_business_rules.md"]
- shared_components: ["devs-tui (consumer)", "devs-server (consumer)", "devs-core (consumer)"]

## 1. Initial Test Written
- [ ] Create `tests/architecture_test.rs` with tests for architectural requirements: single Cargo workspace (ARCH-AC-009), gRPC transport for all clients (ARCH-BR-001), MCP server on separate port (ARCH-BR-008).
- [ ] Create `crates/devs-tui/tests/routing_test.rs` with tests for UI routing: path-based navigation (UI-ARCH-PATH-004), tab routing (UI-ROUTE-018), deep link routing (UI-ROUTE-023).
- [ ] Create `crates/devs-tui/tests/ascii_br_test.rs` with tests for ASCII art business rules: box drawing characters (UI-ASCII-BR-001 to 005), line drawing (UI-ASCII-BR-006 to 010), graph rendering rules (UI-ASCII-BR-011 to 015), Unicode fallback (UI-ASCII-BR-016 to 020), ASCII-only mode (UI-ASCII-BR-021 to 025).

## 2. Task Implementation
- [ ] Verify workspace structure meets architectural requirements.
- [ ] Implement TUI routing system with path-based navigation.
- [ ] Implement ASCII art rendering with Unicode box drawing characters.
- [ ] Implement fallback to ASCII-only rendering for terminals without Unicode support.
- [ ] Implement all 25 ASCII art business rules for consistent graph rendering.

## 3. Code Review
- [ ] Verify all crates are in the same Cargo workspace.
- [ ] Confirm ASCII fallback produces readable output.
- [ ] Ensure routing system handles invalid paths gracefully.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- architecture` and `cargo test -p devs-tui -- ascii_br` with zero failures.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 31 requirements.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
