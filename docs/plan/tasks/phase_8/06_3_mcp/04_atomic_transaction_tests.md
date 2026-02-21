# Task: Add integration tests for failure modes and atomicity guarantees (Sub-Epic: 06_3_MCP)

## Covered Requirements
- [3_MCP-TAS-094]

## 1. Initial Test Written
- [ ] Create tests at tests/integration/test_commit_atomicity.py that cover these scenarios:
  - Scenario A: `git commit` succeeds, but DB update raises an exception. The system should revert the commit or restore the DB snapshot so no mismatched state remains.
  - Scenario B: DB update succeeds but `git commit` fails; DB must not be updated with a commit hash and should remain consistent.
  - Scenario C: Concurrent commit attempts (simulate two commit flows) result in only one winning commit and the other retries or fails safely.
  - Each test should set up a temp repo and temp DB and use monkeypatching to inject failures deterministically.

## 2. Task Implementation
- [ ] Implement deterministic, reproducible integration tests using pytest and tmp_path fixtures:
  - Use monkeypatch to replace subprocess.run for git with a stub that can raise CalledProcessError for chosen scenarios.
  - Use filesystem permission toggles (chmod) or SQLite hooks to simulate DB write failures.
  - Ensure tests assert pre- and post-conditions for both repo HEAD and DB `tasks` table.

## 3. Code Review
- [ ] Ensure tests are deterministic and do not depend on network or external services.
- [ ] Ensure tests clean up temporary repositories and db files even on failure (use tmp_path provided by pytest).
- [ ] Validate tests run quickly; avoid long sleeps.

## 4. Run Automated Tests to Verify
- [ ] Run pytest tests/integration/test_commit_atomicity.py and verify all scenarios pass.
- [ ] Run these tests in CI under a clean environment to detect platform-specific differences.

## 5. Update Documentation
- [ ] Add a short section in docs/testing.md describing how to run atomicity tests and interpret failures.

## 6. Automated Verification
- [ ] Add scripts/verify_atomicity.sh that invokes the three primary scenarios and exits non-zero if any assertion fails; wire this into CI for the sync-integration job.
