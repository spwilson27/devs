# Task: Verify Code Review Halt Logic (Sub-Epic: 45_Risk 016 Verification)

## Covered Requirements
- [AC-RISK-016-04]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-config]

## 1. Initial Test Written
- [ ] Create an E2E integration test in `tests/test_risk_016_halt_logic.rs`.
- [ ] The test should:
  - Mock an agent run that produces a structured JSON output with `"critical_findings": 1`.
  - Submit a `code-review` workflow run (using the standard `.devs/workflows/code-review.toml` definition).
  - Use `devs-cli status` or MCP `get_run` to verify that the workflow transitions to a `halt-for-remediation` stage and does NOT reach a `Completed` status.
  - Verify that the final status of the run is not `Completed`.

## 2. Task Implementation
- [ ] Ensure that the `code-review` workflow (in `.devs/workflows/code-review.toml`) has a branch predicate that checks the `critical_findings` field.
- [ ] The branch logic must explicitly route to a `halt-for-remediation` stage when `critical_findings > 0`.
- [ ] Implement or verify the branching logic in the scheduler to handle the result of the `critical_findings` check.
- [ ] Verify that the `structured_output` completion signal is used to extract the `critical_findings` field.

## 3. Code Review
- [ ] Verify that the branch predicate is robustly defined (e.g., handles missing field or non-integer values gracefully).
- [ ] Ensure the E2E test accurately simulates the `structured_output` of the code-review agent.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test test_risk_016_halt_logic` and confirm it passes.
- [ ] Verify that the workflow halts exactly as expected.

## 5. Update Documentation
- [ ] Document the halt condition and the `halt-for-remediation` stage in `docs/plan/specs/8_risks_mitigation.md`.
- [ ] Add the coverage annotation `// Covers: AC-RISK-016-04` to the E2E test.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` and confirm `AC-RISK-016-04` is covered.
