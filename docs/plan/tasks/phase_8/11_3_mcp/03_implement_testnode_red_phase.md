# Task: Implement TestNode (Red Phase) to generate failing tests (Sub-Epic: 11_3_MCP)

## Covered Requirements
- [3_MCP-TAS-083]
- [3_MCP-REQ-GOAL-005]

## 1. Initial Test Written
- [ ] Create unit/integration tests at src/mcp/__tests__/TestNode.test.ts that:
  - Construct a minimal `TaskStrategy` describing a function or behavior to implement
  - Invoke TestNode.createFailingTest(strategy, sandboxPath)
  - Assert that a test file was written into the sandbox path and that running the project test runner against that file returns a failing result (non-zero)
  - Tests MUST fail initially (TestNode unimplemented)

## 2. Task Implementation
- [ ] Implement src/mcp/testNode.ts with:
  - `class TestNode` exposing `async createFailingTest(taskStrategy, sandboxDir)`
  - Deterministic test template generation (use TaskStrategy metadata to create a Jest/Vitest test that references the expected module/function and asserts desired behavior)
  - Safe sandbox writing: write files under sandboxDir/<task-id>/__tests__/, ensure path normalization and file-locking to avoid collisions
  - Return an object { testPath, expectedFailure: true }

## 3. Code Review
- [ ] Verify:
  - Test templates are minimal and purposely failing
  - No path injection vectors (sanitize filenames)
  - Writes are atomic (write temp file then rename)
  - Proper cleanup hooks in tests

## 4. Run Automated Tests to Verify
- [ ] Run: `node -e "require('./dist/mcp/testNode').TestNode.createFailingTest(...)"` (or run the unit tests) and assert the created test fails; the unit harness should validate the failing exit code

## 5. Update Documentation
- [ ] Add `docs/mcp/testnode.md` describing the test template conventions, sandbox layout, and how TestNode decides what to assert

## 6. Automated Verification
- [ ] Automated verification: after creating a sandbox test, run the project's test runner pointing only at the sandbox test file and assert it returns a failing exit code, fail otherwise.
