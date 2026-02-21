# Task: Implement a minimal self-host smoke feature (Sub-Epic: 16_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-REQ-039]

## 1. Initial Test Written
- [ ] Add an integration test at `tests/integ/test_self_host_smoke.(py|js)` that implements the following scenario in a temporary git repository (use tmp_path):
  - Step A (Red): create a failing test file `tests/self_host_expected.py` that asserts a file `self_host_success.txt` exists with exact content `SELF_HOST_OK`.
  - Step B (Driver): run a harness script `scripts/self_host_harness.(py|js)` (not yet implemented) that will perform the minimal TDD loop: create the failing test, then implement the feature to make it pass, commit the change, and exit.
  - The integration test should run the harness and then assert the committed repo contains `self_host_success.txt` with the expected content and that the most recent git commit message contains the string `self-host-smoke`.
- [ ] Keep test deterministic and filesystem-local only.

## 2. Task Implementation
- [ ] Implement `scripts/self_host_harness.(py|js)` which programmatically simulates a minimal TDD cycle inside a temp git repo:
  - Initialize a new git repo in a temp directory (shell out to `git init`), create a minimal project layout if required.
  - Write the failing test `tests/self_host_expected.py` asserting file absence.
  - Implement the code to satisfy the test by creating `self_host_success.txt` with content `SELF_HOST_OK` using the surgical_edit tool if available, or a direct safe file write if not.
  - Run the project's test runner against the repo and ensure the test goes from failing to passing.
  - Commit the changes with message `self-host-smoke: create self_host_success.txt`.
  - Print the new commit SHA to stdout and exit 0 on success.
- [ ] Keep this harness minimal: no network calls, no model usage; the goal is to demonstrate a reproducible self-hosted success cycle.

## 3. Code Review
- [ ] Verify the harness is idempotent (can run multiple times in different temp dirs), uses atomic file operations, and commits only the minimal changes required. Ensure commit messages follow the project's atomic commit convention.

## 4. Run Automated Tests to Verify
- [ ] Run the integration test `tests/integ/test_self_host_smoke.(py|js)` verifying it executes the harness, and confirms the file exists and commit message is correct.

## 5. Update Documentation
- [ ] Add `docs/self_host_smoke.md` describing the harness, how to run it, and why it demonstrates "self-host success" (REQ-039). Include the expected commit message and sample output.

## 6. Automated Verification
- [ ] Add `scripts/verify_self_host_smoke.sh` that runs the harness, collects the latest commit message, verifies `self_host_success.txt` content, and prints JSON: `{"status":"passed","commit":"<sha>"}` on success. CI will call this script to validate self-host success.