# Task: Agent Observation Protocol: Run Tracking and Recovery Verification (Sub-Epic: 04_MCP Run & Workflow Observation)

## Covered Requirements
- [3_MCP_DESIGN-REQ-080], [3_MCP_DESIGN-REQ-AC-1.19]

## Dependencies
- depends_on: []
- shared_components: [devs-mcp (Owner), devs-grpc (Consumer), devs-server (Consumer), devs-scheduler (Consumer)]

## 1. Initial Test Written

### 1.1 Test File Setup
- [ ] Create test file `crates/devs-mcp/tests/e2e/agent_run_tracking_test.rs` with the following structure:
  - Module-level `#[cfg(test)]` annotation
  - Import `devs_proto::v1::workflow_service_client::WorkflowServiceClient`
  - Import `devs_mcp::handlers::{submit_run, get_run, stream_logs}`
  - Import `devs_core::state_machines::{WorkflowRunState, StageRunState}`
  - Use `#[tokio::test(flavor = "multi_thread", worker_threads = 4)]` for async E2E tests

### 1.2 Test Case: submit_run_stores_run_id_before_stream_logs (Covers: 3_MCP_DESIGN-REQ-080)
- [ ] Write test that:
  1. Starts an in-process `devs` server using `TestServerHarness::start().await` with MCP transport on random available port
  2. Registers a mock workflow definition with a single stage using `write_workflow_definition` MCP tool
     - Workflow name: `test-run-tracking`
     - Single stage: `verify` with mock agent adapter that sleeps 200ms then exits with code 0
  3. Creates an MCP client session using `McpSession::connect(http://localhost:<port>/mcp/v1)`
  4. Calls `submit_run(workflow_name="test-run-tracking", inputs={}, name=None)` via MCP
  5. **Captures the returned `run_id`** (UUIDv4 string) into a local variable `stored_run_id` BEFORE any other MCP call
  6. Asserts `stored_run_id` is a valid UUIDv4 format (regex: `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)
  7. Only AFTER storing, calls `stream_logs(run_id=stored_run_id, follow=true)`
  8. Receives at least one log line from the stream
  9. Simulates connection interruption by **dropping the stream** (calling `drop(log_stream)`)
  10. Waits 50ms (simulating network delay)
  11. Calls `get_run(run_id=stored_run_id)` to recover run status
  12. Asserts the run status is either `Running` or `Completed` (NOT `NotFound` or `Error`)
  13. **Does NOT call `submit_run` again** — verifies no duplicate run was created
  14. Calls `list_runs()` and asserts only **one** run exists with `workflow_name == "test-run-tracking"`
  15. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-080]` directly above `#[tokio::test]`

### 1.3 Test Case: recover_from_interrupted_calls_get_run_first (Covers: 3_MCP_DESIGN-REQ-AC-1.19)
- [ ] Write test that:
  1. Starts an in-process `devs` server with MCP transport
  2. Writes a `task_state.json` fixture to `.devs/agent-state/test-session-123/task_state.json` containing:
     ```json
     {
       "session_id": "test-session-123",
       "active_run_id": "<uuid-here>",
       "workflow_name": "test-recovery",
       "status": "Interrupted"
     }
     ```
  3. Creates a mock run via `submit_run` with `workflow_name="test-recovery"`, capturing `run_id`
  4. Simulates agent restart by creating a **new** MCP session
  5. The new session reads `task_state.json` from `.devs/agent-state/test-session-123/`
  6. **First MCP action**: calls `get_run(run_id=<active_run_id from task_state.json>)`
  7. Asserts `get_run` is called **before** any `submit_run` call (use MCP call spy/logger to verify call order)
  8. Verifies the run status returned is `Running` (not terminal)
  9. **Does NOT call `submit_run`** — agent resumes monitoring the existing run
  10. Polls `get_run` every 500ms (max 20 polls) until run reaches `Completed` status
  11. Asserts final status is `Completed` with all stages `Completed`
  12. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-AC-1.19]` directly above `#[tokio::test]`

### 1.4 Test Case: submit_run_after_terminal_run_does_not_duplicate (Covers: 3_MCP_DESIGN-REQ-080, 3_MCP_DESIGN-REQ-AC-1.19)
- [ ] Write test that:
  1. Starts server and submits a run via `submit_run`, capturing `run_id_1`
  2. Waits for run to complete by polling `get_run(run_id_1)` until status is `Completed`
  3. Simulates agent recovery: reads `task_state.json` with `active_run_id=run_id_1`
  4. Calls `get_run(run_id_1)` as first action
  5. Verifies status is `Completed` (terminal)
  6. **Now calls `submit_run` again** with same workflow name and inputs
  7. Captures returned `run_id_2`
  8. Asserts `run_id_1 != run_id_2` (two distinct runs created, not idempotent)
  9. Calls `list_runs()` and asserts **two** runs exist with same `workflow_name`
  10. Annotates with `// Covers: [3_MCP_DESIGN-REQ-080], [3_MCP_DESIGN-REQ-AC-1.19]`

### 1.5 Baseline Test Execution (Red Phase)
- [ ] Run tests to confirm they compile but fail before implementation:
  ```bash
  cargo test -p devs-mcp --test agent_run_tracking_test -- --nocapture 2>&1 | tee /tmp/run_tracking_baseline.txt
  ```
- [ ] Verify test output shows assertion failures (not compile errors)
- [ ] Confirm `target/traceability.json` is updated with test annotation metadata

## 2. Task Implementation

### 2.1 Verify MCP Tool Schemas (Phase 3 Deliverable Check)
- [ ] Read `crates/devs-mcp/src/handlers/submit_run.rs` and verify:
  - Request schema matches `SubmitRunRequest { workflow_name: String, inputs: HashMap<String, Value>, name: Option<String> }`
  - Response schema matches `SubmitRunResponse { run_id: String, status: String }`
  - Handler calls `scheduler.submit_run()` and returns UUIDv4 `run_id`
- [ ] Read `crates/devs-mcp/src/handlers/get_run.rs` and verify:
  - Request schema matches `GetRunRequest { run_id: String }`
  - Response schema contains full `WorkflowRun` protobuf message serialized to JSON
  - Handler calls `scheduler.get_run()` and handles `NotFound` error gracefully

### 2.2 Implement Agent Run ID Storage Pattern
- [ ] Create or update reference agent struct `OrchestratingAgent` in `crates/devs-mcp/src/agent/orchestrator.rs`:
  ```rust
  pub struct OrchestratingAgent {
      mcp_session: McpSession,
      active_run_id: Option<String>,
      session_state_path: PathBuf,
  }
  
  impl OrchestratingAgent {
      pub async fn submit_run(&mut self, workflow: &str, inputs: HashMap<String, Value>) -> Result<String> {
          let response = self.mcp_session.call("submit_run", ...).await?;
          // REQ-080: Store run_id BEFORE any other action
          self.active_run_id = Some(response.run_id.clone());
          self.persist_session_state().await?;
          Ok(response.run_id)
      }
      
      pub async fn recover_from_interrupted(&mut self) -> Result<RunRecoveryStatus> {
          let task_state = self.read_task_state().await?;
          if let Some(run_id) = task_state.active_run_id {
              // REQ-AC-1.19: get_run is FIRST MCP action
              let run = self.mcp_session.call("get_run", run_id).await?;
              if run.status.is_terminal() {
                  self.active_run_id = None; // Clear for new submission
                  Ok(RunRecoveryStatus::Terminal(run))
              } else {
                  Ok(RunRecoveryStatus::Active(run))
              }
          } else {
              Ok(RunRecoveryStatus::NoActiveRun)
          }
      }
  }
  ```
- [ ] Add traceability comments:
  - `// [3_MCP_DESIGN-REQ-080]` on line storing `run_id` before `stream_logs`
  - `// [3_MCP_DESIGN-REQ-AC-1.19]` on line calling `get_run` as first action after interrupt

### 2.3 Implement Session State Persistence
- [ ] Create `crates/devs-mcp/src/agent/session_state.rs`:
  ```rust
  #[derive(Serialize, Deserialize)]
  pub struct TaskState {
      pub session_id: String,
      pub active_run_id: Option<String>,
      pub workflow_name: Option<String>,
      pub status: AgentStatus, // enum: Active, Interrupted, Completed
      pub last_updated: DateTime<Utc>,
  }
  
  impl TaskState {
      pub async fn write_to(&self, path: &Path) -> Result<()> {
          // Atomic write: temp file + rename
          let temp_path = path.with_extension("tmp");
          let json = serde_json::to_string_pretty(self)?;
          tokio::fs::write(&temp_path, json).await?;
          tokio::fs::rename(&temp_path, path).await?;
          Ok(())
      }
  }
  ```
- [ ] Add traceability: `// [3_MCP_DESIGN-REQ-080]` on `active_run_id` field

### 2.4 Verify Terminal Status Detection
- [ ] Read `devs-core` state machine: `crates/devs-core/src/state_machines/workflow_run_state.rs`
- [ ] Verify `WorkflowRunState` enum has `is_terminal()` method returning `true` for:
  - `WorkflowRunState::Completed`
  - `WorkflowRunState::Failed`
  - `WorkflowRunState::Cancelled`
- [ ] If `is_terminal()` method doesn't exist, add it as:
  ```rust
  impl WorkflowRunState {
      pub fn is_terminal(&self) -> bool {
          matches!(self, Self::Completed | Self::Failed | Self::Cancelled)
      }
  }
  ```
- [ ] Add traceability: `// [3_MCP_DESIGN-REQ-AC-1.19]` on terminal status check

### 2.5 Handle NOT_FOUND Error from Retention Sweep
- [ ] In `recover_from_interrupted()`, add error handling:
  ```rust
  match self.mcp_session.call("get_run", run_id).await {
      Ok(run) => { /* ... */ }
      Err(McpError::NotFound(_)) => {
          // Run was swept by retention policy — safe to submit new run
          self.active_run_id = None;
          Ok(RunRecoveryStatus::NotFound)
      }
      Err(e) => Err(e),
  }
  ```
- [ ] Add traceability: `// [3_MCP_DESIGN-REQ-AC-1.19]` on NOT_FOUND handling

## 3. Code Review

- [ ] Verify `get_run` is called as the **first** MCP action after reading `task_state.json` with non-null `active_run_id` (REQ-AC-1.19)
- [ ] Verify `submit_run` response handler stores `run_id` **before** calling `stream_logs` or any other MCP tool (REQ-080)
- [ ] Verify `submit_run` is **not** called if `active_run_id` points to a non-terminal run (REQ-080, REQ-AC-1.19)
- [ ] Verify session state persistence uses atomic write (temp file + rename) to prevent corruption
- [ ] Verify `is_terminal()` check covers all three terminal states: `Completed`, `Failed`, `Cancelled`
- [ ] Verify NOT_FOUND error from `get_run` is handled gracefully (retention sweep scenario)
- [ ] Check that traceability annotations `// [3_MCP_DESIGN-REQ-080]` and `// [3_MCP_DESIGN-REQ-AC-1.19]` appear on all relevant code paths

## 4. Run Automated Tests to Verify

- [ ] Run E2E tests:
  ```bash
  cargo test -p devs-mcp --test agent_run_tracking_test -- --nocapture
  ```
- [ ] Verify all three test cases pass:
  - `submit_run_stores_run_id_before_stream_logs`
  - `recover_from_interrupted_calls_get_run_first`
  - `submit_run_after_terminal_run_does_not_duplicate`
- [ ] Run unit tests for session state:
  ```bash
  cargo test -p devs-mcp session_state -- --nocapture
  ```
- [ ] Verify no clippy warnings:
  ```bash
  cargo clippy -p devs-mcp --tests -- -D warnings
  ```

## 5. Update Documentation

- [ ] Update `docs/plan/specs/3_mcp_design.md` Section 3 (Agentic Development Loops):
  - Add subsection "3.1.1 Run ID Storage Protocol" documenting REQ-080
  - Add subsection "3.1.2 Interrupted State Recovery" documenting REQ-AC-1.19
  - Include code snippets showing correct call order
- [ ] Update `.agent/MEMORY.md` (project memory):
  - Add entry: "Run Tracking & Recovery Protocol"
  - Document: "Always store `run_id` from `submit_run` before calling `stream_logs`"
  - Document: "After Interrupted state, call `get_run` FIRST before any `submit_run`"
  - Document: "Terminal statuses: Completed, Failed, Cancelled — safe to submit new run"
- [ ] Add ADR if new pattern discovered: `docs/adr/<NNNN>-agent-run-tracking.md`

## 6. Automated Verification

- [ ] Execute full presubmit:
  ```bash
  ./do presubmit 2>&1 | tee /tmp/presubmit_run_tracking.txt
  ```
- [ ] Verify presubmit exits with code 0
- [ ] Check traceability report:
  ```bash
  cat target/traceability.json | jq '.covered_requirements | map(select(. == "3_MCP_DESIGN-REQ-080" or . == "3_MCP_DESIGN-REQ-AC-1.19"))'
  ```
- [ ] Verify both requirement IDs appear in `target/traceability.json` with `covered: true`
- [ ] Run verification script if available:
  ```bash
  .tools/verify_requirements.py --ids 3_MCP_DESIGN-REQ-080 3_MCP_DESIGN-REQ-AC-1.19
  ```
- [ ] Confirm no stale annotations or missing coverage warnings
