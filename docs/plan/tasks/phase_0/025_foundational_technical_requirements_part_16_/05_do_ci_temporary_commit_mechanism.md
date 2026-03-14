# Task: Implement ./do ci Temporary Commit Mechanism (Sub-Epic: 025_Foundational Technical Requirements (Part 16))

## Covered Requirements
- [2_TAS-REQ-010F]

## Dependencies
- depends_on: []
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write a test that runs `./do ci` without `GITLAB_TOKEN` set and asserts exit code is non-zero and stderr contains `"Error: GITLAB_TOKEN environment variable not set"`.
- [ ] Write a test (with a mock or stub GitLab API) that runs `./do ci` and asserts:
  - A temporary branch named `ci/local-<timestamp>-<6-hex-chars>` is created (verify with `git branch -r` or mock).
  - All staged and unstaged changes are committed to that branch.
  - The branch is pushed to `origin`.
- [ ] Write a test that verifies the temporary branch naming format: `ci/local-` prefix followed by a timestamp and 6 hex characters.
- [ ] Write a test that verifies the temporary branch is deleted from `origin` after the pipeline completes (or after timeout).
- [ ] Write a test that verifies `./do ci` exits 0 when all pipeline jobs pass (mocked) and non-zero when any job fails (mocked).
- [ ] Write a test that verifies `./do ci` prints a per-job summary with pass/fail status and timing to stdout.
- [ ] Write a test that verifies `./do ci` times out after 30 minutes of polling and exits non-zero.
- [ ] Write a test that verifies the original working branch is not modified (no commits added, no ref changes) after `./do ci` completes.

## 2. Task Implementation
- [ ] In the `./do` script, implement the `ci` subcommand with the following steps:
  1. Check that `GITLAB_TOKEN` environment variable is set. If not, print `"Error: GITLAB_TOKEN environment variable not set"` to stderr and exit 1.
  2. Generate a temporary branch name: `ci/local-$(date +%s)-$(head -c 3 /dev/urandom | xxd -p)` (6 hex chars).
  3. Create the temporary branch from the current HEAD: `git checkout -b <branch-name>`.
  4. Stage all changes (staged and unstaged): `git add -A`.
  5. Commit with `git commit --no-verify --no-edit -m "ci: temporary commit for CI validation"`. Use `--no-verify` to skip hooks since this is a throwaway commit.
  6. Push to origin: `git push origin <branch-name>`.
  7. Switch back to the original branch: `git checkout -` (restore original branch immediately after push).
  8. Poll the GitLab CI API (`GET /api/v4/projects/:id/pipelines?ref=<branch-name>`) for pipeline status.
     - Use `curl` with `PRIVATE-TOKEN: $GITLAB_TOKEN` header.
     - Poll interval: 15 seconds.
     - Timeout: 30 minutes (1800 seconds).
  9. When pipeline completes, fetch per-job results from `GET /api/v4/projects/:id/pipelines/:pipeline_id/jobs`.
  10. Print per-job summary: `PASS|FAIL  <job-name>  <duration>s` for each job.
  11. Delete the temporary remote branch: `git push origin --delete <branch-name>`.
  12. Also delete the local temporary branch: `git branch -D <branch-name>`.
  13. Exit 0 if all jobs passed, non-zero otherwise.
- [ ] Ensure cleanup (branch deletion) runs even if the script is interrupted (use a `trap` handler for `EXIT`, `INT`, `TERM`).
- [ ] Determine the GitLab project ID from `git remote get-url origin` or require it via `GITLAB_PROJECT_ID` env var.

## 3. Code Review
- [ ] Verify the temporary branch name format matches `ci/local-<timestamp>-<6-hex-chars>`.
- [ ] Verify the original branch is restored before polling begins.
- [ ] Verify cleanup (remote and local branch deletion) occurs in all exit paths (success, failure, timeout, interrupt).
- [ ] Verify the 30-minute timeout is enforced.
- [ ] Verify no sensitive tokens are printed to stdout/stderr.
- [ ] Verify `--no-verify` is used only on the throwaway commit (not on any real branch commits).

## 4. Run Automated Tests to Verify
- [ ] Run the `GITLAB_TOKEN` missing test and confirm it passes.
- [ ] Run the branch naming format test and confirm it passes.
- [ ] Run the mocked pipeline tests and confirm they pass.
- [ ] Verify the original branch ref is unchanged after running `./do ci`.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-010F` annotations to each test.

## 6. Automated Verification
- [ ] Run `./do ci` without `GITLAB_TOKEN` and assert the exact error message and exit code 1.
- [ ] In a test environment with mock GitLab API, run `./do ci` end-to-end and assert correct branch lifecycle and exit code.
