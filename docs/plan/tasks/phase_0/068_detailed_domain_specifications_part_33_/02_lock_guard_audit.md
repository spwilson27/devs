# Task: Lock Guard Release Before Await Enforcement (Sub-Epic: 068_Detailed Domain Specifications (Part 33))

## Covered Requirements
- [2_TAS-REQ-416]

## Dependencies
- depends_on: [none]
- shared_components: [Shared State & Concurrency Patterns (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-server/tests/lock_guard_await.rs` with a test `test_clippy_await_holding_lock_enabled()` that programmatically runs `cargo clippy -p devs-server -- -D clippy::await_holding_lock` and asserts exit code 0. This confirms the lint is active and no violations exist.
- [ ] Create equivalent clippy invocation tests for `devs-scheduler`, `devs-grpc`, `devs-mcp`, and `devs-webhook` crates, since these are the async crates that use locks.
- [ ] Write a grep-based test script `tools/check_lock_guard_await.sh` that searches for patterns where a `MutexGuard`, `RwLockReadGuard`, or `RwLockWriteGuard` from `std::sync` is assigned to a variable and an `.await` appears before the variable is dropped or the scope ends. The script should exit non-zero if any suspicious patterns are found. Pattern: `let.*guard.*=.*lock\(\)` followed by `.await` before `drop(guard)` or `}`.
- [ ] Add a unit test `test_scoped_lock_pattern()` in `crates/devs-scheduler/tests/concurrency.rs` demonstrating the correct pattern: acquire lock, clone/extract data, drop guard (explicitly or via scope), then `.await`.

## 2. Task Implementation
- [ ] Add `#![deny(clippy::await_holding_lock)]` to the `lib.rs` or `main.rs` of every async crate: `devs-server`, `devs-scheduler`, `devs-grpc`, `devs-mcp`, `devs-webhook`.
- [ ] Audit all `Arc<RwLock<...>>` and `Arc<Mutex<...>>` usage across the workspace. For each lock acquisition in an async context, ensure the guard is dropped before any `.await` by using one of: (a) explicit `drop(guard)`, (b) a `{ }` scope block, or (c) extracting the needed data via `.clone()` before the await.
- [ ] If any lock must be held across an `.await` (e.g., for atomicity), replace `std::sync::Mutex` with `tokio::sync::Mutex` or `std::sync::RwLock` with `tokio::sync::RwLock` for that specific usage.
- [ ] Add `tools/check_lock_guard_await.sh` to the `./do lint` pipeline so it runs on every presubmit.
- [ ] Ensure `#![forbid(clippy::allow_attributes)]` or equivalent prevents any `#[allow(clippy::await_holding_lock)]` suppression without a documented justification.

## 3. Code Review
- [ ] Verify every `std::sync` lock guard in async code is scoped to a block that completes before any `.await`.
- [ ] Verify no `#[allow(clippy::await_holding_lock)]` attributes exist anywhere in the workspace.
- [ ] Confirm `tokio::sync` locks are used only where genuinely needed (holding across `.await`), not as a default replacement.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo clippy --workspace -- -D clippy::await_holding_lock` and confirm exit code 0.
- [ ] Run `./do lint` and confirm it passes.
- [ ] Run `./do test` and confirm no deadlocks or test hangs.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-416` comments to the clippy deny attribute and to each lock audit test.

## 6. Automated Verification
- [ ] Run `grep -rn 'allow.*await_holding_lock' crates/` and verify zero matches.
- [ ] Run `cargo clippy --workspace -- -D clippy::await_holding_lock 2>&1` and confirm clean output with exit code 0.
