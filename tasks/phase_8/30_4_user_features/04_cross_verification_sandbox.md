# Task: Cross-Verification Sandbox Integration (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-016]

## 1. Initial Test Written
- [ ] Create `src/core/agents/__tests__/reviewer_agent.test.ts`.
- [ ] Write a test `should initialize the ReviewerAgent with the Hostile Auditor system prompt`.
- [ ] Write a test `should execute verification tests in a completely separate SandboxProvider instance from the DeveloperAgent`.
- [ ] Write a test `should return a FAILED status and revert the implementation if the tests fail or if hardcoded secrets are detected`.

## 2. Task Implementation
- [ ] Create `ReviewerAgent.ts` extending the base agent class. Inject the strict `HOSTILE_AUDITOR_PROMPT` system instruction.
- [ ] In `src/core/orchestrator/LangGraphNodes.ts`, implement the `ReviewNode` logic.
- [ ] When transitioning from `CodeNode` (Green Phase) to `ReviewNode`, the orchestrator must provision a NEW, clean `SandboxProvider` container.
- [ ] The `ReviewerAgent` must pull the current file state, compile the project, and run the automated test suite within this new sandbox.
- [ ] If the tests pass and no anti-patterns are found, the `ReviewNode` returns a `VERIFIED` state, allowing progression to the `CommitNode`.
- [ ] If verification fails, the agent must generate a failure report, revert the specific file changes using `git checkout -- <files>`, and transition the graph back to the `PlanNode` or `CodeNode` with the failure context.

## 3. Code Review
- [ ] Ensure that the `ReviewerAgent` cannot access the `DeveloperAgent`'s sandbox to guarantee true environment isolation.
- [ ] Verify that the `ReviewerAgent` is strictly read-only regarding file modifications, except for executing `git revert`/`checkout` on failure.
- [ ] Confirm that the LangGraph state machine handles the cyclical transition from `ReviewNode` back to `CodeNode` correctly.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:unit -- src/core/agents/__tests__/reviewer_agent.test.ts` and confirm passing.
- [ ] Run the LangGraph state machine integration tests to verify the `CodeNode` -> `ReviewNode` -> `CommitNode` path.

## 5. Update Documentation
- [ ] Document the `ReviewNode` lifecycle in `docs/architecture/langgraph_orchestration.md`.
- [ ] Add the `HOSTILE_AUDITOR_PROMPT` details to `docs/agents/prompts.md`.

## 6. Automated Verification
- [ ] Execute an automated integration script `scripts/verify_cross_agent_isolation.ts` that mocks a successful developer implementation and ensures the Reviewer agent sandbox is spawned with zero shared memory from the developer sandbox.
