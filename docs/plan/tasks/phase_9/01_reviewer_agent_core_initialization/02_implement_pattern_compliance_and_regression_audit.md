# Task: Implement Regression Audit and Pattern Compliance (Sub-Epic: 01_Reviewer Agent Core Initialization)

## Covered Requirements
- [9_ROADMAP-TAS-603]

## 1. Initial Test Written
- [ ] Create `tests/agents/reviewer_agent_compliance.test.ts`.
- [ ] Write a test to mock a TAS (Technical Architecture Specification) document and feed it to the `ReviewerAgent`. Verify the agent rejects code that violates the mocked TAS patterns (e.g., rejecting an architectural violation).
- [ ] Write a test for the "Regression Audit" logic. Provide mock test results where an existing test suite fails after a new implementation. The test should assert that the agent correctly parses the failure and returns a `REGRESSION_DETECTED` review status.
- [ ] Write a test where all existing tests pass and TAS is respected, ensuring the agent returns a `PASS` status.

## 2. Task Implementation
- [ ] Update `src/agents/ReviewerAgent.ts` and `src/prompts/reviewer_prompts.ts` to explicitly include a "TAS Pattern Compliance" section in the prompt evaluation. The agent must cross-reference the proposed code against the current TAS blueprint.
- [ ] Implement a `RegressionAuditor` utility or method inside the `ReviewerAgent` ecosystem that parses the output of the sandbox test runner.
- [ ] Update the `verify` method to mandate that `test_results.regression_run` is explicitly checked. If tests that previously passed now fail, it must enforce an immediate failure without LLM hallucination.

## 3. Code Review
- [ ] Ensure the regression audit logic relies on deterministic test runner outputs rather than LLM guesswork (the LLM should interpret the failure, but the failure status is hard-coded).
- [ ] Verify that TAS compliance checking does not bloat the prompt excessively; only relevant architectural constraints should be included.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/agents/reviewer_agent_compliance.test.ts` to ensure the agent correctly identifies regressions and architectural non-compliance.

## 5. Update Documentation
- [ ] Update `docs/architecture/reviewer_agent.md` (or `.agent` equivalent) detailing how the regression audit parses test results and how TAS compliance is enforced in the prompt.

## 6. Automated Verification
- [ ] Provide a fixture implementation with a deliberate regression to the `devs` CLI or test harness and assert that the ReviewerAgent strictly blocks it with the appropriate error code.
