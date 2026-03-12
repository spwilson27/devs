# Task: TUI Crate Setup and Terminal Lifecycle (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [2_TAS-REQ-055]
- [6_UI_UX_ARCHITECTURE-REQ-012]
- [6_UI_UX_ARCHITECTURE-REQ-015]
- [6_UI_UX_ARCHITECTURE-REQ-040]
- [6_UI_UX_ARCHITECTURE-REQ-067]
- [9_PROJECT_ROADMAP-REQ-244]
- [9_PROJECT_ROADMAP-REQ-255]

## Dependencies
- depends_on: [01_shared_discovery_logic.md]
- shared_components: [devs-client-util]

## 1. Initial Test Written
- [ ] Create a unit test for a `TerminalGuard` struct that verifies `raw mode` is enabled on construction and disabled on `Drop`.
- [ ] Create a test that verifies `TerminalGuard` handles `Drop` correctly even after a panic (using `catch_unwind`).
- [ ] Create a test that verifies `Theme::from_env()` correctly detects `NO_COLOR=1` and returns a monochrome theme.

## 2. Task Implementation
- [ ] Create `crates/devs-tui/` crate in the workspace.
- [ ] Implement `TerminalGuard` in `src/terminal.rs` using `crossterm::terminal::enable_raw_mode()` and `disable_raw_mode()`.
- [ ] Use `scopeguard` or a `Drop` implementation to ensure `disable_raw_mode`, `LeaveAlternateScreen`, and `ShowCursor` are called.
- [ ] Ensure Windows console API backend is used on Windows (via `crossterm`).
- [ ] Implement `Theme` in `src/theme.rs` with `NO_COLOR` detection.
- [ ] Implement the `main()` function to setup the terminal, start the tokio runtime, and initialize the app.

## 3. Code Review
- [ ] Verify that no UNIX-specific terminal calls (`termios`, `ioctl`) are used.
- [ ] Ensure that `devs-tui` does not depend on engine crates (`devs-scheduler`, etc.).
- [ ] Verify that `println!` and `eprintln!` are avoided once the terminal is initialized (except for the panic hook).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3_grouping.json` if necessary to reflect implementation progress.

## 6. Automated Verification
- [ ] Run `cargo tree -p devs-tui --edges normal` and verify no engine crates are in the dependency graph.
- [ ] Manually verify (during development) that crashing the TUI does not leave the terminal in a broken state.
