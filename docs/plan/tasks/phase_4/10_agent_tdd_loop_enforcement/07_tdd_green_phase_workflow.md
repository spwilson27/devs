# Task: Implement TDD Green Phase Workflow — Implement Until Test Passes Protocol (Sub-Epic: 10_Agent TDD Loop Enforcement)

## Covered Requirements
- [3_MCP_DESIGN-REQ-031], [3_MCP_DESIGN-REQ-034], [3_MCP_DESIGN-REQ-035]

## Dependencies
- depends_on: [05_failure_classification_lookup_table.md, 06_tdd_red_phase_workflow.md]
- shared_components: [devs-mcp, devs-scheduler, devs-config, devs-core]

## 1. Initial Test Written

- [ ] Create an E2E test file `tests/mcp_tdd_green_e2e.rs` with the following tests:

**Test 1: `tdd_green_workflow_implements_and_verifies_test_passes`**
```rust
// Covers: [3_MCP_DESIGN-REQ-031], [3_MCP_DESIGN-REQ-035]
#[tokio::test]
async fn tdd_green_workflow_implements_and_verifies_test_passes() {
    let server = TestServer::builder()
        .with_workflow("tdd-green")
        .with_mock_agent(MockAgent::new()
            .exit_code(0)
            .stdout("test tests::test_new_feature ... ok"))
        .build()
        .await;

    let run_id = server
        .submit_run("tdd-green", hashmap! {
            "test_name" => "tests::test_new_feature",
            "prompt_file" => ".devs/prompts/implement-new-feature.md",
        }, Some("tdd-green-test-001"))
        .await
        .unwrap();

    let run = server.wait_for_terminal_status(run_id.clone()).await;

    // Verify: Run completed successfully
    assert_eq!(run.status, RunStatus::Completed);

    // Verify: Stage output confirms test passed
    let output = server.get_stage_output(&run_id, "run-test").await;
    assert_eq!(output.exit_code, Some(0));
    assert!(output.structured.is_some());
    assert_eq!(output.structured.unwrap()["green_phase_status"], "test_passed");

    // Verify: Agent read full stdout before declaring green phase complete
    let audit = server.get_audit_log(run_id.clone()).await;
    assert!(audit.contains_tool_call("get_stage_output"));
}
```

**Test 2: `tdd_green_workflow_handles_implementation_failure_and_retries`**
```rust
// Covers: [3_MCP_DESIGN-REQ-031], [3_MCP_DESIGN-REQ-034]
#[tokio::test]
async fn tdd_green_workflow_handles_implementation_failure_and_retries() {
    // First attempt: implementation fails (exit code 1)
    // Second attempt: implementation succeeds (exit code 0)
    let mut mock_agent = MockAgent::new();
    mock_agent
        .expect_call()
        .times(1)
        .returning(|| MockProcess::new(1, "", "error: compilation failed"));
    mock_agent
        .expect_call()
        .times(1)
        .returning(|| MockProcess::new(0, "test ... ok", ""));

    let server = TestServer::builder()
        .with_workflow("tdd-green")
        .with_mock_agent(mock_agent)
        .with_retry_enabled(true)
        .build()
        .await;

    let run_id = server
        .submit_run("tdd-green", hashmap! {
            "test_name" => "tests::test_implementation",
            "prompt_file" => ".devs/prompts/implement.md",
        }, Some("tdd-green-retry"))
        .await
        .unwrap();

    let run = server.wait_for_terminal_status(run_id.clone()).await;

    // Verify: Run eventually completed after retry
    assert_eq!(run.status, RunStatus::Completed);

    // Verify: Agent followed diagnostic sequence on first failure
    let audit = server.get_audit_log(run_id.clone()).await;
    let failure_calls = audit.find_all_tool_calls("get_stage_output");
    assert!(!failure_calls.is_empty()); // Agent read failure diagnostics

    // Verify: Failure was classified correctly
    let classification = failure_calls[0].response.classification.clone();
    assert_eq!(classification, Some("compilation_error"));
}
```

**Test 3: `tdd_green_workflow_blocks_speculative_edits_without_full_diagnostics`**
```rust
// Covers: [3_MCP_DESIGN-REQ-035]
#[tokio::test]
async fn tdd_green_workflow_blocks_speculative_edits_without_full_diagnostics() {
    let server = TestServer::builder()
        .with_workflow("tdd-green")
        .with_mock_agent(MockAgent::new().exit_code(1).stderr("error: mismatched types"))
        .with_speculative_edit_enforcement(true)
        .build()
        .await;

    let run_id = server
        .submit_run("tdd-green", hashmap! {
            "test_name" => "tests::test_feature",
            "prompt_file" => ".devs/prompts/implement.md",
        }, Some("tdd-green-speculative"))
        .await
        .unwrap();

    // Simulate agent attempting write_file without reading full diagnostics
    let result = server
        .call_tool("write_file", json!({
            "path": "src/lib.rs",
            "content": "// speculative fix"
        }))
        .await;

    // Verify: Write is blocked or flagged because get_stage_output wasn't called
    assert!(result.is_err() || result.unwrap().warnings.contains("speculative_edit"));

    // Now agent reads full diagnostics
    let _ = server.get_stage_output(&run_id, "run-test").await;

    // Retry write — should succeed now
    let result = server
        .call_tool("write_file", json!({
            "path": "src/lib.rs",
            "content": "// informed fix"
        }))
        .await;
    assert!(result.is_ok());
}
```

**Test 4: `tdd_green_workflow_max_retries_exceeded_fails_run`**
```rust
// Covers: [3_MCP_DESIGN-REQ-031], [3_MCP_DESIGN-REQ-034]
#[tokio::test]
async fn tdd_green_workflow_max_retries_exceeded_fails_run() {
    // Mock agent that always fails
    let server = TestServer::builder()
        .with_workflow("tdd-green")
        .with_mock_agent(MockAgent::new().exit_code(1).stderr("error: always fails"))
        .with_max_retries(3)
        .build()
        .await;

    let run_id = server
        .submit_run("tdd-green", hashmap! {
            "test_name" => "tests::test_feature",
            "prompt_file" => ".devs/prompts/implement.md",
        }, Some("tdd-green-max-retries"))
        .await
        .unwrap();

    let run = server.wait_for_terminal_status(run_id.clone()).await;

    // Verify: Run failed after max retries exceeded
    assert_eq!(run.status, RunStatus::Failed);

    // Verify: Agent classified each failure before retry
    let audit = server.get_audit_log(run_id.clone()).await;
    let failure_calls = audit.find_all_tool_calls("get_stage_output");
    assert_eq!(failure_calls.len(), 3); // One per retry attempt
}
```

- [ ] Run `cargo test --test mcp_tdd_green_e2e -- --nocapture` to verify tests compile but fail (red).

## 2. Task Implementation

- [ ] Implement the `tdd-green` workflow TOML file at `.devs/workflows/tdd-green.toml`:

```toml
[workflow]
name = "tdd-green"
description = "TDD Green Phase — implement code until test passes"
timeout_secs = 600

[[input]]
name     = "test_name"
type     = "string"
required = true
description = "Name of the test to run (e.g., 'tests::test_new_feature')"

[[input]]
name     = "prompt_file"
type     = "string"
required = true
description = "Path to the prompt file describing what to implement"

[[stage]]
name        = "implement-and-test"
pool        = "primary"
prompt_file = ".devs/prompts/tdd-green-implement.md"
completion  = "structured_output"
timeout_secs = 300
max_retries = 3
retry_backoff_secs = 10

[stage.output_schema]
exit_code = "integer"
test_name = "string"
passed = "boolean"
green_phase_status = "string"
failure_category = "string"
retry_count = "integer"
```

- [ ] Create the prompt template `.devs/prompts/tdd-green-implement.md`:

```markdown
<!-- devs-prompt: tdd-green-implement -->

# TDD Green Phase — Implementation

## Task
Implement the code required to make the test `{{workflow.input.test_name}}` pass.

## Instructions
1. Run the test using `cargo test {{workflow.input.test_name}} 2>&1`.
2. If the test fails:
   a. Call `get_stage_output` to read the full stdout and stderr.
   b. Classify the failure using the failure classification table.
   c. Apply a targeted fix based on the failure category.
   d. Retry the test.
3. Repeat until the test passes or max retries (3) is exceeded.
4. Write structured output to `.devs_output.json`:
   ```json
   {
     "exit_code": <exit_code>,
     "test_name": "{{workflow.input.test_name}}",
     "passed": <true|false>,
     "green_phase_status": "<test_passed|max_retries_exceeded>",
     "failure_category": "<compilation_error|test_failure|none>",
     "retry_count": <n>
   }
   ```

## Important
- **MANDATORY**: Read the full stderr and stdout before writing any code fix.
- **MANDATORY**: Classify the failure using the failure classification table before applying a fix.
- Do NOT make speculative changes — every edit must be based on full diagnostic information.
- If max retries is exceeded, set `passed: false` and `green_phase_status: "max_retries_exceeded"`.
```

- [ ] Implement retry logic in `crates/devs-scheduler/src/dag_scheduler.rs`:
  - Add `max_retries` and `retry_backoff_secs` fields to `StageConfig`.
  - Implement retry counter that tracks attempts per stage.
  - On stage failure with retries remaining: wait `retry_backoff_secs`, then re-spawn agent.
  - On max retries exceeded: transition stage to `Failed` with structured output indicating exhaustion.
  - Add `// Covers: [3_MCP_DESIGN-REQ-031]` annotation on the retry logic.

- [ ] Implement speculative edit prevention in `crates/devs-mcp/src/tools/filesystem.rs`:
  - Track the last `get_stage_output` call timestamp per session.
  - When `write_file` is called, check if diagnostics were read recently (within last 60 seconds).
  - If not, return a warning: `"warning": "speculative_edit: consider reading full diagnostics first"`.
  - Add `// Covers: [3_MCP_DESIGN-REQ-035]` annotation.

- [ ] Implement the structured output parser for `tdd-green` in `crates/devs-scheduler/src/stage_output.rs`:
  - Add `TddGreenOutput` struct with fields matching the schema.
  - Implement `From<ProcessOutput>` that parses test output and tracks retry count.

## 3. Code Review

- [ ] Verify that the retry logic correctly tracks attempts and respects `max_retries`.
- [ ] Ensure that the backoff delay is applied between retries (not before the first attempt).
- [ ] Verify that the speculative edit warning is non-blocking (warning, not error) to allow human override.
- [ ] Check that the structured output schema includes all fields asserted in the E2E tests.
- [ ] Confirm that the failure classification from [3_MCP_DESIGN-REQ-034] is used in the retry decision.

## 4. Run Automated Tests to Verify

- [ ] Run the E2E tests:
  ```
  cargo test --test mcp_tdd_green_e2e -- --nocapture
  ```
  All 4 tests must pass (green).

- [ ] Run the unit tests for retry logic:
  ```
  cargo test -p devs-scheduler retry
  ```

- [ ] Run the full test suite:
  ```
  ./do test
  ```
  No regressions.

## 5. Update Documentation

- [ ] Update `docs/plan/specs/3_mcp_design.md` section §3.2.2 to include the structured output schema for `tdd-green`.
- [ ] Document the retry configuration in the workflow definition spec.
- [ ] Add the TDD green phase protocol to the agent "memory" (GEMINI.md or equivalent).

## 6. Automated Verification

- [ ] Run traceability verification:
  ```
  python3 .tools/verify_requirements.py --ids 3_MCP_DESIGN-REQ-031,3_MCP_DESIGN-REQ-034,3_MCP_DESIGN-REQ-035
  ```
  All three IDs must be reported as "covered".

- [ ] Run `./do coverage` and verify:
  - `crates/devs-scheduler/src/dag_scheduler.rs` (retry logic) has ≥ 90% coverage.
  - `crates/devs-mcp/src/tools/filesystem.rs` (speculative edit prevention) has ≥ 90% coverage.

- [ ] Run `./do presubmit` and confirm the TDD green workflow is listed and parseable.
