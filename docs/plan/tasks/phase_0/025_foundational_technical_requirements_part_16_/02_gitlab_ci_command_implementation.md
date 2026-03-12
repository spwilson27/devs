# Task: GitLab CI Submission Command (Sub-Epic: 025_Foundational Technical Requirements (Part 16))

## Covered Requirements
- [2_TAS-REQ-010F]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a test script in `tests/test_ci_command.py` that mocks the GitLab API and verifies:
    - `./do ci` fails if `GITLAB_TOKEN` is not set.
    - `./do ci` correctly creates a temporary branch `ci/local-...` and pushes it.
    - `./do ci` polls the GitLab API and correctly interprets the pipeline status.
    - `./do ci` deletes the temporary branch upon completion.
    - `./do ci` exits with code 0 on pipeline success and non-zero on failure.

## 2. Task Implementation
- [ ] Implement or enhance the `./do ci` command:
    - Logic should be POSIX `sh`-compatible or call a dedicated Python helper (e.g., `.tools/ci.py`).
    - Create a temporary branch `ci/local-<timestamp>-<6-hex-chars>`.
    - Commit staged and unstaged changes: `git add -A && git commit -m "devs: ci submission" --no-edit --no-verify`.
    - Push the branch: `git push origin ci/local-...`.
    - Poll the GitLab API using `curl` or a Python library:
        - Identify the pipeline for the pushed branch.
        - Wait for completion (max 30 minutes).
        - Print job summaries to stdout.
    - Cleanup: `git push origin --delete ci/local-...` and `git branch -D ci/local-...`.
    - Ensure `GITLAB_TOKEN` is required.

## 3. Code Review
- [ ] Verify that the temporary branch name matches the format in [2_TAS-REQ-010F].
- [ ] Ensure all changes (including unstaged ones) are committed for CI submission.
- [ ] Confirm that branch cleanup happens even if the pipeline fails.
- [ ] Ensure polling follows a reasonable backoff to avoid rate-limiting.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and ensure `tests/test_ci_command.py` passes.
- [ ] Perform a manual dry-run (if possible) or use a mock environment to verify the GitLab API interaction.

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to reflect the implementation of the GitLab CI submission command.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure [2_TAS-REQ-010F] is correctly covered by tests.
