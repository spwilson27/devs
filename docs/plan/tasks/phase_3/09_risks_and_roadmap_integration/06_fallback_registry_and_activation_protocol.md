# Task: Fallback Registry System & Activation Protocol (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [8_RISKS-REQ-321], [8_RISKS-REQ-322], [8_RISKS-REQ-323], [8_RISKS-REQ-324], [8_RISKS-REQ-325], [8_RISKS-REQ-326], [8_RISKS-REQ-327], [8_RISKS-REQ-328], [8_RISKS-REQ-329], [8_RISKS-REQ-330], [8_RISKS-REQ-331], [8_RISKS-REQ-332], [8_RISKS-REQ-333], [8_RISKS-REQ-334], [8_RISKS-REQ-335], [8_RISKS-REQ-336], [8_RISKS-REQ-337], [8_RISKS-REQ-338], [8_RISKS-REQ-339], [8_RISKS-REQ-340], [8_RISKS-REQ-341], [8_RISKS-REQ-342], [8_RISKS-REQ-343], [8_RISKS-REQ-344], [8_RISKS-REQ-345], [8_RISKS-REQ-346], [8_RISKS-REQ-347], [8_RISKS-REQ-348], [8_RISKS-REQ-349], [8_RISKS-REQ-350], [8_RISKS-REQ-351], [8_RISKS-REQ-352], [8_RISKS-REQ-353], [8_RISKS-REQ-354], [8_RISKS-REQ-355], [8_RISKS-REQ-356], [8_RISKS-REQ-357], [8_RISKS-REQ-358], [8_RISKS-REQ-359], [8_RISKS-REQ-360], [8_RISKS-REQ-361], [8_RISKS-REQ-362], [8_RISKS-REQ-363], [8_RISKS-REQ-364], [8_RISKS-REQ-365], [8_RISKS-REQ-366], [8_RISKS-REQ-367]

## Dependencies
- depends_on: ["01_risk_matrix_schema_and_validation_infrastructure.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer), Redacted<T> Security Wrapper (consumer)]

## 1. Initial Test Written

### Fallback Registry Data Model Validation
- [ ] Write `test_active_count_matches_entries` (`// Covers: 8_RISKS-REQ-321, 8_RISKS-REQ-348`): `./do presubmit` exits non-zero when `fallback-registry.json` `active_count` does not equal count of `status == "Active"` entries.
- [ ] Write `test_adr_path_exists` (`// Covers: 8_RISKS-REQ-322, 8_RISKS-REQ-349`): `./do presubmit` exits non-zero when any non-Retired entry's `adr_path` references a file that doesn't exist.
- [ ] Write `test_no_duplicate_active_fallback` (`// Covers: 8_RISKS-REQ-323`): A `fallback_id` must not appear more than once with non-Retired status.
- [ ] Write `test_stale_commit_sha_lint_warning` (`// Covers: 8_RISKS-REQ-324, 8_RISKS-REQ-360`): Entry with `status == "Active"`, empty `commit_sha`, and `activated_at > 24h ago` emits lint warning.

### Fallback State Machine
- [ ] Write `test_sm_only_implementing_to_active` (`// Covers: 8_RISKS-REQ-325`): Only valid transition into Active is from Implementing. Direct Active without implementation commit fails.
- [ ] Write `test_sm_extended_to_prd_amendment` (`// Covers: 8_RISKS-REQ-326`): Transition from Extended to PRD_Amendment requires amendment document.
- [ ] Write `test_sm_retired_is_terminal` (`// Covers: 8_RISKS-REQ-327`): Retired fallback_id must not be reused; new activation creates new ADR.
- [ ] Write `test_sm_blocked_at_max_3` (`// Covers: 8_RISKS-REQ-328, 8_RISKS-REQ-351`): When `active_count == 3`, new Triggered enters Blocked. `./do presubmit` exits non-zero when `active_count > 3`.
- [ ] Write `test_sm_emergency_rollback` (`// Covers: 8_RISKS-REQ-329`): Emergency rollback from Active to Inactive (Retired) permitted with documentation.

### Fallback Activation Protocol
- [ ] Write `test_far_and_impl_separate_commits` (`// Covers: 8_RISKS-REQ-330`): `./do lint` rejects combined commit with FAR and implementation code.
- [ ] Write `test_cancelled_activation_cleanup` (`// Covers: 8_RISKS-REQ-331`): If trigger resolves before FAR commit, partial FAR deleted, registry not updated.
- [ ] Write `test_commit_sha_24h_staleness` (`// Covers: 8_RISKS-REQ-332`): `commit_sha` must be updated within 24h of implementation commit.

### Fallback Retirement
- [ ] Write `test_prd_amendment_retirement` (`// Covers: 8_RISKS-REQ-333`): Fallback requiring PRD amendment must have amendment updated before retirement.
- [ ] Write `test_retirement_one_sprint_revert` (`// Covers: 8_RISKS-REQ-334`): Retirement not completed within one sprint reverts to Active.
- [ ] Write `test_retired_far_not_deleted` (`// Covers: 8_RISKS-REQ-335, 8_RISKS-REQ-344`): Retired FAR files are permanent. `./do lint` verifies Retired entries have readable `adr_path`.

### Fallback Business Rules
- [ ] Write `test_far_before_implementation` (`// Covers: 8_RISKS-REQ-336`): FAR commit must precede implementation commit.
- [ ] Write `test_preapproved_fallback_no_approval` (`// Covers: 8_RISKS-REQ-337`): Pre-approved fallbacks don't require approval but still need FAR.
- [ ] Write `test_prd_amendment_required_blocking` (`// Covers: 8_RISKS-REQ-338`): Fallbacks requiring PRD amendment or arch review must not activate until approved.
- [ ] Write `test_max_3_active_fallbacks` (`// Covers: 8_RISKS-REQ-339`): `./do presubmit` exits non-zero if `active_count > 3`.
- [ ] Write `test_warn_per_active_fallback` (`// Covers: 8_RISKS-REQ-340, 8_RISKS-REQ-350`): `./do presubmit` emits exactly one `WARN: Fallback FB-NNN is ACTIVE` per active entry. Zero WARNs when `active_count == 0`.
- [ ] Write `test_extended_to_prd_amendment_escalation` (`// Covers: 8_RISKS-REQ-341`): Active fallback past retirement sprint enters Extended; two sprints triggers PRD_Amendment.
- [ ] Write `test_registry_far_consistency` (`// Covers: 8_RISKS-REQ-342`): Inconsistency between registry and FAR frontmatter is fatal lint error.
- [ ] Write `test_quality_gate_restoration` (`// Covers: 8_RISKS-REQ-343`): Retiring a fallback that lowered a quality gate restores original threshold in same commit.
- [ ] Write `test_fallback_scope_minimality` (`// Covers: 8_RISKS-REQ-345`): Fallback must not introduce new crate dependencies or public API without PRD amendment.
- [ ] Write `test_far_trigger_numeric_metric` (`// Covers: 8_RISKS-REQ-346`): `## Trigger` section in FAR must reference at least one numeric metric value.
- [ ] Write `test_platform_conditional_cfg_guard` (`// Covers: 8_RISKS-REQ-347, 8_RISKS-REQ-362`): Platform-conditional fallbacks use `#[cfg(windows)]` compile-time guards. Code compiles without fallback path on Linux.

### Fallback-Specific Acceptance Criteria
- [ ] Write `test_fb002_pty_available_pool_state` (`// Covers: 8_RISKS-REQ-352`): `get_pool_state` shows `pty_available: false` on Windows PTY fallback.
- [ ] Write `test_fb002_pty_stage_fails` (`// Covers: 8_RISKS-REQ-353`): Stage with `pty=true` fails with `pty_unavailable` on Windows fallback. No retry.
- [ ] Write `test_fb003_coverage_threshold_lowered` (`// Covers: 8_RISKS-REQ-354`): QG-002 entry shows `threshold_pct: 77.0` with `exception: "FB-003"` when FB-003 active. Shows 80.0 when retired.
- [ ] Write `test_fb008_windows_sec_warn` (`// Covers: 8_RISKS-REQ-355`): `devs security-check` on Windows emits SEC-FILE-PERM-WINDOWS with `status: "warn"`.
- [ ] Write `test_fb009_mcp_auth_required` (`// Covers: 8_RISKS-REQ-356`): MCP call without `Authorization` header returns 401 when `mcp_require_token` set.
- [ ] Write `test_fb009_mcp_auth_success` (`// Covers: 8_RISKS-REQ-357`): MCP call with correct bearer token returns 200.
- [ ] Write `test_fb009_token_not_logged` (`// Covers: 8_RISKS-REQ-358`): `mcp_require_token` value never appears in log output. All occurrences show `[REDACTED]`.
- [ ] Write `test_fallback_regen` (`// Covers: 8_RISKS-REQ-359`): `./do fallback-regen` produces valid `fallback-registry.json` from FAR frontmatter.
- [ ] Write `test_retired_fallback_no_warn` (`// Covers: 8_RISKS-REQ-361`): After retiring, `active_count` decremented and no WARN for retired fallback.

### Cross-Cutting Risk Business Rules
- [ ] Write `test_new_risk_blocks_first_merge` (`// Covers: 8_RISKS-REQ-363`): New score≥6 risk blocks sprint's first merge until covering test written.
- [ ] Write `test_risk_status_sprint_review` (`// Covers: 8_RISKS-REQ-364`): Risk statuses reviewed by reading `target/traceability.json`.
- [ ] Write `test_security_checks_integration` (`// Covers: 8_RISKS-REQ-365`): Server startup security checks verified by integration tests confirming WARN log events.
- [ ] Write `test_long_active_fallback_meta_risk` (`// Covers: 8_RISKS-REQ-366`): Fallback active >2 sprints gets its own RISK-NNN entry.
- [ ] Write `test_risk_matrix_current` (`// Covers: 8_RISKS-REQ-367`): `./do lint` catches MIT-NNN tags without matching RISK-NNN entries.

## 2. Task Implementation
- [ ] Create `fallback-registry.json` schema and a validator module. Fields: `schema_version`, `active_count`, `fallbacks[]` with `fallback_id`, `risk_id`, `status`, `adr_path`, `activated_at`, `commit_sha`, `expected_retirement_sprint`.
- [ ] Implement `./do presubmit` fallback registry checks: FB-DATA-001 (active_count consistency), FB-DATA-002 (adr_path existence), FB-DATA-003 (no duplicate non-Retired), FB-DATA-004 (commit_sha staleness). Emit WARN per active fallback. Exit non-zero if `active_count > 3`.
- [ ] Implement `./do lint` checks: FAR and implementation in separate commits (scan diff for co-located `docs/adr/NNNN-fallback-*.md` and implementation files), FAR Trigger section contains numeric metric, retired FARs exist on disk, MIT-NNN without RISK-NNN pairing.
- [ ] Implement `./do fallback-regen` subcommand that reconstructs `fallback-registry.json` from FAR frontmatter in `docs/adr/`.
- [ ] Implement fallback state machine transitions in the validator: Inactive→Triggered→Implementing→Active→Retiring→Retired, with Extended and PRD_Amendment escalation paths, Blocked state when active_count≥3, emergency rollback.
- [ ] Implement MCP bearer token authentication (`mcp_require_token` in `ServerConfig`). Return 401 without token, 200 with correct token. Use `Redacted<T>` wrapper to ensure token never logged.

## 3. Code Review
- [ ] Verify fallback registry validator checks all 4 FB-DATA invariants.
- [ ] Verify state machine transitions match the documented diagram exactly.
- [ ] Verify `Redacted<T>` is used for `mcp_require_token` and no log level leaks the raw value.
- [ ] Verify `./do lint` correctly detects co-located FAR + implementation in same commit.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- fallback` and verify all tests pass.
- [ ] Run `./do presubmit` with a test `fallback-registry.json` and verify WARN output and exit behavior.
- [ ] Run `./do lint` and verify FAR/implementation separation check works.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations to all new tests.

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify all fallback registry checks pass. Verify `target/traceability.json` covers all 8_RISKS-REQ-321 through 367.
