# Task: Verify Explicit PTY Requirement Failure (Sub-Epic: 14_Risk 002 Verification)

## Covered Requirements
- [RISK-002-BR-004]

## Dependencies
- depends_on: ["02_pty_fallback_behavior.md"]
- shared_components: [devs-adapters, devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Create an E2E test in `tests/e2e/pty_failure_test.rs` that starts a `devs-server` on a platform where PTY is simulated as unavailable.
- [ ] Submit a workflow run with a stage that has `pty = true` explicitly set in the `[[stage]]` definition.
- [ ] Verify that the stage transitions directly to `Failed`.
- [ ] Assert that the `failure_reason` is `"pty_unavailable"`.
- [ ] Verify that the stage is NOT automatically retried by the scheduler.

## 2. Task Implementation
- [ ] Update `devs-scheduler` or `devs-adapters` to distinguish between "default PTY" and "explicitly requested PTY".
- [ ] In `devs-adapters`, if `pty = true` is explicitly requested but `PTY_AVAILABLE` is false, return an error indicating `PtyUnavailable`.
- [ ] Ensure `devs-scheduler` correctly handles `PtyUnavailable` by setting the stage status to `Failed` and marking it as non-retryable (consistent with [3_PRD-BR-022]).

## 3. Code Review
- [ ] Verify that the `pty_unavailable` failure reason is correctly stored in the run state and checkpoint file.
- [ ] Check that no attempt to spawn the subprocess is made once the PTY failure is detected for an explicit request.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test pty_failure_test`.
- [ ] Run `./do test` and `./do coverage` to confirm the new failure path is covered.

## 5. Update Documentation
- [ ] Update `docs/plan/requirements/8_risks_mitigation.md` status for `RISK-002` if appropriate (though this might be automated).

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to confirm [RISK-002-BR-004] is covered.
