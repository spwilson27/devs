# Phase 4 Task Review Summary

## Overview
- **Tasks before review**: 62 task files (excluding READMEs/traceability docs)
- **Tasks after review**: 50 task files
- **Deleted**: 12 duplicate/subsumed tasks
- **Modified**: 5 tasks updated to absorb requirements from deleted tasks

## Duplicates Removed

### 1. Failure Classification (5 tasks deleted)
Sub-epic `09_agent_failure_classification` contained 5 granular classifier tasks (coverage gate, clippy, traceability, timeout, unknown) that were entirely subsumed by:
- `07_agent_diagnostic_behaviors/03_failure_classification_and_targeted_fix.md` — already implements all 8 failure categories
- `10_agent_tdd_loop_enforcement/05_failure_classification_lookup_table.md` — duplicate of 07/03

**Deleted:**
- `09/01_coverage_gate_failure.md` (REQ-BR-009 → absorbed by 07/03)
- `09/02_clippy_denial_failure.md` (REQ-BR-010 → absorbed by 07/03)
- `09/03_traceability_failure.md` (REQ-BR-011 → absorbed by 07/03)
- `09/04_process_timeout_failure.md` (REQ-BR-012 → absorbed by 07/03)
- `09/05_unknown_failure_handler.md` (REQ-BR-018 → absorbed by 07/03)
- `10/05_failure_classification_lookup_table.md` (REQ-034 → absorbed by 07/03)

**Retained:** `09/01_diagnosing_to_editing_gate.md` (distinct state machine concern, not classification)

### 2. Standard Workflow Definitions (1 task deleted)
`13/01_define_standard_workflows.md` defined all 6 workflows but duplicated:
- `10/01_define_core_tdd_workflows.md` (tdd-red, tdd-green, presubmit-check)
- `12/01_define_additional_workflows.md` (build-only, unit-test-crate, e2e-all)

**Deleted:** `13/01_define_standard_workflows.md` (AC-ROAD-P4-001 already covered by 10/01 + 12/01)

### 3. Session Recovery / In-Flight Run Detection (2 tasks deleted)
`01/04_agent_session_recovery_order.md` (REQ-049) and `01/05_agent_inflight_run_detection_and_cancellation.md` (REQ-050) were subsumed by the more comprehensive `07/02_non_terminal_run_recovery.md`.

**Deleted:** `01/04`, `01/05` → requirements absorbed by `07/02`

### 4. MCP Address Discovery (1 task deleted)
`07/08_mcp_address_discovery.md` (REQ-BR-004) was subsumed by `08/01_agent_session_isolation.md` which already implements discovery protocol alongside session isolation.

**Deleted:** `07/08` → REQ-BR-004 absorbed by `08/01`

### 5. Presubmit Enforcement (1 task deleted)
`07/07_presubmit_enforcement.md` (REQ-030) was subsumed by `10/02_presubmit_check_assertion_verification.md` which implements the same presubmit wait-and-assert protocol.

**Deleted:** `07/07` → REQ-030 absorbed by `10/02`

### 6. Phase 3 Readiness Check (1 task deleted)
`12/02_verify_phase_3_readiness.md` (ROAD-P4-DEP-001) was subsumed by `13/02_configure_server_infrastructure.md` which performs more comprehensive server startup and client connectivity verification.

**Deleted:** `12/02` → ROAD-P4-DEP-001 absorbed by `13/02`

## Tasks Modified (requirement absorption)

| Task | Requirements Added |
|---|---|
| `07/03_failure_classification_and_targeted_fix.md` | REQ-034, REQ-BR-009, BR-010, BR-011, BR-012, BR-018 |
| `07/02_non_terminal_run_recovery.md` | REQ-049, REQ-050 |
| `08/01_agent_session_isolation.md` | REQ-BR-004 |
| `10/02_presubmit_check_assertion_verification.md` | REQ-030 |
| `13/02_configure_server_infrastructure.md` | ROAD-P4-DEP-001 |

## Dependency References Fixed
- `10/06_tdd_red_phase_workflow.md` — updated `depends_on` from deleted `05_failure_classification_lookup_table.md` to `07/03`
- `10/07_tdd_green_phase_workflow.md` — updated `depends_on` from deleted `05` to `07/03`
- `13/02_configure_server_infrastructure.md` — updated `depends_on` from deleted `13/01` to `10/01` + `12/01`

## Gaps Identified (for human review)

### Gap 1: Phase requirements use `9_PROJECT_ROADMAP-REQ-*` IDs (109–463) but tasks use `3_MCP_DESIGN-REQ-*` and `FB-*` IDs
The phase_4.md lists ~250 `9_PROJECT_ROADMAP-REQ-*` requirements, but tasks reference `3_MCP_DESIGN-REQ-*` and `FB-*` IDs from the spec documents. There is no explicit mapping between the roadmap requirement IDs and the spec-level IDs used in tasks. This traceability gap should be addressed by creating a mapping document or updating the phase requirements to use the spec-level IDs that tasks actually reference.

### Gap 2: `FB-NNN` placeholder requirement
Phase_4.md lists `[FB-NNN]` which appears to be a placeholder. No task covers it. Needs clarification on whether this is a real requirement or should be removed.

### Gap 3: TaskState schema defined in multiple places
`02/02_task_state_persistence.md`, `04/01_agent_observation_run_tracking.md` §2.3, and `04/03_agent_observation_shutdown_resiliency.md` §2.4 all define slightly different `TaskState` structs. While not full task-level duplicates (they cover different requirements), the implementation will need to converge on a single schema. Recommend that `02/02` is the canonical definition and others reference it.

## Final Task Count by Sub-Epic

| Sub-Epic | Before | After |
|---|---|---|
| 01_mcp_tool_reliability_recovery | 10 | 8 |
| 02_mcp_escalation_connection_recovery | 3 | 3 |
| 03_mcp_execution_control_atoms | 4 | 4 |
| 04_mcp_run_workflow_observation | 3 | 3 |
| 05_mcp_list_filter_operations | 9 | 9 |
| 06_mcp_logging_stage_output | 5 | 5 |
| 07_agent_diagnostic_behaviors | 8 | 6 |
| 08_agent_self-correction_fix_logic | 3 | 3 |
| 09_agent_failure_classification | 6 | 1 |
| 10_agent_tdd_loop_enforcement | 8 | 7 |
| 11_agent_traceability_submission | 2 | 2 |
| 12_roadmap_dependency_verification | 3 | 2 |
| 13_roadmap_phase_4_infrastructure | 3 | 2 |
| 14_roadmap_phase_4_validation | 3 | 3 |
| 15_tdd_lifecycle_roadmap | 4 | 4 |
| **Total** | **74** | **62** |

*Note: counts include README and traceability docs in some sub-epics.*
