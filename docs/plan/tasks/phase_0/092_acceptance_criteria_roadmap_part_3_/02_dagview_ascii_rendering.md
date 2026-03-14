# Task: DagView ASCII Rendering and Fan-out Suffix (Sub-Epic: 092_Acceptance Criteria & Roadmap (Part 3))

## Covered Requirements
- [AC-ASCII-024], [AC-ASCII-025]

## Dependencies
- depends_on: []
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a new unit test in `crates/devs-tui/src/widgets/dag_view_tests.rs` (or similar).
- [ ] Implement `test_dag_view_ascii_rendering()`:
    - Set up a linear 3-stage `AppState` (Stage A -> Stage B -> Stage C).
    - Render the `DagView` widget using `ratatui::backend::TestBackend`. [AC-ASCII-024]
    - Iterate through all cells in the rendered buffer and assert that each cell contains only a single-byte ASCII character (U+0000 to U+007F).
- [ ] Implement `test_fan_out_stage_ascii_suffix()`:
    - Set up a `DagView` with a fan-out stage (e.g., `Stage A (x3)`).
    - Render the widget using `TestBackend`. [AC-ASCII-025]
    - Assert that the rendered buffer contains the substring `"(x"` (using ASCII `x`, U+0078), and does NOT contain the Unicode multiplication symbol `×` (U+00D7).
- [ ] Add requirement annotations `// Verifies [AC-ASCII-024]` and `// Verifies [AC-ASCII-025]` to these tests.

## 2. Task Implementation
- [ ] Implement (or update) the `DagView` widget in `crates/devs-tui/src/widgets/dag_view.rs`.
- [ ] Ensure that all characters used for drawing the DAG (boxes, lines, arrows) are single-byte ASCII characters as defined by requirements (e.g., `-`, `>`, `|`, `+`, ` `).
- [ ] In the fan-out stage rendering logic, ensure the number of parallel agents is displayed with an ASCII `x` prefix: `"(xN)"`. [AC-ASCII-025]
- [ ] Use `ratatui::widgets::Widget` implementation for `DagView`.

## 3. Code Review
- [ ] Confirm that no UTF-8 box-drawing characters (U+2500 to U+257F) are used in `DagView`.
- [ ] Verify that the `DagView` correctly handles stage names and statuses while maintaining ASCII-only output for the structural elements.
- [ ] Ensure that `devs_proto` types are not directly referenced in the widget module.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` to execute the unit tests.
- [ ] Ensure `test_dag_view_ascii_rendering` and `test_fan_out_stage_ascii_suffix` pass.

## 5. Update Documentation
- [ ] Document the ASCII-only rendering constraint for `DagView` in `.agent/MEMORY.md`.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` to confirm that [AC-ASCII-024] and [AC-ASCII-025] are correctly traced.
