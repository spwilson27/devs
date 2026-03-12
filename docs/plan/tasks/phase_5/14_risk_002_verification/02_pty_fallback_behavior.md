# Task: Verify PTY Fallback and Warning on Allocation Failure (Sub-Epic: 14_Risk 002 Verification)

## Covered Requirements
- [AC-RISK-002-01], [MIT-002]

## Dependencies
- depends_on: [01_mcp_pty_active_field.md]
- shared_components: [devs-adapters, devs-pool, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-adapters/tests/pty_fallback_test.rs` that simulates a PTY allocation failure.
- [ ] The test must configure an agent pool with an agent that has PTY enabled by default (configured = true).
- [ ] Use a mock PTY allocator that returns an error during the spawn attempt.
- [ ] Dispatch a stage using that agent.
- [ ] Verify that the agent is spawned successfully without PTY.
- [ ] Check the logs for a structured `WARN` with `event_type: "adapter.pty_fallback"`.

## 2. Task Implementation
- [ ] Ensure `PTY_AVAILABLE` static probe correctly reflects the system's PTY capability.
- [ ] Update `devs-adapters`'s `spawn` logic to check `PTY_AVAILABLE` before attempting PTY allocation.
- [ ] If `PTY_AVAILABLE` is false and PTY is requested by default (not explicitly), log the structured `WARN` message.
- [ ] Ensure the agent is spawned normally (non-PTY) and the stage completes.

## 3. Code Review
- [ ] Verify that the `adapter.pty_fallback` warning includes the `tool` name.
- [ ] Check that the PTY probe is performed exactly once at server startup (RISK-002-BR-001 behavior, though not in the list, it's good practice).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters --test pty_fallback_test`.
- [ ] Run `./do lint` to ensure no `// TODO: BOOTSTRAP-STUB` remains in the PTY logic.

## 5. Update Documentation
- [ ] Update the `devs` server manual to document the PTY fallback behavior on non-Unix systems (like Windows).

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to confirm [AC-RISK-002-01] and [MIT-002] are covered.
