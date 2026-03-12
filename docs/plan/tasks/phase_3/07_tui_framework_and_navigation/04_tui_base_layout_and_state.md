# Task: TUI Base Layout and App State (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [2_TAS-REQ-056]
- [6_UI_UX_ARCHITECTURE-REQ-050]
- [6_UI_UX_ARCHITECTURE-REQ-315]
- [6_UI_UX_ARCHITECTURE-REQ-417]
- [9_PROJECT_ROADMAP-REQ-252]
- [9_PROJECT_ROADMAP-REQ-266]

## Dependencies
- depends_on: [02_tui_terminal_lifecycle.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a unit test for `AppState::default()` that asserts `active_tab = Dashboard`, `help_visible = false`, and `connection_status` is correct.
- [ ] Create a unit test for the layout manager that verifies `DashboardTab` takes 100% width when the terminal is below 80 columns.
- [ ] Create a unit test for `terminal_too_small` condition where `AppState::terminal_size` is (79, 24).

## 2. Task Implementation
- [ ] Define `AppState` in `src/state.rs` including `active_tab`, `terminal_size`, and `connection_status`.
- [ ] Implement `App` struct with a `render()` method that uses `ratatui`'s `Layout`.
- [ ] Create the top-level layout grid: TabBar (top, 1 row), MainArea (middle, fill), StatusBar (bottom, 1 row).
- [ ] Implement the narrow-mode check (`terminal_cols < 80`) and hide the detail view accordingly.
- [ ] Implement the `MSG_TERMINAL_TOO_SMALL` overlay when size is below 80x24.
- [ ] Ensure `render()` completes within 16ms and avoids I/O, syscalls, or Mutex acquisition.

## 3. Code Review
- [ ] Verify that `render()` is pure-ish (no I/O, no proportional heap allocation).
- [ ] Ensure `AppState` is the source of truth for all components.
- [ ] Verify that tabs are distinct structs (as placeholders for now).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3_grouping.json` if necessary to reflect implementation progress.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui` and check the unit test results.
