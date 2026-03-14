# Task: Critical Risk Verification (Score 9) (Sub-Epic: 07_Risk 001 Verification)

## Covered Requirements
- [RISK-BR-002]

## Dependencies
- depends_on: ["01_risk_mitigation_audit.md"]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] For each score-9 risk, identify the existing or new test that correctly exercises its mitigation:
    - **RISK-002 (PTY Windows)**: Probes `portable_pty` availability and verifies `PTY_AVAILABLE` static flag.
    - **RISK-004 (Adapter CLI)**: Verifies that all 5 adapter CLI flags are defined as `const &str` and `target/adapter-versions.json` is generated.
    - **RISK-005 (Presubmit Timeout)**: Measures stub workspace compile time and enforces the timing constraint.
    - **RISK-009 (Bootstrapping Deadlock)**: Validates the bootstrap completion condition schema and timing.
- [ ] Draft the exact `// Covers: RISK-NNN` annotation to be added to each test.

## 2. Task Implementation
- [ ] For `RISK-002`, ensure `crates/devs-adapters/src/pty_probe.rs` (or similar) has a test and annotate it with `// Covers: RISK-002`.
- [ ] For `RISK-004`, ensure `crates/devs-adapters/tests/compatibility_tests.rs` has a test and annotate it with `// Covers: RISK-004`.
- [ ] For `RISK-005`, ensure `tests/presubmit_budget.rs` (or similar) has a test and annotate it with `// Covers: RISK-005`.
- [ ] For `RISK-009`, ensure `tests/bootstrap_verification.rs` has a test and annotate it with `// Covers: RISK-009`.
- [ ] Ensure all these tests pass on all available platforms.

## 3. Code Review
- [ ] Verify that the annotations strictly match the `// Covers: RISK-NNN` pattern as parsed by the traceability tool.
- [ ] Verify that each test actually exercises the risk's mitigation logic as described in `MIT-002`, `MIT-004`, `MIT-005`, and `MIT-009`.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and confirm these risks are marked as "Covered" in `target/traceability.json`.
- [ ] Run `./do coverage` and ensure no regressions.

## 5. Update Documentation
- [ ] Update the risk record for each of these in `8_risks_mitigation.md` to ensure the `covering_tests` field is populated with the test IDs.

## 6. Automated Verification
- [ ] Run `grep -r "// Covers: RISK-00[2459]" .` and confirm 4 distinct test matches.
- [ ] Run `.tools/verify_requirements.py --verify-ordered` to confirm no new traceability issues.
