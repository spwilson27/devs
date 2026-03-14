# Task: Implement Test Failure Verification Before Implementation (Sub-Epic: 07_Agent Diagnostic Behaviors)

## Covered Requirements
- [3_MCP_DESIGN-REQ-029]

## Dependencies
- depends_on: [05_test_annotation_enforcement.md]
- shared_components: [devs-mcp, ./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-cli/tests/test_failure_verification_tests.rs` that verifies the following behaviors:
    1. **Test 1.1 - Genuine Failure Detection**: Create a test file with valid annotation that genuinely fails (exit code 1 from `cargo test`). Verify the TDD workflow correctly identifies this as a valid Red stage and allows proceeding to Green stage.
    2. **Test 1.2 - False Positive Detection (Test Passes Without Implementation)**: Create a test file that incorrectly passes (exit code 0) without any implementation. Verify the TDD workflow:
        - Detects this as a defective test
        - Emits error: `TDD_INVALID: Test passes without implementation - fix test before proceeding`
        - Blocks Green stage (no implementation file should be written)
        - Verifies by checking that no source files in `src/` were modified after the false-positive detection
    3. **Test 1.3 - Compile Error vs Test Failure**: Create a test file with a syntax error that causes compile failure. Verify the workflow distinguishes this from a test failure and blocks Green stage with error: `TDD_COMPILE: Fix compile errors before Red stage validation`.
    4. **Test 1.4 - Exit Code Parsing**: Verify that the exit code from `cargo test` is correctly parsed and categorized:
        - Exit code 0 = test passed (invalid for Red stage)
        - Exit code 1 = test failed (valid for Red stage)
        - Exit code 101 = compile error (invalid for Red stage)
        - Other non-zero = internal error (requires classification)
    5. **Test 1.5 - Defective Test Fix Workflow**: After detecting a false-positive test, verify the agent is guided to fix the test assertion before proceeding.
- [ ] Use a mock test runner that can be configured to return specific exit codes and outputs.
- [ ] Verify that the file system state is checked after false-positive detection (no implementation files written).

## 2. Task Implementation
- [ ] Implement the test failure verifier in `crates/devs-cli/src/tdd/failure_verifier.rs`:
    - `run_test_and_verify(test_path: &Path) -> Result<TestResult, TestError>` - runs test and validates outcome
    - `TestResult` enum: `GenuineFailure { exit_code: i32, output: String }`, `FalsePositive`, `CompileError { output: String }`, `InternalError { exit_code: i32, output: String }`
    - `verify_no_implementation_written(test_result: &TestResult, src_paths: &[Path]) -> Result<(), TddError>` - checks that no source files were modified after false-positive
- [ ] Implement the exit code parser in `crates/devs-cli/src/tdd/exit_code_parser.rs`:
    - `parse_cargo_test_exit_code(code: i32) -> TestOutcome` - maps exit codes to outcomes
    - `TestOutcome` enum: `Passed`, `Failed`, `CompileError`, `Panic`, `Timeout`, `Unknown`
- [ ] Implement the defective test detector in `crates/devs-cli/src/tdd/defective_test_detector.rs`:
    - `detect_false_positive(test_output: &str, exit_code: i32) -> Result<bool>` - identifies tests that pass without implementation
    - `get_defective_test_fix_guidance() -> String` - returns actionable instructions for fixing the test
- [ ] Update the TDD workflow runner in `crates/devs-cli/src/tdd/workflow.rs`:
    - Add Red stage validation step that calls `run_test_and_verify()`
    - If `FalsePositive` detected:
        - Emit error: `TDD_INVALID: Test passes without implementation - fix test before proceeding`
        - Set session state to `RedStageBlocked`
        - Return exit code 1 to block Green stage
    - If `GenuineFailure` detected:
        - Emit info: `TDD_VALID: Test genuinely fails - proceeding to Green stage allowed`
        - Set session state to `RedStageComplete`
        - Allow Green stage to proceed
    - If `CompileError` detected:
        - Emit error: `TDD_COMPILE: Fix compile errors before Red stage validation`
        - Set session state to `RedStageBlocked`
        - Return exit code 1 to block Green stage
- [ ] Implement file modification tracking in `crates/devs-cli/src/tdd/file_tracker.rs`:
    - `snapshot_src_files(src_paths: &[Path]) -> Result<FileSnapshot>` - records file hashes before test
    - `detect_modifications(before: &FileSnapshot, after: &FileSnapshot) -> Result<Vec<PathBuf>>` - finds modified files
    - Use this to verify no implementation was written after false-positive detection

## 3. Code Review
- [ ] Verify that the exit code parsing handles all cargo test exit codes correctly (refer to cargo documentation).
- [ ] Check that the false-positive detection is accurate and doesn't produce false alarms.
- [ ] Ensure the file modification tracking uses reliable hashing (e.g., SHA-256) to detect changes.
- [ ] Verify that error messages are actionable and guide the agent to the correct fix.
- [ ] Confirm that the TDD workflow state machine correctly transitions between states.
- [ ] Check that compile errors are distinguished from test failures (different error messages, different fixes).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --test test_failure_verification_tests` to verify all behaviors.
- [ ] Manually test the TDD workflow:
    1. Write a genuine failing test → verify Red stage passes, Green stage allowed
    2. Write a test that passes without implementation → verify Red stage blocked, Green stage blocked
    3. Write a test with compile error → verify Red stage blocked with compile error message
- [ ] Verify that after false-positive detection, no implementation files exist in `src/`.

## 5. Update Documentation
- [ ] Update `docs/agent_development.md` with the following sections:
    - "Red Stage Validation" - explain the genuine failure requirement
    - "Defective Test Detection" - describe what happens when a test passes without implementation
    - "Exit Code Interpretation" - document the meaning of different cargo test exit codes
- [ ] Add examples of error messages:
    - `TDD_INVALID: Test passes without implementation - fix test before proceeding`
    - `TDD_COMPILE: Fix compile errors before Red stage validation`
    - `TDD_VALID: Test genuinely fails - proceeding to Green stage allowed`
- [ ] Document the file modification tracking mechanism and why it's used (to verify no speculative implementation).

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify all tests pass including the new test failure verification tests.
- [ ] Run `./do lint` and verify no clippy warnings or formatting issues in the new code.
- [ ] Verify traceability: ensure all new test functions have `// Covers: 3_MCP_DESIGN-REQ-029` annotation.
- [ ] Run `./do coverage` and verify the new code achieves ≥90% unit coverage.
- [ ] Create an E2E test that simulates the full TDD Red stage workflow and verifies the correct behavior.
