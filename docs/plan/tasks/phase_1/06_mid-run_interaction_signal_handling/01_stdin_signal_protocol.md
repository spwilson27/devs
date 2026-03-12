# Task: Implement devs:cancel Stdin Signal and Termination Sequence (Sub-Epic: 06_Mid-Run Interaction & Signal Handling)

## Covered Requirements
- [1_PRD-REQ-017], [2_TAS-REQ-038]

## Dependencies
- depends_on: [none]
- shared_components: [devs-adapters]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-adapters/src/lib.rs` (or a relevant module) that mocks an agent subprocess.
- [ ] Verify that calling a `signal_cancel` method on the adapter results in the string `devs:cancel\n` being written to the child process's `stdin`.
- [ ] Create an integration test using `tokio::process` to verify that when the signal is sent, the subprocess receives it.
- [ ] Write a test for the termination sequence: verify that after sending `devs:cancel\n`, if the process doesn't exit within a 5-second grace period, `SIGTERM` (or `TerminateProcess` on Windows) is sent.
- [ ] Verify that if it still doesn't exit after another 5 seconds, `SIGKILL` is sent.

## 2. Task Implementation
- [ ] Add a `signal_cancel` method to the `AgentAdapter` trait.
- [ ] Implement `signal_cancel` for the base adapter logic (likely in a shared helper or trait default method) that writes `devs:cancel\n` to the `stdin` of the running process.
- [ ] Implement the termination orchestration logic (likely in the component that manages the subprocess lifecycle):
    - [ ] Send `devs:cancel\n` to `stdin`.
    - [ ] Wait for process exit with a 5s timeout using `tokio::time::timeout`.
    - [ ] On timeout, send `SIGTERM` (using `Child::kill` or platform-specific signals).
    - [ ] Wait again for 5s.
    - [ ] On second timeout, send `SIGKILL`.
- [ ] Ensure that `stdin` is piped correctly when spawning the agent to allow this communication.

## 3. Code Review
- [ ] Verify that the implementation uses `tokio::io::AsyncWriteExt::write_all` to ensure the signal is fully sent.
- [ ] Check that the termination sequence correctly handles processes that exit early during the grace periods.
- [ ] Ensure platform-specific signal handling (SIGTERM vs SIGKILL) is abstracted correctly or uses `tokio`'s cross-platform `kill()`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` to verify the signal sending and termination sequence.

## 5. Update Documentation
- [ ] Document the `devs:cancel\n` protocol in the `devs-adapters` crate-level documentation.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure no regressions and that traceability annotations are correct.
