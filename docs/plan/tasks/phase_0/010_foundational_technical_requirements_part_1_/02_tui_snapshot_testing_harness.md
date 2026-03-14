# Task: TUI Text-Snapshot Testing Harness (Sub-Epic: 010_Foundational Technical Requirements (Part 1))

## Covered Requirements
- [1_PRD-BR-005]

## Dependencies
- depends_on: []
- shared_components: [none — this creates reusable test infrastructure for Phase 3 devs-tui]

## 1. Initial Test Written
- [ ] Create a new test-only crate or module: `devs-tui-test-harness/` at workspace root (or `tests/tui_harness/` if preferred). Add it to the workspace `Cargo.toml` as a dev-only member.
- [ ] **Test: `test_buffer_to_text_snapshot_basic`** — Create a `ratatui::backend::TestBackend` with a 40×10 terminal size. Render a simple `Paragraph` widget ("Hello, devs!") into the buffer. Call a `buffer_to_text(buffer) -> String` helper. Assert the returned string contains "Hello, devs!" and is a plain-text grid (no binary data, no pixel data). Annotate with `// Covers: 1_PRD-BR-005`.
- [ ] **Test: `test_snapshot_comparison_detects_change`** — Render a widget to a buffer, capture the text snapshot, then render a *different* widget to the same-sized buffer. Assert that the two text snapshots differ. This proves the harness detects UI changes via text comparison, not pixel comparison. Annotate with `// Covers: 1_PRD-BR-005`.
- [ ] **Test: `test_snapshot_is_cross_platform_deterministic`** — Render a widget containing box-drawing characters (e.g., a `Block` with borders). Capture the text snapshot. Assert it matches a hardcoded expected string. This ensures the output is deterministic and not platform-dependent. Annotate with `// Covers: 1_PRD-BR-005`.
- [ ] **Test: `test_no_pixel_comparison_used`** — A documentation/policy test: grep all `*.rs` files in the workspace for patterns like `screenshot`, `pixel`, `image_compare`, `png`, `bitmap`. Assert zero matches in test files (excluding this test itself). Annotate with `// Covers: 1_PRD-BR-005`.

## 2. Task Implementation
- [ ] Add workspace dev-dependencies: `ratatui = "0.28"` (or latest stable), `insta = "1"` with the `redactions` feature for snapshot management.
- [ ] Implement `buffer_to_text(buffer: &ratatui::buffer::Buffer) -> String` function that iterates over buffer cells row-by-row, extracting the character content into a 2D text grid. Trim trailing whitespace per line. This is the canonical snapshot format.
- [ ] Implement `assert_tui_snapshot(name: &str, buffer: &ratatui::buffer::Buffer)` that calls `buffer_to_text` and then uses `insta::assert_snapshot!(name, text)` to compare against stored `.snap` files.
- [ ] Store snapshot reference files under `devs-tui-test-harness/snapshots/` (or the `insta` default location).
- [ ] Ensure the harness does NOT depend on any real terminal, TTY, or graphical display — it must work in headless CI environments on all three platforms (Linux, macOS, Windows).

## 3. Code Review
- [ ] Verify that NO pixel-level, image-based, or screenshot comparison is used anywhere in the harness — only text content from the buffer.
- [ ] Confirm `buffer_to_text` output is human-readable and produces clean diffs in code review tools.
- [ ] Ensure `insta` snapshots are committed to the repo so CI can validate them.
- [ ] Verify the harness is generic enough to test any `ratatui` widget (not coupled to a specific TUI view).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui-test-harness` (or equivalent test target) and confirm all 4 tests pass.
- [ ] Run `cargo insta review` to verify snapshot files are generated and accepted.
- [ ] Run tests on all three platforms (or at minimum confirm no platform-specific code paths exist).

## 5. Update Documentation
- [ ] Add doc comments on `buffer_to_text` and `assert_tui_snapshot` explaining the testing pattern.
- [ ] Add a brief comment in the crate root explaining that this harness enforces [1_PRD-BR-005]: text-snapshot verification only, pixel comparison prohibited.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui-test-harness` in CI and confirm exit code 0.
- [ ] Modify a snapshot file manually (change one character), run tests, and confirm the test fails with a clear text diff — proving the harness catches regressions.
- [ ] Confirm `grep -r 'pixel\|screenshot\|bitmap\|image_compare' devs-tui-test-harness/` returns zero matches.
