# Task: Create ReviewerAgent Class and Hostile Auditor Prompt (Sub-Epic: 01_Reviewer Agent Core Initialization)

## Covered Requirements
- [9_ROADMAP-REQ-013], [8_RISKS-REQ-096]

## 1. Initial Test Written
- [ ] Create a new unit test file `tests/agents/reviewer_agent.test.ts`.
- [ ] Write a test verifying that `ReviewerAgent` can be instantiated and inherently extends the base agent interface/class.
- [ ] Write a test verifying that the `ReviewerAgent` correctly loads and formats the "Hostile Auditor" system prompt, ensuring the prompt string contains key phrases like "hostile auditor" and "strict verification".
- [ ] Write a test ensuring that the `ReviewerAgent` instance is strictly separated from the implementation agent's state (e.g. they don't share memory instances by default).

## 2. Task Implementation
- [ ] Create `src/agents/ReviewerAgent.ts`.
- [ ] Implement the `ReviewerAgent` class. It should accept configuration dependencies like the LLM client, structured output schema parser, and a read-only view of the current task state.
- [ ] Define the `HOSTILE_AUDITOR_PROMPT` constant in `src/prompts/reviewer_prompts.ts` instructing the LLM to act as a relentless, unforgiving code reviewer focused on ensuring the implementation matches the exact requirements without hallucinations.
- [ ] Implement a `verify(implementationData: ImplementationResult): Promise<ReviewResult>` method on the agent that formats the prompt with the implementation data and calls the underlying LLM.

## 3. Code Review
- [ ] Verify the "Hostile Auditor" prompt is clear, unambiguous, and explicitly tells the LLM not to write code but only to review.
- [ ] Ensure that `ReviewerAgent` does not maintain persistent state across different task reviews (it must be stateless between invocations).
- [ ] Check that `ReviewerAgent.ts` adheres to strict TypeScript typing and the project's dependency injection patterns.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/agents/reviewer_agent.test.ts` (or equivalent test command) and confirm all new tests pass.

## 5. Update Documentation
- [ ] Update `.agent/agents.md` to include a section on the `ReviewerAgent`, explaining its "Hostile Auditor" role and initialization parameters.

## 6. Automated Verification
- [ ] Run a custom script or CLI check (e.g., `npx ts-node scripts/verify_reviewer_agent_init.ts`) that instantiates the agent and logs its rendered system prompt, or simply verify the CI test output logs confirming 100% pass rate.
