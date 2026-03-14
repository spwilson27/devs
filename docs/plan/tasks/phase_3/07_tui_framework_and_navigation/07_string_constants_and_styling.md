# Task: String Constants and Styling System (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-022], [6_UI_UX_ARCHITECTURE-REQ-029], [6_UI_UX_ARCHITECTURE-REQ-042], [6_UI_UX_ARCHITECTURE-REQ-048], [6_UI_UX_ARCHITECTURE-REQ-049], [6_UI_UX_ARCHITECTURE-REQ-052], [6_UI_UX_ARCHITECTURE-REQ-300], [6_UI_UX_ARCHITECTURE-REQ-316], [6_UI_UX_ARCHITECTURE-REQ-317], [6_UI_UX_ARCHITECTURE-REQ-318], [6_UI_UX_ARCHITECTURE-REQ-319], [6_UI_UX_ARCHITECTURE-REQ-320], [6_UI_UX_ARCHITECTURE-REQ-321], [6_UI_UX_ARCHITECTURE-REQ-322], [6_UI_UX_ARCHITECTURE-REQ-323], [6_UI_UX_ARCHITECTURE-REQ-326], [6_UI_UX_ARCHITECTURE-REQ-423]

## Dependencies
- depends_on: ["01_tui_crate_scaffold_and_event_loop.md"]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Write compile-time assertion tests that all status label constants are exactly 4 bytes: `PEND`, `WAIT`, `ELIG`, `RUN ` (with trailing space), `PAUS`, `DONE`, `FAIL`, `TIME`, `CANC`, `SKIP` (REQ-052, REQ-321)
- [ ] Write lint test that scans `crates/devs-tui/src/` for user-visible string literals outside of `strings.rs` (REQ-316, REQ-320)
- [ ] Write test that `NO_COLOR` env var (any non-empty value) suppresses all ANSI codes from CLI text output (REQ-042, REQ-423)
- [ ] Write test that `ColorMode::Monochrome` produces no ANSI escape sequences in rendered output (REQ-326)
- [ ] Write test verifying string constant naming follows `CONTEXT_TYPE` or `CONTEXT_ACTION` convention (REQ-317)
- [ ] Write test verifying required string categories exist: `STATUS_*`, `LABEL_*`, `MSG_*`, `KEY_*`, `ERROR_*` (REQ-318)
- [ ] Write test that no static assets (images, fonts, CSS, icons) exist in the TUI crate (REQ-322)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/strings.rs` containing ALL user-visible string constants (REQ-049, REQ-316)
- [ ] Define status label constants with compile-time length assertions: `pub const STATUS_PENDING: &str = "PEND";` etc., each exactly 4 bytes (REQ-052, REQ-321)
- [ ] Define string categories: `STATUS_CONNECTED`, `STATUS_RECONNECTING`, `STATUS_DISCONNECTED`, `LABEL_DASHBOARD`, `LABEL_LOGS`, `LABEL_DEBUG`, `LABEL_POOLS`, `MSG_TOO_SMALL`, `MSG_DISCONNECTED`, `KEY_QUIT`, `KEY_HELP`, `ERROR_SERVER_UNREACHABLE`, `ERROR_NOT_FOUND`, `ERROR_INVALID_ARGUMENT` etc. (REQ-317, REQ-318)
- [ ] Define CLI string constants in a separate section or shared module (REQ-319)
- [ ] Implement `ColorMode` enum: `Normal`, `Monochrome` with detection based on `NO_COLOR` env var (REQ-042, REQ-326, REQ-423)
- [ ] Implement error string formatting with machine-stable prefixes: `not_found`, `invalid_argument`, `server_unreachable`, etc. (REQ-300)
- [ ] Ensure no static asset files exist in the crate (REQ-322)
- [ ] Implement ANSI stripping for CLI output when `NO_COLOR` is set (REQ-042, REQ-423)

## 3. Code Review
- [ ] Verify all user-visible strings are in strings.rs only (REQ-316)
- [ ] Verify status labels are exactly 4 bytes each (REQ-321)
- [ ] Verify NO_COLOR support works correctly (REQ-423)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- strings` and `cargo test -p devs-tui -- styling`

## 5. Update Documentation
- [ ] Add doc comments to strings.rs explaining the localization-ready convention

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
