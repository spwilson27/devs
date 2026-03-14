# Task: Implement Mandatory Diagnostic Investigation Sequence (Sub-Epic: 07_Agent Diagnostic Behaviors)

## Covered Requirements
- [3_MCP_DESIGN-REQ-027], [3_MCP_DESIGN-REQ-BR-004]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-grpc, Server Discovery Protocol]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-mcp/tests/diagnostic_sequence_tests.rs` that mocks a stage failure and verifies the agent executes the mandatory 4-step investigation sequence before any code edit:
    1. **Step 1**: `get_stage_output(run_id, stage_name)` - retrieves failed stage output (stdout, stderr, exit_code, structured)
    2. **Step 2**: `get_run(run_id)` - retrieves full WorkflowRun record with all StageRun records
    3. **Step 3**: `get_pool_state()` - retrieves pool utilization, rate-limited agents, queued stages
    4. **Step 4**: `list_checkpoints(project_id, run_id)` - retrieves checkpoint commit history for last valid state
- [ ] Use a mock MCP server that records the exact call order and parameters.
- [ ] Assert that NO file write operations (via filesystem MCP) occur before all 4 steps complete.
- [ ] Verify that the sequence is idempotent: running it multiple times produces the same diagnostic context.
- [ ] Test error handling: if any step fails (e.g., `get_run` returns 404), verify the sequence continues with remaining steps and logs which steps failed.

## 2. Task Implementation
- [ ] Implement the diagnostic sequence orchestrator in `crates/devs-cli/src/diagnose/sequence.rs`:
    - `struct DiagnosticSequence` - orchestrates the 4-step investigation
    - `async fn execute(&self, run_id: &str, stage_name: &str) -> Result<DiagnosticContext>` - runs full sequence
    - `DiagnosticContext` struct aggregating all outputs:
        ```rust
        struct DiagnosticContext {
            run_id: String,
            stage_output: Option<StageOutput>,  // None if step 1 failed
            run_record: Option<WorkflowRun>,    // None if step 2 failed
            pool_state: Option<PoolState>,      // None if step 3 failed
            checkpoints: Vec<Checkpoint>,       // Empty if step 4 failed
            failed_steps: Vec<FailedStep>,      // List of steps that failed
        }
        ```
    - `FailedStep` struct: `step_number: u8`, `method_name: String`, `error: String`
- [ ] Implement step 1 (stage output retrieval) in `crates/devs-cli/src/diagnose/step1_stage_output.rs`:
    - `async fn get_stage_output(mcp: &McpClient, run_id: &str, stage_name: &str) -> Result<StageOutput>`
    - Parse response: stdout (UTF-8, ≤1 MiB), stderr (UTF-8, ≤1 MiB), structured (JSON or null), exit_code, log_path, truncated
    - Truncate output to first 50 diagnostic lines for context efficiency (per [3_MCP_DESIGN-REQ-047])
- [ ] Implement step 2 (run record retrieval) in `crates/devs-cli/src/diagnose/step2_run_record.rs`:
    - `async fn get_run(mcp: &McpClient, run_id: &str) -> Result<WorkflowRun>`
    - Extract: workflow_name, status, started_at, completed_at, stages[], inputs, definition_snapshot_path
- [ ] Implement step 3 (pool state retrieval) in `crates/devs-cli/src/diagnose/step3_pool_state.rs`:
    - `async fn get_pool_state(mcp: &McpClient) -> Result<PoolState>`
    - Extract: active_agents, rate_limited_agents[], queued_stages[], semaphore_available
- [ ] Implement step 4 (checkpoint history retrieval) in `crates/devs-cli/src/diagnose/step4_checkpoints.rs`:
    - `async fn list_checkpoints(mcp: &McpClient, project_id: &str, run_id: &str) -> Result<Vec<Checkpoint>>`
    - Extract: checkpoint_id, committed_at, git_sha, workflow_snapshot_path, state_snapshot_path
- [ ] Implement the diagnostic context serializer in `crates/devs-cli/src/diagnose/context_serializer.rs`:
    - `serialize_context(ctx: &DiagnosticContext) -> Result<String>` - outputs human-readable diagnostic summary
    - Format output as structured markdown for agent consumption
- [ ] Enforce the "no speculative edits" rule:
    - Add guard in `crates/devs-cli/src/diagnose/guard.rs`: `check_sequence_completed(ctx: &DiagnosticContext) -> Result<(), DiagnoseError>`
    - This guard must pass before any file write operations are allowed
    - Log: `DIAGNOSTIC_GUARD: Investigation sequence completed, file edits now allowed`

## 3. Code Review
- [ ] Verify that the sequence executes in the exact order: step1 → step2 → step3 → step4.
- [ ] Check that NO file write operations occur before all 4 steps complete (enforced by guard).
- [ ] Ensure the tool uses workspace-relative paths in all MCP calls (per workspace root scoping).
- [ ] Verify that the tool does NOT cache the MCP address across process restarts (per [3_MCP_DESIGN-REQ-BR-004]) - each session re-executes discovery.
- [ ] Confirm that error handling is graceful: if a step fails, the sequence continues and logs the failure.
- [ ] Check that the diagnostic context is comprehensive enough for agent decision-making.
- [ ] Verify that output truncation (50 lines) is applied correctly to avoid context bloat.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-mcp --test diagnostic_sequence_tests` to verify sequence enforcement.
- [ ] Run `cargo test --package devs-cli --lib diagnose` to verify unit tests for each step.
- [ ] Manually test the diagnostic sequence:
    1. Trigger a stage failure in a test workflow
    2. Run the diagnostic sequence tool
    3. Verify all 4 steps execute in order
    4. Verify the diagnostic context output is complete and actionable

## 5. Update Documentation
- [ ] Update `docs/agent_development.md` with the following sections:
    - "Diagnostic Investigation Sequence" - explain the mandatory 4-step sequence
    - "When to Run Diagnostics" - on any stage failure, before attempting a fix
    - "Diagnostic Context Output" - show example output format
- [ ] Document the sequence steps with their purpose:
    1. `get_stage_output` - What exactly failed? (error messages, exit code)
    2. `get_run` - What's the broader run context? (other stages, workflow definition)
    3. `get_pool_state` - Is there infrastructure issues? (rate limits, queue depth)
    4. `list_checkpoints` - What was the last valid state? (for recovery)
- [ ] Add example diagnostic context output:
    ```markdown
    ## Diagnostic Context for run: abc-123, stage: build

    ### Stage Output
    - Exit Code: 101
    - Stderr (truncated to 50 lines): error[E0425]: cannot find function `foo`...

    ### Run Record
    - Workflow: presubmit-check
    - Status: Failed
    - Elapsed: 2m 34s
    - Stages: 3/5 completed

    ### Pool State
    - Active Agents: 2/4
    - Rate Limited: 0
    - Queued Stages: 1

    ### Checkpoints (last 3)
    - cp-001: committed at 2026-03-14T10:30:00Z, sha: abc123
    - cp-002: committed at 2026-03-14T10:32:00Z, sha: def456
    - cp-003: committed at 2026-03-14T10:34:00Z, sha: ghi789
    ```

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify all tests pass including the new diagnostic sequence tests.
- [ ] Run `./do lint` and verify no clippy warnings or formatting issues in the new code.
- [ ] Verify traceability: ensure all new test functions have `// Covers: 3_MCP_DESIGN-REQ-027` and `// Covers: 3_MCP_DESIGN-REQ-BR-004` annotations.
- [ ] Run `./do coverage` and verify the new code achieves ≥90% unit coverage.
- [ ] Verify that the diagnostic guard correctly blocks file writes before sequence completion.
