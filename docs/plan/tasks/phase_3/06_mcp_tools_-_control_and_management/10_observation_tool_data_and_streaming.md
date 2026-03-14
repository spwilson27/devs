# Task: Observation Tool Data Contracts, Log Streaming, and Debug Business Rules (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-061], [3_MCP_DESIGN-REQ-062], [3_MCP_DESIGN-REQ-063], [3_MCP_DESIGN-REQ-064], [3_MCP_DESIGN-REQ-065], [3_MCP_DESIGN-REQ-066], [3_MCP_DESIGN-REQ-067], [3_MCP_DESIGN-REQ-068], [3_MCP_DESIGN-REQ-069], [3_MCP_DESIGN-REQ-070], [3_MCP_DESIGN-REQ-071], [3_MCP_DESIGN-REQ-072], [3_MCP_DESIGN-REQ-073], [3_MCP_DESIGN-REQ-074], [3_MCP_DESIGN-REQ-075], [3_MCP_DESIGN-REQ-076], [3_MCP_DESIGN-REQ-077], [3_MCP_DESIGN-REQ-078], [3_MCP_DESIGN-REQ-DBG-BR-006], [3_MCP_DESIGN-REQ-DBG-BR-007], [3_MCP_DESIGN-REQ-DBG-BR-008], [3_MCP_DESIGN-REQ-DBG-BR-009], [3_MCP_DESIGN-REQ-DBG-BR-010], [3_MCP_DESIGN-REQ-DBG-BR-011], [3_MCP_DESIGN-REQ-DBG-BR-012], [3_MCP_DESIGN-REQ-DBG-BR-017], [3_MCP_DESIGN-REQ-DBG-BR-018], [3_MCP_DESIGN-REQ-AC-4.17], [3_MCP_DESIGN-REQ-EC-MCP-002], [3_MCP_DESIGN-REQ-EC-MCP-003], [3_MCP_DESIGN-REQ-EC-MCP-006], [3_MCP_DESIGN-REQ-EC-MCP-011]

## Dependencies
- depends_on: ["09_mcp_server_shared_state_and_data_model.md"]
- shared_components: ["devs-scheduler (consumer — run/stage state, log buffers)", "devs-pool (consumer — pool state snapshots)", "devs-checkpoint (consumer — list_checkpoints)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/src/tools/observation/observation_tests.rs`
- [ ] **Test: `test_get_stage_output_stdout_stderr_never_null`** — Complete a stage with no output. Assert `stdout` and `stderr` fields are present as empty string `""`, never `null`. Covers [3_MCP_DESIGN-REQ-DBG-BR-007].
- [ ] **Test: `test_get_stage_output_truncation_1mib`** — Complete a stage with >1 MiB stdout. Assert response truncates to 1 MiB with truncation indicator. Covers [3_MCP_DESIGN-REQ-061].
- [ ] **Test: `test_get_stage_output_running_partial`** — Call `get_stage_output` on a Running stage. Assert response has `status: "running"`, `exit_code: null`, and partial stdout/stderr snapshot. Covers [3_MCP_DESIGN-REQ-DBG-BR-017].
- [ ] **Test: `test_get_stage_output_waiting_stage`** — Call on a Waiting stage. Assert appropriate empty/null response (no error, just no data yet). Covers [3_MCP_DESIGN-REQ-EC-MCP-003].
- [ ] **Test: `test_get_stage_output_fanout_index`** — Fan-out stage with 3 sub-agents. Call with `fan_out_index: 1`. Assert only sub-agent 1's output returned. Covers [3_MCP_DESIGN-REQ-DBG-BR-008].
- [ ] **Test: `test_stream_logs_line_splitting`** — Stream logs from a stage producing a line >32,768 bytes. Assert line is split at boundary into separate chunks with sequential sequence numbers. Covers [3_MCP_DESIGN-REQ-DBG-BR-006].
- [ ] **Test: `test_stream_logs_after_completed`** — Call `stream_logs` with `follow: true` on a completed run. Assert all buffered logs delivered, then stream closes (does not hang). Covers [3_MCP_DESIGN-REQ-EC-MCP-002].
- [ ] **Test: `test_stream_logs_invalid_run_id`** — Call with nonexistent run_id. Assert `not_found` error. Covers [3_MCP_DESIGN-REQ-EC-MCP-011].
- [ ] **Test: `test_get_pool_state_snapshot`** — Call `get_pool_state(pool_name)`. Assert response is a point-in-time snapshot taken under read lock with `available_slots = max_concurrent - active_count`. Covers [3_MCP_DESIGN-REQ-DBG-BR-009], [3_MCP_DESIGN-REQ-DBG-BR-010].
- [ ] **Test: `test_get_pool_state_all_rate_limited`** — Rate-limit all agents in a pool, then call `get_pool_state`. Assert all agents show rate-limited status with cooldown timestamps. Covers [3_MCP_DESIGN-REQ-EC-MCP-006].
- [ ] **Test: `test_get_pool_state_no_pool_name_returns_all`** — Call `get_pool_state` without `pool_name` parameter. Assert ALL pools returned (no pagination). Covers [3_MCP_DESIGN-REQ-DBG-BR-018].
- [ ] **Test: `test_list_checkpoints_spawn_blocking`** — Call `list_checkpoints`. Verify git2 operations run on `spawn_blocking` (no write lock held during I/O). Covers [3_MCP_DESIGN-REQ-DBG-BR-011].
- [ ] **Test: `test_list_checkpoints_default_limit_100`** — Create >100 checkpoints, call `list_checkpoints` without limit. Assert exactly 100 entries returned (default limit). Covers [3_MCP_DESIGN-REQ-DBG-BR-012].
- [ ] **Test: `test_list_checkpoints_never_written_branch`** — Call `list_checkpoints` for a project whose checkpoint branch was never created. Assert empty array with null error (not an error response). Covers [3_MCP_DESIGN-REQ-AC-4.17].
- [ ] **Test: `test_observation_tools_req_061_to_078`** — Additional tests covering [3_MCP_DESIGN-REQ-062] through [3_MCP_DESIGN-REQ-078] for specific observation tool data contracts (field presence, format, pagination, filtering).

## 2. Task Implementation
- [ ] Implement `get_stage_output` handler: return stdout/stderr as `""` (never null), truncate at 1 MiB, support `fan_out_index` parameter, return partial snapshot for Running stages
- [ ] Implement `stream_logs` handler: chunk lines >32,768 bytes at boundary with sequence numbers, close stream after delivering all logs for completed runs, validate run_id
- [ ] Implement `get_pool_state` handler: point-in-time snapshot under read lock, compute `available_slots = max_concurrent - active_count`, return all pools when no pool_name specified
- [ ] Implement `list_checkpoints` handler: use `spawn_blocking` for git2 operations, default limit 100, return empty array (not error) for never-written branches
- [ ] Ensure all observation tools acquire only read locks (parallel execution allowed)

## 3. Code Review
- [ ] Verify stdout/stderr are never serialized as `null` — always `""` for empty
- [ ] Verify `spawn_blocking` is used for all git2 calls in list_checkpoints
- [ ] Verify `available_slots` is computed at serialization time, not stored
- [ ] Verify stream_logs does not hold scheduler lock during follow-wait

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --lib tools::observation::observation_tests`

## 5. Update Documentation
- [ ] Doc comments on truncation limits, line splitting protocol, and snapshot semantics

## 6. Automated Verification
- [ ] Run `./do test` — all observation tests pass
- [ ] Run `./do lint` — zero warnings
