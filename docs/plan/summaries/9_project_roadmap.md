# Summary: Project Roadmap (`devs`)

**Document ID:** 9_PROJECT_ROADMAP | **Status:** Authoritative

The `devs` project roadmap defines 6 sequential phases (35 weeks on critical path) governing a Rust AI agent workflow orchestrator from project foundation through MVP release. The single non-negotiable pivot is the **bootstrapping problem**: `devs` must self-host and run `./do presubmit` before agentic AI development can begin, making Phase 4 (Bootstrap) the most critical milestone.

---

## Strategic Objectives

- **SO-1 Self-Hosting:** `devs submit presubmit-check` completes on Linux/macOS/Windows before Phase 4 is declared complete.
- **SO-2 Quality Gates:** QG-001 ≥90% unit, QG-002 ≥80% E2E aggregate, QG-003 ≥50% CLI E2E, QG-004 ≥50% TUI E2E, QG-005 ≥50% MCP E2E — ALL must pass simultaneously; no gate may be waived.
- **SO-3 Security Baseline:** `devs security-check` reports `overall_passed: true` and `cargo audit --deny warnings` exits 0 on all 3 platforms before MVP.

---

## Non-Negotiable Constraints

| ID | Constraint |
|---|---|
| **[ROAD-CONS-001]** | No crate may have business logic authored until all direct dependencies have passed their Phase Transition Checkpoint (PTC). |
| **[ROAD-CONS-002]** | RISK-002, RISK-004, RISK-005, RISK-009 (score 9 each) MUST be mitigated before code is written for their affected components; mitigation = annotated test passing on all 3 CI platforms. |
| **[ROAD-CONS-003]** | `./do presubmit` MUST NOT exceed 900s wall-clock on any CI platform. |
| **[ROAD-CONS-004]** | All `// TODO: BOOTSTRAP-STUB` annotations MUST be resolved before Phase 5; `./do lint` exits non-zero if any remain. |
| **[ROAD-CONS-005]** | Glass-Box MCP server MUST be active from the first commit that binds ports — no feature flag may gate it. |
| **[ROAD-CONS-006]** | E2E tests MUST use actual interface boundaries: `assert_cmd` subprocess for CLI, `TestBackend` + full `handle_event→render` cycle for TUI, `POST /mcp/v1/call` for MCP. |

---

## Phase Summary

| Phase | ID | Gate Condition |
|---|---|---|
| Phase 0 — Project Foundation | **[ROAD-001]** | `./do presubmit` passes on all 3 platforms with stub workspace |
| Phase 1 — Core Domain & Infrastructure | **[ROAD-002]** | `devs-core`, `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, `devs-executor` at ≥90% unit coverage |
| Phase 2 — Workflow Engine | **[ROAD-003]** | `devs-scheduler` complete; DAG dispatch latency ≤100ms verified by test |
| Phase 3 — Server & Client Interfaces | **[ROAD-004]** | `devs-server` starts; all three clients connect; Bootstrap Phase conditions met |
| Phase 4 — Self-Hosting | **[ROAD-005]** | `devs submit presubmit-check` completes on all 3 platforms (COND-001/002/003) |
| Phase 5 — Quality Hardening & MVP | **[ROAD-006]** | All QG-001–005 pass; 100% traceability; security audit clean |

**Phases are not re-entrant.** Work in a later phase that reveals a Phase N deficiency is fixed within the current phase, not by re-opening Phase N.

---

## Authoritative Crate Dependency Order

```
devs-proto → devs-core → devs-config, devs-checkpoint, devs-adapters
                       → devs-pool → devs-executor → devs-scheduler
                                                   → devs-grpc, devs-mcp
                                                   → devs-server → devs-cli, devs-tui
                                                                 → devs-mcp-bridge
```

**Forbidden imports** (enforced by `cargo tree` in `./do lint`):
- `devs-core`: no `tokio`, `git2`, `reqwest`, `tonic`
- `devs-scheduler/executor/pool`: no `devs-proto` in public APIs
- `devs-tui/cli`: no engine-layer crates (`devs-scheduler`, `devs-pool`, etc.)
- `devs-mcp-bridge`: no `tonic`, `devs-proto`

**Parallel work windows:**
- Phase 1: `devs-config`, `devs-checkpoint`, `devs-adapters` may proceed in parallel (all depend only on `devs-core`); then serial sub-chain `devs-pool → devs-executor`
- Phase 3: `devs-grpc` ‖ `devs-mcp`; then `devs-cli` ‖ `devs-tui` ‖ `devs-mcp-bridge`
- **[ROAD-CONS-007]** Phase 5 E2E test authoring may begin in parallel with Phase 4 bootstrap validation.

---

## Phase Transition Checkpoint (PTC) Model

PTCs are committed to `docs/adr/<NNNN>-phase-<N>-complete.md` before any Phase N+1 code is written. Machine-verifiable via `target/traceability.json` `phase_gates` array.

**Key PTC schema fields:**
- `schema_version`: always `1`
- `phase_id`: `ROAD-00[0-6]`
- `completed_at`: RFC 3339 with ms precision, `Z` suffix
- `platforms_verified`: must include all 3 platforms for Phases 0, 4, 5
- `gate_conditions`: all entries must have `"verified": true`; empty array invalid
- `bootstrap_stubs_present`: `true` for Phases 0–3; MUST be `false` for Phase 5 PTC
- **[ROAD-BR-013]** PTC must be committed before any Phase N+1 business logic; `./do lint` validates
- **[ROAD-BR-014]** All 3 CI platforms required for Phases 0 and 4 PTCs; Phase 3 PTC requires all 3
- **[ROAD-BR-019]** `platforms_verified` must be confirmed by actual CI pipeline runs, not local testing

---

## Phase Gate Conditions (Key Verifiable Assertions)

### Phase 0 (PTC-0-001 through PTC-0-011)
- `./do presubmit` exits 0 on all 3 CI platforms
- `target/presubmit_timings.jsonl` exists; no step >20% over budget
- `cargo tree -p devs-core --edges normal` contains none of `tokio`, `git2`, `reqwest`, `tonic`
- RISK-005 and RISK-009 covering tests pass

### Phase 1 (PTC-1-001 through PTC-1-010)
- ≥90% line coverage for each of `devs-core`, `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, `devs-executor`
- RISK-002 covering test: `portable_pty` probe + `PTY_AVAILABLE` static flag on all 3 platforms
- RISK-004 covering test: all 5 adapter CLI flags as `const &str` in `config.rs`; `target/adapter-versions.json` generated

### Phase 2 (PTC-2-001 through PTC-2-005)
- `devs-scheduler` ≥90% unit coverage
- 2-stage DAG dispatched within 100ms (monotonic clock assertion)
- Pool fallback on rate-limit within one scheduling tick
- Cycle detection returns `{"error": "cycle detected", "cycle": ["A","B","A"]}` for 2-node cycle
- `devs-webhook` at-least-once delivery verified with `wiremock`

### Phase 3 (PTC-3-001 through PTC-3-006)
- `devs-server` binds gRPC `:7890` + MCP `:7891`; writes discovery file; exits 0 on SIGTERM; all 3 platforms
- `POST /mcp/v1/call` with `list_runs` returns HTTP 200 `{"result":{...},"error":null}`
- TUI starts, connects, renders Dashboard tab without panic
- `devs-mcp-bridge` forwards JSON-RPC from stdin to MCP server and returns response to stdout

### Phase 4 — Bootstrap Completion (PTC-4-001 through PTC-4-005)
- **COND-001:** `devs-server` binds both ports; discovery file written atomically; passes health check
- **COND-002:** `devs submit presubmit-check` exits 0 with valid `run_id` UUID4 on all 3 platforms
- **COND-003:** `presubmit-check` run reaches `status: "completed"` with all stages completed on all 3 platforms
- All 6 standard workflow TOMLs pass `devs validate-workflow`
- `docs/adr/<NNNN>-bootstrap-complete.md` committed with git SHA + CI pipeline URLs

### Phase 5 — MVP Release (PTC-5-001 through PTC-5-007)
- `./do coverage` `overall_passed: true` — all 5 QG gates simultaneously
- `traceability_pct == 100.0` and `stale_annotations` empty
- `devs security-check` exits 0; `cargo audit --deny warnings` exits 0 on all 3 platforms
- Zero `// TODO: BOOTSTRAP-STUB` annotations remain
- `target/risk_matrix_violations` empty
- `./do presubmit` exits 0 on all 3 CI platforms within 900 seconds

---

## Bootstrap Completion Protocol

**Pre-Bootstrap Checklist:**
1. All 6 standard workflow TOMLs committed and passing `devs validate-workflow`
2. `devs-server` starts clean on all 3 platforms (PTC-3-001 passing)
3. At least one agent pool with `tool = "claude"` and fallback configured in `devs.toml`
4. `DEVS_DISCOVERY_FILE` environment variable mechanism tested

**Bootstrap Execution Sequence:**
1. Start `devs-server` on Linux CI runner
2. Verify discovery file: `cat ~/.config/devs/server.addr`
3. `devs project add --path . --name devs-self`
4. `devs submit presubmit-check --project devs-self` → record `run_id`
5. `stream_logs follow:true` until run terminal
6. `devs status <run_id> --format json` → verify `status == "completed"`
7. Repeat steps 1–6 on macOS CI runner
8. Repeat steps 1–6 on Windows CI runner (Git Bash)
9. Commit `docs/adr/<NNNN>-bootstrap-complete.md` with all evidence

**Bootstrap Failure Protocol:**
1. `devs logs <run_id> <failed_stage>` — retrieve full stdout/stderr
2. Classify failure using MCP Design §4 table
3. Apply targeted fix only — no speculative refactoring
4. Re-run from step 4
5. If same stage fails 3 consecutive times, escalate to server `tracing` log on stderr

**[ROAD-CONS-008]** Bootstrap attempt MUST NOT be initiated until `./do presubmit` passes on Linux from Phase 0.

**Fallback FB-007:** If bootstrap exceeds 150% of planned Phase 4 duration, implement `./do run-workflow` serial shell script. FAR must be committed to `docs/adr/` before fallback is authored.

---

## Standard Workflow TOML Definitions

All 6 workflows in `.devs/workflows/`; must pass `devs validate-workflow`:

| Workflow | Purpose | Key Constraint |
|---|---|---|
| `tdd-red.toml` | Verify test fails before implementation | `check-test-fails` stage must exit 1 |
| `tdd-green.toml` | Verify test passes after implementation | stage must exit 0 |
| `presubmit-check.toml` | Full quality gate (format→lint→test→coverage) | 4 serial stages; total timeout 1560s |
| `build-only.toml` | Fast compile check | `cargo build --workspace`; 180s timeout |
| `unit-test-crate.toml` | Per-crate unit tests | Input: `crate_name`; 300s timeout |
| `e2e-all.toml` | Full E2E suite | 3 parallel stages (CLI/TUI/MCP); `LLVM_PROFILE_FILE` required |

---

## Critical Path Analysis

**Total project duration: 35 weeks.** Critical path: ROAD-007 → ROAD-009 → ROAD-010 → ROAD-013 → ROAD-014 → ROAD-015 → ROAD-016 → ROAD-018/019 → ROAD-020 → ROAD-022 → ROAD-024 → ROAD-025.

| Node | Duration | Float | Critical |
|---|---|---|---|
| ROAD-007 Workspace + CI | 1w | 0 | **YES** |
| ROAD-009 `devs-proto` | 2w | 0 | **YES** |
| ROAD-010 `devs-core` | 3w | 0 | **YES** |
| ROAD-011 `devs-config` | 2w | 6w | no |
| ROAD-012 `devs-checkpoint` | 2w | 6w | no |
| ROAD-013 `devs-adapters` | 3w | 0 | **YES** |
| ROAD-014 `devs-pool` | 2w | 0 | **YES** |
| ROAD-015 `devs-executor` | 3w | 0 | **YES** |
| ROAD-016 `devs-scheduler` | 4w | 0 | **YES** |
| ROAD-017 `devs-webhook` | 2w | 1w | no |
| ROAD-018 `devs-grpc` | 3w | 0 | **YES** |
| ROAD-019 `devs-mcp` | 3w | 0 | **YES** |
| ROAD-020 `devs-server` | 2w | 0 | **YES** |
| ROAD-021 `devs-cli` | 3w | 1w | no |
| ROAD-022 `devs-tui` | 4w | 0 | **YES** |
| ROAD-023 `devs-mcp-bridge` | 1w | 5w | no |
| ROAD-024 Bootstrap | 2w | 0 | **YES** |
| ROAD-025 MVP E2E + Gates | 6w | 0 | **YES** |

**Critical path rules:**
- **[ROAD-CRIT-001]** `devs-core` must reach ≥90% unit coverage before any Phase 1 crate begins implementation.
- **[ROAD-CRIT-002]** `devs-scheduler` must demonstrate ≤100ms dispatch latency in a benchmark test before `devs-grpc` begins.
- **[ROAD-CRIT-003]** Bootstrap (Phase 4) must be complete before Phase 5 E2E authoring begins.
- **[ROAD-CRIT-004]** Proto amendments during `devs-grpc` ‖ `devs-mcp` parallel work require both tracks to re-run `cargo build -p devs-proto`.
- **[ROAD-CRIT-005]** `devs-client-util` API must be fully defined before either `devs-cli` or `devs-tui` begins.
- **[ROAD-CRIT-006]** `devs-pool` must not begin agent selection implementation until `AgentAdapter` trait is finalized.
- **[ROAD-CRIT-009]** Severe/Critical slip (>1w) on ROAD-010, ROAD-016, or ROAD-024 triggers mandatory fallback evaluation; result committed to `docs/adr/` before work continues.
- **[ROAD-CRIT-011]** QG-001 failures during Phase 5 take priority over E2E test authoring.
- **[ROAD-CRIT-012]** Maximum 3 simultaneous active fallbacks; 4th slip → project `Blocked`, architecture review mandatory.

**Slippage thresholds:** Minor ≤0.5w (log); Moderate 0.5–1w (evaluate float); Severe 1–2w (activate fallback); Critical >2w (architecture review, scope reduction).

---

## Presubmit Timing Artifact (`PresubmitTimingEntry`)

Written incrementally to `target/presubmit_timings.jsonl`; one JSON line per step, flushed immediately.

| Field | Type | Description |
|---|---|---|
| `step` | string | `setup`, `lint`, `test`, `coverage`, `total` |
| `started_at` | RFC 3339 (ms, Z) | Wall-clock start |
| `duration_ms` | integer ≥0 | Elapsed ms |
| `budget_ms` | integer ≥1 | Expected budget |
| `over_budget` | boolean | `duration_ms > budget_ms × 1.2` |
| `exit_code` | integer | Step subprocess exit code |

**Step budgets (Linux):** `setup` 30,000ms; `lint` 140,000ms; `format` 10,000ms; `test` 180,000ms; `coverage` 300,000ms; **total hard limit 900,000ms** (kills all children via background timer subprocess).

- **[ROAD-BR-LF-001]** Over-budget step emits exactly one `WARN:` to stderr but does NOT fail presubmit.
- **[ROAD-BR-LF-002]** 900,000ms timeout enforced by separate background process (not `timeout` wrapper); `target/.presubmit_timer.pid` cleaned up on all exit paths.
- **[ROAD-BR-LF-003]** File written incrementally; hard-timeout kill still produces partial data.

---

## Key Business Rules (Cross-Phase)

| ID | Rule |
|---|---|
| **[ROAD-BR-016]** | `// TODO: BOOTSTRAP-STUB` only permitted in Phases 0–3; `./do lint` exits non-zero if any remain after Phase 3 PTC is committed. |
| **[ROAD-BR-017]** | Phase 5 NOT complete unless all 5 QG gates pass simultaneously in a single `./do coverage` invocation. |
| **[ROAD-BR-018]** | If FB-007 activated, `./do presubmit` MUST emit exactly one `WARN:` line containing `"Active fallback: FB-007"` until retired. |
| **[ROAD-BR-LF-006]** | `PoolExhausted` fires EXACTLY ONCE per exhaustion episode. |
| **[ROAD-BR-LF-007]** | Rate-limit cooldown stored as absolute `DateTime<Utc>` (`rate_limited_until`), not countdown. |
| **[ROAD-BR-LF-010]** | AI agent MUST NOT edit source files until `get_stage_output` returns `"error": null` for the failed stage. |
| **[ROAD-BR-LF-011]** | Before second `submit_run` for same workflow, agent MUST call `list_runs` to verify no non-terminal run exists. |
| **[ROAD-BR-LF-014]** | DAG eligibility re-evaluation MUST occur within one scheduler tick; max latency from `Completed` event to next `Eligible` dispatch ≤100ms. |
| **[ROAD-BR-LF-015]** | `WorkflowRun` terminal transition + all non-terminal `StageRun` → `Cancelled` must happen in ONE atomic checkpoint write. |
| **[ROAD-BR-LF-018]** | Template resolution is single-pass; substituted values are NEVER rescanned for `{{` delimiters. |
| **[ROAD-BR-LF-020]** | Lock acquisition order (`SchedulerState → PoolState → CheckpointStore`) must be respected in every multi-lock code path. |

---

## TDD Development Loop (Phase 5 Agentic Mode)

Mandatory Red-Green-Refactor cycle. Skipping Red phase is a business rule violation.

**Diagnostic sequence before any code edit (mandatory):**
1. `get_run(run_id)` — confirm Failed/TimedOut
2. `get_stage_output(run_id, stage_name)` — get stdout/stderr/structured
3. Classify: `compile | test | coverage | clippy | traceability | rate_limit | timeout | disk_full`
4. Apply ONE targeted fix based on classification — no speculative edits

**Failure classification patterns:**
- `error[E` in stderr → compilation error; fix type/borrow at indicated line
- `FAILED` + test name in stdout → test assertion failure; fix logic only
- `structured.gates[*].passed == false` → coverage gate; add targeted tests
- `^error:` from clippy → fix lint; no `#[allow]` without justification
- `stage.status == "timed_out"` → review stderr for infinite loop

---

## Phase Checkpoint Records (`target/traceability.json`, `target/coverage/report.json`)

**Traceability report fields:**
- `traceability_pct`: `(covered / total) × 100.0`, rounded to 1 decimal
- `overall_passed`: `traceability_pct == 100.0 AND stale_annotations is empty AND risk_matrix_violations is empty`
- `./do test` exits non-zero when `overall_passed == false`

**Coverage report fields:**
- `overall_passed`: logical AND of all 5 gate `passed` fields
- Each gate: `gate_id`, `threshold_pct`, `actual_pct`, `passed`, `delta_pct`, `uncovered_lines`, `total_lines`
- `./do coverage` exits non-zero when `overall_passed: false`

**`// llvm-cov:ignore` permitted only for:** platform-conditional code, unreachable infrastructure error paths, generated code in `devs-proto/src/gen/`. All exclusions listed in `target/coverage/excluded_lines.txt`.

---

## Risk-to-Phase Mapping (Critical Risks)

| Risk ID | Summary | Score | Must Mitigate By |
|---|---|---|---|
| **RISK-002** | PTY mode on Windows | 9 | Phase 1 checkpoint |
| **RISK-004** | Agent adapter CLI breakage | 9 | Phase 1 checkpoint |
| **RISK-005** | 15-min presubmit timeout | 9 | Phase 0 checkpoint |
| **RISK-009** | Bootstrapping deadlock | 9 | Phase 4 checkpoint |

- **[ROAD-RISK-001]** Any risk with score ≥6 MUST have a `// Covers: RISK-NNN` annotated automated test before the mitigation phase checkpoint passes.
- **[ROAD-RISK-002]** Critical risks (score 9) MUST be mitigated before any code in affected components is authored.

---

## Non-Goals Enforcement

| Non-Goal | Enforcement |
|---|---|
| No GUI | `cargo tree` must not find `egui`, `iced`, `gtk`, `qt`; `./do lint` exits non-zero |
| No REST API server | `cargo tree` must not find `axum`, `actix-web`, `warp`, `rocket` in production deps |
| No client authentication | `[auth]` in `devs.toml` → server startup failure before any port binds |
| No external secrets manager | `cargo tree` must not find `vaultrs`, `aws-config`, etc. |
| No automated triggers | `[triggers]` in `devs.toml` → server startup failure |

Any production dependency not in the TAS §2.2 authoritative version table causes `./do lint` to exit non-zero.

---

## `task_state.json` Schema (Agentic Loop)

Written atomically to `.devs/agent-state/task_state.json` before every `submit_run` and after each terminal run state.

Key constraints:
- `schema_version`: must equal `1`
- `status`: one of `pending | in_progress | blocked | completed | failed`
- `iteration`: incremented each time a new `submit_run` is issued for same task
- `last_updated`: agents must not start new work if >1 hour old and `status == "in_progress"` (another agent may be active)
- **[ROAD-BR-406]** Written atomically (write-to-temp → `rename()`)
- **[ROAD-BR-408]** Must use distinct `DEVS_DISCOVERY_FILE` path for every nested E2E test server instance

---

## Bootstrap Completion ADR Schema

Written to `docs/adr/NNNN-bootstrap-complete.md` with machine-parseable YAML frontmatter.

Required fields:
- `commit_sha`: 40-char hex of the commit that caused last CI platform to go green
- `ci_pipeline_url_linux/macos/windows`: all 3 required
- `conditions_verified`: entries for COND-001, COND-002 (with `run_id`), COND-003 (with `run_id`), each with `verified_at` timestamp
- **[ROAD-SCHEMA-010]** ADR MUST be committed in a separate commit from the implementation that caused COND-003 to pass
- **[ROAD-SCHEMA-011]** `commit_sha` must be SHA of the implementation commit, not the ADR commit

---

## Fallback Registry Schema (`docs/adr/fallback-registry.json`)

- `active_count`: must equal actual count of `status: "Active"` entries; mismatch → `./do presubmit` exits non-zero
- `active_count > 3` → `./do presubmit` exits non-zero with `"BLOCKED: maximum simultaneous fallbacks (3) exceeded"`
- `./do presubmit` emits exactly one `WARN:` per active fallback; zero warnings when `active_count == 0`
