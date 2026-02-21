# Task: Reviewer Agent Hierarchy of Concerns Audit (Sub-Epic: 02_Reviewer Agent Prompting & Identity)

## Covered Requirements
- [3_MCP-REQ-MET-009]

## 1. Initial Test Written
- [ ] Create a test file `tests/integration/agents/reviewer/HierarchyAudit.test.ts`.
- [ ] Write a test scenario where a module passes tests but is missing an `.agent.md` file. Assert the Reviewer Agent rejects it for `Agentic Observability` failure.
- [ ] Write a test scenario where a module uses an unapproved library (not in TAS). Assert the Reviewer Agent rejects it for `TAS Compliance` failure.
- [ ] Write a test scenario where a module implements a feature not requested in the `atomic requirement`. Assert the Reviewer Agent rejects it for `Requirement Fidelity` failure.
- [ ] Write a test scenario where all three dimensions pass successfully. Assert the Reviewer Agent returns a `APPROVED` status.

## 2. Task Implementation
- [ ] Open `src/agents/reviewer/ReviewAuditEngine.ts` (or create it if it doesn't exist).
- [ ] Implement a `performHierarchyAudit(taskContext, sourceCode, tasBlueprint)` method.
- [ ] Within this method, sequence the LLM review into three distinct evaluation dimensions matching the hierarchy of concerns:
  1.  **Requirement Fidelity**: Cross-reference `sourceCode` against `taskContext.atomicRequirement`.
  2.  **TAS Compliance**: Cross-reference `sourceCode` AST or imports against the `tasBlueprint` approved libraries and patterns.
  3.  **Agentic Observability**: Use a filesystem utility (or MCP tool) to check for the presence of the corresponding `.agent.md` file and Introspection Points in the code.
- [ ] Aggregate the results into a structured `AuditReport` interface. If any tier fails, the entire audit must fail and return detailed feedback.

## 3. Code Review
- [ ] Ensure the `HierarchyAudit` does not couple too tightly to the underlying LLM client; use abstractions.
- [ ] Verify that the "Agentic Observability" check uses actual filesystem verification alongside the LLM's semantic check.
- [ ] Confirm the output report formatting is machine-readable for the `DeveloperAgent` to automatically consume and fix the issues.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/integration/agents/reviewer/HierarchyAudit.test.ts`.
- [ ] Ensure all rejection scenarios and the success scenario pass consistently.

## 5. Update Documentation
- [ ] Create or update `docs/architecture/validation_gates.md` explaining the three-tier hierarchy of concerns.
- [ ] Document the `AuditReport` schema in `specs/api_contracts.md`.

## 6. Automated Verification
- [ ] Execute `node scripts/verify-requirements.js --req 3_MCP-REQ-MET-009` and ensure it validates the presence of the three checks in `ReviewAuditEngine.ts`.
