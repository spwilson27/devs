# Task: Implement LangGraph Orchestrator (cyclical Plan-Act-Verify loop) (Sub-Epic: 11_3_MCP)

## Covered Requirements
- [3_MCP-TAS-064]
- [3_MCP-REQ-GOAL-005]

## 1. Initial Test Written
- [ ] Create integration tests at src/tdd/__tests__/LangGraphOrchestrator.test.ts that:
  - Wire together PlanNode, TestNode, CodeNode (use real or lightweight implementations)
  - Provide a trivial task that requires a single function to be added
  - Assert orchestrator executes the sequence: Plan -> create failing test -> apply patch -> tests pass
  - Verify orchestrator enforces a hard iteration limit (e.g., 10 cycles) and logs each node transition
  - Tests MUST fail initially (orchestrator missing)

## 2. Task Implementation
- [ ] Implement src/tdd/langGraphOrchestrator.ts with:
  - A deterministic state machine implementing Plan-Act-Verify (LangGraph) loops
  - Clear node transition semantics and a maximum iteration guard
  - Hooks to call PlanNode.generateStrategy, TestNode.createFailingTest, CodeNode.applyPatch, and an optional Refactor step
  - Structured logs/trace output for each node and transition (JSON lines recommended)

## 3. Code Review
- [ ] Verify:
  - Deterministic, bounded loops with configurable limits
  - Clear error handling and no silent failures
  - Traceability: each node call records inputs/outputs and links back to TaskStrategy
  - No commits or state changes are performed until the verification node confirms passing tests

## 4. Run Automated Tests to Verify
- [ ] Run: `npm test -- src/tdd/__tests__/LangGraphOrchestrator.test.ts` and ensure orchestrator achieves Red->Green->Verify for the trivial task

## 5. Update Documentation
- [ ] Add `docs/mcp/langgraph_orchestrator.md` describing state machine diagram, node responsibilities, and example traces

## 6. Automated Verification
- [ ] Automated verification: run the integration test and validate that the orchestrator produced a JSON trace showing Plan, Test (failing), Code (patch), and Verification (passing); fail otherwise.
