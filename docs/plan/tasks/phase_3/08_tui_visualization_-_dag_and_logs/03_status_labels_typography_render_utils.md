# Task: Status Labels, Typography & Render Utilities (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-033], [7_UI_UX_DESIGN-REQ-034], [7_UI_UX_DESIGN-REQ-035], [7_UI_UX_DESIGN-REQ-071], [7_UI_UX_DESIGN-REQ-072], [7_UI_UX_DESIGN-REQ-073], [7_UI_UX_DESIGN-REQ-074], [7_UI_UX_DESIGN-REQ-075], [7_UI_UX_DESIGN-REQ-083], [7_UI_UX_DESIGN-REQ-084], [7_UI_UX_DESIGN-REQ-085], [7_UI_UX_DESIGN-REQ-086], [7_UI_UX_DESIGN-REQ-087], [7_UI_UX_DESIGN-REQ-088], [7_UI_UX_DESIGN-REQ-089], [7_UI_UX_DESIGN-REQ-090], [7_UI_UX_DESIGN-REQ-091], [7_UI_UX_DESIGN-REQ-092], [7_UI_UX_DESIGN-REQ-093], [7_UI_UX_DESIGN-REQ-094], [7_UI_UX_DESIGN-REQ-095], [7_UI_UX_DESIGN-REQ-096], [7_UI_UX_DESIGN-REQ-097], [7_UI_UX_DESIGN-REQ-098], [7_UI_UX_DESIGN-REQ-099], [7_UI_UX_DESIGN-REQ-177], [7_UI_UX_DESIGN-REQ-178], [7_UI_UX_DESIGN-REQ-179], [7_UI_UX_DESIGN-REQ-311], [7_UI_UX_DESIGN-REQ-312], [7_UI_UX_DESIGN-REQ-313]

## Dependencies
- depends_on: ["01_string_constants_and_ascii_hygiene.md"]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/render_utils.rs` (empty). Create tests in `crates/devs-tui/tests/render_utils_tests.rs`.
- [ ] Write `test_status_labels_compile_time_4_bytes` — individual compile-time assertions for every STATUS_* constant: `const _: () = assert!(STATUS_PENDING.len() == 4);` etc. (REQ-033, REQ-083, REQ-084, REQ-085).
- [ ] Write `test_format_elapsed_not_started` — `format_elapsed(None) == "--:--"` (REQ-089).
- [ ] Write `test_format_elapsed_zero_seconds` — `format_elapsed(Some(0)) == " 0:00"` (REQ-089).
- [ ] Write `test_format_elapsed_59_seconds` — `format_elapsed(Some(59)) == " 0:59"` (REQ-089).
- [ ] Write `test_format_elapsed_100_minutes` — `format_elapsed(Some(6000))` returns a string >=5 chars, overflow accepted (REQ-091).
- [ ] Write `test_format_elapsed_always_5_chars` — for values 0..=5999, output is exactly 5 chars (REQ-089, REQ-090).
- [ ] Write `test_format_elapsed_terminal_state_fixed` — verify elapsed doesn't change after stage completion (REQ-093). Test with a mock stage that transitions to Done.
- [ ] Write `test_truncate_with_tilde_short_name` — `truncate_with_tilde("plan", 20) == "plan                "` (right-padded to 20) (REQ-095, REQ-177).
- [ ] Write `test_truncate_with_tilde_exact_20` — `truncate_with_tilde("12345678901234567890", 20)` returns unchanged (REQ-095, REQ-313).
- [ ] Write `test_truncate_with_tilde_21_chars` — `truncate_with_tilde("123456789012345678901", 20)` returns 19 chars + `~` (REQ-095, REQ-177).
- [ ] Write `test_truncate_with_tilde_unicode` — operates on Unicode scalar values (char), counts as 1 column each (REQ-096).
- [ ] Write `test_truncate_with_tilde_exactly_20_output` — output always has exactly `chars().count() == 20` (REQ-178).
- [ ] Write `test_fanout_stage_display` — `format_stage_name("build", Some(3))` produces `"build (x3)"` before truncation (REQ-087, REQ-179, REQ-311).
- [ ] Write `test_fanout_overflow_truncation` — very long name + fanout suffix truncated correctly with tilde (REQ-098, REQ-312).
- [ ] Write `test_fanout_not_individual_boxes` — assert fan-out sub-runs produce a single aggregated box, not N boxes (REQ-088).
- [ ] Write `test_run_status_labels_lowercase` — all RunStatus display strings are lowercase (REQ-086).
- [ ] Write `test_cli_truncation_uses_ellipsis` — `truncate_cli("long_value", 7) == "lon..."` (REQ-099).
- [ ] Write `test_no_panic_on_non_ascii` — pass non-ASCII and CJK characters; verify no panic (REQ-073).
- [ ] Write `test_slug_ascii_assumption` — slugs matching `[a-z0-9_-]` are safe to treat as ASCII (REQ-074).
- [ ] Write `test_run_name_utf8_clamped` — names >128 bytes are clamped; replacment char used for invalid UTF-8 (REQ-075).
- [ ] Verify `cargo doc --no-deps -p devs-tui` produces zero warnings (REQ-034).
- [ ] Write test confirming no `unicode-*` crate deps without explicit approval (REQ-035).

## 2. Task Implementation
- [ ] Implement `format_elapsed(elapsed_secs: Option<u64>) -> String` in `render_utils.rs` as the single authoritative function (REQ-094). Returns exactly 5 chars: `M:SS` format or `--:--` (REQ-089). Computed in `handle_event()` on Tick, not in `render()` (REQ-092).
- [ ] Implement `truncate_with_tilde(name: &str, max_len: usize) -> String` in `render_utils.rs` as the single authoritative function (REQ-097). Operates on Unicode scalar values (REQ-096). Output exactly `max_len` chars (REQ-178). Called with `max_len=20` for stage names (REQ-097).
- [ ] Implement `format_stage_name(name: &str, fanout_count: Option<usize>) -> String` — appends ` (xN)` suffix before calling `truncate_with_tilde` (REQ-087, REQ-179). If combined length exceeds 20, tilde truncation applies to the combined string (REQ-098, REQ-312).
- [ ] Implement `truncate_cli(value: &str, max_width: usize) -> String` — truncates to `max_width - 3` + `"..."` for CLI tabular output (REQ-099).
- [ ] Implement `format_run_status(status: &RunStatus) -> &'static str` — returns lowercase labels (REQ-086).
- [ ] All rendering assumes terminal monospace font (REQ-071, REQ-072). Non-ASCII characters pass through without panic (REQ-073).

## 3. Code Review
- [ ] Verify `format_elapsed` and `truncate_with_tilde` are the only implementations (no duplicates elsewhere).
- [ ] Verify no runtime fallback like `"????"` for missing status variants (REQ-085).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib render_utils` and `cargo test -p devs-tui --test render_utils_tests`.

## 5. Update Documentation
- [ ] Add doc comments to all public functions in `render_utils.rs`.

## 6. Automated Verification
- [ ] Run `./do test` and `cargo doc --no-deps -p devs-tui 2>&1 | grep warning` — verify zero warnings.
