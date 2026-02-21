# Task: Implement Entropy Detection and Retry Logic in ResearchManager (Sub-Epic: 02_ResearchManager Agent Core)

## Covered Requirements
- [1_PRD-REQ-MAP-006]

## 1. Initial Test Written
- [ ] Create `tests/unit/agents/research/test_entropy_detection.py`.
- [ ] Write a test that `EntropyDetector.is_stuck(history: list[ResearchStreamResult]) -> bool` returns `False` when the last 3 results are all distinct (different `raw_results` content).
- [ ] Write a test that `EntropyDetector.is_stuck` returns `True` when the last 3 results are identical (same `raw_results` content — simulating a loop).
- [ ] Write a test that `EntropyDetector.is_stuck` returns `False` when fewer than 3 results exist in history (not enough data to declare a loop).
- [ ] Write a test that `RetryOrchestrator.run_with_retry(coroutine_factory, max_retries=3) -> T` executes successfully on the first attempt when no exception is raised.
- [ ] Write a test that `RetryOrchestrator.run_with_retry` retries up to `max_retries` times when each attempt raises an exception, and re-raises the last exception after exhausting retries.
- [ ] Write a test that `RetryOrchestrator.run_with_retry` raises `MaxRetriesExceededError` (not the original exception) after 3 failed attempts, wrapping the original as `__cause__`.
- [ ] Write a test that `RetryOrchestrator.run_with_retry` calls `EntropyDetector.is_stuck` after each attempt and raises `EntropyDetectedError` if a loop is detected before max retries is reached.
- [ ] All tests must fail initially.

## 2. Task Implementation
- [ ] Create `src/agents/research/entropy_detector.py`:
  - Define `class EntropyDetector`:
    - `def is_stuck(self, history: list[ResearchStreamResult]) -> bool`:
      - If `len(history) < 3`, return `False`.
      - Hash the `raw_results` field of the last 3 entries (e.g., `hashlib.sha256(json.dumps(result.raw_results, sort_keys=True).encode()).hexdigest()`).
      - Return `True` if all 3 hashes are identical; otherwise `False`.
- [ ] Create `src/agents/research/retry_orchestrator.py`:
  - Define `class MaxRetriesExceededError(Exception)` and `class EntropyDetectedError(Exception)` in `src/agents/research/exceptions.py`.
  - Define `class RetryOrchestrator`:
    - `__init__(self, max_retries: int = 3, entropy_detector: EntropyDetector | None = None)`.
    - `async def run_with_retry(self, coroutine_factory: Callable[[], Coroutine[Any, Any, T]], history: list | None = None) -> T`:
      - Loop up to `max_retries` times.
      - On each attempt, `await coroutine_factory()`.
      - If the attempt raises an exception, record the error and check `entropy_detector.is_stuck(history)` if history is provided; raise `EntropyDetectedError` if stuck.
      - After all retries exhausted, raise `MaxRetriesExceededError(f"Failed after {max_retries} attempts") from last_exception`.
- [ ] Export `EntropyDetector`, `RetryOrchestrator`, `MaxRetriesExceededError`, `EntropyDetectedError` from `src/agents/research/__init__.py`.

## 3. Code Review
- [ ] Verify the entropy detection uses content hashing (not reference equality) to detect loops.
- [ ] Verify `RetryOrchestrator` accepts `max_retries` as a constructor parameter (not hardcoded) so it is driven by `ResearchConfig.retry_limit`.
- [ ] Verify `MaxRetriesExceededError` chains the root cause exception via `raise ... from last_exception`.
- [ ] Verify `EntropyDetector.is_stuck` logs the computed hashes at `DEBUG` level to aid post-mortem debugging.
- [ ] Verify retry delay uses exponential backoff (`asyncio.sleep(2 ** attempt)`) to avoid hammering rate-limited APIs.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/unit/agents/research/test_entropy_detection.py -v` and confirm all tests pass.
- [ ] Run `mypy src/agents/research/entropy_detector.py src/agents/research/retry_orchestrator.py` and confirm zero type errors.

## 5. Update Documentation
- [ ] Add a `### Entropy Detection & Retry Logic` subsection to `docs/architecture/agents.md` explaining the loop-detection heuristic, the max-3-retries policy, and the exponential backoff strategy.
- [ ] Update the `ResearchConfig` schema in `docs/architecture/data-models.md` to clarify that `retry_limit: int = 3` maps directly to `RetryOrchestrator.max_retries`.

## 6. Automated Verification
- [ ] Run `pytest tests/unit/agents/research/test_entropy_detection.py --tb=short` and confirm exit code `0`.
- [ ] Run `python -c "from src.agents.research.entropy_detector import EntropyDetector; from src.agents.research.retry_orchestrator import RetryOrchestrator; print('Import OK')"` and confirm exit code `0`.
- [ ] Confirm `grep -n "MaxRetriesExceededError" src/agents/research/exceptions.py` returns a match.
