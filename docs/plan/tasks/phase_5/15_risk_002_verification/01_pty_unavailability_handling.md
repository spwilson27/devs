# Task: PTY Availability Handling and Windows CI Verification (Sub-Epic: 15_Risk 002 Verification)

## Covered Requirements
- [AC-RISK-002-03], [AC-RISK-002-04]

## Dependencies
- depends_on: [none]
- shared_components: [devs-adapters, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-adapters` that mocks a PTY-unavailable environment.
- [ ] The test should verify that when `pty = true` is requested and PTY is unavailable, the adapter returns an error variant specifically indicating PTY unavailability.
- [ ] Create an integration test in `devs-core` (or `devs-scheduler`) that simulates a stage with `pty = true` on a PTY-unavailable system.
- [ ] Verify that the stage transitions to `Failed` with `failure_reason: "pty_unavailable"`.
- [ ] Verify that the `devs-scheduler` does NOT attempt to retry the stage despite any retry policy, as this is a terminal configuration failure.

## 2. Task Implementation
- [ ] Update `devs-adapters` to implement a PTY availability check. This may involve attempting to open `/dev/ptmx` on Unix or checking for ConPTY support on Windows.
- [ ] Modify the `AgentAdapter::spawn` implementation to perform this check if `pty` is enabled in the stage configuration.
- [ ] Define a new error variant `AdapterError::PtyUnavailable` in `devs-adapters`.
- [ ] Update the `devs-core` StateMachine and `devs-scheduler` dispatch logic to handle `AdapterError::PtyUnavailable`.
- [ ] Map this error to `StageFailureReason::PtyUnavailable` and ensure the run state machine treats this as a non-retryable terminal failure.
- [ ] Ensure the CI configuration for `presubmit-windows` is updated or verified to handle PTY-related stages correctly, potentially by ensuring necessary features or permissions are present or that the code correctly detects PTY absence.

## 3. Code Review
- [ ] Verify that PTY detection is robust across different target platforms (Linux, macOS, Windows).
- [ ] Ensure that the "no-retry" logic for `pty_unavailable` is explicitly handled in the scheduler's retry policy evaluator.
- [ ] Verify that the `failure_reason` string matches the requirement `failure_reason: "pty_unavailable"`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` to verify PTY detection logic.
- [ ] Run `cargo test -p devs-core` and `cargo test -p devs-scheduler` to verify failure state transitions and retry suppression.
- [ ] Trigger a CI run on a Windows runner (if available in the dev environment) to verify `presubmit-windows` passes.

## 5. Update Documentation
- [ ] Document the `pty_unavailable` failure reason in the user-facing stage configuration documentation.
- [ ] Update the internal "Risk Mitigation" status for RISK-002.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all PTY-related tests pass.
- [ ] Run `.tools/verify_requirements.py` to ensure `AC-RISK-002-03` and `AC-RISK-002-04` are correctly mapped and verified.
