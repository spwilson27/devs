# Task: Integrate AOD Auditor with ReviewerAgent and Gates (Sub-Epic: 07_Documentation Auditing (AOD))

## Covered Requirements
- [1_PRD-REQ-MET-007], [8_RISKS-REQ-061]

## 1. Initial Test Written
- [ ] Write an integration test in `tests/integration/agents/ReviewerAgent.test.ts`.
- [ ] Mock the LangGraph context where a DeveloperAgent has just submitted a commit.
- [ ] Set up the mocked environment to have a failing AOD density (e.g., modified a logic file but didn't update/add its `.agent.md`).
- [ ] Assert that the `ReviewerAgent` invokes the `AOD_Auditor`, receives a failed `AuditResult`, and forces the state machine back to the `DeveloperAgent` with an "AOD Audit Failed" reason.

## 2. Task Implementation
- [ ] Open the `ReviewerAgent` implementation (e.g., `src/agents/ReviewerAgent.ts`).
- [ ] Import and instantiate the `AOD_Auditor` during the `ReviewNode` or `Regression Audit` phase of the agent's LangGraph turn.
- [ ] Execute `AODAuditor.verifyDensity()` and `AODAuditor.verifyContent()` on the workspace.
- [ ] Modify the Reviewer's evaluation logic: if `AuditResult.passed` is false, the Reviewer MUST block the task completion.
- [ ] Format the `missingAODs` and `invalidAODs` into a structured critique string that is fed back to the Developer agent to fix the documentation.

## 3. Code Review
- [ ] Ensure that the AOD validation is performed *after* standard test validation to prioritize functional correctness over documentation density in the feedback loop.
- [ ] Verify that the agent prompt instructions are explicitly updated to instruct the Reviewer to perform the AOD check.
- [ ] Ensure the integration does not bypass any existing security gates.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:integration -- ReviewerAgent.test.ts` to verify the state transitions correctly block on AOD failure.

## 5. Update Documentation
- [ ] Update `docs/architecture/state_machine.md` or equivalent documentation to show the new AOD Audit gate within the ReviewNode.
- [ ] Update `src/agents/.agent.md` to reflect the newly integrated auditing capability of the ReviewerAgent.

## 6. Automated Verification
- [ ] Execute `npm run test:verify -- ReviewerAgent.test.ts --json`.
- [ ] Manually simulate a workflow via `devs run` (headless) with a missing `.agent.md` and parse the output JSON to ensure the `ReviewerAgent` rejects the commit.
