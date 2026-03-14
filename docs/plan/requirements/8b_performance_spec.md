# Requirements: Performance Specification

### **[PERF-NNN] [8b_PERF_SPEC-REQ-001]** Requirement PERF-NNN
- **Type:** Performance
- **Description:** All `[PERF-NNN]` identifiers are normative. Every target is measurable and must be covered by an automated test annotated `// Covers: PERF-NNN`. This specification derives all targets directly from re...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-001] [8b_PERF_SPEC-REQ-002]** Requirement PERF-GP-001
- **Type:** Performance
- **Description:** **[PERF-GP-001]** No SLO target may be used to justify skipping validation. The 7-step `submit_run` validation pipeline, the 13-step workflow definition validation pipeline, and the `StateMachine::tra...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-002] [8b_PERF_SPEC-REQ-003]** Requirement PERF-GP-002
- **Type:** Performance
- **Description:** **[PERF-GP-002]** Performance tests MUST NOT assert correctness by timing alone. A test that verifies a stage was dispatched within 100 ms MUST also assert that the stage's `status == "running"` and t...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-003] [8b_PERF_SPEC-REQ-004]** Requirement PERF-GP-003
- **Type:** Performance
- **Description:** **[PERF-GP-003]** When `SubmitRun` validation fails (e.g., cycle detected, duplicate run name, unknown pool), the error response MUST still be returned within the p99 latency target for the operation....
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-004] [8b_PERF_SPEC-REQ-005]** Requirement PERF-GP-004
- **Type:** Performance
- **Description:** **[PERF-GP-004]** All SLO assertions in test code use the **p99 column** as the CI threshold. A single-shot test that measures one operation applies the p99 target directly (with the 50% CI variance m...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-110] [8b_PERF_SPEC-REQ-006]** Requirement PERF-110
- **Type:** Performance
- **Description:** **[PERF-GP-004]** All SLO assertions in test code use the **p99 column** as the CI threshold. A single-shot test that measures one operation applies the p99 target directly (with the 50% CI variance m...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-005] [8b_PERF_SPEC-REQ-007]** Requirement PERF-GP-005
- **Type:** Performance
- **Description:** **[PERF-GP-005]** Minimum sample size for any percentile assertion in a performance test: **100 observations**. Asserting p99 from fewer than 100 observations is statistically meaningless and MUST fai...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-006] [8b_PERF_SPEC-REQ-008]** Requirement PERF-GP-006
- **Type:** Performance
- **Description:** **[PERF-GP-006]** The p50 column in the SLO table (§2) is informational. Tests MUST assert p99; they MAY assert p50 as a secondary diagnostic. CI does not fail on p50 violations alone. If p50 degrades...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-007] [8b_PERF_SPEC-REQ-009]** Requirement PERF-GP-007
- **Type:** Performance
- **Description:** **[PERF-GP-007]** `tracing` spans MUST NOT be used as performance assertions. `tracing` instrumentation may record internal durations for diagnostic purposes, but the authoritative measurement for eac...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-008] [8b_PERF_SPEC-REQ-010]** Requirement PERF-GP-008
- **Type:** Performance
- **Description:** **[PERF-GP-008]** Boundary measurement points are fixed per-operation and defined in [PERF-105] through [PERF-109]. An implementing agent MUST NOT move a measurement point without a corresponding spec...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-105] [8b_PERF_SPEC-REQ-011]** Requirement PERF-105
- **Type:** Performance
- **Description:** **[PERF-GP-008]** Boundary measurement points are fixed per-operation and defined in [PERF-105] through [PERF-109]. An implementing agent MUST NOT move a measurement point without a corresponding spec...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-109] [8b_PERF_SPEC-REQ-012]** Requirement PERF-109
- **Type:** Performance
- **Description:** **[PERF-GP-008]** Boundary measurement points are fixed per-operation and defined in [PERF-105] through [PERF-109]. An implementing agent MUST NOT move a measurement point without a corresponding spec...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-009] [8b_PERF_SPEC-REQ-013]** Requirement PERF-GP-009
- **Type:** Performance
- **Description:** **[PERF-GP-009]** The CLI binary measurement boundary (main() to process exit, [PERF-108]) is intentionally broader than the server-side gRPC boundary. This difference accounts for gRPC dial time. The...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-108] [8b_PERF_SPEC-REQ-014]** Requirement PERF-108
- **Type:** Performance
- **Description:** **[PERF-GP-009]** The CLI binary measurement boundary (main() to process exit, [PERF-108]) is intentionally broader than the server-side gRPC boundary. This difference accounts for gRPC dial time. The...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-025] [8b_PERF_SPEC-REQ-015]** Requirement PERF-025
- **Type:** Performance
- **Description:** **[PERF-GP-009]** The CLI binary measurement boundary (main() to process exit, [PERF-108]) is intentionally broader than the server-side gRPC boundary. This difference accounts for gRPC dial time. The...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-027] [8b_PERF_SPEC-REQ-016]** Requirement PERF-027
- **Type:** Performance
- **Description:** **[PERF-GP-009]** The CLI binary measurement boundary (main() to process exit, [PERF-108]) is intentionally broader than the server-side gRPC boundary. This difference accounts for gRPC dial time. The...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-006] [8b_PERF_SPEC-REQ-017]** Requirement PERF-006
- **Type:** Performance
- **Description:** **[PERF-GP-009]** The CLI binary measurement boundary (main() to process exit, [PERF-108]) is intentionally broader than the server-side gRPC boundary. This difference accounts for gRPC dial time. The...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-009] [8b_PERF_SPEC-REQ-018]** Requirement PERF-009
- **Type:** Performance
- **Description:** **[PERF-GP-009]** The CLI binary measurement boundary (main() to process exit, [PERF-108]) is intentionally broader than the server-side gRPC boundary. This difference accounts for gRPC dial time. The...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-010] [8b_PERF_SPEC-REQ-019]** Requirement PERF-GP-010
- **Type:** Performance
- **Description:** **[PERF-GP-010]** `StreamRunEvents` and `stream_logs follow:true` exist precisely to eliminate the need for polling. Any test or client code that calls `get_run` or `list_runs` in a loop with a sleep ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-011] [8b_PERF_SPEC-REQ-020]** Requirement PERF-GP-011
- **Type:** Performance
- **Description:** **[PERF-GP-011]** The sole permitted exception to [PERF-GP-010] is the cancel-run polling loop in [MCP-061]: `poll get_run every 500ms, max 30s, until status=="cancelled"`. This exception is explicitl...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-012] [8b_PERF_SPEC-REQ-021]** Requirement PERF-GP-012
- **Type:** Performance
- **Description:** **[PERF-GP-012]** The TUI is event-driven, not timer-driven. It MUST NOT call any gRPC RPC on a fixed timer tick. The 1-second `Tick` event is used only for elapsed-time formatting updates and log buf...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-013] [8b_PERF_SPEC-REQ-022]** Requirement PERF-GP-013
- **Type:** Performance
- **Description:** **[PERF-GP-013]** Truncation is always from the beginning (oldest content removed), never from the end. This preserves the most recent diagnostic output, which is the most actionable. The rule applies...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-014] [8b_PERF_SPEC-REQ-023]** Requirement PERF-GP-014
- **Type:** Performance
- **Description:** **[PERF-GP-014]** A resource-budget violation MUST set `truncated: true` in the relevant response field and MUST log `WARN` with `event_type: "resource.truncated"`, `field`, `original_bytes` (if known...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-015] [8b_PERF_SPEC-REQ-024]** Requirement PERF-GP-015
- **Type:** Performance
- **Description:** **[PERF-GP-015]** Hard limits defined in `devs-core` (e.g., `BoundedBytes<N>`, `BoundedString<N>`) are enforced at `serde::Deserialize` time. A payload that violates a hard limit during deserializatio...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-016] [8b_PERF_SPEC-REQ-025]** Requirement PERF-GP-016
- **Type:** Performance
- **Description:** **[PERF-GP-016]** The `./do presubmit` 900-second hard timeout is enforced by a background timer subprocess whose PID is written to `target/.presubmit_timer.pid`. On breach: SIGTERM to the active step...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-017] [8b_PERF_SPEC-REQ-026]** Requirement PERF-GP-017
- **Type:** Performance
- **Description:** **[PERF-GP-017]** Each step within `./do presubmit` has a soft budget (see §3.7). A step that exceeds its budget by more than 20% emits `WARN: step <name> over budget: <duration>ms > <budget>ms` to st...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-018] [8b_PERF_SPEC-REQ-027]** Requirement PERF-GP-018
- **Type:** Performance
- **Description:** **[PERF-GP-018]** The `target/presubmit_timings.jsonl` file is a CI artifact. It MUST be uploaded even when `./do presubmit` fails. GitLab CI config MUST specify `when: always` for this artifact. The ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-001] [8b_PERF_SPEC-REQ-028]** Requirement PERF-001
- **Type:** Performance
- **Description:** **[PERF-001]** The DAG scheduler dispatches newly eligible stages within **100 ms** of their last dependency completing. Measurement begins at the moment `StateMachine::transition()` returns `Ok(())` ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-001-BR-001] [8b_PERF_SPEC-REQ-029]** Requirement PERF-001-BR-001
- **Type:** Performance
- **Description:** **[PERF-001-BR-001]** The 100 ms budget applies only when a semaphore slot is immediately available. When all `max_concurrent` slots are occupied, the stage is queued on the semaphore; no dispatch lat...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-001-BR-002] [8b_PERF_SPEC-REQ-030]** Requirement PERF-001-BR-002
- **Type:** Performance
- **Description:** **[PERF-001-BR-002]** The budget assumes the `tempdir` execution environment. For `docker` and `remote` environments, dispatch latency includes container startup or SSH connection time, which is not b...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-001-BR-003] [8b_PERF_SPEC-REQ-031]** Requirement PERF-001-BR-003
- **Type:** Performance
- **Description:** **[PERF-001-BR-003]** `evaluate_eligibility()` MUST complete in O(V + E) time where V is the number of stages and E is the total number of `depends_on` edges. Quadratic implementations are prohibited....
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-051] [8b_PERF_SPEC-REQ-032]** Requirement PERF-051
- **Type:** Performance
- **Description:** 1. **All 256 stages independent**: A workflow with 256 stages that have no `depends_on` relationships. All 256 must become `Eligible` atomically when the run transitions to `Running`. With `max_concur...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-002] [8b_PERF_SPEC-REQ-033]** Requirement PERF-002
- **Type:** Performance
- **Description:** **[PERF-002]** The TUI re-renders within **50 ms** of receiving any `RunEvent` from the gRPC `StreamRunEvents` stream. Measurement begins when the `TuiEvent` is dequeued from the `mpsc` channel in the...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-002-BR-001] [8b_PERF_SPEC-REQ-034]** Requirement PERF-002-BR-001
- **Type:** Performance
- **Description:** **[PERF-002-BR-001]** `render()` itself is bounded at 16 ms ([PERF-004]) and is a sub-budget of the 50 ms commitment. The 50 ms end-to-end budget includes state mutation and OS I/O, which are not part...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-004] [8b_PERF_SPEC-REQ-035]** Requirement PERF-004
- **Type:** Performance
- **Description:** **[PERF-002-BR-001]** `render()` itself is bounded at 16 ms ([PERF-004]) and is a sub-budget of the 50 ms commitment. The 50 ms end-to-end budget includes state mutation and OS I/O, which are not part...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-002-BR-002] [8b_PERF_SPEC-REQ-036]** Requirement PERF-002-BR-002
- **Type:** Performance
- **Description:** **[PERF-002-BR-002]** When multiple `TuiEvent` messages are queued (e.g., a burst of 10 `RunDelta` events arrives simultaneously), each event must individually satisfy the 50 ms budget measured from i...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-002-BR-003] [8b_PERF_SPEC-REQ-037]** Requirement PERF-002-BR-003
- **Type:** Performance
- **Description:** **[PERF-002-BR-003]** The TUI re-render budget applies to all event types: `RunSnapshot`, `RunDelta`, `LogLine`, `PoolSnapshot`, `PoolDelta`, `Connected`, `StreamError`, `ReconnectAttempt`, and `Tick`...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-002-BR-004] [8b_PERF_SPEC-REQ-038]** Requirement PERF-002-BR-004
- **Type:** Performance
- **Description:** **[PERF-002-BR-004]** During `Reconnecting` state, the TUI continues to process keyboard events and render the status bar. The 50 ms budget applies during reconnection. The TUI MUST NOT freeze during ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-003] [8b_PERF_SPEC-REQ-039]** Requirement PERF-003
- **Type:** Performance
- **Description:** **[PERF-003]** MCP observation tools (`list_runs`, `get_run`, `get_stage_output`, `get_pool_state`, `get_workflow_definition`, `list_checkpoints`, `stream_logs` non-follow) return the first byte of a ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-003-BR-001] [8b_PERF_SPEC-REQ-040]** Requirement PERF-003-BR-001
- **Type:** Performance
- **Description:** **[PERF-003-BR-001]** Observation tools acquire read locks only (never write locks). Multiple observation tool calls MUST execute fully concurrently — they MUST NOT serialize behind each other. The so...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-003-BR-002] [8b_PERF_SPEC-REQ-041]** Requirement PERF-003-BR-002
- **Type:** Performance
- **Description:** **[PERF-003-BR-002]** `stream_logs` with `follow:false` MUST NOT hold the `SchedulerState` read lock for the duration of response streaming. It acquires the lock to snapshot the buffer, releases it, t...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-003-BR-003] [8b_PERF_SPEC-REQ-042]** Requirement PERF-003-BR-003
- **Type:** Performance
- **Description:** **[PERF-003-BR-003]** The 2 000 ms ceiling includes the write-lock contention time (up to 5 000 ms before `resource_exhausted`). When `resource_exhausted` is returned after 5 000 ms of lock contention...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-004-BR-001] [8b_PERF_SPEC-REQ-043]** Requirement PERF-004-BR-001
- **Type:** Performance
- **Description:** **[PERF-004-BR-001]** `render()` is the method passed to `terminal.draw(|frame| { ... })`. The closure body MUST contain only:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-004-BR-002] [8b_PERF_SPEC-REQ-044]** Requirement PERF-004-BR-002
- **Type:** Performance
- **Description:** **[PERF-004-BR-002]** `render()` MUST NOT call any of the following: file I/O, network I/O, `Mutex::lock()`, `RwLock::read()`, `RwLock::write()`, `tokio::spawn()`, `std::thread::spawn()`, or any `asyn...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-004-BR-003] [8b_PERF_SPEC-REQ-045]** Requirement PERF-004-BR-003
- **Type:** Performance
- **Description:** **[PERF-004-BR-003]** `dag_tiers` computation (Kahn's topological sort), `format_elapsed()` updates, and log buffer eviction are performed in `handle_event()`, NOT in `render()`. `render()` reads pre-...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-004-BR-004] [8b_PERF_SPEC-REQ-046]** Requirement PERF-004-BR-004
- **Type:** Performance
- **Description:** **[PERF-004-BR-004]** The 16 ms limit applies at `ColorMode::Color`. `ColorMode::Monochrome` requires fewer style computations and MUST be at least as fast.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-005] [8b_PERF_SPEC-REQ-047]** Requirement PERF-005
- **Type:** Performance
- **Description:** **[PERF-005]** The `./do presubmit` pipeline completes within **900 seconds** (15 minutes) wall-clock on Linux, macOS, and Windows CI runners.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-005-BR-001] [8b_PERF_SPEC-REQ-048]** Requirement PERF-005-BR-001
- **Type:** Performance
- **Description:** **[PERF-005-BR-001]** The 900-second timer begins at the first line of `./do presubmit` (before `./do setup`) and ends when `./do presubmit` exits. The timer is wall-clock (not CPU time) and must acco...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-005-BR-002] [8b_PERF_SPEC-REQ-049]** Requirement PERF-005-BR-002
- **Type:** Performance
- **Description:** **[PERF-005-BR-002]** When the timer fires: SIGTERM is sent to the currently-executing step → 5 seconds of grace period → SIGKILL to the entire process group. `./do presubmit` then exits with code 1. ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-104] [8b_PERF_SPEC-REQ-050]** Requirement PERF-104
- **Type:** Performance
- **Description:** **[PERF-005-BR-002]** When the timer fires: SIGTERM is sent to the currently-executing step → 5 seconds of grace period → SIGKILL to the entire process group. `./do presubmit` then exits with code 1. ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-005-BR-003] [8b_PERF_SPEC-REQ-051]** Requirement PERF-005-BR-003
- **Type:** Performance
- **Description:** **[PERF-005-BR-003]** `./do presubmit` MUST run steps sequentially. Parallel execution of steps (e.g., running `lint` and `test` simultaneously) is prohibited, as it would make the timing records ambi...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-005-BR-004] [8b_PERF_SPEC-REQ-052]** Requirement PERF-005-BR-004
- **Type:** Performance
- **Description:** **[PERF-005-BR-004]** On all three CI platforms (Linux, macOS, Windows), the same 900-second limit applies. Platform-specific compilation overhead (e.g., MSVC linker on Windows being slower) does not ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-019] [8b_PERF_SPEC-REQ-053]** Requirement PERF-GP-019
- **Type:** Performance
- **Description:** **[PERF-GP-019]** `LatencyMeasurement` MUST be constructed immediately before the operation begins (not pre-allocated with a stale `started_at`). The `started_at` field is set at `LatencyMeasurement::...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-020] [8b_PERF_SPEC-REQ-054]** Requirement PERF-GP-020
- **Type:** Performance
- **Description:** **[PERF-GP-020]** `LatencyMeasurement::elapsed_ms` is computed using `std::time::Instant` (monotonic clock). Wall-clock time (`chrono::Utc::now()`) MUST NOT be used for duration computation. The monot...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-101] [8b_PERF_SPEC-REQ-055]** Requirement PERF-101
- **Type:** Performance
- **Description:** **[PERF-101]** `SloViolation` events MUST be emitted for every boundary measurement that exceeds the p99 threshold in the SLO table (§2). They MUST NOT be emitted for measurements that fall within the...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-102] [8b_PERF_SPEC-REQ-056]** Requirement PERF-102
- **Type:** Performance
- **Description:** **[PERF-102]** `SloViolation` events MUST NOT be emitted more than once per 10-second window for the same `(operation, boundary)` pair. This rate-limits log noise under sustained degradation while sti...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-103] [8b_PERF_SPEC-REQ-057]** Requirement PERF-103
- **Type:** Performance
- **Description:** **[PERF-103]** `./do presubmit` MUST flush each record to `target/presubmit_timings.jsonl` immediately after the step completes (not at the end of the script). This ensures partial timing data is avai...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-021] [8b_PERF_SPEC-REQ-058]** Requirement PERF-GP-021
- **Type:** Performance
- **Description:** **[PERF-GP-021]** `target/presubmit_timings.jsonl` MUST exist and contain at least one record after any invocation of `./do presubmit` that begins executing steps. If the script is killed before any s...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-REG-001] [8b_PERF_SPEC-REQ-059]** Requirement PERF-REG-001
- **Type:** Performance
- **Description:** **[PERF-REG-001]** Performance SLO tests are part of the standard test suite and run as part of `./do test`. A commit that introduces a performance regression fails `./do presubmit` the same way a tes...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-REG-002] [8b_PERF_SPEC-REQ-060]** Requirement PERF-REG-002
- **Type:** Performance
- **Description:** **[PERF-REG-002]** `SloViolation` log events in CI output are informational only — they do NOT fail the build. Only test assertions (`assert!(elapsed_ms < threshold_with_margin)`) fail the build. This...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-REG-003] [8b_PERF_SPEC-REQ-061]** Requirement PERF-REG-003
- **Type:** Performance
- **Description:** **[PERF-REG-003]** When a performance test fails in CI, the implementing agent MUST diagnose the root cause before any code change. The diagnostic sequence is:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-REG-004] [8b_PERF_SPEC-REQ-062]** Requirement PERF-REG-004
- **Type:** Performance
- **Description:** **[PERF-REG-004]** SLO targets defined in this document are immutable without a spec amendment. An agent MUST NOT change an SLO target in `8b_performance_spec.md` to make a failing test pass. The corr...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-REG-005] [8b_PERF_SPEC-REQ-063]** Requirement PERF-REG-005
- **Type:** Performance
- **Description:** **[PERF-REG-005]** The CI variance margin applied in test assertions (50% of the p99 target, per [PERF-110]) MUST be documented as a comment adjacent to each assertion:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-028] [8b_PERF_SPEC-REQ-064]** Requirement PERF-028
- **Type:** Performance
- **Description:** | `devs-checkpoint` | Uses `LatencyMeasurement` for checkpoint write timing ([PERF-028]) |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-DEP-001] [8b_PERF_SPEC-REQ-065]** Requirement PERF-DEP-001
- **Type:** Performance
- **Description:** **[PERF-DEP-001]** `devs-core/src/perf.rs` MUST be implemented and reviewed before any other crate adds performance instrumentation. This prevents duplicate definitions and ensures all crates share a ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-DEP-002] [8b_PERF_SPEC-REQ-066]** Requirement PERF-DEP-002
- **Type:** Performance
- **Description:** **[PERF-DEP-002]** SLO thresholds MUST be defined as `pub const u64` values in `devs-core/src/perf.rs`, not as inline numeric literals in test files. Test files MUST import these constants. Example:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-001] [8b_PERF_SPEC-REQ-067]** Requirement AC-PERF-001
- **Type:** Performance
- **Description:** - **[AC-PERF-001]** `devs-core/src/perf.rs` exports `LatencyMeasurement`, `MeasurementBoundary`, and `pub const SLO_*_P99_MS: u64` for every operation in the §2 SLO table. `cargo doc --no-deps` must e...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-002] [8b_PERF_SPEC-REQ-068]** Requirement AC-PERF-002
- **Type:** Performance
- **Description:** - **[AC-PERF-002]** `devs-core/src/perf.rs` has `unsafe_code = "deny"` and no `unsafe` blocks. `cargo tree -p devs-core --edges normal` must not list `tokio`, `git2`, `reqwest`, or `tonic` (matches `[...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-003] [8b_PERF_SPEC-REQ-069]** Requirement AC-PERF-003
- **Type:** Performance
- **Description:** - **[AC-PERF-003]** A unit test in `devs-core` verifies that `MeasurementBoundary` has exactly the 7 variants defined in §1.3.1. Adding a variant without updating the test causes a compile error (exha...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-004] [8b_PERF_SPEC-REQ-070]** Requirement AC-PERF-004
- **Type:** Performance
- **Description:** - **[AC-PERF-004]** A unit test verifies that `SloViolation` rate-limiting emits exactly one log event when 100 consecutive measurements exceed the threshold within a 10-second window, and exactly two...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-005] [8b_PERF_SPEC-REQ-071]** Requirement AC-PERF-005
- **Type:** Performance
- **Description:** - **[AC-PERF-005]** `target/presubmit_timings.jsonl` exists after `./do presubmit` completes (success or failure). Each line is valid JSON conforming to the `PresubmitTimingRecord` schema. An integrat...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-006] [8b_PERF_SPEC-REQ-072]** Requirement AC-PERF-006
- **Type:** Performance
- **Description:** - **[AC-PERF-006]** `target/presubmit_timings.jsonl` contains exactly one record per step that executed. Steps that were not reached (e.g., because an earlier step failed) have no record. The `_timeou...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-007] [8b_PERF_SPEC-REQ-073]** Requirement AC-PERF-007
- **Type:** Performance
- **Description:** - **[AC-PERF-007]** A lint check (`./do lint`) verifies that no `.rs` file outside `devs-core/src/perf.rs` contains inline numeric literals used as SLO thresholds (i.e., `assert!(elapsed_ms < 500)` wi...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-008] [8b_PERF_SPEC-REQ-074]** Requirement AC-PERF-008
- **Type:** Performance
- **Description:** - **[AC-PERF-008]** A lint check (`./do lint`) verifies that no test file contains `sleep(Duration::from_millis(N))` where `N < 1000` inside a loop. This enforces [PERF-GP-010].
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-009] [8b_PERF_SPEC-REQ-075]** Requirement AC-PERF-009
- **Type:** Performance
- **Description:** - **[AC-PERF-009]** A unit test verifies that `LatencyMeasurement::elapsed_ms` uses `std::time::Instant` (monotonic), not `chrono::Utc::now()`. This is verified by inspecting that `started_at` is of t...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-010] [8b_PERF_SPEC-REQ-076]** Requirement AC-PERF-010
- **Type:** Performance
- **Description:** - **[AC-PERF-010]** A unit test verifies that `render()` in `devs-tui` is `&self` (not `&mut self`) and that the `AppState` borrow passed to `render()` is immutable (`&AppState`), enforcing [PERF-004-...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-011] [8b_PERF_SPEC-REQ-077]** Requirement AC-PERF-011
- **Type:** Performance
- **Description:** - **[AC-PERF-011]** Two independently-rooted stages in a workflow are both dispatched within 100 ms of the run transitioning to `Running` (verified via `GetRun` polling and stage `started_at` timestam...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-012] [8b_PERF_SPEC-REQ-078]** Requirement AC-PERF-012
- **Type:** Performance
- **Description:** - **[AC-PERF-012]** The TUI re-renders within 50 ms of receiving a synthetic `RunDelta` event injected into the event channel. Measured in a `TestBackend` test with a 200×50 frame at `ColorMode::Monoc...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-013] [8b_PERF_SPEC-REQ-079]** Requirement AC-PERF-013
- **Type:** Performance
- **Description:** - **[AC-PERF-013]** A `TestBackend` test renders a 256-stage DAG and asserts that `handle_event()` plus `render()` complete within 50 ms total. This exercises the O(V+E) DAG tier computation at maximu...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-014] [8b_PERF_SPEC-REQ-080]** Requirement AC-PERF-014
- **Type:** Performance
- **Description:** - **[AC-PERF-014]** `./do presubmit` exits non-zero when the 900-second timer fires (simulated by setting a 5-second override timeout in a test invocation). The `_timeout_kill` record is present in `t...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-015] [8b_PERF_SPEC-REQ-081]** Requirement AC-PERF-015
- **Type:** Performance
- **Description:** - **[AC-PERF-015]** `SloViolation` events are not emitted for operations that complete within their p99 threshold. A unit test that records 1 000 measurements all at `threshold_ms - 1` asserts that th...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-016] [8b_PERF_SPEC-REQ-082]** Requirement AC-PERF-016
- **Type:** Performance
- **Description:** - **[AC-PERF-016]** `devs-core/src/perf.rs` contains `pub const` SLO threshold values for each of PERF-001 through PERF-033 that have numeric p99 targets. A compile-time test (`static_assertions::cons...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-SLO-BR-001] [8b_PERF_SPEC-REQ-083]** Requirement PERF-SLO-BR-001
- **Type:** Performance
- **Description:** **[PERF-SLO-BR-001]** Every SLO entry in the table below MUST have a corresponding integration test that collects ≥ 100 observations ([PERF-GP-005]) before computing percentiles. Tests that run fewer ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-SLO-BR-002] [8b_PERF_SPEC-REQ-084]** Requirement PERF-SLO-BR-002
- **Type:** Performance
- **Description:** **[PERF-SLO-BR-002]** For operations with both a latency SLO and a throughput SLO, the throughput target MUST be sustained while simultaneously meeting the latency target. Throughput under degraded la...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-SLO-BR-003] [8b_PERF_SPEC-REQ-085]** Requirement PERF-SLO-BR-003
- **Type:** Performance
- **Description:** **[PERF-SLO-BR-003]** Any operation whose p99 latency exceeds its SLO target for three or more consecutive measurement windows MUST emit a `SloViolation` structured log event with `severity = "critica...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-SLO-BR-004] [8b_PERF_SPEC-REQ-086]** Requirement PERF-SLO-BR-004
- **Type:** Performance
- **Description:** **[PERF-SLO-BR-004]** SLO thresholds are stable across minor releases. A SLO regression (any p99 increase > 10%) MUST be treated as a breaking change and requires an explicit PERF-ID amendment with ra...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-SLO-BR-005] [8b_PERF_SPEC-REQ-087]** Requirement PERF-SLO-BR-005
- **Type:** Performance
- **Description:** **[PERF-SLO-BR-005]** Hard limits (operations where the p99 column equals the hard maximum, such as [PERF-023] TUI render at 16 ms) MUST be enforced in production code via a `debug_assert!` or equival...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-023] [8b_PERF_SPEC-REQ-088]** Requirement PERF-023
- **Type:** Performance
- **Description:** **[PERF-SLO-BR-005]** Hard limits (operations where the p99 column equals the hard maximum, such as [PERF-023] TUI render at 16 ms) MUST be enforced in production code via a `debug_assert!` or equival...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-007] [8b_PERF_SPEC-REQ-089]** Requirement PERF-007
- **Type:** Performance
- **Description:** | **[PERF-007]** | `GetRun` gRPC RPC | < 5 ms | < 20 ms | < 50 ms | ≥ 100 req/s | Read-only; in-memory `RwLock` |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-008] [8b_PERF_SPEC-REQ-090]** Requirement PERF-008
- **Type:** Performance
- **Description:** | **[PERF-008]** | `ListRuns` gRPC RPC | < 10 ms | < 50 ms | < 100 ms | ≥ 50 req/s | Default limit 100; no `stage_runs` |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-010] [8b_PERF_SPEC-REQ-091]** Requirement PERF-010
- **Type:** Performance
- **Description:** | **[PERF-010]** | `StreamRunEvents` first event | < 50 ms | < 100 ms | < 200 ms | ≥ 20 concurrent streams | First message is run snapshot |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-011] [8b_PERF_SPEC-REQ-092]** Requirement PERF-011
- **Type:** Performance
- **Description:** | **[PERF-011]** | `StreamLogs` non-follow, TTFB | < 20 ms | < 100 ms | < 250 ms | ≥ 20 concurrent streams | Returns buffered lines then closes |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-012] [8b_PERF_SPEC-REQ-093]** Requirement PERF-012
- **Type:** Performance
- **Description:** | **[PERF-012]** | `StreamLogs` follow:true, live chunk latency | < 100 ms | < 300 ms | < 500 ms | ≥ 20 concurrent streams | From stdout write to client receipt |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-013] [8b_PERF_SPEC-REQ-094]** Requirement PERF-013
- **Type:** Performance
- **Description:** | **[PERF-013]** | `WatchPoolState` first event | < 50 ms | < 100 ms | < 200 ms | ≥ 10 concurrent streams | Initial snapshot message |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-014] [8b_PERF_SPEC-REQ-095]** Requirement PERF-014
- **Type:** Performance
- **Description:** | **[PERF-014]** | MCP `list_runs` response time | < 20 ms | < 100 ms | < 500 ms | ≥ 30 req/s | Read lock only; parallel-safe |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-015] [8b_PERF_SPEC-REQ-096]** Requirement PERF-015
- **Type:** Performance
- **Description:** | **[PERF-015]** | MCP `get_run` response time | < 10 ms | < 50 ms | < 200 ms | ≥ 50 req/s | Read lock only |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-016] [8b_PERF_SPEC-REQ-097]** Requirement PERF-016
- **Type:** Performance
- **Description:** | **[PERF-016]** | MCP `get_stage_output` response time | < 20 ms | < 100 ms | < 500 ms | ≥ 20 req/s | Up to 2 MiB payload (1 MiB stdout + 1 MiB stderr) |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-017] [8b_PERF_SPEC-REQ-098]** Requirement PERF-017
- **Type:** Performance
- **Description:** | **[PERF-017]** | MCP `submit_run` response time | < 100 ms | < 500 ms | < 1 000 ms | ≥ 5 req/s | Includes validation + checkpoint write |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-018] [8b_PERF_SPEC-REQ-099]** Requirement PERF-018
- **Type:** Performance
- **Description:** | **[PERF-018]** | MCP `cancel_run` response time | < 100 ms | < 500 ms | < 1 000 ms | ≥ 5 req/s | Write lock; atomic cascade |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-019] [8b_PERF_SPEC-REQ-100]** Requirement PERF-019
- **Type:** Performance
- **Description:** | **[PERF-019]** | MCP `write_workflow_definition` response time | < 200 ms | < 1 000 ms | < 2 000 ms | ≥ 2 req/s | 13-step validation + disk write |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-020] [8b_PERF_SPEC-REQ-101]** Requirement PERF-020
- **Type:** Performance
- **Description:** | **[PERF-020]** | MCP lock acquisition (write-contended) | < 500 ms | < 2 000 ms | < 5 000 ms | — | Timeout at 5 s → `resource_exhausted` |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-021] [8b_PERF_SPEC-REQ-102]** Requirement PERF-021
- **Type:** Performance
- **Description:** | **[PERF-021]** | DAG scheduler dispatch latency | < 20 ms | < 50 ms | < 100 ms | — | From dep-complete event to stage spawn |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-022] [8b_PERF_SPEC-REQ-103]** Requirement PERF-022
- **Type:** Performance
- **Description:** | **[PERF-022]** | Stage cancel signal delivery | < 1 000 ms | < 3 000 ms | < 5 000 ms | — | stdin `devs:cancel\n` to process |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-024] [8b_PERF_SPEC-REQ-104]** Requirement PERF-024
- **Type:** Performance
- **Description:** | **[PERF-024]** | TUI event→render pipeline | < 20 ms | < 40 ms | < 50 ms | — | From `RunEvent` receipt to screen update |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-026] [8b_PERF_SPEC-REQ-105]** Requirement PERF-026
- **Type:** Performance
- **Description:** | **[PERF-026]** | CLI `devs list` | < 100 ms | < 300 ms | < 700 ms | — | One `ListRuns` gRPC call |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-029] [8b_PERF_SPEC-REQ-106]** Requirement PERF-029
- **Type:** Performance
- **Description:** | **[PERF-029]** | Webhook delivery attempt (TTFB to target) | < 500 ms | < 3 000 ms | < 10 000 ms | ≥ 8 concurrent deliveries | Hard 10 s timeout per attempt |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-030] [8b_PERF_SPEC-REQ-107]** Requirement PERF-030
- **Type:** Performance
- **Description:** | **[PERF-030]** | Server startup (all ports bound + discovery file written) | < 2 000 ms | < 5 000 ms | < 10 000 ms | — | Excludes checkpoint restore duration |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-031] [8b_PERF_SPEC-REQ-108]** Requirement PERF-031
- **Type:** Performance
- **Description:** | **[PERF-031]** | Server startup with checkpoint restore (≤50 runs) | < 5 000 ms | < 15 000 ms | < 30 000 ms | — | git2 operations via spawn_blocking |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-032] [8b_PERF_SPEC-REQ-109]** Requirement PERF-032
- **Type:** Performance
- **Description:** | **[PERF-032]** | `./do presubmit` wall clock | — | — | < 900 000 ms | — | Hard timeout; process killed on breach |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-033] [8b_PERF_SPEC-REQ-110]** Requirement PERF-033
- **Type:** Performance
- **Description:** | **[PERF-033]** | Retention sweep duration (≤500 runs) | < 5 000 ms | < 30 000 ms | < 60 000 ms | — | At startup + every 24 h |
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-106] [8b_PERF_SPEC-REQ-111]** Requirement PERF-106
- **Type:** Performance
- **Description:** **[PERF-106]** For MCP HTTP tools, measurement begins when `hyper` delivers the fully-parsed request body to the handler function and ends when `hyper` acknowledges the last byte of the response body ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-107] [8b_PERF_SPEC-REQ-112]** Requirement PERF-107
- **Type:** Performance
- **Description:** **[PERF-107]** For the DAG scheduler dispatch latency ([PERF-021]), measurement begins at the moment `StateMachine::transition()` returns `Ok(())` for the dependency's terminal transition, and ends at...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-116] [8b_PERF_SPEC-REQ-113]** Requirement PERF-116
- **Type:** Performance
- **Description:** **[PERF-116]** A throughput measurement is valid only when all of the following hold simultaneously: (a) the server has been running for ≥ 5 seconds (past startup transient), (b) at least the specifie...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-117] [8b_PERF_SPEC-REQ-114]** Requirement PERF-117
- **Type:** Performance
- **Description:** **[PERF-117]** For streaming operations (PERF-010 through PERF-013), the throughput target is expressed as concurrent active streams, not requests per second. A concurrent stream is counted from the m...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-118] [8b_PERF_SPEC-REQ-115]** Requirement PERF-118
- **Type:** Performance
- **Description:** **[PERF-118]** Throughput for MCP tools (PERF-014 through PERF-019) is measured as complete request-response cycles per second at the HTTP layer. Partial requests, connection resets, and timeout-abort...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-119] [8b_PERF_SPEC-REQ-116]** Requirement PERF-119
- **Type:** Performance
- **Description:** **[PERF-119]** The measurement window for throughput assertions MUST be ≥ 10 seconds. Bursts shorter than 10 seconds do not constitute a valid throughput measurement even if instantaneous throughput a...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-120] [8b_PERF_SPEC-REQ-117]** Requirement PERF-120
- **Type:** Performance
- **Description:** **[PERF-120]** When a throughput target specifies "burst" (e.g., PERF-006 "≥ 10 req/s burst"), the target applies to the peak 1-second window within the 10-second measurement window. Non-burst through...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-121] [8b_PERF_SPEC-REQ-118]** Requirement PERF-121
- **Type:** Performance
- **Description:** **[PERF-121]** Given a sorted slice of `N` duration samples `d[0..N]` (ascending), the p99 value is `d[ceil(0.99 * N) - 1]` using integer ceiling arithmetic. For `N = 100` (the minimum sample count), ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-122] [8b_PERF_SPEC-REQ-119]** Requirement PERF-122
- **Type:** Performance
- **Description:** **[PERF-122]** Samples MUST be collected in the order they complete (not in the order they start). Parallel requests may complete out of submission order; this is expected and correct. The sort applie...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-123] [8b_PERF_SPEC-REQ-120]** Requirement PERF-123
- **Type:** Performance
- **Description:** **[PERF-123]** Outlier exclusion is prohibited in SLO test assertions. All `N` samples collected during a test run MUST be included in the percentile computation. Discarding outliers would defeat the ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-111] [8b_PERF_SPEC-REQ-121]** Requirement PERF-111
- **Type:** Performance
- **Description:** **[PERF-111]** When `SubmitRun` validation fails (e.g., duplicate run name, invalid workflow definition reference, or missing required field), the error response MUST still be returned within the p99 ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-112] [8b_PERF_SPEC-REQ-122]** Requirement PERF-112
- **Type:** Performance
- **Description:** **[PERF-112]** When the gRPC event buffer for a `StreamRunEvents` client reaches 256 messages (full), the server MUST drop the oldest message, log `WARN` with the run ID and drop count, and continue s...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-113] [8b_PERF_SPEC-REQ-123]** Requirement PERF-113
- **Type:** Performance
- **Description:** **[PERF-113]** When a checkpoint write fails with `ENOSPC` (disk full), the server MUST continue processing other requests without degradation beyond the write-failure recovery path. The `SubmitRun` S...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-114] [8b_PERF_SPEC-REQ-124]** Requirement PERF-114
- **Type:** Performance
- **Description:** **[PERF-114]** When all agents in a pool are rate-limited (pool exhausted), `submit_run` and `SubmitRun` must still respond within their respective SLOs. Pool exhaustion does not block submission; it ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-115] [8b_PERF_SPEC-REQ-125]** Requirement PERF-115
- **Type:** Performance
- **Description:** **[PERF-115]** When `stream_logs follow:true` is called for a stage with exactly 10 000 buffered lines (full buffer), all 10 000 lines plus a final `{"done":false}` chunk must be delivered before live...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-046] [8b_PERF_SPEC-REQ-126]** Requirement PERF-046
- **Type:** Performance
- **Description:** **[PERF-115]** When `stream_logs follow:true` is called for a stage with exactly 10 000 buffered lines (full buffer), all 10 000 lines plus a final `{"done":false}` chunk must be delivered before live...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-116-EC] [8b_PERF_SPEC-REQ-127]** Requirement PERF-116-EC
- **Type:** Performance
- **Description:** **[PERF-116-EC]** When `GetRun` is called with a run ID that does not exist, the server MUST return a `not_found` gRPC status within the `GetRun` p99 SLO (50 ms). Unknown-ID lookup must not trigger a ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-117-EC] [8b_PERF_SPEC-REQ-128]** Requirement PERF-117-EC
- **Type:** Performance
- **Description:** **[PERF-117-EC]** When `WatchPoolState` is called and the pool has not had any state change for ≥ 60 seconds, the server MUST send a keepalive message (empty delta) within 60 ± 5 seconds. The first-ev...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-118-EC] [8b_PERF_SPEC-REQ-129]** Requirement PERF-118-EC
- **Type:** Performance
- **Description:** **[PERF-118-EC]** When the MCP lock acquisition timeout (5 000 ms, [PERF-020]) is reached, the server MUST return a JSON-RPC error with code `-32003` (`resource_exhausted`) within 100 ms of the timeou...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-119-EC] [8b_PERF_SPEC-REQ-130]** Requirement PERF-119-EC
- **Type:** Performance
- **Description:** **[PERF-119-EC]** When `./do presubmit` exceeds its 900-second wall-clock limit ([PERF-032]), the `do` script MUST send `SIGTERM` to the presubmit process group and then `SIGKILL` after a 5-second gra...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-120-EC] [8b_PERF_SPEC-REQ-131]** Requirement PERF-120-EC
- **Type:** Performance
- **Description:** **[PERF-120-EC]** When the retention sweep ([PERF-033]) processes exactly 500 runs and all 500 are eligible for deletion, the sweep MUST complete within 60 000 ms (p99). If the sweep exceeds 60 000 ms...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-121-EC] [8b_PERF_SPEC-REQ-132]** Requirement PERF-121-EC
- **Type:** Performance
- **Description:** **[PERF-121-EC]** When a webhook delivery ([PERF-029]) receives a TCP connection reset from the target before any data is sent, the delivery attempt MUST be counted as failed, a retry MUST be schedule...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-122-EC] [8b_PERF_SPEC-REQ-133]** Requirement PERF-122-EC
- **Type:** Performance
- **Description:** **[PERF-122-EC]** When `CancelRun` is called on a run that is already in a terminal state (`Completed`, `Failed`, `Cancelled`), the server MUST return an `already_exists` or `failed_precondition` stat...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-123-EC] [8b_PERF_SPEC-REQ-134]** Requirement PERF-123-EC
- **Type:** Performance
- **Description:** **[PERF-123-EC]** When the TUI render function (`terminal.draw()`) is called and the terminal width or height is zero (e.g., the user's terminal is minimized to a zero-size window), the render MUST co...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-124] [8b_PERF_SPEC-REQ-135]** Requirement PERF-124
- **Type:** Performance
- **Description:** **[PERF-124]** When `StreamLogs` (non-follow) is called for a stage that is currently in `Running` state, the server MUST return all lines buffered up to the moment of the call and then close the stre...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-125] [8b_PERF_SPEC-REQ-136]** Requirement PERF-125
- **Type:** Performance
- **Description:** **[PERF-125]** When `ListRuns` is called with `status_filter = [Pending, Running]` and there are 1 000 total runs of which 2 are Pending and 3 are Running, the response MUST contain exactly 5 runs and...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-126] [8b_PERF_SPEC-REQ-137]** Requirement PERF-126
- **Type:** Performance
- **Description:** **[PERF-126]** When the server is restarting (between `SIGTERM` receipt and graceful shutdown completion), new gRPC connections MUST be rejected with `UNAVAILABLE` within 50 ms. In-flight requests tha...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-127] [8b_PERF_SPEC-REQ-138]** Requirement PERF-127
- **Type:** Performance
- **Description:** **[PERF-127]** When `write_workflow_definition` ([PERF-019]) is called with a payload that is syntactically valid YAML but semantically invalid (e.g., a DAG with a cycle), all 13 validation steps MUST...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-128] [8b_PERF_SPEC-REQ-139]** Requirement PERF-128
- **Type:** Performance
- **Description:** **[PERF-128]** When `checkpoint write` ([PERF-028]) is called concurrently by two goroutines (or tasks) for different runs, the two writes MUST be serialized at the filesystem layer (each write is ato...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-129] [8b_PERF_SPEC-REQ-140]** Requirement PERF-129
- **Type:** Performance
- **Description:** **[PERF-129]** When `DAG scheduler dispatch` ([PERF-021]) is triggered for a stage that depends on two parallel stages, and both dependency stages complete within 10 ms of each other, only one dispatc...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-130] [8b_PERF_SPEC-REQ-141]** Requirement PERF-130
- **Type:** Performance
- **Description:** **[PERF-130]** When `server startup with checkpoint restore` ([PERF-031]) processes a checkpoint file that contains 50 runs each with 10 stages (500 stage records total), the deserialization MUST comp...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-131] [8b_PERF_SPEC-REQ-142]** Requirement PERF-131
- **Type:** Performance
- **Description:** **[PERF-131]** When a `SloViolation` event would be emitted for an `(operation, boundary)` pair, but a `SloViolation` for the same pair was already emitted within the previous 10-second window, the ne...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-132] [8b_PERF_SPEC-REQ-143]** Requirement PERF-132
- **Type:** Performance
- **Description:** **[PERF-132]** When `MCP lock acquisition` times out ([PERF-020]), and the write-lock holder is an `inject_stage_input` call that is blocked on an `await` point inside a slow async operation, the time...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-133] [8b_PERF_SPEC-REQ-144]** Requirement PERF-133
- **Type:** Performance
- **Description:** **[PERF-133]** The `ci_threshold` const function MUST be used in every test assertion that compares an observed p99 against an SLO target. Direct multiplication by `3/2` inline in test code is prohibi...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-134] [8b_PERF_SPEC-REQ-145]** Requirement PERF-134
- **Type:** Performance
- **Description:** **[PERF-134]** When a new PERF ID is added to the SLO table in this document, a corresponding constant MUST be added to `devs-core/src/perf.rs` in the same commit. The CI gate MUST fail if the constan...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-135] [8b_PERF_SPEC-REQ-146]** Requirement PERF-135
- **Type:** Performance
- **Description:** **[PERF-135]** The `SLO_PRESUBMIT_WALL_CLOCK_P99_MS` constant MUST NOT use the `ci_threshold` function (i.e., no CI margin is applied). The presubmit hard timeout is enforced by the `do` script's `tim...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-136] [8b_PERF_SPEC-REQ-147]** Requirement PERF-136
- **Type:** Performance
- **Description:** **[PERF-136]** The `Collecting → Compliant` and `Collecting → Violated` transitions both require exactly `MIN_OBSERVATIONS = 100` samples. A pair with 99 samples MUST remain in `Collecting` and MUST N...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-137] [8b_PERF_SPEC-REQ-148]** Requirement PERF-137
- **Type:** Performance
- **Description:** **[PERF-137]** The `Violated → Emitting → Violated` cycle (consecutive violations) MUST increment `consecutive_violation_count` on each `Violated` entry. When `consecutive_violation_count ≥ 3` (as req...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-138] [8b_PERF_SPEC-REQ-149]** Requirement PERF-138
- **Type:** Performance
- **Description:** **[PERF-138]** The rate-limiter state (last emission timestamp per `(operation, boundary)` pair) MUST be stored in a `HashMap<(String, MeasurementBoundary), Instant>` protected by the same `Arc<RwLock...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-001] [8b_PERF_SPEC-REQ-150]** Requirement PERF-GRP-001
- **Type:** Performance
- **Description:** **[PERF-GRP-001]** `GetRun` and `ListRuns` MUST hold the `RwLock` read guard for no longer than the time required to clone the response data. The guard MUST be released before any serialization (proto...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-002] [8b_PERF_SPEC-REQ-151]** Requirement PERF-GRP-002
- **Type:** Performance
- **Description:** **[PERF-GRP-002]** `WatchPoolState` MUST send the initial snapshot using the current pool state captured under a read lock, then release the lock before entering the long-poll loop. Subsequent events ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-003] [8b_PERF_SPEC-REQ-152]** Requirement PERF-GRP-003
- **Type:** Performance
- **Description:** **[PERF-GRP-003]** When `ListRuns` is called with `limit = 0`, the server MUST return a `invalid_argument` gRPC status within the `ListRuns` p99 SLO (100 ms). The server MUST NOT interpret `limit = 0`...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-004] [8b_PERF_SPEC-REQ-153]** Requirement PERF-GRP-004
- **Type:** Performance
- **Description:** **[PERF-GRP-004]** `SubmitRun` MUST complete all 7 validation steps before acquiring the write lock. Validation errors MUST be returned without ever acquiring the write lock. This ensures that invalid...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-005] [8b_PERF_SPEC-REQ-154]** Requirement PERF-GRP-005
- **Type:** Performance
- **Description:** **[PERF-GRP-005]** `CancelRun` cascades a cancel signal to all stages in the run. The cascade MUST be implemented as a fan-out of `tokio::sync::oneshot` sends, each of which is O(1). The total cascade...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-006] [8b_PERF_SPEC-REQ-155]** Requirement PERF-GRP-006
- **Type:** Performance
- **Description:** **[PERF-GRP-006]** When `SubmitRun` or `CancelRun` checkpoint write fails, the server MUST roll back the in-memory state change (undo the run insertion or cancel state update) before returning the err...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-007] [8b_PERF_SPEC-REQ-156]** Requirement PERF-GRP-007
- **Type:** Performance
- **Description:** **[PERF-GRP-007]** `StreamRunEvents` and `StreamLogs` MUST register a cleanup handler via `tokio_stream::StreamExt::on_drop` or equivalent that removes the client's slot from the server-side stream re...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-008] [8b_PERF_SPEC-REQ-157]** Requirement PERF-GRP-008
- **Type:** Performance
- **Description:** **[PERF-GRP-008]** For `StreamLogs follow:true`, the server MUST use a `tokio::sync::broadcast` channel (not polling) to deliver live log chunks to the client. Polling on a timer would introduce up to...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-009] [8b_PERF_SPEC-REQ-158]** Requirement PERF-GRP-009
- **Type:** Performance
- **Description:** **[PERF-GRP-009]** The `StreamRunEvents` first-event SLO ([PERF-010]: 200 ms) is measured from handler entry to the first `RunEvent` written to the transport. The initial snapshot message MUST be cons...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-010] [8b_PERF_SPEC-REQ-159]** Requirement PERF-GRP-010
- **Type:** Performance
- **Description:** **[PERF-GRP-010]** MCP read tools (`list_runs`, `get_run`, `get_stage_output`) MUST acquire only a read lock on `SchedulerState`. They MUST NOT escalate to a write lock even in error paths. Write lock...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-011] [8b_PERF_SPEC-REQ-160]** Requirement PERF-GRP-011
- **Type:** Performance
- **Description:** **[PERF-GRP-011]** MCP write tools (`submit_run`, `cancel_run`, `write_workflow_definition`) MUST implement the lock acquisition timeout ([PERF-020]) using `tokio::time::timeout(Duration::from_millis(...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-012] [8b_PERF_SPEC-REQ-161]** Requirement PERF-GRP-012
- **Type:** Performance
- **Description:** **[PERF-GRP-012]** `write_workflow_definition` performs 13 validation steps before writing to disk. Steps 1–10 (schema validation, cycle detection, stage name uniqueness) MUST occur before the write l...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-013] [8b_PERF_SPEC-REQ-162]** Requirement PERF-GRP-013
- **Type:** Performance
- **Description:** **[PERF-GRP-013]** The MCP `get_stage_output` tool returns up to 2 MiB of data (1 MiB stdout + 1 MiB stderr). The truncation to 1 MiB per stream MUST occur before the JSON serialization step, not afte...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-014] [8b_PERF_SPEC-REQ-163]** Requirement PERF-GRP-014
- **Type:** Performance
- **Description:** **[PERF-GRP-014]** The DAG scheduler ([PERF-021]) MUST use a `tokio::task::spawn` (not `spawn_blocking`) for the dispatch logic. All dispatch work (dependency graph traversal, stage state update, subp...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-015] [8b_PERF_SPEC-REQ-164]** Requirement PERF-GRP-015
- **Type:** Performance
- **Description:** **[PERF-GRP-015]** Checkpoint writes ([PERF-028]) MUST use `tokio::task::spawn_blocking` for the fsync step, because `fsync` is a synchronous blocking syscall. Calling `fsync` directly from an async t...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-016] [8b_PERF_SPEC-REQ-165]** Requirement PERF-GRP-016
- **Type:** Performance
- **Description:** **[PERF-GRP-016]** The TUI render function ([PERF-023]) MUST be called only from the TUI's dedicated event loop thread, which runs independently of the tokio async runtime. Rendering from within an as...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-017] [8b_PERF_SPEC-REQ-166]** Requirement PERF-GRP-017
- **Type:** Performance
- **Description:** **[PERF-GRP-017]** The retention sweep ([PERF-033]) MUST run in a background tokio task scheduled with `tokio::time::interval(Duration::from_secs(86_400))`. The sweep MUST acquire the write lock only ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-018] [8b_PERF_SPEC-REQ-167]** Requirement PERF-GRP-018
- **Type:** Performance
- **Description:** **[PERF-GRP-018]** Server startup ([PERF-030], [PERF-031]) MUST write the discovery file as the last step before returning from `main`'s startup sequence. Any process that reads the discovery file and...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-019] [8b_PERF_SPEC-REQ-168]** Requirement PERF-GRP-019
- **Type:** Performance
- **Description:** **[PERF-GRP-019]** CLI commands MUST read the gRPC address from the discovery file at startup. They MUST NOT cache the address between invocations. Each CLI invocation is a fresh process and must re-r...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-020] [8b_PERF_SPEC-REQ-169]** Requirement PERF-GRP-020
- **Type:** Performance
- **Description:** **[PERF-GRP-020]** The gRPC dial in CLI commands MUST use `Channel::connect()` with a connection timeout of 2 000 ms. If the server is not reachable within 2 000 ms, the CLI MUST print a human-readabl...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-021] [8b_PERF_SPEC-REQ-170]** Requirement PERF-GRP-021
- **Type:** Performance
- **Description:** **[PERF-GRP-021]** CLI p99 latency targets include gRPC dial time. In test environments where the server is running on `localhost`, dial time is typically < 5 ms and does not materially affect the SLO...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-022] [8b_PERF_SPEC-REQ-171]** Requirement PERF-GRP-022
- **Type:** Performance
- **Description:** **[PERF-GRP-022]** `devs submit` ([PERF-027]) MUST NOT block waiting for the submitted run to complete. It submits the run, prints the run ID, and exits. The 1 500 ms p99 covers submission latency onl...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GRP-023] [8b_PERF_SPEC-REQ-172]** Requirement PERF-GRP-023
- **Type:** Performance
- **Description:** **[PERF-GRP-023]** When a CLI command receives a gRPC status of `UNAVAILABLE` (server restarting or not yet started), it MUST exit with code 2 (distinct from code 1 for other errors). This allows call...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-DEP-003] [8b_PERF_SPEC-REQ-173]** Requirement PERF-DEP-003
- **Type:** Performance
- **Description:** **[PERF-DEP-003]** Any change to the `tokio` runtime mode (e.g., switching from single-threaded to multi-threaded) MUST be preceded by a full re-run of all SLO integration tests. The single-threaded r...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-DEP-004] [8b_PERF_SPEC-REQ-174]** Requirement PERF-DEP-004
- **Type:** Performance
- **Description:** **[PERF-DEP-004]** Any change to the `Arc<RwLock<SchedulerState>>` locking strategy (e.g., splitting into finer-grained locks, replacing with a lock-free structure) MUST include a proof-of-no-regressi...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-001] [8b_PERF_SPEC-REQ-175]** Requirement AC-PERF-SLO-001
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-001]** For every PERF ID in the SLO table (PERF-006 through PERF-033), there exists a constant `SLO_*_P99_MS` in `devs-core/src/perf.rs` whose value matches the p99 column in the table....
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-002] [8b_PERF_SPEC-REQ-176]** Requirement AC-PERF-SLO-002
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-002]** For every SLO constant, a CI test exists that collects ≥ 100 samples of the corresponding operation, computes the p99, and asserts `p99 ≤ ci_threshold(SLO_*_P99_MS, is_hard_limit...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-003] [8b_PERF_SPEC-REQ-177]** Requirement AC-PERF-SLO-003
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-003]** `GetRun` gRPC: 100 sequential calls to `GetRun` against a server with 50 cached runs each complete in ≤ 75 ms (CI threshold for 50 ms p99). No single call may exceed 75 ms. The m...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-004] [8b_PERF_SPEC-REQ-178]** Requirement AC-PERF-SLO-004
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-004]** `ListRuns` gRPC: 100 sequential calls to `ListRuns` (limit=100, no filter) against a server with 100 runs complete in ≤ 150 ms each (CI threshold for 100 ms p99). The measurement...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-005] [8b_PERF_SPEC-REQ-179]** Requirement AC-PERF-SLO-005
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-005]** `SubmitRun` gRPC: 100 sequential valid `SubmitRun` calls (each submitting a distinct run name) complete within 750 ms each (CI threshold for 500 ms p99), including checkpoint wri...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-006] [8b_PERF_SPEC-REQ-180]** Requirement AC-PERF-SLO-006
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-006]** `CancelRun` gRPC: 100 sequential `CancelRun` calls on runs in `Running` state (with 10 active stages each) complete within 750 ms each. Each call's cascade to 10 stages via onesh...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-007] [8b_PERF_SPEC-REQ-181]** Requirement AC-PERF-SLO-007
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-007]** `StreamRunEvents` TTFE: 20 concurrent clients subscribe to `StreamRunEvents` for the same run. Each client receives its first event (run snapshot) within 300 ms of subscription. ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-008] [8b_PERF_SPEC-REQ-182]** Requirement AC-PERF-SLO-008
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-008]** `StreamLogs` non-follow TTFB: 20 concurrent clients call `StreamLogs` (follow=false) for a stage with 1 000 buffered log lines. Each client receives the first log line within 375...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-009] [8b_PERF_SPEC-REQ-183]** Requirement AC-PERF-SLO-009
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-009]** `StreamLogs` follow chunk latency: A stage is actively writing log lines at 100 lines/second. 20 concurrent `StreamLogs follow=true` clients each receive every new log chunk with...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-010] [8b_PERF_SPEC-REQ-184]** Requirement AC-PERF-SLO-010
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-010]** DAG scheduler dispatch: A workflow with a 10-stage linear DAG runs to completion. For each of the 9 inter-stage dispatch events, the time from the predecessor stage's terminal st...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-011] [8b_PERF_SPEC-REQ-185]** Requirement AC-PERF-SLO-011
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-011]** TUI render hard limit: 1 000 consecutive render frames are produced by the TUI event loop under simulated load (100 runs, 10 stages each, all in Running state with active log str...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-012] [8b_PERF_SPEC-REQ-186]** Requirement AC-PERF-SLO-012
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-012]** Checkpoint write atomic protocol: 100 sequential checkpoint writes to a tmpfs filesystem each complete within 750 ms (CI threshold for 500 ms p99). Each write MUST follow the ser...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-013] [8b_PERF_SPEC-REQ-187]** Requirement AC-PERF-SLO-013
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-013]** MCP `write_workflow_definition`: 100 sequential calls with valid workflow definitions (10 stages, linear DAG) each complete within 3 000 ms (CI threshold for 2 000 ms p99). A cal...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-014] [8b_PERF_SPEC-REQ-188]** Requirement AC-PERF-SLO-014
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-014]** MCP lock acquisition timeout: When 5 concurrent callers each hold a write lock for 2 000 ms, a 6th caller's lock acquisition MUST time out at 5 000 ms and return `resource_exhaus...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-015] [8b_PERF_SPEC-REQ-189]** Requirement AC-PERF-SLO-015
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-015]** Server startup (cold): 10 consecutive server starts (each on a different port, clean state) each produce a discovery file with the gRPC address within 15 000 ms (CI threshold for...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-016] [8b_PERF_SPEC-REQ-190]** Requirement AC-PERF-SLO-016
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-016]** Server startup with restore: 10 consecutive server starts, each restoring a checkpoint with 50 runs and 500 stage records, each complete within 45 000 ms (CI threshold for 30 000...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-017] [8b_PERF_SPEC-REQ-191]** Requirement AC-PERF-SLO-017
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-017]** `SloViolation` rate-limiter: When an operation emits `SloViolation` at time T, a second emission for the same `(operation, boundary)` pair at T + 5 s MUST be suppressed. An emiss...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-018] [8b_PERF_SPEC-REQ-192]** Requirement AC-PERF-SLO-018
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-018]** Consecutive violation severity escalation: When the p99 for an operation exceeds its SLO for 3 consecutive measurement windows, the third `SloViolation` event MUST carry `severit...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-019] [8b_PERF_SPEC-REQ-193]** Requirement AC-PERF-SLO-019
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-019]** `./do presubmit` hard timeout: A `do presubmit` invocation that is programmatically stalled (e.g., a test that sleeps indefinitely) MUST be terminated by the `do` script's timeou...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-SLO-020] [8b_PERF_SPEC-REQ-194]** Requirement AC-PERF-SLO-020
- **Type:** Performance
- **Description:** **[AC-PERF-SLO-020]** Constant coverage: A `cargo test` invocation on `devs-core` MUST include a test named `slo_constants_complete` that fails if the count of `pub const SLO_*_P99_MS: u64` symbols ex...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-034] [8b_PERF_SPEC-REQ-195]** Requirement PERF-034
- **Type:** Performance
- **Description:** **[PERF-034]** End-to-end from CLI invocation to printed `run_id` (text mode): **p99 < 1 500 ms** on local loopback. This includes gRPC dial, 7-step validation, `checkpoint.json` write, and slug gener...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-035] [8b_PERF_SPEC-REQ-196]** Requirement PERF-035
- **Type:** Performance
- **Description:** **[PERF-035]** Duplicate run name rejection (fast path via per-project mutex) must complete within **p99 < 100 ms** — it must not require a full checkpoint scan.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-139] [8b_PERF_SPEC-REQ-197]** Requirement PERF-139
- **Type:** Performance
- **Description:** **[PERF-139]** `run_name`, when omitted, MUST be auto-generated as `<workflow_name>-<run_id[0..8]>` (e.g., `build-test-a3f2b1c4`). Auto-generation MUST NOT perform I/O and MUST complete in **< 1 ms**....
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-140] [8b_PERF_SPEC-REQ-198]** Requirement PERF-140
- **Type:** Performance
- **Description:** **[PERF-140]** `SubmitRun` executes a **13-step normative validation pipeline** in strict order before acquiring any lock or writing to disk. Steps 1–9 are stateless and lock-free; steps 10–13 require...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-141] [8b_PERF_SPEC-REQ-199]** Requirement PERF-141
- **Type:** Performance
- **Description:** **[PERF-141]** The 13-step validation pipeline MUST execute synchronously within the gRPC request handler. No step MAY be deferred to a background task. The total pipeline execution time MUST be inclu...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-142] [8b_PERF_SPEC-REQ-200]** Requirement PERF-142
- **Type:** Performance
- **Description:** **[PERF-142]** `run_name` uniqueness MUST be enforced against the in-memory `RunRegistry` (never by scanning `checkpoint.json` files on disk). The per-project name mutex (step 10) MUST be held continu...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-143] [8b_PERF_SPEC-REQ-201]** Requirement PERF-143
- **Type:** Performance
- **Description:** **[PERF-143]** `inputs` keys absent from the workflow's declared parameter schema MUST be rejected with `INVALID_ARGUMENT "unknown input parameter: <key>"` (step 8). Parameters declared with an enum t...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-036] [8b_PERF_SPEC-REQ-202]** Requirement PERF-036
- **Type:** Performance
- **Description:** **[PERF-036]** For the common `tempdir` execution environment with no repo clone, the interval from last dependency's checkpoint write to agent subprocess `execvp` must be **p99 < 200 ms**.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-037] [8b_PERF_SPEC-REQ-203]** Requirement PERF-037
- **Type:** Performance
- **Description:** **[PERF-037]** Pool capability resolution (filter + semaphore acquire when a slot is immediately available): **p99 < 10 ms**.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-038] [8b_PERF_SPEC-REQ-204]** Requirement PERF-038
- **Type:** Performance
- **Description:** **[PERF-038]** For workflows with two independently-rooted stages (no `depends_on`), both stages must be dispatched within **100 ms of the run transitioning to `Running`** (captured by [GOAL-001] / [2...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-144] [8b_PERF_SPEC-REQ-205]** Requirement PERF-144
- **Type:** Performance
- **Description:** **[PERF-144]** A stage MUST be dispatched if and only if every stage in its `depends_on` list is in the `Completed` state. A stage with an empty `depends_on` list becomes eligible immediately when the...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-145] [8b_PERF_SPEC-REQ-206]** Requirement PERF-145
- **Type:** Performance
- **Description:** **[PERF-145]** Stage dispatch MUST be suppressed if the parent run is in any of the following states: `Cancelled`, `Failed`, `Paused`. If `evaluate_eligibility()` returns candidates but the run is in ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-146] [8b_PERF_SPEC-REQ-207]** Requirement PERF-146
- **Type:** Performance
- **Description:** **[PERF-146]** The `stage_complete_tx` channel MUST be drained in its entirety before the DAG scheduler task yields control. Multiple `StageCompleteEvent` entries for the same `run_id` in a single dra...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-147] [8b_PERF_SPEC-REQ-208]** Requirement PERF-147
- **Type:** Performance
- **Description:** **[PERF-147]** `compute_dag_tiers()` MUST detect cycles in the `depends_on` graph using a depth-first search and return `DagError::CycleDetected` at workflow registration time. A workflow with a cycli...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-039] [8b_PERF_SPEC-REQ-209]** Requirement PERF-039
- **Type:** Performance
- **Description:** **[PERF-039]** Live log chunk end-to-end latency (agent stdout write → TUI display): **p95 < 500 ms**, **p99 < 1 000 ms**. This includes capture, gRPC streaming, and one TUI render cycle.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-040] [8b_PERF_SPEC-REQ-210]** Requirement PERF-040
- **Type:** Performance
- **Description:** **[PERF-040]** `stream_logs follow:false` (historical fetch): TTFB **p99 < 250 ms**; complete response for 10 000 lines **p99 < 2 000 ms**.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-148] [8b_PERF_SPEC-REQ-211]** Requirement PERF-148
- **Type:** Performance
- **Description:** **[PERF-148]** `sequence` values in `LogChunk` MUST be strictly monotonically increasing, starting from `from_sequence`, with no gaps and no repeats within a single stream. When a log line is split ac...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-149] [8b_PERF_SPEC-REQ-212]** Requirement PERF-149
- **Type:** Performance
- **Description:** **[PERF-149]** `content` in each `LogChunk` MUST be valid UTF-8. Chunk boundaries MUST fall on UTF-8 character boundaries (never mid–multi-byte sequence). If a single UTF-8 character would by itself e...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-150] [8b_PERF_SPEC-REQ-213]** Requirement PERF-150
- **Type:** Performance
- **Description:** **[PERF-150]** The server MUST support at least **20 simultaneous `StreamLogs` subscribers** for the same stage, each receiving an independent copy via a `tokio::sync::broadcast::Receiver`. The broadc...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-151] [8b_PERF_SPEC-REQ-214]** Requirement PERF-151
- **Type:** Performance
- **Description:** **[PERF-151]** For `follow:true` streams, new `LogChunk` messages MUST be emitted within **p99 < 1 000 ms** of the corresponding bytes being written to the agent's stdout/stderr pipe (end-to-end: capt...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-041] [8b_PERF_SPEC-REQ-215]** Requirement PERF-041
- **Type:** Performance
- **Description:** **[PERF-041]** The server acknowledges the cancel (returns the gRPC/MCP response with all `StageRun` records set to `Cancelled`) within **p99 < 500 ms**, independent of how long agent termination take...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-042] [8b_PERF_SPEC-REQ-216]** Requirement PERF-042
- **Type:** Performance
- **Description:** **[PERF-042]** Agent graceful shutdown after `devs:cancel\n`: orchestrated agents must exit within **10 000 ms** (10 s); the server falls back to SIGTERM after 5 000 ms and SIGKILL after a further 5 0...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-152] [8b_PERF_SPEC-REQ-217]** Requirement PERF-152
- **Type:** Performance
- **Description:** **[PERF-152]** `CancelRun` MUST atomically transition all non-terminal `StageRun` records to `Cancelled` and persist a single `checkpoint.json` write ([PERF-028]) before the gRPC response is sent. The...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-153] [8b_PERF_SPEC-REQ-218]** Requirement PERF-153
- **Type:** Performance
- **Description:** **[PERF-153]** After sending `CancelRunResponse`, the server MUST asynchronously deliver `devs:cancel\n` to the stdin of all `Running` stage agents. This signal delivery MUST run in a separate `tokio:...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-154] [8b_PERF_SPEC-REQ-219]** Requirement PERF-154
- **Type:** Performance
- **Description:** **[PERF-154]** The SIGTERM/SIGKILL escalation sequence MUST be: (1) `devs:cancel\n` written to agent stdin at t+0; (2) SIGTERM at t+5 s if the agent has not yet exited; (3) SIGKILL at t+10 s if the ag...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-043] [8b_PERF_SPEC-REQ-220]** Requirement PERF-043
- **Type:** Performance
- **Description:** **[PERF-043]** Total pipeline from server-side checkpoint commit to visible TUI frame update: **p95 < 100 ms**, **p99 < 200 ms**.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-044] [8b_PERF_SPEC-REQ-221]** Requirement PERF-044
- **Type:** Performance
- **Description:** **[PERF-044]** TUI reconnect attempt: first retry begins within **1 000 ms** of stream error detection (exponential backoff: 1→2→4→8→16→30 s cap).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-054] [8b_PERF_SPEC-REQ-222]** Requirement PERF-054
- **Type:** Performance
- **Description:** The per-client broadcast channel has capacity **256 messages** ([PERF-054]). When capacity is exceeded, the oldest message is dropped; the client's stream is NOT terminated. On reconnect, the client a...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-155] [8b_PERF_SPEC-REQ-223]** Requirement PERF-155
- **Type:** Performance
- **Description:** **[PERF-155]** The first message on every `StreamRunEvents` connection — including all reconnections — MUST be `RunEvent::Snapshot` containing the complete current state of all runs and stages for the...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-156] [8b_PERF_SPEC-REQ-224]** Requirement PERF-156
- **Type:** Performance
- **Description:** **[PERF-156]** `AppState` mutations MUST occur only inside `App::handle_event()`, never inside `App::render()`. `render()` is a pure read of `AppState`: it MUST NOT acquire any lock, perform any I/O, ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-094] [8b_PERF_SPEC-REQ-225]** Requirement PERF-094
- **Type:** Performance
- **Description:** **[PERF-156]** `AppState` mutations MUST occur only inside `App::handle_event()`, never inside `App::render()`. `render()` is a pure read of `AppState`: it MUST NOT acquire any lock, perform any I/O, ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-157] [8b_PERF_SPEC-REQ-226]** Requirement PERF-157
- **Type:** Performance
- **Description:** **[PERF-157]** Keyboard events and network (gRPC stream) events MUST share the same `tokio::select!` loop in `App::run()`. The loop MUST process exactly one event per iteration before calling `render(...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-158] [8b_PERF_SPEC-REQ-227]** Requirement PERF-158
- **Type:** Performance
- **Description:** **[PERF-158]** The TUI reconnection backoff MUST be implemented with `tokio::time::sleep` (not `std::thread::sleep`) to keep the event loop non-blocking during backoff intervals. The TUI MUST remain r...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-045] [8b_PERF_SPEC-REQ-228]** Requirement PERF-045
- **Type:** Performance
- **Description:** **[PERF-045]** Under concurrent load of **64 simultaneous observation requests**, p99 response time for `get_run` must remain **< 500 ms**. Observation tools hold read locks only and are fully paralle...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-076] [8b_PERF_SPEC-REQ-229]** Requirement PERF-076
- **Type:** Performance
- **Description:** Body: MCP Request Envelope (≤ 1 048 576 bytes; [PERF-076])
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-159] [8b_PERF_SPEC-REQ-230]** Requirement PERF-159
- **Type:** Performance
- **Description:** **[PERF-159]** All MCP tool errors — `NOT_FOUND`, `FAILED_PRECONDITION`, validation failures, and lock timeouts — MUST be returned as **HTTP 200** with `"isError": true` in the MCP result envelope. Th...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-160] [8b_PERF_SPEC-REQ-231]** Requirement PERF-160
- **Type:** Performance
- **Description:** **[PERF-160]** Observation tools (`get_run`, `list_runs`, `get_stage_output`, `get_pool_state`) MUST acquire only a read lock on `Arc<RwLock<ServerState>>`. They MUST NOT acquire a write lock for any ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-161] [8b_PERF_SPEC-REQ-232]** Requirement PERF-161
- **Type:** Performance
- **Description:** **[PERF-161]** The connection limit of 64 simultaneous connections MUST be enforced at the **TCP connection acceptor level** (before the HTTP request body is read), not inside the request handler via ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-162] [8b_PERF_SPEC-REQ-233]** Requirement PERF-162
- **Type:** Performance
- **Description:** **[PERF-162]** `inject_stage_input` MUST check the precondition (target stage in `Waiting` state) using a read lock and MUST complete this check within **p99 < 100 ms**. Only after the precondition pa...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-047] [8b_PERF_SPEC-REQ-234]** Requirement PERF-047
- **Type:** Performance
- **Description:** **[PERF-047]** Individual step budget targets (Linux CI, from `target/presubmit_timings.jsonl`):
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-100] [8b_PERF_SPEC-REQ-235]** Requirement PERF-100
- **Type:** Performance
- **Description:** The `PresubmitTimingRecord` schema is defined normatively in §8.4 ([PERF-100]). Each step emits exactly one record immediately upon completion. The special `_timeout_kill` record (`"step": "_timeout_k...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-163] [8b_PERF_SPEC-REQ-236]** Requirement PERF-163
- **Type:** Performance
- **Description:** **[PERF-163]** The six presubmit steps MUST execute in fixed order: `setup → format → lint → test → coverage → ci`. No step MAY be skipped except `ci` (when `--skip-ci` is passed). No step MAY be para...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-164] [8b_PERF_SPEC-REQ-237]** Requirement PERF-164
- **Type:** Performance
- **Description:** **[PERF-164]** The 900 s background timer MUST be implemented as a separate OS-level subprocess (not a shell `sleep` in the same process group) so that it survives `SIGINT`/`SIGTERM` sent to the presu...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-165] [8b_PERF_SPEC-REQ-238]** Requirement PERF-165
- **Type:** Performance
- **Description:** **[PERF-165]** `./do setup` MUST check for and kill any stale timer process from a previous run: if `target/.presubmit_timer.pid` exists and the PID refers to a running process, that process MUST be k...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-048] [8b_PERF_SPEC-REQ-239]** Requirement PERF-048
- **Type:** Performance
- **Description:** **[PERF-048]** The pool semaphore must sustain **`max_concurrent` simultaneous active agents** across all projects without deadlock, starvation (except as governed by strict-priority scheduling), or s...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-049] [8b_PERF_SPEC-REQ-240]** Requirement PERF-049
- **Type:** Performance
- **Description:** **[PERF-049]** A fan-out stage with `count = 64` and a pool with `max_concurrent = 4` must result in exactly 4 dispatched sub-agents and 60 queued sub-agents (`active_count == 4`, `queued_count == 60`...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-050] [8b_PERF_SPEC-REQ-241]** Requirement PERF-050
- **Type:** Performance
- **Description:** **[PERF-050]** Pool agent selection algorithm (capability filter + semaphore acquire, slot immediately available): completes in **O(N)** time where N is the number of agents in the pool. For a pool of...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-052] [8b_PERF_SPEC-REQ-242]** Requirement PERF-052
- **Type:** Performance
- **Description:** **[PERF-052]** The DAG scheduler must handle workflows with up to **256 stages** without degradation in dispatch latency beyond the p99 targets defined in §3.2.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-053] [8b_PERF_SPEC-REQ-243]** Requirement PERF-053
- **Type:** Performance
- **Description:** **[PERF-053]** The gRPC server sustains at least **50 concurrent client connections** (TUI + CLI + gRPC-based agents) without degrading unary RPC latency beyond 2× the p50 targets in the SLO table.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-055] [8b_PERF_SPEC-REQ-244]** Requirement PERF-055
- **Type:** Performance
- **Description:** **[PERF-055]** The MCP HTTP server handles at least **64 simultaneous connections** without returning HTTP 503. The 65th concurrent connection must receive HTTP 503 rather than hanging indefinitely.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-056] [8b_PERF_SPEC-REQ-245]** Requirement PERF-056
- **Type:** Performance
- **Description:** **[PERF-056]** Control tool throughput (serialized via write locks): at least **5 `submit_run` calls per second** sustained for 10 seconds without server-side error (duplicate names produce `ALREADY_E...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-057] [8b_PERF_SPEC-REQ-246]** Requirement PERF-057
- **Type:** Performance
- **Description:** **[PERF-057]** The webhook dispatcher channel buffer holds at least **1 024 events** without blocking the engine. Events beyond buffer capacity are dropped with a `WARN` log (fire-and-forget).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-058] [8b_PERF_SPEC-REQ-247]** Requirement PERF-058
- **Type:** Performance
- **Description:** **[PERF-058]** Concurrent webhook delivery to multiple targets: at least **8 simultaneous outbound HTTP deliveries** without blocking the scheduler thread.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-059] [8b_PERF_SPEC-REQ-248]** Requirement PERF-059
- **Type:** Performance
- **Description:** **[PERF-059]** With **10 concurrently active projects** each submitting runs, the weighted fair queue scheduler must dispatch the highest-priority eligible stage across all projects within **p99 < 100...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-060] [8b_PERF_SPEC-REQ-249]** Requirement PERF-060
- **Type:** Performance
- **Description:** **[PERF-060]** Idle server (no active runs): CPU utilisation **< 1%** on a single core averaged over a 30-second window. The server MUST NOT spin-poll; all waiting MUST be event-driven via Tokio's asy...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-061] [8b_PERF_SPEC-REQ-250]** Requirement PERF-061
- **Type:** Performance
- **Description:** **[PERF-061]** Server under peak load (10 concurrent active runs, each with 4 active stages): CPU utilisation attributable to `devs-server` process (excluding agent subprocess CPU) **< 25%** of a sing...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-062] [8b_PERF_SPEC-REQ-251]** Requirement PERF-062
- **Type:** Performance
- **Description:** **[PERF-062]** TUI render loop: CPU consumption of the `devs-tui` process **< 5%** of a single core when the display is static (no incoming events). Render is event-driven; idle frames MUST NOT be gen...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-063] [8b_PERF_SPEC-REQ-252]** Requirement PERF-063
- **Type:** Performance
- **Description:** **[PERF-063]** `./do lint` (clippy + dep audit) CPU: no artificial parallelism constraints imposed; Cargo's default job count is acceptable. The target is wall-clock time (§3.7), not core utilisation.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-064] [8b_PERF_SPEC-REQ-253]** Requirement PERF-064
- **Type:** Performance
- **Description:** **[PERF-064]** Server baseline RSS (no active runs, ≤ 10 projects registered): **< 64 MiB**.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-065] [8b_PERF_SPEC-REQ-254]** Requirement PERF-065
- **Type:** Performance
- **Description:** **[PERF-065]** Server memory growth per active run: **< 8 MiB** per run for `WorkflowRun` + `StageRun` metadata (excluding `StageOutput` content and log buffers). A server with 20 active runs therefor...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-066] [8b_PERF_SPEC-REQ-255]** Requirement PERF-066
- **Type:** Performance
- **Description:** **[PERF-066]** In-memory log buffer per active stage: at most **10 000 lines × 256 bytes average = ~2.5 MiB**. A server with 10 active runs each with 4 active stages (40 stage log buffers) MUST NOT ex...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-067] [8b_PERF_SPEC-REQ-256]** Requirement PERF-067
- **Type:** Performance
- **Description:** **[PERF-067]** TUI process RSS: **< 64 MiB** under normal operation (single-run view, 10 000 buffered log lines for one stage).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-068] [8b_PERF_SPEC-REQ-257]** Requirement PERF-068
- **Type:** Performance
- **Description:** **[PERF-068]** Stage output `BoundedBytes<1_048_576>` cap: each of stdout and stderr consumes at most **1 MiB** stored; together the `StageOutput.stdout` + `StageOutput.stderr` heap allocation is at m...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-069] [8b_PERF_SPEC-REQ-258]** Requirement PERF-069
- **Type:** Performance
- **Description:** **[PERF-069]** Context file `.devs_context.json` in-memory representation before agent spawn: **≤ 10 MiB** (enforced by proportional truncation algorithm in §5.5 before serialization to disk).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-070] [8b_PERF_SPEC-REQ-259]** Requirement PERF-070
- **Type:** Performance
- **Description:** **[PERF-070]** Default retention policy: `max_age_days = 30`, `max_size_mb = 500`. The retention sweep MUST keep the total `.devs/` directory size **≤ `max_size_mb` MiB** on the checkpoint branch at t...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-071] [8b_PERF_SPEC-REQ-260]** Requirement PERF-071
- **Type:** Performance
- **Description:** **[PERF-071]** Checkpoint file per run (`checkpoint.json`): MUST be **< 1 MiB** for a 256-stage workflow. Stage `stdout`/`stderr` content MUST be stored in `.devs/logs/`, not embedded in `checkpoint.j...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-072] [8b_PERF_SPEC-REQ-261]** Requirement PERF-072
- **Type:** Performance
- **Description:** **[PERF-072]** Single stage log files: `stdout.log` + `stderr.log` together **≤ 2 MiB** (1 MiB each, governed by `BoundedBytes<1_048_576>`). Agent output exceeding 1 MiB per stream is truncated from t...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-073] [8b_PERF_SPEC-REQ-262]** Requirement PERF-073
- **Type:** Performance
- **Description:** **[PERF-073]** Workflow snapshot file `workflow_snapshot.json`: **< 512 KiB** for a workflow with 256 stages and all fields populated. The 13-step validation pipeline (§5.0 of TAS) rejects inputs that...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-074] [8b_PERF_SPEC-REQ-263]** Requirement PERF-074
- **Type:** Performance
- **Description:** **[PERF-074]** gRPC frame size limit: **16 MiB** (`max_frame_size` in tonic `Server::builder()` config). Any message exceeding 16 MiB is rejected with gRPC status `RESOURCE_EXHAUSTED` before deseriali...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-075] [8b_PERF_SPEC-REQ-264]** Requirement PERF-075
- **Type:** Performance
- **Description:** **[PERF-075]** Per-RPC payload limits enforced by tonic interceptors:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-077] [8b_PERF_SPEC-REQ-265]** Requirement PERF-077
- **Type:** Performance
- **Description:** **[PERF-077]** Webhook payload: **≤ 64 KiB** per delivery attempt. The `data` field within the envelope is truncated proportionally if the total serialized payload would exceed 64 KiB. The envelope me...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-078] [8b_PERF_SPEC-REQ-266]** Requirement PERF-078
- **Type:** Performance
- **Description:** **[PERF-078]** `stream_logs follow:true` individual chunk size: **≤ 32 KiB** per chunk. A single log line whose content exceeds 32 KiB MUST be split at the nearest preceding UTF-8 character boundary. ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-079] [8b_PERF_SPEC-REQ-267]** Requirement PERF-079
- **Type:** Performance
- **Description:** **[PERF-079]** The MVP deployment model is a single-user or small-team server running on a developer workstation or lightweight CI runner. The expected steady-state load profile is:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-080] [8b_PERF_SPEC-REQ-268]** Requirement PERF-080
- **Type:** Performance
- **Description:** **[PERF-080]** All SLOs in §2 must be met at the **peak** values in the table above. The server must not require any configuration changes, tuning, or restarts to handle peak load.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-081] [8b_PERF_SPEC-REQ-269]** Requirement PERF-081
- **Type:** Performance
- **Description:** **[PERF-126]** At peak load, all seven peak metrics MUST be simultaneously satisfiable. The combined scenario — 10 active runs, 64 active stages, 20 projects, 10 gRPC connections, 64 MCP connections, ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-610] [8b_PERF_SPEC-REQ-270]** Requirement PERF-BR-610
- **Type:** Performance
- **Description:** **[PERF-BR-610]** All SLOs in §2 MUST remain compliant when all peak-load metrics in the PERF-079 table are simultaneously at their peak values. SLO p99 targets at peak are not relaxed from their nomi...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-611] [8b_PERF_SPEC-REQ-271]** Requirement PERF-BR-611
- **Type:** Performance
- **Description:** **[PERF-BR-611]** `LoadClassification` MUST be derived as `max(per-metric classification)`. If `active_stage_count` is `Peak` while all other metrics are `Nominal`, the overall classification is `Peak...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-612] [8b_PERF_SPEC-REQ-272]** Requirement PERF-BR-612
- **Type:** Performance
- **Description:** **[PERF-BR-612]** `LoadProfile` snapshot construction MUST NOT consume measurable CPU or I/O during peak load. All counters MUST be maintained as `AtomicU32` in-memory fields, updated at each relevant...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-613] [8b_PERF_SPEC-REQ-273]** Requirement PERF-BR-613
- **Type:** Performance
- **Description:** **[PERF-BR-613]** At peak load (64 active stages), the `stage_complete_tx` channel (buffer 256) MUST have sufficient headroom to accept completions from all 64 stages simultaneously. Since `256 > 64`,...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-614] [8b_PERF_SPEC-REQ-274]** Requirement PERF-BR-614
- **Type:** Performance
- **Description:** **[PERF-BR-614]** Webhook dispatch at peak (100 submissions/hour ≈ 0.028 submissions/second) MUST NOT cause `webhook_tx` channel overflow. With a 1 024-event buffer and ≤ 100 events/hour, overflow ind...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-615] [8b_PERF_SPEC-REQ-275]** Requirement PERF-BR-615
- **Type:** Performance
- **Description:** **[PERF-BR-615]** Log line throughput at 1 000 lines/second MUST NOT cause server-side log buffer overflow for individual stages unless a single stage exceeds ~15 lines/second for more than ~650 secon...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-616] [8b_PERF_SPEC-REQ-276]** Requirement PERF-BR-616
- **Type:** Performance
- **Description:** **[PERF-BR-616]** `LoadClassification` MUST use hysteresis at the `Peak → Elevated` boundary: a metric that crosses from `Peak` back toward `Elevated` MUST NOT transition the classification unless it ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-620] [8b_PERF_SPEC-REQ-277]** Requirement PERF-BR-620
- **Type:** Performance
- **Description:** **[PERF-BR-620]** Every hard limit in the §6.2 table MUST be defined as a named `pub const` in `devs-core/src/constants.rs`. No validation code, runtime check, or type definition MUST use an inline in...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-621] [8b_PERF_SPEC-REQ-278]** Requirement PERF-BR-621
- **Type:** Performance
- **Description:** **[PERF-BR-621]** Validation-layer limits (stages per workflow, fan-out count, workflow inputs, stage env vars, webhook targets, registered projects) MUST be checked BEFORE any write lock is acquired....
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-622] [8b_PERF_SPEC-REQ-279]** Requirement PERF-BR-622
- **Type:** Performance
- **Description:** **[PERF-BR-622]** Type-system limits (`BoundedBytes<N>`, `BoundedString<N>`) MUST be enforced purely at the Rust type level. No `unsafe` block in `devs-core/src/types.rs` MUST construct a `BoundedByte...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-623] [8b_PERF_SPEC-REQ-280]** Requirement PERF-BR-623
- **Type:** Performance
- **Description:** **[PERF-BR-623]** The MCP connection limit (64) MUST be enforced at the TCP connection acceptor level using the `Arc<AtomicU32>` counter with `SeqCst` ordering (PERF-BR-440). The constant used MUST be...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-624] [8b_PERF_SPEC-REQ-281]** Requirement PERF-BR-624
- **Type:** Performance
- **Description:** **[PERF-BR-624]** `LogBuffer` eviction MUST be silent with respect to the running stage. Eviction MUST NOT write anything to the stage's stdin, MUST NOT affect the stage's `StageRun` status, and MUST ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-625] [8b_PERF_SPEC-REQ-282]** Requirement PERF-BR-625
- **Type:** Performance
- **Description:** **[PERF-BR-625]** All validation-error messages for structural limit violations MUST include the dimension name, the attempted value, and the limit value in a machine-parseable format. Required format...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-626] [8b_PERF_SPEC-REQ-283]** Requirement PERF-BR-626
- **Type:** Performance
- **Description:** **[PERF-BR-626]** `RetryConfig.max_attempts` (limit: 20) MUST be enforced at config parse time with a `WARN` log and clamping rather than a startup error. Operators copying configs with higher values ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-627] [8b_PERF_SPEC-REQ-284]** Requirement PERF-BR-627
- **Type:** Performance
- **Description:** **[PERF-BR-627]** A `broadcast::RecvError::Lagged(N)` MUST be logged at `WARN` level with event type `"server.event_subscriber_lagged"` including the subscriber's `client_id` and `lag_count: N`. The s...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-628] [8b_PERF_SPEC-REQ-285]** Requirement PERF-BR-628
- **Type:** Performance
- **Description:** **[PERF-BR-628]** The gRPC broadcast channel capacity (256 messages, `RUN_EVENT_BROADCAST_CAPACITY`) is a known-tight constant for 256-stage workflows. A 256-stage workflow completing simultaneously g...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-629] [8b_PERF_SPEC-REQ-286]** Requirement PERF-BR-629
- **Type:** Performance
- **Description:** **[PERF-BR-629]** The fan-out stage limit (64) and the MCP connection limit (64) are coincidentally equal but MUST be enforced by separate named constants (`FAN_OUT_MAX_COUNT` and `MCP_MAX_CONCURRENT_...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-630] [8b_PERF_SPEC-REQ-287]** Requirement PERF-BR-630
- **Type:** Performance
- **Description:** **[PERF-BR-630]** The post-MVP TLS addition MUST be implementation-ready at MVP launch: all TCP acceptors MUST use `tokio::net::TcpListener` (not `std::net::TcpListener`), so that wrapping with `tokio...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-631] [8b_PERF_SPEC-REQ-288]** Requirement PERF-BR-631
- **Type:** Performance
- **Description:** **[PERF-BR-631]** All constants that are at or near the MVP peak value and require a rebuild to increase (`MCP_MAX_CONCURRENT_CONNECTIONS = 64`, `MAX_PROJECT_COUNT = 20`, `MAX_WEBHOOK_TARGETS_PER_PROJ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-632] [8b_PERF_SPEC-REQ-289]** Requirement PERF-BR-632
- **Type:** Performance
- **Description:** **[PERF-BR-632]** The `StructuralLimitApproach` WARN event MUST include a `growth_path` field describing what the operator must do. For config-only limits: `"increase max_concurrent in devs.toml"`. Fo...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-633] [8b_PERF_SPEC-REQ-290]** Requirement PERF-BR-633
- **Type:** Performance
- **Description:** **[PERF-BR-633]** The broadcast channel capacity (`RUN_EVENT_BROADCAST_CAPACITY = 256`) is a known-tight constant for max-size workflows. The constant MUST include the comment: `// WARNING: 256-stage ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-634] [8b_PERF_SPEC-REQ-291]** Requirement PERF-BR-634
- **Type:** Performance
- **Description:** **[PERF-BR-634]** Log throughput at 1 000 lines/second at peak MUST be sustainable within the server's async I/O budget. The log capture path (`tokio::io::AsyncBufReadExt::lines()` on the agent stdout...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-BR-635] [8b_PERF_SPEC-REQ-292]** Requirement PERF-BR-635
- **Type:** Performance
- **Description:** **[PERF-BR-635]** The external log aggregator compatibility MUST be verified by including a CI check that pipes `./do test` JSON log output through `jq .` and asserts exit code 0. All §8.1 structured ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-082] [8b_PERF_SPEC-REQ-293]** Requirement PERF-082
- **Type:** Performance
- **Description:** **[PERF-082]** `criterion` benchmarks are placed in `crates/*/benches/` and measure only algorithmic performance (template resolution, DAG tier computation, ANSI stripping). They MUST NOT start a serv...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-083] [8b_PERF_SPEC-REQ-294]** Requirement PERF-083
- **Type:** Performance
- **Description:** **[PERF-083]** E2E latency assertions instrument `std::time::Instant::now()` immediately before issuing the operation under test and record the elapsed duration on completion. Assertions use the p99 t...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-166] [8b_PERF_SPEC-REQ-295]** Requirement PERF-166
- **Type:** Performance
- **Description:** **[PERF-166]** The 50% CI margin defined in **[PERF-083]** applies to all E2E latency assertions in `tests/`. Unit benchmarks (`criterion`) use their own statistical confidence intervals and do not ap...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-167] [8b_PERF_SPEC-REQ-296]** Requirement PERF-167
- **Type:** Performance
- **Description:** **[PERF-167]** `./do lint` scans all `tests/**/*.rs` and `crates/*/benches/**/*.rs` files for tests annotated with `// Covers: PERF-NNN` and validates: (a) the referenced PERF-NNN exists in this docum...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-168] [8b_PERF_SPEC-REQ-297]** Requirement PERF-168
- **Type:** Performance
- **Description:** **[PERF-168]** Every performance test MUST call `start_server(TestServerConfig { temp_dir: tempfile::TempDir::new()?, .. })`. `DEVS_DISCOVERY_FILE` is set to a path within `temp_dir` unique per test p...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-169] [8b_PERF_SPEC-REQ-298]** Requirement PERF-169
- **Type:** Performance
- **Description:** **[PERF-169]** E2E performance tests run with `test-threads = 1` (set in `.cargo/config.toml`). This prevents server port conflicts and ensures deterministic timing measurements. Criterion benchmarks ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-186] [8b_PERF_SPEC-REQ-299]** Requirement PERF-186
- **Type:** Performance
- **Description:** **[PERF-186]** All E2E test processes that exercise `devs-server` subprocesses MUST set `LLVM_PROFILE_FILE=/tmp/devs-coverage-%p.profraw` in the environment before spawning. The `%p` suffix ensures pe...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-170] [8b_PERF_SPEC-REQ-300]** Requirement PERF-170
- **Type:** Performance
- **Description:** **[PERF-170]** `MockAgentAdapter` implements the `AgentAdapter` trait. It is registered under the tool name `"mock"` in performance test pool configurations. A pool configured with `tool = "mock"` MUS...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-171] [8b_PERF_SPEC-REQ-301]** Requirement PERF-171
- **Type:** Performance
- **Description:** **[PERF-171]** When `MockAgentAdapter.run_duration_ms > 0`, the mock sleeps for the specified duration using `tokio::time::sleep` before signaling completion. This simulates realistic agent run times ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-172] [8b_PERF_SPEC-REQ-302]** Requirement PERF-172
- **Type:** Performance
- **Description:** **[PERF-172]** All E2E latency assertions MUST use `LatencyRecorder` from `devs_test_helper::timing` to collect at least **3 samples** before asserting. Single-sample timing assertions are prohibited ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-173] [8b_PERF_SPEC-REQ-303]** Requirement PERF-173
- **Type:** Performance
- **Description:** **[PERF-173]** Each benchmark MUST define a `BenchmarkId` that includes the input size as a parameter for benchmarks that scale with input. Example: `criterion::BenchmarkId::new("compute_tiers", stage...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-174] [8b_PERF_SPEC-REQ-304]** Requirement PERF-174
- **Type:** Performance
- **Description:** **[PERF-174]** Criterion benchmark configuration applied uniformly across all benchmarks:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-175] [8b_PERF_SPEC-REQ-305]** Requirement PERF-175
- **Type:** Performance
- **Description:** **[PERF-175]** `criterion` baselines are stored in `target/criterion/<benchmark-name>/base/`. This directory is committed as a CI artifact with `expire_in: 7 days` in `.gitlab-ci.yml`. The artifact is...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-093] [8b_PERF_SPEC-REQ-306]** Requirement PERF-093
- **Type:** Performance
- **Description:** **[PERF-093]** `criterion` baselines are updated only by running `./do coverage --update-baselines`. This sub-command MUST NOT be invoked automatically in CI; it is a manual developer action performed...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-176] [8b_PERF_SPEC-REQ-307]** Requirement PERF-176
- **Type:** Performance
- **Description:** **[PERF-176]** The burst-load assertion in **[PERF-087]** (64 concurrent `get_run` calls completing within 500 ms) does NOT apply the 50% CI margin, because this is a maximum-time assertion across all...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-087] [8b_PERF_SPEC-REQ-308]** Requirement PERF-087
- **Type:** Performance
- **Description:** **[PERF-176]** The burst-load assertion in **[PERF-087]** (64 concurrent `get_run` calls completing within 500 ms) does NOT apply the 50% CI margin, because this is a maximum-time assertion across all...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-177] [8b_PERF_SPEC-REQ-309]** Requirement PERF-177
- **Type:** Performance
- **Description:** **[PERF-177]** E2E performance tests MUST NOT share a server instance between test functions. A single `start_server()` call per test function is required. The overhead of server startup is excluded f...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-084] [8b_PERF_SPEC-REQ-310]** Requirement PERF-084
- **Type:** Performance
- **Description:** **[PERF-084]** A dedicated E2E test (`tests/perf_scheduler.rs::test_dag_dispatch_latency`) submits a two-stage workflow where stage B depends on stage A. The test procedure is:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-178] [8b_PERF_SPEC-REQ-311]** Requirement PERF-178
- **Type:** Performance
- **Description:** **[PERF-178]** The dispatch latency measurement begins at the moment `stage-a` is observed as `Completed` via `GetRun`, not at the moment the server internally processes the completion event. This inc...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-179] [8b_PERF_SPEC-REQ-312]** Requirement PERF-179
- **Type:** Performance
- **Description:** **[PERF-179]** The polling interval of 10 ms introduces at most 10 ms of measurement error. This is acceptable: the CI assertion is 150 ms (CI margin) versus the raw 100 ms target, providing 50 ms of ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-180] [8b_PERF_SPEC-REQ-313]** Requirement PERF-180
- **Type:** Performance
- **Description:** **[PERF-180]** If `stage-b` does not reach `Running` within 1 000 ms of `stage-a` completing, the test fails with a descriptive panic message including the last observed status of `stage-b` and the el...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-085] [8b_PERF_SPEC-REQ-314]** Requirement PERF-085
- **Type:** Performance
- **Description:** **[PERF-085]** A dedicated E2E test (`tests/perf_load.rs::test_concurrent_load`) submits 10 independent single-stage workflows simultaneously:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-181] [8b_PERF_SPEC-REQ-315]** Requirement PERF-181
- **Type:** Performance
- **Description:** **[PERF-181]** The `WatchPoolState` gRPC stream must be established before the 10 `SubmitRun` calls begin, to avoid missing the `active_count == 10` event. The stream consumer runs in a separate `toki...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-182] [8b_PERF_SPEC-REQ-316]** Requirement PERF-182
- **Type:** Performance
- **Description:** **[PERF-182]** The load test uses a dedicated pool named `"perf-test-pool"` in the test server config. This pool is separate from any default pool and has no fallback agents, ensuring that all 10 stag...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-086] [8b_PERF_SPEC-REQ-317]** Requirement PERF-086
- **Type:** Performance
- **Description:** **[PERF-086]** A TUI unit test in `crates/devs-tui/tests/perf_render.rs::test_render_cycle_budget` uses `ratatui::backend::TestBackend` (200×50) to measure render performance:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-183] [8b_PERF_SPEC-REQ-318]** Requirement PERF-183
- **Type:** Performance
- **Description:** **[PERF-183]** `perf_test_app_state()` is defined in `crates/devs-tui/src/test_fixtures.rs` behind `#[cfg(test)]`. It MUST produce identical output on every call (no random UUIDs, no `Instant::now()` ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-184] [8b_PERF_SPEC-REQ-319]** Requirement PERF-184
- **Type:** Performance
- **Description:** **[PERF-184]** The render performance test measures the `handle_event() + render()` combined cycle because in production both steps execute on every event before returning to the event loop. Measuring...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-185] [8b_PERF_SPEC-REQ-320]** Requirement PERF-185
- **Type:** Performance
- **Description:** **[PERF-185]** The 100-event test uses only `RunDelta` events (incremental updates), not `RunSnapshot` events. `RunSnapshot` triggers a full state replacement and `dag_tiers` recomputation; this is te...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-187] [8b_PERF_SPEC-REQ-321]** Requirement PERF-187
- **Type:** Performance
- **Description:** **[PERF-187]** All 64 concurrent tasks use independent `reqwest::Client` instances (not shared). Using a shared client would serialize connection establishment via the client's connection pool, hiding...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-188] [8b_PERF_SPEC-REQ-322]** Requirement PERF-188
- **Type:** Performance
- **Description:** **[PERF-188]** The MCP concurrency test verifies `get_run`, `list_runs`, and `get_pool_state` in separate test functions (three tests total). Each uses the same 64-task pattern but targets a different...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-088] [8b_PERF_SPEC-REQ-323]** Requirement PERF-088
- **Type:** Performance
- **Description:** **[PERF-088]** A dedicated E2E test in `tests/perf_log_buffer.rs::test_log_throughput` submits a stage that produces 10 000 log lines:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-189] [8b_PERF_SPEC-REQ-324]** Requirement PERF-189
- **Type:** Performance
- **Description:** **[PERF-189]** Log chunks from `stream_logs` are delivered in sequence-number order with no gaps. The test consumer verifies this by maintaining a `last_sequence: u64` counter and asserting `chunk.seq...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-190] [8b_PERF_SPEC-REQ-325]** Requirement PERF-190
- **Type:** Performance
- **Description:** **[PERF-190]** The `MockAgentAdapter` generates log lines at a configurable rate (`log_lines_per_second: Option<u32>`). When `None` (default), lines are emitted as fast as the mock can produce them. T...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-191] [8b_PERF_SPEC-REQ-326]** Requirement PERF-191
- **Type:** Performance
- **Description:** **[PERF-191]** The 10 000 ms deadline for log stream delivery applies to the full stream from first chunk to `done:true`. It does not require all 10 000 lines to arrive uniformly distributed in time; ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-089] [8b_PERF_SPEC-REQ-327]** Requirement PERF-089
- **Type:** Performance
- **Description:** **[PERF-089]** The presubmit timing gate operates at two levels:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-192] [8b_PERF_SPEC-REQ-328]** Requirement PERF-192
- **Type:** Performance
- **Description:** **[PERF-192]** The hard limit for each step (`hard_limit_ms`) is defined as a named constant in `./do` and validated at the top of the script. Steps share no state that could cause one step's overrun ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-193] [8b_PERF_SPEC-REQ-329]** Requirement PERF-193
- **Type:** Performance
- **Description:** **[PERF-193]** When the timer fires and `_timeout_kill` is the last record, `./do lint` verifies this and exits non-zero with `"presubmit exceeded 900s wall-clock budget"`. This is separate from the `...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-090] [8b_PERF_SPEC-REQ-330]** Requirement PERF-090
- **Type:** Performance
- **Description:** **[PERF-090]** A unit test in `crates/devs-checkpoint/tests/perf_write.rs::test_atomic_write_latency` measures end-to-end write latency:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-194] [8b_PERF_SPEC-REQ-331]** Requirement PERF-194
- **Type:** Performance
- **Description:** **[PERF-194]** The git2 push step is mocked in the unit test (using a no-op push implementation). Measuring the full `serialize → write .tmp → fsync → rename → git-add → git-commit → git-push` pipelin...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-195] [8b_PERF_SPEC-REQ-332]** Requirement PERF-195
- **Type:** Performance
- **Description:** **[PERF-195]** A separate integration test (`tests/perf_checkpoint.rs::test_checkpoint_with_git`) measures the full end-to-end checkpoint write including `git2` commit (but not push, which uses a no-o...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-091] [8b_PERF_SPEC-REQ-333]** Requirement PERF-091
- **Type:** Performance
- **Description:** **[PERF-091]** All six failure conditions are treated identically: they block merge to `main` and must be resolved before any further commits.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-092] [8b_PERF_SPEC-REQ-334]** Requirement PERF-092
- **Type:** Performance
- **Description:** **[PERF-092]** Performance test failures block merge to `main` on the same basis as functional test failures. There is no distinction between "performance CI" and "functional CI" — all tests run in `....
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-196] [8b_PERF_SPEC-REQ-335]** Requirement PERF-196
- **Type:** Performance
- **Description:** **[PERF-196]** A performance regression that cannot be fixed within the current sprint requires an Architecture Decision Record (ADR) in `docs/adr/NNNN-perf-regression-<name>.md` documenting the regre...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-197] [8b_PERF_SPEC-REQ-336]** Requirement PERF-197
- **Type:** Performance
- **Description:** **[PERF-197]** At most **3 concurrent performance suppressions** are permitted. A fourth attempted suppression causes `./do lint` to exit non-zero with `"maximum performance suppressions (3) reached; ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-198] [8b_PERF_SPEC-REQ-337]** Requirement PERF-198
- **Type:** Performance
- **Description:** **[PERF-198]** `./do lint` checks that:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-199] [8b_PERF_SPEC-REQ-338]** Requirement PERF-199
- **Type:** Performance
- **Description:** **[PERF-199]** `target/criterion/regressions.jsonl` is checked by `./do lint`. If the file is non-empty and contains any entries with `delta_pct >= 10.0`, lint fails with a summary of all regressions....
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-001] [8b_PERF_SPEC-REQ-339]** Requirement AC-PERF-7-001
- **Type:** Performance
- **Description:** - **[AC-PERF-7-001]** `devs_test_helper::start_server()` returns a `ServerHandle` with a valid `grpc_addr` within 10 000 ms on all three CI platforms (Linux, macOS, Windows).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-002] [8b_PERF_SPEC-REQ-340]** Requirement AC-PERF-7-002
- **Type:** Performance
- **Description:** - **[AC-PERF-7-002]** `ServerHandle::drop()` sends SIGTERM, waits up to 10 s, then sends SIGKILL; discovery file is absent after `drop()` returns.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-003] [8b_PERF_SPEC-REQ-341]** Requirement AC-PERF-7-003
- **Type:** Performance
- **Description:** - **[AC-PERF-7-003]** Two simultaneous `start_server()` calls use different ephemeral ports and do not conflict.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-004] [8b_PERF_SPEC-REQ-342]** Requirement AC-PERF-7-004
- **Type:** Performance
- **Description:** - **[AC-PERF-7-004]** `MockAgentAdapter` with `run_duration_ms = 500` produces a `StageRun` with `exit_code = 0` and `status = Completed`; elapsed time is ≥ 500 ms.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-005] [8b_PERF_SPEC-REQ-343]** Requirement AC-PERF-7-005
- **Type:** Performance
- **Description:** - **[AC-PERF-7-005]** `MockAgentAdapter` with `log_line_count = 100` produces exactly 100 log lines observable via `stream_logs`.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-006] [8b_PERF_SPEC-REQ-344]** Requirement AC-PERF-7-006
- **Type:** Performance
- **Description:** - **[AC-PERF-7-006]** `devs_test_helper::timing::LatencyRecorder` correctly computes p50, p99, min, and max from a known set of samples.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-007] [8b_PERF_SPEC-REQ-345]** Requirement AC-PERF-7-007
- **Type:** Performance
- **Description:** - **[AC-PERF-7-007]** All benchmark files in `crates/*/benches/` compile without errors; `cargo bench --no-run` exits 0.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-008] [8b_PERF_SPEC-REQ-346]** Requirement AC-PERF-7-008
- **Type:** Performance
- **Description:** - **[AC-PERF-7-008]** No benchmark file imports `tokio::net`, `tonic`, `git2`, or `reqwest` (verified by `./do lint`).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-009] [8b_PERF_SPEC-REQ-347]** Requirement AC-PERF-7-009
- **Type:** Performance
- **Description:** - **[AC-PERF-7-009]** Every benchmark uses `criterion_config()` from `devs_test_helper::bench_config`; inline `Criterion::default()` configurations are absent.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-010] [8b_PERF_SPEC-REQ-348]** Requirement AC-PERF-7-010
- **Type:** Performance
- **Description:** - **[AC-PERF-7-010]** `target/criterion/` contains at least one baseline file after running `./do coverage --update-baselines` on a clean repository.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-011] [8b_PERF_SPEC-REQ-349]** Requirement AC-PERF-7-011
- **Type:** Performance
- **Description:** - **[AC-PERF-7-011]** Regression detection: modifying `TemplateResolver` to add a 1 ms `std::thread::sleep` (simulated regression) causes `./do test` to emit a regression event and exit non-zero.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-012] [8b_PERF_SPEC-REQ-350]** Requirement AC-PERF-7-012
- **Type:** Performance
- **Description:** - **[AC-PERF-7-012]** `test_dag_dispatch_latency` submits 5 independent runs and collects 5 latency samples; all samples satisfy `dispatch_latency_ms < 150`.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-013] [8b_PERF_SPEC-REQ-351]** Requirement AC-PERF-7-013
- **Type:** Performance
- **Description:** - **[AC-PERF-7-013]** `test_parallel_dispatch_latency` confirms both root stages are `Running` within 150 ms of submit.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-014] [8b_PERF_SPEC-REQ-352]** Requirement AC-PERF-7-014
- **Type:** Performance
- **Description:** - **[AC-PERF-7-014]** `test_cancelled_dep_cascade_latency` confirms downstream stages reach `Cancelled` within 150 ms of the upstream dep failing.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-015] [8b_PERF_SPEC-REQ-353]** Requirement AC-PERF-7-015
- **Type:** Performance
- **Description:** - **[AC-PERF-7-015]** With `max_concurrent = 10`: all 10 stages reach `Running` within 5 000 ms; all 10 runs complete.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-016] [8b_PERF_SPEC-REQ-354]** Requirement AC-PERF-7-016
- **Type:** Performance
- **Description:** - **[AC-PERF-7-016]** With `max_concurrent = 4` and 10 simultaneous submissions: `active_count == 4` and `queued_count == 6` are observed within 2 000 ms.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-017] [8b_PERF_SPEC-REQ-355]** Requirement AC-PERF-7-017
- **Type:** Performance
- **Description:** - **[AC-PERF-7-017]** After all runs complete in the pool exhaustion variant: `active_count == 0` and `queued_count == 0`.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-018] [8b_PERF_SPEC-REQ-356]** Requirement AC-PERF-7-018
- **Type:** Performance
- **Description:** - **[AC-PERF-7-018]** All 100 sequential `handle_event + render` cycles complete within 16 ms each.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-019] [8b_PERF_SPEC-REQ-357]** Requirement AC-PERF-7-019
- **Type:** Performance
- **Description:** - **[AC-PERF-7-019]** No `tui.render_slow` WARN events are emitted during the 100-event injection.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-020] [8b_PERF_SPEC-REQ-358]** Requirement AC-PERF-7-020
- **Type:** Performance
- **Description:** - **[AC-PERF-7-020]** The `insta` snapshot for the 100th event matches the committed snapshot file.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-021] [8b_PERF_SPEC-REQ-359]** Requirement AC-PERF-7-021
- **Type:** Performance
- **Description:** - **[AC-PERF-7-021]** 64 concurrent `get_run` requests all complete within 500 ms total elapsed time.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-022] [8b_PERF_SPEC-REQ-360]** Requirement AC-PERF-7-022
- **Type:** Performance
- **Description:** - **[AC-PERF-7-022]** 65th concurrent connection receives HTTP 503 with `"resource_exhausted:"` error prefix within 100 ms.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-023] [8b_PERF_SPEC-REQ-361]** Requirement AC-PERF-7-023
- **Type:** Performance
- **Description:** - **[AC-PERF-7-023]** After releasing the 64 long-running connections, the next `get_run` request succeeds within 500 ms.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-024] [8b_PERF_SPEC-REQ-362]** Requirement AC-PERF-7-024
- **Type:** Performance
- **Description:** - **[AC-PERF-7-024]** `stream_logs` delivers all 10 000 lines from a completed stage within 10 000 ms.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-025] [8b_PERF_SPEC-REQ-363]** Requirement AC-PERF-7-025
- **Type:** Performance
- **Description:** - **[AC-PERF-7-025]** Sequence numbers in delivered chunks form a complete, gap-free sequence from 1 to 10 000.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-026] [8b_PERF_SPEC-REQ-364]** Requirement AC-PERF-7-026
- **Type:** Performance
- **Description:** - **[AC-PERF-7-026]** `LogBuffer` with 15 000 pushes at capacity 10 000: `lines.len() == 10 000`, `total_received == 15 000`, `truncated == true`.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-027] [8b_PERF_SPEC-REQ-365]** Requirement AC-PERF-7-027
- **Type:** Performance
- **Description:** - **[AC-PERF-7-027]** `./do presubmit` on Linux CI completes within 900 s.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-028] [8b_PERF_SPEC-REQ-366]** Requirement AC-PERF-7-028
- **Type:** Performance
- **Description:** - **[AC-PERF-7-028]** `target/presubmit_timings.jsonl` contains one valid JSON record per step after a successful `./do presubmit` run.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-029] [8b_PERF_SPEC-REQ-367]** Requirement AC-PERF-7-029
- **Type:** Performance
- **Description:** - **[AC-PERF-7-029]** Each timing record contains all required fields: `step`, `started_at`, `completed_at`, `duration_ms`, `budget_ms`, `hard_limit_ms`, `over_budget`, `exceeded_hard_limit`, `exit_co...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-030] [8b_PERF_SPEC-REQ-368]** Requirement AC-PERF-7-030
- **Type:** Performance
- **Description:** - **[AC-PERF-7-030]** When the 900 s timer fires, `_timeout_kill` is the last record; `./do lint` reads this and exits non-zero.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-031] [8b_PERF_SPEC-REQ-369]** Requirement AC-PERF-7-031
- **Type:** Performance
- **Description:** - **[AC-PERF-7-031]** Atomic write for a 256-stage `checkpoint.json` completes within 500 ms on the unit test filesystem.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-032] [8b_PERF_SPEC-REQ-370]** Requirement AC-PERF-7-032
- **Type:** Performance
- **Description:** - **[AC-PERF-7-032]** Disk-full simulation causes `Err(CheckpointError::DiskFull)` and deletion of the `.tmp` file; server does not crash.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-033] [8b_PERF_SPEC-REQ-371]** Requirement AC-PERF-7-033
- **Type:** Performance
- **Description:** - **[AC-PERF-7-033]** Concurrent write calls for the same run are serialized; the second call does not overwrite the first call's data.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-034] [8b_PERF_SPEC-REQ-372]** Requirement AC-PERF-7-034
- **Type:** Performance
- **Description:** - **[AC-PERF-7-034]** A benchmark with `delta_pct = 10.0` produces exactly one `RegressionEvent` in `target/criterion/regressions.jsonl`.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-035] [8b_PERF_SPEC-REQ-373]** Requirement AC-PERF-7-035
- **Type:** Performance
- **Description:** - **[AC-PERF-7-035]** A benchmark with `delta_pct = 9.99` produces zero `RegressionEvent` records and one `WARN` log line.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-036] [8b_PERF_SPEC-REQ-374]** Requirement AC-PERF-7-036
- **Type:** Performance
- **Description:** - **[AC-PERF-7-036]** A benchmark with `delta_pct = -5.0` (improvement) produces zero `RegressionEvent` records and one `info` log line.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-037] [8b_PERF_SPEC-REQ-375]** Requirement AC-PERF-7-037
- **Type:** Performance
- **Description:** - **[AC-PERF-7-037]** `./do lint` exits non-zero when `target/criterion/regressions.jsonl` contains any entry with `delta_pct >= 10.0`.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-7-038] [8b_PERF_SPEC-REQ-376]** Requirement AC-PERF-7-038
- **Type:** Performance
- **Description:** - **[AC-PERF-7-038]** A `perf-suppress` annotation with an expired `suppress-expires` date causes `./do lint` to exit non-zero.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-095] [8b_PERF_SPEC-REQ-377]** Requirement PERF-095
- **Type:** Performance
- **Description:** **[PERF-095]** All latency fields in structured logs use monotonic clock milliseconds as `u64`. Wall-clock timestamps use `chrono::Utc::now()` for the `timestamp` field; elapsed durations use `std::ti...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-200] [8b_PERF_SPEC-REQ-378]** Requirement PERF-200
- **Type:** Performance
- **Description:** **[PERF-200]** Each performance log event MUST conform to the following JSON envelope when `DEVS_LOG_FORMAT=json` (controlled by the `tracing-subscriber` JSON formatter). Fields not listed for a speci...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-201] [8b_PERF_SPEC-REQ-379]** Requirement PERF-201
- **Type:** Performance
- **Description:** **[PERF-201]** Business rules for structured log event emission:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-202] [8b_PERF_SPEC-REQ-380]** Requirement PERF-202
- **Type:** Performance
- **Description:** **[PERF-202]** The `level` field in performance log events MUST NOT be overridden by the calling code. The log level for each event type is fixed in the [PERF-094] table and enforced by using the corr...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-096] [8b_PERF_SPEC-REQ-381]** Requirement PERF-096
- **Type:** Performance
- **Description:** **[PERF-096]** The MCP `get_pool_state` tool exposes the following performance-relevant fields that AI agents and operators can use for real-time performance monitoring:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-097] [8b_PERF_SPEC-REQ-382]** Requirement PERF-097
- **Type:** Performance
- **Description:** **[PERF-097]** The `get_run` MCP tool returns `elapsed_ms` for each `StageRun` (monotonic clock from `started_at`). For completed stages, `elapsed_ms` is the fixed completion-to-start delta. For runni...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-203] [8b_PERF_SPEC-REQ-383]** Requirement PERF-203
- **Type:** Performance
- **Description:** **[PERF-203]** The complete set of performance-relevant fields exposed by `get_pool_state` is defined by the following response schema. All fields listed below MUST be present in every response; unpop...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-204] [8b_PERF_SPEC-REQ-384]** Requirement PERF-204
- **Type:** Performance
- **Description:** **[PERF-204]** The `elapsed_ms` field on `StageRun` objects returned by `get_run` MUST be computed as follows, based on stage status at call time:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-205] [8b_PERF_SPEC-REQ-385]** Requirement PERF-205
- **Type:** Performance
- **Description:** **[PERF-205]** The `queued_count` field in `get_pool_state` reflects the number of pending `acquire_owned()` futures on the `Arc<tokio::sync::Semaphore>` at the moment the handler holds the `PoolState...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-098] [8b_PERF_SPEC-REQ-386]** Requirement PERF-098
- **Type:** Performance
- **Description:** **[PERF-098]** The following conditions, when observed in the structured log stream, require operator attention. Thresholds are expressed as sliding-window counts for repeated occurrences; single-occu...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-099] [8b_PERF_SPEC-REQ-387]** Requirement PERF-099
- **Type:** Performance
- **Description:** **[PERF-099]** The `state.changed` outbound webhook (when configured) provides native integration with external monitoring systems. Performance conditions that surface as state changes (e.g., stage `T...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-206] [8b_PERF_SPEC-REQ-388]** Requirement PERF-206
- **Type:** Performance
- **Description:** **[PERF-206]** The repeated-occurrence thresholds in [PERF-098] (e.g., "≥ 3 occurrences in 60 s window") MUST be evaluated by the operator's external log monitoring tooling, not by the `devs` server i...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-207] [8b_PERF_SPEC-REQ-389]** Requirement PERF-207
- **Type:** Performance
- **Description:** **[PERF-207]** The recommended sliding-window algorithm for operator log aggregation systems evaluating the "≥ 3 in 60 s" threshold is:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-208] [8b_PERF_SPEC-REQ-390]** Requirement PERF-208
- **Type:** Performance
- **Description:** **[PERF-208]** The `state.changed` webhook event payload for performance-relevant state transitions MUST include the following fields in addition to the standard webhook envelope (defined in §4.14 of ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-209] [8b_PERF_SPEC-REQ-391]** Requirement PERF-209
- **Type:** Performance
- **Description:** **[PERF-209]** Business rules for `target/presubmit_timings.jsonl`:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-210] [8b_PERF_SPEC-REQ-392]** Requirement PERF-210
- **Type:** Performance
- **Description:** **[PERF-210]** The `_timeout_kill` record has a fixed schema with `null` for fields that could not be computed because the process was killed before completion:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-211] [8b_PERF_SPEC-REQ-393]** Requirement PERF-211
- **Type:** Performance
- **Description:** **[PERF-211]** Business rules for criterion baseline management:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-212] [8b_PERF_SPEC-REQ-394]** Requirement PERF-212
- **Type:** Performance
- **Description:** **[PERF-212]** The `target/criterion/regressions.jsonl` schema (one JSON object per line):
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-213] [8b_PERF_SPEC-REQ-395]** Requirement PERF-213
- **Type:** Performance
- **Description:** **[PERF-213]** The `pool.exhausted` episode is tracked per-pool via an `exhausted_since: Option<Instant>` field in `PoolState`. State transition rules:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-214] [8b_PERF_SPEC-REQ-396]** Requirement PERF-214
- **Type:** Performance
- **Description:** **[PERF-214]** The `pool.exhausted` webhook payload MUST include the following fields in the `data` object. `project_id`, `run_id`, and `stage_name` are `null` at the top level because pool exhaustion...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-215] [8b_PERF_SPEC-REQ-397]** Requirement PERF-215
- **Type:** Performance
- **Description:** **[PERF-215]** The SLO violation rate-limiter (which prevents `slo.violation` log event flooding per [PERF-131]) uses the following per-`(operation, boundary)` pair state stored within `Arc<RwLock<Sch...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-216] [8b_PERF_SPEC-REQ-398]** Requirement PERF-216
- **Type:** Performance
- **Description:** **[PERF-216]** When the `tracing` subscriber is not initialized (e.g., in unit tests that construct engine components directly without calling `tracing_subscriber::fmt::init()`), performance log event...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-217] [8b_PERF_SPEC-REQ-399]** Requirement PERF-217
- **Type:** Performance
- **Description:** **[PERF-217]** When `DEVS_LOG_FORMAT` is set to an unrecognized value (any value other than `"json"` or `"text"`), the server MUST:
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-218] [8b_PERF_SPEC-REQ-400]** Requirement PERF-218
- **Type:** Performance
- **Description:** **[PERF-218]** When `RUST_LOG` suppresses performance log events (e.g., `RUST_LOG=error` suppresses `WARN` and `DEBUG` events), the affected events are silently dropped by the `tracing` subscriber. Th...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-219] [8b_PERF_SPEC-REQ-401]** Requirement PERF-219
- **Type:** Performance
- **Description:** **[PERF-219]** When `get_pool_state` is called while a `cancel_run` control operation holds the `PoolState` write lock, the `get_pool_state` read-lock acquisition blocks until the write lock is releas...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-220] [8b_PERF_SPEC-REQ-402]** Requirement PERF-220
- **Type:** Performance
- **Description:** **[PERF-220]** When `target/presubmit_timings.jsonl` contains a record with `exceeded_hard_limit: true` for any step other than `_timeout_kill` **and** subsequent records exist in the file, this indic...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-221] [8b_PERF_SPEC-REQ-403]** Requirement PERF-221
- **Type:** Performance
- **Description:** **[PERF-221]** When `target/criterion/regressions.jsonl` is absent (no benchmarks were run), `./do lint` MUST emit a `WARN: benchmark regression file not found; skipping regression check` and exit 0. ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-038] [8b_PERF_SPEC-REQ-404]** Requirement AC-PERF-038
- **Type:** Performance
- **Description:** - **[AC-PERF-038]** A stage dispatch taking > 100 ms emits exactly one `scheduler.dispatch_slow` WARN event with `fields.latency_ms >= 100` and `fields.event_type == "scheduler.dispatch_slow"`. No dup...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-039] [8b_PERF_SPEC-REQ-405]** Requirement AC-PERF-039
- **Type:** Performance
- **Description:** - **[AC-PERF-039]** A `scheduler.dispatch_slow` event for a stage in an active run includes a `span` field with `run_id` equal to the run's UUID string and `stage_name` equal to the dispatched stage n...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-040] [8b_PERF_SPEC-REQ-406]** Requirement AC-PERF-040
- **Type:** Performance
- **Description:** - **[AC-PERF-040]** A `retention.sweep_duration` INFO event has a `span` field present in the JSON output with both `run_id: null` and `stage_name: null`. The `span` object MUST NOT be absent from the...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-041] [8b_PERF_SPEC-REQ-407]** Requirement AC-PERF-041
- **Type:** Performance
- **Description:** - **[AC-PERF-041]** When `DEVS_LOG_FORMAT=json`, a `scheduler.dispatch_slow` event is parseable as valid JSON with a top-level `fields` key containing `event_type` equal to the string `"scheduler.disp...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-042] [8b_PERF_SPEC-REQ-408]** Requirement AC-PERF-042
- **Type:** Performance
- **Description:** - **[AC-PERF-042]** When two `slo.violation` events would be emitted for the same `(operation, boundary)` pair within a 10-second window, the second emission is suppressed. When the window expires and...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-043] [8b_PERF_SPEC-REQ-409]** Requirement AC-PERF-043
- **Type:** Performance
- **Description:** - **[AC-PERF-043]** `get_pool_state` response includes `utilization_pct` equal to `active_count / max_concurrent * 100.0` rounded to one decimal place. For `active_count == 3`, `max_concurrent == 4`: ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-044] [8b_PERF_SPEC-REQ-410]** Requirement AC-PERF-044
- **Type:** Performance
- **Description:** - **[AC-PERF-044]** `get_pool_state` response includes `server_uptime_ms` as a non-negative integer. Two consecutive calls to `get_pool_state` on a running server return `server_uptime_ms` values wher...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-045] [8b_PERF_SPEC-REQ-411]** Requirement AC-PERF-045
- **Type:** Performance
- **Description:** - **[AC-PERF-045]** `get_run` response for a `Running` stage returns `elapsed_ms > 0`. Two consecutive calls separated by 100 ms return `elapsed_ms` values where the second is ≥ the first (monotonical...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-046] [8b_PERF_SPEC-REQ-412]** Requirement AC-PERF-046
- **Type:** Performance
- **Description:** - **[AC-PERF-046]** `get_run` response for a `Paused` stage returns a frozen `elapsed_ms`. After waiting 500 ms in the `Paused` state, a second `get_run` call returns the same `elapsed_ms` value as th...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-047] [8b_PERF_SPEC-REQ-413]** Requirement AC-PERF-047
- **Type:** Performance
- **Description:** - **[AC-PERF-047]** When a rate-limited agent's `rate_limited_until` timestamp has passed, a `get_pool_state` call returns `null` for that agent's `rate_limited_until` field. The pool selector must ha...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-048] [8b_PERF_SPEC-REQ-414]** Requirement AC-PERF-048
- **Type:** Performance
- **Description:** - **[AC-PERF-048]** When all agents in a pool become simultaneously unavailable (all permits at `max_concurrent`), exactly one `pool.exhausted` webhook fires during the episode. A second dispatch atte...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-049] [8b_PERF_SPEC-REQ-415]** Requirement AC-PERF-049
- **Type:** Performance
- **Description:** - **[AC-PERF-049]** The `pool.exhausted` webhook payload includes `data.pool_name` (matching the configured pool name), `data.rate_limited_agents` (array of tool strings; `[]` if no agents are rate-li...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-050] [8b_PERF_SPEC-REQ-416]** Requirement AC-PERF-050
- **Type:** Performance
- **Description:** - **[AC-PERF-050]** After a `pool.exhausted` episode ends (one permit released, no immediate re-acquisition), a subsequent full-exhaustion condition fires a new `pool.exhausted` webhook. The total web...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-051] [8b_PERF_SPEC-REQ-417]** Requirement AC-PERF-051
- **Type:** Performance
- **Description:** - **[AC-PERF-051]** After a successful `./do presubmit` run (all 6 steps complete with exit code 0), `target/presubmit_timings.jsonl` contains exactly 6 newline-delimited JSON records, one per step, i...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-052] [8b_PERF_SPEC-REQ-418]** Requirement AC-PERF-052
- **Type:** Performance
- **Description:** - **[AC-PERF-052]** A step that exits non-zero produces a record with `over_budget: false`, `exceeded_hard_limit: false` (the failure was fast, within budget), and `exit_code` equal to the non-zero ex...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-053] [8b_PERF_SPEC-REQ-419]** Requirement AC-PERF-053
- **Type:** Performance
- **Description:** - **[AC-PERF-053]** The `budget_ms` value in each record exactly matches the constant in [PERF-209] for that step. A record where `budget_ms` does not match (e.g., `budget_ms: 999` for `"lint"` instea...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-054] [8b_PERF_SPEC-REQ-420]** Requirement AC-PERF-054
- **Type:** Performance
- **Description:** - **[AC-PERF-054]** When a benchmark's `delta_pct >= 10.0` and `suppressed == false`, `./do lint` exits non-zero and includes in its error output: the benchmark name, the crate, `baseline_ns`, `measur...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-055] [8b_PERF_SPEC-REQ-421]** Requirement AC-PERF-055
- **Type:** Performance
- **Description:** - **[AC-PERF-055]** When a benchmark's baseline `estimates.json` is absent, `./do lint` emits exactly one `WARN:` line containing the benchmark name and the text `"no baseline found"`, and exits 0. Th...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-017] [8b_PERF_SPEC-REQ-422]** Requirement AC-PERF-017
- **Type:** Performance
- **Description:** - **[AC-PERF-017]** First reconnect attempt begins within 1 000 ms of simulated stream error (`TuiEvent::StreamError` injected).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-018] [8b_PERF_SPEC-REQ-423]** Requirement AC-PERF-018
- **Type:** Performance
- **Description:** - **[AC-PERF-018]** Below-minimum terminal size (79×24): only warning rendered; no other widgets present in snapshot.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-019] [8b_PERF_SPEC-REQ-424]** Requirement AC-PERF-019
- **Type:** Performance
- **Description:** - **[AC-PERF-019]** `handle_event` with 256 rapid `RunDelta` events processes all within 5 000 ms total (batch throughput test).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-020] [8b_PERF_SPEC-REQ-425]** Requirement AC-PERF-020
- **Type:** Performance
- **Description:** - **[AC-PERF-020]** `devs status <run>` exits within 750 ms on loopback (end-to-end, p99 with CI margin).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-021] [8b_PERF_SPEC-REQ-426]** Requirement AC-PERF-021
- **Type:** Performance
- **Description:** - **[AC-PERF-021]** `devs list` with 100 runs exits within 1 050 ms on loopback (p99 with CI margin).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-022] [8b_PERF_SPEC-REQ-427]** Requirement AC-PERF-022
- **Type:** Performance
- **Description:** - **[AC-PERF-022]** `devs submit` with valid inputs exits within 2 250 ms on loopback (p99 with CI margin).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-023] [8b_PERF_SPEC-REQ-428]** Requirement AC-PERF-023
- **Type:** Performance
- **Description:** - **[AC-PERF-023]** Atomic write protocol for a 256-stage `checkpoint.json` completes within 500 ms on a test filesystem.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-024] [8b_PERF_SPEC-REQ-429]** Requirement AC-PERF-024
- **Type:** Performance
- **Description:** - **[AC-PERF-024]** Orphaned `.tmp` checkpoint file is deleted within 500 ms of server startup (before checkpoint loading begins).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-025] [8b_PERF_SPEC-REQ-430]** Requirement AC-PERF-025
- **Type:** Performance
- **Description:** - **[AC-PERF-025]** `checkpoint.json` for a 256-stage run contains no inline base64 stdout/stderr; all stage output references log paths only.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-026] [8b_PERF_SPEC-REQ-431]** Requirement AC-PERF-026
- **Type:** Performance
- **Description:** - **[AC-PERF-026]** Server baseline RSS < 64 MiB (measured 10 s after startup, 0 active runs, 10 projects registered).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-027] [8b_PERF_SPEC-REQ-432]** Requirement AC-PERF-027
- **Type:** Performance
- **Description:** - **[AC-PERF-027]** Fan-out `count=64`, `max_concurrent=4`: `get_pool_state` shows `active_count==4` and `queued_count==60` within 500 ms of dispatch start.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-028] [8b_PERF_SPEC-REQ-433]** Requirement AC-PERF-028
- **Type:** Performance
- **Description:** - **[AC-PERF-028]** `BoundedBytes<1_048_576>` construction with 1 048 577 bytes: bytes are truncated to last 1 048 576; `truncated == true`; no panic.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-029] [8b_PERF_SPEC-REQ-434]** Requirement AC-PERF-029
- **Type:** Performance
- **Description:** - **[AC-PERF-029]** Context file for a run with 10 × 1 MiB-stdout completed stages: total `.devs_context.json` ≤ 10 MiB; `truncated == true` on at least one stage.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-030] [8b_PERF_SPEC-REQ-435]** Requirement AC-PERF-030
- **Type:** Performance
- **Description:** - **[AC-PERF-030]** `./do presubmit` on Linux CI completes within 900 s (measured by CI runner wall clock).
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-031] [8b_PERF_SPEC-REQ-436]** Requirement AC-PERF-031
- **Type:** Performance
- **Description:** - **[AC-PERF-031]** `target/presubmit_timings.jsonl` is present after `./do presubmit`; each of the 6 steps has a well-formed JSON record with all required fields.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-032] [8b_PERF_SPEC-REQ-437]** Requirement AC-PERF-032
- **Type:** Performance
- **Description:** - **[AC-PERF-032]** `over_budget: true` entry in `presubmit_timings.jsonl` results in exactly one `WARN:` line on stderr.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-033] [8b_PERF_SPEC-REQ-438]** Requirement AC-PERF-033
- **Type:** Performance
- **Description:** - **[AC-PERF-033]** When the 900 s timer fires, a `_timeout_kill` record is the last line of `target/presubmit_timings.jsonl`.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-034] [8b_PERF_SPEC-REQ-439]** Requirement AC-PERF-034
- **Type:** Performance
- **Description:** - **[AC-PERF-034]** A stage dispatch that takes > 100 ms emits exactly one `scheduler.dispatch_slow` WARN event with `latency_ms` field present.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-035] [8b_PERF_SPEC-REQ-440]** Requirement AC-PERF-035
- **Type:** Performance
- **Description:** - **[AC-PERF-035]** An MCP write lock held for > 5 s results in exactly one `mcp.lock_timeout` ERROR event for the waiting caller.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-036] [8b_PERF_SPEC-REQ-441]** Requirement AC-PERF-036
- **Type:** Performance
- **Description:** - **[AC-PERF-036]** A TUI render cycle taking > 16 ms emits exactly one `tui.render_slow` WARN event with `duration_ms` and `tab_name` fields.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[AC-PERF-037] [8b_PERF_SPEC-REQ-442]** Requirement AC-PERF-037
- **Type:** Performance
- **Description:** - **[AC-PERF-037]** A webhook dispatcher channel overflow emits a `webhook.channel_overflow` WARN event with `dropped_count ≥ 1`.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-001] [8b_PERF_SPEC-REQ-443]** Requirement PERF-TRACE-BR-001
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-001]** A PERF ID with `test_type = "design_invariant"` is exempt from the `covered: false` gate. Design invariants (like [PERF-081], which asserts no REST API endpoint) are verified...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-002] [8b_PERF_SPEC-REQ-444]** Requirement PERF-TRACE-BR-002
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-002]** A PERF ID with `test_type = "benchmark"` requires a Criterion benchmark file in `benches/` named `perf_NNN_*.rs` or annotated with `// Covers: PERF-NNN`. Benchmarks that are ...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-003] [8b_PERF_SPEC-REQ-445]** Requirement PERF-TRACE-BR-003
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-003]** All `upstream_ids` must resolve to known requirement IDs in the referenced upstream documents. An upstream ID that cannot be found in its source document is a `stale_upstream...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-004] [8b_PERF_SPEC-REQ-446]** Requirement PERF-TRACE-BR-004
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-004]** `PERF-GP-NNN` guiding principles are scanned for coverage the same way as `PERF-NNN` operational targets. Principles are covered by the tests that enforce their constraints (...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-005] [8b_PERF_SPEC-REQ-447]** Requirement PERF-TRACE-BR-005
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-005]** When a single test covers multiple PERF IDs (e.g., a load test that simultaneously validates dispatch latency and pool semaphore behavior), the test appears in the `covering_...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-006] [8b_PERF_SPEC-REQ-448]** Requirement PERF-TRACE-BR-006
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-006]** `overall_passed` in `target/traceability.json` is `false` if any PERF ID (excluding `design_invariant` entries) has `covered: false`. The existing traceability rules from `[M...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-007] [8b_PERF_SPEC-REQ-449]** Requirement PERF-TRACE-BR-007
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-007]** `perf_summary.uncovered > 0` causes `./do test` to print the list of uncovered IDs to stderr before exiting non-zero. The format is: `UNCOVERED PERF IDs: PERF-042, PERF-117 (...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-008] [8b_PERF_SPEC-REQ-450]** Requirement PERF-TRACE-BR-008
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-008]** The scanner resolves upstream IDs by searching for the exact string `[GOAL-001]` (including brackets) in the referenced source document. A match anywhere in the document (hea...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-009] [8b_PERF_SPEC-REQ-451]** Requirement PERF-TRACE-BR-009
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-009]** Upstream IDs of the form `§N` (section references within this document) are resolved by verifying that the referenced section heading exists. Section references are informati...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-010] [8b_PERF_SPEC-REQ-452]** Requirement PERF-TRACE-BR-010
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-010]** An upstream ID that references a source document that has been superseded or renamed is a `stale_upstream_id`. The `stale_upstream_ids` array in `perf_summary` lists all such...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-GP-NNN] [8b_PERF_SPEC-REQ-453]** Requirement PERF-GP-NNN
- **Type:** Performance
- **Description:** // Pass 1: collect all [PERF-NNN] and [PERF-GP-NNN] IDs from spec
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-011] [8b_PERF_SPEC-REQ-454]** Requirement PERF-TRACE-BR-011
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-011]** A PERF ID MUST NOT be added to the spec without simultaneously adding at least one `// Covers: PERF-NNN` annotation in a test file. This is the "two-together" rule from [RISK...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-012] [8b_PERF_SPEC-REQ-455]** Requirement PERF-TRACE-BR-012
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-012]** A PERF ID MUST NOT be removed from the spec while any `// Covers: PERF-NNN` annotation referencing it still exists. The agent must remove both the spec definition and all ann...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-BR-013] [8b_PERF_SPEC-REQ-456]** Requirement PERF-TRACE-BR-013
- **Type:** Performance
- **Description:** - **[PERF-TRACE-BR-013]** Transitions from `Covered` to `Uncovered` caused by a test deletion MUST result in `./do test` exiting non-zero within the same `./do presubmit` run in which the test was del...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-AC-001] [8b_PERF_SPEC-REQ-457]** Requirement PERF-TRACE-AC-001
- **Type:** Performance
- **Description:** - **[PERF-TRACE-AC-001]** `./do test` generates `target/traceability.json` with a `perf_summary` field containing `total_perf_ids ≥ 165` after a clean workspace build.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-AC-002] [8b_PERF_SPEC-REQ-458]** Requirement PERF-TRACE-AC-002
- **Type:** Performance
- **Description:** - **[PERF-TRACE-AC-002]** `target/traceability.json` has `perf_summary.uncovered == 0` when all tests pass.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-AC-003] [8b_PERF_SPEC-REQ-459]** Requirement PERF-TRACE-AC-003
- **Type:** Performance
- **Description:** - **[PERF-TRACE-AC-003]** `target/traceability.json` has `perf_summary.stale_upstream_ids` as an empty array when all upstream source documents are present and unmodified.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-AC-004] [8b_PERF_SPEC-REQ-460]** Requirement PERF-TRACE-AC-004
- **Type:** Performance
- **Description:** - **[PERF-TRACE-AC-004]** Adding a `// Covers: PERF-99999` annotation (referencing a non-existent PERF ID) causes `./do test` to exit non-zero with `stale_annotations` containing `"PERF-99999"`.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-AC-005] [8b_PERF_SPEC-REQ-461]** Requirement PERF-TRACE-AC-005
- **Type:** Performance
- **Description:** - **[PERF-TRACE-AC-005]** Removing the `// Covers: PERF-001` annotation from `tests/e2e/scheduler_dispatch_latency.rs` without adding it elsewhere causes `./do test` to exit non-zero with `PERF-001` i...
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-AC-006] [8b_PERF_SPEC-REQ-462]** Requirement PERF-TRACE-AC-006
- **Type:** Performance
- **Description:** - **[PERF-TRACE-AC-006]** A test file containing `// Covers: PERF-001, PERF-038` causes both `PERF-001` and `PERF-038` to appear in `covered_tests` with `covered: true`.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-AC-007] [8b_PERF_SPEC-REQ-463]** Requirement PERF-TRACE-AC-007
- **Type:** Performance
- **Description:** - **[PERF-TRACE-AC-007]** `./do lint` runs the absence-of-pattern scan for `axum::`, `actix_web::`, `warp::` in production `cargo tree` output and exits non-zero if any is found.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-AC-008] [8b_PERF_SPEC-REQ-464]** Requirement PERF-TRACE-AC-008
- **Type:** Performance
- **Description:** - **[PERF-TRACE-AC-008]** `perf_summary.by_category` contains exactly the six categories: `latency`, `throughput`, `resource`, `presubmit`, `observability`, `principle` — no more, no fewer.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-AC-009] [8b_PERF_SPEC-REQ-465]** Requirement PERF-TRACE-AC-009
- **Type:** Performance
- **Description:** - **[PERF-TRACE-AC-009]** `./do test` exits non-zero if `perf_summary.uncovered > 0`, even if all other `cargo test` assertions pass.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None
### **[PERF-TRACE-AC-010] [8b_PERF_SPEC-REQ-466]** Requirement PERF-TRACE-AC-010
- **Type:** Performance
- **Description:** - **[PERF-TRACE-AC-010]** `./do test` prints the list of uncovered PERF IDs to stderr in the format `UNCOVERED PERF IDs: <ID1>, <ID2> (N total)` before exiting non-zero.
- **Source:** Performance Specification (docs/plan/specs/8b_performance_spec.md)
- **Dependencies:** None

## Cross-Reference IDs

The following upstream requirement IDs are referenced in the Performance Specification:

- [MCP-061]
- [GOAL-001]
- [2_PRD-BR-004]
- [ARCH-AC-009]
- [MCP-BR-004]
- [3_PRD-BR-026]
- [FB-BR-005]
- [TECH-AC-011]
- [MCP-DBG-BR-016]
- [RISK-BR-002]
- [0-9]
- [MCP-DBG-BR-015]
