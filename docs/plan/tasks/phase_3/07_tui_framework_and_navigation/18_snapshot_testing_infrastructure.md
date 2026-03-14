# Task: Snapshot Testing Infrastructure (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-324], [6_UI_UX_ARCHITECTURE-REQ-325], [6_UI_UX_ARCHITECTURE-REQ-326], [6_UI_UX_ARCHITECTURE-REQ-327], [6_UI_UX_ARCHITECTURE-REQ-328], [6_UI_UX_ARCHITECTURE-REQ-329], [6_UI_UX_ARCHITECTURE-REQ-330], [6_UI_UX_ARCHITECTURE-REQ-406], [6_UI_UX_ARCHITECTURE-REQ-407], [6_UI_UX_ARCHITECTURE-REQ-408], [6_UI_UX_ARCHITECTURE-REQ-409], [6_UI_UX_ARCHITECTURE-REQ-410], [6_UI_UX_ARCHITECTURE-REQ-411], [6_UI_UX_ARCHITECTURE-REQ-412], [6_UI_UX_ARCHITECTURE-REQ-413], [6_UI_UX_ARCHITECTURE-REQ-414], [6_UI_UX_ARCHITECTURE-REQ-415], [6_UI_UX_ARCHITECTURE-REQ-416], [6_UI_UX_ARCHITECTURE-REQ-417], [6_UI_UX_ARCHITECTURE-REQ-418], [6_UI_UX_ARCHITECTURE-REQ-419], [6_UI_UX_ARCHITECTURE-REQ-420], [6_UI_UX_ARCHITECTURE-REQ-421], [6_UI_UX_ARCHITECTURE-REQ-422]

## Dependencies
- depends_on: ["01_tui_crate_scaffold_and_event_loop.md", "02_app_state_and_state_management.md", "07_string_constants_and_styling.md"]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Write a baseline snapshot test using `insta 1.40` + `ratatui::backend::TestBackend` at 200×50 with `AppState::test_default()` — verify snapshot file is created at `crates/devs-tui/tests/snapshots/` (REQ-324, REQ-325)
- [ ] Write test that snapshots use `ColorMode::Monochrome` — verify no ANSI escape codes in snapshot output (REQ-326)
- [ ] Write small-terminal snapshot tests at 79×23 and 80×24 (REQ-327)
- [ ] Write test that `buffer_to_string()` produces deterministic output for identical AppState (REQ-332)
- [ ] Write test helper `render_snapshot(state: &AppState, width: u16, height: u16) -> String` used by all snapshot tests (REQ-406)
- [ ] Write test verifying snapshots are committed to git and divergence = test failure (REQ-329)
- [ ] Write test that no `.new` snapshot files exist after test run (REQ-407)

## 2. Task Implementation
- [ ] Add `insta = "1.40"` to dev-dependencies in `crates/devs-tui/Cargo.toml` (REQ-324)
- [ ] Create `crates/devs-tui/tests/snapshots/` directory with `.gitkeep`
- [ ] Implement `render_snapshot(state: &AppState, w: u16, h: u16) -> String` test utility: creates TestBackend, renders App, converts buffer to string (REQ-324, REQ-406)
- [ ] Configure insta snapshot settings: file naming `test_name.txt`, directory `crates/devs-tui/tests/snapshots/` (REQ-325)
- [ ] Ensure all snapshot tests set `ColorMode::Monochrome` before rendering (REQ-326)
- [ ] Create `.gitattributes` entry: `crates/devs-tui/tests/snapshots/*.txt eol=lf` (REQ-339)
- [ ] Create `AppState::test_default()` with realistic sample data: 3 runs, 5 stages per run, some log lines (REQ-331)
- [ ] Write comprehensive snapshot tests for each tab in default state (REQ-408-409)
- [ ] Document snapshot update workflow: `cargo insta review` (not auto-approval) (REQ-328)

## 3. Code Review
- [ ] Verify snapshot size is 200×50 (REQ-324)
- [ ] Verify Monochrome mode is enforced in all snapshots (REQ-326)
- [ ] Verify no `.new` files are checked in (REQ-407)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- snapshot`
- [ ] Run `find crates/devs-tui/tests/snapshots/ -name "*.new" | wc -l` and verify output is `0`

## 5. Update Documentation
- [ ] Add doc comments to test utilities explaining snapshot workflow

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
- [ ] Run `find crates/devs-tui -name "*.snap.new" | wc -l` and confirm `0`
