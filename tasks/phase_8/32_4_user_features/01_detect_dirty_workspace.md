# Task: Detect Dirty Workspace and Block Automatic Rewind (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-041]

## 1. Initial Test Written
- [ ] Add unit tests that assert the dirty-workspace detection logic correctly identifies the following states:
  - Clean repository: returns false (no block).
  - Uncommitted tracked changes: returns true (block rewind).
  - Untracked files present: returns true (block rewind).
  - Staged changes only: configurable behavior (test both true/false depending on policy).
- [ ] Tests should be placed under tests/unit/test_dirty_workspace_detector.* and must mock the git backend (mock subprocess.run for `git status --porcelain` or mock GitPython API) so tests are deterministic.
- [ ] Add an integration test that runs in a temporary git repo (use pytest tmp_path fixture or equivalent) and verifies detector returns expected boolean for real git state.

## 2. Task Implementation
- [ ] Implement a small module devs/core/workspace.py with a function detect_dirty_workspace(repo_path: str) -> dict that returns {"dirty": bool, "details": [<file paths>], "status_output": "..."}.
  - Implementation MUST prefer a library (GitPython) if present, otherwise safely shell out to `git -C <repo> status --porcelain` with argument sanitization.
  - Ensure function is well-typed, documented, and logs minimal information (no secrets).
- [ ] Raise a specific DirtyWorkspaceError when a caller attempts an automatic rewind while dirty.
- [ ] Integrate the detector into the Rewind flow: before any automatic rewind operation, call detect_dirty_workspace(); if dirty, abort the rewind and surface the DirtyWorkspaceError to the caller layer.

## 3. Code Review
- [ ] Verify single-responsibility: detector only detects and returns structured details; no side-effects.
- [ ] Ensure safe shell usage (no unescaped user input), prefer library bindings.
- [ ] Confirm comprehensive unit test coverage for detector (aim for 100% for the detector module) and clear error messages.
- [ ] Check for type annotations and docstrings.

## 4. Run Automated Tests to Verify
- [ ] Run the repository test runner for the new tests only (detect runner via project files; e.g., `pytest tests/unit/test_dirty_workspace_detector.py` or `npm test -- tests/...`).
- [ ] Verify integration test passes in CI-like environment (temp git repo).

## 5. Update Documentation
- [ ] Add docs/tasks/dirty-workspace.md describing the policy for automatic rewind blocking, the semantics of DirtyWorkspaceError, and how to resolve (commit/stash/force override).
- [ ] Document the CLI override flag (if present) and the required explicit confirmation semantics (force must be deliberate).

## 6. Automated Verification
- [ ] Provide a verification script scripts/verify_dirty_detector.sh (or a Python equivalent) that:
  - Creates a temporary git repo, makes changes, and asserts detect_dirty_workspace returns expected dirty=true;
  - Cleans repo and asserts dirty=false.
- [ ] The CI should run this script as part of the PR validation for changes to devs/core/workspace.py
