# Task: Implement Phase 5 Quality Gate Infrastructure Foundations (Sub-Epic: 001_workspace_toolchain_setup)

## Covered Requirements
- [AC-ROAD-P5-001], [AC-ROAD-P5-002]

## Dependencies
- depends_on: ["13_acceptance_criteria_traceability_and_phase3.md"]
- shared_components: [Traceability & Coverage Infrastructure, ./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/tests/quality_gate_infrastructure.rs` that verify:
  1. The five quality gates (QG-001 through QG-005) are defined as named constants with their threshold values:
     - QG-001: 90% unit coverage aggregate
     - QG-002: 80% E2E coverage aggregate
     - QG-003: 50% CLI E2E coverage
     - QG-004: 50% TUI E2E coverage
     - QG-005: 50% MCP E2E coverage
     Annotate `// Covers: AC-ROAD-P5-001`.
  2. `./do coverage` enforces all five quality gates simultaneously in a single run — failure of any gate causes non-zero exit. Annotate `// Covers: AC-ROAD-P5-001`.
  3. `target/coverage/report.json` contains per-gate pass/fail status in addition to per-crate percentages. Annotate `// Covers: AC-ROAD-P5-001`.
  4. `./do test` generates `target/traceability.json` with `traceability_pct` field that must equal 100.0 for Phase 5 completion. Annotate `// Covers: AC-ROAD-P5-002`.
  5. The traceability scanner detects stale `// Covers:` annotations (referencing requirement IDs not in the known set from phase_0.md). Annotate `// Covers: AC-ROAD-P5-002`.
  6. The traceability scanner detects missing coverage (requirement IDs in phase_0.md with no corresponding `// Covers:` annotation in any test file). Annotate `// Covers: AC-ROAD-P5-002`.
  7. `./do lint` validates that `target/traceability.json` schema includes `uncovered_requirements` array listing all requirements without test coverage. Annotate `// Covers: AC-ROAD-P5-002`.

## 2. Task Implementation
- [ ] Define quality gate constants in `crates/devs-core/src/quality_gates.rs`:
  ```rust
  pub const QG_001_UNIT_COVERAGE_PCT: f64 = 90.0;
  pub const QG_002_E2E_AGGREGATE_PCT: f64 = 80.0;
  pub const QG_003_CLI_E2E_PCT: f64 = 50.0;
  pub const QG_004_TUI_E2E_PCT: f64 = 50.0;
  pub const QG_005_MCP_E2E_PCT: f64 = 50.0;
  ```
- [ ] Implement `QualityGate` struct with fields: `id: String`, `description: String`, `threshold_pct: f64`, `actual_pct: Option<f64>`, `passed: bool`.
- [ ] Implement `QualityGateReport` struct with fields: `gates: Vec<QualityGate>`, `all_passed: bool`, `timestamp: String`.
- [ ] Add `--quality-gates` flag to `./do coverage` that outputs `target/coverage/report.json` with quality gate status.
- [ ] Enhance `./do test` traceability scanner:
  - Load all requirement IDs from `docs/plan/phases/phase_0.md` (grep for `\[A-Z][A-Z0-9_-]*[A-Z0-9]\]` pattern).
  - Scan all `.rs` test files for `// Covers: <REQ-ID>` annotations.
  - Compute `traceability_pct = (covered_count / total_count) * 100.0`.
  - Generate `uncovered_requirements` array listing all requirement IDs without coverage.
  - Generate `stale_annotations` array listing all `// Covers:` annotations referencing unknown requirement IDs.
- [ ] Add `./do lint` check that validates `target/traceability.json` schema includes all required fields: `traceability_pct`, `stale_annotations`, `uncovered_requirements`, `phase_gates`.

## 3. Code Review
- [ ] Verify all 2 requirement IDs have `// Covers:` annotations in test code.
- [ ] Verify quality gate constants match the values from the Traceability & Coverage Infrastructure shared component specification.
- [ ] Verify the traceability scanner loads requirement IDs from phase_0.md dynamically (not hardcoded).
- [ ] Verify `target/coverage/report.json` and `target/traceability.json` schemas are documented in code comments.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- quality_gate_infrastructure` and confirm all tests pass.
- [ ] Run `./do coverage --quality-gates` and verify `target/coverage/report.json` is generated with correct schema.
- [ ] Run `./do test` and verify `target/traceability.json` contains `uncovered_requirements` array.
- [ ] Run `./do lint` and confirm traceability schema validation passes.

## 5. Update Documentation
- [ ] Add doc comments to `QualityGate` and `QualityGateReport` structs explaining their role in Phase 5 verification.
- [ ] Add a `QUALITY_GATES.md` file in `docs/plan/` documenting the five quality gates and their thresholds.

## 6. Automated Verification
- [ ] Run `python3 -c "import json; d=json.load(open('target/coverage/report.json')); assert 'gates' in d; assert all('passed' in g for g in d['gates'])"` to verify quality gate report schema.
- [ ] Run `python3 -c "import json; d=json.load(open('target/traceability.json')); assert 'uncovered_requirements' in d; assert 'stale_annotations' in d"` to verify traceability schema.
- [ ] Run `grep -c 'Covers: AC-ROAD-P5-' crates/devs-core/tests/quality_gate_infrastructure.rs` and confirm it returns at least 2.
