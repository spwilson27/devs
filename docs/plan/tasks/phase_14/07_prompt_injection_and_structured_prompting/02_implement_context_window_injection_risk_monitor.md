# Task: Implement Context Window Injection Risk Monitor for Long-Context Prompts (Sub-Epic: 07_Prompt Injection and Structured Prompting)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-QST-901]

## 1. Initial Test Written

- [ ] Create `src/security/__tests__/context-injection-monitor.test.ts`.
- [ ] Write a unit test asserting that `analyzeContextWindow(promptParts[])` returns a `ContextRiskReport` with `riskLevel: 'LOW'` when all entries are recent (within the last 3 tasks) and contain no suspicious override patterns.
- [ ] Write a unit test asserting that `analyzeContextWindow` returns `riskLevel: 'HIGH'` when a prior context entry contains any of the injection trigger phrases: `"ignore previous"`, `"disregard instructions"`, `"you are now"`, `"new persona"`, `"override"`, `"forget all"` (case-insensitive).
- [ ] Write a unit test asserting that `analyzeContextWindow` returns `riskLevel: 'MEDIUM'` when the total token count of all context entries exceeds 80,000 tokens (simulated by character count / 4), indicating a long-context window where older content may have outsized influence.
- [ ] Write a unit test asserting that the monitor emits a structured `SecurityEvent` of type `CONTEXT_INJECTION_RISK` to the event bus when risk is `HIGH` or `MEDIUM`.
- [ ] Write a unit test asserting that calling `analyzeContextWindow` with an empty array throws a `ContextMonitorError`.
- [ ] Write an integration test confirming that the `OrchestrationEngine` calls `analyzeContextWindow` before each agent invocation and that a `HIGH` risk result causes the engine to pause and emit a `SECURITY_PAUSE` event rather than continuing.

## 2. Task Implementation

- [ ] Create `src/security/context-injection-monitor.ts` and export:
  - `type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'`
  - `interface ContextEntry { role: 'system' | 'user' | 'assistant' | 'untrusted'; content: string; taskIndex: number; }`
  - `interface ContextRiskReport { riskLevel: RiskLevel; triggeredPatterns: string[]; estimatedTokenCount: number; oldestTaskIndex: number; recommendation: string; }`
  - `class ContextMonitorError extends Error {}`
  - `function analyzeContextWindow(entries: ContextEntry[]): ContextRiskReport`
- [ ] Implement `analyzeContextWindow`:
  1. Throw `ContextMonitorError` if `entries` is empty.
  2. Compute `estimatedTokenCount` as `Math.ceil(totalCharCount / 4)`.
  3. Scan every `entry.content` with a case-insensitive regex for the injection trigger phrases: `ignore previous`, `disregard instructions`, `you are now`, `new persona`, `override`, `forget all`. Collect all matched phrases into `triggeredPatterns`.
  4. Determine `riskLevel`:
     - `'HIGH'` if `triggeredPatterns.length > 0`.
     - `'MEDIUM'` if `estimatedTokenCount > 80000`.
     - `'LOW'` otherwise.
  5. Set `recommendation` to a human-readable string appropriate for the risk level.
  6. Emit a `SecurityEvent` of type `CONTEXT_INJECTION_RISK` via `src/events/security-event-bus.ts` when risk is `HIGH` or `MEDIUM`.
  7. Return the full `ContextRiskReport`.
- [ ] Integrate the monitor into `src/orchestration/orchestration-engine.ts`:
  - Before invoking any agent, collect the current `ContextEntry[]` from the active prompt history.
  - Call `analyzeContextWindow(entries)`.
  - If `riskLevel === 'HIGH'`, call `engine.pause('SECURITY_PAUSE', report.recommendation)` instead of proceeding.
  - Log the full `ContextRiskReport` to the structured audit log (`src/audit/audit-logger.ts`).
- [ ] Add inline requirement reference comment `// [5_SECURITY_DESIGN-REQ-SEC-QST-901]` at the top of `context-injection-monitor.ts`.

## 3. Code Review

- [ ] Verify that the trigger-phrase regex uses the `i` flag (case-insensitive) and is compiled once as a module-level constant, not recreated on every call.
- [ ] Verify that the token estimation formula (`charCount / 4`) is documented with a comment explaining it is an approximation and may be replaced with a tokenizer library in a future task.
- [ ] Verify the `SecurityEvent` emitted includes the full `ContextRiskReport` as its payload, not just the risk level.
- [ ] Verify that `analyzeContextWindow` is a pure function with no side effects except for the event bus emission, and that the emission is injectable/mockable for testing.
- [ ] Confirm no unbounded loops or regex backtracking risk on large inputs (test with a 500KB synthetic string and ensure completion < 100ms).

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="src/security/__tests__/context-injection-monitor"` and confirm all unit tests pass.
- [ ] Run `npm test -- --testPathPattern="orchestration-engine"` and confirm the integration tests for the pause behavior pass.
- [ ] Run `npm test` and confirm no regressions in the broader test suite.

## 5. Update Documentation

- [ ] Add a `## Context Window Injection Risk` subsection to `docs/security.md` describing the `analyzeContextWindow` API, the trigger phrases, the token threshold, and the pause behavior.
- [ ] Update `.devs/memory/security-decisions.md` with the entry: "The OrchestrationEngine MUST call `analyzeContextWindow` before each agent invocation. A HIGH risk result MUST pause execution. Trigger phrases and token threshold are defined in `src/security/context-injection-monitor.ts`. Requirement ID: 5_SECURITY_DESIGN-REQ-SEC-QST-901."

## 6. Automated Verification

- [ ] Run `grep -n "analyzeContextWindow" src/orchestration/orchestration-engine.ts` and assert at least one match exists.
- [ ] Run `grep -n "SECURITY_PAUSE" src/orchestration/orchestration-engine.ts` and assert it appears in the `HIGH` risk branch.
- [ ] Run `npm test -- --coverage --testPathPattern="src/security/context-injection-monitor"` and confirm line coverage ≥ 90%.
- [ ] Run `npm run build` and confirm zero TypeScript compilation errors.
