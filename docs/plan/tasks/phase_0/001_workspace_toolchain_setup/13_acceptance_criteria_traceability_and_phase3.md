# Task: Implement Acceptance Criteria for Traceability, Coverage Gates, and Phase 3 Readiness (Sub-Epic: 001_workspace_toolchain_setup)

## Covered Requirements
- [AC-ROAD-001], [AC-ROAD-002], [AC-ROAD-003], [AC-ROAD-004], [AC-ROAD-005], [AC-ROAD-006], [AC-ROAD-008], [AC-ROAD-009], [AC-ROAD-010], [AC-ROAD-P3-001], [AC-ROAD-P3-002], [AC-ROAD-P3-003], [AC-ROAD-P3-004], [AC-ROAD-P3-005], [AC-ROAD-P3-006], [AC-ROAD-P3-007], [AC-ROAD-P3-008], [AC-ROAD-P3-009], [TECH-AC-011], [A-Z0-9-]

## Dependencies
- depends_on: ["07_ptc_json_schema_and_checkpoint_validation.md", "09_roadmap_phase_definitions_and_dependency_graph.md", "10_presubmit_timing_timeout_and_lint_rules.md"]
- shared_components: [devs-core, Phase Transition Checkpoint (PTC) Model, ./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create tests in `crates/devs-core/tests/acceptance_criteria.rs` that verify:
  **Traceability & Roadmap Acceptance Criteria (AC-ROAD-001 through AC-ROAD-010):**
  1. `./do test` generates `target/traceability.json` containing a `phase_gates` array with one entry per completed phase. Annotate `// Covers: AC-ROAD-001`.
  2. `./do lint` detects PTC files with invalid `gate_conditions` (e.g., missing `verified` field, invalid condition IDs). Annotate `// Covers: AC-ROAD-002`.
  3. `./do lint` flags BOOTSTRAP-STUB annotations as errors after Phase 3 PTC is committed. Annotate `// Covers: AC-ROAD-003`.
  4. `./do presubmit` emits a warning to stderr when a pool fallback agent is used during automated workflows. Annotate `// Covers: AC-ROAD-004`.
  5. Bootstrap ADR contains all required fields: COND-001/002/003 results, timing data, platform verification. Annotate `// Covers: AC-ROAD-005`.
  6. All five coverage gates (QG-001 through QG-005) must pass simultaneously in a single presubmit run. Annotate `// Covers: AC-ROAD-006`.
  7. `./do lint` enforces crate dependency graph via `cargo tree` — forbidden imports cause failure. Annotate `// Covers: AC-ROAD-008`.
  8. Bootstrap attempt must complete within the 900-second presubmit budget. Annotate `// Covers: AC-ROAD-009`.
  9. `target/traceability.json` includes a `risk_matrix_violations` array (empty when all risks mitigated). Annotate `// Covers: AC-ROAD-010`.

  **Phase 3 Readiness Acceptance Criteria (AC-ROAD-P3-001 through AC-ROAD-P3-009):**
  10. Define stub test asserting `devs-server` binary starts and binds gRPC and MCP ports. Annotate `// Covers: AC-ROAD-P3-001`.
  11. Define stub test asserting CLI `status` command returns valid JSON response. Annotate `// Covers: AC-ROAD-P3-002`.
  12. Define stub test asserting MCP `list_runs` tool returns HTTP 200. Annotate `// Covers: AC-ROAD-P3-003`.
  13. Define stub test asserting TUI renders Dashboard tab with project list. Annotate `// Covers: AC-ROAD-P3-004`.
  14. Define stub test asserting MCP bridge forwards stdin/stdout correctly. Annotate `// Covers: AC-ROAD-P3-005`.
  15. Define stub test asserting bootstrap COND-001 (server port binding) is verifiable. Annotate `// Covers: AC-ROAD-P3-006`.
  16. Define stub test asserting gRPC reflection is operational. Annotate `// Covers: AC-ROAD-P3-007`.
  17. Define stub test asserting server discovery file is written and readable. Annotate `// Covers: AC-ROAD-P3-008`.
  18. Define stub test asserting server graceful shutdown cleans up resources. Annotate `// Covers: AC-ROAD-P3-009`.

  **Technical Acceptance Criteria:**
  19. Requirement IDs follow the pattern `[A-Z0-9-]+` (alphanumeric with hyphens). Verify the regex pattern is used consistently in traceability scanning. Annotate `// Covers: TECH-AC-011`, `// Covers: A-Z0-9-`.

## 2. Task Implementation
- [ ] Implement traceability report generation in `./do test`:
  - After running `cargo test`, scan all `.rs` files for `// Covers: <REQ-ID>` annotations.
  - Generate `target/traceability.json` with fields: `traceability_pct`, `stale_annotations`, `phase_gates` array, `risk_matrix_violations` array.
  - The `phase_gates` array contains one entry per PTC found in `docs/adr/`, with phase number, completion date, and gate condition summary.
- [ ] Implement requirement ID validation:
  - Define regex pattern `[A-Z][A-Z0-9_-]*[A-Z0-9]` for valid requirement IDs.
  - Use this pattern in the traceability scanner to extract and validate `// Covers:` annotations.
- [ ] Create Phase 3 readiness stub tests in `tests/phase_3_readiness/`:
  - Each stub test is marked with `#[ignore]` and annotated with `BOOTSTRAP-STUB` comment.
  - Stub tests document the expected behavior but do not execute real assertions until Phase 3 implementation.
  - Each stub test has the correct `// Covers:` annotation for its AC-ROAD-P3-* requirement.
- [ ] Add `./do lint` integration:
  - Validate that all `// Covers:` annotations reference valid requirement IDs matching the regex pattern.
  - Report stale annotations (referencing requirement IDs not in the known set).

## 3. Code Review
- [ ] Verify all 20 requirement IDs have `// Covers:` annotations in test code.
- [ ] Verify Phase 3 stub tests are properly marked `#[ignore]` and `BOOTSTRAP-STUB`.
- [ ] Verify the traceability scanner regex matches the documented requirement ID format.
- [ ] Verify `target/traceability.json` schema matches the Traceability & Coverage Infrastructure shared component specification.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --workspace` and confirm all non-ignored tests pass.
- [ ] Run `./do test` and verify `target/traceability.json` is generated with correct schema.
- [ ] Run `./do lint` and confirm requirement ID validation passes.

## 5. Update Documentation
- [ ] Add doc comments to the traceability scanner explaining the `// Covers:` annotation convention.

## 6. Automated Verification
- [ ] Run `python3 -c "import json; d=json.load(open('target/traceability.json')); assert 'phase_gates' in d; assert 'risk_matrix_violations' in d"` to verify schema.
- [ ] Run `grep -r 'BOOTSTRAP-STUB' tests/phase_3_readiness/ | wc -l` and confirm it matches the number of Phase 3 stub tests.
- [ ] Run `cargo test -p devs-core -- acceptance_criteria` and confirm all tests pass.
