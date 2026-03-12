# Task: Implement PTY Capability Probe and Global Flag (Sub-Epic: 13_Risk 001 Verification)

## Covered Requirements
- [RISK-002], [RISK-002-BR-001]

## Dependencies
- depends_on: [none]
- shared_components: [devs-adapters]

## 1. Initial Test Written
- [ ] In `crates/devs-adapters/src/pty_probe.rs`, write a unit test `test_pty_probe_once` that calls the probe multiple times.
- [ ] Mock `tokio::task::spawn_blocking` or the internal `portable_pty` call to track the number of actual probe executions.
- [ ] Assert that the probe is executed exactly once, even if called multiple times or from different threads.
- [ ] Verify the test fails.

## 2. Task Implementation
- [ ] Define a process-global `static PTY_AVAILABLE: AtomicBool = AtomicBool::new(false)` in `devs-adapters`.
- [ ] Define a process-global `static PROBE_EXECUTED: AtomicBool = AtomicBool::new(false)` to ensure single execution.
- [ ] Implement the `probe_pty_capability` function using `tokio::task::spawn_blocking` as required by [RISK-002-BR-001].
- [ ] Use `portable_pty::native_pty_system().openpty()` to perform the actual probe.
- [ ] Store the result in `PTY_AVAILABLE` and ensure it is never re-evaluated after the first call.
- [ ] Call `probe_pty_capability` during server initialization (e.g., in `main.rs`).

## 3. Code Review
- [ ] Verify the use of `tokio::task::spawn_blocking` to avoid blocking the async runtime during the probe.
- [ ] Confirm that `PTY_AVAILABLE` is a `static` and its visibility is appropriate (likely `pub(crate)` or `pub` within `devs-adapters`).
- [ ] Check that the probe implementation is robust against failures in `openpty()` (e.g., it should just set the flag to `false` on error).

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-adapters --test pty_probe`
- [ ] Ensure the test is annotated with `// Covers: RISK-002-BR-001`.

## 5. Update Documentation
- [ ] Update `docs/plan/requirements/8_risks_mitigation.md` to reflect that the PTY probe logic is implemented and tested.
- [ ] Add a comment to the `PTY_AVAILABLE` declaration explaining its importance for `RISK-002`.

## 6. Automated Verification
- [ ] Run `grep -r "PTY_AVAILABLE" crates/` to confirm its usage is centralized and not re-evaluated.
- [ ] Verify that the `portable-pty` dependency is correctly used in the probe.
