# Task: Scheduler Multi-threaded Stress Testing (Sub-Epic: 11_Risk 001 Verification)

## Covered Requirements
- [RISK-001], [AC-RISK-001-04]

## Dependencies
- depends_on: [02_verify_dag_logic_and_cascading.md]
- shared_components: [devs-scheduler]

## 1. Initial Test Written
- [ ] Create a "stress" integration test in `devs-scheduler` that sets up a large, complex DAG with 1000+ stages and random dependencies.
- [ ] Execute the test with `cargo test --workspace -- scheduler --test-threads 8`.
- [ ] The test should verify that the scheduler finishes exactly all 1000 stages (mocked as simple no-op tasks) without any deadlocks or lost events.
- [ ] Incorporate `ThreadSanitizer` (TSan) support into the CI config (`RUSTFLAGS="-Z sanitizer=thread"` on nightly) for the scheduler stress test.

## 2. Task Implementation
- [ ] Audit the `DagScheduler` implementation to ensure all internal state updates are thread-safe and no unsynchronized shared state exists.
- [ ] Optimize the internal topological sorting and stage dispatch to minimize lock contention during high-volume stage completions.
- [ ] Ensure the scheduler can recover from a high-frequency `stage_complete_tx` stream without dropping messages or corrupting the `checkpoint.json`.

## 3. Code Review
- [ ] Check for any `std::sync::Mutex` usage inside async functions (should use `tokio::sync::Mutex`).
- [ ] Verify that no "long-running" work happens inside the scheduler lock.
- [ ] Ensure no `Arc::clone` chains are creating unnecessary performance overhead.

## 4. Run Automated Tests to Verify
- [ ] `cargo test --workspace -- scheduler --test-threads 8`
- [ ] (On Nightly) `RUSTFLAGS="-Z sanitizer=thread" cargo test --workspace -- scheduler`

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to document the stress test methodology and TSan verification results.

## 6. Automated Verification
- [ ] Run the scheduler stress test in a loop 10 times and ensure a 100% success rate to confirm no flaky race conditions.
