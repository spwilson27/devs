# Task: Implement Multi-model Failover Architecture (Sub-Epic: 25_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-053]

## 1. Initial Test Written
- [ ] Add unit tests at tests/test_multi_model_failover.py using pytest. Exactly implement the following tests first:
  - test_primary_failure_triggers_failover: use unittest.mock to create two fake model clients: primary (raises ModelError on call) and secondary (returns a predictable response). Instantiate MultiModelFailover([primary, secondary]) and assert that a call() returns the secondary result and that the primary was attempted prior to the secondary.
  - test_retry_and_backoff_behavior: mock time.sleep and make primary fail for N attempts then succeed; assert that MultiModelFailover retries according to configured retry_policy and that time.sleep was invoked with exponential backoff values.
  - test_health_check_marks_unhealthy: simulate health_check returning False for primary, assert it is removed from rotation until health_check succeeds.
  - test_failover_metrics_and_logging: assert that when failover occurs a metric counter increments and an event is logged with the primary and chosen fallback model identifiers.

Include exact imports at the top of the test file and reference the implementation module at devs.risks.multi_model_failover.MultiModelFailover so the tests are importable.

## 2. Task Implementation
- [ ] Implement the failover module at src/devs/risks/multi_model_failover.py with the following:
  - Class MultiModelFailover(clients: List[ModelClient], retry_policy: dict = None, health_check_interval: int = 30)
  - Public method: async def call(self, prompt: str, timeout: Optional[float] = None) -> ModelResponse
    - Try each client in deterministic order; on client exception (ModelError, TimeoutError, or any non-success), log the error, emit a metric, wait according to retry_policy (exponential backoff + jitter), then move to the next client.
    - Respect per-call timeout and global call budget.
  - Background health-check loop that periodically probes clients and marks/unmarks unhealthy clients.
  - Configuration: read ordered client list and retry_policy from env var MULTI_MODEL_FAILOVER_CONFIG (JSON) or config/risks.yaml.
  - Use dependency inversion: interact only via a simple ModelClient interface (call(prompt)->response, health_check()->bool) to make testing trivial.
  - Add type hints, docstrings, and small cohesive helper functions.

## 3. Code Review
- [ ] Verify deterministic ordering and idempotence: confirm that ordering of clients is stable and documented; verify no secrets are logged; ensure all external calls are wrapped and errors are handled; ensure small functions (single responsibility); ensure the module exposes clear interfaces for injecting mock clients.

## 4. Run Automated Tests to Verify
- [ ] Run the targeted tests: pytest -q tests/test_multi_model_failover.py; if using tox/Makefile prefer make test-unit or tox -e py. Ensure the tests pass and that coverage includes the new module.

## 5. Update Documentation
- [ ] Add documentation at docs/risks/multi_model_failover.md describing architecture, configuration (env/config schema), metrics emitted, and operational guidance (how to mark models for maintenance).

## 6. Automated Verification
- [ ] Add a CI make target (e.g., make verify-failover) or a script scripts/verify_multi_model_failover.sh that runs pytest tests/test_multi_model_failover.py and parses logs/metrics to assert that failover was exercised during the tests (return non-zero if not). Ensure the CI job calls this target.
