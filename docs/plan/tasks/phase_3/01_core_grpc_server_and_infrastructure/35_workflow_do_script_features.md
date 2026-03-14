# Task: Workflow Definition and ./do Script User Features (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [4_USER_FEATURES-AC-3-WF-001], [4_USER_FEATURES-AC-3-WF-002], [4_USER_FEATURES-AC-3-WF-003], [4_USER_FEATURES-AC-3-WF-004], [4_USER_FEATURES-AC-3-WF-005], [4_USER_FEATURES-AC-3-WF-006], [4_USER_FEATURES-AC-3-WF-007], [4_USER_FEATURES-AC-3-WF-008], [4_USER_FEATURES-AC-3-WF-009], [4_USER_FEATURES-AC-3-WF-010], [4_USER_FEATURES-AC-3-DO-001], [4_USER_FEATURES-AC-3-DO-002], [4_USER_FEATURES-AC-3-DO-003], [4_USER_FEATURES-AC-3-DO-004], [4_USER_FEATURES-AC-3-DO-005], [4_USER_FEATURES-DO-BR-001], [4_USER_FEATURES-DO-BR-002], [4_USER_FEATURES-DO-BR-003], [4_USER_FEATURES-DO-BR-004], [4_USER_FEATURES-DO-BR-005], [4_USER_FEATURES-DO-BR-006], [4_USER_FEATURES-TOC-BR-001], [4_USER_FEATURES-TOC-BR-002], [4_USER_FEATURES-TOC-BR-003], [4_USER_FEATURES-TOC-BR-004], [4_USER_FEATURES-TOC-BR-005], [4_USER_FEATURES-TOC-BR-006], [4_USER_FEATURES-TOC-BR-007]

## Dependencies
- depends_on: ["04_devs_server_crate_and_startup_sequence.md"]
- shared_components: ["devs-config (consumer)", "./do Entrypoint Script & CI Pipeline (consumer)", "Traceability & Coverage Infrastructure (consumer)"]

## 1. Initial Test Written
- [ ] Create `tests/workflow_features_test.rs` with tests for workflow definition features: TOML workflow parsing (AC-3-WF-001), YAML workflow parsing (AC-3-WF-002), Rust builder API compilation (AC-3-WF-003), workflow input parameter declaration (AC-3-WF-004), template variable interpolation (AC-3-WF-005).
- [ ] Write tests for workflow validation: DAG cycle detection (AC-3-WF-006), dependency resolution (AC-3-WF-007), stage name uniqueness (AC-3-WF-008), fan-out configuration (AC-3-WF-009), branch handler registration (AC-3-WF-010).
- [ ] Write tests for ./do script features: `./do presubmit` runs all checks (AC-3-DO-001), `./do test` generates traceability (AC-3-DO-002), `./do coverage` reports per-crate (AC-3-DO-003), `./do lint` validates PTC and stubs (AC-3-DO-004), `./do ci` runs on all platforms (AC-3-DO-005).
- [ ] Write tests for ./do business rules: 900s timeout (DO-BR-001), incremental timing (DO-BR-002), exit code gating (DO-BR-003), DEVS_DISCOVERY_FILE isolation (DO-BR-004), presubmit gates commits (DO-BR-005), CI parity (DO-BR-006).
- [ ] Write tests for traceability rules: `// Covers:` annotation parsing (TOC-BR-001), stale annotation detection (TOC-BR-002), requirement coverage tracking (TOC-BR-003), phase gate validation (TOC-BR-004), traceability percentage (TOC-BR-005), coverage gate enforcement (TOC-BR-006), traceability JSON output (TOC-BR-007).

## 2. Task Implementation
- [ ] Implement workflow definition features in `devs-config` for TOML and YAML parsing.
- [ ] Implement workflow validation: DAG cycle detection, dependency resolution, stage name uniqueness.
- [ ] Implement template variable interpolation with transitive dependency checking.
- [ ] Verify and enhance `./do` script commands to meet all acceptance criteria.
- [ ] Implement traceability infrastructure with annotation parsing and coverage tracking.

## 3. Code Review
- [ ] Verify TOML and YAML workflow definitions produce identical parsed structures.
- [ ] Confirm DAG cycle detection handles complex graphs correctly.
- [ ] Ensure `./do presubmit` enforces the 900-second timeout.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and confirm workflow feature tests pass.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 28 requirements.

## 6. Automated Verification
- [ ] Run `./do presubmit` with zero failures.
