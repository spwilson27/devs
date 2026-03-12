# Task: Implement `ServerHandle` Safe Shutdown Implementation (Sub-Epic: 33_Risk 011 Verification)

## Covered Requirements
- [RISK-011-BR-002], [MIT-011]

## Dependencies
- depends_on: [none]
- shared_components: [devs-grpc]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-grpc/src/test_util.rs` (or appropriate test utility file) that:
    - Spawns a dummy process (e.g., `sleep 100`) and wraps it in a `ServerHandle`.
    - Captures the `PID` of the dummy process.
    - Drops the `ServerHandle`.
    - Asserts that the process is no longer running.
- [ ] Create an integration test that:
    - Spawns a `ServerHandle` for a dummy process that ignores `SIGTERM`.
    - Drops the `ServerHandle`.
    - Measures the time elapsed; it should be at least 10 seconds before it returns.
    - Asserts that the process was eventually killed with `SIGKILL`.

## 2. Task Implementation
- [ ] In `devs-grpc/src/test_util.rs` (or equivalent), implement `Drop` for `ServerHandle`:
    - Send `SIGTERM` to the server process (`nix::sys::signal::kill(pid, Signal::SIGTERM)` or similar).
    - Use a polling loop or `std::process::Child::try_wait` with a timeout to wait up to 10 seconds.
    - If the process has not exited after 10 seconds, send `SIGKILL`.
    - Block the `drop()` call until the process has definitely exited (e.g., via `wait()`).
- [ ] Ensure `ServerHandle` holds the `Child` handle or equivalent to perform these operations.

## 3. Code Review
- [ ] Verify that `ServerHandle` uses a robust method for process termination that works on Linux (SIGTERM/SIGKILL).
- [ ] Ensure that the `drop` implementation does not panic if the process is already dead.
- [ ] Confirm that `10 seconds` is exactly the timeout used before sending `SIGKILL`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-grpc --lib test_util` to verify the `drop` behavior.
- [ ] Run all related integration tests.

## 5. Update Documentation
- [ ] Update `devs-grpc` README.md to document the `ServerHandle`'s safe shutdown contract.

## 6. Automated Verification
- [ ] Verify the implementation via `./do test` to ensure it passes all unit and integration tests.
- [ ] Check `devs-grpc` source for `SIGTERM` and `SIGKILL` usage with the specified 10s timeout.
