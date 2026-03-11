# Summary: UI/UX Architecture

Three strictly view-only client interfaces (TUI, CLI, MCP bridge) connect to a headless server over gRPC (port 7890) and MCP HTTP (port 7891); no GUI exists at MVP. All state authority resides in the server; clients contain zero business logic and are independently deployable on Linux, macOS, and Windows Git Bash.

---

## 1. Interface Crates & Constraints

| Crate | Framework | Role |
|---|---|---|
| `devs-tui` | `ratatui 0.28` + `crossterm 0.28` + `tonic 0.12` | Interactive dashboard |
| `devs-cli` | `clap 4.5` (`derive`, `env`) + `tonic 0.12` | Scripting/CI |
| `devs-mcp-bridge` | `tokio` I/O + `reqwest 0.12` | stdin→MCP HTTP proxy |

- **[UI-ARCH-001]** No web framework crate in any production dependency.
- **[UI-ARCH-002]** All three are binary crates; may depend on `devs-core` + `devs-proto`; MUST NOT import engine-layer crates (`devs-scheduler`, `devs-pool`, `devs-executor`, `devs-adapters`, `devs-checkpoint`, `devs-checkpoint`, `devs-webhook`, `devs-grpc`, `devs-mcp`, `devs-config`, `devs-server`).
- **[UI-ARCH-004a/b/c]** Enforced via `cargo tree` in `./do lint`; `devs-mcp-bridge` MUST NOT list `tonic` or `devs-proto`; `devs-core` MUST NOT list `tokio`, `git2`, `reqwest`, `tonic`.

### Server Discovery (precedence, highest→lowest)

| Priority | Source |
|---|---|
| 1 | `--server <host:port>` CLI flag |
| 2 | `DEVS_SERVER` env var |
| 3 | `server_addr` in `devs.toml` |
| 4 | `DEVS_DISCOVERY_FILE` env var → read file |
| 5 | `~/.config/devs/server.addr` |

- **[UI-ARCH-004d]** MCP port obtained exclusively via `ServerService.GetInfo`; MUST NOT assume `mcp_port = grpc_port + 1`.
- **[UI-ARCH-004e/f]** `~` expanded via `dirs::home_dir()` at use time; `DEVS_DISCOVERY_FILE` overrides default path for all three binaries.
- **[UI-ARCH-004g]** Discovery errors → exit code 3 (CLI), `DISCONNECTED` status (TUI), `{"result":null,"error":"server_unreachable:...","fatal":true}` + exit 1 (bridge).

### Exit Codes (all platforms)
`0`=success, `1`=general error, `2`=not found, `3`=server unreachable, `4`=validation error.

### Cross-Platform Rules
- **[UI-ARCH-004k]** Windows: `crossterm` Windows Console API; no `termios`/`ioctl`.
- **[UI-ARCH-004l]** Windows Git Bash: backslashes normalized to `/` in `connection.rs` before gRPC messages.
- **[UI-ARCH-004m]** `./do` in POSIX `sh` only; no bash-specific syntax.
- **[UI-ARCH-004n]** Home dir via `dirs::home_dir()`; config dir via `dirs::config_dir()`.
- **[UI-ARCH-004h]** TUI MUST restore terminal (raw mode off, cursor shown, alt screen off) on any exit including panics — use `scopeguard` or `Drop` on terminal guard.

### Shared Abstractions
- **Discovery:** `devs-client-util` lib crate exposes `discover_grpc_addr(flags)` + `discover_mcp_url(flags)`; `DiscoveryError` maps to exit code 3 / DISCONNECTED / fatal JSON per binary.
- **gRPC channel:** `connect_lazy()` with 5s connect timeout, 30s per-RPC timeout.
- **Output formatting (CLI):** `Formatter` trait with `TextFormatter` + `JsonFormatter`; all handlers accept `&dyn Formatter`; no `println!`/`eprintln!` in command handlers.
- **[UI-ARCH-004r]** All user-visible strings defined in `strings.rs` per crate.
- **[UI-ARCH-004s/t]** Client version embedded via `env!("CARGO_PKG_VERSION")`; injected as `x-devs-client-version` gRPC metadata header via interceptor; server rejects major version mismatches with `FAILED_PRECONDITION`.
- **[UI-ARCH-004v/w/x/y]** No client stores/transmits API keys; bridge creates NO TCP listener; `Redacted<T>` values rendered as `"[REDACTED]"` in JSON; TUI strips ANSI from agent log output via 3-state machine in `log_pane.rs`.

---

## 2. TUI Component Hierarchy

```
App → EventLoop + AppState + RootWidget
RootWidget → TabBar + ActiveTab(Dashboard|Logs|Debug|Pools) + StatusBar + HelpOverlay
DashboardTab → RunList + RunDetail(DagView + StageList + LogTail)
LogsTab → StageSelector + LogPane
DebugTab → AgentSelector + DiffView + ControlPanel
PoolsTab → PoolList + AgentStatusGrid
```

- **[UI-ARCH-005]** Each tab is a `ratatui::widgets::Widget` struct; shared state via `AppState` only.
- **[UI-ARCH-006]** `DagView` ASCII only (`-|+> space`); no Unicode box-drawing.
- **[UI-ARCH-007]** Stage status labels exactly 4 uppercase ASCII: `PEND WAIT ELIG RUN  PAUS DONE FAIL TIME CANC`.
- **[UI-ARCH-008]** Dependency arrows `──►`; tier = longest path from any root stage.
- **[UI-ARCH-009]** `LogTail` shows last N lines; `LogPane` ring buffer 10,000 lines FIFO.
- **[UI-ARCH-011]** `StatusBar`: bottom row; shows `CONNECTED`/`RECONNECTING`/`DISCONNECTED`, server addr, active run count.

### Widget Constraints
- **[UI-ARCH-COMP-001]** No `Arc`/`Mutex`/`RwLock`/async primitives in widget structs.
- **[UI-ARCH-COMP-002]** `render()` MUST complete < 16 ms; no I/O, syscalls, or proportional allocation.
- **[UI-ARCH-COMP-003]** `App` is sole owner of `AppState`; no shared ownership.

### Key Display Data Types (`crates/devs-tui/src/state.rs`)

**`RunSummary`:** `run_id: Uuid`, `slug: String` (max 128, `[a-z0-9-]+`), `workflow_name`, `status: RunStatus`, timestamps, `stage_count/completed_stage_count/failed_stage_count: usize`. Fan-out sub-agents NOT counted in stage counts.

**`RunDetail`:** Adds `stage_runs: Vec<StageRunDisplay>`, `dag_tiers: Vec<Vec<String>>` (precomputed via Kahn's algorithm, O(V+E)), `elapsed_ms: u64`.

**`StageRunDisplay`:** `stage_name_display: String` (truncated 20 chars + `~`), `status_label: &'static str` (exactly 4 chars), `elapsed_display: String` (`M:SS` or `--:--`), `tier: usize`, `depends_on: Vec<String>`, `fan_out_count: Option<u32>`.

**`LogLine`:** `sequence: u64`, `stream: LogStream`, `content: String` (ANSI-stripped), `raw_content: String` (verbatim), `timestamp`.

**`LogBuffer`:** `lines: VecDeque<LogLine>`, `max_capacity: usize` (always 10,000), `total_received: u64`, `truncated: bool`.

- **[UI-ARCH-COMP-004]** Elapsed format: `M:SS`, always 5 chars wide; `--:--` if not started; no upper bound on M.
- **[UI-ARCH-COMP-006]** `dag_tiers` computed in `handle_event()` via Kahn's topological sort; tier 0 = empty `depends_on`; tier N = `max(tier(dep)) + 1`; within tier sorted alphabetically.

### DagView Box Format (41 chars total)
`[ <name-20-chars> | <STAT> | <M:SS> ]`
- Tier gutter: 5 chars ` ──► ` (fallback ` --> ` ASCII).
- **[UI-ARCH-COMP-008]** Horizontal scroll when total width > pane width; `dag_scroll_offset` in `AppState`.
- **[UI-ARCH-COMP-009]** Fan-out stages: single box with `(×N)` suffix appended before truncation.

### LogPane Reuse
- `LogTail` (Dashboard): `scroll_offset = max(0, buffer.len() - visible_rows)`, `show_stream_prefix=false`.
- `LogPane` (Logs): scroll from `AppState::log_scroll_offset[(run_id, stage_name)]`, `show_stream_prefix=true`.
- **[UI-ARCH-COMP-010]** ANSI stripping 3-state machine: `Normal→Escape(on ESC)→Csi(on [)→Normal(on ASCII letter)`; removes all CSI sequences.

### Reusable Widget Inventory
`LogPane`, `StageList`, `RunList`, `DagView`, `HelpOverlay`, `StatusBar` — all in `crates/devs-tui/src/widgets/`.
- **[UI-ARCH-COMP-025]** Widget modules MUST NOT import tab modules.
- **[UI-ARCH-COMP-026]** Fluent builder pattern for all widget constructors.

### `render_utils.rs` Shared Utilities
`format_elapsed(Option<u64>) -> String`, `truncate_with_tilde(s, max_len)`, `stage_status_label(StageStatus)`, `run_status_label(RunStatus)`, `strip_ansi(s)`, `format_timestamp(Option<&DateTime<Utc>>)`.

### Cross-Component Data Flow
gRPC events → tokio task → `mpsc::Sender<TuiEvent>` → `tokio::select!` → `App::handle_event()` → `AppState` mutation → `App::render()`.
- **[UI-ARCH-COMP-030]** Proto types only in `convert.rs`; `state.rs` MUST NOT reference `devs_proto`.
- **[UI-ARCH-COMP-031]** `log_buffers: HashMap<(Uuid, String), LogBuffer>`; evict entries for non-selected terminal runs after 30 min idle (checked on `Tick`).
- **[UI-ARCH-COMP-033]** On reconnect, first message is `run.snapshot`; `AppState::runs` + `run_details` fully replaced; `LogBuffer` entries preserved.

---

## 3. State Management

### `AppState` (complete field list)
```rust
pub struct AppState {
    pub active_tab: Tab,                          // initial: Dashboard
    pub help_visible: bool,                       // initial: false
    pub runs: Vec<RunSummary>,                    // sorted created_at desc; no dup run_id
    pub run_details: HashMap<Uuid, RunDetail>,
    pub selected_run_id: Option<Uuid>,
    pub selected_stage_name: Option<String>,
    pub log_buffers: HashMap<(Uuid, String), LogBuffer>,
    pub pool_state: Vec<PoolSummary>,             // sorted name asc
    pub selected_pool_name: Option<String>,
    pub dag_scroll_offset: usize,
    pub log_scroll_offset: HashMap<(Uuid, String), usize>,
    pub connection_status: ConnectionStatus,      // initial: Reconnecting{attempt:0}
    pub server_addr: String,
    pub reconnect_elapsed_ms: u64,
    pub last_event_at: Option<Instant>,
    pub terminal_size: (u16, u16),
}
```

### Key Mutation Rules
- **[UI-STATE-BR-001]** `selected_run_id` cleared to `None` if not in new `RunSnapshot`.
- **[UI-STATE-BR-002]** `dag_scroll_offset` reset to 0 on `selected_run_id` change.
- **[UI-STATE-BR-004]** `runs` re-sorted by `created_at` desc after every mutation; tie-break by `run_id` lex.
- **[UI-STATE-BR-005]** `selected_stage_name` cleared on tab switch away from `Logs`/`Debug`.
- **[UI-STATE-BR-008]** Mutation atomic per event; roll back on error.
- **[UI-STATE-BR-009]** `render()` takes `&self`; MUST NOT mutate `AppState`.
- **[UI-STATE-BR-013]** `dag_tiers` recomputed immediately in `handle_event()` when `run_details` mutated; MUST NOT defer to render.

### `ConnectionStatus`
```rust
pub enum ConnectionStatus {
    Connected { server_addr: String },
    Reconnecting { attempt: u32, next_retry_at: Instant, elapsed_ms: u64 },
    Disconnected,
}
```
Backoff: 1→2→4→8→16→30s (cap). Budget: 30,000 ms cumulative + 5s grace → `Disconnected` → exit code 1, message `"Disconnected from server. Exiting."`.
- **[UI-STATE-BR-016]** `reconnect_elapsed_ms` reset to 0 on `Connected`.
- **[UI-STATE-BR-018]** Keyboard events still processed during `Reconnecting`.

### `TuiEvent` Taxonomy
`Key(KeyEvent)`, `Resize(u16,u16)`, `RunSnapshot`, `RunDelta`, `LogLine{run_id,stage_name,line}`, `PoolSnapshot`, `PoolDelta`, `Connected`, `StreamError`, `ReconnectAttempt`, `ReconnectBudgetExceeded`, `Tick` (1s interval).

Channel buffer sizes: crossterm=256, run events=256, pool events=64, connection=32, tick=8.

### LogBuffer Lifecycle
- Created when stage transitions to `Running`.
- Evict on `Tick` when: run terminal AND not selected AND `last_appended_at > 30 min ago`.
- Non-terminal runs NEVER evicted.
- Auto-scroll: if at tail before insert, scroll offset incremented by 1.

### CLI Per-Invocation State
Stateless between invocations. `GlobalArgs` parsed once, immutable. Single lazy gRPC channel per invocation. UUID v4 regex: `^[0-9a-fA-F]{8}-...-4...-[89abAB]...-...$`; UUID path before slug path.

### MCP Bridge State
```rust
struct BridgeState {
    mcp_endpoint: Url,           // immutable after startup
    in_flight: Option<InFlightRequest>,
    connection_healthy: bool,
    reconnect_attempted: bool,
}
```
Sequential processing (one in-flight at a time). On HTTP error: one reconnect after 1s; if fails → fatal JSON + exit 1.

---

## 4. CLI Command Routing

### Global Flags (all subcommands)
`--server <host:port>`, `--format json|text` (default `text`), `--project <name|id>`.

### Per-Command gRPC Mapping
| Command | Service | RPC |
|---|---|---|
| `devs submit <workflow>` | `RunService` | `SubmitRun` |
| `devs list` | `RunService` | `ListRuns` |
| `devs status <run>` | `RunService` | `GetRun` |
| `devs logs <run> [stage]` | `LogService` | `FetchLogs`/`StreamLogs` |
| `devs cancel <run>` | `RunService` | `CancelRun` |
| `devs pause <run> [--stage]` | `RunService`/`StageService` | `PauseRun`/`PauseStage` |
| `devs resume <run> [--stage]` | `RunService`/`StageService` | `ResumeRun`/`ResumeStage` |
| `devs project add/remove/list` | `ProjectService` | `AddProject`/`RemoveProject`/`ListProjects` |
| `devs security-check` | (none — reads disk) | — |

- **[UI-ROUTE-008]** `devs security-check` MUST NOT open gRPC channel.
- **[UI-ROUTE-010]** `--format json`: ALL output (success + errors) to stdout; nothing to stderr.
- **[UI-ROUTE-013]** `devs submit` auto-detects project from CWD if exactly 1 match; 0 or ≥2 → exit code 4.

### Key CLI Business Rules
- **[UI-ARCH-COMP-012]** `--input key=value` splits on FIRST `=` only.
- **[UI-ARCH-COMP-014]** UUID4 resolution before slug; UUID takes precedence on collision.
- **[UI-ARCH-COMP-015]** `devs logs --follow`: exit 0 on `Completed`, 1 on `Failed`/`Cancelled`, 3 on disconnection.
- **[UI-ARCH-COMP-016]** `--limit 0` → exit code 4; `>1000` silently clamped to 1000.
- **[UI-ARCH-COMP-018]** `devs project add` resolves path via `std::fs::canonicalize()` before sending.

### TUI Navigation
4 tabs: `Dashboard(1)`, `Logs(2)`, `Debug(3)`, `Pools(4)`; `Tab` cycles; `?` toggles `HelpOverlay` (modal, blocks all keys except `?/Esc/q/Ctrl+C`); `c/p/r` only active on Dashboard (c,p,r) or Debug (p,r).
- **[UI-ARCH-032]** Terminal < 80×24: render only size warning, nothing else.
- **[UI-ROUTE-027]** `↑/↓` goes to `RunList` when no run selected; shifts to `StageList` when run selected.
- **[UI-ROUTE-028]** `Esc` from stage list → back to `RunList`; `Esc` from `RunList` → deselect run.
- **[UI-ROUTE-030]** Unrecognized keys silently consumed; no error output.

### MCP Bridge Routing
- Single endpoint: `POST http://<host>:<mcp_port>/mcp/v1/call`.
- Sequential: one in-flight request at a time.
- **[UI-ROUTE-018]** Invalid JSON → write JSON-RPC `-32700` error, continue; MUST NOT exit.
- **[UI-ROUTE-019]** `params` forwarded verbatim; no semantic validation in bridge.
- **[UI-ROUTE-023/024]** Stream chunks forwarded in order, split on `\n`, flushed immediately.
- JSON-RPC error codes: `-32700` (parse), `-32600` (invalid request), `-32603` (internal/HTTP error).

---

## 5. Styling System

### Theme
```rust
pub enum ColorMode { Color, Monochrome }
pub struct Theme { pub color_mode: ColorMode, /* color fields */ }
impl Theme { pub fn from_env() -> Self { /* reads NO_COLOR */ } }
```
- **[UI-ARCH-037]** Color is secondary; all states distinguishable without color.
- **[UI-ARCH-STYLE-001]** Only `theme.rs` reads `NO_COLOR`; no widget reads env directly.
- **[UI-ARCH-STYLE-002]** Monochrome: only `Modifier::REVERSED` (selected rows) and `Modifier::BOLD` (active tab). No ITALIC/UNDERLINED/BLINK in structural positions.

### Status Colors (Color mode)
`DONE`→Green, `FAIL/TIME`→Red, `RUN `→Yellow, `PAUS`→Cyan, `CANC`→DarkGray, `ELIG/WAIT/PEND`→White. Selected row: Black on White. Log stderr lines: Yellow fg.

### Character Constraints
- **[UI-ARCH-039]** Structural characters ASCII U+0020–U+007E only. No Unicode box-drawing/block elements/emoji in structural positions.
- Stage box chars: `[ ] | - > ~ : space + * # ? q`.

### Error Prefix Contract (machine-stable)
`not_found:`, `invalid_argument:`, `already_exists:`, `failed_precondition:`, `resource_exhausted:`, `server_unreachable:`, `internal:`, `cancelled:`, `timeout:`, `permission_denied:`.
- **[UI-ARCH-STYLE-008]** All error strings in `strings.rs` begin with exactly one of these prefixes.

### Layout
- Minimum terminal: 80×24; below this renders warning only.
- Dashboard: `RunList` (max(30%, 24) cols) + `RunDetail` (remainder).
- `RunDetail`: `DagView` (max(40% rows, 8)) + `LogTail` (remainder).
- Stage box: 41 cols total = `[ ` + name(20) + ` | ` + status(4) + ` | ` + elapsed(5) + ` ]`.
- Tier gutter: 5 cols with `  -->` at vertical midpoint.

### `strings.rs` Module Contract
- **[UI-ARCH-040]** All user-visible strings as `pub const &'static str` in `strings.rs` per crate.
- Naming prefixes: `ERR_`, `STATUS_`, `TAB_`, `KEY_`, `HELP_`, `COL_`, `STATUS_BAR_`, `CMD_`, `ARG_`, `FMT_`.
- **[UI-ARCH-STRING-005]** All `STATUS_*` constants compile-time asserted to exactly 4 bytes.
- **[UI-ARCH-STRING-004]** Lint test scans all `.rs` files for inline error prefixes outside `strings.rs`.

### Snapshot Testing
- Framework: `insta 1.40` with `ratatui::backend::TestBackend` at **200×50** fixed size.
- All snapshots use `ColorMode::Monochrome`; no ANSI in snapshot files.
- **[UI-ARCH-ASSET-004]** `INSTA_UPDATE=always` prohibited in CI; auto-approval blocked.
- **[UI-ARCH-ASSET-007]** `AppState::test_default()` gated behind `#[cfg(test)]`.
- Required snapshots: `dashboard__empty_state`, `dashboard__run_running`, `dashboard__dag_three_stages`, `dashboard__terminal_too_small`, `help_overlay__visible`, `logs__buffered`, `logs__truncated`, `pools__rate_limited`, `status_bar__error`, `status_bar__reconnecting`, `debug__diff_view`.

### Path & Encoding
- **[UI-ARCH-048]** All paths normalized to forward-slash for display; `normalize_path_display()` replaces `\`→`/` and collapses `//`.
- **[UI-ARCH-PATH-004]** `\r\n` in log content normalized to `\n` before `LogBuffer` insertion.
- **[UI-ARCH-PATH-005]** CLI JSON mode always outputs `\n`; text mode uses native OS separator.

---

## 6. Key Data Models (CLI Output Types)

**`SubmitOutput`:** `run_id`, `slug`, `workflow_name`, `project_id`, `status:"pending"`.

**`RunListItem`:** `run_id`, `slug`, `workflow_name`, `status`, timestamps. No `stage_runs`.

**`RunStatusOutput`:** Full run + `stage_runs: Vec<StageStatusItem>` with `stage_name`, `attempt`, `status`, `agent_tool`, timestamps, `exit_code`.

**`SecurityCheckOutput`:** `schema_version:1`, `checked_at`, `overall_passed: bool`, `checks: Vec<SecurityCheckItem>` with `check_id`, `status:"pass"|"warn"|"error"`, `detail`, `remediation`.

**`DagLayout`:** `tiers: Vec<DagTier>`, `max_tier_height`, `total_width`, `scroll_offset_x`. Each `DagTier` has `depth: u32` and `stages: Vec<DagStageBox>`.

**`ConnectionStatus` (TUI):** `Connected{server_addr}`, `Reconnecting{server_addr,attempt,started_at,next_retry_at}`, `Disconnected{server_addr,reason}`.

Reconnect schedule: 1→2→4→8→16→30s (cap). Total budget 35s (30s + 5s grace) before exit code 1.

---

## 7. Testing Requirements

- **[UI-ARCH-078/079]** TUI: `TestBackend` at 200×50; `insta` snapshots; `mockall` for gRPC.
- **[UI-ARCH-083/084]** CLI E2E: `assert_cmd 2.0`; real server on ephemeral port; unique `DEVS_DISCOVERY_FILE` per test.
- **[UI-ARCH-086/087]** MCP bridge E2E: bridge as subprocess; real server; POST via bridge binary only.
- **[UI-ARCH-088]** QG-003 (CLI E2E ≥50%): only subprocess-invoked tests count.
- **[UI-ARCH-089]** QG-004 (TUI E2E ≥50%): only tests exercising full `handle_event→render` cycle count.
- **[UI-ARCH-090]** QG-005 (MCP E2E ≥50%): only tests POSTing to `/mcp/v1/call` via running server count.

### Required Test Annotations
All tests annotated `// Covers: <AC-ID>`. Key ACs:
- **[AC-UI-001/002/003]** `cargo tree` dependency gate for all three crates.
- **[AC-UI-004/005]** Terminal too-small rendering at 79×24 and 80×23.
- **[AC-UI-019]** TUI re-renders within 50ms of `RunEvent`.
- **[AC-UI-026–033]** CLI exit codes for all error/success conditions.
- **[AC-UI-039]** `--input expr=a=b` splits on first `=`.
- **[AC-UI-046–050]** MCP bridge forwarding, error handling, streaming.
- **[AC-UI-057/058]** Cancel confirmation prompt behavior.
