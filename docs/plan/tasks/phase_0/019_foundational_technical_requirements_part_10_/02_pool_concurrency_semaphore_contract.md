# Task: Pool Concurrency Semaphore Contract (Sub-Epic: 019_Foundational Technical Requirements (Part 10))

## Covered Requirements
- [2_TAS-REQ-002N]

## Dependencies
- depends_on: ["01_async_rwlock_mutex_policy_enforcement.md"]
- shared_components: [devs-core (Consumer — uses concurrency types), devs-pool (Owner — semaphore pattern defined here)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/concurrency.rs`, write a unit test `test_semaphore_owned_permit_acquisition` that creates an `Arc<tokio::sync::Semaphore>` with 2 permits, acquires 2 owned permits via `.acquire_owned()`, asserts a third acquisition would not immediately succeed (use `try_acquire_owned()` and assert `Err`), then drops one permit and asserts the third acquisition succeeds.
- [ ] Write a unit test `test_semaphore_permit_released_on_drop_even_on_panic` that acquires an owned permit, passes it into a `tokio::spawn` task that panics, and asserts the permit is released (semaphore available permits returns to original count). Use `catch_unwind` or `JoinHandle::await` error to observe the panic without crashing.
- [ ] Write a unit test `test_semaphore_permit_crosses_task_boundary` that acquires an `OwnedSemaphorePermit` in one task, sends it via `tokio::sync::oneshot` channel to another task, drops it there, and asserts the permit count is restored on the original semaphore.
- [ ] Write a doc-test on a `PoolConcurrencyGuard` type (to be created) showing the acquire-use-drop pattern with `acquire_owned()`.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/concurrency.rs`, add:
  - `pub type PoolSemaphore = Arc<tokio::sync::Semaphore>;`
  - `pub fn pool_semaphore(max_concurrent: usize) -> PoolSemaphore` constructor.
  - A `PoolConcurrencyGuard` struct wrapping `OwnedSemaphorePermit` with documentation explaining that the permit is released on drop regardless of success/failure.
  - `pub async fn acquire_pool_slot(sem: &PoolSemaphore) -> Result<PoolConcurrencyGuard, AcquireError>` that calls `sem.clone().acquire_owned().await` and wraps the result.
- [ ] Ensure `PoolConcurrencyGuard` implements `Drop` implicitly (the inner `OwnedSemaphorePermit` handles it) — add a doc comment clarifying this.
- [ ] Export these types from `crates/devs-core/src/concurrency.rs` public API.

## 3. Code Review
- [ ] Verify `acquire_owned()` is used (not `acquire()`) so permits can cross task boundaries.
- [ ] Verify no code path exists where the permit could be `mem::forget`-ed or leaked.
- [ ] Verify `PoolConcurrencyGuard` does not implement `Clone` (permits must not be duplicated).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- semaphore` and confirm all tests pass.
- [ ] Run `cargo test -p devs-core -- pool_concurrency` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-002N` annotation to each test function.
- [ ] Add doc comments on `PoolConcurrencyGuard` referencing the requirement that permit release MUST occur on drop regardless of stage success or failure.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core 2>&1 | grep -E "test result: ok"` to confirm all tests pass.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-002N" crates/devs-core/` to confirm traceability annotations exist.
