# Task: Agent Observation Protocol: Wait Logic and Polling Safety (Sub-Epic: 04_MCP Run & Workflow Observation)

## Covered Requirements
- [3_MCP_DESIGN-REQ-081]

## Dependencies
- depends_on: [01_agent_observation_run_tracking.md]
- shared_components: [devs-mcp (Owner), devs-grpc (Consumer), devs-server (Consumer), devs-scheduler (Consumer)]

## 1. Initial Test Written

### 1.1 Test File Setup
- [ ] Create test file `crates/devs-mcp/tests/e2e/agent_wait_protocol_test.rs` with the following structure:
  - Module-level `#[cfg(test)]` annotation
  - Import `devs_mcp::handlers::{submit_run, get_run, stream_logs}`
  - Import `devs_core::state_machines::WorkflowRunState`
  - Import `tokio::time::{Instant, Duration, sleep}`
  - Use `#[tokio::test(flavor = "multi_thread", worker_threads = 4)]` for async E2E tests
  - Create helper struct `PollingSpy` to track `get_run` call timestamps

### 1.2 Test Case: stream_logs_follow_blocks_until_stage_completion (Covers: 3_MCP_DESIGN-REQ-081)
- [ ] Write test that:
  1. Starts an in-process `devs` server using `TestServerHarness::start().await` with MCP transport
  2. Registers a workflow with a single stage that takes 500ms to complete (mock agent sleeps)
  3. Submits run via `submit_run`, capturing `run_id`
  4. Calls `stream_logs(run_id=run_id, follow=true)` and starts consuming the stream
  5. Uses `tokio::time::timeout(Duration::from_secs(5), stream.collect())` to wait for stream completion
  6. Asserts the stream completes within 5 seconds (not timing out)
  7. **Verifies NO `get_run` calls were made** during the stream wait (use MCP call logger/spy)
  8. Asserts final log line contains stage completion message
  9. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-081]` directly above `#[tokio::test]`

### 1.3 Test Case: tight_loop_polling_is_rejected (Covers: 3_MCP_DESIGN-REQ-081)
- [ ] Write test that:
  1. Starts server and submits a run
  2. Creates an `AgentWaitStrategy` instance configured with **0ms polling interval** (violating REQ-081)
  3. Simulates connection loss on `stream_logs`
  4. Agent falls back to `get_run` polling with 0ms interval
  5. **Asserts the agent rejects this configuration** — either:
     - Compile-time rejection (type system prevents 0ms interval), OR
     - Runtime panic with message "Polling interval must be >= 1 second per REQ-081", OR
     - Test framework intercepts and fails the test
  6. Verifies no tight-loop polling occurs (all polls must be >= 1 second apart)
  7. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-081]`

### 1.4 Test Case: polling_fallback_after_connection_loss (Covers: 3_MCP_DESIGN-REQ-081)
- [ ] Write test that:
  1. Starts server and submits a run with a stage that takes 3 seconds to complete
  2. Calls `stream_logs(run_id, follow=true)` and receives first log line
  3. **Simulates connection loss** by:
     - Dropping the stream, OR
     - Injecting a `ConnectionReset` error in the mock transport
  4. Agent detects connection loss and logs warning: "stream_logs connection lost, falling back to polling"
  5. Agent waits exactly 1 second (use `Instant::now()` to measure)
  6. Agent calls `get_run(run_id)` as first poll
  7. Run is still `Running`, so agent waits another 1 second
  8. Agent polls `get_run` again
  9. Run is now `Completed`, agent exits polling loop
  10. **Verifies polling interval**: all consecutive `get_run` calls are >= 1 second apart (tolerance: ±50ms)
  11. **Verifies poll count**: total polls <= 120 (should be ~3 for this test)
  12. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-081]`

### 1.5 Test Case: polling_timeout_after_120_attempts (Covers: 3_MCP_DESIGN-REQ-081)
- [ ] Write test that:
  1. Starts server and submits a run with a stage that **never completes** (mock agent hangs)
  2. Simulates immediate connection loss on `stream_logs`
  3. Agent falls back to `get_run` polling with 1-second interval
  4. Mock server returns `Running` status for first 120 polls, then `Completed` on 121st
  5. **Asserts agent stops polling after exactly 120 attempts**
  6. Asserts agent transitions to `Timeout` error state with message: "Exceeded maximum 120 polling attempts"
  7. Asserts agent does NOT call `get_run` a 121st time (use call counter/spy)
  8. Verifies total elapsed time is approximately 120 seconds (tolerance: ±5 seconds for processing)
  9. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-081]`

### 1.6 Test Case: polling_interval_enforcement_with_jitter_tolerance (Covers: 3_MCP_DESIGN-REQ-081)
- [ ] Write test that:
  1. Starts server and submits a run
  2. Simulates connection loss, triggering polling fallback
  3. Records timestamp of each `get_run` call using `Instant::now()`
  4. After run completes (or 10 polls), calculates intervals between consecutive polls
  5. **Asserts all intervals are >= 950ms** (1 second with 50ms tolerance for scheduling jitter)
  6. **Asserts no interval is < 900ms** (strict rejection threshold)
  7. If any interval violates, test fails with: "REQ-081 violation: poll interval was {interval_ms}ms, must be >= 1000ms"
  8. Annotates test with `// Covers: [3_MCP_DESIGN-REQ-081]`

### 1.7 Baseline Test Execution (Red Phase)
- [ ] Run tests to confirm they compile but fail before implementation:
  ```bash
  cargo test -p devs-mcp --test agent_wait_protocol_test -- --nocapture 2>&1 | tee /tmp/wait_protocol_baseline.txt
  ```
- [ ] Verify test output shows assertion failures (not compile errors)
- [ ] Confirm `target/traceability.json` is updated with test annotation metadata

## 2. Task Implementation

### 2.1 Verify stream_logs Handler Supports Chunked Streaming
- [ ] Read `crates/devs-mcp/src/handlers/stream_logs.rs`:
  - Verify handler accepts `follow: bool` parameter
  - When `follow: true`, handler returns a streaming response (not single JSON object)
  - Handler uses `tokio::sync::broadcast` or similar to fan-out log lines to subscribers
  - Handler emits `{"done": true}` sentinel when run completes
  - Handler handles client disconnect gracefully (no server-side error when client drops stream)

### 2.2 Implement AgentWaitStrategy Component
- [ ] Create `crates/devs-mcp/src/agent/wait_strategy.rs`:
  ```rust
  use std::time::{Duration, Instant};
  use tokio::time::sleep;
  
  pub const MIN_POLL_INTERVAL: Duration = Duration::from_secs(1);
  pub const MAX_POLL_COUNT: u32 = 120;
  
  pub struct AgentWaitStrategy {
      poll_interval: Duration,
      max_polls: u32,
      call_logger: Option<PollingCallLogger>,
  }
  
  impl AgentWaitStrategy {
      pub fn new() -> Self {
          Self {
              poll_interval: MIN_POLL_INTERVAL,
              max_polls: MAX_POLL_COUNT,
              call_logger: None,
          }
      }
      
      /// Wait for run completion using stream_logs with follow=true
      /// Returns Ok(true) if stream completed normally, Ok(false) if connection lost (use polling fallback)
      pub async fn wait_via_stream(&self, mcp: &McpSession, run_id: &str) -> Result<bool> {
          let mut stream = mcp.call_stream("stream_logs", json!({
              "run_id": run_id,
              "follow": true
          })).await?;
          
          while let Some(chunk) = stream.next().await {
              match chunk {
                  Ok(LogChunk { done: true, .. }) => return Ok(true),
                  Ok(_) => continue,
                  Err(StreamError::ConnectionLost(_)) => return Ok(false),
                  Err(e) => return Err(e.into()),
              }
          }
          Ok(true)
      }
      
      /// Fallback polling after stream_logs connection loss
      /// Enforces 1-second minimum interval and 120-poll maximum
      pub async fn wait_via_polling(&self, mcp: &McpSession, run_id: &str) -> Result<PollResult> {
          let mut poll_count = 0;
          let mut last_poll_time = Instant::now();
          
          loop {
              // Enforce minimum interval
              let elapsed = last_poll_time.elapsed();
              if elapsed < self.poll_interval {
                  sleep(self.poll_interval - elapsed).await;
              }
              
              // Check max polls BEFORE making the call
              if poll_count >= self.max_polls {
                  return Err(WaitError::PollingTimeout {
                      max_polls: self.max_polls,
                      run_id: run_id.to_string(),
                  }.into());
              }
              
              let poll_start = Instant::now();
              let run = mcp.call("get_run", json!({ "run_id": run_id })).await?;
              last_poll_time = poll_start;
              poll_count += 1;
              
              if let Some(logger) = &self.call_logger {
                  logger.log_poll(poll_start, run.status.clone());
              }
              
              if run.status.is_terminal() {
                  return Ok(PollResult::Completed { run, poll_count });
              }
          }
      }
      
      /// Combined wait: try stream first, fall back to polling on connection loss
      pub async fn wait(&self, mcp: &McpSession, run_id: &str) -> Result<WaitResult> {
          match self.wait_via_stream(mcp, run_id).await {
              Ok(true) => Ok(WaitResult::StreamCompleted),
              Ok(false) => {
                  // Connection lost — fall back to polling
                  tracing::warn!(run_id = %run_id, "stream_logs connection lost, falling back to polling");
                  let poll_result = self.wait_via_polling(mcp, run_id).await?;
                  Ok(WaitResult::PollingCompleted(poll_result))
              }
              Err(e) => Err(e),
          }
      }
  }
  
  #[derive(Debug)]
  pub enum WaitResult {
      StreamCompleted,
      PollingCompleted(PollResult),
  }
  
  #[derive(Debug)]
  pub struct PollResult {
      pub run: WorkflowRun,
      pub poll_count: u32,
  }
  
  #[derive(Debug, thiserror::Error)]
  pub enum WaitError {
      #[error("Exceeded maximum {max_polls} polling attempts for run {run_id}")]
      PollingTimeout { max_polls: u32, run_id: String },
  }
  ```
- [ ] Add traceability comment: `// [3_MCP_DESIGN-REQ-081]` on:
  - `MIN_POLL_INTERVAL` constant definition
  - `MAX_POLL_COUNT` constant definition
  - Interval enforcement sleep block
  - Max poll count check

### 2.3 Implement PollingCallLogger for Test Verification
- [ ] Create `crates/devs-mcp/src/agent/polling_logger.rs`:
  ```rust
  use std::sync::{Arc, Mutex};
  use tokio::time::Instant;
  
  #[derive(Clone)]
  pub struct PollingCallLogger {
      calls: Arc<Mutex<Vec<Instant>>>,
  }
  
  impl PollingCallLogger {
      pub fn new() -> Self {
          Self { calls: Arc::new(Mutex::new(Vec::new())) }
      }
      
      pub fn log_poll(&self, timestamp: Instant, _status: String) {
          let mut calls = self.calls.lock().unwrap();
          calls.push(timestamp);
      }
      
      /// Returns all poll timestamps for verification
      pub fn get_polls(&self) -> Vec<Instant> {
          self.calls.lock().unwrap().clone()
      }
      
      /// Verify all polls are >= min_interval apart
      pub fn verify_min_interval(&self, min_interval: Duration) -> Result<(), String> {
          let calls = self.get_polls();
          for i in 1..calls.len() {
              let interval = calls[i].duration_since(calls[i - 1]);
              if interval < min_interval {
                  return Err(format!(
                      "REQ-081 violation: poll interval was {:?}, must be >= {:?}",
                      interval, min_interval
                  ));
              }
          }
          Ok(())
      }
      
      pub fn poll_count(&self) -> usize {
          self.calls.lock().unwrap().len()
      }
  }
  ```

### 2.4 Integrate WaitStrategy into OrchestratingAgent
- [ ] Update `crates/devs-mcp/src/agent/orchestrator.rs`:
  ```rust
  pub struct OrchestratingAgent {
      mcp_session: McpSession,
      active_run_id: Option<String>,
      wait_strategy: AgentWaitStrategy,
      // ... other fields
  }
  
  impl OrchestratingAgent {
      pub async fn wait_for_run_completion(&self, run_id: &str) -> Result<WaitResult> {
          self.wait_strategy.wait(&self.mcp_session, run_id).await
      }
  }
  ```
- [ ] Add traceability: `// [3_MCP_DESIGN-REQ-081]` on wait method

### 2.5 Verify stream_logs Chunked Transfer Implementation
- [ ] Read `crates/devs-devs-grpc/src/streaming.rs` or equivalent:
  - Verify HTTP response uses `Transfer-Encoding: chunked`
  - Verify each chunk is newline-delimited JSON
  - Verify final chunk contains `{"done": true}`
  - Verify server handles client disconnect without error (use `tokio::select!` with `drop` detection)

## 3. Code Review

- [ ] Verify `stream_logs` with `follow: true` is the **primary** wait mechanism (not polling)
- [ ] Verify polling is **only** triggered after `stream_logs` connection loss (not as default)
- [ ] Verify `MIN_POLL_INTERVAL` is exactly 1 second (1000ms, not 999ms or 1001ms)
- [ ] Verify `MAX_POLL_COUNT` is exactly 120 (not 119 or 121)
- [ ] Verify interval enforcement uses `sleep()` with calculated remainder (not fixed 1-second sleep)
- [ ] Verify max poll count is checked **before** each `get_run` call (not after)
- [ ] Verify `PollingTimeout` error includes run_id and max_polls in error message
- [ ] Verify traceability annotations `// [3_MCP_DESIGN-REQ-081]` appear on:
  - Constant definitions
  - Interval enforcement logic
  - Max poll count check
  - Error generation

## 4. Run Automated Tests to Verify

- [ ] Run E2E tests:
  ```bash
  cargo test -p devs-mcp --test agent_wait_protocol_test -- --nocapture
  ```
- [ ] Verify all five test cases pass:
  - `stream_logs_follow_blocks_until_stage_completion`
  - `tight_loop_polling_is_rejected`
  - `polling_fallback_after_connection_loss`
  - `polling_timeout_after_120_attempts`
  - `polling_interval_enforcement_with_jitter_tolerance`
- [ ] Run unit tests for wait strategy:
  ```bash
  cargo test -p devs-mcp wait_strategy -- --nocapture
  ```
- [ ] Verify interval enforcement test:
  ```bash
  cargo test -p devs-mcp polling_logger::tests::verify_min_interval -- --nocapture
  ```
- [ ] Verify no clippy warnings:
  ```bash
  cargo clippy -p devs-mcp --tests -- -D warnings
  ```

## 5. Update Documentation

- [ ] Update `docs/plan/specs/3_mcp_design.md` Section 2.5.3 (`stream_logs`):
  - Add subsection "2.5.3.1 Fallback Polling Protocol"
  - Document 1-second minimum interval requirement
  - Document 120-poll maximum before timeout
  - Include state diagram: Stream Active → Connection Lost → Polling → Completed/Timeout
- [ ] Update `docs/plan/specs/3_mcp_design.md` Section 3 (Agentic Development Loops):
  - Add subsection "3.1.3 Wait Logic and Polling Safety"
  - Document: "Never poll get_run in a tight loop"
  - Document: "Use stream_logs with follow:true as primary wait mechanism"
  - Document: "Polling is fallback only, triggered by connection loss"
- [ ] Update `.agent/MEMORY.md`:
  - Add entry: "Wait Logic Protocol (REQ-081)"
  - Document: "Primary: stream_logs(follow=true) — blocks until completion"
  - Document: "Fallback: get_run polling with 1s interval, max 120 polls"
  - Document: "Timeout after 120 polls: escalate to fatal error"
  - Document: "Never poll faster than 1 second — server will not reject, but agent must self-enforce"

## 6. Automated Verification

- [ ] Execute full presubmit:
  ```bash
  ./do presubmit 2>&1 | tee /tmp/presubmit_wait_protocol.txt
  ```
- [ ] Verify presubmit exits with code 0
- [ ] Check traceability report:
  ```bash
  cat target/traceability.json | jq '.covered_requirements | map(select(. == "3_MCP_DESIGN-REQ-081"))'
  ```
- [ ] Verify requirement ID appears in `target/traceability.json` with `covered: true`
- [ ] Run verification script if available:
  ```bash
  .tools/verify_requirements.py --ids 3_MCP_DESIGN-REQ-081
  ```
- [ ] Confirm no stale annotations or missing coverage warnings
- [ ] Verify coverage report shows `crates/devs-mcp/src/agent/wait_strategy.rs` has >= 90% line coverage
