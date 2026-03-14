# Task: Implement Failure Classification & Targeted Fix Protocol (Sub-Epic: 07_Agent Diagnostic Behaviors)

## Covered Requirements
- [3_MCP_DESIGN-REQ-029], [3_MCP_DESIGN-REQ-030]

## Dependencies
- depends_on: [01_diagnostic_investigation_sequence.md, 06_test_failure_verification.md]
- shared_components: [devs-mcp, ./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-cli/tests/failure_classification_tests.rs` for each of the eight failure categories:
    1. **Test 1.1 - Compile Error**: Mock a `cargo build` failure with rustc error output. Verify classification as `CompileError` with extracted error details (file, line, column, error code, message).
    2. **Test 1.2 - Test Failure**: Mock a `cargo test` failure with test assertion output. Verify classification as `TestFailure` with extracted test name, assertion message, expected vs actual.
    3. **Test 1.3 - Coverage Failure**: Mock a coverage gate failure with `target/coverage/report.json` showing `delta_pct` below threshold. Verify classification as `CoverageFailure` with extracted uncovered lines and missing percentage.
    4. **Test 1.4 - Clippy Warning**: Mock a `cargo clippy` run with warnings (deny mode). Verify classification as `LintFailure` with extracted lint name, file, line, suggestion.
    5. **Test 1.5 - Traceability Failure**: Mock a traceability check failure with `target/traceability.json` showing `stale_annotations`. Verify classification as `TraceabilityFailure` with extracted invalid annotation list.
    6. **Test 1.6 - Timeout**: Mock a stage that reaches `StageStatus::TimedOut`. Verify classification as `TimeoutFailure` with extracted stage name, timeout duration, progress at timeout.
    7. **Test 1.7 - Presubmit Incomplete**: Mock a presubmit run where not all stages completed. Verify classification as `PresubmitIncomplete` with list of missing stages.
    8. **Test 1.8 - Unclassified Internal**: Mock an unknown error pattern. Verify classification as `UnclassifiedInternal` with full error output attached.
- [ ] Mock a full `presubmit-check` failure and verify the classification result for each stage failure type.
- [ ] Verify that an agent cannot proceed without a classified fix (classification is a gating step).
- [ ] Test the "No Speculative Edits" rule: verify no file writes occur before classification is complete and stored in session state.

## 2. Task Implementation
- [ ] Implement the failure classification engine in `crates/devs-cli/src/diagnose/classifier.rs`:
    - `struct FailureClassifier` - orchestrates classification logic
    - `fn classify(&self, stage_output: &StageOutput, run: &WorkflowRun) -> Result<FailureClassification>`
    - `FailureClassification` struct:
        ```rust
        struct FailureClassification {
            category: FailureCategory,
            confidence: f32,  // 0.0 to 1.0
            details: ClassificationDetails,
            fix_guidance: String,
        }
        ```
    - `FailureCategory` enum: `CompileError`, `TestFailure`, `CoverageFailure`, `LintFailure`, `TraceabilityFailure`, `TimeoutFailure`, `PresubmitIncomplete`, `UnclassifiedInternal`
- [ ] Implement the compile error classifier in `crates/devs-cli/src/diagnose/classifiers/compile_error.rs`:
    - Parse rustc error format: `error[E<code>]: <message> at <file>:<line>:<column>`
    - Extract: error_code, message, file_path, line, column, snippet, help_text
    - Return structured classification with actionable fix guidance
- [ ] Implement the test failure classifier in `crates/devs-cli/src/diagnose/classifiers/test_failure.rs`:
    - Parse cargo test output: `test <test_name> ... FAILED` with panic message
    - Extract: test_name, assertion_type, expected_value, actual_value, panic_location
    - Cross-reference with test source file to extract test code context
- [ ] Implement the coverage failure classifier in `crates/devs-cli/src/diagnose/classifiers/coverage_failure.rs`:
    - Parse `target/coverage/report.json`:
        ```json
        {
          "delta_pct": -5.2,
          "uncovered_lines": [{"file": "src/lib.rs", "lines": [42, 43, 44]}],
          "total_lines": 1234
        }
        ```
    - Extract: delta_pct (negative = regression), uncovered_lines by file, total_lines
    - Generate fix guidance: "Add tests covering lines <list> in <file>"
- [ ] Implement the lint failure classifier in `crates/devs-cli/src/diagnose/classifiers/lint_failure.rs`:
    - Parse clippy output: `warning: <lint_name> at <file>:<line>:<column>` with suggestion
    - Extract: lint_name, message, file_path, line, column, suggestion
    - Handle deny mode: clippy exits non-zero when warnings are denied
- [ ] Implement the traceability failure classifier in `crates/devs-cli/src/diagnose/classifiers/traceability_failure.rs`:
    - Parse `target/traceability.json`:
        ```json
        {
          "traceability_pct": 85.0,
          "stale_annotations": ["INVALID-REQ-ID", "NONEXISTENT-REQ"],
          "phase_gates": [...]
        }
        ```
    - Extract: traceability_pct, stale_annotations[], missing_requirements[]
    - Generate fix guidance: "Fix or remove invalid // Covers: annotations"
- [ ] Implement the timeout failure classifier in `crates/devs-cli/src/diagnose/classifiers/timeout_failure.rs`:
    - Extract from stage status: stage_name, timeout_duration, elapsed_time, progress_at_timeout
    - Analyze: was stage making progress before timeout? (check log timestamps)
    - Generate fix guidance: "Stage timed out after <duration> - optimize or increase timeout"
- [ ] Implement the presubmit incomplete classifier in `crates/devs-cli/src/diagnose/classifiers/presubmit_incomplete.rs`:
    - Check workflow run for stages not yet completed
    - Extract: completed_stages[], pending_stages[], failed_stages[]
    - Generate fix guidance: "Wait for all presubmit stages to complete"
- [ ] Implement the unclassified internal classifier in `crates/devs-cli/src/diagnose/classifiers/unclassified.rs`:
    - Fallback classifier when no other pattern matches
    - Attach full stderr and stdout output
    - Generate fix guidance: "Manual diagnosis required - no pattern match found"
- [ ] Enforce the "No Speculative Edits" rule ([3_MCP_DESIGN-REQ-035]):
    - Add guard in `crates/devs-cli/src/diagnose/edit_guard.rs`: `check_classification_complete(session: &Session) -> Result<(), DiagnoseError>`
    - This guard must pass before any file write operations are allowed
    - Store classification result in session state: `session.classification = Some(classification)`
    - Log: `CLASSIFICATION_COMPLETE: Failure classified as <category> with <confidence> confidence`
- [ ] Implement stable error prefixes for automated response ([3_MCP_DESIGN-REQ-AC-4.09]):
    - `COMPILE_ERROR:`, `TEST_FAILURE:`, `COVERAGE_FAILURE:`, `LINT_FAILURE:`, `TRACEABILITY_FAILURE:`, `TIMEOUT_FAILURE:`, `PRESUBMIT_INCOMPLETE:`, `UNCLASSIFIED:`
    - These prefixes are machine-stable for automated parsing

## 3. Code Review
- [ ] Ensure that the classification tool provides specific, actionable instructions rather than vague summaries (per §4.1 of Glass-Box design).
- [ ] Verify that the tool follows the progressive context narrowing algorithm for source reading (REQ-NEW-025): don't load entire files when targeted search suffices.
- [ ] Confirm that all failures are logged with stable prefixes for automated response ([3_MCP_DESIGN-REQ-AC-4.09]).
- [ ] Check that the "No Speculative Edits" rule is enforced: no file writes before classification complete.
- [ ] Verify that the classifier handles multi-error scenarios (e.g., compile error + test failure) correctly.
- [ ] Ensure confidence scores are meaningful (high confidence = clear pattern match, low confidence = ambiguous).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-cli --test failure_classification_tests` to verify classification accuracy for all 8 categories.
- [ ] Run `cargo test --package devs-cli --lib diagnose::classifiers` to verify unit tests for each classifier.
- [ ] Manually test the classification workflow:
    1. Trigger each failure type in a test workflow
    2. Run the classification tool
    3. Verify the correct category is identified with high confidence
    4. Verify the fix guidance is actionable

## 5. Update Documentation
- [ ] Update `docs/agent_development.md` with the following sections:
    - "Failure Classification Protocol" - explain the 8 failure categories
    - "Classification Output Format" - show example classification results
    - "Fix Guidance Examples" - demonstrate actionable instructions for each category
- [ ] Document the stable error prefixes:
    - `COMPILE_ERROR: <details>` - rustc compilation failure
    - `TEST_FAILURE: <details>` - test assertion failure
    - `COVERAGE_FAILURE: <details>` - coverage gate regression
    - `LINT_FAILURE: <details>` - clippy warning in deny mode
    - `TRACEABILITY_FAILURE: <details>` - invalid // Covers: annotation
    - `TIMEOUT_FAILURE: <details>` - stage timeout
    - `PRESUBMIT_INCOMPLETE: <details>` - presubmit not all stages complete
    - `UNCLASSIFIED: <details>` - unknown error pattern
- [ ] Add example classification output:
    ```json
    {
      "category": "CompileError",
      "confidence": 0.95,
      "details": {
        "error_code": "E0425",
        "message": "cannot find function `foo` in this scope",
        "file_path": "src/lib.rs",
        "line": 42,
        "column": 15
      },
      "fix_guidance": "Define function `foo` or import it from the appropriate module. Add: fn foo() { } or use crate::module::foo;"
    }
    ```

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify all tests pass including the new failure classification tests.
- [ ] Run `./do lint` and verify no clippy warnings or formatting issues in the new code.
- [ ] Verify traceability: ensure all new test functions have `// Covers: 3_MCP_DESIGN-REQ-029` and `// Covers: 3_MCP_DESIGN-REQ-030` annotations.
- [ ] Run `./do coverage` and verify the new code achieves ≥90% unit coverage.
- [ ] Verify that the edit guard correctly blocks file writes before classification completion.
- [ ] Create an E2E test that simulates full failure → classification → fix workflow (counts toward 50% CLI E2E gate).
