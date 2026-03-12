# Summary: User Features Specification (`4_USER_FEATURES` v1.0)

This document is the authoritative user-facing contract for the `devs` workflow orchestration system, defining all behavioral requirements across CLI, TUI, MCP, and `./do` interfaces. Every `[FEAT-*]` tag is normative; when prose and a tag conflict, the tag governs. All 77 acceptance criteria (`AC-FEAT-NNN`) must be covered by automated tests annotated `// Covers: <ID>`.

---

## Personas & Agent Roles

**Two personas:**
- **Human Developer**: uses TUI (monitoring), CLI (submission/scripting), `./do` (development lifecycle)
- **AI Agent Client**: machine-to-machine via MCP JSON-RPC or CLI

**Two AI agent sub-roles** (distinguished by execution context, not credentials):

| Sub-Role | Permitted MCP Tools | Spawning |
|---|---|---|
| **Orchestrated Agent** (stage subprocess) | `report_progress`, `signal_completion`, `report_rate_limit` only | `devs-executor` via pool dispatch |
| **Observing/Controlling Agent** (external) | All 20 MCP tools + Filesystem MCP | External process |

- **[FEAT-BR-004]** Orchestrated agent MUST call `signal_completion` before exiting if `completion=mcp_tool_call`; else exit-code fallback applies
- **[FEAT-BR-005]** Orchestrated agent MUST write `.devs_output.json` with boolean `"success"` field if `completion=structured_output`; string `"true"` → `Failed`
- **[FEAT-BR-006]** Orchestrated agent MUST exit within 10s of `devs:cancel\n` on stdin
- **[FEAT-BR-007]** Orchestrated agent MUST NOT call `submit_run`, `cancel_run`, `pause_run`, `resume_run`, `write_workflow_definition`, `inject_stage_input`, or `assert_stage_output`
- **[FEAT-BR-008]** Observing agent MUST check `list_runs` for existing non-terminal runs before `submit_run` for same workflow
- **[FEAT-BR-009]** Observing agent MUST use `stream_logs(follow:true)`; polling `get_run` < 1s intervals is prohibited
- **[FEAT-BR-010]** Observing agent MUST write `task_state.json` to `.devs/agent-state/<session-id>/task_state.json` before any `submit_run` and after each terminal state
- **[FEAT-BR-011]** MCP server MUST NOT enforce tool-level restrictions by agent role at MVP

**Agent identification**: `DEVS_MCP_ADDR` set → Orchestrated; not set → Observing/Controlling.

---

## Feature Categories (9 total)

| # | Category | Primary Interface | Notes |
|---|---|---|---|
| 1 | Workflow Authoring | File (TOML/YAML), Rust API | MCP `write_workflow_definition` |
| 2 | Workflow Submission | CLI `devs submit`, MCP `submit_run` | gRPC `SubmitRun` |
| 3 | Run Monitoring | TUI Dashboard, CLI `devs status/list` | MCP `get_run/list_runs` |
| 4 | Run Control | CLI `devs cancel/pause/resume` | MCP cancel/pause/resume tools |
| 5 | Log Access | CLI `devs logs`, MCP `stream_logs/get_stage_output` | TUI Logs tab |
| 6 | Pool Observation | TUI Pools tab, MCP `get_pool_state` | gRPC `WatchPoolState` |
| 7 | Development Lifecycle | `./do` script | GitLab CI |
| 8 | Agentic Development | All 20 MCP tools + Filesystem MCP | TUI Debug tab |
| 9 | Server Configuration | `devs.toml`, `devs project add/remove` | CLI flags, env vars |

- **[FEAT-BR-012]** Category 9 is prerequisite for all others; server MUST NOT accept connections until config valid
- **[FEAT-BR-013]** `./do build/lint/format` work without a running server; only `./do test/coverage` require one

---

## Cross-Platform & Accessibility Rules

- **[FEAT-BR-001]** Identical behavior on Linux, macOS, Windows Git Bash (exit codes, output formats)
- **[FEAT-BR-002]** TUI must work at 80×24 minimum; ASCII-only box characters; no Unicode box-drawing
- **[FEAT-BR-003]** Human Developer need not have agent CLIs installed on local machine
- **[FEAT-068]** TUI uses only ASCII U+0020–U+007E for structural elements
- **[FEAT-069]** Stage status labels: exactly 4 uppercase chars: `PEND`, `WAIT`, `ELIG`, `RUN `, `PAUS`, `DONE`, `FAIL`, `TIME`, `CANC`
- **[FEAT-070]** Color is secondary; `NO_COLOR` env suppresses all ANSI codes; text abbreviations always present
- **[FEAT-071]** All TUI controls keyboard-operable; full keybinding table defined; `?` shows help overlay
- **[FEAT-072]** Below 80×24: show `"Terminal too small: 80x24 minimum required (current: WxH)"`
- **[FEAT-080]** English-only at MVP; strings in dedicated modules (`strings.rs`) for future i18n
- **[FEAT-081]** Machine-stable error prefixes: `not_found:`, `invalid_argument:`, `already_exists:`, `failed_precondition:`, `resource_exhausted:`, `server_unreachable:`, `internal:`, `cancelled:`, `timeout:`, `permission_denied:`
- **[FEAT-083]** `./do` is POSIX `sh` only; no bash-specific syntax
- **[FEAT-084]** All paths stored with forward-slash; backslash normalized on input; `~` expanded at use time

---

## Workflow Authoring

Formats: TOML, YAML (functionally equivalent), Rust builder API. TOML/YAML hot-reloadable via `write_workflow_definition`.

- **[FEAT-BR-014]** TOML and YAML are fully equivalent; no format-exclusive features
- **[FEAT-BR-016]** All 13 validation checks run in full before any stage is dispatched; no short-circuit

**13-step validation pipeline** (all errors collected, no early exit):
1. Schema validation
2. Stage name uniqueness
3. `depends_on` references exist
4. Cycle detection (Kahn's algorithm) → error includes `"cycle": ["A","B","A"]`
5. Pool name exists in server config
6. Named branch/merge handler registered
7. Default value type matches `WorkflowInput.type`
8. `prompt` XOR `prompt_file` (exactly one)
9. `fan_out` XOR `branch` (not both)
10. `fan_out.count` XOR `fan_out.input_list` (not both)
11. Fan-out count/list bounds: 1–64
12. `stage.timeout_secs` ≤ `workflow.timeout_secs`
13. At least one stage defined

- **[FEAT-BR-106]** `write_workflow_definition` validates all 13 checks before writing; disk unchanged on failure
- **[FEAT-BR-107]** Updated definitions only affect new submissions; active runs use immutable `definition_snapshot`

---

## Workflow Submission

- **[FEAT-BR-017]** Submission is atomic 7-step validation: workflow exists → inputs valid → no active duplicate name → type coercion → no extra input keys → required inputs present → server not shutting down
- **[FEAT-BR-018]** Run name unique per project; reuse allowed only if existing run is `Cancelled`
- **[FEAT-BR-019]** Auto-generated slug format: `<workflow-name>-<YYYYMMDD>-<4 random lowercase alphanum>`, max 128 chars, `[a-z0-9-]+`
- **[FEAT-BR-108]** `devs submit` without `--project` when CWD matches 0 or 2+ projects → exit code 4
- **[FEAT-BR-110]** `=` in `--input key=value` splits on first occurrence; `--input expr=a=b` sets `expr` to `"a=b"`

**Input type coercion:**
- `string`: JSON string only
- `path`: JSON string; forward-slash normalized; NOT resolved at submission
- `integer`: JSON number or decimal string `"42"`; `"42.5"` rejected
- `boolean`: JSON `true`/`false` or strings `"true"`/`"false"`; `"1"`, `"0"`, `"yes"` rejected

---

## Run Monitoring

- **[FEAT-BR-020]** Every field in monitoring hierarchy MUST be present; unpopulated = JSON `null`, never absent
- **[FEAT-BR-021]** TUI Dashboard re-renders within 50ms of receiving `RunEvent`; event-driven not timer-driven
- **[FEAT-BR-022]** `devs list` returns 100 most-recent runs sorted by `created_at` desc; no `stage_runs` embedded
- **[FEAT-BR-023]** Stage boxes connected by ASCII arrows `──►` reflecting `depends_on`; same depth → same column tier

**Stage box format:** `[ stage-name | STATUS | M:SS ]`; stage name truncated to 20 chars with `~`; `--:--` if not started.

TUI tabs: `Dashboard`, `Logs`, `Debug`, `Pools`. Key bindings: Tab/1-4 to switch; `c/p/r` cancel/pause/resume; `q/Ctrl+C` quit.

TUI log buffer: 10,000 lines per stage; oldest evicted (FIFO). Full log always on disk.

TUI reconnect backoff: 1→2→4→8→16→30s (cap); after 30s total + 5s grace → exit code 1.

---

## Run Control

| Operation | CLI | MCP Tool | Agent Signal |
|---|---|---|---|
| Cancel run | `devs cancel` | `cancel_run` | `devs:cancel\n` to all Running |
| Cancel stage | — | `cancel_stage` | `devs:cancel\n` to stage |
| Pause run | `devs pause` | `pause_run` | `devs:pause\n` to all Running |
| Pause stage | `devs pause --stage` | `pause_stage` | `devs:pause\n` to stage |
| Resume run | `devs resume` | `resume_run` | `devs:resume\n` to all Paused |
| Resume stage | `devs resume --stage` | `resume_stage` | `devs:resume\n` to stage |

- **[FEAT-BR-024]** `cancel_run` MUST transition ALL non-terminal `StageRun` records to `Cancelled` in ONE atomic checkpoint write
- **[FEAT-BR-025]** `pause_run` sends `devs:pause\n` to Running stages; holds Eligible/Waiting from dispatch
- **[FEAT-BR-026]** `resume_run` sends `devs:resume\n`; dispatches all held Eligible stages
- **[FEAT-BR-027]** Control tools MUST reject illegal transitions with `failed_precondition: <state> cannot transition to <target>`
- **[FEAT-BR-121]** `cancel_stage` cascades `Cancelled` to all downstream stages that `depends_on` it
- **[FEAT-BR-126]** `cancel_run` on a `Paused` run MUST succeed

Cancel timing: `t+0s` `devs:cancel\n` → `t+5s` SIGTERM → `t+10s` SIGKILL → `exit_code: -9`

---

## Log Access

- **[FEAT-BR-028]** `devs logs` without `--follow` prints all buffered lines, exits code 0
- **[FEAT-BR-029]** `devs logs --follow` streams until terminal; exit 0 if `Completed`, 1 if `Failed`/`Cancelled`
- **[FEAT-BR-030]** `get_stage_output` caps stdout/stderr at 1 MiB each; `truncated: true` if exceeded; oldest content removed (newest preserved)
- **[FEAT-BR-031]** `stream_logs(follow:true)` on `Pending/Waiting/Eligible` holds connection; if cancelled before running → `{"done":true,"total_lines":0}`
- **[FEAT-BR-117]** `stream_logs` sequence numbers start at 1, monotonically increasing, no gaps
- **[FEAT-BR-118]** `stream_logs(follow:true)` on pre-running stage holds HTTP connection open

---

## Pool Observation

- **[FEAT-BR-032]** `get_pool_state` snapshot includes per-pool: `name`, `max_concurrent`, `active_count`, `queued_count`; per-agent: `tool`, `capabilities`, `fallback`, `pty`, `rate_limited_until`
- **[FEAT-BR-033]** TUI Pools tab updates on each `WatchPoolState` gRPC event
- **[FEAT-BR-034]** `pool.exhausted` webhook fires at most once per exhaustion episode

---

## Development Lifecycle (`./do`)

| Command | Success Condition | Artifacts |
|---|---|---|
| `./do setup` | All tools at required versions; idempotent | None |
| `./do build` | `cargo build --workspace --release` exits 0 | `target/release/` |
| `./do test` | All unit+E2E pass AND `traceability.json` `overall_passed:true` | `target/traceability.json` |
| `./do lint` | `cargo fmt --check` + `cargo clippy -D warnings` + `cargo doc` + dep audit all exit 0 | None |
| `./do format` | `cargo fmt --all` exits 0 | Modified source files |
| `./do coverage` | All 5 QG gates pass; `report.json` `overall_passed:true` | `target/coverage/report.json` |
| `./do presubmit` | setup → format → lint → test → coverage → ci within 15 min | `target/presubmit_timings.jsonl` |
| `./do ci` | GitLab pipeline passes on all 3 platforms within 30 min | None |

- **[FEAT-BR-035]** 15-min timeout measured from first step start; all children killed on timeout; exit 1
- **[FEAT-BR-036]** `./do setup` is idempotent; tools at required version are NOT reinstalled
- **[FEAT-BR-037]** `./do test` exits non-zero if `traceability.json` `overall_passed:false`, even if all `cargo test` pass
- **[FEAT-BR-038]** `./do coverage` generates exactly 5 gates (QG-001–QG-005); `overall_passed` = logical AND
- **[FEAT-BR-039]** `./do lint` includes dependency audit against authoritative version table in §2 of TAS
- **[DO-BR-001]** `./do` is POSIX `sh` only; no bash-specific syntax
- **[DO-BR-004]** Identical exit codes on Linux, macOS, Windows Git Bash

**Quality gates:**

| Gate | Scope | Threshold |
|---|---|---|
| QG-001 | Unit tests, all crates | ≥ 90.0% line coverage |
| QG-002 | E2E aggregate | ≥ 80.0% line coverage |
| QG-003 | E2E CLI interface only | ≥ 50.0% line coverage |
| QG-004 | E2E TUI interface only | ≥ 50.0% line coverage |
| QG-005 | E2E MCP interface only | ≥ 50.0% line coverage |

Unit test coverage does NOT count toward QG-003/004/005. Calling internal Rust functions does not satisfy E2E gates.

**`target/traceability.json`:** Scans `docs/plan/specs/*.md` for `[FEAT-*]` IDs; scans tests for `// Covers: <id>`. `stale_annotations` = annotations referencing non-existent IDs. `overall_passed: false` if any requirement uncovered OR stale annotations exist.

**Standard workflow definitions** (stored in `.devs/workflows/`, usable from first server-startable commit):
- `tdd-red`: inputs `test_name`, `prompt_file`; stage `check-test-fails` (120s)
- `tdd-green`: inputs `test_name`, `prompt_file`; stage `check-test-passes` (120s)
- `presubmit-check`: stages `format-check → clippy+doc-check → test-and-traceability → coverage` (900s total)
- `build-only`: stage `cargo-build` (300s)
- `unit-test-crate`: input `crate_name`; stage `cargo-test-crate` (300s)
- `e2e-all`: stage `cargo-e2e` (600s)

---

## Agentic Development

- **[FEAT-BR-040]** Glass-Box MCP server is always active when server runs with a bound MCP port; no feature flag
- **[FEAT-BR-041]** Every internal entity fully observable via MCP; MCP view = in-process `Arc<RwLock<ServerState>>`
- **[FEAT-BR-042]** Agents MUST follow Red-Green-Refactor TDD: write failing test → verify fails → implement → `presubmit-check` → proceed only after all gates pass
- **[FEAT-BR-043]** Standard workflow definitions in `.devs/workflows/` usable from first server-startable commit
- **[FEAT-BR-044]** E2E tests MUST call MCP server via `POST /mcp/v1/call` using `DEVS_MCP_ADDR`
- **[FEAT-BR-135]** Agent MUST NOT make code changes before verifying test fails (Red phase)
- **[FEAT-BR-136]** Agent MUST check `list_runs` for active `presubmit-check` before submitting new one
- **[FEAT-BR-137]** Agent MUST write `task_state.json` before `submit_run` and after each terminal state
- **[FEAT-BR-138]** Agent MUST NOT restart server while any run is `Running` or `Paused`

**Session recovery algorithm:**
1. Read `task_state.json`
2. If active `last_run_id`: call `get_run` to determine state
3. If running/paused: `stream_logs(follow:true)` to resume monitoring
4. If terminal: evaluate and update `task_state.json`
5. If `traceability.json` > 1 hour old: regenerate before implementing

**Mandatory diagnostic sequence before any code edit:**
1. `get_run(run_id)` — confirm failed/timed_out state
2. `get_stage_output(run_id, stage_name)` — retrieve stdout/stderr/structured
3. Classify failure
4. Apply targeted fix only

**Failure classification:**
- `stderr` matches `error[E\d+]` → compilation error
- `stdout` contains `FAILED` + test name → test assertion failure
- `structured.gates[*].passed == false` → coverage gate failure
- `stderr` matches `^error:` from clippy → clippy denial
- `structured.overall_passed == false` + stale/uncovered → traceability failure
- `stage.status == "timed_out"` → process timeout
- `exit_code` non-zero, no pattern match → unclassified

- **[FEAT-BR-139]** Agent MUST NOT edit until `get_stage_output` returns `"error": null`
- **[FEAT-BR-140]** Agent MUST NOT make speculative edits without reading specific stderr/stdout output
- **[FEAT-BR-141]** For coverage failures, agent MUST read `report.json` to identify specific failing gate and uncovered lines
- **[FEAT-BR-142]** `// Covers: <id>` annotations MUST correspond to genuine behavioral coverage

---

## Data Models (Key Fields)

**`WorkflowDefinition`:** `name ([a-z0-9_-]+, max 128)`, `format`, `inputs[]`, `stages[1-256]`, `timeout_secs?`, `default_env`, `artifact_collection (AgentDriven|AutoCollect)`

**`WorkflowInput`:** `name ([a-z0-9_]+, max 64)`, `type (String|Path|Integer|Boolean)`, `required`, `default?`

**`StageDefinition`:** `name`, `pool`, `prompt XOR prompt_file`, `system_prompt?`, `depends_on[]`, `required_capabilities[]`, `completion (ExitCode|StructuredOutput|McpToolCall)`, `env`, `execution_env?`, `retry?`, `timeout_secs?`, `fan_out XOR branch`

**`RetryConfig`:** `max_attempts (1-20)`, `backoff (Fixed|Exponential|Linear)`, `initial_delay_secs (≥1)`, `max_delay_secs?` (default 300)
- Exponential: `min(initial^N, max_delay)`; Linear: `min(initial×N, max_delay)`
- Rate-limit events do NOT increment `attempt`

**`FanOutConfig`:** `count (1-64) XOR input_list (1-64 items)`, `merge_handler?`; sub-agents get `{{fan_out.index}}` and `{{fan_out.item}}`; any failure without handler → stage `Failed` with `"failed_indices": [...]`

**`BranchConfig`:** `handler XOR predicates[]`; `BranchPredicate`: `condition (ExitCode|StdoutContains|OutputField)`, `value`, `field?`, `next_stage`; predicates evaluated in order; no match → run fails

**`ExecutionEnv`:** `type (Tempdir|Docker|RemoteSsh)`, `full_clone (default false)`
- Working dirs: Tempdir → `<os-tempdir>/devs-<run-id>-<stage>/repo/`; Docker → `/workspace/repo/`; SSH → `~/devs-runs/<run-id>-<stage>/repo/`

**`WorkflowRun`:** `run_id (UUID4)`, `slug ([a-z0-9-]+, max 128)`, `workflow_name`, `project_id`, `status`, `inputs`, `definition_snapshot`, `created_at`, `started_at?`, `completed_at?`, `stage_runs[]`

**`StageRun`:** `stage_run_id (UUID4)`, `run_id`, `stage_name`, `attempt (1-based)`, `status`, `agent_tool?`, `pool_name`, `started_at?`, `completed_at?`, `exit_code?` (`-9` for SIGKILL), `output?`

**`StageOutput`:** `stdout (≤1MiB, empty string if none)`, `stderr (≤1MiB)`, `structured?`, `exit_code`, `log_path`, `truncated`; invalid UTF-8 → U+FFFD

**`AgentPool`:** `name`, `max_concurrent (1-1024)`, `agents[]`

**`AgentConfig`:** `tool (Claude|Gemini|OpenCode|Qwen|Copilot)`, `capabilities[]`, `fallback`, `prompt_mode (Flag|File)`, `pty`, `env`

Rate-limit passive detection patterns (exit code 1 + stderr match): claude: `"rate limit"/"429"/"overloaded"`; gemini: `"quota"/"429"/"resource_exhausted"`; opencode/qwen/copilot: `"rate limit"/"429"`

**`Project`:** `project_id`, `name`, `repo_path`, `priority`, `weight (≥1)`, `checkpoint_branch (default "devs/state")`, `workflow_dirs[]`, `webhook_targets[]`, `status (Active|Removing)`

**`WebhookTarget`:** `webhook_id`, `url`, `events[]`, `secret?`, `timeout_secs (1-30, default 10)`, `max_retries (0-10, default 3)`

Events: `run.started/completed/failed/cancelled`, `stage.started/completed/failed/timed_out`, `pool.exhausted`, `state.changed`

**Checkpoint files** (all at `.devs/`):
- `runs/<run-id>/workflow_snapshot.json`: `schema_version:1`, `captured_at`, `run_id`, `definition`
- `checkpoint.json`: `schema_version:1`, `written_at`, `run`, `stage_runs[]`; written atomically (write-to-tmp → `rename(2)`)
- `logs/<run-id>/<stage>/attempt_<N>/stdout.log` + `stderr.log`

**`task_state.json`** (at `.devs/agent-state/<session-id>/`): `schema_version:1`, `session_id`, `written_at`, `agent_tool`, `completed_requirements[]`, `in_progress[]`, `blocked[]`, `notes`

**`.devs_context.json`** (written before agent spawn, max 10MiB): `schema_version:1`, `run_id`, `run_slug`, `stage_name`, `inputs`, `stages[]` (completed deps only), `truncated`

**`.devs_output.json`** (written by agent in `structured_output` mode): `"success": <boolean>` (MUST be boolean; string `"true"` → `Failed`), `"output": {}`, `"message": string?`

---

## API Contracts

### CLI Exit Codes
| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | General error |
| 2 | Not found |
| 3 | Server unreachable |
| 4 | Validation/input error |

`--format json`: all output (errors too) → stdout as JSON; nothing to stderr. Format: `{"error": "<prefix>: <detail>", "code": <n>}`.

**Server discovery order:** `--server` flag → `DEVS_SERVER` env → `server_addr` in `devs.toml` → `DEVS_DISCOVERY_FILE` env → `~/.config/devs/server.addr`

**Run ID resolution:** UUID4 format → resolve as `run_id`; else resolve as `slug`. UUID takes precedence on collision.

### MCP HTTP Transport
- `POST /mcp/v1/call`, JSON-RPC 2.0, max body 1MiB, port 7891 (default)
- HTTP 400 (malformed), 404 (wrong path), 405 (non-POST), 413 (>1MiB), 415 (wrong Content-Type), 500 (panic)
- All tool responses: HTTP 200 with `{"result": <obj>|null, "error": <str>|null}` — mutually exclusive
- Lock timeout (5s): `"resource_exhausted: lock acquisition timed out after 5s"`
- Concurrent observation calls: fully parallel; control calls serialized (≤5s wait)
- `stream_logs` does NOT hold `SchedulerState` lock

### All 20 MCP tools
**Observation:** `list_runs`, `get_run`, `get_stage_output`, `stream_logs`, `get_pool_state`, `get_workflow_definition`, `list_checkpoints`

**Control:** `submit_run` (7-step atomic validation), `cancel_run` (single atomic checkpoint), `cancel_stage`, `pause_run`, `resume_run`, `pause_stage`, `resume_stage`, `write_workflow_definition` (validate-then-write)

**Testing:** `inject_stage_input` (Waiting/Eligible only; immediate checkpoint), `assert_stage_output` (8 operators; all evaluated; no short-circuit; invalid regex fails entire request)

**Mid-run agent tools:** `report_progress` (non-blocking, 0-100 pct_complete), `signal_completion` (idempotent first call only; `output` must be JSON object), `report_rate_limit` (fallback trigger; 60s cooldown; attempt not incremented)

**`assert_stage_output` operators:** `eq`, `ne`, `contains`, `not_contains`, `matches` (Rust regex), `json_path_eq`, `json_path_exists`, `json_path_not_exists`. `actual_snippet` truncated to 256 chars.

**`stream_logs` chunks:** `sequence (starts at 1, no gaps)`, `stream ("stdout"|"stderr")`, `line (≤32KiB)`, `timestamp (RFC3339+ms)`, `done: false`; terminal: `{"done":true,"truncated":bool,"total_lines":int}`

### gRPC Services (6 total)
`WorkflowDefinitionService`, `RunService`, `StageService`, `LogService`, `PoolService`, `ProjectService`

- `x-devs-client-version` header required; major version mismatch → `FAILED_PRECONDITION` on all RPCs
- `StreamRunEvents`: first message = full snapshot (`event_type: "run.snapshot"`); subsequent = deltas; terminal run → stream closes with gRPC `OK`; per-client buffer 256 messages
- All unary responses include `request_id (UUID4)` field

---

## State Machines (normative)

**`RunStatus`:** `Pending → Running → {Paused ↔ Running} → {Completed|Failed|Cancelled}`; also `Pending → Cancelled`; `Paused → Cancelled`

**`StageStatus`:** `Pending → Waiting|Eligible → Running → {Completed|Failed|TimedOut|Cancelled}`; `Paused ↔ Running`; `Failed|TimedOut → Pending` (retry loop); `Waiting → Cancelled` (dependency failed)

**Server startup:** ConfigParse → BindGRPC → BindMCP → InitPool → LoadRegistry → ScanWorkflows → RestoreCheckpoints (per-project failures non-fatal) → WriteDiscovery (atomic) → AcceptConnections → ResumeRuns

**Server shutdown:** SIGTERM → StopAccepting → `devs:cancel\n` to all agents → 10s wait → SIGTERM → 5s → SIGKILL → FlushCheckpoints → DeleteDiscovery → exit 0; second SIGTERM → immediate SIGKILL

**Checkpoint recovery mapping:**
- `Running` → recovered as `Eligible`
- `Eligible` → remains `Eligible`
- `Waiting` → remains `Waiting`
- `Pending/Completed/Failed/TimedOut/Cancelled` → unchanged

Corrupt checkpoint → run marked `Unrecoverable`; skipped; server continues

**[TOC-BR-006]** Any transition not shown in state diagrams is illegal; `StateMachine::transition()` returns `TransitionError::IllegalTransition` with no state change.

---

## Template Variable Resolution Order

1. `{{workflow.input.<name>}}`
2. `{{run.id}}`, `{{run.slug}}`, `{{run.name}}`
3. `{{stage.<name>.exit_code}}`
4. `{{stage.<name>.output.<field>}}`
5. `{{stage.<name>.stdout}}` (truncated to 10KiB)
6. `{{stage.<name>.stderr}}` (truncated to 10KiB)
7. `{{fan_out.index}}`, `{{fan_out.item}}`

No match → stage fails immediately with `TemplateError::UnknownVariable`; never silently substituted with empty string. Template variable referencing stage not in transitive `depends_on` closure → stage fails before agent spawn.

---

## Completion Signal Processing

| Mechanism | Primary Signal | Outcome |
|---|---|---|
| `exit_code` | Process exit code | 0 → Completed; non-zero → check rate-limit → Failed or fallback |
| `structured_output` | `.devs_output.json` (priority) or last JSON on stdout | `"success": true` → Completed; `"success": false` or string → Failed |
| `mcp_tool_call` | `signal_completion` call | success:true → Completed; no call before exit → fallback to exit_code |

`exit_code` always recorded in `StageRun.exit_code` regardless of completion mechanism.

---

## Serialization Rules

- All timestamps: RFC 3339, ms precision, `Z` suffix (`"2026-03-11T10:00:00.000Z"`)
- All status enums: lowercase underscore (`"timed_out"`, `"running"`)
- All UUIDs: lowercase hyphenated (`"550e8400-e29b-41d4-a716-446655440000"`)
- Optional unpopulated fields: JSON `null` (key MUST be present; absent = protocol violation)
- Empty collections: `[]` or `{}` (never `null`)
- `elapsed_ms`: monotonic clock milliseconds as integer

---

## Acceptance Criteria Summary

77 total AC-FEAT criteria across 10 sections (AC-FEAT-001–077, AC-FEAT-1-001–010, AC-FEAT-2-001–042, AC-3-*, AC-4-*, AC-5-*). Each requires automated test annotated `// Covers: <AC-ID>`. Tests calling internal Rust functions do NOT satisfy E2E coverage gates (QG-003/004/005).

Key coverage obligations per interface:
- **CLI E2E (QG-003):** `devs submit/list/status/logs/cancel/pause/resume` via binary
- **TUI E2E (QG-004):** `ratatui::backend::TestBackend` 200×50; `insta` text snapshots in `crates/devs-tui/tests/snapshots/*.txt`; no pixel comparison
- **MCP E2E (QG-005):** `POST /mcp/v1/call` via `DEVS_MCP_ADDR`; all 20 tools exercised
