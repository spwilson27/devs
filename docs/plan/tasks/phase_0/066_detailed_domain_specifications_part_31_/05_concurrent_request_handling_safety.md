# Task: Concurrent Request Handling Without Data Races (Sub-Epic: 066_Detailed Domain Specifications (Part 31))

## Covered Requirements
- [2_TAS-REQ-409]

## Dependencies
- depends_on: ["none"]
- shared_components: ["Shared State & Concurrency Patterns", "devs-core"]

## 1. Initial Test Written
- [ ] Write a concurrency test `test_concurrent_requests_no_data_race` that spawns 10 concurrent tasks (simulating TUI, CLI, and MCP clients) all reading and writing to shared server state (e.g., run list, pool state) via the public API. Assert no panics, no poisoned locks, and all operations complete successfully.
- [ ] Write a test `test_shared_state_uses_tokio_sync` that uses an architecture fitness scan to assert all `Mutex`, `RwLock`, and `Semaphore` usages in the server/scheduler/pool crates are from `tokio::sync`, not `std::sync` (except in tests or non-async code explicitly documented).
- [ ] Write a test `test_concurrent_read_write_isolation` that:
  - Acquires a write lock on the run state, inserts a run.
  - Concurrently spawns 5 read tasks that list runs.
  - Asserts all reads either see the run or don't (no partial/corrupt state), and no task panics.

## 2. Task Implementation
- [ ] Ensure all shared mutable state in the server is wrapped in `Arc<tokio::sync::RwLock<T>>` or `Arc<tokio::sync::Mutex<T>>`.
- [ ] Add a module-level doc comment in the shared state module: "The server handles concurrent requests from TUI, CLI, and MCP bridge clients simultaneously without data races. All shared mutable state is protected by Tokio synchronization primitives (2_TAS-REQ-409)."
- [ ] If any `std::sync::Mutex` or `std::sync::RwLock` is used for state accessed in async contexts, replace with `tokio::sync` equivalents.
- [ ] Add `// Covers: 2_TAS-REQ-409` annotations to each test.

## 3. Code Review
- [ ] Verify no `std::sync::Mutex` wraps state that is held across `.await` points.
- [ ] Verify the lock acquisition order documented in `Shared State & Concurrency Patterns` is followed.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- concurrent` and confirm all new tests pass.
- [ ] Run tests with `--release` to exercise optimized code paths for race detection.

## 5. Update Documentation
- [ ] Ensure the concurrency patterns doc comment is present in the shared state module.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures. Optionally run with `RUSTFLAGS="--cfg tokio_unstable" RUST_LOG=tokio=trace` to check for lock contention issues.
