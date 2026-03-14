# Task: MCP Assertion Snippet Truncation (Sub-Epic: 02_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-BR-036]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp]

## 1. Initial Test Written

### Test 1: Unit Test for Snippet Truncation
- [ ] Create a Rust unit test file `crates/devs-mcp/src/tools/assert_stage_output_tests.rs` (or add to existing test module):

```rust
/// Unit tests for assert_stage_output snippet truncation.
/// 
/// Covers: [3_MCP_DESIGN-REQ-BR-036]

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tools::assert_stage_output::{AssertionFailure, assert_stage_output};

    #[test]
    fn test_actual_snippet_truncated_to_256_chars() {
        // Setup: Create a stage output with very long stdout (> 500 chars)
        let long_stdout = "A".repeat(600); // 600 characters
        let stage_output = StageOutput {
            exit_code: Some(0),
            stdout: long_stdout.clone(),
            stderr: String::new(),
            structured: None,
        };

        // Create an assertion that will fail (expect different value)
        let assertions = vec![Assertion {
            field: "stdout".to_string(),
            op: AssertionOp::Eq,
            value: serde_json::Value::String("B".repeat(100)), // Will not match
            path: None,
        }];

        // Call assert_stage_output
        let result = assert_stage_output(&stage_output, &assertions);

        // Verify: The failure record's actual_snippet must be ≤ 256 chars
        assert!(!result.passed, "Assertion should fail");
        assert_eq!(result.failures.len(), 1, "Should have exactly one failure");

        let failure = &result.failures[0];
        assert!(
            failure.actual_snippet.len() <= 256,
            "actual_snippet must be ≤ 256 chars, got {} chars",
            failure.actual_snippet.len()
        );

        // Verify the snippet is a prefix of the actual value
        assert!(
            long_stdout.starts_with(&failure.actual_snippet),
            "actual_snippet should be a prefix of the actual stdout"
        );
    }

    #[test]
    fn test_actual_snippet_exactly_256_chars_when_longer() {
        // Setup: Create output slightly over 256 chars
        let stdout = "X".repeat(300);
        let stage_output = StageOutput {
            exit_code: Some(0),
            stdout: stdout.clone(),
            stderr: String::new(),
            structured: None,
        };

        let assertions = vec![Assertion {
            field: "stdout".to_string(),
            op: AssertionOp::Eq,
            value: serde_json::Value::String("Y".repeat(10)),
            path: None,
        }];

        let result = assert_stage_output(&stage_output, &assertions);

        // Verify: Snippet should be exactly 256 chars (truncated)
        let failure = &result.failures[0];
        assert_eq!(
            failure.actual_snippet.len(),
            256,
            "actual_snippet should be exactly 256 chars for input > 256"
        );
        assert_eq!(failure.actual_snippet, "X".repeat(256));
    }

    #[test]
    fn test_actual_snippet_not_truncated_when_shorter_than_256() {
        // Setup: Create output shorter than 256 chars
        let stdout = "Short output".to_string();
        let stage_output = StageOutput {
            exit_code: Some(0),
            stdout: stdout.clone(),
            stderr: String::new(),
            structured: None,
        };

        let assertions = vec![Assertion {
            field: "stdout".to_string(),
            op: AssertionOp::Eq,
            value: serde_json::Value::String("Different"),
            path: None,
        }];

        let result = assert_stage_output(&stage_output, &assertions);

        // Verify: Snippet should NOT be truncated (full value preserved)
        let failure = &result.failures[0];
        assert_eq!(
            failure.actual_snippet, stdout,
            "actual_snippet should be the full value when < 256 chars"
        );
    }

    #[test]
    fn test_stderr_truncation_also_applied() {
        // Setup: Create long stderr
        let long_stderr = "ERROR: ".repeat(100); // 700 chars
        let stage_output = StageOutput {
            exit_code: Some(1),
            stdout: String::new(),
            stderr: long_stderr.clone(),
            structured: None,
        };

        let assertions = vec![Assertion {
            field: "stderr".to_string(),
            op: AssertionOp::Eq,
            value: serde_json::Value::String("No errors"),
            path: None,
        }];

        let result = assert_stage_output(&stage_output, &assertions);

        // Verify: stderr snippet also truncated
        let failure = &result.failures[0];
        assert!(
            failure.actual_snippet.len() <= 256,
            "stderr snippet must also be ≤ 256 chars"
        );
    }

    #[test]
    fn test_utf8_safe_truncation() {
        // Setup: Create output with multi-byte UTF-8 characters
        let unicode_stdout = "Hello 世界 🌍".repeat(50); // 800 bytes
        let stage_output = StageOutput {
            exit_code: Some(0),
            stdout: unicode_stdout.clone(),
            stderr: String::new(),
            structured: None,
        };

        let assertions = vec![Assertion {
            field: "stdout".to_string(),
            op: AssertionOp::Eq,
            value: serde_json::Value::String("Different"),
            path: None,
        }];

        let result = assert_stage_output(&stage_output, &assertions);

        // Verify: Truncation is UTF-8 safe (doesn't split multi-byte chars)
        let failure = &result.failures[0];
        assert!(failure.actual_snippet.len() <= 256);
        
        // Verify it's valid UTF-8
        let _ = std::str::from_utf8(failure.actual_snippet.as_bytes())
            .expect("actual_snippet must be valid UTF-8");
    }

    #[test]
    fn test_json_path_assertion_truncation() {
        // Setup: Create structured output with long string value
        let structured = serde_json::json!({
            "error_message": "E".repeat(500),
            "details": "D".repeat(500)
        });

        let stage_output = StageOutput {
            exit_code: Some(1),
            stdout: String::new(),
            stderr: String::new(),
            structured: Some(structured.clone()),
        };

        // Test JSONPath assertion that fails
        let assertions = vec![Assertion {
            field: "structured".to_string(),
            op: AssertionOp::JsonPathEq,
            value: serde_json::Value::String("Expected"),
            path: Some("$.error_message".to_string()),
        }];

        let result = assert_stage_output(&stage_output, &assertions);

        // Verify: JSONPath result also truncated
        let failure = &result.failures[0];
        assert!(
            failure.actual_snippet.len() <= 256,
            "JSONPath assertion snippet must also be ≤ 256 chars"
        );
    }
}
```

- [ ] Run the tests to confirm they **fail** (red) before implementation:
```bash
cd /home/mrwilson/software/devs
cargo test -p devs-mcp assert_stage_output_tests -- --nocapture 2>&1 | tee /tmp/truncation_tests_baseline.txt
```

## 2. Task Implementation

### Step 1: Locate assert_stage_output Implementation
- [ ] Find the `assert_stage_output` MCP tool implementation:
```bash
find crates/devs-mcp -name "*.rs" -exec grep -l "fn assert_stage_output" {} \;
```

- [ ] Read the implementation to understand the current failure record structure

### Step 2: Implement Truncation Logic
- [ ] Add a truncation helper function:

```rust
/// Truncates a string to at most MAX_CHARS characters.
/// Ensures UTF-8 safety by not splitting multi-byte characters.
/// 
/// Covers: [3_MCP_DESIGN-REQ-BR-036]
fn truncate_snippet(s: &str, max_chars: usize) -> String {
    if s.len() <= max_chars {
        return s.to_string();
    }
    
    // Truncate to character boundary
    s.char_indices()
        .take(max_chars)
        .map(|(_, c)| c)
        .collect()
}

const MAX_SNIPPET_LENGTH: usize = 256;
```

- [ ] Update the `AssertionFailure` struct or creation logic to apply truncation:

```rust
impl AssertionFailure {
    fn new(
        assertion_index: usize,
        field: &str,
        op: AssertionOp,
        expected: &serde_json::Value,
        actual: &str,
        reason: &str,
    ) -> Self {
        Self {
            assertion_index,
            field: field.to_string(),
            op: op.to_string(),
            value: expected.clone(),
            reason: reason.to_string(),
            actual_snippet: truncate_snippet(actual, MAX_SNIPPET_LENGTH),
        }
    }
}
```

- [ ] Update all places where `AssertionFailure` is created to use the truncation helper

### Step 3: Handle Different Field Types
- [ ] Ensure truncation is applied consistently across all field types:

```rust
// For stdout/stderr fields:
let actual_value = match assertion.field.as_str() {
    "stdout" => &stage_output.stdout,
    "stderr" => &stage_output.stderr,
    "structured" => {
        // For JSONPath assertions, extract the value first
        if let Some(path) = &assertion.path {
            let json_path_result = extract_json_path(&stage_output.structured, path)?;
            json_path_result.to_string()
        } else {
            stage_output.structured.to_string()
        }
    }
    _ => actual_value.to_string(),
};

// Apply truncation when creating failure record
let failure = AssertionFailure::new(
    index,
    &assertion.field,
    assertion.op,
    &assertion.value,
    &actual_value,
    &failure_reason,
);
```

### Step 4: Add Traceability Comment
- [ ] Add `// Covers: [3_MCP_DESIGN-REQ-BR-036]` comment to the truncation function

### Step 5: Update Error Messages
- [ ] Ensure failure records include a note about truncation in the reason field when applicable:

```rust
let reason = if actual_value.len() > MAX_SNIPPET_LENGTH {
    format!(
        "Value mismatch (snippet truncated to {} chars, use get_stage_output for full value)",
        MAX_SNIPPET_LENGTH
    )
} else {
    "Value mismatch".to_string()
};
```

## 3. Code Review

- [ ] Verify that truncation is applied to ALL assertion types:
  - `eq`, `ne`, `contains`, `not_contains`, `matches` (stdout/stderr)
  - `json_path_eq`, `json_path_exists`, `json_path_not_exists` (structured)
- [ ] Verify that truncation happens at character boundaries (not byte boundaries)
- [ ] Verify that the full output is still available via `get_stage_output` (truncation only affects failure records)
- [ ] Verify that the `actual_snippet` field is always ≤ 256 characters (never exceeds)
- [ ] Verify that short values (< 256 chars) are NOT padded or modified
- [ ] Verify that UTF-8 multi-byte characters are not split (no invalid UTF-8 in snippet)
- [ ] Verify that the truncation is deterministic (same input → same snippet)

## 4. Run Automated Tests to Verify

- [ ] Run the unit tests:
```bash
cd /home/mrwilson/software/devs
cargo test -p devs-mcp assert_stage_output_tests -- --nocapture
```

- [ ] Run all MCP tests to ensure no regressions:
```bash
cargo test -p devs-mcp
```

- [ ] Create and run an E2E test that triggers an assertion failure:
```bash
# Create a test workflow that produces long output
# Call assert_stage_output via MCP
# Verify the response has truncated actual_snippet
```

- [ ] Verify the truncation manually:
```bash
# Run a stage with > 500 chars of output
# Call assert_stage_output with a failing assertion
# Inspect the JSON response
python -c "
import json
response = json.load(open('test_response.json'))
for failure in response['result']['failures']:
    snippet = failure['actual_snippet']
    print(f'Snippet length: {len(snippet)}')
    assert len(snippet) <= 256, f'Snippet too long: {len(snippet)}'
print('All snippets ≤ 256 chars ✓')
"
```

## 5. Update Documentation

- [ ] Update the MCP tool documentation in `docs/plan/specs/3_mcp_design.md`:
  - Add a note to the `AssertionFailure` schema that `actual_snippet` is truncated to 256 chars
  - Add a note that agents should call `get_stage_output` for complete failure analysis

- [ ] Update `docs/plan/summaries/3_mcp_design.md` if it contains MCP tool reference documentation

- [ ] Add a developer note in `crates/devs-mcp/README.md`:
```markdown
## Assertion Snippet Truncation

Per [3_MCP_DESIGN-REQ-BR-036], the `actual_snippet` field in assertion failure
records is truncated to 256 characters. This prevents large outputs from
bloating MCP responses while still providing enough context for initial
diagnosis.

For complete failure analysis, agents MUST call `get_stage_output` to retrieve
the full stdout/stderr/structured output.
```

## 6. Automated Verification

- [ ] Verify that all assertion failures have truncated snippets:
```bash
# Run a test suite that triggers various assertion failures
# Check all failure records
cargo test -p devs-mcp -- --nocapture 2>&1 | grep -A5 "actual_snippet" | while read line; do
    # Parse and verify length
    python -c "
import json, sys
data = json.loads('$line')
snippet = data.get('actual_snippet', '')
if len(snippet) > 256:
    print(f'FAIL: Snippet too long: {len(snippet)}')
    sys.exit(1)
"
done
echo "All snippets verified ≤ 256 chars"
```

- [ ] Verify UTF-8 safety:
```bash
# Create a test with unicode output
# Run assertion
# Verify snippet is valid UTF-8
python -c "
import json
with open('test_response.json') as f:
    response = json.load(f)
for failure in response['result']['failures']:
    snippet = failure['actual_snippet']
    # This will raise if invalid UTF-8
    snippet.encode('utf-8')
print('All snippets are valid UTF-8 ✓')
"
```

- [ ] Verify that get_stage_output returns full (non-truncated) output:
```bash
# Call get_stage_output for a stage with long output
# Verify the full output is returned (not truncated)
python -c "
import json
with open('stage_output.json') as f:
    output = json.load(f)
stdout_len = len(output['stdout'])
print(f'Full stdout length: {stdout_len}')
assert stdout_len > 256, 'Test setup error: stdout should be > 256 chars'
print('get_stage_output returns full output ✓')
"
```
