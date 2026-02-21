# Task: Wire ResearchManager.run() — Orchestrate Full Research Pipeline (Sub-Epic: 02_ResearchManager Agent Core)

## Covered Requirements
- [9_ROADMAP-TAS-301], [1_PRD-REQ-RES-007], [1_PRD-REQ-MAP-001], [1_PRD-REQ-MAP-006], [9_ROADMAP-REQ-024]

## 1. Initial Test Written
- [ ] Create `tests/integration/agents/research/test_research_manager_run.py`.
- [ ] Write an integration test that `ResearchManager.run(brief)` returns a `ResearchSuite` where all 4 report fields (`market_report`, `competitive_report`, `tech_report`, `user_research_report`) are populated (non-None).
- [ ] Write a test that each `ResearchReport.confidence_score` in the returned `ResearchSuite` is a float between `0.0` and `1.0`.
- [ ] Write a test that each `ResearchReport.citations` list is non-empty (at least 1 citation per report).
- [ ] Write a test that `ResearchManager.run` completes all 4 streams even if 1 stream initially fails and is retried (mock one stream to fail once, then succeed — verify final suite has all 4 reports).
- [ ] Write a test that `ResearchManager.run` raises `MaxRetriesExceededError` when all retries for a stream are exhausted (mock a stream to always fail).
- [ ] Write a test that `ResearchManager.run` raises `EntropyDetectedError` when a stream returns identical results 3 times in a row (mock stream to always return the same `raw_results`).
- [ ] Mock all external I/O (LLM, HTTP) using `unittest.mock.AsyncMock` and `aioresponses`.
- [ ] All tests must fail initially.

## 2. Task Implementation
- [ ] Update `src/agents/research/research_manager.py` to implement `ResearchManager.run(brief: str) -> ResearchSuite`:
  - **Step 1 — Decompose**: `queries = await self._decomposer.decompose(brief)` (use `BriefDecomposer`).
  - **Step 2 — Execute parallel streams**: `stream_results = await self._executor.execute(queries)` (use `ParallelResearchExecutor`, which internally applies `RateLimiter` and `asyncio.Semaphore`).
  - **Step 3 — Verify citations**: For each `ResearchStreamResult`, `await self._citation_verifier.verify(citations)`.
  - **Step 4 — Score results**: `scored = [self._confidence_scorer.score(r) for r in stream_results]`.
  - **Step 5 — Retry failed streams**: For any stream where `ResearchStreamResult.error is not None`, use `RetryOrchestrator` (with `max_retries=config.retry_limit`) to retry that stream's `execute` call; pass the retry history to `EntropyDetector`.
  - **Step 6 — Assemble suite**: Map `scored` results to `ResearchSuite` fields by `stream_type`.
  - **Step 7 — Return** the completed `ResearchSuite`.
- [ ] Update `ResearchManager.__init__` to accept and store: `BriefDecomposer`, `ParallelResearchExecutor`, `CitationVerifier`, `ConfidenceScorer`, `RetryOrchestrator`, `EntropyDetector` as injected dependencies (no internal instantiation of concrete classes).
- [ ] Create a factory function `create_research_manager(config: ResearchConfig, llm_client: LLMClient, search_tool: SearchToolProtocol, http_client: AsyncHTTPClientProtocol, rate_limiter: RateLimiter) -> ResearchManager` in `src/agents/research/factory.py` to wire up all dependencies for production use.
- [ ] Export `create_research_manager` from `src/agents/research/__init__.py`.

## 3. Code Review
- [ ] Verify `ResearchManager.run` does not instantiate any concrete classes internally — all dependencies must be injected.
- [ ] Verify the 7-step pipeline is clearly commented (one comment per step) in `research_manager.py` for agent readability.
- [ ] Verify that `ResearchSuite` fields are populated by matching `ScoredResearchResult.stream_type` to the correct field name — no positional indexing.
- [ ] Verify `factory.py` uses the concrete implementations from prior tasks (e.g., actual `BriefDecomposer`, `ParallelResearchExecutor`) and not mocks.
- [ ] Verify that the `run` method is `async def` and awaits all async steps correctly.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/integration/agents/research/test_research_manager_run.py -v` and confirm all tests pass.
- [ ] Run `pytest tests/unit/agents/research/ -v` to confirm no regressions across all unit tests for this sub-epic.
- [ ] Run `mypy src/agents/research/` and confirm zero type errors across the full module.

## 5. Update Documentation
- [ ] Update `docs/architecture/agents.md` to include the full 7-step `ResearchManager.run()` pipeline as a numbered list with the component responsible for each step.
- [ ] Add a Mermaid sequence diagram to `docs/architecture/agents.md` showing the flow from `brief` → `BriefDecomposer` → `ParallelResearchExecutor` → `CitationVerifier` → `ConfidenceScorer` → `RetryOrchestrator` → `ResearchSuite`.
- [ ] Update `docs/architecture/data-models.md` with the final `ResearchSuite` assembly logic.
- [ ] Add usage example to `docs/guides/research-manager.md` (create if absent) showing how to call `create_research_manager(...)` and `await manager.run(brief)`.

## 6. Automated Verification
- [ ] Run `pytest tests/unit/agents/research/ tests/integration/agents/research/ --tb=short` and confirm exit code `0`.
- [ ] Run `python -c "from src.agents.research.factory import create_research_manager; print('Import OK')"` and confirm exit code `0`.
- [ ] Run `mypy src/agents/research/ --strict` and confirm exit code `0` (zero type errors with strict mode).
- [ ] Run `grep -rn "NotImplementedError" src/agents/research/research_manager.py` and confirm it returns **no matches** (verifying the stub from Task 01 has been fully implemented).
