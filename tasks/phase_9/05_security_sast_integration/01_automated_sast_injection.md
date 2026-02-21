# Task: Implement Automated SAST Injection in Review Node (Sub-Epic: 05_Security & SAST Integration)

## Covered Requirements
- [8_RISKS-REQ-026]

## 1. Initial Test Written
- [ ] Write a unit test suite in `tests/core/orchestrator/sast_orchestrator.test.ts` to mock `SandboxProvider` and simulate running a static analysis tool (`eslint-plugin-security`).
- [ ] Ensure tests cover scenarios where the SAST tool returns cleanly (exit code 0), and when it detects a high/critical vulnerability (non-zero exit code).
- [ ] Write an integration test that passes a mock JavaScript file containing a hardcoded secret to verify the SAST orchestration pipeline flags it and constructs a failure report.

## 2. Task Implementation
- [ ] Create `SAST_Orchestrator` class in `src/core/orchestrator/sast_orchestrator.ts`.
- [ ] Implement `run_sast_scans` method which connects to the active `SandboxProvider`.
- [ ] Configure the implementation to dynamically inject and run the project's designated SAST tools (e.g., `npx eslint --ext .ts src/ --plugin security --rule 'security/detect-possible-timing-attacks: error'`) during the ReviewNode validation step.
- [ ] Return structured results (Pass/Fail) along with the parsed CLI output to the `ReviewerAgent` context window.

## 3. Code Review
- [ ] Verify the `SAST_Orchestrator` does not hard-fail the entire orchestrator process on vulnerabilities, but gracefully catches the error and surfaces it to the LangGraph state.
- [ ] Ensure that dependency installation of SAST tools (if injected at runtime) respects the Network Egress whitelist.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:unit tests/core/orchestrator/sast_orchestrator.test.ts` to verify the module logic.
- [ ] Run `npm run lint` and `tsc --noEmit` to ensure the new class adheres to strict typing and formatting.

## 5. Update Documentation
- [ ] Update `docs/architecture/09_reviewer_agent.md` (or equivalent AOD) to detail how the `SAST_Orchestrator` integrates into the validation cycle.
- [ ] Add the newly created class to the project's module dependency diagram in the memory/documentation layer.

## 6. Automated Verification
- [ ] Create a dummy file `src/temp/vulnerable.js` containing `eval(req.query.cmd)`.
- [ ] Run a test script that triggers the `SAST_Orchestrator` against this file.
- [ ] Assert that the returned output object contains a 'Fail' status and explicitly mentions the detected vulnerability rule (e.g., `detect-eval-with-expression`).