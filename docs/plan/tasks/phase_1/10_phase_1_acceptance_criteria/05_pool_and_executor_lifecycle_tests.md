# Task: Pool and Executor Lifecycle Tests (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [AC-ROAD-P1-006], [AC-ROAD-P1-008]

## Dependencies
- depends_on: [01_phase_0_dependency_verification.md]
- shared_components: [devs-pool, devs-executor]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-pool` that attempts to load a pool configuration where all agents have `tool = "claude"`.
- [ ] The test must assert that the configuration is rejected at config load with an error naming `"claude"` as the only provider.
- [ ] Create a unit test in `devs-executor` that exercises a stage execution where the agent process exits with code 1.
- [ ] The test must assert that the `cleanup()` method is still called and that the working directory is confirmed absent after the call.

## 2. Task Implementation
- [ ] In `devs-pool` (or the common config loader), implement a provider diversity check.
- [ ] Ensure that a pool must have agents from more than one provider (e.g., at least one non-fallback or at least two different tools).
- [ ] In `devs-executor`, wrap the stage execution logic in a `finally`-like block or a drop guard that ensures `cleanup()` is called regardless of the process outcome.
- [ ] Implement the test for `cleanup()` by creating a temporary directory and ensuring it is deleted even after a process failure.

## 3. Code Review
- [ ] Confirm that `devs-executor` cleanup logic is robust and logs failures at `WARN` level.
- [ ] Verify that the pool provider diversity check produces a clear and actionable error message.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool`.
- [ ] Run `cargo test -p devs-executor`.
- [ ] Confirm that both new tests pass.

## 5. Update Documentation
- [ ] Document the provider diversity requirement in the `devs.toml` configuration guide.
- [ ] Update `devs-executor` documentation to reflect the guaranteed cleanup invariant.

## 6. Automated Verification
- [ ] Run the traceability scanner and confirm `AC-ROAD-P1-006` and `AC-ROAD-P1-008` are mapped to these tests.
- [ ] Confirm that `cargo llvm-cov` shows coverage of the cleanup block.
