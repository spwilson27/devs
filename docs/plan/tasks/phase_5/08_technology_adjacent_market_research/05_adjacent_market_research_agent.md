# Task: Implement AdjacentMarketAgent for Edge-Case Research (Sub-Epic: 08_Technology & Adjacent Market Research)

## Covered Requirements
- [1_PRD-REQ-RES-004], [9_ROADMAP-REQ-RES-004]

## 1. Initial Test Written
- [ ] Create `tests/research/test_adjacent_market_agent.py`.
- [ ] Write a unit test `test_agent_generates_adjacent_market_queries` that mocks `NicheDetectionResult(is_niche=True)` and a user brief, and asserts `AdjacentMarketAgent.generate_queries(brief, detection_result)` returns a list of search queries targeting adjacent market verticals (not the same queries as the primary market research).
- [ ] Write a unit test `test_agent_generates_manual_workaround_queries` asserting `generate_queries` also returns queries specifically searching for "manual workarounds" or "alternative workflows" humans use to solve the problem without dedicated software.
- [ ] Write a unit test `test_agent_is_skipped_when_not_niche` asserting `AdjacentMarketAgent.run()` returns `None` (or an empty `AdjacentMarketResult`) when `NicheDetectionResult.is_niche == False`, without making any search calls.
- [ ] Write an integration test `test_agent_returns_structured_result` using a stubbed `SearchTool` and `ContentExtractor` and a `NicheDetectionResult(is_niche=True)` fixture, asserting the agent returns an `AdjacentMarketResult` with fields: `adjacent_markets: list[AdjacentMarket]`, `manual_workarounds: list[str]`, `query_log: list[str]`.
- [ ] Write a unit test `test_adjacent_market_has_required_fields` asserting `AdjacentMarket` dataclass has fields: `market_name: str`, `relevance_score: float`, `description: str`, `source_urls: list[str]`.
- [ ] All tests must initially FAIL (red phase).

## 2. Task Implementation
- [ ] Create `src/research/agents/adjacent_market_agent.py`.
- [ ] Define dataclasses in `src/research/models/adjacent_market.py` (extend if file exists from task 04):
  - `AdjacentMarket(market_name, relevance_score, description, source_urls)`.
  - `AdjacentMarketResult(adjacent_markets, manual_workarounds, query_log)`.
- [ ] Implement `AdjacentMarketAgent` class with:
  - `__init__(self, search_tool: SearchTool, extractor_tool: ContentExtractor, llm_client)`.
  - `generate_queries(self, brief: str, detection: NicheDetectionResult) -> list[str]`: Uses LLM to generate two query categories: (1) adjacent market verticals (industries or domains with overlapping user needs), and (2) manual workaround queries (e.g., "how do people manually do X without software").
  - `async run(self, brief: str, detection: NicheDetectionResult) -> AdjacentMarketResult | None`: Returns `None` immediately if `detection.is_niche == False`. Otherwise: calls `generate_queries`, dispatches searches in parallel via `asyncio.gather`, extracts content, then uses LLM to parse each result into either an `AdjacentMarket` or a `manual_workaround` string, and assembles `AdjacentMarketResult`.
- [ ] Relevance scoring for each `AdjacentMarket` must be performed by the LLM using a structured prompt: `{"relevance_score": float (0.0-1.0), "rationale": str}`.
- [ ] Create `src/research/agents/adjacent_market_agent.agent.md`.

## 3. Code Review
- [ ] Verify early-return for `is_niche == False` is the very first check in `async run()`, before any async operations.
- [ ] Verify `generate_queries` produces queries in two distinct categories (adjacent markets AND manual workarounds) — not a merged flat list.
- [ ] Verify LLM relevance scoring uses a structured JSON response and handles `json.JSONDecodeError` gracefully (fallback to `relevance_score=0.0`).
- [ ] Verify no hardcoded market category names; all query generation is driven by the LLM based on the brief.
- [ ] Confirm all public methods are typed and async where appropriate.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/research/test_adjacent_market_agent.py -v` and confirm all tests pass.
- [ ] Run `pytest --cov=src/research/agents/adjacent_market_agent --cov-report=term-missing` and confirm line coverage ≥ 90%.

## 5. Update Documentation
- [ ] Update `src/research/agents/adjacent_market_agent.agent.md` with a full description of the two query categories, the LLM relevance scoring prompt, the short-circuit condition, and a Mermaid sequence diagram of the agent's execution flow.
- [ ] Update `docs/architecture/research_agents.md` with an `AdjacentMarketAgent` entry.
- [ ] Update `CHANGELOG.md`.

## 6. Automated Verification
- [ ] Run `pytest tests/research/test_adjacent_market_agent.py --tb=short` and assert exit code is `0`.
- [ ] Run `python -c "from src.research.agents.adjacent_market_agent import AdjacentMarketAgent; print('import ok')"` and confirm no errors.
- [ ] Run `python scripts/verify_aod_density.py src/research/agents/` to confirm 1:1 `.py`/`.agent.md` ratio.
