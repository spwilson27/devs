# Task: Implement Tiered Model Failover manager and routing for non-reasoning tasks (Sub-Epic: 23_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-029]

## 1. Initial Test Written
- [ ] Create unit tests at `tests/unit/test_model_failover.py`.
  - Test 1: Mock primary model client to raise a `RateLimitError` when invoked for a `task_type='lint'` request. Assert `ModelFailoverManager.call(task_type, payload)` routes the call to fallback client (`flash`) and returns the fallback client's response.
  - Test 2: For `task_type='reasoning'`, if the primary client rate-limits, assert the manager either raises a specific `FailoverUnavailable` exception or triggers an exponential backoff retry behavior (this should be configurable).
  - Test 3: Verify metrics emitted (e.g., `failover_count`, `primary_latency`, `fallback_latency`) are recorded via the project's metrics interface (use a mock metrics sink).

## 2. Task Implementation
- [ ] Implement `devs/models/failover.py` exposing `ModelFailoverManager` with:
  - Configuration mapping `TASK_CATEGORY -> [preferred_models_in_order]`, e.g., `{'lint': ['gemini-3-pro','gemini-3-flash'], 'test-run': ['gemini-3-pro','gemini-3-flash'], 'reasoning': ['gemini-3-pro']}`.
  - `call(model_task_type, payload)` method that:
    - Attempts calling models in order; on `RateLimitError` or explicit rate-limit response, falls back to next allowed model.
    - Emits structured logs/metrics when failover occurs and when final failure happens.
    - Honors a configurable policy for reasoning tasks (default: do not fallback to Flash; instead, raise/queue/backoff).
  - Use an adapter interface for model clients so unit tests can inject synchronous fakes.
- [ ] Add a small circuit-breaker and jittered backoff policy for repeated rate-limits to avoid hammering the primary model.

## 3. Code Review
- [ ] Verify abstraction boundaries so code that uses models never depends on concrete client implementations.
- [ ] Ensure that fallback for non-reasoning tasks DOES NOT accidentally expose long-running reasoning context to a cheaper model; the adapter must sanitize context when switching models.
- [ ] Confirm metrics, error handling, and configuration are documented and testable.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/unit/test_model_failover.py -q` and ensure tests pass.
- [ ] Add a short integration test simulating a primary rate-limit and verifying an end-to-end lint task uses Flash.

## 5. Update Documentation
- [ ] Update `docs/architecture/model_failover.md` with the configuration schema, default policies, and examples of task categories.

## 6. Automated Verification
- [ ] Add a CI integration test or simulation harness (`tests/integration/simulate_model_rate_limit.py`) that forces a primary rate-limit and validates that non-reasoning tasks complete under the fallback model and that reasoning tasks are requeued/backed off according to policy.
