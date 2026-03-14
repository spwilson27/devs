# Task: Implement Roadmap Dependency Graph and Phase Gate Types (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-049], [9_PROJECT_ROADMAP-REQ-050], [9_PROJECT_ROADMAP-REQ-051], [9_PROJECT_ROADMAP-REQ-052], [9_PROJECT_ROADMAP-REQ-053], [9_PROJECT_ROADMAP-REQ-054], [9_PROJECT_ROADMAP-REQ-055], [9_PROJECT_ROADMAP-REQ-056], [9_PROJECT_ROADMAP-REQ-057], [9_PROJECT_ROADMAP-REQ-058], [9_PROJECT_ROADMAP-REQ-059], [9_PROJECT_ROADMAP-REQ-060], [9_PROJECT_ROADMAP-REQ-061], [9_PROJECT_ROADMAP-REQ-062], [9_PROJECT_ROADMAP-REQ-063], [9_PROJECT_ROADMAP-REQ-064], [9_PROJECT_ROADMAP-REQ-065]

## Dependencies
- depends_on: []
- shared_components: [devs-core (Owner), ./do Entrypoint Script & CI Pipeline (Consumer), Phase Transition Checkpoint (PTC) Model (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_crate_dependency_graph_phase0_to_phase1` asserting `CrateDependency::new("devs-core", "devs-config")` represents P0D→P1A edge
- [ ] Write test `test_crate_dependency_graph_adapters_to_pool` asserting P1C→P1D edge (devs-adapters → devs-pool)
- [ ] Write test `test_crate_dependency_graph_pool_to_executor` asserting P1D→P1E edge
- [ ] Write test `test_crate_dependency_graph_executor_to_scheduler` asserting P1E→P2A edge
- [ ] Write test `test_forbidden_import_rule` asserting `ForbiddenImportRule` can express "devs-core must not depend on tokio"
- [ ] Write test `test_bootstrap_stub_annotation` asserting `BOOTSTRAP_STUB_ANNOTATION` constant equals `"// TODO: BOOTSTRAP-STUB"`
- [ ] Write test `test_phase_gate_all_phases` asserting `PhaseId` enum has `Phase0` through `Phase5` variants

## 2. Task Implementation
- [ ] Define `CrateDependency` struct in `crates/devs-core/src/roadmap.rs` with `from_crate: String`, `to_crate: String`, `road_id: String`
- [ ] Define `PHASE_DEPENDENCY_GRAPH: &[(&str, &str, &str)]` constant encoding all edges from the roadmap: `("devs-core", "devs-config", "ROAD-011")`, `("devs-core", "devs-checkpoint", "ROAD-012")`, `("devs-core", "devs-adapters", "ROAD-013")`, `("devs-adapters", "devs-pool", "ROAD-014")`, `("devs-pool", "devs-executor", "ROAD-015")`, `("devs-executor", "devs-scheduler", "ROAD-016")`, `("devs-scheduler", "devs-webhook", "ROAD-017")`, `("devs-scheduler", "devs-grpc", "ROAD-018")`, `("devs-scheduler", "devs-mcp", "ROAD-019")`, `("devs-grpc", "devs-server", "ROAD-020")`, `("devs-server", "devs-cli", "ROAD-021")`, `("devs-server", "devs-tui", "ROAD-022")`, `("devs-mcp", "devs-mcp-bridge", "ROAD-023")`, `("devs-server", "bootstrap", "ROAD-024")`, `("bootstrap", "mvp-release", "ROAD-025")`
- [ ] Define `ForbiddenImportRule` struct with `crate_name: String`, `forbidden_dependency: String` for `cargo tree` lint enforcement
- [ ] Define `BOOTSTRAP_STUB_ANNOTATION: &str = "// TODO: BOOTSTRAP-STUB"` constant
- [ ] Define `PhaseId` enum with `Phase0` through `Phase5` and `impl Display`
- [ ] Add `pub mod roadmap;` to `crates/devs-core/src/lib.rs`

## 3. Code Review
- [ ] Verify dependency graph exactly matches the roadmap spec edges
- [ ] Verify BOOTSTRAP-STUB annotation constant matches the lint rule
- [ ] Verify `PhaseId` covers all 6 phases

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core roadmap` and confirm all seven tests pass
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/roadmap.rs` explaining the crate dependency graph, phase gates, and the BOOTSTRAP-STUB annotation convention

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
