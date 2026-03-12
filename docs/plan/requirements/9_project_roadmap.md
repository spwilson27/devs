# Project Roadmap Requirements

### **[9_PROJECT_ROADMAP-REQ-001]** 1. Self-Hosting (SO-1):  The `devs` server must be able to s
- **Type:** Functional
- **Description:** 1. Self-Hosting (SO-1):  The `devs` server must be able to submit and successfully complete a `presubmit-check` workflow run on all three CI platforms (Linux, macOS, Windows Git Bash) before Phase 4 is declared complete. This is the pivot point at which human developer effort is replaced by AI agent effort.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-002]** 2. Quality Gates (SO-2):  All five coverage gates (QG-001 ≥ 
- **Type:** Quality
- **Description:** 2. Quality Gates (SO-2):  All five coverage gates (QG-001 ≥ 90% unit, QG-002 ≥ 80% E2E aggregate, QG-003 ≥ 50% CLI E2E, QG-004 ≥ 50% TUI E2E, QG-005 ≥ 50% MCP E2E) and 100% requirement traceability (`traceability_pct == 100.0`) must pass simultaneously before MVP release. No individual gate may be waived.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-003]** 3. Security Baseline (SO-3):  `cargo audit --deny warnings` 
- **Type:** Security
- **Description:** 3. Security Baseline (SO-3):  `cargo audit --deny warnings` must exit 0 on all three platforms before the MVP release milestone is declared. No CRITICAL or HIGH severity advisories may be suppressed without an expiry date and justification in `audit.toml`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CONS-001] [9_PROJECT_ROADMAP-REQ-004]** No crate may have business logic authored until all of its d
- **Type:** Security
- **Description:** No crate may have business logic authored until all of its direct dependencies have passed their Phase Transition Checkpoint (as defined in §1.5 below).
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CONS-002] [9_PROJECT_ROADMAP-REQ-005]** The four critical risks (RISK-002, RISK-004, RISK-005, RISK-
- **Type:** Quality
- **Description:** The four critical risks (RISK-002, RISK-004, RISK-005, RISK-009) each have severity score 9 and MUST be mitigated before any code is written for their affected components. Mitigation means the automated test annotated `// Covers: RISK-NNN` passes on all three CI platforms.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CONS-003] [9_PROJECT_ROADMAP-REQ-006]** `./do presubmit` MUST NOT exceed 15 minutes wall-clock time 
- **Type:** Quality
- **Description:** `./do presubmit` MUST NOT exceed 15 minutes wall-clock time on any of the three CI platforms at any point in the project. If a crate addition causes presubmit to exceed this budget, the phase is not complete until the budget is restored, even if all other gate conditions are met.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CONS-004] [9_PROJECT_ROADMAP-REQ-007]** `// TODO: BOOTSTRAP-STUB` annotations (permitted during Phas
- **Type:** Functional
- **Description:** `// TODO: BOOTSTRAP-STUB` annotations (permitted during Phase 0–3 as implementation placeholders) MUST all be resolved before Phase 5 begins. `./do lint` exits non-zero if any remain during Phase 5.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CONS-005] [9_PROJECT_ROADMAP-REQ-008]** The Glass-Box MCP server MUST be active and responding to `P
- **Type:** Quality
- **Description:** The Glass-Box MCP server MUST be active and responding to `POST /mcp/v1/call` requests from the first commit in which `devs-server` binds its ports. No feature flag may gate it. This is required by `MIT-009` to enable agentic development from the earliest possible moment.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CONS-006] [9_PROJECT_ROADMAP-REQ-009]** E2E tests for each interface (CLI, TUI, MCP) MUST use the ac
- **Type:** Functional
- **Description:** E2E tests for each interface (CLI, TUI, MCP) MUST use the actual interface boundary — `assert_cmd` subprocess for CLI, `TestBackend` + full `handle_event→render` cycle for TUI, `POST /mcp/v1/call` for MCP. Tests that call internal Rust functions do not count toward QG-003, QG-004, or QG-005.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-010]** [ROAD-001]   Phase 0 | Project Foundation & Toolchain | `./d
- **Type:** Technical
- **Description:** [ROAD-001]   Phase 0 | Project Foundation & Toolchain | `./do presubmit` passes on all 3 platforms with stub workspace
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-011]** [ROAD-002]   Phase 1 | Core Domain & Infrastructure | `devs-
- **Type:** Quality
- **Description:** [ROAD-002]   Phase 1 | Core Domain & Infrastructure | `devs-core`, `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, `devs-executor` at ≥90% unit coverage
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-012]** [ROAD-003]   Phase 2 | Workflow Engine | `devs-scheduler` co
- **Type:** Technical
- **Description:** [ROAD-003]   Phase 2 | Workflow Engine | `devs-scheduler` complete; DAG dispatch latency ≤100 ms verified by test
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-013]** [ROAD-004]   Phase 3 | Server & Client Interfaces | `devs-se
- **Type:** Technical
- **Description:** [ROAD-004]   Phase 3 | Server & Client Interfaces | `devs-server` starts, all three clients connect; Bootstrap Phase conditions met
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-014]** [ROAD-005]   Phase 4 | Self-Hosting & Agentic Development | 
- **Type:** Technical
- **Description:** [ROAD-005]   Phase 4 | Self-Hosting & Agentic Development | `devs submit presubmit-check` completes successfully on all 3 platforms
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-015]** [ROAD-006]   Phase 5 | Quality Hardening & MVP Release | All
- **Type:** Security
- **Description:** [ROAD-006]   Phase 5 | Quality Hardening & MVP Release | All QG-001–QG-005 coverage gates pass; 100% traceability; security audit clean
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CONS-007] [9_PROJECT_ROADMAP-REQ-016]** During Phase 4, work on the E2E test suite (preparation for 
- **Type:** Security
- **Description:** During Phase 4, work on the E2E test suite (preparation for Phase 5) may begin in parallel with bootstrap validation, provided it does not require changes to production code in Phases 0–3 crates. Test additions are always safe to author in parallel.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CONS-008] [9_PROJECT_ROADMAP-REQ-017]** The bootstrap attempt MUST NOT be initiated until `./do pres
- **Type:** Functional
- **Description:** The bootstrap attempt MUST NOT be initiated until `./do presubmit` passes on Linux with the stub workspace from Phase 0. The bootstrap is not a debugging session for Phase 1/2/3 issues; it is a final integration verification.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-013] [9_PROJECT_ROADMAP-REQ-018]** A Phase Transition Checkpoint MUST be committed to `docs/adr
- **Type:** Quality
- **Description:** A Phase Transition Checkpoint MUST be committed to `docs/adr/` before any business logic code for Phase N+1 is written. A PTC document whose `gate_conditions` array contains any entry with `"verified": false` is invalid and MUST cause `./do lint` to exit non-zero.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-014] [9_PROJECT_ROADMAP-REQ-019]** All three CI platforms (Linux, macOS, Windows) MUST be verif
- **Type:** Quality
- **Description:** All three CI platforms (Linux, macOS, Windows) MUST be verified for Phase 0 and Phase 4 PTCs. Phases 1–3 may be gated on Linux only during active development, but the Phase 3 PTC requires all three platforms.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-015] [9_PROJECT_ROADMAP-REQ-020]** The bootstrap completion ADR (`docs/adr/<NNNN>-bootstrap-com
- **Type:** Functional
- **Description:** The bootstrap completion ADR (`docs/adr/<NNNN>-bootstrap-complete.md`) MUST include the GitLab CI pipeline URL, the git commit SHA of the `devs-server` binary used, and explicit confirmation of COND-001, COND-002, and COND-003 for each of the three platforms. A bootstrap ADR lacking any of these fields is invalid.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-016] [9_PROJECT_ROADMAP-REQ-021]** `// TODO: BOOTSTRAP-STUB` annotations are only permitted in 
- **Type:** Functional
- **Description:** `// TODO: BOOTSTRAP-STUB` annotations are only permitted in Phases 0–3. After the Phase 3 PTC is committed, `./do lint` MUST be updated to exit non-zero if any remain. After the Phase 5 PTC is committed, zero stub annotations may exist anywhere in the codebase.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-017] [9_PROJECT_ROADMAP-REQ-022]** Phase 5 MUST NOT be declared complete unless all five covera
- **Type:** Quality
- **Description:** Phase 5 MUST NOT be declared complete unless all five coverage gates (QG-001 through QG-005) pass simultaneously in a single `./do coverage` invocation. Passing four of five gates is not partial completion — it is not complete.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-018] [9_PROJECT_ROADMAP-REQ-023]** If FB-007 (bootstrap deadlock fallback) is activated, `./do 
- **Type:** Functional
- **Description:** If FB-007 (bootstrap deadlock fallback) is activated, `./do presubmit` MUST emit exactly one `WARN:` line containing `"Active fallback: FB-007"` until the fallback is retired. Retirement requires a passing bootstrap completion PTC.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-019] [9_PROJECT_ROADMAP-REQ-024]** The `platforms_verified` field in a PTC MUST be confirmed by
- **Type:** Functional
- **Description:** The `platforms_verified` field in a PTC MUST be confirmed by actual CI pipeline runs, not local machine testing. A PTC claiming `"platforms_verified": ["linux", "macos", "windows"]` with no linked pipeline URL is invalid.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-020] [9_PROJECT_ROADMAP-REQ-025]** Each parallel development window (as described in §1.7) MUST
- **Type:** Functional
- **Description:** Each parallel development window (as described in §1.7) MUST respect crate-level import boundaries. If crate A imports crate B during a "parallel" development session, A's Phase Transition Checkpoint cannot be claimed until B's Phase Transition Checkpoint is also claimed.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-026]** A Phase 1 crate (`devs-checkpoint`) passes all gate conditio
- **Type:** Quality
- **Description:** A Phase 1 crate (`devs-checkpoint`) passes all gate conditions but a subsequent CI run on macOS fails due to a flaky `git2` interaction | The Phase 1 PTC MUST NOT be committed until three consecutive clean CI runs succeed on all platforms. A single flaky failure invalidates the gate; the fix must be committed and re-verified.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CONS-006] [UI-ARCH-004l] [9_PROJECT_ROADMAP-REQ-027]** Bootstrap attempt (Phase 4) succeeds on Linux and macOS but 
- **Type:** Technical
- **Description:** Bootstrap attempt (Phase 4) succeeds on Linux and macOS but fails on Windows because a `path` workflow input contains backslashes | This is a Phase 3 bug (path normalization in `devs-cli`/`devs-core`). The Phase 4 bootstrap CANNOT be declared complete. The fix is committed to the affected crate, Phase 3 unit tests updated, and the bootstrap attempt re-run. This scenario is specifically guarded by ` ` and ``.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-028]** Phase 5 `./do coverage` passes QG-001 through QG-004 but QG-
- **Type:** Quality
- **Description:** Phase 5 `./do coverage` passes QG-001 through QG-004 but QG-005 (MCP E2E ≥ 50%) fails at 48% | The Phase 5 gate is not met. The agentic development loop (active since Phase 4) is used to write additional MCP E2E tests targeting the uncovered lines identified in `target/coverage/report.json`. Only when a single `./do coverage` invocation reports all five gates passing simultaneously can the PTC be committed.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-016] [9_PROJECT_ROADMAP-REQ-029]** A `// TODO: BOOTSTRAP-STUB` annotation is discovered in `dev
- **Type:** Functional
- **Description:** A `// TODO: BOOTSTRAP-STUB` annotation is discovered in `devs-grpc` during Phase 5 quality work | `./do lint` already exits non-zero on this condition (per ` `). The discovering agent MUST resolve the stub immediately using the TDD loop before any other Phase 5 work proceeds. The fix is a targeted implementation of the stubbed behavior, not removal of the annotation without implementation.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-030]** The Phase 4 bootstrap `presubmit-check` run reaches `Complet
- **Type:** Quality
- **Description:** The Phase 4 bootstrap `presubmit-check` run reaches `Completed` but one coverage gate (QG-004 TUI E2E) fails in the structured output | PTC-4-003 requires all stages to be `status: "completed"`. A coverage gate failure is reported as `success: false` in the `coverage` stage structured output, making that stage `Failed`. Therefore, Phase 4 PTC-4-003 is not met. This is intentional: the bootstrap completes only when the full quality baseline is already passing.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-031]** Two developers (or two AI agents) attempt to commit PTCs for
- **Type:** Security
- **Description:** Two developers (or two AI agents) attempt to commit PTCs for the same phase simultaneously | The `docs/adr/` commit history resolves this by linear ordering — only the first committed PTC is authoritative. The second is rejected as a duplicate (same `phase_id`). `./do lint` MAY be extended to detect duplicate phase PTCs and exit non-zero.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-ROAD-001] [9_PROJECT_ROADMAP-REQ-032]**    `./do test` generates `target/traceability.json` containi
- **Type:** Quality
- **Description:**    `./do test` generates `target/traceability.json` containing a `phase_gates` array with one entry per phase (ROAD-001 through ROAD-006); each entry includes `phase_id`, `conditions_total`, `conditions_passing`, and `gate_passed: bool`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-ROAD-002] [9_PROJECT_ROADMAP-REQ-033]**    `./do lint` exits non-zero if any `docs/adr/<NNNN>-phase-
- **Type:** Quality
- **Description:**    `./do lint` exits non-zero if any `docs/adr/<NNNN>-phase-*-complete.md` file contains a `PhaseTransitionCheckpoint` JSON block where any `gate_conditions` entry has `"verified": false`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-ROAD-003] [9_PROJECT_ROADMAP-REQ-034]**    `./do lint` exits non-zero if any `// TODO: BOOTSTRAP-STU
- **Type:** Technical
- **Description:**    `./do lint` exits non-zero if any `// TODO: BOOTSTRAP-STUB` annotation exists in any `.rs` file when the Phase 3 PTC has been committed (i.e., a `docs/adr/*-phase-3-complete.md` exists).
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-ROAD-004] [9_PROJECT_ROADMAP-REQ-035]**    `./do presubmit` emits exactly one `WARN:` line for each 
- **Type:** Technical
- **Description:**    `./do presubmit` emits exactly one `WARN:` line for each active fallback listed in `docs/adr/fallback-registry.json` with `"status": "Active"`; zero WARN lines when no fallbacks are active.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-ROAD-005] [9_PROJECT_ROADMAP-REQ-036]**    The bootstrap completion ADR file (`docs/adr/*-bootstrap-
- **Type:** Functional
- **Description:**    The bootstrap completion ADR file (`docs/adr/*-bootstrap-complete.md`), when it exists, must contain: a `"ci_pipeline_url"` field, a `"git_sha"` field, and confirmation strings for all three of `COND-001`, `COND-002`, `COND-003` for each of `"linux"`, `"macos"`, `"windows"` — 9 confirmation entries total. `./do test` exits non-zero if the file exists but is missing any of these fields.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-ROAD-006] [9_PROJECT_ROADMAP-REQ-037]**    `./do coverage` exits non-zero when any of QG-001 through
- **Type:** Quality
- **Description:**    `./do coverage` exits non-zero when any of QG-001 through QG-005 fails; exits 0 only when ALL five gates pass simultaneously; this behavior is tested by a unit test that invokes `./do coverage` against a synthetic coverage report with one gate set below threshold.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-ROAD-007] [9_PROJECT_ROADMAP-REQ-038]**    The `PhaseTransitionCheckpoint` JSON schema is defined in
- **Type:** Technical
- **Description:**    The `PhaseTransitionCheckpoint` JSON schema is defined in `devs-core` (or a tooling crate) and validated programmatically in `./do test`; malformed PTCs (missing fields, wrong `schema_version`) cause `./do test` to exit non-zero.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-ROAD-008] [9_PROJECT_ROADMAP-REQ-039]**    All crate-level dependency constraints (no business logic
- **Type:** Technical
- **Description:**    All crate-level dependency constraints (no business logic before upstream PTC) are enforced by `./do lint` via `cargo tree` checks documented in `TAS §2.2`; adding an import of a Phase N+1 crate into a Phase N crate before the Phase N PTC causes `./do lint` to exit non-zero.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-ROAD-009] [9_PROJECT_ROADMAP-REQ-040]**    The Phase 4 bootstrap attempt, when performed on a clean 
- **Type:** Functional
- **Description:**    The Phase 4 bootstrap attempt, when performed on a clean CI environment with only the Phase 3 deliverables present, must satisfy all three COND-* conditions within a single `./do presubmit` invocation's 900-second budget; a test annotated `// Covers: RISK-009` validates this timing constraint.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-ROAD-010] [9_PROJECT_ROADMAP-REQ-041]**    `target/traceability.json` includes a `risk_matrix_violat
- **Type:** Quality
- **Description:**    `target/traceability.json` includes a `risk_matrix_violations` array; `./do test` exits non-zero when any entry in this array is present, confirming that all risks with score ≥ 6 have covering tests before any phase boundary is crossed.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-042]** [ROAD-BR-LF-001]   A step exceeding its budget by more than 
- **Type:** Functional
- **Description:** [ROAD-BR-LF-001]   A step exceeding its budget by more than 20% MUST emit exactly one `WARN:` line to stderr containing `"step <name> over budget: <duration_ms>ms vs <budget_ms>ms"` and set `"over_budget": true` in its `presubmit_timings.jsonl` entry; it MUST NOT cause `./do presubmit` to exit non-zero.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-043]** [ROAD-BR-LF-002]   The 900,000 ms hard timeout MUST be enfor
- **Type:** Functional
- **Description:** [ROAD-BR-LF-002]   The 900,000 ms hard timeout MUST be enforced by a separate background process, not by a `timeout` command wrapper, so that it survives shell substitution and subshell creation. The `target/.presubmit_timer.pid` file MUST be cleaned up on every exit path including error exits.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-044]** [ROAD-BR-LF-003]   `target/presubmit_timings.jsonl` MUST be 
- **Type:** Functional
- **Description:** [ROAD-BR-LF-003]   `target/presubmit_timings.jsonl` MUST be written incrementally (one line per step, flushed immediately) rather than batched at the end of `./do presubmit`; a hard-timeout kill must still produce partial timing data for the completed steps.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-045]** P0A["[ROAD-007]  Cargo Workspace\n+ rust-toolchain.toml"] --
- **Type:** Technical
- **Description:** P0A["[ROAD-007]  Cargo Workspace\n+ rust-toolchain.toml"] --> P0B
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-046]** P0A --> P0C["[ROAD-009]  devs-proto\n(protobuf)"]
- **Type:** Technical
- **Description:** P0A --> P0C["[ROAD-009]  devs-proto\n(protobuf)"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-047]** P0B["[ROAD-008]  ./do script\n+ GitLab CI"] --> P0D
- **Type:** Technical
- **Description:** P0B["[ROAD-008]  ./do script\n+ GitLab CI"] --> P0D
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-048]** P0C --> P0D["[ROAD-010]  devs-core\n(domain types, StateMach
- **Type:** Technical
- **Description:** P0C --> P0D["[ROAD-010]  devs-core\n(domain types, StateMachine,\nTemplateResolver)"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-049]** P0D --> P1A["[ROAD-011]  devs-config"]
- **Type:** Technical
- **Description:** P0D --> P1A["[ROAD-011]  devs-config"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-050]** P0D --> P1B["[ROAD-012]  devs-checkpoint\n(git2 checkpoint)"]
- **Type:** Technical
- **Description:** P0D --> P1B["[ROAD-012]  devs-checkpoint\n(git2 checkpoint)"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-051]** P0D --> P1C["[ROAD-013]  devs-adapters\n(5 agent CLIs)"]
- **Type:** Technical
- **Description:** P0D --> P1C["[ROAD-013]  devs-adapters\n(5 agent CLIs)"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-052]** P1C --> P1D["[ROAD-014]  devs-pool\n(semaphore, fallback)"]
- **Type:** Technical
- **Description:** P1C --> P1D["[ROAD-014]  devs-pool\n(semaphore, fallback)"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-053]** P1D --> P1E["[ROAD-015]  devs-executor\n(tempdir/docker/ssh)"]
- **Type:** Technical
- **Description:** P1D --> P1E["[ROAD-015]  devs-executor\n(tempdir/docker/ssh)"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-054]** P1E --> P2A["[ROAD-016]  devs-scheduler\n(DAG engine, fan-ou
- **Type:** Technical
- **Description:** P1E --> P2A["[ROAD-016]  devs-scheduler\n(DAG engine, fan-out,\nretry, timeout)"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-055]** P2A --> P2B["[ROAD-017]  devs-webhook"]
- **Type:** Technical
- **Description:** P2A --> P2B["[ROAD-017]  devs-webhook"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-056]** P2A --> P3A["[ROAD-018]  devs-grpc\n(6 tonic services)"]
- **Type:** Technical
- **Description:** P2A --> P3A["[ROAD-018]  devs-grpc\n(6 tonic services)"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-057]** P2A --> P3B["[ROAD-019]  devs-mcp\n(Glass-Box tools)"]
- **Type:** Technical
- **Description:** P2A --> P3B["[ROAD-019]  devs-mcp\n(Glass-Box tools)"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-058]** P3A --> P3C["[ROAD-020]  devs-server\n(startup/shutdown)"]
- **Type:** Technical
- **Description:** P3A --> P3C["[ROAD-020]  devs-server\n(startup/shutdown)"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-059]** P3C --> P3D["[ROAD-021]  devs-cli"]
- **Type:** Technical
- **Description:** P3C --> P3D["[ROAD-021]  devs-cli"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-060]** P3C --> P3E["[ROAD-022]  devs-tui"]
- **Type:** Technical
- **Description:** P3C --> P3E["[ROAD-022]  devs-tui"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-061]** P3B --> P3F["[ROAD-023]  devs-mcp-bridge"]
- **Type:** Technical
- **Description:** P3B --> P3F["[ROAD-023]  devs-mcp-bridge"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-062]** P3C --> P4A["[ROAD-024]  Bootstrap\nComplete"]
- **Type:** Technical
- **Description:** P3C --> P4A["[ROAD-024]  Bootstrap\nComplete"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-063]** P4A --> P5A["[ROAD-025]  MVP Release"]
- **Type:** Technical
- **Description:** P4A --> P5A["[ROAD-025]  MVP Release"]
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-064]** [ROAD-BR-LF-004]   `./do lint` MUST run `cargo tree -p <crat
- **Type:** Functional
- **Description:** [ROAD-BR-LF-004]   `./do lint` MUST run `cargo tree -p <crate> --edges normal` for each crate in the forbidden-imports table and exit non-zero if any forbidden crate appears in the dependency closure. This is the primary enforcement mechanism for the layered architecture invariant.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-065]** [ROAD-BR-LF-005]   A `// TODO: BOOTSTRAP-STUB` annotation on
- **Type:** Functional
- **Description:** [ROAD-BR-LF-005]   A `// TODO: BOOTSTRAP-STUB` annotation on a function body is the ONLY permitted mechanism for a downstream crate to compile while an upstream crate is not yet fully implemented. Stub bodies MUST contain `unimplemented!()` as their sole expression and MUST NOT contain any real logic. `./do lint` exits non-zero if any stub annotation remains after the Phase 3 PTC is committed.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-066]** `name` | `string` | Pool name as configured in `devs.toml`
- **Type:** Technical
- **Description:** `name` | `string` | Pool name as configured in `devs.toml`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-067]** `max_concurrent` | `u32` (1–1024) | Hard concurrency cap acr
- **Type:** Technical
- **Description:** `max_concurrent` | `u32` (1–1024) | Hard concurrency cap across all projects
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-068]** `active_count` | `u32` | Number of agent permits currently held
- **Type:** Technical
- **Description:** `active_count` | `u32` | Number of agent permits currently held
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-069]** `queued_count` | `u32` | Number of stages waiting on semaphore
- **Type:** Technical
- **Description:** `queued_count` | `u32` | Number of stages waiting on semaphore
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-070]** `exhausted` | `boolean` | `true` if all agents are unavailab
- **Type:** Technical
- **Description:** `exhausted` | `boolean` | `true` if all agents are unavailable (rate-limited or at capacity)
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-071]** `agents` | `AgentPoolState[]` | Per-agent status
- **Type:** Technical
- **Description:** `agents` | `AgentPoolState[]` | Per-agent status
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-072]** `tool` | `string` | Agent CLI name (`"claude"`, `"gemini"`, 
- **Type:** Technical
- **Description:** `tool` | `string` | Agent CLI name (`"claude"`, `"gemini"`, etc.)
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-073]** `capabilities` | `string[]` | Declared capability tags
- **Type:** Technical
- **Description:** `capabilities` | `string[]` | Declared capability tags
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-074]** `fallback` | `boolean` | Is a fallback agent
- **Type:** Technical
- **Description:** `fallback` | `boolean` | Is a fallback agent
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-075]** `pty_active` | `boolean` | Whether PTY is enabled (respects 
- **Type:** Technical
- **Description:** `pty_active` | `boolean` | Whether PTY is enabled (respects `PTY_AVAILABLE`)
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-076]** `rate_limited_until` | `string \ | null` | RFC 3339 timestam
- **Type:** Technical
- **Description:** `rate_limited_until` | `string \ | null` | RFC 3339 timestamp; `null` if not rate-limited
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-077]** `active_stages` | `u32` | Count of stages currently using th
- **Type:** Technical
- **Description:** `active_stages` | `u32` | Count of stages currently using this agent
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-078]** [ROAD-BR-LF-006]   `PoolExhausted` transitions occur when th
- **Type:** Functional
- **Description:** [ROAD-BR-LF-006]   `PoolExhausted` transitions occur when the filtered-available agent count drops from ≥ 1 to 0 within a single pool. The event fires EXACTLY ONCE per episode. The episode ends — and the next `PoolExhausted` becomes eligible — only when the available-agent count returns to ≥ 1. Intermediate rate-limit events during an ongoing exhaustion episode MUST NOT re-fire the webhook.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-079]** [ROAD-BR-LF-007]   Rate-limit cooldown is stored as an absol
- **Type:** Technical
- **Description:** [ROAD-BR-LF-007]   Rate-limit cooldown is stored as an absolute `DateTime<Utc>` timestamp (`rate_limited_until`), not as a countdown duration. This means the cooldown is unaffected by server restarts: a recovered pool state correctly identifies agents still in cooldown by comparing `rate_limited_until` to `Utc::now()`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-080]** `.devs_output.json` exists, `"success": true` (boolean) | `C
- **Type:** Technical
- **Description:** `.devs_output.json` exists, `"success": true` (boolean) | `Completed`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-081]** `.devs_output.json` exists, `"success": false` (boolean) | `
- **Type:** Technical
- **Description:** `.devs_output.json` exists, `"success": false` (boolean) | `Failed`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-082]** `.devs_output.json` exists, `"success": "true"` (string) | `
- **Type:** Technical
- **Description:** `.devs_output.json` exists, `"success": "true"` (string) | `Failed` — string `"true"` is NOT accepted
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-083]** `.devs_output.json` exists, `"success"` field absent | `Failed`
- **Type:** Technical
- **Description:** `.devs_output.json` exists, `"success"` field absent | `Failed`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-084]** `.devs_output.json` exists, invalid JSON | `Failed`
- **Type:** Technical
- **Description:** `.devs_output.json` exists, invalid JSON | `Failed`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-085]** `.devs_output.json` absent, stdout last line is valid JSON w
- **Type:** Technical
- **Description:** `.devs_output.json` absent, stdout last line is valid JSON with `"success": bool` | Use stdout JSON per rules above
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-086]** `.devs_output.json` absent, stdout has no valid JSON object 
- **Type:** Technical
- **Description:** `.devs_output.json` absent, stdout has no valid JSON object | `Failed`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-087]** [ROAD-BR-LF-008]   `.devs_output.json` takes strict priority
- **Type:** Functional
- **Description:** [ROAD-BR-LF-008]   `.devs_output.json` takes strict priority over stdout JSON. If `.devs_output.json` is present but contains invalid JSON, the stage MUST be `Failed` even if stdout contains valid JSON with `"success": true`. The two sources are not merged.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-088]** [ROAD-BR-LF-009]   `signal_completion` called on a stage tha
- **Type:** Functional
- **Description:** [ROAD-BR-LF-009]   `signal_completion` called on a stage that has already reached a terminal state (`Completed`, `Failed`, `TimedOut`, `Cancelled`) MUST return an error `"failed_precondition: stage is already in a terminal state"` and MUST NOT change any state. The per-run mutex serializes concurrent calls.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-089]** Phase 0 | `target/presubmit_timings.jsonl` | Git CI artifact
- **Type:** Technical
- **Description:** Phase 0 | `target/presubmit_timings.jsonl` | Git CI artifact | RISK-005 monitoring; operator review
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-090]** Phase 0 | `target/traceability.json` (partial) | Git CI arti
- **Type:** Quality
- **Description:** Phase 0 | `target/traceability.json` (partial) | Git CI artifact | Phase 5 gate; `./do test`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-091]** Phase 0 | `devs-proto/src/gen/` (generated) | Committed to r
- **Type:** Technical
- **Description:** Phase 0 | `devs-proto/src/gen/` (generated) | Committed to repo | All crates importing proto types
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-092]** Phase 0 | `devs-core` types (`BoundedString`, `StateMachine`
- **Type:** Technical
- **Description:** Phase 0 | `devs-core` types (`BoundedString`, `StateMachine`, etc.) | `crates/devs-core/src/` | All Phase 1+ crates
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-093]** Phase 0 | `rust-toolchain.toml` | Repo root | All Rust toolc
- **Type:** Technical
- **Description:** Phase 0 | `rust-toolchain.toml` | Repo root | All Rust toolchain invocations
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-094]** Phase 0 | `.gitlab-ci.yml` | Repo root | GitLab CI runner
- **Type:** Technical
- **Description:** Phase 0 | `.gitlab-ci.yml` | Repo root | GitLab CI runner
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-095]** Phase 1 | `target/adapter-versions.json` | `target/` | `./do
- **Type:** Technical
- **Description:** Phase 1 | `target/adapter-versions.json` | `target/` | `./do lint` freshness check
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-096]** Phase 1 | `devs-config`, `devs-checkpoint`, `devs-adapters`,
- **Type:** Technical
- **Description:** Phase 1 | `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, `devs-executor` crates | `crates/` | Phase 2 (`devs-scheduler` depends on all)
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-097]** Phase 2 | `devs-scheduler` crate | `crates/` | Phase 3 (`dev
- **Type:** Technical
- **Description:** Phase 2 | `devs-scheduler` crate | `crates/` | Phase 3 (`devs-grpc`, `devs-mcp`)
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-098]** Phase 2 | `devs-webhook` crate | `crates/` | Phase 3 (`devs-
- **Type:** Technical
- **Description:** Phase 2 | `devs-webhook` crate | `crates/` | Phase 3 (`devs-server`)
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-099]** Phase 3 | `devs-server` binary | `target/release/` | Phase 4
- **Type:** Technical
- **Description:** Phase 3 | `devs-server` binary | `target/release/` | Phase 4 bootstrap
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-100]** Phase 3 | All 20 MCP tools implemented | `crates/devs-mcp/` 
- **Type:** Technical
- **Description:** Phase 3 | All 20 MCP tools implemented | `crates/devs-mcp/` | Phase 4 agentic loop
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-101]** Phase 3 | `crates/devs-tui/tests/snapshots/*.txt` | `crates/
- **Type:** Technical
- **Description:** Phase 3 | `crates/devs-tui/tests/snapshots/*.txt` | `crates/devs-tui/tests/snapshots/` | Phase 5 QG-004 TUI E2E
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-102]** Phase 4 | `.devs/workflows/*.toml` (6 files) | Repo `.devs/w
- **Type:** Technical
- **Description:** Phase 4 | `.devs/workflows/*.toml` (6 files) | Repo `.devs/workflows/` | Phase 4 bootstrap; Phase 5 agentic loop
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-103]** Phase 4 | `docs/adr/NNNN-bootstrap-complete.md` | `docs/adr/
- **Type:** Technical
- **Description:** Phase 4 | `docs/adr/NNNN-bootstrap-complete.md` | `docs/adr/` | PTC-4-005; RISK-009 retirement
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-104]** Phase 5 | `target/coverage/report.json` | `target/coverage/`
- **Type:** Quality
- **Description:** Phase 5 | `target/coverage/report.json` | `target/coverage/` | CI gate; `./do presubmit`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-105]** Phase 5 | `target/traceability.json` (100% complete) | `targ
- **Type:** Quality
- **Description:** Phase 5 | `target/traceability.json` (100% complete) | `target/` | MVP release gate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-106]** Phase 5 | `docs/adapter-compatibility.md` | `docs/` | MIT-01
- **Type:** Quality
- **Description:** Phase 5 | `docs/adapter-compatibility.md` | `docs/` | MIT-017; MVP release gate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-107]** Phase 5 | `docs/adr/fallback-registry.json` | `docs/adr/` | 
- **Type:** Quality
- **Description:** Phase 5 | `docs/adr/fallback-registry.json` | `docs/adr/` | Fallback monitoring; release gate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-108]** Phase 5 | Per-crate ADRs in `docs/adr/` | `docs/adr/` | MIT-
- **Type:** Quality
- **Description:** Phase 5 | Per-crate ADRs in `docs/adr/` | `docs/adr/` | MIT-016 code review gate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-109]** [ROAD-BR-LF-010]   An AI agent MUST NOT call `write_workflow
- **Type:** Functional
- **Description:** [ROAD-BR-LF-010]   An AI agent MUST NOT call `write_workflow_definition`, edit any source file, or make any `git` commit until `get_stage_output` returns `"error": null` for the failed stage. The diagnostic read MUST precede any write.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-110]** [ROAD-BR-LF-011]   Before a second `submit_run` for the same
- **Type:** Functional
- **Description:** [ROAD-BR-LF-011]   Before a second `submit_run` for the same workflow, an agent MUST call `list_runs` and verify no non-terminal run for that workflow exists under the current project. If one exists, the agent MUST either call `get_run` to resume monitoring it or call `cancel_run`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-111]** [ROAD-BR-LF-012] | The 13-step workflow validation pipeline 
- **Type:** Functional
- **Description:** [ROAD-BR-LF-012] | The 13-step workflow validation pipeline MUST run to completion (all errors collected) before any `WorkflowRun` record is created. Partial validation that creates a run after 7 of 13 checks pass is prohibited.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-112]** [ROAD-BR-LF-013] | The workflow definition snapshot (`workfl
- **Type:** Functional
- **Description:** [ROAD-BR-LF-013] | The workflow definition snapshot (`workflow_snapshot.json`) MUST be written and the git commit made before the first stage transitions from `Waiting` to `Eligible`. If the snapshot write fails, the run MUST be failed immediately with no stages dispatched.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-113]** [ROAD-BR-LF-014] | DAG eligibility re-evaluation MUST occur 
- **Type:** Functional
- **Description:** [ROAD-BR-LF-014] | DAG eligibility re-evaluation MUST occur within a single scheduler tick after any `StageRun` transitions to `Completed`. The maximum latency from `Completed` event to the next `Eligible` stage's dispatch MUST NOT exceed 100ms.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-114]** [ROAD-BR-LF-015] | When `WorkflowRun` transitions to `Comple
- **Type:** Functional
- **Description:** [ROAD-BR-LF-015] | When `WorkflowRun` transitions to `Completed`, `Failed`, or `Cancelled`, ALL non-terminal `StageRun` records for that run MUST transition to `Cancelled` in the SAME atomic checkpoint write as the run-level transition. No intermediate checkpoint may show the run in a terminal state while stages remain non-terminal.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-115]** [ROAD-BR-LF-016] | The working directory for each stage exec
- **Type:** Functional
- **Description:** [ROAD-BR-LF-016] | The working directory for each stage execution MUST incorporate both the `run_id` and `stage_name` in its path to prevent cross-stage filesystem collisions. Paths that omit either component violate isolation requirements.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-116]** [ROAD-BR-LF-017] | `StageRun.exit_code` MUST be recorded in 
- **Type:** Functional
- **Description:** [ROAD-BR-LF-017] | `StageRun.exit_code` MUST be recorded in the checkpoint even for completion mechanisms that do not use exit code as the primary signal (`structured_output`, `mcp_tool_call`). A SIGKILL-terminated process has `exit_code: -9`. A process that has not yet exited has `exit_code: null`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-117]** [ROAD-BR-LF-018] | Template variable resolution MUST be sing
- **Type:** Functional
- **Description:** [ROAD-BR-LF-018] | Template variable resolution MUST be single-pass: after substituting `{{var}}` with its value, the scan pointer advances to the character after the substituted text. Characters within the substituted value are NEVER rescanned for additional `{{` delimiters. This prevents injection of `{{stage.X.stdout}}` as a stage output value to read another stage's output.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-118]** [ROAD-BR-LF-019] | A template expression referencing `{{stag
- **Type:** Functional
- **Description:** [ROAD-BR-LF-019] | A template expression referencing `{{stage.<name>.*}}` where `<name>` is NOT in the transitive `depends_on` closure of the current stage MUST cause the stage to fail immediately at prompt rendering time with `TemplateError::UnreachableStage`. This is a pre-execution failure, not a runtime failure.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-119]** [ROAD-BR-LF-020] | Lock acquisition order (`SchedulerState →
- **Type:** Functional
- **Description:** [ROAD-BR-LF-020] | Lock acquisition order (`SchedulerState → PoolState → CheckpointStore`) MUST be respected in every code path that acquires more than one lock. Any code path that acquires locks in a different order is a potential deadlock and MUST be caught during code review.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-120]** A stage with `depends_on: ["A", "B"]` where A completes but 
- **Type:** Functional
- **Description:** A stage with `depends_on: ["A", "B"]` where A completes but B is cancelled before completing | The dependent stage MUST transition to `Cancelled` atomically with B's cancellation. The DAG scheduler re-evaluates the full run status and transitions `WorkflowRun → Failed` if no remaining path can reach a terminal success.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-121]** Two fan-out sub-agents complete within 1ms of each other | T
- **Type:** Technical
- **Description:** Two fan-out sub-agents complete within 1ms of each other | The per-run `Arc<tokio::sync::Mutex<RunState>>` serializes both completions. Exactly two checkpoint writes are produced, each reflecting the incremental state (not one overwriting the other). The merge handler or default merge fires only after ALL sub-agents are terminal.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-122]** `signal_completion` is called for a stage, and then the agen
- **Type:** Technical
- **Description:** `signal_completion` is called for a stage, and then the agent process exits with non-zero before the stage executor observes the exit | The `signal_completion` call already transitioned the stage to a terminal state. The subsequent process exit is observed but the exit code is still recorded in `StageRun.exit_code`. No second transition is attempted.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-123]** A `structured_output` stage writes a `.devs_output.json` wit
- **Type:** Technical
- **Description:** A `structured_output` stage writes a `.devs_output.json` with `{"success": true}` but the process exits with code 1 | `.devs_output.json` takes priority. Stage is `Completed`. Exit code 1 is recorded in `StageRun.exit_code` with `exit_code: 1`. This is by design: the agent controls its declared outcome.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-124]** The DAG scheduler receives a `stage_complete` event for a st
- **Type:** Technical
- **Description:** The DAG scheduler receives a `stage_complete` event for a stage that is already `Completed` (duplicate delivery) | The second event is silently discarded and logged at `DEBUG` with `event_type: "scheduler.duplicate_terminal_event"`. No second checkpoint write, no second dependency re-evaluation.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-125]** `presubmit_timings.jsonl` is missing at the start of `./do p
- **Type:** Technical
- **Description:** `presubmit_timings.jsonl` is missing at the start of `./do presubmit` (first run on clean checkout) | The file is created fresh at the start of the first step. Missing file is not an error condition.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-126]** A crate's unit test coverage drops from 94% to 88% mid-Phase
- **Type:** Quality
- **Description:** A crate's unit test coverage drops from 94% to 88% mid-Phase 5 after adding new code | `./do coverage` exits non-zero with `QG-001 failed: 88.0% < 90.0%`. `./do presubmit` exits non-zero. The agentic loop adds targeted unit tests until coverage returns to ≥ 90%. Uncovered lines are listed in `target/coverage/report.json`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-127]** An agent calls `report_progress` with `pct_complete: 110` (o
- **Type:** Functional
- **Description:** An agent calls `report_progress` with `pct_complete: 110` (out of range) | The `report_progress` tool returns `{"result": null, "error": "invalid_argument: pct_complete must be 0–100"}`. The stage continues executing. The call is non-blocking and non-fatal.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-128]** `./do coverage` is run when zero `.profraw` files exist for 
- **Type:** Quality
- **Description:** `./do coverage` is run when zero `.profraw` files exist for E2E tests | `./do coverage` exits non-zero with message `"no E2E coverage profile data found; ensure E2E tests set LLVM_PROFILE_FILE=%p.profraw"`. This prevents a misleading 0% from being reported as the E2E gate result.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-013] [9_PROJECT_ROADMAP-REQ-129]** Two phases' worth of crates are implemented in a single comm
- **Type:** Functional
- **Description:** Two phases' worth of crates are implemented in a single commit without committing the intermediate PTC | `./do lint` does NOT check git history for intermediate commits. However, if the Phase N PTC ADR file does not exist when Phase N+1 code is present in the same crate dependency chain, `./do lint` exits non-zero per ` `. PTCs must be committed before N+1 business logic.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-130]** [AC-ROAD-LF-001]   A unit test validates that `StateMachine:
- **Type:** Technical
- **Description:** [AC-ROAD-LF-001]   A unit test validates that `StateMachine::transition()` produces exactly the sequence of state changes shown in §2.3 for a 3-stage linear DAG (`A → B → C`): all three start `Waiting`, A transitions `Eligible→Running→Completed`, B becomes `Eligible` within 100ms of A's `Completed` event, then `Running→Completed`, then C follows suit.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-131]** [AC-ROAD-LF-002]   A unit test validates the pool dispatch a
- **Type:** Technical
- **Description:** [AC-ROAD-LF-002]   A unit test validates the pool dispatch algorithm in §2.4: with `required_capabilities = ["code-gen"]`, only agents whose `capabilities` array contains `"code-gen"` (or whose `capabilities` is empty) are selected; agents with `capabilities = ["review"]` only are excluded; test covers both the filter step and the rate-limit exclusion step.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-132]** [AC-ROAD-LF-003]   A unit test validates the completion sign
- **Type:** Technical
- **Description:** [AC-ROAD-LF-003]   A unit test validates the completion signal processing table in §2.5: `{"success": "true"}` (string) in `.devs_output.json` results in `StageRun → Failed`; `{"success": true}` (boolean) results in `StageRun → Completed`; missing `.devs_output.json` with a last stdout line of `{"success": true}` results in `StageRun → Completed`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-133]** [AC-ROAD-LF-004]   A unit test validates that template resol
- **Type:** Technical
- **Description:** [AC-ROAD-LF-004]   A unit test validates that template resolution is single-pass: a stage output containing the literal string `"{{stage.other.stdout}}"` is passed to a subsequent stage's prompt template and resolves to the literal string `"{{stage.other.stdout}}"` (not to `other`'s stdout), confirming that substituted values are not rescanned.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-134]** [AC-ROAD-LF-005]   `./do presubmit` writes `target/presubmit
- **Type:** Technical
- **Description:** [AC-ROAD-LF-005]   `./do presubmit` writes `target/presubmit_timings.jsonl` with at least one entry per `./do` step; each entry contains `step`, `started_at`, `completed_at`, `duration_ms`, `budget_ms`, `over_budget`, and `exit_code`; a test that parses the file and checks schema validity passes.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-135]** [AC-ROAD-LF-006]   A unit test simulates the 7-step `submit_
- **Type:** Technical
- **Description:** [AC-ROAD-LF-006]   A unit test simulates the 7-step `submit_run` validation sequence: steps 1–6 each individually fail the request (returning the correct error prefix) while all others pass; step 7 succeeds only when all 6 prior conditions are satisfied; the test covers all 7 branches.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-136]** [AC-ROAD-LF-007]   An integration test verifies that `Workfl
- **Type:** Technical
- **Description:** [AC-ROAD-LF-007]   An integration test verifies that `WorkflowRun → Cancelled` causes all non-terminal `StageRun` records to transition to `Cancelled` in a single checkpoint git commit (exactly one new commit in the checkpoint branch, not one per stage).
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-137]** [AC-ROAD-LF-008]   A unit test verifies the pool exhaustion 
- **Type:** Technical
- **Description:** [AC-ROAD-LF-008]   A unit test verifies the pool exhaustion episode logic: `PoolExhausted` webhook fires once when the last available agent becomes rate-limited; does NOT fire again when a second agent becomes rate-limited while the first is still in cooldown; fires once more when all agents recover and one becomes rate-limited again (new episode).
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-138]** [AC-ROAD-LF-009]   `./do lint` exits non-zero when `cargo tr
- **Type:** Technical
- **Description:** [AC-ROAD-LF-009]   `./do lint` exits non-zero when `cargo tree -p devs-core --edges normal` includes `tokio`; exits 0 when `devs-core` has no such import; this behavior is verified by a lint integration test that temporarily adds a `tokio` import to `devs-core`'s `Cargo.toml` and checks the lint exit code.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-139]** [AC-ROAD-LF-010]   A TDD loop E2E test submits `tdd-red` for
- **Type:** Technical
- **Description:** [AC-ROAD-LF-010]   A TDD loop E2E test submits `tdd-red` for a test that currently passes (exit 0), verifies the workflow stage exits 0 (test passes = Red phase not confirmed), then submits again for a test that currently fails (exit 1), verifies the stage exits 1 (Red phase confirmed); confirms the loop correctly distinguishes the two states.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-140]** [ROAD-001]   Phase 0 — Project Foundation & Toolchain
- **Type:** Technical
- **Description:** [ROAD-001]   Phase 0 — Project Foundation & Toolchain
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-141]** [ROAD-007]   Cargo Workspace Skeleton
- **Type:** Technical
- **Description:** [ROAD-007]   Cargo Workspace Skeleton
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-142]** [ROAD-008]   `./do` Entrypoint Script & CI Pipeline
- **Type:** Technical
- **Description:** [ROAD-008]   `./do` Entrypoint Script & CI Pipeline
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-143]** [ROAD-009]   `devs-proto` Crate
- **Type:** Technical
- **Description:** [ROAD-009]   `devs-proto` Crate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-144]** [ROAD-010]   `devs-core` Crate
- **Type:** Technical
- **Description:** [ROAD-010]   `devs-core` Crate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-001] [9_PROJECT_ROADMAP-REQ-145]** `./do setup` MUST be idempotent: running it on a system wher
- **Type:** Functional
- **Description:** `./do setup` MUST be idempotent: running it on a system where all tools are already at required versions MUST NOT reinstall, downgrade, or alter any tool
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-002] [9_PROJECT_ROADMAP-REQ-146]** `./do presubmit` MUST enforce a hard 900-second wall-clock t
- **Type:** Functional
- **Description:** `./do presubmit` MUST enforce a hard 900-second wall-clock timeout via a background timer subprocess whose PID is written to `target/.presubmit_timer.pid`; all child processes MUST be killed and the script MUST exit non-zero on breach
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-003] [9_PROJECT_ROADMAP-REQ-147]** An unknown `./do` subcommand MUST print the complete list of
- **Type:** Functional
- **Description:** An unknown `./do` subcommand MUST print the complete list of valid subcommands to stderr and exit non-zero; it MUST NOT silently succeed or produce partial output
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-004] [9_PROJECT_ROADMAP-REQ-148]** `devs-core` MUST NOT declare `tokio`, `git2`, `reqwest`, or 
- **Type:** Functional
- **Description:** `devs-core` MUST NOT declare `tokio`, `git2`, `reqwest`, or `tonic` as non-dev dependencies; `cargo tree -p devs-core --edges normal` is run by `./do lint` and exits non-zero if any of these appear
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-005] [9_PROJECT_ROADMAP-REQ-149]** All crate stubs created in Phase 0 MUST compile (`cargo buil
- **Type:** Functional
- **Description:** All crate stubs created in Phase 0 MUST compile (`cargo build --workspace`) before Phase 1 work begins; compilation failures in stubs block the Phase 0 checkpoint
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-006] [9_PROJECT_ROADMAP-REQ-150]** `rust-toolchain.toml` MUST pin `channel = "stable"` and comp
- **Type:** Functional
- **Description:** `rust-toolchain.toml` MUST pin `channel = "stable"` and components `rustfmt`, `clippy`, `llvm-tools-preview`; nightly channels are prohibited
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-007] [9_PROJECT_ROADMAP-REQ-151]** `.gitlab-ci.yml` MUST be validated by `yamllint --strict` in
- **Type:** Functional
- **Description:** `.gitlab-ci.yml` MUST be validated by `yamllint --strict` in every `./do lint` invocation; invalid YAML causes `./do lint` to exit non-zero
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-008] [9_PROJECT_ROADMAP-REQ-152]** The `audit.toml` suppression limit is 10 entries total acros
- **Type:** Security
- **Description:** The `audit.toml` suppression limit is 10 entries total across the project lifetime; each entry MUST have a justification comment and an expiry date; `./do lint` exits non-zero if the limit is exceeded
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-009] [9_PROJECT_ROADMAP-REQ-153]** Per-step timing MUST be logged to `target/presubmit_timings.
- **Type:** Functional
- **Description:** Per-step timing MUST be logged to `target/presubmit_timings.jsonl` with fields `step`, `started_at`, `duration_ms`, `budget_ms`, `over_budget`; each line flushed immediately after step completion
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-010] [9_PROJECT_ROADMAP-REQ-154]** `target/.presubmit_timer.pid` MUST be deleted on successful 
- **Type:** Functional
- **Description:** `target/.presubmit_timer.pid` MUST be deleted on successful `./do presubmit` completion via a `trap` clause; a leaked timer MUST NOT affect subsequent `./do` invocations
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-011] [9_PROJECT_ROADMAP-REQ-155]** `StateMachine::transition()` MUST return `TransitionError::I
- **Type:** Functional
- **Description:** `StateMachine::transition()` MUST return `TransitionError::IllegalTransition` (not panic) for every `(from_state, event)` pair not listed in the `RunStatus` or `StageStatus` state transition tables
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-012] [9_PROJECT_ROADMAP-REQ-156]** `TemplateResolver::resolve()` MUST return `Err(TemplateError
- **Type:** Functional
- **Description:** `TemplateResolver::resolve()` MUST return `Err(TemplateError::UnknownVariable)` for any `{{variable}}` with no match; empty string MUST never be substituted silently
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-157]** `protoc` binary absent on CI runner | `devs-proto/build.rs` 
- **Type:** Technical
- **Description:** `protoc` binary absent on CI runner | `devs-proto/build.rs` skips regeneration and uses committed `src/gen/` files; `cargo build` exits 0; the CI runner does not require `protoc`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-158]** `cargo audit` advisory emerges mid-Phase 0 | `./do lint` exi
- **Type:** Security
- **Description:** `cargo audit` advisory emerges mid-Phase 0 | `./do lint` exits non-zero; development MUST NOT proceed until the advisory is addressed via dependency update or justified `audit.toml` suppression with expiry date
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-159]** Presubmit timer subprocess leaks after successful exit | The
- **Type:** Functional
- **Description:** Presubmit timer subprocess leaks after successful exit | The `./do presubmit` cleanup `trap` kills the timer PID; a leaked timer MUST NOT send SIGKILL to unrelated processes in subsequent invocations
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-160]** `./do setup` run twice with all tools already at required ve
- **Type:** Technical
- **Description:** `./do setup` run twice with all tools already at required versions | Script exits 0 without reinstalling; tool versions are logged to stdout confirming they satisfy requirements
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-161]** `devs-core` accidentally imports `tokio` transitively | `car
- **Type:** Security
- **Description:** `devs-core` accidentally imports `tokio` transitively | `cargo tree -p devs-core --edges normal` shows `tokio`; `./do lint` dependency audit exits non-zero; the Phase 0 checkpoint is blocked until the import is removed
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-162]** Workspace has a clippy warning in a stub crate | `cargo clip
- **Type:** Functional
- **Description:** Workspace has a clippy warning in a stub crate | `cargo clippy -- -D warnings` exits non-zero; `./do lint` fails; the stub MUST be corrected (e.g., `#[allow]` with justification) before the checkpoint
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-163]** Two `./do presubmit` processes run concurrently | Each write
- **Type:** Functional
- **Description:** Two `./do presubmit` processes run concurrently | Each writes to its own `target/.presubmit_timer.pid`; the timer for process A MUST NOT kill process B's children; isolation is achieved via shell-level PID management
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-164]** [AC-ROAD-P0-001]   `./do presubmit` exits 0 within 900 secon
- **Type:** Technical
- **Description:** [AC-ROAD-P0-001]   `./do presubmit` exits 0 within 900 seconds on a clean checkout of the Phase 0 milestone commit, verified on Linux, macOS, and Windows Git Bash
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-165]** [AC-ROAD-P0-002]   `cargo tree -p devs-core --edges normal` 
- **Type:** Technical
- **Description:** [AC-ROAD-P0-002]   `cargo tree -p devs-core --edges normal` produces output containing none of: `tokio`, `git2`, `reqwest`, `tonic`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-166]** [AC-ROAD-P0-003]   Introducing `[[` (bash-specific syntax) i
- **Type:** Technical
- **Description:** [AC-ROAD-P0-003]   Introducing `[[` (bash-specific syntax) into `./do` causes `./do lint` to exit non-zero via `shellcheck --shell=sh`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-167]** [AC-ROAD-P0-004]   `StateMachine::transition()` returns `Tra
- **Type:** Technical
- **Description:** [AC-ROAD-P0-004]   `StateMachine::transition()` returns `TransitionError::IllegalTransition` (not a panic) for every `(from_state, event)` pair not defined in the `RunStatus` and `StageStatus` transition tables; this is verified by an exhaustive unit test covering all invalid transitions
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-168]** [AC-ROAD-P0-005]   `TemplateResolver::resolve()` returns `Er
- **Type:** Technical
- **Description:** [AC-ROAD-P0-005]   `TemplateResolver::resolve()` returns `Err(TemplateError::UnknownVariable)` for a template referencing a nonexistent variable; the test asserts the `Ok()` variant is never returned with an empty string for the missing variable
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-169]** [AC-ROAD-P0-006]   `devs-proto` crate emits all 6 service na
- **Type:** Technical
- **Description:** [AC-ROAD-P0-006]   `devs-proto` crate emits all 6 service names (`WorkflowDefinitionService`, `RunService`, `StageService`, `LogService`, `PoolService`, `ProjectService`) when queried via gRPC reflection
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-170]** [AC-ROAD-P0-007]   `./do lint` exits non-zero when a non-tes
- **Type:** Security
- **Description:** [AC-ROAD-P0-007]   `./do lint` exits non-zero when a non-test dependency not in the authoritative version table from TAS §2.2 is found in `Cargo.lock`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-171]** [AC-ROAD-P0-008]   GitLab CI pipeline runs `presubmit-linux`
- **Type:** Quality
- **Description:** [AC-ROAD-P0-008]   GitLab CI pipeline runs `presubmit-linux`, `presubmit-macos`, and `presubmit-windows` as parallel jobs and produces `target/coverage/report.json`, `target/traceability.json`, and `target/presubmit_timings.jsonl` as artifacts with `expire_in: 7 days`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-172]** [ROAD-P0-DEP-001]   No prior phases. This is the root phase.
- **Type:** Technical
- **Description:** [ROAD-P0-DEP-001]   No prior phases. This is the root phase.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-173]** [ROAD-002]   Phase 1 — Core Domain & Infrastructure
- **Type:** Technical
- **Description:** [ROAD-002]   Phase 1 — Core Domain & Infrastructure
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-174]** [ROAD-011]   `devs-config` Crate
- **Type:** Technical
- **Description:** [ROAD-011]   `devs-config` Crate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-175]** [ROAD-012]   `devs-checkpoint` Crate
- **Type:** Technical
- **Description:** [ROAD-012]   `devs-checkpoint` Crate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-176]** [ROAD-013]   `devs-adapters` Crate
- **Type:** Technical
- **Description:** [ROAD-013]   `devs-adapters` Crate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-177]** [ROAD-014]   `devs-pool` Crate
- **Type:** Technical
- **Description:** [ROAD-014]   `devs-pool` Crate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-178]** [ROAD-015]   `devs-executor` Crate
- **Type:** Technical
- **Description:** [ROAD-015]   `devs-executor` Crate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-101] [9_PROJECT_ROADMAP-REQ-179]** `devs-checkpoint` MUST use `git2` exclusively for all git op
- **Type:** Functional
- **Description:** `devs-checkpoint` MUST use `git2` exclusively for all git operations; shell-out to the `git` binary is prohibited; enforced by `./do lint` checking for `Command::new("git"` in `devs-checkpoint/src/`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-102] [9_PROJECT_ROADMAP-REQ-180]** `checkpoint.json` MUST be written atomically via write-to-te
- **Type:** Functional
- **Description:** `checkpoint.json` MUST be written atomically via write-to-temp → `fsync` → `rename()`; partial writes MUST never be visible to readers; the `.tmp` extension MUST be used for the intermediate file
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-103] [9_PROJECT_ROADMAP-REQ-181]** A corrupt or unreadable `checkpoint.json` MUST cause the aff
- **Type:** Functional
- **Description:** A corrupt or unreadable `checkpoint.json` MUST cause the affected run to be marked `Unrecoverable` in `ServerState`; the server MUST continue processing all other runs without interruption
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-104] [9_PROJECT_ROADMAP-REQ-182]** A disk-full error (`ENOSPC`) during checkpoint write MUST be
- **Type:** Functional
- **Description:** A disk-full error (`ENOSPC`) during checkpoint write MUST be logged at `ERROR` with `event_type: "checkpoint.write_failed"` and `run_id`; the server MUST NOT crash; the failed write is retried on the next state transition
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-105] [9_PROJECT_ROADMAP-REQ-183]** `AgentAdapter::detect_rate_limit()` MUST return `false` when
- **Type:** Functional
- **Description:** `AgentAdapter::detect_rate_limit()` MUST return `false` when `exit_code == 0`, regardless of stderr content; this invariant applies to all 5 adapter implementations
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-106] [9_PROJECT_ROADMAP-REQ-184]** Agent CLI flags MUST be defined as `const &str` in `devs-ada
- **Type:** Functional
- **Description:** Agent CLI flags MUST be defined as `const &str` in `devs-adapters/src/<name>/config.rs`; inline string literals for CLI flags in adapter implementation files are prohibited and detected by `./do lint`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-107] [9_PROJECT_ROADMAP-REQ-185]** `StageExecutor::cleanup()` MUST be called after every stage 
- **Type:** Quality
- **Description:** `StageExecutor::cleanup()` MUST be called after every stage execution regardless of outcome; cleanup failures MUST be logged at `WARN` with `event_type: "executor.cleanup_failed"` and MUST NOT propagate or affect stage status
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-108] [9_PROJECT_ROADMAP-REQ-186]** A pool configuration where all agents share the same API pro
- **Type:** Functional
- **Description:** A pool configuration where all agents share the same API provider MUST be rejected at config load time with an error identifying the provider name
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-109] [9_PROJECT_ROADMAP-REQ-187]** `devs_persist::permissions::set_secure_file()` and `devs_per
- **Type:** Technical
- **Description:** `devs_persist::permissions::set_secure_file()` and `devs_persist::permissions::set_secure_dir()` are the ONLY permitted call sites for `fs::set_permissions()`; direct calls elsewhere cause `./do lint` to exit non-zero
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-110] [9_PROJECT_ROADMAP-REQ-188]** `EnvKey` validation MUST reject `DEVS_LISTEN`, `DEVS_MCP_POR
- **Type:** Functional
- **Description:** `EnvKey` validation MUST reject `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`, and `DEVS_MCP_ADDR` as stage or workflow environment key names at validation time, before any agent is spawned
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-111] [9_PROJECT_ROADMAP-REQ-189]** `target/adapter-versions.json` MUST exist and have a `captur
- **Type:** Functional
- **Description:** `target/adapter-versions.json` MUST exist and have a `captured_at` timestamp no older than 7 days; `./do lint` exits non-zero if the file is absent or stale
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-112] [9_PROJECT_ROADMAP-REQ-190]** PTY capability is probed once at startup via `portable_pty::
- **Type:** Functional
- **Description:** PTY capability is probed once at startup via `portable_pty::native_pty_system().openpty()` and stored in `static AtomicBool PTY_AVAILABLE`; this probe MUST be performed via `tokio::task::spawn_blocking`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-191]** Agent binary not found at dispatch time | `StageRun` transit
- **Type:** Technical
- **Description:** Agent binary not found at dispatch time | `StageRun` transitions to `Failed` with `failure_reason: "binary not found"` immediately; no retry is attempted; `target/adapter-versions.json` staleness check is flagged in `./do lint`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-192]** `git2` push failure due to remote unreachable | Push failure
- **Type:** Security
- **Description:** `git2` push failure due to remote unreachable | Push failure logged at `WARN` with `event_type: "checkpoint.push_failed"`; local `checkpoint.json` remains authoritative; server continues; push is retried on the next checkpoint write
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-193]** Orphaned `checkpoint.json.tmp` found at startup | File is de
- **Type:** Security
- **Description:** Orphaned `checkpoint.json.tmp` found at startup | File is deleted with a `WARN` log; run state is reloaded from the authoritative `checkpoint.json` if present; if `checkpoint.json` is also absent the run is treated as `Unrecoverable`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-194]** Adapter `rate_limited_until` timestamp is in the past | Agen
- **Type:** Technical
- **Description:** Adapter `rate_limited_until` timestamp is in the past | Agent is treated as fully available; cooldown expires naturally without any manual reset; next pool selection includes the agent
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-195]** PTY allocation fails on non-Windows platform with `pty=true`
- **Type:** Technical
- **Description:** PTY allocation fails on non-Windows platform with `pty=true` default | If the adapter's default `pty=true` and `PTY_AVAILABLE=false`: spawn without PTY, emit `WARN` with `event_type: "adapter.pty_fallback"`; if stage explicitly configured `pty=true` and platform lacks PTY: `StageRun` → `Failed` with `failure_reason: "pty_unavailable"`, no auto-retry
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-196]** `.devs_context.json` write fails due to disk full | `StageRu
- **Type:** Technical
- **Description:** `.devs_context.json` write fails due to disk full | `StageRun` transitions to `Failed` before agent is spawned; `failure_reason: "context_write_failed"` logged at `ERROR`; server continues
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-197]** Workflow TOML with circular dependency submitted via `devs s
- **Type:** Technical
- **Description:** Workflow TOML with circular dependency submitted via `devs submit` | Server rejects with `invalid_argument`; error includes the full cycle path: `{"error": "cycle detected", "cycle": ["A", "B", "A"]}`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-198]** [AC-ROAD-P1-001]   A unit test simulates `ENOSPC` during a c
- **Type:** Technical
- **Description:** [AC-ROAD-P1-001]   A unit test simulates `ENOSPC` during a checkpoint write; the test asserts the server state is unchanged, no panic occurs, and the error is logged at `ERROR` with `event_type: "checkpoint.write_failed"`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-199]** [AC-ROAD-P1-002]   `detect_rate_limit(exit_code=0, stderr="r
- **Type:** Technical
- **Description:** [AC-ROAD-P1-002]   `detect_rate_limit(exit_code=0, stderr="rate limit exceeded")` returns `false` for all 5 adapters (claude, gemini, opencode, qwen, copilot)
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-200]** [AC-ROAD-P1-003]   `./do lint` exits non-zero when any file 
- **Type:** Technical
- **Description:** [AC-ROAD-P1-003]   `./do lint` exits non-zero when any file in `devs-adapters/src/` uses an inline string literal for a CLI flag (instead of a `const` in `config.rs`)
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-201]** [AC-ROAD-P1-004]   `./do lint` exits non-zero when any file 
- **Type:** Technical
- **Description:** [AC-ROAD-P1-004]   `./do lint` exits non-zero when any file outside `devs-checkpoint/src/permissions.rs` calls `fs::set_permissions()`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-202]** [AC-ROAD-P1-005]   Loading a `checkpoint.json` with invalid 
- **Type:** Technical
- **Description:** [AC-ROAD-P1-005]   Loading a `checkpoint.json` with invalid JSON marks the affected run as `Unrecoverable`; the server starts and recovers all other valid checkpoints; this is verified by an integration test
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-203]** [AC-ROAD-P1-006]   A pool configuration where all agents hav
- **Type:** Technical
- **Description:** [AC-ROAD-P1-006]   A pool configuration where all agents have `tool = "claude"` is rejected at config load with an error identifying `"claude"` as the only provider
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-204]** [AC-ROAD-P1-007]   A `target/adapter-versions.json` with `ca
- **Type:** Technical
- **Description:** [AC-ROAD-P1-007]   A `target/adapter-versions.json` with `captured_at` more than 7 days in the past causes `./do lint` to exit non-zero with a message identifying the stale file
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-205]** [AC-ROAD-P1-008]   `devs-executor` cleanup is verified by un
- **Type:** Technical
- **Description:** [AC-ROAD-P1-008]   `devs-executor` cleanup is verified by unit test to run after a stage that exits with exit code 1; the working directory is confirmed absent after cleanup
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-206]** [AC-ROAD-P1-009]   `./do coverage` QG-001 reports ≥90% line 
- **Type:** Quality
- **Description:** [AC-ROAD-P1-009]   `./do coverage` QG-001 reports ≥90% line coverage for each of `devs-config`, `devs-checkpoint`, `devs-adapters`, `devs-pool`, and `devs-executor` individually
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-207]** [ROAD-P1-DEP-001]  [ROAD-001]  Phase 0 must be complete (spe
- **Type:** Functional
- **Description:** [ROAD-P1-DEP-001]  [ROAD-001]  Phase 0 must be complete (specifically `devs-proto` and `devs-core` at Phase Transition Checkpoint).
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-208]** [ROAD-003]   Phase 2 — Workflow Engine
- **Type:** Technical
- **Description:** [ROAD-003]   Phase 2 — Workflow Engine
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-209]** [ROAD-016]   `devs-scheduler` / `devs-scheduler` Crates
- **Type:** Technical
- **Description:** [ROAD-016]   `devs-scheduler` / `devs-scheduler` Crates
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-210]** [ROAD-017]   `devs-webhook` Crate
- **Type:** Technical
- **Description:** [ROAD-017]   `devs-webhook` Crate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-201] [9_PROJECT_ROADMAP-REQ-211]** The DAG scheduler MUST dispatch newly eligible stages within
- **Type:** Functional
- **Description:** The DAG scheduler MUST dispatch newly eligible stages within 100 milliseconds of the last dependency transitioning to `Completed`; this is enforced by a unit test with a monotonic-clock assertion
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-202] [9_PROJECT_ROADMAP-REQ-212]** When a dependency stage reaches `Failed`, `TimedOut`, or `Ca
- **Type:** Functional
- **Description:** When a dependency stage reaches `Failed`, `TimedOut`, or `Cancelled` with no retry remaining, ALL downstream `Waiting` stages in its transitive closure MUST transition to `Cancelled` in a single atomic checkpoint write
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-203] [9_PROJECT_ROADMAP-REQ-213]** The workflow definition snapshot MUST be an owned deep-clone
- **Type:** Functional
- **Description:** The workflow definition snapshot MUST be an owned deep-clone of `WorkflowDefinition` captured under the per-project mutex at `submit_run` time; no `Arc` pointer to the live definition map is permitted
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-204] [9_PROJECT_ROADMAP-REQ-214]** `workflow_snapshot.json` is write-once; the persist layer MU
- **Type:** Functional
- **Description:** `workflow_snapshot.json` is write-once; the persist layer MUST return `Err(SnapshotError::AlreadyExists)` if the file already exists; callers treat this as an idempotency confirmation, not an error
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-205] [9_PROJECT_ROADMAP-REQ-215]** `pool.exhausted` webhook MUST fire at most once per exhausti
- **Type:** Functional
- **Description:** `pool.exhausted` webhook MUST fire at most once per exhaustion episode; the episode begins when all agents are unavailable and ends when at least one becomes available; additional rate-limit events during the same episode MUST NOT re-fire the webhook
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-206] [9_PROJECT_ROADMAP-REQ-216]** SSRF-blocked webhook deliveries are permanent failures with 
- **Type:** Functional
- **Description:** SSRF-blocked webhook deliveries are permanent failures with no retry; the blocked delivery MUST be logged at `WARN` with `event_type: "webhook.ssrf_blocked"`, `url` (query-params redacted), and `resolved_ip`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-207] [9_PROJECT_ROADMAP-REQ-217]** Webhook delivery MUST be fire-and-forget via `tokio::spawn`;
- **Type:** Functional
- **Description:** Webhook delivery MUST be fire-and-forget via `tokio::spawn`; no stage, scheduler task, or gRPC handler MUST block awaiting webhook delivery completion
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-208] [9_PROJECT_ROADMAP-REQ-218]** `weight = 0` MUST be rejected at project registration; the v
- **Type:** Functional
- **Description:** `weight = 0` MUST be rejected at project registration; the validation error MUST include the project name
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-209] [9_PROJECT_ROADMAP-REQ-219]** When a project is removed while active runs exist, the proje
- **Type:** Functional
- **Description:** When a project is removed while active runs exist, the project status transitions to `Removing`; active runs complete; subsequent `submit_run` calls MUST be rejected with `failed_precondition: "project is being removed"`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-210] [9_PROJECT_ROADMAP-REQ-220]** Fan-out `count` and `input_list` are mutually exclusive fiel
- **Type:** Functional
- **Description:** Fan-out `count` and `input_list` are mutually exclusive fields; `count = 0` or an empty `input_list` MUST be rejected at validation step 10 with `invalid_argument: "fan_out requires at least one item"`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-211] [9_PROJECT_ROADMAP-REQ-221]** Duplicate terminal events for the same `StageRun` (e.g., two
- **Type:** Functional
- **Description:** Duplicate terminal events for the same `StageRun` (e.g., two concurrent `stage_complete` signals) MUST be handled idempotently; the second event is silently discarded and logged at `DEBUG`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-212] [9_PROJECT_ROADMAP-REQ-222]** Rate-limit events MUST NOT increment `StageRun.attempt`; onl
- **Type:** Functional
- **Description:** Rate-limit events MUST NOT increment `StageRun.attempt`; only genuine failures (non-rate-limit non-zero exit codes) increment the attempt counter
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-223]** Two stages with identical `depends_on` complete within 1ms o
- **Type:** Technical
- **Description:** Two stages with identical `depends_on` complete within 1ms of each other | The per-run `Mutex` serializes both completions; exactly one checkpoint write per completion; the downstream stage is dispatched exactly once after both are `Completed`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-224]** `write_workflow_definition` called while a run using that de
- **Type:** Technical
- **Description:** `write_workflow_definition` called while a run using that definition is `Running` | The live definition map is updated atomically; the active run continues to use its immutable `definition_snapshot`; the next `submit_run` call uses the updated definition
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-225]** Fan-out with `count=64` and pool `max_concurrent=4` | Exactl
- **Type:** Technical
- **Description:** Fan-out with `count=64` and pool `max_concurrent=4` | Exactly 4 sub-agents acquire semaphore permits; 60 queue on the semaphore in FIFO order; the parent stage waits until all 64 sub-agents reach terminal states before merge
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-226]** Retry backoff timer fires for a stage after the parent run i
- **Type:** Technical
- **Description:** Retry backoff timer fires for a stage after the parent run is `Cancelled` | Scheduler discards the `RetryScheduled` event; the stage remains `Cancelled`; no agent is spawned; no error is emitted
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-227]** Webhook SSRF check DNS resolution times out | DNS timeout is
- **Type:** Technical
- **Description:** Webhook SSRF check DNS resolution times out | DNS timeout is not treated as SSRF; the delivery attempt fails for this attempt and is retried per the backoff schedule; the run and stage status are unaffected
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-228]** Exponential backoff with `initial_delay=2`, `max_attempts=10
- **Type:** Technical
- **Description:** Exponential backoff with `initial_delay=2`, `max_attempts=10`, `max_delay` absent | Delays (seconds): 2, 4, 8, 16, 32, 64, 128, 256, 300 (cap), 300 (cap); attempt counter increments for each genuine failure; rate-limit events between retries are not counted
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-229]** Workflow snapshot `write_workflow_definition` attempts to ov
- **Type:** Technical
- **Description:** Workflow snapshot `write_workflow_definition` attempts to overwrite existing `workflow_snapshot.json` | Persist layer returns `Err(SnapshotError::AlreadyExists)`; caller treats this as confirmation of idempotency; no file is modified
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-230]** [AC-ROAD-P2-001]   A unit test creates two independent stage
- **Type:** Technical
- **Description:** [AC-ROAD-P2-001]   A unit test creates two independent stages, completes the prerequisite stage, and asserts both downstream stages are dispatched within 100ms using `tokio::time::timeout`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-231]** [AC-ROAD-P2-002]   `cancel_run` transitions ALL non-terminal
- **Type:** Technical
- **Description:** [AC-ROAD-P2-002]   `cancel_run` transitions ALL non-terminal `StageRun` records to `Cancelled` in a single git commit; the test asserts exactly one commit is created in the checkpoint store for the cancellation
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-232]** [AC-ROAD-P2-003]   A workflow with cycle `A → B → A` returns
- **Type:** Technical
- **Description:** [AC-ROAD-P2-003]   A workflow with cycle `A → B → A` returns `INVALID_ARGUMENT` containing `"cycle": ["A", "B", "A"]` from both `submit_run` and `write_workflow_definition`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-233]** [AC-ROAD-P2-004]   `write_workflow_definition` does not modi
- **Type:** Technical
- **Description:** [AC-ROAD-P2-004]   `write_workflow_definition` does not modify any existing `workflow_snapshot.json` in `.devs/runs/`; verified by asserting file mtime is unchanged after the call
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-234]** [AC-ROAD-P2-005]   `pool.exhausted` webhook fires exactly on
- **Type:** Technical
- **Description:** [AC-ROAD-P2-005]   `pool.exhausted` webhook fires exactly once when all agents in a pool become rate-limited simultaneously, regardless of how many additional `report_rate_limit` calls follow during the same episode
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-235]** [AC-ROAD-P2-006]   `check_ssrf(url, allow_local=false)` retu
- **Type:** Technical
- **Description:** [AC-ROAD-P2-006]   `check_ssrf(url, allow_local=false)` returns `Err` for `192.168.1.1`, `10.0.0.1`, `127.0.0.1`, and `::1`; returns `Ok(())` for a public IP that resolves to a non-blocked range
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-236]** [AC-ROAD-P2-007]   Weighted fair queue dispatches two projec
- **Type:** Technical
- **Description:** [AC-ROAD-P2-007]   Weighted fair queue dispatches two projects with `weight=3` and `weight=1` at a ratio within ±10% of 3:1 over 100 consecutive dispatches
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-237]** [AC-ROAD-P2-008]   `./do coverage` QG-001 reports ≥90% line 
- **Type:** Quality
- **Description:** [AC-ROAD-P2-008]   `./do coverage` QG-001 reports ≥90% line coverage for `devs-scheduler` and `devs-webhook`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-238]** [ROAD-P2-DEP-001]  [ROAD-002]  Phase 1 must be complete (all
- **Type:** Quality
- **Description:** [ROAD-P2-DEP-001]  [ROAD-002]  Phase 1 must be complete (all infrastructure crates at 90% unit coverage).
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-239]** [ROAD-004]   Phase 3 — Server & Client Interfaces
- **Type:** Technical
- **Description:** [ROAD-004]   Phase 3 — Server & Client Interfaces
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-240]** [ROAD-018]   `devs-grpc` Crate
- **Type:** Technical
- **Description:** [ROAD-018]   `devs-grpc` Crate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-241]** [ROAD-019]   `devs-mcp` Crate
- **Type:** Technical
- **Description:** [ROAD-019]   `devs-mcp` Crate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-242]** [ROAD-020]   `devs-server` Binary
- **Type:** Technical
- **Description:** [ROAD-020]   `devs-server` Binary
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-243]** [ROAD-021]   `devs-cli` Binary (`devs-client-util` shared li
- **Type:** Technical
- **Description:** [ROAD-021]   `devs-cli` Binary (`devs-client-util` shared library)
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-244]** [ROAD-022]   `devs-tui` Binary
- **Type:** Technical
- **Description:** [ROAD-022]   `devs-tui` Binary
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-245]** [ROAD-023]   `devs-mcp-bridge` Binary
- **Type:** Technical
- **Description:** [ROAD-023]   `devs-mcp-bridge` Binary
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-301] [9_PROJECT_ROADMAP-REQ-246]** gRPC handler functions MUST contain ≤25 lines of handler log
- **Type:** Functional
- **Description:** gRPC handler functions MUST contain ≤25 lines of handler logic; all business logic MUST reside in engine-layer crates (`devs-scheduler`, `devs-pool`, `devs-executor`, etc.); this is enforced by a line-count check in `./do lint`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-302] [9_PROJECT_ROADMAP-REQ-247]** Wire types from `devs-proto` MUST NOT appear in the public A
- **Type:** Functional
- **Description:** Wire types from `devs-proto` MUST NOT appear in the public APIs of `devs-scheduler`, `devs-executor`, or `devs-pool`; `cargo tree` in `./do lint` verifies these crates do not import `devs-proto`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-303] [9_PROJECT_ROADMAP-REQ-248]** `devs-server` MUST NOT bind any TCP port before all config e
- **Type:** Functional
- **Description:** `devs-server` MUST NOT bind any TCP port before all config errors are collected and reported to stderr
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-304] [9_PROJECT_ROADMAP-REQ-249]** The discovery file MUST be written atomically (write-to-temp
- **Type:** Functional
- **Description:** The discovery file MUST be written atomically (write-to-temp → `rename()`) only after BOTH gRPC and MCP ports are successfully bound; it contains only the gRPC `<host>:<port>` address
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-305] [9_PROJECT_ROADMAP-REQ-250]** `devs-mcp-bridge` MUST NOT create any TCP listener; its role
- **Type:** Functional
- **Description:** `devs-mcp-bridge` MUST NOT create any TCP listener; its role is a pure stdin-to-HTTP proxy; verified by `netstat` assertion in E2E tests
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-306] [9_PROJECT_ROADMAP-REQ-251]** The Glass-Box MCP server MUST be active whenever the MCP por
- **Type:** Quality
- **Description:** The Glass-Box MCP server MUST be active whenever the MCP port is bound; no environment variable, feature flag, config entry, or build-time conditional may gate it
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-307] [9_PROJECT_ROADMAP-REQ-252]** TUI `render()` MUST complete within 16ms; no I/O, syscalls, 
- **Type:** Functional
- **Description:** TUI `render()` MUST complete within 16ms; no I/O, syscalls, `Arc`/`Mutex` acquisition, or proportional heap allocation is permitted inside any `Widget::render()` implementation
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-308] [9_PROJECT_ROADMAP-REQ-253]** All user-visible strings in `devs-tui` and `devs-cli` MUST b
- **Type:** Functional
- **Description:** All user-visible strings in `devs-tui` and `devs-cli` MUST be `pub const &'static str` in `strings.rs`; inline string literals for user-facing messages are prohibited; the strings hygiene lint in `./do lint` enforces this
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-309] [9_PROJECT_ROADMAP-REQ-254]** `devs-cli` in `--format json` mode MUST send ALL output (inc
- **Type:** Functional
- **Description:** `devs-cli` in `--format json` mode MUST send ALL output (including errors) to stdout as JSON; stderr MUST remain empty for the entire invocation
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-311] [9_PROJECT_ROADMAP-REQ-255]** The TUI MUST restore terminal state (raw mode off, cursor vi
- **Type:** Functional
- **Description:** The TUI MUST restore terminal state (raw mode off, cursor visible, alternate screen off) on ALL exit paths including panics; a `Drop`-based or `scopeguard`-based terminal guard is required
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-312] [9_PROJECT_ROADMAP-REQ-256]** `NO_COLOR` detection MUST occur only in `Theme::from_env()`,
- **Type:** Functional
- **Description:** `NO_COLOR` detection MUST occur only in `Theme::from_env()`, called exactly once during `App::new()`; no widget or command handler may read the `NO_COLOR` environment variable directly
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-257]** gRPC port already in use at server startup | Server reports 
- **Type:** Functional
- **Description:** gRPC port already in use at server startup | Server reports the error to stderr with port number, exits non-zero; the MCP port MUST NOT have been bound at this point; no discovery file is written
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-258]** MCP port in use after gRPC successfully binds | Server relea
- **Type:** Technical
- **Description:** MCP port in use after gRPC successfully binds | Server releases the gRPC socket, reports the MCP port collision error to stderr, exits non-zero; no discovery file is written
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-259]** Both gRPC and MCP configured to the same port value | Config
- **Type:** Functional
- **Description:** Both gRPC and MCP configured to the same port value | Config validation catches this before any port binding; error: `"invalid_argument: grpc_port and mcp_port must be different (both are <n>)"`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-260]** `devs-mcp-bridge` receives malformed JSON on stdin | Bridge 
- **Type:** Functional
- **Description:** `devs-mcp-bridge` receives malformed JSON on stdin | Bridge writes JSON-RPC parse error `{"id": null, "error": {"code": -32700, "message": "parse error"}}` to stdout and continues; MUST NOT exit
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-261]** TUI reconnect budget (35,000ms total) exhausted | TUI writes
- **Type:** Technical
- **Description:** TUI reconnect budget (35,000ms total) exhausted | TUI writes `"Disconnected from server. Exiting."`, restores terminal state, exits code 1; the 35,000ms budget = 30,000ms backoff + 5,000ms grace
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-262]** `devs logs --follow` on a stage in `Paused` state | Stream r
- **Type:** Technical
- **Description:** `devs logs --follow` on a stage in `Paused` state | Stream remains open; `follow` mode holds the HTTP connection; when the run is resumed and the stage completes, the stream delivers remaining output and exits 0 on `Completed`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-263]** MCP tool handler panics due to internal error | HTTP 500 ret
- **Type:** Functional
- **Description:** MCP tool handler panics due to internal error | HTTP 500 returned: `{"result": null, "error": "internal: tool handler panicked"}`; the server process MUST NOT crash; subsequent requests are handled normally
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-264]** `signal_completion` called twice on the same terminal stage 
- **Type:** Technical
- **Description:** `signal_completion` called twice on the same terminal stage | Second call returns `{"result": null, "error": "failed_precondition: stage is already in a terminal state"}`; state is unchanged; first call is idempotent
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-265]** gRPC client sends `x-devs-client-version` with a different m
- **Type:** Technical
- **Description:** gRPC client sends `x-devs-client-version` with a different major version | `FAILED_PRECONDITION` returned on ALL RPCs from that client; other concurrently connected clients with matching versions are unaffected
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-266]** TUI terminal resized below 80×24 | All tab content is replac
- **Type:** Technical
- **Description:** TUI terminal resized below 80×24 | All tab content is replaced with the single size warning: `"Terminal too small: 80x24 minimum required (current: WxH)"`; no other content is rendered
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-267]** [AC-ROAD-P3-001]   `devs-server` starts successfully on all 
- **Type:** Technical
- **Description:** [AC-ROAD-P3-001]   `devs-server` starts successfully on all 3 platforms; discovery file at `~/.config/devs/server.addr` (or `DEVS_DISCOVERY_FILE` path) contains `<host>:<grpc-port>`, is mode `0600`, and is written after both ports bind
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-268]** [AC-ROAD-P3-002]   SIGTERM causes the discovery file to be d
- **Type:** Technical
- **Description:** [AC-ROAD-P3-002]   SIGTERM causes the discovery file to be deleted and the server to exit 0; verified by an integration test that checks file absence after the server process exits
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-269]** [AC-ROAD-P3-003]   `grpcurl -plaintext localhost:7890 grpc.r
- **Type:** Technical
- **Description:** [AC-ROAD-P3-003]   `grpcurl -plaintext localhost:7890 grpc.reflection.v1alpha.ServerReflection/ServerReflectionInfo` returns all 6 service names
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-270]** [AC-ROAD-P3-004]   `devs submit` → `devs status` → `devs can
- **Type:** Technical
- **Description:** [AC-ROAD-P3-004]   `devs submit` → `devs status` → `devs cancel` CLI round-trip completes with correct exit codes; with `--format json`, stdout is valid JSON and stderr is empty for every command
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-271]** [AC-ROAD-P3-005]   All 20 MCP tools return `{"result": <non-
- **Type:** Technical
- **Description:** [AC-ROAD-P3-005]   All 20 MCP tools return `{"result": <non-null-object>, "error": null}` on valid input in E2E tests via `POST /mcp/v1/call` to a live server
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-272]** [AC-ROAD-P3-006]   `devs-mcp-bridge` E2E test: bridge binary
- **Type:** Technical
- **Description:** [AC-ROAD-P3-006]   `devs-mcp-bridge` E2E test: bridge binary forwards a `stream_logs(follow:true)` request and receives all chunks in order with monotonically increasing `sequence` numbers, followed by `{"done": true}`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-273]** [AC-ROAD-P3-007]   All required `insta` text snapshots exist
- **Type:** Technical
- **Description:** [AC-ROAD-P3-007]   All required `insta` text snapshots exist in `crates/devs-tui/tests/snapshots/*.txt`; `INSTA_UPDATE=always` is absent from the CI environment; a snapshot mismatch causes CI to exit non-zero
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-274]** [AC-ROAD-P3-008]   Concurrent `submit_run` calls with the sa
- **Type:** Technical
- **Description:** [AC-ROAD-P3-008]   Concurrent `submit_run` calls with the same run name result in exactly one `Pending` run and one `already_exists` error; verified by spawning two tokio tasks simultaneously
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-275]** [AC-ROAD-P3-009]   `cargo tree -p devs-mcp-bridge --edges no
- **Type:** Technical
- **Description:** [AC-ROAD-P3-009]   `cargo tree -p devs-mcp-bridge --edges normal` contains neither `tonic` nor `devs-proto`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-276]** [ROAD-P3-DEP-001]  [ROAD-003]  Phase 2 must be complete (`de
- **Type:** Quality
- **Description:** [ROAD-P3-DEP-001]  [ROAD-003]  Phase 2 must be complete (`devs-scheduler` and `devs-webhook` at unit test gate).
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-277]** [ROAD-P3-DEP-002]   `devs-cli` and `devs-tui` depend on `dev
- **Type:** Technical
- **Description:** [ROAD-P3-DEP-002]   `devs-cli` and `devs-tui` depend on `devs-server` being startable (ROAD-020 complete).
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-278]** [ROAD-P3-DEP-003]   `devs-mcp-bridge` depends on `devs-mcp` 
- **Type:** Technical
- **Description:** [ROAD-P3-DEP-003]   `devs-mcp-bridge` depends on `devs-mcp` HTTP server being bound (ROAD-019 complete).
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-279]** [ROAD-005]   Phase 4 — Self-Hosting & Agentic Development
- **Type:** Technical
- **Description:** [ROAD-005]   Phase 4 — Self-Hosting & Agentic Development
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-280]** [ROAD-024]   Bootstrap Validation
- **Type:** Technical
- **Description:** [ROAD-024]   Bootstrap Validation
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-401] [9_PROJECT_ROADMAP-REQ-281]** Bootstrap Phase MUST be time-boxed: if 150% of the planned P
- **Type:** Functional
- **Description:** Bootstrap Phase MUST be time-boxed: if 150% of the planned Phase 4 duration elapses without meeting all three COND-001/002/003 conditions simultaneously on all 3 CI platforms, fallback FB-007 MUST be activated per the Fallback Activation Protocol
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-402] [9_PROJECT_ROADMAP-REQ-282]** All 6 standard workflow TOMLs MUST be syntactically valid (a
- **Type:** Functional
- **Description:** All 6 standard workflow TOMLs MUST be syntactically valid (accepted by `devs submit`) before the first `SelfHostingAttempt`; a workflow rejected at submit time blocks the attempt
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-403] [9_PROJECT_ROADMAP-REQ-283]** The bootstrap completion ADR committed to `docs/adr/NNNN-boo
- **Type:** Functional
- **Description:** The bootstrap completion ADR committed to `docs/adr/NNNN-bootstrap-complete.md` MUST include the exact git commit SHA of the passing `presubmit-check` run and the GitLab CI pipeline URLs for all three platform jobs
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-404] [9_PROJECT_ROADMAP-REQ-284]** After bootstrap completion, `./do lint` MUST exit non-zero i
- **Type:** Functional
- **Description:** After bootstrap completion, `./do lint` MUST exit non-zero if any `// TODO: BOOTSTRAP-STUB` annotation remains in any Rust source file in the workspace
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-405] [9_PROJECT_ROADMAP-REQ-285]** RISK-009 MUST NOT transition to `Mitigated` until all three 
- **Type:** Quality
- **Description:** RISK-009 MUST NOT transition to `Mitigated` until all three COND-001/002/003 conditions are verified simultaneously on all 3 CI platforms in the same pipeline run
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-407] [9_PROJECT_ROADMAP-REQ-286]** The `code-review` workflow MUST be submitted for each crate 
- **Type:** Functional
- **Description:** The `code-review` workflow MUST be submitted for each crate after that crate first reaches the Phase 5 entry criteria; `critical_findings > 0` in the review output MUST cause the workflow to branch to `halt-for-remediation`, blocking further development on that crate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-408] [9_PROJECT_ROADMAP-REQ-287]** The agentic development loop MUST use a distinct `DEVS_DISCO
- **Type:** Functional
- **Description:** The agentic development loop MUST use a distinct `DEVS_DISCOVERY_FILE` path for every nested E2E test server instance; the production development server and test servers MUST NOT share a discovery file
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-288]** COND-001 met but `devs submit presubmit-check` returns a val
- **Type:** Technical
- **Description:** COND-001 met but `devs submit presubmit-check` returns a validation error (COND-002 fails) | Bootstrap Phase continues; the failure is diagnosed via `get_stage_output`; the specific error (e.g., missing pool name) is fixed and COND-002 re-attempted
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-289]** `presubmit-check` run completes but a coverage gate fails wi
- **Type:** Quality
- **Description:** `presubmit-check` run completes but a coverage gate fails within it (COND-003 not fully met) | COND-003 is NOT satisfied; the coverage gap is identified via `assert_stage_output` on the `coverage` stage; targeted tests are added and the run resubmitted
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-290]** Bootstrap Phase exceeds 150% of planned Phase 4 duration | F
- **Type:** Technical
- **Description:** Bootstrap Phase exceeds 150% of planned Phase 4 duration | Fallback FB-007 is activated: a `./do run-workflow` serial shell script is used as interim orchestration; a Fallback Activation Record is committed to `docs/adr/` before implementation
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-291]** Agentic loop agent loses MCP bridge connection mid-task | Ag
- **Type:** Technical
- **Description:** Agentic loop agent loses MCP bridge connection mid-task | Agent calls `list_runs` to find active runs, then calls `get_run(run_id)` to determine current state, resumes monitoring via `stream_logs(follow:true)` or cancels and re-submits as appropriate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-292]** Two observing agents simultaneously call `submit_run` for th
- **Type:** Technical
- **Description:** Two observing agents simultaneously call `submit_run` for the same workflow with identical run names | Exactly one succeeds with `Pending` status; the other receives `already_exists: "run name already in use for this project"`; per-project mutex prevents the TOCTOU race
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-293]** Standard workflow TOML references a pool name not present in
- **Type:** Functional
- **Description:** Standard workflow TOML references a pool name not present in `devs.toml` | `devs submit` returns `invalid_argument: "pool '<name>' not found in server configuration"`; the TOML must be corrected before Bootstrap can proceed
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-294]** Agent calls `report_rate_limit` and no fallback agent is ava
- **Type:** Technical
- **Description:** Agent calls `report_rate_limit` and no fallback agent is available | `StageRun` transitions to `Failed`; `pool.exhausted` webhook fires once for the episode; no fallback is attempted; `get_pool_state` reflects all agents rate-limited
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-295]** [AC-ROAD-P4-001]   All 6 standard workflow TOMLs (`tdd-red`,
- **Type:** Technical
- **Description:** [AC-ROAD-P4-001]   All 6 standard workflow TOMLs (`tdd-red`, `tdd-green`, `presubmit-check`, `build-only`, `unit-test-crate`, `e2e-all`) are accepted by `devs submit` without validation errors from a running server with the standard pool configuration
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-296]** [AC-ROAD-P4-002]   `devs submit presubmit-check --format jso
- **Type:** Technical
- **Description:** [AC-ROAD-P4-002]   `devs submit presubmit-check --format json` exits 0 and the output JSON contains a valid `run_id` UUID and `"status": "pending"`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-297]** [AC-ROAD-P4-003]   The submitted `presubmit-check` run reach
- **Type:** Technical
- **Description:** [AC-ROAD-P4-003]   The submitted `presubmit-check` run reaches `"status": "completed"` with all stages `"status": "completed"`; verified via `devs status <run_id> --format json`; confirmed on Linux, macOS, and Windows CI
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-298]** [AC-ROAD-P4-004]   `docs/adr/NNNN-bootstrap-complete.md` exi
- **Type:** Technical
- **Description:** [AC-ROAD-P4-004]   `docs/adr/NNNN-bootstrap-complete.md` exists after bootstrap with non-empty `commit_sha` and `ci_pipeline_url` fields and the date of completion
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-299]** [AC-ROAD-P4-005]   `./do lint` exits non-zero when any file 
- **Type:** Technical
- **Description:** [AC-ROAD-P4-005]   `./do lint` exits non-zero when any file in the workspace contains `// TODO: BOOTSTRAP-STUB`; exits 0 when no such annotation is present
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-300]** [AC-ROAD-P4-006]   `tdd-red` workflow stage exits non-zero (
- **Type:** Technical
- **Description:** [AC-ROAD-P4-006]   `tdd-red` workflow stage exits non-zero (test fails) before the implementation is written; `tdd-green` workflow stage exits 0 after the implementation is written; both verified in the same E2E test
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-301]** [ROAD-P4-DEP-001]  [ROAD-004]  Phase 3 complete: all three c
- **Type:** Technical
- **Description:** [ROAD-P4-DEP-001]  [ROAD-004]  Phase 3 complete: all three client binaries build and connect to a running server.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-302]** [ROAD-P4-DEP-002]   All 6 standard workflow TOMLs are syntac
- **Type:** Technical
- **Description:** [ROAD-P4-DEP-002]   All 6 standard workflow TOMLs are syntactically valid and accepted by `devs submit` before `SelfHostingAttempt`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-303]** [ROAD-P4-DEP-003]   `COND-001` must be verified before `COND
- **Type:** Functional
- **Description:** [ROAD-P4-DEP-003]   `COND-001` must be verified before `COND-002`; `COND-002` before `COND-003`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-304]** [ROAD-006]   Phase 5 — Quality Hardening & MVP Release
- **Type:** Technical
- **Description:** [ROAD-006]   Phase 5 — Quality Hardening & MVP Release
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-305]** [ROAD-025]   E2E Test Suite Completion
- **Type:** Technical
- **Description:** [ROAD-025]   E2E Test Suite Completion
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-501] [9_PROJECT_ROADMAP-REQ-306]** `./do coverage` MUST exit non-zero when `overall_passed: fal
- **Type:** Quality
- **Description:** `./do coverage` MUST exit non-zero when `overall_passed: false` in `target/coverage/report.json`; this causes `./do presubmit` to exit non-zero
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-502] [9_PROJECT_ROADMAP-REQ-307]** `./do test` MUST exit non-zero when `traceability_pct < 100.
- **Type:** Quality
- **Description:** `./do test` MUST exit non-zero when `traceability_pct < 100.0` OR `stale_annotations` is non-empty, even if all `cargo test` invocations individually pass
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-503] [9_PROJECT_ROADMAP-REQ-308]** E2E subprocess tests MUST set `LLVM_PROFILE_FILE=/tmp/devs-c
- **Type:** Quality
- **Description:** E2E subprocess tests MUST set `LLVM_PROFILE_FILE=/tmp/devs-coverage-%p.profraw` with the `%p` PID suffix; `./do coverage` MUST fail with a descriptive error if zero `.profraw` files are found for E2E runs
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-504] [9_PROJECT_ROADMAP-REQ-309]** CLI E2E tests contributing to QG-003 MUST invoke the `devs` 
- **Type:** Quality
- **Description:** CLI E2E tests contributing to QG-003 MUST invoke the `devs` binary as a subprocess via `assert_cmd 2.0`; calling internal Rust functions directly does NOT satisfy the QG-003 gate
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-505] [9_PROJECT_ROADMAP-REQ-310]** TUI E2E tests contributing to QG-004 MUST exercise the full 
- **Type:** Functional
- **Description:** TUI E2E tests contributing to QG-004 MUST exercise the full `handle_event() → render()` cycle via `ratatui::backend::TestBackend` at 200×50; pixel comparison is prohibited
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-506] [9_PROJECT_ROADMAP-REQ-311]** MCP E2E tests contributing to QG-005 MUST issue `POST /mcp/v
- **Type:** Functional
- **Description:** MCP E2E tests contributing to QG-005 MUST issue `POST /mcp/v1/call` requests to a running server instance via the `DEVS_MCP_ADDR` address; calling internal tool handler functions does NOT satisfy QG-005
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-507] [9_PROJECT_ROADMAP-REQ-312]** The MVP release tag MUST NOT be created until `fallback-regi
- **Type:** Functional
- **Description:** The MVP release tag MUST NOT be created until `fallback-registry.json` `active_count == 0` OR every active fallback has a committed Fallback Activation Record in `docs/adr/`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-508] [9_PROJECT_ROADMAP-REQ-313]** `docs/adapter-compatibility.md` MUST contain entries for all
- **Type:** Functional
- **Description:** `docs/adapter-compatibility.md` MUST contain entries for all 5 adapters with `last_tested_date` ≤90 days old at the time of MVP release; `./do lint` enforces this
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-509] [9_PROJECT_ROADMAP-REQ-314]** Each security-critical crate (`devs-mcp`, `devs-adapters`, `
- **Type:** Security
- **Description:** Each security-critical crate (`devs-mcp`, `devs-adapters`, `devs-checkpoint`, `devs-core`) MUST reach `critical_findings: 0` AND `high_findings: 0` from the `code-review` workflow before the MVP release tag is cut
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-BR-510] [9_PROJECT_ROADMAP-REQ-315]** `// llvm-cov:ignore` annotations MUST be used only for: plat
- **Type:** Quality
- **Description:** `// llvm-cov:ignore` annotations MUST be used only for: platform-conditional code (`#[cfg(windows)]`), unreachable infrastructure error paths, and generated code in `devs-proto/src/gen/`; all exclusions MUST be listed in `target/coverage/excluded_lines.txt`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-316]** A coverage gate drops below its threshold after adding a new
- **Type:** Quality
- **Description:** A coverage gate drops below its threshold after adding a new feature | `./do coverage` exits non-zero; `./do presubmit` exits non-zero; forward progress is blocked until coverage is restored; the specific uncovered lines are listed in `target/coverage/report.json`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-317]** A test annotation references a requirement ID that was remov
- **Type:** Quality
- **Description:** A test annotation references a requirement ID that was removed from a spec document | `stale_annotations` in `traceability.json` is non-empty; `./do test` exits non-zero; the stale `// Covers:` annotation MUST be removed or the spec document updated
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-318]** `cargo audit` advisory appears in a production dependency du
- **Type:** Security
- **Description:** `cargo audit` advisory appears in a production dependency during Phase 5 | `./do lint` exits non-zero; the dependency MUST be updated to a patched version or the advisory suppressed with justification and expiry date in `audit.toml`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-319]** One CI platform job fails while the other two pass | MVP rel
- **Type:** Quality
- **Description:** One CI platform job fails while the other two pass | MVP release is blocked; the specific failure MUST be diagnosed and fixed; fallback FB-006 (Linux-only gate) applies only when GitLab CI is unavailable, not when a job legitimately fails
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-320]** Docker E2E tests exhibit consistent flakiness over 2+ CI run
- **Type:** Technical
- **Description:** Docker E2E tests exhibit consistent flakiness over 2+ CI runs | Fallback FB-003 may be activated: Docker E2E tests tagged `#[cfg_attr(not(feature = "e2e_docker"), ignore)]`; QG-002 threshold may be reduced to 77% with a committed FAR
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-321]** An `insta` snapshot does not match the committed `.txt` file
- **Type:** Functional
- **Description:** An `insta` snapshot does not match the committed `.txt` file | CI exits non-zero; `INSTA_UPDATE=always` is prohibited in CI; the developer MUST review the `.new` snapshot locally, approve if correct, and commit the updated snapshot
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-322]** `target/traceability.json` `generated_at` is more than 1 hou
- **Type:** Quality
- **Description:** `target/traceability.json` `generated_at` is more than 1 hour old | Observing agents MUST submit `unit-test-crate` or `./do test` before beginning new implementation work
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-323]** [AC-ROAD-P5-001]   `./do coverage` generates `target/coverag
- **Type:** Quality
- **Description:** [AC-ROAD-P5-001]   `./do coverage` generates `target/coverage/report.json` with exactly 5 gate entries (QG-001 through QG-005), each containing `gate_id`, `threshold_pct`, `actual_pct`, `passed`, `delta_pct`; `overall_passed` equals the logical AND of all 5 `passed` fields
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-324]** [AC-ROAD-P5-002]   `./do test` generates `target/traceabilit
- **Type:** Quality
- **Description:** [AC-ROAD-P5-002]   `./do test` generates `target/traceability.json` with `traceability_pct == 100.0`, `stale_annotations: []`, and `overall_passed: true`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-325]** [AC-ROAD-P5-003]   `cargo audit --deny warnings` exits 0 fro
- **Type:** Security
- **Description:** [AC-ROAD-P5-003]   `cargo audit --deny warnings` exits 0 from a clean checkout of the MVP release commit
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-326]** [AC-ROAD-P5-005]   All three GitLab CI jobs (`presubmit-linu
- **Type:** Technical
- **Description:** [AC-ROAD-P5-005]   All three GitLab CI jobs (`presubmit-linux`, `presubmit-macos`, `presubmit-windows`) pass and complete within 25 minutes for the MVP release commit
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-327]** [AC-ROAD-P5-006]   `target/presubmit_timings.jsonl` shows ea
- **Type:** Technical
- **Description:** [AC-ROAD-P5-006]   `target/presubmit_timings.jsonl` shows each platform step completes within 900 seconds (15 minutes) total wall-clock time
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-328]** [AC-ROAD-P5-007]   `./do lint` exits non-zero when any `prin
- **Type:** Technical
- **Description:** [AC-ROAD-P5-007]   `./do lint` exits non-zero when any `println!`, `eprintln!`, or `log::` macro call is found in any library crate source file (excluding `devs-server`, `devs-cli`, `devs-tui`, `devs-mcp-bridge`)
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-329]** [ROAD-P5-DEP-001]  [ROAD-005]  Phase 4 complete: bootstrap m
- **Type:** Technical
- **Description:** [ROAD-P5-DEP-001]  [ROAD-005]  Phase 4 complete: bootstrap milestone achieved, agentic development loop active.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-330]** [ROAD-P5-DEP-002]   Docker E2E (`bollard` + Docker-in-Docker
- **Type:** Functional
- **Description:** [ROAD-P5-DEP-002]   Docker E2E (`bollard` + Docker-in-Docker) must be operational on `presubmit-linux` before QG-002 can be met.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-331]** [ROAD-P5-DEP-003]   SSH E2E (`~/.ssh/devs_test_key` provisio
- **Type:** Functional
- **Description:** [ROAD-P5-DEP-003]   SSH E2E (`~/.ssh/devs_test_key` provisioned by `./do setup`) must be operational before QG-002 can be met.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-332]** ROAD007["[ROAD-007] \nWorkspace + CI\n1w"]:::critical
- **Type:** Technical
- **Description:** ROAD007["[ROAD-007] \nWorkspace + CI\n1w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-333]** ROAD009["[ROAD-009] \ndevs-proto\n2w"]:::critical
- **Type:** Technical
- **Description:** ROAD009["[ROAD-009] \ndevs-proto\n2w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-334]** ROAD010["[ROAD-010] \ndevs-core\n3w"]:::critical
- **Type:** Technical
- **Description:** ROAD010["[ROAD-010] \ndevs-core\n3w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-335]** ROAD011["[ROAD-011] \ndevs-config\n2w"]:::float
- **Type:** Technical
- **Description:** ROAD011["[ROAD-011] \ndevs-config\n2w"]:::float
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-336]** ROAD012["[ROAD-012] \ndevs-checkpoint\n2w"]:::float
- **Type:** Technical
- **Description:** ROAD012["[ROAD-012] \ndevs-checkpoint\n2w"]:::float
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-337]** ROAD013["[ROAD-013] \ndevs-adapters\n3w"]:::critical
- **Type:** Technical
- **Description:** ROAD013["[ROAD-013] \ndevs-adapters\n3w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-338]** ROAD014["[ROAD-014] \ndevs-pool\n2w"]:::critical
- **Type:** Technical
- **Description:** ROAD014["[ROAD-014] \ndevs-pool\n2w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-339]** ROAD015["[ROAD-015] \ndevs-executor\n3w"]:::critical
- **Type:** Technical
- **Description:** ROAD015["[ROAD-015] \ndevs-executor\n3w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-340]** ROAD016["[ROAD-016] \ndevs-scheduler\n4w"]:::critical
- **Type:** Technical
- **Description:** ROAD016["[ROAD-016] \ndevs-scheduler\n4w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-341]** ROAD017["[ROAD-017] \ndevs-webhook\n2w"]:::float
- **Type:** Technical
- **Description:** ROAD017["[ROAD-017] \ndevs-webhook\n2w"]:::float
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-342]** ROAD018["[ROAD-018] \ndevs-grpc\n3w"]:::critical
- **Type:** Technical
- **Description:** ROAD018["[ROAD-018] \ndevs-grpc\n3w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-343]** ROAD019["[ROAD-019] \ndevs-mcp\n3w"]:::float
- **Type:** Technical
- **Description:** ROAD019["[ROAD-019] \ndevs-mcp\n3w"]:::float
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-344]** ROAD020["[ROAD-020] \ndevs-server\n2w"]:::critical
- **Type:** Technical
- **Description:** ROAD020["[ROAD-020] \ndevs-server\n2w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-345]** ROAD021["[ROAD-021] \ndevs-cli\n3w"]:::float
- **Type:** Technical
- **Description:** ROAD021["[ROAD-021] \ndevs-cli\n3w"]:::float
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-346]** ROAD022["[ROAD-022] \ndevs-tui\n4w"]:::critical
- **Type:** Technical
- **Description:** ROAD022["[ROAD-022] \ndevs-tui\n4w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-347]** ROAD023["[ROAD-023] \ndevs-mcp-bridge\n1w"]:::float
- **Type:** Technical
- **Description:** ROAD023["[ROAD-023] \ndevs-mcp-bridge\n1w"]:::float
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-348]** ROAD024["[ROAD-024] \nBootstrap\n2w"]:::critical
- **Type:** Technical
- **Description:** ROAD024["[ROAD-024] \nBootstrap\n2w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-349]** ROAD025["[ROAD-025] \nMVP E2E + Gates\n6w"]:::critical
- **Type:** Quality
- **Description:** ROAD025["[ROAD-025] \nMVP E2E + Gates\n6w"]:::critical
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-002] [9_PROJECT_ROADMAP-REQ-350]** `devs-scheduler` is the second-highest-leverage node. It agg
- **Type:** Security
- **Description:** `devs-scheduler` is the second-highest-leverage node. It aggregates all Phase 1 crates and is a prerequisite for `devs-grpc`, `devs-mcp`, and `devs-webhook`. The 100 ms dispatch latency requirement (` `) must be verified by a benchmark test before `devs-grpc` is authored: if the scheduler cannot meet this SLA with its internal `SchedulerEvent` mpsc channel, the latency will only worsen once gRPC serialization is added. The event-driven dispatch loop, per-run `Arc<Mutex<RunState>>`, and lock acquisition order (`SchedulerState → PoolState → CheckpointStore`) must all be proven correct under concurrent load.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-004] [9_PROJECT_ROADMAP-REQ-351]** When `devs-grpc` and `devs-mcp` are developed in parallel, a
- **Type:** Functional
- **Description:** When `devs-grpc` and `devs-mcp` are developed in parallel, any amendment to a `proto/devs/v1/*.proto` file MUST be coordinated between both tracks: both tracks must re-run `cargo build -p devs-proto` and confirm compilation before continuing. Proto amendments are tracked in the commit log; a proto file touched by one track that breaks the other constitutes a blocking conflict.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-005] [9_PROJECT_ROADMAP-REQ-352]** `devs-cli` and `devs-tui` share the `devs-client-util` helpe
- **Type:** Quality
- **Description:** `devs-cli` and `devs-tui` share the `devs-client-util` helper crate (`discover_grpc_addr()`, `connect_lazy()`, `Formatter` trait). The `devs-client-util` API surface MUST be defined in full (all exported function signatures, all error types) before either `devs-cli` or `devs-tui` begins implementation. A late API change in `devs-client-util` during parallel development propagates breaking changes to both tracks simultaneously.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-006] [9_PROJECT_ROADMAP-REQ-353]** `devs-pool` and `devs-adapters` may appear to be parallel ca
- **Type:** Security
- **Description:** `devs-pool` and `devs-adapters` may appear to be parallel candidates (both depend on `devs-core`) but `devs-pool` depends on the `AgentAdapter` trait exported by `devs-adapters`. Only `devs-adapters` unit tests (not integration with a live pool) can proceed before `devs-adapters` is complete. The `devs-pool` agent selection algorithm cannot be authored until the `AgentAdapter` trait signature is finalized.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-007] [9_PROJECT_ROADMAP-REQ-354]** Float values are computed once at project start from estimat
- **Type:** Functional
- **Description:** Float values are computed once at project start from estimated durations. If any node's actual duration exceeds its estimate, float values for all successor nodes MUST be recomputed. The project coordinator (the agentic developer) MUST recompute float whenever any node takes more than 20% longer than estimated. Float recomputation is a manual process in Phase 0–4; it becomes partially automatable in Phase 5 via the Glass-Box MCP `get_run` tool applied to the project's own workflow runs.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-008] [9_PROJECT_ROADMAP-REQ-355]** Float MUST NOT be treated as a buffer for known scope. Float
- **Type:** Functional
- **Description:** Float MUST NOT be treated as a buffer for known scope. Float represents slack for unknown risk, not intentional feature delay. Deliberately scheduling work to consume float without a documented risk trigger constitutes a schedule violation and MUST be recorded as a RISK activation in `docs/adr/`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-009] [9_PROJECT_ROADMAP-REQ-356]** A Severe or Critical slip on any of the following nodes trig
- **Type:** Technical
- **Description:** A Severe or Critical slip on any of the following nodes triggers immediate fallback evaluation: ROAD-010 (`devs-core`), ROAD-016 (`devs-scheduler`), ROAD-024 (Bootstrap validation). These three nodes have no float, no pre-approved fallback that reduces their scope, and are the highest-leverage nodes in the graph.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-010] [9_PROJECT_ROADMAP-REQ-357]** A Moderate slip on `devs-tui` (ROAD-022) MUST trigger a para
- **Type:** Quality
- **Description:** A Moderate slip on `devs-tui` (ROAD-022) MUST trigger a parallel effort to advance `devs-cli` (which has 1 week of float) to ensure the bootstrap validation gate (ROAD-024) is not delayed. The `devs-cli` `devs submit presubmit-check` capability is sufficient to satisfy COND-002 and COND-003 even without the TUI being fully functional.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-011] [9_PROJECT_ROADMAP-REQ-358]** A slip on ROAD-025 (MVP E2E + gates) is self-limiting: the c
- **Type:** Security
- **Description:** A slip on ROAD-025 (MVP E2E + gates) is self-limiting: the coverage gates are pass/fail per interface. Each week of additional E2E test authoring increments specific QG gate percentages. If QG-001 (unit tests) is at risk, unit test authoring takes priority over E2E authoring because QG-001 is the widest gate (90%) and its shortfall propagates the most uncovered lines to the other gates.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-001] [9_PROJECT_ROADMAP-REQ-359]** `devs-core` MUST achieve ≥90% unit line coverage (QG-001 sco
- **Type:** Quality
- **Description:** `devs-core` MUST achieve ≥90% unit line coverage (QG-001 scoped to `devs-core`) before any Phase 1 crate begins implementation. `./do coverage` scoped to `devs-core` MUST exit 0 as a prerequisite for the Phase 0→1 checkpoint.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-002] [9_PROJECT_ROADMAP-REQ-360]** `devs-scheduler` MUST demonstrate ≤100 ms dispatch latency i
- **Type:** Functional
- **Description:** `devs-scheduler` MUST demonstrate ≤100 ms dispatch latency in an automated benchmark test (two independent stages dispatched within 100 ms of dependency completion) before `devs-grpc` begins implementation. The benchmark MUST be committed and passing before the Phase 2→3 checkpoint.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-003] [9_PROJECT_ROADMAP-REQ-361]** The bootstrap completion gate (Phase 4, COND-001 through CON
- **Type:** Security
- **Description:** The bootstrap completion gate (Phase 4, COND-001 through COND-003) MUST be satisfied on all 3 CI platforms simultaneously before Phase 5 E2E work begins. No E2E test authoring is authorized until `docs/adr/NNNN-bootstrap-complete.md` is committed.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-004] [9_PROJECT_ROADMAP-REQ-362]** When `devs-grpc` and `devs-mcp` are in parallel development,
- **Type:** Functional
- **Description:** When `devs-grpc` and `devs-mcp` are in parallel development, any amendment to `proto/devs/v1/*.proto` MUST cause both tracks to re-run `cargo build -p devs-proto` and confirm compilation before proceeding. A proto amendment that breaks the parallel track is a blocking conflict.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-005] [9_PROJECT_ROADMAP-REQ-363]** The `devs-client-util` API surface (all exported function si
- **Type:** Functional
- **Description:** The `devs-client-util` API surface (all exported function signatures and error types) MUST be defined in full before `devs-cli` or `devs-tui` implementation begins. Any post-definition change to `devs-client-util` exports requires coordinated update across both client crates.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-006] [9_PROJECT_ROADMAP-REQ-364]** `devs-pool` MUST NOT begin agent selection algorithm impleme
- **Type:** Functional
- **Description:** `devs-pool` MUST NOT begin agent selection algorithm implementation until `devs-adapters` has finalized and committed the `AgentAdapter` trait signature. A trait change after pool implementation begins is a blocking conflict requiring coordinated multi-crate changes.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-007] [9_PROJECT_ROADMAP-REQ-365]** Float values MUST be recomputed whenever any node takes more
- **Type:** Functional
- **Description:** Float values MUST be recomputed whenever any node takes more than 20% longer than its estimated duration. Recomputed float values MUST be recorded in the weekly status section of `docs/adr/`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-008] [9_PROJECT_ROADMAP-REQ-366]** Float MUST NOT be scheduled for known scope; it is reserved 
- **Type:** Functional
- **Description:** Float MUST NOT be scheduled for known scope; it is reserved for unknown risk only. Intentionally scheduling work to consume float without a documented risk trigger MUST be recorded as a RISK activation.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-009] [9_PROJECT_ROADMAP-REQ-367]** A Severe or Critical slip (>1 week) on ROAD-010, ROAD-016, o
- **Type:** Functional
- **Description:** A Severe or Critical slip (>1 week) on ROAD-010, ROAD-016, or ROAD-024 triggers mandatory fallback evaluation. The result of the evaluation (fallback selected, fallback unavailable, scope reduced) MUST be committed to `docs/adr/` before work on the affected node continues.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-010] [9_PROJECT_ROADMAP-REQ-368]** A Moderate slip (>0.5w) on `devs-tui` MUST trigger parallel 
- **Type:** Quality
- **Description:** A Moderate slip (>0.5w) on `devs-tui` MUST trigger parallel prioritization of `devs-cli` `devs submit` capability to protect the bootstrap validation gate. The `devs-cli` binary producing valid `devs submit presubmit-check --format json` output satisfies COND-002 independently of TUI completion.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-011] [9_PROJECT_ROADMAP-REQ-369]** During Phase 5, if QG-001 (unit ≥90%) is failing, unit test 
- **Type:** Security
- **Description:** During Phase 5, if QG-001 (unit ≥90%) is failing, unit test authoring MUST take priority over E2E test authoring. A failing QG-001 gate indicates uncovered logic paths that may contain defects; coverage at the E2E level cannot substitute for uncovered unit paths.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-012] [9_PROJECT_ROADMAP-REQ-370]** The maximum number of simultaneously active fallbacks is 3 (
- **Type:** Technical
- **Description:** The maximum number of simultaneously active fallbacks is 3 (per FB-BR-004). If a fourth critical path slip requires fallback activation, the project enters `Blocked` state and an architecture review is mandatory before any further implementation work.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-371]** `devs-core` type refactor required mid-Phase 1 (e.g., `Bound
- **Type:** Functional
- **Description:** `devs-core` type refactor required mid-Phase 1 (e.g., `BoundedString` constraint change) | ROAD-010 (retroactive) | All Phase 1 crates re-validate against new types. The change is treated as a Severe slip on ROAD-010; float recalculation required for all successors. `cargo build --workspace` must exit 0 after the change before any Phase 1 crate resumes.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-372]** `devs-adapters` `AgentAdapter` trait changes after `devs-poo
- **Type:** Technical
- **Description:** `devs-adapters` `AgentAdapter` trait changes after `devs-pool` has begun | ROAD-013, ROAD-014 | Both crates enter a synchronized update cycle. `devs-pool` is paused until `devs-adapters` re-stabilizes. The conflict is logged as a schedule event in `docs/adr/`; the slip duration is added to ROAD-014's actual duration for float tracking.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-373]** `devs-scheduler` fails the 100 ms dispatch benchmark by 30% 
- **Type:** Functional
- **Description:** `devs-scheduler` fails the 100 ms dispatch benchmark by 30% (130 ms actual) | ROAD-016 | Work on `devs-grpc` is blocked. The scheduler's event loop is profiled; `target/presubmit_timings.jsonl` reviewed for mpsc channel contention. The benchmark MUST pass before the Phase 2→3 checkpoint regardless of elapsed calendar time.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-374]** `devs-tui` snapshot tests fail because a `ratatui` update ch
- **Type:** Technical
- **Description:** `devs-tui` snapshot tests fail because a `ratatui` update changes rendering output | ROAD-022 | Snapshot files are reviewed manually (never auto-approved in CI via `INSTA_UPDATE=always`). The correct rendered output is verified against the spec before approving updated snapshots. This slip is recorded; if >0.5 weeks, ROAD-021 (`devs-cli`) is parallel-prioritized.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-375]** Bootstrap validation (ROAD-024) passes on Linux but fails on
- **Type:** Functional
- **Description:** Bootstrap validation (ROAD-024) passes on Linux but fails on Windows due to path separator in discovery file | ROAD-024 | The discovery file read path uses `dirs::home_dir()` not `std::env::var("HOME")`. Forward-slash normalization is applied via `normalize_path_display()`. The Windows failure is a blocking condition for COND-001; it must be resolved before the bootstrap ADR is committed.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-376]** Phase 5 E2E tests achieve QG-003 (CLI ≥50%) but fall short o
- **Type:** Security
- **Description:** Phase 5 E2E tests achieve QG-003 (CLI ≥50%) but fall short of QG-004 (TUI ≥50%) at week 34 | ROAD-025 | The TUI gap is prioritized for the final week. E2E tests using `TestBackend` full `handle_event→render` cycle are authored to cover the uncovered TUI paths. The gap analysis uses `target/coverage/lcov.info` to identify specific uncovered lines in `devs-tui`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CRIT-007] [9_PROJECT_ROADMAP-REQ-377]** `devs-config` (float=6w) is neglected until week 12 and caus
- **Type:** Technical
- **Description:** `devs-config` (float=6w) is neglected until week 12 and causes a Severe slip on ROAD-014 | ROAD-011, ROAD-014 | This is the exact scenario float exists to handle; ROAD-014's Late Finish is week 14, and ROAD-011's Late Finish is week 14. If `devs-config` is not complete by week 12 (its Late Start), it joins the critical path and delays ROAD-014. Float recomputation is triggered per ` `.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-378]** `devs-checkpoint` git2 integration reveals `git2` API incomp
- **Type:** Security
- **Description:** `devs-checkpoint` git2 integration reveals `git2` API incompatibility with `MSRV 1.80.0` on Windows | ROAD-012 | `git2 0.19` is in the authoritative version table. The `git2` crate itself has no MSRV guarantee below 1.63. If a `git2` API used in `devs-checkpoint` is not available at MSRV, either the feature must use a lower-level `git2` API or the MSRV must be documented as a constraint. This slip is recorded; since float=6w, it does not immediately threaten the critical path.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-379]** `devs-webhook` HTTP client uses `reqwest` with `native-tls` 
- **Type:** Security
- **Description:** `devs-webhook` HTTP client uses `reqwest` with `native-tls` feature by mistake | ROAD-017 | `./do lint` dependency audit detects `native-tls` in `cargo tree`. `SEC-083` prohibits `native-tls`; `./do lint` exits non-zero. The `reqwest` features in `Cargo.toml` are corrected to `rustls-tls` before continuing. Since float=1w, this is a Minor slip.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-380]** Both `devs-grpc` and `devs-mcp` authors simultaneously amend
- **Type:** Security
- **Description:** Both `devs-grpc` and `devs-mcp` authors simultaneously amend `run.proto` | ROAD-018, ROAD-019 | The second author to push gets a merge conflict on `devs-proto/src/gen/`. The generated file is regenerated after resolving the proto conflict. Both tracks re-run `cargo build -p devs-proto` before continuing.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-381]** `devs-client-util` API change required after `devs-cli` is 5
- **Type:** Technical
- **Description:** `devs-client-util` API change required after `devs-cli` is 50% complete | ROAD-021, ROAD-022 | The API change is assessed: if additive (new optional function), it proceeds with both tracks updated in parallel. If breaking (signature change), `devs-cli` work pauses; `devs-client-util` is stabilized; `devs-cli` resumes. A breaking change mid-implementation counts as a Moderate slip on both tracks.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-382]** `devs-mcp-bridge` (float=5w) discovers that `devs-mcp` HTTP 
- **Type:** Technical
- **Description:** `devs-mcp-bridge` (float=5w) discovers that `devs-mcp` HTTP chunked transfer has a bug affecting streaming | ROAD-023, ROAD-019 | The bug is in `devs-mcp` (critical path), not in the bridge. `devs-mcp` is patched. Since the bridge has 5 weeks of float, this does not affect the critical path unless the `devs-mcp` fix takes more than 5 weeks.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-CRIT-001] [9_PROJECT_ROADMAP-REQ-383]**   `devs-core` unit line coverage reaches ≥90.0% (measured by
- **Type:** Quality
- **Description:**   `devs-core` unit line coverage reaches ≥90.0% (measured by `cargo llvm-cov --package devs-core`) before any Phase 1 crate has more than stub-level code. Verified by: `./do coverage` with per-crate breakdown showing `devs-core` at ≥90.0% while all Phase 1 crates are at 0.0% unit coverage.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-CRIT-002] [9_PROJECT_ROADMAP-REQ-384]**   A benchmark test in `devs-scheduler/benches/dispatch_laten
- **Type:** Functional
- **Description:**   A benchmark test in `devs-scheduler/benches/dispatch_latency.rs` measures the wall-clock time from the last `Completed` event for a stage's dependencies to the `Running` transition of the dependent stage. The benchmark asserts this is ≤100 ms for 100 independent dependency-completion events under concurrent load. This test MUST pass before `devs-grpc` has any implementation code.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-CRIT-003] [9_PROJECT_ROADMAP-REQ-385]**   `cargo tree -p devs-core --edges normal` produces output t
- **Type:** Security
- **Description:**   `cargo tree -p devs-core --edges normal` produces output that does NOT contain any of: `tokio`, `git2`, `reqwest`, `tonic`. This assertion is run by `./do lint` as a dependency audit step and exits non-zero if any prohibited crate appears. Verified: CI artifact `./do lint` log shows zero violations.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-CRIT-004] [9_PROJECT_ROADMAP-REQ-386]**   The CPM node table (§4.3) is internally consistent: for ev
- **Type:** Technical
- **Description:**   The CPM node table (§4.3) is internally consistent: for every node, `EF = ES + Duration`, `LF = LS + Duration`, `Float = LS − ES`, and `LF ≤ project end date (35w)`. Any node with `Float = 0` is listed as critical (`YES`). This is verified by a lint script in `./do lint` that parses the table from the spec and validates arithmetic.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-CRIT-005] [ROAD-CRIT-004] [9_PROJECT_ROADMAP-REQ-387]**   The parallel track conflict rule for `devs-grpc` and `devs
- **Type:** Technical
- **Description:**   The parallel track conflict rule for `devs-grpc` and `devs-mcp` (` `) is operationally verified: a test in `devs-proto/tests/compilation_test.rs` confirms that after any amendment to a `.proto` file, `cargo build -p devs-proto` exits 0 and the generated code compiles in both `devs-grpc` and `devs-mcp`. This test is run as part of `./do test`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-CRIT-006] [9_PROJECT_ROADMAP-REQ-388]**   Bootstrap validation (ROAD-024) is verified on all 3 CI pl
- **Type:** Quality
- **Description:**   Bootstrap validation (ROAD-024) is verified on all 3 CI platforms: `./do ci` completes with `presubmit-linux`, `presubmit-macos`, and `presubmit-windows` all green, and the pipeline artifact includes `target/traceability.json` with `overall_passed: true` (verifying COND-003). The `docs/adr/NNNN-bootstrap-complete.md` file references the specific CI pipeline URL for each platform.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-CRIT-007] [9_PROJECT_ROADMAP-REQ-389]**   The slippage state machine (§4.7 diagram) is reflected in 
- **Type:** Technical
- **Description:**   The slippage state machine (§4.7 diagram) is reflected in the project's documented state at every ADR entry: each `docs/adr/` entry that represents a fallback activation includes fields `slip_amount_weeks`, `affected_node`, `float_at_activation`, and `end_date_impact`. The absence of these fields in an active fallback ADR causes `./do lint` to exit non-zero via the FAR validation check.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-CRIT-008] [9_PROJECT_ROADMAP-REQ-390]**   Float values in the CPM node table (§4.3) are consistent w
- **Type:** Technical
- **Description:**   Float values in the CPM node table (§4.3) are consistent with the dependency graph in the Mermaid diagram (§4.2): for every edge `A → B` in the diagram, node B's `ES ≥ A.EF`. This is verified by the same lint script that validates §4.3 arithmetic (AC-CRIT-004).
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-CRIT-009] [ROAD-CRIT-009] [9_PROJECT_ROADMAP-REQ-391]**   `target/presubmit_timings.jsonl` produced by `./do presubm
- **Type:** Quality
- **Description:**   `target/presubmit_timings.jsonl` produced by `./do presubmit` contains one entry per step with `over_budget` set correctly. The steps: `setup`, `lint`, `test`, `coverage` correspond to the Phase 0 CPM node (ROAD-007/ROAD-008) deliverables. A `duration_ms` that exceeds `budget_ms` by >20% in two consecutive CI runs triggers an automatic `WARN:` in `./do presubmit` output, consistent with ` ` Moderate slip threshold monitoring for RISK-005.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[AC-CRIT-010] [9_PROJECT_ROADMAP-REQ-392]**   `devs-client-util` exports exactly the functions declared 
- **Type:** Technical
- **Description:**   `devs-client-util` exports exactly the functions declared in its §3 Phase Details specification before any `devs-cli` or `devs-tui` code calls them. Verified by: `cargo doc -p devs-client-util --no-deps` produces documentation with no `missing_docs` warnings; the documented API surface matches the function signatures specified in ROAD-021/ROAD-022 deliverables.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-393]** `schema_version` | integer | Always `1` | Schema version for
- **Type:** Technical
- **Description:** `schema_version` | integer | Always `1` | Schema version for forward compatibility
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-394]** `checkpoint_id` | string | `ROAD-CHECK-(0-9){3}` | Identifie
- **Type:** Technical
- **Description:** `checkpoint_id` | string | `ROAD-CHECK-(0-9){3}` | Identifier matching the checkpoint tag in this spec
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-395]** `phase_id` | string | `p0`–`p5` | Lowercase phase identifier
- **Type:** Technical
- **Description:** `phase_id` | string | `p0`–`p5` | Lowercase phase identifier
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-396]** `attempt` | integer | ≥ 1 | Number of attempts including thi
- **Type:** Technical
- **Description:** `attempt` | integer | ≥ 1 | Number of attempts including this one
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-397]** `status` | string | `pending`, `passed`, or `failed` | Final
- **Type:** Technical
- **Description:** `status` | string | `pending`, `passed`, or `failed` | Final outcome; `pending` while CI is running
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-398]** `commit_sha` | string | 40-char hex | SHA of the HEAD commit
- **Type:** Technical
- **Description:** `commit_sha` | string | 40-char hex | SHA of the HEAD commit at time of attempt
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-399]** `ci_pipeline_urls` | object | All 3 keys required | URLs to 
- **Type:** Technical
- **Description:** `ci_pipeline_urls` | object | All 3 keys required | URLs to the triggering GitLab pipelines; `null` if CI unavailable
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-400]** `checks[].status` | string | `passed`, `failed`, or `skipped
- **Type:** Technical
- **Description:** `checks[].status` | string | `passed`, `failed`, or `skipped` | `skipped` valid only for platform-specific checks not applicable to current CI job
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-401]** `checks[].failure_detail` | string or null | Max 4096 chars 
- **Type:** Technical
- **Description:** `checks[].failure_detail` | string or null | Max 4096 chars | Human-readable failure reason; `null` on pass
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-402]** `blocker` | string or null | — | If `status: "failed"`, the 
- **Type:** Technical
- **Description:** `blocker` | string or null | — | If `status: "failed"`, the primary failing check name; otherwise `null`
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-403]** [ROAD-CHECK-BR-001]   A `passed` checkpoint record MUST NOT 
- **Type:** Functional
- **Description:** [ROAD-CHECK-BR-001]   A `passed` checkpoint record MUST NOT be overwritten; `./do lint` verifies that `docs/plan/checkpoints/<phase-id>/` contains at most one record with `status: "passed"`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-404]** [ROAD-CHECK-BR-002]   A `failed` attempt MUST result in a ne
- **Type:** Functional
- **Description:** [ROAD-CHECK-BR-002]   A `failed` attempt MUST result in a new record (`attempt_N+1.json`) rather than mutating the existing failed record.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-405]** [ROAD-CHECK-BR-003]   The record MUST be committed to the ch
- **Type:** Functional
- **Description:** [ROAD-CHECK-BR-003]   The record MUST be committed to the checkpoint branch in an atomic git commit before the CI pipeline is marked as complete.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-406]** [ROAD-CHECK-BR-004]   `checks[].status == "skipped"` is only
- **Type:** Technical
- **Description:** [ROAD-CHECK-BR-004]   `checks[].status == "skipped"` is only valid when the check has `"platform": "windows"` and the current CI job is `presubmit-linux` or `presubmit-macos`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-407]** [ROAD-CHECK-BR-005]   If `ci_pipeline_urls` are all `null`, 
- **Type:** Technical
- **Description:** [ROAD-CHECK-BR-005]   If `ci_pipeline_urls` are all `null`, the checkpoint record is valid only for local triage; a CI-backed attempt is required for `status: "passed"`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-408]** [ROAD-CHECK-BR-006]   A checkpoint is `passed` only when the
- **Type:** Technical
- **Description:** [ROAD-CHECK-BR-006]   A checkpoint is `passed` only when the CI pipeline shows all three of `presubmit-linux`, `presubmit-macos`, and `presubmit-windows` green for the same commit SHA.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-409]** [ROAD-CHECK-BR-007]   A regression on one platform after a c
- **Type:** Technical
- **Description:** [ROAD-CHECK-BR-007]   A regression on one platform after a checkpoint has `passed` does NOT roll the checkpoint back to `failed`. However, it blocks the *next* phase checkpoint until the regression is fixed.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-410]** [ROAD-CHECK-BR-008]   For checks whose verification method i
- **Type:** Functional
- **Description:** [ROAD-CHECK-BR-008]   For checks whose verification method is `Unit test` or `Integration test`, "all 3 platforms" means the test must pass in all three CI environments. For checks whose verification method is `./do lint`, the lint must pass in all three shell environments.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-411]** [ROAD-CHECK-BR-009]   The 900-second presubmit wall-clock ti
- **Type:** Technical
- **Description:** [ROAD-CHECK-BR-009]   The 900-second presubmit wall-clock timeout applies per platform independently. A timeout on one platform causes that platform's job to exit non-zero, blocking the checkpoint.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-412]** [ROAD-CHECK-BR-010]   No check may be waived without an expl
- **Type:** Technical
- **Description:** [ROAD-CHECK-BR-010]   No check may be waived without an explicit pre-approved fallback. A waived check without a corresponding active entry in `fallback-registry.json` causes `./do presubmit` to exit non-zero with `"checkpoint check waived without active fallback: <check_name>"`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CHECK-001] [9_PROJECT_ROADMAP-REQ-413]** Phase 0 → Phase 1 Checkpoint
- **Type:** Technical
- **Description:** Phase 0 → Phase 1 Checkpoint
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CHECK-002] [9_PROJECT_ROADMAP-REQ-414]** Phase 1 → Phase 2 Checkpoint
- **Type:** Technical
- **Description:** Phase 1 → Phase 2 Checkpoint
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CHECK-003] [9_PROJECT_ROADMAP-REQ-415]** Phase 2 → Phase 3 Checkpoint
- **Type:** Technical
- **Description:** Phase 2 → Phase 3 Checkpoint
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CHECK-004] [9_PROJECT_ROADMAP-REQ-416]** Phase 3 → Phase 4 Checkpoint (Bootstrap Complete)
- **Type:** Technical
- **Description:** Phase 3 → Phase 4 Checkpoint (Bootstrap Complete)
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-010] [9_PROJECT_ROADMAP-REQ-417]** 4. Bootstrap ADR `commit_sha` equals `HEAD` (ADR committed i
- **Type:** Functional
- **Description:** 4. Bootstrap ADR `commit_sha` equals `HEAD` (ADR committed in same commit as implementation): Per ` `, the ADR MUST be committed separately. `./do lint` verifies that `commit_sha` in the frontmatter does NOT equal `HEAD`. If they match, lint exits non-zero with `"bootstrap ADR commit_sha must not equal HEAD"`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CHECK-005] [9_PROJECT_ROADMAP-REQ-418]** Phase 4 → Phase 5 Checkpoint
- **Type:** Technical
- **Description:** Phase 4 → Phase 5 Checkpoint
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-CHECK-006] [9_PROJECT_ROADMAP-REQ-419]** Phase 5 → MVP Release Checkpoint
- **Type:** Technical
- **Description:** Phase 5 → MVP Release Checkpoint
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-007] [9_PROJECT_ROADMAP-REQ-420]** 5. All five QGs pass but `overall_passed` in `report.json` i
- **Type:** Quality
- **Description:** 5. All five QGs pass but `overall_passed` in `report.json` is `false`: This is an invariant violation per ` `. `./do coverage` has a self-check: after writing `report.json`, it re-reads the file and verifies `overall_passed == AND(gates[*].passed)`, exiting non-zero with `"internal: report.json invariant violated"` if not.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-421]** [ROAD-CHECK-BR-011]   Any dependency listed above that is ab
- **Type:** Technical
- **Description:** [ROAD-CHECK-BR-011]   Any dependency listed above that is absent at checkpoint verification time causes the associated check to fail with `"missing dependency: <path>"` in `failure_detail`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-422]** [ROAD-CHECK-BR-012]   Checkpoint records are committed to th
- **Type:** Technical
- **Description:** [ROAD-CHECK-BR-012]   Checkpoint records are committed to the `devs/state` checkpoint branch, not the working branch, so they do not pollute the project's commit history while remaining inspectable via Filesystem MCP.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-423]** [AC-ROAD-CHECK-001]   A `passed` checkpoint record cannot be
- **Type:** Technical
- **Description:** [AC-ROAD-CHECK-001]   A `passed` checkpoint record cannot be overwritten; attempting to write a second record with `status: "passed"` for the same `phase_id` causes `./do presubmit` to exit non-zero.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-424]** [AC-ROAD-CHECK-002]   A failed checkpoint attempt creates `a
- **Type:** Technical
- **Description:** [AC-ROAD-CHECK-002]   A failed checkpoint attempt creates `attempt_N+1.json`; the failed `attempt_N.json` is not modified.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-425]** [AC-ROAD-CHECK-003]   ROAD-CHECK-004 (Bootstrap) is not `pas
- **Type:** Technical
- **Description:** [AC-ROAD-CHECK-003]   ROAD-CHECK-004 (Bootstrap) is not `passed` until all three COND-001/002/003 verifications have `verified_at` timestamps and CI pipeline URLs are non-null for all three platforms.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-426]** [AC-ROAD-CHECK-004]   The relaxed E2E interim gates at ROAD-
- **Type:** Quality
- **Description:** [AC-ROAD-CHECK-004]   The relaxed E2E interim gates at ROAD-CHECK-004 (≥25%) do not satisfy ROAD-CHECK-006 (≥50%); `./do coverage` reports actual values independently of gate thresholds at all times.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-427]** [AC-ROAD-CHECK-005]   The Bootstrap ADR frontmatter `commit_
- **Type:** Functional
- **Description:** [AC-ROAD-CHECK-005]   The Bootstrap ADR frontmatter `commit_sha` must not equal `HEAD` at the time the ADR is committed; `./do lint` enforces this check.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-428]** [AC-ROAD-CHECK-007]   The `checks[].status == "skipped"` val
- **Type:** Technical
- **Description:** [AC-ROAD-CHECK-007]   The `checks[].status == "skipped"` value in a checkpoint record is only valid when `"platform": "windows"` and the current CI job is `presubmit-linux` or `presubmit-macos`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-429]** [AC-ROAD-CHECK-008]   `./do presubmit` emits exactly one `WA
- **Type:** Technical
- **Description:** [AC-ROAD-CHECK-008]   `./do presubmit` emits exactly one `WARN:` line to stderr per active fallback in `fallback-registry.json`; zero warnings when `active_count == 0`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-430]** [AC-ROAD-CHECK-009]   The checkpoint record `blocker` field 
- **Type:** Technical
- **Description:** [AC-ROAD-CHECK-009]   The checkpoint record `blocker` field is non-null if and only if `status: "failed"`; when multiple checks fail simultaneously, `blocker` names the first failing check in alphabetical order.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-431]** [AC-ROAD-CHECK-010]   `./do ci` cleans up the temp branch un
- **Type:** Technical
- **Description:** [AC-ROAD-CHECK-010]   `./do ci` cleans up the temp branch unconditionally — whether the pipeline passes, fails, or times out — before returning to the caller.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-001] [9_PROJECT_ROADMAP-REQ-432]**    A step that is over-budget by more than 20% logs `WARN` t
- **Type:** Technical
- **Description:**    A step that is over-budget by more than 20% logs `WARN` to stderr and sets `over_budget: true` but does NOT cause `./do presubmit` to fail on its own.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-002] [9_PROJECT_ROADMAP-REQ-433]**    The `total` entry MUST be the last line; its `duration_ms
- **Type:** Functional
- **Description:**    The `total` entry MUST be the last line; its `duration_ms` is the wall-clock time from the first step's `started_at` to the moment `total` is written.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-003] [9_PROJECT_ROADMAP-REQ-434]**    `./do ci` uploads `target/presubmit_timings.jsonl` as a C
- **Type:** Technical
- **Description:**    `./do ci` uploads `target/presubmit_timings.jsonl` as a CI artifact with `expire_in: 7 days, when: always`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-004] [9_PROJECT_ROADMAP-REQ-435]**    Requirement IDs are scanned from `docs/plan/specs/*.md` v
- **Type:** Technical
- **Description:**    Requirement IDs are scanned from `docs/plan/specs/*.md` via the pattern `\(([0-9A-Z_a-z]+-(A-Z)+-(0-9)+)\)`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-005] [9_PROJECT_ROADMAP-REQ-436]**    Test annotations are scanned from `/*.rs` test files via 
- **Type:** Technical
- **Description:**    Test annotations are scanned from `/*.rs` test files via `// Covers: <id>` (single ID) or `// Covers: <id1>, <id2>` (comma-space delimited multiple IDs).
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-006] [9_PROJECT_ROADMAP-REQ-437]**    A `covered: false` requirement causes `overall_passed: fa
- **Type:** Technical
- **Description:**    A `covered: false` requirement causes `overall_passed: false` regardless of `stale_annotations` state.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-007] [9_PROJECT_ROADMAP-REQ-438]**    `overall_passed` is the logical AND of all five `gate.pas
- **Type:** Quality
- **Description:**    `overall_passed` is the logical AND of all five `gate.passed` values.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-008] [9_PROJECT_ROADMAP-REQ-439]**    `delta_pct` is the difference between `actual_pct` and `t
- **Type:** Quality
- **Description:**    `delta_pct` is the difference between `actual_pct` and `threshold_pct`; negative value means the gate is below threshold.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-009] [9_PROJECT_ROADMAP-REQ-440]**    Unit test coverage (QG-001) does NOT count toward QG-003,
- **Type:** Quality
- **Description:**    Unit test coverage (QG-001) does NOT count toward QG-003, QG-004, or QG-005.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-010] [9_PROJECT_ROADMAP-REQ-441]**    The ADR file MUST be committed in a separate commit from 
- **Type:** Functional
- **Description:**    The ADR file MUST be committed in a separate commit from the implementation changes that caused COND-003 to pass.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-011] [9_PROJECT_ROADMAP-REQ-442]**    `commit_sha` MUST be the SHA of the commit that caused th
- **Type:** Functional
- **Description:**    `commit_sha` MUST be the SHA of the commit that caused the last CI platform to go green, not the ADR commit itself.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-012] [9_PROJECT_ROADMAP-REQ-443]**    `active_count` MUST equal the number of entries with `sta
- **Type:** Functional
- **Description:**    `active_count` MUST equal the number of entries with `status: "Active"`; a mismatch causes `./do presubmit` to exit non-zero.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-013] [9_PROJECT_ROADMAP-REQ-444]**    `active_count > 3` causes `./do presubmit` to exit non-ze
- **Type:** Technical
- **Description:**    `active_count > 3` causes `./do presubmit` to exit non-zero with `"BLOCKED: maximum simultaneous fallbacks (3) exceeded"`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-014] [9_PROJECT_ROADMAP-REQ-445]**    `./do presubmit` emits exactly one `WARN:` line per `Acti
- **Type:** Technical
- **Description:**    `./do presubmit` emits exactly one `WARN:` line per `Active` fallback and zero `WARN:` lines when `active_count == 0`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-015] [9_PROJECT_ROADMAP-REQ-446]**    `captured_at` MUST be within 7 days of the current date; 
- **Type:** Functional
- **Description:**    `captured_at` MUST be within 7 days of the current date; `./do lint` exits non-zero otherwise.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-SCHEMA-016] [9_PROJECT_ROADMAP-REQ-447]**    An unavailable adapter (`available: false`) does not caus
- **Type:** Technical
- **Description:**    An unavailable adapter (`available: false`) does not cause `./do lint` to fail; it causes a `WARN` with the adapter name.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-STATEM-001] [9_PROJECT_ROADMAP-REQ-448]**    A phase MUST NOT transition from `Locked` to `InProgress`
- **Type:** Functional
- **Description:**    A phase MUST NOT transition from `Locked` to `InProgress` until the predecessor phase reaches `Passed`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-STATEM-002] [9_PROJECT_ROADMAP-REQ-449]**    A phase in `CheckpointPending` reverts to `InProgress` if
- **Type:** Functional
- **Description:**    A phase in `CheckpointPending` reverts to `InProgress` if any checkpoint check fails; the failure MUST be diagnosed before re-attempting the checkpoint.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-STATEM-003] [9_PROJECT_ROADMAP-REQ-450]**    A phase MUST NOT be manually overridden to `Passed`; the 
- **Type:** Functional
- **Description:**    A phase MUST NOT be manually overridden to `Passed`; the checkpoint verification is the only valid transition path.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-STATEM-004] [9_PROJECT_ROADMAP-REQ-451]**    `FallbackActive` is not a terminal state; the phase conti
- **Type:** Technical
- **Description:**    `FallbackActive` is not a terminal state; the phase continues toward `Passed` with the fallback active.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-STATEM-005] [9_PROJECT_ROADMAP-REQ-452]**    `Blocked` is resolved only by retiring an active fallback
- **Type:** Technical
- **Description:**    `Blocked` is resolved only by retiring an active fallback; retiring a fallback transitions `Blocked` back to `FallbackActive`.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-RISK-001] [9_PROJECT_ROADMAP-REQ-453]**    A risk with score ≥ 6 MUST have at least one automated te
- **Type:** Functional
- **Description:**    A risk with score ≥ 6 MUST have at least one automated test with `// Covers: RISK-NNN` annotation before the phase containing its mitigation deliverable passes its checkpoint.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-RISK-002] [9_PROJECT_ROADMAP-REQ-454]**    The four critical risks (RISK-002, RISK-004, RISK-005, RI
- **Type:** Security
- **Description:**    The four critical risks (RISK-002, RISK-004, RISK-005, RISK-009) MUST be mitigated before any code in their affected components is authored; this is enforced by the strict phase ordering in §3.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-RISK-003] [9_PROJECT_ROADMAP-REQ-455]**    A new risk discovered during development MUST be added to
- **Type:** Functional
- **Description:**    A new risk discovered during development MUST be added to `docs/plan/specs/8_risks_mitigation.md` before work on the affected component continues; `./do test` exits non-zero if any RISK-NNN referenced in a `// Covers:` annotation is absent from the spec.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-NGOAL-001] [9_PROJECT_ROADMAP-REQ-456]**    Any production dependency not in the authoritative versio
- **Type:** Security
- **Description:**    Any production dependency not in the authoritative version table in TAS §2.2 causes `./do lint` to exit non-zero with the name of the unapproved crate; this is the primary mechanism preventing scope creep via new dependencies.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-NGOAL-002] [9_PROJECT_ROADMAP-REQ-457]**    `[auth]` and `[triggers]` sections in `devs.toml` are par
- **Type:** Security
- **Description:**    `[auth]` and `[triggers]` sections in `devs.toml` are parsed at config validation time (before any port is bound) and cause immediate startup failure; they do not generate warnings.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-NGOAL-003] [9_PROJECT_ROADMAP-REQ-458]**    The MCP server runs over plain HTTP/1.1 JSON-RPC; no WebS
- **Type:** Technical
- **Description:**    The MCP server runs over plain HTTP/1.1 JSON-RPC; no WebSocket, Server-Sent Events, or gRPC-Web protocol is added at MVP; `./do lint` verifies `tungstenite`, `tokio-tungstenite`, and `sse` crates are absent.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[ROAD-NGOAL-004] [9_PROJECT_ROADMAP-REQ-459]**    No `pyo3`, `napi`, or `uniffi` crate appears in any works
- **Type:** Technical
- **Description:**    No `pyo3`, `napi`, or `uniffi` crate appears in any workspace member's production dependencies; these are reserved for post-MVP language bindings.
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-460]** Developer adds `axum` to `devs-server` to implement a health
- **Type:** Technical
- **Description:** Developer adds `axum` to `devs-server` to implement a health check endpoint | `./do lint` exits non-zero identifying `axum` as an unapproved production dependency; change is blocked
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-461]** `devs.toml` contains both `[auth]` and valid `[[pool]]` sect
- **Type:** Security
- **Description:** `devs.toml` contains both `[auth]` and valid `[[pool]]` sections | Server reads config, collects ALL errors (including the `[auth]` section error), reports them all to stderr, then exits non-zero before binding any port
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-462]** A PR adds a REST endpoint via `hyper` directly (bypassing `a
- **Type:** Technical
- **Description:** A PR adds a REST endpoint via `hyper` directly (bypassing `axum`) | `hyper` as a direct production dependency is detected by `./do lint` (it is only allowed as a transitive dep); change is blocked
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_PROJECT_ROADMAP-REQ-463]** Post-MVP feature branch inadvertently merges non-goal code i
- **Type:** Technical
- **Description:** Post-MVP feature branch inadvertently merges non-goal code into `main` | `./do presubmit` on `main` immediately detects the violation and exits non-zero; the CI pipeline blocks the merge
- **Source:** Project Roadmap (docs/plan/specs/9_project_roadmap.md)
- **Dependencies:** None

