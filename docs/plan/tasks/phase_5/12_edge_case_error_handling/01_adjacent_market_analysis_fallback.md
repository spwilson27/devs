# Task: Implement Adjacent Market Analysis Fallback for Search Dead-Ends (Sub-Epic: 12_Edge Case & Error Handling)

## Covered Requirements
- [4_USER_FEATURES-REQ-027]

## 1. Initial Test Written
- [ ] In `tests/unit/research/test_adjacent_market_analysis.py`, write unit tests for the `AdjacentMarketAnalyzer` class:
  - `test_triggers_when_no_direct_competitors_found`: Mock the competitor search result to return an empty list; assert that `AdjacentMarketAnalyzer.run()` is invoked and returns a non-empty `AdjacentMarketReport`.
  - `test_skips_when_competitors_found`: Mock competitor search to return at least one result; assert that `AdjacentMarketAnalyzer.run()` is NOT invoked.
  - `test_report_contains_explanation`: Assert that the returned `AdjacentMarketReport` contains a `dead_end_reason` string field explaining why no direct match was found.
  - `test_report_contains_adjacent_markets`: Assert that `AdjacentMarketReport.adjacent_markets` is a non-empty list of `AdjacentMarket` objects with `name`, `relevance_score`, and `description` fields.
  - `test_adjacent_market_relevance_score_range`: Assert that all `relevance_score` values are floats in the range `[0.0, 1.0]`.
- [ ] In `tests/integration/research/test_research_manager_dead_end.py`, write an integration test:
  - `test_research_manager_invokes_adjacent_market_on_dead_end`: Stub Serper API to return zero results for competitor queries; assert that the final `ResearchReport` includes a populated `adjacent_market_analysis` section and that `is_dead_end` is `True`.

## 2. Task Implementation
- [ ] Define the `AdjacentMarket` dataclass in `src/devs/research/models.py`:
  ```python
  @dataclass
  class AdjacentMarket:
      name: str
      relevance_score: float  # 0.0–1.0
      description: str
  ```
- [ ] Define the `AdjacentMarketReport` dataclass in `src/devs/research/models.py`:
  ```python
  @dataclass
  class AdjacentMarketReport:
      dead_end_reason: str
      adjacent_markets: list[AdjacentMarket]
  ```
- [ ] Add `is_dead_end: bool = False` and `adjacent_market_analysis: AdjacentMarketReport | None = None` fields to the existing `ResearchReport` dataclass in `src/devs/research/models.py`.
- [ ] Create `src/devs/research/adjacent_market_analyzer.py` with class `AdjacentMarketAnalyzer`:
  - Constructor accepts `llm_client`, `search_tool`, and `original_query: str`.
  - `run() -> AdjacentMarketReport`: Uses `search_tool` to query for broader/related markets, then calls `llm_client` to score and describe each adjacent market. Returns a populated `AdjacentMarketReport`.
- [ ] In `src/devs/research/research_manager.py`, within the competitor research step:
  - After collecting competitor search results, check if the list is empty.
  - If empty: set `is_dead_end = True`, instantiate `AdjacentMarketAnalyzer`, call `run()`, and attach the result to `ResearchReport.adjacent_market_analysis`.
  - If not empty: proceed with normal competitor analysis flow.

## 3. Code Review
- [ ] Verify that `AdjacentMarketAnalyzer` has no direct coupling to `ResearchManager` — it must be independently instantiable.
- [ ] Verify that the dead-end check is a pure conditional branch with no side effects on the normal research path.
- [ ] Verify that `dead_end_reason` is always a non-empty, human-readable string (not a raw exception message or empty string).
- [ ] Confirm that the LLM prompt used in `AdjacentMarketAnalyzer` explicitly instructs the model to identify adjacent markets, not re-attempt direct competitor search.
- [ ] Ensure no raw exception messages bubble up to `ResearchReport`; errors in `AdjacentMarketAnalyzer.run()` must be caught and result in a `dead_end_reason` noting the failure.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: `pytest tests/unit/research/test_adjacent_market_analysis.py -v`
- [ ] Run integration tests: `pytest tests/integration/research/test_research_manager_dead_end.py -v`
- [ ] Confirm all tests pass with exit code 0 and zero failures.

## 5. Update Documentation
- [ ] Update `src/devs/research/adjacent_market_analyzer.agent.md` (create if not exists) to document:
  - The purpose of `AdjacentMarketAnalyzer`.
  - Trigger conditions (empty competitor list).
  - Output schema: `AdjacentMarketReport` fields.
  - The LLM prompt strategy used.
- [ ] Update `src/devs/research/research_manager.agent.md` to note the dead-end branch and that it delegates to `AdjacentMarketAnalyzer`.
- [ ] Update `docs/research_phase.md` (or equivalent high-level doc) to describe the dead-end handling behavior for user-facing documentation.

## 6. Automated Verification
- [ ] Run the full test suite and assert zero failures: `pytest tests/unit/research/test_adjacent_market_analysis.py tests/integration/research/test_research_manager_dead_end.py --tb=short 2>&1 | tail -5`
- [ ] Assert the string `passed` appears in the output and `failed` does not.
- [ ] Verify the `AdjacentMarketReport` model is importable and fields are correctly typed: `python -c "from devs.research.models import AdjacentMarketReport, AdjacentMarket; print('OK')"`
