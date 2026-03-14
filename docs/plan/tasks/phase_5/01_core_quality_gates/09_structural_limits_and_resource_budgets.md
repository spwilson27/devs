# Task: Structural Limits & Resource Budgets (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [PERF-034], [PERF-035], [PERF-036], [PERF-037], [PERF-038], [PERF-039]
- [PERF-040], [PERF-041], [PERF-042], [PERF-043], [PERF-044], [PERF-045], [PERF-046], [PERF-047], [PERF-048], [PERF-049], [PERF-050], [PERF-051], [PERF-052], [PERF-053], [PERF-054], [PERF-055]
- [PERF-056], [PERF-057], [PERF-058], [PERF-059], [PERF-060], [PERF-061], [PERF-062], [PERF-063], [PERF-064], [PERF-065], [PERF-066], [PERF-067], [PERF-068], [PERF-069], [PERF-070], [PERF-071], [PERF-072], [PERF-073], [PERF-074], [PERF-075], [PERF-076], [PERF-077], [PERF-078], [PERF-079], [PERF-080]
- [PERF-081]
- [PERF-BR-620], [PERF-BR-621], [PERF-BR-622], [PERF-BR-623], [PERF-BR-624], [PERF-BR-625], [PERF-BR-626], [PERF-BR-627], [PERF-BR-628], [PERF-BR-629], [PERF-BR-630], [PERF-BR-631], [PERF-BR-632], [PERF-BR-633], [PERF-BR-634], [PERF-BR-635]

## Dependencies
- depends_on: [06_perf_core_infrastructure.md]
- shared_components: [devs-core, devs-scheduler, devs-pool, devs-mcp, devs-adapters]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/tests/structural_limits.rs` with tests that:
  1. Assert max 256 stages per workflow ([PERF-040]).
  2. Assert max 64 fan-out count ([PERF-041]).
  3. Assert max 64 simultaneous MCP connections; 65th gets HTTP 503 ([PERF-042]).
  4. Assert max 20 concurrent streams ([PERF-043]).
  5. Assert all hard limits are defined as named `pub const` in `devs-core/src/constants.rs` ([PERF-BR-620]).
  6. Assert fan-out (64) and MCP connection limit (64) use separate named constants ([PERF-BR-631]).
  7. Assert `BoundedString<N>` and `BoundedBytes<N>` enforce truncation purely at Rust type level with no `unsafe` ([PERF-BR-623]).
  8. Assert `LogBuffer` capacity is 10,000 lines; eviction is silent ([PERF-BR-626]).
  9. Assert server baseline RSS < 64 MiB ([PERF-056]).
  10. Assert context file size ≤ 10 MiB ([PERF-057]).
  11. Assert checkpoint file excludes inline base64 content ([PERF-058]).
  12. Assert no REST API: no `axum`, `actix_web`, `warp` in production deps ([PERF-081]).
  13. Annotate all with `// Covers:`.
- [ ] Create `crates/devs-core/tests/resource_budgets.rs` for memory/size budget assertions.
- [ ] Run tests to confirm red:
  ```
  cargo test -p devs-core --test structural_limits -- --nocapture 2>&1 | tee /tmp/limits_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Define all hard limits as named constants** in `crates/devs-core/src/constants.rs` ([PERF-BR-620]):
  - `MAX_STAGES_PER_WORKFLOW: usize = 256`
  - `MAX_FAN_OUT: usize = 64`
  - `MAX_MCP_CONNECTIONS: usize = 64`
  - `MAX_CONCURRENT_STREAMS: usize = 20`
  - `LOG_BUFFER_CAPACITY: usize = 10_000`
  - `MAX_CONTEXT_FILE_BYTES: usize = 10 * 1024 * 1024`
  - Add `// MVP-LIMIT` comments to constants near peak values ([PERF-BR-634]).
- [ ] **Implement `BoundedString<MIN, MAX>` and `BoundedBytes<N>`** type-level enforcement ([PERF-BR-623]):
  - Enforce at `serde::Deserialize` time ([PERF-GP-015] reference).
  - Set `truncated: true` and log WARN with `event_type: "resource.truncated"` on truncation.
- [ ] **Implement `LogBuffer`** with capacity enforcement ([PERF-BR-626]):
  - Oldest entries evicted silently; does not affect stage status.
- [ ] **Implement MCP connection limit** at TCP acceptor level using `AtomicU32` with `SeqCst` ordering ([PERF-BR-624]).
- [ ] **Implement validation-layer limit checks** before acquiring write locks ([PERF-BR-621]).
- [ ] **Implement machine-parseable error messages** for limit violations ([PERF-BR-627]).
- [ ] **Implement `RetryConfig.max_attempts` clamping** at parse time with WARN ([PERF-BR-628]).
- [ ] **Implement `StructuralLimitApproach` WARN events** with `growth_path` field ([PERF-BR-635]).
- [ ] **Add `./do lint` check** for REST framework imports in production cargo tree ([PERF-081]).
- [ ] **Ensure all acceptors use `tokio::net::TcpListener`** for post-MVP TLS readiness ([PERF-BR-633]).
- [ ] **Add CI `jq .` check** for external log aggregator compatibility ([PERF-BR-635]).

## 3. Code Review
- [ ] Verify all constants are named `pub const` in `constants.rs`.
- [ ] Verify `BoundedBytes<N>` uses no `unsafe` ([PERF-BR-623]).
- [ ] Verify MCP connection limit uses `AtomicU32 SeqCst` ([PERF-BR-624]).
- [ ] Verify `LogBuffer` eviction does not affect stage status ([PERF-BR-626]).
- [ ] Verify broadcast channel lagged subscribers logged at WARN ([PERF-BR-629]).
- [ ] Verify `// Covers:` annotations and doc comments present.

## 4. Run Automated Tests to Verify
- [ ] Run structural limit and resource budget tests:
  ```
  cargo test -p devs-core --test structural_limits --test resource_budgets -- --nocapture
  ```
- [ ] Run traceability verification for all PERF-034 through PERF-081 and PERF-BR-620 through PERF-BR-635.

## 5. Update Documentation
- [ ] Document all structural limits and their rationale in `docs/architecture/testing.md`.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_limits.txt
  ```
- [ ] Verify no REST framework in production deps:
  ```
  ./do lint 2>&1 | grep -E "axum|actix_web|warp"
  ```
