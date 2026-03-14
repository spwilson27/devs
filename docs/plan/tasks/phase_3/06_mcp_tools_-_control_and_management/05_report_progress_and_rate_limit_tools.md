# Task: Implement report_progress and report_rate_limit MCP Tools (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-025], [3_MCP_DESIGN-REQ-026], [3_MCP_DESIGN-REQ-EC-AGENT-002], [3_MCP_DESIGN-REQ-EC-AGENT-003], [3_MCP_DESIGN-REQ-EC-MCP-013]

## Dependencies
- depends_on: ["01_submit_run_tool.md"]
- shared_components: ["devs-scheduler (consumer — progress tracking)", "devs-pool (consumer — report_rate_limit, cooldown timestamps)", "devs-core (consumer — StageRunState)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/src/tools/callbacks/progress_rate_limit_tests.rs`
- [ ] **Test: `test_report_progress_success`** — Call `report_progress(run_id, stage_name, percentage: 50)`. Assert acknowledgement returned and stage progress metadata updated to 50. Covers [3_MCP_DESIGN-REQ-025].
- [ ] **Test: `test_report_progress_boundary_values`** — Call with `percentage: 0` and `percentage: 100`. Assert both accepted. Covers [3_MCP_DESIGN-REQ-025].
- [ ] **Test: `test_report_progress_out_of_range`** — Call with `percentage: 101` and `percentage: -1`. Assert `invalid_argument` error for each: "percentage must be in [0, 100]". Covers [3_MCP_DESIGN-REQ-EC-AGENT-002].
- [ ] **Test: `test_report_progress_on_cancelled_stage`** — Call `report_progress` on a `Cancelled` stage. Assert `failed_precondition` error (stage not running). Covers [3_MCP_DESIGN-REQ-EC-MCP-013].
- [ ] **Test: `test_report_rate_limit_success`** — Call `report_rate_limit(run_id, stage_name, cooldown_seconds: 60)`. Assert agent is marked unavailable in pool with cooldown until `now + 60s`. Covers [3_MCP_DESIGN-REQ-026].
- [ ] **Test: `test_report_rate_limit_on_exit_code_stage`** — Call `report_rate_limit` on a stage configured with `completion: exit_code`. Assert it is accepted (rate limits apply regardless of completion mechanism). Covers [3_MCP_DESIGN-REQ-EC-AGENT-003].
- [ ] **Test: `test_report_rate_limit_triggers_pool_fallback`** — After reporting rate limit, assert pool selects next available agent for subsequent dispatches. Covers [3_MCP_DESIGN-REQ-026].

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/src/tools/callbacks/report_progress.rs` with `handle_report_progress`
- [ ] `ReportProgressParams`: `run_id: String`, `stage_name: String`, `percentage: i32`
- [ ] Validate percentage in `[0, 100]` range, return `invalid_argument` otherwise
- [ ] Validate stage is in `Running` state, return `failed_precondition` for terminal/paused/cancelled stages
- [ ] Update stage progress metadata in scheduler state
- [ ] Create `crates/devs-mcp/src/tools/callbacks/report_rate_limit.rs` with `handle_report_rate_limit`
- [ ] `ReportRateLimitParams`: `run_id: String`, `stage_name: String`, `cooldown_seconds: u64`
- [ ] Compute `cooldown_until = Utc::now() + Duration::seconds(cooldown_seconds)` and delegate to `devs-pool::report_rate_limit(agent_id, cooldown_until)`
- [ ] Register both tools in MCP router: `"report_progress"`, `"report_rate_limit"`

## 3. Code Review
- [ ] Verify percentage validation is strict: only integer [0, 100]
- [ ] Verify rate limit cooldown uses absolute timestamps (not relative durations stored)
- [ ] Verify rate limit triggers pool fallback selection logic

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --lib tools::callbacks::progress_rate_limit_tests`

## 5. Update Documentation
- [ ] Doc comments on both handlers describing valid ranges and pool interaction

## 6. Automated Verification
- [ ] Run `./do test` — all progress/rate-limit tests pass
- [ ] Run `./do lint` — zero warnings
