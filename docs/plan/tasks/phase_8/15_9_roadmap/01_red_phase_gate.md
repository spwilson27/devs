# Task: Implement Red-Phase Gate enforcement (Sub-Epic: 15_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-REQ-011]

## 1. Initial Test Written
- [ ] Create a new unit test file at tests/test_red_phase_gate.py using the project's test framework (pytest assumed).
  - Arrange: instantiate a sandboxed TestRunner and a TestNode instance (use test doubles/mocks for sandbox execution environment).
  - Act: simulate an agent attempt to perform a CodeNode action without first establishing a failing test.
  - Assert: the TestNode must reject the attempt and raise a clearly-typed exception (e.g., RedPhaseViolation) or return a structured error object with code `RED_GATE_VIOLATION`.
  - Additional tests:
    - test_rejects_green_first: assert that when the simulated sandbox has all tests passing (green) prior to CodeNode, enforcement blocks progression.
    - test_allows_after_failing_test: assert that if a failing test is created and recorded by TestNode, the gate allows the next CodeNode execution.
  - Use deterministic fixtures and seeds so test results are reproducible.
  - Name assertions explicitly and keep tests fast (<1s each) so they are suitable for CI.

## 2. Task Implementation
- [ ] Implement the Red-Phase Gate enforcement in the TestNode component.
  - Create/modify file: src/agents/tdd/test_node.py and add class/method enforce_fail_first(sandbox, task_id) -> None.
  - Behavior:
    - Run the sandbox's current test suite in a deterministic mode.
    - If tests return all-passing (green), raise RedPhaseViolation or return an error object and do not permit progression to CodeNode.
    - If at least one failing test is present, persist that state and allow the CodeNode to run.
  - Technical details:
    - Canonicalize sandbox output before evaluation (trim, normalize newlines) to avoid spurious passes.
    - Emit structured logs with keys: task_id, turn_id, gate_result, failing_tests_count.
    - Add configuration option (config/tdd.yaml or config.json) key `strict_red_gate: true` and read it in the TestNode implementation to toggle strict enforcement.
  - Implement minimal SQLite persistence: record gate checks into a table `tdd_red_gate(task_id TEXT, turn INTEGER, result TEXT, details JSON)`.

## 3. Code Review
- [ ] During self-review ensure:
  - The Red-Phase logic is side-effect free except for the single atomic DB write recording the gate check.
  - Clear, typed exceptions are used for failure cases (do not rely on generic exceptions).
  - Tests are deterministic and use mocks/fakes for external dependencies (sandbox runner, filesystem, network).
  - The implementation follows existing project layering (Agent -> Node -> Sandbox) and does not introduce cross-cutting concerns.

## 4. Run Automated Tests to Verify
- [ ] Run the new tests locally and in CI:
  - pytest -q tests/test_red_phase_gate.py
  - Confirm that test_rejects_green_first fails before implementation and passes after implementation.

## 5. Update Documentation
- [ ] Add or update docs/tdd/red_phase_gate.md describing:
  - The semantics of the Red-Phase Gate, the configuration option `strict_red_gate`, and the database schema used for recording checks.
  - Example log lines and error payloads.

## 6. Automated Verification
- [ ] Provide a small verification script tests/support/verify_red_gate.sh (or a Python script) that:
  - Boots a sandbox fixture, runs the TestNode enforcement, and asserts the DB row in `tdd_red_gate` shows `result` equal to `blocked` for green-first scenarios.
  - This script should exit non-zero if verification fails and be runnable as `./tests/support/verify_red_gate.sh`.
