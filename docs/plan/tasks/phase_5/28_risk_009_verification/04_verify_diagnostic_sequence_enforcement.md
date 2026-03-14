# Task: Verify Diagnostic Sequence in SelfHostingAttempt (Sub-Epic: 28_Risk 009 Verification)

## Covered Requirements
- [RISK-009-BR-005]

## Dependencies
- depends_on: []
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a new Python test file `.tools/tests/test_diagnostic_sequence.py`.
- [ ] Mock a failure in a `SelfHostingAttempt` (e.g., by creating a checkpoint with `Failed` stage).
- [ ] Assert that a simulated audit tool (to be implemented) fails if there is no evidence of `get_stage_output` and `stream_logs` MCP calls after the failure but before the next commit.
- [ ] Assert that it passes if the calls were made and recorded in the audit trace or agent's log.

## 2. Task Implementation
- [ ] Implement a tool in `.tools/` that can parse the agent's action history (if stored in `.devs/` checkpoints or project logs) or the gRPC audit log if enabled.
- [ ] The tool must specifically look for `get_stage_output` and `stream_logs` calls following a `Failed` or `TimedOut` event in a `SelfHostingAttempt`.
- [ ] Ensure that this requirement is communicated to the agent through its system instructions in Phase 5.
- [ ] Integrate this audit check into the final `Bootstrap Milestone` verification process.
- [ ] If no formal audit log exists, implement a check that requires the agent to commit a `DIAGNOSTIC.md` file (containing stage output and logs) before committing any code fix for a self-hosting failure.

## 3. Code Review
- [ ] Verify that the diagnostic check is not overly restrictive but enforces the mandatory sequence.
- [ ] Confirm that the diagnostic evidence is preserved in the repository history as required.
- [ ] Ensure that the diagnostic tools (`get_stage_output`, `stream_logs`) are correctly identified in the logs.

## 4. Run Automated Tests to Verify
- [ ] Execute `pytest .tools/tests/test_diagnostic_sequence.py` and ensure it passes.
- [ ] Manually simulate a failure and the required diagnostic steps, then run the audit tool to confirm it passes.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to emphasize the mandatory diagnostic sequence for self-hosting failures.
- [ ] Add a section on "Diagnostic Compliance" to the troubleshooting guide.

## 6. Automated Verification
- [ ] Verify the requirement `[RISK-009-BR-005]` is linked in the code using the traceability tool: `python3 .tools/verify_requirements.py --req RISK-009-BR-005`.
