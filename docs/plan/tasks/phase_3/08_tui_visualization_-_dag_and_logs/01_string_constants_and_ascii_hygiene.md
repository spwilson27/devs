# Task: String Constants & ASCII Hygiene Foundation (Sub-Epic: 08_TUI Visualization - DAG and Logs)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-001], [7_UI_UX_DESIGN-REQ-002], [7_UI_UX_DESIGN-REQ-003], [7_UI_UX_DESIGN-REQ-010], [7_UI_UX_DESIGN-REQ-011], [7_UI_UX_DESIGN-REQ-012], [7_UI_UX_DESIGN-REQ-013], [7_UI_UX_DESIGN-REQ-014], [7_UI_UX_DESIGN-REQ-029], [7_UI_UX_DESIGN-REQ-032], [7_UI_UX_DESIGN-REQ-105], [7_UI_UX_DESIGN-REQ-106], [7_UI_UX_DESIGN-REQ-107], [7_UI_UX_DESIGN-REQ-455], [7_UI_UX_DESIGN-REQ-456], [7_UI_UX_DESIGN-REQ-457], [7_UI_UX_DESIGN-REQ-458], [7_UI_UX_DESIGN-REQ-459], [7_UI_UX_DESIGN-REQ-460], [7_UI_UX_DESIGN-REQ-461], [7_UI_UX_DESIGN-REQ-462], [7_UI_UX_DESIGN-REQ-463], [7_UI_UX_DESIGN-REQ-464], [7_UI_UX_DESIGN-REQ-465], [7_UI_UX_DESIGN-REQ-466], [7_UI_UX_DESIGN-REQ-467], [7_UI_UX_DESIGN-REQ-468], [7_UI_UX_DESIGN-REQ-469]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/src/strings.rs` with an empty module. Create `crates/devs-tui/tests/strings_hygiene.rs`.
- [ ] Write test `test_all_status_labels_are_4_bytes` that imports all `STATUS_*` constants from `strings.rs` and asserts each is exactly 4 bytes via `const_assert!(STATUS_PENDING.len() == 4)` style compile-time checks (REQ-012, REQ-107).
- [ ] Write test `test_all_strings_are_ascii_only` that iterates every exported `pub const` in `strings.rs` and asserts `s.is_ascii()` for each (REQ-002, REQ-029).
- [ ] Write test `test_err_prefixes_have_machine_stable_format` verifying all `ERR_*` constants begin with one of the allowed prefixes: `not_found:`, `invalid_argument:`, `unavailable:`, `internal:`, `already_exists:`, `cancelled:` (REQ-013).
- [ ] Write test `test_no_decorative_unicode` scanning all string constants for characters outside U+0020-U+007E and asserting none found (REQ-001, REQ-002).
- [ ] Write lint test `strings_no_inline_errors` that scans `crates/devs-tui/src/` source files for inline string literals matching error prefix patterns, asserting they only appear in `strings.rs` (REQ-032, REQ-106, REQ-460).
- [ ] Write test for `devs-mcp-bridge` strings module verifying it contains only `ERR_*` and `MSG_*` constants, no visual rendering constants (REQ-014).
- [ ] Write acceptance tests covering REQ-455 through REQ-469: each status label constant individually asserted for length, ASCII-only content, and correct value matching its `StageStatus` variant.

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/strings.rs` defining all user-visible string constants as `pub const &'static str` (REQ-010, REQ-105):
  - `STATUS_PENDING = "PEND"`, `STATUS_WAITING = "WAIT"`, `STATUS_ELIGIBLE = "ELIG"`, `STATUS_RUNNING = "RUN "`, `STATUS_PAUSED = "PAUS"`, `STATUS_DONE = "DONE"`, `STATUS_FAILED = "FAIL"`, `STATUS_TIMED_OUT = "TIME"`, `STATUS_CANCELLED = "CANC"` (REQ-012, REQ-011).
  - Error prefix constants: `ERR_NOT_FOUND`, `ERR_INVALID_ARGUMENT`, `ERR_UNAVAILABLE`, `ERR_INTERNAL`, `ERR_ALREADY_EXISTS`, `ERR_CANCELLED` (REQ-013).
  - UI label constants: tab labels, status bar labels, help overlay text.
- [ ] All constants must use only ASCII U+0020-U+007E characters (REQ-002, REQ-029). No emoji, no Unicode box-drawing (REQ-001).
- [ ] Ensure English-only strings (REQ-010). Every user-visible string lives in `strings.rs`, never inline (REQ-011, REQ-105).
- [ ] Create `crates/devs-mcp-bridge/src/strings.rs` with only `ERR_*` and `MSG_*` constants (REQ-014).
- [ ] Color must never be the sole differentiator of meaning (REQ-003).

## 3. Code Review
- [ ] Verify no inline string literals in widget/tab source files (only structural single chars like `|`, `[`, `]` are exempt).
- [ ] Verify all `STATUS_*` constants are exactly 4 bytes.
- [ ] Verify module is `pub mod strings;` in `lib.rs` and exported correctly.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui --lib strings` and `cargo test -p devs-tui --test strings_hygiene`.

## 5. Update Documentation
- [ ] Add doc comments to `strings.rs` explaining the string hygiene policy and referencing the design spec.

## 6. Automated Verification
- [ ] Run `./do lint` which includes the strings hygiene scan. Run `./do test` and confirm all string-related tests pass with zero failures.
