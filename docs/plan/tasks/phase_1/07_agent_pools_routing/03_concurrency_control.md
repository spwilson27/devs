# Task: Implement Concurrency Semaphore and Slot Management (Sub-Epic: 07_Agent Pools & Routing)

## Covered Requirements
- [1_PRD-REQ-021]

## Dependencies
- depends_on: [01_pool_models.md]
- shared_components: [devs-pool (create — concurrency module), Shared State & Concurrency Patterns (consume — tokio::sync::Semaphore pattern)]

## 1. Initial Test Written
- [ ] Add `tokio` as a dev-dependency (and runtime dependency) to `devs-pool/Cargo.toml` with features `["rt-multi-thread", "sync", "macros", "time"]`.
- [ ] In `crates/devs-pool/src/pool.rs`, write the following async tests (using `#[tokio::test]`):
  - `test_acquire_slot_within_limit`: Create pool with `max_concurrent = 2`. Acquire 2 slots. Assert both succeed immediately (no timeout).
  - `test_acquire_slot_blocks_at_limit`: Create pool with `max_concurrent = 1`. Acquire 1 slot. Spawn a task that tries to acquire a second slot. Assert the second task does not complete within 100ms (use `tokio::time::timeout`). Drop the first slot. Assert the second task completes within 100ms.
  - `test_slot_guard_releases_on_drop`: Create pool with `max_concurrent = 1`. Acquire slot in a block scope. After the block, acquire another slot. Assert it succeeds immediately.
  - `test_max_concurrent_is_hard_limit`: Create pool with `max_concurrent = 3`. Spawn 5 concurrent tasks each acquiring a slot and holding it for 200ms. Use an `AtomicUsize` counter to track peak concurrent holders. Assert peak never exceeds 3.
  - `test_slot_guard_is_send_sync`: Static assertions that `SlotGuard` implements `Send` and `Sync` (use `fn assert_send<T: Send>() {}` pattern).
  - `test_acquire_slot_multiple_projects_share_limit`: Create a single `Arc<AgentPool>` with `max_concurrent = 2`. Clone the Arc into two "project" tasks. Each tries to acquire 2 slots. Assert that globally, at most 2 slots are held concurrently.

## 2. Task Implementation
- [ ] Add a `semaphore: Arc<tokio::sync::Semaphore>` field to `AgentPool`. Initialize it in `AgentPool::new()` with `max_concurrent` permits.
- [ ] Define `SlotGuard`:
  ```rust
  /// RAII guard that holds a semaphore permit. Releasing the guard
  /// (via drop) returns the permit to the pool.
  pub struct SlotGuard {
      _permit: tokio::sync::OwnedSemaphorePermit,
      pool_name: String,
  }
  ```
- [ ] Implement `AgentPool::acquire_slot(&self) -> Result<SlotGuard, PoolError>`:
  - Clone the `Arc<Semaphore>` and call `acquire_owned().await`.
  - Wrap the permit in a `SlotGuard` and return it.
  - On semaphore closed error (should not happen in normal operation), return `PoolError::PoolExhausted`.
- [ ] Implement `AgentPool::available_slots(&self) -> usize` that returns `self.semaphore.available_permits()`.
- [ ] Ensure `AgentPool` itself is `Clone`-able (wraps semaphore in `Arc`) so it can be shared across project contexts.

## 3. Code Review
- [ ] Verify the semaphore is created exactly once and never recreated during the lifetime of an `AgentPool`.
- [ ] Verify `SlotGuard` does not expose the inner permit — only drops it.
- [ ] Verify `max_concurrent` is enforced as a hard limit (3_PRD-BR-024): no code path bypasses the semaphore.
- [ ] Verify `AgentPool` can be wrapped in `Arc` for cross-task sharing without additional synchronization.
- [ ] Verify no `unwrap()` or `expect()` on semaphore operations in production code paths.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool -- pool` and verify all 6 async tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `SlotGuard` explaining RAII semantics and the relationship to `max_concurrent`.
- [ ] Add `// Covers: 1_PRD-REQ-021` annotations to each test function.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Run `./do lint` and ensure no warnings.
- [ ] Verify `// Covers: 1_PRD-REQ-021` appears in test code via `grep -r "Covers: 1_PRD-REQ-021" crates/devs-pool/`.
