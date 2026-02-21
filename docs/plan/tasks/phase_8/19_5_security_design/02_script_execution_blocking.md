# Task: Implement Script Execution Blocking (Sub-Epic: 19_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-057]

## 1. Initial Test Written
- [ ] Add unit tests at `specs/security/test_script_guard.py` using pytest.
  - `test_blocked_script_raises` — call the public guard API `script_guard.check_allowed(path, args)` for a path that is not on the allowlist and assert it raises `ScriptExecutionBlockedError` (or returns False depending on chosen API).
  - `test_allowed_script_runs` — register a short allowed script in a temporary dir and assert `safe_subprocess.run([...])` executes and returns expected stdout when the allowlist contains the canonical path.
  - `test_path_normalization_and_symlink_handling` — create symlinked paths and ensure the guard canonicalizes and blocks bypass attempts.
- [ ] Add an integration test `specs/security/test_script_integration.py` that patches the runtime `subprocess`-entrypoints used by the DeveloperAgent's `CodeNode`/executor to use the safe wrapper and asserts a blocked invocation prevents disk changes.

## 2. Task Implementation
- [ ] Implement `src/security/script_guard.py` with these responsibilities:
  - Provide an allowlist-based policy loaded from `config/security.yml` (or `config/security.json`) under key `allowed_scripts` (list of canonical absolute paths or path globs) and `allowed_commands` (command names allowed when run inside a known-safe sandbox).
  - Implement `is_script_allowed(canonical_path: str, args: List[str], context: dict) -> bool` that does path normalization, resolves symlinks, applies allowlist rules and returns True only for explicit allow.
- [ ] Implement `src/utils/safe_subprocess.py` that exposes wrappers `run`, `Popen`, `check_output` which call `script_guard.is_script_allowed` before delegating to `subprocess`. On disallowed scripts raise a specific `ScriptExecutionBlockedError` and log the attempt with normalized path and caller context.
- [ ] Integrate into runtime: patch the DeveloperAgent CodeNode executor (or provide clear patch points in `src/agents/CodeNode` or equivalent) to import and use `safe_subprocess` instead of raw `subprocess` calls. If CodeNode does not exist yet, add a small adapter `src/agents/subprocess_adapter.py` that the CodeNode should import.
- [ ] Add configuration example `config/security.example.yml` documenting the default deny policy and how to add allowed scripts.

## 3. Code Review
- [ ] Verify strict default-deny semantics: if allowlist is empty, no external scripts should run.
- [ ] Verify canonicalization (os.path.realpath or pathlib.resolve) to avoid symlink bypass and verify path normalization to prevent `../` escape.
- [ ] Verify the wrapper cannot be bypassed by direct os.exec* calls from within the project (document known limitations and mitigations).
- [ ] Ensure detailed audit logging of blocked attempts, including PID, user, normalized path, and calling stack (if available) with redaction of secrets.

## 4. Run Automated Tests to Verify
- [ ] Run: `python -m pytest -q specs/security/test_script_guard.py specs/security/test_script_integration.py`
- [ ] Ensure the blocked test asserts the wrapper raised and that integration test prevented disk mutation when a blocked script attempted to run.

## 5. Update Documentation
- [ ] Add `docs/security/script_execution_blocking.md` describing the default-deny policy, configuration, and how to allow/deny scripts. Include migration notes for existing projects and sample config.

## 6. Automated Verification
- [ ] Add a CI check step that runs a small verification harness which attempts to run an obviously disallowed script and asserts that the wrapper prevented it (exit code non-zero and audit log entry present). Provide `scripts/verify_script_blocking.py` for automation.