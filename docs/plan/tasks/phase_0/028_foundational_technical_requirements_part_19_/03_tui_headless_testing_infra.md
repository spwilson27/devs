# Task: Setup TUI Headless Testing Infrastructure with TestBackend and Insta Snapshots (Sub-Epic: 028_Foundational Technical Requirements (Part 19))

## Covered Requirements
- [2_TAS-REQ-015F]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consumer — uses domain types for mock data)]

## 1. Initial Test Written
- [ ] Create `devs-tui/tests/ui_snapshot_tests.rs` (integration test file) with the following test cases:
- [ ] **Test: render empty dashboard to TestBackend** — Create a `ratatui::backend::TestBackend::new(80, 24)`. Create a `Terminal::new(backend)`. Render a minimal dashboard widget (even if it's a placeholder "No runs" view). Extract the buffer via `terminal.backend().buffer().clone()`. Convert the buffer to a string representation. Use `insta::assert_snapshot!("empty_dashboard", snapshot_string)` to save the snapshot.
- [ ] **Test: assert specific cell content** — Render a widget that places the text "devs" starting at column 0, row 0. Use `terminal.backend().buffer().get(0, 0).symbol()` to assert it equals `"d"`. Assert `get(1, 0).symbol()` equals `"e"`, etc. This proves cell-level assertion works.
- [ ] **Test: snapshot determinism** — Render the same widget twice with identical inputs. Assert both snapshots produce identical strings. This validates that no non-deterministic data (timestamps, random IDs) leaks into snapshots.
- [ ] **Test: snapshot with mock data** — Create a mock run list with 2 entries (fixed names, fixed statuses). Render a list widget displaying them. Snapshot the result. This demonstrates data-driven snapshot testing.
- [ ] Mark all tests with `// Covers: 2_TAS-REQ-015F`.

## 2. Task Implementation
- [ ] Add dev-dependencies to `devs-tui/Cargo.toml`:
  ```toml
  [dev-dependencies]
  insta = { version = "1", features = ["redactions"] }
  ratatui = { version = "...", features = [] }  # TestBackend is in the main crate
  ```
  Note: `TestBackend` is available in `ratatui::backend::TestBackend` without special features.
- [ ] Create a test helper module `devs-tui/tests/helpers/mod.rs` (or `devs-tui/src/test_utils.rs` behind `#[cfg(test)]`) with:
  - `fn render_to_string(widget: &impl Widget, width: u16, height: u16) -> String` — creates a `TestBackend`, renders the widget, converts the buffer to a multi-line string by iterating rows and columns, joining cell symbols.
  - `fn create_test_terminal(width: u16, height: u16) -> Terminal<TestBackend>` — convenience constructor.
- [ ] Configure insta snapshot location by adding `devs-tui/insta.yaml`:
  ```yaml
  snapshot_path: snapshots
  ```
- [ ] Ensure all snapshot files are `.snap` text files stored in `devs-tui/snapshots/`.
- [ ] Add a CI lint check (in `./do lint` or a dedicated step) that asserts no `.png`, `.jpg`, `.bmp`, or other binary image files exist under `devs-tui/snapshots/` or `devs-tui/tests/`:
  ```sh
  find devs-tui/snapshots devs-tui/tests -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.bmp' \) | grep -q . && echo "ERROR: Pixel-based snapshots are prohibited (2_TAS-REQ-015F)" && exit 1
  ```

## 3. Code Review
- [ ] Verify `ratatui::backend::TestBackend` is used — no `CrosstermBackend`, no real terminal.
- [ ] Verify `insta::assert_snapshot!` is used for snapshot comparison — no manual string comparison for full-frame snapshots.
- [ ] Verify cell-level assertions use `buffer.get(x, y).symbol()` as specified in the requirement.
- [ ] Verify no test depends on an external display server, PTY, or X11/Wayland.
- [ ] Verify snapshot files are text-only (`.snap` format).
- [ ] Verify the `render_to_string` helper masks or avoids any non-deterministic content.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and confirm all snapshot tests pass.
- [ ] Run `cargo insta test -p devs-tui` to verify snapshots are up-to-date (no pending reviews).
- [ ] Verify `devs-tui/snapshots/` contains `.snap` files after the test run.

## 5. Update Documentation
- [ ] Add doc comments to the test helper functions explaining the headless testing approach.
- [ ] Add `// Covers: 2_TAS-REQ-015F` to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui -- --test-threads=1` and assert exit code 0.
- [ ] Run `find devs-tui/snapshots -name '*.snap' | head -1` and assert at least one snapshot file exists.
- [ ] Run `find devs-tui -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.bmp' \)` and assert no output (no pixel snapshots).
- [ ] Run `grep -r '2_TAS-REQ-015F' devs-tui/` and verify at least one match.
