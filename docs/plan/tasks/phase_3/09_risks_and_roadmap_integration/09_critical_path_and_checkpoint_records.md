# Task: Critical Path Validation & Checkpoint Record Infrastructure (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-371], [9_PROJECT_ROADMAP-REQ-372], [9_PROJECT_ROADMAP-REQ-373], [9_PROJECT_ROADMAP-REQ-374], [9_PROJECT_ROADMAP-REQ-375], [9_PROJECT_ROADMAP-REQ-376], [9_PROJECT_ROADMAP-REQ-377], [9_PROJECT_ROADMAP-REQ-378], [9_PROJECT_ROADMAP-REQ-379], [9_PROJECT_ROADMAP-REQ-380], [9_PROJECT_ROADMAP-REQ-381], [9_PROJECT_ROADMAP-REQ-382], [9_PROJECT_ROADMAP-REQ-383], [9_PROJECT_ROADMAP-REQ-384], [9_PROJECT_ROADMAP-REQ-385], [9_PROJECT_ROADMAP-REQ-386], [9_PROJECT_ROADMAP-REQ-387], [9_PROJECT_ROADMAP-REQ-388], [9_PROJECT_ROADMAP-REQ-389], [9_PROJECT_ROADMAP-REQ-390], [9_PROJECT_ROADMAP-REQ-391], [9_PROJECT_ROADMAP-REQ-392], [9_PROJECT_ROADMAP-REQ-393], [9_PROJECT_ROADMAP-REQ-394], [9_PROJECT_ROADMAP-REQ-395], [9_PROJECT_ROADMAP-REQ-396], [9_PROJECT_ROADMAP-REQ-397], [9_PROJECT_ROADMAP-REQ-398], [9_PROJECT_ROADMAP-REQ-399], [9_PROJECT_ROADMAP-REQ-400], [9_PROJECT_ROADMAP-REQ-401], [9_PROJECT_ROADMAP-REQ-402], [9_PROJECT_ROADMAP-REQ-403], [9_PROJECT_ROADMAP-REQ-404], [9_PROJECT_ROADMAP-REQ-405], [9_PROJECT_ROADMAP-REQ-406], [9_PROJECT_ROADMAP-REQ-407], [9_PROJECT_ROADMAP-REQ-408], [9_PROJECT_ROADMAP-REQ-409], [9_PROJECT_ROADMAP-REQ-410], [9_PROJECT_ROADMAP-REQ-411], [9_PROJECT_ROADMAP-REQ-412], [9_PROJECT_ROADMAP-REQ-413], [9_PROJECT_ROADMAP-REQ-414], [9_PROJECT_ROADMAP-REQ-415], [9_PROJECT_ROADMAP-REQ-416], [9_PROJECT_ROADMAP-REQ-417], [9_PROJECT_ROADMAP-REQ-418], [9_PROJECT_ROADMAP-REQ-419], [9_PROJECT_ROADMAP-REQ-420], [9_PROJECT_ROADMAP-REQ-421], [9_PROJECT_ROADMAP-REQ-422], [9_PROJECT_ROADMAP-REQ-423], [9_PROJECT_ROADMAP-REQ-424], [9_PROJECT_ROADMAP-REQ-425], [9_PROJECT_ROADMAP-REQ-426], [9_PROJECT_ROADMAP-REQ-427], [9_PROJECT_ROADMAP-REQ-428], [9_PROJECT_ROADMAP-REQ-429], [9_PROJECT_ROADMAP-REQ-430], [9_PROJECT_ROADMAP-REQ-431], [9_PROJECT_ROADMAP-REQ-432], [9_PROJECT_ROADMAP-REQ-433], [9_PROJECT_ROADMAP-REQ-434], [9_PROJECT_ROADMAP-REQ-435], [9_PROJECT_ROADMAP-REQ-436], [9_PROJECT_ROADMAP-REQ-437], [9_PROJECT_ROADMAP-REQ-438], [9_PROJECT_ROADMAP-REQ-439], [9_PROJECT_ROADMAP-REQ-440], [9_PROJECT_ROADMAP-REQ-441], [9_PROJECT_ROADMAP-REQ-442], [9_PROJECT_ROADMAP-REQ-443], [9_PROJECT_ROADMAP-REQ-444], [9_PROJECT_ROADMAP-REQ-445], [9_PROJECT_ROADMAP-REQ-446], [9_PROJECT_ROADMAP-REQ-447]

## Dependencies
- depends_on: [07_roadmap_phase_definitions_and_ptc_validation.md]
- shared_components: [Phase Transition Checkpoint (PTC) Model (consumer), ./do Entrypoint Script & CI Pipeline (consumer), Traceability & Coverage Infrastructure (consumer)]

## 1. Initial Test Written

### Critical Path Slippage Rules
- [ ] Write `test_core_refactor_requires_revalidation` (`// Covers: 9_PROJECT_ROADMAP-REQ-371`): devs-core type refactor mid-Phase 1 requires all Phase 1 crates re-validated.
- [ ] Write `test_adapter_trait_change_sync` (`// Covers: 9_PROJECT_ROADMAP-REQ-372`): devs-adapters trait changes after devs-pool begins requires synchronized update.
- [ ] Write `test_scheduler_benchmark_blocks_grpc` (`// Covers: 9_PROJECT_ROADMAP-REQ-373`): devs-scheduler dispatch benchmark failure blocks devs-grpc work.
- [ ] Write `test_tui_snapshot_ratatui_update` (`// Covers: 9_PROJECT_ROADMAP-REQ-374`): TUI snapshot test failures from ratatui updates require manual review.
- [ ] Write `test_bootstrap_windows_path_sep` (`// Covers: 9_PROJECT_ROADMAP-REQ-375`): Windows path separator failure in discovery file requires normalization fix.
- [ ] Write `test_core_coverage_before_phase1` (`// Covers: 9_PROJECT_ROADMAP-REQ-383`): devs-core ≥90% unit coverage before Phase 1 crates exceed 0%.
- [ ] Write `test_scheduler_latency_benchmark` (`// Covers: 9_PROJECT_ROADMAP-REQ-384`): devs-scheduler dispatch latency ≤100ms before devs-grpc implementation.
- [ ] Write `test_core_no_runtime_deps` (`// Covers: 9_PROJECT_ROADMAP-REQ-385`): devs-core has no tokio, git2, reqwest, tonic dependencies (verified by `./do lint`).
- [ ] Write `test_cpm_node_arithmetic` (`// Covers: 9_PROJECT_ROADMAP-REQ-386`): CPM node table EF, LF, Float calculations validated.
- [ ] Write `test_grpc_mcp_proto_conflict` (`// Covers: 9_PROJECT_ROADMAP-REQ-387`): devs-grpc and devs-mcp merge conflict on run.proto handled via regeneration.
- [ ] Write `test_bootstrap_all_platforms_pipeline` (`// Covers: 9_PROJECT_ROADMAP-REQ-388`): Bootstrap validation verified on all 3 CI platforms with pipeline URLs.
- [ ] Write `test_slippage_state_machine_adr` (`// Covers: 9_PROJECT_ROADMAP-REQ-389`): Slippage tracked in ADR with slip_amount_weeks and impact fields.
- [ ] Write `test_float_values_consistent` (`// Covers: 9_PROJECT_ROADMAP-REQ-390`): Float values consistent with dependency graph (ES ≥ predecessor EF).
- [ ] Write `test_timings_over_budget_fields` (`// Covers: 9_PROJECT_ROADMAP-REQ-391`): `presubmit_timings.jsonl` validates over_budget fields for Phase 0 CPM steps.
- [ ] Write tests for remaining critical path rules: TUI coverage gap [REQ-376], devs-config float [REQ-377], git2 MSRV [REQ-378], webhook rustls [REQ-379], proto merge [REQ-380], client-util API [REQ-381, -392], mcp-bridge streaming bug [REQ-382].

### Checkpoint Record Schema
- [ ] Write `test_checkpoint_schema_version` (`// Covers: 9_PROJECT_ROADMAP-REQ-393`): schema_version always 1; reject any other value.
- [ ] Write `test_checkpoint_id_format` (`// Covers: 9_PROJECT_ROADMAP-REQ-394`): checkpoint_id format `ROAD-CHECK-(0-9){3}`.
- [ ] Write `test_checkpoint_phase_id_format` (`// Covers: 9_PROJECT_ROADMAP-REQ-395`): phase_id format `p0` through `p5` (lowercase).
- [ ] Write `test_checkpoint_attempt_field` (`// Covers: 9_PROJECT_ROADMAP-REQ-396`): attempt field ≥ 1.
- [ ] Write `test_checkpoint_status_values` (`// Covers: 9_PROJECT_ROADMAP-REQ-397`): status one of: pending, passed, failed.
- [ ] Write `test_checkpoint_commit_sha_format` (`// Covers: 9_PROJECT_ROADMAP-REQ-398`): commit_sha is 40-char hex.
- [ ] Write `test_checkpoint_ci_pipeline_urls` (`// Covers: 9_PROJECT_ROADMAP-REQ-399`): ci_pipeline_urls object with linux, macos, windows keys required.
- [ ] Write `test_checkpoint_check_status_values` (`// Covers: 9_PROJECT_ROADMAP-REQ-400`): checks[].status: passed, failed, or skipped.
- [ ] Write `test_checkpoint_failure_detail_max` (`// Covers: 9_PROJECT_ROADMAP-REQ-401`): failure_detail max 4096 chars or null.
- [ ] Write `test_checkpoint_blocker_field` (`// Covers: 9_PROJECT_ROADMAP-REQ-402, -430`): blocker non-null iff status: failed; first failing check alphabetically.
- [ ] Write `test_passed_checkpoint_immutable` (`// Covers: 9_PROJECT_ROADMAP-REQ-403, -423`): Passed checkpoint cannot be overwritten; attempted overwrite exits non-zero.
- [ ] Write `test_failed_creates_next_attempt` (`// Covers: 9_PROJECT_ROADMAP-REQ-404, -424`): Failed attempt creates attempt_N+1.json.
- [ ] Write `test_checkpoint_committed_before_pipeline` (`// Covers: 9_PROJECT_ROADMAP-REQ-405`): Record committed to checkpoint branch before pipeline completion.
- [ ] Write `test_skipped_status_windows_only` (`// Covers: 9_PROJECT_ROADMAP-REQ-406, -428`): skipped status only valid for Windows platform checks on Linux/macOS jobs.
- [ ] Write `test_ci_urls_null_local_only` (`// Covers: 9_PROJECT_ROADMAP-REQ-407`): ci_pipeline_urls all null valid only for local triage.
- [ ] Write `test_passed_requires_all_platforms` (`// Covers: 9_PROJECT_ROADMAP-REQ-408`): Checkpoint passed only when all 3 platforms green for same commit SHA.
- [ ] Write `test_regression_blocks_next` (`// Covers: 9_PROJECT_ROADMAP-REQ-409`): Regression after passed checkpoint blocks next checkpoint but doesn't rollback.
- [ ] Write `test_all_platforms_tests_and_lint` (`// Covers: 9_PROJECT_ROADMAP-REQ-410`): Unit/Integration tests pass on all 3 platforms; ./do lint on all shells.
- [ ] Write `test_900s_per_platform` (`// Covers: 9_PROJECT_ROADMAP-REQ-411`): 900-second timeout applies per platform independently.
- [ ] Write `test_no_waiver_without_fallback` (`// Covers: 9_PROJECT_ROADMAP-REQ-412`): No check may be waived without active fallback entry.
- [ ] Write `test_phase_checkpoints_0_through_5` (`// Covers: 9_PROJECT_ROADMAP-REQ-413 through -419`): Verify checkpoint records for each phase transition (0→1, 1→2, 2→3, 3→4, 4→5, 5→MVP).
- [ ] Write `test_overall_passed_invariant` (`// Covers: 9_PROJECT_ROADMAP-REQ-420`): overall_passed == AND(gates[*].passed).
- [ ] Write `test_missing_dependency_check_failure` (`// Covers: 9_PROJECT_ROADMAP-REQ-421`): Missing dependency causes check failure with "missing dependency" detail.
- [ ] Write `test_checkpoint_on_state_branch` (`// Covers: 9_PROJECT_ROADMAP-REQ-422`): Checkpoint records committed to devs/state branch, not working branch.
- [ ] Write `test_bootstrap_cond_all_platforms` (`// Covers: 9_PROJECT_ROADMAP-REQ-425`): Bootstrap not passed until COND-001/002/003 verified on all platforms.
- [ ] Write `test_relaxed_e2e_not_sufficient_phase5` (`// Covers: 9_PROJECT_ROADMAP-REQ-426`): Relaxed E2E gates at Phase 4 (≥25%) don't satisfy Phase 5 (≥50%).
- [ ] Write `test_bootstrap_adr_sha_not_head` (`// Covers: 9_PROJECT_ROADMAP-REQ-417, -427`): Bootstrap ADR commit_sha must not equal HEAD.
- [ ] Write `test_presubmit_warn_fallbacks` (`// Covers: 9_PROJECT_ROADMAP-REQ-429`): ./do presubmit emits exactly one WARN per active fallback; zero if none active.
- [ ] Write `test_ci_temp_branch_cleanup` (`// Covers: 9_PROJECT_ROADMAP-REQ-431`): ./do ci cleans up temp branch unconditionally before returning.

### Artifact Data Model Schemas
- [ ] Write `test_timings_over_budget_warn` (`// Covers: 9_PROJECT_ROADMAP-REQ-432`): Step over-budget by >20% logs WARN, sets over_budget but doesn't fail.
- [ ] Write `test_timings_total_entry_last` (`// Covers: 9_PROJECT_ROADMAP-REQ-433`): total entry is last line; duration_ms is wall-clock.
- [ ] Write `test_timings_ci_artifact` (`// Covers: 9_PROJECT_ROADMAP-REQ-434`): ./do ci uploads presubmit_timings.jsonl as artifact with 7-day expiry, when: always.
- [ ] Write `test_traceability_req_id_scanning` (`// Covers: 9_PROJECT_ROADMAP-REQ-435`): Requirement IDs scanned from docs/plan/specs/*.md via documented regex pattern.
- [ ] Write `test_traceability_annotation_scanning` (`// Covers: 9_PROJECT_ROADMAP-REQ-436`): Test annotations scanned from **/*.rs via `// Covers:` pattern.
- [ ] Write `test_uncovered_req_fails` (`// Covers: 9_PROJECT_ROADMAP-REQ-437`): covered: false requirement causes overall_passed: false.
- [ ] Write `test_overall_passed_logical_and` (`// Covers: 9_PROJECT_ROADMAP-REQ-438`): overall_passed is logical AND of all 5 gate.passed values.
- [ ] Write `test_delta_pct_computation` (`// Covers: 9_PROJECT_ROADMAP-REQ-439`): delta_pct is difference between actual_pct and threshold_pct.
- [ ] Write `test_unit_coverage_not_interface` (`// Covers: 9_PROJECT_ROADMAP-REQ-440`): Unit test coverage does NOT count toward QG-003/004/005.
- [ ] Write `test_adr_separate_commit` (`// Covers: 9_PROJECT_ROADMAP-REQ-441`): ADR file committed in separate commit from implementation changes.
- [ ] Write `test_bootstrap_adr_commit_sha` (`// Covers: 9_PROJECT_ROADMAP-REQ-442`): commit_sha must be SHA that caused last CI platform to go green.
- [ ] Write `test_fallback_active_count` (`// Covers: 9_PROJECT_ROADMAP-REQ-443`): active_count equals count of Active entries.
- [ ] Write `test_max_3_fallbacks` (`// Covers: 9_PROJECT_ROADMAP-REQ-444`): active_count > 3 causes exit non-zero.
- [ ] Write `test_fallback_warn_lines` (`// Covers: 9_PROJECT_ROADMAP-REQ-445`): ./do presubmit emits one WARN per Active fallback.
- [ ] Write `test_captured_at_freshness` (`// Covers: 9_PROJECT_ROADMAP-REQ-446`): captured_at must be within 7 days of current date.
- [ ] Write `test_unavailable_adapter_warn` (`// Covers: 9_PROJECT_ROADMAP-REQ-447`): Unavailable adapter (available: false) causes WARN with adapter name.

## 2. Task Implementation
- [ ] Implement `CheckpointRecordValidator` module that validates checkpoint record JSON against the schema: schema_version, checkpoint_id format, phase_id format, attempt ≥ 1, status enum, commit_sha format, ci_pipeline_urls structure, checks[].status enum, failure_detail length, blocker field consistency.
- [ ] Implement checkpoint record persistence to `devs/state` branch. Ensure passed records are immutable (reject overwrites). Failed records create new attempt files.
- [ ] Implement critical path validation in `./do lint`: verify devs-core has no runtime dependencies, verify CPM node arithmetic consistency, verify float values match dependency graph.
- [ ] Implement artifact schema validation: `presubmit_timings.jsonl` format validation, `traceability.json` requirement ID scanning from specs, annotation scanning from Rust files, delta_pct computation.
- [ ] Implement slippage tracking: ADR entries with `slip_amount_weeks` and `impact` fields when phases slip.

## 3. Code Review
- [ ] Verify checkpoint record validator covers all field constraints from the schema.
- [ ] Verify passed checkpoint immutability is enforced at the git level (not just in-memory).
- [ ] Verify traceability scanning regex matches the documented pattern exactly.
- [ ] Verify CPM float calculations use the correct dependency graph topology.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- checkpoint_record critical_path artifact_schema`.
- [ ] Run `./do lint` and verify critical path checks pass.
- [ ] Run `./do test` and verify traceability.json scanning works correctly.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations to all new tests.

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify all checkpoint record and artifact schema validation passes.
