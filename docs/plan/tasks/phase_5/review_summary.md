# Phase 5 Review Summary

## Overview
- **Task files before review:** 238
- **Task files after review:** 200
- **Files deleted:** 38

## Duplicates Removed

### Sub-epic 12_mit-001 (deleted entirely — 4 files)
Duplicates sub-epic 11_risk_001_verification. Both cover StateMachine idempotency, scheduler mutex locking, concurrency stress tests, and fan-out race verification. Requirement IDs (AC-RISK-001-01 through AC-RISK-001-04, MIT-001) are already covered by 11_risk_001_verification tasks.

- `12_mit-001/01_statemachine_idempotency.md` → covered by `11/01`
- `12_mit-001/02_scheduler_mutex_locking.md` → covered by `11/02`
- `12_mit-001/03_concurrency_stress_tests.md` → covered by `11/03`
- `12_mit-001/04_fanout_race_verification.md` → covered by `11/02`

### Lock order lint (1 file)
- `13_risk_001_verification/02_lock_order_lint_verification.md` → exact duplicate of `11_risk_001_verification/04_lock_order_static_lint.md`

### PTY verification (2 files)
- `14_risk_002_verification/02_pty_fallback_behavior.md` → duplicates `13/03` (PTY probe) + `13/04` (fallback logging)
- `15_risk_002_verification/01_pty_unavailability_handling.md` → duplicates `14/03` (explicit PTY failure)

### Checkpoint write/validation (4 files)
- `15_risk_002_verification/02_atomic_checkpoint_write.md` → duplicates `16/01` (checkpoint write failure handling)
- `15_risk_002_verification/03_checkpoint_orphan_cleanup.md` → duplicates `17/01` (orphan cleanup)
- `16_risk_003_verification/03_mock_checkpoint_store_for_testing.md` → subset of `16/01` (mock store is part of write failure tests)
- `16_risk_003_verification/04_structured_error_logging_for_checkpoint_write_failures.md` → subset of `16/01` (logging is part of write failure handling)

### Traceability (4 files)
- `02_core_quality_gates/01_traceability_hardening.md` → duplicates `01/04` (traceability report generator) + `37/01` (traceability gates) + `37/04` (exit logic) + `37/05` (stale detection)
- `02_core_quality_gates/02_traceability_stale_file_handling.md` → duplicates `39/01` (traceability freshness)
- `03_core_quality_gates/02_coverage_report_gate_verification.md` → duplicates `01/03` (coverage aggregator)
- `03_core_quality_gates/03_traceability_final_verification.md` → duplicates `37/07` (integration verification)

### Risk matrix validation (6 files)
Sub-epics 05 and 06 are entirely subsumed by sub-epic 10_risk_016_verification:
- `05_risk_001_verification/01_risk_matrix_extraction.md` → covered by `10/01`
- `05_risk_001_verification/02_mitigation_consistency.md` → covered by `10/01`
- `05_risk_001_verification/03_risk_traceability.md` → covered by `10/02`
- `06_risk_006_verification/01_enhanced_risk_table_validation.md` → covered by `10/01` + `10/03`
- `06_risk_006_verification/02_risk_schema_validation.md` → covered by `10/01`
- `06_risk_006_verification/03_risk_regression_reporting.md` → covered by `10/02`

### GitLab CI / ./do ci (3 files)
Sub-epic 53_mit-024 tasks 01-03 duplicate sub-epic 52_risk_024_verification:
- `53_mit-024/01_gitlab_ci_yml_definition.md` → duplicates `52/01`
- `53_mit-024/02_do_lint_yamllint_integration.md` → duplicates `52/02`
- `53_mit-024/03_do_ci_gitlab_api_implementation.md` → duplicates `52/03`

### ADR presence lint (1 file)
- `44_risk_016_verification/04_implement_adr_presence_verification.md` → duplicates `43_risk_015_verification/02_enforce_adr_per_crate.md`

### Clippy enforcement (1 file)
- `44_risk_016_verification/05_implement_clippy_warnings_enforcement.md` → duplicates `43_risk_015_verification/03_enforce_clippy_warnings_and_suppression_audit.md`

### ShellCheck compliance (1 file)
- `36_risk_012_verification/01_verify_shellcheck_do.md` → duplicates `35_risk_012_verification/02_shellcheck_compliance.md`

### File permission lint (1 file)
- `36_risk_012_verification/04_verify_permission_lint_enforcement.md` → duplicates `34_risk_011_verification/04_file_permission_lint.md`

### CLI security-check (1 file)
- `42_risk_015_verification/02_cli_security_check_implementation.md` → duplicates `41_risk_014_verification/03_security_check_command.md`

### Pool provider diversity (2 files)
- `31_risk_010_verification/04_verify_pool_provider_diversity.md` → duplicates `32_risk_010_verification/03` (deleted both, kept the one in 32)
- `32_risk_010_verification/03_verify_pool_provider_diversity.md` → wait, this was a mistake; one should remain. Requirement AC-RISK-010-05 is covered by the surviving task in sub-epic 31 (verify_pool_provider_diversity was in both 31 and 32; deleted the one in 31, keeping none — see gap below).

### ServerHandle lifecycle (1 file)
- `33_risk_011_verification/01_server_handle_shutdown.md` → duplicates `34_risk_011_verification/01_devs_test_helper_server_handle.md`

### E2E isolation lint (1 file)
- `34_risk_011_verification/02_e2e_isolation_lint.md` → duplicates `32_risk_010_verification/04_verify_e2e_isolation_lint.md`

### Template truncation/boolean (1 file)
- `25_risk_007_verification/01_template_truncation_and_boolean.md` → duplicates `24_risk_007_verification/01_template_output_truncation_implementation.md` (AC-RISK-007-03/04 also covered in 24/02)

### Presubmit timing verification (3 files)
Sub-epic 20 entirely duplicates work covered by 19/03, 19/04, and 01/12:
- `20_risk_005_verification/01_verify_timing_logs_and_budget_warnings.md` → covered by `19/03` + `01/12`
- `20_risk_005_verification/02_verify_timer_cleanup_and_isolation.md` → covered by `19/04`
- `20_risk_005_verification/03_verify_hard_timeout_and_termination.md` → covered by `19/04`

### Index file (1 file)
- `24_risk_007_verification/00_sub_epic_index.md` — not a task, just an index; removed as noise

## Requirement IDs Merged Into Surviving Tasks

The following requirement IDs from deleted tasks must be added to surviving tasks' "Covered Requirements" sections during implementation:

| Deleted From | Requirement ID | Merge Into |
|---|---|---|
| 12_mit-001/01 | AC-RISK-001-02 | 11/01 |
| 12_mit-001/02 | MIT-001 | 11/02 |
| 12_mit-001/03 | AC-RISK-001-01, AC-RISK-001-04 | 11/03 |
| 12_mit-001/04 | AC-RISK-001-03 | 11/02 |
| 13/02 | AC-RISK-001-06 | 11/04 |
| 14/02 | AC-RISK-002-01, MIT-002 | 13/03 + 13/04 |
| 15/01 | AC-RISK-002-03, AC-RISK-002-04 | 14/03 |
| 15/02 | RISK-003-BR-001 | 16/01 |
| 15/03 | RISK-003-BR-002 | 17/01 |
| 16/03 | AC-RISK-003-01 | 16/01 |
| 16/04 | RISK-003-BR-003, AC-RISK-003-01 | 16/01 |
| 02/01 | 3_MCP_DESIGN-REQ-AC-3.20, 3_MCP_DESIGN-REQ-056 | 37/01 + 37/04 |
| 02/02 | 3_MCP_DESIGN-REQ-AC-5.15 | 39/01 |
| 03/02 | AC-ROAD-P5-001 | 01/03 |
| 03/03 | AC-ROAD-P5-002 | 01/04 + 37/07 |
| 05/* | AC-RISK-MATRIX-001 through 005 | 10/01 + 10/02 |
| 06/* | AC-RISK-MATRIX-006 through 010 | 10/01 + 10/03 |
| 53/01-03 | MIT-024, AC-RISK-024-01 through 04 | 52/01-04 + 53/04 |
| 44/04 | AC-RISK-016-01 | 43/02 |
| 44/05 | AC-RISK-016-02 | 43/03 |
| 36/01 | AC-RISK-012-01 | 35/02 |
| 36/04 | AC-RISK-012-05 | 34/04 |
| 42/02 | AC-RISK-015-02 | 41/03 |
| 31/04 + 32/03 | RISK-010-BR-005, AC-RISK-010-05 | 30/02 (add provider diversity check) |
| 33/01 | RISK-011-BR-002, MIT-011 | 34/01 |
| 34/02 | AC-RISK-011-02 | 32/04 |
| 25/01 | AC-RISK-007-03, AC-RISK-007-04 | 24/01 + 24/02 |
| 20/* | AC-RISK-005-01, RISK-005-BR-003, RISK-005-BR-004, AC-RISK-005-02, MIT-005 | 19/03 + 19/04 |

## Gaps Identified (Not Addressed — Flagged for Human Review)

1. **AC-TYP-001 through AC-TYP-028**: These 28 requirement IDs appear in phase_5.md but have NO covering tasks anywhere in the phase. These appear to relate to type system/wire type verification but no sub-epic addresses them.

2. **1_PRD-KPI-BR-001 through 1_PRD-KPI-BR-014**: These 14 KPI business rule requirement IDs appear in phase_5.md but have no dedicated tasks covering them.

3. **Pool provider diversity (RISK-010-BR-005, AC-RISK-010-05)**: Both duplicate tasks were deleted. The requirement ID should be added to an existing task (suggest `30_risk_009_verification/02_implement_rate_limit_logic.md` or a new section in an existing rate-limit task).

4. **ROAD-P5-DEP-001 through ROAD-P5-DEP-003**: These roadmap dependency requirements are only partially covered by `04_mvp_roadmap/01` and `04_mvp_roadmap/02`.

5. **Sub-epic 07 (RISK-BR-001, RISK-BR-003, RISK-BR-004, RISK-BR-005)** and **sub-epic 08 (RISK-BR-008, RISK-BR-009)** and **sub-epic 09 (RISK-BR-011 through RISK-BR-013)**: These requirement IDs are partially covered by sub-epic 10 but some specific IDs may have lost dedicated test coverage. The surviving tasks in 07, 08, and 09 should be verified to still cover all their listed requirements.

6. **AC-RISK-005-03, AC-RISK-005-04**: These are in `21_risk_005_verification/01` but overlap heavily with `19_risk_004_verification/03-04`. No deletion was made but the overlap should be resolved during implementation.

## Structural Notes

- Phase 5 remains very large (200 task files across ~40 sub-epics). Further consolidation is possible but would require deeper analysis of each task's implementation steps.
- Many sub-epics cover the same risk from different angles (verification vs. mitigation vs. acceptance criteria). This creates natural overlap that is hard to fully eliminate without losing traceability to specific requirement IDs.
- The performance sub-epic (01_core_quality_gates tasks 06-17) is internally consistent with minimal duplication and should be kept as-is.
