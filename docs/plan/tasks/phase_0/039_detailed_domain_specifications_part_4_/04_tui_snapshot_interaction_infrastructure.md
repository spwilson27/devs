# Task: TUI Text-Snapshot & Interaction Infrastructure (Sub-Epic: 039_Detailed Domain Specifications (Part 4))

## Covered Requirements
- [1_PRD-REQ-052]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a prototype TUI test in `crates/devs-tui/tests/test_tui_snapshots.rs` that:
    - Instantiates a `ratatui::backend::TestBackend` with size 80x24.
    - Simulates an event (e.g., a keypress or data update).
    - Renders the TUI to the `TestBackend`.
    - Captures the rendered buffer as a text string (not pixels).
    - Asserts that the string matches a pre-existing snapshot file in `tests/snapshots/`.
    - Verifies that any change to the UI content (even a single character) causes the test to fail.

## 2. Task Implementation
- [ ] Implement a `TuiTestHarness` utility in a `dev-dependency` module (or a separate `test-utils` crate) that:
    - Wraps `ratatui::backend::TestBackend` and `ratatui::Terminal`.
    - Provides a `render_to_string()` method that formats the buffer for snapshotting (e.g., using a text-based grid).
    - Implements an `assert_tui_snapshot!` macro that handles file comparison, snapshot updates, and diffing.
- [ ] Ensure the snapshot infrastructure stores `.txt` files and NOT images [1_PRD-REQ-052].
- [ ] Integrate this into the `devs-tui` crate's testing workflow.
- [ ] Ensure that these tests are counted toward the TUI E2E coverage gate (QG-004) [6_UI_UX_ARCHITECTURE-REQ-412].

## 3. Code Review
- [ ] Verify that the snapshot format is human-readable and easy to diff in PRs.
- [ ] Ensure that interaction testing (sending events to the App state) is the primary method of driving tests.
- [ ] Verify that pixel-level snapshotting is completely absent and prohibited by policy.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --crate devs-tui` and ensure the prototype snapshot test passes.
- [ ] Change a UI string in the TUI and ensure the snapshot test fails with a clear diff.

## 5. Update Documentation
- [ ] Document the TUI testing standard (interaction + text-snapshots) in the project developer guide.

## 6. Automated Verification
- [ ] Run `./do coverage` and verify that the TUI snapshot tests contribute to QG-004 coverage.
