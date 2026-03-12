# Task: Async Concurrency and Lock Order Policies (Sub-Epic: 019_Foundational Technical Requirements (Part 10))

## Covered Requirements
- [2_TAS-REQ-002M], [2_TAS-REQ-002P]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a shell script `tools/verify_concurrency_policies.sh` that checks for prohibited `std::sync` lock usage in `crates/` directory:
  - Check for `std::sync::Mutex` and `std::sync::RwLock` usage in `.rs` files that contain `.await`.
  - Check for `Arc<tokio::sync::RwLock<T>>` or `Arc<tokio::sync::Mutex<T>>` usage in `devs-core`.
- [ ] Create a unit test `crates/devs-core/src/concurrency/test_lock_order.rs` that verifies a manual lock order assertion if possible, or documented expected acquisition order.

## 2. Task Implementation
- [ ] Create `CONTRIBUTING.md` (or update it if it exists) with a section "Concurrency and State Management":
  - Document the mandatory use of `Arc<tokio::sync::RwLock<T>>` for read-heavy state and `Arc<tokio::sync::Mutex<T>>` for write-heavy state.
  - Explicitly state that `std::sync::Mutex` and `std::sync::RwLock` MUST NOT be held across `.await` points.
  - Define the authoritative global lock acquisition order: `SchedulerState` → `PoolState` → `CheckpointStore`.
- [ ] Update workspace `Cargo.toml` or `clippy.toml` to include `clippy::await_holding_lock` if not already enabled (it's part of `clippy::pedantic` or `clippy::complexity`).
- [ ] Add a `check_lock_usage` subcommand to the `./do lint` script (or integrate into existing lint) that runs the `verify_concurrency_policies.sh`.
- [ ] Integrate these policies into the `devs-core` `lib.rs` as module-level documentation to ensure agents see it during development.

## 3. Code Review
- [ ] Verify that the lock order is consistently documented in all relevant component READMEs (`devs-scheduler`, `devs-pool`, `devs-checkpoint`).
- [ ] Ensure that `clippy` is configured to catch `std::sync` locks held across `.await` points.
- [ ] Check that `CONTRIBUTING.md` clearly explains the rationale for the lock order.

## 4. Run Automated Tests to Verify
- [ ] Run `./tools/verify_concurrency_policies.sh` and ensure it doesn't find violations in the current (minimal) codebase.
- [ ] Run `./do lint` and ensure it passes.

## 5. Update Documentation
- [ ] Ensure the project's root `README.md` or `CONTRIBUTING.md` is updated with these technical standards.

## 6. Automated Verification
- [ ] Run `grep -r "SchedulerState → PoolState → CheckpointStore" CONTRIBUTING.md` to ensure the lock order is documented.
- [ ] Run `grep -r "2_TAS-REQ-002M" CONTRIBUTING.md` and `grep -r "2_TAS-REQ-002P" CONTRIBUTING.md` for traceability.
