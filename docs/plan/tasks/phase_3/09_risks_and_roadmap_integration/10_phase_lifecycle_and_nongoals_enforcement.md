# Task: Phase Lifecycle State Machine & Non-Goals Enforcement (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [9_PROJECT_ROADMAP-REQ-448], [9_PROJECT_ROADMAP-REQ-449], [9_PROJECT_ROADMAP-REQ-450], [9_PROJECT_ROADMAP-REQ-451], [9_PROJECT_ROADMAP-REQ-452], [9_PROJECT_ROADMAP-REQ-453], [9_PROJECT_ROADMAP-REQ-454], [9_PROJECT_ROADMAP-REQ-455], [9_PROJECT_ROADMAP-REQ-456], [9_PROJECT_ROADMAP-REQ-457], [9_PROJECT_ROADMAP-REQ-458], [9_PROJECT_ROADMAP-REQ-459], [9_PROJECT_ROADMAP-REQ-460], [9_PROJECT_ROADMAP-REQ-461], [9_PROJECT_ROADMAP-REQ-462], [9_PROJECT_ROADMAP-REQ-463]

## Dependencies
- depends_on: ["07_roadmap_phase_definitions_and_ptc_validation.md", "09_critical_path_and_checkpoint_records.md"]
- shared_components: [Phase Transition Checkpoint (PTC) Model (consumer), ./do Entrypoint Script & CI Pipeline (consumer), devs-config (consumer), devs-server (consumer)]

## 1. Initial Test Written

### Phase Lifecycle State Machine
- [ ] Write `test_locked_to_inprogress_requires_predecessor` (`// Covers: 9_PROJECT_ROADMAP-REQ-448`): Phase must not transition from Locked to InProgress until predecessor phase reaches Passed. Create a test with Phase 2 in Locked state and Phase 1 not yet Passed; assert transition is rejected.
- [ ] Write `test_checkpoint_pending_reverts_on_failure` (`// Covers: 9_PROJECT_ROADMAP-REQ-449`): Phase in CheckpointPending reverts to InProgress if checkpoint check fails. Create a test where a checkpoint validation returns failure; assert phase reverts.
- [ ] Write `test_no_manual_override_to_passed` (`// Covers: 9_PROJECT_ROADMAP-REQ-450`): Phase must not be manually overridden to Passed. Only checkpoint verification is the valid path. Assert that setting status to Passed without checkpoint validation returns an error.
- [ ] Write `test_fallback_active_not_terminal` (`// Covers: 9_PROJECT_ROADMAP-REQ-451`): FallbackActive is not terminal state; phase continues toward Passed with active fallback. Assert that a phase with FallbackActive can still transition to CheckpointPending and then Passed.
- [ ] Write `test_blocked_resolved_by_retiring_fallback` (`// Covers: 9_PROJECT_ROADMAP-REQ-452`): Blocked state resolved only by retiring the blocking fallback. Assert that retiring the fallback transitions Blocked to FallbackActive.

### Risk-to-Phase Mapping
- [ ] Write `test_score_6_risk_requires_covering_test` (`// Covers: 9_PROJECT_ROADMAP-REQ-453`): Risk with score ≥ 6 must have at least one automated test with `// Covers: RISK-NNN` before phase checkpoint passes. Create a mock checkpoint with a score≥6 risk lacking coverage; assert checkpoint validation fails.
- [ ] Write `test_critical_risks_mitigated_before_code` (`// Covers: 9_PROJECT_ROADMAP-REQ-454`): Four critical risks (RISK-002, RISK-004, RISK-005, RISK-009) must be mitigated before code in affected components. Verify `./do lint` or `./do test` checks this precondition.
- [ ] Write `test_new_risk_added_before_work` (`// Covers: 9_PROJECT_ROADMAP-REQ-455`): New risk discovered during development must be added to `8_risks_mitigation.md` before work continues on the affected component.

### Non-Goals Enforcement
- [ ] Write `test_unapproved_dependency_lint_failure` (`// Covers: 9_PROJECT_ROADMAP-REQ-456`): Production dependency not in authoritative version table causes `./do lint` to exit non-zero. Add a mock unapproved dependency and verify lint catches it.
- [ ] Write `test_auth_triggers_config_rejected` (`// Covers: 9_PROJECT_ROADMAP-REQ-457`): `[auth]` and `[triggers]` sections in `devs.toml` cause immediate startup failure before port binding. Write a `devs.toml` with `[auth]` section and verify server exits with clear error.
- [ ] Write `test_mcp_plain_http_only` (`// Covers: 9_PROJECT_ROADMAP-REQ-458`): MCP server uses plain HTTP/1.1 JSON-RPC only. Assert no WebSocket, SSE, or gRPC-Web dependencies or handlers are present.
- [ ] Write `test_no_foreign_binding_crates` (`// Covers: 9_PROJECT_ROADMAP-REQ-459`): No `pyo3`, `napi`, or `uniffi` crates in production dependencies. Verify via `cargo tree --workspace --depth 1` scan.
- [ ] Write `test_unapproved_web_framework_blocked` (`// Covers: 9_PROJECT_ROADMAP-REQ-460`): `axum` added to `devs-server` for health endpoint is blocked by `./do lint` as unapproved dependency.
- [ ] Write `test_multi_error_config_validation` (`// Covers: 9_PROJECT_ROADMAP-REQ-461`): `devs.toml` with both `[auth]` and `[[pool]]` errors collects ALL errors before exit non-zero. Not just the first error.
- [ ] Write `test_direct_http_dependency_blocked` (`// Covers: 9_PROJECT_ROADMAP-REQ-462`): REST endpoint via `hyper` directly detected by `./do lint` as direct production dependency.
- [ ] Write `test_post_mvp_code_blocked` (`// Covers: 9_PROJECT_ROADMAP-REQ-463`): Post-MVP non-goal code merging into main detected and blocked by `./do presubmit`. This could include feature-gated code for GUI, REST, cron triggers, etc.

## 2. Task Implementation
- [ ] Implement `PhaseLifecycleStateMachine` enum and transition logic: `Locked → InProgress → CheckpointPending → Passed`, with `FallbackActive` and `Blocked` side states. Enforce that `Locked → InProgress` requires predecessor at `Passed`. `CheckpointPending → InProgress` on failure. No manual override to `Passed`. `FallbackActive` is non-terminal. `Blocked` resolved by retiring fallback.
- [ ] Implement risk-to-phase enforcement in `./do test` and/or `./do lint`: verify that all score≥6 risks have covering tests before checkpoint passes. Verify critical risks mitigated before affected code.
- [ ] Implement non-goals enforcement in `./do lint`:
  - Scan `Cargo.toml` workspace members for unapproved production dependencies against an authoritative version table.
  - Scan for `pyo3`, `napi`, `uniffi`, `axum`, `hyper` (direct) as blocked dependencies.
  - Scan `devs.toml` parsing for `[auth]` and `[triggers]` sections; emit errors and collect all before exiting.
- [ ] In `devs-config`, implement config validation that rejects `[auth]` and `[triggers]` sections with clear error messages. Use multi-error collection so all issues are reported at once.
- [ ] In `devs-mcp`, ensure the server only uses HTTP/1.1 JSON-RPC. No WebSocket upgrade, no SSE endpoints, no gRPC-Web.

## 3. Code Review
- [ ] Verify phase lifecycle state machine transitions match the documented diagram exactly — no extra transitions allowed.
- [ ] Verify non-goals lint checks the correct set of blocked dependencies.
- [ ] Verify config validation uses multi-error collection (not short-circuiting on first error).
- [ ] Verify MCP server has no WebSocket/SSE/gRPC-Web code paths.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- phase_lifecycle nongoals risk_to_phase`.
- [ ] Run `./do lint` with a clean workspace and verify all non-goals checks pass.
- [ ] Run `./do test` with a fixture containing score≥6 risks and verify checkpoint enforcement.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations to all new tests.

## 6. Automated Verification
- [ ] Run `./do presubmit` end-to-end and verify all phase lifecycle, risk-to-phase mapping, and non-goals enforcement checks pass.
- [ ] Grep all test files for `// Covers: 9_PROJECT_ROADMAP-REQ-` and verify coverage of REQ-448 through REQ-463.
