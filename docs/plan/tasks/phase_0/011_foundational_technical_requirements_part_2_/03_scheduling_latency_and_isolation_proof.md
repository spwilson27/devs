# Task: Parallel Scheduling Latency Constraint and Filesystem Isolation Contract (Sub-Epic: 011_Foundational Technical Requirements (Part 2))

## Covered Requirements
- [2_PRD-BR-004], [2_PRD-BR-005]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consumer — domain types)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/scheduling_contracts.rs` with a `#[cfg(test)] mod tests` block.
- [ ] Write `test_parallel_task_spawn_within_100ms` (async test using `#[tokio::test]`):
  - Create a `tokio::sync::Barrier` for 10 tasks.
  - Record `base_time = Instant::now()` before spawning.
  - Spawn 10 `tokio::spawn` tasks, each of which records its own `Instant::now()` into a shared `Arc<Mutex<Vec<Instant>>>` and then waits on the barrier.
  - After all tasks complete, compute `max_start - base_time` across all recorded instants.
  - Assert the delta is less than `Duration::from_millis(100)`.
  - This proves the Tokio runtime can schedule independent tasks within the 100ms budget required by [2_PRD-BR-004].
- [ ] Write `test_concurrent_tempdirs_have_distinct_paths`:
  - Create two `tempfile::TempDir` instances.
  - Assert `dir1.path() != dir2.path()`.
  - Write a file `marker.txt` with content `"dir1"` into `dir1` and `"dir2"` into `dir2`.
  - Assert `dir1.path().join("marker.txt")` contains `"dir1"`.
  - Assert `dir2.path().join("marker.txt")` contains `"dir2"`.
  - Assert `dir1.path().join("marker.txt")` does NOT exist when read from `dir2`'s perspective (i.e., `dir2.path().join("marker.txt")` does not contain `"dir1"`).
  - This proves filesystem isolation for the `tempdir` execution target per [2_PRD-BR-005].
- [ ] Write `test_concurrent_tasks_cannot_observe_each_others_files`:
  - Spawn 2 async tasks, each creating its own `TempDir`.
  - Task 1 writes `task1_secret.txt` to its dir; task 2 writes `task2_secret.txt` to its dir.
  - After both complete, assert `task1_dir.path().join("task2_secret.txt")` does not exist and vice versa.
- [ ] Annotate with `// Covers: 2_PRD-BR-004` and `// Covers: 2_PRD-BR-005`.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/scheduling_contracts.rs`, define public documentation constants that codify the contracts:
  ```rust
  /// Maximum allowed delay between dependency completion and parallel stage dispatch.
  /// Two stages with no shared unresolved dependencies MUST be scheduled within this duration.
  pub const PARALLEL_DISPATCH_BUDGET: std::time::Duration = std::time::Duration::from_millis(100);

  /// Concurrent stages in tempdir/docker/remote MUST have isolated filesystem namespaces.
  /// This module's tests prove the isolation property for tempdir; docker and remote
  /// isolation is enforced by the execution environment itself.
  pub const _FILESYSTEM_ISOLATION_DOC: &str = "See 2_PRD-BR-005";
  ```
- [ ] Add `pub mod scheduling_contracts;` to `crates/devs-core/src/lib.rs`.
- [ ] Ensure `tokio` is listed as a **dev-dependency** only (not a regular dependency) in `devs-core/Cargo.toml`, with features `["macros", "rt-multi-thread", "time"]` for the async tests. This preserves the [2_TAS-REQ-001E] constraint that devs-core has no tokio runtime dependency.
- [ ] Ensure `tempfile` is listed as a **dev-dependency** in `devs-core/Cargo.toml`.
- [ ] The `PARALLEL_DISPATCH_BUDGET` constant is a public API that downstream crates (devs-scheduler) will use to enforce the 100ms constraint at runtime.

## 3. Code Review
- [ ] Verify `tokio` and `tempfile` appear ONLY in `[dev-dependencies]` of `devs-core/Cargo.toml`, never in `[dependencies]` — enforcing [2_TAS-REQ-001E].
- [ ] Verify the latency test uses `std::time::Instant` (monotonic clock), not `SystemTime`.
- [ ] Verify the latency test accounts for CI slowness by using a generous but still meaningful bound (100ms is the contract; the test asserts against it directly since Phase 0 runs on stub workspace with minimal load).
- [ ] Verify the isolation tests create truly independent temp directories (no shared parent beyond the OS temp root).
- [ ] Confirm no non-dev runtime dependencies were added to devs-core.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- scheduling_contracts` and confirm all tests pass.
- [ ] Run `cargo test -p devs-core` to confirm no regressions.
- [ ] Run the latency test 5 times in a row (`for i in $(seq 5); do cargo test -p devs-core -- test_parallel_task_spawn_within_100ms; done`) to confirm it is not flaky.

## 5. Update Documentation
- [ ] Add rustdoc to `PARALLEL_DISPATCH_BUDGET` explaining it is the authoritative source for the 100ms scheduling constraint from [2_PRD-BR-004].
- [ ] Add `// Covers: 2_PRD-BR-004` and `// Covers: 2_PRD-BR-005` annotations to all test functions.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm exit code 0.
- [ ] Run `grep -r "Covers: 2_PRD-BR-004" crates/devs-core/` and confirm at least one match.
- [ ] Run `grep -r "Covers: 2_PRD-BR-005" crates/devs-core/` and confirm at least one match.
- [ ] Run `cargo tree -p devs-core --no-dev --edges normal` and confirm neither `tokio` nor `tempfile` appears in the output.
- [ ] Run `./do lint` and confirm exit code 0.
