# Task: Implement zero-trust dependency management and lockfile verification (Sub-Epic: 18_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-054]

## 1. Initial Test Written
- [ ] Author tests at tests/test_security/test_dep_manager.py BEFORE implementation. Tests should fail initially:
  - Test names & targets:
    - TestDepManager::test_verify_lockfile_pass (unit): given a stubbed lockfile with package names and hashes, the verifier returns success when installed package hashes match.
    - TestDepManager::test_verify_lockfile_fail_on_mismatch (unit): mismatch between lockfile hash and installed package artifact raises SecurityError and non-zero exit code.
    - TestDepManager::test_block_unapproved_registry_and_scripts (unit): packages from unapproved registries or packages that declare unsafe install scripts are flagged and cause verifier failure.
  - Execution command (fail-first): python -m pytest tests/test_security/test_dep_manager.py -q

## 2. Task Implementation
- [ ] Implement dependency verification tooling at scripts/dep_check.py (or src/security/dep_manager.py) with the following behavior:
  - Inputs & formats supported:
    - For Python: support a lockfile with hashes (PEP 508 style or pip --require-hashes format). Use requirements.lock or requirements.txt --require-hashes as the canonical lockfile.
    - For Node (optional extension): support package-lock.json verification by comparing integrity fields.
  - Verification steps:
    - Parse lockfile and build a canonical list of package==version -> expected_hash (sha256).
    - For each installed package artifact (wheel/whl/tar.gz) compute sha256 and compare to expected_hash.
    - Fail if any package hash mismatches, if any package originates from an unapproved registry (configurable), or if a package includes prohibited install scripts (postinstall/preinstall). The policy should be declared in config/security/dependency_policy.yaml.
    - Provide a --fix or --explain mode that prints remediation steps (e.g., re-run pip install with --require-hashes or replace package with allowlisted alternative).
    - Exit codes: 0 success, 2 policy violations, 3 verification errors.
  - Implementation notes:
    - Use streaming hashing (hashlib.sha256) and avoid loading full artifacts into memory for large files.
    - Ensure robust parsing and clear error messages including package name, expected vs actual hash and file path.
    - Add a small CLI wrapper scripts/ci_dep_check.sh to be invoked by CI before installs.

## 3. Code Review
- [ ] In PR review ensure:
  - Correct parsing of the chosen lockfile format and defensiveness against malformed entries.
  - Clear policy configuration and documentation on how to add allowed registries/packages.
  - Safe defaults: fail-closed when in doubt, and explicit overrides require human approval.
  - Tests cover both successful verification and each failure mode with deterministic fixtures.

## 4. Run Automated Tests to Verify
- [ ] Run the dependency manager unit tests and the CLI verifier in dry-run with provided fixtures:
  - python -m pytest tests/test_security/test_dep_manager.py -q
  - python scripts/dep_check.py --lockfile tests/fixtures/requirements.lock --check

## 5. Update Documentation
- [ ] Add docs/security/dependency_management.md covering:
  - The lockfile formats supported, CI integration steps, the policy file format (dependency_policy.yaml), and remediation guidance for developers and release engineers.
  - Example CI snippet to fail builds when dep_check.py detects a violation.

## 6. Automated Verification
- [ ] Add CI integration that runs scripts/ci_dep_check.sh as a blocking pre-install step:
  - Example GitHub Actions step:
    - name: Dependency policy check
      run: scripts/ci_dep_check.sh --lockfile requirements.lock
  - Ensure the CI step prints a human-readable report listing offending packages and URLs for remediation.