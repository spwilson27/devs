# Task: Implement CodeNode (Green Phase) to apply surgical edits and make tests pass (Sub-Epic: 11_3_MCP)

## Covered Requirements
- [3_MCP-TAS-084]
- [3_MCP-REQ-GOAL-005]

## 1. Initial Test Written
- [ ] Create unit/integration tests at src/mcp/__tests__/CodeNode.test.ts that:
  - Prepare a sandbox containing a failing test produced by TestNode
  - Invoke CodeNode.applyPatch(strategy, patch) where patch describes the minimal code change to implement the behavior
  - Run the project's test runner and assert that the previously failing test now passes
  - Tests MUST fail initially (CodeNode unimplemented)

## 2. Task Implementation
- [ ] Implement src/mcp/codeNode.ts with:
  - `class CodeNode` exposing `async applyPatch(patchDescriptor, sandboxDir)`
  - Support for atomic edits: write to a temp file, run a linter/type-check (if present), and atomically replace the target file
  - Prefer invoking existing `surgical_edit` tool if available; otherwise implement safe textual patching with backups
  - Return a result object { success: boolean, diagnostics?: string }

## 3. Code Review
- [ ] Verify:
  - Edits are atomic and reversible (create backups)
  - No unsafe filesystem operations
  - Edits are minimal and scoped to the intended file/lines
  - Adequate unit coverage and deterministic behavior

## 4. Run Automated Tests to Verify
- [ ] Run the new tests: `npm test -- src/mcp/__tests__/CodeNode.test.ts` and ensure that failing->passing behavior is validated

## 5. Update Documentation
- [ ] Add `docs/mcp/codenode.md` describing the patch format, atomic replacement strategy, and integration points with surgical_edit

## 6. Automated Verification
- [ ] Automated verification: run the CodeNode test and then the created sandbox test(s); assert the final test run returns zero failed tests.
