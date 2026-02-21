# Task: Add tests and CI checks for Approval & Orphanage (Sub-Epic: 10_Approval_and_Checkpoints)

## Covered Requirements
- [1_PRD-REQ-HITL-003], [1_PRD-REQ-HITL-004], [1_PRD-REQ-NEED-MAKER-02], [TAS-068], [4_USER_FEATURES-REQ-034]

## 1. Initial Test Written
- [ ] Create tests/phase_7/10_approval_and_checkpoints/test_e2e_approval_and_orphanage.py. The test MUST be written first to validate end-to-end behavior:
  - Using tmp_path create a temporary DB and apply migrations/phase_7_10_create_approval_tables.sql.
  - Seed epics, tasks, requirements and a partial requirement_task_map (leave at least one orphaned requirement).
  - Assert that the orphan detector returns the orphaned ID and that the approval service can list epics and submit an approval which results in an approvals row and an epic_review_snapshot.
  - This test acts as the acceptance test for the Sub-Epic.

## 2. Task Implementation
- [ ] Wire tests into CI (create .github/workflows/phase7_approval_checks.yml or add a job to existing CI) with a job named `phase7-approval-checks` that:
  - Checks out the repository.
  - Sets up the project environment (follow project conventions; example: python -m venv .venv && pip install -r requirements.txt).
  - Runs migrations using scripts/db/run_migrations.py against a temporary DB.
  - Runs pytest -q tests/phase_7/10_approval_and_checkpoints/.
  - Runs scripts/check_orphans.sh and fails the job if it exits non-zero.
- [ ] Add a CI artifact upload step that stores the orphan report JSON on failure for debugging.

## 3. Code Review
- [ ] Verify:
  - CI job is hermetic and uses caches where appropriate.
  - Tests are deterministic and fast (unit tests first, small integration tests, avoid full E2E heavy tasks in this job).
  - Orphan check script's non-zero exit codes are well-documented and used intentionally to block merges.

## 4. Run Automated Tests to Verify
- [ ] Run locally: pytest -q tests/phase_7/10_approval_and_checkpoints/ && scripts/check_orphans.sh --db /tmp/devs_test.db
- [ ] Simulate CI run by invoking the job steps locally in the documented order.

## 5. Update Documentation
- [ ] Add docs/ci/phase7_approval_checks.md describing the CI job, its purpose, and how to reproduce failures locally. Include sample artifacts and troubleshooting steps.
- [ ] Add docs/qa/acceptance_criteria_phase7.md describing the acceptance test and expected outputs.

## 6. Automated Verification
- [ ] Ensure the GitHub Actions workflow (or CI runner) blocks merges when the acceptance test fails or when scripts/check_orphans.sh detects orphans. Add an automated smoke test that creates a test PR branch and validates the job status (optional; local simulation acceptable).
