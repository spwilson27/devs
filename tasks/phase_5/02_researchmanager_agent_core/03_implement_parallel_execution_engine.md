# Task: Implement Parallel Execution Engine for Concurrent Research Streams (Sub-Epic: 02_ResearchManager Agent Core)

## Covered Requirements
- [1_PRD-REQ-MAP-001], [9_ROADMAP-REQ-024]

## 1. Initial Test Written
- [ ] Create `tests/unit/agents/research/test_parallel_execution_engine.py`.
- [ ] Write a test that `ParallelResearchExecutor.execute(queries: list[SearchQuery]) -> list[ResearchStreamResult]` can handle exactly 3 concurrent streams simultaneously (mock the underlying search tool to track concurrency using a `threading.Semaphore` or `asyncio.Event` latch).
- [ ] Write a test that the executor handles 4 concurrent streams (one more than the minimum) without blocking indefinitely (set a 5-second asyncio timeout).
- [ ] Write a test that all 4 `ResearchStreamType` streams are executed and their results are returned (none silently dropped).
- [ ] Write a test that if one stream raises an exception, the remaining streams still complete and their results are included in the output (`ResearchStreamResult.error` field is populated for the failed stream instead of raising globally).
- [ ] Write a test that the executor respects `ResearchConfig.max_parallel_streams` — if set to `2`, no more than 2 coroutines run concurrently at any given moment (use mock timing/event synchronization).
- [ ] Mock all `SearchTool` calls so no network traffic occurs.
- [ ] All tests must fail initially.

## 2. Task Implementation
- [ ] Create `src/agents/research/parallel_executor.py`.
- [ ] Define `@dataclass ResearchStreamResult`:
  - Fields: `stream_type: ResearchStreamType`, `queries: list[SearchQuery]`, `raw_results: list[dict]`, `error: Exception | None = None`.
- [ ] Define `class ParallelResearchExecutor`:
  - `__init__(self, config: ResearchConfig, search_tool: SearchToolProtocol)`.
  - `async def execute(self, queries: list[SearchQuery]) -> list[ResearchStreamResult]`:
    - Group `queries` by `stream_type` into a dict `{ResearchStreamType: list[SearchQuery]}`.
    - Use `asyncio.Semaphore(config.max_parallel_streams)` to cap concurrency.
    - Dispatch each stream group as a separate coroutine wrapped with the semaphore.
    - Use `asyncio.gather(*coroutines, return_exceptions=True)` so one failure does not cancel others.
    - For each result, if an exception was returned by `gather`, populate `ResearchStreamResult.error` and log a `WARNING`.
    - Return the full list of `ResearchStreamResult` objects (one per `ResearchStreamType`).
- [ ] Create `src/agents/research/protocols.py` (or extend existing) with `class SearchToolProtocol(Protocol)`:
  - `async def search(self, query: SearchQuery) -> list[dict]`.
- [ ] Export `ParallelResearchExecutor` and `ResearchStreamResult` from `src/agents/research/__init__.py`.

## 3. Code Review
- [ ] Verify `asyncio.Semaphore` is used (not `threading.Semaphore`) — this is an async codebase.
- [ ] Verify `asyncio.gather(..., return_exceptions=True)` is used so a single stream failure does not cancel sibling tasks.
- [ ] Verify per-stream exceptions are caught, logged at `WARNING`, and stored in `ResearchStreamResult.error` — never silently swallowed.
- [ ] Verify that the executor does NOT hard-code the stream count — it must be driven by the incoming `queries` list and `ResearchConfig.max_parallel_streams`.
- [ ] Verify that `SearchToolProtocol` follows the existing `LLMClient` protocol pattern established in Task 02.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/unit/agents/research/test_parallel_execution_engine.py -v` and confirm all tests pass.
- [ ] Run `mypy src/agents/research/parallel_executor.py` and confirm zero type errors.

## 5. Update Documentation
- [ ] Add a `### ParallelResearchExecutor` subsection to `docs/architecture/agents.md` describing the concurrency model (asyncio semaphore, gather with return_exceptions).
- [ ] Add a note to `docs/architecture/protocols.md` documenting `SearchToolProtocol` and how it is injected.

## 6. Automated Verification
- [ ] Run `pytest tests/unit/agents/research/test_parallel_execution_engine.py --tb=short` and confirm exit code `0`.
- [ ] Run `python -c "from src.agents.research.parallel_executor import ParallelResearchExecutor; print('Import OK')"` and confirm exit code `0`.
- [ ] Confirm via `grep -r "asyncio.Semaphore" src/agents/research/parallel_executor.py` returns at least one match (verifying the concurrency cap is present).
