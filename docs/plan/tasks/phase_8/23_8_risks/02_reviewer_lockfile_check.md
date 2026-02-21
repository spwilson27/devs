# Task: Add Reviewer Agent lockfile enforcement (Sub-Epic: 23_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-016]

## 1. Initial Test Written
- [ ] Create unit tests at `tests/unit/test_reviewer_lockfile.py` that exercise Reviewer Agent's commit validation logic.
  - Test A (reject missing lockfile): Mock a `CommitContext` object whose `changed_files` returns [`package.json`]. Assert `ReviewerAgent.review(commit_context)` returns `{'status':'rejected', 'reason':'LOCKFILE_MISSING'}` or raises a defined ValidationError with code `LOCKFILE_MISSING`.
  - Test B (accept with lockfile): Mock `changed_files` includes `package.json` and `package-lock.json`; assert review returns `{'status':'accepted'}` or similar success structure.
  - Use dependency injection or mocking for filesystem/git utilities so tests remain deterministic.

## 2. Task Implementation
- [ ] Implement enforcement in `devs/agents/reviewer.py` (or the existing ReviewerAgent module):
  - Import `check_lockfile_update` from `devs/utils/lockfile.py`.
  - During the pre-commit / review step, if `package.json` is changed and `check_lockfile_update` returns False, return a structured rejection with reason `LOCKFILE_MISSING` and add diagnostics explaining which lockfile is required.
  - Ensure the reviewer does NOT modify files; it must only accept/reject and provide human-readable diagnostics and machine-readable error code.
  - Make the lockfile names configurable via agent settings (use a small config entry in `devs/config/defaults.py` or similar) so different projects can be supported.

## 3. Code Review
- [ ] Verify reviewer logic is testable and side-effect free.
- [ ] Ensure the rejection path is idempotent and returns a stable error code (`LOCKFILE_MISSING`) for automation.
- [ ] Confirm proper logging of decision with SAOP metadata and a linkable trace ID for audits.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/unit/test_reviewer_lockfile.py -q` and ensure both tests pass.

## 5. Update Documentation
- [ ] Update `docs/security/lockfile_integrity.md` adding the exact reviewer response payload, the error code, and guidance for Developer Agents to remediate (e.g., run `npm install` or regenerate lockfile).

## 6. Automated Verification
- [ ] Add an integration test `tests/integration/test_reviewer_against_fixture_repo.py` that applies a fixture commit (package.json changed without lockfile) and asserts the Reviewer Agent rejects it; run as part of CI gating.
