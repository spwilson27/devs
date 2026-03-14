# Task: High-Severity Risk Verification (Score 6) (Sub-Epic: 07_Risk 001 Verification)

## Covered Requirements
- [RISK-BR-002]

## Dependencies
- depends_on: ["02_critical_risk_coverage.md"]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] For each score-6 risk (Technical & Operational), identify or create the automated test verifying its mitigation:
    - **Technical Score 6:**
        - **RISK-001 (Race Conditions)**: 100 concurrent `stage_complete_tx` events on one run.
        - **RISK-003 (Git Corruption)**: Mock `CheckpointStore` returning `io::ErrorKind::StorageFull`.
        - **RISK-006 (Coverage Unachievability)**: Verified by the existence of `target/coverage/report.json` with 5 gate entries.
        - **RISK-008 (Docker/SSH Complexity)**: Docker E2E test in `presubmit-linux`.
        - **RISK-015 (MCP State Exposure)**: Startup `WARN` for non-loopback bind.
        - **RISK-021 (Pool Starvation)**: Fan-out `count=64` with `max_concurrent=4`.
        - **RISK-025 (Snapshot Immutability)**: `workflow_snapshot.json` write-once check.
    - **Operational Score 6:**
        - **RISK-010 (Rate Limits)**: `report_rate_limit` triggers fallback without incrementing attempt.
        - **RISK-012 (Platform Divergence)**: Text-identical TUI snapshot comparison across platforms.
        - **RISK-013 (Traceability Burden)**: Traceability scanner correctly identifying coverage.
        - **RISK-016 (Blind Spots)**: Automated code audit through `presubmit-check`.
- [ ] Draft the `// Covers: RISK-NNN` annotation for each.

## 2. Task Implementation
- [ ] For each identified test, add the `// Covers: RISK-NNN` annotation in the appropriate file (`tests/`, `crates/*/tests/`, etc.).
- [ ] Ensure that for `RISK-012`, the annotation is present in both Windows and Unix specific test files if applicable.
- [ ] Verify that the `risk_matrix_violations` field in `target/traceability.json` correctly reflects any missing coverage if an annotation is temporarily removed.

## 3. Code Review
- [ ] Verify that each test actually satisfies the acceptance criteria (`AC-RISK-*`) for its corresponding risk.
- [ ] Ensure the annotations match the expected format `// Covers: RISK-NNN`.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and confirm that all 11 score-6 risks are marked as "Covered" in `target/traceability.json`.
- [ ] Run `./do coverage` and ensure all gates pass.

## 5. Update Documentation
- [ ] Populate the `covering_tests` array for each risk in `docs/plan/specs/8_risks_mitigation.md`.

## 6. Automated Verification
- [ ] Run `grep -r "// Covers: RISK-0(01|03|06|08|10|12|13|15|16|21|25)" .` and confirm all 11 matches are present.
- [ ] Confirm `target/traceability.json` `traceability_pct` is 100.0 (if all other requirements are also covered).
