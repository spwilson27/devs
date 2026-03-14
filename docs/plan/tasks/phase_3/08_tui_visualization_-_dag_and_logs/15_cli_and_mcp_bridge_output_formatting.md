# Task: CLI & MCP Bridge Output Formatting (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-005], [7_UI_UX_DESIGN-REQ-019], [7_UI_UX_DESIGN-REQ-020], [7_UI_UX_DESIGN-REQ-021], [7_UI_UX_DESIGN-REQ-022], [7_UI_UX_DESIGN-REQ-023], [7_UI_UX_DESIGN-REQ-024], [7_UI_UX_DESIGN-REQ-063], [7_UI_UX_DESIGN-REQ-108], [7_UI_UX_DESIGN-REQ-109], [7_UI_UX_DESIGN-REQ-110], [7_UI_UX_DESIGN-REQ-111], [7_UI_UX_DESIGN-REQ-251], [7_UI_UX_DESIGN-REQ-252], [7_UI_UX_DESIGN-REQ-253], [7_UI_UX_DESIGN-REQ-254], [7_UI_UX_DESIGN-REQ-255], [7_UI_UX_DESIGN-REQ-256], [7_UI_UX_DESIGN-REQ-272], [7_UI_UX_DESIGN-REQ-273], [7_UI_UX_DESIGN-REQ-274], [7_UI_UX_DESIGN-REQ-275], [7_UI_UX_DESIGN-REQ-276], [7_UI_UX_DESIGN-REQ-277], [7_UI_UX_DESIGN-REQ-278], [7_UI_UX_DESIGN-REQ-279], [7_UI_UX_DESIGN-REQ-280], [7_UI_UX_DESIGN-REQ-281], [7_UI_UX_DESIGN-REQ-282], [7_UI_UX_DESIGN-REQ-283], [7_UI_UX_DESIGN-REQ-284], [7_UI_UX_DESIGN-REQ-285], [7_UI_UX_DESIGN-REQ-286], [7_UI_UX_DESIGN-REQ-287], [7_UI_UX_DESIGN-REQ-288], [7_UI_UX_DESIGN-REQ-289], [7_UI_UX_DESIGN-REQ-290], [7_UI_UX_DESIGN-REQ-291], [7_UI_UX_DESIGN-REQ-292], [7_UI_UX_DESIGN-REQ-293], [7_UI_UX_DESIGN-REQ-294], [7_UI_UX_DESIGN-REQ-295], [7_UI_UX_DESIGN-REQ-296], [7_UI_UX_DESIGN-REQ-297]

## Dependencies
- depends_on: ["01_string_constants_and_ascii_hygiene.md"]
- shared_components: [devs-proto (consumer), devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-cli/src/output.rs` and `crates/devs-mcp-bridge/src/output.rs` (empty). Create `crates/devs-cli/tests/output_tests.rs` and `crates/devs-mcp-bridge/tests/bridge_tests.rs`.
- [ ] Write `test_cli_json_all_to_stdout` — `--format json` writes ALL output (success and error) to stdout, zero bytes to stderr (REQ-108, REQ-254).
- [ ] Write `test_cli_json_error_format` — errors as `{"error": "prefix: detail", "code": N}` (REQ-020, REQ-108).
- [ ] Write `test_cli_text_no_ansi` — text mode output contains no ANSI escape codes (REQ-021).
- [ ] Write `test_cli_text_column_spacing` — columns separated by exactly 2 spaces (REQ-110).
- [ ] Write `test_cli_text_truncation` — column widths computed per-response; values truncated to N-3 + "..." (REQ-019).
- [ ] Write `test_cli_no_spinner_no_progress` — no spinners, progress bars, or cursor movement; pure sequential newline-delimited output (REQ-022).
- [ ] Write `test_cli_text_errors_use_prefixes` — errors in text mode distinguished by machine-stable prefixes, no colors (REQ-063, REQ-109).
- [ ] Write `test_cli_timestamp_format_text` — "YYYY-MM-DD HH:MM:SS UTC" in text mode (REQ-111).
- [ ] Write `test_cli_timestamp_format_json` — RFC 3339 with milliseconds in JSON mode (REQ-111).
- [ ] Write `test_cli_machine_readable` — dual human/AI agent consumption with stable schemas (REQ-005).
- [ ] Write `test_cli_error_prefix_machine_stable` — all error strings begin with machine-stable prefix (REQ-255).
- [ ] Write `test_cli_error_code_matches_exit` — `"code"` field equals CLI exit code (REQ-256).
- [ ] Write `test_cli_logs_follow_stream` — `devs logs --follow` uses `stream_log_lines()` (REQ-251).
- [ ] Write `test_cli_no_interactive_prompt` — no interactive prompt/confirmation in CLI (REQ-252).
- [ ] Write `test_cli_json_valid` — all JSON output parseable by `serde_json::from_str` (REQ-253).
- [ ] Write `test_submit_json_output` — `devs submit --format json` outputs single object with run_id, slug (REQ-272).
- [ ] Write `test_list_json_output` — `devs list --format json` outputs sorted array (REQ-273).
- [ ] Write `test_list_no_stage_runs` — `stage_runs` never included in list output (REQ-274).
- [ ] Write `test_list_empty_returns_empty_array` — empty result set returns `[]`, not null/error (REQ-275).
- [ ] Write tests for REQ-276 through REQ-281: JSON schemas for status, logs, cancel, pause, resume, project commands.
- [ ] Write `test_bridge_stdout_only` — all MCP bridge output is newline-delimited JSON to stdout (REQ-023, REQ-282).
- [ ] Write `test_bridge_no_buffering` — each response flushed immediately (REQ-024, REQ-283).
- [ ] Write `test_bridge_startup` — bridge startup behavior and discovery (REQ-284, REQ-285).
- [ ] Write `test_bridge_connection_loss_fatal` — connection loss produces `{"fatal": true}` (REQ-023, REQ-286).
- [ ] Write tests for REQ-287 through REQ-297: bridge JSON-RPC handling, error responses, stream semantics, ConnectionStatus state machine.

## 2. Task Implementation
- [ ] Implement CLI output formatting in `crates/devs-cli/src/output.rs`:
  - Text mode: no ANSI (REQ-021), 2-space column separation (REQ-110), ellipsis truncation (REQ-019).
  - JSON mode: all to stdout (REQ-108), errors as `{"error": "prefix: detail", "code": N}` (REQ-020).
  - No spinners/progress bars (REQ-022). No interactive prompts (REQ-252).
  - Timestamps: text="YYYY-MM-DD HH:MM:SS UTC", JSON=RFC 3339 ms (REQ-111).
  - Error strings with machine-stable prefixes (REQ-255). Code matches exit code (REQ-256).
- [ ] Implement JSON output schemas for each command (REQ-272-281).
- [ ] Implement MCP bridge output in `crates/devs-mcp-bridge/src/output.rs`:
  - Newline-delimited JSON to stdout (REQ-023, REQ-282).
  - Immediate flush per response (REQ-024, REQ-283).
  - Connection loss: `{"fatal": true}` (REQ-286).
  - JSON-RPC request handling and error responses (REQ-287-297).

## 3. Code Review
- [ ] Verify zero ANSI codes in CLI output.
- [ ] Verify all JSON output is valid (parseable).
- [ ] Verify MCP bridge flushes after every write.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli --test output_tests` and `cargo test -p devs-mcp-bridge --test bridge_tests`.

## 5. Update Documentation
- [ ] Document CLI output format specification and MCP bridge protocol.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all CLI and bridge output tests pass.
