# Task: Implement PlanNode (ingest context & generate TaskStrategy) (Sub-Epic: 11_3_MCP)

## Covered Requirements
- [3_MCP-TAS-082]
- [3_MCP-TAS-064]

## 1. Initial Test Written
- [ ] Create unit tests at src/mcp/__tests__/PlanNode.test.ts that:
  - Provide a minimal task descriptor and mocked PRD/TAS fragments and medium-term memory
  - Instantiate PlanNode and call `generateStrategy(taskDescriptor, context)`
  - Assert the returned object is a valid `TaskStrategy` (use TaskStrategy.fromJSON or type checks)
  - Assert that `TaskStrategy.nodes` includes at least one TestNode placeholder followed by CodeNode metadata
  - Tests MUST fail initially (PlanNode unimplemented)

## 2. Task Implementation
- [ ] Implement src/mcp/planNode.ts with:
  - `class PlanNode { constructor(deps) }` supporting dependency injection (documentLoader, memoryLoader)
  - `async generateStrategy(taskDescriptor, {prd, tas, memory})` that:
    - Parses relevant PRD/TAS snippets and medium-term memory
    - Produces a deterministic `TaskStrategy` (ordered nodes: TestNode -> CodeNode -> optional RefactorNode)
    - Attaches minimal metadata to each node (expected module path, test target, constraints)
  - Use TaskStrategy model from task 01 for output format and validation

## 3. Code Review
- [ ] Verify:
  - Deterministic output given identical inputs (no seeded randomness)
  - Proper separation of parsing logic and strategy generation
  - Clear, testable public API and dependency injection points
  - Adequate unit tests for edge cases (empty PRD, missing memory)

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- src/mcp/__tests__/PlanNode.test.ts` and ensure passing.

## 5. Update Documentation
- [ ] Add `docs/mcp/plannode.md` describing the PlanNode inputs, outputs (TaskStrategy schema), and examples of generated strategies.

## 6. Automated Verification
- [ ] Automated verification: run the PlanNode unit tests and validate the produced TaskStrategy with TaskStrategy.fromJSON, exit non-zero on failure.
