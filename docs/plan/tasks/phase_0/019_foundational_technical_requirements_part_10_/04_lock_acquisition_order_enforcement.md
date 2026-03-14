# Task: Lock Acquisition Order Enforcement (Sub-Epic: 019_Foundational Technical Requirements (Part 10))

## Covered Requirements
- [2_TAS-REQ-002P]

## Dependencies
- depends_on: ["01_async_rwlock_mutex_policy_enforcement.md", "02_pool_concurrency_semaphore_contract.md", "03_scheduler_state_structure.md"]
- shared_components: [devs-core (Owner — lock order constants and documentation defined here)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/concurrency.rs`, write a unit test `test_lock_order_constants_defined` that asserts the `LOCK_ORDER` array contains exactly three entries in order: `"SchedulerState"`, `"PoolState"`, `"CheckpointStore"`.
- [ ] Write a unit test `test_lock_order_validator_accepts_correct_order` that calls a `validate_lock_order(&["SchedulerState", "PoolState"])` function and asserts it returns `Ok(())`.
- [ ] Write a unit test `test_lock_order_validator_rejects_reversed_order` that calls `validate_lock_order(&["PoolState", "SchedulerState"])` and asserts it returns `Err` with a descriptive message about lock order violation.
- [ ] Write a unit test `test_lock_order_validator_accepts_single_lock` that calls `validate_lock_order(&["CheckpointStore"])` and asserts `Ok(())`.
- [ ] Write a unit test `test_lock_order_validator_rejects_checkpoint_before_pool` that calls `validate_lock_order(&["CheckpointStore", "PoolState"])` and asserts `Err`.
- [ ] Create a lint script `tools/check_lock_order.sh` that greps for comments matching `// Lock order:` in `crates/` and verifies they reference the canonical order. Initially this is a placeholder that exits 0.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/concurrency.rs`, add:
  - `pub const LOCK_ORDER: &[&str] = &["SchedulerState", "PoolState", "CheckpointStore"];` — the authoritative global lock acquisition order.
  - `pub fn validate_lock_order(acquired: &[&str]) -> Result<(), LockOrderError>` — checks that the given sequence of lock names is a subsequence of `LOCK_ORDER`. Returns `LockOrderError` if any lock appears before a higher-priority lock.
  - `pub struct LockOrderError { pub message: String }` with `Display` and `Error` impls.
  - Module-level doc comment update: add a section "## Lock Acquisition Order" documenting the mandatory order: `SchedulerState → PoolState → CheckpointStore`. State that any code path acquiring multiple locks MUST acquire them in this order.
- [ ] Add the lock order documentation as a doc comment on the `LOCK_ORDER` constant itself, explaining the rationale (deadlock prevention).
- [ ] Integrate `tools/check_lock_order.sh` into `./do lint`.

## 3. Code Review
- [ ] Verify `LOCK_ORDER` matches the requirement exactly: `SchedulerState → PoolState → CheckpointStore`.
- [ ] Verify `validate_lock_order` correctly handles edge cases: empty input, single lock, all three in order, partial sequences.
- [ ] Verify the lint script integration does not break existing `./do lint` functionality.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- lock_order` and confirm all tests pass.
- [ ] Run `./do lint` and confirm exit code 0.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-002P` annotation to each test function.
- [ ] Ensure `LOCK_ORDER` doc comment references [2_TAS-REQ-002P].

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- lock_order 2>&1 | grep -E "test result: ok"` to confirm tests pass.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-002P" crates/devs-core/` to confirm traceability annotations exist.
