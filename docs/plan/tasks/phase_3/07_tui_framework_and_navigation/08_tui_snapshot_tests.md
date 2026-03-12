# Task: TUI Snapshot Testing and TestBackend Infrastructure (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [2_TAS-REQ-058]
- [6_UI_UX_ARCHITECTURE-REQ-324]
- [6_UI_UX_ARCHITECTURE-REQ-468]
- [6_UI_UX_ARCHITECTURE-REQ-469]
- [9_PROJECT_ROADMAP-REQ-374]

## Dependencies
- depends_on: [07_tui_state_sync.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Setup `insta` in `devs-tui/Cargo.toml` as a dev-dependency.
- [ ] Create a unit test in `crates/devs-tui/tests/snapshot_tests.rs` that renders the `DashboardTab` with mock data into a `ratatui::backend::TestBackend`.
- [ ] Create a test that asserts the rendered text matches a stored snapshot.
- [ ] Create a test that verifies `MSG_TERMINAL_TOO_SMALL` snapshot when terminal is (79, 24).

## 2. Task Implementation
- [ ] Configure `insta` to store snapshots as `.txt` files in `crates/devs-tui/tests/snapshots/`.
- [ ] Implement a helper `render_to_string(app: &App, size: (u16, u16)) -> String`.
- [ ] Write snapshot tests for:
    - Empty app state.
    - Dashboard with multiple runs.
    - Help overlay visible.
    - Reconnecting status bar.
    - Terminal too small overlay.
- [ ] Ensure terminal size is fixed to 200x50 for all snapshots.

## 3. Code Review
- [ ] Verify that snapshots contain only ASCII text and no ANSI escape sequences.
- [ ] Ensure that `mockall` is used to intercept gRPC calls during tests.
- [ ] Verify that snapshots are manually reviewed and not auto-approved in CI.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and review new snapshots.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3_grouping.json` if necessary to reflect implementation progress.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui` and verify no `.new` files remain.
- [ ] Verify that `cargo llvm-cov` correctly attributes these tests to the TUI crate.
