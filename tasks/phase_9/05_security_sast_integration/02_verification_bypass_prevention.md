# Task: Mitigate Verification Bypass (Fake Tests) (Sub-Epic: 05_Security & SAST Integration)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-THR-004]

## 1. Initial Test Written
- [ ] Write unit tests in `tests/core/agents/reviewer_agent.test.ts` that simulate an agent submitting a "fake" test (e.g., one containing `expect(true).toBe(true)` or no actual function invocations).
- [ ] Assert that the `ReviewerAgent`'s validation logic correctly parses the test file's AST (Abstract Syntax Tree) or uses its LLM prompt to flag the test as insufficient and reject the task.

## 2. Task Implementation
- [ ] Update the `ReviewerAgent` prompt in `src/core/agents/reviewer_agent.ts` with the "Hostile Auditor" directives. Explicitly instruct the agent to evaluate the quality and relevance of the test assertions against the implementation code.
- [ ] Implement an AST parser utility `src/utils/test_validator.ts` that scans submitted `*.test.ts` files to ensure they actually import and invoke functions from the modified implementation files.
- [ ] Integrate this utility into the ReviewNode of the LangGraph state machine. If the AST validator fails (i.e., no relevant imports or calls detected), automatically reject the commit without wasting tokens on an LLM API call.

## 3. Code Review
- [ ] Ensure `test_validator.ts` uses an established parser (like `typescript` or `@babel/parser`) and is robust against common fake test patterns.
- [ ] Verify that the rejection message clearly states why the test was rejected ("Verification Bypass Detected: Test does not execute target module") so the Developer Agent can correct its behavior.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test:unit tests/core/agents/reviewer_agent.test.ts` to confirm the fake test rejection works.
- [ ] Execute `npm run test:unit tests/utils/test_validator.test.ts` to verify AST parsing accuracy on various fake and real test fixtures.

## 5. Update Documentation
- [ ] Document the Verification Bypass mitigation strategy in the `.agent/security_guidelines.md` to inform future Developer Agents that they cannot fake their test coverage.

## 6. Automated Verification
- [ ] Run a CLI script `node scripts/validate_bypass.js` that passes a known bad test file (`fake_test.ts`) into the `test_validator.ts` utility.
- [ ] Ensure the script exits with a non-zero status code and prints the exact "Verification Bypass Detected" error message to stdout.