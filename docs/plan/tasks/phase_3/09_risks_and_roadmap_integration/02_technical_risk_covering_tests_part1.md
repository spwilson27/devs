# Task: Technical Risk Covering Tests — DAG, PTY, Checkpoint, Adapters (Sub-Epic: 09_Risks and Roadmap Integration)

## Covered Requirements
- [8_RISKS-REQ-091], [8_RISKS-REQ-092], [8_RISKS-REQ-093], [8_RISKS-REQ-094], [8_RISKS-REQ-095], [8_RISKS-REQ-096], [8_RISKS-REQ-097], [8_RISKS-REQ-098], [8_RISKS-REQ-099], [8_RISKS-REQ-100], [8_RISKS-REQ-101], [8_RISKS-REQ-102], [8_RISKS-REQ-103], [8_RISKS-REQ-104], [8_RISKS-REQ-105], [8_RISKS-REQ-106], [8_RISKS-REQ-107], [8_RISKS-REQ-108], [8_RISKS-REQ-109], [8_RISKS-REQ-110], [8_RISKS-REQ-111], [8_RISKS-REQ-112], [8_RISKS-REQ-113], [8_RISKS-REQ-114], [8_RISKS-REQ-115], [8_RISKS-REQ-116], [8_RISKS-REQ-117], [8_RISKS-REQ-118], [8_RISKS-REQ-119], [8_RISKS-REQ-120], [8_RISKS-REQ-121], [8_RISKS-REQ-122], [8_RISKS-REQ-123], [8_RISKS-REQ-124], [8_RISKS-REQ-125], [8_RISKS-REQ-126], [8_RISKS-REQ-127], [8_RISKS-REQ-128], [8_RISKS-REQ-129], [8_RISKS-REQ-130], [8_RISKS-REQ-131], [8_RISKS-REQ-132]

## Dependencies
- depends_on: [01_risk_matrix_schema_and_validation_infrastructure.md]
- shared_components: [devs-scheduler (consumer), devs-adapters (consumer), devs-checkpoint (consumer), devs-pool (consumer), devs-core (consumer)]

## 1. Initial Test Written

### RISK-001: DAG Scheduler Race Conditions
- [ ] Write `test_concurrent_stage_completion_serialization` (annotated `// Covers: RISK-001, 8_RISKS-REQ-097`): Use `tokio::join!` to fire 100 concurrent `stage_complete_tx` events for the same run. Assert exactly one `Completed` transition is recorded in checkpoint state. Requires `devs-scheduler` run state with `Arc<tokio::sync::Mutex<RunState>>`.
- [ ] Write `test_duplicate_terminal_event_idempotent` (`// Covers: RISK-001, 8_RISKS-REQ-098`): Call `StateMachine::transition()` with a duplicate terminal event. Assert it returns `Err(TransitionError::IllegalTransition)` within 1ms without modifying state.
- [ ] Write `test_fanout_64_produces_exact_subruns` (`// Covers: RISK-001, 8_RISKS-REQ-099`): Fan-out stage with `count=64` produces exactly 64 sub-`StageRun` records and exactly 1 parent `StageRun` transition.
- [ ] Write `test_scheduler_no_data_races` (`// Covers: RISK-001, 8_RISKS-REQ-100`): Run `cargo test --workspace -- scheduler` with `--test-threads 8`. Assert no data races.
- [ ] Write `test_failed_dependency_cascades_cancellation` (`// Covers: RISK-001, 8_RISKS-REQ-101`): A `Failed` dependency causes all downstream `Waiting` stages to transition to `Cancelled` in the same atomic checkpoint write.
- [ ] Write `test_lock_acquisition_order_lint` (`// Covers: RISK-001, 8_RISKS-REQ-102`): Verify `./do lint` detects lock acquisition order violations (acquiring `PoolState` before `SchedulerState`).
- [ ] Write tests for business rules: per-run Mutex serialization [8_RISKS-REQ-092]-[8_RISKS-REQ-093], idempotent transitions [8_RISKS-REQ-094], DAG eligibility within mutex [8_RISKS-REQ-095], only Completed dependencies satisfy depends_on [8_RISKS-REQ-096].

### RISK-002: PTY Mode Incompatibility on Windows
- [ ] Write `test_pty_probe_startup_fallback` (`// Covers: RISK-002, 8_RISKS-REQ-109`): On a system where PTY allocation fails, assert server starts, logs `WARN` with `event_type: "adapter.pty_fallback"`, and dispatches stages without PTY.
- [ ] Write `test_get_pool_state_pty_active_field` (`// Covers: RISK-002, 8_RISKS-REQ-110`): Assert `get_pool_state` MCP response includes `"pty_active": false` for agents in PTY-fallback mode.
- [ ] Write `test_explicit_pty_true_unavailable_fails` (`// Covers: RISK-002, 8_RISKS-REQ-112`): Stage with explicit `pty=true` on PTY-unavailable system transitions to `Failed` with `failure_reason: "pty_unavailable"`, no retry.
- [ ] Write tests for business rules: probe once at startup via `spawn_blocking` [8_RISKS-REQ-105], structured WARN per dispatch [8_RISKS-REQ-106], pty_active reflects runtime capability [8_RISKS-REQ-107], explicit pty=true failure is terminal [8_RISKS-REQ-108].

### RISK-003: Git Checkpoint Store Corruption
- [ ] Write `test_disk_full_checkpoint_continues` (`// Covers: RISK-003, 8_RISKS-REQ-119`): Mock `CheckpointStore` returning `Err(io::ErrorKind::StorageFull)`. Assert server logs `ERROR` with `event_type: "checkpoint.write_failed"` and continues.
- [ ] Write `test_invalid_json_checkpoint_unrecoverable` (`// Covers: RISK-003, 8_RISKS-REQ-120`): Invalid JSON in `checkpoint.json` detected by `validate_checkpoint`, run marked `Unrecoverable`, server starts processing other runs.
- [ ] Write `test_orphaned_tmp_cleanup` (`// Covers: RISK-003, 8_RISKS-REQ-121`): Orphaned `checkpoint.json.tmp` deleted with `WARN` during `load_all_runs`.
- [ ] Write `test_mid_write_crash_recovery` (`// Covers: RISK-003, 8_RISKS-REQ-122`): Simulated mid-write crash produces at most one `Unrecoverable` run.
- [ ] Write tests for atomic write sequence [8_RISKS-REQ-115], orphan cleanup [8_RISKS-REQ-116], disk-full handling [8_RISKS-REQ-117], git2 push non-fatal [8_RISKS-REQ-118].

### RISK-004: Agent Adapter CLI Interface Breakage
- [ ] Write `test_adapter_compatibility` (`// Covers: RISK-004, 8_RISKS-REQ-129`): Each adapter's compatibility test passes with captured version.
- [ ] Write `test_missing_binary_fails_no_retry` (`// Covers: RISK-004, 8_RISKS-REQ-130`): Missing CLI binary transitions stage to `Failed` without retry.
- [ ] Write `test_rate_limit_pattern_coverage` (`// Covers: RISK-004, 8_RISKS-REQ-131`): Rate-limit pattern tests cover all known patterns from the compatibility table.
- [ ] Write `test_adapter_versions_json_lint` (`// Covers: RISK-004, 8_RISKS-REQ-132`): `./do lint` fails if `target/adapter-versions.json` is absent or stale.
- [ ] Write tests for: detect_rate_limit returns false on exit_code==0 [8_RISKS-REQ-125], CLI flags as const [8_RISKS-REQ-126], versions.json regeneration [8_RISKS-REQ-127], case-insensitive pattern matching [8_RISKS-REQ-128].

## 2. Task Implementation
- [ ] In `devs-scheduler`, ensure `Arc<tokio::sync::Mutex<RunState>>` per-run serialization is used for all state transitions. Implement idempotent `transition()` returning `IllegalTransition` for duplicate terminal events. Implement DAG eligibility evaluation within the same mutex acquisition. Implement cascading cancellation on dependency failure.
- [ ] In `devs-adapters`, implement `PTY_AVAILABLE: AtomicBool` global, PTY probe at startup via `spawn_blocking`, structured WARN logging with `event_type: "adapter.pty_fallback"`, and terminal failure for explicit `pty=true` when unavailable.
- [ ] In `devs-checkpoint`, implement atomic write protocol: serialize → write `.tmp` → `fsync` → `rename()`. Implement `validate_checkpoint()` with depth-limited deserialization. Implement orphan `.tmp` cleanup in `load_all_runs`. Handle `StorageFull` errors gracefully.
- [ ] In `devs-adapters`, implement adapter version compatibility checking, rate-limit pattern matching (case-insensitive substring), and `detect_rate_limit()` returning false when exit_code==0. Ensure CLI flags are `const` in each adapter's `config.rs`.
- [ ] In `./do lint`, add lock acquisition order scanning and `adapter-versions.json` staleness check.

## 3. Code Review
- [ ] Verify per-run Mutex is used consistently for all state transitions (no state changes outside the lock).
- [ ] Verify PTY probe runs exactly once at startup, not per-dispatch.
- [ ] Verify atomic write protocol ordering: serialize → write → fsync → rename, with no reordering.
- [ ] Verify rate-limit detection returns false on exit_code==0 unconditionally.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- risk_001 risk_002 risk_003 risk_004` and verify all tests pass.
- [ ] Run `cargo test --workspace -- scheduler --test-threads 8` for RISK-001 data race verification.
- [ ] Run `./do lint` and verify adapter-versions.json check passes.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations to all new tests referencing both RISK-NNN and 8_RISKS-REQ-NNN IDs.

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify all risk covering tests pass. Verify `target/traceability.json` shows zero `missing_covering_test` violations for RISK-001 through RISK-004.
