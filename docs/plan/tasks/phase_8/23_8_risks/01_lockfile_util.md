# Task: Implement lockfile detection utility (Sub-Epic: 23_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-016]

## 1. Initial Test Written
- [ ] Create unit tests at tests/unit/test_lockfile_detector.py using pytest.
  - Test 1 (missing lockfile): Simulate a commit/change set where only `package.json` is listed as changed. Assert `check_lockfile_update(changed_files)` returns False and that the higher-level validation would reject the commit.
  - Test 2 (lockfile present): Simulate changed_files = [`package.json`, `package-lock.json`] and assert `check_lockfile_update` returns True.
  - Test 3 (yarn/pnpm): Repeat Test 2 for `yarn.lock` and `pnpm-lock.yaml` to ensure all common lockfiles are recognized.
  - Use fixtures or small helper that returns `changed_files` arrays rather than reading git to keep tests fast and deterministic.

## 2. Task Implementation
- [ ] Implement a small, pure utility module at `devs/utils/lockfile.py` exposing:
  - `LOCKFILE_NAMES = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"]`
  - `def check_lockfile_update(changed_files: List[str]) -> bool:`
    - Behavior: If `package.json` is not in changed_files return True (no lockfile contract needed). If `package.json` is in changed_files, return True if any filename in `LOCKFILE_NAMES` is present in changed_files (case-insensitive); else False.
  - Keep implementation side-effect free and small so the Reviewer Agent can call it synchronously.
- [ ] Add type hints and a small docstring explaining expected inputs (list of changed file paths relative to repo root).

## 3. Code Review
- [ ] Verify the utility is pure and deterministic, has clear unit tests for each lockfile variant, and no environment-dependent code.
- [ ] Confirm coverage for edge cases: mixed-case filenames, additional path segments (e.g., `packages/foo/package-lock.json`), and when changed_files is empty.
- [ ] Ensure the implementation is easy to mock/inject in Reviewer Agent (e.g., importable function).

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/unit/test_lockfile_detector.py -q` and ensure all tests pass locally.
- [ ] Confirm test runtime is <5s on CI by keeping tests focused and using fixtures instead of hitting git.

## 5. Update Documentation
- [ ] Add `docs/security/lockfile_integrity.md` (or update `specs/8_risks_mitigation.md`) with a short description of the rule, the list of recognized lockfiles, and the error code the Reviewer Agent will emit (`LOCKFILE_MISSING`).

## 6. Automated Verification
- [ ] Automate verification by adding a CI smoke test in `tests/integration/ci_lockfile_check.sh` (or a pytest marker) which runs the unit tests and exits non-zero on failure. The automated checklist should run this script in CI before allowing Reviewer-Agent-related PRs to merge.
