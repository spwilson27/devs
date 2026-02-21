# Task: Implement Logic Anomaly Alerts via Long-Term Memory (Sub-Epic: 05_Security & SAST Integration)

## Covered Requirements
- [8_RISKS-REQ-039]

## 1. Initial Test Written
- [ ] Write a test in `tests/core/agents/anomaly_detector.test.ts` that mocks a Long-Term Memory (LanceDB) query returning a constraint: "Always use strict typing; `any` is forbidden."
- [ ] Pass an incoming user directive ("Just use `any` to bypass the type error for now") into the anomaly detector.
- [ ] Assert that the detector flags a contradiction and triggers a `CONFIRMATION_REQUIRED` state instead of proceeding.

## 2. Task Implementation
- [ ] Create a `LogicAnomalyDetector` service in `src/core/memory/anomaly_detector.ts`.
- [ ] Implement a method that extracts the semantic intent of the active Task or User Directive.
- [ ] Perform a vector search against the `LanceDB` Long-Term Memory collection for overarching project constraints and architectural decisions.
- [ ] Use a lightweight LLM prompt (Gemini 3 Flash) to compare the directive against the retrieved constraints. If a direct contradiction is found, construct an `ANOMALY_ALERT` object.
- [ ] Integrate this into the `ReviewerAgent` node in the LangGraph state, ensuring that if an alert is generated, the graph transitions to an explicit `HUMAN_IN_THE_LOOP` node for user arbitration.

## 3. Code Review
- [ ] Verify that the semantic comparison prompt is concise and fast, acting strictly as a binary flag (Contradiction: Yes/No) with a brief reasoning trace.
- [ ] Ensure the LanceDB search properly filters by `type: 'CONSTRAINT'` or `type: 'ARCHITECTURAL_DECISION'`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:unit tests/core/agents/anomaly_detector.test.ts` to ensure contradictions are correctly identified.
- [ ] Run the project linting suite to verify clean code style and imports.

## 5. Update Documentation
- [ ] Document the `LogicAnomalyDetector` flow in `docs/architecture/03_memory_system.md`, explaining how architectural constraints protect against short-term user overrides.

## 6. Automated Verification
- [ ] Execute a script `node scripts/test_anomaly.js` that spins up an in-memory SQLite/LanceDB instance, seeds a constraint, and feeds a contradictory user prompt. 
- [ ] The script must assert that the output object contains `anomaly_detected: true` and the corresponding explanation.