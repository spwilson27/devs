# Task: Integration: Wire Entropy Detector, Strategy Pivot, and Budget Enforcement into DeveloperAgent TDD Loop (Sub-Epic: 04_1_PRD)

## Covered Requirements
- [1_PRD-REQ-REL-001], [1_PRD-REQ-REL-002], [1_PRD-REQ-REL-005], [1_PRD-REQ-GOAL-004]

## 1. Initial Test Written
- [ ] Create integration tests first using pytest at `tests/integration/test_tdd_loop_integration.py`.
  - Tests to write (exact assertions):
    - test_pivot_triggers_on_three_identical_errors:
      - Wire a DeveloperAgent orchestration that injects:
        - a fake TestNode that always returns a failing test with identical error payload `"segfault at 0x0"`.
        - a real entropy_detector (from Task 01) and a real StrategyPivotAgent (from Task 02) and a BudgetManager (from Task 03).
      - Run the TDD loop for up to 6 iterations and assert that StrategyPivotAgent.pivot_strategy was called once when 3 identical errors have been observed.
    - test_budget_enforced_after_ten_turns:
      - Wire a DeveloperAgent where the TestNode alternates errors (or returns non-recoverable failures) and run the loop for 12 iterations.
      - Assert that BudgetManager raises TurnLimitExceeded (or DeveloperAgent transitions to suspended state) after the 10th turn and that no further TestNode invocations occur.
    - test_mcp_server_available_in_integration:
      - Start the MCP server scaffold (imported in-memory) and assert DeveloperAgent sends a registration or health-check and receives an expected response from GET /health.

Provide exact orchestration steps and assertion expectations so an agent can write the integration tests verbatim.

## 2. Task Implementation
- [ ] Implement a simple orchestration module at `src/integration/developer_agent_tdd.py` with a deterministic, injectable TDD loop function:
  - def run_tdd_loop(test_node, code_node, verification_node, entropy_detector, pivot_agent, budget_manager, mcp_client, max_iterations: int = 100) -> Dict[str, Any]
    - Behavior:
      1. For iteration in range(max_iterations):
         - Run test_node.run() -> either returns (passed: bool, output: str)
         - If passed: commit and return success summary
         - If failed: update entropy_detector/history with output; ask pivot_agent.should_pivot(); if pivot -> get pivot_plan from pivot_agent.pivot_strategy(context) and apply to code_node (simulated in tests)
         - After each iteration, call budget_manager.increment_turn() and budget_manager.consume_tokens(estimated_tokens)
         - If budget_manager raises an exception, suspend loop and return suspended summary
      2. Always report loop events to mcp_client via a lightweight in-memory call (no network required in tests)
  - Keep the function synchronous and deterministic; accept dependency injection for all components to make testing straightforward.

## 3. Code Review
- [ ] Verify integration implementation for:
  - Clear separation of concerns and dependency injection.
  - Deterministic behavior under mocked components.
  - Proper handling of BudgetExceeded/TurnLimitExceeded exceptions with a clean suspension state.
  - Emission of concise, machine-readable events to the mcp_client interface for observability.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/integration/test_tdd_loop_integration.py -q` and ensure all integration tests pass locally.

## 5. Update Documentation
- [ ] Add `docs/tdd_integration.md` describing:
  - High-level orchestration flow with a small ASCII/mermaid diagram.
  - How components are injected for testing.
  - Expected event types reported to the MCP server during the loop.

## 6. Automated Verification
- [ ] Add `scripts/verify_tdd_integration.sh` which runs the integration pytest module and asserts the test suite passes; exit non-zero on failure.
