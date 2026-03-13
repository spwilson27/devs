# Performance Specification Summary — `devs`

**Source:** `docs/plan/specs/8b_performance_spec.md`
**Document ID:** 8b_PERF_SPEC · Version 1.0 · Normative
**Date:** 2026-03-13

All `[PERF-NNN]` identifiers are normative. Every target requires an automated test annotated `// Covers: PERF-NNN`. When this document conflicts with upstream specs (PRD, TAS, MCP Design, User Features, Risks), those sources govern.

---

## §1 Guiding Principles & Primary Commitments

### 1.1 Guiding Principles (PERF-GP-001 – PERF-GP-021)

**Correctness Before Speed**
- **[PERF-GP-001]** No SLO target justifies skipping the 7-step `submit_run` validation, 13-step workflow validation, or `StateMachine::transition()` legality check.
- **[PERF-GP-002]** Performance tests MUST assert state correctness alongside timing (`status == "running"`, checkpoint reflects correct state).
- **[PERF-GP-003]** Rejection responses MUST still be returned within the p99 latency target.

**Worst-Case Bounds**
- **[PERF-GP-004]** All CI SLO assertions use the p99 column.
- **[PERF-GP-005]** Minimum sample size for any percentile assertion: **100 observations**. `./do lint` scans for `p99` assertions with `n < 100`.
- **[PERF-GP-006]** p50 is informational only; CI does not fail on p50 violations alone.

**Measured at the Boundary**
- **[PERF-GP-007]** `tracing` spans MUST NOT be used as SLO assertions.
- **[PERF-GP-008]** Boundary measurement points are fixed per-operation (see [PERF-105]–[PERF-109]).
- **[PERF-GP-009]** CLI boundary (main→exit) is broader than gRPC handler boundary; CLI SLOs are correspondingly wider.

**No Polling Below 1 Second**
- **[PERF-GP-010]** `StreamRunEvents` / `stream_logs follow:true` eliminate polling. `./do lint` scans for `sleep(Duration::from_millis(N))` with N < 1 000 inside loops in test files.
- **[PERF-GP-011]** Sole exception: cancel-run polling at 500 ms in [MCP-061].
- **[PERF-GP-012]** TUI's 1-second `Tick` event is for elapsed-time formatting and log-buffer eviction checks only — MUST NOT trigger gRPC/MCP calls or file reads.

**Resource Budgets Are Hard Limits**
- **[PERF-GP-013]** Truncation is always from the **beginning** (oldest content removed). Applies to: stage stdout/stderr (1 MiB each), `get_stage_output` response, `.devs_context.json` (10 MiB), log buffer (10 000 lines FIFO), template stubs (10 240 bytes).
- **[PERF-GP-014]** Budget violation MUST set `truncated: true` and emit `WARN event_type: "resource.truncated"` with `field`, `original_bytes`, `cap_bytes`. MUST NOT return an error.
- **[PERF-GP-015]** `BoundedBytes<N>` / `BoundedString<N>` enforce limits at `serde::Deserialize` time; oversized payloads rejected as `INVALID_ARGUMENT` (gRPC) or HTTP 400 (MCP) during streaming deserialization.

**Presubmit Wall Clock Is First-Class**
- **[PERF-GP-016]** 900 s timer spawned as separate OS subprocess; PID written to `target/.presubmit_timer.pid`; on breach: SIGTERM → 5 s grace → SIGKILL; timer killed on successful completion.
- **[PERF-GP-017]** Step exceeding budget by > 20% emits `WARN` and sets `over_budget: true`; does NOT fail build.
- **[PERF-GP-018]** `target/presubmit_timings.jsonl` MUST be uploaded as CI artifact even on failure (GitLab CI `when: always`).
- **[PERF-GP-019]** `LatencyMeasurement` constructed immediately before operation (never pre-allocated with stale `started_at`).
- **[PERF-GP-020]** `elapsed_ms` computed via `std::time::Instant` (monotonic). `chrono::Utc::now()` MUST NOT be used for duration computation.
- **[PERF-GP-021]** `target/presubmit_timings.jsonl` MUST exist after any `./do presubmit` invocation that begins steps.

### 1.2 Primary Performance Commitments

**[PERF-001] DAG Scheduler Dispatch Latency — 100 ms p99**
From `StateMachine::transition()` returning `Ok(())` for a dependency's terminal `Completed` to `execvp`/`CreateProcess` for the spawned subprocess.

| Sub-operation | Budget |
|---|---|
| `stage_complete_tx.send()` enqueue | ≤ 1 ms |
| `SchedulerState` write lock acquire | ≤ 5 ms |
| `evaluate_eligibility()` O(E) DAG walk | ≤ 10 ms |
| Pool capability filter + semaphore acquire | ≤ 10 ms |
| `.devs_context.json` write | ≤ 30 ms |
| `tokio::process::Command::spawn()` | ≤ 10 ms |
| Scheduling overhead + channel latency | ≤ 34 ms |

- **[PERF-001-BR-001]** 100 ms applies when semaphore slot is immediately available; restarts from slot-release time when queued.
- **[PERF-001-BR-002]** Docker/remote environments not bounded by this SLO.
- **[PERF-001-BR-003]** `evaluate_eligibility()` MUST be O(V + E); quadratic implementations prohibited.

**[PERF-002] TUI Re-render Latency — 50 ms p99**
From `TuiEvent` dequeued to `terminal.draw()` returning + crossterm flush.
- `handle_event()` state mutation: ≤ 10 ms; `render()`: ≤ 16 ms; `terminal.draw()` + OS write: ≤ 24 ms.
- **[PERF-002-BR-002]** Each event individually must satisfy 50 ms; no coalescing.
- **[PERF-002-BR-004]** TUI MUST NOT freeze during reconnect backoff.

**[PERF-003] MCP Observation Tool Response — 2 000 ms p99 ceiling**
Normal-load targets: `list_runs` 500 ms, `get_run` 200 ms, `get_stage_output` 500 ms, `get_pool_state` 200 ms, `get_workflow_definition` 500 ms, `list_checkpoints` 1 000 ms, `stream_logs` non-follow TTFB 250 ms.
- **[PERF-003-BR-001]** Observation tools acquire read locks only; MUST NOT serialize behind each other.
- **[PERF-003-BR-002]** `stream_logs follow:false` MUST NOT hold the read lock during streaming; lock hold ≤ 50 ms.

**[PERF-004] TUI Render Budget — 16 ms hard limit**
No I/O, syscalls, or proportional heap allocation inside `render()`.
- **[PERF-004-BR-001]** Closure passed to `terminal.draw()` reads from `&AppState` (immutable borrow) only.
- **[PERF-004-BR-002]** `render()` MUST NOT call: file I/O, network I/O, `Mutex::lock()`, `RwLock::read/write()`, `tokio::spawn()`, or any `async` function.
- **[PERF-004-BR-003]** `dag_tiers` computation, `format_elapsed()` updates, log buffer eviction are performed in `handle_event()` NOT in `render()`.

**[PERF-005] Presubmit Wall Clock — 900 s hard limit**
- **[PERF-005-BR-001]** Timer begins at first line of `./do presubmit` (before `./do setup`).
- **[PERF-005-BR-002]** On breach: SIGTERM → 5 s grace → SIGKILL.
- **[PERF-005-BR-003]** Steps MUST run sequentially.
- **[PERF-005-BR-004]** Same 900 s limit on all three CI platforms (Linux, macOS, Windows).

### 1.3 Measurement Contract & Data Models

#### `LatencyMeasurement` — `devs-core/src/perf.rs`

```rust
pub struct LatencyMeasurement {
    pub started_at: std::time::Instant,    // not serialized
    pub boundary: MeasurementBoundary,
    pub elapsed_ms: u64,
    pub run_id: Option<uuid::Uuid>,
    pub stage_name: Option<String>,
    pub operation: String,                 // lowercase, underscore-separated
}

#[non_exhaustive]
pub enum MeasurementBoundary {
    GrpcHandler,     // first byte received → last byte sent
    McpHandler,      // request parsed → response flushed
    Scheduler,       // stage_complete event → execvp
    Checkpoint,      // serialize start → rename completion
    TuiRender,       // handle_event entry → crossterm flush
    CliBinary,       // main() → process exit
    WebhookDelivery, // HTTP connect → 2xx or timeout
}
```

#### `SloViolation` — structured log event

```json
{
  "event_type": "slo.violation", "level": "WARN",
  "fields": {
    "operation": "get_run", "boundary": "grpc_handler",
    "elapsed_ms": 2150, "threshold_ms": 2000, "percentile": "p99"
  }
}
```

- **[PERF-101]** Emitted for every boundary measurement exceeding p99 threshold.
- **[PERF-102]** Rate-limited to once per 10-second window per `(operation, boundary)` pair. Map bounded at 64 entries; stored in `static LazyLock<Mutex<HashMap<(String, String), Instant>>>`. `suppressed_count` included in next non-suppressed emission.

#### `PresubmitTimingRecord` — `target/presubmit_timings.jsonl`

```json
{
  "step": "lint", "started_at": "...", "completed_at": "...",
  "duration_ms": 115000, "budget_ms": 120000, "hard_limit_ms": 180000,
  "over_budget": false, "exceeded_hard_limit": false, "exit_code": 0
}
```

Fields: `step` ∈ {`setup`, `format`, `lint`, `test`, `coverage`, `ci`, `_timeout_kill`}; `duration_ms` uses monotonic clock; `_timeout_kill` appended on hard timeout.
- **[PERF-103]** Each record flushed immediately after step completes (not at end of script).
- **[PERF-104]** Timeout record: `"step": "_timeout_kill"`, `duration_ms = 900_000`, `exit_code: -1`, `exceeded_hard_limit: true`.

### 1.4 Performance Regression Policy

- **[PERF-REG-001]** SLO tests run as part of `./do test`; regression fails `./do presubmit`.
- **[PERF-REG-002]** `SloViolation` log events in CI are informational only; only test assertions (`assert!(elapsed_ms < threshold)`) fail the build.
- **[PERF-REG-003]** Diagnostic sequence: read `presubmit_timings.jsonl` → identify slow step → identify operation → distinguish infrastructure vs. code regression.
- **[PERF-REG-004]** SLO targets in this document are immutable without a spec amendment.
- **[PERF-REG-005]** CI variance margin MUST be documented as a comment adjacent to each assertion.

### 1.5 Dependencies

- **[PERF-DEP-001]** `devs-core/src/perf.rs` MUST be implemented before any other crate adds performance instrumentation.
- **[PERF-DEP-002]** SLO thresholds MUST be `pub const u64` in `devs-core/src/perf.rs`; no inline literals in tests. CI margin applied via `SLO_*_P99_MS * 3 / 2`.

### 1.6 Acceptance Criteria

- **[AC-PERF-001]** `devs-core/src/perf.rs` exports `LatencyMeasurement`, `MeasurementBoundary`, and all `SLO_*_P99_MS` constants; zero `cargo doc` warnings.
- **[AC-PERF-002]** `unsafe_code = "deny"` in `devs-core`; `cargo tree` must not list `tokio`, `git2`, `reqwest`, or `tonic`.
- **[AC-PERF-003]** Unit test verifies `MeasurementBoundary` has exactly 7 variants (exhaustive match).
- **[AC-PERF-004]** Rate-limiting: 100 violations in 10 s → 1 emitted; 100 violations spanning two 10 s windows → 2 emitted.
- **[AC-PERF-005]** `target/presubmit_timings.jsonl` exists after any `./do presubmit` (success or failure); each line valid JSON.
- **[AC-PERF-007]** Lint: no `.rs` file outside `devs-core/src/perf.rs` contains inline numeric literals as SLO thresholds.
- **[AC-PERF-008]** Lint: no test file contains `sleep(Duration::from_millis(N))` with N < 1 000 inside a loop.
- **[AC-PERF-011]** Two independent root stages dispatched within 100 ms of run transitioning to `Running`.
- **[AC-PERF-012]** TUI re-renders within 50 ms of synthetic `RunDelta` injected into event channel (`TestBackend`, 200×50, `ColorMode::Monochrome`).
- **[AC-PERF-013]** 256-stage DAG: `handle_event()` + `render()` complete within 50 ms total.
- **[AC-PERF-016]** `static_assertions::const_assert!` verifies all SLO constants non-zero.

---

## §2 SLO Summary Table

### Master Table (PERF-006 – PERF-033)

| ID | Endpoint / Operation | p50 | p95 | p99 | Throughput | Boundary |
|----|---------------------|-----|-----|-----|------------|----------|
| **[PERF-006]** | `SubmitRun` gRPC | <50 ms | <200 ms | <500 ms | ≥10 req/s burst | `GrpcHandler` |
| **[PERF-007]** | `GetRun` gRPC | <5 ms | <20 ms | <50 ms | ≥100 req/s | `GrpcHandler` |
| **[PERF-008]** | `ListRuns` gRPC | <10 ms | <50 ms | <100 ms | ≥50 req/s | `GrpcHandler` |
| **[PERF-009]** | `CancelRun` gRPC | <50 ms | <200 ms | <500 ms | ≥5 req/s | `GrpcHandler` |
| **[PERF-010]** | `StreamRunEvents` TTFE | <50 ms | <100 ms | <200 ms | ≥20 streams | `GrpcHandler` |
| **[PERF-011]** | `StreamLogs` non-follow TTFB | <20 ms | <100 ms | <250 ms | ≥20 streams | `GrpcHandler` |
| **[PERF-012]** | `StreamLogs` follow live chunk | <100 ms | <300 ms | <500 ms | ≥20 streams | `GrpcHandler` |
| **[PERF-013]** | `WatchPoolState` TTFE | <50 ms | <100 ms | <200 ms | ≥10 streams | `GrpcHandler` |
| **[PERF-014]** | MCP `list_runs` | <20 ms | <100 ms | <500 ms | ≥30 req/s | `McpHandler` |
| **[PERF-015]** | MCP `get_run` | <10 ms | <50 ms | <200 ms | ≥50 req/s | `McpHandler` |
| **[PERF-016]** | MCP `get_stage_output` | <20 ms | <100 ms | <500 ms | ≥20 req/s | `McpHandler` |
| **[PERF-017]** | MCP `submit_run` | <100 ms | <500 ms | <1 000 ms | ≥5 req/s | `McpHandler` |
| **[PERF-018]** | MCP `cancel_run` | <100 ms | <500 ms | <1 000 ms | ≥5 req/s | `McpHandler` |
| **[PERF-019]** | MCP `write_workflow_definition` | <200 ms | <1 000 ms | <2 000 ms | ≥2 req/s | `McpHandler` |
| **[PERF-020]** | MCP lock acquisition (write-contended) | <500 ms | <2 000 ms | <5 000 ms | — | `McpHandler` |
| **[PERF-021]** | DAG scheduler dispatch | <20 ms | <50 ms | <100 ms | — | `Scheduler` |
| **[PERF-022]** | Stage cancel signal delivery | <1 000 ms | <3 000 ms | <5 000 ms | — | `Scheduler` |
| **[PERF-023]** | TUI render latency | <5 ms | <10 ms | <16 ms | ≥60 fps | `TuiRender` |
| **[PERF-024]** | TUI event→render pipeline | <20 ms | <40 ms | <50 ms | — | `TuiRender` |
| **[PERF-025]** | CLI `devs status` | <50 ms | <200 ms | <500 ms | — | `CliBinary` |
| **[PERF-026]** | CLI `devs list` | <100 ms | <300 ms | <700 ms | — | `CliBinary` |
| **[PERF-027]** | CLI `devs submit` | <200 ms | <700 ms | <1 500 ms | — | `CliBinary` |
| **[PERF-028]** | Checkpoint write (atomic) | <50 ms | <200 ms | <500 ms | — | `Checkpoint` |
| **[PERF-029]** | Webhook delivery TTFB | <500 ms | <3 000 ms | <10 000 ms | ≥8 concurrent | `WebhookDelivery` |
| **[PERF-030]** | Server startup (cold) | <2 000 ms | <5 000 ms | <10 000 ms | — | `GrpcHandler` |
| **[PERF-031]** | Server startup + restore (≤50 runs) | <5 000 ms | <15 000 ms | <30 000 ms | — | `GrpcHandler` |
| **[PERF-032]** | `./do presubmit` wall clock | — | — | <900 000 ms | — | `CliBinary` |
| **[PERF-033]** | Retention sweep (≤500 runs) | <5 000 ms | <30 000 ms | <60 000 ms | — | `Scheduler` |

### 2.1 Measurement Methodology

- **[PERF-105]** gRPC: first byte received → last byte sent (dial + TLS excluded). `MeasurementBoundary::GrpcHandler`.
- **[PERF-106]** MCP HTTP: fully-parsed request body → last byte of response acknowledged. `MeasurementBoundary::McpHandler`.
- **[PERF-107]** DAG scheduler: `StateMachine::transition()` returns `Ok(())` → `execvp`/`CreateProcess`. `MeasurementBoundary::Scheduler`.
- **[PERF-108]** CLI: `fn main()` entry → Rust process exit (includes gRPC dial). `MeasurementBoundary::CliBinary`.
- **[PERF-109]** TUI: `App::handle_event()` entry → `terminal.draw()` returns. `MeasurementBoundary::TuiRender`.
- **[PERF-110]** CI margin: p99 × `CI_MARGIN_NUMERATOR(3) / CI_MARGIN_DENOMINATOR(2)` = 1.5×. Exception: PERF-023 (16 ms hard limit) — no CI margin applied.
- **[PERF-121]** p99 formula: given sorted `d[0..N]`, `p99 = d[ceil(0.99 × N) - 1]`. For N=100: `d[98]`.
- **[PERF-116]** Throughput valid only when: server running ≥ 5 s, concurrent clients active, no request exceeding p99 latency target.
- **[PERF-119]** Measurement window for throughput assertions ≥ 10 seconds.

### 2.3 SLO Constant Definitions — `devs-core/src/perf.rs`

```rust
pub const CI_MARGIN_NUMERATOR: u64 = 3;
pub const CI_MARGIN_DENOMINATOR: u64 = 2;

#[inline]
pub const fn ci_threshold(p99_ms: u64, is_hard_limit: bool) -> u64 { ... }

// gRPC SLOs
pub const SLO_SUBMIT_RUN_GRPC_P99_MS: u64          = 500;
pub const SLO_GET_RUN_GRPC_P99_MS: u64             = 50;
pub const SLO_LIST_RUNS_GRPC_P99_MS: u64           = 100;
pub const SLO_CANCEL_RUN_GRPC_P99_MS: u64          = 500;
pub const SLO_STREAM_RUN_EVENTS_TTFE_P99_MS: u64   = 200;
pub const SLO_STREAM_LOGS_NONFOLLOW_TTFB_P99_MS: u64 = 250;
pub const SLO_STREAM_LOGS_FOLLOW_CHUNK_P99_MS: u64 = 500;
pub const SLO_WATCH_POOL_STATE_TTFE_P99_MS: u64    = 200;

// MCP SLOs
pub const SLO_MCP_LIST_RUNS_P99_MS: u64            = 500;
pub const SLO_MCP_GET_RUN_P99_MS: u64              = 200;
pub const SLO_MCP_GET_STAGE_OUTPUT_P99_MS: u64     = 500;
pub const SLO_MCP_SUBMIT_RUN_P99_MS: u64           = 1_000;
pub const SLO_MCP_CANCEL_RUN_P99_MS: u64           = 1_000;
pub const SLO_MCP_WRITE_WORKFLOW_DEF_P99_MS: u64   = 2_000;
pub const SLO_MCP_LOCK_ACQUISITION_P99_MS: u64     = 5_000;

// Scheduler SLOs
pub const SLO_DAG_SCHEDULER_DISPATCH_P99_MS: u64   = 100;
pub const SLO_STAGE_CANCEL_SIGNAL_P99_MS: u64      = 5_000;
pub const SLO_RETENTION_SWEEP_P99_MS: u64          = 60_000;

// TUI SLOs (PERF-023 is a hard limit)
pub const SLO_TUI_RENDER_P99_MS: u64               = 16;
pub const SLO_TUI_RENDER_IS_HARD_LIMIT: bool       = true;
pub const SLO_TUI_EVENT_RENDER_PIPELINE_P99_MS: u64 = 50;

// CLI SLOs
pub const SLO_CLI_STATUS_P99_MS: u64               = 500;
pub const SLO_CLI_LIST_P99_MS: u64                 = 700;
pub const SLO_CLI_SUBMIT_P99_MS: u64               = 1_500;

// Infrastructure SLOs
pub const SLO_CHECKPOINT_WRITE_P99_MS: u64         = 500;
pub const SLO_WEBHOOK_DELIVERY_P99_MS: u64         = 10_000;
pub const SLO_SERVER_STARTUP_P99_MS: u64           = 10_000;
pub const SLO_SERVER_STARTUP_RESTORE_P99_MS: u64   = 30_000;
pub const SLO_PRESUBMIT_WALL_CLOCK_P99_MS: u64     = 900_000;
```

- **[PERF-133]** `ci_threshold()` MUST be used in every test assertion; direct 3/2 multiplication prohibited.
- **[PERF-134]** New PERF ID → corresponding constant in same commit; compile-time count assertion enforces completeness (expected count: 28).
- **[PERF-135]** `SLO_PRESUBMIT_WALL_CLOCK_P99_MS` MUST NOT use `ci_threshold` (no CI margin applied).

### 2.5 Per-Group Business Rules

**Group A — gRPC Read (PERF-007, PERF-008, PERF-013)**
- **[PERF-GRP-001]** `GetRun`/`ListRuns` MUST release `RwLock` read guard before serialization.
- **[PERF-GRP-002]** `WatchPoolState` sends initial snapshot under read lock, then releases before long-poll loop.
- **[PERF-GRP-003]** `limit = 0` → `INVALID_ARGUMENT` within `ListRuns` p99.

**Group B — gRPC Write (PERF-006, PERF-009)**
- **[PERF-GRP-004]** `SubmitRun` completes all 7 validation steps BEFORE acquiring write lock.
- **[PERF-GRP-005]** `CancelRun` cascade: O(N) oneshot sends, bounded by ≤ 50 stages/run.
- **[PERF-GRP-006]** Failed checkpoint write MUST roll back in-memory state before returning error.

**Group C — Streaming (PERF-010, PERF-011, PERF-012)**
- **[PERF-GRP-007]** `StreamRunEvents` / `StreamLogs` MUST register cleanup handler on disconnect.
- **[PERF-GRP-008]** `StreamLogs follow:true` uses `tokio::sync::broadcast` (not polling).
- **[PERF-GRP-009]** Initial snapshot MUST be sent before subscribing to live event channel.

**Group D — MCP (PERF-014 – PERF-020)**
- **[PERF-GRP-010]** MCP read tools acquire read locks only; MUST NOT escalate to write lock.
- **[PERF-GRP-011]** Write tools use `tokio::time::timeout(5_000ms, lock.write())`.
- **[PERF-GRP-012]** `write_workflow_definition`: steps 1–10 (schema, cycle, uniqueness) before write lock; steps 11–13 (fs write, discovery file, checkpoint) while holding write lock.
- **[PERF-GRP-013]** `get_stage_output` truncation to 1 MiB occurs BEFORE JSON serialization.

**Group E — Infrastructure (PERF-021 – PERF-033)**
- **[PERF-GRP-014]** DAG scheduler uses `tokio::task::spawn` (not `spawn_blocking`).
- **[PERF-GRP-015]** Checkpoint writes use `spawn_blocking` for `fsync`.
- **[PERF-GRP-016]** TUI render MUST be called only from TUI's dedicated event loop thread.
- **[PERF-GRP-017]** Retention sweep runs in background task (`interval(86_400s)`); write lock only for deletion step.
- **[PERF-GRP-018]** Discovery file written as last step of startup sequence.

**Group F — CLI (PERF-025 – PERF-027)**
- **[PERF-GRP-019]** CLI reads gRPC address from discovery file at startup; MUST NOT cache between invocations.
- **[PERF-GRP-020]** gRPC dial timeout: 2 000 ms; no retry on failure.
- **[PERF-GRP-021]** CLI SLO tests MUST use real in-process or localhost server (dial time included).
- **[PERF-GRP-022]** `devs submit` MUST NOT block waiting for run to complete.
- **[PERF-GRP-023]** `UNAVAILABLE` → exit code 2; other errors → exit code 1.

### 2.7 Key Acceptance Criteria (§2)

- **[AC-PERF-SLO-001]** 28 `SLO_*_P99_MS` constants in `devs-core::perf`; compile-time count assertion.
- **[AC-PERF-SLO-003]** `GetRun` gRPC: 100 sequential calls ≤ 75 ms each (CI threshold for 50 ms p99).
- **[AC-PERF-SLO-005]** `SubmitRun` gRPC: 100 sequential calls ≤ 750 ms each; duplicate name also ≤ 750 ms.
- **[AC-PERF-SLO-010]** DAG scheduler: 9 dispatch events per 10-stage linear DAG run ≤ 150 ms each; 100 runs → 900 observations.
- **[AC-PERF-SLO-011]** TUI render: 1 000 consecutive frames each ≤ 16 ms (any frame > 16 ms fails test immediately).
- **[AC-PERF-SLO-014]** MCP lock timeout: 6th caller returns `resource_exhausted` within 5 100 ms.
- **[AC-PERF-SLO-020]** `slo_constants_complete` test: fails if count of exported `SLO_*_P99_MS` ≠ 28.

---

## §3 Latency Targets per Critical Flow

### 3.1 Workflow Submission

- **[PERF-034]** End-to-end CLI `devs submit` → printed `run_id`: p99 < 1 500 ms.
- **[PERF-035]** Duplicate run name rejection (in-memory, per-project mutex): p99 < 100 ms.

**`SubmitRunRequest` key fields:** `project_id` (UUID v4), `workflow_name` (`/^[a-z][a-z0-9_-]{0,127}$/`), `run_name` (optional, same pattern), `inputs` (≤ 64 entries, ≤ 65 536 bytes total), `priority_override` (0 or [1,100]).

**13-step validation pipeline [PERF-140]** (steps 1–9 stateless/lock-free; steps 10–13 require per-project name mutex):

| Step | Check | Error |
|---|---|---|
| 1–3 | UUID + name patterns | `INVALID_ARGUMENT` |
| 4 | `workflow_name` in `WorkflowRegistry` | `NOT_FOUND` |
| 5–9 | inputs count/size, required params, no extras, priority range | `INVALID_ARGUMENT` |
| 10 | Per-project name mutex (5 s timeout) | `RESOURCE_EXHAUSTED` |
| 11 | `run_name` not in `RunRegistry` | `ALREADY_EXISTS` |
| 12 | Shutdown flag not set | `FAILED_PRECONDITION` |
| 13 | Workflow ≥ 1 stage | `INVALID_ARGUMENT` |

- **[PERF-139]** Auto-generated `run_name`: `<workflow_name>-<run_id[0..8]>`; < 1 ms; no I/O.
- **[PERF-141]** Validation pipeline executes synchronously; no step deferred to background.
- **[PERF-142]** Per-project name mutex held from step 10 through `checkpoint.json` atomic write; released before gRPC response.
- gRPC: `tonic 0.11`; `uuid 1.x`; `serde_json 1.x`.

### 3.2 Stage Dispatch

- **[PERF-036]** `tempdir` environment: last dependency checkpoint write → `execvp`: p99 < 200 ms.
- **[PERF-037]** Pool capability resolution + semaphore acquire (slot available): p99 < 10 ms.
- **[PERF-038]** Two independently-rooted stages both dispatched within 100 ms of run → `Running`.

**Key data models:**
```rust
pub struct DagStageNode {
    pub stage_name: String, pub depends_on: Vec<String>,
    pub tier: u32, pub pool_name: String,
    pub capabilities: Vec<String>, pub fan_out: Option<FanOutConfig>,
}
pub struct StageCompleteEvent {
    pub run_id: Uuid, pub stage_name: String,
    pub status: TerminalStageStatus, // Completed | Failed | Cancelled
}
```

`stage_complete_tx`: `tokio::sync::mpsc::Sender<StageCompleteEvent>` buffer **256**.

- **[PERF-144]** Stage dispatched iff every `depends_on` stage is `Completed`.
- **[PERF-145]** Dispatch suppressed if run is `Cancelled`, `Failed`, or `Paused` (checked under same read lock as eligibility).
- **[PERF-147]** Cycle detection via DFS at workflow registration time; dispatch path does not re-check.
- Dependencies: `devs-executor`, `portable-pty 0.8` (PTY: ~5 ms Linux, ~20 ms macOS), `tokio::sync::Semaphore`.

### 3.3 Log Streaming

- **[PERF-039]** Live log chunk (agent stdout → TUI display): p95 < 500 ms, p99 < 1 000 ms.
- **[PERF-040]** `stream_logs follow:false`: TTFB p99 < 250 ms; 10 000 lines complete p99 < 2 000 ms.

**`LogChunk` proto key fields:** `sequence` (monotonically increasing, no gaps), `content` (valid UTF-8, ≤ 32 768 bytes, never splits multi-byte), `stream` (STDOUT/STDERR), `done` (final chunk only), `truncated`, `total_lines` (set only when `done == true`).

`LogBuffer::max_capacity = 10 000` lines (FIFO; `truncated` flag set permanently on any eviction).

- **[PERF-148]** `sequence` strictly monotonically increasing; gap → protocol error → reconnect.
- **[PERF-150]** ≥ 20 simultaneous `StreamLogs` subscribers via `tokio::sync::broadcast::Receiver`; sender MUST NOT block on slow receiver.
- **[PERF-151]** `follow:true` chunks: p99 < 1 000 ms from stdout write to gRPC transport write.
- Stream terminates at 30-minute lifetime regardless of stage status.

### 3.4 Run Cancellation

- **[PERF-041]** Server acknowledges cancel (all `StageRun` → `Cancelled` in response): p99 < 500 ms.
- **[PERF-042]** Agent graceful shutdown: 10 000 ms; fallback SIGTERM at 5 000 ms; SIGKILL at 10 000 ms.

**Cascade protocol [PERF-152]:** Atomically transition all non-terminal stages → `Cancelled`; persist single `checkpoint.json`; fsync confirms durability; THEN send gRPC response. Then `tokio::spawn` `devs:cancel\n` signal delivery per agent [PERF-153].

- **[PERF-154]** Escalation sequence: `devs:cancel\n` at t+0 → SIGTERM at t+5 s → SIGKILL at t+10 s; `exit_code: -9` for SIGKILL.
- Not idempotent after first call; second call on terminal run → `FAILED_PRECONDITION`.

### 3.5 TUI Monitoring

- **[PERF-043]** Server checkpoint commit → TUI frame update: p95 < 100 ms, p99 < 200 ms.
- **[PERF-044]** TUI reconnect first retry: 1 000 ms; exponential backoff 1→2→4→8→16→30 s cap.

**RunEvent model:**
```rust
pub enum RunEvent { Snapshot(RunSnapshot), Delta(RunDelta), ServerShutdown { reason: String } }
pub struct RunDelta { pub run_id: Uuid, pub stage_name: Option<String>, pub field: String, pub new_value: serde_json::Value }
```

Per-client broadcast channel: **256 messages** capacity. On overflow: oldest dropped; reconnect → `Snapshot` first.

- **[PERF-155]** First message on every (re)connection MUST be `RunEvent::Snapshot` under read lock; lock released before serialization.
- **[PERF-156]** `AppState` mutations ONLY in `App::handle_event()`; `render()` is pure read.
- **[PERF-157]** Single `tokio::select!` loop; exactly one event per iteration before `render()`.
- **[PERF-158]** Reconnection backoff via `tokio::time::sleep` (non-blocking); TUI responsive to `'q'` / `'h'` during backoff.
- Libraries: `ratatui 0.28`, `crossterm 0.28`, `tonic 0.11`, `insta 1.x`.

### 3.6 MCP Glass-Box Observation

- **[PERF-045]** 64 simultaneous observation requests: `get_run` p99 < 500 ms.
- **[PERF-046]** `stream_logs follow:true` first chunk: p99 < 1 000 ms; 10 000 buffered lines: p99 < 5 000 ms.

**MCP endpoint:** `HTTP POST /mcp/v1/call` (JSON-RPC 2.0). All tool responses: HTTP 200 (errors use `"isError": true`). Pre-handler rejections: HTTP 413 (body > 1 MiB), HTTP 503 (≥65 connections), HTTP 405 (non-POST), HTTP 415 (wrong Content-Type).

- **[PERF-159]** ALL tool errors returned as HTTP 200 with `"isError": true`.
- **[PERF-160]** Observation tools read-lock only; MUST NOT acquire write lock in any error path.
- **[PERF-161]** 64-connection limit enforced at TCP acceptor level (before body read); 65th → HTTP 503 immediately.
- **[PERF-162]** `inject_stage_input` precondition check under read lock (p99 < 100 ms); write lock acquired only on pass.
- Libraries: `axum 0.7`, `tokio::sync::RwLock`, `tokio::sync::Semaphore` (64-slot), `serde_json 1.x`, `tower 0.4`.

### 3.7 Presubmit Development Loop

- **[PERF-047]** Step budgets (Linux CI):

| Step | Target | Hard Limit |
|---|---|---|
| `setup` | ≤ 30 s | 60 s |
| `format` | ≤ 10 s | 20 s |
| `lint` | ≤ 120 s | 180 s |
| `test` | ≤ 180 s | 270 s |
| `coverage` | ≤ 300 s | 420 s |
| `ci` | ≤ 180 s | 300 s |
| **Total** | **≤ 820 s** | **900 s** |

- macOS/Windows CI: combined hard limit 1 500 s (25 min).
- **[PERF-163]** Fixed order: `setup → format → lint → test → coverage → ci`; no parallelism.
- **[PERF-164]** Timer as separate OS subprocess; PID → `target/.presubmit_timer.pid`.
- **[PERF-165]** `./do setup` kills stale timer from previous run before proceeding.
- Tools: `cargo 1.77+`, `cargo-llvm-cov 0.6+`, `cargo-audit 0.20+`.
- `./do presubmit` options: `--skip-ci`, `--only <step>`; env: `DEVS_PRESUBMIT_NO_TIMER=1`.

---

## §4 Throughput & Concurrency Targets

### Scheduler Channel Capacity Model

| Channel | Type | Buffer | Overflow policy |
|---|---|---|---|
| `stage_complete_tx` | `mpsc` | 256 | Bounded; sender blocks (backpressure) |
| `webhook_tx` | `mpsc` | 1 024 | `try_send()`; drop + WARN on full |
| `cancel_tx` | `mpsc` | 256 | Bounded; sender blocks |
| `pool_event_tx` | `mpsc` | 64 | Bounded; sender blocks |
| `tui_event_tx` | `mpsc` | 256 | Bounded; sender blocks |
| `run_event_tx` | `broadcast` | 256/run | Lag: oldest dropped; snapshot on reconnect |

Business rules:
- **PERF-BR-400** `ThroughputMeasurement.sample_count < 100` → rejected at ingestion with `"insufficient_samples"`.
- **PERF-BR-402** `PoolState.available_count == max_concurrent - active_count` always; divergence → `ERROR`.
- **PERF-BR-404** Lock acquisition order: `SchedulerState → PoolState → CheckpointStore` (globally enforced).
- **PERF-BR-405** `stage_complete_tx` buffer ≥ 256; `const_assert!` enforced in CI.
- **PERF-BR-406** `webhook_tx` buffer ≥ 1 024; `const_assert!` enforced in CI.
- **PERF-BR-408** No synchronous I/O on Tokio async executor threads; all blocking I/O via `spawn_blocking`.

### 4.1 Agent Pool Concurrency

- **[PERF-048]** Pool semaphore sustains `max_concurrent` simultaneous agents without deadlock/starvation/leak.
- **[PERF-049]** Fan-out `count=64`, pool `max_concurrent=4`: `active_count == 4`, `queued_count == 60`.
- **[PERF-050]** Pool agent selection O(N); for 1 024-agent pool: p99 < 5 ms.
- **PERF-BR-410** `OwnedSemaphorePermit` dropped on ALL exit paths (RAII `drop_permit_guard`).
- **PERF-BR-412** Capability check MUST complete before any `acquire_owned()`.
- **PERF-BR-413** Rate-limit check after capability filtering; semaphore NOT acquired when all routable agents are rate-limited.
- **PERF-BR-414** `pool.exhausted` webhook fires at most once per pool-exhaustion event.

### 4.2 Parallel Stage Dispatch

- **[PERF-051]** 100 parallel eligible stages, `max_concurrent=100`: all dispatched within 1 000 ms of run start.
- **[PERF-052]** Workflows up to 256 stages without dispatch latency degradation.
- **PERF-BR-420** `evaluate_eligibility()` inside `SchedulerState` write-lock; MUST NOT perform I/O; O(V+E).
- **PERF-BR-421** Each eligible stage dispatched in a separate `tokio::spawn` task; ALL permit acquisitions initiated concurrently.
- **PERF-BR-422** `SchedulerState` write-lock released BEFORE any `acquire_owned()`.
- **PERF-BR-423** `stage_complete_tx`: agent exit handler uses `try_send()`; WARN + bounded back-off on full.

### 4.3 gRPC Server Throughput

- **[PERF-053]** 50 concurrent client connections: unary RPC latency ≤ 2× p50 targets.
- **[PERF-054]** Per-client `StreamRunEvents` buffer: 256 messages; after saturation oldest dropped with `WARN`.
- **PERF-BR-431** `stream_logs follow:true` MUST NOT hold `SchedulerState` read-lock across `await` points.
- **PERF-BR-433** `x-devs-client-version` checked by interceptor before any handler; p99 < 10 ms.

### 4.4 MCP HTTP Throughput

- **[PERF-055]** MCP HTTP: ≥ 64 simultaneous connections without HTTP 503; 65th → HTTP 503.
- **[PERF-056]** Control tool throughput: ≥ 5 `submit_run` calls/s for 10 s.

Connection limit model: `Arc<AtomicU32>` (SeqCst) counter at TCP acceptor. Write-lock serialization: `submit_run`, `cancel_run`, `inject_stage_input` serialized; observation tools concurrent.
- **PERF-BR-440** `SeqCst` ordering for `fetch_add`/`fetch_sub`.
- **PERF-BR-442** Write-lock > 5 s → HTTP 504; lock MUST NOT be held after timeout.
- **PERF-BR-444** `stream_logs follow:true` MUST NOT acquire any `SchedulerState` lock after initial snapshot.

### 4.5 Webhook Dispatcher

- **[PERF-057]** Webhook channel buffer ≥ 1 024 events without blocking engine.
- **[PERF-058]** ≥ 8 simultaneous outbound HTTP deliveries without blocking scheduler.
- **PERF-BR-450** `webhook_tx.try_send()` only; blocking `send().await` forbidden on scheduler thread.
- **PERF-BR-451** SSRF check called once per attempt, after DNS resolution, immediately before HTTP request (cached results MUST NOT be reused).
- **PERF-BR-452** Each delivery in its own `tokio::spawn` task; dispatcher spawns and continues consuming.
- **PERF-BR-453** Payload > 65 536 bytes → `Failed` with `"payload_too_large"`; target receives no request.
- **PERF-BR-454** Retry backoff: attempt 1 (immediate), attempt 2 (1 s), attempt 3 (2 s); max 3 attempts.

`WebhookDeliveryStatus`: `Enqueued → ResolvingDNS → SSRFCheck → Delivering → Success | Failed` (with retry); `Dropped` (channel full or SSRF blocked).

### 4.6 Multi-Project Scheduling

- **[PERF-059]** 10 concurrent active projects: highest-priority eligible stage dispatched within p99 < 100 ms.

**Scheduling policy:** `scheduling_mode ∈ {weighted_fair, strict_priority}`. WFQ: `virtual_time += 1.0/weight` per dispatch; project with lowest `virtual_time` selected; ties broken by `project_id` lexicographic order.

- **PERF-BR-460** Lowest `virtual_time` among projects with `eligible_stage_count > 0` selected.
- **PERF-BR-462** `virtual_time` normalization when approaching `f64::MAX` (subtract minimum `virtual_time` from all projects).
- **PERF-BR-463** `weight = 0` → `INVALID_ARGUMENT "weight must be ≥ 1"`.
- **PERF-BR-464** `ProjectRemoving` excluded from eligibility evaluation; new submissions → `FAILED_PRECONDITION`.

---

## §5 Resource Utilisation Budgets

### 5.0 Shared Data Models

**`BoundedBytes<N>`** (`devs-core/src/types.rs`): `data: Vec<u8>` (len ≤ N), `truncated: bool`, `original_len: Option<u64>`. Truncates from beginning (retains last N bytes). `serde::Deserialize` rejects if decoded byte length > N.

**`BoundedString<N>`** (`devs-core/src/types.rs`): Rejects (returns `ValidationError::StringTooLong`) if byte length > N. Does NOT truncate.

**`RetentionPolicy`** (from `devs.toml [retention]`): `max_age_days` (default 30, range 1–3650), `max_size_mb` (default 500, range 1–102400), `sweep_interval_hours` (default 24, range 1–168).

**`ResourceBudgetSnapshot`** (structured log `"server.resource_budget_snapshot"` every 5 min): `server_rss_bytes`, `active_run_count`, `total_stage_run_count`, `log_buffer_entry_count`, `checkpoint_store_size_mb`, `pool_active_counts`, `budget_violations`.

### 5.1 CPU

- **[PERF-060]** Idle server (no active runs): CPU < 1% single core averaged over 30 s; no spin-poll.
- **[PERF-061]** Peak load (10 runs × 4 active stages): `devs-server` CPU < 25% single core.
- **[PERF-062]** TUI static display: `devs-tui` CPU < 5% single core.
- **PERF-BR-501** Tokio single-threaded runtime; no `std::thread::sleep` or blocking `Mutex::lock` in async tasks.
- **PERF-BR-503** Log buffer eviction scan MUST maintain eviction candidate index (e.g., `BinaryHeap<(Instant, RunId, StageName)>`); Tick handler O(1) or O(log N).
- **PERF-BR-504** `dirty: bool` flag prevents redundant renders when state is unchanged.

### 5.2 Memory

- **[PERF-064]** Server baseline RSS (0 runs, ≤ 10 projects): < 64 MiB.
- **[PERF-065]** Per active run metadata (`WorkflowRun` + `StageRun`, excluding `StageOutput` + log buffers): < 8 MiB.
- **[PERF-066]** Per active stage log buffer: ≤ 10 000 lines × 256 bytes avg = ~2.5 MiB.
- **[PERF-067]** TUI process RSS: < 64 MiB.
- **[PERF-068]** `BoundedBytes<1_048_576>`: stdout + stderr ≤ 2 MiB per `StageRun`.
- **[PERF-069]** `.devs_context.json` in-memory: ≤ 10 MiB.

| Component | Cap |
|---|---|
| `devs-server` idle | < 64 MiB |
| Per active `WorkflowRun` metadata | < 8 MiB |
| Per active stage `StageOutput` | ≤ 2 MiB |
| Per active stage log buffer (server) | ≤ 2.5 MiB |
| `.devs_context.json` | ≤ 10 MiB |
| `devs-tui` RSS | < 64 MiB |
| Per TUI `LogBuffer` | ≤ 2.5 MiB |

- **PERF-BR-510** `BoundedBytes<N>` MUST NOT pre-allocate N bytes; uses `Vec::new()`.
- **PERF-BR-511** Evicted `LogBuffer`: `drop()` called; `HashMap` entry removed (not just cleared).

### 5.3 Storage

- **[PERF-070]** Default retention: `max_age_days=30`, `max_size_mb=500`; sweep at startup + every 24 h.
- **[PERF-071]** `checkpoint.json` per run: < 1 MiB; stage stdout/stderr stored in `.devs/logs/` (NOT embedded).
- **[PERF-072]** Stage log files: stdout + stderr ≤ 2 MiB total (1 MiB each via `BoundedBytes<1_048_576>`).
- **[PERF-073]** `workflow_snapshot.json` (256-stage workflow): < 512 KiB.
- **[PERF-121]** Sweep over 500 completed runs: p99 < 60 s.

**Retention sweep algorithm** (two-phase):
1. Phase 1: age-based — delete runs older than `max_age_days` (skip active runs).
2. Phase 2: size-based — sort remaining by `completed_at` ascending; delete oldest until ≤ `max_size_mb`.
Single atomic git commit per sweep.

- **PERF-BR-520** MUST NOT delete `Running`, `Paused`, or `Pending` runs.
- **PERF-BR-521** Phase 2: oldest `completed_at` first; ties broken by `run_id` lexicographic order.
- **PERF-BR-522** Single atomic git commit per sweep.
- **PERF-BR-523** Orphaned `checkpoint.json.tmp` files deleted at startup with `WARN` before loading any checkpoint.
- **PERF-BR-525** `workflow_snapshot.json` written once before first stage transitions from `Waiting` to `Eligible`.

### 5.4 Network Constants — `devs-core/src/constants.rs`

```rust
pub const GRPC_MAX_FRAME_SIZE: u32        = 16 * 1024 * 1024;  // 16 MiB
pub const GRPC_DEFAULT_REQUEST_LIMIT: usize = 1 * 1024 * 1024; // 1 MiB
pub const GRPC_LARGE_RESPONSE_LIMIT: usize  = 4 * 1024 * 1024; // 4 MiB
pub const GRPC_STREAM_LOGS_REQUEST_LIMIT: usize = 64 * 1024;   // 64 KiB
pub const MCP_MAX_REQUEST_BODY: usize       = 1 * 1024 * 1024; // 1 MiB
pub const WEBHOOK_MAX_PAYLOAD: usize        = 64 * 1024;        // 64 KiB
pub const STREAM_LOGS_MAX_CHUNK: usize      = 32 * 1024;        // 32 KiB
pub const MCP_MAX_CONCURRENT_CONNECTIONS: usize = 64;
pub const STREAM_LOGS_MAX_FOLLOW_DURATION_SECS: u64 = 30 * 60; // 30 min
```

- **[PERF-074]** gRPC frame limit: 16 MiB; rejected with `RESOURCE_EXHAUSTED` before deserialization.
- **[PERF-076]** MCP HTTP request body: ≤ 1 MiB; HTTP 413 before handler invoked.
- **[PERF-077]** Webhook payload: ≤ 64 KiB; `data` field proportionally truncated; metadata fields always present.
- **[PERF-078]** `stream_logs` chunk: ≤ 32 KiB; splits at UTF-8 character boundaries.
- **[PERF-122]** MCP concurrent connections: ≤ 64; 65th → HTTP 503.
- **[PERF-123]** `stream_logs follow:true` max lifetime: 30 minutes; terminal chunk sent at 30 min.
- **PERF-BR-535** All network constants imported from `devs-core/src/constants.rs`; no inline literals.

### 5.5 Resource Budget Enforcement

- **[PERF-116]** `BoundedBytes<N>`: `From<Vec<u8>>` truncates to last N bytes; `serde::Deserialize` rejects if decoded bytes > N with `"byte length exceeds cap"`.
- **[PERF-117]** `BoundedString<N>`: rejects (no truncation); `ValidationError::StringTooLong`.
- **[PERF-118]** Context file 10 MiB cap: proportional truncation algorithm in `devs-executor`; truncates from beginning; preserves most recent content.
- **[PERF-119]** `truncate_utf8_from_start`: scans forward from `skip` until byte is not UTF-8 continuation (`(b & 0xC0) != 0x80`); truncates at that point.
- **[PERF-124]** All budget constants imported from `devs-core/src/constants.rs`; `./do lint` checks for violations.
- **PERF-BR-540** `BoundedBytes::from_bytes()` is the canonical constructor; struct fields are `pub(crate)`.
- **PERF-BR-541** `BoundedString::new()` MUST NOT truncate; returns `Err` which callers MUST propagate.

---

## §6 Scalability & Load Targets

### 6.1 Expected Operating Range (MVP)

- **[PERF-079]** MVP steady-state and peak load:

| Metric | Typical | Peak |
|---|---|---|
| Concurrent active runs | 2–4 | 10 |
| Concurrent active stages | 4–16 | 64 |
| Registered projects | 1–5 | 20 |
| gRPC connections | 1–3 | 10 |
| MCP concurrent connections | 1–5 | 64 |
| Submissions/hour | 5–20 | 100 |
| Log lines/second | 10–100 | 1 000 |

- **[PERF-080]** All §2 SLOs must be met at peak values simultaneously.
- **[PERF-126]** All seven peak metrics simultaneously satisfiable on reference hardware.
- **PERF-BR-612** `LoadProfile` snapshot: all counters as `AtomicU32`; assembled under single `SchedulerState` read lock; p99 < 1 ms.

### 6.2 Upper Structural Limits

| Dimension | Hard limit | Response when exceeded |
|---|---|---|
| Stages per workflow | 256 | gRPC `INVALID_ARGUMENT "workflow exceeds 256 stage limit: submitted N stages"` |
| Fan-out count | 64 | gRPC `INVALID_ARGUMENT "fan_out.count exceeds 64: got N"` |
| Pool `max_concurrent` | 1 024 | Config parse error at startup |
| Workflow inputs | 64 | gRPC `INVALID_ARGUMENT` |
| Stage env vars | 256 | gRPC `INVALID_ARGUMENT` |
| Webhook targets/project | 16 | gRPC `INVALID_ARGUMENT` |
| MCP concurrent connections | 64 | HTTP 503 |
| gRPC client event buffer | 256 messages | Oldest dropped; `RecvError::Lagged` |
| TUI log buffer/stage | 10 000 lines | Oldest evicted silently |
| Template stdout/stderr | 10 240 bytes | Oldest bytes truncated |
| Context file | 10 MiB | Content truncated proportionally |
| `BoundedBytes` per field | 1 048 576 bytes | Oldest bytes truncated |
| `BoundedString` per field | Per-type N bytes | `ValidationError::StringTooLong` |
| Retry `max_attempts` | 20 | Clamped to 20 with `WARN` |
| Concurrent active fallbacks | 3 | gRPC `INVALID_ARGUMENT` |
| Registered projects | 20 | gRPC `RESOURCE_EXHAUSTED` |

- **PERF-BR-620** Every hard limit defined as named `pub const` in `devs-core/src/constants.rs`; lint check enforced.
- **PERF-BR-621** Validation-layer limits checked BEFORE any write lock acquired.
- **PERF-BR-624** `LogBuffer` eviction is silent with respect to running stage; does not affect `StageRun` status; no `ERROR`-level log.
- **PERF-BR-625** Validation error messages: `"<dimension> exceeds <limit>: <detail>"` (machine-parseable).

---

## §7 Testing Strategy

### Tooling
- **Micro-benchmarks:** `criterion 0.5` in dedicated `benches/` directories per crate.
- **Coverage:** `cargo-llvm-cov` for unit + E2E combined; gates QG-001–QG-005 (90% threshold).
- **Tokio runtime:** single-threaded (`tokio::runtime::Builder::new_current_thread()`).
- **TUI testing:** `ratatui::backend::TestBackend` (200×50 default); `insta 1.x` for snapshots.
- **gRPC testing:** real in-process or localhost server (no mocks for SLO assertions).
- **`portable-pty 0.8`** for PTY allocation in E2E tests.
- **`git2`** / `spawn_blocking` for checkpoint operations in tests.

### Key Testing Rules
- All SLO assertions use `ci_threshold(SLO_*_P99_MS, is_hard_limit)` from `devs-core::perf`.
- Minimum 100 observations before percentile computation ([PERF-GP-005]).
- No outlier exclusion in SLO test assertions ([PERF-123]).
- E2E tests use real in-process server (dial time included in CLI measurements) ([PERF-GRP-021]).
- SLO tests co-located with functional tests in `./do test`; no separate "performance CI" step.
- `./do lint` checks: no inline SLO literals outside `devs-core/src/perf.rs`; no sub-1 s polling loops in tests; no inline network constants outside `devs-core/src/constants.rs`.

### Step Budgets (§3.7)
See §3.7 table. `cargo llvm-cov` under `coverage` step (300 s target, 420 s hard limit).

---

## §8 Observability

### Structured Log Events

| `event_type` | Level | Trigger |
|---|---|---|
| `slo.violation` | `WARN` | Measurement exceeds p99 threshold (rate-limited 10 s/pair) |
| `resource.truncated` | `WARN` | Any `BoundedBytes` or context file truncation |
| `checkpoint.retention_sweep_completed` | `INFO` | After each retention sweep |
| `checkpoint.sweep_slow` | `WARN` | Sweep > 120 s |
| `server.resource_budget_snapshot` | `INFO` | Every 5 minutes |
| `server.load_profile_snapshot` | `INFO` | Every 60 s when `active_run_count > 0` |
| `server.structural_limit_approach` | `WARN` | Any metric crosses 80% of hard limit |
| `server.structural_limit_violation` | `ERROR` | Validated input or runtime state reaches hard limit |
| `server.slo_compliance_report` | `INFO` | Every 5 minutes |
| `webhook.channel_overflow` | `WARN` | `try_send()` returns `Err(Full)` |
| `webhook.ssrf_blocked` | `WARN` | SSRF check blocks delivery attempt |
| `webhook.payload_too_large` | `WARN` | Delivery payload > 64 KiB |
| `executor.context_metadata_too_large` | `WARN` | Metadata skeleton alone > 10 MiB |

### SLO Monitoring State Machine (§2.4)

States per `(operation, boundary)` pair: `Unmonitored → Collecting → Compliant ↔ Violated → Emitting | Suppressed`.

- **[PERF-136]** Transition from `Collecting` requires exactly 100 samples.
- **[PERF-137]** `consecutive_violation_count ≥ 3` → `SloViolation.severity = "critical"` (< 3 → `"warning"`).
- **[PERF-138]** Rate-limiter state stored in `HashMap<(String, MeasurementBoundary), Instant>` protected by `Arc<RwLock<SchedulerState>>`; NOT a separate lock.

### MCP Tool Contracts
- Observation tools (`list_runs`, `get_run`, `get_stage_output`, `get_pool_state`): read lock only; unlimited concurrency.
- Control tools (`submit_run`, `cancel_run`, `write_workflow_definition`): write lock; 5 s timeout.
- All tool responses: HTTP 200; errors use `"isError": true` in JSON-RPC result.
- `stream_logs follow:true`: no lock after initial snapshot; `broadcast::Receiver` delivers live chunks.

---

## §10 Consolidated Acceptance Criteria (Key Items)

| Category | Key ACs |
|---|---|
| Infrastructure | AC-PERF-001–016, AC-PERF-SLO-001–020 |
| Submission flow | AC in §3.1: CLI submit ≤ 1 500 ms; duplicate reject ≤ 100 ms; 10 sequential ≤ 500 ms server-side |
| Dispatch flow | AC in §3.2: 2 independent stages ≤ 100 ms; diamond D ≤ 200 ms; capability fail ≤ 50 ms |
| Log streaming | AC in §3.3: 10 000 lines non-follow ≤ 2 000 ms; disconnect frees resources ≤ 500 ms |
| Cancellation | AC in §3.4: cancel response ≤ 500 ms; SIGKILL within 11 s; `exit_code: -9` recorded |
| TUI | AC in §3.5: checkpoint→frame ≤ 200 ms; 100 render cycles ≤ 16 ms each; reconnect first retry ≤ 1 000 ms |
| MCP observation | AC in §3.6: 64 concurrent `get_run` all ≤ 500 ms; 65th → HTTP 503; 10 000 buffered lines ≤ 5 000 ms |
| Agent pool | AC-PERF-4.1-001 through 008: fan-out, spawn failure, exhaustion webhook, capability fail, 1 024-agent selection |
| Parallel dispatch | AC-PERF-4.2-001 through 006: 100-stage 1 000 ms; 256-stage 2 000 ms; channel not overflow |
| gRPC throughput | AC-PERF-4.3-001 through 007: 50 connections, burst events, version header |
| MCP HTTP | AC-PERF-4.4-001 through 008: 64/65 connections, 5 submit/s, method/content errors, panic recovery |
| Webhooks | AC-PERF-4.5-001 through 007: 1 024 burst, overflow, SSRF, payload too large, 3-attempt retry |
| Multi-project | AC-PERF-4.6-001 through 007: weight ratio, strict priority, project removal, dispatch latency |
| CPU | AC-PERF-5.1-001 through 006 |
| Memory | AC-PERF-5.2-001 through 006 |
| Storage | AC-PERF-5.3-001 through 007 |
| Network | AC-PERF-5.4-001 through 008 |
| Enforcement | AC-PERF-5.5-001 through 008 |
| Peak load | AC-PERF-6.1-001 through 006 |

---

## Appendix A: Traceability Model

All normative identifiers in this document follow the pattern `[PERF-NNN]`, `[AC-PERF-NNN]`, `[PERF-GP-NNN]`, `[PERF-BR-NNN]`, `[PERF-GRP-NNN]`, `[PERF-SLO-BR-NNN]`, `[PERF-REG-NNN]`, `[PERF-DEP-NNN]`, `[PERF-TRACE-BR-NNN]`.

Every normative requirement MUST be covered by an automated test annotated `// Covers: PERF-NNN`. The traceability gate in `./do test` validates this via `target/traceability.json`. Missing coverage causes `./do presubmit` to fail.

Dependencies on upstream specs: PRD (`1_prd.md`), TAS (`2_tas.md`), MCP Design (`3_mcp_design.md`), User Features (`4_user_features.md`), Security Design (`5_security_design.md`), Risks & Mitigation (`8_risks_mitigation.md`). Upstream specs govern when conflicts exist.
