# Task: Implement Mandatory Lockfile Enforcement (Sub-Epic: 19_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-055]

## 1. Initial Test Written
- [ ] Add unit tests at specs/security/test_lockfile_enforcer.py using pytest.
  - Test case: `test_no_lockfile_fails` — create a temporary repo directory containing a manifest (pyproject.toml or requirements.txt). Assert that calling the API `lockfile_enforcer.verify_lockfile(repo_path)` returns False and that the CLI `scripts/check_lockfile.py <dir>` exits with non-zero.
  - Test case: `test_lockfile_present_passes` — same as above but include a corresponding lockfile (poetry.lock, Pipfile.lock or requirements.txt with pinned versions) and assert True / exit code 0.
  - Test case: `test_manifest_newer_than_lockfile_fails` — touch the manifest to a newer mtime than the lockfile and assert the verifier reports a mismatch (heuristic failure).
- [ ] Add an integration test at specs/security/test_lockfile_cli.py that runs the CLI against generated temporary repo scenarios and inspects exit codes and stdout messages.

## 2. Task Implementation
- [ ] Create a new module `src/security/lockfile_enforcer.py` that provides the following public functions:
  - `detect_manifests(repo_path: str) -> List[str]` — return found manifests from the set {"pyproject.toml", "requirements.txt", "Pipfile", "package.json", "pyproject.toml"}.
  - `required_lockfiles_for_manifest(manifest_name: str) -> List[str]` — mapping from manifest to required lockfile names (e.g. `pyproject.toml` -> [`poetry.lock`], `Pipfile` -> [`Pipfile.lock`], `package.json` -> [`package-lock.json`,`yarn.lock`,`pnpm-lock.yaml`], `requirements.txt` -> [requires pinned versions]).
  - `verify_lockfile_presence(repo_path: str) -> Tuple[bool, List[str]]` — return (ok, problems) where problems enumerates missing or stale lockfiles.
- [ ] Implement a CLI wrapper `scripts/check_lockfile.py` that calls `verify_lockfile_presence('.')` and exits with code 0 if ok else 1. CLI must print machine-readable JSON when `--json` passed and human-readable messages by default.
- [ ] Implement the primary heuristic for integrity: if a manifest exists, a corresponding lockfile must exist AND the lockfile mtime must be >= manifest mtime. For `requirements.txt`, enforce pinned versions (no `>=`/`~=`/`*` tokens) as a separate check.
- [ ] Tests must be all filesystem-only and deterministic; do not run network or package manager installs.

## 3. Code Review
- [ ] Confirm the implementation is deterministic and free of network calls.
- [ ] Confirm the module keeps a clear separation of concerns (detection, policy, CLI) and exposes small pure functions that are easy to unit test.
- [ ] Confirm tests use pytest's `tmp_path` fixture and do not rely on global state.
- [ ] Confirm logging is helpful and that CLI returns proper exit codes (0 success, 1 failure).

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest -q specs/security/test_lockfile_enforcer.py` and `python -m pytest -q specs/security/test_lockfile_cli.py`.
- [ ] Confirm both pass locally on a clean temporary repo fixture.

## 5. Update Documentation
- [ ] Add `docs/security/lockfile_enforcement.md` describing the policy, supported manifests, supported lockfiles, the heuristic used (mtime comparison), and remediation steps for maintainers.
- [ ] Update the security checklist in `docs/security.md` (or similar) to reference the new CLI and CI integration points.

## 6. Automated Verification
- [ ] Provide `scripts/check_lockfile.py` and verify it behaves as a gate: calling `scripts/check_lockfile.py <repo>` returns non-zero for a synthetic repo missing required lockfiles and zero for one with correct lockfiles. Use this script as the automated verification step in the commit/CI pipeline.