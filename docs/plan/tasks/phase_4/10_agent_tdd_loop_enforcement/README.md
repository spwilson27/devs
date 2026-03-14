# Sub-Epic: 10_Agent TDD Loop Enforcement — Task Index

## Overview
This sub-epic implements the mandatory TDD loop enforcement protocols that govern how AI agents develop `devs` using Test Driven Development. The tasks ensure agents follow the red→green→refactor cycle, properly diagnose failures, and never make speculative code changes.

## Requirements Coverage Matrix

| Requirement ID | Covered By Tasks | Description |
|---|---|---|
| [3_MCP_DESIGN-REQ-031] | 01, 02, 06, 07, 08 | Agent MUST submit presubmit-check and wait for all stages to reach terminal status, then call `assert_stage_output` on each stage |
| [3_MCP_DESIGN-REQ-032] | 03 | Parallel implementation tasks MUST be submitted as separate workflow runs targeting isolated git worktrees/branches |
| [3_MCP_DESIGN-REQ-033] | 03 | Agent MUST monitor in-flight runs via `list_runs` and `get_pool_state`; wait for pool recovery on exhaustion |
| [3_MCP_DESIGN-REQ-034] | 04, 05, 07 | On stage failure, agent MUST execute 4-step diagnostic sequence and classify failure using the lookup table |
| [3_MCP_DESIGN-REQ-035] | 04, 06, 07 | Agent MUST NOT make speculative code changes based on partial failure information |

## Task List

| Task # | Filename | Requirements | Dependencies |
|---|---|---|---|
| 01 | `01_define_core_tdd_workflows.md` | [3_MCP_DESIGN-REQ-031] (partial) | none |
| 02 | `02_presubmit_check_assertion_verification.md` | [3_MCP_DESIGN-REQ-031] | 01 |
| 03 | `03_parallel_run_orchestration_monitoring.md` | [3_MCP_DESIGN-REQ-032], [3_MCP_DESIGN-REQ-033] | none |
| 04 | `04_diagnostic_sequence_enforcement.md` | [3_MCP_DESIGN-REQ-034], [3_MCP_DESIGN-REQ-035] | 01 |
| 05 | `05_failure_classification_lookup_table.md` | [3_MCP_DESIGN-REQ-034] | 01, 04 |
| 06 | `06_tdd_red_phase_workflow.md` | [3_MCP_DESIGN-REQ-031], [3_MCP_DESIGN-REQ-035] | 01, 05 |
| 07 | `07_tdd_green_phase_workflow.md` | [3_MCP_DESIGN-REQ-031], [3_MCP_DESIGN-REQ-034], [3_MCP_DESIGN-REQ-035] | 05, 06 |
| 08 | `08_assert_stage_output_tool.md` | [3_MCP_DESIGN-REQ-031] | 01, 05 |

## Execution Order

The recommended execution order for this sub-epic is:

```
01 → 02 → 04 → 05 → 06 → 07 → 08
         ↘ 03 ↗
```

**Rationale:**
1. **Task 01** defines the core workflow TOML files — foundational for all other tasks.
2. **Task 02** implements presubmit-check assertion verification — depends on workflow definitions.
3. **Task 03** (parallel orchestration) can proceed in parallel with tasks 02, 04, 05 — no dependencies on diagnostic logic.
4. **Task 04** enforces the diagnostic sequence — requires workflow definitions to be in place.
5. **Task 05** implements the failure classification lookup table — used by both red and green phase workflows.
6. **Task 06** implements the TDD red phase — depends on failure classification for unexpected pass detection.
7. **Task 07** implements the TDD green phase — depends on red phase and failure classification for retry logic.
8. **Task 08** implements `assert_stage_output` — final verification tool used by agents to confirm presubmit-check success.

## Shared Components

| Component | Role | Used By Tasks |
|---|---|---|
| `devs-config` | Workflow TOML parsing and validation | 01, 06, 07 |
| `devs-core` | Domain types, failure classification, state machines | 04, 05 |
| `devs-mcp` | MCP tools (`assert_stage_output`, audit log, stream_logs) | 02, 04, 06, 07, 08 |
| `devs-scheduler` | DAG scheduling, retry logic, stage output management | 02, 07, 08 |
| `devs-proto` | Protobuf types for run/stage state | 02, 08 |
| `devs-pool` | Agent pool state monitoring | 03 |
| `devs-executor` | Git worktree/branch isolation | 03 |

## Quality Gates

All tasks in this sub-epic must pass the following quality gates:

- **QG-TDD-001**: 90% unit test coverage per crate (enforced by `./do coverage`).
- **QG-TDD-002**: All requirement IDs mapped to at least one passing E2E test.
- **QG-TDD-003**: Traceability verification passes (`python3 .tools/verify_requirements.py`).
- **QG-TDD-004**: No clippy warnings in new code (`./do lint`).
- **QG-TDD-005**: All task documentation files follow the mandatory 6-section format.

## Acceptance Criteria

This sub-epic is complete when:

- [ ] All 8 tasks are marked complete.
- [ ] All 5 requirement IDs ([3_MCP_DESIGN-REQ-031] through [3_MCP_DESIGN-REQ-035]) are verified as covered in `target/traceability.json`.
- [ ] The E2E test suite includes tests for:
  - TDD red phase workflow submission and failure confirmation.
  - TDD green phase workflow with retry logic.
  - Parallel run orchestration with pool monitoring.
  - Diagnostic sequence enforcement (blocking speculative edits).
  - Failure classification for all 9 categories.
  - `assert_stage_output` tool with all 7 operators.
- [ ] The `presubmit-check` workflow can be submitted, monitored, and verified end-to-end via MCP tools.
- [ ] Agent "memory" documentation is updated with the TDD loop protocol.

## Related Sub-Epics

- **07_Agent Diagnostic Behaviors**: Complements the diagnostic sequence enforcement with detailed failure investigation protocols.
- **09_Agent Failure Classification**: Implements the traceability, coverage, and clippy failure detection used by the classification lookup table.
- **Phase 4 / 01–06**: Standard workflow TOML files and bootstrap validation — the workflows defined here are consumed by the TDD loop.

## Notes

- The TDD loop enforcement is **non-negotiable** — agents cannot bypass the red→green→refactor cycle.
- The failure classification table (Task 05) is **exhaustive for MVP** — any unclassified failure triggers the unknown failure protocol ([3_MCP_DESIGN-REQ-DBG-BR-000]).
- The `assert_stage_output` tool (Task 08) is the **primary mechanism** for agents to verify presubmit-check success per [3_MCP_DESIGN-REQ-031].
