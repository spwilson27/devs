# PRD Summary: devs — AI Agent Workflow Orchestration Server

`devs` is a headless Rust server that executes multi-stage AI agent workflows as DAGs, routing work to Claude/Gemini/OpenCode/Qwen/Copilot CLI subprocesses via a shared agent pool. All client–server communication is gRPC-only; three interfaces are provided (TUI, CLI, MCP), and a "Glass-Box" MCP server exposes full internal state to AI agents for self-development.

---

## 1. Goals, Scope & Tech Stack

### Primary Goals (measurable)
- **GOAL-001** — Parallel dispatch within 100 ms of dependency completion
- **GOAL-002** — Pool fallback/capability/concurrency correct under simulated failure
- **GOAL-003** — Single server isolates ≥2 concurrent projects
- **GOAL-004** — TUI + CLI + MCP each execute all documented operations
- **GOAL-005** — All internal entities readable via MCP with no missing/stale fields
- **GOAL-006** — ≥90% unit test line coverage (`cargo-llvm-cov`)
- **GOAL-007** — ≥80% E2E test line coverage
- **GOAL-008** — ≥50% E2E coverage per interface (CLI, TUI, MCP individually)
- **GOAL-009** — `./do` script present and functional from first commit
- **GOAL-010** — Glass-Box MCP operational from first server-startable commit

### Tech Stack
| Component | Technology |
|---|---|
| Server + all clients | Rust stable, single Cargo workspace |
| gRPC transport | `tonic` |
| State persistence | git (`git2` crate), `.devs/` directory |
| Coverage | `cargo-llvm-cov` |
| CI | GitLab CI — Linux + macOS + Windows |

### MVP Scope Boundary
- **In scope:** DAG workflows (Rust builder API + TOML/YAML), 5 agent adapters, pool routing, 3 execution envs (tempdir/Docker/remote SSH), completion signals (exit_code/structured_output/mcp_tool_call), artifact collection, git-backed state, TUI+CLI+MCP clients, multi-project, outbound webhooks, manual triggers (CLI/MCP)
- **Out of scope (post-MVP):** GUI, REST API, client auth, external secrets manager, automated triggers (cron/webhook/file-watch)

---

## 2. `./do` Entrypoint Contract

Commands: `setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, `ci`

- **[1_PRD-BR-001]** `./do presubmit` enforces hard 15-minute wall-clock timeout; kills children and exits non-zero on breach
- **[1_PRD-BR-002]** `./do setup` is idempotent
- **[1_PRD-BR-003]** Unknown subcommand → print valid list to stderr, exit non-zero
- `./do lint` runs: `cargo fmt --check`, `cargo clippy --workspace --all-targets -- -D warnings`, `cargo doc --no-deps`
- `./do coverage` produces `target/coverage/report.json` with per-gate `actual_pct`, `threshold_pct`, `passed`, `delta_pct`

### Quality Gates
| Gate | Scope | Threshold |
|---|---|---|
| QG-001 / KPI-001 | All crates, unit tests | ≥90% line coverage |
| QG-002 / KPI-002 | All crates, E2E aggregate | ≥80% line coverage |
| QG-003 / KPI-003 | CLI E2E only | ≥50% line coverage |
| QG-004 / KPI-004 | TUI E2E only | ≥50% line coverage |
| QG-005 / KPI-005 | MCP E2E only | ≥50% line coverage |

- **[1_PRD-BR-004]** Every PRD requirement has ≥1 automated test identified by req ID
- **[1_PRD-BR-005]** TUI tests use text-snapshots + state assertions; pixel comparison prohibited
- **[1_PRD-BR-006]** All public Rust items have doc comments (enforced by `cargo doc`)
- **[1_PRD-BR-007]** All code passes `cargo fmt --check` + `cargo clippy -D warnings`

---

## 3. Personas & User Needs

### 3.1 Primary Persona: Developer of `devs`
Interacts via TUI (monitor), CLI (submit/script), `./do` (build/test). Never writes code directly — delegates to AI agents. Expects identical behaviour on Linux/macOS/Windows.

**Key business rules:**
- **[2_PRD-BR-001]** MCP must expose every entity in the data model with no field omitted
- **[2_PRD-BR-002]** Unpopulated fields (e.g. `completed_at` on running stage) → typed null, never absent
- **[2_PRD-BR-003]** Stage not complete if any covering test is failing/absent
- **[2_PRD-BR-004]** Two stages with no shared deps start within 100 ms of each other
- **[2_PRD-BR-005]** Stages in tempdir/docker/remote must not share filesystem namespace
- **[2_PRD-BR-006]** `./do` produces identical exit codes on Linux/macOS/Windows

### 3.2 Secondary Persona: AI Agent Clients
Two roles: orchestrated agents (spawned as stages, call back via MCP) and observing/controlling agents (build `devs` using MCP+CLI).

**MCP tool requirements:**
- Observation: `list_runs`, `get_run`, `get_stage_output`, `stream_logs`, `get_pool_state`, `get_workflow_definition`, `list_checkpoints`
- Control: `submit_run`, `cancel_run/stage`, `pause_run/stage`, `resume_run/stage`, `write_workflow_definition`
- Testing: `inject_stage_input`, `assert_stage_output`
- Mid-run agent→devs: `report_progress`, `signal_completion`, `report_rate_limit`

**[2_PRD-BR-007]** All MCP tools return structured JSON; no plain text as primary response
**[2_PRD-BR-008]** All MCP responses include `"error": null | "string"`
**[2_PRD-BR-009]** `submit_run` validates all inputs before creating run
**[2_PRD-BR-010]** All CLI commands support `--format json`
**[2_PRD-BR-011]** CLI exit codes: 0=success, 1=general error, 2=not found, 3=server unreachable, 4=validation error
**[2_PRD-BR-012]** JSON error format: `{ "error": "...", "code": <n> }` to stdout

---

## 4. Core Features & Requirements

### 4.1 Server Architecture
- **[1_PRD-REQ-001]** Headless gRPC server; all clients connect over gRPC
- **[1_PRD-REQ-002]** Single Cargo workspace (server + TUI + CLI + MCP)
- **[1_PRD-REQ-003]** Startup writes listen addr to `~/.config/devs/server.addr`; test isolation uses `DEVS_DISCOVERY_FILE` env var
- Discovery file: plain UTF-8 `<host>:<port>`, written atomically after both ports bound
- **[3_PRD-BR-001]** Server must not start if gRPC port in use
- **[3_PRD-BR-002]** Discovery file written only after both gRPC and MCP ports bound
- **[3_PRD-BR-003]** Config errors reported to stderr before any port binding
- **[3_PRD-BR-004]** Client major version mismatch → `FAILED_PRECONDITION`
- **[3_PRD-BR-005]** Discovery file cleaned up on SIGTERM; clients handle stale file with exit code 3

**gRPC Services:** `WorkflowService`, `StageService`, `WorkflowDefinitionService`, `PoolService`, `McpAgentService`, `TestingService`

**Startup sequence:** parse config → validate → bind gRPC → bind MCP → init pool → restore checkpoints → write discovery file → accept connections → resume checkpointed runs

### 4.2 Workflow Definition
- **[1_PRD-REQ-004–009]** DAGs, parallel dispatch, Rust builder API + TOML/YAML, typed inputs with `{{template}}` syntax, UUID+slug run identity, snapshot on run start
- **Validation order (all errors collected):** schema → stage name uniqueness → dependency existence → cycle detection (Kahn's) → pool existence → handler existence → default type coercion → prompt mutual exclusivity → fan-out+completion compatibility
- Cycle error format: `{ "error": "cycle detected", "cycle": ["a","b","c","a"] }`
- **[3_PRD-BR-006]** Cycle → rejected with full cycle path
- **[3_PRD-BR-007]** Unknown pool name → rejected at submission
- **[3_PRD-BR-008]** Duplicate run names (non-cancelled) → atomic rejection
- **[3_PRD-BR-009]** Snapshot immutable after Pending→Running
- **[3_PRD-BR-010]** Zero-stage workflow rejected
- Snapshot stored at `.devs/runs/<run-id>/workflow_snapshot.json`

**Run slug format:** `<workflow-name>-<YYYYMMDD>-<4 random hex>`, max 128 chars, `[a-z0-9-]+`

### 4.3 Stage Inputs
- **[1_PRD-REQ-010]** Prompt string/file, system prompt, env vars
- Template resolution order: `{{workflow.input.<name>}}` > `{{stage.<name>.exit_code}}` > `{{stage.<name>.output.<field>}}` > `{{stage.<name>.stdout}}` > `{{stage.<name>.stderr}}`; also `{{run.id}}`, `{{run.slug}}`, `{{run.name}}`
- Missing variable → stage fails immediately (not silently empty-string)
- Cross-stage refs only valid if stage is in `depends_on` transitive closure
- Env inheritance: server env → workflow env → stage env (later overrides earlier); `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` stripped from agent env
- **[3_PRD-BR-011]** At least one of prompt/prompt_file required
- **[3_PRD-BR-012]** prompt + prompt_file mutually exclusive
- **[3_PRD-BR-013]** Env keys must match `[A-Z_][A-Z0-9_]{0,127}`
- **[3_PRD-BR-014]** prompt_file resolved at execution time; missing file → stage fails

### 4.4 Stage Completion Signals
- **`exit_code`:** exit 0 = Completed, non-zero = Failed; timeout → SIGTERM → 5s → SIGKILL → TimedOut
- **`structured_output`:** reads `.devs_output.json` (priority) or last JSON object on stdout; must contain `"success": bool`; if invalid JSON → Failed
- **`mcp_tool_call`:** agent calls `signal_completion`; fallback to exit code if process exits without calling it
- **[3_PRD-BR-015]** `.devs_output.json` takes precedence; invalid file → Failed regardless of exit code
- **[3_PRD-BR-016]** `signal_completion` idempotent on first call; subsequent calls on terminal stage → error, no state change
- **[3_PRD-BR-017]** `exit_code` always recorded in `StageRun.exit_code` regardless of mechanism

### 4.5 Data Flow Between Stages
- Context file `.devs_context.json` written atomically before agent spawn; max 10 MiB (truncates stdout/stderr proportionally with warning)
- Only terminal-state stages included in context file
- **[3_PRD-BR-018]** Template refs only resolve against transitive `depends_on` closure
- **[3_PRD-BR-019]** `output.<field>` ref on exit_code-only stage → immediate failure, not empty string
- **[3_PRD-BR-020]** Context file written atomically; failure to write → stage fails before agent spawn

### 4.6 Agent Adapters
- **[1_PRD-REQ-013–018]** 5 adapters: claude, gemini, opencode, qwen, copilot; extensible trait; flag-based or file-based prompt; PTY support; bidirectional mid-run interaction; passive+active rate-limit detection

| Adapter | Default prompt_mode | Default pty |
|---|---|---|
| claude | flag (`--print`) | false |
| gemini | flag (`--prompt`) | false |
| opencode | file (`--prompt-file`) | true |
| qwen | flag (`--query`) | false |
| copilot | file (`--stdin`) | false |

- Rate-limit passive detection: exit code 1 + stderr patterns per adapter (e.g. claude: `"rate limit"`, `"429"`, `"overloaded"`)
- Agent→devs: via `DEVS_MCP_ADDR` env var; devs→agent: stdin tokens `devs:cancel\n`, `devs:pause\n`, `devs:resume\n` or SIGTERM
- **[3_PRD-BR-021]** Binary not found → immediate fail, no retry
- **[3_PRD-BR-022]** PTY allocation failure → immediate fail, no retry
- **[3_PRD-BR-023]** `DEVS_MCP_ADDR` injected into every agent process

### 4.7 Agent Pools
- **[1_PRD-REQ-019–021]** Named pools shared across projects; fallback order + capability tag routing; `max_concurrent` enforced
- Selection algorithm: filter by capabilities → on attempt 1 use non-fallback first → skip rate-limited agents → acquire semaphore slot or queue (FIFO)
- Empty capability tag `[]` on agent = satisfies any requirement
- Rate-limit cooldown: 60 seconds; pool exhaustion fires `PoolExhausted` webhook once per episode
- **[3_PRD-BR-024]** `max_concurrent` is a hard limit across all projects
- **[3_PRD-BR-025]** Unsatisfied capability → immediate Failed (not queued)
- **[3_PRD-BR-026]** `PoolExhausted` webhook fires exactly once per exhaustion episode

### 4.8 Execution Environments
- **[1_PRD-REQ-022–023]** tempdir (local clone), docker (DOCKER_HOST), remote SSH
- Clone: shallow `--depth 1` by default; `full_clone = true` available
- Clone paths: tempdir→`<os-temp>/devs-<run-id>-<stage-name>/repo/`, docker→`/workspace/repo/`, remote→`~/devs-runs/<run-id>-<stage-name>/repo/`
- Auto-collect: diff → `git add -A` → commit `devs: auto-collect stage <name> run <id>` → push to checkpoint branch
- **[3_PRD-BR-027]** Each stage execution fully isolated (run-id + stage-name in path)
- **[3_PRD-BR-028]** Working dir cleaned up after every stage regardless of outcome
- **[3_PRD-BR-029]** Auto-collect pushes to checkpoint branch only, not main

### 4.9 Fan-Out
- Config: `fan_out.count` (fixed N, max 64) XOR `fan_out.input_list` (per-item, max 64); optional `merge_handler`
- Template vars injected: `{{fan_out.index}}` (always) + `{{fan_out.item}}` (input_list mode)
- All sub-agents compete independently for pool slots; each in isolated execution env
- Default merge: `{ "fan_out_results": [{ "index", "item", "success", "exit_code", "output" }] }`
- **[3_PRD-BR-030]** count and input_list mutually exclusive
- **[3_PRD-BR-031]** count=0 or empty input_list → rejected at validation
- **[3_PRD-BR-032]** Any sub-agent failure with no custom merge handler → stage Failed, lists failed indices
- **[3_PRD-BR-033]** Fan-out waits for ALL sub-agents before merge/advance

### 4.10 Retry and Timeouts
- **[1_PRD-REQ-027–028]** Per-stage retry (max 1–10 attempts, Fixed/Exponential backoff) + branch loopback; per-stage + workflow-level timeouts
- Exponential delay: `min(backoff_secs^N, 300)` seconds
- Rate-limit events do NOT increment retry counter; only genuine failures do
- Timeout sequence: stdin `devs:cancel\n` → 5s grace → SIGTERM → 5s → SIGKILL → TimedOut
- **[3_PRD-BR-034]** stage.timeout_secs must not exceed workflow.timeout_secs (validation error)
- **[3_PRD-BR-035]** Rate-limit events don't increment `StageRun.attempt`
- **[3_PRD-BR-036]** After max_attempts exhausted → Failed; branch conditions evaluated

### 4.11 State Persistence
- **[1_PRD-REQ-029–032]** Git-backed via `git2`; configurable checkpoint branch (default `devs/state`)
- Directory layout: `.devs/runs/<run-id>/workflow_snapshot.json`, `checkpoint.json`, `stages/<name>/attempt_<N>/`; `.devs/logs/<run-id>/<stage>/attempt_<N>/stdout.log`, `stderr.log`
- Checkpoint commit message: `devs: checkpoint <run-id> stage=<name> status=<status>`
- Git author: `devs <devs@localhost>` for all generated commits
- Retention: `max_age_days` (default 30) + `max_size_mb` (default 500); sweeps at startup + every 24h; whole runs deleted atomically
- Crash recovery: stages Running at crash → reset to Eligible; stages Eligible at crash → re-queued; Pending runs → re-queued
- **[3_PRD-BR-037]** `checkpoint.json` written atomically (write-temp-rename); disk-full → log error, don't crash
- **[3_PRD-BR-038]** Checkpoint branch created as orphan if absent
- **[3_PRD-BR-039]** Snapshot written and committed before first stage transitions Waiting→Eligible

### 4.12 Multi-Project Support
- **[1_PRD-REQ-033–034]** Single server, shared pool; strict priority or weighted fair queuing
- Project registry: `~/.config/devs/projects.toml` (managed by `devs project add/remove`)
- Each project has `priority` (u32) for strict mode and `weight` (u32, min 1) for weighted mode
- Weighted: tracks virtual_time per project; dispatches from min(virtual_time/weight)
- **[3_PRD-BR-040]** Strict mode: lower-priority never dispatched while higher-priority has eligible stages
- **[3_PRD-BR-041]** weight=0 rejected at registration
- **[3_PRD-BR-042]** Project removed while runs active: active runs complete; no new submissions accepted

### 4.13 Workflow Triggers (MVP: manual only)
- **[1_PRD-REQ-035]** CLI `devs submit` and MCP `submit_run` only
- Validation order: workflow exists → inputs valid → no duplicate name → create run
- **[3_PRD-BR-043]** Steps 1–3 atomic with respect to run creation (per-project lock)
- **[3_PRD-BR-044]** `--project` required when cwd doesn't resolve to exactly one project

### 4.14 Webhooks
- **[1_PRD-REQ-036–037]** Outbound HTTP POST per-project; events: `run.started/completed/failed/cancelled`, `stage.started/completed/failed/timed_out`, `pool.exhausted`, `state.changed`
- Delivery: at-least-once; 10s timeout per attempt; fixed backoff; 64 KiB payload limit (truncate with `"truncated": true`)
- **[3_PRD-BR-045]** Delivery failures logged at WARN; do not affect run/stage status
- **[3_PRD-BR-046]** `pool.exhausted` fires at most once per exhaustion episode
- **[3_PRD-BR-047]** Webhook delivery is fire-and-forget; stage never waits for ACK

### 4.15 Client Interfaces

**TUI (Ratatui, gRPC streaming):**
- Tabs: Dashboard (DAG + log tail), Logs, Debug, Pools
- Refresh driven by `StreamRunEvents` gRPC push; re-render within 50ms of event
- Max 10,000 log lines in memory per stage
- ASCII DAG rendering with stage names, statuses, elapsed times
- **[3_PRD-BR-048]** Auto-reconnect up to 30s exponential backoff; exit after 5s more
- **[3_PRD-BR-005]** TUI tests use text-snapshots (`.txt` fixtures), headless terminal emulator

**CLI:**
Commands: `submit`, `list`, `status`, `logs`, `cancel`, `pause`, `resume`
- All commands support `--format json` and `--server <host:port>`
- `devs logs` supports `--follow`; exits 0 on run completion, 1 on failure
- **[3_PRD-BR-049]** UUID and slug both accepted; UUID takes precedence on collision

**MCP Server (Glass-Box, separate port):**
- Full tool list: see §2 above for all tool names
- MCP stdio bridge (`devs-mcp-bridge`): forwards stdin JSON-RPC to MCP port; structured error on connection loss
- **[3_PRD-BR-050]** stdio bridge forwards faithfully, no buffering

### 4.16 Server Configuration
- **[1_PRD-REQ-042–044]** `devs.toml` (server settings + pool defs) + separate project registry
- Config override precedence: CLI flag > env var > `devs.toml` > built-in default
- Env var naming: `DEVS_` prefix + uppercase key (e.g. `server.listen` → `DEVS_LISTEN`)
- Credentials: env vars preferred; TOML fallback with documented security caveat; startup warning logged when `*_API_KEY` or `*_TOKEN` found in TOML
- **[3_PRD-BR-051]** Invalid `devs.toml` rejected before port binding; all errors reported
- **[3_PRD-BR-052]** Config precedence strictly enforced
- **[3_PRD-BR-053]** Registry file written atomically

---

## 5. Data Models (Key Types)

```
WorkflowDefinition: name[a-z0-9-_,≤128] | format | inputs[≤64] | stages[1-256] | timeout? | default_env? | artifact_collection

WorkflowInput: name[a-z0-9_,≤64] | type{String,Path,Integer,Boolean} | required | default?

StageDefinition: name[≤128,unique] | pool | prompt XOR prompt_file | system_prompt? | depends_on[] | required_capabilities[] | completion{exit_code,structured_output,mcp_tool_call} | env[≤256] | execution_env? | retry? | timeout? | fan_out? XOR branch?

RetryConfig: max_attempts[1-20] | backoff{Fixed,Exponential,Linear} | initial_delay | max_delay?

WorkflowRun: run_id(UUID4) | slug | workflow_name | project_id | status{Pending,Running,Paused,Completed,Failed,Cancelled} | inputs | definition_snapshot(immutable) | created_at | started_at? | completed_at? | stage_runs[]

StageRun: stage_run_id(UUID4) | run_id | stage_name | attempt(1-based) | status{Pending,Waiting,Running,Paused,Completed,Failed,Cancelled,TimedOut} | agent_tool? | pool_name | started_at? | completed_at? | exit_code? | output?

StageOutput: stdout(≤1MiB) | stderr(≤1MiB) | structured(JSON?) | exit_code | log_path | truncated

AgentPool: name | max_concurrent[1-1024] | agents[≥1,ordered by priority]

AgentConfig: tool{claude,gemini,opencode,qwen,copilot} | capabilities[] | fallback | prompt_mode{flag,file} | pty | env[]
```

**RunStatus transitions:** Pending→Running→{Paused↔Running}→{Completed|Failed|Cancelled}
**StageStatus transitions:** Pending→Waiting→Running→{Paused↔Running}→{Completed|Failed|TimedOut|Cancelled}; Failed/TimedOut→Pending (retry)

---

## 6. gRPC API Surface

Services: `WorkflowService` (register/delete/get/list workflows), `RunService` (submit/get/list/cancel/pause/resume/watch), `StageService` (get/pause/resume/retry/cancel/get-output), `LogService` (stream/fetch logs), `PoolService` (get-status/list/watch), `ProjectService` (add/remove/get/list/update)

Proto package: `devs.v1`. All timestamps: ISO 8601. All UUIDs: string.

---

## 7. Checkpoint File Layout

```
.devs/
  runs/<run-id>/
    workflow_snapshot.json   # immutable, written before first stage
    checkpoint.json          # mutable, written atomically after each transition
    stages/<stage>/attempt_<N>/
      structured_output.json
      context.json
  logs/<run-id>/<stage>/attempt_<N>/
    stdout.log
    stderr.log
```

`checkpoint.json` schema version: `1`. Contains full `WorkflowRun` + all `StageRun` records.

---

## 8. Non-Goals (Post-MVP)

- **GUI / REST API** — No HTTP listener, no web framework crate in non-dev deps
- **Client authentication** — Server is trusted-network only; no auth middleware
- **External secrets manager** — Credentials from env vars or TOML only; no Vault/AWS/GCP SDKs
- **Automated triggers** — `[triggers]` section in devs.toml causes startup error at MVP; only `submit_run` gRPC and MCP create runs

Architecture is forward-compatible: post-MVP GUI/REST wrap same gRPC service objects; auth added as interceptor; triggers call same `SubmitRun` handler.

---

## 9. Traceability & KPI Requirements

- `./do test` generates `target/traceability.json`; fails if any `1_PRD-REQ-*` tag in `docs/plan/specs/1_prd.md` has zero covering tests
- Test annotation convention: `// Covers: 1_PRD-REQ-NNN` comment or `#[doc = "Covers: ..."]` attribute
- Stale req tag in test → `./do test` exits non-zero
- `./do coverage` generates `target/coverage/report.json` with fields: `gate_id`, `threshold_pct`, `actual_pct`, `passed`, `delta_pct`, `overall_passed`
- KPI-006: presubmit ≤15 min on all 3 CI platforms; timing logged to `target/presubmit_timings.jsonl`
- KPI-007: GitLab CI matrix — `presubmit-linux` + `presubmit-macos` + `presubmit-windows` all must pass
- KPI-008: All 5 agent adapters implemented + unit tested + E2E integration tested
- KPI-009: All 3 execution environments implemented + unit tested + E2E integration tested
- KPI-010: 100% requirement traceability (`traceability_pct == 100.0`)
