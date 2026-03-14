# Task: TUI Rendering Performance Benchmark (Sub-Epic: 15_TDD Lifecycle Roadmap)

## Covered Requirements
- [AC-RLOOP-003]

## Dependencies
- depends_on: ["01_immutable_render_contract.md"]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a benchmark-style test in `crates/devs-tui/tests/performance.rs`.
- [ ] The test should populate an `AppState` with:
  - 256 stages (mocked with various statuses).
  - 10,000 log lines in a single `LogBuffer`.
- [ ] The test should call `App::render` on a `TestBackend`.
- [ ] Measure the execution time of `render` using `std::time::Instant`.
- [ ] Assert that the duration is less than **16 milliseconds**.
- [ ] Initially, this test may fail if the current rendering implementation is inefficient.

## 2. Task Implementation
- [ ] Audit the `render` logic in `crates/devs-tui/src/widgets/dag_view.rs` and `crates/devs-tui/src/widgets/log_pane.rs`.
- [ ] Ensure that no heavy operations (e.g., regex compilation, full log buffer scanning, string allocations) occur within the render path.
- [ ] Use `ratatui::text::Text` or similar types efficiently; prefer `Cow` or references over `String::clone()`.
- [ ] Implement lazy-loading or viewport-clipping if necessary to handle the large log buffer (though the requirement is for 10,000 lines, only the visible ones should be processed for rendering).
- [ ] Optimize the `DagView` rendering to handle 256 stages efficiently, potentially using coordinate-based clipping for the visible area.

## 3. Code Review
- [ ] Check for any accidental I/O or system calls during the render loop (e.g., checking terminal size via `crossterm` instead of using the cached value in `AppState`).
- [ ] Verify that the `render` method is strictly for drawing, not for data processing.
- [ ] Ensure that complexity of `render` is $O(visible\_area)$ rather than $O(total\_data)$.

## 4. Run Automated Tests to Verify
- [ ] Run the performance test: `cargo test --test performance render_budget --release`.
- [ ] Verify that it consistently completes within 16ms on the development machine.

## 5. Update Documentation
- [ ] Add a comment in `app.rs` near the `render` method about the 16ms performance budget.
- [ ] Log the benchmark results in the "agent memory" or a benchmark log.

## 6. Automated Verification
- [ ] Run `./do test` to ensure no regressions are introduced in other TUI features.
- [ ] Confirm that `cargo build -p devs-tui` completes successfully.
