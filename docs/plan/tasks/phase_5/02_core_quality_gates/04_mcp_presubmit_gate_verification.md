# Task: MCP Presubmit Gate Verification (Sub-Epic: 02_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-082]

## Dependencies
- depends_on: ["03_mcp_assertion_snippet_truncation.md"]
- shared_components: [devs-mcp, devs-scheduler, ./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written

### Test 1: E2E Test for Completed Run with Failed Gates
- [ ] Create an E2E test file `crates/devs-mcp/tests/e2e_presubmit_protocol.rs`:

```rust
/// E2E tests for presubmit gate verification protocol.
/// 
/// Covers: [3_MCP_DESIGN-REQ-082]
/// 
/// An agent MUST call assert_stage_output on every stage of presubmit-check
/// individually. A run status of "completed" is necessary but not sufficient —
/// structured-output stages report "completed" when the agent process exits
/// cleanly, regardless of whether individual coverage gates passed.

#[cfg(test)]
mod e2e_presubmit_tests {
    use crate::e2e::TestHarness;
    use devs_mcp::tools::{submit_run, assert_stage_output, get_run};
    use devs_scheduler::WorkflowRunState;

    #[tokio::test]
    async fn test_completed_run_with_failed_coverage_gate_requires_assert_stage_output() {
        // Setup: Start test harness with MCP server
        let harness = TestHarness::new().await;
        
        // Create a mock presubmit-check workflow with a coverage stage
        // that exits cleanly (exit_code=0) but has failed gate in structured output
        let workflow_def = r#"
[workflow]
name = "presubmit-test"

[[stage]]
name = "coverage"
pool = "test"
prompt = "Run coverage checks"
completion = "structured_output"
"#;
        
        harness.write_workflow("presubmit-test", workflow_def).await;
        
        // Submit the workflow run
        let submit_result = submit_run(
            &harness.mcp_client,
            "presubmit-test",
            None,  // run name
            HashMap::new(),  // inputs
        ).await;
        
        let run_id = submit_result.run_id;
        
        // Wait for run to complete
        let mut run_state = harness.wait_for_run_state(&run_id, WorkflowRunState::Completed).await;
        
        // Verify: Run status is "completed" (agent exited cleanly)
        assert_eq!(
            run_state.status,
            WorkflowRunState::Completed,
            "Run should complete successfully"
        );
        
        // Verify: Stage status is also "completed"
        let coverage_stage = run_state.stages.iter()
            .find(|s| s.name == "coverage")
            .expect("coverage stage should exist");
        
        assert_eq!(
            coverage_stage.status,
            StageRunState::Completed,
            "Coverage stage should be completed"
        );
        
        // NOW: Call assert_stage_output to check the actual gate result
        // The stage's structured output contains {"overall_passed": false}
        let assertion_result = assert_stage_output(
            &harness.mcp_client,
            &run_id,
            "coverage",
            vec![Assertion {
                field: "output.overall_passed".to_string(),
                op: AssertionOp::Eq,
                value: serde_json::Value::Bool(true),  // Expecting true
                path: None,
            }],
        ).await;
        
        // Critical verification per [3_MCP_DESIGN-REQ-082]:
        // The assertion must return passed: false even though run/stage are "completed"
        assert!(
            !assertion_result.passed,
            "assert_stage_output must return passed=false for failed gate, \
             even when run status is 'completed'"
        );
        
        // Verify the failure record contains the actual gate value
        assert_eq!(assertion_result.failures.len(), 1);
        let failure = &assertion_result.failures[0];
        assert_eq!(failure.actual_snippet, "false");  // The actual gate value
        assert_eq!(failure.value, serde_json::Value::Bool(true));  // Expected value
        
        // Verify: The failure reason explains the mismatch
        assert!(
            failure.reason.contains("mismatch") || failure.reason.contains("false"),
            "Failure reason should explain the gate failure"
        );
    }

    #[tokio::test]
    async fn test_completed_run_with_passed_coverage_gate() {
        // Setup: Similar to above, but coverage stage passes
        let harness = TestHarness::new().await;
        
        let workflow_def = r#"
[workflow]
name = "presubmit-test-pass"

[[stage]]
name = "coverage"
pool = "test"
prompt = "Run coverage checks"
completion = "structured_output"
"#;
        
        harness.write_workflow("presubmit-test-pass", workflow_def).await;
        
        let submit_result = submit_run(
            &harness.mcp_client,
            "presubmit-test-pass",
            None,
            HashMap::new(),
        ).await;
        
        let run_id = submit_result.run_id;
        let run_state = harness.wait_for_run_state(&run_id, WorkflowRunState::Completed).await;
        
        // Verify run completed
        assert_eq!(run_state.status, WorkflowRunState::Completed);
        
        // Call assert_stage_output expecting the gate to pass
        let assertion_result = assert_stage_output(
            &harness.mcp_client,
            &run_id,
            "coverage",
            vec![Assertion {
                field: "output.overall_passed".to_string(),
                op: AssertionOp::Eq,
                value: serde_json::Value::Bool(true),
                path: None,
            }],
        ).await;
        
        // Verify: Assertion passes when gate actually passed
        assert!(
            assertion_result.passed,
            "assert_stage_output must return passed=true when gate passed"
        );
        assert!(assertion_result.failures.is_empty());
    }

    #[tokio::test]
    async fn test_agent_must_check_all_presubmit_stages_individually() {
        // Setup: Multi-stage presubmit workflow
        let harness = TestHarness::new().await;
        
        let workflow_def = r#"
[workflow]
name = "full-presubmit"

[[stage]]
name = "format-check"
pool = "test"
prompt = "cargo fmt --check"
completion = "exit_code"

[[stage]]
name = "clippy"
pool = "test"
prompt = "cargo clippy"
completion = "exit_code"

[[stage]]
name = "test-and-traceability"
pool = "test"
prompt = "cargo test"
completion = "structured_output"

[[stage]]
name = "coverage"
pool = "test"
prompt = "cargo llvm-cov"
completion = "structured_output"

[[stage]]
name = "doc-check"
pool = "test"
prompt = "cargo doc"
completion = "exit_code"
"#;
        
        harness.write_workflow("full-presubmit", workflow_def).await;
        
        let submit_result = submit_run(
            &harness.mcp_client,
            "full-presubmit",
            None,
            HashMap::new(),
        ).await;
        
        let run_id = submit_result.run_id;
        let run_state = harness.wait_for_run_state(&run_id, WorkflowRunState::Completed).await;
        
        // Verify: All stages completed
        assert_eq!(run_state.stages.len(), 5);
        for stage in &run_state.stages {
            assert_eq!(
                stage.status, StageRunState::Completed,
                "Stage {} should be completed", stage.name
            );
        }
        
        // Per [3_MCP_DESIGN-REQ-082]: Agent MUST call assert_stage_output on EVERY stage
        // This test verifies the protocol by checking each stage individually
        
        let mut all_passed = true;
        let stage_names = ["format-check", "clippy", "test-and-traceability", "coverage", "doc-check"];
        
        for stage_name in &stage_names {
            let assertion = assert_stage_output(
                &harness.mcp_client,
                &run_id,
                stage_name,
                vec![Assertion {
                    field: "exit_code".to_string(),
                    op: AssertionOp::Eq,
                    value: serde_json::Value::Number(0.into()),
                    path: None,
                }],
            ).await;
            
            if !assertion.passed {
                all_passed = false;
                eprintln!("Stage {} failed assertion", stage_name);
            }
        }
        
        // Verify: All stage assertions passed
        assert!(all_passed, "All presubmit stages must pass individual assertions");
    }

    #[tokio::test]
    async fn test_run_completed_but_structured_output_gate_fails() {
        // This test specifically verifies the scenario from [3_MCP_DESIGN-REQ-082]:
        // A stage with completion: structured_output returns valid JSON but with
        // failed internal gate (e.g., {"overall_passed": false})
        
        let harness = TestHarness::new().await;
        
        // Mock agent that exits cleanly but writes failing gate to structured output
        harness.register_mock_agent("failing-coverage-agent", |req| {
            AgentResponse {
                exit_code: 0,  // Clean exit
                stdout: "Coverage: 72%".to_string(),
                stderr: String::new(),
                structured: Some(serde_json::json!({
                    "overall_passed": false,
                    "line_coverage": 0.72,
                    "branch_coverage": 0.65
                })),
            }
        });
        
        let workflow_def = r#"
[workflow]
name = "coverage-fail-test"

[[stage]]
name = "coverage"
pool = "failing-coverage-agent"
prompt = "Run coverage"
completion = "structured_output"
"#;
        
        harness.write_workflow("coverage-fail-test", workflow_def).await;
        
        let submit_result = submit_run(
            &harness.mcp_client,
            "coverage-fail-test",
            None,
            HashMap::new(),
        ).await;
        
        let run_id = submit_result.run_id;
        let run_state = harness.wait_for_run_state(&run_id, WorkflowRunState::Completed).await;
        
        // Verify: Run completed (agent exited cleanly)
        assert_eq!(run_state.status, WorkflowRunState::Completed);
        
        // Verify: Stage completed
        let coverage_stage = &run_state.stages[0];
        assert_eq!(coverage_stage.status, StageRunState::Completed);
        assert_eq!(coverage_stage.exit_code, Some(0));
        
        // Critical test: assert_stage_output must reveal the failed gate
        let assertion_result = assert_stage_output(
            &harness.mcp_client,
            &run_id,
            "coverage",
            vec![Assertion {
                field: "output.overall_passed".to_string(),
                op: AssertionOp::Eq,
                value: serde_json::Value::Bool(true),
                path: None,
            }],
        ).await;
        
        // Per [3_MCP_DESIGN-REQ-082]: This MUST return passed: false
        assert!(
            !assertion_result.passed,
            "assert_stage_output must detect failed gate even when run/stage are 'completed'"
        );
        
        // Verify the actual gate value is in the failure record
        assert_eq!(
            assertion_result.failures[0].actual_snippet,
            "false"
        );
    }
}
```

- [ ] Run the tests to confirm they **fail** (red) before implementation:
```bash
cd /home/mrwilson/software/devs
cargo test -p devs-mcp --test e2e_presubmit_protocol -- --nocapture 2>&1 | tee /tmp/presubmit_e2e_baseline.txt
```

## 2. Task Implementation

### Step 1: Verify assert_stage_output Handles Structured Output Gates
- [ ] Read the current `assert_stage_output` implementation in `crates/devs-mcp/src/tools/`
- [ ] Verify it correctly extracts nested JSON fields (e.g., `output.overall_passed`)

### Step 2: Implement/Verify JSON Path Extraction
- [ ] Ensure the tool supports dot-notation for nested field access:

```rust
/// Extract a nested field from structured output using dot notation.
/// E.g., "output.overall_passed" extracts $.output.overall_passed
/// 
/// Covers: [3_MCP_DESIGN-REQ-082]
fn extract_nested_field(
    structured: &serde_json::Value,
    path: &str,
) -> Result<serde_json::Value, String> {
    let mut current = structured;
    
    for field in path.split('.') {
        current = current.get(field)
            .ok_or_else(|| format!("Field '{}' not found in structured output", field))?;
    }
    
    Ok(current.clone())
}
```

### Step 3: Ensure Completed Status Doesn't Short-Circuit Assertions
- [ ] Verify the assertion logic does NOT check stage/run status before evaluating:

```rust
// INCORRECT - Do NOT do this:
if stage.status != StageRunState::Completed {
    return Err("Stage not completed");
}
if stage.exit_code == Some(0) {
    // WRONG: Don't auto-pass based on exit code!
    return AssertionResult::passed();
}

// CORRECT - Always evaluate assertions against actual output:
let actual_value = extract_field(&stage_output, &assertion.field)?;
let passed = evaluate_assertion(&actual_value, &assertion.op, &assertion.value);
```

- [ ] Add a comment explicitly referencing [3_MCP_DESIGN-REQ-082]:

```rust
// Per [3_MCP_DESIGN-REQ-082]: Run/stage "completed" status is necessary but not
// sufficient. We MUST evaluate assertions against actual structured output,
// not short-circuit based on exit code or status.
```

### Step 4: Update presubmit-check Workflow Definition
- [ ] Ensure the built-in `presubmit-check` workflow uses `structured_output` completion for coverage stage:

```toml
# In workflow definition or registration
[[stage]]
name = "coverage"
pool = "primary"
prompt = "cargo llvm-cov --json"
completion = "structured_output"  # Critical: not "exit_code"
```

- [ ] Verify the coverage stage writes structured JSON with `overall_passed` field:

```rust
// In coverage stage implementation or mock agent
let structured_output = serde_json::json!({
    "overall_passed": line_coverage >= 0.90 && branch_coverage >= 0.80,
    "line_coverage": line_coverage,
    "branch_coverage": branch_coverage,
    "gates": [
        {"name": "line_coverage", "passed": line_coverage >= 0.90},
        {"name": "branch_coverage", "passed": branch_coverage >= 0.80}
    ]
});
```

### Step 5: Add Traceability Comment
- [ ] Add `// Covers: [3_MCP_DESIGN-REQ-082]` to:
  - The field extraction function
  - The assertion evaluation logic
  - The presubmit-check workflow definition

## 3. Code Review

- [ ] Verify that `assert_stage_output` evaluates assertions against actual output values, not status
- [ ] Verify that `exit_code: 0` does NOT cause auto-pass of assertions
- [ ] Verify that `stage.status == Completed` does NOT cause auto-pass of assertions
- [ ] Verify that `run.status == Completed` does NOT cause auto-pass of assertions
- [ ] Verify that nested JSON field extraction works correctly (e.g., `output.overall_passed`)
- [ ] Verify that the presubmit-check workflow's coverage stage uses `structured_output` completion
- [ ] Verify that the coverage stage writes `{"overall_passed": <bool>}` to structured output
- [ ] Verify error messages clearly distinguish between:
  - Stage execution failure (agent crashed)
  - Gate failure (agent ran but gate didn't pass)

## 4. Run Automated Tests to Verify

- [ ] Run the E2E tests:
```bash
cd /home/mrwilson/software/devs
cargo test -p devs-mcp --test e2e_presubmit_protocol -- --nocapture
```

- [ ] Run all MCP tests:
```bash
cargo test -p devs-mcp
```

- [ ] Run a manual presubmit-check and verify with MCP:
```bash
# Submit presubmit-check
./do submit presubmit-check --name test-run

# Wait for completion
./do status test-run

# Call assert_stage_output on each stage via MCP client
# Verify results match actual gate outcomes
```

- [ ] Verify the protocol with a failing coverage scenario:
```bash
# Temporarily lower coverage threshold to force failure
# Run presubmit-check
# Call assert_stage_output on coverage stage
# Verify it returns passed: false despite run status being "completed"
```

## 5. Update Documentation

- [ ] Update `docs/plan/specs/3_mcp_design.md` Section 3.1.2 (Presubmit Protocol):
  - Emphasize that `assert_stage_output` is MANDATORY for every stage
  - Clarify that "completed" status ≠ gate success
  - Add explicit warning about structured_output completion mode

- [ ] Update `docs/plan/summaries/3_mcp_design.md`:
  - Add note about presubmit verification protocol
  - Document the agent workflow for checking all stages

- [ ] Update or create `.tools/prompts/presubmit_verification.md`:

```markdown
# Agent Protocol: Presubmit Verification

**Covers: [3_MCP_DESIGN-REQ-082]**

## Critical Rule

A `presubmit-check` run with `status: "completed"` does NOT guarantee all gates passed.

**You MUST call `assert_stage_output` on EVERY stage individually.**

## Verification Sequence

```
1. submit_run(presubmit-check) → run_id
2. Wait for run status: "completed"
3. For each stage in [format-check, clippy, test-and-traceability, coverage, doc-check]:
   assert_stage_output(
       run_id,
       stage_name,
       assertions: [{field: "exit_code" or "output.overall_passed", op: "eq", value: 0 or true}]
   )
4. If ANY assertion returns passed: false → fix the specific failure
5. Only if ALL assertions return passed: true → presubmit passed
```

## Why This Matters

Stages with `completion: structured_output` report "completed" when the agent
process exits cleanly — regardless of whether the structured output indicates
gate success or failure.

Example:
- Coverage agent exits with code 0 → stage status: "completed"
- But structured output: `{"overall_passed": false, "line_coverage": 0.72}`
- Without `assert_stage_output`, you would incorrectly assume presubmit passed

## Failure Response

If `assert_stage_output` returns `passed: false`:

1. Read the `failures` array for details
2. Call `get_stage_output` for full context if snippet is truncated
3. Fix the specific issue (lint error, test failure, coverage gap)
4. Re-run presubmit-check
5. Repeat verification
```

## 6. Automated Verification

- [ ] Verify that a completed run with failing gate is correctly detected:
```bash
# Run the E2E test that simulates this scenario
cargo test -p devs-mcp test_completed_run_with_failed_coverage_gate -- --nocapture

# Verify the assertion returns passed: false
```

- [ ] Verify that all presubmit stages are checked:
```bash
# Create a test workflow with 5 stages
# Verify assert_stage_output is called 5 times (once per stage)
# Verify all must pass for presubmit to be considered successful
```

- [ ] Verify the distinction between completed and passed:
```bash
# Scenario 1: Stage fails (exit_code != 0)
# → stage.status = "Failed", assert_stage_output not needed

# Scenario 2: Stage completes but gate fails (exit_code = 0, overall_passed = false)
# → stage.status = "Completed", assert_stage_output REQUIRED to detect failure

# Scenario 3: Stage completes and gate passes
# → stage.status = "Completed", assert_stage_output confirms success
```

- [ ] Verify error messages are actionable:
```bash
# Trigger a gate failure
# Inspect assert_stage_output response
# Verify failure record includes:
#   - Which field failed
#   - Expected vs actual value
#   - Human-readable reason
python -c "
import json
with open('assertion_response.json') as f:
    resp = json.load(f)
assert not resp['result']['passed']
assert len(resp['result']['failures']) > 0
failure = resp['result']['failures'][0]
assert 'field' in failure
assert 'op' in failure
assert 'value' in failure
assert 'reason' in failure
assert 'actual_snippet' in failure
print('Failure record has all required fields ✓')
"
```
