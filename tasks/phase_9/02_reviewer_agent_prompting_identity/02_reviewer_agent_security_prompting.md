# Task: Security-Focused Reviewer Prompt Implementation (Sub-Epic: 02_Reviewer Agent Prompting & Identity)

## Covered Requirements
- [8_RISKS-REQ-027]

## 1. Initial Test Written
- [ ] Create a test file `tests/unit/agents/reviewer/prompts/SecurityReview.test.ts`.
- [ ] Write a test that initializes a `ReviewerAgent` and passes it a simulated code block containing `eval("some code")`.
- [ ] Write a test that passes a simulated React component containing `dangerouslySetInnerHTML`.
- [ ] Write a test that passes simulated SQL code containing string concatenation instead of parameterized queries.
- [ ] Assert that the `ReviewerAgent` flags the code and returns a `SECURITY_VIOLATION` status for all three cases, even if functional tests pass.

## 2. Task Implementation
- [ ] Locate the `ReviewerAgent` system prompt template, likely in `src/agents/reviewer/prompts/reviewerPrompt.ts`.
- [ ] Append a dedicated "Security Audit" section to the reviewer's prompt.
- [ ] Explicitly instruct the LLM within the prompt to aggressively flag exact patterns: `eval()`, `dangerouslySetInnerHTML`, and raw SQL string interpolation.
- [ ] Define the response schema to include a `security_violations` array and a strict instruction to return `status: "REJECTED"` if any of these patterns are detected, irrespective of test outcomes.
- [ ] Update the `ReviewerAgent` parsing logic to correctly handle the `security_violations` array and bubble up the errors to the orchestrator.

## 3. Code Review
- [ ] Ensure the prompt additions use clear delimiters (e.g., `<security_rules>...</security_rules>`) to prevent prompt confusion.
- [ ] Verify that the rejection logic is absolute and cannot be overridden by other positive dimensions (like requirement fidelity).

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/unit/agents/reviewer/prompts/SecurityReview.test.ts`.
- [ ] Verify that the agent correctly parses the mock response and enforces the security rejections.

## 5. Update Documentation
- [ ] Update `docs/security/threat_model.md` to reflect that the Reviewer Agent now autonomously enforces dynamic security rule blocking.
- [ ] Add the prompt fragment to the `ReviewerAgent`'s `.agent.md` context file for future visibility.

## 6. Automated Verification
- [ ] Run a specialized lint rule script `npm run check-prompts` to statically ensure the strings `eval()`, `dangerouslySetInnerHTML`, and `parameterized queries` exist within the `reviewerPrompt.ts` file.
