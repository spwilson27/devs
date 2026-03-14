# Task: TUI Text-Snapshot and Interaction Test Infrastructure (Sub-Epic: 039_Detailed Domain Specifications (Part 4))

## Covered Requirements
- [1_PRD-REQ-052]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script & CI Pipeline" (consume)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/tests/snapshot_harness_test.rs` that:
    - Instantiates a `ratatui::backend::TestBackend` with dimensions 80x24.
    - Creates a minimal `App` struct (or stub) with a single "Hello, devs!" label.
    - Calls `terminal.draw(|f| app.render(f))` to render one frame.
    - Extracts the rendered buffer as a `String` using the harness's `buffer_to_string()` method.
    - Asserts the string contains `"Hello, devs!"`.
    - Writes the string to `tests/snapshots/hello.txt.new` and compares against `tests/snapshots/hello.txt` (golden file). Fails if they differ.
- [ ] Create `crates/devs-tui/tests/interaction_test.rs` that:
    - Instantiates the `TuiTestHarness`.
    - Sends a simulated keypress event (e.g., `KeyCode::Tab`) to the app's event handler.
    - Renders the frame after the event.
    - Asserts the app state changed (e.g., active tab index incremented).
    - Captures the new render as text and asserts it differs from the initial snapshot.
- [ ] Create `crates/devs-tui/tests/no_pixel_snapshot_test.rs` that:
    - Searches `crates/devs-tui/` for any `.png`, `.jpg`, `.bmp`, or `.tiff` files in `tests/snapshots/`.
    - Asserts none exist — enforcing the text-only snapshot policy [1_PRD-REQ-052].

## 2. Task Implementation
- [ ] Create a `TuiTestHarness` struct in `crates/devs-tui/src/test_utils.rs` (behind `#[cfg(test)]`) or as a dev-dependency utility:
    - Fields: `terminal: Terminal<TestBackend>`, `app: App`.
    - `fn new(width: u16, height: u16) -> Self` — creates a `TestBackend` and `Terminal`.
    - `fn send_key(&mut self, key: KeyCode)` — dispatches a key event to the app's input handler.
    - `fn send_keys(&mut self, keys: &[KeyCode])` — sends a sequence of key events.
    - `fn render(&mut self) -> String` — calls `terminal.draw()` and converts the buffer to a text string.
    - `fn buffer_to_string(buffer: &Buffer) -> String` — iterates over each cell in the buffer, concatenating characters row-by-row with newline separators. Trailing spaces on each row are trimmed.
- [ ] Implement an `assert_snapshot!(name: &str, actual: &str)` function (not necessarily a macro) that:
    - Reads the golden file at `tests/snapshots/{name}.txt`.
    - If the golden file does not exist and `DEVS_UPDATE_SNAPSHOTS=1` env var is set, writes `actual` as the new golden file and passes.
    - If the golden file exists, compares line-by-line. On mismatch, prints a unified diff and panics with a clear error message.
    - If `DEVS_UPDATE_SNAPSHOTS=1` is set and there's a mismatch, overwrites the golden file and passes (for snapshot update workflow).
- [ ] Ensure all snapshot files are `.txt` — never binary image formats [1_PRD-REQ-052].
- [ ] Add `ratatui = { version = "...", features = ["crossterm"] }` and `crossterm` as dev-dependencies to `crates/devs-tui/Cargo.toml` if not already present.

## 3. Code Review
- [ ] Verify `buffer_to_string` produces deterministic, human-readable output suitable for git diffs.
- [ ] Verify interaction tests drive the app through its event handler (not by mutating state directly).
- [ ] Verify no pixel-level snapshot libraries (e.g., `insta` with image mode, `screenshot-rs`) are in dependencies.
- [ ] Verify snapshot golden files are committed to the repo and tracked by git.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and confirm the snapshot and interaction tests pass.
- [ ] Modify the "Hello, devs!" string to "Hello, world!" and run tests — confirm the snapshot test fails with a diff.
- [ ] Restore the string and confirm tests pass again.

## 5. Update Documentation
- [ ] Document the TUI testing approach in `docs/dev/tui_testing.md`: (a) use `TuiTestHarness` for all TUI tests, (b) text snapshots only, (c) update snapshots with `DEVS_UPDATE_SNAPSHOTS=1 cargo test`.

## 6. Automated Verification
- [ ] Run `find crates/devs-tui/tests/snapshots -type f | grep -v '\.txt$'` and assert no output (no non-text snapshot files).
- [ ] Run `cargo test -p devs-tui` and confirm exit code 0.
