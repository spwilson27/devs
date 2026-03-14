# Task: ANSI Stripping & Log Buffer Management (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-017], [7_UI_UX_DESIGN-REQ-100], [7_UI_UX_DESIGN-REQ-101], [7_UI_UX_DESIGN-REQ-102], [7_UI_UX_DESIGN-REQ-103], [7_UI_UX_DESIGN-REQ-104], [7_UI_UX_DESIGN-REQ-117], [7_UI_UX_DESIGN-REQ-126], [7_UI_UX_DESIGN-REQ-127], [7_UI_UX_DESIGN-REQ-128], [7_UI_UX_DESIGN-REQ-129], [7_UI_UX_DESIGN-REQ-130], [7_UI_UX_DESIGN-REQ-131], [7_UI_UX_DESIGN-REQ-132], [7_UI_UX_DESIGN-REQ-133], [7_UI_UX_DESIGN-REQ-134], [7_UI_UX_DESIGN-REQ-135], [7_UI_UX_DESIGN-REQ-228], [7_UI_UX_DESIGN-REQ-233], [7_UI_UX_DESIGN-REQ-234], [7_UI_UX_DESIGN-REQ-236], [7_UI_UX_DESIGN-REQ-237], [7_UI_UX_DESIGN-REQ-238]

## Dependencies
- depends_on: ["01_string_constants_and_ascii_hygiene.md", "02_theme_and_color_mode_system.md"]
- shared_components: [devs-core (consumer), devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/log_buffer.rs` (empty). Create `crates/devs-tui/tests/log_buffer_tests.rs`.
- [ ] Write `test_strip_ansi_no_escapes` — input without ANSI returns `Cow::Borrowed` unchanged (REQ-104).
- [ ] Write `test_strip_ansi_csi_color` — `"\x1b[31mRed\x1b[0m"` → `"Red"` (REQ-030, REQ-100, REQ-102).
- [ ] Write `test_strip_ansi_nested_csi` — multiple CSI sequences correctly stripped (REQ-103).
- [ ] Write `test_strip_ansi_incomplete_escape` — incomplete ESC sequence at end of input doesn't panic (REQ-104).
- [ ] Write `test_strip_ansi_utf8_passthrough` — multi-byte UTF-8 sequences pass through unchanged (REQ-101).
- [ ] Write `test_strip_ansi_carriage_return_normalization` — `\r\n` becomes `\n`; standalone `\r` removed (REQ-031).
- [ ] Write `test_strip_ansi_pure_function` — no side effects, no I/O, no panics on any input including empty string and binary-like data (REQ-104).
- [ ] Write `test_log_buffer_push_stores_stripped_and_raw` — `LogBuffer::push(raw_line)` stores `LogLine { content: stripped, raw_content: raw }` (REQ-100, REQ-237).
- [ ] Write `test_log_buffer_max_capacity_eviction` — when buffer reaches max capacity, oldest entries are evicted on push (REQ-236, REQ-126).
- [ ] Write `test_log_buffer_truncated_flag` — after eviction, `LogBuffer::truncated == true` (REQ-127).
- [ ] Write `test_log_buffer_per_run_per_stage` — LogBuffer keyed by (run_id, stage_name) (REQ-128).
- [ ] Write `test_log_buffer_eviction_on_run_disappear` — when a run disappears from server state, its LogBuffer entries are evicted (REQ-228).
- [ ] Write `test_log_buffer_ansi_stripped_at_ingestion` — verify stripping happens at push time, not at render time (REQ-017, REQ-100).
- [ ] Write `test_log_tail_auto_scroll` — new line appended triggers auto-scroll to bottom (REQ-233, REQ-234). No animation (REQ-234).
- [ ] Write `test_log_tail_all_stages_when_none_selected` — when `selected_stage == None`, LogTail shows all stages for the run (REQ-238).
- [ ] Write tests covering REQ-129 through REQ-135: buffer initialization, capacity configuration, thread safety, iterator access, clear operation, and memory bounds.

## 2. Task Implementation
- [ ] Implement `strip_ansi(input: &str) -> Cow<str>` as a 3-state machine (Normal/Escape/Csi) processing bytes (REQ-030, REQ-101, REQ-102, REQ-103). Handle `\r\n`→`\n` and standalone `\r` removal (REQ-031). Pure function (REQ-104).
- [ ] Implement `LogLine` struct: `content: String` (stripped), `raw_content: String` (original), `stream: LogStream`, `timestamp: DateTime<Utc>`, `sequence: u64` (REQ-100, REQ-237).
- [ ] Implement `LogBuffer` with configurable max capacity (REQ-126), FIFO eviction (REQ-236), `truncated: bool` flag (REQ-127), keyed by `(RunId, Option<StageName>)` (REQ-128).
- [ ] `LogBuffer::push(raw: &str, stream: LogStream)` — strips ANSI at ingestion point (REQ-017, REQ-100).
- [ ] Implement run-disappearance eviction logic (REQ-228).
- [ ] Implement auto-scroll behavior: `LogBuffer::should_auto_scroll` flag, set to true on push, consumed by render (REQ-233). No animation (REQ-234).
- [ ] When no stage is selected, log tail shows all stages for selected run (REQ-238).

## 3. Code Review
- [ ] Verify `strip_ansi` has no I/O, no global state access, no panics.
- [ ] Verify ANSI stripping happens only in `LogBuffer::push`, not duplicated elsewhere.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib log_buffer` and `cargo test -p devs-tui --test log_buffer_tests`.

## 5. Update Documentation
- [ ] Document the ANSI stripping algorithm and LogBuffer capacity/eviction policy.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures for log_buffer tests.
