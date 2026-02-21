# Task: Implement re-implementation workflow for regressive tasks (Sub-Epic: 27_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-088]

## 1. Initial Test Written
- [ ] Detect repo language/test runner and create tests accordingly (pytest or Jest).
- [ ] Create tests that simulate a previously-passing test that later fails and assert that the system detects regression and creates a reimplementation task record.
  - Python (pytest): tests/risks/test_regression_reimplementation.py
    - Setup: create a small module under src/sample/feature.py and tests/tests_feature.py asserting correct behavior.
    - Run initial tests programmatically (invoke test runner) and record passing state (emulate TestNode reporting) and commit state.
    - Introduce a regression in the module, run tests again and assert failure.
    - Call RegressionDetector.detect_regression(failing_test_path) and assert it returns last_passing_commit and details of the failure.
    - Call ReimplementationPlanner.create_reimplementation_task(failing_test_path) and assert a new task record exists in a test tasks table or in-memory task queue with id prefixed `27_8_RISKS-088-`.
  - Node/TS: tests/risks/regression-reimplementation.test.ts with equivalent flow using child_process to run jest.
- [ ] Test names: `test_detect_regression_and_create_reimplementation_task` and `test_reimplementation_task_contains_trace`.

## 2. Task Implementation
- [ ] Implement `src/risks/regression.{py,ts}` with:
  - class RegressionDetector:
    - record_test_report(commit_hash, test_report): stores passing/failing status (small SQLite table `test_reports(commit_hash, test_name, status, report_json)`).
    - detect_regression(failing_test_name) -> returns {last_passing_commit, failing_commit, failing_trace}
  - class ReimplementationPlanner:
    - create_reimplementation_task(failing_test_name, failing_commit, last_passing_commit) -> task_id: builds a minimal Task record containing failing_test, repro_steps, last_good_commit, suggested_strategy="reimplement", and inserts into TaskQueue/DB.
- [ ] Ensure test harness can run tests programmatically and capture results (use pytest xdist hooks or jest --json output) and store minimal deterministic fingerprint (test_name + stdout + failing assertion) to reproduce.
- [ ] Provide an API for the DeveloperAgent to consume created reimplementation tasks and follow the standard TDD loop for reimplementation.

## 3. Code Review
- [ ] Confirm RegressionDetector only creates reimplementation tasks when a test previously passed and now fails (avoid duplicates).
- [ ] Confirm created tasks include reproducible steps, exact failing test path, last passing commit hash, environment fingerprint (OS, interpreter, dependencies) if available.
- [ ] Verify atomic insertion into tasks DB and idempotent creation (unique constraint on failing_test+failing_commit -> avoid duplicates).

## 4. Run Automated Tests to Verify
- [ ] Execute the regression reimplementation tests and confirm that a new task is created with the expected metadata and that its ID begins with `27_8_RISKS-088-`.
- [ ] Run the test harness with `pytest tests/risks/test_regression_reimplementation.py -q` or `npx jest ...` and assert exit code 0 for the harness itself (the test will assert internal behavior).

## 5. Update Documentation
- [ ] Add `docs/tasks/phase_8/27_8_risks/03_regression_reimplementation.md` documenting the detection algorithm, the task payload schema, and examples of how a DeveloperAgent should process the reimplementation task.

## 6. Automated Verification
- [ ] Add `scripts/verify_regression_reimplementation.sh` which:
  - Creates a sample module, proves tests pass, commits, injects a regression, runs the detector, and asserts that a reimplementation task record is created in the tasks DB.
  - Exits non-zero on verification failure.
