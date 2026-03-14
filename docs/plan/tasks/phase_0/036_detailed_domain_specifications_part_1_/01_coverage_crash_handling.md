# Task: Unit Test Suite Crash Reported as Unmeasured (Sub-Epic: 036_Detailed Domain Specifications (Part 1))

## Covered Requirements
- [1_PRD-KPI-BR-002]

## Dependencies
- depends_on: []
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a test script at `tests/do_script/test_coverage_crash.sh` that exercises the crash-detection path of `./do coverage`.
- [ ] The test MUST create a wrapper script (e.g., `mock_cargo`) that, when invoked as `cargo test`, exits with signal 139 (SIGSEGV) or exit code 101 (Rust panic/abort) to simulate a unit test suite crash.
- [ ] The test MUST set `PATH` so the mock `cargo` is found before the real one, scoped to the test only.
- [ ] Assert that `./do coverage` exits with a non-zero exit code (specifically exit code 1).
- [ ] Assert that stderr output contains the string `instrumentation failure` (case-insensitive match acceptable).
- [ ] Assert that stderr output does NOT contain `0.0%` for the KPI-001 gate — the gate must be reported as `unmeasured`, not as zero.
- [ ] Assert that `target/coverage/report.json` (if written) contains `"actual_pct": null` or is absent for the KPI-001 gate, NOT `"actual_pct": 0.0`.
- [ ] Write a second test case where `cargo test` exits with code 1 (normal test failure, not crash) and verify that `./do coverage` still proceeds to evaluate coverage gates normally (i.e., crash detection does NOT trigger on ordinary test failures).

## 2. Task Implementation
- [ ] In the `./do` script's `coverage` subcommand, capture the exit code of the unit test suite run into a variable (e.g., `unit_exit`).
- [ ] Define crash exit codes: exit codes >= 101 (Rust abort), or any signal-killed exit (128+signal). Normal test failure is exit code 1 from `cargo test`.
- [ ] If `unit_exit` indicates a crash (not a normal test failure), set an `INSTRUMENTATION_FAILURE` flag.
- [ ] When `INSTRUMENTATION_FAILURE` is set: skip all coverage gate evaluation, print to stderr: `"ERROR: instrumentation failure: unit test suite crashed before completion (exit code $unit_exit). KPI-001 is unmeasured."`, and exit with code 1.
- [ ] When `INSTRUMENTATION_FAILURE` is NOT set (even if tests failed), proceed with normal coverage measurement and gate evaluation.
- [ ] Ensure that the E2E test suite is still run even if unit tests fail (but not if they crash), so that E2E gates can still be evaluated independently.

## 3. Code Review
- [ ] Verify that the crash detection logic correctly distinguishes between exit code 1 (test failures) and exit codes indicating crashes (101, 128+N).
- [ ] Verify that the error message exactly matches the requirement text in [1_PRD-KPI-BR-002]: KPI-001 is reported as "unmeasured", not "0%".
- [ ] Verify that no coverage report file is written with `0.0` for a crashed suite — it must be `null` or omitted.
- [ ] Verify POSIX sh compatibility of the crash detection logic (no bashisms).

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/do_script/test_coverage_crash.sh` and verify all assertions pass.
- [ ] Run `./do coverage` on the real codebase (with passing tests) and verify it still works end-to-end without false crash detection.

## 5. Update Documentation
- [ ] Add a `# Covers: 1_PRD-KPI-BR-002` comment in the test script next to each relevant assertion.

## 6. Automated Verification
- [ ] Run the test script in CI and confirm exit code 0: `bash tests/do_script/test_coverage_crash.sh && echo PASS || echo FAIL`
- [ ] Run `./do lint` to verify no script issues are introduced.
