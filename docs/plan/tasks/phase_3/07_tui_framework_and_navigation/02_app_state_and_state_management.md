# Task: AppState Structure and State Management (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-130], [6_UI_UX_ARCHITECTURE-REQ-131], [6_UI_UX_ARCHITECTURE-REQ-132], [6_UI_UX_ARCHITECTURE-REQ-133], [6_UI_UX_ARCHITECTURE-REQ-136], [6_UI_UX_ARCHITECTURE-REQ-138], [6_UI_UX_ARCHITECTURE-REQ-139], [6_UI_UX_ARCHITECTURE-REQ-140], [6_UI_UX_ARCHITECTURE-REQ-141], [6_UI_UX_ARCHITECTURE-REQ-142], [6_UI_UX_ARCHITECTURE-REQ-143], [6_UI_UX_ARCHITECTURE-REQ-144], [6_UI_UX_ARCHITECTURE-REQ-145], [6_UI_UX_ARCHITECTURE-REQ-146], [6_UI_UX_ARCHITECTURE-REQ-148], [6_UI_UX_ARCHITECTURE-REQ-149], [6_UI_UX_ARCHITECTURE-REQ-150], [6_UI_UX_ARCHITECTURE-REQ-151], [6_UI_UX_ARCHITECTURE-REQ-152], [6_UI_UX_ARCHITECTURE-REQ-060], [6_UI_UX_ARCHITECTURE-REQ-061], [6_UI_UX_ARCHITECTURE-REQ-331], [6_UI_UX_ARCHITECTURE-REQ-332]

## Dependencies
- depends_on: ["01_tui_crate_scaffold_and_event_loop.md"]
- shared_components: [devs-core (consumer), devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Write test that `AppState::default()` initializes with `active_tab: Tab::Dashboard`, `help_visible: false`, `connection_status: ConnectionStatus::Disconnected`, empty `runs` vec, empty `log_buffers`, empty `pool_state`, `terminal_size: (80, 24)` (REQ-132)
- [ ] Write test that `AppState` contains no `Arc`, `Mutex`, `RwLock`, or async primitives — static assertion (REQ-131)
- [ ] Write test for `LogBuffer` ring buffer: insert 10,001 lines into a buffer with capacity 10,000 and verify the oldest line is evicted (REQ-136)
- [ ] Write test for `TuiEvent::Tick` handler incrementing elapsed times on all running stages (REQ-138)
- [ ] Write test for `RunSummary` stage count fields: `stage_count`, `completed_stage_count`, `failed_stage_count` computed from `stage_runs` array, with fan-out sub-agents NOT counted as individual stages (REQ-061)
- [ ] Write test for elapsed time formatting: 0s → `"0:00"`, 70m5s → `"70:05"`, not started → `"--:--"`, max width 5 chars (REQ-060)
- [ ] Write test for `AppState::test_default()` gated behind `#[cfg(test)]` (REQ-331)
- [ ] Write test for `buffer_to_string()` utility converting TestBackend buffer to comparable string (REQ-332)

## 2. Task Implementation
- [ ] Define `AppState` struct in `crates/devs-tui/src/state.rs` with fields: `active_tab: Tab`, `help_visible: bool`, `runs: Vec<RunSummary>`, `run_details: HashMap<Uuid, RunDetail>`, `selected_run_id: Option<Uuid>`, `selected_stage_name: Option<String>`, `log_buffers: HashMap<(Uuid, String), LogBuffer>`, `pool_state: Vec<PoolSummary>`, `selected_pool_name: Option<String>`, `dag_scroll_offset: usize`, `log_scroll_offset: HashMap<(Uuid, String), usize>`, `connection_status: ConnectionStatus`, `server_addr: String`, `reconnect_elapsed_ms: u64`, `last_event_at: Option<Instant>`, `terminal_size: (u16, u16)` (REQ-130)
- [ ] Implement `Default` for `AppState` with well-defined initial values (REQ-132)
- [ ] Implement `#[cfg(test)] AppState::test_default()` with populated sample data for snapshot tests (REQ-331)
- [ ] Define `Tab` enum: `Dashboard`, `Logs`, `Debug`, `Pools` (REQ-133)
- [ ] Define `TuiEvent` enum: `Key(KeyEvent)`, `Resize(u16, u16)`, `GrpcRunEvent(RunEvent)`, `GrpcPoolEvent(PoolState)`, `Tick`, `Quit` (REQ-144, REQ-145)
- [ ] Define `ConnectionStatus` enum: `Connected`, `Reconnecting { attempt: u32 }`, `Disconnected` (REQ-137)
- [ ] Implement `LogBuffer` as a ring buffer with configurable max capacity (default 10,000), FIFO eviction (REQ-136)
- [ ] Implement `RunSummary` display model with `stage_count`, `completed_stage_count`, `failed_stage_count` computed from stage_runs, excluding fan-out sub-agents (REQ-061)
- [ ] Implement `format_elapsed(duration: Option<Duration>) -> String` returning `M:SS` format, `--:--` for None (REQ-060)
- [ ] Implement `buffer_to_string(backend: &TestBackend) -> String` utility for snapshot testing (REQ-332)
- [ ] Ensure all state mutations happen only in `handle_event()`, never in `render()` (REQ-148, REQ-149)

## 3. Code Review
- [ ] Verify `AppState` has no Arc/Mutex/RwLock/async fields (REQ-131)
- [ ] Verify `LogBuffer` correctly evicts oldest on overflow (REQ-136)
- [ ] Verify fan-out sub-agents excluded from stage counts (REQ-061)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- state` and verify all pass

## 5. Update Documentation
- [ ] Add doc comments to `AppState`, all fields, `TuiEvent`, `ConnectionStatus`, `LogBuffer`

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
