# Task: Technical Risk Covering Tests — Presubmit, Coverage, Template, Docker/SSH (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [8_RISKS-REQ-133], [8_RISKS-REQ-134], [8_RISKS-REQ-135], [8_RISKS-REQ-136], [8_RISKS-REQ-137], [8_RISKS-REQ-138], [8_RISKS-REQ-139], [8_RISKS-REQ-140], [8_RISKS-REQ-141], [8_RISKS-REQ-142], [8_RISKS-REQ-143], [8_RISKS-REQ-144], [8_RISKS-REQ-145], [8_RISKS-REQ-146], [8_RISKS-REQ-147], [8_RISKS-REQ-148], [8_RISKS-REQ-149], [8_RISKS-REQ-150], [8_RISKS-REQ-151], [8_RISKS-REQ-152], [8_RISKS-REQ-153], [8_RISKS-REQ-154], [8_RISKS-REQ-155], [8_RISKS-REQ-156], [8_RISKS-REQ-157], [8_RISKS-REQ-158], [8_RISKS-REQ-159], [8_RISKS-REQ-160], [8_RISKS-REQ-161], [8_RISKS-REQ-162], [8_RISKS-REQ-163], [8_RISKS-REQ-164], [8_RISKS-REQ-165], [8_RISKS-REQ-166], [8_RISKS-REQ-167], [8_RISKS-REQ-168], [8_RISKS-REQ-169], [8_RISKS-REQ-170], [8_RISKS-REQ-171], [8_RISKS-REQ-172], [8_RISKS-REQ-173]

## Dependencies
- depends_on: [01_risk_matrix_schema_and_validation_infrastructure.md]
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer), devs-core (consumer — TemplateResolver), devs-executor (consumer), Traceability & Coverage Infrastructure (consumer)]

## 1. Initial Test Written

### RISK-005: 15-Minute Presubmit Timeout
- [ ] Write `test_presubmit_timings_jsonl_created` (`// Covers: RISK-005, 8_RISKS-REQ-139`): Run `./do presubmit` (or simulate) and assert `target/presubmit_timings.jsonl` is created with one JSON line per step. Verify each line has `step_name`, `duration_ms`, `budget_ms`, `over_budget` fields.
- [ ] Write `test_presubmit_hard_timeout` (`// Covers: RISK-005, 8_RISKS-REQ-140`): Verify `./do presubmit` exits non-zero within 905 seconds when a step hangs.
- [ ] Write `test_ci_jobs_within_timeout` (`// Covers: RISK-005, 8_RISKS-REQ-141`): Verify all three CI jobs complete within 25-minute CI timeout.
- [ ] Write `test_clean_checkout_within_budget` (`// Covers: RISK-005, 8_RISKS-REQ-142`): `./do presubmit` on clean checkout completes within 15 minutes.
- [ ] Write tests for: 900-second wall-clock timeout [8_RISKS-REQ-135], incremental JSONL writing [8_RISKS-REQ-136], background timer killed on success [8_RISKS-REQ-137], over_budget is warning not failure [8_RISKS-REQ-138].

### RISK-006: Coverage Gate Unachievability
- [ ] Write `test_coverage_exits_nonzero_on_gate_failure` (`// Covers: RISK-006, 8_RISKS-REQ-149`): `./do coverage` exits non-zero when any of the 5 gates fails.
- [ ] Write `test_report_json_has_five_gates` (`// Covers: RISK-006, 8_RISKS-REQ-150`): `target/coverage/report.json` contains exactly 5 gate entries (QG-001 through QG-005).
- [ ] Write `test_delta_pct_computed` (`// Covers: RISK-006, 8_RISKS-REQ-151`): `delta_pct` is non-null and reflects difference from previous run.
- [ ] Write `test_uncovered_lines_populated` (`// Covers: RISK-006, 8_RISKS-REQ-152`): `uncovered_lines` populated for failing gates with real source locations.
- [ ] Write tests for: exclusions only for platform-conditional/generated code [8_RISKS-REQ-145], direct function calls don't satisfy interface QGs [8_RISKS-REQ-146], delta_pct baseline from CI artifacts [8_RISKS-REQ-147], excluded_lines.txt committed [8_RISKS-REQ-148].

### RISK-007: Template Injection via Stage Output
- [ ] Write `test_nested_template_no_reexpansion` (`// Covers: RISK-007, 8_RISKS-REQ-159`): Input containing `{{stage.x.y}}` as a value resolves as literal string, no second expansion pass.
- [ ] Write `test_nonscalar_field_returns_error` (`// Covers: RISK-007, 8_RISKS-REQ-160`): `TemplateResolver` returns `NonScalarField` error for object/array values.
- [ ] Write `test_10240_byte_truncation` (`// Covers: RISK-007, 8_RISKS-REQ-161`): 20,480-byte input truncated to last 10,240 bytes.
- [ ] Write `test_boolean_stringification` (`// Covers: RISK-007, 8_RISKS-REQ-162`): Boolean values correctly stringified in template output.
- [ ] Write `test_template_performance` (`// Covers: RISK-007, 8_RISKS-REQ-163`): 1 MiB template with 1,000 expressions resolves under 100ms.
- [ ] Write tests for: single left-to-right pass [8_RISKS-REQ-155], only scalar types [8_RISKS-REQ-156], truncation preserves last bytes [8_RISKS-REQ-157], context uses truncated copy [8_RISKS-REQ-158].

### RISK-008: Docker/SSH E2E Test Complexity
- [ ] Write `test_docker_e2e_executes` (`// Covers: RISK-008, 8_RISKS-REQ-170`): Docker E2E tests in `devs-executor/tests/*_docker_e2e.rs` execute through the executor interface.
- [ ] Write `test_ssh_e2e_executes` (`// Covers: RISK-008, 8_RISKS-REQ-171`): SSH E2E tests in `devs-executor/tests/*_ssh_e2e.rs` execute through the executor interface using localhost SSH.
- [ ] Write `test_docker_ssh_coverage_included` (`// Covers: RISK-008, 8_RISKS-REQ-172`): QG-002 E2E aggregate coverage includes Docker/SSH coverage.
- [ ] Write `test_skip_conditions_documented` (`// Covers: RISK-008, 8_RISKS-REQ-173`): Docker/SSH E2E test skip conditions documented in test comments.
- [ ] Write tests for: docker:dind on Linux CI [8_RISKS-REQ-166], graceful skip on Win/macOS [8_RISKS-REQ-167], localhost SSH server in test setup [8_RISKS-REQ-168], tests exercise executor interface [8_RISKS-REQ-169].

## 2. Task Implementation
- [ ] In `./do`, implement `presubmit_timings.jsonl` incremental writing: each step appends a JSON line with `step_name`, `duration_ms`, `budget_ms`, `over_budget`. Implement 900-second hard timeout via background timer process. Implement timer cleanup on normal exit. Over-budget steps emit WARN but don't fail.
- [ ] In `./do coverage`, implement 5-gate report generation: QG-001 (≥90% unit), QG-002 (≥80% E2E aggregate), QG-003 (≥50% CLI E2E), QG-004 (≥50% TUI E2E), QG-005 (≥50% MCP E2E). Write `target/coverage/report.json` with gate entries including `delta_pct` and `uncovered_lines`.
- [ ] In `devs-core`, ensure `TemplateResolver::resolve()` uses single left-to-right pass, only permits scalar JSON types, truncates at 10,240 bytes (preserving last bytes), and handles boolean stringification.
- [ ] In `devs-executor/tests/`, create Docker E2E tests using `docker:dind` CI service and SSH E2E tests using localhost SSH server. Both must exercise the `Executor` trait interface, not internal functions. Add `#[cfg_attr(not(target_os = "linux"), ignore)]` for Docker tests.

## 3. Code Review
- [ ] Verify `TemplateResolver` truly performs a single pass with no recursive expansion.
- [ ] Verify `./do coverage` correctly separates unit vs E2E coverage measurements.
- [ ] Verify Docker/SSH E2E tests go through the `Executor` trait, not internal library functions.
- [ ] Verify presubmit timing uses wall-clock elapsed time, not CPU time.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- risk_005 risk_006 risk_007 risk_008` and verify all pass.
- [ ] Run `./do coverage` and verify `target/coverage/report.json` has 5 gate entries.
- [ ] Run `./do presubmit` and verify `target/presubmit_timings.jsonl` is generated.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations to all new tests.

## 6. Automated Verification
- [ ] Run `./do presubmit` end-to-end. Verify `target/traceability.json` shows zero `missing_covering_test` for RISK-005 through RISK-008.
