# Task: E2E Validation of TDD Workflows (Red/Green) (Sub-Epic: 14_Roadmap Phase 4 Validation)

## Covered Requirements
- [AC-ROAD-P4-006], [9_PROJECT_ROADMAP-REQ-300]

## Dependencies
- depends_on: []
- shared_components: [devs-server, devs-cli, devs-scheduler]

## 1. Initial Test Written
- [ ] Create a new E2E test file `tests/e2e/test_tdd_loop.rs`.
- [ ] The test should:
    - Start a local `devs-server` instance.
    - Create a temporary project directory.
    - Add a unit test that fails (e.g., `assert!(false)`).
    - Submit a `tdd-red` workflow run using `devs submit`.
    - Wait for the run and assert that the specific test stage exits with a non-zero code (confirming "Red" phase).
    - Modify the code to make the test pass (e.g., `assert!(true)`).
    - Submit a `tdd-green` workflow run using `devs submit`.
    - Wait for the run and assert that the stage exits with code 0 (confirming "Green" phase).
- [ ] Verify that the test fails because the workflows or the server-side logic for handling these specific TDD phases are not fully validated yet.

## 2. Task Implementation
- [ ] Ensure the standard TDD workflow TOMLs (`tdd-red.toml`, `tdd-green.toml`) are present in `.devs/workflows/`.
- [ ] Verify that `tdd-red` is configured to interpret a non-zero exit code from the test runner as a "successful confirmation of failure" if that is the intended logic, OR simply that it correctly reports the failure.
    - *Note: AC-ROAD-P4-006 specifically says "tdd-red workflow stage exits non-zero (test fails) before the implementation is written".*
- [ ] Implement any necessary logic in `devs-server` or `devs-scheduler` to ensure that these workflow stages are correctly dispatched and their exit codes are captured accurately.
- [ ] Ensure the `devs submit` command correctly handles these workflows and wait for completion.

## 3. Code Review
- [ ] Verify that the E2E test covers the full cycle: Server Start -> Project Setup -> Red Submission -> Fix -> Green Submission.
- [ ] Ensure that the `run_id` and stage statuses are correctly verified via the CLI or MCP interface during the test.
- [ ] Check for proper cleanup of the temporary project and server process.

## 4. Run Automated Tests to Verify
- [ ] Run the TDD loop E2E test: `cargo test --test test_tdd_loop`.
- [ ] Ensure the test passes on the local environment.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that the TDD workflows are now verified and operational.

## 6. Automated Verification
- [ ] Execute `./do presubmit` and ensure that the new E2E test is included and passes on all platforms.
- [ ] Verify that `target/traceability.json` correctly maps this test to `AC-ROAD-P4-006`.
