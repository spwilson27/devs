# Integration Test Plan

## Summary
- Total integration tests: 42
- Shared component tests: 14
- Cross-phase tests: 20
- End-to-end tests: 8

## Priority Order

### Priority 1: Shared Component Integration (Highest Risk)
1. **INT-001**: BoundedString Validation Across Config Boundaries
2. **INT-002**: State Machine Transitions in Scheduler Checkpoints
3. **INT-003**: TemplateResolver Integration with Stage Dispatch
4. **INT-004**: PhaseTransitionCheckpoint Schema Validation
5. **INT-005**: ServerConfig Loading and Override Chain
6. **INT-006**: Redacted Security Wrapper in MCP Config Exposure
7. **INT-007**: AgentAdapter Trait Object Safety and Invocation
8. **INT-008**: PoolManager Acquire/Release Lifecycle
9. **INT-009**: CheckpointManager Save/Restore Round-Trip
10. **INT-010**: ExecutionManager Environment Preparation and Cleanup
11. **INT-011**: Scheduler DAG Validation and Cycle Detection
12. **INT-012**: WebhookDispatcher Event Delivery
13. **INT-013**: Server Discovery Protocol Client Resolution
14. **INT-014**: Proto Wire Type Conversion Boundaries

### Priority 2: Cross-Phase Data Flow
15. **INT-015**: Phase 0 Core Types in Phase 1 Config Parsing
16. **INT-016**: Phase 1 Pool Config to Phase 2 Runtime PoolManager
17. **INT-017**: Phase 1 Checkpoint to Phase 2 Scheduler State Persistence
18. **INT-018**: Phase 1 Executor to Phase 2 Stage Dispatch
19. **INT-019**: Phase 2 Scheduler to Phase 3 gRPC Service Implementation
20. **INT-020**: Phase 2 Scheduler to Phase 3 MCP Tool Exposure
21. **INT-021**: Phase 2 Webhook to Phase 3 Server Lifecycle
22. **INT-022**: Template Variable Resolution Across Stage Boundaries
23. **INT-023**: Fan-Out Dispatch and Merge Handler Integration
24. **INT-024**: Retry and Timeout Enforcement Across Scheduler-Executor Boundary
25. **INT-025**: Multi-Project Scheduling with Shared Pool
26. **INT-026**: Workflow Definition Snapshotting at Run Start
27. **INT-027**: Agent Rate Limit Detection and Pool Fallback
28. **INT-028**: Stage Completion Signal Processing (Exit Code, Structured, MCP)
29. **INT-029**: Context File Generation and Agent Consumption
30. **INT-030**: Artifact Collection Post-Stage Completion
31. **INT-031**: Dependency-Driven Parallel Stage Scheduling
32. **INT-032**: Branch Predicate Routing to Named Handlers
33. **INT-033**: Pool Exhaustion Event to Webhook Notification
34. **INT-034**: Checkpoint Branch Configuration (Working vs Dedicated)

### Priority 3: End-to-End User Flows
35. **INT-035**: Complete Workflow Submission to Completion via CLI
36. **INT-036**: Complete Workflow Submission to Completion via MCP
37. **INT-037**: TUI Observation of Running Workflow State
38. **INT-038**: Workflow Cancel Mid-Run via CLI and TUI Verification
39. **INT-039**: Multi-Stage Workflow with Template Interpolation
40. **INT-040**: Fan-Out Workflow with Parallel Agent Execution
41. **INT-041**: Retry Loopback on Stage Failure
42. **INT-042**: Bootstrap Validation (COND-001, COND-002, COND-003)

---

## Test Scenarios

### INT-001: BoundedString Validation Across Config Boundaries
- **Components Under Test:** devs-core (BoundedString), devs-config (ServerConfig, PoolConfig), devs-pool (AgentPool)
- **Prerequisites:** Phase 0 complete (devs-core), Phase 1 complete (devs-config, devs-pool)
- **Interface Contract:** Interface #2 (devs-core: BoundedString), Interface #6 (devs-config: ServerConfig)
- **Steps:**
  1. Create a TOML config file with pool name exceeding 64 characters
  2. Create a TOML config file with empty pool name (0 characters)
  3. Create a TOML config file with valid pool name (1-64 characters)
  4. Call `ServerConfig::load()` with each config file
  5. Verify validation errors for cases 1 and 2, success for case 3
  6. Pass valid config to `AgentPool::new()` and verify construction succeeds
- **Expected Result:** 
  - Too-long name returns `BoundedStringError::TooLong { max: 64, actual: N }`
  - Too-short name returns `BoundedStringError::TooShort { min: 1, actual: 0 }`
  - Valid name constructs successfully and `pool.name()` returns the exact name

---

### INT-002: State Machine Transitions in Scheduler Checkpoints
- **Components Under Test:** devs-core (WorkflowRunState, StageRunState), devs-scheduler (Scheduler), devs-checkpoint (CheckpointManager)
- **Prerequisites:** Phase 0 complete (state machines), Phase 1 complete (checkpoint), Phase 2 complete (scheduler)
- **Interface Contract:** Interface #3 (devs-core: State Machines), Interface #10 (devs-checkpoint), Interface #12 (devs-scheduler)
- **Steps:**
  1. Submit a workflow run via `scheduler.submit_run()`
  2. Verify initial state is `WorkflowRunState::Pending`
  3. Trigger scheduler engine tick to transition to `Running`
  4. Call `checkpoint.save_checkpoint()` after state transition
  5. Attempt invalid transition `Completed -> Running` via state machine
  6. Restore checkpoint via `checkpoint.restore_checkpoints()`
  7. Verify restored run state matches saved state
- **Expected Result:**
  - Invalid transition returns `Err(InvalidTransition)`
  - Checkpoint save succeeds without error
  - Restored run has identical `run_id`, `status`, and `stages` as saved

---

### INT-003: TemplateResolver Integration with Stage Dispatch
- **Components Under Test:** devs-core (TemplateResolver), devs-scheduler (stage dispatch)
- **Prerequisites:** Phase 0 complete (TemplateResolver), Phase 2 complete (scheduler dispatch)
- **Interface Contract:** Interface #4 (devs-core: TemplateResolver), Interface #12 (devs-scheduler)
- **Steps:**
  1. Create workflow with stage prompt containing `{{input.task}}` and `{{stage.plan.summary}}`
  2. Submit run with input `task = "implement auth"`
  3. Complete "plan" stage with structured output `{ "summary": "Add OAuth2" }`
  4. Trigger dispatch of second stage
  5. Capture the resolved prompt passed to `executor.run_agent()`
- **Expected Result:** Resolved prompt is `"Task: implement auth. Plan: Add OAuth2"` with all placeholders replaced

---

### INT-004: PhaseTransitionCheckpoint Schema Validation
- **Components Under Test:** devs-core (PhaseTransitionCheckpoint), ./do lint (PTC validation)
- **Prerequisites:** Phase 0 complete (PTC schema), Phase N complete (for gate verification)
- **Interface Contract:** Interface #5 (devs-core: PhaseTransitionCheckpoint), Phase Transition Checkpoint Model
- **Steps:**
  1. Create a PTC JSON file with `verified: false` in a gate condition
  2. Create a PTC JSON file missing `platforms_verified` field
  3. Create a valid PTC JSON file with all required fields and `verified: true`
  4. Run `./do lint` with each PTC file present
  5. Verify lint fails for cases 1 and 2, passes for case 3
- **Expected Result:**
  - Case 1: lint fails with "gate condition not verified"
  - Case 2: lint fails with "missing required field: platforms_verified"
  - Case 3: lint passes PTC validation

---

### INT-005: ServerConfig Loading and Override Chain
- **Components Under Test:** devs-config (ServerConfig), devs-server (config loading)
- **Prerequisites:** Phase 1 complete (devs-config)
- **Interface Contract:** Interface #6 (devs-config: ServerConfig)
- **Steps:**
  1. Create `devs.toml` with `listen_addr = "127.0.0.1:7890"` and `mcp_port = 7891`
  2. Set env var `DEVS_MCP_PORT=9999`
  3. Call `ServerConfig::load()` with CLI override `--listen-addr 0.0.0.0:8888`
  4. Verify final config reflects override chain: TOML -> env -> CLI
- **Expected Result:** 
  - `listen_addr = "0.0.0.0:8888"` (CLI override wins)
  - `mcp_port = 9999` (env var overrides TOML default 7891)

---

### INT-006: Redacted Security Wrapper in MCP Config Exposure
- **Components Under Test:** devs-core (Redacted), devs-config (credentials), devs-mcp (get_config tool)
- **Prerequisites:** Phase 1 complete (Redacted, devs-config), Phase 3 complete (MCP server)
- **Interface Contract:** Interface #7 (Redacted<T>), Interface #6 (devs-config)
- **Steps:**
  1. Configure server with credential `api_key = "sk-secret-12345"` in TOML
  2. Start server and connect via MCP
  3. Call `get_config` MCP tool
  4. Verify response contains `[REDACTED]` not the actual key
  5. Call `Redacted::expose()` internally and verify value is accessible
- **Expected Result:**
  - MCP response shows `"api_key": "[REDACTED]"`
  - Internal access via `expose()` returns `"sk-secret-12345"`
  - `Debug` and `Display` impls output `[REDACTED]`

---

### INT-007: AgentAdapter Trait Object Safety and Invocation
- **Components Under Test:** devs-adapters (AgentAdapter trait), devs-pool (agent leasing)
- **Prerequisites:** Phase 1 complete (devs-adapters, devs-pool)
- **Interface Contract:** Interface #8 (devs-adapters: AgentAdapter)
- **Steps:**
  1. Create mock struct implementing `AgentAdapter`
  2. Box the mock as `Box<dyn AgentAdapter>`
  3. Call `tool()`, `build_command()`, `detect_rate_limit()` via trait object
  4. Verify object-safe usage in pool context
- **Expected Result:**
  - Trait object compiles without `Sized` constraint errors
  - `tool()` returns correct `ToolKind`
  - `build_command()` returns `AdapterCommand` with expected program/args/env
  - `detect_rate_limit()` returns `Some(RateLimitInfo)` for rate-limit stderr

---

### INT-008: PoolManager Acquire/Release Lifecycle
- **Components Under Test:** devs-pool (PoolManager), devs-scheduler (stage dispatch)
- **Prerequisites:** Phase 1 complete (devs-pool)
- **Interface Contract:** Interface #9 (devs-pool: Agent Pool Routing)
- **Steps:**
  1. Create pool with `max_concurrent = 2` and 2 agents
  2. Call `acquire_agent()` twice concurrently
  3. Verify both leases acquired successfully
  4. Call `acquire_agent()` a third time (should block/timeout)
  5. Call `release_agent()` on first lease
  6. Verify third acquire now succeeds
  7. Call `get_pool_state()` and verify `active_count` changes
- **Expected Result:**
  - First two acquires succeed immediately
  - Third acquire blocks until first release
  - `active_count` transitions 0 -> 1 -> 2 -> 1 -> 2

---

### INT-009: CheckpointManager Save/Restore Round-Trip
- **Components Under Test:** devs-checkpoint (CheckpointManager), devs-scheduler (WorkflowRun)
- **Prerequisites:** Phase 1 complete (devs-checkpoint)
- **Interface Contract:** Interface #10 (devs-checkpoint: Git-Backed State Persistence)
- **Steps:**
  1. Initialize git repo at temp path
  2. Create `CheckpointManager` pointing to repo
  3. Create `WorkflowRun` with 3 stages (one completed, two running)
  4. Call `save_checkpoint(&project, &run)`
  5. Verify `.devs/checkpoints/<run_id>.json` exists in git repo
  6. Call `restore_checkpoints(&project)`
  7. Verify restored run matches original
- **Expected Result:**
  - Checkpoint file committed to git
  - Restored run has identical `run_id`, `status`, `stages`, `attempt` counts
  - Git history shows checkpoint commit

---

### INT-010: ExecutionManager Environment Preparation and Cleanup
- **Components Under Test:** devs-executor (ExecutionManager), devs-adapters (AgentAdapter)
- **Prerequisites:** Phase 1 complete (devs-executor)
- **Interface Contract:** Interface #11 (devs-executor: Execution Environment Management)
- **Steps:**
  1. Call `prepare_environment(&ExecutionTarget::Tempdir, &project)`
  2. Verify repo cloned into temp dir
  3. Verify `DEVS_MCP_ADDR` present in `env_vars`
  4. Call `cleanup(env)`
  5. Verify temp dir removed
- **Expected Result:**
  - `working_dir` exists and contains cloned repo
  - `env_vars` contains `DEVS_MCP_ADDR`
  - Cleanup removes temp dir without error

---

### INT-011: Scheduler DAG Validation and Cycle Detection
- **Components Under Test:** devs-scheduler (DagGraph), devs-config (WorkflowDefinition)
- **Prerequisites:** Phase 2 complete (devs-scheduler DAG)
- **Interface Contract:** Interface #12 (devs-scheduler: DAG Workflow Engine)
- **Steps:**
  1. Create workflow with stages A->B->C (linear chain)
  2. Create workflow with cycle A->B->A
  3. Create workflow with unknown dependency (B depends_on "nonexistent")
  4. Call `scheduler.submit_run()` for each
- **Expected Result:**
  - Linear chain: run accepted, stages scheduled in order A, B, C
  - Cycle: `Err(SchedulerError::CycleDetected { cycle: vec!["A", "B", "A"] })`
  - Unknown dep: `Err(SchedulerError::InvalidInput("unknown dependency"))`

---

### INT-012: WebhookDispatcher Event Delivery
- **Components Under Test:** devs-webhook (WebhookDispatcher), devs-server (lifecycle)
- **Prerequisites:** Phase 2 complete (devs-webhook)
- **Interface Contract:** Interface #13 (devs-webhook: Outbound Notifications)
- **Steps:**
  1. Start mock HTTP server at `http://localhost:9999/hooks`
  2. Create `WebhookDispatcher` with target URL and `RunLifecycle` events
  3. Call `dispatcher.send(WebhookEvent::RunStarted { ... })`
  4. Verify POST received at mock server with correct JSON body
  5. Kill mock server and send another event
  6. Verify retry logic (3 attempts with backoff)
- **Expected Result:**
  - Mock server receives POST with `{"event": "run_started", "run_id": "...", ...}`
  - Retry logic attempts 3 times with 1s/5s/15s delays on failure

---

### INT-013: Server Discovery Protocol Client Resolution
- **Components Under Test:** devs-core (discovery protocol), devs-cli (client), devs-server (writer)
- **Prerequisites:** Phase 0 complete (protocol def), Phase 3 complete (server, CLI)
- **Interface Contract:** Interface #14 (Server Discovery Protocol)
- **Steps:**
  1. Start server (writes discovery file at `~/.config/devs/server.addr`)
  2. Run `devs status` without `--server` flag
  3. Set `DEVS_DISCOVERY_FILE=/tmp/test.addr` and write different address
  4. Run `devs status --server 192.168.1.5:7890`
  5. Verify resolution order: CLI flag > env var > default file
- **Expected Result:**
  - Step 2: CLI reads default discovery file, connects to server
  - Step 4: CLI reads `/tmp/test.addr`, connects to that address
  - Step 5: CLI ignores discovery, connects to `192.168.1.5:7890`

---

### INT-014: Proto Wire Type Conversion Boundaries
- **Components Under Test:** devs-proto (wire types), devs-scheduler (domain types), devs-grpc (conversion)
- **Prerequisites:** Phase 0 complete (devs-proto), Phase 2 complete (devs-scheduler)
- **Interface Contract:** Interface #1 (devs-proto), Interface #16 (Phase 0 -> Phase 2)
- **Steps:**
  1. Create `WorkflowRun` with devs-core domain types
  2. Convert to `devs_proto::devs::v1::WorkflowRun` via `From` trait
  3. Convert back via `TryFrom` trait
  4. Verify round-trip equality
  5. Verify `devs-scheduler` public API does not expose proto types
- **Expected Result:**
  - Round-trip conversion preserves all fields
  - `cargo tree -p devs-scheduler` shows no proto types in public API

---

### INT-015: Phase 0 Core Types in Phase 1 Config Parsing
- **Components Under Test:** devs-core (BoundedString, state machines), devs-config (TOML parsing)
- **Prerequisites:** Phase 0 complete, Phase 1 complete
- **Interface Contract:** Interface #15 (Phase 0 -> Phase 1: devs-core Domain Types)
- **Steps:**
  1. Parse TOML config with `scheduling_policy = "strict_priority"`
  2. Parse TOML config with `scheduling_policy = "invalid"`
  3. Verify `SchedulingPolicy` enum parsed correctly
  4. Verify `BoundedString` validation on pool names during parsing
- **Expected Result:**
  - Valid policy parses to `SchedulingPolicy::StrictPriority`
  - Invalid policy returns `ConfigError::InvalidValue`
  - Pool name validation happens during TOML deserialization

---

### INT-016: Phase 1 Pool Config to Phase 2 Runtime PoolManager
- **Components Under Test:** devs-config (PoolConfig), devs-pool (PoolManager, AgentPool)
- **Prerequisites:** Phase 1 complete (devs-config, devs-pool), Phase 2 complete (scheduler integration)
- **Interface Contract:** Interface #18 (Phase 1 -> Phase 2: devs-pool -> devs-scheduler)
- **Steps:**
  1. Define pool in TOML with 3 agents (claude, opencode, gemini) with capability tags
  2. Parse config via `ServerConfig::load()`
  3. Construct `PoolManager::new()` with parsed configs
  4. Call `acquire_agent("primary", &["code-gen"])`
  5. Verify agent selected matches capability and priority order
- **Expected Result:**
  - Pool constructed with agents in declaration order
  - Capability tags normalized to lowercase
  - First agent with matching capability returned

---

### INT-017: Phase 1 Checkpoint to Phase 2 Scheduler State Persistence
- **Components Under Test:** devs-checkpoint (CheckpointManager), devs-scheduler (Scheduler)
- **Prerequisites:** Phase 1 complete (devs-checkpoint), Phase 2 complete (devs-scheduler)
- **Interface Contract:** Interface #19 (Phase 1 -> Phase 2: devs-checkpoint -> devs-scheduler)
- **Steps:**
  1. Submit workflow run via scheduler
  2. Complete first stage
  3. Verify scheduler calls `checkpoint.save_checkpoint()` after stage completion
  4. Simulate server crash (kill process)
  5. Restart server and verify `restore_checkpoints()` recovers in-flight run
  6. Verify run resumes from checkpointed state
- **Expected Result:**
  - Checkpoint saved after each state transition
  - Restored run has same `run_id`, `stages`, and `attempt` counts
  - Scheduler resumes execution from recovered state

---

### INT-018: Phase 1 Executor to Phase 2 Stage Dispatch
- **Components Under Test:** devs-executor (ExecutionManager), devs-scheduler (stage dispatch)
- **Prerequisites:** Phase 1 complete (devs-executor), Phase 2 complete (devs-scheduler)
- **Interface Contract:** Interface #20 (Phase 1 -> Phase 2: devs-executor -> devs-scheduler)
- **Steps:**
  1. Scheduler identifies eligible stage
  2. Calls `executor.prepare_environment()`
  3. Calls `executor.run_agent()` with leased adapter
  4. Calls `executor.collect_artifacts(ArtifactMode::AutoCollect)`
  5. Calls `executor.cleanup()`
  6. Verify stage output captured and artifacts committed
- **Expected Result:**
  - Environment prepared with repo cloned and env vars injected
  - Agent executed and output captured
  - Artifacts diffed, committed, and pushed (auto-collect mode)
  - Environment cleaned up

---

### INT-019: Phase 2 Scheduler to Phase 3 gRPC Service Implementation
- **Components Under Test:** devs-scheduler (Scheduler), devs-grpc (WorkflowService)
- **Prerequisites:** Phase 2 complete (devs-scheduler), Phase 3 complete (devs-grpc)
- **Interface Contract:** Interface #21 (Phase 2 -> Phase 3: devs-scheduler -> devs-grpc)
- **Steps:**
  1. Start gRPC server with scheduler instance
  2. Call `SubmitRun` RPC with valid workflow
  3. Call `GetRun` RPC with returned `run_id`
  4. Call `ListRuns` RPC
  5. Call `CancelRun` RPC
  6. Verify gRPC error codes match spec (NOT_FOUND, FAILED_PRECONDITION, etc.)
- **Expected Result:**
  - `SubmitRun` returns `run_id` on success
  - `GetRun` returns full `WorkflowRun` state
  - `ListRuns` returns array of summaries
  - `CancelRun` transitions run to cancelled
  - Error cases return correct gRPC status codes

---

### INT-020: Phase 2 Scheduler to Phase 3 MCP Tool Exposure
- **Components Under Test:** devs-scheduler (Scheduler), devs-mcp (MCP tools)
- **Prerequisites:** Phase 2 complete (devs-scheduler), Phase 3 complete (devs-mcp)
- **Interface Contract:** Interface #22 (Phase 2 -> Phase 3: devs-scheduler -> devs-mcp)
- **Steps:**
  1. Start MCP server with scheduler instance
  2. Send JSON-RPC POST to `/mcp/v1/call` with `{"method": "submit_run", ...}`
  3. Send `{"method": "get_run", "params": {"run_id": "..."}}`
  4. Send `{"method": "list_runs", ...}`
  5. Send `{"method": "cancel_run", ...}`
  6. Verify JSON-RPC 2.0 response format
- **Expected Result:**
  - All tools callable via JSON-RPC
  - Responses include `jsonrpc: "2.0"` and matching `id`
  - Errors use standard JSON-RPC codes (-32602 for invalid params, etc.)

---

### INT-021: Phase 2 Webhook to Phase 3 Server Lifecycle
- **Components Under Test:** devs-webhook (WebhookDispatcher), devs-server (startup/shutdown)
- **Prerequisites:** Phase 2 complete (devs-webhook), Phase 3 complete (devs-server)
- **Interface Contract:** Interface #23 (Phase 2 -> Phase 3: devs-webhook -> devs-server)
- **Steps:**
  1. Start server with webhook targets configured
  2. Verify `webhook.start()` called during startup
  3. Submit workflow run
  4. Verify `RunStarted` webhook sent
  5. Stop server gracefully
  6. Verify `webhook_handle.abort()` called during shutdown
- **Expected Result:**
  - Webhook dispatcher initialized at startup
  - Events sent asynchronously during run lifecycle
  - Dispatcher shut down cleanly on server exit

---

### INT-022: Template Variable Resolution Across Stage Boundaries
- **Components Under Test:** devs-core (TemplateResolver), devs-scheduler (stage dispatch)
- **Prerequisites:** Phase 0 complete (TemplateResolver), Phase 2 complete (scheduler)
- **Interface Contract:** Interface #4 (TemplateResolver), Interface #12 (devs-scheduler)
- **Steps:**
  1. Create 3-stage workflow: A -> B -> C
  2. Stage A outputs `{ "sha": "abc123", "status": "success" }`
  3. Stage B prompt: `"Deploying {{stage.A.sha}}..."`
  4. Stage C prompt: `"Result: {{stage.A.status}}, {{stage.B.exit_code}}"`
  5. Submit run and complete all stages
  6. Verify resolved prompts at each stage
- **Expected Result:**
  - Stage B receives `"Deploying abc123..."`
  - Stage C receives `"Result: success, 0"` (assuming B exits 0)
  - Exit codes accessible via `{{stage.<name>.exit_code}}`

---

### INT-023: Fan-Out Dispatch and Merge Handler Integration
- **Components Under Test:** devs-scheduler (fan-out dispatch), devs-config (FanOutConfig)
- **Prerequisites:** Phase 2 complete (fan-out implementation)
- **Interface Contract:** Interface #12 (devs-scheduler), Interface #6 (FanOutConfig)
- **Steps:**
  1. Create workflow with fan-out stage (count: 3)
  2. Configure merge handler (default or named)
  3. Submit run
  4. Verify 3 parallel agents spawned
  5. Verify all 3 complete before merge stage starts
  6. Verify merge handler receives array of 3 results
- **Expected Result:**
  - 3 agents run concurrently (respecting pool concurrency)
  - Merge stage waits for all fan-out agents
  - Merge handler receives `[{...}, {...}, {...}]` array

---

### INT-024: Retry and Timeout Enforcement Across Scheduler-Executor Boundary
- **Components Under Test:** devs-scheduler (retry logic), devs-executor (timeout enforcement)
- **Prerequisites:** Phase 2 complete (scheduler retry/timeouts)
- **Interface Contract:** Interface #12 (devs-scheduler), Interface #11 (devs-executor)
- **Steps:**
  1. Create stage with `retry: { max_attempts: 3, backoff: "exponential" }`
  2. Create stage with `timeout: "30s"`
  3. Simulate stage failure (exit code 1)
  4. Verify retry with backoff (1s, 2s, 4s delays)
  5. Simulate stage hanging (no output for 30s)
  6. Verify timeout signal sent and stage marked failed
- **Expected Result:**
  - Retry attempts up to max with exponential backoff
  - Timeout sends cancel signal after duration
  - Stage transitions to `Failed` after exhausting retries or timeout

---

### INT-025: Multi-Project Scheduling with Shared Pool
- **Components Under Test:** devs-scheduler (multi-project), devs-pool (shared pool)
- **Prerequisites:** Phase 2 complete (multi-project scheduling)
- **Interface Contract:** Interface #12 (devs-scheduler), Interface #9 (devs-pool)
- **Steps:**
  1. Register two projects with different priorities
  2. Submit workflow runs for both projects simultaneously
  3. Verify higher-priority project gets agents first (strict priority)
  4. Verify weighted fair queuing if configured
  5. Verify pool exhaustion events fire correctly
- **Expected Result:**
  - Higher-priority project's stages dispatched first
  - Pool shared across projects without isolation
  - `PoolExhausted` event fires once per episode

---

### INT-026: Workflow Definition Snapshotting at Run Start
- **Components Under Test:** devs-checkpoint (snapshot_definition), devs-scheduler (run submission)
- **Prerequisites:** Phase 1 complete (devs-checkpoint), Phase 2 complete (devs-scheduler)
- **Interface Contract:** Interface #10 (devs-checkpoint), Interface #12 (devs-scheduler)
- **Steps:**
  1. Submit workflow run
  2. Modify workflow TOML file while run is in progress
  3. Complete run
  4. Load snapshot from `.devs/snapshots/<snapshot_id>`
  5. Verify snapshot matches original submission-time definition, not modified version
- **Expected Result:**
  - Snapshot created atomically at run start
  - Snapshot content matches submitted definition exactly
  - Later modifications to live definition do not affect snapshot

---

### INT-027: Agent Rate Limit Detection and Pool Fallback
- **Components Under Test:** devs-adapters (rate limit detection), devs-pool (cooldown), devs-scheduler (fallback)
- **Prerequisites:** Phase 1 complete (adapters, pool), Phase 2 complete (scheduler)
- **Interface Contract:** Interface #8 (devs-adapters), Interface #9 (devs-pool)
- **Steps:**
  1. Configure pool with primary agent (claude) and fallback agents (opencode, gemini)
  2. Simulate rate limit error in claude adapter stderr
  3. Verify `detect_rate_limit()` returns `Some(RateLimitInfo)`
  4. Verify `pool.report_rate_limit()` marks claude on cooldown
  5. Verify next stage dispatch uses fallback agent
- **Expected Result:**
  - Rate limit detected from stderr pattern
  - Rate-limited agent marked unavailable until cooldown expires
  - Fallback agent selected from pool

---

### INT-028: Stage Completion Signal Processing (Exit Code, Structured, MCP)
- **Components Under Test:** devs-scheduler (completion signal processing), devs-executor (output capture)
- **Prerequisites:** Phase 2 complete (devs-scheduler)
- **Interface Contract:** Interface #12 (devs-scheduler)
- **Steps:**
  1. Create stage with `completion: "exit_code"`
  2. Create stage with `completion: "structured_output"`
  3. Create stage with `completion: "mcp_tool_call"`
  4. Run each stage and verify completion detection
  5. For structured output, verify JSON parsed and stored
  6. For MCP, verify `signal_completion()` tool call detected
- **Expected Result:**
  - Exit code: stage completes when process exits with 0
  - Structured: JSON parsed from stdout, stored in `stage.output`
  - MCP: completion signal received via MCP tool call

---

### INT-029: Context File Generation and Agent Consumption
- **Components Under Test:** devs-executor (context file), devs-adapters (agent invocation)
- **Prerequisites:** Phase 1 complete (devs-executor)
- **Interface Contract:** Interface #11 (devs-executor)
- **Steps:**
  1. Complete stage A with output
  2. Prepare environment for stage B (depends on A)
  3. Verify context file written at `.devs/context/<run_id>/<stage_b>.json`
  4. Verify context file contains full output of stage A
  5. Verify agent receives context file path in invocation
- **Expected Result:**
  - Context file contains prior stage outputs
  - Agent can read context file for full history
  - Context file path passed via env var or flag

---

### INT-030: Artifact Collection Post-Stage Completion
- **Components Under Test:** devs-executor (artifact collection), devs-checkpoint (git commit)
- **Prerequisites:** Phase 1 complete (devs-executor, devs-checkpoint)
- **Interface Contract:** Interface #11 (devs-executor)
- **Steps:**
  1. Run stage with `artifact_mode: "auto_collect"`
  2. Agent modifies files in working directory
  3. Call `collect_artifacts(ArtifactMode::AutoCollect)`
  4. Verify working directory diffed
  5. Verify changes committed and pushed
  6. Run stage with `artifact_mode: "agent_driven"`
  7. Verify no auto-commit (agent responsible)
- **Expected Result:**
  - Auto-collect: changes committed with descriptive message
  - Agent-driven: no automatic commit, agent must commit via git

---

### INT-031: Dependency-Driven Parallel Stage Scheduling
- **Components Under Test:** devs-scheduler (DAG engine), devs-pool (concurrent dispatch)
- **Prerequisites:** Phase 2 complete (devs-scheduler DAG)
- **Interface Contract:** Interface #12 (devs-scheduler)
- **Steps:**
  1. Create diamond DAG: A -> {B, C} -> D
  2. Submit run
  3. Verify A runs first
  4. Verify B and C run in parallel after A completes
  5. Verify D waits for both B and C
  6. Measure time: B+C parallel should be ~max(B,C) not sum(B,C)
- **Expected Result:**
  - Topological order respected
  - Independent stages (B, C) dispatched concurrently
  - Merge stage (D) waits for all dependencies

---

### INT-032: Branch Predicate Routing to Named Handlers
- **Components Under Test:** devs-config (BranchPredicate), devs-scheduler (branch routing)
- **Prerequisites:** Phase 2 complete (branching)
- **Interface Contract:** Interface #6 (BranchConfig), Interface #12 (devs-scheduler)
- **Steps:**
  1. Create stage with branch predicates: `exit_code == 0 -> "success"`, `exit_code != 0 -> "retry"`
  2. Create stage with named handler: `handler: "review_router"`
  3. Simulate exit code 0
  4. Simulate exit code 1
  5. Verify routing to correct target stages
- **Expected Result:**
  - Built-in predicates route correctly
  - Named handler called with stage context
  - Handler return value determines next stage

---

### INT-033: Pool Exhaustion Event to Webhook Notification
- **Components Under Test:** devs-pool (PoolExhausted event), devs-webhook (event delivery)
- **Prerequisites:** Phase 1 complete (pool), Phase 2 complete (webhook)
- **Interface Contract:** Interface #9 (devs-pool), Interface #13 (devs-webhook)
- **Steps:**
  1. Configure pool with `max_concurrent = 2` and 2 agents
  2. Acquire both agents
  3. Attempt third acquire (triggers exhaustion)
  4. Verify `PoolExhausted` event emitted
  5. Verify webhook sent to configured targets
  6. Verify event fires once (not repeatedly while exhausted)
- **Expected Result:**
  - `PoolExhausted { pool_name, timestamp }` emitted
  - Webhook POST sent with event payload
  - Event fires once per episode, not repeatedly

---

### INT-034: Checkpoint Branch Configuration (Working vs Dedicated)
- **Components Under Test:** devs-checkpoint (CheckpointManager), devs-config (ProjectEntry)
- **Prerequisites:** Phase 1 complete (devs-checkpoint)
- **Interface Contract:** Interface #10 (devs-checkpoint)
- **Steps:**
  1. Configure project with `checkpoint_branch: null` (working branch)
  2. Configure project with `checkpoint_branch: "devs/state"`
  3. Save checkpoint for each
  4. Verify checkpoint committed to correct branch
  5. Verify branch created if doesn't exist
- **Expected Result:**
  - Working branch: checkpoint in `.devs/checkpoints/` on main branch
  - Dedicated branch: checkpoint on `devs/state` branch
  - Branch created automatically if missing

---

### INT-035: Complete Workflow Submission to Completion via CLI
- **Components Under Test:** devs-cli (submit, status, logs), devs-server (gRPC), devs-scheduler (execution)
- **Prerequisites:** Phase 3 complete (CLI, server), Phase 2 complete (scheduler)
- **Interface Contract:** Interface #21 (Scheduler -> gRPC), Interface #14 (Server Discovery)
- **Steps:**
  1. Start server
  2. Run `devs submit presubmit-check --name "test-run"`
  3. Capture `run_id` from output
  4. Run `devs status <run_id>` until completed
  5. Run `devs logs <run_id>` to view full output
  6. Verify exit code 0 on completion
- **Expected Result:**
  - Submit returns UUID `run_id`
  - Status shows stage progression: pending -> running -> completed
  - Logs show all stage outputs
  - CLI exits 0 on successful completion

---

### INT-036: Complete Workflow Submission to Completion via MCP
- **Components Under Test:** devs-mcp (submit_run, get_run), devs-server (MCP), devs-scheduler (execution)
- **Prerequisites:** Phase 3 complete (MCP server), Phase 2 complete (scheduler)
- **Interface Contract:** Interface #22 (Scheduler -> MCP)
- **Steps:**
  1. Start server with MCP enabled
  2. Send JSON-RPC: `{"method": "submit_run", "params": {"workflow": "presubmit-check"}}`
  3. Capture `run_id` from response
  4. Poll `{"method": "get_run", "params": {"run_id": "..."}}` until completed
  5. Verify JSON-RPC 2.0 format throughout
- **Expected Result:**
  - Submit returns `{"jsonrpc": "2.0", "id": 1, "result": {"run_id": "..."}}`
  - Poll returns updated status each time
  - Final status is `"completed"`

---

### INT-037: TUI Observation of Running Workflow State
- **Components Under Test:** devs-tui (dashboard, logs), devs-grpc (streaming), devs-scheduler (state)
- **Prerequisites:** Phase 3 complete (TUI, gRPC), Phase 2 complete (scheduler)
- **Interface Contract:** Interface #21 (Scheduler -> gRPC)
- **Steps:**
  1. Start server
  2. Start TUI client
  3. Submit workflow from TUI or CLI
  4. Verify TUI dashboard shows real-time stage graph
  5. Verify TUI logs tab streams stage output
  6. Verify TUI debug tab shows working directory diff
- **Expected Result:**
  - Dashboard shows DAG with stage status colors
  - Logs tab streams output in real-time
  - Debug tab shows file changes per stage

---

### INT-038: Workflow Cancel Mid-Run via CLI and TUI Verification
- **Components Under Test:** devs-cli (cancel), devs-tui (observation), devs-scheduler (cancel_run)
- **Prerequisites:** Phase 3 complete (CLI, TUI), Phase 2 complete (scheduler)
- **Interface Contract:** Interface #21 (Scheduler -> gRPC), Interface #12 (devs-scheduler)
- **Steps:**
  1. Start long-running workflow
  2. Run `devs cancel <run_id>`
  3. Verify TUI shows stages transitioned to `cancelled`
  4. Verify running agents received cancel signal
  5. Verify run status is `Cancelled`
- **Expected Result:**
  - CLI exits 0 on successful cancel
  - TUI shows cancelled stages
  - Agents terminated gracefully
  - Run status is terminal `Cancelled`

---

### INT-039: Multi-Stage Workflow with Template Interpolation
- **Components Under Test:** devs-scheduler (template resolution), devs-core (TemplateResolver)
- **Prerequisites:** Phase 0 complete (TemplateResolver), Phase 2 complete (scheduler)
- **Interface Contract:** Interface #4 (TemplateResolver), Interface #12 (devs-scheduler)
- **Steps:**
  1. Create workflow with inputs: `task`, `branch`
  2. Stage 1 prompt: `"Plan implementation for {{input.task}} on {{input.branch}}"`
  3. Stage 2 prompt: `"Implement: {{input.task}}. Plan summary: {{stage.plan.summary}}"`
  4. Submit with `--input task="auth" --input branch="main"`
  5. Verify both prompts resolved correctly
- **Expected Result:**
  - Stage 1 receives `"Plan implementation for auth on main"`
  - Stage 2 receives interpolated plan summary
  - All `{{input.*}}` and `{{stage.*.*}}` resolved

---

### INT-040: Fan-Out Workflow with Parallel Agent Execution
- **Components Under Test:** devs-scheduler (fan-out), devs-pool (concurrent agents)
- **Prerequisites:** Phase 2 complete (fan-out implementation)
- **Interface Contract:** Interface #12 (devs-scheduler), Interface #9 (devs-pool)
- **Steps:**
  1. Create workflow with fan-out stage (count: 5)
  2. Configure pool with `max_concurrent = 10`
  3. Submit run
  4. Verify all 5 agents start within 1 second of each other
  5. Verify merge stage waits for all 5
  6. Measure total time ≈ max(individual times), not sum
- **Expected Result:**
  - 5 agents spawned concurrently
  - Pool concurrency respected
  - Merge stage starts after all complete

---

### INT-041: Retry Loopback on Stage Failure
- **Components Under Test:** devs-scheduler (retry, branching), devs-config (RetryConfig)
- **Prerequisites:** Phase 2 complete (retry, branching)
- **Interface Contract:** Interface #12 (devs-scheduler), Interface #6 (RetryConfig)
- **Steps:**
  1. Create stage with `retry: { max_attempts: 3 }` and branch loopback to self on failure
  2. Simulate failure on first two attempts
  3. Simulate success on third attempt
  4. Verify stage eventually completes
  5. Verify `attempt` counter increments
- **Expected Result:**
  - Stage retries up to 3 times
  - Branch routes back to same stage on failure
  - Third attempt succeeds, stage completes

---

### INT-042: Bootstrap Validation (COND-001, COND-002, COND-003)
- **Components Under Test:** devs-server (startup), devs-cli (submit, status), devs-scheduler (execution)
- **Prerequisites:** Phase 3 complete (server, CLI), Phase 2 complete (scheduler)
- **Interface Contract:** Interface #24 (Phase 3 -> Phase 4: Bootstrap Validation)
- **Steps:**
  1. Start server
  2. Verify discovery file exists at `~/.config/devs/server.addr`
  3. Run `devs project add /path/to/devs --priority 1`
  4. Run `devs submit presubmit-check --format json`
  5. Verify exit code 0 and valid UUID in output
  6. Poll `devs status <run_id>` until terminal
  7. Verify status is `"completed"` with all stages completed
- **Expected Result:**
  - COND-001: Discovery file valid, HealthCheck returns healthy
  - COND-002: Submit exits 0, output contains UUID4 run_id
  - COND-003: Final status is `"completed"`, all stages `"completed"`

---

## Appendix: Test Execution Order

Tests should be executed in priority order after each phase completes:

### After Phase 0:
- INT-001, INT-002, INT-003, INT-004, INT-013 (shared component foundations)

### After Phase 1:
- INT-005, INT-006, INT-007, INT-008, INT-009, INT-010, INT-014, INT-015, INT-016, INT-017, INT-018, INT-026, INT-027, INT-029, INT-030, INT-034

### After Phase 2:
- INT-011, INT-012, INT-019, INT-020, INT-021, INT-022, INT-023, INT-024, INT-025, INT-028, INT-031, INT-032, INT-033

### After Phase 3:
- INT-035, INT-036, INT-037, INT-038, INT-039, INT-040, INT-041, INT-042 (end-to-end flows)

### After Phase 4:
- Re-run INT-042 (Bootstrap Validation) as final gate

---

## Traceability Matrix

| Test ID | Requirements Covered |
|---------|---------------------|
| INT-001 | 2_TAS-REQ-001E, 2_TAS-REQ-013 |
| INT-002 | 2_TAS-REQ-019, 2_TAS-REQ-020, 2_TAS-REQ-014 |
| INT-003 | 1_PRD-REQ-012, 2_TAS-REQ-021 |
| INT-004 | ROAD-SCHEMA-001, ROAD-SCHEMA-016 |
| INT-005 | 2_TAS-REQ-013, 2_TAS-REQ-013A |
| INT-006 | SEC-001, SEC-002 |
| INT-007 | 2_TAS-REQ-034, 1_PRD-REQ-014 |
| INT-008 | 2_TAS-REQ-002N, 1_PRD-REQ-019 |
| INT-009 | 2_TAS-REQ-014, 2_TAS-REQ-014A |
| INT-010 | 2_TAS-REQ-020A, 2_TAS-REQ-020B |
| INT-011 | 1_PRD-REQ-004, 2_TAS-REQ-021 |
| INT-012 | 2_TAS-REQ-600, 2_TAS-REQ-603 |
| INT-013 | 2_TAS-REQ-001J, 2_TAS-REQ-002A |
| INT-014 | 2_TAS-REQ-001G, 2_TAS-REQ-008 |
| INT-015 | 2_TAS-REQ-001E, 2_TAS-REQ-013 |
| INT-016 | 1_PRD-REQ-019, 2_TAS-REQ-002N |
| INT-017 | 2_TAS-REQ-014, 2_TAS-REQ-021 |
| INT-018 | 2_TAS-REQ-020A, 2_TAS-REQ-021 |
| INT-019 | 1_PRD-REQ-001, 2_TAS-REQ-052 |
| INT-020 | 2_TAS-REQ-048, 2_TAS-REQ-071 |
| INT-021 | 2_TAS-REQ-600, 2_TAS-REQ-605 |
| INT-022 | 1_PRD-REQ-012, 2_TAS-REQ-022 |
| INT-023 | 1_PRD-REQ-006, 2_TAS-REQ-026 |
| INT-024 | 1_PRD-REQ-008, 1_PRD-REQ-009 |
| INT-025 | 1_PRD-REQ-010, 2_TAS-REQ-030 |
| INT-026 | 1_PRD-REQ-003, 2_TAS-REQ-014B |
| INT-027 | 1_PRD-REQ-017, 2_TAS-REQ-037 |
| INT-028 | 1_PRD-REQ-005, 2_TAS-REQ-023 |
| INT-029 | 1_PRD-REQ-012, 2_TAS-REQ-020A |
| INT-030 | 1_PRD-REQ-013, 2_TAS-REQ-020B |
| INT-031 | 1_PRD-REQ-004, 2_TAS-REQ-021 |
| INT-032 | 1_PRD-REQ-002, 2_TAS-REQ-025 |
| INT-033 | 1_PRD-REQ-020, 2_TAS-REQ-604 |
| INT-034 | 2_TAS-REQ-014, 2_TAS-REQ-014A |
| INT-035 | 1_PRD-REQ-023, 2_TAS-REQ-060 |
| INT-036 | 1_PRD-REQ-025, 2_TAS-REQ-048 |
| INT-037 | 1_PRD-REQ-024, 2_TAS-REQ-072 |
| INT-038 | 1_PRD-REQ-027, 2_TAS-REQ-054 |
| INT-039 | 1_PRD-REQ-012, 1_PRD-REQ-011 |
| INT-040 | 1_PRD-REQ-006, 1_PRD-REQ-019 |
| INT-041 | 1_PRD-REQ-008, 1_PRD-REQ-002 |
| INT-042 | ROAD-008, COND-001, COND-002, COND-003 |
