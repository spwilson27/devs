# Task: Implement Failure Classification Lookup Table and Detection Logic (Sub-Epic: 10_Agent TDD Loop Enforcement)

## Covered Requirements
- [3_MCP_DESIGN-REQ-034]

## Dependencies
- depends_on: [01_define_core_tdd_workflows.md, 04_diagnostic_sequence_enforcement.md]
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written

- [ ] Create a new unit test file `crates/devs-core/src/failure_classification/tests.rs` with the following tests:

**Test 1: `detect_compilation_error_from_rust_diagnostics`**
```rust
// Covers: [3_MCP_DESIGN-REQ-034]
#[test]
fn detect_compilation_error_from_rust_diagnostics() {
    let stderr = "error[E0308]: mismatched types\n --> src/main.rs:42:5\n  |\n42 |     let x: String = 5;\n  |         ^ expected struct `String`, found integer";
    let classification = FailureClassifier::classify(stderr, "", None, false);
    assert_eq!(classification.category, FailureCategory::CompilationError);
    assert_eq!(classification.source_file, Some("src/main.rs"));
    assert_eq!(classification.line_number, Some(42));
}
```

**Test 2: `detect_test_assertion_failure_from_stdout`**
```rust
// Covers: [3_MCP_DESIGN-REQ-034]
#[test]
fn detect_test_assertion_failure_from_stdout() {
    let stdout = "test tests::test_workflow_submission ... FAILED\nfailures:\n---- tests::test_workflow_submission stdout ----\nthread 'tests::test_workflow_submission' panicked at 'assertion failed: run.status == Completed'";
    let classification = FailureClassifier::classify("", stdout, None, false);
    assert_eq!(classification.category, FailureCategory::TestAssertionFailure);
    assert!(classification.test_name.contains("test_workflow_submission"));
}
```

**Test 3: `detect_coverage_gate_failure_from_structured`**
```rust
// Covers: [3_MCP_DESIGN-REQ-034]
#[test]
fn detect_coverage_gate_failure_from_structured() {
    let structured = serde_json::json!({
        "gates": [
            {"name": "unit_coverage", "passed": true, "actual": 0.92},
            {"name": "e2e_coverage", "passed": false, "actual": 0.75, "required": 0.80}
        ]
    });
    let classification = FailureClassifier::classify("", "", Some(structured), false);
    assert_eq!(classification.category, FailureCategory::CoverageGateFailure);
    assert_eq!(classification.failing_gates.len(), 1);
}
```

**Test 4: `detect_clippy_denial_from_stderr`**
```rust
// Covers: [3_MCP_DESIGN-REQ-034]
#[test]
fn detect_clippy_denial_from_stderr() {
    let stderr = "error: unused variable: `x`\n --> src/main.rs:10:9\n  |\n10 |     let x = 5;\n  |         ^ help: if this is intentional, prefix it with an underscore: `_x`";
    let classification = FailureClassifier::classify(stderr, "", None, false);
    assert_eq!(classification.category, FailureCategory::ClippyDenial);
    assert_eq!(classification.source_file, Some("src/main.rs"));
}
```

**Test 5: `detect_traceability_failure_from_structured`**
```rust
// Covers: [3_MCP_DESIGN-REQ-034]
#[test]
fn detect_traceability_failure_from_structured() {
    let structured = serde_json::json!({
        "traceability": {
            "overall_passed": false,
            "missing_ids": ["3_MCP_DESIGN-REQ-034", "3_MCP_DESIGN-REQ-035"]
        }
    });
    let classification = FailureClassifier::classify("", "", Some(structured), false);
    assert_eq!(classification.category, FailureCategory::TraceabilityFailure);
    assert_eq!(classification.missing_requirement_ids.len(), 2);
}
```

**Test 6: `detect_rate_limit_from_stderr`**
```rust
// Covers: [3_MCP_DESIGN-REQ-034]
#[test]
fn detect_rate_limit_from_stderr() {
    let stderr = "RateLimitError: Too many requests. Please wait 60 seconds before retrying.";
    let classification = FailureClassifier::classify(stderr, "", None, false);
    assert_eq!(classification.category, FailureCategory::RateLimit);
    assert_eq!(classification.cooldown_secs, Some(60));
}
```

**Test 7: `detect_process_timeout_from_stage_status`**
```rust
// Covers: [3_MCP_DESIGN-REQ-034]
#[test]
fn detect_process_timeout_from_stage_status() {
    // TimedOut status takes precedence over stderr content
    let classification = FailureClassifier::classify("", "", None, true);
    assert_eq!(classification.category, FailureCategory::ProcessTimeout);
}
```

**Test 8: `detect_disk_full_from_checkpoint_error`**
```rust
// Covers: [3_MCP_DESIGN-REQ-034]
#[test]
fn detect_disk_full_from_checkpoint_error() {
    let stderr = "Error: failed to write checkpoint: No space left on device (os error 28)";
    let classification = FailureClassifier::classify(stderr, "", None, false);
    assert_eq!(classification.category, FailureCategory::DiskFull);
}
```

**Test 9: `unknown_failure_falls_back_to_internal_error`**
```rust
// Covers: [3_MCP_DESIGN-REQ-034]
#[test]
fn unknown_failure_falls_back_to_internal_error() {
    let stderr = "Some unknown error occurred";
    let classification = FailureClassifier::classify(stderr, "", None, false);
    assert_eq!(classification.category, FailureCategory::Unknown);
    assert!(classification.requires_pool_state_check);
}
```

- [ ] Run `cargo test -p devs-core failure_classification -- --nocapture` to verify all tests compile but fail (red phase).

## 2. Task Implementation

- [ ] Create `crates/devs-core/src/failure_classification/mod.rs` with the following data structures:

```rust
/// Failure category for classification — exhaustive for MVP per [3_MCP_DESIGN-REQ-034]
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FailureCategory {
    CompilationError,
    TestAssertionFailure,
    CoverageGateFailure,
    ClippyDenial,
    TraceabilityFailure,
    RateLimit,
    ProcessTimeout,
    DiskFull,
    Unknown,
}

/// Structured classification result with actionable metadata
#[derive(Debug, Clone)]
pub struct FailureClassification {
    pub category: FailureCategory,
    pub source_file: Option<String>,
    pub line_number: Option<u32>,
    pub test_name: Option<String>,
    pub failing_gates: Vec<String>,
    pub missing_requirement_ids: Vec<String>,
    pub cooldown_secs: Option<u64>,
    pub requires_pool_state_check: bool,
    pub detection_reason: String,
}

/// Classifier implementing the detection rules from [3_MCP_DESIGN-REQ-034]
pub struct FailureClassifier;

impl FailureClassifier {
    /// Classify a stage failure based on stderr, stdout, structured output, and timed_out flag
    pub fn classify(
        stderr: &str,
        stdout: &str,
        structured: Option<serde_json::Value>,
        timed_out: bool,
    ) -> FailureClassification {
        // Implementation follows the detection rules in the failure classification table
        // Priority order: timeout > disk_full > rate_limit > compilation > test > coverage > clippy > traceability > unknown
    }
}
```

- [ ] Implement the detection logic for each failure category following the exact detection rules from the spec:
  - **Compilation error**: `stderr.contains("error[E")` → extract file path and line number from Rust diagnostics
  - **Test assertion failure**: `stdout.contains("FAILED") && stdout.contains("test ")` → extract test name
  - **Coverage gate failure**: `structured.gates[*].passed == false` → extract failing gate names
  - **Clippy denial**: `stderr.contains("error: ") && (stderr.contains("clippy") || stderr.contains("unused"))` → extract file/line
  - **Traceability failure**: `structured.traceability.overall_passed == false` → extract missing IDs
  - **Rate limit**: `stderr.contains("RateLimit") || stderr.contains("rate limit") || stderr.contains("Too many requests")` → extract cooldown
  - **Process timeout**: `timed_out == true` → category is ProcessTimeout regardless of stderr
  - **Disk full**: `stderr.contains("No space left") || stderr.contains("os error 28")` → requires_pool_state_check = true
  - **Unknown**: no rule matches → requires_pool_state_check = true per [3_MCP_DESIGN-REQ-DBG-BR-000]

- [ ] Implement helper functions for extracting metadata:
  - `extract_rust_error_location(stderr: &str) -> Option<(String, u32)>` — parses `--> src/file.rs:LINE`
  - `extract_test_name(stdout: &str) -> Option<String>` — parses `test <name> ... FAILED`
  - `extract_cooldown_secs(stderr: &str) -> Option<u64>` — parses "wait N seconds" patterns

- [ ] Add `// Covers: [3_MCP_DESIGN-REQ-034]` annotation on the `FailureClassifier::classify` function.

## 3. Code Review

- [ ] Verify that the detection rules are applied in the correct priority order (timeout first, unknown last).
- [ ] Verify that `requires_pool_state_check` is set to `true` for `Unknown`, `DiskFull`, and `RateLimit` categories.
- [ ] Ensure that the `detection_reason` field provides a human-readable explanation for debugging.
- [ ] Confirm that the classifier handles empty strings gracefully (no panics on empty stderr/stdout).
- [ ] Check that structured output parsing uses safe JSON access (no `unwrap()` on missing fields).

## 4. Run Automated Tests to Verify

- [ ] Run the unit tests:
  ```
  cargo test -p devs-core failure_classification -- --nocapture
  ```
  All 9 tests must pass (green).

- [ ] Run the full devs-core test suite:
  ```
  cargo test -p devs-core
  ```
  No regressions.

- [ ] Run traceability verification:
  ```
  python3 .tools/verify_requirements.py --ids 3_MCP_DESIGN-REQ-034
  ```
  Must report the requirement ID as "covered".

## 5. Update Documentation

- [ ] Add module-level documentation to `crates/devs-core/src/failure_classification/mod.rs` describing:
  - The purpose of the failure classifier in the agent diagnostic protocol.
  - The exhaustive list of failure categories for MVP.
  - Reference to [3_MCP_DESIGN-REQ-034] and [3_MCP_DESIGN-REQ-DBG-BR-000].

- [ ] Update `docs/plan/specs/3_mcp_design.md` section §4.1 to reference the `FailureClassifier` implementation location.

## 6. Automated Verification

- [ ] Run `./do lint` and verify no clippy warnings in the new module.
- [ ] Run `./do coverage` and verify the failure_classification module has ≥ 90% unit test coverage.
- [ ] Confirm the requirement ID appears in `target/traceability.json` as covered.
