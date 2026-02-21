# Task: Implement Strategy Pivot Directive Logic (Sub-Epic: 22_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-003]

## 1. Initial Test Written
- [ ] Write unit and integration tests that prove the Strategy Pivot triggers correctly and that a pivot produces a first-principles plan and RCA:
  - Tests to write FIRST:
    - test_pivot_on_three_identical_errors: simulate/insert three identical failure messages into the task error history, assert StrategyPivotAgent.evaluate(error_history) returns True and StrategyPivotAgent.execute_pivot(context) returns a Plan object containing a `rationale` field with the phrase "first-principles" or equivalent.
    - test_no_pivot_for_non_repeating_errors: feed three different errors, assert evaluate(...) returns False and no plan pivot is executed.
    - test_pivot_logs_rca_and_memory_write: when pivot executes, assert an RCA summary entry is appended to the task memory and contains keys `timestamp`, `summary`, and `lessons`.
  - Test locations:
    - If pytest: `tests/test_strategy_pivot.py` with isolated mocks for DeveloperAgent and MemoryAdapter.
    - If Jest: `tests/strategy-pivot.test.ts` with mocks for agent interfaces.
  - Mocking details: stub DeveloperAgent.turn() to throw identical Error objects or return identical failure objects; assert StrategyPivotAgent is invoked via the evaluation hook.

## 2. Task Implementation
- [ ] Implement StrategyPivotAgent and integrate it into the DeveloperAgent turn loop:
  - Module path suggestion: `src/agents/strategy_pivot.py` or `packages/agents/src/strategyPivot.ts`.
  - API and design:
    - class StrategyPivotAgent(pivot_threshold: int = 3)
    - evaluate(error_history: List[str]) -> bool  # returns True when pivot_threshold identical errors detected
    - execute_pivot(task_context: TaskContext) -> Plan  # returns a new Plan object generated from first-principles reasoning
  - Implementation details:
    - Use the same deterministic hashing (SHA-256 of normalized error strings) used by EntropyDetector to determine identical errors.
    - Pivot action must produce:
      - A concise `Plan` with steps (maximum 6) enumerated in SAOP-compatible format.
      - An `RCA` object containing `root_cause`, `evidence` (concise provenance), and `lessons_learned`.
    - Persist pivot event to agent memory: MemoryAdapter.append(task_id, 'pivot_events', { ... }).
    - Emit a structured event `pivot_event` to the system event bus with fields {task_id, pivot_reason, timestamp, plan_summary}.
    - Ensure execute_pivot is idempotent for the same input to remain deterministic.
  - Integration points:
    - Wire StrategyPivotAgent.evaluate at the top of DeveloperAgent's failure-handling pipeline; when evaluate returns True, short-circuit normal retries and call execute_pivot.

## 3. Code Review
- [ ] Verify during review that:
  - Strategy detection uses deterministic hashing and the same normalization pipeline as EntropyDetector.
  - Pivot Plan generation is reproducible given the same task_context (no random seeds).
  - RCA contains verifiable provenance and is written to the agent memory store atomically with the pivot event.
  - Tests use mocked dependencies and assert both behavior and memory side-effects.

## 4. Run Automated Tests to Verify
- [ ] Run the implemented tests:
  - pytest: `pytest -q tests/test_strategy_pivot.py`.
  - jest: `npx jest tests/strategy-pivot.test.ts --runInBand`.
  - Ensure CI checks include this test and that the pivot event is observable in test output or mocked event bus.

## 5. Update Documentation
- [ ] Add `docs/risks/strategy_pivot.md`:
  - Explain pivot conditions, configuration (`pivot_threshold`), example pivot Plan output, RCA schema, and integration points with DeveloperAgent and MemoryAdapter.
  - Document how to reproduce a pivot in a dev environment for debugging.

## 6. Automated Verification
- [ ] Add `scripts/verify_strategy_pivot.sh` that:
  - Runs the pivot tests.
  - Simulates three identical failure messages against a test DeveloperAgent and asserts that a `pivot_event` is emitted and a corresponding RCA entry was written to a temporary memory store.
  - Exit non-zero if any assertion fails.
