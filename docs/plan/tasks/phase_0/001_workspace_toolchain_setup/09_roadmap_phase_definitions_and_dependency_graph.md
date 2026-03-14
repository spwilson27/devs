# Task: Define Roadmap Phase Definitions and Crate Dependency Graph (Sub-Epic: 001_workspace_toolchain_setup)

## Covered Requirements
- [ROAD-001], [ROAD-002], [ROAD-003], [ROAD-004], [ROAD-005], [ROAD-006], [ROAD-007], [ROAD-008], [ROAD-009], [ROAD-010], [ROAD-011], [ROAD-012], [ROAD-013], [ROAD-014], [ROAD-015], [ROAD-016], [ROAD-017], [ROAD-018], [ROAD-019], [ROAD-020], [ROAD-021], [ROAD-022], [ROAD-023], [ROAD-024], [ROAD-025], [9_PROJECT_ROADMAP-REQ-045], [9_PROJECT_ROADMAP-REQ-046], [9_PROJECT_ROADMAP-REQ-047], [9_PROJECT_ROADMAP-REQ-048], [ROAD-P3-DEP-001], [ROAD-P3-DEP-002], [ROAD-P3-DEP-003]

## Dependencies
- depends_on: ["03_workspace_build_validation.md"]
- shared_components: [devs-core, Phase Transition Checkpoint (PTC) Model, ./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/tests/roadmap_definitions.rs` that verify:
  1. Six phases are defined (Phase 0 through Phase 5) with correct names and ordinal numbers. Annotate `// Covers: ROAD-001` through `// Covers: ROAD-006`.
  2. The crate dependency graph defines exactly 15 workspace crate nodes plus the workspace root and `./do` + CI node. Annotate `// Covers: ROAD-007` through `// Covers: ROAD-023`.
  3. Bootstrap complete milestone (ROAD-024) is defined with its preconditions.
  4. MVP release milestone (ROAD-025) is defined with its preconditions.
  5. The workspace node has no upstream dependencies. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-045`.
  6. `devs-proto` depends only on the workspace node. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-046`.
  7. `./do` + CI depends only on the workspace node. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-047`.
  8. `devs-core` depends only on the workspace and `devs-proto` nodes. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-048`.
  9. Phase 3 dependency specifications are encoded: devs-grpc depends on devs-scheduler and devs-pool, devs-mcp depends on devs-scheduler and devs-pool, devs-server depends on all Phase 1 and Phase 2 crates. Annotate `// Covers: ROAD-P3-DEP-001`, `// Covers: ROAD-P3-DEP-002`, `// Covers: ROAD-P3-DEP-003`.
- [ ] Create a `./do lint` integration that runs `cargo tree` and verifies the dependency graph matches the roadmap specification (no forbidden edges).

## 2. Task Implementation
- [ ] Define `PhaseDefinition` struct in `crates/devs-core/src/roadmap.rs` with fields: `id: u8`, `name: String`, `description: String`, `deliverables: Vec<String>`, `gate_conditions: Vec<String>`.
- [ ] Define `CrateDependencyNode` struct with fields: `name: String`, `phase: u8`, `depends_on: Vec<String>`.
- [ ] Create a static `ROADMAP` constant containing all six phase definitions with their deliverables and gate conditions as specified in phase_0.md.
- [ ] Create a static `CRATE_DEPENDENCY_GRAPH` containing all 17 nodes (15 crates + workspace + ./do) with their dependency edges matching the project roadmap.
- [ ] Define milestone structs for `BOOTSTRAP_COMPLETE` (ROAD-024) and `MVP_RELEASE` (ROAD-025) with their precondition lists.
- [ ] Add `validate_dependency_graph()` function that checks the graph is a valid DAG with no cycles and all edges respect phase ordering.
- [ ] Add `./do lint` check that uses `cargo tree` output to verify actual crate dependencies match the declared graph — flag any forbidden edges.

## 3. Code Review
- [ ] Verify all 31 requirement IDs are annotated in test code.
- [ ] Verify the dependency graph is consistent with the shared components manifest.
- [ ] Verify no runtime dependencies added to `devs-core`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- roadmap_definitions` and confirm all tests pass.
- [ ] Run `./do lint` and confirm dependency graph validation passes.

## 5. Update Documentation
- [ ] Add doc comments to `PhaseDefinition` and `CrateDependencyNode` structs.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm zero failures.
- [ ] Run `cargo tree -p devs-core | grep -E 'tokio|git2|reqwest|tonic'` and confirm zero matches.
