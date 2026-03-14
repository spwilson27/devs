# Task: Verify Bootstrap Milestone and Time-Box Enforcement (Sub-Epic: 27_Risk 008 Verification)

## Covered Requirements
- [RISK-009], [RISK-009-BR-001]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new unit test for the `do` script in `tests/test_bootstrap_time_box.py` that:
    - Mocks the project creation date or a marker file that tracks the start of the bootstrap phase.
    - Mocks the current time.
    - Simulates `./do presubmit` being called.
    - Verifies that if (current_time - start_time) > 150% of the planned duration, a warning or error is issued.
    - Verifies that if the condition is met, no *new* crate work is allowed unless the ADR is present (per `RISK-009-BR-001`).

## 2. Task Implementation
- [ ] Implement a bootstrap tracking mechanism in the `devs` codebase:
    - Create a `.devs/bootstrap_start.json` (or similar) that records the start time of the bootstrap phase.
    - Modify `./do presubmit` or a separate lint script to:
        - Read the bootstrap start time.
        - Calculate the duration of the bootstrap phase.
        - Compare against the planned duration (e.g., as defined in `docs/plan/phases/phase_0.md` or a config).
        - If the duration exceeds 150%, check for the presence of the `docs/adr/NNNN-bootstrap-complete.md` or the `FB-007` activation ADR.
        - If neither is present, print the mandatory diagnostic sequence and exit non-zero (or issue a critical warning as required by the "project lead" role).
- [ ] Ensure that `// Covers: RISK-009, RISK-009-BR-001` is added to the relevant code.

## 3. Code Review
- [ ] Verify that the time calculation (150%) is accurate and matches the project timeline.
- [ ] Confirm that the "no new crate work" rule is effectively enforced (e.g., by checking if new crates have been added to `Cargo.toml` without the required ADR).
- [ ] Ensure that the logic correctly identifies the `SelfHostingAttempt` state as the boundary for the bootstrap phase.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 tests/test_bootstrap_time_box.py`.
- [ ] Manually test the trigger by setting the bootstrap start time to a date far in the past and verifying that `./do presubmit` issues the required warning/error.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to record how the bootstrap deadlock risk (RISK-009) is being monitored.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and ensure `RISK-009-BR-001` is marked as verified.
