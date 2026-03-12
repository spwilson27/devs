# Task: Verify E2E Coverage Isolation (Sub-Epic: 21_Risk 005 Verification)

## Covered Requirements
- [RISK-006-BR-002]

## Dependencies
- depends_on: [02_verify_coverage_exclusion_constraints.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_coverage_isolation.py` that mocks `cargo llvm-cov` output for a specific crate.
- [ ] The test MUST assert that coverage attributed to a unit test (`#[test]` calling internal Rust functions) is NOT counted towards the individual interface gates:
    - **QG-003** (CLI E2E): Subprocess spawn via `assert_cmd` only.
    - **QG-004** (TUI E2E): `TestBackend` full `handle_event→render` cycle only.
    - **QG-005** (MCP E2E): HTTP POST to a running server only.

## 2. Task Implementation
- [ ] Configure the coverage aggregator `.tools/aggregate_coverage.py` to:
    - Run unit tests and E2E tests separately or with distinct profile outputs.
    - Specifically isolate coverage for CLI, TUI, and MCP binary targets to calculate **QG-003**, **QG-004**, and **QG-005**.
    - Verify that any line covered *only* by unit tests is NOT included in the numerator for the interface-specific gates.
- [ ] Update `./do coverage` to perform this isolation (likely by passing different `--test` filters to `cargo llvm-cov`).
- [ ] Update the coverage report schema in `target/coverage/report.json` to explicitly list unit-only vs. E2E-compliant line counts for these gates.

## 3. Code Review
- [ ] Verify that the isolation logic is robust and cannot be bypassed by adding `#[test]` functions to the interface crates.
- [ ] Confirm that the E2E gate thresholds (50%) are calculated only from legitimate interface boundary tests.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_coverage_isolation.py`.
- [ ] Run `./do coverage` and manually verify that a unit test covering an interface function does NOT increase the `actual_pct` of the corresponding QG gate.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/8_risks_mitigation.md` with the finalized measurement method for `[RISK-006-BR-002]`.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and confirm `[RISK-006-BR-002]` is verified.
