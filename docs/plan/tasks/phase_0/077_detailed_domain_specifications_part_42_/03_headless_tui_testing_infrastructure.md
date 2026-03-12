# Task: Headless TUI Testing Infrastructure (Sub-Epic: 077_Detailed Domain Specifications (Part 42))

## Covered Requirements
- [2_TAS-REQ-463]

## Dependencies
- depends_on: [001_workspace_toolchain_setup/02_scaffold_workspace_crates.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a TUI snapshot test `crates/devs-tui/tests/test_tui_rendering.rs` that:
    - Uses `ratatui::backend::TestBackend` with a fixed terminal size (e.g., 80x24).
    - Renders a simple widget (e.g., `ratatui::widgets::Block` with a title).
    - Uses `insta::assert_snapshot!` to verify the terminal's output buffer against a committed snapshot file.
- [ ] The test should initially fail as `insta` and `ratatui` (with test backend) are not configured.

## 2. Task Implementation
- [ ] Update `crates/devs-tui/Cargo.toml` to include `ratatui` (with `test` feature) and `insta` in `[dev-dependencies]`.
- [ ] Ensure `crates/devs-tui/src/lib.rs` (or `main.rs`) is set up to support testing of its rendering logic independently of a real terminal.
- [ ] Implement a helper function `render_to_string<F>(width: u16, height: u16, render_fn: F) -> String` where `render_fn` takes a `ratatui::Frame`.
- [ ] Use this helper in the snapshot test to capture the `TestBackend` buffer.
- [ ] Run `cargo test -p devs-tui` and use `cargo insta review` (or manually accept) to commit the initial snapshot to `crates/devs-tui/tests/snapshots/`.
- [ ] Verify that the test passes in a CI environment (no TTY).

## 3. Code Review
- [ ] Verify that snapshots do not contain ANSI escape codes or platform-specific characters unless explicitly required.
- [ ] Ensure that `insta` snapshots are stored in the correct directory.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and verify the snapshot test passes.
- [ ] Run the same test under `CI=true` to simulate a headless environment.

## 5. Update Documentation
- [ ] Add a `TESTING.md` to `crates/devs-tui` explaining how to update snapshots using `cargo insta`.

## 6. Automated Verification
- [ ] Verify that `crates/devs-tui/tests/snapshots/` exists and contains `.txt` or `.snap` files.
- [ ] Run `cargo test -p devs-tui` and verify 100% pass rate.
