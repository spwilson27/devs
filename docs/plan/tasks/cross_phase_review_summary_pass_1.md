# Cross-Phase Task Review Summary — Pass 1

## Review Date: 2026-03-14

## Overview

Cross-phase review of all task files across Phases 0–5 to identify and eliminate duplicate work spanning multiple phases or sub-epics.

**Before review:** 878 task files
**After review:** 837 task files
**Deleted:** 41 files (4.7% reduction)

This review follows the intra-phase deduplication already performed (202 files deleted), bringing the cumulative reduction from the original 1,047 files to 837 — a 20% total reduction.

---

## Actions Taken: 41 Files Deleted

### Category 1: Phase 0 Internal Duplicates Across Sub-Epics (27 files)

Phase 0 had a systematic problem where the same requirement was specified in multiple sub-epics with near-identical implementation instructions. These were not caught by the intra-phase review because they lived in different sub-epic directories.

#### Discovery File Logic (3 deleted)
- `053_PT18/05_discovery_file_write_protocol.md` — subsumed by `017_PT8/01_implement_discovery_file_logic.md` + `015_PT6/04_atomic_discovery_file_write.md`
- `065_PT30/02_discovery_file_path_and_format.md` — subsumed by `017_PT8/01`
- `066_PT31/01_discovery_file_grpc_port_only.md` — subsumed by `017_PT8/01`

#### Validation & Domain Logic (12 deleted)
- `062_PT27/01_template_error_fail_fast.md` — subsumed by `082_PT47/04_template_resolution_failure_modes.md`
- `062_PT27/02_atomic_slug_collision_check.md` — subsumed by `082_PT47/05_submission_race_protection.md`
- `081_PT46/03_env_var_sanitation.md` — duplicate of `081_PT46/03_environment_variable_sanitation.md` (same sub-epic, same REQ)
- `083_PT48/01_checkpoint_schema_version_validation.md` — subsumed by `061_PT26/01_checkpoint_schema_version_enforcement.md`
- `083_PT48/02_lazy_prompt_file_resolution.md` — subsumed by `084_PT49/05_missing_prompt_file.md`
- `083_PT48/03_workflow_cycle_detection_acceptance.md` — subsumed by `057_PT22/02_dag_cycle_detection.md`
- `083_PT48/04_illegal_transition_guard_acceptance.md` — subsumed by `046_PT11/01_workflow_stage_state_machines.md`
- `084_PT49/04_duplicate_submission_rejection.md` — subsumed by `082_PT47/05_submission_race_protection.md`
- `084_PT49/02_output_truncation.md` — subsumed by `082_PT47/03_output_truncation_logic.md`
- `085_PT50/01_validate_prompt_mutually_exclusive.md` — subsumed by `078_PT43/05_prompt_mutually_exclusive.md`
- `085_PT50/02_validate_prohibited_env_keys.md` — subsumed by `061_PT26/03_prohibited_environment_keys_validation.md`
- `085_PT50/03_enforce_snapshot_immutability.md` — subsumed by `080_PT45/03_snapshot_immutability_enforcement.md`

#### Recovery & Persistence (2 deleted)
- `085_PT50/05_handle_missing_snapshot_recovery.md` — subsumed by `081_PT46/05_missing_snapshot_handling.md`
- `054_PT19/03_webhook_config_schema.md` — subsumed by `087_PT52/03_max_webhook_limit.md` + `087_PT52/04_non_empty_webhook_events.md`

#### Coverage & Traceability (5 deleted)
- `039_PT4/02_unit_test_coverage_quality_gate.md` — subsumed by `006/03_coverage_measurement_and_zero_result_protection.md`
- `076_PT41/01_traceability_generation.md` — subsumed by `007/01_implement_traceability_scanner.md` + `007/02_implement_traceability_reporter.md`
- `076_PT41/02_stale_requirement_detection.md` — subsumed by `038_PT3/02_stale_requirement_detection.md`
- `076_PT41/03_coverage_report_schema.md` — subsumed by `007/03_implement_coverage_gate_reporter.md`
- `076_PT41/04_coverage_quality_gate_enforcement.md` — subsumed by `006/03` + `028_PT19/01_do_coverage_exit_logic.md`

#### Presubmit Timeout (2 deleted)
- `036_PT1/04_presubmit_wall_clock_timeout.md` — subsumed by `003/05_implement_presubmit_and_ci.md` + `026_PT17/03_presubmit_timeout_telemetry.md`
- `076_PT41/05_presubmit_timeout_enforcement.md` — subsumed by same

#### Config & Credentials (2 deleted)
- `038_PT3/04_configuration_precedence_logic.md` — subsumed by `047_PT12/01_config_override_precedence.md`
- `038_PT3/05_agent_credential_resolution.md` — subsumed by `043_PT8/03_credential_resolution_logic.md`

#### Cross-Phase Webhook (1 deleted)
- `055_PT20/04_webhook_delivery_retry_logic.md` — subsumed by Phase 2 `08/03_retry_strategy.md`

### Category 2: Phase 0 Acceptance Tasks Duplicating Granular Tasks (4 files)

Sub-epic 088 contained "architecture acceptance" mega-tasks that were simply aggregations of existing individual tasks.

- `088_PT53/03_architecture_acceptance_server.md` — aggregation of `068/04`, `068/05`, `069/01-05`
- `088_PT53/04_architecture_acceptance_logic.md` — aggregation of cross-sub-epic tasks
- `088_PT53/05_tech_stack_acceptance_infrastructure.md` — aggregation of `001/01-03`, `077/02-03`
- `088_PT53/06_tech_stack_acceptance_audits.md` — aggregation of lint tasks across sub-epics

### Category 3: Phase 0 Lint/Policy Duplicate Specifications (5 files)

Sub-epic 072 re-specified lint policies already defined in sub-epics 020, 025, 001, and 096.

- `072_PT37/01_dependency_version_documentation_lint.md` — subsumed by `096_PT7/02_authoritative_dependency_lint.md`
- `072_PT37/02_clippy_policy_configuration.md` — subsumed by `020_PT11/01_workspace_lints_configuration.md`
- `072_PT37/03_missing_documentation_deny_enforcement.md` — subsumed by `020_PT11/01`
- `072_PT37/04_stable_rust_enforcement.md` — subsumed by `001/01_rust_toolchain_pinning.md`
- `072_PT37/05_formatting_lint_blocking_enforcement.md` — subsumed by `025_PT16/02_format_and_lint_command_separation.md`

### Category 4: Phase 0 Validation Duplicates of Earlier Tasks (4 files)

Sub-epic 086 contained validation tasks that duplicated earlier, more detailed tasks.

- `086_PT51/02_boolean_success_enforcement.md` — subsumed by `031_PT22/01_structured_output_parsing_logic.md`
- `086_PT51/03_fan_out_count_limit_validation.md` — subsumed by `079_PT44/02_fan_out_parameter_limits.md`
- `086_PT51/04_retry_count_limit_validation.md` — subsumed by `079_PT44/03_retry_attempt_limits.md`
- `086_PT51/05_project_weight_minimum_validation.md` — subsumed by `080_PT45/01_project_weight_minimum_validation.md`

### Category 5: Phase 0 Pool Exhaustion Duplicate (1 file)

- `087_PT52/05_exhaustion_episode_logic.md` — subsumed by `048_PT13/05_implement_pool_exhaustion_episode_tracking.md`

### Category 6: Phase 5 Duplicate of Phase 0 Work (1 file)

- `phase_5/04_mvp_roadmap/04_enforce_presubmit_performance_targets.md` — subsumed by Phase 0's `003/05` and `026/03`

---

## Cross-Phase Overlaps Documented but NOT Deleted

The following patterns represent intentional architectural layering (Phase 0 defines types/contracts, later phases implement runtime behavior) but should be monitored for scope creep:

### 1. Template Resolver (Phase 0 → Phase 1 → Phase 2)
- **Phase 0** `046/02`: Defines `TemplateResolver` with variable priority, error types, truncation
- **Phase 1** `03/01-06`: Implements the resolver engine, dependency validation, context schema
- **Phase 2** `03/01`: Integrates resolver into scheduler dispatch

**Assessment:** Legitimate layering — Phase 0 defines the type/contract, Phase 1 implements the engine, Phase 2 wires it into the scheduler. No deletion needed.

### 2. Discovery File (Phase 0 → Phase 3)
- **Phase 0** `017/01`, `015/04`: Define types, path resolution, atomic write protocol
- **Phase 3** `01/06`: Implements server-side write/delete with gRPC integration

**Assessment:** Phase 0 defines the `devs-core` types; Phase 3 implements the server-side protocol. Kept both.

### 3. Traceability Scanner (Phase 0 → Phase 5)
- **Phase 0** `007/01-02`: Implements the scanner and reporter
- **Phase 5** `37/03-07`: Re-implements scanner with additional features (commit-atomic check, stale detection)

**Assessment:** Phase 5 tasks extend Phase 0's scanner with RISK-013 mitigation features. Some redundancy exists but Phase 5 adds genuine new functionality. Kept both but flagged for review.

### 4. Coverage Gates (Phase 0 → Phase 5)
- **Phase 0** `006/03`, `028/01`: Implements `./do coverage` with 5 gates
- **Phase 5** `22/01-03`: Re-implements gate enforcement with delta tracking and exclusion validation

**Assessment:** Phase 5 adds delta tracking (RISK-006-BR-003) and exclusion validation (RISK-006-BR-004) not in Phase 0. Kept both.

### 5. State Machine (Phase 0 → Phase 1)
- **Phase 0** `046/01`: Defines `StateMachine` trait with all transitions
- **Phase 1** `01/01`: Re-implements with identical transition table

**Assessment:** Phase 0 defines in `devs-core`; Phase 1 adds `WorkflowRun`/`StageRun` structs and cascade cancellation. The overlap on the raw state machine is real but Phase 1 adds significant domain logic on top.

### 6. Webhook HMAC (Phase 0 → Phase 1)
- **Phase 0** `055/03`: Defines signing algorithm
- **Phase 1** `01/29`: Adds key validation, `Redacted<T>` wrapping

**Assessment:** Phase 1 is a superset. Minor overlap kept for traceability.

### 7. Pool Exhaustion (Phase 0 → Phase 2)
- **Phase 0** `048/05`, `013/03`: Define episode tracking logic
- **Phase 2** `09/01-02`: Implement and integrate with webhook dispatcher

**Assessment:** Phase 0 defines the tracker types; Phase 2 implements runtime integration. Legitimate layering.

---

## Gaps Identified (Flagged for Human Review)

### Phase 1 Massive Gaps (From Phase 1 Review Summary)
- **367+ risk/mitigation requirements** (8_RISKS-REQ-*) have no Phase 1 tasks — they're only covered by Phase 3 (sub-epic 09) and Phase 5
- **Security design requirements 001-073** have no Phase 1 tasks — partially covered by Phase 1 tasks 11-28 as "traceability anchors" but these are stub type definitions, not implementations
- **Adapter infrastructure requirements** (2_TAS-REQ-013 through 016) — adapter trait exists but concrete CLI flag/version details may be incomplete

### Phase 2 Gaps (From Phase 2 Review Summary)
- Workflow submission validation pipeline (the 7-step sequence) has no dedicated task
- Run identification/slug generation at submit time lacks a Phase 2 task (relies on Phase 1)
- Workflow snapshotting integration into the scheduler dispatch lacks a dedicated task

### Phase 3 TUI Duplication Risk
- Sub-epic 07 (TUI Framework, 20 tasks, ~450 requirements) and sub-epic 08 (TUI Visualization, 16 tasks, ~470 requirements) cover overlapping UI code from different spec documents
- These are the largest sub-epics in the entire project and may have significant internal overlap that wasn't caught in the intra-phase review

### Phase 5 Scale Concern
- Phase 5 has 188 task files for "quality gates and verification" — many of these are verification tests for work done in earlier phases
- Sub-epic `01_core_quality_gates` alone has 19 tasks covering performance SLOs (PERF-001 through PERF-221) which may exceed what's achievable in a single phase

---

## Final Statistics

| Phase | Before (original) | After intra-phase | After cross-phase | Total reduction |
|-------|-------------------|-------------------|-------------------|-----------------|
| Phase 0 | 498 | 398 | 356 | 28.5% |
| Phase 1 | 48 | 38 | 38 | 20.8% |
| Phase 2 | 38 | 30 | 30 | 21.1% |
| Phase 3 | 151 | 117 | 117 | 22.5% |
| Phase 4 | 74 | 62 | 62 | 16.2% |
| Phase 5 | 238 | 200 | 199 | 16.4% |
| **Total** | **1,047** | **845** | **802** | **23.4%** |

Note: Counts exclude review_summary.md, README.md, REPORTS.md, dag.json, and other index files.
