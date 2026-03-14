# Task: Operational Risk Covering Tests — Bootstrap, Rate Limits, Isolation, Cross-Platform, Traceability, Review, CI (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [8_RISKS-REQ-237], [8_RISKS-REQ-238], [8_RISKS-REQ-239], [8_RISKS-REQ-240], [8_RISKS-REQ-241], [8_RISKS-REQ-242], [8_RISKS-REQ-243], [8_RISKS-REQ-244], [8_RISKS-REQ-245], [8_RISKS-REQ-246], [8_RISKS-REQ-247], [8_RISKS-REQ-248], [8_RISKS-REQ-249], [8_RISKS-REQ-250], [8_RISKS-REQ-251], [8_RISKS-REQ-252], [8_RISKS-REQ-253], [8_RISKS-REQ-254], [8_RISKS-REQ-255], [8_RISKS-REQ-256], [8_RISKS-REQ-257], [8_RISKS-REQ-258], [8_RISKS-REQ-259], [8_RISKS-REQ-260], [8_RISKS-REQ-261], [8_RISKS-REQ-262], [8_RISKS-REQ-263], [8_RISKS-REQ-264], [8_RISKS-REQ-265], [8_RISKS-REQ-266], [8_RISKS-REQ-267], [8_RISKS-REQ-268], [8_RISKS-REQ-269], [8_RISKS-REQ-270], [8_RISKS-REQ-271], [8_RISKS-REQ-272], [8_RISKS-REQ-273], [8_RISKS-REQ-274], [8_RISKS-REQ-275], [8_RISKS-REQ-276], [8_RISKS-REQ-277], [8_RISKS-REQ-278], [8_RISKS-REQ-279], [8_RISKS-REQ-280], [8_RISKS-REQ-281], [8_RISKS-REQ-282], [8_RISKS-REQ-283], [8_RISKS-REQ-284], [8_RISKS-REQ-285], [8_RISKS-REQ-286], [8_RISKS-REQ-287], [8_RISKS-REQ-288], [8_RISKS-REQ-289], [8_RISKS-REQ-290], [8_RISKS-REQ-291], [8_RISKS-REQ-292], [8_RISKS-REQ-293], [8_RISKS-REQ-294], [8_RISKS-REQ-295], [8_RISKS-REQ-296], [8_RISKS-REQ-297], [8_RISKS-REQ-298], [8_RISKS-REQ-299], [8_RISKS-REQ-300], [8_RISKS-REQ-301], [8_RISKS-REQ-302], [8_RISKS-REQ-303], [8_RISKS-REQ-304], [8_RISKS-REQ-305], [8_RISKS-REQ-306], [8_RISKS-REQ-307], [8_RISKS-REQ-308], [8_RISKS-REQ-309], [8_RISKS-REQ-310], [8_RISKS-REQ-311], [8_RISKS-REQ-312], [8_RISKS-REQ-313], [8_RISKS-REQ-314], [8_RISKS-REQ-315], [8_RISKS-REQ-316], [8_RISKS-REQ-317], [8_RISKS-REQ-318], [8_RISKS-REQ-319], [8_RISKS-REQ-320]

## Dependencies
- depends_on: [01_risk_matrix_schema_and_validation_infrastructure.md]
- shared_components: [devs-server (consumer), devs-pool (consumer), devs-adapters (consumer), ./do Entrypoint Script & CI Pipeline (consumer), Server Discovery Protocol (consumer), Traceability & Coverage Infrastructure (consumer)]

## 1. Initial Test Written

### RISK-009: Bootstrapping Deadlock
- [ ] Write `test_server_starts_dispatches_trivial_run` (`// Covers: RISK-009, 8_RISKS-REQ-243`): Phase 0 milestone — server starts and dispatches a trivial workflow run.
- [ ] Write `test_manual_workflow_submission` (`// Covers: RISK-009, 8_RISKS-REQ-246`): Manual workflow submission works before agent automation is available.
- [ ] Write `test_server_starts_without_prior_presubmit` (`// Covers: RISK-009, 8_RISKS-REQ-250`): Server starts without requiring prior successful presubmit run.
- [ ] Write `test_e2e_isolation_between_phases` (`// Covers: RISK-009, 8_RISKS-REQ-251`): E2E test isolation prevents shared state between bootstrap phases.
- [ ] Write `test_phase0_components_testable_independently` (`// Covers: RISK-009, 8_RISKS-REQ-252`): All Phase 0 components testable without Phase 1 automation.
- [ ] Write tests for remaining ACs: self-hosting presubmit [8_RISKS-REQ-244], bootstrap ADR [8_RISKS-REQ-245], pre-bootstrap CI gate [8_RISKS-REQ-247], deployment runbook [8_RISKS-REQ-248], FB-007 documentation [8_RISKS-REQ-249].
- [ ] Write tests for BRs: Phase 0 milestone [8_RISKS-REQ-239], Phase 1 milestone [8_RISKS-REQ-240], deployment path [8_RISKS-REQ-241], manual runs accepted [8_RISKS-REQ-242].

### RISK-010: AI Agent Rate Limits
- [ ] Write `test_rate_limit_stderr_triggers_cooldown` (`// Covers: RISK-010, 8_RISKS-REQ-259`): Rate-limit stderr pattern triggers 60s pool cooldown.
- [ ] Write `test_manual_rate_limit_report` (`// Covers: RISK-010, 8_RISKS-REQ-260`): Manual `report_rate_limit` MCP call triggers cooldown.
- [ ] Write `test_fallback_agent_selected` (`// Covers: RISK-010, 8_RISKS-REQ-261`): Fallback agent selected when primary unavailable.
- [ ] Write `test_cooldown_expires_primary_retried` (`// Covers: RISK-010, 8_RISKS-REQ-262`): Cooldown expires and primary agent retried.
- [ ] Write `test_multiple_rate_limits_no_compound` (`// Covers: RISK-010, 8_RISKS-REQ-263`): Multiple rate-limit detections do not compound cooldown.
- [ ] Write `test_pool_state_shows_cooldown_expiry` (`// Covers: RISK-010, 8_RISKS-REQ-264`): Pool state shows cooldown expiry time.
- [ ] Write tests for: passive stderr detection [8_RISKS-REQ-255], per-pool cooldown 60s [8_RISKS-REQ-256], manual MCP trigger [8_RISKS-REQ-257], fallback selection [8_RISKS-REQ-258].

### RISK-011: E2E Test Isolation
- [ ] Write `test_concurrent_e2e_separate_discovery` (`// Covers: RISK-011, 8_RISKS-REQ-271`): Two concurrent E2E tests use separate discovery files.
- [ ] Write `test_port_allocation_concurrent` (`// Covers: RISK-011, 8_RISKS-REQ-272`): Port allocation succeeds for concurrent test servers.
- [ ] Write `test_no_port_collision` (`// Covers: RISK-011, 8_RISKS-REQ-273`): No port collision across parallel E2E tests.
- [ ] Write `test_temp_file_cleanup` (`// Covers: RISK-011, 8_RISKS-REQ-274`): Temporary files cleaned up after test completion.
- [ ] Write tests for: unique discovery file per test [8_RISKS-REQ-267], OS port allocation [8_RISKS-REQ-268], test run ID in path [8_RISKS-REQ-269], cleanup on completion [8_RISKS-REQ-270].

### RISK-012: Cross-Platform Divergence
- [ ] Write `test_env_key_validation_consistent` (`// Covers: RISK-012, 8_RISKS-REQ-281`): ENV key validation consistent across platforms.
- [ ] Write `test_file_paths_normalized` (`// Covers: RISK-012, 8_RISKS-REQ-282`): File paths normalized on Windows and POSIX.
- [ ] Write `test_shell_command_behavior_consistent` (`// Covers: RISK-012, 8_RISKS-REQ-283`): Shell command behavior identical across platforms.
- [ ] Write `test_all_ci_platforms_pass` (`// Covers: RISK-012, 8_RISKS-REQ-284`): presubmit-linux, presubmit-macos, presubmit-windows pass with same tests.
- [ ] Write tests for: prohibited ENV keys [8_RISKS-REQ-277], PathBuf normalization [8_RISKS-REQ-278], platform-specific escaping [8_RISKS-REQ-279], POSIX shell only [8_RISKS-REQ-280], env var behavior [8_RISKS-REQ-285], documentation [8_RISKS-REQ-286].

### RISK-013: Traceability Maintenance Burden
- [ ] Write `test_traceability_json_generated` (`// Covers: RISK-013, 8_RISKS-REQ-293`): `./do test` generates `target/traceability.json`.
- [ ] Write `test_stale_annotation_exits_nonzero` (`// Covers: RISK-013, 8_RISKS-REQ-294`): Stale annotation causes `./do test` to exit non-zero.
- [ ] Write `test_traceability_lists_requirements` (`// Covers: RISK-013, 8_RISKS-REQ-295`): Report lists requirements and covering tests.
- [ ] Write `test_coverage_summary_shows_uncovered` (`// Covers: RISK-013, 8_RISKS-REQ-296`): Coverage summary shows uncovered requirements.
- [ ] Write tests for: `// Covers:` annotation convention [8_RISKS-REQ-289], stale detection [8_RISKS-REQ-290], target must be documented [8_RISKS-REQ-291], automatic generation [8_RISKS-REQ-292], burden reduction [8_RISKS-REQ-297].

### RISK-016: Single Developer No Review
- [ ] Write `test_presubmit_checks_critical_properties` (`// Covers: RISK-016, 8_RISKS-REQ-304`): Presubmit CI checks all critical properties.
- [ ] Write `test_mcp_self_review_capability` (`// Covers: RISK-016, 8_RISKS-REQ-305`): MCP self-review can review a proposed change.
- [ ] Write `test_arch_lint_catches_violations` (`// Covers: RISK-016, 8_RISKS-REQ-306`): Architectural lint catches design violations.
- [ ] Write `test_traceability_catches_missing_coverage` (`// Covers: RISK-016, 8_RISKS-REQ-307`): Traceability enforcement catches missing spec coverage.
- [ ] Write tests for: all commits pass presubmit [8_RISKS-REQ-300], MCP review [8_RISKS-REQ-301], arch lint [8_RISKS-REQ-302], change traceability [8_RISKS-REQ-303], ADR docs [8_RISKS-REQ-308], spec references [8_RISKS-REQ-309].

### RISK-024: GitLab CI Unavailability
- [ ] Write `test_ci_exits_nonzero_on_job_failure` (`// Covers: RISK-024, 8_RISKS-REQ-316`): `./do ci` exits non-zero if any of the three CI jobs fail.
- [ ] Write `test_presubmit_matches_ci` (`// Covers: RISK-024, 8_RISKS-REQ-317`): `./do presubmit` produces same result as CI job for same source tree.
- [ ] Write `test_yamllint_valid` (`// Covers: RISK-024, 8_RISKS-REQ-318`): `yamllint .gitlab-ci.yml` passes and contains all three job names.
- [ ] Write `test_ci_artifacts_preserved` (`// Covers: RISK-024, 8_RISKS-REQ-319`): CI artifacts present for both passing and failing runs.
- [ ] Write `test_ci_temp_branch_cleanup` (`// Covers: RISK-024, 8_RISKS-REQ-320`): `./do ci` deletes temp branch even on timeout/failure.
- [ ] Write tests for: all three jobs required [8_RISKS-REQ-312], 30-minute CI timeout [8_RISKS-REQ-313], yamllint validation [8_RISKS-REQ-314], artifact preservation [8_RISKS-REQ-315].

## 2. Task Implementation
- [ ] Implement bootstrapping milestone checks in test infrastructure: verify server can start and dispatch a trivial run without prior presubmit. Ensure `DEVS_DISCOVERY_FILE` isolation per test.
- [ ] In `devs-pool`, implement per-pool 60s cooldown on rate-limit detection. Implement passive stderr pattern matching and manual `report_rate_limit` MCP endpoint. Implement fallback agent selection when primary is rate-limited.
- [ ] In E2E test infrastructure, ensure each test creates a unique discovery file in a temp directory with test run ID in the path. Use OS-assigned ports (bind to 0). Implement cleanup of temp files after test completion.
- [ ] Implement cross-platform consistency: ENV key validation prohibiting platform-specific keys, `PathBuf` normalization, POSIX-only `./do` script semantics.
- [ ] In traceability tooling, implement stale annotation detection: scan `**/*.rs` for `// Covers:` annotations, validate each target exists in `docs/plan/specs/*.md`.
- [ ] In `./do ci`, implement: exit non-zero if any of 3 jobs fails, 30-minute CI timeout, `yamllint` validation, artifact path configuration, temp branch cleanup on all exits.

## 3. Code Review
- [ ] Verify rate-limit cooldown is per-pool (not per-agent) for exactly 60s.
- [ ] Verify E2E test isolation uses `DEVS_DISCOVERY_FILE` env var consistently.
- [ ] Verify `./do ci` cleanup runs unconditionally (in trap handler or equivalent).
- [ ] Verify traceability scanning uses the documented regex pattern for requirement IDs.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- risk_009 risk_010 risk_011 risk_012 risk_013 risk_016 risk_024`.
- [ ] Run `./do lint` and verify yamllint passes.
- [ ] Run `./do test` and verify traceability.json generated with no stale annotations.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations to all new tests.

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify `target/traceability.json` shows zero violations for all operational risks.
