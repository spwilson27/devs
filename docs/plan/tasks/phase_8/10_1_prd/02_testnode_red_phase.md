# Task: Implement TestNode (Red Phase) specification and tests (Sub-Epic: 10_1_PRD)

## Covered Requirements
- [1_PRD-REQ-PIL-003]

## 1. Initial Test Written
- [ ] Add a failing integration/unit test at tests/tdd/testnode.red.test.js (Jest). The test must:
  - Create an isolated temporary sandbox workspace (use Node's os.tmpdir() and fs.mkdtempSync).
  - Place a minimal buggy source file under the sandbox (e.g., src/math/add.js with a wrong implementation).
  - Invoke the TestNode public API (e.g., require('../src/agents/test_node').startTurn(sandboxPath, taskMeta)). If the agent API does not yet exist, write a small harness function in tests that simulates the expected call signature.
  - Assert that TestNode creates a new failing test file at sandbox/tests/<generated_test>.test.js and returns an object with { status: 'test_created', testPath: '<path>' }.
  - Run the project's test runner against the sandbox (e.g., spawn `npx jest --testPathPattern sandbox/tests`) and assert that the test runner exits non-zero (i.e., failing test exists).

- [ ] Run the test to confirm it fails before implementation.

## 2. Task Implementation
- [ ] Implement src/agents/test_node.js (or .ts) exporting a minimal TestNode API with at least the function `async startTurn(sandboxPath, { taskId, artifactDir })`.
  - Behavior requirements:
    - Create a deterministic failing test file in sandbox/tests using a unique test filename derived from taskId and timestamp.
    - The failing test must assert an impossible condition (e.g., expect(add(1,2)).toBe(999)) so it reliably fails.
    - Run the local test runner against the sandbox (child_process.exec) and confirm it fails.
    - Return { status: 'test_created', testPath } on success.
    - Sanitize outputs: remove non-deterministic timestamps from returned logs and store the test content in sandbox/artifacts for auditing.
  - Implementation details:
    - Use only the project's existing dependencies; if new dependencies are required, add them via package.json and document the reason in the commit.
    - Ensure the module is pure and unit-testable without network access.

## 3. Code Review
- [ ] Verify TestNode creates failing tests deterministically (same input -> same test file content modulo unique id) and does not modify source files outside sandbox/tests.
- [ ] Confirm robust error handling: if the test runner is unavailable or times out, TestNode should surface a clear error code and not attempt code changes.
- [ ] Confirm logs are machine-parseable (JSON-lines or structured fields) and that the returned object contains `status` and `testPath` keys.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest tests/tdd/testnode.red.test.js --runInBand` and ensure the test passes after implementation.
- [ ] Add a CI job that runs this integration test inside a containerized environment to guarantee sandbox isolation.

## 5. Update Documentation
- [ ] Update docs/tas/testnode.md describing the TestNode API (startTurn signature, return values, and error codes) and link it from the PRD strict TDD loop fragment.

## 6. Automated Verification
- [ ] The automated verification script should:
  - Create a fresh sandbox, call TestNode.startTurn(...), run `npx jest` inside sandbox, assert the runner exits non-zero, and validate TestNode returned `status: 'test_created'`.
  - Fail CI if any step returns unexpected results or produces non-deterministic output (e.g., timestamps in status fields without normalization).