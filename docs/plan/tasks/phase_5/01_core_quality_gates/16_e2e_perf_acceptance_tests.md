# Task: E2E Performance Acceptance Tests (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [AC-PERF-010], [AC-PERF-011], [AC-PERF-012], [AC-PERF-013], [AC-PERF-014], [AC-PERF-015], [AC-PERF-016], [AC-PERF-017], [AC-PERF-018], [AC-PERF-019], [AC-PERF-020], [AC-PERF-021], [AC-PERF-022], [AC-PERF-023], [AC-PERF-024], [AC-PERF-025], [AC-PERF-026], [AC-PERF-027], [AC-PERF-028], [AC-PERF-029], [AC-PERF-030], [AC-PERF-031], [AC-PERF-032], [AC-PERF-033], [AC-PERF-034], [AC-PERF-035], [AC-PERF-036], [AC-PERF-037], [AC-PERF-038], [AC-PERF-039], [AC-PERF-040], [AC-PERF-041], [AC-PERF-042], [AC-PERF-043], [AC-PERF-044], [AC-PERF-045], [AC-PERF-046], [AC-PERF-047], [AC-PERF-048], [AC-PERF-049], [AC-PERF-050], [AC-PERF-051], [AC-PERF-052], [AC-PERF-053], [AC-PERF-054], [AC-PERF-055]

## Dependencies
- depends_on: ["01_e2e_infrastructure.md", "06_perf_core_infrastructure.md", "07_slo_constants_and_integration_tests.md", "11_observability_and_structured_logging.md"]
- shared_components: [devs-cli, devs-tui, devs-mcp, devs-core, devs-scheduler, devs-pool]

## 1. Initial Test Written
- [ ] Create E2E perf tests across all three interfaces:
  - `crates/devs-cli/tests/e2e/perf_cli.rs`:
    1. Assert `devs status` completes < 750 ms ([AC-PERF-010]).
    2. Assert `devs list` with 100 runs completes < 1050 ms ([AC-PERF-011]).
    3. Assert `devs submit` completes < 2250 ms ([AC-PERF-012]).
    4. Assert CLI command latency checks with loopback CI margins ([AC-PERF-020]–[AC-PERF-023]).
  - `crates/devs-tui/tests/e2e/perf_tui.rs`:
    1. Assert TUI reconnect begins within 1000 ms ([AC-PERF-017]).
    2. Assert below-minimum terminal shows only warning ([AC-PERF-018]).
    3. Assert 256 rapid `RunDelta` events processed within 5000 ms ([AC-PERF-019]).
  - `crates/devs-mcp/tests/e2e/perf_mcp.rs`:
    1. Assert MCP tool call latencies within SLO bounds.
  - Common tests:
    1. Assert checkpoint write < 500 ms ([AC-PERF-013]).
    2. Assert orphaned `.tmp` cleanup < 500 ms ([AC-PERF-014]).
    3. Assert checkpoint excludes inline base64 ([AC-PERF-015]).
    4. Assert server RSS < 64 MiB at idle ([AC-PERF-016]).
    5. Assert fan-out 64/max_concurrent 4 shows correct pool state within 500 ms ([AC-PERF-024]).
    6. Assert `BoundedBytes` truncation behavior ([AC-PERF-025]).
    7. Assert context file size with 10×1MiB stages ([AC-PERF-026]).
  - Annotate all with `// Covers:`.
- [ ] Run tests to confirm red:
  ```
  cargo test --workspace --test perf_cli --test perf_tui --test perf_mcp -- --nocapture 2>&1 | tee /tmp/e2e_perf_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Implement CLI latency E2E tests** ([AC-PERF-010]–[AC-PERF-012], [AC-PERF-020]–[AC-PERF-023]):
  - Use `ServerManager` to spawn real server.
  - Measure wall-clock time from CLI invocation to exit using `std::time::Instant`.
  - Collect ≥ 100 observations per command.
  - Apply 50% CI margin to SLO constants.
- [ ] **Implement TUI E2E tests** ([AC-PERF-017]–[AC-PERF-019]):
  - Reconnect timing: disconnect server, measure time until TUI begins reconnect.
  - Below-minimum terminal: use TestBackend with 79×23, verify warning-only display.
  - Rapid event processing: submit 256 `RunDelta` events, verify processing within 5000 ms.
- [ ] **Implement presubmit timing compliance tests** ([AC-PERF-030]–[AC-PERF-032]):
  - Verify `target/presubmit_timings.jsonl` fields.
  - Verify over-budget WARN behavior.
  - Verify `timeout_kill` record.
- [ ] **Implement structured log acceptance tests** ([AC-PERF-033]–[AC-PERF-037]):
  - `scheduler.dispatch_slow` has correct fields.
  - `mcp.lock_timeout` has correct fields.
  - `tui.render_slow` has correct fields.
  - `webhook.channel_overflow` has correct fields.
  - JSON parseability verified.
- [ ] **Implement extended acceptance tests** ([AC-PERF-038]–[AC-PERF-055]):
  - Rate-limiting edge cases.
  - `get_pool_state` field computations (`utilization_pct`, `server_uptime_ms`).
  - `get_run` `elapsed_ms` monotonicity for Running, frozen for Paused.
  - Pool exhaustion webhook deduplication.
  - Criterion regression detection acceptance tests.

## 3. Code Review
- [ ] Verify all E2E tests use real server subprocess (no internal imports).
- [ ] Verify latency measurements use `std::time::Instant`.
- [ ] Verify `// Covers:` annotations present for all listed IDs.

## 4. Run Automated Tests to Verify
- [ ] Run all E2E perf tests:
  ```
  ./do test --e2e
  ```

## 5. Update Documentation
- [ ] Document E2E performance test patterns in `docs/architecture/testing.md`.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_e2e_perf.txt
  ```
