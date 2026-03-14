# Task: Observability & Structured Logging (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [PERF-082], [PERF-083], [PERF-084], [PERF-085], [PERF-086], [PERF-087], [PERF-088], [PERF-089], [PERF-090], [PERF-091], [PERF-092], [PERF-093], [PERF-094], [PERF-095], [PERF-096], [PERF-097], [PERF-098], [PERF-099]
- [PERF-200], [PERF-201], [PERF-202], [PERF-203], [PERF-204], [PERF-205], [PERF-206], [PERF-207], [PERF-208], [PERF-209], [PERF-210], [PERF-211], [PERF-212], [PERF-213], [PERF-214], [PERF-215], [PERF-216], [PERF-217], [PERF-218], [PERF-219], [PERF-220], [PERF-221]

## Dependencies
- depends_on: ["06_perf_core_infrastructure.md", "09_structural_limits_and_resource_budgets.md"]
- shared_components: [devs-core, devs-scheduler, devs-pool, devs-mcp, devs-webhook]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/tests/structured_logging.rs` with tests that:
  1. Assert `scheduler.dispatch_slow` emits WARN when dispatch > 100 ms ([PERF-082]).
  2. Assert `tui.render_slow` emits WARN when render > 16 ms ([PERF-083]).
  3. Assert `mcp.lock_timeout` emits ERROR when lock wait > 5 s ([PERF-084]).
  4. Assert `webhook.channel_overflow` emits WARN on channel overflow ([PERF-085]).
  5. Assert `pool.exhausted` triggers webhook ([PERF-086]).
  6. Assert `get_pool_state` response includes `utilization_pct` and `server_uptime_ms` ([PERF-087]).
  7. Assert `get_run` `elapsed_ms` is monotonic for Running, frozen for Paused ([PERF-088]).
  8. Assert JSON log envelope format when `DEVS_LOG_FORMAT=json` ([PERF-200]).
  9. Assert log level field is immutable ([PERF-201]).
  10. Assert `DEVS_LOG_FORMAT` unrecognized value behavior ([PERF-202]).
  11. Assert `RUST_LOG` suppression behavior ([PERF-203]).
  12. Assert `SloViolation` events include all required fields ([PERF-095]).
  13. Annotate all with `// Covers:`.
- [ ] Run tests to confirm red:
  ```
  cargo test -p devs-core --test structured_logging -- --nocapture 2>&1 | tee /tmp/logging_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Implement structured log event types** with fixed levels:
  - `scheduler.dispatch_slow` → WARN at > 100 ms ([PERF-082]).
  - `tui.render_slow` → WARN at > 16 ms ([PERF-083]).
  - `mcp.lock_timeout` → ERROR at > 5 s ([PERF-084]).
  - `webhook.channel_overflow` → WARN ([PERF-085]).
  - `resource.truncated` → WARN for `BoundedBytes` truncation.
- [ ] **Implement JSON log envelope** format for `DEVS_LOG_FORMAT=json` ([PERF-200]):
  - Immutable level field ([PERF-201]).
  - Proper behavior for unrecognized `DEVS_LOG_FORMAT` values ([PERF-202]).
  - `RUST_LOG` interaction ([PERF-203]).
- [ ] **Implement `get_pool_state` response fields** ([PERF-204]–[PERF-210]):
  - `utilization_pct` computation.
  - `server_uptime_ms` computation.
  - Lock contention with `cancel_run` handling.
  - Rate-limited agent `rate_limited_until` field.
- [ ] **Implement `get_run` `elapsed_ms`** ([PERF-211]–[PERF-215]):
  - Monotonic for Running state.
  - Frozen for Paused state.
- [ ] **Implement pool exhaustion webhook deduplication** ([PERF-216]).
- [ ] **Implement `SloViolation` event emission** rate-limited to 1 per 10 s per `(operation, boundary)` ([PERF-095]).
- [ ] **Implement Criterion benchmark infrastructure** in `crates/*/benches/` ([PERF-089]–[PERF-094]).
- [ ] **Implement operator alert threshold documentation** ([PERF-096]–[PERF-099]).
- [ ] **Implement remaining PERF-217 through PERF-221** structured log edge cases.

## 3. Code Review
- [ ] Verify all structured log events have correct event_type and level.
- [ ] Verify JSON log format is parseable by `jq .`.
- [ ] Verify `elapsed_ms` monotonicity invariant.
- [ ] Verify `// Covers:` annotations and doc comments present.

## 4. Run Automated Tests to Verify
- [ ] Run structured logging tests:
  ```
  cargo test -p devs-core --test structured_logging -- --nocapture
  ```

## 5. Update Documentation
- [ ] Document structured log event types and their levels in `docs/architecture/testing.md`.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_logging.txt
  ```
