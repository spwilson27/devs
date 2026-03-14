# Task: Agent State, Context Management, and Session Tracking (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-NEW-006], [3_MCP_DESIGN-REQ-NEW-024], [3_MCP_DESIGN-REQ-NEW-025], [3_MCP_DESIGN-REQ-NEW-026], [3_MCP_DESIGN-REQ-NEW-027], [3_MCP_DESIGN-REQ-NEW-028], [3_MCP_DESIGN-REQ-NEW-030], [3_MCP_DESIGN-REQ-NEW-031], [3_MCP_DESIGN-REQ-NEW-033], [3_MCP_DESIGN-REQ-NEW-034], [3_MCP_DESIGN-REQ-EC-CTX-001], [3_MCP_DESIGN-REQ-EC-CTX-002], [3_MCP_DESIGN-REQ-EC-CTX-003], [3_MCP_DESIGN-REQ-EC-CTX-004], [3_MCP_DESIGN-REQ-EC-CTX-005], [3_MCP_DESIGN-REQ-EC-CTX-006], [3_MCP_DESIGN-REQ-EC-CTX-007], [3_MCP_DESIGN-REQ-EC-CTX-008], [3_MCP_DESIGN-REQ-EC-CTX-009], [3_MCP_DESIGN-REQ-EC-CTX-010]

## Dependencies
- depends_on: ["08_filesystem_mcp_tools.md", "09_mcp_server_shared_state_and_data_model.md"]
- shared_components: ["devs-core (consumer — BoundedString, schema validation)", "devs-scheduler (consumer — run state for recovery)", "Server Discovery Protocol (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/src/tools/context/context_tests.rs`
- [ ] **Test: `test_agent_state_tracking_in_memory`** — Make several MCP calls from a session. Assert server tracks agent state (call count, last tool used) in memory per session. Covers [3_MCP_DESIGN-REQ-NEW-006].
- [ ] **Test: `test_context_load_hard_limit`** — Attempt to read a response exceeding per-call hard limit. Assert response is truncated or paginated. Covers [3_MCP_DESIGN-REQ-NEW-024].
- [ ] **Test: `test_narrowing_before_large_read`** — Verify that `get_stage_output` on large output suggests narrowing (field selection or line range) before returning full content. Covers [3_MCP_DESIGN-REQ-NEW-025].
- [ ] **Test: `test_context_clear_recovery`** — Clear agent context, then verify recovery from durable sources (task_state.json, workflow_snapshot.json). Assert agent can reconstruct working state. Covers [3_MCP_DESIGN-REQ-NEW-026].
- [ ] **Test: `test_recovery_sequence_order`** — Verify recovery uses MCP tools in order: (1) read task_state.json, (2) call get_run, (3) call get_stage_output for completed stages. Covers [3_MCP_DESIGN-REQ-NEW-027].
- [ ] **Test: `test_workflow_snapshot_schema`** — Verify `workflow_snapshot.json` contains WorkflowDefinition + metadata fields (snapshot_id, created_at, definition_hash). Covers [3_MCP_DESIGN-REQ-NEW-028].
- [ ] **Test: `test_inter_session_state_persistence`** — Write to `.devs/agent-state/session-<id>.json`, restart session, read back. Assert state persisted. Covers [3_MCP_DESIGN-REQ-NEW-030].
- [ ] **Test: `test_task_state_json_schema`** — Validate task_state.json schema: `{session_id, workflow_name, run_id, completed_tasks: [], in_progress: null|string, created_at, updated_at}`. Covers [3_MCP_DESIGN-REQ-NEW-031].
- [ ] **Test: `test_session_file_merge`** — Two session files exist with overlapping completed tasks. Assert merge produces union of completed, most recent in_progress wins. Covers [3_MCP_DESIGN-REQ-NEW-033].
- [ ] **Test: `test_devs_context_json_schema`** — Verify `.devs_context.json` at `<working_dir>/.devs_context.json` with expected schema. Covers [3_MCP_DESIGN-REQ-NEW-034].
- [ ] **Test: `test_context_cleared_mid_tdd`** — Agent context is cleared during a TDD cycle. Assert recovery from task_state.json allows continuation. Covers [3_MCP_DESIGN-REQ-EC-CTX-001].
- [ ] **Test: `test_list_runs_multiple_running_crashed_session`** — After a crashed session, `list_runs` returns multiple Running runs. Assert agent can identify and handle stale runs. Covers [3_MCP_DESIGN-REQ-EC-CTX-002].
- [ ] **Test: `test_corrupt_task_state_json`** — Write invalid JSON to task_state.json. Assert graceful handling (error message, not crash). Covers [3_MCP_DESIGN-REQ-EC-CTX-003].
- [ ] **Test: `test_missing_traceability_json`** — Call when `target/traceability.json` doesn't exist. Assert appropriate error or empty result. Covers [3_MCP_DESIGN-REQ-EC-CTX-004].
- [ ] **Test: `test_concurrent_sessions_overwrite`** — Two sessions write to same state file concurrently. Assert last-write-wins with no corruption (atomic writes). Covers [3_MCP_DESIGN-REQ-EC-CTX-005].
- [ ] **Test: `test_missing_workflow_snapshot`** — Run references a workflow_snapshot.json that doesn't exist. Assert graceful error. Covers [3_MCP_DESIGN-REQ-EC-CTX-006].
- [ ] **Test: `test_devs_context_exceeds_10mib`** — `.devs_context.json` exceeds 10 MiB. Assert truncation or rejection with appropriate error. Covers [3_MCP_DESIGN-REQ-EC-CTX-007].
- [ ] **Test: `test_task_state_references_deleted_run`** — task_state.json references a run_id that was deleted by retention. Assert graceful handling (start fresh). Covers [3_MCP_DESIGN-REQ-EC-CTX-008].
- [ ] **Test: `test_agent_push_fails`** — Agent's git push fails. Assert error reported via MCP, no state corruption. Covers [3_MCP_DESIGN-REQ-EC-CTX-009].
- [ ] **Test: `test_unrecognized_schema_version`** — task_state.json has an unknown schema version. Assert forward-compatible handling or clear error. Covers [3_MCP_DESIGN-REQ-EC-CTX-010].

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/src/tools/context/mod.rs` with agent state tracking, context file management, and recovery logic
- [ ] Implement in-memory agent state tracker: `HashMap<SessionId, AgentSessionState>` tracking call history, current tool, session start time
- [ ] Implement `task_state.json` read/write logic with schema validation (`session_id`, `workflow_name`, `run_id`, `completed_tasks`, `in_progress`, `created_at`, `updated_at`)
- [ ] Implement `workflow_snapshot.json` schema: `WorkflowDefinition` + `snapshot_id`, `created_at`, `definition_hash`
- [ ] Implement `.devs_context.json` read/write at `<working_dir>/.devs_context.json` with 10 MiB size limit
- [ ] Implement session file merge algorithm: union of `completed_tasks`, most recent `in_progress` wins, latest `updated_at` timestamp
- [ ] Implement recovery sequence: read task_state.json → get_run → get_stage_output for completed stages
- [ ] Implement inter-session state persistence under `.devs/agent-state/session-<id>.json`
- [ ] All file writes use atomic temp-file + rename pattern
- [ ] Handle corrupt/missing files gracefully: log warning, return appropriate error, never crash

## 3. Code Review
- [ ] Verify all file writes are atomic (temp + rename)
- [ ] Verify 10 MiB limit on .devs_context.json is enforced
- [ ] Verify session merge algorithm correctly handles overlapping completed_tasks (set union, no duplicates)
- [ ] Verify corrupt file handling doesn't panic

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --lib tools::context::context_tests`

## 5. Update Documentation
- [ ] Doc comments on state file schemas, merge algorithm, and recovery sequence

## 6. Automated Verification
- [ ] Run `./do test` — all context tests pass
- [ ] Run `./do lint` — zero warnings
