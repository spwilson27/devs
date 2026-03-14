# Task: Implement TDD Red Phase Workflow — Write Failing Test First Protocol (Sub-Epic: 10_Agent TDD Loop Enforcement)

## Covered Requirements
- [3_MCP_DESIGN-REQ-031], [3_MCP_DESIGN-REQ-035]

## Dependencies
- depends_on: ["01_define_core_tdd_workflows.md", "07_agent_diagnostic_behaviors/03_failure_classification_and_targeted_fix.md"]
- shared_components: [devs-mcp, devs-cli, devs-config]

## 1. Initial Test Written

- [ ] Create an E2E test file `tests/mcp_tdd_red_e2e.rs` with the following tests:

**Test 1: `tdd_red_workflow_submits_and_confirms_test_failure`**
```rust
// Covers: [3_MCP_DESIGN-REQ-031], [3_MCP_DESIGN-REQ-035]
#[tokio::test]
async fn tdd_red_workflow_submits_and_confirms_test_failure() {
    // Setup: Start in-process devs server with tdd-red workflow registered
    let server = TestServer::builder()
        .with_workflow("tdd-red")
        .with_mock_agent(MockAgent::new().exit_code(1)) // Test fails in red phase
        .build()
        .await;

    // Submit tdd-red run with test_name and prompt_file inputs
    let run_id = server
        .submit_run(
            "tdd-red",
            hashmap! {
                "test_name" => "tests::test_new_feature",
                "prompt_file" => ".devs/prompts/implement-new-feature.md",
            },
            Some("tdd-red-test-001"),
        )
        .await
        .expect("submit failed");

    // Wait for run to reach terminal status
    let run = server.wait_for_terminal_status(run_id.clone()).await;

    // Verify: Run completed (not failed) — red phase expects test to fail
    assert_eq!(run.status, RunStatus::Completed);

    // Verify: Single stage completed
    let stages = run.stages;
    assert_eq!(stages.len(), 1);
    assert_eq!(stages[0].status, StageStatus::Completed);

    // Verify: Stage output confirms test failure (expected in red phase)
    let output = server.get_stage_output(&run_id, "run-test").await;
    assert_eq!(output.exit_code, Some(1));
    assert!(output.stderr.contains("FAILED") || output.stderr.contains("assertion"));

    // Verify: Agent read full stderr before declaring red phase complete
    let audit_log = server.get_audit_log(run_id.clone()).await;
    assert!(audit_log.contains_tool_call("get_stage_output"));
    let stage_output_call = audit_log.find_tool_call("get_stage_output").unwrap();
    assert!(!stage_output_call.response.truncated); // Full output read per [3_MCP_DESIGN-REQ-035]
}
```

**Test 2: `tdd_red_phase_blocks_if_test_passes_unexpectedly`**
```rust
// Covers: [3_MCP_DESIGN-REQ-031]
#[tokio::test]
async fn tdd_red_phase_blocks_if_test_passes_unexpectedly() {
    // Setup: Mock agent that exits 0 (test passes) — unexpected in red phase
    let server = TestServer::builder()
        .with_workflow("tdd-red")
        .with_mock_agent(MockAgent::new().exit_code(0))
        .build()
        .await;

    let run_id = server
        .submit_run("tdd-red", hashmap! {
            "test_name" => "tests::test_existing_feature",
            "prompt_file" => ".devs/prompts/test-existing.md",
        }, Some("tdd-red-unexpected-pass"))
        .await
        .unwrap();

    let run = server.wait_for_terminal_status(run_id.clone()).await;

    // Verify: Run completed but with a warning flag in structured output
    let output = server.get_stage_output(&run_id, "run-test").await;
    assert!(output.structured.is_some());
    assert_eq!(output.structured.unwrap()["red_phase_status"], "unexpected_pass");
    // This is a warning, not a failure — agent must investigate why test passed
}
```

**Test 3: `tdd_red_phase_requires_full_stderr_read_before_declaration`**
```rust
// Covers: [3_MCP_DESIGN-REQ-035]
#[tokio::test]
async fn tdd_red_phase_requires_full_stderr_read_before_declaration() {
    let server = TestServer::builder()
        .with_workflow("tdd-red")
        .with_mock_agent(MockAgent::new()
            .exit_code(1)
            .stderr("error: assertion failed\n  at line 42\nfull diagnostics..."))
        .build()
        .await;

    let run_id = server
        .submit_run("tdd-red", hashmap! {
            "test_name" => "tests::test_failure",
            "prompt_file" => ".devs/prompts/test.md",
        }, Some("tdd-red-full-read"))
        .await
        .unwrap();

    server.wait_for_terminal_status(run_id.clone()).await;

    // Verify: Agent called get_stage_output and read full output
    let audit = server.get_audit_log(run_id.clone()).await;
    let get_output_calls = audit.find_all_tool_calls("get_stage_output");
    assert!(!get_output_calls.is_empty());

    // Verify: No write_file or submit_run calls occurred before get_stage_output
    let first_write = audit.find_first_tool_call("write_file");
    let first_read = audit.find_first_tool_call("get_stage_output");
    assert!(first_read.is_some());
    assert!(first_write.is_none() || first_read.unwrap().timestamp < first_write.unwrap().timestamp);
}
```

- [ ] Run `cargo test --test mcp_tdd_red_e2e -- --nocapture` to verify tests compile but fail (red).

## 2. Task Implementation

- [ ] Implement the `tdd-red` workflow TOML file at `.devs/workflows/tdd-red.toml`:

```toml
[workflow]
name = "tdd-red"
description = "TDD Red Phase — write a failing test and verify it fails"
timeout_secs = 300

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
name        = "run-test"
pool        = "primary"
prompt_file = ".devs/prompts/tdd-red-run-test.md"
completion  = "structured_output"
timeout_secs = 270

[stage.output_schema]
exit_code = "integer"
test_name = "string"
passed = "boolean"
failure_category = "string"
```

- [ ] Create the prompt template `.devs/prompts/tdd-red-run-test.md`:

```markdown
<!-- devs-prompt: tdd-red-run-test -->

# TDD Red Phase — Test Execution

## Task
Run the test named `{{workflow.input.test_name}}` and verify it fails as expected.

## Instructions
1. Run the test using `cargo test {{workflow.input.test_name}} 2>&1`.
2. Capture the full stdout and stderr output.
3. Verify the test fails (exit code 1 or test output contains "FAILED").
4. Write structured output to `.devs_output.json`:
   ```json
   {
     "exit_code": <exit_code>,
     "test_name": "{{workflow.input.test_name}}",
     "passed": <true|false>,
     "failure_category": "<compilation_error|test_failure|unexpected_pass>"
   }
   ```

## Important
- If the test passes unexpectedly, set `passed: true` and `failure_category: "unexpected_pass"`.
- Read the full stderr before writing any output — do not make speculative conclusions.
- This is the red phase: we expect the test to fail. If it passes, something is wrong.
```

- [ ] Implement the structured output parser in `crates/devs-scheduler/src/stage_output.rs`:
  - Add `TddRedOutput` struct with fields matching the schema.
  - Implement `From<ProcessOutput>` for `TddRedOutput` that parses test output and classifies failure.

- [ ] Implement audit logging in `crates/devs-mcp/src/audit_log.rs`:
  - Track all tool calls with timestamps, request params, and responses.
  - Add `get_audit_log(run_id: String) -> Vec<AuditEntry>` tool for retrieving call history.
  - Add `// Covers: [3_MCP_DESIGN-REQ-035]` annotation on the audit log recording logic.

- [ ] Implement the "full output read" enforcement in `crates/devs-mcp/src/tools/observation.rs`:
  - When `get_stage_output` is called, set a flag in the audit log.
  - Track whether the response was truncated (`truncated: bool`).
  - Add `// Covers: [3_MCP_DESIGN-REQ-035]` annotation.

## 3. Code Review

- [ ] Verify that the `tdd-red` workflow correctly expects test failure (exit code 1) as a successful red phase.
- [ ] Ensure that the audit log captures all tool calls in order with accurate timestamps.
- [ ] Verify that the structured output schema matches what the E2E tests assert.
- [ ] Check that the prompt template includes the mandatory `<!-- devs-prompt: ... -->` header.
- [ ] Confirm that the "full output read" enforcement does not block legitimate workflows (it should warn, not fail).

## 4. Run Automated Tests to Verify

- [ ] Run the E2E test:
  ```
  cargo test --test mcp_tdd_red_e2e -- --nocapture
  ```
  All 3 tests must pass (green).

- [ ] Run the unit tests for structured output parsing:
  ```
  cargo test -p devs-scheduler stage_output
  ```

- [ ] Run the full test suite:
  ```
  ./do test
  ```
  No regressions.

## 5. Update Documentation

- [ ] Update `docs/plan/specs/3_mcp_design.md` section §3.2.1 to include the structured output schema for `tdd-red`.
- [ ] Document the audit log tool in the MCP tools section (§5.x).
- [ ] Add the TDD red phase protocol to the agent "memory" (GEMINI.md or equivalent).

## 6. Automated Verification

- [ ] Run traceability verification:
  ```
  python3 .tools/verify_requirements.py --ids 3_MCP_DESIGN-REQ-031,3_MCP_DESIGN-REQ-035
  ```
  Both IDs must be reported as "covered".

- [ ] Run `./do coverage` and verify:
  - `crates/devs-mcp/src/audit_log.rs` has ≥ 90% coverage.
  - `crates/devs-scheduler/src/stage_output.rs` has ≥ 90% coverage.

- [ ] Run `./do presubmit` and confirm the TDD red workflow is listed and parseable.
