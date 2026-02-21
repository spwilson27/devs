# Task: Add CI gate that enforces RTI >= 1.0 on merges (Sub-Epic: 04_RTI_And_Coverage)

## Covered Requirements
- [9_ROADMAP-REQ-030], [9_ROADMAP-TAS-505]

## 1. Initial Test Written
- [ ] Create tests/ci/test_ci_rti_gate.py that simulates running the CI script and asserts non-zero exit code when RTI < 1.0 and zero when RTI == 1.0. Use subprocess to invoke scripts/verify_rti.sh with test fixtures.

## 2. Task Implementation
- [ ] Add scripts/verify_rti.sh (or .py) that runs `python -m src.cli.validate_rti --threshold 1.0` and exits 0 on pass, non-zero on fail.
- [ ] Add a CI workflow .github/workflows/rti_check.yml (or modify existing CI) with a job named `rti-check` that:
  - Checks out code
  - Sets up the project environment (use existing project conventions; e.g., python -m venv .venv && pip install -r requirements.txt)
  - Runs scripts/verify_rti.sh
  - Uploads a JSON artifact with the RTI report when failing for debugging.

## 3. Code Review
- [ ] Verify:
  - CI job is idempotent, fast, and isolated.
  - The CI does not leak secrets or run untrusted network calls.
  - The workflow only runs heavy E2E tests on a scheduled or special job; the rti-check must be fast.

## 4. Run Automated Tests to Verify
- [ ] Locally run: bash scripts/verify_rti.sh with test fixtures and confirm exit codes as expected.

## 5. Update Documentation
- [ ] Add docs/metrics/rti_ci.md explaining how the CI gate works, where artifacts are stored, and how to interpret failures.

## 6. Automated Verification
- [ ] Ensure the CI workflow is applied to a test branch and confirm a failing PR is blocked by the rti-check job.
