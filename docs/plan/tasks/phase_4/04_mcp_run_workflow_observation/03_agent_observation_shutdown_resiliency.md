# Task: Agent Observation Protocol: Shutdown and Multi-Server Coordination (Sub-Epic: 04_MCP Run & Workflow Observation)

## Covered Requirements
- [3_MCP_DESIGN-REQ-006], [3_MCP_DESIGN-REQ-058]

## Dependencies
- depends_on: [02_agent_observation_wait_logic.md]
- shared_components: [devs-mcp (Owner), devs-grpc (Consumer), devs-server (Consumer), devs-checkpoint (Consumer)]

## 1. Initial Test Written

### 1.1 Test File Setup
- [ ] Create test file `crates/devs-mcp/tests/e2e/agent_shutdown_resiliency_test.rs` with the following structure:
  - Module-level `#[cfg(test)]` annotation
  - Import `devs_mcp::handlers::{submit_run, get_run, write_file}`
  - Import `devs_core::state_machines::WorkflowRunState`
  - Import `tokio::sync::mpsc` for simulating shutdown signals
  - Use `#[tokio::test(flavor = "multi_thread", worker_threads = 4)]` for async E2E tests
  - Create mock Filesystem MCP server struct implementing minimal JSON-RPC protocol

### 1.2 Test Case: agent_connects_to_both_mcp_servers (Covers: 3_MCP_DESIGN-REQ-006)
- [ ] Write test that:
  1. Starts an in-process `devs` Glass-Box MCP server using `TestServerHarness::start().await` on random port
  2. Starts a mock Filesystem MCP server (stdio or HTTP transport) on a separate port
  3. Creates an `OrchestratingAgent` instance configured with **both** server addresses:
     - `glass_box_addr = "http://localhost:<port1>/mcp/v1"`
     - `filesystem_addr = "http://localhost:<port2>/mcp/v1"`
  4. Agent establishes connections to both servers simultaneously
  5. Agent calls `get_run` on Glass-Box server — verifies response is received
  6. Agent calls `write_file` on Filesystem server — verifies file is written
  7. **Asserts both connections remain active** throughout the test (no connection dropped)
  8. **Asserts Glass-Box server is used for observation**: `get_run`, `list_runs`, `stream_logs`
  9. **Asserts Filesystem server is used for state persistence**: `write_file`, `read_file`
  10. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-006]` directly above `#[tokio::test]`

### 1.3 Test Case: agent_reads_code_via_filesystem_mcp (Covers: 3_MCP_DESIGN-REQ-006)
- [ ] Write test that:
  1. Sets up both MCP servers (Glass-Box + Filesystem)
  2. Writes a source file `crates/devs-core/src/lib.rs` via Filesystem MCP `write_file`
  3. Agent calls `read_file` on Filesystem MCP to read the source code
  4. Agent calls `get_run` on Glass-Box MCP to verify run state
  5. **Asserts Filesystem MCP returned correct file content** (code reading works)
  6. **Asserts Glass-Box MCP returned correct run state** (verification works)
  7. **Asserts both operations succeeded in the same agent session** (multi-server coordination)
  8. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-006]`

### 1.4 Test Case: shutdown_error_triggers_state_save (Covers: 3_MCP_DESIGN-REQ-058)
- [ ] Write test that:
  1. Starts both MCP servers
  2. Creates an agent session with `session_id = "test-shutdown-123"`
  3. Agent submits a run via `submit_run`, capturing `run_id = "<uuid>"`
  4. Agent stores `active_run_id = run_id` in its internal `TaskState`
  5. **Mock Glass-Box server is configured to return shutdown error** on next call:
     ```json
     {"jsonrpc": "2.0", "id": 5, "result": null, "error": "failed_precondition: server is shutting down"}
     ```
  6. Agent calls any MCP tool (e.g., `get_run`) and receives the shutdown error
  7. **Agent immediately serializes `TaskState` to JSON**:
     ```json
     {
       "session_id": "test-shutdown-123",
       "active_run_id": "<uuid>",
       "workflow_name": "test-workflow",
       "status": "Interrupted",
       "last_updated": "<timestamp>"
     }
     ```
  8. Agent calls `write_file` on Filesystem MCP targeting:
     `.devs/agent-state/test-shutdown-123/task_state.json`
  9. **Test waits for write to complete** (atomic write via temp file + rename)
  10. Test reads the written file via Filesystem MCP `read_file`
  11. **Asserts file content matches expected `TaskState`** (JSON comparison)
  12. **Asserts `active_run_id` is preserved** (not lost during shutdown)
  13. **Asserts write occurred BEFORE agent terminated** (not after, not concurrently)
  14. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-058]`

### 1.5 Test Case: state_save_is_atomic_via_temp_file_rename (Covers: 3_MCP_DESIGN-REQ-058)
- [ ] Write test that:
  1. Sets up both MCP servers
  2. Configures Filesystem MCP to use atomic write (temp file + rename)
  3. Agent receives shutdown error and triggers state save
  4. **Test monitors filesystem operations** (using `inotify` on Linux, `FSEvents` on macOS, or mock interception)
  5. **Asserts write sequence**:
     - Step 1: temp file `.devs/agent-state/test-session/task_state.json.tmp` is created
     - Step 2: temp file content is written completely
     - Step 3: `rename()` atomically moves temp to final path
  6. **Asserts no partial write is visible** (final file either exists with full content or doesn't exist)
  7. **Asserts crash during write would leave either old file or no file** (not corrupted partial file)
  8. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-058]`

### 1.6 Test Case: incomplete_state_is_saved_anyway (Covers: 3_MCP_DESIGN-REQ-058)
- [ ] Write test that:
  1. Sets up both MCP servers
  2. Agent is mid-operation with **partial `TaskState`**:
     - `active_run_id` is set
     - `in_progress_requirements` list is partially populated
     - Some fields may be `null` or default values
  3. Agent receives shutdown error
  4. **Agent saves state immediately without waiting for operations to complete**
  5. Test reads saved `task_state.json`
  6. **Asserts file contains whatever state was available** (even if incomplete)
  7. **Asserts agent did NOT delay save to complete operations** (speed over completeness)
  8. **Asserts `active_run_id` is present** (most critical field preserved)
  9. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-058]`

### 1.7 Test Case: session_id_is_uuidv4_format (Covers: 3_MCP_DESIGN-REQ-006, 3_MCP_DESIGN-REQ-058)
- [ ] Write test that:
  1. Creates multiple agent sessions, each with auto-generated `session_id`
  2. **Asserts each `session_id` matches UUIDv4 regex**:
     `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`
  3. **Asserts no duplicate session IDs** across 100 generated sessions
  4. **Asserts state files are stored in correct directory structure**:
     `.devs/agent-state/<session_id>/task_state.json`
  5. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-006], [3_MCP_DESIGN-REQ-058]`

### 1.8 Baseline Test Execution (Red Phase)
- [ ] Run tests to confirm they compile but fail before implementation:
  ```bash
  cargo test -p devs-mcp --test agent_shutdown_resiliency_test -- --nocapture 2>&1 | tee /tmp/shutdown_resiliency_baseline.txt
  ```
- [ ] Verify test output shows assertion failures (not compile errors)
- [ ] Confirm `target/traceability.json` is updated with test annotation metadata

## 2. Task Implementation

### 2.1 Verify Glass-Box MCP Server Inventory
- [ ] Read `crates/devs-mcp/src/server.rs` or equivalent:
  - Verify server exposes all 20 MCP tools (per Phase 3 spec)
  - Verify server listens on configurable HTTP port (default 7891)
  - Verify server implements JSON-RPC 2.0 protocol over HTTP POST
  - Verify server returns proper error format: `{"result": null, "error": "..."}`

### 2.2 Implement Multi-Server MCP Client
- [ ] Create `crates/devs-mcp/src/agent/multi_server_client.rs`:
  ```rust
  use reqwest::Client;
  use serde_json::{json, Value};
  
  pub struct MultiServerMcpClient {
      http_client: Client,
      glass_box_addr: String,
      filesystem_addr: String,
  }
  
  impl MultiServerMcpClient {
      pub fn new(glass_box_addr: String, filesystem_addr: String) -> Self {
          Self {
              http_client: Client::new(),
              glass_box_addr,
              filesystem_addr,
          }
      }
      
      /// Call a tool on the Glass-Box MCP server (observation, control, testing tools)
      pub async fn call_glass_box(&self, method: &str, params: Value) -> Result<McpResponse> {
          let response = self.http_client
              .post(&self.glass_box_addr)
              .json(&json!({
                  "jsonrpc": "2.0",
                  "id": generate_request_id(),
                  "method": method,
                  "params": params,
              }))
              .send()
              .await?;
          
          let result: McpResponse = response.json().await?;
          
          // Check for shutdown error
          if let Some(error) = &result.error {
              if error.contains("failed_precondition: server is shutting down") {
                  return Err(McpError::ServerShuttingDown);
              }
          }
          
          Ok(result)
      }
      
      /// Call a tool on the Filesystem MCP server (read_file, write_file, etc.)
      pub async fn call_filesystem(&self, method: &str, params: Value) -> Result<McpResponse> {
          let response = self.http_client
              .post(&self.filesystem_addr)
              .json(&json!({
                  "jsonrpc": "2.0",
                  "id": generate_request_id(),
                  "method": method,
                  "params": params,
              }))
              .send()
              .await?;
          
          Ok(response.json().await?)
      }
      
      /// Convenience: call get_run on Glass-Box server
      pub async fn get_run(&self, run_id: &str) -> Result<WorkflowRun> {
          let response = self.call_glass_box("get_run", json!({ "run_id": run_id })).await?;
          Ok(serde_json::from_value(response.result.unwrap())?)
      }
      
      /// Convenience: call write_file on Filesystem server with atomic write
      pub async fn write_file_atomic(&self, path: &str, content: &str) -> Result<()> {
          // Atomic write: write to temp file, then rename
          let temp_path = format!("{}.tmp", path);
          
          // Write to temp file
          self.call_filesystem("write_file", json!({
              "path": temp_path,
              "content": content,
          })).await?;
          
          // Rename to final path
          self.call_filesystem("rename_file", json!({
              "from": temp_path,
              "to": path,
          })).await?;
          
          Ok(())
      }
  }
  
  #[derive(Debug, thiserror::Error)]
  pub enum McpError {
      #[error("Server is shutting down")]
      ServerShuttingDown,
      #[error("HTTP error: {0}")]
      HttpError(#[from] reqwest::Error),
      #[error("JSON error: {0}")]
      JsonError(#[from] serde_json::Error),
  }
  ```
- [ ] Add traceability: `// [3_MCP_DESIGN-REQ-006]` on struct definition (both server addresses)

### 2.3 Implement Shutdown Error Handler
- [ ] Create `crates/devs-mcp/src/agent/shutdown_handler.rs`:
  ```rust
  use std::path::Path;
  use tokio::fs;
  
  pub struct ShutdownHandler {
      session_id: String,
      state_dir: PathBuf,
      filesystem_client: FilesystemMcpClient,
  }
  
  impl ShutdownHandler {
      pub fn new(session_id: String, filesystem_client: FilesystemMcpClient) -> Self {
          let state_dir = PathBuf::from(".devs")
              .join("agent-state")
              .join(&session_id);
          
          Self {
              session_id,
              state_dir,
              filesystem_client,
          }
      }
      
      /// Handle shutdown error: save task state before termination
      pub async fn handle_shutdown(&self, task_state: &TaskState) -> Result<()> {
          tracing::warn!("Received server shutdown signal, saving task state...");
          
          // Ensure state directory exists
          fs::create_dir_all(&self.state_dir).await?;
          
          let state_path = self.state_dir.join("task_state.json");
          
          // Serialize state to JSON
          let state_json = serde_json::to_string_pretty(task_state)?;
          
          // Atomic write: temp file + rename
          self.filesystem_client
              .write_file_atomic(state_path.to_str().unwrap(), &state_json)
              .await?;
          
          tracing::info!(
              path = %state_path.display(),
              "Task state saved successfully"
          );
          
          Ok(())
      }
  }
  
  /// Global error handler wrapper
  pub async fn handle_mcp_error<T>(
      result: Result<T, McpError>,
      task_state: &TaskState,
      shutdown_handler: &ShutdownHandler,
  ) -> Result<T> {
      match result {
          Ok(value) => Ok(value),
          Err(McpError::ServerShuttingDown) => {
              // REQ-058: Save state BEFORE termination
              shutdown_handler.handle_shutdown(task_state).await?;
              Err(McpError::ServerShuttingDown)
          }
          Err(e) => Err(e),
      }
  }
  ```
- [ ] Add traceability: `// [3_MCP_DESIGN-REQ-058]` on `handle_shutdown` method

### 2.4 Implement TaskState Structure
- [ ] Create `crates/devs-mcp/src/agent/task_state.rs`:
  ```rust
  use chrono::{DateTime, Utc};
  use serde::{Deserialize, Serialize};
  
  #[derive(Serialize, Deserialize, Debug, Clone)]
  pub struct TaskState {
      pub session_id: String,
      pub active_run_id: Option<String>,
      pub workflow_name: Option<String>,
      pub status: AgentStatus,
      pub in_progress_requirements: Vec<String>,
      pub last_updated: DateTime<Utc>,
  }
  
  #[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
  #[serde(rename_all = "snake_case")]
  pub enum AgentStatus {
      Active,
      Interrupted,
      Completed,
      Failed,
  }
  
  impl TaskState {
      pub fn new(session_id: String) -> Self {
          Self {
              session_id,
              active_run_id: None,
              workflow_name: None,
              status: AgentStatus::Active,
              in_progress_requirements: Vec::new(),
              last_updated: Utc::now(),
          }
      }
      
      pub fn with_active_run(mut self, run_id: String, workflow_name: String) -> Self {
          self.active_run_id = Some(run_id);
          self.workflow_name = Some(workflow_name);
          self.status = AgentStatus::Active;
          self.last_updated = Utc::now();
          self
      }
      
      pub fn mark_interrupted(&mut self) {
          self.status = AgentStatus::Interrupted;
          self.last_updated = Utc::now();
      }
  }
  ```
- [ ] Add traceability: `// [3_MCP_DESIGN-REQ-058]` on `active_run_id` field

### 2.5 Integrate Shutdown Handler into OrchestratingAgent
- [ ] Update `crates/devs-mcp/src/agent/orchestrator.rs`:
  ```rust
  pub struct OrchestratingAgent {
      multi_server_client: MultiServerMcpClient,
      shutdown_handler: ShutdownHandler,
      task_state: TaskState,
      // ... other fields
  }
  
  impl OrchestratingAgent {
      pub async fn call_mcp_tool(&self, tool: &str, params: Value) -> Result<McpResponse> {
          let result = self.multi_server_client.call_glass_box(tool, params).await;
          
          // Handle shutdown error globally
          handle_mcp_error(result, &self.task_state, &self.shutdown_handler).await
      }
      
      pub async fn submit_run(&mut self, workflow: &str, inputs: HashMap<String, Value>) -> Result<String> {
          let response = self.call_mcp_tool("submit_run", json!({
              "workflow_name": workflow,
              "inputs": inputs,
          })).await?;
          
          let run_id = extract_run_id(&response)?;
          
          // Update task state with active run
          self.task_state = self.task_state.clone().with_active_run(
              run_id.clone(),
              workflow.to_string(),
          );
          
          Ok(run_id)
      }
  }
  ```
- [ ] Add traceability:
  - `// [3_MCP_DESIGN-REQ-006]` on `multi_server_client` field
  - `// [3_MCP_DESIGN-REQ-058]` on shutdown error handling

### 2.6 Implement UUIDv4 Session ID Generation
- [ ] Add to `crates/devs-mcp/src/agent/session_id.rs`:
  ```rust
  use uuid::Uuid;
  
  /// Generate a UUIDv4 session ID
  pub fn generate_session_id() -> String {
      Uuid::new_v4().to_string()
  }
  
  /// Validate session ID format (UUIDv4)
  pub fn validate_session_id(session_id: &str) -> bool {
      let uuid_regex = regex::Regex::new(
          r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
      ).unwrap();
      uuid_regex.is_match(session_id)
  }
  ```
- [ ] Add traceability: `// [3_MCP_DESIGN-REQ-058]` on session ID generation

## 3. Code Review

- [ ] Verify agent maintains **two separate MCP client connections** simultaneously (Glass-Box + Filesystem)
- [ ] Verify Glass-Box client is used **only** for observation/control/testing tools
- [ ] Verify Filesystem client is used **only** for `read_file`, `write_file`, `rename_file`
- [ ] Verify shutdown error detection: `"failed_precondition: server is shutting down"` string match
- [ ] Verify state save occurs **before** agent termination (synchronous, not async/fire-forget)
- [ ] Verify atomic write: temp file created, content written, then `rename()` called
- [ ] Verify `active_run_id` is always present in saved state (most critical field)
- [ ] Verify session ID is UUIDv4 format (regex validation)
- [ ] Verify state directory structure: `.devs/agent-state/<session_id>/task_state.json`
- [ ] Verify traceability annotations appear on:
  - `// [3_MCP_DESIGN-REQ-006]` on multi-server client struct
  - `// [3_MCP_DESIGN-REQ-058]` on shutdown handler and state save logic

## 4. Run Automated Tests to Verify

- [ ] Run E2E tests:
  ```bash
  cargo test -p devs-mcp --test agent_shutdown_resiliency_test -- --nocapture
  ```
- [ ] Verify all six test cases pass:
  - `agent_connects_to_both_mcp_servers`
  - `agent_reads_code_via_filesystem_mcp`
  - `shutdown_error_triggers_state_save`
  - `state_save_is_atomic_via_temp_file_rename`
  - `incomplete_state_is_saved_anyway`
  - `session_id_is_uuidv4_format`
- [ ] Run unit tests for shutdown handler:
  ```bash
  cargo test -p devs-mcp shutdown_handler -- --nocapture
  ```
- [ ] Run unit tests for task state:
  ```bash
  cargo test -p devs-mcp task_state -- --nocapture
  ```
- [ ] Verify no clippy warnings:
  ```bash
  cargo clippy -p devs-mcp --tests -- -D warnings
  ```

## 5. Update Documentation

- [ ] Update `docs/plan/specs/3_mcp_design.md` Section 1.4 (Two Agent Roles):
  - Add subsection "1.4.1 Multi-Server Coordination"
  - Document: "Orchestrating agents connect to both Glass-Box and Filesystem MCP servers"
  - Document: "Glass-Box server: observation, control, testing tools"
  - Document: "Filesystem server: code reading/writing, state persistence"
- [ ] Update `docs/plan/specs/3_mcp_design.md` Section 1.5 (Agent Session Lifecycle):
  - Add transition: "On `failed_precondition: server is shutting down` → Save `task_state.json` → Terminate"
  - Include state diagram with shutdown path
- [ ] Update `docs/plan/specs/3_mcp_design.md` Section 2.6 (Tool Edge Cases):
  - Add edge case: "Server shutdown during tool call — agent must save state before termination"
- [ ] Update `.agent/MEMORY.md`:
  - Add entry: "Multi-Server Coordination (REQ-006)"
  - Document: "Connect to both Glass-Box (:7891) and Filesystem MCP servers"
  - Document: "Use Glass-Box for run observation, Filesystem for code I/O"
  - Add entry: "Shutdown Resiliency (REQ-058)"
  - Document: "On `failed_precondition: server is shutting down` error: save `task_state.json` immediately"
  - Document: "State save is atomic (temp file + rename)"
  - Document: "Incomplete state is acceptable — speed over completeness"
  - Document: "Session ID is UUIDv4, state stored in `.devs/agent-state/<session_id>/`"

## 6. Automated Verification

- [ ] Execute full presubmit:
  ```bash
  ./do presubmit 2>&1 | tee /tmp/presubmit_shutdown_resiliency.txt
  ```
- [ ] Verify presubmit exits with code 0
- [ ] Check traceability report:
  ```bash
  cat target/traceability.json | jq '.covered_requirements | map(select(. == "3_MCP_DESIGN-REQ-006" or . == "3_MCP_DESIGN-REQ-058"))'
  ```
- [ ] Verify both requirement IDs appear in `target/traceability.json` with `covered: true`
- [ ] Run verification script if available:
  ```bash
  .tools/verify_requirements.py --ids 3_MCP_DESIGN-REQ-006 3_MCP_DESIGN-REQ-058
  ```
- [ ] Confirm no stale annotations or missing coverage warnings
- [ ] Verify coverage report shows:
  - `crates/devs-mcp/src/agent/multi_server_client.rs` has >= 90% line coverage
  - `crates/devs-mcp/src/agent/shutdown_handler.rs` has >= 90% line coverage
  - `crates/devs-mcp/src/agent/task_state.rs` has >= 90% line coverage
