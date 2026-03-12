# Task: TUI Log Management (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-100], [7_UI_UX_DESIGN-REQ-101], [7_UI_UX_DESIGN-REQ-117], [7_UI_UX_DESIGN-REQ-126], [7_UI_UX_DESIGN-REQ-127], [7_UI_UX_DESIGN-REQ-128], [7_UI_UX_DESIGN-REQ-129], [7_UI_UX_DESIGN-REQ-130], [7_UI_UX_DESIGN-REQ-131], [7_UI_UX_DESIGN-REQ-132], [7_UI_UX_DESIGN-REQ-133], [7_UI_UX_DESIGN-REQ-134], [7_UI_UX_DESIGN-REQ-135]

## Dependencies
- depends_on: [01_tui_foundational_strings_hygiene.md, 02_tui_theme_styling.md]
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-tui/src/log_buffer.rs` to verify:
    - `LogLine::new()` with raw ANSI content stores both the `raw_content` and a `stripped_content` (no ANSI).
    - `LogBuffer::push()` normalizes CR characters (`\r\n` -> `\n`, `\r` -> `\n`).
    - `LogBuffer` respects its configured capacity (e.g., 10,000 lines).
    - `LogBuffer::is_truncated()` returns true when capacity is exceeded and oldest lines are dropped.
    - ANSI stripping of common codes (color, bold, dim, etc.).

## 2. Task Implementation
- [ ] Define `LogLine` struct with `timestamp`, `stream`, `content` (stripped), and `raw_content` fields.
- [ ] Implement `LogBuffer` struct with a `VecDeque<LogLine>` and `capacity` limit.
- [ ] Implement the ANSI stripping regex or state machine (as specified in §1.6 of design docs).
- [ ] Implement `push_str()` on `LogBuffer` that handles line splitting and normalization.
- [ ] Ensure all log ingestion occurs before storage (per [REQ-100]).

## 3. Code Review
- [ ] Verify that `LogLine::content` is used for all UI rendering, never `raw_content`.
- [ ] Confirm CR normalization behaves correctly with mixed line endings.
- [ ] Ensure the capacity limit is enforced during every push.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-tui -- log_buffer`

## 5. Update Documentation
- [ ] Update `devs-tui` developer notes with the log ingestion policy.

## 6. Automated Verification
- [ ] Write a test case that pushes a string with multiple `\r\n` and ANSI sequences, then assert the `LogBuffer::len()` and `content` of the individual lines.
