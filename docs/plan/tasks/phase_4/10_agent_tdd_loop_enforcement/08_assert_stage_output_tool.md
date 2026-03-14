# Task: Implement assert_stage_output Tool for Presubmit-Check Verification (Sub-Epic: 10_Agent TDD Loop Enforcement)

## Covered Requirements
- [3_MCP_DESIGN-REQ-031]

## Dependencies
- depends_on: ["01_define_core_tdd_workflows.md", "05_failure_classification_lookup_table.md"]
- shared_components: [devs-mcp, devs-scheduler, devs-proto]

## 1. Initial Test Written

- [ ] Create an integration test file `crates/devs-mcp/tests/assert_stage_output_e2e.rs` with the following tests:

**Test 1: `assert_stage_output_succeeds_when_all_assertions_pass`**
```rust
// Covers: [3_MCP_DESIGN-REQ-031]
#[tokio::test]
async fn assert_stage_output_succeeds_when_all_assertions_pass() {
    let server = TestServer::builder()
        .with_workflow("presubmit-check")
        .with_mock_agents_all_success()
        .build()
        .await;

    let run_id = server
        .submit_run("presubmit-check", hashmap! {}, Some("presubmit-assert-test"))
        .await
        .unwrap();

    // Wait for all stages to complete
    server.wait_for_terminal_status(run_id.clone()).await;

    // Assert on each stage output using various operators
    let assertions = vec![
        // format-check stage: exit_code == 0
        ("format-check", "exit_code", "eq", 0),
        // clippy stage: exit_code == 0
        ("clippy", "exit_code", "eq", 0),
        // test-and-traceability: structured.gates[0].passed == true
        ("test-and-traceability", "structured.gates[0].passed", "eq", true),
        // coverage: structured.gates[0].passed == true
        ("coverage", "structured.gates[0].passed", "eq", true),
        // doc-check: exit_code == 0
        ("doc-check", "exit_code", "eq", 0),
    ];

    for (stage_name, field, op, expected) in assertions {
        let result = server
            .call_tool("assert_stage_output", json!({
                "run_id": run_id,
                "stage_name": stage_name,
                "assertions": [
                    {"field": field, "op": op, "value": expected}
                ]
            }))
            .await;

        assert!(result.is_ok(), "assertion failed for stage {}: {}", stage_name, result.unwrap_err());
    }
}
```

**Test 2: `assert_stage_output_fails_with_actionable_error_on_assertion_failure`**
```rust
// Covers: [3_MCP_DESIGN-REQ-031]
#[tokio::test]
async fn assert_stage_output_fails_with_actionable_error_on_assertion_failure() {
    let server = TestServer::builder()
        .with_workflow("presubmit-check")
        .with_mock_agent_for_stage("coverage", MockAgent::new()
            .exit_code(0)
            .structured_output(json!({
                "gates": [
                    {"name": "unit_coverage", "passed": false, "actual": 0.75, "required": 0.80}
                ]
            })))
        .build()
        .await;

    let run_id = server
        .submit_run("presubmit-check", hashmap! {}, Some("presubmit-assert-fail"))
        .await
        .unwrap();

    server.wait_for_terminal_status(run_id.clone()).await;

    // Assert on coverage stage — should fail
    let result = server
        .call_tool("assert_stage_output", json!({
            "run_id": run_id,
            "stage_name": "coverage",
            "assertions": [
                {"field": "structured.gates[0].passed", "op": "eq", "value": true}
            ]
        }))
        .await;

    assert!(result.is_err());
    let err = result.unwrap_err();

    // Verify: Error message includes actual value and field path
    assert!(err.message.contains("Assertion failed"));
    assert!(err.message.contains("structured.gates[0].passed"));
    assert!(err.message.contains("expected: true"));
    assert!(err.message.contains("actual: false"));
    assert!(err.message.contains("actual_snippet")); // Includes snippet of full output
}
```

**Test 3: `assert_stage_output_returns_failed_precondition_if_stage_not_terminal`**
```rust
// Covers: [3_MCP_DESIGN-REQ-031]
#[tokio::test]
async fn assert_stage_output_returns_failed_precondition_if_stage_not_terminal() {
    let server = TestServer::builder()
        .with_workflow("presubmit-check")
        .with_slow_mock_agent() // Agent takes 30 seconds
        .build()
        .await;

    let run_id = server
        .submit_run("presubmit-check", hashmap! {}, Some("presubmit-assert-early"))
        .await
        .unwrap();

    // Try to assert before stage completes
    tokio::time::sleep(Duration::from_secs(5)).await;

    let result = server
        .call_tool("assert_stage_output", json!({
            "run_id": run_id,
            "stage_name": "format-check",
            "assertions": [
                {"field": "exit_code", "op": "eq", "value": 0}
            ]
        }))
        .await;

    assert!(result.is_err());
    let err = result.unwrap_err();
    assert_eq!(err.code, "FAILED_PRECONDITION");
    assert!(err.message.contains("stage is not in terminal status"));
}
```

**Test 4: `assert_stage_output_supports_all_assertion_operators`**
```rust
// Covers: [3_MCP_DESIGN-REQ-031]
#[tokio::test]
async fn assert_stage_output_supports_all_assertion_operators() {
    let server = TestServer::builder()
        .with_workflow("presubmit-check")
        .with_mock_agents_all_success()
        .build()
        .await;

    let run_id = server
        .submit_run("presubmit-check", hashmap! {}, Some("presubmit-assert-ops"))
        .await
        .unwrap();

    server.wait_for_terminal_status(run_id.clone()).await;

    // Test eq operator
    let result = server
        .call_tool("assert_stage_output", json!({
            "run_id": run_id,
            "stage_name": "clippy",
            "assertions": [
                {"field": "exit_code", "op": "eq", "value": 0}
            ]
        }))
        .await;
    assert!(result.is_ok(), "eq operator failed");

    // Test ne operator
    let result = server
        .call_tool("assert_stage_output", json!({
            "run_id": run_id,
            "stage_name": "clippy",
            "assertions": [
                {"field": "exit_code", "op": "ne", "value": 1}
            ]
        }))
        .await;
    assert!(result.is_ok(), "ne operator failed");

    // Test contains operator
    let result = server
        .call_tool("assert_stage_output", json!({
            "run_id": run_id,
            "stage_name": "format-check",
            "assertions": [
                {"field": "stdout", "op": "contains", "value": "Formatted"}
            ]
        }))
        .await;
    assert!(result.is_ok(), "contains operator failed");

    // Test not_contains operator
    let result = server
        .call_tool("assert_stage_output", json!({
            "run_id": run_id,
            "stage_name": "format-check",
            "assertions": [
                {"field": "stderr", "op": "not_contains", "value": "error"}
            ]
        }))
        .await;
    assert!(result.is_ok(), "not_contains operator failed");

    // Test json_path_eq operator
    let result = server
        .call_tool("assert_stage_output", json!({
            "run_id": run_id,
            "stage_name": "coverage",
            "assertions": [
                {"field": "structured", "op": "json_path_eq", "path": "$.gates[0].passed", "value": true}
            ]
        }))
        .await;
    assert!(result.is_ok(), "json_path_eq operator failed");

    // Test json_path_exists operator
    let result = server
        .call_tool("assert_stage_output", json!({
            "run_id": run_id,
            "stage_name": "coverage",
            "assertions": [
                {"field": "structured", "op": "json_path_exists", "path": "$.gates"}
            ]
        }))
        .await;
    assert!(result.is_ok(), "json_path_exists operator failed");

    // Test json_path_not_exists operator
    let result = server
        .call_tool("assert_stage_output", json!({
            "run_id": run_id,
            "stage_name": "coverage",
            "assertions": [
                {"field": "structured", "op": "json_path_not_exists", "path": "$.errors"}
            ]
        }))
        .await;
    assert!(result.is_ok(), "json_path_not_exists operator failed");
}
```

**Test 5: `assert_stage_output_evaluates_all_assertions_even_if_earlier_fail`**
```rust
// Covers: [3_MCP_DESIGN-REQ-031]
#[tokio::test]
async fn assert_stage_output_evaluates_all_assertions_even_if_earlier_fail() {
    let server = TestServer::builder()
        .with_workflow("presubmit-check")
        .with_mock_agents_all_success()
        .build()
        .await;

    let run_id = server
        .submit_run("presubmit-check", hashmap! {}, Some("presubmit-assert-multi"))
        .await
        .unwrap();

    server.wait_for_terminal_status(run_id.clone()).await;

    // Multiple assertions — some pass, some fail
    let result = server
        .call_tool("assert_stage_output", json!({
            "run_id": run_id,
            "stage_name": "coverage",
            "assertions": [
                {"field": "exit_code", "op": "eq", "value": 0},      // passes
                {"field": "structured.gates[0].passed", "op": "eq", "value": false}, // fails
                {"field": "stdout", "op": "contains", "value": "test"} // passes
            ]
        }))
        .await;

    assert!(result.is_err());
    let err = result.unwrap_err();

    // Verify: Error includes all failing assertions (not just the first)
    assert!(err.message.contains("1 of 3 assertions failed"));
    assert!(err.message.contains("structured.gates[0].passed"));
}
```

- [ ] Run `cargo test --test assert_stage_output_e2e -- --nocapture` to verify tests compile but fail (red).

## 2. Task Implementation

- [ ] Implement the `assert_stage_output` MCP tool in `crates/devs-mcp/src/tools/testing.rs`:

```rust
/// Request parameters for assert_stage_output
#[derive(Debug, Clone, Deserialize)]
pub struct AssertStageOutputRequest {
    pub run_id: String,
    pub stage_name: String,
    pub assertions: Vec<Assertion>,
}

/// Single assertion with operator and expected value
#[derive(Debug, Clone, Deserialize)]
pub struct Assertion {
    pub field: String,
    pub op: AssertionOperator,
    pub value: serde_json::Value,
    #[serde(default)]
    pub path: Option<String>, // For JSONPath operators
}

/// Supported assertion operators
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AssertionOperator {
    Eq,
    Ne,
    Contains,
    NotContains,
    Matches,
    JsonPathEq,
    JsonPathExists,
    JsonPathNotExists,
}

/// Response from assert_stage_output
#[derive(Debug, Clone, Serialize)]
pub struct AssertStageOutputResponse {
    pub run_id: String,
    pub stage_name: String,
    pub passed: bool,
    pub results: Vec<AssertionResult>,
    pub actual_snippet: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AssertionResult {
    pub field: String,
    pub op: String,
    pub expected: serde_json::Value,
    pub actual: serde_json::Value,
    pub passed: bool,
}

/// Assert stage output tool implementation
/// Covers: [3_MCP_DESIGN-REQ-031]
pub async fn assert_stage_output(
    ctx: ToolContext,
    req: AssertStageOutputRequest,
) -> Result<AssertStageOutputResponse, McpError> {
    // 1. Get run state and verify stage is terminal
    let run = ctx.scheduler.get_run(&req.run_id).await?;
    let stage = run
        .stages
        .iter()
        .find(|s| s.name == req.stage_name)
        .ok_or_else(|| McpError::not_found(format!("stage {} not found", req.stage_name)))?;

    if !stage.status.is_terminal() {
        return Err(McpError::failed_precondition(
            format!("stage {} is not in terminal status (current: {:?})", req.stage_name, stage.status)
        ));
    }

    // 2. Get full stage output
    let output = ctx.scheduler.get_stage_output(&req.run_id, &req.stage_name).await?;

    // 3. Evaluate all assertions
    let mut results = Vec::new();
    let mut all_passed = true;

    for assertion in &req.assertions {
        let actual = extract_field(&output, &assertion.field)?;
        let passed = evaluate_operator(&actual, &assertion.op, &assertion.value, assertion.path.as_deref())?;

        results.push(AssertionResult {
            field: assertion.field.clone(),
            op: format!("{:?}", assertion.op),
            expected: assertion.value.clone(),
            actual,
            passed,
        });

        if !passed {
            all_passed = false;
        }
    }

    // 4. Build response with snippet
    let actual_snippet = build_snippet(&output, 500); // First 500 chars

    Ok(AssertStageOutputResponse {
        run_id: req.run_id,
        stage_name: req.stage_name,
        passed: all_passed,
        results,
        actual_snippet,
    })
}
```

- [ ] Implement the JSONPath evaluation logic using `jsonpath-rust` crate:
  - Add `jsonpath-rust = "0.7"` to `crates/devs-mcp/Cargo.toml`.
  - Implement `evaluate_json_path(value: &Value, path: &str) -> Result<Value>` function.
  - Support `$` root reference and array indexing (`$.gates[0].passed`).

- [ ] Implement field extraction helper:
  - `extract_field(output: &StageOutput, field_path: &str) -> Result<Value>` — supports `exit_code`, `stdout`, `stderr`, `structured.field.subfield`.

- [ ] Implement operator evaluation:
  - `evaluate_operator(actual: &Value, op: &AssertionOperator, expected: &Value, json_path: Option<&str>) -> Result<bool>`.
  - Support all 7 operators: `eq`, `ne`, `contains`, `not_contains`, `matches`, `json_path_eq`, `json_path_exists`, `json_path_not_exists`.

- [ ] Register the tool in `crates/devs-mcp/src/server.rs`:
  - Add `assert_stage_output` to the MCP tool registry.
  - Document the tool in the MCP server capabilities.

- [ ] Add `// Covers: [3_MCP_DESIGN-REQ-031]` annotation on the `assert_stage_output` function.

## 3. Code Review

- [ ] Verify that the tool acquires a read lock on scheduler state (not write lock) to avoid blocking other operations.
- [ ] Ensure that all assertions are evaluated even if earlier ones fail (no short-circuit).
- - [ ] Verify that the error message includes actionable information: field path, expected value, actual value, and snippet.
- [ ] Check that JSONPath evaluation handles missing paths gracefully (returns `null`, not panic).
- [ ] Confirm that the `actual_snippet` is truncated to a reasonable length (500 chars) to avoid flooding context.

## 4. Run Automated Tests to Verify

- [ ] Run the E2E tests:
  ```
  cargo test --test assert_stage_output_e2e -- --nocapture
  ```
  All 5 tests must pass (green).

- [ ] Run the unit tests for operator evaluation:
  ```
  cargo test -p devs-mcp assert_stage_output
  ```

- [ ] Run the full test suite:
  ```
  ./do test
  ```
  No regressions.

## 5. Update Documentation

- [ ] Update `docs/plan/specs/3_mcp_design.md` section §5.x (MCP Tools) to document `assert_stage_output`:
  - Request parameters: `run_id`, `stage_name`, `assertions[]`.
  - Response format: `passed`, `results[]`, `actual_snippet`.
  - Supported operators: `eq`, `ne`, `contains`, `not_contains`, `matches`, `json_path_eq`, `json_path_exists`, `json_path_not_exists`.
  - Error conditions: `FAILED_PRECONDITION` if stage not terminal.

- [ ] Add example usage to the agent "memory" (GEMINI.md):
  ```
  // Wait for presubmit-check to complete, then assert all gates pass:
  await mcp.call("assert_stage_output", {
    run_id: "...",
    stage_name: "coverage",
    assertions: [
      {field: "structured.gates[0].passed", op: "eq", value: true}
    ]
  });
  ```

## 6. Automated Verification

- [ ] Run traceability verification:
  ```
  python3 .tools/verify_requirements.py --ids 3_MCP_DESIGN-REQ-031
  ```
  The ID must be reported as "covered".

- [ ] Run `./do coverage` and verify:
  - `crates/devs-mcp/src/tools/testing.rs` (assert_stage_output) has ≥ 90% coverage.

- [ ] Run `./do presubmit` and confirm the tool is registered and callable via MCP.
