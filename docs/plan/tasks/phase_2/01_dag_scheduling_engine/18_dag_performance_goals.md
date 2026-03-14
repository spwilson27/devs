# Task: DAG Performance Goals (Sub-Epic: 01_dag_scheduling_engine)

## Covered Requirements
- [GOAL-001], [2_TAS-REQ-272], [2_TAS-REQ-273], [2_TAS-REQ-274]

Note: [2_TAS-REQ-272], [2_TAS-REQ-273], [2_TAS-REQ-274] are also covered in task 15 (Error Handling & Recovery) — this task focuses on the performance aspects and DAG dispatch latency goals.

## Dependencies
- depends_on: ["02_parallel_stage_dispatch_engine.md", "15_error_handling_and_recovery.md"]
- shared_components: [devs-scheduler (owner — DAG dispatch engine), devs-core (consumer — performance benchmarks)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/performance_tests.rs` and `benches/dag_dispatch_benchmark.rs`.
- [ ] Write performance test `test_dag_dispatch_latency_under_100ms`: create workflow with 50-stage wide DAG (all stages depend on single root). Complete root stage. Measure wall-clock time from root completion to all 50 stages dispatched. Assert < 100ms using `tokio::time::Instant::now()` for monotonic measurement. Annotate `// Covers: GOAL-001`.
- [ ] Write performance test `test_dag_dispatch_two_independent_roots`: create workflow with two independently-rooted stages (no `depends_on`). Submit run. Measure time from run transitioning to `Running` until both stages dispatched. Assert < 100ms. Annotate `// Covers: GOAL-001`.
- [ ] Write performance test `test_template_error_fail_fast_no_agent_spawn`: create stage with invalid template `{{unknown_var}}`. Measure time from `prepare_stage()` call to stage transition to `Failed`. Assert no agent process spawned (check process table). Assert fail-fast < 10ms. Annotate `// Covers: 2_TAS-REQ-272`.
- [ ] Write performance test `test_slug_collision_check_latency`: submit two runs with same name simultaneously. Measure time for collision detection and `ALREADY_EXISTS` response. Assert p99 < 50ms. Annotate `// Covers: 2_TAS-REQ-273`.
- [ ] Write performance test `test_template_unknown_variable_error_latency`: create stage with template referencing non-existent stage. Measure time from `prepare_stage()` to `TemplateError::UnknownVariable` returned. Assert < 10ms. Annotate `// Covers: 2_TAS-REQ-274`.
- [ ] Write benchmark `bench_dag_topological_sort`: benchmark Kahn's algorithm with varying graph sizes (10, 100, 1000 stages). Assert p99 latency scales linearly. Annotate `// Covers: GOAL-001`.
- [ ] Write benchmark `bench_dag_eligibility_computation`: benchmark `eligible_stages()` with varying completed set sizes. Assert p99 < 1ms for typical workloads. Annotate `// Covers: GOAL-001`.
- [ ] Write benchmark `bench_template_resolution`: benchmark `TemplateResolver::resolve()` with varying template complexity. Assert p99 < 5ms for typical templates. Annotate `// Covers: 2_TAS-REQ-272`.

## 2. Task Implementation
- [ ] Implement DAG dispatch latency optimization in `crates/devs-scheduler/src/dispatch.rs`:
  - Use `tokio::time::Instant::now()` for monotonic timing (not wall clock).
  - Measure time from root stage completion to all child stages dispatched.
  - Optimize lock acquisition to minimize contention.
  - Use `Vec::with_capacity()` to pre-allocate dispatch lists.
  - Ensure dispatch loop runs in O(V) time where V = number of stages.
- [ ] Implement parallel dispatch for independent stages:
  - When multiple stages become eligible simultaneously, dispatch all in parallel.
  - Use `tokio::spawn` for each stage dispatch task.
  - Ensure all tasks are spawned within same scheduler tick.
- [ ] Implement template error fail-fast optimization:
  - Check templates before any agent spawn logic.
  - Return error immediately on first unknown variable.
  - Do not allocate error strings until needed (lazy formatting).
- [ ] Implement slug collision check optimization:
  - Use per-project mutex for atomic check-and-create.
  - Keep mutex hold time minimal (check existence, create run, release).
  - Use `HashSet` for O(1) slug lookup.
- [ ] Implement template unknown variable error optimization:
  - Pre-compute valid variable set before resolution.
  - Use `HashMap` for O(1) variable lookup.
  - Return error immediately on first unknown.
- [ ] Add benchmark infrastructure in `crates/devs-scheduler/benches/`:
  - Use `criterion` crate for benchmarking.
  - Configure for p50, p90, p95, p99 latency reporting.
  - Add CI job that runs benchmarks and reports regression.
- [ ] Add `// Covers:` annotations for all covered requirements.

## 3. Code Review
- [ ] Verify DAG dispatch uses monotonic clock (not wall clock) for timing.
- [ ] Verify dispatch loop does not hold locks during agent acquisition.
- [ ] Verify template errors fail before any agent spawn logic.
- [ ] Verify slug collision check is atomic (no TOCTOU race).
- [ ] Verify benchmark infrastructure reports p99 latency.
- [ ] Verify 100ms dispatch goal is achievable for 50-stage wide DAG.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- performance` and verify all tests pass.
- [ ] Run `cargo bench -p devs-scheduler` and verify benchmarks complete.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.
- [ ] Verify DAG dispatch latency < 100ms in CI benchmark job.

## 5. Update Documentation
- [ ] Add doc comments explaining performance goals and benchmarks.
- [ ] Document the 100ms dispatch latency goal in module docs.
- [ ] Document the fail-fast behavior for template errors.
- [ ] Add benchmark results to README or performance documentation.
- [ ] Ensure `cargo doc -p devs-scheduler --no-deps` builds without warnings.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- performance --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo bench -p devs-scheduler -- --save-baseline main` and verify benchmarks complete.
- [ ] Verify `test_dag_dispatch_latency_under_100ms` passes consistently in CI.
- [ ] Verify `test_dag_dispatch_two_independent_roots` passes (GOAL-001 verification).
- [ ] Run `cargo tarpaulin -p devs-scheduler --out json -- performance` and verify ≥ 90% line coverage for dispatch performance code.
