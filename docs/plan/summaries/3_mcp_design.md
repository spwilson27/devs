# Summary: MCP and AI Development Design (`3_MCP_DESIGN`)

The `devs` system is developed by AI agents using its own infrastructure, with every internal entity observable and controllable via MCP ("Glass-Box" philosophy). Two MCP servers are required: the `devs` Glass-Box MCP (HTTP/JSON-RPC) and a Filesystem MCP (stdio), and agents operate in one of two distinct roles with strictly separated tool access.

---

## §1 Glass-Box Philosophy

**Core invariants:**
- [MCP-BR-001] No feature flags; MCP always active when port bound.
- [MCP-BR-002] MCP and gRPC share `Arc<RwLock<ServerState>>`; no separate view.
- [MCP-001] Every entity exposed; unpopulated optional fields = JSON `null`, never absent.
- [MCP-002] Operational during any run; log streams ≤500ms polling delay.
- [MCP-003] No auth at MVP (trusted-network only).
- [MCP-004] All responses include `"error": null | "<string>"` top-level.
- [MCP-005] Tool calls are atomic; no partial mutations with `error: null`.
- [MCP-BR-006] Absent field (vs null) = invariant violation; E2E must assert field presence.
- [MCP-BR-007] `definition_snapshot` = snapshot at run start, NOT live definition.

**Server discovery:** Read `DEVS_DISCOVERY_FILE` (or `~/.config/devs/server.addr`) → gRPC addr → `ServerService.GetInfo` → `mcp_port` → `http://<host>:<mcp_port>/mcp/v1/call`.
- [MCP-BR-003] MUST use `DEVS_DISCOVERY_FILE` when set.
- [MCP-BR-004] MUST NOT cache MCP address across restarts.
- [MCP-BR-005] `devs-mcp-bridge` discovers once at startup; exits code 1 on connection loss.

**Complete entity exposure** (all fields present, null not absent):
- `WorkflowRun` via `get_run`: `run_id`, `slug`, `workflow_name`, `project_id`, `status`, `inputs`, `definition_snapshot`, `created_at`, `started_at`, `completed_at`, `stage_runs`
- `StageRun` (embedded): `stage_run_id`, `run_id`, `stage_name`, `attempt`, `status`, `agent_tool`, `pool_name`, `started_at`, `completed_at`, `exit_code`, `output`
- `StageOutput` via `get_stage_output`: `stdout`, `stderr`, `structured`, `exit_code`, `log_path`, `truncated`
- `AgentPool` via `get_pool_state`: `name`, `max_concurrent`, `active_count`, `queued_count`, `agents[]`
- `WorkflowDefinition` via `get_workflow_definition`: `name`, `format`, `inputs`, `stages`, `timeout_secs`, `default_env`, `artifact_collection`, `source_path`
- `CheckpointRecord` via `list_checkpoints`: `commit_sha`, `committed_at`, `message`, `run_id`, `stage_name`, `stage_status`

**Two agent roles:**

1. **Orchestrated Agent**: spawned as workflow stage; reads `DEVS_MCP_ADDR` (skip discovery); uses only `report_progress`, `signal_completion`, `report_rate_limit`.
   - [MCP-ORK-001–007]: MUST call `signal_completion` before exit if `completion="mcp_tool_call"`; MUST write `.devs_output.json` with `{"success":<bool>}` if `completion="structured_output"`; exit within 10s of `devs:cancel\n` on stdin; MUST NOT modify env vars.

2. **Observing/Controlling Agent**: uses all tools + filesystem MCP.
   - [MCP-OBS-001–008]: Check for duplicate runs before submitting; MUST `cancel_run` abandoned runs; MUST use `stream_logs(follow:true)` not polling; read full stderr/structured before editing after failure; verify `write_workflow_definition` with `get_workflow_definition`; check `"error"` field before consuming `"result"`.

**Session lifecycle states:** Locating → Connected → Observing/Submitting → Streaming → Diagnosing → Editing → SessionComplete (also Interrupted → Persisting).
- [MCP-057] `devs-mcp-bridge`: 1 reconnect after 1s; exits code 1; writes `{"result":null,"error":"internal: server connection lost","fatal":true}`.
- [MCP-058] On `"failed_precondition: server is shutting down"`: write `task_state.json` before terminating.
- [MCP-059] Observation tools respond within 2s (WARN if exceeded).
- [MCP-BR-008] Session ID = UUIDv4, stable across Interrupted→re-Locating.
- [MCP-BR-009] MUST NOT transition Diagnosing→Editing until `get_stage_output` returns `error:null`.
- [MCP-BR-010] Before second+ `submit_run`: cancel any non-terminal run for same workflow.
- [MCP-BR-011] Write `task_state.json` before submitting and after each terminal state.
- [MCP-BR-012] Recovery: if `active_run_id` non-null, call `get_run` first.

**Key edge cases:**
- EC-MCP-001: Reads during write-lock → wait ≤~50ms.
- EC-MCP-002: `stream_logs follow:true` on completed stage → all buffered lines then `done:true`.
- EC-MCP-004: Concurrent `signal_completion` → exactly one transition (per-run mutex).
- EC-MCP-005: Body >1MiB → HTTP 413.
- EC-MCP-009: `write_workflow_definition` cycle → error, file unchanged.
- EC-MCP-015: `write_workflow_definition` while run active → run uses snapshot, new def for next submit.

---

## §2 MCP Servers & Tools

**Two required MCP servers:**
- [MCP-SRV-001] `devs` Glass-Box MCP: HTTP/JSON-RPC on `:7891` (default); or via `devs-mcp-bridge` stdio.
- [MCP-SRV-002] Filesystem MCP: stdio (`mcp-filesystem` or equivalent).

**17 MCP tools in 4 categories:**

- *Observation* [MCP-008–014]: `list_runs`, `get_run`, `get_stage_output`, `stream_logs`, `get_pool_state`, `get_workflow_definition`, `list_checkpoints`
- *Control* [MCP-015–019]: `submit_run`, `cancel_run`/`cancel_stage`, `pause_run`/`pause_stage`, `resume_run`/`resume_stage`, `write_workflow_definition`
- *Testing* [MCP-020–021]: `inject_stage_input` (Waiting/Eligible only), `assert_stage_output` (operators: `eq`, `ne`, `contains`, `not_contains`, `matches` (Rust regex), `json_path_eq`, `json_path_exists`, `json_path_not_exists`)
- *Mid-Run Agent (orchestrated only)* [MCP-022–024]: `report_progress`, `signal_completion`, `report_rate_limit`

**Filesystem MCP [MCP-025–027]:**
- Required ops: `read_file`, `write_file`, `list_directory`, `create_directory`, `delete_file`, `move_file`, `search_files` (glob, max 10k), `search_content` (Rust `regex`, default max 100 results).
- [MCP-BR-014] `target/` writes denied; [MCP-BR-017] `.devs/runs/` and `.devs/logs/` writes denied; [MCP-BR-015] path traversal outside workspace denied.
- `.devs/workflows/`, `.devs/prompts/`, `.devs/agent-state/` are agent-readable and writable.

**HTTP transport:**
- POST `/mcp/v1/call`; JSON-RPC 2.0; `Content-Type: application/json`; max 1 MiB; UTF-8.
- [MCP-060] `error:null` → `result` non-null; `error` non-null → `result:null`. Mutually exclusive.
- [MCP-061] HTTP codes: 200 all tool responses; 400 malformed; 404 wrong path; 405 non-POST; 413 >1MiB; 415 wrong content-type; 500 panic.
- Streaming (`stream_logs follow:true`): HTTP 200 chunked, newline-delimited JSON; `sequence` starts at 1, monotonically increasing, no gaps [MCP-062]; final chunk `{"done":true}` [MCP-063].
- Bridge: one request/response per line via stdio [MCP-064]; stream forwarded line-by-line [MCP-065].

**Key tool constraints:**
- `submit_run` validation (atomic, all-or-nothing): project active → workflow valid → not shutting down → required inputs present → type coercion → no extra keys → no duplicate run_name. Response: `{run_id, slug, workflow_name, project_id, status:"pending"}`.
- `cancel_run` [MCP-BR-020]: atomic; all non-terminal stages → Cancelled in single checkpoint write.
- `pause_run` [MCP-BR-021]: sends `devs:pause\n` to active agents; Eligible/Waiting stages held.
- `report_rate_limit`: 60s cooldown; `stage_requeued` if fallback available; attempt NOT incremented [MCP-077]; no fallback → stage Failed, `pool.exhausted` webhook fires [MCP-078].
- `signal_completion`: idempotent on first call only; subsequent calls → `failed_precondition` [MCP-075]; `output` must be JSON object [MCP-076].
- `inject_stage_input` [MCP-BR-029–030]: `exit_code:0`→Completed, non-zero→Failed; checkpoint committed immediately; structured output available via template vars.
- `assert_stage_output` [MCP-BR-033–036]: all assertions evaluated (no short-circuit); invalid regex → request error before evaluation; `actual_snippet` truncated to 256 chars.
- `list_runs` [MCP-BR-022]: sorted by `created_at` descending; no `stage_runs` embedded; default limit 100.
- `get_stage_output` [MCP-DBG-BR-007]: `stdout`/`stderr` always non-null strings; max 1 MiB each, truncated from beginning; `attempt` defaults to latest.

**State transitions:**
- WorkflowRun: Pending→Running (scheduler) → Paused (`pause_run`) → Running (`resume_run`) → Completed/Failed/Cancelled.
- StageRun: Waiting→Eligible→Running→Completed/Failed/TimedOut/Cancelled; Failed/TimedOut→Waiting on retry.
- [MCP-BR-019] Control tools MUST go through `StateMachine::transition()`; illegal transitions → `failed_precondition`.

**Concurrency model:**
- Lock acquisition order: `SchedulerState → PoolState → CheckpointStore` [MCP-BR-037].
- Observation tools: read locks only, fully parallel [MCP-BR-038]; control tools: write locks, serialize [MCP-BR-039].
- Max lock wait: 5s → `resource_exhausted: lock acquisition timed out after 5s` [MCP-BR-040].
- `stream_logs` MUST NOT hold SchedulerState lock; uses `tokio::sync::broadcast::Receiver` [MCP-BR-041].
- MCP server handles ≥64 concurrent connections [MCP-BR-042].
- Per-run mutex serializes `signal_completion` calls [MCP-BR-043]; `report_progress` is non-blocking append [MCP-BR-044].

---

## §3 Agentic Development Loops

**Primary TDD Loop (Red-Green-Refactor):**
- [MCP-028] Every test MUST have `// Covers: <REQ-ID>` before Red stage.
- [MCP-029] MUST verify test fails (exit 1) before writing implementation.
- [MCP-030] MUST run full `presubmit-check` after every Green stage.
- [MCP-080] Record `run_id` from `submit_run` before calling `stream_logs`; use `get_run` on disconnect.
- [MCP-081] MUST NOT poll `get_run` in tight loop; use `stream_logs follow:true`; polling only as fallback (min 1s, max 120 polls).
- [MCP-082] MUST call `assert_stage_output` on every `presubmit-check` stage individually; `run Completed` ≠ gates passed.

**Standard workflow definitions** (stored in `.devs/workflows/`):

| Workflow | Inputs | Timeout | Stages | Purpose |
|---|---|---|---|---|
| `tdd-red` | `test_name` (string), `prompt_file` (path) | 120s/stage | `check-test-fails` | Verify test fails before impl |
| `tdd-green` | `test_name`, `prompt_file` | 120s/stage | `check-test-passes` | Verify test passes after impl |
| `presubmit-check` | none | 900s | `format-check`→`clippy`→`test-and-traceability`→`coverage`; `doc-check` (parallel after `clippy`) | Full gate |
| `build-only` | none | 300s | `cargo-build` | Fast compile check |
| `unit-test-crate` | `crate_name` (string) | 300s | `cargo-test-crate` | Per-crate unit tests |
| `e2e-all` | none | 600s | `cargo-e2e` | Full E2E suite |

**Presubmit structured output contracts:**
- `test-and-traceability`: `{"success", "output": {"test_result", "test_count", "failed_count", "traceability": {"overall_passed", "traceability_pct", "uncovered_requirements":[]}}}`
- `coverage`: `{"success", "output": {"overall_passed", "gates": [{"gate_id":"QG-001..005", "threshold_pct", "actual_pct", "passed", "delta_pct"}]}}`

**Prompt file convention [MCP-079]:**
- First line: `<!-- devs-prompt: <name> -->`; optional `<!-- covers: REQ-ID -->`.
- Required files: `run-fmt-check.md`, `run-clippy.md`, `run-tests.md`, `run-coverage.md`, `run-doc-check.md`, `run-build.md`, `run-unit-test-crate.md`, `run-e2e.md`.
- Each must have: `# Task`, `# Exit Criteria`, `# Output Contract` (for structured_output stages).
- [MCP-090] Missing prompt file → stage Failed with `"prompt_file not found"`.

**Workflow input type coercion:**
- `string`: JSON string only. `path`: JSON string, normalized to forward-slash, NOT resolved at submission [MCP-092]. `integer`: JSON number or decimal string `"42"`. `boolean`: JSON bool or `"true"`/`"false"`; `"1"`/`"0"` rejected.

**Parallel implementation loop:**
- Submit each independent task as separate workflow run targeting isolated worktree/branch [MCP-032].
- [MCP-083] Conflict detection: `intersection(task_A.source_files, task_B.source_files)` non-empty → serialize B as dependent of A.
- [MCP-084] Max concurrent tasks = pool `max_concurrent`.
- [MCP-085] Check `get_pool_state` before batch submission; don't submit if all agents rate-limited.
- Branch naming: task=`devs-task/<session_id>-<task_id>`, integration=`devs-integrate/<session_id>`.
- Merge order: sequential, `git merge --no-ff`; conflicts resolved via filesystem MCP.

**Self-modification loop:**
- Safe while server running: `.devs/workflows/`, `.devs/prompts/`, `tests/`, `crates/*/src/`.
- Requires restart: any of `devs-server`, `devs-mcp`, `devs-grpc`, `devs-scheduler`, `devs-pool`, `devs-executor`, `devs-adapters`, `devs-checkpoint`.
- [MCP-086] Complete `build-only → unit-test-crate → e2e-all → presubmit-check` before instructing restart.
- [MCP-087] MUST NOT restart while any run in Running/Paused.
- [MCP-088] E2E tests for new tools MUST call via `POST /mcp/v1/call` using `DEVS_MCP_ADDR`, not internal Rust fn.
- [MCP-089] Nested E2E runs MUST use distinct `DEVS_DISCOVERY_FILE`; dedicated server instance, NOT dev server.
- [MCP-091] Orchestrated agents MUST read `.devs_context.json` for upstream outputs; MUST NOT call MCP server for this.

---

## §4 Debugging & Observability

**Failure classification [MCP-034]** — mandatory 4-step sequence before any code edit: `get_run` → `get_stage_output` → classify → respond.

| Category | Detection | Response |
|---|---|---|
| Compilation error | `stderr` contains `error[E` | Read source at indicated line; targeted edit |
| Test assertion failure | `stdout` contains `FAILED` + test name | Read test + impl; fix logic |
| Coverage gate failure | `structured.gates[*].passed == false` | Read `target/coverage/report.json`; add targeted tests |
| Clippy denial | `stderr` contains `error:` from clippy | Read file at indicated line; fix lint |
| Traceability failure | `structured.overall_passed == false` | Read `target/traceability.json`; add `// Covers:` annotations |
| Rate limit | stage Failed + `report_rate_limit` in logs | `get_pool_state`; wait for recovery |
| Process timeout | stage status `TimedOut` | Review for infinite loops; check last stderr |
| Disk full | checkpoint error in stderr | Alert operator; do NOT retry |

- [MCP-035] MUST NOT make speculative changes; read full stderr/stdout first.
- [MCP-036] MUST use `stream_logs follow:true` for active stages.
- [MCP-037] Record sequence number of first error during streaming.
- [MCP-039] For scheduler/pool failures: call `get_pool_state` first.
- [MCP-040] Each E2E test: unique `DEVS_DISCOVERY_FILE` path.
- [MCP-041] E2E state failures: read `.devs/runs/<run-id>/checkpoint.json` via filesystem MCP.
- [MCP-042] TUI failures: read `crates/devs-tui/tests/snapshots/<test_name>.txt.new` vs `.txt`; MUST NOT auto-approve.
- [MCP-043] Coverage gap: read `target/coverage/report.json` → gate → `target/coverage/lcov.info` → uncovered lines → write targeted tests.
- [MCP-044] MUST NOT add tests through private paths; E2E coverage requires actual interface boundaries.

**Log stream chunk schema:**
- Non-terminal: `{sequence, stream:"stdout"|"stderr", line (≤32KiB), timestamp (RFC3339), done:false}`
- Terminal: `{done:true, truncated:bool, total_lines:int}`
- [MCP-DBG-BR-001] Sequence: starts 1, no gaps.
- [MCP-DBG-BR-002] `from_sequence:N` → only chunks with sequence≥N.
- [MCP-DBG-BR-004] `follow:true` on Pending/Waiting/Eligible → holds connection; if never runs → `{done:true,truncated:false,total_lines:0}`.
- [MCP-DBG-BR-005] Stream resources released within 500ms of client disconnect.

**Structured error prefixes [MCP-045]:**
- `not_found:` → verify run_id/stage_name; `invalid_argument:` → fix inputs; `already_exists:` → use unique run_name; `failed_precondition:` → get_run for current state; `resource_exhausted:` → get_pool_state, wait; `internal:` → read server logs, report bug.

**Coverage report schema** (`target/coverage/report.json`):
- `schema_version:1`, `generated_at`, `overall_passed`, `gates[5]`; each gate: `gate_id` (QG-001..005), `scope`, `threshold_pct`, `actual_pct`, `passed`, `delta_pct`, `uncovered_lines`, `total_lines`.
- Gates: QG-001 unit all-crates (90%), QG-002 E2E aggregate (80%), QG-003 CLI E2E (50%), QG-004 TUI E2E (50%), QG-005 MCP E2E (50%).
- [MCP-DBG-BR-013] `./do coverage` exits non-zero when `overall_passed:false`.
- [MCP-DBG-BR-014] Unit test coverage does not count toward QG-003/004/005.

**Traceability schema** (`target/traceability.json`):
- `schema_version:1`, `generated_at`, `overall_passed`, `traceability_pct`, `requirements[]`, `stale_annotations[]`; each requirement: `id`, `source_file`, `covering_tests[]`, `covered:bool`.
- [MCP-DBG-BR-015] `./do test` exits non-zero when `overall_passed:false` even if all cargo tests pass.
- [MCP-DBG-BR-016] IDs scanned via `\[([0-9A-Z_a-z]+-[A-Z]+-[0-9]+)\]`; annotations via `// Covers: <id>`.
- [MCP-DBG-BR-017] Running stage: returns partial output, `exit_code:null`, `status:"running"` — not an error.

---

## §5 Context & Memory Management

**Context budget rules:**
- [MCP-046] Use `search_files`/`search_content` before reading files; no full crate loads.
- [MCP-047] Truncate stage output to minimum (first 50 diagnostic lines typical).
- [MCP-048] Maintain local run status summary; use `list_runs` for bulk status.
- Agent operating limits: `get_stage_output.stdout/stderr` max 50 diagnostic lines; filesystem reads max 200 lines from offset 0 without prior search; stop `stream_logs` at first actionable signal.
- [MCP-058] `truncated:true` = server truncated from beginning; primary diagnostic window = last 50 lines.
- [MCP-059] MUST NOT expand read window past entire file without confirming entity exists via search.

**Session recovery [MCP-049–050]:** Priority order: `list_runs(status=running)` → `get_run` for each → filesystem MCP partial edits → `git log` via workflow stage.
- [MCP-050] MUST NOT restart from scratch with in-flight runs; cancel unresumable first.
- [MCP-060] Before `cancel_run`: cross-reference `run_id` against `.devs/agent-state/` session files; MUST NOT cancel runs not created by this session.
- [MCP-061] After `cancel_run`: poll `get_run` every 500ms, max 30s, until `status=="cancelled"`.

**Workflow snapshot [MCP-051]:**
- Path: `.devs/runs/<run-id>/workflow_snapshot.json`; schema: `{schema_version:1, captured_at, run_id, definition: WorkflowDefinition}`.
- Immutable after Pending→Running; use this, NOT live definition, when debugging.
- [MCP-062] If snapshot absent: `list_checkpoints`; if 0 commits → `cancel_run` and resubmit; MUST NOT reconstruct from live definition.

**`task_state.json` schema [MCP-052]:**
- Written to `.devs/agent-state/<session-id>/task_state.json` atomically (tmp→rename) [MCP-065].
- Fields: `schema_version:1`, `session_id` (UUID4), `written_at` (RFC3339), `agent_tool` (`claude|gemini|opencode|qwen|copilot`), `completed_requirements[]`, `in_progress[{requirement, last_run_id, last_stage, attempt}]`, `blocked[{requirement, reason, depends_on[]}]`, `notes`.
- [MCP-064] Session ID = UUIDv4 from cryptographically random source; new per invocation.
- [MCP-066] Session files swept after `max_age_days` (default 30).

**Cross-session merge algorithm [MCP-053]:**
- Sort session files by `written_at` ascending; union `completed_requirements`; most-recent timestamp wins for `in_progress`.
- If `traceability.requirements[R].covered == true` → add to completed (overrides session files).
- [MCP-067] If no traceability file: submit `./do test` before any implementation work.

**Traceability as memory [MCP-055–056]:**
- `target/traceability.json` = authoritative completion checklist; `covered:false` = incomplete regardless of session files; `traceability_pct < 100.0` → task not complete.
- [MCP-070] `completed_requirements` + `covered:false` → NOT complete; traceability wins.
- [MCP-071] `covered:true` + absent from session files → add to merged completed set.
- [MCP-072] If `generated_at` >1 hour old: submit `./do test` before implementation.

**`.devs_context.json` schema [MCP-054]:**
- Written by `devs-executor` before each agent spawn; fields: `schema_version:1`, `run_id`, `run_slug`, `run_name`, `stage_name`, `inputs:{}`, `stages[{name, status:"completed", exit_code, stdout, stderr, structured_output, truncated}]`, `truncated`, `total_size_bytes`.
- Total size limit: 10 MiB (stdout/stderr trimmed proportionally if exceeded).
- `stages` = only Completed stages in transitive `depends_on` closure.
- [MCP-068] If `truncated:true` and dependency is critical → `signal_completion(success:false)` rather than proceeding.
- [MCP-069] Read-only for orchestrated agents; outputs go to `.devs_output.json` or stdout/stderr.
