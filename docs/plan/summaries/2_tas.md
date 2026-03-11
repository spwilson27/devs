# Summary: TAS — Technical Architecture Specification (`2_TAS`)

`devs` is a Rust workspace implementing an AI-agent workflow orchestration server. This document is the authoritative implementation contract: it specifies every crate, dependency version, algorithm, state machine, file schema, wire format, and quality gate that implementing agents must follow without deviation.

---

## §1 Architecture Overview

### Layered Topology (strict unidirectional dependency, enforced by Rust visibility)

1. **Client Layer** — `devs-tui` (Ratatui), `devs-cli` (Clap), `devs-mcp-bridge` (stdio→MCP HTTP proxy)
2. **Interface Layer** — gRPC (`tonic`, `devs.v1`) + MCP HTTP/JSON-RPC on separate port; no business logic **[2_TAS-REQ-001a]**
3. **Engine Layer** — DAG Scheduler, Agent Pool Manager, Stage Executor, Agent Adapters (5), Webhook Dispatcher; communicate via `tokio::sync::mpsc` / `broadcast` / `Arc<RwLock<...>>`
4. **Infrastructure Layer** — Checkpoint Store (`git2`), Config/Registry loader, Template Engine; stateless, no upward dependencies **[2_TAS-REQ-001b]**

**Key invariants:**
- **[2_TAS-REQ-001c]** MCP and gRPC share the same `Arc<RwLock<SchedulerState>>`; no IPC between them
- **[ARCH-BR-001]** Exactly two TCP ports exposed (gRPC + MCP); no REST, no Unix sockets
- **[ARCH-BR-005/006]** All blocking I/O (`git2`, subprocess `wait()`, SSH) dispatched via `tokio::task::spawn_blocking`; exactly one Tokio runtime per process
- **[ARCH-BR-007]** `devs.toml` immutable after startup; project registry is the only live-update exception
- **[ARCH-BR-008]** All logging uses `tracing`; `println!`/`eprintln!`/`log::` prohibited in library crates

### Cargo Workspace Crates

| Crate | Type | Role |
|---|---|---|
| `devs-proto` | lib | `tonic-build` generated types; re-exports under `devs_proto::devs::v1` |
| `devs-core` | lib | Domain types, `StateMachine` trait, `TemplateResolver`, `ValidationError`; **zero** I/O deps **[2_TAS-REQ-001e]** |
| `devs-config` | lib | `devs.toml` + `projects.toml` parsing; precedence resolution |
| `devs-checkpoint` / `devs-checkpoint` | lib | `git2`-backed checkpoint store; `CheckpointStore` trait |
| `devs-adapters` | lib | `AgentAdapter` trait + 5 impls (claude, gemini, opencode, qwen, copilot) |
| `devs-pool` | lib | Semaphore concurrency, capability routing, fallback, rate-limit cooldown |
| `devs-executor` | lib | Tempdir/Docker/SSH execution environments; repo cloning; artifact collection |
| `devs-scheduler` / `devs-scheduler` | lib | DAG scheduler; stage state machine; fan-out; retry/timeout |
| `devs-webhook` | lib | At-least-once HTTP delivery; `reqwest`; retry backoff |
| `devs-grpc` | lib | Six `tonic` service implementations; thin adapter only |
| `devs-mcp` | lib | MCP HTTP/JSON-RPC server; all Glass-Box tools |
| `devs-server` | bin | Wires all crates; startup/shutdown sequencing |
| `devs-tui` | bin | Ratatui dashboard; gRPC client |
| `devs-cli` | bin | Clap CLI; gRPC client |
| `devs-mcp-bridge` | bin | stdin→MCP HTTP proxy; depends only on `devs-core` |

**[2_TAS-REQ-001g]** Wire types from `devs-proto` MUST NOT appear in public APIs of `devs-scheduler`, `devs-executor`, or `devs-pool` — all cross-crate engine communication uses `devs-core` types.

**[2_TAS-REQ-001d]** All crates are workspace members; no library crate has external non-dev deps not in §2.2.

### Startup Sequence **[2_TAS-REQ-001]** (abort on first unrecoverable error)

1. Parse CLI flags + env overrides
2. Parse `devs.toml` — collect **all** errors before reporting **[2_TAS-REQ-001h]**; exit non-zero if any; no port bound yet
3. Bind gRPC port (fail: `EADDRINUSE`)
4. Bind MCP port (fail: release gRPC port first) **[2_TAS-REQ-001i]**
5. Initialize Agent Pool Manager
6. Load/create project registry (`~/.config/devs/projects.toml`)
7. Scan workflow definition files per project
8. Restore checkpoints from git: `Running` stages → `Eligible`; `Waiting`/`Eligible` → re-queued; `Pending` runs → re-queued; per-project failures are non-fatal (log `ERROR`, continue) **[2_TAS-REQ-001k]**
9. Write discovery file atomically (write-to-tmp → `rename(2)`) **[2_TAS-REQ-001j]**
10. Accept connections on both ports
11. Resume recovered runs via DAG Scheduler

Discovery file path precedence: `DEVS_DISCOVERY_FILE` env var → `server.discovery_file` in `devs.toml` → `~/.config/devs/server.addr` **[ARCH-SR-002]**. Contains `<host>:<port>` plain UTF-8 (gRPC port only). MCP port retrieved via `ServerService.GetInfo` gRPC call **[ARCH-SR-006]**.

Missing `devs.toml` without `--config`: start with built-in defaults + `WARN` log **[2_TAS-REQ-001l]**. `--config` pointing to missing file: fatal before any port binding **[2_TAS-REQ-001m]**.

### Shutdown Sequence **[2_TAS-REQ-002]** (on `SIGTERM` / `Ctrl+C`)

1. Stop accepting new gRPC + MCP connections
2. Send `devs:cancel\n` to all running agent subprocesses
3. Wait 10 s for voluntary exit
4. SIGTERM to remaining; wait 5 s
5. SIGKILL to any still running
6. Flush all in-flight `git2` checkpoint writes
7. Delete discovery file **[2_TAS-REQ-002a]**
8. Exit 0

Second `SIGTERM` during shutdown → immediate SIGKILL to all agents **[2_TAS-REQ-002d]**. In-flight gRPC streaming receives `CANCELLED` **[2_TAS-REQ-002b]**. All `Running` state persisted with stages set to `Eligible` for crash-recovery **[2_TAS-REQ-002c]**.

### Concurrency Model

- **[2_TAS-REQ-002k]** Single multi-thread Tokio runtime; no additional runtimes
- **[2_TAS-REQ-002m]** `Arc<tokio::sync::RwLock<T>>` for read-heavy; `Arc<tokio::sync::Mutex<T>>` for write-heavy; `std::sync::*` MUST NOT be held across `.await` **[ARCH-BR-011]**
- **[2_TAS-REQ-002n]** Pool concurrency: `Arc<tokio::sync::Semaphore>` with `max_concurrent` permits via `.acquire_owned()`
- **[2_TAS-REQ-002p]** Lock acquisition order: `SchedulerState` → `PoolState` → `CheckpointStore`
- **[2_TAS-REQ-002q]** Webhook dispatcher channel buffer ≥ 1024; fire-and-forget

Internal channels:

| Channel | Type | Sender → Receiver |
|---|---|---|
| `stage_complete_tx` | `mpsc` | Stage Executor → DAG Scheduler |
| `webhook_tx` | `mpsc` | Any engine → Webhook Dispatcher |
| `cancel_tx` | `broadcast` | Scheduler/Interface → all Stage Executors |
| `pool_event_tx` | `mpsc` | Pool Manager → Scheduler |

### gRPC Services **[2_TAS-REQ-002r]**

Six services in `proto/devs/v1/`: `WorkflowDefinitionService`, `RunService`, `StageService`, `LogService`, `PoolService`, `ProjectService`. Reflection via `tonic-reflection` **[2_TAS-REQ-002u]**. Every unary response includes `string request_id` (UUID4) **[2_TAS-REQ-002s]**. Streaming RPCs release resources within 500 ms of client cancel **[2_TAS-REQ-002t]**.

gRPC error code mapping:

| Condition | Code |
|---|---|
| Not found | `NOT_FOUND` |
| Validation failure | `INVALID_ARGUMENT` |
| Duplicate / state conflict | `ALREADY_EXISTS` / `FAILED_PRECONDITION` |
| Version mismatch | `FAILED_PRECONDITION` |
| Resource exhausted | `RESOURCE_EXHAUSTED` |
| Unhandled internal | `INTERNAL` |

---

## §2 Technology Stack & Toolchain

### Rust Toolchain **[2_TAS-REQ-003/004]**

- MSRV: **1.80.0** stable (for `LazyLock`, `#[expect]`, RPITIT); no nightly features anywhere
- `rust-toolchain.toml`: `channel = "stable"`, components `rustfmt`, `clippy`, `llvm-tools-preview`
- Edition `"2021"` for all crates; `resolver = "2"` **[2_TAS-REQ-004d]**

Workspace lint table **[2_TAS-REQ-004a]**:
```toml
[workspace.lints.rust]
missing_docs    = "deny"
unsafe_code     = "deny"
unused_must_use = "deny"
dead_code       = "warn"
[workspace.lints.clippy]
all      = { level = "deny", priority = -1 }
pedantic = { level = "warn", priority = -1 }
module_name_repetitions = "allow"
must_use_candidate      = "allow"
```

- **[2_TAS-REQ-004b]** `unsafe_code = "deny"` workspace-wide; no `unsafe` in authored code
- **[2_TAS-REQ-004e]** No optional features for core business logic; TLS via `rustls-tls` only **[2_TAS-REQ-006]**

### Core Dependencies (authoritative version table) **[2_TAS-REQ-005]**

| Crate | Version | Features |
|---|---|---|
| `tokio` | 1.38 | `full` |
| `tonic` | 0.12 | `transport`, `codegen` |
| `prost` | 0.13 | `derive` |
| `tonic-build` | 0.12 | _(build dep)_ |
| `tonic-reflection` | 0.12 | `server` |
| `ratatui` | 0.28 | `crossterm` |
| `crossterm` | 0.28 | _(default)_ |
| `clap` | 4.5 | `derive`, `env` |
| `serde` | 1.0 | `derive` |
| `serde_json` | 1.0 | _(default)_ |
| `toml` | 0.8 | `serde` |
| `serde_yaml` | 0.9 | _(default)_ |
| `uuid` | 1.10 | `v4`, `serde` |
| `git2` | 0.19 | `ssh`, `https` |
| `reqwest` | 0.12 | `json`, `rustls-tls` |
| `tracing` | 0.1 | _(default)_ |
| `tracing-subscriber` | 0.3 | `env-filter`, `json` |
| `portable-pty` | 0.8 | _(default)_ |
| `tokio-stream` | 0.1 | `sync` |
| `handlebars` | 6.0 | _(default)_ |
| `chrono` | 0.4 | `serde` |
| `tempfile` | 3.12 | _(default)_ |
| `bytes` | 1.7 | _(default)_ |
| `thiserror` | 1.0 | _(default)_ — library crates only |
| `anyhow` | 1.0 | _(default)_ — binary crates only **[2_TAS-REQ-005a]** |

Dev dependencies: `cargo-llvm-cov 0.6`, `insta 1.40`, `mockall 0.13`, `bollard 0.17`, `wiremock 0.6`, `assert_cmd 2.0`, `predicates 3.1`, `tokio-test 0.4`, `rstest 0.22` **[2_TAS-REQ-007]**

**[2_TAS-REQ-007a]** `./do lint` includes a dependency audit: `cargo metadata` vs authoritative tables; undocumented crates fail lint.

### Protobuf Layout **[2_TAS-REQ-008]**

```
proto/devs/v1/
  common.proto  workflow_definition.proto  run.proto  stage.proto
  log.proto     pool.proto                 project.proto  server.proto
```

- All files: `syntax = "proto3"; package devs.v1;`; timestamp fields use `google.protobuf.Timestamp` **[2_TAS-REQ-008a]**
- Generated files committed to `devs-proto/src/gen/`; `build.rs` skips regen if `protoc` absent **[2_TAS-REQ-008b/d]**
- `ServerService.GetInfo` returns `server_version` + `mcp_port` **[2_TAS-REQ-009b]**
- Removed fields: add to `reserved` statement **[2_TAS-REQ-009a]**

### CI/CD Pipeline **[2_TAS-REQ-010]**

Three parallel GitLab CI jobs: `presubmit-linux` (Docker `rust:1.80-slim-bookworm`), `presubmit-macos` (shell), `presubmit-windows` (Git Bash shell). Each runs `./do setup && ./do presubmit`. Timeout: 25 min CI / 15 min `presubmit` hard wall-clock. Artifacts: `target/coverage/report.json`, `target/presubmit_timings.jsonl`, `target/traceability.json` (`expire_in: 7 days`, `when: always`).

### `./do` Script **[2_TAS-REQ-014]**

POSIX `sh` (no bash-specific syntax). Commands:

| Command | Action |
|---|---|
| `setup` | Install Rust ≥1.80, `cargo-llvm-cov 0.6`, `protoc`, `git`; idempotent |
| `build` | `cargo build --workspace --release` |
| `test` | `cargo test --workspace` + generate `target/traceability.json` (100% coverage required) |
| `lint` | `cargo fmt --check`, `cargo clippy -D warnings`, `cargo doc` (zero warnings), dep audit |
| `format` | `cargo fmt --all` |
| `coverage` | `cargo llvm-cov` unit + E2E; generate `target/coverage/report.json` |
| `presubmit` | setup→lint→test→coverage; 15 min hard timeout with background timer kill |
| `ci` | Push temp branch, trigger GitLab pipeline, poll 30 min, clean up |

Timings logged to `target/presubmit_timings.jsonl` per step **[2_TAS-REQ-014d]**.

### Coverage Gates **[2_TAS-REQ-015]**

| Gate | Scope | Threshold |
|---|---|---|
| QG-001 | Unit tests, all crates | ≥ 90.0% line |
| QG-002 | E2E aggregate | ≥ 80.0% line |
| QG-003 | E2E CLI interface | ≥ 50.0% line |
| QG-004 | E2E TUI interface | ≥ 50.0% line |
| QG-005 | E2E MCP interface | ≥ 50.0% line |

E2E tests in `tests/` run with `--test-threads 1`; each test sets `DEVS_DISCOVERY_FILE` to a unique temp path **[2_TAS-REQ-015b]**. TUI tests use `ratatui::backend::TestBackend` + `insta` snapshots (no screenshots) **[2_TAS-REQ-015f]**.

Traceability: `./do test` scans for `// Covers: 2_TAS-REQ-NNN` annotations; exits non-zero if any req ID has zero tests or any annotation references a non-existent ID **[2_TAS-REQ-014f]**.

---

## §3 Data Model

### Persistence Strategy **[2_TAS-REQ-014 (data)]**

No relational database. All state in JSON files committed to project git repo under `.devs/`. In-process state in `Arc<RwLock<...>>`. Restart recovers from git checkpoint files.

### Core Types (all in `devs-core/src/types.rs`, derived `Serialize`/`Deserialize`)

**WorkflowDefinition**: `name: BoundedString<128>` (`[a-z0-9_-]+`), `format: WorkflowFormat {Rust,Toml,Yaml}`, `inputs: Vec<WorkflowInput>` (max 64), `stages: Vec<StageDefinition>` (1–256), `timeout_secs: Option<u64>`, `default_env`, `artifact_collection: {AgentDriven,AutoCollect}`

**StageDefinition**: `name: BoundedString<128>`, `pool: String`, `prompt XOR prompt_file`, `system_prompt`, `depends_on: Vec<String>`, `required_capabilities`, `completion: {ExitCode,StructuredOutput,McpToolCall}`, `env: HashMap<EnvKey,String>` (max 256), `execution_env: Option<ExecutionEnv>`, `retry: Option<RetryConfig>`, `timeout_secs`, `fan_out XOR branch`

**RetryConfig**: `max_attempts: u8` (1–20), `backoff: {Fixed,Exponential,Linear}`, `initial_delay` (≥1s), `max_delay`

**FanOutConfig**: `count XOR input_list` (each max 64); **BranchConfig**: `handler` or `predicates: Vec<BranchPredicate>`

**WorkflowRun**: `run_id: Uuid`, `slug: RunSlug`, `workflow_name`, `project_id`, `status: RunStatus`, `inputs`, `definition_snapshot: WorkflowDefinition` (immutable after Pending→Running **[2_TAS-BR-013]**), timestamps, `stage_runs: Vec<StageRun>`

**RunStatus**: `{Pending, Running, Paused, Completed, Failed, Cancelled}`

**StageRun**: `stage_run_id`, `run_id`, `stage_name`, `attempt: u32` (1-based), `status: StageStatus`, `agent_tool`, `pool_name`, timestamps, `exit_code: Option<i32>`, `output: Option<StageOutput>`

**StageStatus**: `{Pending, Waiting, Eligible, Running, Paused, Completed, Failed, Cancelled, TimedOut}`

**StageOutput**: `stdout: BoundedBytes<1_048_576>`, `stderr: BoundedBytes<1_048_576>`, `structured: Option<Value>`, `exit_code: i32`, `log_path`, `truncated: bool`

**AgentPool**: `name`, `max_concurrent: u32` (1–1024), `agents: Vec<AgentConfig>` (≥1)

**AgentConfig**: `tool: AgentTool {Claude,Gemini,OpenCode,Qwen,Copilot}`, `capabilities`, `fallback: bool`, `prompt_mode: {Flag(String),File(String)}`, `pty: bool`, `env`

**Project**: `project_id: UUID4`, `name`, `repo_path`, `priority: u32`, `weight: u32` (≥1 **[2_TAS-BR-011]**), `checkpoint_branch` (default `"devs/state"`), `workflow_paths`, `webhook_targets`

**WebhookTarget**: `url: Url` (http/https only **[2_TAS-BR-012]**), `events: Vec<WebhookEvent>`, `secret: Option<String>`, `timeout_secs` (1–30, default 10), `max_retries` (0–10, default 3)

### Checkpoint File Layout **[2_TAS-REQ-016]**

```
.devs/
  runs/<run-id>/
    workflow_snapshot.json     # immutable; written before first stage starts
    checkpoint.json            # mutable; write-temp-rename after every transition
    stages/<stage-name>/attempt_<N>/
      structured_output.json   # completion=StructuredOutput only
      context.json             # .devs_context.json copy
  logs/<run-id>/<stage-name>/attempt_<N>/
    stdout.log  stderr.log
```

`checkpoint.json` schema **[2_TAS-REQ-017]**: `schema_version: 1` (reject others **[2_TAS-BR-026]**), `written_at`, full `WorkflowRun` with all `StageRun` records; stdout/stderr base64-encoded. Written via write-to-tmp → `rename()`. Git commit author: `devs <devs@localhost>`.

### State Machine Transitions **[2_TAS-REQ-019/020]**

**RunStatus legal transitions:**
```
Pending → Running → Paused ↔ Running → Completed
                            → Failed
                            → Cancelled
Pending → Cancelled
```

**StageStatus legal transitions:**
```
Pending → Waiting → Eligible → Running → Paused ↔ Running → Completed
                                                 → Failed → Pending (retry)
                                                 → TimedOut → Pending (retry)
                                                 → Cancelled
Waiting/Eligible → Cancelled
```

**[2_TAS-REQ-020a]** `StateMachine` trait rejects illegal transitions with `TransitionError::IllegalTransition`. All transitions persisted to `checkpoint.json` before events emitted to gRPC subscribers.

**[2_TAS-REQ-020b]** When `WorkflowRun` transitions to `Failed`/`Cancelled`, all non-terminal `StageRun` records transition to `Cancelled` in the **same atomic checkpoint write**.

### Type Constraints

- **`BoundedString<N>`**: UTF-8 byte len ≤ N; non-empty; `ValidationError::EmptyString` **[2_TAS-REQ-028]**
- **`EnvKey`**: regex `[A-Z_][A-Z0-9_]{0,127}`; prohibited keys: `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` (stripped from agent env) **[2_TAS-REQ-029]**; `DEVS_MCP_ADDR` injected into every agent
- **`RunSlug`**: `<workflow-name>-<YYYYMMDD>-<4 random lowercase alphanum>`, max 128 chars, `[a-z0-9-]+` **[2_TAS-REQ-030]**
- **UUIDs**: v4, lowercase hyphenated strings **[2_TAS-REQ-031]**

### Validation Order (single pass, all errors collected) **[2_TAS-REQ-032]**

1. Schema validation
2. Stage name uniqueness
3. `depends_on` references resolve
4. Cycle detection (Kahn's algorithm; error includes full cycle path)
5. Pool name exists
6. Named handler references registered
7. Default value type matches `InputKind`
8. `prompt` XOR `prompt_file`
9. `fan_out` XOR `branch`
10. `fan_out.count` XOR `fan_out.input_list`
11. Fan-out count/list limits (1–64)
12. `stage.timeout_secs` ≤ `workflow.timeout_secs`
13. At least one stage defined

### Context File (`.devs_context.json`) **[2_TAS-REQ-023a]**

Written atomically before agent spawn. Contains: `run` metadata, `inputs`, `stages` (only `Completed` stages in transitive `depends_on` closure, stdout/stderr as UTF-8 strings). Total size cap: 10 MiB; stdout/stderr truncated proportionally if exceeded; `truncated: true` added; `WARN` logged **[2_TAS-REQ-023b]**. Write failure → stage `Failed` without spawning agent **[2_TAS-REQ-023c]**.

### Structured Output (`.devs_output.json`) **[2_TAS-REQ-024a]**

```json
{ "success": <bool>, "output": {}, "message": "<optional>" }
```

Parsing rules: `.devs_output.json` takes priority over stdout JSON. `"success"` MUST be boolean (string `"true"` → `Failed`) **[2_TAS-REQ-024c]**. See full parsing table in §3.6.4.

### In-Memory Runtime State **[2_TAS-REQ-025]**

```rust
pub struct ServerState {
    pub runs: Arc<RwLock<HashMap<Uuid, WorkflowRun>>>,
    pub pools: Arc<RwLock<HashMap<String, PoolState>>>,
    pub projects: Arc<RwLock<HashMap<Uuid, Project>>>,
    pub run_events: Arc<RwLock<HashMap<Uuid, broadcast::Sender<RunEvent>>>>,
    pub config: Arc<ServerConfig>,
}
```

All mutations to `runs` **[2_TAS-REQ-027]**: acquire write lock → `StateMachine::transition()` → release lock → persist checkpoint → broadcast `RunEvent`. Steps 4+5 in that order.

### Key Business Rules

- **[2_TAS-BR-005]** Stage must have exactly one of `prompt` or `prompt_file`
- **[2_TAS-BR-007]** `FanOutConfig`: exactly one of `count` (1–64) or `input_list` (1–64 items)
- **[2_TAS-BR-008]** `RetryConfig.max_attempts` ∈ [1,20]
- **[2_TAS-BR-009]** Exponential backoff no `max_delay` → cap 300s; `initial_delay` ≥ 1s
- **[2_TAS-BR-014]** Rate-limit events do NOT increment `attempt`; only genuine failures do
- **[2_TAS-BR-015]** `exit_code` always recorded; SIGKILL → `-9`; timeout race → `null` until process exits
- **[2_TAS-BR-016]** Two `WorkflowRun` in same project MUST NOT share `slug` unless one is `Cancelled`; uniqueness check under per-project mutex **[2_TAS-BR-025]**
- **[2_TAS-BR-017]** `{{stage.<name>.*}}` valid only if `<name>` in transitive `depends_on` closure; resolved at execution time (not validation time)
- **[2_TAS-BR-027]** `prompt_file` resolved at execution time; missing file → `Failed` without spawning agent

### Error Handling (key rules)

- **[2_TAS-BR-019]** Corrupt `checkpoint.json` → log `ERROR`, skip run, mark `Unrecoverable`, continue
- **[2_TAS-BR-021]** Concurrent fan-out completions: serialized by per-run `Mutex`; write reflects all concurrent transitions
- **[2_TAS-BR-022]** Disk-full during checkpoint write → log `ERROR`, delete `.tmp`, continue; retry on next transition; server MUST NOT crash
- **[2_TAS-BR-023]** Stage output > 1 MiB: truncate to last 1,048,576 bytes (most recent); `truncated: true`; `WARN` log
- **[2_TAS-BR-024]** Template errors (invalid stage ref, no structured output, unknown input, missing required input, unknown output field) → `Failed` before agent spawn

---

## §4 Component Hierarchy & Core Modules

### `devs-core` StateMachine & TemplateResolver

**[2_TAS-REQ-102]** `StateMachine` trait:
```rust
pub trait StateMachine {
    type Event; type Error;
    fn transition(&mut self, event: Self::Event) -> Result<(), Self::Error>;
    fn is_terminal(&self) -> bool;
}
```
Events: `WorkflowRunEvent {Start,Pause,Resume,Complete,Fail,Cancel}`, `StageRunEvent {MakeEligible,Dispatch,Pause,Resume,Complete,Fail,TimeOut,Cancel,ScheduleRetry}`.

**[2_TAS-REQ-103]** `TemplateResolver` resolution priority (in order):
1. `{{workflow.input.<name>}}`
2. `{{run.id}}` / `{{run.slug}}` / `{{run.name}}`
3. `{{stage.<name>.exit_code}}`
4. `{{stage.<name>.output.<field>}}`
5. `{{stage.<name>.stdout}}` (truncated to 64 KiB for template use)
6. `{{stage.<name>.stderr}}` (truncated to 64 KiB)
7. `{{fan_out.index}}`
8. `{{fan_out.item}}`

No match → `Err(TemplateError::UnknownVariable)`; NEVER silently empty string.

### `devs-config` — `devs.toml` Schema

```toml
[server]
listen = "127.0.0.1:7890"   # gRPC
mcp_port = 7891
scheduling = "weighted"      # "strict" | "weighted"
[retention]
max_age_days = 30  max_size_mb = 500
[[pool]]
name = "primary"  max_concurrent = 4
  [[pool.agent]]
  tool = "claude"  capabilities = ["code-gen"]  fallback = false
```

Config override precedence: CLI flag → env var (`DEVS_` prefix + uppercase dotted path) → `devs.toml` → built-in default **[2_TAS-REQ-106]**.

**[2_TAS-REQ-107]** `~/.config/devs/projects.toml` per-project fields: `project_id`, `name`, `repo_path`, `priority`, `weight`, `checkpoint_branch`, `workflow_dirs`, `status` (`active`|`removing`), `[[project.webhook]]` sub-tables.

### Per-Project Webhook Configuration **[2_TAS-REQ-144–151]**

Max 16 targets per project. Fields: `webhook_id` (UUID4, system-assigned), `url` (http/https, max 2048), `events` (non-empty), `secret` (HMAC-SHA256 key), `timeout_secs` (1–30), `max_retries` (0–10).

Events: `run.started`, `run.completed`, `run.failed`, `run.cancelled`, `stage.started`, `stage.completed`, `stage.failed`, `stage.timed_out`, `pool.exhausted`, `state.changed` (superset).

Payload: HTTP POST, `Content-Type: application/json`, `X-Devs-Delivery: <UUID4>`. Max payload 64 KiB; truncate and set `"truncated": true`. HMAC-SHA256 header: `X-Devs-Signature-256: sha256=<hex>` when `secret` set **[2_TAS-REQ-148]**.

Retry backoff (fixed): attempt 1 immediate, 2 after 5s, 3 after 15s, N≥4 after `min(15×(N-1), 60)s`. After `max_retries+1` failures: `WARN` logged. Delivery MUST NOT block scheduler **[2_TAS-BR-WH-004]**.

`pool.exhausted` fires at most once per exhaustion episode **[2_TAS-BR-WH-003]**. `state.changed` + specific events → exactly one POST per transition **[2_TAS-BR-WH-005]**.

### `devs-checkpoint` (Git Checkpoint Store) **[2_TAS-REQ-108]**

Uses `git2` exclusively (no shell-out). Author: `devs <devs@localhost>`. Operates on bare clone at `~/.config/devs/state-repos/<project-id>.git`.

Atomic write protocol **[2_TAS-REQ-109]**: serialize → write to `.tmp` → `fsync` → `rename()` → `git add` → `git commit` → push to checkpoint branch. Push failure → `WARN`, retain local commit, retry on next checkpoint.

Crash-recovery in `load_all_runs` **[2_TAS-REQ-110]**: `Running` → `Eligible`; `Eligible` → remain; `Running` with all terminal stages → `Completed`/`Failed`; `Pending` → re-queue.

Retention sweep **[2_TAS-REQ-111]**: at startup + every 24h; phase 1 age-based (`max_age_days`); phase 2 size-based (`max_size_mb`); sorts by `completed_at` asc; never deletes active runs; commits deletions to checkpoint branch.

### `devs-scheduler` (DAG Scheduler) **[2_TAS-REQ-028–030c]**

Event-driven loop; `SchedulerEvent` enum via `mpsc`. Dispatch newly eligible stages within 100ms of dependency completion **[2_TAS-REQ-029/030b]**.

Validation runs 11 checks in order, all errors collected before returning **[2_TAS-REQ-030a]** (same as §3 §3.8.5).

Fan-out orchestration **[2_TAS-REQ-030c]**: N sub-executions as distinct `StageRun` records with `fan_out_index`; stored in parent's `fan_out_sub_runs` (not top-level `stage_runs`); merge handler or default (any fail → parent `Failed` with `{ "failed_indices": [...] }`).

Scheduler invariants **[2_TAS-REQ-112]**:
1. `Waiting` → `Eligible` within one tick after last dep completes
2. Dispatch only when ALL `depends_on` are `Completed` (not Failed/Cancelled/TimedOut)
3. `Failed`/`TimedOut`/`Cancelled` dep with no retry → all downstream → `Cancelled` immediately
4. Duplicate terminal events for same stage: second discarded (idempotent)

Multi-project scheduling **[2_TAS-REQ-033a]**:
- **Strict**: lowest `priority` value first; FIFO within tier
- **Weighted fair queue**: `virtual_time / weight`; increment `virtual_time` by `1.0/weight` on dispatch; tie-break by `project_id` string order

Retry backoff **[2_TAS-REQ-033b]**: `Fixed` = `initial_delay` every attempt; `Exponential` = `min(initial^attempt, max_delay.unwrap_or(300))`; `Linear` = `min(initial×attempt, max_delay.unwrap_or(300))`. Implemented via `tokio::time::sleep` + `RetryScheduled` event.

### `devs-pool` (Agent Pool Manager) **[2_TAS-REQ-031–033]**

Agent selection for `required_capabilities = [C1, C2, ...]`:
1. Filter to agents whose capabilities ⊇ required (empty caps satisfies any) → none: `Err(PoolError::UnsatisfiedCapability)` → immediate `Failed`
2. Exclude rate-limited (60s cooldown after rate-limit event **[2_TAS-REQ-114]**)
3. Attempt 1: prefer non-fallback; if all non-fallback rate-limited, use fallback
4. Acquire semaphore permit (blocks at `max_concurrent`)

`PoolExhausted` webhook fires once per episode (all agents unavailable → any available) **[2_TAS-REQ-115]**.

### `devs-adapters` **[2_TAS-REQ-034–039]**

`AgentAdapter` trait: `tool()`, `build_command(ctx: &StageContext) -> AdapterCommand`, `detect_rate_limit(exit_code, stderr) -> bool`.

Default adapter configs:

| Adapter | `prompt_mode` | Flag/file arg | `pty` default |
|---|---|---|---|
| `claude` | `flag` | `--print` | `false` |
| `gemini` | `flag` | `--prompt` | `false` |
| `opencode` | `file` | `--prompt-file` | `true` |
| `qwen` | `flag` | `--query` | `false` |
| `copilot` | `file` | `--stdin` | `false` |

Rate-limit detection (exit code 1 AND stderr matches, case-insensitive):
- `claude`: `"rate limit"`, `"429"`, `"overloaded"`
- `gemini`: `"quota"`, `"429"`, `"resource_exhausted"`
- `opencode`/`qwen`/`copilot`: `"rate limit"`, `"429"` (qwen also `"throttle"`)

Bidirectional: `devs→agent` via stdin tokens `devs:cancel\n`, `devs:pause\n`, `devs:resume\n`. `DEVS_MCP_ADDR` injected; `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` stripped **[2_TAS-REQ-037]**.

PTY via `portable-pty`; size 220×50; failure → immediate `Failed`, no auto-fallback **[2_TAS-REQ-118]**. File-based prompt: written to `<working_dir>/.devs_prompt_<uuid>`, deleted after agent exits **[2_TAS-REQ-119]**. System prompt not supported → prepend with `[SYSTEM]\n...\n[END SYSTEM]\n` separator.

### `devs-executor` **[2_TAS-REQ-040–044c]**

`StageExecutor` trait: `prepare(ctx) -> ExecutionHandle`, `collect_artifacts(handle, policy)`, `cleanup(handle)`.

Clone paths:
- `LocalTempDirExecutor`: `<os-tempdir>/devs-<run-id>-<stage-name>/repo/`
- `DockerExecutor`: `/workspace/repo/` inside container
- `RemoteSshExecutor`: `~/devs-runs/<run-id>-<stage-name>/repo/`

Shallow clone (`--depth 1`) by default; `full_clone = true` for full. Cleanup always runs regardless of outcome (failures logged at `WARN`) **[2_TAS-REQ-043]**.

Docker: uses `DOCKER_HOST`; container image from `stage.execution_env.docker.image`; `--rm`; `DEVS_MCP_ADDR` via host-gateway/`host.docker.internal`. Remote SSH: `ssh2` crate (not shell); configured via `ssh_config` OpenSSH key-value map; `server.external_addr` for `DEVS_MCP_ADDR` injection; SSH drop mid-stage → `Failed`.

Auto-collect: `git add -A` → `git commit -m "devs: auto-collect stage <name> run <id>"` → push to checkpoint branch only; skip if no changes **[2_TAS-REQ-044]**.

### `devs-mcp` **[2_TAS-REQ-048–051a]**

HTTP/1.1 JSON-RPC 2.0; POST to `/rpc` (§5 says `/mcp/v1/call`); `Content-Type: application/json` required. All responses: `{"result": {...}|null, "error": "string"|null}`.

MCP tool categories:
- **Observation**: `list_runs`, `get_run`, `get_stage_output`, `stream_logs`, `get_pool_state`, `get_workflow_definition`, `list_checkpoints`
- **Control**: `submit_run`, `cancel_run`, `cancel_stage`, `pause_run`, `pause_stage`, `resume_run`, `resume_stage`, `write_workflow_definition`
- **Testing**: `inject_stage_input`, `assert_stage_output`
- **Mid-run (agent)**: `report_progress`, `signal_completion`, `report_rate_limit`

`stream_logs` with `follow: true` uses HTTP chunked transfer encoding; newline-delimited JSON chunks; final chunk `{"done": true}` **[2_TAS-REQ-128]**.

MCP stdio bridge: one request per stdin line → forward to HTTP → write response to stdout + newline; on connection loss: write structured error + exit 1 **[2_TAS-REQ-129]**.

### `devs-grpc` **[2_TAS-REQ-052–054]**

Six tonic services. Version enforcement: every request MUST carry `x-devs-client-version` metadata; major version mismatch → `FAILED_PRECONDITION` on ALL RPCs **[2_TAS-REQ-130]**. `StreamRunEvents`: first message = full run snapshot (`event_type = "run.snapshot"`); terminal run → one final event then `OK` **[2_TAS-REQ-131]**. Per-client event buffer: 256 messages; oldest dropped on overflow **[2_TAS-REQ-132]**.

### `devs-tui` **[2_TAS-REQ-055–059]**

Four tabs: Dashboard (ASCII DAG + run list), Logs (10,000 line buffer), Debug (working-dir diff + controls), Pools. Stage status abbreviations: `WAIT`, `ELIG`, `RUN`, `DONE`, `FAIL`, `TIME`, `CANC`, `PAUS`. Stage box: `[ stage-name | STATUS | M:SS ]`. Auto-reconnect: exponential backoff 1→2→4→8→16→30s; after 30s total + 5s wait → exit 1 **[2_TAS-REQ-059]**. Tests: `TestBackend` 200×50; snapshots in `crates/devs-tui/tests/snapshots/*.txt` **[2_TAS-REQ-135]**.

### `devs-cli` **[2_TAS-REQ-060–064]**

All commands: `--server <host:port>` (overrides discovery), `--format json|text`. Run identifier resolution: UUID format checked first, then slug **[2_TAS-REQ-136]**.

Exit codes: `0` success, `1` general, `2` not found, `3` server unreachable, `4` validation error.

JSON error format: `{"error": "<message>", "code": <n>}` to stdout.

`devs logs --follow`: exits 0 on `Completed`, 1 on `Failed`/`Cancelled` **[2_TAS-REQ-064]**.

---

## §5 API Design & Protocols

### gRPC Transport **[2_TAS-REQ-069/070]**

Default: gRPC `127.0.0.1:7890`, MCP `7891`. `max_frame_size`: 16 MiB. Per-RPC limits: `SubmitRun` 1 MiB req/resp; `StreamLogs` 64 KiB req; others 1 MiB req / 4 MiB resp.

### Template Variables **[2_TAS-REQ-073–075]**

`{{` / `}}` delimiters. See §4 `devs-core` resolution order. stdout/stderr truncated to 10 KiB in template context. Non-dependent stage reference → immediate `Failed`. Missing variable → immediate `Failed` (never empty string).

### gRPC Error Code Mapping **[2_TAS-REQ-086b]**

Matches §1 table. Error messages format: `"<error-kind>: <detail>"` with machine-stable prefix **[2_TAS-REQ-086c]**. `INVALID_ARGUMENT` for validation includes all errors as JSON array in message **[2_TAS-REQ-086d]**.

### Protocol Versioning **[2_TAS-REQ-086h]**

SemVer. MAJOR bump for breaking changes. `x-devs-client-version` metadata required on every gRPC request; same-major = compatible; different-major = `FAILED_PRECONDITION`. MCP calls not version-gated. Server version embedded at compile time in `devs-core/src/version.rs` **[2_TAS-REQ-086i]**.

### Data Serialization Rules **[2_TAS-REQ-086j]**

| Type | Encoding |
|---|---|
| `Uuid` | Lowercase hyphenated string |
| `DateTime<Utc>` | RFC 3339 with ms precision + `Z` (e.g. `"2026-03-10T14:23:05.123Z"`) |
| Optional unpopulated | JSON `null` (key MUST be present) |
| `RunStatus`/`StageStatus` | Lowercase string (`"timed_out"` not `"TimedOut"`) |
| `AgentTool` | Lowercase CLI name (`"claude"`, `"gemini"`, etc.) |
| Binary in `stream_logs` | base64-encoded string |
| Binary in `get_stage_output` | UTF-8 with U+FFFD for invalid bytes |
| Timestamp fields in proto | `google.protobuf.Timestamp` → absent = `null` |

All timestamps: `chrono::Utc::now()` wall-clock. `elapsed_ms` uses monotonic clock.

### Streaming Behaviour **[2_TAS-REQ-086m]**

- `StreamRunEvents`: initial snapshot message (`event_type = "run.snapshot"`); terminal run → final event + `OK`; per-client buffer 256; oldest dropped on overflow; self-healing on reconnect
- `StreamLogs`: `follow:false` → return existing + close; `follow:true` → existing then live chunks then `{"done":true}`; sequence numbers monotonic from 1; each chunk ≤ 32 KiB; no server-side resumption
- `WatchPoolState`: initial snapshot then events; indefinite lifetime

### Webhook HTTP Protocol **[2_TAS-REQ-086f]**

Headers: `Content-Type: application/json; charset=utf-8`, `X-Devs-Event`, `X-Devs-Delivery` (UUID4), `X-Devs-Version`, `User-Agent: devs/<version>`. Payload envelope: `event`, `timestamp`, `delivery_id`, `project_id`, `run_id`, `stage_name`, `data`, `truncated`. Max 64 KiB; truncate `data` field. Timeout: 10s; 2xx = success; no 3xx follow. Retry: fixed 5s backoff, max 10 attempts then drop + log `ERROR`.

---

## §6 Algorithms

### Retention Sweep **[2_TAS-REQ-086/087]**

Phase 1: age filter (`completed_at < now - max_age_days`). Phase 2: size sort ascending by `completed_at`, accumulate until excess covered. Never delete `Running`/`Paused`. Delete commits: `devs: sweep run <id> (age|size)`.

### Template Resolution **[2_TAS-REQ-088]**

Single-pass scan of `{{...}}` expressions; resolve per priority order (§4); `{{stage.<name>.*}}` requires `<name> ∈ depends_on_closure`; stdout/stderr truncated to 10,240 bytes in context copy only.

### Context File Construction **[2_TAS-REQ-089/090]**

Only `Completed` stages in transitive closure included. Proportional truncation if > 10 MiB (preserving end of each stream). Atomic write; failure → `Failed` without agent spawn.

### Completion Signal Processing **[2_TAS-REQ-091]**

- `ExitCode`: 0 → `Completed`; non-zero → check rate-limit pattern → `Failed` or pool fallback
- `StructuredOutput`: `.devs_output.json` priority over stdout JSON; `success:true` → `Completed`, `success:false` → `Failed`, missing/invalid → `Failed`
- `McpToolCall`: `signal_completion` drives outcome; process exit without signal_completion → treated as `ExitCode` completion

### Timeout Enforcement **[2_TAS-REQ-092]**

`started_at + timeout_secs`: write `devs:cancel\n` → 5s wait → SIGTERM → 5s wait → SIGKILL → record `exit_code` → `TimedOut`.

---

## §7 Key Edge Cases

### Startup
- `devs.toml` missing + no `--config`: built-in defaults + `WARN`; `--config` missing file: fatal before ports
- Both ports same value: config validation error **[EC-C15-01]**
- gRPC port in use: exit, no ports remain bound; MCP port in use: release gRPC first
- Corrupt checkpoint: skip + `Unrecoverable` status; server continues
- Recovered run references deleted pool: run recovers; stage fails at dispatch with `"pool not found"`

### Runtime
- `signal_completion` called twice on terminal stage: error, no state change **[EC-C11-01]**
- `inject_stage_input` on Running stage: error, rejected **[EC-C11-02]**
- Template `{{stage.X.output.field}}` on `exit_code` completion stage: `TemplateError::NoStructuredOutput` **[EC-C03-01]**
- Fan-out dependency reaches `Cancelled`: downstream transitions to `Cancelled`; if already dispatched, cancel signal sent **[EC-C06-01]**
- `submit_run` during SIGTERM shutdown: `FAILED_PRECONDITION "server is shutting down"` **[EC-C06-02]**
- 100 parallel stages, pool `max_concurrent = 4`: 4 dispatched, 96 queue in FIFO on semaphore **[EC-C06-03]**

---

## §9 Key Acceptance Criteria (Representative)

- **[ARCH-AC-001]** Invalid `devs.toml` → all errors on stderr, exit non-zero, zero ports bound
- **[ARCH-AC-004]** SIGTERM → discovery file deleted, exit 0
- **[ARCH-AC-006]** Concurrent `SubmitRun` with duplicate name → exactly one success, one `ALREADY_EXISTS`
- **[ARCH-AC-009]** `cargo tree -p devs-core --edges normal` → no `tokio`, `git2`, `reqwest`, `tonic`
- **[ARCH-AC-011]** Crash recovery: `Running` stage → restarts as `Eligible` after server restart
- **[ARCH-AC-012]** gRPC reflection returns all six service names
- **[ARCH-AC-013]** MCP `cancel_run` reflected in subsequent gRPC `GetRun` (same in-process state, no sleep required)
- **[TECH-AC-008]** `unsafe` absent from all workspace sources
- **[TECH-AC-011]** `./do test` generates `target/traceability.json` with `overall_passed: true` when all reqs covered
- **[TECH-AC-013]** `./do coverage` generates exactly five gates (QG-001–QG-005)
- **[AC-3.02]** Cycle `A→B→A` → `INVALID_ARGUMENT` with `"cycle detected"` + `["A","B","A"]`
- **[AC-3.04]** `WorkflowRun` cancelled → all non-terminal `StageRun` `Cancelled` in same checkpoint write
- **[AC-3.06]** Disk-full checkpoint write → server continues; retries next transition
- **[AC-3.15]** `.devs_output.json` with `"success": "true"` (string) → `Failed`
