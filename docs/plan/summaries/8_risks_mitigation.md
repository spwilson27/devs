# Summary: Risks and Mitigation (`8_RISKS_MITIGATION`)

This document defines 25 tracked risks across Technical, Operational, and Market categories, with full mitigation plans, fallback procedures, and automated enforcement rules. All risks with severity ≥ 6 require automated test coverage (`// Covers: RISK-NNN`); 4 critical risks (score 9: RISK-002, RISK-004, RISK-005, RISK-009) must be mitigated before their affected components are written.

---

## Risk Assessment Matrix (Abridged)

Severity = Impact × Probability (HIGH=3, MEDIUM=2, LOW=1). Score ≥ 6 = active monitoring required. Score = 9 = Critical Priority (must mitigate before writing any affected code).

| Risk ID | Summary | Score | MIT | FB |
|---|---|---|---|---|
| RISK-001 | DAG scheduler race conditions (concurrent stage completions) | 6 | MIT-001 | — |
| RISK-002 | PTY mode incompatibility on Windows Git Bash | **9** | MIT-002 | FB-002 |
| RISK-003 | Git checkpoint corruption (disk-full / crash) | 6 | MIT-003 | FB-005 |
| RISK-004 | Agent adapter CLI interface breakage from upstream | **9** | MIT-004 | FB-010 |
| RISK-005 | 15-min presubmit timeout exceeded (Rust compile times) | **9** | MIT-005 | FB-001 |
| RISK-006 | 90%/80%/50% coverage gates unachievable in MVP timeline | 6 | MIT-006 | — |
| RISK-007 | Template injection via attacker-controlled stage output | 3 | MIT-007 | — |
| RISK-008 | Docker/SSH E2E setup complexity blocks E2E testing | 6 | MIT-008 | FB-003 |
| RISK-009 | Bootstrapping deadlock — `devs` cannot develop itself yet | **9** | MIT-009 | FB-007 |
| RISK-010 | AI agent rate limits stall development velocity | 6 | MIT-010 | FB-004 |
| RISK-011 | E2E isolation failures from shared discovery files | 4 | MIT-011 | — |
| RISK-012 | Cross-platform divergence (macOS/Windows) in `./do` + file modes | 6 | MIT-012 | FB-008 |
| RISK-013 | 100% traceability gate creates annotation maintenance burden | 6 | MIT-013 | — |
| RISK-014 | Webhook SSRF DNS-rebinding window remains open | 2 | MIT-014 | — |
| RISK-015 | Glass-Box MCP exposes full state on non-loopback deploys | 6 | MIT-015 | FB-009 |
| RISK-016 | Single developer, no code review → blind spots | 6 | MIT-016 | — |
| RISK-017 | Agent CLI ecosystem consolidation makes multi-adapter obsolete | 4 | MIT-017 | FB-010 |
| RISK-018 | Competitors absorb AI workflow niche | 4 | MIT-018 | — |
| RISK-019 | Rust-only workflow authoring barriers adoption | 6 | MIT-019 | — |
| RISK-020 | gRPC adds friction for web-based integrations | 1 | MIT-020 | — |
| RISK-021 | Fan-out sub-agent resource exhaustion / pool starvation | 6 | MIT-021 | — |
| RISK-022 | MCP stdio bridge connection loss → irrecoverable agent state | 4 | MIT-022 | — |
| RISK-023 | `cargo-llvm-cov` inaccurate E2E coverage measurement | 2 | MIT-023 | — |
| RISK-024 | GitLab CI unavailability blocks all forward progress | 3 | MIT-024 | FB-006 |
| RISK-025 | Workflow snapshot immutability violated by concurrent writes | 3 | MIT-025 | — |

---

## Risk Data Model & Business Rules

**Risk record schema** (`schema_version: 1`): fields `risk_id` (RISK-[0-9]{3}), `mitigation_id` (MIT-[0-9]{3}), `fallback_id` (FB-[0-9]{3}|null), `severity_score` (int), `status` (Open|Mitigated|Accepted|Retired), `covering_tests` (array).

**Fallback Activation Record (FAR)**: written to `docs/adr/NNNN-fallback-<name>.md` before implementing fallback. Fields: `fallback_id`, `risk_id`, `activated_at`, `trigger_evidence`, `fallback_action`, `expected_retirement_sprint`, `resolution_plan`, `retired_at`.

**Key business rules:**
- **[RISK-BR-001]** Every RISK-NNN must have a corresponding MIT-NNN section.
- **[RISK-BR-002]** Risks with score ≥ 6 must have `// Covers: RISK-NNN` test annotation.
- **[RISK-BR-003]** New risks must be added before work begins on affected component.
- **[RISK-BR-004]** Risk may not be `Retired` until covering tests pass.
- **[RISK-BR-005]** FAR must be committed to `docs/adr/` before implementing fallback.
- **[RISK-BR-006]** `Mitigated` → `Open` when covering test regresses; `target/traceability.json` is authoritative.
- **[RISK-BR-010]** Tech/Operational risks with score ≥ 6 require automated test before merge to `main`.
- **[RISK-BR-014]** Every monitoring mechanism must be implemented before the monitored component is declared ready.
- **[RISK-BR-019]** `./do test` must exit non-zero when `risk_matrix_violations` is non-empty.

**`target/traceability.json`** includes `risk_matrix_violations` array with types: `stale_annotation`, `duplicate_id`, `missing_mitigation`, `missing_covering_test`.

**Lifecycle states:** Open → Mitigated → Retired (or Open → Accepted → Retired). Regression reverts Mitigated → Open.

---

## Critical Risk Interdependencies

```
RISK-005 (compile timeout) → depends-on → RISK-009 (bootstrapping)
RISK-004 (adapter breakage) → amplifies → RISK-009
RISK-005 → depends-on → RISK-006 (coverage gates)
RISK-001 (scheduler races) → amplifies → RISK-003 (checkpoint corruption)
RISK-008 (Docker E2E) → amplifies → RISK-006
RISK-015 (MCP exposure) → amplifies → RISK-007 (template injection)
RISK-021 (fan-out starvation) → amplifies → RISK-010 (rate limits)
RISK-011 (E2E isolation) → amplifies → RISK-001
```

**[RISK-BR-017]** When a primary risk triggers, all risks that list it as dependency must be assessed for compound activation.

---

## Technical Risk Mitigations

### RISK-001 / MIT-001 — DAG Scheduler Race Conditions
- Per-run `Arc<tokio::sync::Mutex<RunState>>` serializes all state transitions.
- `StateMachine::transition()` returns `TransitionError::IllegalTransition` for duplicate terminal events (silent discard at DEBUG).
- Lock acquisition order: `SchedulerState → PoolState → CheckpointStore` (compile-time lint concern).
- DAG eligibility evaluation must occur within the same mutex lock as the preceding `stage_complete` transition.
- Only `Completed` (not `Failed`, `TimedOut`, `Cancelled`) satisfies `depends_on`; failed deps cascade `Cancelled` to all downstream `Waiting` stages atomically.
- **[AC-RISK-001-01]** 100 concurrent completions → exactly 1 checkpoint write.

### RISK-002 / MIT-002 — PTY Mode on Windows
- Platform capability probe at startup via `portable_pty::native_pty_system().openpty()`; stores result in `static AtomicBool PTY_AVAILABLE`. Performed once via `spawn_blocking`.
- When `PTY_AVAILABLE=false` and adapter defaults `pty=true`: emit `WARN` with `event_type: "adapter.pty_fallback"` per stage dispatch; spawn without PTY.
- Stage explicitly configured `pty=true` on PTY-unavailable platform → `Failed` with `failure_reason: "pty_unavailable"`, no auto-retry.
- `get_pool_state` includes `"pty_active": bool` per agent.
- **[AC-RISK-002-03]** `presubmit-windows` CI passes without PTY-related failures.

### RISK-003 / MIT-003 — Git Checkpoint Corruption
- Atomic write protocol: `serialize → write .tmp → fsync → rename()`. Only `rename()` is the commit point.
- On any failure before `rename()`: delete `.tmp`, log `ERROR` with `event_type: "checkpoint.write_failed"`.
- `load_all_runs` scans for orphaned `checkpoint.json.tmp`, deletes with `WARN`.
- Disk-full (`ENOSPC`): log ERROR, continue; server must NOT crash.
- `git2` push failures are non-fatal (local file is authoritative); logged as `WARN` with `event_type: "checkpoint.push_failed"`.
- `validate_checkpoint()` checks `schema_version==1`; depth limited to 128; failure → run marked `Unrecoverable`.

### RISK-004 / MIT-004 — Agent Adapter CLI Breakage
- 5 adapters (`claude`, `gemini`, `opencode`, `qwen`, `copilot`) with compatibility tests in `devs-adapters/tests/<name>_compatibility_test.rs`.
- CLI flags defined as `const &str` in `devs-adapters/src/<name>/config.rs`; inline literals prohibited (enforced by `./do lint`).
- `target/adapter-versions.json`: must exist, `captured_at` within 7 days; `./do lint` fails if absent/stale.
- `AgentAdapter` trait: `tool()`, `build_command(ctx, pty_supported)`, `detect_rate_limit(exit_code, stderr)`, `default_prompt_mode()`, `default_pty()`.
- `detect_rate_limit()` must return `false` when `exit_code==0` regardless of stderr.
- Rate-limit patterns (case-insensitive substring, stderr only): `claude`→"rate limit","429","overloaded"; `gemini`→"quota","429","resource_exhausted"; `opencode`→"rate limit","429"; `qwen`→"rate limit","429","throttle"; `copilot`→"rate limit","429".

### RISK-005 / MIT-005 — 15-Minute Presubmit Timeout
- Per-step timing logged to `target/presubmit_timings.jsonl` (one JSON object per step, flushed immediately).
- Schema: `{"step":"<name>","started_at":"...","duration_ms":<int>,"budget_ms":<int>,"over_budget":<bool>}`.
- Hard 900-second wall-clock timeout via background timer subprocess; PID written to `target/.presubmit_timer.pid`. On expiry: SIGTERM → 5s grace → SIGKILL → exit non-zero.
- Step over-budget by >20% → `WARN` to stderr + `over_budget: true` in jsonl; does NOT fail presubmit.
- Timer must be killed on successful exit; leaked timers must not terminate subsequent runs.
- Budget targets (Linux): setup≤30s, fmt≤10s, clippy≤120s, doc≤60s, test≤180s, llvm-cov≤300s (total ~700s).
- **[RISK-BR-015]** `target/presubmit_timings.jsonl` must be committed as CI artifact with `expire_in: 7 days`.

### RISK-006 / MIT-006 — Coverage Gates
- Gates: QG-001 (unit ≥90%), QG-002 (E2E aggregate ≥80%), QG-003 (CLI E2E ≥50%), QG-004 (TUI E2E ≥50%), QG-005 (MCP E2E ≥50%).
- Interface gates (QG-003/004/005) require tests at the interface boundary: `assert_cmd` subprocess, `TestBackend` full `handle_event→render`, `POST /mcp/v1/call`.
- `// llvm-cov:ignore` only for platform conditionals, unreachable infra error paths, generated code. All exclusions in `target/coverage/excluded_lines.txt`.
- `target/coverage/report.json` has 5 gate entries with `gate_id`, `threshold_pct`, `actual_pct`, `passed`, `delta_pct`, `uncovered_lines`.

### RISK-007 / MIT-007 — Template Injection
- **[SEC-040]** Single-pass expansion: scan pointer advances to `end + 2` (past `}}`), never back to beginning of substituted value. Substituted content is never re-scanned.
- **[SEC-042]** stdout/stderr truncated to 10,240 bytes (last 10,240 bytes) in template context, before passing to `TemplateContext`.
- **[SEC-043]** Only scalar JSON values (string, number, bool, null) injectable; object/array → `TemplateError::NonScalarField`.
- **[AC-RISK-007-01]** Stage A stdout = `"{{stage.B.stdout}}"` → resolved as literal string in next prompt (not B's output).

### RISK-008 / MIT-008 — Docker/SSH E2E Complexity
- `StageExecutor` trait: `prepare()`, `collect_artifacts()`, `cleanup()`.
- Docker E2E: `bollard` crate + Docker-in-Docker on `presubmit-linux` only (`DOCKER_HOST=tcp://docker:2375`).
- SSH E2E: localhost + `~/.ssh/devs_test_key` (ed25519) provisioned by `./do setup`; `authorized_keys` entry with `command="/bin/sh"`.
- Tags: `#[cfg_attr(not(feature = "e2e_docker"), ignore)]`, `#[cfg_attr(not(feature = "e2e_ssh"), ignore)]`.
- `cleanup()` must complete regardless of stage outcome; failures logged at `WARN` with `event_type: "executor.cleanup_failed"`, never propagated.

### RISK-014 / MIT-014 — Webhook SSRF DNS-Rebinding
- `check_ssrf()` called immediately before every delivery attempt (re-resolves DNS, no caching).
- Blocked ranges: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `0.0.0.0/8`, `::1/128`, `fc00::/7`, `fe80::/10`.
- ALL resolved IPs must pass; any blocked IP → permanent delivery failure (no retry).
- `reqwest` `.connect_timeout(500ms)` minimizes rebinding window.
- `devs security-check` reports `SEC-WEBHOOK-TLS` as `warn` documenting residual DNS-rebinding risk.
- Post-MVP: custom connector to bind socket to resolved IP after validation.

### RISK-015 / MIT-015 — Glass-Box MCP State Exposure
- Default bind: `127.0.0.1` for both gRPC and MCP.
- Non-loopback bind → `WARN` at startup: `event_type: "security.misconfiguration"`, `check_id: "SEC-BIND-ADDR"`.
- Non-loopback without TLS cert → server starts with `WARN` log (`check_id: "SEC-TLS-MISSING"`); plaintext is allowed but flagged as insecure.
- `Redacted<T>` serializes as `"[REDACTED]"` (exact 13-char literal) in all contexts.
- All MCP responses include: `X-Content-Type-Options: nosniff`, `Cache-Control: no-store`, `X-Frame-Options: DENY`.
- Agent stdout/stderr is NOT redacted (accepted MVP risk per `[SEC-013]`).

### RISK-021 / MIT-021 — Fan-Out Pool Starvation
- `Arc<tokio::sync::Semaphore>` enforces `max_concurrent` as hard cap across all projects.
- Fan-out sub-agents compete for permits on equal footing with all other stages (no bypass).
- Sub-agent `StageRun` records in parent's `fan_out_sub_runs` field, NOT in top-level `stage_runs`.
- Stage counts (`stage_count`, `completed_stage_count`, etc.) exclude sub-agents.
- Default merge handler: parent `Failed` if ANY sub-agent fails; `structured.failed_indices: [N, ...]`.
- `pool.max_concurrent = 0` rejected at config validation.
- **[AC-RISK-021-01]** Fan-out count=64, max_concurrent=4 → `active_count==4`, `queued_count==60`.

### RISK-022 / MIT-022 — MCP Bridge Connection Loss
- On HTTP error: exactly **one** reconnect after 1-second wait (`[MCP-057]`).
- On reconnect failure: write `{"result":null,"error":"server_unreachable: ...","fatal":true}` to stdout, exit code 1.
- Invalid JSON on stdin → JSON-RPC `-32700` error to stdout; bridge continues (does NOT exit).
- Bridge creates zero TCP listeners (stdin-to-HTTP proxy only).
- Fallback: if agent exits without `signal_completion`, exit code determines outcome (not hang).

### RISK-023 / MIT-023 — `cargo-llvm-cov` Coverage Accuracy
- All E2E subprocess tests set `LLVM_PROFILE_FILE=/tmp/devs-coverage-%p.profraw` (`%p` = PID suffix, mandatory).
- TUI E2E uses `TestBackend` in-process; no subprocess spawn.
- `./do coverage` fails with descriptive error if zero `.profraw` files found for E2E runs.
- Coverage attribution: unit `#[test]` → QG-001 only; `assert_cmd` subprocess → QG-002/003; `TestBackend` → QG-002/004; `POST /mcp/v1/call` → QG-002/005.

### RISK-025 / MIT-025 — Snapshot Immutability
- `definition_snapshot` is an owned deep-clone of `WorkflowDefinition` captured under per-project mutex at `submit_run` time. No `Arc` pointers to live map.
- `workflow_snapshot.json` is write-once; persist layer returns `Err(SnapshotError::AlreadyExists)` if file exists (caller treats as idempotency confirmation).
- `write_workflow_definition` updates only the live map; must NOT touch any existing `workflow_snapshot.json`.
- Duplicate run name check and snapshot write must occur in same mutex lock acquisition.

---

## Operational Risk Mitigations

### RISK-009 / MIT-009 — Bootstrapping Deadlock
Bootstrap Phase ends when all three conditions met on all 3 CI platforms simultaneously:
- `COND-001`: `devs-server` binds gRPC (`:7890`) and MCP (`:7891`) on Linux/macOS/Windows.
- `COND-002`: `devs submit presubmit-check` exits 0 with `run_id` JSON.
- `COND-003`: `presubmit-check` run reaches `Completed` with all stages `Completed`.

**Dependency order:** `devs-proto → devs-core → {devs-config, devs-checkpoint, devs-adapters, devs-pool, devs-executor} → devs-scheduler → {devs-grpc, devs-mcp} → devs-server → {devs-cli, devs-tui}`.

**Rules:**
- Time-boxed at 150% of planned duration → FB-007 activates.
- `./do presubmit` on Linux must pass per crate before moving to next in dependency order.
- Stubs allowed during Bootstrap Phase: `unimplemented!()` annotated `// TODO: BOOTSTRAP-STUB`. After Bootstrap Complete, `./do lint` exits non-zero if any remain.
- 6 standard workflow TOMLs committed and pass `devs validate-workflow` before `SelfHostingAttempt`.
- Failures diagnosed with `get_stage_output` + `stream_logs` before any code changes.
- Milestone recorded in `docs/adr/NNNN-bootstrap-complete.md` (commit SHA, CI pipeline URL, all 3 conditions).

### RISK-010 / MIT-010 — AI Rate Limits Stalling Development
- Primary pool: `claude` + fallback `gemini` + fallback `opencode` (different API providers).
- `report_rate_limit` MCP call triggers immediate fallback, does NOT increment `StageRun.attempt`.
- 60-second cooldown stored as absolute `rate_limited_until: DateTime<Utc>`; not reset by additional events during cooldown.
- `pool.exhausted` webhook fires at most once per exhaustion episode (episode ends when ≥1 agent available).
- Pool config with all agents from same provider → startup rejection: `"no provider diversity"`.
- Re-queued stage retains original `required_capabilities` and `depends_on`; returns to `Eligible`.

**Fallback selection algorithm:** mark agent rate-limited → re-evaluate eligible agents (filter by capability, exclude rate-limited, prefer non-fallback, use fallback if necessary) → if none: `pool.exhausted` webhook + queue on semaphore.

### RISK-011 / MIT-011 — E2E Test Isolation
- Every E2E test uses `tempfile::TempDir::new()` for unique temp directory; discovery file path derived from it.
- `devs_test_helper::start_server(TestServerConfig { temp_dir: TempDir, .. })` is the mandatory API; direct `Command::new("devs-server")` in test code → `./do lint` exits non-zero.
- E2E test binaries: `test-threads = 1` in `.cargo/config.toml`.
- `ServerHandle::drop()` sends SIGTERM, waits ≤10s, sends SIGKILL; does not return until process exited.

### RISK-012 / MIT-012 — Cross-Platform Divergence
- All `fs::set_permissions()` calls go through `devs_persist::permissions::set_secure_file()` / `set_secure_dir()`. Direct calls outside `devs-checkpoint/src/permissions.rs` → `./do lint` exits non-zero.
- Windows: `set_secure_file()` logs `WARN` with `event_type: "security.misconfiguration"`, `check_id: "SEC-FILE-PERM-WINDOWS"`.
- All paths in gRPC/MCP/checkpoint use `normalize_path_display()` (forward slashes). Raw `PathBuf::display()` in serialized output prohibited.
- `./do` validated by `shellcheck --shell=sh ./do` in `./do lint`. Prohibited syntax: `[[`, `local`, `declare`, bash arrays. Permitted: `$(...)`, `$((...))`.
- `dirs::home_dir()` and `dirs::config_dir()` used; `std::env::var("HOME")` prohibited.
- `devs security-check` reports `SEC-FILE-PERM-WINDOWS` as `warn` on Windows.

### RISK-013 / MIT-013 — Traceability Maintenance Burden
- Scanner: Pass 1 collects `[ID-NNN]` patterns from `docs/plan/specs/*.md`; Pass 2 collects `// Covers: <id>` from all `*.rs` test files. Cross-reference produces `traceability.json`.
- `./do test` exits non-zero when `traceability_pct < 100.0` OR `stale_annotations` non-empty.
- "Two-together" convention: new requirement IDs added only in same commit that adds covering test.
- Multiple IDs on one line: `// Covers: ID-001, ID-002` (comma-space delimited).

### RISK-016 / MIT-016 — Single Developer No Code Review
- After each crate: `code-review` workflow dispatches a different agent (cross-agent policy in `.devs/workflows/code-review.toml` via `review-pool`).
- `critical_findings > 0` → workflow branches to `halt-for-remediation` (not `Completed`).
- `cargo clippy --workspace --all-targets -- -D warnings -W clippy::pedantic` on every commit.
- Security-critical crates requiring `critical_findings: 0` + `high_findings: 0` before MVP: `devs-mcp`, `devs-adapters`, `devs-checkpoint`, `devs-core` (template resolution).
- Every crate needs an ADR in `docs/adr/` committed in the same PR.
- Review results saved to `docs/reviews/<crate-name>-<date>.json`.

### RISK-024 / MIT-024 — GitLab CI Unavailability
- `.gitlab-ci.yml` structure: 3 parallel presubmit jobs (linux, macos, windows) + `cargo-audit` stage. All have `timeout: 25 minutes`, artifacts with `expire_in: 7 days`, `when: always`.
- `./do ci`: validates yaml → checks GitLab API reachability (10s timeout) → pushes temp branch → triggers pipeline → polls every 30s up to 30 min → downloads artifacts → deletes temp branch. Temp branch always deleted even on timeout/failure.
- `./do lint` validates `.gitlab-ci.yml` with `yamllint` on every invocation.
- Local `./do presubmit` on Linux is development gate; GitLab CI is merge gate only.

---

## Market Risk Mitigations

### RISK-017 / MIT-017 — Adapter Ecosystem Consolidation
- `AgentAdapter` trait isolates all adapter changes to `devs-adapters` crate. Changes never touch scheduler/pool/executor.
- Capability tags (`capabilities = ["code-gen"]`) route stages independent of adapter name.
- `docs/adapter-compatibility.md` is authoritative: 5 MVP adapter entries, machine-parseable YAML frontmatter, `last_tested_date` must be ≤90 days old (lint `WARN` if stale).
- Adapter lifecycle: `Active → Deprecated → Unsupported`. `Deprecated` adapter: pool still routes work, emits `WARN` at init. `Unsupported` adapter: server rejects config before binding ports.
- `[MIT-017-BR-004]` Deprecated adapter past `removal_target` → `./do lint` exits non-zero.

### RISK-018 / MIT-018 — Competitor Pressure
- Glass-Box MCP server must be active and responding from first server-startable commit. No feature flags or env vars may gate it.
- MVP scope is fixed; Non-Goals list in PRD governs. No REST API, web UI, client auth, automated triggers, K8s executor at MVP.
- Self-hosting milestone must be reached before external user outreach.
- `./do presubmit` 15-minute hard timeout is a scope boundary, not a CI config problem.
- Post-MVP embeddable library path: `devs-lib` → crates.io, `devs-lib-py` (pyo3) → PyPI. pyo3 and Dagger SDK absent from MVP `Cargo.toml`.

### RISK-019 / MIT-019 — Rust Builder API Adoption Barrier
- Built-in TOML predicates cover ≥90% of branching without Rust: `exit_code`, `stdout_contains`, `output_field`.
- Predicate evaluation: first-match, definition order. No-match → `WorkflowRun` `Failed`.
- `exit_code = "*"` wildcard must be last predicate; empty predicate list rejected at validation.
- `branch.handler` and `branch.predicates` are mutually exclusive.
- `output_field` predicate with `completion = "exit_code"` rejected at validation.
- Missing field path in `output_field` evaluates to `false` (not error).
- `devs validate-workflow <path>` exits 0 (valid) or 4 (invalid), collects all errors before reporting.
- 6 standard workflow TOMLs in `.devs/workflows/`: `tdd-red`, `tdd-green`, `presubmit-check`, `build-only`, `unit-test-crate`, `e2e-all` — all use built-in features only.

### RISK-020 / MIT-020 — gRPC Transport Friction
- MCP HTTP (`POST /mcp/v1/call`): standard HTTP/1.1 JSON-RPC 2.0; no gRPC library required.
- `DEVS_MCP_PORT` env var overrides config and default (7891). Precedence: CLI flag > env var > `devs.toml` > 7891.
- Outbound webhooks provide push-based integration without gRPC.
- No web framework crates (`actix-web`, `axum`, `warp`) in production deps; MCP uses `hyper` as low-level transport only.
- gRPC handlers are thin adapters (≤25 lines); all business logic in engine layer.

---

## Contingency Fallbacks

| FB | Trigger | Action | Pre-Approved |
|---|---|---|---|
| FB-001 | Presubmit >15 min on any platform (3 consecutive runs) | Split into `presubmit-fast` (≤8min) + `presubmit-full` (≤25min CI) | Requires PRD amendment |
| FB-002 | PTY unavailable on Windows | `#[cfg(windows)]` disables PTY; `pty_available: false` in pool state | Yes |
| FB-003 | Docker/SSH E2E unreliable ≥2 consecutive CI runs | `#[ignore]` tests; lower QG-002 from 80% to 77% | Yes |
| FB-004 | All agents simultaneously rate-limited | `devs pause` all runs; monitor `rate_limited_until`; resume after cooldown | Yes |
| FB-005 | Git checkpoint data loss ≥2 times in 7 days | Switch to append-only JSONL per run | Requires architecture review |
| FB-006 | GitLab CI unavailable >24 hours | Linux-only `./do presubmit` as provisional merge gate | Yes |
| FB-007 | Bootstrap Phase exceeds 150% of planned duration | `./do run-workflow` serial shell script for workflow execution | Yes |
| FB-008 | Windows file permissions not enforced | Log `WARN` per file; `devs security-check` reports `SEC-FILE-PERM-WINDOWS` as `warn` | Yes |
| FB-009 | Glass-Box MCP on non-loopback without post-MVP auth | `[server] mcp_require_token = "<hex>"` config; MCP rejects missing Bearer token with HTTP 401 | Yes |
| FB-010 | Agent CLI discontinued by upstream | Shell wrapper translation layer; `command` override field in pool agent config | Yes |

**Fallback Activation Protocol (strict order):**
1. Detect trigger with quantitative metric, timestamp, measurement source.
2. Check `active_count < 3` in `fallback-registry.json`.
3. Verify pre-approval (check §5.1 for PRD amendment/architecture review requirements).
4. Write FAR: `docs/adr/<NNNN>-fallback-<fb-id>.md` with full frontmatter.
5. Commit FAR only (separate commit from implementation).
6. Implement fallback (separate commit).
7. Update FAR with `commit_sha`.
8. Update `fallback-registry.json`.
9. Monitor effectiveness.
10. Plan retirement.

**[FB-BR-001]** FAR commit must precede implementation commit. Combined commit → `./do lint` exits non-zero.
**[FB-BR-004]** Max 3 simultaneous active fallbacks. 4th trigger → `Blocked` state, architecture review required.
**[FB-BR-005]** `./do presubmit` emits one `WARN:` per Active fallback.

**`fallback-registry.json`** (`docs/adr/`): machine-generated, `active_count` must match count of `"Active"` entries. `./do presubmit` exits non-zero if: `active_count` mismatch, missing `adr_path` files, duplicate active IDs, `active_count > 3`.

---

## Risk Management Framework Acceptance Criteria

- **[AC-RISK-MATRIX-001]** `./do test` generates `target/traceability.json` with empty `risk_matrix_violations` when matrix is correct.
- **[AC-RISK-MATRIX-002]** Every RISK-NNN has a MIT-NNN section; missing → `./do test` exits non-zero.
- **[AC-RISK-MATRIX-003]** Every score ≥ 6 risk has `// Covers: RISK-NNN` test (unless `Accepted`).
- **[AC-RISK-MATRIX-004]** `./do lint` recomputes severity scores; exits non-zero on mismatch.
- **[AC-RISK-MATRIX-005]** Duplicate risk IDs → `./do test` exits non-zero.
- **[AC-RISK-MATRIX-006]** Every referenced FB-NNN has a definition in §5.
- **[AC-FB-001]** `./do presubmit` exits non-zero when `active_count` ≠ count of Active entries.
- **[AC-FB-003]** `./do presubmit` stdout has exactly one WARN per Active fallback; zero WARNs when `active_count==0`.
- **[AC-FB-004]** `./do presubmit` exits non-zero when `active_count > 3`.
