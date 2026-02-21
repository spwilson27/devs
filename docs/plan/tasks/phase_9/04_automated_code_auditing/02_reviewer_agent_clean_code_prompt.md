# Task: Implement Reviewer Agent Clean Code Prompt (Sub-Epic: 04_Automated Code Auditing)

## Covered Requirements
- [8_RISKS-REQ-067]

## 1. Initial Test Written
- [ ] Write a test in `tests/agents/ReviewerAgentPrompt.test.ts` mocking the LLM API call for the Reviewer Agent.
- [ ] Create a mock implementation payload containing "Spaghetti code", global state mutation, and a lack of proper abstraction.
- [ ] Assert that the Reviewer Agent correctly identifies the anti-patterns according to standard community SOLID principles and returns a structured rejection reason explaining the "Clean Code" violations.

## 2. Task Implementation
- [ ] Create or update the `ReviewerAgent` prompt generation in `src/agents/reviewer/prompt.ts`.
- [ ] Integrate a specific "Idiomatic Pattern Enforcement" section into the system prompt that explicitly mandates adherence to SOLID, Clean Architecture, DRY, and explicit typing.
- [ ] Update the Reviewer Agent response schema to include `idiomatic_compliance_score` and `clean_code_feedback`.
- [ ] Hook the prompt into the LangGraph node for the Reviewer, ensuring the new instructions are always injected as context before the Reviewer analyzes the git diff or file changes.

## 3. Code Review
- [ ] Check the prompt modifications. Are they concise and authoritative without being overly token-heavy?
- [ ] Make sure the reviewer response schema updates are backward-compatible with the rest of the orchestration logic.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- ReviewerAgentPrompt.test.ts` to ensure the new prompt successfully blocks poorly architected code.
- [ ] Run existing integration tests to ensure that clean, well-architected code still passes the Reviewer Agent.

## 5. Update Documentation
- [ ] Update the `Agent-Oriented Documentation` (`.agent.md`) for the Reviewer Agent to clarify its new role as a Clean Code enforce.

## 6. Automated Verification
- [ ] Check `ReviewerAgentPrompt.test.ts` runs and the test suite maintains 100% coverage on the new parsing logic for `clean_code_feedback`.