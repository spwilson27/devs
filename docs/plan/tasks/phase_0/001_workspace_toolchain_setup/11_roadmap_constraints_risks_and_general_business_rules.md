# Task: Implement Roadmap Constraints, Risks, Non-Goals, and General Business Rules (Sub-Epic: 001_workspace_toolchain_setup)

## Covered Requirements
- [ROAD-BR-001], [ROAD-BR-002], [ROAD-BR-003], [ROAD-BR-004], [ROAD-BR-005], [ROAD-BR-006], [ROAD-BR-007], [ROAD-BR-008], [ROAD-BR-009], [ROAD-BR-010], [ROAD-BR-011], [ROAD-BR-012], [ROAD-CONS-001], [ROAD-CONS-002], [ROAD-CONS-004], [ROAD-CONS-005], [ROAD-CONS-006], [ROAD-CONS-007], [ROAD-CONS-008], [ROAD-CRIT-001], [ROAD-CRIT-002], [ROAD-CRIT-003], [ROAD-CRIT-004], [ROAD-CRIT-005], [ROAD-CRIT-006], [ROAD-CRIT-007], [ROAD-CRIT-008], [ROAD-CRIT-009], [ROAD-CRIT-010], [ROAD-CRIT-011], [ROAD-CRIT-012], [ROAD-NGOAL-001], [ROAD-NGOAL-002], [ROAD-NGOAL-003], [ROAD-NGOAL-004], [ROAD-RISK-001], [ROAD-RISK-002], [ROAD-RISK-003]

## Dependencies
- depends_on: [07_ptc_json_schema_and_checkpoint_validation.md, 08_phase_state_machine_and_transition_rules.md]
- shared_components: [devs-core, Phase Transition Checkpoint (PTC) Model]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/tests/roadmap_rules.rs` that verify:
  1. General business rules (ROAD-BR-001 through ROAD-BR-012) — one test per rule verifying the rule is encoded as a testable assertion (e.g., "every crate has workspace lint inheritance", "no phase N+1 work without phase N PTC").
  2. Constraint: no business logic is implemented before its upstream phase PTC is committed. Annotate `// Covers: ROAD-CONS-001`.
  3. Constraint: critical risks (RISK-005, RISK-009) must be mitigated before any production code. Annotate `// Covers: ROAD-CONS-002`.
  4. Constraint: BOOTSTRAP-STUB annotations must all be resolved before Phase 5 completion. Annotate `// Covers: ROAD-CONS-004`.
  5. Constraint: Glass-Box MCP interface is available from first commit (stub is acceptable). Annotate `// Covers: ROAD-CONS-005`.
  6. Constraint: E2E tests must exercise actual interface boundaries (CLI, TUI, MCP), not internal APIs. Annotate `// Covers: ROAD-CONS-006`.
  7. Constraint: Phase 4 parallel E2E test work is allowed. Annotate `// Covers: ROAD-CONS-007`.
  8. Constraint: bootstrap attempt requires all Phase 3 deliverables complete. Annotate `// Covers: ROAD-CONS-008`.
- [ ] Create tests verifying critical path constraints (ROAD-CRIT-001 through ROAD-CRIT-012) are documented and testable — one test per constraint asserting the dependency chain is defined in the roadmap data model.
- [ ] Create tests verifying non-goals are explicitly excluded:
  1. No GUI code or dependencies exist in the workspace. Annotate `// Covers: ROAD-NGOAL-001`.
  2. No REST/web API code exists. Annotate `// Covers: ROAD-NGOAL-002`.
  3. No client authentication code exists. Annotate `// Covers: ROAD-NGOAL-003`.
  4. No external secrets manager integration exists. Annotate `// Covers: ROAD-NGOAL-004`.
- [ ] Create tests for risk management requirements:
  1. Risk matrix is defined with severity and likelihood. Annotate `// Covers: ROAD-RISK-001`.
  2. Each critical risk has documented mitigation strategy. Annotate `// Covers: ROAD-RISK-002`.
  3. Risk mitigations are verified in PTC gate conditions. Annotate `// Covers: ROAD-RISK-003`.

## 2. Task Implementation
- [ ] Define `RoadmapConstraint` enum in `crates/devs-core/src/roadmap.rs` encoding each constraint (ROAD-CONS-001 through ROAD-CONS-008) as a named variant with a validation method.
- [ ] Define `CriticalPathConstraint` struct with fields: `id: String`, `description: String`, `from_phase: u8`, `to_phase: u8`, `dependency_chain: Vec<String>`.
- [ ] Create static `CRITICAL_PATH` array with all 12 critical path constraints encoded.
- [ ] Define `NonGoal` enum with variants `NoGui`, `NoRestApi`, `NoClientAuth`, `NoExternalSecrets` and implement a `check_codebase(workspace_root: &Path) -> Vec<NonGoalViolation>` function that scans for violations.
- [ ] Define `RiskEntry` struct with `id`, `severity`, `likelihood`, `mitigation_strategy`, `verified` fields and create a static `RISK_MATRIX` with all identified risks.
- [ ] Add `./do lint` checks:
  - Verify no `web`, `rest`, `gui`, `auth` feature flags or crate dependencies exist that would violate non-goals.
  - Verify risk mitigations referenced in PTC files correspond to entries in the risk matrix.
- [ ] Implement `validate_general_business_rules(workspace: &WorkspaceState) -> Result<(), Vec<RuleViolation>>` that checks all ROAD-BR rules.

## 3. Code Review
- [ ] Verify all 38 requirement IDs have `// Covers:` annotations in tests.
- [ ] Verify no runtime dependencies added to `devs-core`.
- [ ] Verify constraint validation functions are pure (no I/O in core, I/O only in `./do` script).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- roadmap_rules` and confirm all tests pass.
- [ ] Run `./do lint` and confirm non-goal checks pass on stub workspace.

## 5. Update Documentation
- [ ] Add doc comments to all new types explaining their role in enforcing roadmap governance.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm zero failures.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.
