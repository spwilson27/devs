# Task: Implement safe Git commit utility returning commit hash (Sub-Epic: 06_3_MCP)

## Covered Requirements
- [3_MCP-TAS-094]

## 1. Initial Test Written
- [ ] Create unit tests at tests/unit/test_git_utils.py that:
  - Initialize a temporary git repository (use tmp_path / subprocess to run `git init`).
  - Create a file, modify it, and call the new git utility to stage and commit changes.
  - Assert the returned value is a 40-character git commit hash and that `git rev-parse HEAD` matches it.
  - Test failure cases: utility raises a well-defined exception when git commit fails (e.g., no changes to commit).

## 2. Task Implementation
- [ ] Implement a safe Git helper module (e.g., src/git_utils.py) with the following API and behavior:
  - Function: `create_atomic_commit(repo_path: str, message: str, author_name: str=None, author_email: str=None) -> str`
    - Stages all changes (`git add -A`) and runs an atomic commit.
    - Uses subprocess with argument lists (no shell=True) and captures errors.
    - Returns the commit hash (stdout from `git rev-parse HEAD`).
    - Implements a short retry on transient errors and clear exceptions on fatal errors.
    - Uses a repo-level lockfile (e.g., `.git/commit.lock`) to prevent concurrent commits; acquire using fcntl (on unix) or an atomic mkdir pattern.
  - Ensure the implementation validates inputs (message length) and escapes any data passed to the subprocess correctly.

## 3. Code Review
- [ ] Verify subprocess usage uses a list of args to prevent shell injection.
- [ ] Confirm lockfile usage prevents concurrent commits and is robust to process crashes (clean-up/timeout policy).
- [ ] Confirm the API returns stable, well-documented error types for the caller to handle.

## 4. Run Automated Tests to Verify
- [ ] Run pytest tests/unit/test_git_utils.py and confirm all tests pass.
- [ ] Add the module to coverage and ensure >90% coverage for new functions.

## 5. Update Documentation
- [ ] Add docs/devs/git_utils.md describing the API, examples of use, and concurrency/locking semantics.
- [ ] Document expected return values, exceptions, and recommended usage within CommitNode.

## 6. Automated Verification
- [ ] Add scripts/verify_git_utils.sh that creates a temp repo, invokes `create_atomic_commit`, and asserts that `git rev-parse HEAD` equals the returned hash and the commit message matches.
