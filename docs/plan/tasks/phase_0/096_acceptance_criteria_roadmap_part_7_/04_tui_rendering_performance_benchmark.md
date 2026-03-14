# Task: TUI render() Performance Benchmark — 64 Stages, 10k Log Lines < 16ms (Sub-Epic: 096_Acceptance Criteria & Roadmap (Part 7))

## Covered Requirements
- [AC-TIMING-001]

## Dependencies
- depends_on: []
- shared_components: [devs-core (state types)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/tests/render_benchmark.rs` with annotation `// Covers: AC-TIMING-001`:
    - Write a helper `build_large_app_state() -> AppState` that constructs:
        - An `AppState` containing exactly 64 `StageRun` entries (use sequential dummy names like `stage_001` through `stage_064`).
        - One of those stages (e.g., `stage_001`) has a `LogBuffer` containing exactly 10,000 `LogLine` entries. Each `LogLine` should have realistic content (~80 chars, mixed alphanumeric, no ANSI escapes since they are stripped on insertion).
        - The remaining 63 stages have empty or minimal log buffers.
        - The active tab is set to `Tab::Dashboard` and the selected run points to the run containing these stages.
    - Write test `test_render_64_stages_10k_logs_under_16ms()`:
        1. Call `build_large_app_state()`.
        2. Create a `ratatui::backend::TestBackend` with dimensions `200x50` (large enough to avoid clipping edge cases).
        3. Create a `ratatui::Terminal` wrapping the test backend.
        4. Warm up: call `render(&mut terminal, &app_state)` once (discard timing — allows JIT/cache warming).
        5. Measure: loop 100 iterations, each calling `render(&mut terminal, &app_state)`, recording `std::time::Instant` before and after each call.
        6. Compute the average duration across the 100 iterations.
        7. Assert `average < Duration::from_millis(16)`.
        8. Also assert that the *maximum* single render does not exceed `Duration::from_millis(32)` (2x budget as a safety margin for CI variance).
    - Write test `test_render_does_no_io()`:
        1. Verify that `render()` is a pure function of `AppState` → terminal buffer writes, with no filesystem or network calls (structural assertion — ensure the function signature takes `&AppState` and `&mut Terminal<TestBackend>` only).

## 2. Task Implementation
- [ ] In `crates/devs-tui/src/render.rs` (or equivalent module):
    - Implement `pub fn render(terminal: &mut Terminal<impl Backend>, state: &AppState) -> std::io::Result<()>` if not already present.
    - The Dashboard tab renderer must efficiently handle large stage counts by:
        - Using `ratatui::widgets::Table` or `List` with a visible-window slice (only render rows within the viewport).
        - For the log pane: render only the tail N lines that fit in the available height, not all 10,000 lines.
    - The `LogBuffer` should support O(1) access to the tail via a `VecDeque` or pre-indexed slice.
- [ ] In `crates/devs-tui/src/state.rs` (or equivalent):
    - Ensure `AppState` stores stages in an `IndexMap` or `Vec` for predictable iteration order.
    - Ensure `LogBuffer` uses `VecDeque<LogLine>` for efficient tail access.
- [ ] Add `ratatui` and `crossterm` as dependencies in `crates/devs-tui/Cargo.toml` if not present.

## 3. Code Review
- [ ] Verify `render()` does not call `.collect::<Vec<_>>()` on the entire 10,000-line log buffer — only the visible tail should be materialized.
- [ ] Verify no heap allocations per-line in the hot render path (prefer `Cow<str>` or borrowed references).
- [ ] Verify the benchmark uses `std::time::Instant` (monotonic clock), not `SystemTime`.
- [ ] Verify the test is deterministic — no random data, no system-dependent sizing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --test render_benchmark -- --nocapture`.
- [ ] Confirm both `test_render_64_stages_10k_logs_under_16ms` and `test_render_does_no_io` pass.

## 5. Update Documentation
- [ ] Add a doc comment on the `render()` function noting the 16ms budget requirement per [AC-TIMING-001] and that this is verified by an automated benchmark test.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` includes `AC-TIMING-001` in covered requirements.
- [ ] Run `./do lint` to confirm no new warnings.
