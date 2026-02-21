# Task: Implement Rate-Limit Handling and Anti-Starvation Logic for Parallel Streams (Sub-Epic: 02_ResearchManager Agent Core)

## Covered Requirements
- [9_ROADMAP-REQ-024], [1_PRD-REQ-MAP-006]

## 1. Initial Test Written
- [ ] Create `tests/unit/agents/research/test_rate_limit_handling.py`.
- [ ] Write a test that `RateLimiter.acquire(stream_type: ResearchStreamType) -> None` allows immediate execution when the token bucket is not exhausted.
- [ ] Write a test that `RateLimiter.acquire` yields (suspends) the coroutine when the bucket is empty, and resumes after the refill interval has elapsed (use `asyncio.wait_for` with a timeout to assert it does NOT take longer than `refill_interval + 0.5s`).
- [ ] Write a test that when 4 streams contend for a rate-limited resource simultaneously, all 4 eventually complete — no stream is permanently starved (use a mock clock via `freezegun` or `unittest.mock.patch("asyncio.sleep")`).
- [ ] Write a test that `RateLimiter` correctly tracks per-provider limits independently — exhausting the `SERPER` bucket does not block a `JINA` stream.
- [ ] Write a test that the `ParallelResearchExecutor` (from Task 03) correctly integrates the `RateLimiter` — verify that when the limiter is at capacity, the executor suspends and resumes without dropping results (use a mock limiter).
- [ ] Write a test that a `429 Too Many Requests` response from the mock `SearchTool` causes the executor to back off (`asyncio.sleep`) and retry the query via `RetryOrchestrator`.
- [ ] All tests must fail initially.

## 2. Task Implementation
- [ ] Create `src/agents/research/rate_limiter.py`:
  - Define `@dataclass RateLimitConfig` with fields: `provider: str`, `requests_per_second: float`, `burst: int = 5`.
  - Define `class RateLimiter`:
    - `__init__(self, configs: list[RateLimitConfig])` — builds a dict of `{provider: TokenBucket}`.
    - `async def acquire(self, provider: str) -> None`:
      - Look up the `TokenBucket` for the provider.
      - If tokens are available, consume one and return immediately.
      - If the bucket is empty, `await asyncio.sleep(refill_delay)` until a token is available.
  - Define `class TokenBucket` (internal implementation):
    - `__init__(self, rate: float, burst: int)`.
    - `def consume(self) -> float`: return `0.0` if token available (and decrement), else return `seconds_until_refill`.
- [ ] Update `src/agents/research/parallel_executor.py` (from Task 03):
  - Inject `RateLimiter` into `ParallelResearchExecutor.__init__`.
  - Before each `search_tool.search(query)` call, `await rate_limiter.acquire(provider=query.stream_type.value)`.
  - On `429` status (represented as a specific exception from `SearchToolProtocol`), integrate with `RetryOrchestrator` to back off and retry.
- [ ] Create `src/agents/research/exceptions.py` extension: add `class RateLimitExceededError(Exception)` if not already present.
- [ ] Export `RateLimiter` and `RateLimitConfig` from `src/agents/research/__init__.py`.

## 3. Code Review
- [ ] Verify `TokenBucket` uses `time.monotonic()` (not `time.time()`) for measuring elapsed time to avoid clock skew.
- [ ] Verify `RateLimiter` is keyed by provider string (not `ResearchStreamType`) to allow future non-research callers to reuse it.
- [ ] Verify the `acquire` loop uses `asyncio.sleep` (not a busy-wait `while True` without sleep) to yield control to the event loop.
- [ ] Verify that when `parallel_executor.py` integrates `RateLimiter`, the acquire call is inside the semaphore-guarded block (so concurrency cap + rate limit both apply, in that order).
- [ ] Verify no global `RateLimiter` singleton exists — it must be injected via the constructor.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/unit/agents/research/test_rate_limit_handling.py -v` and confirm all tests pass.
- [ ] Run `mypy src/agents/research/rate_limiter.py` and confirm zero type errors.

## 5. Update Documentation
- [ ] Add a `### Rate Limiting & Anti-Starvation` subsection to `docs/architecture/agents.md` describing the token-bucket algorithm, per-provider configuration, and how it integrates with `ParallelResearchExecutor`.
- [ ] Add `RateLimitConfig` schema to `docs/architecture/data-models.md`.
- [ ] Note in `docs/architecture/agents.md` that `requests_per_second` defaults should be sourced from environment variables (e.g., `SERPER_RATE_LIMIT_RPS`) to avoid hardcoding vendor limits.

## 6. Automated Verification
- [ ] Run `pytest tests/unit/agents/research/test_rate_limit_handling.py --tb=short` and confirm exit code `0`.
- [ ] Run `python -c "from src.agents.research.rate_limiter import RateLimiter, RateLimitConfig; print('Import OK')"` and confirm exit code `0`.
- [ ] Confirm `grep -n "monotonic" src/agents/research/rate_limiter.py` returns at least one match (verifying monotonic clock usage).
- [ ] Confirm `grep -n "asyncio.sleep" src/agents/research/rate_limiter.py` returns at least one match (verifying non-busy-wait backoff).
