# Task: Define TaskStrategy model and schema (Sub-Epic: 11_3_MCP)

## Covered Requirements
- [3_MCP-TAS-082]

## 1. Initial Test Written
- [ ] Create unit tests at src/mcp/__tests__/TaskStrategy.test.ts that assert:
  - constructing a TaskStrategy with { id, name, nodes } succeeds
  - serialization via toJSON()/fromJSON() preserves fields
  - invalid payloads (missing id, nodes not an array) throw a validation error
  - tests MUST fail initially (TaskStrategy module should not yet exist or should be unimplemented)

## 2. Task Implementation
- [ ] Implement src/mcp/taskStrategy.ts exporting a TypeScript class `TaskStrategy` with:
  - Strong TypeScript types: id: string, name: string, nodes: Array<{ type: string; config?: any }>
  - A constructor that performs runtime validation and normalizes input
  - `toJSON()` and `static fromJSON(obj)` helpers for deterministic serialization
  - Unit-friendly, deterministic behavior (no randomness)
  - Export the class from src/mcp/index.ts (or the project's TypeScript barrel)

## 3. Code Review
- [ ] Verify:
  - Type definitions are strict and documented
  - Runtime validation covers all required fields and fails fast
  - Tests cover positive and negative cases
  - No heavy external dependencies introduced
  - JSDoc comments for public API

## 4. Run Automated Tests to Verify
- [ ] Run the project's test runner limited to the newly added tests and ensure they pass.
  - Example: `npm test -- src/mcp/__tests__/TaskStrategy.test.ts`

## 5. Update Documentation
- [ ] Add `docs/mcp/taskstrategy.md` describing the TaskStrategy schema, with a JSON example and short usage notes for PlanNode producers and CodeNode consumers.

## 6. Automated Verification
- [ ] Automated verification: run the test file and assert exit code 0 (e.g. `npm test -- src/mcp/__tests__/TaskStrategy.test.ts && echo 'OK' || (echo 'FAILED' && exit 1)`).
