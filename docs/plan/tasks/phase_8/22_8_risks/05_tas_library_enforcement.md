# Task: Enforce TAS-Approved Library List (Sub-Epic: 22_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-014]

## 1. Initial Test Written
- [ ] Write tests that validate the library enforcement policy blocks unapproved dependencies and allows approved ones:
  - Tests to write FIRST:
    - test_allowlist_blocks_unapproved_dependency: simulate an attempted package manifest change that adds `evil-lib@1.0.0` (not on the allowed list) and assert the change is rejected and an enforcement violation is returned with details.
    - test_allowlist_allows_approved_dependency: attempt to add `approved-lib@2.1.0` present in `config/tas-approved-libraries.json` and assert the change is accepted.
    - test_lockfile_integrity_check: modify lockfile contents (package-lock.json / Pipfile.lock) to include mismatched versions and assert enforcement rejects inconsistent lockfile updates.
  - Test locations: `tests/test_library_enforcer.py` or `tests/library-enforcer.test.ts`.
  - Test mechanics: tests should exercise the enforcement hook that runs during `surgical_edit` or package-manifest writes and assert both return codes and persisted violation logs.

## 2. Task Implementation
- [ ] Implement LibraryPolicyEnforcer and integrate it as a gate for package/lockfile edits and automated dependency additions:
  - Module suggestion: `src/policy/library_enforcer.py` or `packages/policy/src/libraryEnforcer.ts`.
  - Configuration:
    - Provide `config/tas-approved-libraries.json` (or YAML) containing an array of allowed packages with optional semver patterns and allowed origins (e.g., npm, pypi, git+ssh://).
    - Provide `config/tas-library-policy.yaml` for enforcement behavior (fail vs warn, auto-open PR for review, who can override).
  - API:
    - is_allowed(name: str, version: str) -> bool
    - validate_manifest_change(manifest_delta: Dict) -> {allowed: bool, violations: List}
    - validate_lockfile(lockfile_contents: str) -> {valid: bool, issues: List}
  - Enforcement points:
    - Hook into `surgical_edit` or the package manager writer step to call validate_manifest_change before persisting changes.
    - When violation found, reject the change, create an enforcement event `library_policy_violation` with details, and optionally create a review PR if configured.
    - Ensure enforcement is atomic with respect to the CommitNode: failing validation must cause no commit.

## 3. Code Review
- [ ] During review verify:
  - Policy is driven by a version-controlled config file (no hard-coded lists).
  - Semver checks are correct and permissive matching implemented with a well-tested semver library.
  - Lockfile integrity checks compare resolved versions and fail on mismatch.
  - Administrative override path is auditable and requires authorization (RBAC) as described in Security Design.

## 4. Run Automated Tests to Verify
- [ ] Execute the library enforcer tests:
  - pytest: `pytest -q tests/test_library_enforcer.py`.
  - jest: `npx jest tests/library-enforcer.test.ts`.
  - CI must include these tests as part of any dependency-modifying change validation.

## 5. Update Documentation
- [ ] Add `docs/risks/library_enforcement.md` covering:
  - The format of `config/tas-approved-libraries.json` and examples.
  - How enforcement is applied during edits and how to request a library be added to the approved list.
  - The lockfile integrity verification procedure and how to resolve conflicts.

## 6. Automated Verification
- [ ] Add `scripts/verify_library_enforcer.sh` that:
  - Runs unit tests for the policy.
  - Attempts to apply a sample manifest change adding a disallowed dependency and asserts the system rejects it and logs a `library_policy_violation` with expected fields.
  - Exit non-zero on failures.
