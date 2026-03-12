# Task: Synchronous Lock Guard Audit (Sub-Epic: 068_Detailed Domain Specifications (Part 33))

## Covered Requirements
- [2_TAS-REQ-416]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-scheduler, devs-server]

## 1. Initial Test Written
- [ ] Create a "negative" test case (e.g., in a temporary file or a dedicated `fail` test) that explicitly holds a `std::sync::MutexGuard` across a `tokio::time::sleep(Duration::from_millis(1)).await`.
- [ ] Verify that this code (when compiled or linted) can be detected as a risk. Note: `tokio`'s `clippy` lints might already detect some of this, but we need an explicit audit.

## 2. Task Implementation
- [ ] Incorporate a check in `./do lint` that scans for common async-synchronous lock pitfalls.
- [ ] Audit all crates (`devs-scheduler`, `devs-server`, `devs-grpc`, `devs-mcp`) for `Arc<RwLock<...>>` or `Arc<Mutex<...>>` usage.
- [ ] Ensure any synchronous lock guards (from `std::sync`) are explicitly dropped or scoped before any `.await` point.
- [ ] If a lock must be held across `.await`, replace it with `tokio::sync::Mutex` or `tokio::sync::RwLock` as per `2_TAS-REQ-002M`.

## 3. Code Review
- [ ] Verify that all synchronous locks are used only for compute-bound, short-duration tasks that do not involve any async calls.
- [ ] Confirm that `RwLockReadGuard` or `MutexGuard` (from `std`) are not stored in structs that are `Send` and used across `await` points.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure all lints pass.
- [ ] Run all tests and ensure no deadlocks are observed in CI.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to include a warning about lock guards and await points.

## 6. Automated Verification
- [ ] Use `grep -r ".await" .` and check that no `MutexGuard` or `RwLockGuard` is in scope at those points.
- [ ] Verify that the `clippy` lint `await_holding_lock` is not being `allow`ed anywhere.
