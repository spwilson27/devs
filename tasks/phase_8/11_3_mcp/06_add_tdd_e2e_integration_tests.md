# Task: Add TDD End-to-End Integration Tests validating Red-Green-Refactor (Sub-Epic: 11_3_MCP)

## Covered Requirements
- [3_MCP-REQ-GOAL-005]
- [3_MCP-TAS-064]
- [3_MCP-TAS-083]
- [3_MCP-TAS-084]

## 1. Initial Test Written
- [ ] Create an end-to-end test at src/tdd/__tests__/TddEndToEnd.test.ts that:
  - Creates a temporary sandbox project with a minimal failing test target
  - Runs the LangGraphOrchestrator against the sandbox
  - Asserts that the initial test run fails, the orchestrator performs exactly the Plan->Test->Code cycle, and the final test run passes
  - Ensures sandbox cleanup after test
  - Tests MUST fail initially (orchestrator/nodes not implemented)

## 2. Task Implementation
- [ ] Implement any required orchestration glue and ensure real modules (PlanNode, TestNode, CodeNode) can operate on the sandbox layout used by the test.
  - Provide deterministic sample task descriptors and minimal PRD/TAS fragments for the PlanNode
  - Ensure test runner invocation uses the project's CI test script or local jest invocation

## 3. Code Review
- [ ] Verify:
  - End-to-end test is reliable and idempotent (cleans up sandbox)
  - No external network calls in tests
  - Proper timeouts and iteration limits are enforced

## 4. Run Automated Tests to Verify
- [ ] Run: `npm test -- src/tdd/__tests__/TddEndToEnd.test.ts` and ensure the end-to-end TDD loop completes with passing tests

## 5. Update Documentation
- [ ] Add `docs/mcp/tdd_e2e.md` describing the end-to-end test, sandbox layout, and how to reproduce locally

## 6. Automated Verification
- [ ] Automated verification: run the single end-to-end test as part of CI (or locally) and assert the final test run returns zero failures; fail otherwise.
