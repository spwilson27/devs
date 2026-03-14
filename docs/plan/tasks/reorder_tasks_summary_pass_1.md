# Task Reordering Report

## Summary
- Total tasks reviewed: 832
- Correctly placed: 831
- Moved (CRITICAL): 1
- Moved (WARNING): 0
- Skipped (WARNING, cascade risk): 0

## Analysis

### Phase Structure Validation

The project uses a 6-phase structure with clear dependency ordering:

| Phase | Purpose | Task Count |
|-------|---------|------------|
| 0 | Foundation: workspace, toolchain, proto, core types, CI, specs | 356 |
| 1 | Infrastructure crates: config, checkpoint, adapters, pool, executor | 68 |
| 2 | Engine: DAG scheduler, completion signals, fan-out, webhooks | 43 → 42 |
| 3 | Interfaces: gRPC server, CLI, MCP, TUI, state recovery | 117 → 118 |
| 4 | Agentic development: MCP reliability, diagnostics, TDD, bootstrap | 62 |
| 5 | Quality gates: coverage, risk verification, MVP release | 186 |

### Key Design Pattern: Phase 0 Specifications

Phase 0 contains 356 tasks, many of which are "Detailed Domain Specification" tasks that define implementation contracts for crates built in later phases (e.g., `devs-scheduler`, `devs-tui`, `devs-mcp`). This is **intentional and correct** — all 15 workspace crates are scaffolded as stubs in Phase 0 (task `001_workspace_toolchain_setup/03_workspace_build_validation.md`), and Phase 0 specification tasks add foundational utilities (string constants, formatters, type definitions, lint rules) to these stubs. Later phases implement the real functionality.

### Cross-Phase Dependency Verification

Verified that no task file's `depends_on` field references a task in a later phase:
- Phase 1 → Phase 2+ references: **0**
- Phase 2 → Phase 3+ references: **0**
- Phase 3 → Phase 4+ references: **0**
- Phase 4 → Phase 5+ references: **0**

### Implementation-in-Wrong-Phase Analysis

Checked all task files for implementation targeting crates owned by later phases:
- Phase 0 tasks implementing in Phase 3+ crate source directories: Found in `devs-tui` (24 tasks), `devs-grpc` (5), `devs-server` (5), `devs-mcp` (4). All confirmed to be **foundational utilities** (string constants, render helpers, theme types, lint rules) that compile against the Phase 0 stub crates. No misplacement.
- Phase 1 tasks implementing in Phase 2+ crates: **0 found**
- Phase 2 tasks implementing in Phase 3+ crates: **1 found** (see Moves Applied)
- Phase 3 tasks implementing in Phase 4+ crates: **0 found**

## Moves Applied

### `phase_2/07_logging_retention/03_retention_background_task.md`
- **From:** `phase_2/07_logging_retention/`
- **To:** `phase_3/02_state_recovery_and_lifecycle/05_retention_background_task.md`
- **Severity:** CRITICAL
- **Reason:** This task creates `crates/devs-server/src/retention_task.rs` and registers the background sweep task in the server startup sequence. `devs-server` is a Phase 3 crate — it doesn't exist as a real implementation until Phase 3 (`01_core_grpc_server_and_infrastructure/04_devs_server_crate_and_startup_sequence.md`). The retention sweep *logic* (tasks 01 and 02 in `07_logging_retention/`) correctly lives in Phase 2 within `devs-checkpoint`, but the *server integration* that spawns the Tokio task must wait for the server crate to be built.
- **References Updated:**
  - Removed from `phase_2/dag.json` (was a leaf node — no other Phase 2 tasks depended on it)
  - Added to `phase_3/dag.json` with dependencies on `02_state_recovery_and_lifecycle/03_server_startup_recovery_integration.md` and `01_core_grpc_server_and_infrastructure/04_devs_server_crate_and_startup_sequence.md`
  - Updated `depends_on` in the moved file to include the Phase 3 server startup task

## Skipped Warnings

None.

## Validation: PASS

The task ordering across all 6 phases is logically correct. Each phase builds on artifacts from prior phases without circular dependencies. The single misplacement found (retention background task in Phase 2 targeting Phase 3's `devs-server` crate) has been corrected.
