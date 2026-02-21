# Task: Implement RCA Analyzer Turn (Sub-Epic: 09_Root Cause Analysis (RCA) & Debugging)

## Covered Requirements
- [3_MCP-TAS-096]

## 1. Initial Test Written
- [ ] Create a unit test suite in `tests/core/orchestrator/RCATurn.test.ts`.
- [ ] Write a mock `ReviewerAgent` instance using a Gemini 3 Pro mock provider.
- [ ] Mock `agent_logs` reflecting a "Dependency Conflict" and a "Sandbox Permission Denied" scenario.
- [ ] Write a test asserting that `RCATurn.analyze(logs, suspendedSandbox)` correctly identifies the root cause and outputs a strongly typed `RCA_REPORT` enum (e.g., `DEPENDENCY_CONFLICT`).

## 2. Task Implementation
- [ ] Implement `RCATurn` class in `src/core/orchestrator/RCATurn.ts`.
- [ ] Integrate Gemini 3 Pro to ingest `agent_logs` and query the suspended sandbox state.
- [ ] Develop prompt templates specifically tuned for root cause identification based on common failure modes (Ambiguous PRD, Sandbox Errors, Dependency Conflicts).
- [ ] Map the LLM output to a structured JSON schema validating the identified root cause.

## 3. Code Review
- [ ] Ensure the prompt explicitly instructs the LLM not to guess but to rely purely on the provided `agent_logs` and sandbox state.
- [ ] Validate that the LLM response is wrapped in a `try-catch` with a fallback root cause of `UNKNOWN_ERROR` if parsing fails.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/core/orchestrator/RCATurn.test.ts`.
- [ ] Verify that all mocked failure scenarios are accurately categorized by the `RCATurn` implementation.

## 5. Update Documentation
- [ ] Update `docs/architecture/RCATurn.md` detailing the schema of the `RCA_REPORT` object and the supported failure modes.
- [ ] Update `.agent.md` to inform future developer agents on how to trigger an RCA turn manually during debugging.

## 6. Automated Verification
- [ ] Execute `npm run verify-rca-schema` to confirm the structured output aligns with the project's global SAOP JSON schema.
