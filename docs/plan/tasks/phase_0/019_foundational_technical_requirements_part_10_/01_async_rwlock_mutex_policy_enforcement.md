# Task: Async RwLock/Mutex Policy Enforcement (Sub-Epic: 019_Foundational Technical Requirements (Part 10))

## Covered Requirements
- [2_TAS-REQ-002M]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (Owner — concurrency policy types defined here)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/concurrency.rs` (new module), write a compile-time doc-test that demonstrates the correct pattern: `Arc<tokio::sync::RwLock<T>>` for read-heavy shared state and `Arc<tokio::sync::Mutex<T>>` for write-heavy shared state. The doc-test must compile and run successfully.
- [ ] Write a unit test `test_rwlock_read_heavy_pattern` that creates an `Arc<tokio::sync::RwLock<HashMap<String, String>>>`, spawns 10 concurrent read tasks and 1 write task, and asserts all reads complete without deadlock within 1 second.
- [ ] Write a unit test `test_mutex_write_heavy_pattern` that creates an `Arc<tokio::sync::Mutex<Vec<u32>>>`, spawns 5 concurrent write tasks each pushing a value, and asserts the final vec length is 5.
- [ ] Create a lint script `tools/check_std_sync_across_await.sh` that uses `grep -rn` to find `.rs` files under `crates/` containing both `std::sync::Mutex` or `std::sync::RwLock` AND `.await` in the same function body. The script exits non-zero if any violations are found. Initially it should pass (no violations exist yet).

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/concurrency.rs` module with:
  - Module-level documentation stating the policy: "Shared mutable state between async tasks MUST use `Arc<tokio::sync::RwLock<T>>` for read-heavy state or `Arc<tokio::sync::Mutex<T>>` for write-heavy state. `std::sync::RwLock` and `std::sync::Mutex` MUST NOT be held across `.await` points."
  - Re-export convenience type aliases: `pub type SharedState<T> = Arc<tokio::sync::RwLock<T>>;` and `pub type ExclusiveState<T> = Arc<tokio::sync::Mutex<T>>;`
  - Constructor functions: `pub fn shared_state<T>(value: T) -> SharedState<T>` and `pub fn exclusive_state<T>(value: T) -> ExclusiveState<T>`
- [ ] Add `pub mod concurrency;` to `crates/devs-core/src/lib.rs`.
- [ ] Enable `clippy::await_holding_lock` lint in the workspace `Cargo.toml` or `clippy.toml` to catch `std::sync` locks held across `.await` points at compile time.
- [ ] Integrate `tools/check_std_sync_across_await.sh` into `./do lint` so it runs as part of presubmit.

## 3. Code Review
- [ ] Verify that `SharedState<T>` and `ExclusiveState<T>` type aliases use `tokio::sync` variants, not `std::sync`.
- [ ] Verify `clippy::await_holding_lock` is enabled and would catch violations.
- [ ] Verify the lint script correctly identifies violations (test with a temporary bad file if needed).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- concurrency` and confirm all tests pass.
- [ ] Run `cargo clippy --workspace -- -D warnings` and confirm no `await_holding_lock` violations.
- [ ] Run `./do lint` and confirm the custom lint check passes.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-002M` annotation to each test function.
- [ ] Ensure module-level doc comment on `concurrency.rs` references [2_TAS-REQ-002M].

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- concurrency 2>&1 | grep -E "test result: ok"` to confirm tests pass.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-002M" crates/devs-core/` to confirm traceability annotations exist.
- [ ] Run `./do lint` and confirm exit code 0.
