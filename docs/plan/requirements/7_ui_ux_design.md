# UI/UX Design Requirements

### **[UI-DES-001] [7_UI_UX_DESIGN-REQ-001]** Clarity over decoration
- **Type:** Functional
- **Description:** Every visual element must communicate state or structure. Decorative characters that carry no semantic meaning are prohibited
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-002] [7_UI_UX_DESIGN-REQ-002]** ASCII-first universality
- **Type:** Functional
- **Description:** All structural rendering uses ASCII characters U+0020–U+007E exclusively. Unicode box-drawing characters (`─ │ ┌ └`), block elements (`█ ▓`), and emoji are prohibited in all structural positions (DAG borders, status labels, progress indicators, table borders). This ensures correct rendering across xterm, VTE, Windows Console, and tmux
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-003] [7_UI_UX_DESIGN-REQ-003]** Color is additive, never load-bearing
- **Type:** Functional
- **Description:** Every state, status, or alert must be distinguishable by text label or ASCII symbol alone. Color is a secondary enhancement. When `NO_COLOR` is set, the interface must be fully operable with zero information loss
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-004] [7_UI_UX_DESIGN-REQ-004]** Predictable information density
- **Type:** Functional
- **Description:** The dashboard layout is fixed and non-configurable at MVP. Column widths, pane splits, and tier gutters use deterministic sizing rules defined in this document. No dynamic reflow that changes structural layout
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-005] [7_UI_UX_DESIGN-REQ-005]** Machine-readable CLI output
- **Type:** Functional
- **Description:** The CLI is designed equally for human operators and AI agent consumers. All commands expose `--format json` output using stable, versioned schemas. Error prefixes are machine-stable (see §5)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-006] [7_UI_UX_DESIGN-REQ-006]** Consistent temporal representation
- **Type:** Functional
- **Description:** Elapsed times are always expressed as `M:SS` (minutes:seconds), zero-padded seconds, no upper bound on minutes. Timestamps in structured output use RFC 3339 with millisecond precision and `Z` suffix
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-007] [7_UI_UX_DESIGN-REQ-007]** Minimal cognitive load for monitoring
- **Type:** Functional
- **Description:** The primary use case is observing running AI agent workflows. The interface prioritizes live status, log tail, and failure signals at the top of the visual hierarchy
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-008] [7_UI_UX_DESIGN-REQ-008]** Minimum supported terminal size:
- **Type:** Functional
- **Description:** 80 columns × 24 rows**. Below this, the TUI renders only a size warning and nothing else
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-009] [7_UI_UX_DESIGN-REQ-009]** The design system applies to three delivery surfaces:
- **Type:** Functional
- **Description:** The design system applies to three delivery surfaces:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-010] [7_UI_UX_DESIGN-REQ-010]** English-only at MVP
- **Type:** Functional
- **Description:** All user-visible strings are defined as `pub const &'static str` in a `strings.rs` module per crate, enabling future i18n extraction without source changes
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-001] [7_UI_UX_DESIGN-REQ-011]** Every user-visible string — including status labels, error messages, column h...
- **Type:** Functional
- **Description:** No inline string literal is permitted in widget `render()` methods, command handlers, or output formatters. This rule is enforced by the strings hygiene check in `./do lint` (see §1.7)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-002] [7_UI_UX_DESIGN-REQ-012]** All `STATUS_*` constants that represent stage or run status display labels MU...
- **Type:** Functional
- **Description:** This invariant is enforced by both a compile-time `const` assertion block and a runtime unit test in `crates/devs-tui/src/strings.rs`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-003] [7_UI_UX_DESIGN-REQ-013]** All `ERR_` constants MUST begin with exactly one of the ten machine-stable er...
- **Type:** Functional
- **Description:** The strings hygiene check in `./do lint` scans all `.rs` source files outside of `strings.rs` modules and fails if any string literal matching the error prefix pattern is found inline
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-004] [7_UI_UX_DESIGN-REQ-014]** The `devs-mcp-bridge` crate has a `strings.rs` module containing only `ERR_` ...
- **Type:** Functional
- **Description:** It has no `STATUS_`, `TAB_`, `KEY_`, `COL_`, or visual layout constants, because the bridge performs no visual rendering
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-005] [7_UI_UX_DESIGN-REQ-015]** The `render()` method of every widget MUST complete within
- **Type:** Functional
- **Description:** 16 milliseconds** (one frame budget at approximately 60 fps). No filesystem access, system calls, heap allocation proportional to content size (e.g., constructing new `Vec` or `String` inside render), or blocking operations are permitted inside `render()`. All data must be pre-computed and stored in `AppState` before render time. This constraint is validated by the unit test suite using `std::time::Instant` to measure `render()` duration against a 16 ms ceiling on representative test states
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-006] [7_UI_UX_DESIGN-REQ-016]** The TUI handles three categories of terminal input events:
- **Type:** Functional
- **Description:** The TUI handles three categories of terminal input events:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-007] [7_UI_UX_DESIGN-REQ-017]** ANSI escape sequences in agent log output MUST be stripped before insertion i...
- **Type:** Functional
- **Description:** The raw content (with ANSI intact) is preserved in `LogLine::raw_content` for disk-level log files; only the stripped content in `LogLine::content` is rendered. The stripping algorithm is defined in §1.6 of this document
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-008] [7_UI_UX_DESIGN-REQ-018]** At terminal sizes below 80×24, the TUI MUST render only the minimum-terminal-...
- **Type:** Functional
- **Description:** No tab bar, status bar, DAG view, log pane, or any other widget is rendered. Rendering of the full interface resumes immediately when the terminal is resized above the threshold, on the next `Resize` event from crossterm. The warning message uses no color, no modifiers, and no structural characters beyond alphanumeric text, spaces, `x` (as dimension separator), and `:`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-009] [7_UI_UX_DESIGN-REQ-019]** In `--format text` mode, the CLI uses aligned columns for tabular output (run...
- **Type:** Functional
- **Description:** Column widths are computed from the widest value in the current response, not fixed globally. Values that exceed a column's computed width are truncated to `N-3` characters with `...` (three ASCII full stops) appended, where N is the column width. No line-wrapping occurs
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-010] [7_UI_UX_DESIGN-REQ-020]** In `--format json` mode, ALL output — including error messages — goes to stdout
- **Type:** Functional
- **Description:** Nothing is written to stderr. The format for all error responses is:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-011] [7_UI_UX_DESIGN-REQ-021]** Color is never used in CLI output in either text or JSON mode
- **Type:** Functional
- **Description:** The CLI does not read `NO_COLOR`. All visual differentiation in text mode uses column alignment, separator characters (e.g., `---` under column headers), and the machine-stable error prefix vocabulary
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-012] [7_UI_UX_DESIGN-REQ-022]** CLI streaming operations (e.g., `devs logs --follow`) use no spinner characte...
- **Type:** Functional
- **Description:** Output is purely sequential newline-delimited lines. Each log line is appended as received; the final line on completion is a one-line status summary. This ensures output can be safely captured, piped, or parsed by AI agents
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-013] [7_UI_UX_DESIGN-REQ-023]** The bridge writes to stdout only, never to stderr
- **Type:** Functional
- **Description:** All output — forwarded responses, error conditions, and the fatal connection-loss message — is newline-delimited JSON, one object per line. The connection-loss message has the fixed schema:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-014] [7_UI_UX_DESIGN-REQ-024]** The bridge MUST NOT buffer responses
- **Type:** Functional
- **Description:** Each response line is flushed to stdout immediately after receipt. This ensures AI agents connected via the bridge receive real-time feedback during streaming operations (`stream_logs follow:true`). Stream chunks are forwarded line-by-line as they arrive from the MCP HTTP chunked response
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-015] [7_UI_UX_DESIGN-REQ-025]** The `Theme::from_env()` function applies the following logic, which is the so...
- **Type:** Functional
- **Description:** The `Theme::from_env()` function applies the following logic, which is the sole point of `NO_COLOR` detection in the entire codebase:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-016] [7_UI_UX_DESIGN-REQ-026]** `Theme::from_env()` is called exactly once per TUI process lifetime, during `...
- **Type:** Functional
- **Description:** The resulting `Theme` value is stored immutably in `AppState` and never re-read from the environment during the process lifetime. Live changes to `NO_COLOR` after startup have no effect
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-017] [7_UI_UX_DESIGN-REQ-027]** `Theme::from_env()` is the sole location in the entire codebase that reads `N...
- **Type:** Functional
- **Description:** No widget struct, tab, layout function, or render utility reads `NO_COLOR` directly. All theme-dependent rendering decisions accept a `&Theme` reference parameter. Violations of this rule are detected by the strings hygiene lint
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-018] [7_UI_UX_DESIGN-REQ-028]** In `ColorMode::Monochrome`, exactly two `ratatui::style::Modifier` values are...
- **Type:** Functional
- **Description:** All other modifiers — `ITALIC`, `UNDERLINED`, `BLINK`, `RAPID_BLINK`, `CROSSED_OUT`, `DIM` — are prohibited in both color modes. Colors are expressed via `ratatui::style::Color` variants, never via modifier combinations
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-019] [7_UI_UX_DESIGN-REQ-029]** The complete permitted character inventory for each structural context is:
- **Type:** Functional
- **Description:** The complete permitted character inventory for each structural context is:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-020] [7_UI_UX_DESIGN-REQ-030]** The `render_utils::strip_ansi(input: &str) -> String` function removes ANSI C...
- **Type:** Functional
- **Description:** The function implements the following deterministic 3-state machine:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-021] [7_UI_UX_DESIGN-REQ-031]** Carriage return characters (`\r`, U+000D) in log content are normalized durin...
- **Type:** Functional
- **Description:** Carriage return characters (`\r`, U+000D) in log content are normalized during `LogBuffer` insertion:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-022] [7_UI_UX_DESIGN-REQ-032]** `./do lint` includes a
- **Type:** Functional
- **Description:** strings hygiene check** executed after `cargo fmt --check` and `cargo clippy`. It scans all `.rs` source files in `crates/devs-tui/src/`, `crates/devs-cli/src/`, and `crates/devs-mcp-bridge/src/` for inline string literals containing machine-stable error prefixes outside of `strings.rs` files. Any match causes `./do lint` to exit non-zero and print the violating file path, line number, and matched text to stderr
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-023] [7_UI_UX_DESIGN-REQ-033]** A unit test in `crates/devs-tui/src/strings.rs` asserts that all `STATUS_*` s...
- **Type:** Functional
- **Description:** This redundancy ensures the constraint is captured in coverage metrics and explicitly tied to the requirement identifier:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-024] [7_UI_UX_DESIGN-REQ-034]** `cargo doc --no-deps` MUST complete with zero warnings across all workspace c...
- **Type:** Functional
- **Description:** The `missing_docs = "deny"` lint is enforced workspace-wide (see TAS §2.2 workspace lint table). All `pub` items in `strings.rs`, `theme.rs`, and `render_utils.rs` in every client crate MUST carry doc comments. This is verified by `./do lint` running `cargo doc --no-deps 2>&1 | grep -c "^warning"` and asserting the count is zero
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-025] [7_UI_UX_DESIGN-REQ-035]** The `./do lint` dependency audit (`cargo tree` comparison against the authori...
- **Type:** Functional
- **Description:** Any direct addition of `unicode-width`, `unicode-segmentation`, `unicode-normalization`, or similar crates requires an explicit entry in the TAS authoritative dependency table before the lint will pass
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-026] [7_UI_UX_DESIGN-REQ-036]** No widget module in `crates/devs-tui/src/widgets/` MUST import tab modules (e...
- **Type:** Functional
- **Description:** The intra-crate dependency graph is strictly: `tabs/ → widgets/ → render_utils.rs + strings.rs + theme.rs`. Circular imports between widgets and tabs are prevented by the Rust module system and verified by `cargo check`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-001] [7_UI_UX_DESIGN-REQ-001]** `cargo test -p devs-tui -- status_labels_are_exactly_four_bytes` exits 0, con...
- **Type:** Functional
- **Description:** Covers: `UI-DES-PHI-002`, `UI-DES-028`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-002] [7_UI_UX_DESIGN-REQ-002]** The strings hygiene check in `./do lint` exits non-zero when a `.rs` file out...
- **Type:** Functional
- **Description:** The violation path and line number are printed to stderr. Covers: `UI-DES-PHI-003`, `UI-DES-PHI-022`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-003] [7_UI_UX_DESIGN-REQ-003]** `grep -rn 'println!\|eprintln!' crates/devs-tui/src crates/devs-cli/src crate...
- **Type:** Functional
- **Description:** Covers: `UI-DES-001` (no debug noise), `SEC-084`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-004] [7_UI_UX_DESIGN-REQ-004]** With `NO_COLOR=1` in the environment, `Theme::from_env()` returns a `Theme` w...
- **Type:** Functional
- **Description:** Verified by unit test. Covers: `UI-DES-003`, `UI-DES-PHI-015`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-005] [7_UI_UX_DESIGN-REQ-005]** With `NO_COLOR=` (empty string explicitly set), `Theme::from_env()` returns `...
- **Type:** Functional
- **Description:** Covers: `UI-DES-PHI-015` edge case (empty value treated as absent)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-006] [7_UI_UX_DESIGN-REQ-006]** With `NO_COLOR=0` (string `"0"`), `Theme::from_env()` returns `ColorMode::Mon...
- **Type:** Functional
- **Description:** Any non-empty string, including `"0"` and `"false"`, activates Monochrome. Covers: `UI-DES-PHI-015` edge case
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-007] [7_UI_UX_DESIGN-REQ-007]** A `TestBackend` at size 79×24 renders a frame containing exactly the string `...
- **Type:** Functional
- **Description:** Covers: `UI-DES-008`, `UI-DES-PHI-008`, `UI-DES-036`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-008] [7_UI_UX_DESIGN-REQ-008]** A `TestBackend` at size 80×23 renders the same terminal-too-small message wit...
- **Type:** Functional
- **Description:** Covers: `UI-DES-008`, `UI-DES-PHI-008`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-009] [7_UI_UX_DESIGN-REQ-009]** After handling a `TuiEvent::Resize(80, 24)` event following a `TuiEvent::Resi...
- **Type:** Functional
- **Description:** Covers: `UI-DES-PHI-008`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-010] [7_UI_UX_DESIGN-REQ-010]** `cargo tree -p devs-tui --edges normal 2>&1 | grep -E '^\s*(devs-scheduler|de...
- **Type:** Functional
- **Description:** Covers: `UI-ARCH-002`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-011] [7_UI_UX_DESIGN-REQ-011]** `strip_ansi("\x1b[31mRED\x1b[0m")` returns `"RED"`
- **Type:** Functional
- **Description:** Covers: `UI-DES-PHI-020`, `UI-DES-PHI-007`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-012] [7_UI_UX_DESIGN-REQ-012]** `strip_ansi("no escapes here")` returns `"no escapes here"` using a `Cow::Bor...
- **Type:** Functional
- **Description:** Covers: `UI-DES-PHI-020` (allocation optimization)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-013] [7_UI_UX_DESIGN-REQ-013]** A log line with content `"progress\r\ndone\r"` is stored in `LogBuffer` as tw...
- **Type:** Functional
- **Description:** Covers: `UI-DES-PHI-021`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-014] [7_UI_UX_DESIGN-REQ-014]** In `--format json` CLI mode with the server unreachable, the process writes t...
- **Type:** Functional
- **Description:** Covers: `UI-DES-PHI-010`, `UI-DES-005`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-015] [7_UI_UX_DESIGN-REQ-015]** The `devs-mcp-bridge` binary writes the connection-loss message to stdout (no...
- **Type:** Functional
- **Description:** Covers: `UI-DES-PHI-013`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-016] [7_UI_UX_DESIGN-REQ-016]** `cargo doc --no-deps -p devs-tui 2>&1 | grep -c '^warning'` outputs `0`
- **Type:** Functional
- **Description:** Covers: `UI-DES-PHI-024`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-017] [7_UI_UX_DESIGN-REQ-017]** `format_elapsed(Some(0))` returns a string of exactly 5 characters
- **Type:** Functional
- **Description:** `format_elapsed(Some(599))` returns `"9:59 "` (5 chars). `format_elapsed(Some(600))` returns `"10:00"` (5 chars). `format_elapsed(None)` returns `"--:--"`. Covers: `UI-DES-031`, `UI-DES-032`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-018] [7_UI_UX_DESIGN-REQ-018]** `truncate_with_tilde("this-stage-name-is-too-long-for-box", 20)` returns a st...
- **Type:** Functional
- **Description:** `truncate_with_tilde("short", 20)` returns a string of exactly 20 characters (right-padded with spaces). Covers: `UI-DES-033`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-019] [7_UI_UX_DESIGN-REQ-019]** In `--format text` CLI mode, the bytes `0x1B` (ESC) do not appear anywhere in...
- **Type:** Functional
- **Description:** Covers: `UI-DES-PHI-011`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-PHI-020] [7_UI_UX_DESIGN-REQ-020]** `devs-mcp-bridge` does not call `flush()` in batches; each response is flushe...
- **Type:** Functional
- **Description:** Verified by an E2E test that sends two sequential MCP requests via the bridge and confirms the first response arrives before the second request is sent. Covers: `UI-DES-PHI-014`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-011] [7_UI_UX_DESIGN-REQ-037]** The theme is represented as a Rust struct `Theme` in `crates/devs-tui/src/the...
- **Type:** Functional
- **Description:** It has exactly two modes and exposes all styling decisions through semantic methods — no widget constructs `ratatui::style::Style` values directly
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-012] [7_UI_UX_DESIGN-REQ-038]** `Theme::from_env()` is the sole location that reads `NO_COLOR`
- **Type:** Functional
- **Description:** No widget, tab, or layout struct reads the environment directly. All theme-dependent rendering decisions accept a `&Theme` reference parameter and call semantic methods only
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-013] [7_UI_UX_DESIGN-REQ-039]** In `Monochrome` mode, the only permitted `ratatui::style::Modifier` values ar...
- **Type:** Functional
- **Description:** `ITALIC`, `UNDERLINED`, `BLINK`, `RAPID_BLINK`, `CROSSED_OUT`, and `DIM` are prohibited in all structural positions in both modes
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-001] [7_UI_UX_DESIGN-REQ-040]** Every widget that renders styled content MUST accept `&Theme` as a parameter ...
- **Type:** Functional
- **Description:** Widgets MUST NOT store a `Theme` value internally, clone it, or access `AppState` from within `render()`. The `&Theme` reference is passed down the widget tree at each render call. This is enforced by the architecture lint in `./do lint` (see §1.7)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-002] [7_UI_UX_DESIGN-REQ-041]** `ratatui::style::Color` values used in `theme.rs` are exclusively the named 1...
- **Type:** Functional
- **Description:** RGB values (`Color::Rgb(r, g, b)`) and indexed values (`Color::Indexed(n)`) are prohibited. This ensures correct rendering across terminal emulators that only support 8-color or 16-color ANSI palettes, including Windows Console and many CI environments
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-003] [7_UI_UX_DESIGN-REQ-042]** `Color::Reset` is the effective background color for all unselected rows and ...
- **Type:** Functional
- **Description:** No `.bg(Color::Reset)` call is required; omitting the `.bg()` call has the same effect and is the preferred style. This instructs the terminal to use its configured background color rather than overriding it, ensuring compatibility with transparent terminal backgrounds and custom terminal themes
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-014] [7_UI_UX_DESIGN-REQ-043]** Stage status colors use the terminal's named 16-color palette (not RGB hex), ...
- **Type:** Functional
- **Description:** The approximate sRGB hex values are provided as reference for documentation and testing only
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-015] [7_UI_UX_DESIGN-REQ-044]** In `ColorMode::Monochrome`, non-terminal status labels (`RUN `, `PAUS`, `ELIG...
- **Type:** Functional
- **Description:** Terminal-state labels (`DONE`, `FAIL`, `TIME`, `CANC`) receive `Modifier::BOLD` only. State is communicated primarily by the 4-character label text; `BOLD` provides secondary emphasis for completed or error states
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-004] [7_UI_UX_DESIGN-REQ-045]** The `Theme::stage_status_style()` implementation uses an exhaustive `match` o...
- **Type:** Functional
- **Description:** The Rust compiler enforces this: if a new variant is added to `devs-core::StageStatus` without updating `theme.rs`, the `devs-tui` crate fails to compile with a non-exhaustive pattern error
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-005] [7_UI_UX_DESIGN-REQ-046]** The status-specific `Style` is applied only to the 4-character `STAT` cell wi...
- **Type:** Functional
- **Description:** The bracket characters `[` `]`, field separators `|`, stage name field, and elapsed time field all use `Style::new()` (default). Only the `STAT` cell receives a status-derived `Style`. This constraint is enforced in the `DagView::render()` implementation
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-016] [7_UI_UX_DESIGN-REQ-047]** `RunStatus` in list views follows the same color logic as `StageStatus`
- **Type:** Functional
- **Description:** Terminal states (`completed`, `failed`, `cancelled`) receive `Modifier::BOLD` to match the stage status convention
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-006] [7_UI_UX_DESIGN-REQ-048]** `Theme::run_status_style()` is implemented with an exhaustive match identical...
- **Type:** Functional
- **Description:** `RunStatus` does not include `Waiting`, `Eligible`, or `TimedOut` variants; those map only through `stage_status_style()`. Adding a new `RunStatus` variant without updating `theme.rs` causes a compile error
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-007] [7_UI_UX_DESIGN-REQ-049]** Run status colors appear in the `RunList` widget's `status` column only
- **Type:** Functional
- **Description:** The `slug`, `workflow_name`, and timestamp columns always use `Style::new()` (default terminal style). This constraint prevents color saturation in the run list and ensures the status color is the sole semantic color signal per row, maintaining the principle that color is additive and never load-bearing
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-017] [7_UI_UX_DESIGN-REQ-050]** Selected rows in `RunList`, `StageList`, `PoolList`, and `AgentStatusGrid` us...
- **Type:** Functional
- **Description:** The `Theme::selected_row_style()` method returns:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-018] [7_UI_UX_DESIGN-REQ-051]** No widget uses an explicit background color in its unselected state
- **Type:** Functional
- **Description:** All unselected rows leave background unset (equivalent to `Color::Reset`). This ensures compatibility with transparent terminal emulators and custom terminal themes where overriding the background would cause visual artifacts
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-008] [7_UI_UX_DESIGN-REQ-052]** When a row is both selected AND has a status color (e.g., a running stage is ...
- **Type:** Functional
- **Description:** When a row is both selected AND has a status color (e.g., a running stage is selected in `StageList`), the `REVERSED` modifier is composed onto the existing style using `Style::patch()`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-009] [7_UI_UX_DESIGN-REQ-053]** Keyboard focus (which pane the user has navigated into) is NOT represented by...
- **Type:** Functional
- **Description:** The single selection state (highlighted row via `REVERSED`) is the only focus indicator. Pane borders use a fixed ASCII style with no active-border color change
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-010] [7_UI_UX_DESIGN-REQ-054]** The tab bar occupies exactly one row at the top of the terminal
- **Type:** Functional
- **Description:** It renders four tab labels with their digit shortcuts: `1 Dashboard  2 Logs  3 Debug  4 Pools`. Tab labels are separated by two spaces; no border character or pipe separator is used
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-011] [7_UI_UX_DESIGN-REQ-055]** The active tab style is identical in both color modes
- **Type:** Functional
- **Description:** Both `BOLD` and `REVERSED` are applied together, providing a strong visual anchor for the user's current context regardless of color availability
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-012] [7_UI_UX_DESIGN-REQ-056]** The tab bar contains no horizontal border, no separator row, and no bottom line
- **Type:** Functional
- **Description:** The active tab label is distinguished solely by `BOLD + REVERSED`. Switching to an inactive tab immediately updates `AppState::active_tab` and triggers a re-render within the next event loop iteration
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-019] [7_UI_UX_DESIGN-REQ-057]** In the `LogPane` and `LogTail` widgets, log line styling depends on the strea...
- **Type:** Functional
- **Description:** In the `LogPane` and `LogTail` widgets, log line styling depends on the stream origin:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-020] [7_UI_UX_DESIGN-REQ-058]** The `show_stream_prefix` flag controls whether `[OUT] ` or `[ERR] ` is prepen...
- **Type:** Functional
- **Description:** The prefix and the log content share the same `Style` — no separate style is applied to the prefix text. This ensures stream origin is always communicated by text in monochrome mode
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-013] [7_UI_UX_DESIGN-REQ-059]** When `LogBuffer::truncated == true`, the `LogPane` renders a one-line notice ...
- **Type:** Functional
- **Description:** When `LogBuffer::truncated == true`, the `LogPane` renders a one-line notice at the top of the log content area using `Style::new()` (no color, no modifier) in both color modes:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-021] [7_UI_UX_DESIGN-REQ-060]** The `StatusBar` widget uses the following style for the connection status label
- **Type:** Functional
- **Description:** Terminal states `Connected` and `Disconnected` receive `Modifier::BOLD` to mirror the terminal-state stage label convention
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-014] [7_UI_UX_DESIGN-REQ-061]** The `StatusBar` always occupies the bottom row of the terminal
- **Type:** Functional
- **Description:** The connection-status label receives the styled text; all remaining text (server address, active run count, retry countdown) uses `Style::new()`. Example rendered output:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-015] [7_UI_UX_DESIGN-REQ-062]** In `Reconnecting` state, the status bar additionally shows the attempt number...
- **Type:** Functional
- **Description:** In `Reconnecting` state, the status bar additionally shows the attempt number and time until next retry using digit characters and the ASCII letter `s` for seconds (no spinner character, no ANSI cursor movement):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-022] [7_UI_UX_DESIGN-REQ-063]** Error messages and validation failures in CLI text mode use no color codes
- **Type:** Functional
- **Description:** The CLI does not read `NO_COLOR` and never emits ANSI escape sequences in either `--format text` or `--format json` mode. Errors are distinguished solely by the machine-stable prefix vocabulary defined in §5
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-023] [7_UI_UX_DESIGN-REQ-064]** TUI `HelpOverlay` renders with a dedicated block style that differs between c...
- **Type:** Functional
- **Description:** The overlay is the only widget that uses an explicit non-Reset background color in `ColorMode::Color`; this exception is intentional to visually separate the modal overlay from underlying content
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-016] [7_UI_UX_DESIGN-REQ-065]** The key-binding table inside the help overlay uses `Modifier::BOLD` for key n...
- **Type:** Functional
- **Description:** No additional foreground colors are introduced inside the overlay. In `ColorMode::Color`, key names and descriptions both render against the `DarkGray` background; the terminal renders default foreground (typically light gray or white) on dark gray, which is visually legible across common terminal color schemes
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-017] [7_UI_UX_DESIGN-REQ-066]** `Theme` MUST NOT expose any method that returns a raw `ratatui::style::Color`...
- **Type:** Functional
- **Description:** All color decisions are encapsulated within the named semantic methods above. Widgets call a semantic method (e.g., `theme.stage_status_style(status)`) and apply the returned `Style` directly via `.patch()` or direct application. Extracting the color field from a returned `Style` for conditional logic in widget code is prohibited
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-018] [7_UI_UX_DESIGN-REQ-067]** The TUI does not query the terminal's color capability (`TERM`, `COLORTERM`, ...
- **Type:** Functional
- **Description:** Color mode is determined solely by `NO_COLOR`. This prevents discrepancies between terminal capability detection and user intent, and keeps `Theme::from_env()` deterministic and testable without mocking environment variables beyond `NO_COLOR`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-019] [7_UI_UX_DESIGN-REQ-068]** Style composition MUST use `Style::patch()` when merging a base style with an...
- **Type:** Functional
- **Description:** `patch()` applies only the non-`None` fields of the argument style, preserving the base style's existing foreground and background. The `|` operator on `ratatui::style::Style` has identical semantics in ratatui 0.28, but `patch()` is more explicit about intent and MUST be used for clarity
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-020] [7_UI_UX_DESIGN-REQ-069]** Every display state MUST be distinguishable in `ColorMode::Monochrome` by tex...
- **Type:** Functional
- **Description:** The following table is the normative verification that this invariant holds:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-THEME-021] [7_UI_UX_DESIGN-REQ-070]** The `devs-tui` crate MUST NOT have direct production dependencies on any engi...
- **Type:** Functional
- **Description:** The `Theme` struct depends on `devs-core` types only, plus `ratatui`. This is verified by `cargo tree -p devs-tui --edges normal` in `./do lint`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-001] [7_UI_UX_DESIGN-REQ-021]** `theme.stage_status_style(StageStatus::Completed)` in `ColorMode::Color` retu...
- **Type:** Functional
- **Description:** Covers: `UI-DES-014`, `UI-DES-THEME-004`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-002] [7_UI_UX_DESIGN-REQ-022]** `theme.stage_status_style(StageStatus::Running)` in `ColorMode::Color` return...
- **Type:** Functional
- **Description:** Covers: `UI-DES-014`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-003] [7_UI_UX_DESIGN-REQ-023]** `theme.stage_status_style(StageStatus::Completed)` in `ColorMode::Monochrome`...
- **Type:** Functional
- **Description:** Covers: `UI-DES-015`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-004] [7_UI_UX_DESIGN-REQ-024]** `theme.stage_status_style(StageStatus::Running)` in `ColorMode::Monochrome` r...
- **Type:** Functional
- **Description:** Covers: `UI-DES-015`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-005] [7_UI_UX_DESIGN-REQ-025]** `theme.stage_status_style(StageStatus::TimedOut)` in `ColorMode::Color` retur...
- **Type:** Functional
- **Description:** Covers: `UI-DES-014`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-006] [7_UI_UX_DESIGN-REQ-026]** `theme.run_status_style(RunStatus::Failed)` in `ColorMode::Color` returns `fg...
- **Type:** Functional
- **Description:** Covers: `UI-DES-016`, `UI-DES-THEME-006`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-007] [7_UI_UX_DESIGN-REQ-027]** `theme.run_status_style(RunStatus::Running)` in `ColorMode::Color` returns `f...
- **Type:** Functional
- **Description:** Covers: `UI-DES-016`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-008] [7_UI_UX_DESIGN-REQ-028]** `theme.selected_row_style()` returns a `Style` containing `Modifier::REVERSED...
- **Type:** Functional
- **Description:** Covers: `UI-DES-017`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-009] [7_UI_UX_DESIGN-REQ-029]** `theme.selected_row_style()` returns a `Style` with `fg == None` and `bg == N...
- **Type:** Functional
- **Description:** Covers: `UI-DES-017`, `UI-DES-018`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-010] [7_UI_UX_DESIGN-REQ-030]** `theme.log_line_style(LogStream::Stderr)` in `ColorMode::Color` returns `fg =...
- **Type:** Functional
- **Description:** Covers: `UI-DES-019`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-011] [7_UI_UX_DESIGN-REQ-031]** `theme.log_line_style(LogStream::Stderr)` in `ColorMode::Monochrome` returns ...
- **Type:** Functional
- **Description:** Covers: `UI-DES-019`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-012] [7_UI_UX_DESIGN-REQ-032]** `theme.log_line_style(LogStream::Stdout)` returns `Style::new()` in both colo...
- **Type:** Functional
- **Description:** Covers: `UI-DES-019`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-013] [7_UI_UX_DESIGN-REQ-033]** `theme.connection_status_style(&ConnectionStatus::Connected {
- **Type:** Functional
- **Description:** })` in `ColorMode::Color` returns `fg == Some(Color::Green)` and `Modifier::BOLD`. Covers: `UI-DES-021`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-014] [7_UI_UX_DESIGN-REQ-034]** `theme.connection_status_style(&ConnectionStatus::Reconnecting {
- **Type:** Functional
- **Description:** })` in `ColorMode::Color` returns `fg == Some(Color::Yellow)` with no `Modifier::BOLD`. Covers: `UI-DES-021`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-015] [7_UI_UX_DESIGN-REQ-035]** `theme.connection_status_style(&ConnectionStatus::Disconnected)` in `ColorMod...
- **Type:** Functional
- **Description:** Covers: `UI-DES-021`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-016] [7_UI_UX_DESIGN-REQ-036]** `theme.active_tab_style()` returns a `Style` containing both `Modifier::BOLD`...
- **Type:** Functional
- **Description:** Covers: `UI-DES-THEME-010`, `UI-DES-THEME-011`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-017] [7_UI_UX_DESIGN-REQ-037]** `theme.inactive_tab_style()` returns `Style::new()` (no modifiers, no colors)...
- **Type:** Functional
- **Description:** Covers: `UI-DES-THEME-010`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-018] [7_UI_UX_DESIGN-REQ-038]** `theme.help_overlay_style()` in `ColorMode::Color` returns a `Style` with `bg...
- **Type:** Functional
- **Description:** Covers: `UI-DES-023`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-019] [7_UI_UX_DESIGN-REQ-039]** `theme.help_overlay_style()` in `ColorMode::Monochrome` returns a `Style` wit...
- **Type:** Functional
- **Description:** Covers: `UI-DES-023`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-020] [7_UI_UX_DESIGN-REQ-040]** `theme.default_text_style()` returns `Style::new()` in both color modes
- **Type:** Functional
- **Description:** Covers: `UI-DES-THEME-017`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-021] [7_UI_UX_DESIGN-REQ-041]** Adding a new variant to `StageStatus` in `devs-core` without updating `theme....
- **Type:** Functional
- **Description:** Verified by the compile-time guarantee; documented in the coverage report as a structural invariant. Covers: `UI-DES-THEME-004`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-022] [7_UI_UX_DESIGN-REQ-042]** `grep -rn 'Color::Rgb\|Color::Indexed' crates/devs-tui/src/theme.rs` returns ...
- **Type:** Functional
- **Description:** No RGB or indexed colors appear in `theme.rs`. Covers: `UI-DES-THEME-002`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-023] [7_UI_UX_DESIGN-REQ-043]** `grep -rn 'NO_COLOR' crates/devs-tui/src/ | grep -v 'theme\.rs' | grep -v '#\...
- **Type:** Functional
- **Description:** Only `theme.rs` reads `NO_COLOR`. Covers: `UI-DES-012`, `UI-DES-PHI-017`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-024] [7_UI_UX_DESIGN-REQ-044]** A `TestBackend` at 200×50 in `ColorMode::Monochrome` rendering a `DagView` wi...
- **Type:** Functional
- **Description:** The snapshot `.txt` file contains `DONE` with no ANSI escape bytes. Covers: `UI-DES-015`, `UI-DES-003`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-025] [7_UI_UX_DESIGN-REQ-045]** A `TestBackend` at 200×50 in `ColorMode::Color` rendering a `DagView` with on...
- **Type:** Functional
- **Description:** Covers: `UI-DES-014`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-026] [7_UI_UX_DESIGN-REQ-046]** A `TestBackend` rendering the `StatusBar` with `ConnectionStatus::Disconnecte...
- **Type:** Functional
- **Description:** The snapshot `.txt` file contains the string `DISCONNECTED`. Covers: `UI-DES-021`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-027] [7_UI_UX_DESIGN-REQ-047]** A `TestBackend` rendering the `LogPane` with `show_stream_prefix=true` and on...
- **Type:** Functional
- **Description:** Covers: `UI-DES-019`, `UI-DES-020`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-DES-COLOR-028] [7_UI_UX_DESIGN-REQ-048]** `cargo tree -p devs-tui --edges normal 2>&1 | grep -E '^\s*(devs-scheduler|de...
- **Type:** Functional
- **Description:** Covers: `UI-DES-THEME-021`, `UI-ARCH-002`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-024] [7_UI_UX_DESIGN-REQ-071]** All rendered text uses the terminal's configured monospace font
- **Type:** Functional
- **Description:** `devs` does not specify, embed, or load any font file. Font family, weight, size, and antialiasing are operator-controlled through their terminal emulator preferences
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-025] [7_UI_UX_DESIGN-REQ-072]** The design system assumes a
- **Type:** Functional
- **Description:** fixed-width, single-column character cell** for all printable ASCII (U+0020–U+007E). No multibyte or double-width characters appear in structural positions. This guarantees predictable column alignment on all platforms
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-FONT-001] [7_UI_UX_DESIGN-REQ-073]** Non-ASCII characters in log line content MUST NOT cause a panic or rendering ...
- **Type:** Functional
- **Description:** Misalignment of double-width characters in log output is accepted behavior
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-FONT-002] [a-z0-9_-] [a-z0-9-] [7_UI_UX_DESIGN-REQ-074]** ` (slugs)
- **Type:** Functional
- **Description:** The TUI receives only validated identifiers and MAY assume they are pure ASCII
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-FONT-003] [7_UI_UX_DESIGN-REQ-075]** User-supplied run names are clamped to 128 bytes at the server
- **Type:** Functional
- **Description:** The TUI MUST NOT assume they are ASCII; run names appearing in display positions are subject to the same UTF-8-with-replacement pipeline as log content
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-026] [7_UI_UX_DESIGN-REQ-076]** Four levels of text emphasis are defined, implemented exclusively through `ra...
- **Type:** Functional
- **Description:** The four style constants are defined in `crates/devs-tui/src/theme.rs` and imported by all widget modules
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STYLE-001] [7_UI_UX_DESIGN-REQ-077]** `Theme::style_subdued()` in `Monochrome` mode MUST return a style with no fg ...
- **Type:** Functional
- **Description:** The distinction between subdued and standard content is carried by layout position, not color, when `NO_COLOR` is set
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STYLE-002] [7_UI_UX_DESIGN-REQ-078]** Log stderr lines use `Style::new().fg(Color::Yellow)` in Color mode and `STYL...
- **Type:** Functional
- **Description:** Log stdout lines use `STYLE_STANDARD` in both modes
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STYLE-003] [7_UI_UX_DESIGN-REQ-079]** The selected row in `RunList` and `StageList` uses `STYLE_INTERACTIVE` (`REVE...
- **Type:** Functional
- **Description:** In Monochrome mode, `REVERSED` is the ONLY visual distinction between a selected and unselected row
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-027] [7_UI_UX_DESIGN-REQ-080]** `ITALIC`, `UNDERLINED`, `BLINK`, and `RAPID_BLINK` modifiers are
- **Type:** Functional
- **Description:** prohibited** at all style levels. The lint test `no_forbidden_modifiers` in `crates/devs-tui/tests/` asserts that no widget module source file contains the text `Modifier::ITALIC`, `Modifier::UNDERLINED`, `Modifier::BLINK`, or `Modifier::RAPID_BLINK`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STYLE-004] [7_UI_UX_DESIGN-REQ-081]** The `NO_COLOR` environment variable is read exactly once at startup, inside `...
- **Type:** Functional
- **Description:** The result is stored in `Theme.color_mode`. No widget reads `NO_COLOR` directly
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STYLE-005] [7_UI_UX_DESIGN-REQ-082]** `NO_COLOR` set to any value, including an empty string, activates `Monochrome...
- **Type:** Functional
- **Description:** Only presence is checked; the value is not inspected
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-028] [7_UI_UX_DESIGN-REQ-083]** Stage status labels are exactly 4 uppercase ASCII characters
- **Type:** Functional
- **Description:** This is a compile-time invariant enforced by constant assertions. The complete label enumeration:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-029] [7_UI_UX_DESIGN-REQ-084]** Compile-time assertions in `render_utils.rs` enforce that every label is exac...
- **Type:** Functional
- **Description:** Each label is asserted individually so the compiler reports the exact failing value:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-LABEL-001] [7_UI_UX_DESIGN-REQ-085]** Adding a new `StageStatus` variant without updating `stage_status_label` MUST...
- **Type:** Functional
- **Description:** No runtime fallback label (e.g., `"????"`) is defined or permitted
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-030] [7_UI_UX_DESIGN-REQ-086]** Run status labels for `RunList` and `devs list` CLI output are displayed as
- **Type:** Functional
- **Description:** lowercase strings** matching the serialization format. They are NOT padded to a fixed width; column alignment is handled by the column formatter (§3.8)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-LABEL-002] [7_UI_UX_DESIGN-REQ-087]** A fan-out stage is displayed as a single stage box. The fan-out count `N` is ...
- **Type:** Functional
- **Description:** before** `truncate_with_tilde` is applied, so the combined string is subject to the 20-character display limit:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-LABEL-003] [7_UI_UX_DESIGN-REQ-088]** Fan-out sub-runs are NOT displayed as individual stage boxes in `DagView`
- **Type:** Functional
- **Description:** The parent stage box aggregates sub-run statuses using the following priority order (highest priority wins):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-031] [7_UI_UX_DESIGN-REQ-089]** Elapsed time strings in stage boxes and the `StageList` are always exactly
- **Type:** Functional
- **Description:** 5 characters wide**. Two cases exist:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-ELAPSED-001] [7_UI_UX_DESIGN-REQ-090]** 3.4 Elapsed Time Typography
- **Type:** Functional
- **Description:** 3.4 Elapsed Time Typography
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-ELAPSED-001] [7_UI_UX_DESIGN-REQ-091]** For elapsed values producing `m >= 100` (runtime durations exceeding approxim...
- **Type:** Functional
- **Description:** The stage box width MAY overflow its declared 41-column boundary. This is accepted behavior for pathologically long-running stages; no truncation or modulo wrapping is applied
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-ELAPSED-002] [7_UI_UX_DESIGN-REQ-092]** `elapsed_ms` is computed in `App::handle_event()` on each `Tick` event (1-sec...
- **Type:** Functional
- **Description:** It is NOT recomputed inside `render()`. For running stages, `elapsed_ms = (Instant::now() - stage_started_wall_clock).as_millis() as u64`. For terminal-state stages, `elapsed_ms = completed_at_ms - started_at_ms` (fixed at completion time)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-ELAPSED-003] [7_UI_UX_DESIGN-REQ-093]** For terminal-state stages (`Completed`, `Failed`, `TimedOut`, `Cancelled`), `...
- **Type:** Functional
- **Description:** For terminal-state stages (`Completed`, `Failed`, `TimedOut`, `Cancelled`), `elapsed_ms` is fixed at `completed_at - started_at` and does NOT change on subsequent `Tick` events
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-032] [7_UI_UX_DESIGN-REQ-094]** `format_elapsed` is exposed in `render_utils.rs` with the signature `pub fn f...
- **Type:** Functional
- **Description:** It is the single authoritative implementation; no widget computes elapsed formatting inline
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-033] [7_UI_UX_DESIGN-REQ-095]** Stage names longer than 20 characters are truncated to 19 characters with a `...
- **Type:** Functional
- **Description:** Names of 20 characters or fewer are right-padded with spaces to reach exactly 20 characters
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-TRUNC-001] [7_UI_UX_DESIGN-REQ-096]** `truncate_with_tilde` operates on Unicode scalar values (Rust `char`), not bytes
- **Type:** Functional
- **Description:** A multi-byte UTF-8 character counts as 1 display unit. Double-width terminal rendering of CJK characters is not corrected; each `char` is treated as 1 column. Terminal misalignment for such characters in stage names is accepted behavior
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-TRUNC-002] [7_UI_UX_DESIGN-REQ-097]** `truncate_with_tilde` is called with `max_len = 20` for all stage name displa...
- **Type:** Functional
- **Description:** It MUST be the single authoritative truncation function; no widget computes truncation inline
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-TRUNC-003] [7_UI_UX_DESIGN-REQ-098]** If the combined stage name + fan-out suffix exceeds 20 characters, the `~` re...
- **Type:** Functional
- **Description:** The suffix MAY be partially or completely invisible in the stage box; this is acceptable as the fan-out count is also visible in the `StageList` detail panel
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-034] [7_UI_UX_DESIGN-REQ-099]** CLI tabular text output truncates values to fit declared column widths using ...
- **Type:** Functional
- **Description:** This is distinct from the TUI tilde truncation. The ellipsis replaces the last 3 characters of the allowed prefix:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-ANSI-001] [7_UI_UX_DESIGN-REQ-100]** ANSI stripping is performed at the `LogBuffer` ingestion point, before storage
- **Type:** Functional
- **Description:** `LogLine.content` stores the stripped string. `LogLine.raw_content` stores the original unmodified string. All widget `render()` implementations MUST use `content`, never `raw_content`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-ANSI-002] [7_UI_UX_DESIGN-REQ-101]** `strip_ansi` processes bytes, not chars
- **Type:** Functional
- **Description:** Multi-byte UTF-8 sequences with lead/continuation bytes in the range 0x80–0xFF pass through unchanged in `Normal` state because those byte values do not match any ANSI control byte pattern
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-ANSI-003] [UI-ARCH-PATH-004] [7_UI_UX_DESIGN-REQ-102]** in the Architecture spec)
- **Type:** Functional
- **Description:** in the Architecture spec)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-ANSI-004] [7_UI_UX_DESIGN-REQ-103]** The algorithm handles only CSI sequences (`ESC [`)
- **Type:** Functional
- **Description:** Other ANSI sequence types (OSC `ESC ]`, DCS `ESC P`, APC `ESC _`) are consumed as `ESC + one byte` — the single byte after `ESC` is discarded and the machine returns to `Normal`. Incomplete stripping of OSC/DCS sequences in agent output is accepted behavior at MVP
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-ANSI-005] [7_UI_UX_DESIGN-REQ-104]** `strip_ansi` MUST be a pure function: no side effects, no I/O, no global state
- **Type:** Functional
- **Description:** It MUST NOT panic on any input including empty strings, pure control sequences, or truncated sequences ending mid-CSI
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-001] [7_UI_UX_DESIGN-REQ-105]** All user-visible strings that appear in a context an operator reads during no...
- **Type:** Functional
- **Description:** Inline `"..."` literals in widget `render()` methods for single structural characters (e.g., `"["`, `"|"`, `"-"`) are exempt
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-002] [7_UI_UX_DESIGN-REQ-106]** A lint test (`strings_no_inline_errors`) in each crate's `tests/` directory s...
- **Type:** Functional
- **Description:** Any match causes the test to fail
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-003] [7_UI_UX_DESIGN-REQ-107]** All `STATUS_*` constants for stage status labels MUST pass compile-time lengt...
- **Type:** Functional
- **Description:** All `STATUS_*` constants for stage status labels MUST pass compile-time length assertions:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-CLI-001] [7_UI_UX_DESIGN-REQ-108]** In `--format json` mode, ALL output — both success and error — is written to
- **Type:** Functional
- **Description:** stdout** as JSON. Nothing is written to stderr. The error JSON format is:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-CLI-002] [7_UI_UX_DESIGN-REQ-109]** In `--format text` mode, success output is written to stdout
- **Type:** Functional
- **Description:** Error messages are written to stderr. Error messages use the same machine-stable prefixes but are plain-text strings
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-CLI-003] [7_UI_UX_DESIGN-REQ-110]** Columns are separated by exactly
- **Type:** Functional
- **Description:** 2 spaces**. The header row uses `STYLE_PRIMARY` (bold) in text mode. In JSON mode, no tabular formatting is applied; the full structured response is serialized as a JSON object or array
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-CLI-004] [7_UI_UX_DESIGN-REQ-111]** The timestamp format for CLI text-mode output is `YYYY-MM-DD HH:MM:SS UTC` (2...
- **Type:** Functional
- **Description:** For JSON mode, timestamps use RFC 3339 with millisecond precision: `"2026-03-11T10:00:00.000Z"`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-CLI-005] [7_UI_UX_DESIGN-REQ-112]** `devs logs` in text mode writes raw log line content directly to stdout, one ...
- **Type:** Functional
- **Description:** With `--format json`, each log line is wrapped as:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-001] [7_UI_UX_DESIGN-REQ-049]** `stage_status_label(StageStatus::Running)` returns exactly `"RUN "` (4 bytes,...
- **Type:** Functional
- **Description:** Verified by unit test in `crates/devs-tui/tests/`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-002] [7_UI_UX_DESIGN-REQ-050]** All 9 `stage_status_label()` return values are exactly 4 bytes
- **Type:** Functional
- **Description:** Verified by the compile-time `const` assertion block in `render_utils.rs`; the assertion block MUST compile
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-003] [7_UI_UX_DESIGN-REQ-051]** `format_elapsed(None)` returns `"--:--"` with `len() == 5`
- **Type:** Functional
- **Description:** `format_elapsed(None)` returns `"--:--"` with `len() == 5`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-004] [7_UI_UX_DESIGN-REQ-052]** `format_elapsed(Some(0))` returns a string of length 5 whose first 4 bytes ar...
- **Type:** Functional
- **Description:** `format_elapsed(Some(0))` returns a string of length 5 whose first 4 bytes are `"0:00"`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-005] [7_UI_UX_DESIGN-REQ-053]** `format_elapsed(Some(600_000))` returns `"10:00"` with `len() == 5`
- **Type:** Functional
- **Description:** `format_elapsed(Some(600_000))` returns `"10:00"` with `len() == 5`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-006] [7_UI_UX_DESIGN-REQ-054]** `format_elapsed(Some(599_000))` returns a string of length 5 whose first 4 by...
- **Type:** Functional
- **Description:** `format_elapsed(Some(599_000))` returns a string of length 5 whose first 4 bytes are `"9:59"`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-007] [7_UI_UX_DESIGN-REQ-055]** `truncate_with_tilde("", 20)` returns a string of length 20 consisting entire...
- **Type:** Functional
- **Description:** `truncate_with_tilde("", 20)` returns a string of length 20 consisting entirely of spaces
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-008] [7_UI_UX_DESIGN-REQ-056]** `truncate_with_tilde("exactly-twenty-chars", 20)` returns the input string un...
- **Type:** Functional
- **Description:** `truncate_with_tilde("exactly-twenty-chars", 20)` returns the input string unchanged
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-009] [7_UI_UX_DESIGN-REQ-057]** `truncate_with_tilde("this-is-a-very-long-stage-name", 20)` returns a 20-char...
- **Type:** Functional
- **Description:** `truncate_with_tilde("this-is-a-very-long-stage-name", 20)` returns a 20-character string ending with `~`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-010] [7_UI_UX_DESIGN-REQ-058]** `strip_ansi("\x1b[31mred\x1b[0m")` returns `"red"`
- **Type:** Functional
- **Description:** `strip_ansi("\x1b[31mred\x1b[0m")` returns `"red"`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-011] [7_UI_UX_DESIGN-REQ-059]** `strip_ansi("")` returns `""` without panicking
- **Type:** Functional
- **Description:** `strip_ansi("")` returns `""` without panicking
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-012] [7_UI_UX_DESIGN-REQ-060]** `strip_ansi("no-escapes")` returns `"no-escapes"` unchanged
- **Type:** Functional
- **Description:** `strip_ansi("no-escapes")` returns `"no-escapes"` unchanged
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-013] [7_UI_UX_DESIGN-REQ-061]** `strip_ansi("text\x1b[")` (truncated CSI sequence) returns `"text"` without p...
- **Type:** Functional
- **Description:** `strip_ansi("text\x1b[")` (truncated CSI sequence) returns `"text"` without panicking
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-014] [7_UI_UX_DESIGN-REQ-062]** `strip_ansi("\x1b[1;31;42mcolored\x1b[0m")` returns `"colored"`
- **Type:** Functional
- **Description:** `strip_ansi("\x1b[1;31;42mcolored\x1b[0m")` returns `"colored"`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-015] [7_UI_UX_DESIGN-REQ-063]** `Theme::from_env()` returns `ColorMode::Monochrome` when `NO_COLOR` is set to...
- **Type:** Functional
- **Description:** Test sets the env var and calls `Theme::from_env()`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-016] [7_UI_UX_DESIGN-REQ-064]** `Theme::from_env()` returns `ColorMode::Color` when `NO_COLOR` is not set in ...
- **Type:** Functional
- **Description:** `Theme::from_env()` returns `ColorMode::Color` when `NO_COLOR` is not set in the environment
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-017] [7_UI_UX_DESIGN-REQ-065]** `theme.style_for_stage_status(StageStatus::Completed)` returns a `Style` with...
- **Type:** Functional
- **Description:** `theme.style_for_stage_status(StageStatus::Completed)` returns a `Style` with `fg = Color::Green` in Color mode
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-018] [7_UI_UX_DESIGN-REQ-066]** `theme.style_for_stage_status(StageStatus::Completed)` returns `STYLE_STANDAR...
- **Type:** Functional
- **Description:** `theme.style_for_stage_status(StageStatus::Completed)` returns `STYLE_STANDARD` (no fg color) in Monochrome mode
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-019] [7_UI_UX_DESIGN-REQ-067]** `run_status_label(RunStatus::Completed)` returns `"completed"` (lowercase, no...
- **Type:** Functional
- **Description:** `run_status_label(RunStatus::Completed)` returns `"completed"` (lowercase, no padding)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-020] [7_UI_UX_DESIGN-REQ-068]** `strings.rs` in `devs-tui` exports `STATUS_RUN_` with value `"RUN "` and the ...
- **Type:** Functional
- **Description:** `strings.rs` in `devs-tui` exports `STATUS_RUN_` with value `"RUN "` and the compile-time length assertion for it passes
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-021] [7_UI_UX_DESIGN-REQ-069]** Lint test `strings_no_inline_errors` exits non-zero when a widget module sour...
- **Type:** Functional
- **Description:** Lint test `strings_no_inline_errors` exits non-zero when a widget module source file contains an inline string literal beginning with `"not_found:"`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-022] [7_UI_UX_DESIGN-REQ-070]** TUI insta snapshot `dashboard__run_running` contains a stage box matching `[ ...
- **Type:** Functional
- **Description:** TUI insta snapshot `dashboard__run_running` contains a stage box matching `[ <name-20> | RUN  | <M:SS > ]` with correct column widths as verified by string comparison in the snapshot
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-023] [7_UI_UX_DESIGN-REQ-071]** TUI renders with no ANSI color escape sequences when `NO_COLOR` is set; verif...
- **Type:** Functional
- **Description:** TUI renders with no ANSI color escape sequences when `NO_COLOR` is set; verified by `insta` snapshot `dashboard__run_running` (Monochrome mode) containing no `\x1b[` sequences
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-024] [7_UI_UX_DESIGN-REQ-072]** `devs list --format text` output column headers are separated by exactly 2 sp...
- **Type:** Functional
- **Description:** Verified by CLI E2E test parsing stdout
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-025] [7_UI_UX_DESIGN-REQ-073]** `devs list --format json` outputs valid JSON to stdout and nothing to stderr;...
- **Type:** Functional
- **Description:** `devs list --format json` outputs valid JSON to stdout and nothing to stderr; verified by CLI E2E test asserting `stderr.is_empty()` and `serde_json::from_str(stdout).is_ok()`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-026] [7_UI_UX_DESIGN-REQ-074]** A fan-out stage with `fan_out_count = 4` renders with `(x4)` visible in the s...
- **Type:** Functional
- **Description:** Verified by TUI unit test with controlled `StageRunDisplay`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-027] [7_UI_UX_DESIGN-REQ-075]** `ITALIC`, `UNDERLINED`, `BLINK`, `RAPID_BLINK` modifier tokens do not appear ...
- **Type:** Functional
- **Description:** Verified by lint test scanning file contents
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TYP-028] [7_UI_UX_DESIGN-REQ-076]** `truncate_with_tilde(s, 20)` returns a string whose `chars().count() == 20` f...
- **Type:** Functional
- **Description:** Verified by parameterized unit tests
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-035] [7_UI_UX_DESIGN-REQ-113]** The base grid unit is
- **Type:** Functional
- **Description:** 1 terminal cell** (1 column × 1 row). All measurements in this section are in cells. There is no sub-cell spacing. Margins and padding are expressed as integer column/row counts
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-036] [7_UI_UX_DESIGN-REQ-114]** At terminal size below
- **Type:** Functional
- **Description:** 80 columns × 24 rows**, the TUI renders only the following centered message and nothing else (all tabs, status bars, and widgets suppressed):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-037] [7_UI_UX_DESIGN-REQ-115]** The Dashboard tab uses a
- **Type:** Functional
- **Description:** two-pane horizontal split**:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-038] [7_UI_UX_DESIGN-REQ-116]** `RunDetail` uses a
- **Type:** Functional
- **Description:** two-pane vertical split**:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-039] [7_UI_UX_DESIGN-REQ-117]** The `TabBar` occupies exactly
- **Type:** Functional
- **Description:** 1 row** at the top. The `StatusBar` occupies exactly **1 row** at the bottom. These are subtracted from available rows before the pane split calculation
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-040] [7_UI_UX_DESIGN-REQ-118]** A stage box in the DAG view is exactly
- **Type:** Functional
- **Description:** 41 columns wide**, decomposed as:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-040a] [7_UI_UX_DESIGN-REQ-119]** Correction — exact box content is `[ <name-20> | <STAT> | <M:SS> ]`:
- **Type:** Functional
- **Description:** Correction — exact box content is `[ <name-20> | <STAT> | <M:SS> ]`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-040b] [7_UI_UX_DESIGN-REQ-120]** The canonical box width is
- **Type:** Functional
- **Description:** 39 columns**. All horizontal scroll and layout calculations use this value
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-041] [7_UI_UX_DESIGN-REQ-121]** Fan-out stages append `(xN)` before truncation, where N is the sub-agent count
- **Type:** Functional
- **Description:** The combined name + suffix must still fit within 20 columns. If `stage-name(x8)` exceeds 20 chars, the name portion is truncated first:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-042] [7_UI_UX_DESIGN-REQ-122]** Between DAG tiers, a
- **Type:** Functional
- **Description:** 5-column gutter** is used. The gutter contains an ASCII arrow at the vertical midpoint of the connecting box:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-043] [7_UI_UX_DESIGN-REQ-123]** Horizontal DAG scroll is activated when the total rendered width exceeds the ...
- **Type:** Functional
- **Description:** 1 column per keypress** (`←`/`→`)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-044] [7_UI_UX_DESIGN-REQ-124]** `LogTail` (Dashboard): last N visible lines where N = available rows in the s...
- **Type:** Functional
- **Description:** No scroll offset display. Scroll offset is automatically set to `max(0, buffer.len() - visible_rows)` to always show the tail
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-045] [7_UI_UX_DESIGN-REQ-125]** `LogPane` (Logs tab): full-height pane with scroll controlled by `AppState::l...
- **Type:** Functional
- **Description:** Each line occupies exactly 1 row. Lines exceeding pane width are clipped (not wrapped) to prevent layout corruption
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-046] [7_UI_UX_DESIGN-REQ-126]** `LogBuffer` capacity:
- **Type:** Functional
- **Description:** 10,000 lines**. When full, lines are evicted FIFO (oldest first). The `truncated: bool` flag is set to `true` after first eviction. Display of truncated buffers prefixes a 1-row notice:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-047] [7_UI_UX_DESIGN-REQ-127]** `PoolsTab` uses a
- **Type:** Functional
- **Description:** two-column layout**:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-048] [7_UI_UX_DESIGN-REQ-128]** `AgentStatusGrid` renders one row per agent with the following fixed columns:
- **Type:** Functional
- **Description:** `AgentStatusGrid` renders one row per agent with the following fixed columns:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-049] [7_UI_UX_DESIGN-REQ-129]** `StatusBar` occupies the last row of the terminal
- **Type:** Functional
- **Description:** It is composed of three fixed regions, left-to-right:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-050] [7_UI_UX_DESIGN-REQ-130]** The `StatusBar` is rendered every frame regardless of tab
- **Type:** Functional
- **Description:** Its content is derived from `AppState::connection_status`, `AppState::server_addr`, and `AppState::runs`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-051] [7_UI_UX_DESIGN-REQ-131]** CLI text-mode tabular output uses fixed column widths regardless of terminal ...
- **Type:** Functional
- **Description:** 2 spaces**. The standard column table for `devs list`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-052] [7_UI_UX_DESIGN-REQ-132]** `devs status <run>` text output uses a
- **Type:** Functional
- **Description:** label: value** format with 2-space indentation for nested stage details:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-052a] [7_UI_UX_DESIGN-REQ-133]** The stage name column in `devs status` text mode is
- **Type:** Functional
- **Description:** 20 characters wide**, left-aligned, space-padded. Status is **4 characters**, space-padded. Elapsed is **5 characters** (`M:SS` format or `--:--`). These match TUI stage box field widths exactly
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-052b] [7_UI_UX_DESIGN-REQ-134]** `devs list` text-mode truncation rules: `SLUG` field truncated to 32 chars wi...
- **Type:** Functional
- **Description:** `devs list` text-mode truncation rules: `SLUG` field truncated to 32 chars with `~` suffix if longer; `WORKFLOW` field truncated to 20 chars with `~`; `RUN-ID` is always the first 8 hex characters of the UUID (no dashes)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-052c] [7_UI_UX_DESIGN-REQ-135]** `devs logs` text mode writes one log line per stdout line
- **Type:** Functional
- **Description:** Each line is prefixed with stream tag when `--stage` is omitted and multiple stages are present: `[stdout]` or `[stderr]` followed by a single space, then the log content. When a single stage is specified, no prefix is added
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-053a] [7_UI_UX_DESIGN-REQ-136]** The Logs tab is a
- **Type:** Functional
- **Description:** two-column horizontal split** occupying the full area between the `TabBar` and `StatusBar`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-053b] [7_UI_UX_DESIGN-REQ-137]** `StageSelector` renders a flat list of selectable entries organized as groups...
- **Type:** Functional
- **Description:** 25 columns** of content within the column
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-053c] [7_UI_UX_DESIGN-REQ-138]** `LogPane` in the Logs tab shows the `show_stream_prefix = true` variant
- **Type:** Functional
- **Description:** Each log line is rendered as: `[stdout] ` or `[stderr] ` prefix (9 characters, with trailing space), followed by the log content clipped to `pane_width - 9` columns. The prefix renders in `STYLE_LOG_STDERR` (Yellow fg in Color mode) for stderr lines and default style for stdout lines
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-053d] [7_UI_UX_DESIGN-REQ-139]** When no stage is selected in `StageSelector`, `LogPane` renders a centered pl...
- **Type:** Functional
- **Description:** When no stage is selected in `StageSelector`, `LogPane` renders a centered placeholder:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-053e] [7_UI_UX_DESIGN-REQ-140]** `StageSelector` scroll: the selected entry is always kept visible
- **Type:** Functional
- **Description:** If the selected entry is above the visible area, the view scrolls up; if below, the view scrolls down. Scroll is line-by-line (not page). The selector tracks `log_stage_scroll_offset: usize` in `AppState`, separate from `log_scroll_offset`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-053f] [7_UI_UX_DESIGN-REQ-141]** Run header rows in `StageSelector` are
- **Type:** Functional
- **Description:** not selectable**. Pressing `↓` while on a run header skips to the first stage entry of that run. Pressing `↑` while on the first stage of a run moves to the last stage of the previous run (skipping its header)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-054a] [7_UI_UX_DESIGN-REQ-142]** The Debug tab uses a
- **Type:** Functional
- **Description:** three-region vertical stack** occupying the full area between `TabBar` and `StatusBar`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-054b] [7_UI_UX_DESIGN-REQ-143]** `AgentSelector` (1-row fixed header) displays the currently selected run slug...
- **Type:** Functional
- **Description:** `AgentSelector` (1-row fixed header) displays the currently selected run slug and stage name in the format:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-054c] [7_UI_UX_DESIGN-REQ-144]** `DiffView` renders the unified diff of the agent's working directory against ...
- **Type:** Functional
- **Description:** Each diff line is rendered with the following prefix-to-style mapping:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-054d] [7_UI_UX_DESIGN-REQ-145]** `ControlPanel` occupies the remaining rows below `DiffView` (minimum 3 rows)
- **Type:** Functional
- **Description:** It renders a fixed 3-row action area regardless of how many rows are available (additional rows below are blank):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-054e] [7_UI_UX_DESIGN-REQ-146]** When no run is selected (Debug tab opened with no active run), the entire con...
- **Type:** Functional
- **Description:** When no run is selected (Debug tab opened with no active run), the entire content area (excluding `TabBar` and `StatusBar`) renders the centered placeholder:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-055a] [7_UI_UX_DESIGN-REQ-147]** The `HelpOverlay` is a
- **Type:** Functional
- **Description:** centered modal dialog** that floats above all tab content. Its dimensions are computed as:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-055b] [7_UI_UX_DESIGN-REQ-148]** The overlay is positioned at:
- **Type:** Functional
- **Description:** The overlay is positioned at:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-055c] [7_UI_UX_DESIGN-REQ-149]** The overlay has a
- **Type:** Functional
- **Description:** 1-column, 1-row border** on all sides using ASCII characters `+`, `-`, `|`. Interior content area is therefore `(overlay_width - 2) × (overlay_height - 2)`. Interior is divided into two columns for keybinding display:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-055d] [7_UI_UX_DESIGN-REQ-150]** The overlay title `[ Keyboard Shortcuts ]` is centered on the top border row,...
- **Type:** Functional
- **Description:** Title string is always exactly 21 characters including brackets and spaces
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-055e] [7_UI_UX_DESIGN-REQ-151]** When the terminal is too small to fit the minimum overlay (below 80×24, which...
- **Type:** Functional
- **Description:** When the terminal is too small to fit the minimum overlay (below 80×24, which is already the minimum terminal size), the overlay is not rendered and the too-small message is displayed instead
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-055f] [7_UI_UX_DESIGN-REQ-152]** The background behind the overlay is
- **Type:** Functional
- **Description:** not cleared** — the existing tab content is visible behind it (the overlay is opaque only within its own border box). The border and interior background uses `STYLE_BACKGROUND` to mask the content behind
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056a] [7_UI_UX_DESIGN-REQ-153]** Layout dimensions are recomputed
- **Type:** Functional
- **Description:** synchronously** in `App::handle_event()` on every `TuiEvent::Resize` event and on initial startup. No layout values are cached between renders; each `App::render()` call receives the pre-computed `LayoutState` from the most recent computation
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056b] [7_UI_UX_DESIGN-REQ-154]** The canonical layout computation function signature is:
- **Type:** Functional
- **Description:** The canonical layout computation function signature is:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056c] [7_UI_UX_DESIGN-REQ-155]** Per-tab layout is computed from `LayoutState::content_area` using the rules i...
- **Type:** Functional
- **Description:** Each tab's layout function is pure and deterministic given the same `content_area` dimensions
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056d] [7_UI_UX_DESIGN-REQ-156]** Computation order within the Dashboard tab:
- **Type:** Functional
- **Description:** Computation order within the Dashboard tab:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056e] [7_UI_UX_DESIGN-REQ-157]** Computation order within the Logs tab:
- **Type:** Functional
- **Description:** Computation order within the Logs tab:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056f] [7_UI_UX_DESIGN-REQ-158]** Computation order within the Debug tab:
- **Type:** Functional
- **Description:** Computation order within the Debug tab:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056g] [7_UI_UX_DESIGN-REQ-159]** Computation order within the Pools tab:
- **Type:** Functional
- **Description:** Computation order within the Pools tab:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056h] [7_UI_UX_DESIGN-REQ-160]** All layout computation MUST use
- **Type:** Functional
- **Description:** `u16` arithmetic with checked addition/subtraction**. If a subtraction would underflow (result < 0), the result is clamped to 0. This prevents panics on degenerate terminal sizes that pass the 80×24 check but have unusual proportions after splitting
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-057a] [7_UI_UX_DESIGN-REQ-161]** On receipt of `TuiEvent::Resize(new_width, new_height)`, the following sequen...
- **Type:** Functional
- **Description:** On receipt of `TuiEvent::Resize(new_width, new_height)`, the following sequence occurs:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-057b] [7_UI_UX_DESIGN-REQ-162]** `AppState::terminal_size` is initialized on startup by querying `crossterm::t...
- **Type:** Functional
- **Description:** If the query fails, size defaults to `(80, 24)` and a `WARN` is emitted via `tracing`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-057c] [7_UI_UX_DESIGN-REQ-163]** Rapid resize events (multiple `Resize` events arriving in the same event loop...
- **Type:** Functional
- **Description:** Each updates `AppState::terminal_size` and triggers layout recomputation. Only the final render (after the last event in the batch) is drawn to the terminal. This is guaranteed by the event loop structure: crossterm events are drained in a loop before render
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-057d] [7_UI_UX_DESIGN-REQ-164]** Transition from `TooSmall` back to `Normal` on a resize that crosses the 80×2...
- **Type:** Functional
- **Description:** Selected run, stage, and pool selections are preserved across the transition
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-057e] [7_UI_UX_DESIGN-REQ-165]** `AppState::dag_scroll_offset` is NOT reset on resize
- **Type:** Functional
- **Description:** If the new terminal width makes the DAG fit without scrolling, the scroll offset is clamped to 0 by the render function (not cleared from state). This allows the scroll offset to be preserved if the user resizes back to a smaller terminal
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058a] [7_UI_UX_DESIGN-REQ-166]** Scroll bounds are defined per-pane as closed intervals `[min, max]`
- **Type:** Functional
- **Description:** All scroll offsets in `AppState` are `usize`. Attempting to scroll past a bound is silently clamped (no error, no visual feedback beyond reaching the limit)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058b] [7_UI_UX_DESIGN-REQ-167]** Per-pane scroll bounds:
- **Type:** Functional
- **Description:** Per-pane scroll bounds:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058c] [7_UI_UX_DESIGN-REQ-168]** `total_dag_width` is computed as: `(number_of_tiers × stage_box_width) + ((nu...
- **Type:** Functional
- **Description:** For a single-tier workflow: `39` columns total, no gutter. Minimum `total_dag_width` is 39
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058d] [7_UI_UX_DESIGN-REQ-169]** Navigation key bindings for scroll:
- **Type:** Functional
- **Description:** Navigation key bindings for scroll:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058e] [7_UI_UX_DESIGN-REQ-170]** Page scroll amount is `max(1, visible_rows - 1)` rows
- **Type:** Functional
- **Description:** This ensures at least 1 row of overlap between pages (visual continuity). At minimum visible height of 1 row, page scroll = 0 (no movement, clamped from `max(1, 0)`). Wait—actually `max(1, 1-1) = max(1,0) = 1`, so minimum page scroll is always 1
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058f] [7_UI_UX_DESIGN-REQ-171]** Auto-scroll behavior for `LogTail`: after every `TuiEvent::LogLine` event, if...
- **Type:** Functional
- **Description:** If the user has scrolled up (offset < max before the new line), no auto-advance occurs (the view is "locked" to their manual position). This is tracked by `AppState::log_tail_auto_scroll: bool` (default `true`), toggled to `false` on any manual `↑`/`PgUp`/`Home` in `LogPane`, and back to `true` on `End`/`G`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058g] [7_UI_UX_DESIGN-REQ-172]** `RunList` selection and scroll are coupled: navigating with `↑`/`↓` in `RunLi...
- **Type:** Functional
- **Description:** The selected item is always within the visible rows
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-059a] [7_UI_UX_DESIGN-REQ-173]** All layout types are defined in `crates/devs-tui/src/layout.rs`
- **Type:** Functional
- **Description:** They are derived `Clone`, `Copy`, `Debug`, `PartialEq`, and `Eq`. No serialization derives (layout is always computed, never persisted)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-059b] [7_UI_UX_DESIGN-REQ-174]** `AppState` stores the current `LayoutMode` as a field updated on every `TuiEv...
- **Type:** Functional
- **Description:** `AppState` stores the current `LayoutMode` as a field updated on every `TuiEvent::Resize` and on startup:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-059c] [7_UI_UX_DESIGN-REQ-175]** Per-tab layout computation functions are free functions (not methods) in `lay...
- **Type:** Functional
- **Description:** Per-tab layout computation functions are free functions (not methods) in `layout.rs`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-059d] [7_UI_UX_DESIGN-REQ-176]** `PaneDimensions` MUST NOT be constructed with `width = 0` or `height = 0` in ...
- **Type:** Functional
- **Description:** If a layout computation results in a zero-dimension pane (degenerate terminal), the pane is clamped to `width = 1` or `height = 1`. A `tracing::warn!` is emitted with fields `pane_name`, `computed_width`, `computed_height` when clamping occurs
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060a] [7_UI_UX_DESIGN-REQ-177]** Stage name truncation for the 20-character name field uses the following algo...
- **Type:** Functional
- **Description:** Stage name truncation for the 20-character name field uses the following algorithm:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060b] [7_UI_UX_DESIGN-REQ-178]** The above function MUST produce a string whose `chars().count()` is exactly `...
- **Type:** Functional
- **Description:** This invariant is verified by a parameterized unit test covering inputs of length 0, 1, `max_len - 1`, `max_len`, and `max_len + 1`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060c] [7_UI_UX_DESIGN-REQ-179]** Fan-out stage name construction before truncation:
- **Type:** Functional
- **Description:** Fan-out stage name construction before truncation:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060d] [7_UI_UX_DESIGN-REQ-180]** CLI text-mode columns are fixed-width regardless of actual content length. Co...
- **Type:** Functional
- **Description:** truncated without a tilde** (unlike TUI stage names). The field is simply cut at the column boundary. No ellipsis or indicator is added in the table body
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060e] [7_UI_UX_DESIGN-REQ-181]** `RUN-ID` column (8 chars) is always the first 8 hex characters of the UUID st...
- **Type:** Functional
- **Description:** For UUID `"550e8400-e29b-41d4-a716-446655440000"`, display = `"550e8400"`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060f] [7_UI_UX_DESIGN-REQ-182]** If `server_addr` string exceeds 30 characters, it is truncated to 29 characte...
- **Type:** Functional
- **Description:** If the terminal width is less than `15 + 30 + 10 = 55` columns (impossible given 80-column minimum), the active run count region is omitted entirely
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060g] [7_UI_UX_DESIGN-REQ-183]** Connection status strings are always exactly 15 characters
- **Type:** Functional
- **Description:** Canonical values (with trailing spaces):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060h] [7_UI_UX_DESIGN-REQ-184]** `AgentStatusGrid` capabilities column (30 chars): capabilities are comma-join...
- **Type:** Functional
- **Description:** `Rate limited` column (20 chars): `until HH:MM:SS` format is always exactly 14 chars, which fits within 20. When not rate-limited, the field renders as `              ` (14 spaces within 20-char column)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060i] [7_UI_UX_DESIGN-REQ-185]** If `agent_status_width < 68` (the sum of all AgentStatusGrid columns), column...
- **Type:** Functional
- **Description:** If `agent_status_width < 68` (the sum of all AgentStatusGrid columns), column widths are proportionally reduced: the capabilities column shrinks first (minimum 10), then rate-limited column (minimum 10), then fallback (minimum 3), then tool (minimum 5)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-061a] [7_UI_UX_DESIGN-REQ-186]** The `Querying` state exists only during application startup before the first ...
- **Type:** Functional
- **Description:** It has no visual representation (the terminal is not yet in raw mode)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-061b] [7_UI_UX_DESIGN-REQ-187]** Transitions between `TooSmall` and `Normal` preserve all `AppState` data
- **Type:** Functional
- **Description:** No state is cleared on these transitions except scroll offset clamping. Specifically: run selections, log buffers, pool state, and DAG scroll offset are all preserved
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-061c] [7_UI_UX_DESIGN-REQ-188]** The `Disconnected` terminal state (exit code 1) can be reached from either `N...
- **Type:** Functional
- **Description:** The "Disconnected" here refers to the server reconnect budget being exhausted, not terminal sizing. This is shown for completeness; the full reconnect state machine is defined in §5
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-062a] [7_UI_UX_DESIGN-REQ-189]** The layout computation functions in `layout.rs` MUST NOT import any crate exc...
- **Type:** Functional
- **Description:** They MUST NOT reference `AppState`, gRPC types, or `devs-proto`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-062b] [7_UI_UX_DESIGN-REQ-190]** Widget structs MUST accept `ratatui::layout::Rect` (obtained via `PaneDimensi...
- **Type:** Functional
- **Description:** This ensures layout is the single authority on all pane positions
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-001] [7_UI_UX_DESIGN-REQ-077]** `compute_layout(79, 24)` returns `LayoutMode::TooSmall { actual_width: 79, ac...
- **Type:** Functional
- **Description:** `compute_layout(79, 24)` returns `LayoutMode::TooSmall { actual_width: 79, actual_height: 24 }`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-002] [7_UI_UX_DESIGN-REQ-078]** `compute_layout(80, 23)` returns `LayoutMode::TooSmall { actual_width: 80, ac...
- **Type:** Functional
- **Description:** `compute_layout(80, 23)` returns `LayoutMode::TooSmall { actual_width: 80, actual_height: 23 }`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-003] [7_UI_UX_DESIGN-REQ-079]** `compute_layout(80, 24)` returns `LayoutMode::Normal` with `tab_bar.height ==...
- **Type:** Functional
- **Description:** `compute_layout(80, 24)` returns `LayoutMode::Normal` with `tab_bar.height == 1`, `status_bar.height == 1`, `content_area.height == 22`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-004] [7_UI_UX_DESIGN-REQ-080]** `dashboard_layout(content)` where `content.width == 80, content.height == 22`...
- **Type:** Functional
- **Description:** `dashboard_layout(content)` where `content.width == 80, content.height == 22` produces `run_list.width == 24`, `dag_view.height == 8`, `log_tail.height == 14`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-005] [7_UI_UX_DESIGN-REQ-081]** `dashboard_layout(content)` where `content.width == 100, content.height == 30...
- **Type:** Functional
- **Description:** `dashboard_layout(content)` where `content.width == 100, content.height == 30` produces `run_list.width == 30` (`max(30, 24)`), `dag_view.height == 12` (`max(30 * 40/100, 8) = max(12,8) = 12`), `log_tail.height == 18`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-006] [7_UI_UX_DESIGN-REQ-082]** `logs_layout(content)` where `content.width == 80` produces `stage_selector.w...
- **Type:** Functional
- **Description:** `logs_layout(content)` where `content.width == 80` produces `stage_selector.width == 16` (`max(80*20/100, 16) = max(16, 16) = 16`), `log_pane.width == 64`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-007] [7_UI_UX_DESIGN-REQ-083]** `debug_layout(content)` where `content.height == 22` produces `agent_selector...
- **Type:** Functional
- **Description:** `debug_layout(content)` where `content.height == 22` produces `agent_selector.height == 1`, `diff_view.height == max(22-1)*60/100, 8) = max(12, 8) = 12`, `control_panel.height == 9`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-008] [7_UI_UX_DESIGN-REQ-084]** `pools_layout(content)` where `content.width == 80` produces `pool_list.width...
- **Type:** Functional
- **Description:** `pools_layout(content)` where `content.width == 80` produces `pool_list.width == 20` (`max(80*25/100, 20) = max(20,20) = 20`), `agent_status.width == 60`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-009] [7_UI_UX_DESIGN-REQ-085]** `help_overlay_layout((80, 24))` produces `outer.width == 72`, `outer.height =...
- **Type:** Functional
- **Description:** `help_overlay_layout((80, 24))` produces `outer.width == 72`, `outer.height == 20`, `outer.x == 4`, `outer.y == 2`, `inner.width == 70`, `inner.height == 18`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-010] [7_UI_UX_DESIGN-REQ-086]** `PaneDimensions::to_rect()` returns a `ratatui::layout::Rect` with matching `...
- **Type:** Functional
- **Description:** `PaneDimensions::to_rect()` returns a `ratatui::layout::Rect` with matching `x`, `y`, `width`, `height` fields
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-011] [7_UI_UX_DESIGN-REQ-087]** `compute_layout(200, 50)` (TestBackend default) returns `LayoutMode::Normal` ...
- **Type:** Functional
- **Description:** `compute_layout(200, 50)` (TestBackend default) returns `LayoutMode::Normal` with `content_area.width == 200`, `content_area.height == 48`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-012] [7_UI_UX_DESIGN-REQ-088]** `dashboard_layout` total `run_list.width + dag_view_column.width == content.w...
- **Type:** Functional
- **Description:** Verified with `content.width` values 80, 100, 120, 160, 200
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-013] [7_UI_UX_DESIGN-REQ-089]** `logs_layout` total `stage_selector.width + log_pane.width == content.width`
- **Type:** Functional
- **Description:** Verified with same widths as AC-SGL-012
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-014] [7_UI_UX_DESIGN-REQ-090]** `debug_layout` total `agent_selector.height + diff_view.height + control_pane...
- **Type:** Functional
- **Description:** Verified with `content.height` values 22, 30, 48
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-015] [7_UI_UX_DESIGN-REQ-091]** `truncate_with_tilde("plan", 20)` returns `"plan                "` (16 traili...
- **Type:** Functional
- **Description:** `truncate_with_tilde("plan", 20)` returns `"plan                "` (16 trailing spaces; total 20 chars)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-016] [7_UI_UX_DESIGN-REQ-092]** `truncate_with_tilde("very-long-stage-name-here", 20)` returns `"very-long-st...
- **Type:** Functional
- **Description:** `truncate_with_tilde("very-long-stage-name-here", 20)` returns `"very-long-stage-nam~"` (19 chars + `~` = 20 chars total)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-017] [7_UI_UX_DESIGN-REQ-093]** `truncate_with_tilde("", 20)` returns `"                    "` (20 spaces)
- **Type:** Functional
- **Description:** `truncate_with_tilde("", 20)` returns `"                    "` (20 spaces)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-018] [7_UI_UX_DESIGN-REQ-094]** `truncate_with_tilde(s, 20).chars().count() == 20` for all inputs `s` of leng...
- **Type:** Functional
- **Description:** Verified by parameterized test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-019] [7_UI_UX_DESIGN-REQ-095]** A rendered stage box string `"[ plan                 | DONE | 0:42  ]"` has l...
- **Type:** Functional
- **Description:** A rendered stage box string `"[ plan                 | DONE | 0:42  ]"` has length exactly 39 characters
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-020] [7_UI_UX_DESIGN-REQ-096]** Fan-out suffix `"(x64)"` (5 chars) appended to `"15-char-stage-name"` (18 cha...
- **Type:** Functional
- **Description:** Fan-out suffix `"(x64)"` (5 chars) appended to `"15-char-stage-name"` (18 chars) gives combined 23 chars; `truncate_with_tilde(combined, 20)` returns `"15-char-stage-name(~"` (19 chars + `~`)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-021] [7_UI_UX_DESIGN-REQ-097]** `clamp_scroll_offset(offset=5, buffer_len=3, visible_rows=10)` returns `0` (m...
- **Type:** Functional
- **Description:** `clamp_scroll_offset(offset=5, buffer_len=3, visible_rows=10)` returns `0` (max scroll = `max(0, 3-10) = 0`)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-022] [7_UI_UX_DESIGN-REQ-098]** `clamp_scroll_offset(offset=5, buffer_len=15, visible_rows=10)` returns `5` (...
- **Type:** Functional
- **Description:** `clamp_scroll_offset(offset=5, buffer_len=15, visible_rows=10)` returns `5` (max scroll = 5; offset 5 is at max)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-023] [7_UI_UX_DESIGN-REQ-099]** `clamp_scroll_offset(offset=10, buffer_len=15, visible_rows=10)` returns `5` ...
- **Type:** Functional
- **Description:** `clamp_scroll_offset(offset=10, buffer_len=15, visible_rows=10)` returns `5` (clamped to max)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-024] [7_UI_UX_DESIGN-REQ-100]** After `TuiEvent::Resize(80, 24)` with current `log_scroll_offset == 100` and ...
- **Type:** Functional
- **Description:** After `TuiEvent::Resize(80, 24)` with current `log_scroll_offset == 100` and `buffer.len() == 50`, `log_scroll_offset` is clamped to `max(0, 50 - visible_rows)`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-025] [7_UI_UX_DESIGN-REQ-101]** Snapshot `dashboard__minimum_terminal` at 80×24 shows `RunList` of 24 columns...
- **Type:** Functional
- **Description:** Verified via `insta` text snapshot comparison
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-026] [7_UI_UX_DESIGN-REQ-102]** Snapshot `logs__stage_selector_width` at 80×24 shows `StageSelector` of 16 co...
- **Type:** Functional
- **Description:** Verified via `insta` text snapshot comparison
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-027] [7_UI_UX_DESIGN-REQ-103]** Snapshot `dashboard__terminal_too_small` at 79×24 shows only the size warning...
- **Type:** Functional
- **Description:** Snapshot `dashboard__terminal_too_small` at 79×24 shows only the size warning message with no tab bar or other widgets
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-028] [7_UI_UX_DESIGN-REQ-104]** Snapshot `help_overlay__dimensions` at 80×24 shows overlay with `+` corners a...
- **Type:** Functional
- **Description:** Snapshot `help_overlay__dimensions` at 80×24 shows overlay with `+` corners at column 4 and column 75 (outer.x=4, outer.x+outer.width-1=75)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-029] [7_UI_UX_DESIGN-REQ-105]** `devs list --format text` output: `RUN-ID` column header at position 0, `SLUG...
- **Type:** Functional
- **Description:** Verified by byte-offset assertion on stdout
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-030] [7_UI_UX_DESIGN-REQ-106]** `devs status <run> --format text` output: stage lines are indented by exactly...
- **Type:** Functional
- **Description:** Verified by regex match on stdout
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-SGL-031] [7_UI_UX_DESIGN-REQ-107]** `devs logs <run> <stage> --format text` output: no stream prefix when single ...
- **Type:** Functional
- **Description:** Verified by asserting no `[stdout]` or `[stderr]` prefix in any output line
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-053] [7_UI_UX_DESIGN-REQ-191]** The TUI uses an
- **Type:** Functional
- **Description:** event-driven render model**. A frame is only rendered in response to one of:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-054] [7_UI_UX_DESIGN-REQ-192]** The TUI does
- **Type:** Functional
- **Description:** not** use a fixed frame-rate render loop. There is no continuous animation. The render budget per frame is **< 16 milliseconds**. The `render()` method on `App` must contain no I/O, no syscalls, and no allocation proportional to buffer size
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-055] [7_UI_UX_DESIGN-REQ-193]** Re-render latency after a `RunEvent` arrival: within
- **Type:** Functional
- **Description:** 50 milliseconds**. This is enforced by the event channel architecture; the render loop wakes immediately on event receipt
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-053a] [7_UI_UX_DESIGN-REQ-194]** `EventLoopConfig::default()` is the only production configuration
- **Type:** Functional
- **Description:** Test code MAY construct custom configs to speed up Tick intervals, but MUST NOT use non-default values in production binaries
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-053b] [7_UI_UX_DESIGN-REQ-195]** Every call to `render()` is preceded by an `AppState` mutation
- **Type:** Functional
- **Description:** `render()` is NEVER called with a stale state. `AppState` mutation and `render()` are always sequential on the single event-loop thread; no concurrent render is possible
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-053c] [7_UI_UX_DESIGN-REQ-196]** `render()` receives `&self` (immutable reference to `AppState`)
- **Type:** Functional
- **Description:** `render()` MUST NOT mutate `AppState`. Any value computed during render (e.g., DAG tier layout) that depends on `AppState` MUST be pre-computed in `handle_event()` and stored in `AppState` before render is called
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-001] [7_UI_UX_DESIGN-REQ-197]** The render loop MUST execute on a single thread
- **Type:** Functional
- **Description:** `tokio::task::spawn_blocking` MUST NOT be called from within `render()`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-002] [7_UI_UX_DESIGN-REQ-198]** If a channel's buffer is full when the sender tries to push an event, the old...
- **Type:** Functional
- **Description:** The render loop is never blocked by a full channel
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-003] [7_UI_UX_DESIGN-REQ-199]** Consecutive events of type `TuiEvent::Tick` that arrive without any other int...
- **Type:** Functional
- **Description:** There is no coalescing of Tick events
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-004] [7_UI_UX_DESIGN-REQ-200]** `render()` duration is measured via `std::time::Instant` before and after eac...
- **Type:** Functional
- **Description:** If the elapsed duration exceeds 16 ms, a `WARN` event is emitted via `tracing` with field `render_duration_ms`. This MUST NOT cause the application to exit or pause
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RLOOP-001] [7_UI_UX_DESIGN-REQ-108]** `render()` takes `&self`; calling `render(&mut state)` does not compile
- **Type:** Functional
- **Description:** Verified by `cargo build`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RLOOP-002] [7_UI_UX_DESIGN-REQ-109]** A test that injects 300 consecutive `TuiEvent::Tick` events into the crosster...
- **Type:** Functional
- **Description:** A test that injects 300 consecutive `TuiEvent::Tick` events into the crossterm channel observes that at most 256 are processed; the remainder are dropped; no panic occurs
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RLOOP-003] [7_UI_UX_DESIGN-REQ-110]** A test measuring render duration on a `AppState` with 256 stages and 10,000 l...
- **Type:** Functional
- **Description:** A test measuring render duration on a `AppState` with 256 stages and 10,000 log lines asserts that `render()` completes within 16 ms on the CI host
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RLOOP-004] [7_UI_UX_DESIGN-REQ-111]** `EventLoopConfig::default()` returns the exact values specified in §5.1.1
- **Type:** Functional
- **Description:** Verified by unit test asserting each field
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RLOOP-005] [7_UI_UX_DESIGN-REQ-112]** On `TuiEvent::ReconnectBudgetExceeded`, the TUI exits with code 1 and restore...
- **Type:** Functional
- **Description:** Verified by E2E test using `assert_cmd`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056] [7_UI_UX_DESIGN-REQ-201]** `devs-tui` is keyboard-only
- **Type:** Functional
- **Description:** There is no mouse interaction model and no hover state. "Focus" is represented by the `REVERSED` modifier on the selected row in `RunList`, `StageList`, `PoolList`, and the active tab in `TabBar`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-057] [7_UI_UX_DESIGN-REQ-202]** The active tab in `TabBar` is rendered with `STYLE_PRIMARY` (bold)
- **Type:** Functional
- **Description:** Inactive tabs are rendered with `STYLE_STANDARD`. There is no underline, no background color change, and no border change for tabs
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056a] [7_UI_UX_DESIGN-REQ-203]** `KeyDispatchContext` is computed at the top of `dispatch_key()` via:
- **Type:** Functional
- **Description:** `KeyDispatchContext` is computed at the top of `dispatch_key()` via:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056b] [7_UI_UX_DESIGN-REQ-204]** Tab switch clears `selected_stage_name` to `None`
- **Type:** Functional
- **Description:** It does NOT clear `selected_run_id`. A run selected on Dashboard remains selected when returning to Dashboard from another tab. This allows the operator to switch to Logs, read them, and return to Dashboard with the same run still selected
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-056c] [7_UI_UX_DESIGN-REQ-205]** When `selected_run_id` refers to a run that is no longer present in the new `...
- **Type:** Functional
- **Description:** When `selected_run_id` refers to a run that is no longer present in the new `runs` snapshot (e.g., it was swept from history), `selected_run_id` is set to `None` immediately during `apply_run_snapshot()`, before `render()` is called
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-FOCUS-001] [7_UI_UX_DESIGN-REQ-113]** After `Enter` on a selected run, the next rendered frame shows `StageList` wi...
- **Type:** Functional
- **Description:** Verified by `insta` snapshot test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-FOCUS-002] [7_UI_UX_DESIGN-REQ-114]** After `Esc` from `StageList`, `selected_run_id` is unchanged and `selected_st...
- **Type:** Functional
- **Description:** Verified by unit test on `AppState`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-FOCUS-003] [7_UI_UX_DESIGN-REQ-115]** Pressing `Tab` while `ConfirmationPrompt` is active does not change `active_tab`
- **Type:** Functional
- **Description:** Verified by unit test calling `dispatch_key(state, Tab)` with `state.confirmation = Some(...)`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-FOCUS-004] [7_UI_UX_DESIGN-REQ-116]** When `apply_run_snapshot()` receives a snapshot that does not contain the cur...
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-FOCUS-005] [7_UI_UX_DESIGN-REQ-117]** `current_context()` is a pure function; given the same `AppState`, it always ...
- **Type:** Functional
- **Description:** Verified by property-based test (rstest)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058] [7_UI_UX_DESIGN-REQ-206]** All key bindings are single-key, no chords at MVP
- **Type:** Functional
- **Description:** The full keybinding table:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-059] [7_UI_UX_DESIGN-REQ-207]** `HelpOverlay` is modal: while visible, all keys except `?`, `Esc`, `q`, and `...
- **Type:** Functional
- **Description:** `HelpOverlay` is modal: while visible, all keys except `?`, `Esc`, `q`, and `Ctrl+C` are consumed without effect
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058a] [7_UI_UX_DESIGN-REQ-208]** `Ctrl+C` is handled before any context check
- **Type:** Functional
- **Description:** It MUST quit the application from any state, including `ConfirmationPrompt` and `HelpOverlay`. The gRPC call in progress (if any) is abandoned; the application exits immediately after terminal restoration
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058b] [7_UI_UX_DESIGN-REQ-209]** The `c` key for cancel is only actionable when `selected_run_id` is `Some(......
- **Type:** Functional
- **Description:** If `selected_run_id` is `None`, or the run is already in a terminal state (`Completed`, `Failed`, `Cancelled`), pressing `c` is silently consumed without opening the confirmation prompt
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058c] [7_UI_UX_DESIGN-REQ-210]** The `p` key for pause is only actionable when the selected run's `status` is ...
- **Type:** Functional
- **Description:** The `r` key for resume is only actionable when `status` is `Paused`. Pressing `p` on a `Paused` run or `r` on a `Running` run is silently consumed
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-058d] [7_UI_UX_DESIGN-REQ-211]** Navigation in lists and log panes NEVER wraps around
- **Type:** Functional
- **Description:** Pressing `↑` at the top is a no-op. Pressing `↓` at the bottom is a no-op. No visual indicator of boundary is shown (no bell, no flash)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-KEY-001] [7_UI_UX_DESIGN-REQ-118]** `Ctrl+C` from `ConfirmationPrompt` state quits the application with exit code...
- **Type:** Functional
- **Description:** Verified by E2E test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-KEY-002] [7_UI_UX_DESIGN-REQ-119]** Pressing `c` with `selected_run_id = None` does not set `state.confirmation`
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-KEY-003] [7_UI_UX_DESIGN-REQ-120]** Pressing `c` on a `Completed` run does not set `state.confirmation`
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-KEY-004] [7_UI_UX_DESIGN-REQ-121]** Navigation `↓` past the last item in `RunList` does not cause a panic and doe...
- **Type:** Functional
- **Description:** Verified by unit test with a 1-element run list
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-KEY-005] [7_UI_UX_DESIGN-REQ-122]** `dispatch_key()` with an unrecognized key character emits no `tracing` output...
- **Type:** Functional
- **Description:** Verified by unit test asserting `AppState` equality before and after
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-KEY-006] [7_UI_UX_DESIGN-REQ-123]** All keys listed in the keybinding table produce the documented effect when te...
- **Type:** Functional
- **Description:** Verified by one snapshot test per key context combination
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060] [7_UI_UX_DESIGN-REQ-212]** Pressing `c` on a selected run in Dashboard mode triggers a
- **Type:** Functional
- **Description:** single-line inline confirmation prompt** rendered in the status bar row, replacing the normal status bar content:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-061] [7_UI_UX_DESIGN-REQ-213]** The confirmation prompt accepts only:
- **Type:** Functional
- **Description:** The confirmation prompt accepts only:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-062] [7_UI_UX_DESIGN-REQ-214]** No multi-step modal dialog
- **Type:** Functional
- **Description:** The confirmation prompt is single-key, ephemeral, and never blocks re-render of other panes
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[a-z0-9-] [7_UI_UX_DESIGN-REQ-001]** +
- **Type:** Functional
- **Description:** +
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060a] [7_UI_UX_DESIGN-REQ-215]** The `ConfirmationStatus::Submitting` state exists to handle the window betwee...
- **Type:** Functional
- **Description:** During `Submitting`, the status bar continues to display the confirmation prompt text. No second `c` press can open a new prompt while `status == Submitting`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060b] [7_UI_UX_DESIGN-REQ-216]** The full text of the confirmation prompt is constructed at the moment `c` is ...
- **Type:** Functional
- **Description:** If the run's slug changes between prompt-open and prompt-dismiss (not possible in MVP since slugs are immutable), the originally-captured slug is displayed
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060c] [7_UI_UX_DESIGN-REQ-217]** The transition from `Dismissed` to `None` (clearing `AppState.confirmation`) ...
- **Type:** Functional
- **Description:** This ensures the dismissal is reflected in the next render frame
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060d] [7_UI_UX_DESIGN-REQ-218]** `TuiEvent::ControlResult` is defined as:
- **Type:** Functional
- **Description:** `TuiEvent::ControlResult` is defined as:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060e] [7_UI_UX_DESIGN-REQ-219]** A transient `StatusMessage` is stored in `AppState` to display gRPC errors fr...
- **Type:** Functional
- **Description:** A transient `StatusMessage` is stored in `AppState` to display gRPC errors from control operations:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060f] [7_UI_UX_DESIGN-REQ-220]** The status bar is always exactly 1 row tall and spans the full terminal width
- **Type:** Functional
- **Description:** Content is left-aligned. Content that exceeds terminal width is truncated with no indicator
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-060g] [7_UI_UX_DESIGN-REQ-221]** If a server `RunDelta` event arrives indicating the selected run is now `Canc...
- **Type:** Functional
- **Description:** This prevents a redundant cancel request
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CANCEL-001] [7_UI_UX_DESIGN-REQ-124]** Pressing `c` on a `Running` run with `selected_run_id = Some(id)` sets `state...
- **Type:** Functional
- **Description:** Verified by unit test on `dispatch_key`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CANCEL-002] [7_UI_UX_DESIGN-REQ-125]** The confirmation prompt text in the status bar is exactly `Cancel run <slug>?...
- **Type:** Functional
- **Description:** Verified by `insta` text snapshot at `TestBackend` 200×50
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CANCEL-003] [7_UI_UX_DESIGN-REQ-126]** Pressing `n` immediately after prompt opens sets `state.confirmation = None` ...
- **Type:** Functional
- **Description:** Verified by unit test asserting no gRPC call via `mockall`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CANCEL-004] [7_UI_UX_DESIGN-REQ-127]** Pressing `y` transitions `state.confirmation.status` to `Submitting` and spaw...
- **Type:** Functional
- **Description:** Verified by mock assertion
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CANCEL-005] [7_UI_UX_DESIGN-REQ-128]** On gRPC `CancelRun` success, `state.confirmation` is set to `None`
- **Type:** Functional
- **Description:** Verified by unit test processing a `TuiEvent::ControlResult(Ok(()))`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CANCEL-006] [7_UI_UX_DESIGN-REQ-129]** On gRPC `CancelRun` error, `state.confirmation` is set to `None` and `state.s...
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CANCEL-007] [7_UI_UX_DESIGN-REQ-130]** Pressing `c` while `ConfirmationStatus::Submitting` does not spawn a second g...
- **Type:** Functional
- **Description:** Verified by mock assertion
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CANCEL-008] [7_UI_UX_DESIGN-REQ-131]** `Ctrl+C` during `ConfirmationPrompt` quits the application with exit code 0 a...
- **Type:** Functional
- **Description:** Verified by E2E test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-063] [7_UI_UX_DESIGN-REQ-222]** During `ConnectionStatus::Reconnecting`, the status bar displays:
- **Type:** Functional
- **Description:** During `ConnectionStatus::Reconnecting`, the status bar displays:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-064] [7_UI_UX_DESIGN-REQ-223]** Reconnect backoff schedule (displayed to operator in status bar as seconds un...
- **Type:** Functional
- **Description:** Reconnect backoff schedule (displayed to operator in status bar as seconds until next attempt):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-065] [7_UI_UX_DESIGN-REQ-224]** Upon reconnection, the status bar immediately transitions to `CONNECTED` (gre...
- **Type:** Functional
- **Description:** The `AppState::runs` and `run_details` are fully replaced by the incoming `run.snapshot` event. `LogBuffer` entries are preserved across reconnect
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-063a] [7_UI_UX_DESIGN-REQ-225]** The status bar format during `Reconnecting` uses `elapsed_ms` to show time si...
- **Type:** Functional
- **Description:** The status bar format during `Reconnecting` uses `elapsed_ms` to show time since disconnection:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-063b] [7_UI_UX_DESIGN-REQ-226]** The TUI initiates reconnect immediately on the first `TuiEvent::StreamError`
- **Type:** Functional
- **Description:** There is no user prompt. The reconnect loop runs on a background `tokio::task`. The event loop continues processing keyboard events and rendering during reconnect
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-063c] [7_UI_UX_DESIGN-REQ-227]** On reconnect success, the gRPC task sends `TuiEvent::Connected` followed imme...
- **Type:** Functional
- **Description:** The event loop processes these sequentially. After `RunSnapshot` is applied, the render reflects the latest server state
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-065a] [7_UI_UX_DESIGN-REQ-228]** `LogBuffer` entries for runs that no longer appear in the reconnect snapshot ...
- **Type:** Functional
- **Description:** They are not immediately cleared on reconnect because the operator may have scrolled `LogPane` and expect the buffered content to persist
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-010] [7_UI_UX_DESIGN-REQ-229]** `reconnect_elapsed_ms` is reset to `0` on every `Connected` event
- **Type:** Functional
- **Description:** It MUST NOT accumulate across sessions
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-011] [7_UI_UX_DESIGN-REQ-230]** The backoff delays MUST be computed using `tokio::time::sleep`, not a spin loop
- **Type:** Functional
- **Description:** The backoff delays MUST be computed using `tokio::time::sleep`, not a spin loop
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-012] [7_UI_UX_DESIGN-REQ-231]** The TUI MUST NOT clear `AppState::runs` during reconnect
- **Type:** Functional
- **Description:** The operator continues to see the last-known state with stale data, not a blank screen
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-013] [7_UI_UX_DESIGN-REQ-232]** `TuiEvent::ReconnectBudgetExceeded` MUST only be sent once
- **Type:** Functional
- **Description:** After it is sent, the background reconnect task exits
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RECONN-001] [7_UI_UX_DESIGN-REQ-132]** After `TuiEvent::StreamError`, `state.connection_status` transitions to `Reco...
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RECONN-002] [7_UI_UX_DESIGN-REQ-133]** During `Reconnecting`, `state.runs` retains the last-known run list
- **Type:** Functional
- **Description:** Verified by unit test asserting `state.runs` is unchanged after `StreamError`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RECONN-003] [7_UI_UX_DESIGN-REQ-134]** After `TuiEvent::Connected` + `TuiEvent::RunSnapshot`, `state.connection_stat...
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RECONN-004] [7_UI_UX_DESIGN-REQ-135]** `state.log_buffers` is unchanged after reconnect (entries are preserved)
- **Type:** Functional
- **Description:** Verified by unit test comparing buffer state before and after reconnect cycle
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RECONN-005] [7_UI_UX_DESIGN-REQ-136]** When `elapsed_ms > 35_000`, `TuiEvent::ReconnectBudgetExceeded` is sent and t...
- **Type:** Functional
- **Description:** Verified by E2E test with a server that is intentionally unreachable
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RECONN-006] [7_UI_UX_DESIGN-REQ-137]** Status bar `insta` snapshot shows `RECONNECTING...` text in monochrome mode d...
- **Type:** Functional
- **Description:** Verified by snapshot `status_bar__reconnecting`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-RECONN-007] [7_UI_UX_DESIGN-REQ-138]** `ConfirmationPrompt` is dismissed (set to `None`) when `StreamError` arrives
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-066] [7_UI_UX_DESIGN-REQ-233]** `LogTail` (Dashboard) auto-scrolls: when the log buffer appends a new line an...
- **Type:** Functional
- **Description:** If the operator has scrolled up (offset < tail), auto-scroll is suppressed
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-067] [7_UI_UX_DESIGN-REQ-234]** There is no "scroll to bottom" animation
- **Type:** Functional
- **Description:** The offset update is instantaneous, applied in `handle_event()` before `render()`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-066a] [7_UI_UX_DESIGN-REQ-235]** `visible_rows` is the height of the `LogTail` pane in characters, computed fr...
- **Type:** Functional
- **Description:** It uses the same layout computation as `render()` to ensure consistency
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-066b] [7_UI_UX_DESIGN-REQ-236]** The `LogBuffer::push()` method evicts the oldest line when `lines.len() == ma...
- **Type:** Functional
- **Description:** After eviction, `total_received` is incremented and `truncated` is set to `true`. The `scroll_offset` is NOT decremented on eviction. The operator's view window shifts by 1 line toward the beginning of the buffer, which is the correct behavior (they see the same absolute content position)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-066c] [7_UI_UX_DESIGN-REQ-237]** `LogLine.content` is populated by running `strip_ansi()` from `render_utils.r...
- **Type:** Functional
- **Description:** `raw_content` is stored verbatim (binary-safe, with `\r\n` normalized to `\n`). ANSI stripping is performed once at insert time; not on every render
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-066d] [7_UI_UX_DESIGN-REQ-238]** For `LogTail` on the Dashboard, when no specific stage is selected, the TUI d...
- **Type:** Functional
- **Description:** "Most recently active" is determined by `LogLine.timestamp` across all stages for the selected run. If multiple stages have the same last timestamp, alphabetical stage name order is used as a tie-breaker
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-LOG-001] [7_UI_UX_DESIGN-REQ-139]** When `scroll_offset` is at the tail and a new `TuiEvent::LogLine` arrives, `s...
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-LOG-002] [7_UI_UX_DESIGN-REQ-140]** When `scroll_offset` is 3 lines above the tail and a new line arrives, `scrol...
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-LOG-003] [7_UI_UX_DESIGN-REQ-141]** `LogBuffer` with `max_capacity = 10_000` never grows beyond 10,000 entries af...
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-LOG-004] [7_UI_UX_DESIGN-REQ-142]** After eviction, `truncated == true` and `total_received == 10_001`
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-LOG-005] [7_UI_UX_DESIGN-REQ-143]** `LogLine.content` is the ANSI-stripped version of `raw_content`
- **Type:** Functional
- **Description:** Verified by unit test with an input containing CSI sequences
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-LOG-006] [7_UI_UX_DESIGN-REQ-144]** `LogTail` in an `insta` snapshot at `TestBackend` 200×50 shows the last N lin...
- **Type:** Functional
- **Description:** Verified by snapshot `logs__buffered`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-LOG-007] [7_UI_UX_DESIGN-REQ-145]** `LogPane` prepends `[stdout] ` or `[stderr] ` to each line
- **Type:** Functional
- **Description:** Verified by `insta` snapshot `logs__buffered`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-068] [7_UI_UX_DESIGN-REQ-239]** `HelpOverlay` renders centered in the terminal with a 2-column padding on eac...
- **Type:** Functional
- **Description:** Content is the keybinding table formatted as:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-068a] [7_UI_UX_DESIGN-REQ-240]** `HelpOverlay` is rendered as a `ratatui::widgets::Clear` layer followed by th...
- **Type:** Functional
- **Description:** The `Clear` widget ensures the underlying tab content is fully overwritten within the overlay bounds, not just the border frame
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-068b] [7_UI_UX_DESIGN-REQ-241]** At minimum terminal size 80×24, the overlay fits without clipping
- **Type:** Functional
- **Description:** At terminal sizes below 80×24, the terminal-too-small message replaces all content including the overlay (see §5.7.4 edge cases)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-068c] [7_UI_UX_DESIGN-REQ-242]** `help_visible` is toggled by pressing `?`
- **Type:** Functional
- **Description:** It is set to `false` by pressing `Esc`, `q`, or `Ctrl+C` when the overlay is visible. `Ctrl+C` additionally exits the application
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-020] [7_UI_UX_DESIGN-REQ-243]** `HelpOverlay` content MUST be defined in `HELP_OVERLAY_CONTENT` in `strings.rs`
- **Type:** Functional
- **Description:** It MUST NOT be constructed dynamically. This ensures it is testable as a static snapshot
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-021] [7_UI_UX_DESIGN-REQ-244]** While `help_visible == true`, background panes (RunList, DagView, LogTail, et...
- **Type:** Functional
- **Description:** The overlay does not "freeze" the application
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-022] [7_UI_UX_DESIGN-REQ-245]** `help_visible` is `false` after any tab switch (Tab / 1–4)
- **Type:** Functional
- **Description:** Tab switching dismisses the overlay
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-HELP-001] [7_UI_UX_DESIGN-REQ-146]** Pressing `?` sets `state.help_visible = true`
- **Type:** Functional
- **Description:** Verified by unit test on `dispatch_key`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-HELP-002] [7_UI_UX_DESIGN-REQ-147]** Pressing `?` again sets `state.help_visible = false`
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-HELP-003] [7_UI_UX_DESIGN-REQ-148]** Pressing `Esc` while `help_visible == true` sets `help_visible = false`
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-HELP-004] [7_UI_UX_DESIGN-REQ-149]** `HelpOverlay` `insta` snapshot matches `HELP_OVERLAY_CONTENT` exactly (border...
- **Type:** Functional
- **Description:** Verified by snapshot `help_overlay__visible`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-HELP-005] [7_UI_UX_DESIGN-REQ-150]** At `TestBackend` 79×24, `help_visible = true`, the render output shows termin...
- **Type:** Functional
- **Description:** Verified by snapshot `dashboard__terminal_too_small`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-HELP-006] [7_UI_UX_DESIGN-REQ-151]** Pressing `?` while `state.confirmation.is_some()` does NOT set `help_visible ...
- **Type:** Functional
- **Description:** Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-HELP-007] [7_UI_UX_DESIGN-REQ-152]** `HELP_OVERLAY_CONTENT` contains only ASCII characters U+0020–U+007E plus `\n`
- **Type:** Functional
- **Description:** Verified by a compile-time `const` assertion or `#[test]` byte scan
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-069] [7_UI_UX_DESIGN-REQ-246]** CLI commands produce output in exactly two states:
- **Type:** Functional
- **Description:** success** and **error**. There is no in-progress animation, no spinner, and no partial output in text mode
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-070] [7_UI_UX_DESIGN-REQ-247]** For `devs logs --follow` in text mode: log lines are streamed to stdout as th...
- **Type:** Functional
- **Description:** No buffering beyond I/O buffering. On run completion the process exits with code `0` (`Completed`) or `1` (`Failed`/`Cancelled`)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-071] [7_UI_UX_DESIGN-REQ-248]** All error output in `--format text` mode goes to
- **Type:** Functional
- **Description:** stderr**. All error output in `--format json` mode goes to **stdout** (nothing to stderr). Success output always goes to **stdout** in both modes
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-072] [7_UI_UX_DESIGN-REQ-249]** Machine-stable error prefix contract — all error strings begin with exactly o...
- **Type:** Functional
- **Description:** This is enforced by a lint test in CI that scans all `.rs` source files for error strings not in `strings.rs`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-071a] [7_UI_UX_DESIGN-REQ-250]** The `Formatter` trait is defined in `crates/devs-cli/src/format.rs`:
- **Type:** Functional
- **Description:** The `Formatter` trait is defined in `crates/devs-cli/src/format.rs`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-071b] [7_UI_UX_DESIGN-REQ-251]** `devs logs --follow` uses a dedicated `stream_log_lines()` function that writ...
- **Type:** Functional
- **Description:** The function does not buffer lines; each line is flushed immediately. The function returns when the gRPC stream sends the terminal `done: true` chunk
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-069a] [7_UI_UX_DESIGN-REQ-252]** There is no interactive prompt or confirmation in the CLI
- **Type:** Functional
- **Description:** `devs cancel` sends the cancel request immediately without prompting. The TUI cancel flow (§5.4) is TUI-only
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-030] [7_UI_UX_DESIGN-REQ-253]** All JSON output MUST be valid JSON parseable by `serde_json::from_str`
- **Type:** Functional
- **Description:** Trailing `\n` after the JSON object is required. Verified by `assert_cmd` piping stdout to `jq .`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-031] [7_UI_UX_DESIGN-REQ-254]** `--format json` MUST produce zero bytes on stderr for any input, including er...
- **Type:** Functional
- **Description:** Verified by E2E test asserting `stderr.is_empty()`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-032] [7_UI_UX_DESIGN-REQ-255]** All error strings MUST begin with exactly one of the ten machine-stable prefi...
- **Type:** Functional
- **Description:** Verified by a CI lint test scanning `strings.rs` in `devs-cli`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-BR-033] [7_UI_UX_DESIGN-REQ-256]** The `"code"` field in JSON error responses MUST equal the CLI exit code
- **Type:** Functional
- **Description:** Verified by unit test asserting `error.code == process.exit_code`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CLI-OUT-001] [7_UI_UX_DESIGN-REQ-153]** `devs submit --format json` produces a single-line JSON object with all five ...
- **Type:** Functional
- **Description:** Verified by E2E test parsing stdout with `serde_json`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CLI-OUT-002] [7_UI_UX_DESIGN-REQ-154]** `devs list --format json` produces a JSON object with `"runs"` array (no `sta...
- **Type:** Functional
- **Description:** Verified by E2E test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CLI-OUT-003] [7_UI_UX_DESIGN-REQ-155]** `devs status --format json` includes `"stage_runs"` array with at least the c...
- **Type:** Functional
- **Description:** Verified by E2E test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CLI-OUT-004] [7_UI_UX_DESIGN-REQ-156]** `devs logs --follow --format text` streams lines to stdout one-per-line and e...
- **Type:** Functional
- **Description:** Verified by E2E test with `assert_cmd` + `predicate::str::contains`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CLI-OUT-005] [7_UI_UX_DESIGN-REQ-157]** `devs cancel --format json` on a non-existent run produces `{"error": "not_fo...
- **Type:** Functional
- **Description:** Exit code is 2. Verified by E2E test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CLI-OUT-006] [7_UI_UX_DESIGN-REQ-158]** `devs cancel --format text` on a non-existent run produces an error message o...
- **Type:** Functional
- **Description:** Exit code is 2. Verified by E2E test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CLI-OUT-007] [7_UI_UX_DESIGN-REQ-159]** The `"code"` field in the JSON error response equals the process exit code fo...
- **Type:** Functional
- **Description:** Verified by parameterized unit test over all ten prefixes
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-CLI-OUT-008] [7_UI_UX_DESIGN-REQ-160]** No command handler in `devs-cli` calls `println!` or `eprintln!` directly
- **Type:** Functional
- **Description:** Verified by `cargo clippy` + a custom lint in `./do lint` scanning for these patterns
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-073] [7_UI_UX_DESIGN-REQ-257]** All rendering and interaction timing constraints, consolidated:
- **Type:** Functional
- **Description:** All rendering and interaction timing constraints, consolidated:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TIMING-001] [7_UI_UX_DESIGN-REQ-161]** `render()` on an `AppState` with 64 stages and 10,000 log lines completes in ...
- **Type:** Functional
- **Description:** Verified by benchmark test using `std::time::Instant`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TIMING-002] [7_UI_UX_DESIGN-REQ-162]** After injecting a `TuiEvent::RunDelta` into the event loop, the render is tri...
- **Type:** Functional
- **Description:** After injecting a `TuiEvent::RunDelta` into the event loop, the render is triggered within 50 ms as measured by `Instant::now()` in a test harness
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TIMING-003] [7_UI_UX_DESIGN-REQ-163]** `Tick` events arrive at 1,000 ms ± 50 ms intervals
- **Type:** Functional
- **Description:** Verified by unit test counting 5 Ticks over 5 seconds
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TIMING-004] [7_UI_UX_DESIGN-REQ-164]** `StatusMessage` with `expires_at = now()` is cleared on the very next `Tick` ...
- **Type:** Functional
- **Description:** Verified by unit test injecting a `Tick` after setting `status_message`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-TIMING-005] [7_UI_UX_DESIGN-REQ-165]** `LogBuffer` entries idle for > 30 minutes for a terminal run that is not sele...
- **Type:** Functional
- **Description:** Verified by unit test with a manipulated `last_appended_at` timestamp
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-078] [7_UI_UX_DESIGN-REQ-258]** The complete `AppState` struct is the single source of truth for all TUI rend...
- **Type:** Functional
- **Description:** No widget holds its own state. `AppState` is defined in `crates/devs-tui/src/state.rs` and is owned exclusively by `App`. It is never shared across threads via `Arc` or `Mutex`; all mutations happen on the event loop's single thread
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-079] [7_UI_UX_DESIGN-REQ-259]** The `Tab` enum represents all navigable tabs in declaration order (used for `...
- **Type:** Functional
- **Description:** The `Tab` enum represents all navigable tabs in declaration order (used for `Tab` key cycling):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-080] [7_UI_UX_DESIGN-REQ-260]** `RunSummary` is populated from the `StreamRunEvents` gRPC stream
- **Type:** Functional
- **Description:** It contains only the fields needed to render the `RunList` and `StatusBar`. It does NOT embed `stage_runs`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[a-z0-9-] [7_UI_UX_DESIGN-REQ-002]** +
- **Type:** Functional
- **Description:** +
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-081] [7_UI_UX_DESIGN-REQ-261]** `RunDetail` is populated on run selection and updated by `RunDelta` events
- **Type:** Functional
- **Description:** It includes the precomputed DAG tier layout, which is recomputed in `handle_event()` — never in `render()`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-082] [7_UI_UX_DESIGN-REQ-262]** `dag_tiers` computation algorithm (Kahn's topological sort adapted for tier a...
- **Type:** Functional
- **Description:** `dag_tiers` computation algorithm (Kahn's topological sort adapted for tier assignment):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-082a] [7_UI_UX_DESIGN-REQ-263]** Business rule: `dag_tiers` MUST be recomputed synchronously within `handle_ev...
- **Type:** Functional
- **Description:** The `render()` function reads `dag_tiers` as precomputed data and MUST NOT invoke topological sort
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-083] [7_UI_UX_DESIGN-REQ-264]** `LogBuffer` is a fixed-capacity ring buffer
- **Type:** Functional
- **Description:** It is the sole in-memory log storage for TUI display. The full log is always on disk in `.devs/logs/`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-084] [7_UI_UX_DESIGN-REQ-265]** ANSI escape sequence stripping algorithm — implemented as a 3-state machine i...
- **Type:** Functional
- **Description:** This function is pure and has no side effects:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-084a] [7_UI_UX_DESIGN-REQ-266]** `\r\n` sequences in log content MUST be normalized to `\n` before insertion i...
- **Type:** Functional
- **Description:** Implemented in the event handler, not in `strip_ansi`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-084b] [7_UI_UX_DESIGN-REQ-267]** Log lines longer than 32,768 bytes (32 KiB) from the server are truncated by ...
- **Type:** Functional
- **Description:** The TUI does not truncate log lines; it clips to pane width during rendering by taking only as many cells as fit the column count
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-085] [7_UI_UX_DESIGN-REQ-268]** `PoolSummary` is populated from the `WatchPoolState` gRPC stream:
- **Type:** Functional
- **Description:** `PoolSummary` is populated from the `WatchPoolState` gRPC stream:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-086] [7_UI_UX_DESIGN-REQ-269]** `PoolSummary::pool_state` in `AppState` is sorted by `name` ascending on ever...
- **Type:** Functional
- **Description:** The sort is stable
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-087] [7_UI_UX_DESIGN-REQ-270]** The DAG layout is fully described by the following types, used by `DagView` t...
- **Type:** Functional
- **Description:** The DAG layout is fully described by the following types, used by `DagView` to render the stage graph:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-088] [7_UI_UX_DESIGN-REQ-271]** `DagLayout::total_width` calculation:
- **Type:** Functional
- **Description:** `DagLayout::total_width` calculation:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-089] [7_UI_UX_DESIGN-REQ-272]** `devs submit --format json` outputs a single JSON object to stdout on success
- **Type:** Functional
- **Description:** On error, outputs a JSON error object to stdout (nothing to stderr in JSON mode):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[a-z0-9-] [7_UI_UX_DESIGN-REQ-003]** +`, max 128 chars |
- **Type:** Functional
- **Description:** +`, max 128 chars |
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-090] [7_UI_UX_DESIGN-REQ-273]** `devs list --format json` outputs a JSON array of run summary objects, sorted...
- **Type:** Functional
- **Description:** `devs list --format json` outputs a JSON array of run summary objects, sorted by `created_at` descending, maximum 100 items (clamped, never truncated with error):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-090a] [7_UI_UX_DESIGN-REQ-274]** `stage_runs` is NEVER included in `devs list` output
- **Type:** Functional
- **Description:** Use `devs status <run>` to get stage-level detail
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-090b] [7_UI_UX_DESIGN-REQ-275]** Empty result set returns `[]` (empty JSON array), not `null` and not an error
- **Type:** Functional
- **Description:** Empty result set returns `[]` (empty JSON array), not `null` and not an error
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-091] [7_UI_UX_DESIGN-REQ-276]** `devs status <run> --format json` outputs a full run status object including ...
- **Type:** Functional
- **Description:** `devs status <run> --format json` outputs a full run status object including all stage runs:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-092] [7_UI_UX_DESIGN-REQ-277]** `devs status <run>` in text mode produces fixed-label output:
- **Type:** Functional
- **Description:** `devs status <run>` in text mode produces fixed-label output:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-093] [7_UI_UX_DESIGN-REQ-278]** `devs logs <run> [stage] --format json` without `--follow` outputs a JSON obj...
- **Type:** Functional
- **Description:** `devs logs <run> [stage] --format json` without `--follow` outputs a JSON object:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-093a] [7_UI_UX_DESIGN-REQ-279]** With `--follow`, lines are streamed as newline-delimited JSON objects (one pe...
- **Type:** Functional
- **Description:** With `--follow`, lines are streamed as newline-delimited JSON objects (one per line), matching the MCP `stream_logs` chunk format:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-093b] [7_UI_UX_DESIGN-REQ-280]** `devs logs <run>` without a stage name: streams logs from ALL stages interlea...
- **Type:** Functional
- **Description:** Each line object gains a `"stage_name"` field to identify the source
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-094] [7_UI_UX_DESIGN-REQ-281]** Control commands in JSON mode output a minimal confirmation object on success:
- **Type:** Functional
- **Description:** Control commands in JSON mode output a minimal confirmation object on success:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-095] [7_UI_UX_DESIGN-REQ-282]** `devs project list --format json`:
- **Type:** Functional
- **Description:** `devs project list --format json`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-096] [7_UI_UX_DESIGN-REQ-283]** `devs list` in text mode renders a fixed-column table:
- **Type:** Functional
- **Description:** `devs list` in text mode renders a fixed-column table:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-096a] [7_UI_UX_DESIGN-REQ-284]** The header row is always printed, even for empty result sets
- **Type:** Functional
- **Description:** The header row is always printed, even for empty result sets
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-097] [7_UI_UX_DESIGN-REQ-285]** `devs-mcp-bridge` startup sequence:
- **Type:** Functional
- **Description:** `devs-mcp-bridge` startup sequence:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-097a] [7_UI_UX_DESIGN-REQ-286]** If discovery fails at step 1–4, output to stdout:
- **Type:** Functional
- **Description:** If discovery fails at step 1–4, output to stdout:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-097b] [7_UI_UX_DESIGN-REQ-287]** `devs-mcp-bridge` MUST NOT create any TCP listener
- **Type:** Functional
- **Description:** It is a pure stdin→HTTP→stdout proxy
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-098] [7_UI_UX_DESIGN-REQ-288]** Each stdin line is treated as one complete JSON-RPC 2.0 request
- **Type:** Functional
- **Description:** The bridge:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-098a] [7_UI_UX_DESIGN-REQ-289]** The bridge performs NO semantic validation of the `method` or `params` fields
- **Type:** Functional
- **Description:** It forwards JSON verbatim
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-098b] [7_UI_UX_DESIGN-REQ-290]** For `stream_logs` with `follow:true`, the HTTP response uses chunked transfer...
- **Type:** Functional
- **Description:** The bridge reads chunks and writes each newline-delimited chunk to stdout immediately (no buffering). Each chunk is a complete JSON object terminated by `\n`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-099] [7_UI_UX_DESIGN-REQ-291]** Bridge error response format for HTTP transport failures:
- **Type:** Functional
- **Description:** Bridge error response format for HTTP transport failures:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-099a] [7_UI_UX_DESIGN-REQ-292]** On connection loss during a request: attempt one reconnect after 1 second
- **Type:** Functional
- **Description:** If reconnect fails, write to stdout:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-100] [7_UI_UX_DESIGN-REQ-293]** The bridge holds exactly this runtime state:
- **Type:** Functional
- **Description:** The bridge holds exactly this runtime state:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-100a] [7_UI_UX_DESIGN-REQ-294]** The bridge processes one request at a time (sequential, not concurrent)
- **Type:** Functional
- **Description:** It does not pipeline requests. Stdin is read only after the previous response has been written
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-101] [7_UI_UX_DESIGN-REQ-295]** The `ConnectionStatus` state machine governs TUI reconnection behavior:
- **Type:** Functional
- **Description:** The `ConnectionStatus` state machine governs TUI reconnection behavior:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-101a] [7_UI_UX_DESIGN-REQ-296]** State fields per variant:
- **Type:** Functional
- **Description:** State fields per variant:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-101b] [7_UI_UX_DESIGN-REQ-297]** Transition rules:
- **Type:** Functional
- **Description:** Transition rules:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-102] [7_UI_UX_DESIGN-REQ-298]** The Dashboard tab maintains a focus state that governs arrow key routing:
- **Type:** Functional
- **Description:** The Dashboard tab maintains a focus state that governs arrow key routing:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-102a] [7_UI_UX_DESIGN-REQ-299]** Tab switching (keys `Tab`, `1`, `2`, `3`, `4`) always resets to the primary f...
- **Type:** Functional
- **Description:** `selected_stage_name` is cleared when switching away from `Logs` or `Debug` tab
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-103] [7_UI_UX_DESIGN-REQ-300]** Cancel confirmation flow:
- **Type:** Functional
- **Description:** Cancel confirmation flow:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-103a] [7_UI_UX_DESIGN-REQ-301]** During `ConfirmPending`, `HelpOverlay` cannot be opened
- **Type:** Functional
- **Description:** The `?` key is consumed without effect. `Ctrl+C` and `q` still quit the application immediately
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-103b] [7_UI_UX_DESIGN-REQ-302]** During `Cancelling`, all keys except `Ctrl+C` and `q` are consumed
- **Type:** Functional
- **Description:** The application remains fully responsive to incoming server events and re-renders normally
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-104] [7_UI_UX_DESIGN-REQ-303]** `LogBuffer` lifecycle per `(run_id, stage_name)` key:
- **Type:** Functional
- **Description:** `LogBuffer` lifecycle per `(run_id, stage_name)` key:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-104a] [7_UI_UX_DESIGN-REQ-304]** Log buffers for non-terminal runs are NEVER evicted, regardless of selection ...
- **Type:** Functional
- **Description:** Log buffers for non-terminal runs are NEVER evicted, regardless of selection state or idle time
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-105] [7_UI_UX_DESIGN-REQ-305]** Terminal resize during rendering
- **Type:** Functional
- **Description:** `crossterm` delivers a `Resize(w, h)` event when the terminal dimensions change. The TUI processes this as a `TuiEvent::Resize`. `AppState::terminal_size` is updated immediately. The next `render()` call reflows layout using the new dimensions. No state is invalidated by resize except `dag_scroll_offset`, which is clamped to `max(0, total_dag_width - pane_width)` to prevent scroll beyond content
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-106] [7_UI_UX_DESIGN-REQ-306]** Terminal smaller than 80×24 after startup
- **Type:** Functional
- **Description:** The size warning replaces ALL content including the status bar and tab bar. The warning is re-evaluated every `Resize` event. When the terminal grows back to ≥ 80×24, normal rendering resumes with the previous `AppState` intact (no state reset)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-107] [7_UI_UX_DESIGN-REQ-307]** Zero runs in `AppState::runs`
- **Type:** Functional
- **Description:** The `RunList` renders a centered message:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-108] [7_UI_UX_DESIGN-REQ-308]** Selected run disappears during reconnect
- **Type:** Functional
- **Description:** When `AppState::runs` is replaced by a `run.snapshot` event on reconnect, if `selected_run_id` no longer exists in the new snapshot, it is set to `None`. The `RunList` selection is cleared. `dag_scroll_offset` is reset to 0
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-109] [7_UI_UX_DESIGN-REQ-309]** DAG with a single root stage (no dependencies)
- **Type:** Functional
- **Description:** Renders as a single tier with one box. No tier gutter or arrow is rendered. `total_width = 39`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-110] [7_UI_UX_DESIGN-REQ-310]** DAG with all stages in one tier (no dependencies between any)
- **Type:** Functional
- **Description:** All boxes render in tier 0, stacked vertically. No horizontal scroll needed unless individual boxes exceed pane width (they never do at 39 cols + padding)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-111] [7_UI_UX_DESIGN-REQ-311]** Fan-out stage display
- **Type:** Functional
- **Description:** A stage with `fan_out_count = Some(N)` renders as a single box with `(xN)` appended to the name field. The name + suffix is computed before truncation. Example for `fan_out_count = Some(8)`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-111a] [7_UI_UX_DESIGN-REQ-312]** If appending `(xN)` would overflow 20 chars, the name is truncated to `20 - l...
- **Type:** Functional
- **Description:** For `(x64)` (5 chars): name truncated to 14 chars + `~` + `(x64)` = 20 chars total
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-112] [7_UI_UX_DESIGN-REQ-313]** Stage name exactly 20 characters
- **Type:** Functional
- **Description:** No truncation marker is appended. The full name is displayed without modification
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-113] [7_UI_UX_DESIGN-REQ-314]** Stage name is empty string
- **Type:** Functional
- **Description:** This cannot occur — `BoundedString<128>` requires non-empty content, and the validation pipeline enforces stage name uniqueness (which implies non-empty). The TUI treats empty stage name as an internal error and renders `"<unnamed>"` with `STYLE_SUBDUED`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-114] [7_UI_UX_DESIGN-REQ-315]** Ambiguous run identifier
- **Type:** Functional
- **Description:** When the operator provides a value matching both a valid UUID4 prefix and a slug, UUID takes precedence. If neither matches any run, exit code 2 with:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-115] [7_UI_UX_DESIGN-REQ-316]** `--input` value containing `=`
- **Type:** Functional
- **Description:** Splitting on the first `=` only: `--input expr=a=b` sets input `expr` to `"a=b"`. `--input =value` (empty key) fails validation with exit code 4:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-116] [7_UI_UX_DESIGN-REQ-317]** `devs list` with `--limit 0`
- **Type:** Functional
- **Description:** Exit code 4:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-117] [7_UI_UX_DESIGN-REQ-318]** `devs list` with `--limit > 1000`
- **Type:** Functional
- **Description:** Silently clamped to 1000. No warning is emitted. The response contains at most 1000 items
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-118] [7_UI_UX_DESIGN-REQ-319]** `devs submit` when CWD resolves to zero projects
- **Type:** Functional
- **Description:** Exit code 4:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-119] [7_UI_UX_DESIGN-REQ-320]** `devs submit` when CWD resolves to two or more projects
- **Type:** Functional
- **Description:** Exit code 4:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-120] [7_UI_UX_DESIGN-REQ-321]** `devs logs <run>` where the run has no stages started yet
- **Type:** Functional
- **Description:** Text mode: prints a message and exits 0:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-121] [7_UI_UX_DESIGN-REQ-322]** `devs logs <run> [stage] --follow` on a cancelled run
- **Type:** Functional
- **Description:** If the run is already `Cancelled`, exits immediately with code 1 (same as `Failed`). If the run transitions to `Cancelled` while streaming, the `{"done":true,...}` chunk is received and the process exits with code 1
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-122] [7_UI_UX_DESIGN-REQ-323]** `devs security-check` with missing `devs.toml`
- **Type:** Functional
- **Description:** Runs all checks against built-in defaults. Emits warning for `SEC-TOML-CRED` as "no config file found". Does not open a gRPC channel
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-123] [7_UI_UX_DESIGN-REQ-324]** Server unreachable during `devs cancel/pause/resume`
- **Type:** Functional
- **Description:** Exit code 3. In JSON mode:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-124] [7_UI_UX_DESIGN-REQ-325]** Invalid JSON on stdin
- **Type:** Functional
- **Description:** The bridge writes a JSON-RPC parse error to stdout and continues reading:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-125] [7_UI_UX_DESIGN-REQ-326]** Stdin closes (EOF) while bridge is running
- **Type:** Functional
- **Description:** The bridge completes any in-flight request, then exits with code 0. This is the normal shutdown path
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-126] [7_UI_UX_DESIGN-REQ-327]** HTTP 413 from MCP server (request body > 1 MiB)
- **Type:** Functional
- **Description:** Bridge writes:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-127] [7_UI_UX_DESIGN-REQ-328]** `stream_logs follow:true` where MCP server closes stream before `{"done":true}`
- **Type:** Functional
- **Description:** Bridge writes the last received chunk (if any), then writes:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-128] [7_UI_UX_DESIGN-REQ-329]** Bridge receives malformed MCP response (not valid JSON)
- **Type:** Functional
- **Description:** Bridge writes:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-129] [7_UI_UX_DESIGN-REQ-330]** Log sequence gap detected
- **Type:** Functional
- **Description:** If a `LogLine` event arrives with `sequence` that skips values (e.g., last received = 5, new = 7), the TUI logs an internal `WARN` (not displayed to operator). Missing lines are not fetched retroactively. The sequence gap is recorded in `LogBuffer::total_received` gap tracking but no visual indicator is shown to the operator
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-130] [7_UI_UX_DESIGN-REQ-331]** Log line exceeding pane width
- **Type:** Functional
- **Description:** The line is clipped at `pane_width - 1` columns during rendering. A `$` character is appended at position `pane_width - 1` to signal truncation (only in `LogPane`, not in `LogTail`):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-131] [7_UI_UX_DESIGN-REQ-332]** `stream_logs follow:true` on a `Pending` or `Waiting` stage
- **Type:** Functional
- **Description:** The HTTP connection is held open by the server. The bridge forwards the connection. If the stage never starts within the connection lifetime (e.g., workflow cancelled), the server sends `{"done":true,"truncated":false,"total_lines":0}` and closes the stream
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-132] [7_UI_UX_DESIGN-REQ-333]** Log buffer full (10,000 lines) — new line arrives
- **Type:** Functional
- **Description:** The oldest line (`lines.front()`) is removed. The new line is appended to `lines.back()`. `truncated` is set to `true`. `total_received` is incremented. The `log_scroll_offset` for this buffer is decremented by 1 if it was > 0, to maintain the operator's visual position
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-133] [7_UI_UX_DESIGN-REQ-334]** The three client binaries have strictly enforced dependency rules verified by...
- **Type:** Functional
- **Description:** The three client binaries have strictly enforced dependency rules verified by `./do lint` via `cargo tree`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-134] [7_UI_UX_DESIGN-REQ-335]** The `devs-client-util` shared library crate exposes:
- **Type:** Functional
- **Description:** The `devs-client-util` shared library crate exposes:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-134a] [7_UI_UX_DESIGN-REQ-336]** `DiscoveryError` maps to UI exit behavior:
- **Type:** Functional
- **Description:** `DiscoveryError` maps to UI exit behavior:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-135] [7_UI_UX_DESIGN-REQ-337]** The TUI maintains two persistent gRPC streaming subscriptions:
- **Type:** Functional
- **Description:** The TUI maintains two persistent gRPC streaming subscriptions:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-135a] [7_UI_UX_DESIGN-REQ-338]** Both streams are subscribed in parallel `tokio::task::spawn` tasks
- **Type:** Functional
- **Description:** Each task forwards events to the main event loop via `mpsc::Sender<TuiEvent>`. Channel buffer sizes: run events = 256; pool events = 64
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-135b] [7_UI_UX_DESIGN-REQ-339]** If either stream errors, only that stream's reconnect procedure is triggered
- **Type:** Functional
- **Description:** The TUI does not reset both streams on a single stream error
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-136] [7_UI_UX_DESIGN-REQ-340]** The first event received on `StreamRunEvents` after connecting is always `eve...
- **Type:** Functional
- **Description:** This event causes `AppState::runs` and `run_details` to be fully replaced. `LogBuffer` entries are preserved (they survive reconnect)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-137] [7_UI_UX_DESIGN-REQ-341]** Proto types from `devs-proto` MUST NOT appear in `state.rs`, `widgets/`, or `...
- **Type:** Functional
- **Description:** All proto-to-domain conversions are performed in `crates/devs-tui/src/convert.rs`. This file is the sole importer of `devs_proto::devs::v1::*` within the TUI crate
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-138] [7_UI_UX_DESIGN-REQ-342]** Equivalent rule for CLI: proto-to-output conversions are performed in `crates...
- **Type:** Functional
- **Description:** Command handlers receive domain types; they do not reference proto types
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-139] [7_UI_UX_DESIGN-REQ-343]** All TUI snapshot tests use `ratatui::backend::TestBackend` at a fixed size of
- **Type:** Functional
- **Description:** 200 columns × 50 rows**. This size ensures all layout regions are visible without truncation. `ColorMode::Monochrome` is always used in snapshots to ensure ANSI-free output
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-140] [7_UI_UX_DESIGN-REQ-344]** Snapshot files are stored in `crates/devs-tui/tests/snapshots/` with `.txt` e...
- **Type:** Functional
- **Description:** The `insta 1.40` crate manages the snapshot lifecycle. `INSTA_UPDATE=always` is prohibited in CI (enforced by checking the env var in `./do ci`)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-141] [7_UI_UX_DESIGN-REQ-345]** Each snapshot test follows this pattern:
- **Type:** Functional
- **Description:** Each snapshot test follows this pattern:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-141a] [7_UI_UX_DESIGN-REQ-346]** `AppState::test_default()` is gated behind `#[cfg(test)]`
- **Type:** Functional
- **Description:** It MUST NOT be callable from production code. It initializes:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-142] [7_UI_UX_DESIGN-REQ-347]** The following snapshots MUST exist and pass in CI
- **Type:** Functional
- **Description:** Each snapshot filename maps to a test function:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-001] [7_UI_UX_DESIGN-REQ-348]** When `NO_COLOR` is set to any non-empty value, TUI renders zero ANSI color es...
- **Type:** Functional
- **Description:** Verified by rendering to `TestBackend` and asserting no `\x1b[` sequences in buffer content
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-002] [7_UI_UX_DESIGN-REQ-349]** `Theme::from_env()` is the only location that reads `NO_COLOR`
- **Type:** Functional
- **Description:** `cargo grep 'NO_COLOR' crates/devs-tui/src` returns exactly one match
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-003] [7_UI_UX_DESIGN-REQ-350]** `STYLE_SUBDUED` uses `Color::DarkGray` in `ColorMode::Color` and no color mod...
- **Type:** Functional
- **Description:** Verified by `theme.rs` unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-004] [7_UI_UX_DESIGN-REQ-351]** Selected list row uses `Modifier::REVERSED` in both color modes
- **Type:** Functional
- **Description:** No other selection indicator is used
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-005] [7_UI_UX_DESIGN-REQ-352]** Stage status `DONE` renders with `Color::Green` foreground in color mode
- **Type:** Functional
- **Description:** `FAIL` and `TIME` render with `Color::Red`. Verified by snapshot diff
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-006] [7_UI_UX_DESIGN-REQ-353]** Every `stage_status_label()` return value is exactly 4 bytes
- **Type:** Functional
- **Description:** Compile-time assertion in `render_utils.rs` enforces this; build fails if violated
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-007] [7_UI_UX_DESIGN-REQ-354]** `truncate_with_tilde("this-stage-name-is-too-long", 20)` returns `"this-stage...
- **Type:** Functional
- **Description:** Unit test in `render_utils.rs`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-008] [7_UI_UX_DESIGN-REQ-355]** `format_elapsed(None)` returns `"--:--"` (exactly 5 chars)
- **Type:** Functional
- **Description:** `format_elapsed(Some(0))` returns `"0:00 "`. `format_elapsed(Some(599))` returns `"9:59 "`. `format_elapsed(Some(600))` returns `"10:00"`. Unit tests in `render_utils.rs`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-009] [7_UI_UX_DESIGN-REQ-356]** All `STATUS_*` constants in `strings.rs` are compile-time asserted to be exac...
- **Type:** Functional
- **Description:** Test uses `const _: () = assert!(STATUS_RUNNING.len() == 4)` for all status constants
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-010] [7_UI_UX_DESIGN-REQ-357]** No `ITALIC`, `UNDERLINED`, `BLINK`, or `RAPID_BLINK` modifier appears in any ...
- **Type:** Functional
- **Description:** Verified by `cargo grep` lint test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-011] [7_UI_UX_DESIGN-REQ-358]** At terminal size 79×24, TUI renders only the size warning message
- **Type:** Functional
- **Description:** Snapshot `dashboard__terminal_too_small` captures this. No tab bar, status bar, or run list is visible
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-012] [7_UI_UX_DESIGN-REQ-359]** At terminal size 80×24, TUI renders the full dashboard without the size warning
- **Type:** Functional
- **Description:** Verified by snapshot
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-013] [7_UI_UX_DESIGN-REQ-360]** Stage box is exactly 39 columns wide
- **Type:** Functional
- **Description:** Unit test constructs a `DagStageBox` and asserts `render_box(&box).len() == 39`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-014] [7_UI_UX_DESIGN-REQ-361]** `DagLayout::total_width` for a 3-tier DAG equals `39 * 3 + 5 * 2 = 127`
- **Type:** Functional
- **Description:** Unit test with 3-tier input
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-015] [7_UI_UX_DESIGN-REQ-362]** `RunList` pane is at least 24 columns wide at minimum terminal width (80 cols)
- **Type:** Functional
- **Description:** Layout unit test at 80-column terminal
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-016] [7_UI_UX_DESIGN-REQ-363]** `DagView` height is at least 8 rows at minimum terminal size
- **Type:** Functional
- **Description:** Layout unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-017] [7_UI_UX_DESIGN-REQ-364]** `LogTail` auto-scrolls to tail on new line append when already at tail
- **Type:** Functional
- **Description:** Unit test: buffer at tail → append → assert `scroll_offset == buffer.len() - visible_rows`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-018] [7_UI_UX_DESIGN-REQ-365]** `LogTail` does NOT auto-scroll when operator has scrolled up
- **Type:** Functional
- **Description:** Unit test: buffer with offset < tail → append → assert offset unchanged
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-019] [7_UI_UX_DESIGN-REQ-366]** Pressing `Tab` cycles tabs in order: Dashboard→Logs→Debug→Pools→Dashboard
- **Type:** Functional
- **Description:** E2E TUI test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-020] [7_UI_UX_DESIGN-REQ-367]** Pressing `1`–`4` switches to the corresponding tab directly
- **Type:** Functional
- **Description:** E2E TUI test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-021] [7_UI_UX_DESIGN-REQ-368]** Pressing `?` shows `HelpOverlay`
- **Type:** Functional
- **Description:** Pressing `?` again hides it. Snapshot `help_overlay__visible`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-022] [7_UI_UX_DESIGN-REQ-369]** With `HelpOverlay` visible, pressing any key other than `?`, `Esc`, `q`, `Ctr...
- **Type:** Functional
- **Description:** Unit test: send 10 random keys → assert `AppState` unchanged except `help_visible`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-023] [7_UI_UX_DESIGN-REQ-370]** Pressing `c` with no run selected has no effect
- **Type:** Functional
- **Description:** `cancel_confirm_pending` remains `false`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-024] [7_UI_UX_DESIGN-REQ-371]** Pressing `c` with a run selected sets `cancel_confirm_pending = true` and sho...
- **Type:** Functional
- **Description:** Snapshot `dashboard__cancel_confirm`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-025] [7_UI_UX_DESIGN-REQ-372]** Pressing `y` during confirmation triggers `CancelRun` gRPC call
- **Type:** Functional
- **Description:** Pressing `n` or `Esc` dismisses without gRPC call. E2E TUI test using `mockall` mock for gRPC
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-026] [7_UI_UX_DESIGN-REQ-373]** Pressing `Esc` in `StageListFocus` returns focus to `RunDetail` (not `RunList`)
- **Type:** Functional
- **Description:** Pressing `Esc` again returns focus to `RunList`. `selected_stage_name` is cleared on first `Esc`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-027] [7_UI_UX_DESIGN-REQ-374]** Unrecognized keys produce no output (neither to stdout nor stderr) and no sta...
- **Type:** Functional
- **Description:** Unrecognized keys produce no output (neither to stdout nor stderr) and no state change
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-028] [7_UI_UX_DESIGN-REQ-375]** On reconnect, `AppState::runs` and `run_details` are fully replaced by the `r...
- **Type:** Functional
- **Description:** `LogBuffer` entries are NOT cleared. E2E TUI test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-029] [7_UI_UX_DESIGN-REQ-376]** `selected_run_id` is set to `None` if the run no longer exists in the post-re...
- **Type:** Functional
- **Description:** E2E TUI test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-030] [7_UI_UX_DESIGN-REQ-377]** After 30,000ms cumulative reconnect time, `ConnectionStatus` transitions to `...
- **Type:** Functional
- **Description:** After 5,000ms more, TUI exits with code 1. E2E test with mocked server that drops connections
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-031] [7_UI_UX_DESIGN-REQ-378]** `reconnect_elapsed_ms` resets to 0 on successful reconnect
- **Type:** Functional
- **Description:** E2E test: connect → disconnect → reconnect within budget → assert `reconnect_elapsed_ms == 0`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-032] [7_UI_UX_DESIGN-REQ-379]** Status bar shows `RECONNECTING...` in yellow (color mode) during reconnect
- **Type:** Functional
- **Description:** Snapshot `status_bar__reconnecting`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-033] [7_UI_UX_DESIGN-REQ-380]** `devs submit --format json` outputs valid JSON conforming to the schema in §7.1
- **Type:** Functional
- **Description:** `jq` parse must succeed. E2E CLI test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-034] [7_UI_UX_DESIGN-REQ-381]** `devs list --format json` for zero runs outputs `[]` (not `null`, not error)
- **Type:** Functional
- **Description:** E2E CLI test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-035] [7_UI_UX_DESIGN-REQ-382]** `devs status <run> --format json` includes all fields with `null` for unpopul...
- **Type:** Functional
- **Description:** E2E CLI test using `jq 'has("completed_at")'`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-036] [7_UI_UX_DESIGN-REQ-383]** `devs logs <run> --follow` exits with code 0 when run completes, 1 when run f...
- **Type:** Functional
- **Description:** E2E CLI test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-037] [7_UI_UX_DESIGN-REQ-384]** `devs logs <run> --format json --follow` streams newline-delimited JSON chunk...
- **Type:** Functional
- **Description:** Each chunk parses as valid JSON. E2E CLI test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-038] [7_UI_UX_DESIGN-REQ-385]** All error output in `--format json` mode goes to stdout (nothing to stderr)
- **Type:** Functional
- **Description:** E2E CLI test: redirect stderr to file, assert file is empty
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-039] [7_UI_UX_DESIGN-REQ-386]** `--input expr=a=b` sets input `expr` to `"a=b"`
- **Type:** Functional
- **Description:** E2E CLI test via `devs submit --input expr=a=b`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-040] [7_UI_UX_DESIGN-REQ-387]** `devs list --limit 0` exits with code 4
- **Type:** Functional
- **Description:** E2E CLI test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-041] [7_UI_UX_DESIGN-REQ-388]** `devs list --limit 1001` returns at most 1000 items (silently clamped)
- **Type:** Functional
- **Description:** E2E CLI test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-042] [7_UI_UX_DESIGN-REQ-389]** Every error string output by CLI begins with exactly one of the 10 machine-st...
- **Type:** Functional
- **Description:** CI lint test scans all `strings.rs` constants
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-043] [7_UI_UX_DESIGN-REQ-390]** Bridge forwards a valid `list_runs` request and returns the server response u...
- **Type:** Functional
- **Description:** E2E test: spawn bridge as subprocess, write JSON-RPC to stdin, read from stdout, compare to direct MCP HTTP response
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-044] [7_UI_UX_DESIGN-REQ-391]** Bridge writes JSON-RPC error `-32700` to stdout on invalid JSON input and con...
- **Type:** Functional
- **Description:** E2E test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-045] [7_UI_UX_DESIGN-REQ-392]** Bridge outputs `{"fatal":true}` field and exits with code 1 after one failed ...
- **Type:** Functional
- **Description:** E2E test with server that disconnects mid-session
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-046] [7_UI_UX_DESIGN-REQ-393]** `devs-mcp-bridge` binary has no `tonic` or `devs-proto` in its dependency tree
- **Type:** Functional
- **Description:** Verified by `cargo tree -p devs-mcp-bridge --edges normal | grep tonic` returns empty
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-047] [7_UI_UX_DESIGN-REQ-394]** Bridge forwards `stream_logs follow:true` chunks line-by-line without bufferi...
- **Type:** Functional
- **Description:** E2E test: assert first chunk arrives within 500ms of server sending it
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-048] [7_UI_UX_DESIGN-REQ-395]** `compute_dag_tiers` correctly assigns tier 0 to all root stages, tier 1 to st...
- **Type:** Functional
- **Description:** Unit test with linear 3-stage DAG: assert `[["plan"], ["implement"], ["review"]]`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-049] [7_UI_UX_DESIGN-REQ-396]** `compute_dag_tiers` for parallel DAG `plan→{impl-api, impl-ui}→review`: asser...
- **Type:** Functional
- **Description:** `compute_dag_tiers` for parallel DAG `plan→{impl-api, impl-ui}→review`: assert `[["plan"], ["impl-api", "impl-ui"], ["review"]]` (alphabetical within tier)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-050] [7_UI_UX_DESIGN-REQ-397]** `LogBuffer` evicts oldest line (index 0) when at capacity 10,000
- **Type:** Functional
- **Description:** `truncated` becomes `true` after first eviction. Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-051] [7_UI_UX_DESIGN-REQ-398]** `LogBuffer` for a running run is NEVER evicted by `Tick` event, regardless of...
- **Type:** Functional
- **Description:** Unit test: set run as `Running`, trigger 100 Tick events, assert buffer still present
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-052] [7_UI_UX_DESIGN-REQ-399]** ANSI stripping: `strip_ansi("\x1b[31mHello\x1b[0m World")` returns `"Hello Wo...
- **Type:** Functional
- **Description:** Unit test with at least 5 different ANSI sequences
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-053] [7_UI_UX_DESIGN-REQ-400]** `strip_ansi` on a string with no ANSI sequences returns the string unchanged
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-054] [7_UI_UX_DESIGN-REQ-401]** `AppState::test_default()` is not callable from production binary code
- **Type:** Functional
- **Description:** `#[cfg(test)]` gate enforced by `cargo build --release` succeeding while removing the function
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-055] [7_UI_UX_DESIGN-REQ-402]** No ANSI escape sequences appear in TUI snapshot files (`*.txt` in `tests/snap...
- **Type:** Functional
- **Description:** CI lint test: `grep -r '\x1b\[' crates/devs-tui/tests/snapshots/` returns empty
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-056] [7_UI_UX_DESIGN-REQ-403]** All user-visible strings in `devs-tui` originate from `strings.rs` constants
- **Type:** Functional
- **Description:** CI lint scans for inline string literals matching error prefix patterns outside `strings.rs`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-057] [7_UI_UX_DESIGN-REQ-404]** TUI terminal is restored (raw mode off, cursor shown, alternate screen off) o...
- **Type:** Functional
- **Description:** E2E test: spawn TUI, trigger panic, assert terminal is in normal mode afterward
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-058] [7_UI_UX_DESIGN-REQ-405]** TUI functions correctly on Windows Git Bash (crossterm Windows Console API)
- **Type:** Functional
- **Description:** CI matrix includes `presubmit-windows` job
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-059] [7_UI_UX_DESIGN-REQ-406]** All paths in CLI JSON output use forward-slash separators on all platforms
- **Type:** Functional
- **Description:** E2E CLI test on Windows
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-7-060] [7_UI_UX_DESIGN-REQ-407]** `devs-tui` does not reference `devs_proto` types in `state.rs` or any file un...
- **Type:** Functional
- **Description:** `cargo grep 'devs_proto' crates/devs-tui/src/state.rs` returns empty
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### ** [7_UI_UX_DESIGN-REQ-408]** `) carry the same weight as any other `[UI-DES-*]` requirement in this document
- **Type:** Functional
- **Description:** `) carry the same weight as any other `[UI-DES-*]` requirement in this document
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-074] [7_UI_UX_DESIGN-REQ-409]** Complete normative set of ASCII characters permitted in structural positions
- **Type:** Functional
- **Description:** Any character not in this table is prohibited in structural positions unless explicitly added by a future revision of this appendix
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-075] [7_UI_UX_DESIGN-REQ-410]** Characters explicitly
- **Type:** Functional
- **Description:** prohibited** in structural positions:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-001] [7_UI_UX_DESIGN-REQ-411]** `strip_ansi` MUST be implemented as a byte-level 3-state machine
- **Type:** Functional
- **Description:** Regex-based stripping is prohibited because it may introduce quadratic performance on adversarial input
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-002] [7_UI_UX_DESIGN-REQ-412]** `strip_ansi` MUST strip CSI sequences (ESC + `[` + parameter bytes + final byte)
- **Type:** Functional
- **Description:** It explicitly does NOT strip OSC, DCS, PM, APC, or SOS sequences; this is an accepted limitation. Any ESC byte not followed by `[` is passed through as-is
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-003] [7_UI_UX_DESIGN-REQ-413]** The output of `strip_ansi` on a valid UTF-8 input MUST be valid UTF-8
- **Type:** Functional
- **Description:** Because CSI sequences consist entirely of ASCII bytes, removing them cannot create invalid UTF-8 sequences at multi-byte boundaries
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-004] [7_UI_UX_DESIGN-REQ-414]** The `String::from_utf8` unwrap in the reference implementation is expected to...
- **Type:** Functional
- **Description:** The `String::from_utf8` unwrap in the reference implementation is expected to never fail; the `unwrap_or_else` fallback is a defensive measure only and MUST be covered by a unit test that confirms it is never triggered on well-formed agent output
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-005] [7_UI_UX_DESIGN-REQ-415]** `strip_ansi` MUST NOT be called inside `render()`
- **Type:** Functional
- **Description:** Stripping happens once at ingest; widgets use the pre-stripped `content` field
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[a-z0-9_-] [7_UI_UX_DESIGN-REQ-004]** +` with a maximum of 128 bytes
- **Type:** Functional
- **Description:** For display in a stage box, names are truncated to a maximum of 20 display columns. The canonical implementation is `render_utils::truncate_with_tilde(s: &str, max_display_cols: usize) -> String`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-006] [a-z0-9_-] [7_UI_UX_DESIGN-REQ-416]** +` by the time they reach the display layer
- **Type:** Functional
- **Description:** If a name that violates this pattern somehow reaches `truncate_with_tilde`, each non-matching byte is replaced with `?` (U+003F) before truncation
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-007] [a-z0-9_-] [7_UI_UX_DESIGN-REQ-417]** `), byte count equals display column count for this input domain
- **Type:** Functional
- **Description:** `truncate_with_tilde` MAY use `len()` directly and MUST NOT rely on a `unicode_width` crate for stage name truncation
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-008] [7_UI_UX_DESIGN-REQ-418]** Fan-out display suffix MUST be `(xN)` (ASCII) not `(×N)` (Unicode)
- **Type:** Functional
- **Description:** The full stage name including suffix is passed to `truncate_with_tilde` so truncation always yields exactly `max_display_cols` characters
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[a-z0-9_-] [7_UI_UX_DESIGN-REQ-005]** ` characters
- **Type:** Functional
- **Description:** This validation excludes all wide characters (CJK, emoji, etc.) before they reach the display layer
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-009] [7_UI_UX_DESIGN-REQ-419]** Log line content rendered in TUI MUST be the `stripped` (ANSI-removed) string...
- **Type:** Functional
- **Description:** Wide characters in log content are permitted to appear in the `LogPane` display area, as this area uses flexible wrapping rather than fixed-column layout. If a wide character would cause misalignment in a fixed-width column (e.g., the `StageList`), it MUST be replaced with `??` (two ASCII question marks) to maintain column count
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-010] [7_UI_UX_DESIGN-REQ-420]** The fixed-width structural areas — stage boxes, DAG arrows, StatusBar, tab la...
- **Type:** Functional
- **Description:** Any code path that writes to these areas MUST NOT pass wide characters
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-011] [7_UI_UX_DESIGN-REQ-421]** Before storage in `LogBuffer`, each log line MUST undergo the following sanit...
- **Type:** Functional
- **Description:** Before storage in `LogBuffer`, each log line MUST undergo the following sanitisation steps, applied in order:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-012] [7_UI_UX_DESIGN-REQ-422]** Tab characters `\t` (U+0009) MUST be expanded to spaces, advancing to the nex...
- **Type:** Functional
- **Description:** This ensures consistent column rendering regardless of terminal tab-stop configuration
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-013] [7_UI_UX_DESIGN-REQ-423]** Every byte emitted by `DagView::render()` in a structural cell MUST have a co...
- **Type:** Functional
- **Description:** Verified by iterating over all rendered buffer cells in test mode and asserting cell symbol is single ASCII char
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-014] [7_UI_UX_DESIGN-REQ-424]** Every 4-char status label returned by `stage_status_label()` and `run_status_...
- **Type:** Functional
- **Description:** Verified by compile-time assertion on each `&'static str` constant in `strings.rs`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-015] [7_UI_UX_DESIGN-REQ-425]** No ANSI escape sequence (byte 0x1B followed by any byte) MUST appear in any `...
- **Type:** Functional
- **Description:** CI lint test: `grep -rP '\x1b' crates/devs-tui/tests/snapshots/` MUST return empty
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-016] [7_UI_UX_DESIGN-REQ-426]** No Unicode box-drawing character (U+2500–U+257F) MUST appear in any `*.txt` s...
- **Type:** Functional
- **Description:** CI lint test: `grep -rP '[\x{2500}-\x{257F}]' crates/devs-tui/tests/snapshots/` MUST return empty
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-017] [7_UI_UX_DESIGN-REQ-427]** `strip_ansi` MUST be idempotent: `strip_ansi(strip_ansi(s)) == strip_ansi(s)`...
- **Type:** Functional
- **Description:** Verified by property-based test (or exhaustive test over representative set)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-018] [7_UI_UX_DESIGN-REQ-428]** `strip_ansi` MUST NOT panic on any byte sequence, including lone ESC bytes, i...
- **Type:** Functional
- **Description:** Verified by fuzz test or a comprehensive set of adversarial unit tests
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-019] [7_UI_UX_DESIGN-REQ-429]** `truncate_with_tilde(s, 20)` MUST return a string of byte-length exactly `min...
- **Type:** Functional
- **Description:** Verified by unit test across boundary values (0, 1, 19, 20, 21, 128 char inputs)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-020] [7_UI_UX_DESIGN-REQ-430]** The fan-out display suffix MUST use lowercase ASCII `x` (U+0078) not multipli...
- **Type:** Functional
- **Description:** Verified by unit test: `truncate_with_tilde("stage(x4)", 20)` MUST equal `"stage(x4)"`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-021] [7_UI_UX_DESIGN-REQ-431]** The elapsed placeholder for unstarted stages MUST be exactly the 5-byte strin...
- **Type:** Functional
- **Description:** `format_elapsed(None)` MUST return exactly this string. Verified by unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-022] [7_UI_UX_DESIGN-REQ-432]** `format_elapsed(Some(ms))` for any `ms` value MUST return a string matching t...
- **Type:** Functional
- **Description:** Verified by unit test with values 0, 59_999, 60_000, 3_599_999, 3_600_000, u64::MAX
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-023] [7_UI_UX_DESIGN-REQ-433]** `NO_COLOR` environment variable set to any non-empty value MUST result in `Th...
- **Type:** Functional
- **Description:** Under monochrome mode, no ANSI SGR codes (ESC `[` digits `m`) MUST be written to the terminal backend. Verified by TUI unit test with `TestBackend` in monochrome mode: assert no cell's style has non-default fg/bg colors
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-024] [7_UI_UX_DESIGN-REQ-434]** The HelpOverlay MUST use `+` (U+002B) for all four corners
- **Type:** Functional
- **Description:** The corner character is defined as the constant `strings::OVERLAY_CORNER = "+"`. Verified by snapshot test `help_overlay__visible`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-ASCII-BR-025] [7_UI_UX_DESIGN-REQ-435]** All five characters used in DAG arrows (`-`, `>`, `|`, `+`, ` `) MUST be defi...
- **Type:** Functional
- **Description:** All five characters used in DAG arrows (`-`, `>`, `|`, `+`, ` `) MUST be defined as constants in `crates/devs-tui/src/strings.rs`:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[a-z0-9_-] [7_UI_UX_DESIGN-REQ-006]** ` at definition time |
- **Type:** Functional
- **Description:** ` at definition time |
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[a-z0-9_-] [7_UI_UX_DESIGN-REQ-007]** +`
- **Type:** Functional
- **Description:** If it reaches `truncate_with_tilde("", 20)`, the function MUST return `""` without panic. The stage box renders the name field as 20 spaces
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-001] [7_UI_UX_DESIGN-REQ-166]** `strip_ansi("\x1b[31mHello\x1b[0m World")` returns `"Hello World"`
- **Type:** Functional
- **Description:** Unit test in `render_utils.rs`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-002] [7_UI_UX_DESIGN-REQ-167]** `strip_ansi("\x1b[1;32;4mBold Green Underline\x1b[0m")` returns `"Bold Green ...
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-003] [7_UI_UX_DESIGN-REQ-168]** `strip_ansi("No escapes here")` returns `"No escapes here"` unchanged
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-004] [7_UI_UX_DESIGN-REQ-169]** `strip_ansi("Hello\x1b[")` (incomplete CSI at EOF) returns `"Hello"`
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-005] [7_UI_UX_DESIGN-REQ-170]** `strip_ansi("\x1b7text")` (non-CSI escape) returns `"\x1b7text"` (ESC-7 passe...
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-006] [7_UI_UX_DESIGN-REQ-171]** `strip_ansi("\x1b[" + "1;" * 10_000 + "m")` returns `""` and completes within...
- **Type:** Functional
- **Description:** Performance unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-007] [7_UI_UX_DESIGN-REQ-172]** `strip_ansi(strip_ansi(s)) == strip_ansi(s)` for 100 varied inputs including ...
- **Type:** Functional
- **Description:** Unit test (parameterised)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-008] [7_UI_UX_DESIGN-REQ-173]** `truncate_with_tilde("abcdefghijklmnopqrstu", 20)` returns `"abcdefghijklmnop...
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-009] [7_UI_UX_DESIGN-REQ-174]** `truncate_with_tilde("short", 20)` returns `"short"` (unchanged, no padding a...
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-010] [7_UI_UX_DESIGN-REQ-175]** `truncate_with_tilde("exactly-20-chars-str", 20)` returns `"exactly-20-chars-...
- **Type:** Functional
- **Description:** Unit test (string is exactly 20 chars)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-011] [7_UI_UX_DESIGN-REQ-176]** `format_elapsed(None)` returns exactly `"--:--"` (5 bytes)
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-012] [7_UI_UX_DESIGN-REQ-177]** `format_elapsed(Some(0))` returns `"0:00"`
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-013] [7_UI_UX_DESIGN-REQ-178]** `format_elapsed(Some(59_999))` returns `"0:59"`
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-014] [7_UI_UX_DESIGN-REQ-179]** `format_elapsed(Some(60_000))` returns `"1:00"`
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-015] [7_UI_UX_DESIGN-REQ-180]** `format_elapsed(Some(600_000_000))` returns `"10000:00"` (no truncation appli...
- **Type:** Functional
- **Description:** Unit test
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-016] [7_UI_UX_DESIGN-REQ-181]** Every `STATUS_*` constant in `crates/devs-tui/src/strings.rs` is exactly 4 bytes
- **Type:** Functional
- **Description:** Compile-time `const` assertion for each constant
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-017] [7_UI_UX_DESIGN-REQ-182]** `stage_status_label` returns exactly one of `{"PEND","WAIT","ELIG","RUN ","PA...
- **Type:** Functional
- **Description:** Unit test: exhaustive match across all variants using `strum` or manual enumeration
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-018] [7_UI_UX_DESIGN-REQ-183]** No byte in U+0080–U+FFFF appears in any constant in `crates/devs-tui/src/stri...
- **Type:** Functional
- **Description:** CI lint: `grep -P '[^\x00-\x7F]' crates/devs-tui/src/strings.rs` exits non-zero if match found
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-019] [7_UI_UX_DESIGN-REQ-184]** No ANSI escape sequence (U+001B followed by any byte) appears in any `.txt` s...
- **Type:** Functional
- **Description:** CI lint: `grep -rP '\x1b' crates/devs-tui/tests/snapshots/` exits non-zero if match found
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-020] [7_UI_UX_DESIGN-REQ-185]** No Unicode box-drawing character (U+2500–U+257F) appears in any `.txt` snapsh...
- **Type:** Functional
- **Description:** CI lint: `grep -rP '[\x{2500}-\x{257F}]' crates/devs-tui/tests/snapshots/` exits non-zero if match found
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-021] [7_UI_UX_DESIGN-REQ-186]** `LogBuffer::push()` with a line containing `"\r\n"` stores the content withou...
- **Type:** Functional
- **Description:** Unit test: push `"text\r\n"`, assert stored `content == "text"`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-022] [7_UI_UX_DESIGN-REQ-187]** `LogBuffer::push()` with a line containing NUL bytes stores the line with NUL...
- **Type:** Functional
- **Description:** Unit test: push `"ab\0cd"`, assert stored `content == "ab\u{FFFD}cd"`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-023] [7_UI_UX_DESIGN-REQ-188]** `LogBuffer::push()` with a line containing a tab character expands it to spac...
- **Type:** Functional
- **Description:** Unit test: push `"ab\tcd"`, assert stored `content == "ab      cd"` (6 spaces to reach column 8)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-024] [7_UI_UX_DESIGN-REQ-189]** `DagView` rendered output (via `TestBackend`) for a 3-stage linear DAG contai...
- **Type:** Functional
- **Description:** Unit test: iterate all cells in rendered buffer, assert each is a single-byte ASCII char
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-025] [7_UI_UX_DESIGN-REQ-190]** Fan-out stage box uses `(xN)` suffix with ASCII `x` (U+0078), not `×` (U+00D7)
- **Type:** Functional
- **Description:** Unit test: render a fan-out stage, assert rendered string contains `"(x"` not `"(×"`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-026] [7_UI_UX_DESIGN-REQ-191]** `NO_COLOR=1` causes `Theme::from_env()` to return `ColorMode::Monochrome`
- **Type:** Functional
- **Description:** TUI unit test: set env, call `from_env()`, assert `Monochrome`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-027] [7_UI_UX_DESIGN-REQ-192]** Under `ColorMode::Monochrome`, no rendered cell in `TestBackend` has a foregr...
- **Type:** Functional
- **Description:** TUI unit test with representative `AppState`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-ASCII-028] [7_UI_UX_DESIGN-REQ-193]** DAG arrow constants `DAG_H`, `DAG_ARROW`, `DAG_V`, `DAG_JUNCTION`, `DAG_EMPTY...
- **Type:** Functional
- **Description:** Compile-time assertion for each
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-PHI-001] [UI-DES-PHI-024] [7_UI_UX_DESIGN-REQ-436]** and is cross-referenced to the relevant requirement identifiers throughout
- **Type:** Functional
- **Description:** and is cross-referenced to the relevant requirement identifiers throughout
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-076] [7_UI_UX_DESIGN-REQ-437]** All `pub const` entries in each crate's `strings.rs` follow the prefix naming...
- **Type:** Functional
- **Description:** Every `pub const` item in `strings.rs` MUST carry a doc comment (`///`) explaining the constant's purpose and the context in which it is rendered. This is enforced by `missing_docs = "deny"` in the workspace lint table (see TAS §2.2), which causes `cargo doc --no-deps` to fail on any undocumented public item
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-010] [7_UI_UX_DESIGN-REQ-438]** No crate's `strings.rs` may re-export or import constants from another crate'...
- **Type:** Functional
- **Description:** Each crate defines all string tokens it requires independently. If two crates share a logically identical error message, each defines its own constant with an identical value — no cross-crate `pub use` is permitted
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-011] [7_UI_UX_DESIGN-REQ-439]** `strings.rs` MUST NOT contain any function, struct, enum, trait, or `use` sta...
- **Type:** Functional
- **Description:** All business logic involving strings — such as formatting elapsed time or truncating stage names — belongs in `render_utils.rs`, not `strings.rs`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-076] [7_UI_UX_DESIGN-REQ-440]** (normative table):
- **Type:** Functional
- **Description:** (normative table):
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-012] [7_UI_UX_DESIGN-REQ-441]** No prefix other than the twelve listed above MUST appear at the start of a `p...
- **Type:** Functional
- **Description:** A constant whose subject does not fit one of the twelve categories is an indicator that either the constant does not belong in `strings.rs`, or the taxonomy must be formally extended by a spec amendment. An undocumented prefix causes `./do lint` to fail via the strings hygiene check (§B.6)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-013] [7_UI_UX_DESIGN-REQ-442]** Prefixes are case-sensitive and SCREAMING_SNAKE_CASE
- **Type:** Functional
- **Description:** `Err_` or `err_` are not valid alternatives to `ERR_`. The prefix MUST be a contiguous string of uppercase ASCII letters followed by an underscore; no digit may appear in the prefix itself (digits may appear in the suffix after the prefix)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-014] [7_UI_UX_DESIGN-REQ-443]** Naming rules for each prefix category:
- **Type:** Functional
- **Description:** Naming rules for each prefix category:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-015] [7_UI_UX_DESIGN-REQ-444]** Value constraints table:
- **Type:** Functional
- **Description:** Value constraints table:
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[a-z] [a-z0-9-] [7_UI_UX_DESIGN-REQ-008]** ` | Unit test + Clap registration verification | Test failure |
- **Type:** Functional
- **Description:** ` | Unit test + Clap registration verification | Test failure |
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[a-z] [a-z0-9-] [7_UI_UX_DESIGN-REQ-009]** ` | Unit test + Clap registration verification | Test failure |
- **Type:** Functional
- **Description:** ` | Unit test + Clap registration verification | Test failure |
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-016] [7_UI_UX_DESIGN-REQ-445]** `MSG_` constants that include dimensional placeholders MUST use `%W` for widt...
- **Type:** Functional
- **Description:** No other substitution mechanism is used in `MSG_` constants at MVP
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-017] [7_UI_UX_DESIGN-REQ-446]** `render_utils::stage_status_label(StageStatus) -> &'static str` returns the a...
- **Type:** Functional
- **Description:** `render_utils::run_status_label(RunStatus) -> &'static str` returns the appropriate `RUN_STATUS_*` constant. Neither function returns any string not defined in `strings.rs`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-018] [7_UI_UX_DESIGN-REQ-447]** CLI error constants that include a `{}` placeholder use Rust `format!("{}", E...
- **Type:** Functional
- **Description:** The placeholder is part of the constant value. Only `{}` (positional, no named fields) is permitted in `ERR_` constants
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-019] [7_UI_UX_DESIGN-REQ-448]** Every `const _: () = assert!(...)` block MUST include a human-readable messag...
- **Type:** Functional
- **Description:** This message is printed by `rustc` in the compile error, enabling developers to immediately identify the violated constraint without reading the assertion code
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-077] [7_UI_UX_DESIGN-REQ-449]** The strings hygiene check is a mandatory step in `./do lint`, executed after ...
- **Type:** Functional
- **Description:** It runs unconditionally on every invocation and produces output on stderr when violations are found
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-020] [7_UI_UX_DESIGN-REQ-450]** Both phases MUST run on every invocation of `./do lint`
- **Type:** Functional
- **Description:** Neither phase may be skipped by environment variable or flag. The phases are independent; a failure in Phase 1 does not skip Phase 2
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-010] [7_UI_UX_DESIGN-REQ-451]** (restated for emphasis): No `strings.rs` module may `use` or `pub use` consta...
- **Type:** Functional
- **Description:** Each crate defines the string tokens it requires independently. If `devs-tui` and `devs-cli` both need a column header with the same text, they each define their own `COL_WORKFLOW` constant with the same value. This duplication is intentional and ensures that the two crates can evolve their display strings independently
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-021] [7_UI_UX_DESIGN-REQ-452]** No `strings.rs` module may depend on `devs-core`, `devs-proto`, or any crate ...
- **Type:** Functional
- **Description:** The module MUST compile in isolation with no imports beyond the Rust standard library. Violations are detected by `cargo tree -p devs-tui --edges normal` in the `./do lint` dependency audit
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-022] [7_UI_UX_DESIGN-REQ-453]** `strings.rs` MUST be a flat module with no submodules
- **Type:** Functional
- **Description:** All constants are defined at the top level of the file. This rule ensures that the Phase 2 scan pattern (`pub const <PREFIX>`) reliably matches all constants
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-023] [7_UI_UX_DESIGN-REQ-454]** String constants that are single ASCII characters (e.g., `"["`, `"|"`) used p...
- **Type:** Functional
- **Description:** The exemption applies only when: (a) the character is a single byte, (b) it is used only for visual framing and never appears in log output or machine-readable output, and (c) its meaning is obvious from context. DAG structural characters (`"-"`, `">"`, etc.) are NOT exempt — they MUST be defined as `DAG_*` constants because they appear in snapshot tests and are subject to the ASCII inventory constraint (Appendix A)
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[UI-DES-STR-024] [7_UI_UX_DESIGN-REQ-455]** A unit test in each `strings.rs` module asserts that all `ERR_` constants def...
- **Type:** Functional
- **Description:** The test iterates over a hardcoded list of all `ERR_` constants defined in that module and asserts the prefix. This test MUST be updated whenever a new `ERR_` constant is added
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-001] [7_UI_UX_DESIGN-REQ-456]** `cargo build --workspace` succeeds when all `STATUS_*` constants are exactly ...
- **Type:** Functional
- **Description:** A build that changes any `STATUS_*` value to a non-4-byte string fails at compile time with a message containing the constant name. Unit test: modify `STATUS_PEND` to `"PEND_"` (5 bytes) and confirm `cargo build -p devs-tui` fails with `STATUS_PEND must be 4 bytes` in stderr
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-002] [7_UI_UX_DESIGN-REQ-457]** `cargo build --workspace` succeeds when all `DAG_*` constants are exactly 1 byte
- **Type:** Functional
- **Description:** A build that changes any `DAG_*` value to a 2-byte string fails at compile time. Unit test: modify `DAG_H` to `"--"` and confirm `cargo build -p devs-tui` fails with `DAG_H must be 1 byte`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-003] [7_UI_UX_DESIGN-REQ-458]** `cargo test -p devs-tui -- status_labels_are_exactly_four_bytes` exits 0 unde...
- **Type:** Functional
- **Description:** Covers: `UI-DES-PHI-002`, `UI-DES-STR-015`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-004] [7_UI_UX_DESIGN-REQ-459]** `cargo test -p devs-tui -- err_constants_begin_with_machine_stable_prefix` ex...
- **Type:** Functional
- **Description:** `cargo test -p devs-cli -- err_constants_begin_with_machine_stable_prefix` exits 0. `cargo test -p devs-mcp-bridge -- err_constants_begin_with_machine_stable_prefix` exits 0. Covers: `UI-DES-PHI-003`, `UI-DES-STR-024`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-005] [7_UI_UX_DESIGN-REQ-460]** `./do lint` exits non-zero when a `.rs` file outside `strings.rs` in any of t...
- **Type:** Functional
- **Description:** The violation file path and line number are printed to stderr. A file that contains only `strings::ERR_RUN_NOT_FOUND` (i.e., references the constant, not the literal) does NOT trigger a violation. Covers: `UI-DES-PHI-003`, `UI-DES-PHI-022`, `UI-DES-077`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-006] [7_UI_UX_DESIGN-REQ-461]** `cargo test -p devs-tui -- dag_constants_are_exactly_one_byte` exits 0
- **Type:** Functional
- **Description:** Covers: `UI-DES-STR-015`, `UI-ASCII-BR-025`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-007] [7_UI_UX_DESIGN-REQ-462]** `./do lint` exits non-zero when `devs-tui/src/strings.rs` contains a `pub con...
- **Type:** Functional
- **Description:** The unrecognized constant name is printed to stderr. Covers: `UI-DES-STR-012`, `UI-DES-STR-020`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-008] [7_UI_UX_DESIGN-REQ-463]** `./do lint` exits non-zero when `devs-mcp-bridge/src/strings.rs` contains a `...
- **Type:** Functional
- **Description:** Covers: `UI-DES-STR-010`, per-crate permitted prefix table in §B.1
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-009] [7_UI_UX_DESIGN-REQ-464]** `cargo doc --no-deps 2>&1 | grep -c "^warning"` returns `0` after building th...
- **Type:** Functional
- **Description:** Every `pub const` in every `strings.rs` has a `///` doc comment. Covers: `UI-DES-076`, `UI-DES-PHI-024`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-010] [7_UI_UX_DESIGN-REQ-465]** All twelve mandatory constants for `devs-tui/src/strings.rs` listed in §B.5.1...
- **Type:** Functional
- **Description:** A unit test in `devs-tui` asserts each value by name. Covers: `UI-DES-STR-015`, `UI-DES-076`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-011] [7_UI_UX_DESIGN-REQ-466]** All mandatory `CMD_*` constants in `devs-cli/src/strings.rs` listed in §B.5.2...
- **Type:** Functional
- **Description:** A unit test in `devs-cli` asserts this by iterating the Clap `Command` tree and verifying each subcommand name appears in the constant set. Covers: `UI-DES-STR-014`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-012] [7_UI_UX_DESIGN-REQ-467]** `STATUS_RUN_` has value `"RUN "` (with trailing space)
- **Type:** Functional
- **Description:** `render_utils::stage_status_label(StageStatus::Running)` returns `"RUN "`. The trailing space is preserved in all rendered stage boxes to maintain the 4-character fixed width. Covers: `UI-DES-STR-017`, `UI-DES-PHI-002`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-013] [7_UI_UX_DESIGN-REQ-468]** No byte value in U+0080–U+FFFF appears in any constant in any `strings.rs` mo...
- **Type:** Functional
- **Description:** CI lint: `grep -P '[^\x00-\x7F]' crates/devs-tui/src/strings.rs crates/devs-cli/src/strings.rs crates/devs-mcp-bridge/src/strings.rs` exits non-zero (no match). Covers: `UI-ASCII-BR-018`, `UI-DES-STR-015`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-014] [7_UI_UX_DESIGN-REQ-469]** `render_utils::stage_status_label(s)` returns a value that is the `STATUS_*` ...
- **Type:** Functional
- **Description:** Verified by asserting `std::ptr::eq(render_utils::stage_status_label(StageStatus::Running), STATUS_RUN_)` — pointer equality proves the return is the static constant, not a newly allocated string. Covers: `UI-DES-STR-017`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[AC-STR-015] [7_UI_UX_DESIGN-REQ-470]** `MSG_TERMINAL_TOO_SMALL` contains the substring `"80x24"`, `"%W"`, and `"%H"`
- **Type:** Functional
- **Description:** `render_utils::expand_msg_placeholders(MSG_TERMINAL_TOO_SMALL, 75, 20)` returns a string containing `"75"` and `"20"` and not `"%W"` or `"%H"`. Covers: `UI-DES-STR-016`
- **Source:** UI/UX Design (docs/plan/specs/7_ui_ux_design.md)
- **Dependencies:** None

