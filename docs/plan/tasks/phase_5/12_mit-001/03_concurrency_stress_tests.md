# Task: Scheduler High-Concurrency Stress Tests (Sub-Epic: 12_MIT-001)

## Covered Requirements
- [AC-RISK-001-01], [AC-RISK-001-04]

## Dependencies
- depends_on: [02_scheduler_mutex_locking.md]
- shared_components: [devs-scheduler, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a high-concurrency stress test in `devs-scheduler/tests/concurrency_tests.rs`.
- [ ] Use `tokio::join!` to send exactly 100 `StageCompleted` events to the `stage_complete_tx` channel for the same stage and same run simultaneously.
- [ ] Inject `tokio::time::sleep(Duration::from_millis(rand::random::<u64>() % 10))` within the scheduler's lock acquisition path to increase race probability.
- [ ] Assert that exactly one `Completed` transition is recorded in the final `checkpoint.json`.
- [ ] Assert that 99 attempts return `Err(TransitionError::IllegalTransition)`.

## 2. Task Implementation
- [ ] Configure the workspace to support running tests with ThreadSanitizer (TSan) in CI: `RUSTFLAGS="-Z sanitizer=thread" cargo test -p devs-scheduler`.
- [ ] Update `devs-scheduler` test runner to handle 100 parallel tasks without exhausting system resources (use `Semaphore` to cap total concurrent tasks if necessary).
- [ ] Ensure that `cargo test --workspace -- scheduler` passes with `--test-threads 8` consistently.

## 3. Code Review
- [ ] Verify that no data races are reported by ThreadSanitizer (if available in the dev environment).
- [ ] Confirm that `checkpoint.json` writes are not interleaved and the file remains valid JSON.
- [ ] Check for potential memory leaks under high concurrency.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- --test-threads 8`.
- [ ] Run the 100-event stress test repeatedly (e.g., 10 times) to ensure stability.

## 5. Update Documentation
- [ ] Record the performance and stability findings in `devs-scheduler/tests/README.md` for future reference.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure 100% requirement-to-test traceability for [AC-RISK-001-01] and [AC-RISK-001-04].
- [ ] Verify traceability via `target/traceability.json`.
