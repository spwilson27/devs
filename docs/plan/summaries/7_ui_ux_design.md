# Summary: UI/UX Design System (`devs`)

**Document ID:** 7_UI_UX_DESIGN | **Source:** `docs/plan/specs/7_ui_ux_design.md`

Defines the complete visual language, interaction model, and design token system for three surfaces: `devs-tui` (ratatui 0.28 + crossterm 0.28 full-screen TUI), `devs-cli` (line-oriented text/JSON output), and `devs-mcp-bridge` (JSON-RPC stdio proxy). All rendering is character-cell-based; no GUI, no web renderer.

---

## 1. Core Design Principles

- **[UI-DES-001]** Clarity over decoration — every visual element communicates state or structure; decorative characters prohibited.
- **[UI-DES-002]** ASCII-first: all structural rendering uses U+0020–U+007E only. Unicode box-drawing (`─│┌`), block elements (`█▓`), emoji **prohibited** in structural positions.
- **[UI-DES-003]** Color is additive, never load-bearing — interface fully operable with `NO_COLOR` set.
- **[UI-DES-004]** Fixed, non-configurable dashboard layout at MVP; deterministic sizing rules.
- **[UI-DES-005]** All CLI commands expose `--format json` with stable, versioned schemas; error prefixes are machine-stable.
- **[UI-DES-006]** Elapsed times: `M:SS` format (zero-padded seconds). Timestamps: RFC 3339, millisecond precision, `Z` suffix.
- **[UI-DES-008]** Minimum terminal: **80 columns × 24 rows**. Below this, only a size warning renders.
- **[UI-DES-010]** English-only at MVP. All strings in `pub const &'static str` in `strings.rs` per crate.

---

## 2. Design Token System (`strings.rs`)

**[UI-DES-PHI-001]** Every user-visible string MUST be `pub const &'static str` in `strings.rs`. No inline literals in `render()`, handlers, or formatters. Enforced by strings hygiene lint in `./do lint`.

**Naming prefix taxonomy:**

| Prefix | Scope | Example |
|---|---|---|
| `STATUS_` | 4-char stage/run status labels | `STATUS_RUN_`, `STATUS_DONE` |
| `ERR_` | Error msgs (machine-stable prefix required) | `ERR_NOT_FOUND` |
| `TAB_` | Tab bar labels | `TAB_DASHBOARD` |
| `KEY_` | Keybinding chars shown in help | `KEY_CANCEL` |
| `HELP_` | Help overlay text | `HELP_CANCEL` |
| `COL_` | CLI/TUI column headers | `COL_RUN_ID` |
| `STATUS_BAR_` | Status bar labels | `STATUS_BAR_CONNECTED` |
| `CMD_` | CLI subcommand names | `CMD_SUBMIT` |
| `ARG_` | CLI argument/flag names | `ARG_FORMAT` |
| `FMT_` | Format specifier strings | `FMT_JSON` |
| `MSG_` | Informational messages | `MSG_TOO_SMALL` |
| `DAG_` | Single-char structural DAG chars (1 byte each) | `DAG_H="-"`, `DAG_ARROW=">"` |

**[UI-DES-PHI-002]** All `STATUS_*` stage labels: exactly **4 bytes** of ASCII. Enforced by compile-time `const` assertions AND unit test `status_labels_are_exactly_four_bytes`.

Stage status constants:
```
STATUS_PEND="PEND"  STATUS_WAIT="WAIT"  STATUS_ELIG="ELIG"
STATUS_RUN_="RUN "  STATUS_PAUS="PAUS"  STATUS_DONE="DONE"
STATUS_FAIL="FAIL"  STATUS_TIME="TIME"  STATUS_CANC="CANC"
```

**[UI-DES-PHI-003]** All `ERR_` constants MUST begin with one of 10 machine-stable prefixes: `not_found:`, `invalid_argument:`, `already_exists:`, `failed_precondition:`, `resource_exhausted:`, `server_unreachable:`, `internal:`, `cancelled:`, `timeout:`, `permission_denied:`.

**[UI-DES-PHI-004]** `devs-mcp-bridge/src/strings.rs` contains only `ERR_` and `MSG_` constants. No visual constants.

**Per-crate permitted prefixes:**
- `devs-tui`: all 12 prefixes
- `devs-cli`: `ERR_`, `COL_`, `CMD_`, `ARG_`, `FMT_`, `MSG_`
- `devs-mcp-bridge`: `ERR_`, `MSG_` only

---

## 3. Surface-Specific Rules

### 3.1 TUI (`devs-tui`)

- **[UI-DES-PHI-005]** `render()` MUST complete within **16ms**. No I/O, syscalls, or proportional heap allocation inside render. All data pre-computed in `AppState`.
- **[UI-DES-PHI-006]** Input events: navigation (arrows, Tab, 1–4), action (`c`, `p`, `r`, `q`, `Esc`, `?`), control (`Ctrl+C`). Unrecognized keys silently consumed.
- **[UI-DES-PHI-007]** ANSI escape sequences stripped from agent log output before `LogBuffer` insertion. Raw content preserved in `LogLine::raw_content`; stripped in `LogLine::content`.
- **[UI-DES-PHI-008]** Below 80×24: render ONLY size warning, nothing else.

### 3.2 CLI (`devs-cli`)

- **[UI-DES-PHI-009]** `--format text`: aligned columns, widths from widest value, truncation with `...` (3 ASCII dots).
- **[UI-DES-PHI-010]** `--format json`: ALL output (including errors) to **stdout**. Nothing to stderr. Error format: `{"error":"<prefix>: <detail>","code":<int>}`.
- **[UI-DES-PHI-011]** No color in CLI output, either mode. No `NO_COLOR` read by CLI.
- **[UI-DES-PHI-012]** Streaming (`devs logs --follow`): no spinner, no progress bars, no ANSI. Sequential newline-delimited lines only.

### 3.3 MCP Bridge (`devs-mcp-bridge`)

- **[UI-DES-PHI-013]** Stdout only, never stderr. All output is newline-delimited JSON. Connection-loss message: `{"result":null,"error":"server_unreachable: connection to devs MCP server lost","fatal":true}`. The `"fatal":true` field distinguishes terminal from recoverable errors.
- **[UI-DES-PHI-014]** No response buffering. Each response flushed immediately.

---

## 4. `NO_COLOR` Detection

**[UI-DES-PHI-015–018]** `Theme::from_env()` is the **sole** location that reads `NO_COLOR`. Called exactly once during `App::new()`. Result stored immutably in `AppState`. Live changes after startup have no effect.

```rust
pub fn from_env() -> Self {
    let color_mode = match std::env::var("NO_COLOR") {
        Ok(val) if !val.is_empty() => ColorMode::Monochrome,
        _ => ColorMode::Color,
    };
    Theme { color_mode }
}
```

Edge cases: `NO_COLOR=""` → `ColorMode::Color`; `NO_COLOR=0` → `ColorMode::Monochrome` (non-empty string); `NO_COLOR=false` → `Monochrome`.

In `Monochrome` mode, only `BOLD` and `REVERSED` modifiers permitted. `ITALIC`, `UNDERLINED`, `BLINK`, `RAPID_BLINK`, `CROSSED_OUT`, `DIM` prohibited in both modes.

---

## 5. Color Palette & Theme Architecture

**[UI-DES-011]** `Theme` struct in `crates/devs-tui/src/theme.rs` with two modes (`ColorMode::Color`, `ColorMode::Monochrome`). All styling through semantic methods; no widget constructs `Style` directly.

**[UI-DES-THEME-002]** Only named 16-color variants: `Color::Green`, `Color::Red`, `Color::Yellow`, `Color::Cyan`, `Color::DarkGray`, `Color::White`, `Color::Black`, `Color::Reset`. RGB/indexed values prohibited.

**[UI-DES-THEME-001]** Every widget accepts `&Theme` in `render()`; widgets MUST NOT store or clone `Theme`.

### Stage Status Colors

| Status | Color mode fg | Modifier | Monochrome |
|---|---|---|---|
| `DONE` | `Color::Green` | `BOLD` | `BOLD` only |
| `FAIL` | `Color::Red` | `BOLD` | `BOLD` only |
| `TIME` | `Color::Red` | `BOLD` | `BOLD` only |
| `CANC` | `Color::DarkGray` | `BOLD` | `BOLD` only |
| `RUN ` | `Color::Yellow` | none | default |
| `PAUS` | `Color::Cyan` | none | default |
| `ELIG` | `Color::White` | none | default |
| `WAIT` | `Color::White` | none | default |
| `PEND` | `Color::White` | none | default |

**[UI-DES-THEME-004/006]** Exhaustive `match` on `StageStatus`/`RunStatus` — adding a variant without updating `theme.rs` causes compile error.

**[UI-DES-THEME-005]** Status style applied only to the 4-char `STAT` cell. Brackets, separators, name, elapsed use `Style::new()`.

### Selection & Focus

- **[UI-DES-017]** Selected rows: `Modifier::REVERSED` in both modes. `selected_row_style()` returns `Style::new().add_modifier(Modifier::REVERSED)`.
- **[UI-DES-THEME-008]** Style composition uses `Style::patch()` to merge base status style with selection overlay.
- **[UI-DES-THEME-009]** No border highlight or color change for pane focus at MVP.

### Tab Bar

- **[UI-DES-THEME-010/011]** Active tab: `BOLD + REVERSED` in both modes. Inactive: `Style::new()`. Tab labels separated by 2 spaces, no border.

### Log Streams

- `stdout` lines: `Style::new()` in both modes.
- `stderr` lines: `Color::Yellow` in Color mode; `Style::new()` in Monochrome.
- **[UI-DES-020]** `show_stream_prefix`: `LogTail` = `false`; `LogPane` = `true` (`[OUT] ` / `[ERR] `).

### Status Bar

| Status | Color | Modifier |
|---|---|---|
| `Connected` | `Color::Green` | `BOLD` |
| `Reconnecting` | `Color::Yellow` | none |
| `Disconnected` | `Color::Red` | `BOLD` |

### Help Overlay

- **[UI-DES-023]** Color: `Color::DarkGray` bg. Monochrome: `REVERSED` on entire block. Border: `+` corners, `-` horizontal, `|` vertical.

### Complete Theme API

`from_env()`, `stage_status_style(StageStatus)`, `run_status_style(RunStatus)`, `selected_row_style()`, `log_line_style(LogStream)`, `connection_status_style(&ConnectionStatus)`, `active_tab_style()`, `inactive_tab_style()`, `help_overlay_style()`, `default_text_style()`.

**[UI-DES-THEME-017]** `Theme` MUST NOT expose methods returning raw `Color`. All color decisions encapsulated in semantic methods.

---

## 6. Typography System

### Status Labels

- **[UI-DES-028/029]** Stage status labels: exactly 4 uppercase ASCII bytes. `stage_status_label(StageStatus) -> &'static str` in `render_utils.rs` with exhaustive match.
- **[UI-DES-030]** Run status labels: lowercase, no padding (`"pending"`, `"running"`, etc.).

### Fan-Out Display

- **[UI-DES-LABEL-002]** Fan-out suffix `(xN)` appended **before** `truncate_with_tilde`. Combined string subject to 20-char limit.
- **[UI-DES-LABEL-003]** Aggregation priority: Running > Paused > Failed/TimedOut > Cancelled > Completed > Eligible > Waiting > Pending.

### Elapsed Time

- **[UI-DES-031]** Always exactly **5 characters**: `M:SS` padded to 5 (right-pad with space for single-digit minutes), or `--:--` if not started.
- `format_elapsed(elapsed_ms: Option<u64>) -> String` in `render_utils.rs`.
- **[UI-DES-ELAPSED-001]** Overflow accepted for `m >= 100` (stages > ~100 min).
- **[UI-DES-ELAPSED-002/003]** Computed in `handle_event()` on `Tick`, NOT in `render()`. Terminal-state stages: fixed at completion.

### Name Truncation

- **[UI-DES-033]** `truncate_with_tilde(s, 20)`: names > 20 chars → first 19 + `~`; shorter → right-pad with spaces to 20.
- **[UI-DES-034]** CLI uses `truncate_with_ellipsis(s, max_len)`: `...` suffix (3 ASCII dots).

### ANSI Stripping

3-state machine: `Normal → Escape → Csi → Normal`. Implemented in `render_utils::strip_ansi(input: &str) -> String`.

```
Normal:  ESC byte → Escape (suppress); other → emit
Escape:  '[' → Csi (suppress); other → Normal (emit ESC + byte)
Csi:     0x40–0x7E final byte → Normal (suppress); other → Csi (suppress)
```

- **[UI-DES-ANSI-003]** `\r` and `\n` discarded in Normal state. Log lines split on `\n` before stripping.
- **[UI-DES-PHI-020]** Prefer `Cow<str>` return — no allocation if no ESC bytes.
- **[UI-DES-PHI-021]** `\r\n` → `\n`; standalone `\r` → removed. Applied after ANSI stripping.

### CLI Text Formatting

- **[UI-DES-CLI-001]** `--format json`: all output to stdout. Error: `{"error":"<prefix>: <detail>","code":<int>}`.
- **[UI-DES-CLI-002]** `--format text`: success to stdout, errors to stderr.
- **[UI-DES-CLI-003]** Columns separated by exactly **2 spaces**.
- **[UI-DES-CLI-004]** Text timestamps: `YYYY-MM-DD HH:MM:SS UTC`. JSON: RFC 3339 ms precision.

---

## 7. Layout & Grid Metrics

- **[UI-DES-035]** Grid unit: 1 terminal cell. All measurements in cells.
- **[UI-DES-039]** `TabBar`: 1 row top. `StatusBar`: 1 row bottom. Subtracted before pane splits.

### Dashboard Layout

- `RunList` width: `max(30% cols, 24)`
- `RunDetail` width: remainder
- `DagView` height: `max(40% rows, 8)`
- `LogTail` height: remainder

### Stage Box (39 columns total)

`[ <name:20> | <STAT:4> | <time:5> ]`
- `[`(1) + ` `(1) + name(20) + ` `(1) + `|`(1) + ` `(1) + status(4) + ` `(1) + `|`(1) + ` `(1) + elapsed(5) + ` `(1) + `]`(1) = **39 cols**

- **[UI-DES-042]** Tier gutter: 5 columns. `  --> ` (2 spaces + `-->` + 1 space).
- **[UI-DES-043]** DAG horizontal scroll: `dag_scroll_offset`, 1 column per keypress.

### Logs Tab Layout

- `StageSelector` width: `max(20% cols, 16)`
- `LogPane` width: remainder
- Stage entries: `  <name:18> <STAT>` (25 chars). Run slug headers are non-selectable.

### Debug Tab Layout

- `AgentSelector`: 1 row fixed
- `DiffView`: `max(60% remaining, 8)`
- `ControlPanel`: remainder (min 3 rows)

### Pools Tab Layout

- `PoolList` width: `max(25% cols, 20)`
- `AgentStatusGrid` width: remainder

### HelpOverlay Dimensions

- Width: `min(72, terminal_width - 4)`
- Height: `min(24, terminal_height - 4)`
- Position: centered (integer division)
- Border: `+` corners, `-` horizontal, `|` vertical
- Interior: key col (20) + 2-space separator + desc col

### Log Buffer

- **[UI-DES-046]** Capacity: **10,000 lines**. FIFO eviction. `truncated: bool` set after first eviction.
- Truncation notice: `[LOG TRUNCATED - showing most recent 10000 lines]` in `STYLE_SUBDUED`.

### Layout Data Models (in `crates/devs-tui/src/layout.rs`)

`PaneDimensions { x, y, width, height }`, `LayoutMode { TooSmall | Normal(LayoutState) }`, `DashboardLayout`, `LogsLayout`, `DebugLayout`, `PoolsLayout`, `HelpOverlayLayout`.

All layout computation uses **integer division**; no floating-point. All layout functions are pure, `#[must_use]`, no side effects.

**[UI-DES-056h]** Use `u16` arithmetic with checked subtraction; clamp to 0 on underflow.

### Scroll Bounds

| Pane | Max |
|---|---|
| `RunList` | `max(0, runs.len() - visible_rows)` |
| `DagView` (horizontal) | `max(0, total_dag_width - pane_width)` |
| `LogPane` | `max(0, buffer.len() - visible_rows)` |
| `DiffView` | `max(0, diff_lines - visible_rows)` |

`total_dag_width = (N × 39) + ((N-1) × 5)` where N = number of tiers.

Navigation never wraps. `LogTail` auto-scrolls to tail. `PgUp/PgDn`: `max(1, visible_rows - 1)` step.

---

## 8. Interactive States

### Event Loop

- **[UI-DES-053]** Event-driven, not fixed-rate. Render only on events: crossterm key/resize, server events (`RunSnapshot`, `RunDelta`, `LogLine`, `PoolSnapshot`, `PoolDelta`), `Tick` (1s), connection state changes.
- **[UI-DES-054]** No continuous animation. Render budget < 16ms.
- **[UI-DES-BR-001]** Single-threaded render loop. `tokio::task::spawn_blocking` prohibited from `render()`.
- **[UI-DES-BR-002]** Full channel buffer → oldest message dropped + `WARN` log.

Channel buffers: crossterm=256, run_events=256, pool_events=64, connection=32, tick=8. Tick interval: 1,000ms.

### Key Bindings (all single-key, no chords)

| Key | Context | Action |
|---|---|---|
| `Tab`/`1–4` | Any | Switch tab |
| `↑↓`/`kj` | Dashboard RunList/StageList | Navigate selection |
| `←→` | Dashboard DagView | Horizontal scroll |
| `Enter` | Dashboard RunList | Select run |
| `Esc` | Dashboard StageList | Back to RunList |
| `c` | Dashboard (run selected, non-terminal) | Cancel confirmation |
| `p`/`r` | Dashboard/Debug | Pause/resume |
| `?` | Any | Toggle HelpOverlay (modal) |
| `q`/`Ctrl+C` | Any | Quit (exit 0) |

- **[UI-DES-058a]** `Ctrl+C` quits from ANY context including prompts.
- **[UI-DES-058b]** `c` only actionable when `selected_run_id` is `Some` AND status is `Running`/`Paused`/`Pending`.
- **[UI-DES-059]** HelpOverlay is modal: all keys except `?`, `Esc`, `q`, `Ctrl+C` consumed.

### Cancel Confirmation Flow

State machine: `AwaitingInput → Submitting → Dismissed → None`.

Status bar replaced by: `Cancel run <slug>? [y/N]:`

- `y/Y`: spawns `CancelRun` gRPC, transitions to `Submitting`.
- `n/N/Esc/other`: immediate dismiss, no gRPC.
- **[UI-DES-060g]** If server event shows run already Cancelled during `AwaitingInput`, confirmation dismissed without gRPC call.
- **[UI-DES-060e]** `TuiEvent::ControlResult` carries result. On error: `StatusMessage` shown for 5s.

### Reconnection

Backoff schedule: 1→2→4→8→16→30s (cap). Budget: 30,000ms + 5,000ms grace = **35,000ms** total before `Disconnected` → exit 1.

On reconnect: `AppState::runs` and `run_details` fully replaced. `LogBuffer` entries **preserved**. Scroll offsets preserved (clamped). If `selected_run_id` no longer in snapshot → set to `None`.

Status bar during reconnect: `RECONNECTING...  <addr>  (retry N, <elapsed>s)`.

### Log Buffer Auto-Scroll

`LogTail` and `LogPane` auto-scroll when at tail. Manual scroll up freezes view. `AppState::log_tail_auto_scroll: bool` tracks state (toggled by manual nav, reset by `End`/`G`).

`LogBuffer::push()` evicts oldest when at 10,000 capacity. `log_scroll_offset` decremented by 1 on eviction to maintain visual position.

### HelpOverlay

`help_visible: bool` in `AppState`. Content defined as static `HELP_OVERLAY_CONTENT` in `strings.rs`. Background rendered with `ratatui::widgets::Clear`. Dismissed by tab switch.

---

## 9. Error Vocabulary & Exit Codes

| Prefix | Exit Code |
|---|---|
| `not_found:` | 2 |
| `invalid_argument:` | 4 |
| `already_exists:` | 4 |
| `failed_precondition:` | 1 |
| `resource_exhausted:` | 1 |
| `server_unreachable:` | 3 |
| `internal:` | 1 |
| `cancelled:` | 1 |
| `timeout:` | 1 |
| `permission_denied:` | 1 |

---

## 10. Data Models

### `AppState` Key Fields

```rust
active_tab: Tab,                            // Dashboard|Logs|Debug|Pools
help_visible: bool,
runs: Vec<RunSummary>,                      // sorted created_at desc
run_details: HashMap<Uuid, RunDetail>,
selected_run_id: Option<Uuid>,
selected_stage_name: Option<String>,
log_buffers: HashMap<(Uuid, String), LogBuffer>,
pool_state: Vec<PoolSummary>,
dag_scroll_offset: usize,
log_scroll_offset: HashMap<(Uuid, String), usize>,
connection_status: ConnectionStatus,
terminal_size: (u16, u16),
cancel_confirm_pending: bool,
```

**[UI-DES-082]** `dag_tiers: Vec<Vec<String>>` precomputed via Kahn's topological sort in `handle_event()`, never in `render()`. Within each tier: stages sorted alphabetically.

### `LogBuffer`

```rust
lines: VecDeque<LogLine>,   // max 10,000
total_received: u64,        // monotonically increasing
truncated: bool,
last_appended_at: Option<Instant>,
```

```rust
struct LogLine {
    sequence: u64,          // from server, starts at 1
    stream: LogStream,      // Stdout | Stderr
    content: String,        // ANSI-stripped
    raw_content: String,    // verbatim
    timestamp: DateTime<Utc>,
}
```

### `ConnectionStatus`

```rust
enum ConnectionStatus {
    Connected { server_addr: String },
    Reconnecting { server_addr: String, attempt: u32, next_retry_at: Instant, elapsed_ms: u64 },
    Disconnected { server_addr: String, reason: String },
}
```

---

## 11. CLI JSON Schemas

### `devs submit` success:
`{"run_id","slug","workflow_name","project_id","status":"pending"}`

### `devs list` success:
Array of `{"run_id","slug","workflow_name","project_id","status","created_at","started_at","completed_at"}`. No `stage_runs`. Empty → `[]`.

### `devs status` success:
Adds `"inputs"`, `"stage_runs":[{"stage_run_id","stage_name","attempt","status","agent_tool","pool_name","started_at","completed_at","exit_code"}]`.

### `devs logs` (non-streaming):
`{"run_id","stage_name","attempt","lines":[{"sequence","stream","line","timestamp"}],"truncated","total_lines"}`

### `devs logs --follow` (streaming, JSON):
Per-line: `{"sequence","stream","line","timestamp","done":false}`. Terminal: `{"done":true,"truncated","total_lines"}`.

### Error (all commands, JSON mode):
`{"error":"<prefix>: <detail>","code":<int>}` — to stdout, nothing to stderr.

---

## 12. MCP Bridge Interaction Model

- **[UI-DES-097b]** No TCP listener. Pure stdin→HTTP→stdout proxy.
- **[UI-DES-098a]** No semantic validation of `method`/`params`. Forwards JSON verbatim.
- **[UI-DES-098b]** `stream_logs follow:true`: HTTP chunked transfer → forward each chunk immediately, line-by-line.
- **[UI-DES-099a]** Connection loss → one reconnect attempt after 1s → on failure: `{"result":null,"error":"internal: server connection lost","fatal":true}` → exit 1.
- **[UI-DES-100a]** Sequential processing: one request at a time, no pipelining.

---

## 13. Design System Integrity Enforcement (`./do lint`)

**[UI-DES-PHI-022]** Strings hygiene check (after `cargo fmt --check`, `cargo clippy`):
```sh
grep -rn --include="*.rs" -E '"(not_found:|invalid_argument:|...)' crates/devs-*/src/ | grep -v '/strings\.rs:'
# Any match → exit 1
```

**[UI-DES-PHI-023]** Unit test `status_labels_are_exactly_four_bytes` for runtime coverage.

**[UI-DES-PHI-024]** `cargo doc --no-deps` must have zero warnings. `missing_docs = "deny"` enforced workspace-wide.

**[UI-DES-PHI-025]** Dependency audit: no direct Unicode rendering libs (`unicode-width`, `unicode-segmentation`, etc.) added to TUI/CLI/bridge beyond what ratatui transitively requires.

**[UI-DES-PHI-026]** Widget modules MUST NOT import tab modules. Dependency order: `tabs/ → widgets/ → render_utils.rs + strings.rs + theme.rs`.

**[UI-DES-THEME-021]** `devs-tui` MUST NOT depend on engine crates (`devs-scheduler`, `devs-pool`, `devs-executor`, `devs-adapters`, `devs-checkpoint`, `devs-checkpoint`, `devs-webhook`, `devs-grpc`, `devs-mcp`, `devs-config`, `devs-server`). Verified by `cargo tree`.

---

## 14. Snapshot Testing

- **[UI-DES-139]** `TestBackend` at **200×50**, always `ColorMode::Monochrome`. `insta 1.40`.
- **[UI-DES-140]** Snapshots in `crates/devs-tui/tests/snapshots/` as `.txt`. `INSTA_UPDATE=always` prohibited in CI.

Required snapshots: `dashboard__empty_state`, `dashboard__run_running`, `dashboard__dag_three_stages`, `dashboard__dag_parallel_stages`, `dashboard__dag_fan_out`, `dashboard__terminal_too_small`, `dashboard__reconnecting`, `dashboard__cancel_confirm`, `help_overlay__visible`, `logs__buffered`, `logs__truncated`, `logs__stderr_prefix`, `pools__normal`, `pools__rate_limited`, `pools__empty`, `debug__diff_view`, `status_bar__connected`, `status_bar__reconnecting`, `status_bar__disconnected`, `stage_list__all_statuses`.

---

## 15. Key Timing Constraints

| Constraint | Value |
|---|---|
| Max render time | < 16ms |
| Re-render latency after RunEvent | ≤ 50ms |
| Tick interval | 1,000ms |
| Reconnect total budget | 35,000ms |
| StatusMessage display duration | 5,000ms |
| Log buffer idle eviction | 1,800,000ms (30 min, terminal runs only) |
| stream_logs max lifetime | 1,800,000ms (30 min, server enforced) |

---

## 16. ASCII Character Inventory (Structural Positions)

Permitted structural characters: `[ ] | ( ) + - > : 0-9 A-Z a-z _ ~ . # / = ?`

Explicitly prohibited in structural positions: control chars (U+0000–U+001F), DEL (U+007F), Unicode box-drawing (U+2500–U+257F), block elements (U+2580–U+259F), emoji, CJK, any char where `unicode_width == 2`, ANSI escape sequences.

**ANSI strip 3-state machine (`strip_ansi`):**
- `Normal + ESC → Escape` (suppress ESC)
- `Escape + '[' → Csi` (suppress); `Escape + other → Normal` (emit ESC + byte)
- `Csi + 0x40–0x7E → Normal` (suppress final byte); `Csi + other → Csi` (suppress)
- O(n), no regex, no backtracking.

**Log sanitisation pipeline** (in order): strip ANSI CSI → normalize `\r\n→\n` → remove bare `\r` → replace `\f` with `\n` → replace NUL with U+FFFD → expand control chars to caret notation → expand `\t` to 8-col tab stops.
