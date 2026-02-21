# Task: Implement TestNode (Sub-Epic: 01_TAS)

## Covered Requirements
- [TAS-052]

## 1. Initial Test Written
- [ ] Ensure tests from task 02 exist and fail (Red). Use the failing tests to guide implementation.

## 2. Task Implementation
- [ ] Implement TestNode class in src/tdd_engine/test_node.(py|ts) with these responsibilities:
  1. create_failing_test(target_path: str, test_code: str, metadata: dict) -> { id: str, test_path: str }
     - Writes a failing test file under the sandbox workspace (e.g., <workspace>/tests/generated/test_{id}.ext)
     - Returns unique id (UUID4) and test path.
  2. run_test(id: str) -> { id: str, passed: bool, stdout: str, stderr: str, exit_code: int }
     - Invokes the lightweight test runner implemented in src/tdd_engine/test_runner
     - Captures stdout, stderr and exit_code and returns structured data.
  3. cleanup(id: str) -> void
     - Removes test artifacts produced for the id in the sandbox workspace.

Implementation details:
- Use a UUID generator for test ids.
- Write tests using atomic file writes (write to tmp file then move into place).
- Implement run_test using subprocess.spawn / child_process.exec and ensure a maximum timeout (configurable, default 30s).
- Make all filesystem operations relative to the TestNode.instance.workspace_root to avoid accidental repo writes.

## 3. Code Review
- [ ] Verify that:
  - TestNode never writes outside workspace_root
  - Timeouts and resource limits exist for run_test
  - Proper exceptions are raised and documented for error cases
  - Methods are covered by unit tests (augment tests from task 02 to assert positive behaviors once implemented)

## 4. Run Automated Tests to Verify
- [ ] Run the unit tests for TestNode and ensure they pass after implementation:
  - Node: npm test -- --runTestsByPath tests/unit/test_testnode.spec.ts
  - Python: pytest -q tests/unit/test_testnode.py
- [ ] Capture test output to tests/results/testnode_results.txt

## 5. Update Documentation
- [ ] Update docs/TAS-052-testnode.md with implementation details, configuration options (timeouts), and sample use.

## 6. Automated Verification
- [ ] Provide a small script scripts/verify_testnode.sh that:
  1. Boots a temporary sandbox directory
  2. Creates a failing test via TestNode.create_failing_test
  3. Calls TestNode.run_test and asserts the structured result contains expected fields and a failing status
  4. Exits 0 on success

Notes:
- Keep the implementation minimal and focus on correctness and safety (sandboxing) over performance.
