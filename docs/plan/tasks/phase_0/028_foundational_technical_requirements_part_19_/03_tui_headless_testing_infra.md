# Task: Setup TUI Headless Testing Infrastructure (Sub-Epic: 028_Foundational Technical Requirements (Part 19))

## Covered Requirements
- [2_TAS-REQ-015F]

## Dependencies
- depends_on: [none]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a skeleton TUI test in `devs-tui/src/tests/test_ui_render.rs`.
- [ ] Use `ratatui::backend::TestBackend` to initialize a terminal with a known size (e.g., 80x24).
- [ ] Define a simple widget and render it to the backend.
- [ ] Assert that a specific cell in the buffer contains an expected character or symbol.
- [ ] Use `insta::assert_snapshot!` to save a text-based snapshot of the rendered terminal.

## 2. Task Implementation
- [ ] Add `ratatui` with the `test` feature (or just ensure `TestBackend` is available) and `insta` as dev-dependencies in `devs-tui/Cargo.toml`.
- [ ] Implement a helper trait or function in `devs-tui` to facilitate rendering widgets to `TestBackend` and extracting the string representation.
- [ ] Configure `insta` to save snapshots in `devs-tui/src/snapshots/`.
- [ ] Set up the test suite to ensure snapshots are deterministic (e.g., by masking timestamps or using fixed mock data).
- [ ] Prohibit pixel-level or screenshot-based testing in the TUI codebase.

## 3. Code Review
- [ ] Verify that `insta` snapshots are text-based and readable in the repository.
- [ ] Ensure `ratatui::backend::TestBackend` is used correctly for headless operation.
- [ ] Confirm no external dependencies (like a real PTY or X11) are required for these tests.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui`.
- [ ] Verify that snapshots are generated and committed.
- [ ] Run the tests on a different platform (if possible) to ensure cross-platform consistency of text snapshots.

## 5. Update Documentation
- [ ] Add a section to `devs-tui/README.md` explaining the TUI testing strategy using `TestBackend` and `insta`.

## 6. Automated Verification
- [ ] Verify that `devs-tui/src/snapshots/` contains `.txt` or `.snap` files.
- [ ] Ensure that no binary image formats are present in the TUI snapshots directory.
