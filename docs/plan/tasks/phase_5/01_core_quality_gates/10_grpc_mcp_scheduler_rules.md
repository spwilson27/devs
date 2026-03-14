# Task: gRPC/MCP/Scheduler Implementation Rules (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [PERF-GRP-001], [PERF-GRP-002], [PERF-GRP-003], [PERF-GRP-004], [PERF-GRP-005], [PERF-GRP-006], [PERF-GRP-007], [PERF-GRP-008], [PERF-GRP-009], [PERF-GRP-010], [PERF-GRP-011], [PERF-GRP-012], [PERF-GRP-013], [PERF-GRP-014], [PERF-GRP-015], [PERF-GRP-016], [PERF-GRP-017], [PERF-GRP-018], [PERF-GRP-019], [PERF-GRP-020], [PERF-GRP-021], [PERF-GRP-022], [PERF-GRP-023]

## Dependencies
- depends_on: ["06_perf_core_infrastructure.md", "07_slo_constants_and_integration_tests.md"]
- shared_components: [devs-grpc, devs-mcp, devs-scheduler, devs-core, devs-checkpoint, devs-cli]

## 1. Initial Test Written
- [ ] Create `crates/devs-grpc/tests/grp_rules.rs` with tests that:
  1. Assert `GetRun`/`ListRuns` release `RwLock` before serialization ([PERF-GRP-001]).
  2. Assert `WatchPoolState` releases lock before long-poll loop ([PERF-GRP-002]).
  3. Assert `ListRuns` with `limit=0` returns `invalid_argument` within SLO ([PERF-GRP-003]).
  4. Assert `SubmitRun` completes all 7 validation steps before write lock ([PERF-GRP-004]).
  5. Assert `CancelRun` cascades via `tokio::sync::oneshot` sends, O(1) each ([PERF-GRP-005]).
  6. Assert checkpoint write failure triggers in-memory state rollback ([PERF-GRP-006]).
  7. Assert `StreamRunEvents`/`StreamLogs` register cleanup handlers on drop ([PERF-GRP-007]).
  8. Assert `StreamLogs follow:true` uses `tokio::sync::broadcast`, not polling ([PERF-GRP-008]).
  9. Assert `StreamRunEvents` first-event SLO measured from handler entry to first write ([PERF-GRP-009]).
  10. Annotate all with `// Covers:`.
- [ ] Create `crates/devs-mcp/tests/grp_mcp_rules.rs` with tests that:
  1. Assert MCP read tools acquire only read locks ([PERF-GRP-010]).
  2. Assert MCP write tools use `tokio::time::timeout(5s)` for lock acquisition ([PERF-GRP-011]).
  3. Assert `write_workflow_definition` runs 13 validation steps, 1–10 before write lock ([PERF-GRP-012]).
  4. Assert `get_stage_output` truncates to 1 MiB per stream before JSON serialization ([PERF-GRP-013]).
- [ ] Create `crates/devs-scheduler/tests/grp_scheduler_rules.rs` with tests that:
  1. Assert DAG dispatch uses `tokio::task::spawn` (not `spawn_blocking`) ([PERF-GRP-014]).
  2. Assert checkpoint writes use `tokio::task::spawn_blocking` for `fsync` ([PERF-GRP-015]).
  3. Assert retention sweep runs via `tokio::time::interval(86400s)` background task ([PERF-GRP-017]).
- [ ] Create `crates/devs-cli/tests/grp_cli_rules.rs` with tests that:
  1. Assert CLI reads gRPC address from discovery file at each invocation, never cached ([PERF-GRP-019]).
  2. Assert gRPC dial uses `Channel::connect()` with 2000 ms timeout ([PERF-GRP-020]).
  3. Assert CLI p99 targets include gRPC dial time ([PERF-GRP-021]).
  4. Assert `devs submit` does not block waiting for run completion ([PERF-GRP-022]).
  5. Assert `UNAVAILABLE` gRPC status causes CLI exit code 2 ([PERF-GRP-023]).
- [ ] Run tests to confirm red:
  ```
  cargo test --workspace --test grp_rules --test grp_mcp_rules --test grp_scheduler_rules --test grp_cli_rules -- --nocapture 2>&1 | tee /tmp/grp_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Implement lock-release-before-serialization** in `GetRun` and `ListRuns` handlers ([PERF-GRP-001]).
- [ ] **Implement `WatchPoolState`** lock release before long-poll ([PERF-GRP-002]).
- [ ] **Implement `ListRuns` `limit=0` validation** returning `invalid_argument` ([PERF-GRP-003]).
- [ ] **Implement `SubmitRun` validation ordering** — all 7 steps before write lock ([PERF-GRP-004]).
- [ ] **Implement `CancelRun` fan-out** via oneshot channels ([PERF-GRP-005]).
- [ ] **Implement checkpoint failure rollback** ([PERF-GRP-006]).
- [ ] **Implement stream cleanup handlers** ([PERF-GRP-007]).
- [ ] **Implement broadcast-based `StreamLogs`** ([PERF-GRP-008]).
- [ ] **Implement MCP read lock enforcement** ([PERF-GRP-010]).
- [ ] **Implement MCP write lock timeout** ([PERF-GRP-011]).
- [ ] **Implement `write_workflow_definition` validation ordering** ([PERF-GRP-012]).
- [ ] **Implement `get_stage_output` 1 MiB truncation** ([PERF-GRP-013]).
- [ ] **Verify DAG dispatch uses `tokio::task::spawn`** ([PERF-GRP-014]).
- [ ] **Verify checkpoint uses `spawn_blocking`** ([PERF-GRP-015]).
- [ ] **Verify TUI render is on dedicated thread** ([PERF-GRP-016]).
- [ ] **Implement retention sweep interval** ([PERF-GRP-017]).
- [ ] **Implement discovery file write as last startup step** ([PERF-GRP-018]).
- [ ] **Implement CLI discovery file read per invocation** ([PERF-GRP-019]).
- [ ] **Implement gRPC dial timeout** ([PERF-GRP-020]).
- [ ] **Implement CLI exit code 2 for UNAVAILABLE** ([PERF-GRP-023]).

## 3. Code Review
- [ ] Verify lock acquisition patterns match documented rules.
- [ ] Verify no polling loops exist where streaming is specified.
- [ ] Verify `// Covers:` annotations present for all listed IDs.
- [ ] Confirm all public symbols have doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run all GRP rule tests:
  ```
  cargo test --workspace --test grp_rules --test grp_mcp_rules --test grp_scheduler_rules --test grp_cli_rules -- --nocapture
  ```

## 5. Update Documentation
- [ ] Document locking patterns and I/O rules in `docs/architecture/testing.md`.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_grp.txt
  ```
