# Task: Integration: TDD Red-Gate, Entropy Detection, Pause & Buffer (Sub-Epic: 15_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-REQ-011], [9_ROADMAP-REQ-012], [9_ROADMAP-REQ-035], [9_ROADMAP-REQ-033], [9_ROADMAP-REQ-046]

## 1. Initial Test Written
- [ ] Create an end-to-end deterministic integration test at tests/test_integration_entropy_tdd.py:
  - Use an integration harness tests/support/integration_harness.py that can simulate the DeveloperAgent turn loop deterministically.
  - Scenario steps:
    1. Start a new task with configured budget (e.g., 10 turns / 1000 tokens) and entropy buffer enabled (20%).
    2. Agent produces a failing test (Red); assert the Red-Phase Gate records and allows progression.
    3. Agent performs CodeNode changes (Green) and TestNode verifies passing tests.
    4. Agent then produces repeated identical outputs for consecutive turns to trigger EntropyDetector.
    5. Assert that within the next scheduler cycle the PauseController suspends the task with reason `entropy-detected` and that BudgetManager records show research buffer reserved/used.
    6. Assert FidelityBench has recorded metrics for the run and compute_fidelity produces expected score for the simulated sequence.
  - Use assertable DB checks and avoid timing-based waits; advance the harness's internal turn counter instead.

## 2. Task Implementation
- [ ] Implement the integration harness and glue code:
  - tests/support/integration_harness.py: deterministic DeveloperAgent simulator, in-memory SQLite for persistence, and hooks to inject canonical outputs each turn.
  - Wire TestNode.RedPhaseGate, EntropyDetector, PauseController, BudgetManager, and FidelityBench into the harness so the integration test exercises the real code paths.

## 3. Code Review
- [ ] Verify cross-component contracts and transaction boundaries; ensure all state transitions are recorded with traceable identifiers (task_id, turn_id, trace_id).

## 4. Run Automated Tests to Verify
- [ ] pytest -q tests/test_integration_entropy_tdd.py; when run locally the test must pass under a single Python process using the in-memory DB.

## 5. Update Documentation
- [ ] Add docs/integration/entropy_tdd.md including a mermaid sequence diagram showing the Red->Green->Entropy->Pause flow and a sample observed metric output table.

## 6. Automated Verification
- [ ] Add a CI job matrix entry (or local script tests/support/run_all_entropy_tdd.sh) that runs all the task tests above and fails if any assertions or DB invariants are violated.
