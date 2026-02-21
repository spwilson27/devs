# Task: Implement Anti-Pattern and Security Flaw Detection (Sub-Epic: 01_Reviewer Agent Core Initialization)

## Covered Requirements
- [1_PRD-REQ-NEED-ARCH-03]

## 1. Initial Test Written
- [ ] Create `tests/agents/reviewer_agent_security.test.ts`.
- [ ] Write a test where a code snippet containing a hardcoded API key (e.g., `const apiKey = 'sk-12345';`) is submitted to the `ReviewerAgent`. Assert that the agent rejects the code with a security violation.
- [ ] Write a test where a code snippet contains a deliberate anti-pattern (e.g., using `eval()` or mutating global state). Assert the agent rejects the code and identifies the specific anti-pattern.
- [ ] Write a test with clean, idiomatic code to ensure there are no false positives for security flaws.

## 2. Task Implementation
- [ ] Augment the structured output schema for the `ReviewerAgent` to include `security_violations` (array of strings) and `anti_patterns_detected` (array of strings).
- [ ] Update `src/prompts/reviewer_prompts.ts` to include a dedicated "Security & Anti-Pattern Audit" section. This must instruct the LLM to search for common vulnerabilities (e.g., injection flaws, unhandled promises, raw secrets) and deviations from clean code principles.
- [ ] Modify the `verify` method in `src/agents/ReviewerAgent.ts` so that if `security_violations.length > 0` or `anti_patterns_detected.length > 0`, the overall task is forcibly failed, regardless of whether the tests pass.

## 3. Code Review
- [ ] Check that the structured output strictly types the violation reports to ensure the orchestrator can predictably parse the agent's failure reasoning.
- [ ] Verify the prompt instructions clearly distinguish between minor style nits (which might be warnings) and explicit anti-patterns/security flaws (which must be blockers).

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/agents/reviewer_agent_security.test.ts` to ensure the security and anti-pattern blocking logic correctly fires.

## 5. Update Documentation
- [ ] Update the `ReviewerAgent` documentation to list the specific security flaws and anti-patterns it is designed to catch during the `ReviewNode` phase.

## 6. Automated Verification
- [ ] Run an automated test script that feeds a known "Trojan Requirement" or vulnerable implementation block into the ReviewerAgent and verify the exit code is non-zero (blocked).
