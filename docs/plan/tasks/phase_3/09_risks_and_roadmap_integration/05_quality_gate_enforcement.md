# Task: Quality Gate Enforcement and Coverage Report Generation (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-002], [9_PROJECT_ROADMAP-REQ-022], [9_PROJECT_ROADMAP-REQ-028], [9_PROJECT_ROADMAP-REQ-037], [9_PROJECT_ROADMAP-REQ-104], [9_PROJECT_ROADMAP-REQ-126], [9_PROJECT_ROADMAP-REQ-128], [9_PROJECT_ROADMAP-REQ-306], [9_PROJECT_ROADMAP-REQ-308], [9_PROJECT_ROADMAP-REQ-315], [9_PROJECT_ROADMAP-REQ-316], [9_PROJECT_ROADMAP-REQ-323]
- [8_RISKS-REQ-201] through [8_RISKS-REQ-250]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `pytest .tools/tests/test_quality_gates.py` that verifies a mock `target/coverage/report.json`.
- [ ] Test cases must verify that if `overall_passed` is false in the coverage report, `./do coverage` exits non-zero.
- [ ] Test cases must verify that if `unit_test_coverage_pct < 90.0`, it fails.
- [ ] Test cases must verify that if `e2e_interface_coverage_pct < 50.0` for any interface (TUI, CLI, MCP), it fails.
- [ ] Test cases must verify the logic for the `profraw-fallback`: if a platform is known to be flaky (Docker/SSH in CI), it falls back to the last known-good `profraw`.

## 2. Task Implementation
- [ ] Implement the `report.json` aggregator in `.tools/coverage.py`.
- [ ] Define the 5 quality gate thresholds (QG-001 through QG-005) in a new `config/quality_gates.toml`.
- [ ] Update `./do coverage` to calculate coverage for EACH interface (TUI, CLI, MCP) separately to enforce the 50% gate.
- [ ] Implement the `overall_passed` logic: all 5 QG MUST be true simultaneously.
- [ ] Add the `last_good_profraw` cache logic: on successful coverage run, cache the `.profraw` files. On failed run (due to timeout/flakiness), allow one retry using the cached files with a warning.
- [ ] Add a `missing-profraw-rejection` that fails if no `.profraw` exists for a crate and no cache is available.

## 3. Code Review
- [ ] Verify that the coverage calculation is accurate and handles LLVM instrumentation correctly.
- [ ] Ensure `report.json` is human-readable and contains enough detail for an agent to diagnose a QG failure.
- [ ] Check that the quality gate logic is strictly enforced in the CI pipeline.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_quality_gates.py`.
- [ ] Run `./do coverage` and verify that `target/coverage/report.json` is generated correctly.

## 5. Update Documentation
- [ ] Document the 5 quality gates and the `profraw-fallback` mechanism in `docs/plan/specs/9_project_roadmap.md`.
- [ ] Update `MEMORY.md` to reflect the new quality gate enforcement.

## 6. Automated Verification
- [ ] Temporarily lower a QG threshold in a source file (e.g., delete a test) and verify that `./do coverage` fails.
- [ ] Verify that `report.json` contains a `gate_violations` list explaining exactly why the gate failed.
