# Task: Roadmap Phase Definitions & PTC Schema Validation (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-001], [9_PROJECT_ROADMAP-REQ-002], [9_PROJECT_ROADMAP-REQ-003], [9_PROJECT_ROADMAP-REQ-004], [9_PROJECT_ROADMAP-REQ-005], [9_PROJECT_ROADMAP-REQ-006], [9_PROJECT_ROADMAP-REQ-007], [9_PROJECT_ROADMAP-REQ-008], [9_PROJECT_ROADMAP-REQ-009], [9_PROJECT_ROADMAP-REQ-010], [9_PROJECT_ROADMAP-REQ-011], [9_PROJECT_ROADMAP-REQ-012], [9_PROJECT_ROADMAP-REQ-013], [9_PROJECT_ROADMAP-REQ-014], [9_PROJECT_ROADMAP-REQ-015], [9_PROJECT_ROADMAP-REQ-016], [9_PROJECT_ROADMAP-REQ-017], [9_PROJECT_ROADMAP-REQ-018], [9_PROJECT_ROADMAP-REQ-019], [9_PROJECT_ROADMAP-REQ-020], [9_PROJECT_ROADMAP-REQ-021], [9_PROJECT_ROADMAP-REQ-022], [9_PROJECT_ROADMAP-REQ-023], [9_PROJECT_ROADMAP-REQ-024], [9_PROJECT_ROADMAP-REQ-025], [9_PROJECT_ROADMAP-REQ-026], [9_PROJECT_ROADMAP-REQ-027], [9_PROJECT_ROADMAP-REQ-028], [9_PROJECT_ROADMAP-REQ-029], [9_PROJECT_ROADMAP-REQ-030], [9_PROJECT_ROADMAP-REQ-031], [9_PROJECT_ROADMAP-REQ-032], [9_PROJECT_ROADMAP-REQ-033], [9_PROJECT_ROADMAP-REQ-034], [9_PROJECT_ROADMAP-REQ-035], [9_PROJECT_ROADMAP-REQ-036], [9_PROJECT_ROADMAP-REQ-037], [9_PROJECT_ROADMAP-REQ-038], [9_PROJECT_ROADMAP-REQ-039], [9_PROJECT_ROADMAP-REQ-040], [9_PROJECT_ROADMAP-REQ-041], [9_PROJECT_ROADMAP-REQ-042], [9_PROJECT_ROADMAP-REQ-043], [9_PROJECT_ROADMAP-REQ-044], [9_PROJECT_ROADMAP-REQ-100], [9_PROJECT_ROADMAP-REQ-101], [9_PROJECT_ROADMAP-REQ-102], [9_PROJECT_ROADMAP-REQ-103], [9_PROJECT_ROADMAP-REQ-104], [9_PROJECT_ROADMAP-REQ-105], [9_PROJECT_ROADMAP-REQ-106], [9_PROJECT_ROADMAP-REQ-107], [9_PROJECT_ROADMAP-REQ-108], [9_PROJECT_ROADMAP-REQ-109], [9_PROJECT_ROADMAP-REQ-110], [9_PROJECT_ROADMAP-REQ-111], [9_PROJECT_ROADMAP-REQ-112], [9_PROJECT_ROADMAP-REQ-113], [9_PROJECT_ROADMAP-REQ-114], [9_PROJECT_ROADMAP-REQ-115], [9_PROJECT_ROADMAP-REQ-116], [9_PROJECT_ROADMAP-REQ-117], [9_PROJECT_ROADMAP-REQ-118], [9_PROJECT_ROADMAP-REQ-119], [9_PROJECT_ROADMAP-REQ-120], [9_PROJECT_ROADMAP-REQ-121], [9_PROJECT_ROADMAP-REQ-122], [9_PROJECT_ROADMAP-REQ-123], [9_PROJECT_ROADMAP-REQ-124], [9_PROJECT_ROADMAP-REQ-125], [9_PROJECT_ROADMAP-REQ-126], [9_PROJECT_ROADMAP-REQ-127], [9_PROJECT_ROADMAP-REQ-128], [9_PROJECT_ROADMAP-REQ-129], [9_PROJECT_ROADMAP-REQ-130], [9_PROJECT_ROADMAP-REQ-131], [9_PROJECT_ROADMAP-REQ-132], [9_PROJECT_ROADMAP-REQ-133], [9_PROJECT_ROADMAP-REQ-134], [9_PROJECT_ROADMAP-REQ-135], [9_PROJECT_ROADMAP-REQ-136], [9_PROJECT_ROADMAP-REQ-137], [9_PROJECT_ROADMAP-REQ-138], [9_PROJECT_ROADMAP-REQ-139], [9_PROJECT_ROADMAP-REQ-140], [9_PROJECT_ROADMAP-REQ-141], [9_PROJECT_ROADMAP-REQ-142], [9_PROJECT_ROADMAP-REQ-143], [9_PROJECT_ROADMAP-REQ-144], [9_PROJECT_ROADMAP-REQ-145], [9_PROJECT_ROADMAP-REQ-146], [9_PROJECT_ROADMAP-REQ-147], [9_PROJECT_ROADMAP-REQ-148], [9_PROJECT_ROADMAP-REQ-149], [9_PROJECT_ROADMAP-REQ-150], [9_PROJECT_ROADMAP-REQ-151], [9_PROJECT_ROADMAP-REQ-152], [9_PROJECT_ROADMAP-REQ-153], [9_PROJECT_ROADMAP-REQ-154], [9_PROJECT_ROADMAP-REQ-155], [9_PROJECT_ROADMAP-REQ-156], [9_PROJECT_ROADMAP-REQ-157], [9_PROJECT_ROADMAP-REQ-158], [9_PROJECT_ROADMAP-REQ-159], [9_PROJECT_ROADMAP-REQ-160], [9_PROJECT_ROADMAP-REQ-161], [9_PROJECT_ROADMAP-REQ-162], [9_PROJECT_ROADMAP-REQ-163], [9_PROJECT_ROADMAP-REQ-164], [9_PROJECT_ROADMAP-REQ-165], [9_PROJECT_ROADMAP-REQ-166], [9_PROJECT_ROADMAP-REQ-167], [9_PROJECT_ROADMAP-REQ-168], [9_PROJECT_ROADMAP-REQ-169], [9_PROJECT_ROADMAP-REQ-170], [9_PROJECT_ROADMAP-REQ-171], [9_PROJECT_ROADMAP-REQ-172]

## Dependencies
- depends_on: [none]
- shared_components: [Phase Transition Checkpoint (PTC) Model (consumer), ./do Entrypoint Script & CI Pipeline (consumer), Traceability & Coverage Infrastructure (consumer)]

## 1. Initial Test Written

### Strategic Objectives
- [ ] Write `test_so1_self_hosting_requirement` (`// Covers: 9_PROJECT_ROADMAP-REQ-001`): Verify the `presubmit-check` workflow definition exists and can be parsed. Verify it targets all 3 CI platforms.
- [ ] Write `test_so2_quality_gates_enforcement` (`// Covers: 9_PROJECT_ROADMAP-REQ-002`): Verify `./do coverage` checks all 5 gates (QG-001 through QG-005) and exits non-zero if any fails.
- [ ] Write `test_so3_security_baseline` (`// Covers: 9_PROJECT_ROADMAP-REQ-003`): Verify `cargo audit --deny warnings` is run by `./do lint`.

### Non-Negotiable Constraints
- [ ] Write `test_road_cons_001_no_business_logic_before_ptc` (`// Covers: 9_PROJECT_ROADMAP-REQ-004`): Verify `./do lint` enforces crate-level import boundaries via `cargo tree` checks. No crate may have business logic until dependencies pass PTC.
- [ ] Write `test_road_cons_002_critical_risks_mitigated` (`// Covers: 9_PROJECT_ROADMAP-REQ-005`): Verify RISK-002, RISK-004, RISK-005, RISK-009 have covering tests that pass before affected components have code.
- [ ] Write `test_road_cons_003_presubmit_timeout` (`// Covers: 9_PROJECT_ROADMAP-REQ-006`): Verify `./do presubmit` enforces 15-minute (900s) wall-clock timeout.
- [ ] Write `test_road_cons_004_bootstrap_stubs` (`// Covers: 9_PROJECT_ROADMAP-REQ-007`): Verify `./do lint` exits non-zero if `// TODO: BOOTSTRAP-STUB` exists after Phase 3 PTC.
- [ ] Write `test_road_cons_005_mcp_always_active` (`// Covers: 9_PROJECT_ROADMAP-REQ-008`): Verify MCP server is active from first commit with port binding. No feature flag gates it.
- [ ] Write `test_road_cons_006_e2e_interface_boundary` (`// Covers: 9_PROJECT_ROADMAP-REQ-009`): Verify E2E tests use actual interface boundaries (assert_cmd for CLI, TestBackend for TUI, POST /mcp/v1/call for MCP).

### Phase Definitions
- [ ] Write `test_phase_definitions` (`// Covers: 9_PROJECT_ROADMAP-REQ-010, -011, -012, -013, -014, -015`): Verify all 6 phases are defined with correct gate conditions in the roadmap.

### PTC Schema Validation
- [ ] Write `test_ptc_json_schema_valid` (`// Covers: 9_PROJECT_ROADMAP-REQ-038`): Validate `PhaseTransitionCheckpoint` JSON schema programmatically in `./do test`. Valid PTCs pass; invalid ones (wrong schema_version, missing fields, bad date format) fail.
- [ ] Write `test_ptc_committed_before_next_phase` (`// Covers: 9_PROJECT_ROADMAP-REQ-018`): PTC must be committed to `docs/adr/` before Phase N+1 business logic is written.
- [ ] Write `test_ptc_platforms_verified` (`// Covers: 9_PROJECT_ROADMAP-REQ-019, -024`): Phase 0 and Phase 4 PTCs require all 3 platforms; Phases 1-3 may be Linux-only.
- [ ] Write `test_ptc_unverified_gate_lint` (`// Covers: 9_PROJECT_ROADMAP-REQ-033`): `./do lint` exits non-zero if any PTC has `verified: false` gate conditions.
- [ ] Write `test_bootstrap_stub_lint` (`// Covers: 9_PROJECT_ROADMAP-REQ-034`): `./do lint` exits non-zero if `BOOTSTRAP-STUB` exists after Phase 3 PTC.
- [ ] Write `test_ptc_phase_gates_in_traceability` (`// Covers: 9_PROJECT_ROADMAP-REQ-032`): `./do test` generates `target/traceability.json` with `phase_gates` array.

### PTC Business Rules
- [ ] Write `test_ptc_parallel_e2e_allowed_phase4` (`// Covers: 9_PROJECT_ROADMAP-REQ-016`): Parallel E2E test work during Phase 4 allowed if no production code changes.
- [ ] Write `test_bootstrap_attempt_requires_linux` (`// Covers: 9_PROJECT_ROADMAP-REQ-017`): Bootstrap attempt must not start until `./do presubmit` passes on Linux with stub workspace.
- [ ] Write `test_bootstrap_adr_fields` (`// Covers: 9_PROJECT_ROADMAP-REQ-020, -036`): Bootstrap ADR must include CI URL, git SHA, COND confirmations.
- [ ] Write `test_bootstrap_stubs_phases_0_3_only` (`// Covers: 9_PROJECT_ROADMAP-REQ-021`): BOOTSTRAP-STUB annotations only permitted in Phases 0-3.
- [ ] Write `test_phase5_all_qg_simultaneous` (`// Covers: 9_PROJECT_ROADMAP-REQ-022, -028`): Phase 5 requires all 5 coverage gates passing simultaneously.
- [ ] Write `test_fb007_single_warn` (`// Covers: 9_PROJECT_ROADMAP-REQ-023`): FB-007 fallback emits exactly one WARN line until retired.
- [ ] Write `test_ptc_import_boundaries` (`// Covers: 9_PROJECT_ROADMAP-REQ-025, -039`): Parallel crates respect import boundaries.
- [ ] Write `test_phase1_ptc_3_clean_runs` (`// Covers: 9_PROJECT_ROADMAP-REQ-026`): Phase 1 PTC requires 3 consecutive clean CI runs.
- [ ] Write `test_bootstrap_windows_failure_blocks` (`// Covers: 9_PROJECT_ROADMAP-REQ-027`): Bootstrap Windows failure must be fixed before Phase 4.
- [ ] Write `test_bootstrap_stub_phase5_resolution` (`// Covers: 9_PROJECT_ROADMAP-REQ-029`): BOOTSTRAP-STUB in Phase 5 resolved immediately via TDD.
- [ ] Write `test_phase4_bootstrap_ptc` (`// Covers: 9_PROJECT_ROADMAP-REQ-030`): Phase 4 bootstrap PTC requires all stages completed.
- [ ] Write `test_duplicate_ptc_linear_ordering` (`// Covers: 9_PROJECT_ROADMAP-REQ-031`): Duplicate PTC commits resolved by linear git ordering.
- [ ] Write `test_presubmit_warn_per_fallback` (`// Covers: 9_PROJECT_ROADMAP-REQ-035`): `./do presubmit` emits exactly one WARN per active fallback.
- [ ] Write `test_coverage_exits_nonzero_any_qg` (`// Covers: 9_PROJECT_ROADMAP-REQ-037`): `./do coverage` exits non-zero when any QG fails; 0 only when all pass.
- [ ] Write `test_bootstrap_900s_budget` (`// Covers: 9_PROJECT_ROADMAP-REQ-040`): Phase 4 bootstrap attempt within 900-second budget.
- [ ] Write `test_risk_matrix_violations_in_traceability` (`// Covers: 9_PROJECT_ROADMAP-REQ-041`): `target/traceability.json` includes `risk_matrix_violations` array.

### Presubmit Timing Schema
- [ ] Write `test_over_budget_warn_not_fail` (`// Covers: 9_PROJECT_ROADMAP-REQ-042`): Step exceeding budget by >20% logs WARN and sets `over_budget: true` but does not fail.
- [ ] Write `test_hard_timeout_timer_cleanup` (`// Covers: 9_PROJECT_ROADMAP-REQ-043`): 900,000ms hard timeout enforced by background process; PID file cleaned up.
- [ ] Write `test_timings_jsonl_incremental` (`// Covers: 9_PROJECT_ROADMAP-REQ-044`): `presubmit_timings.jsonl` written incrementally, one line per step, flushed immediately.

### Phase Deliverable Tracking (Phase 0-2)
- [ ] Write tests verifying Phase 0 deliverables exist and are correctly defined: workspace + toolchain [REQ-100-112], ./do script [REQ-113-125], devs-proto [REQ-126-134], devs-core [REQ-135-145].
- [ ] Write tests verifying Phase 1 deliverables: devs-config [REQ-146-152], devs-checkpoint [REQ-153-157], devs-adapters [REQ-158-163], devs-pool [REQ-164-168], devs-executor [REQ-169-172].

## 2. Task Implementation
- [ ] Implement `PhaseTransitionCheckpointValidator` module that parses PTC JSON from `docs/adr/NNNN-phase-N-complete.md` files. Validate `schema_version == 1`, `phase_id` matches `ROAD-00(0-6)`, `completed_at` is RFC 3339 with ms+Z, `platforms_verified` meets per-phase requirements, all `gate_conditions[].verified == true`.
- [ ] Integrate PTC validation into `./do lint`: scan `docs/adr/` for PTC files, validate each. Exit non-zero if any has `verified: false`.
- [ ] Integrate PTC validation into `./do test`: generate `phase_gates` array in `target/traceability.json`.
- [ ] Implement `BOOTSTRAP-STUB` scanning in `./do lint`: scan all `**/*.rs` files for `// TODO: BOOTSTRAP-STUB`. Exit non-zero if found after Phase 3 PTC exists.
- [ ] Implement crate import boundary enforcement in `./do lint` via `cargo tree` checks: verify `devs-core` has no `tokio`, `git2`, `reqwest`, `tonic` dependencies.
- [ ] Implement presubmit timing validation: verify `target/presubmit_timings.jsonl` has entries for all steps, validate `over_budget` field, verify 900s hard timeout mechanism.

## 3. Code Review
- [ ] Verify PTC validator rejects all invalid states: wrong schema_version, missing platforms, unverified gates.
- [ ] Verify BOOTSTRAP-STUB scanning correctly distinguishes between Phase 0-3 (allowed) and Phase 5 (blocked).
- [ ] Verify `cargo tree` checks use `--edges normal` to exclude dev-dependencies.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- roadmap ptc phase_gate`.
- [ ] Run `./do lint` and verify PTC validation and BOOTSTRAP-STUB scanning pass.
- [ ] Run `./do test` and verify `target/traceability.json` contains `phase_gates` array.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations to all new tests.

## 6. Automated Verification
- [ ] Run `./do presubmit` end-to-end. Verify PTC validation, BOOTSTRAP-STUB scanning, and phase gate enforcement all pass.
