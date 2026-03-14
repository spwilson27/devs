# Task: Event Loop Architecture & Widget Performance (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-015], [7_UI_UX_DESIGN-REQ-016], [7_UI_UX_DESIGN-REQ-036], [7_UI_UX_DESIGN-REQ-070], [7_UI_UX_DESIGN-REQ-191], [7_UI_UX_DESIGN-REQ-192], [7_UI_UX_DESIGN-REQ-193], [7_UI_UX_DESIGN-REQ-194], [7_UI_UX_DESIGN-REQ-195], [7_UI_UX_DESIGN-REQ-196], [7_UI_UX_DESIGN-REQ-197], [7_UI_UX_DESIGN-REQ-198], [7_UI_UX_DESIGN-REQ-199], [7_UI_UX_DESIGN-REQ-200], [7_UI_UX_DESIGN-REQ-257], [7_UI_UX_DESIGN-REQ-258], [7_UI_UX_DESIGN-REQ-259]

## Dependencies
- depends_on: ["01_string_constants_and_ascii_hygiene.md", "02_theme_and_color_mode_system.md"]
- shared_components: [devs-proto (consumer), devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/app.rs`, `crates/devs-tui/src/event.rs` (empty). Create `crates/devs-tui/tests/event_loop_tests.rs`.
- [ ] Write `test_render_within_16ms` — measure render() duration via `std::time::Instant`; assert < 16ms for a typical state with 20 runs and 50 log lines (REQ-015, REQ-200).
- [ ] Write `test_render_no_io` — verify render() does not perform filesystem access or blocking operations (REQ-015). Static analysis or mock-based test.
- [ ] Write `test_event_loop_single_thread` — verify render loop executes on single thread (REQ-197).
- [ ] Write `test_appstate_single_source_of_truth` — AppState contains all data needed for rendering; render() receives `&self` immutable reference (REQ-196, REQ-258).
- [ ] Write `test_every_render_preceded_by_mutation` — event handling mutates AppState before triggering render (REQ-195).
- [ ] Write `test_channel_buffer_overflow_drops_oldest` — when event channel is full, oldest event is dropped (REQ-198).
- [ ] Write `test_consecutive_ticks_deduplicated` — multiple Tick events in buffer are collapsed to one (REQ-199).
- [ ] Write `test_rerender_latency_after_run_event` — after RunEvent received, re-render happens within timing constraint (REQ-193).
- [ ] Write `test_event_loop_config_default` — `EventLoopConfig::default()` is the only production config (REQ-194).
- [ ] Write `test_input_event_categories` — verify TUI handles navigation keys (arrows, Tab, 1-4), action keys (c/p/r/q/Esc/?), control keys (Ctrl+C) (REQ-016).
- [ ] Write `test_tab_enum_variants` — `Tab` enum has Dashboard, Logs, Debug, Pools variants (REQ-259).
- [ ] Write `test_module_hierarchy_no_circular_imports` — verify tabs/ imports from widgets/, widgets/ from render_utils+strings+theme; no reverse (REQ-036).
- [ ] Write `test_devs_tui_no_engine_deps` — verify `devs-tui` Cargo.toml has no direct dependencies on `devs-scheduler`, `devs-executor`, `devs-adapters`, `devs-pool` (REQ-070).

## 2. Task Implementation
- [ ] Implement `TuiEvent` enum in `event.rs`: `Tick`, `Key(KeyEvent)`, `Resize(u16, u16)`, `RunEvent(RunDelta)`, `LogLine(LogLineEvent)`, `ControlResult(ControlResult)`, `Connected`, `Disconnected`, `StreamError` (REQ-191).
- [ ] Implement `EventLoopConfig` with `tick_rate: Duration`, `channel_capacity: usize`. `Default` impl is the only production config (REQ-194).
- [ ] Implement event loop in `app.rs`:
  - Single-threaded render loop (REQ-197).
  - `handle_event(&mut self, event: TuiEvent)` mutates `AppState` (REQ-195).
  - `render(&self, frame: &mut Frame)` receives immutable `&self` (REQ-196).
  - Render duration measured via `std::time::Instant` (REQ-200).
  - Channel overflow drops oldest (REQ-198). Consecutive Ticks deduplicated (REQ-199).
- [ ] Implement `AppState` struct as single source of truth (REQ-258):
  - `theme: Theme`, `tab: Tab`, `runs: Vec<RunSummary>`, `selected_run_id: Option<RunId>`, `log_buffers: HashMap<...>`, etc.
- [ ] Implement `Tab` enum: `Dashboard`, `Logs`, `Debug`, `Pools` (REQ-259).
- [ ] Ensure module hierarchy: `tabs/` → `widgets/` → `render_utils` + `strings` + `theme` (REQ-036).
- [ ] Ensure `devs-tui` crate has no direct deps on engine crates (REQ-070). Rendering and interaction consolidated (REQ-257).

## 3. Code Review
- [ ] Verify no `use devs_scheduler`, `use devs_executor`, etc. in devs-tui sources.
- [ ] Verify render() has no `&mut self` signature.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib app --lib event` and `cargo test -p devs-tui --test event_loop_tests`.

## 5. Update Documentation
- [ ] Document the event loop architecture, AppState ownership model, and performance budget.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint`. Verify devs-tui Cargo.toml dependency list.
