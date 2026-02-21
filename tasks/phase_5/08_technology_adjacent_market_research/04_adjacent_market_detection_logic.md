# Task: Implement Adjacent Market Detection Logic (Sub-Epic: 08_Technology & Adjacent Market Research)

## Covered Requirements
- [1_PRD-REQ-RES-004], [1_PRD-REQ-RES-005], [9_ROADMAP-REQ-RES-004]

## 1. Initial Test Written
- [ ] Create `tests/research/test_adjacent_market_detector.py`.
- [ ] Write a unit test `test_detector_returns_false_when_competitors_found` that provides a `MarketResearchResult` fixture containing 3 competitors and asserts `AdjacentMarketDetector.is_niche(result)` returns `False`.
- [ ] Write a unit test `test_detector_returns_true_when_no_competitors` that provides a `MarketResearchResult` with an empty `competitors` list and asserts `is_niche()` returns `True`.
- [ ] Write a unit test `test_detector_returns_true_when_competitors_below_threshold` that provides a `MarketResearchResult` with only 1 competitor (below configurable `min_competitors` threshold, default = 2) and asserts `is_niche()` returns `True`.
- [ ] Write a unit test `test_detector_respects_custom_threshold` that sets `min_competitors=5` and provides a result with 3 competitors, asserting `is_niche()` returns `True`.
- [ ] Write a unit test `test_detector_logs_reason` asserting `AdjacentMarketDetector.is_niche(result)` populates a `reason: str` attribute on the returned `NicheDetectionResult` dataclass explaining why the market was considered niche.
- [ ] All tests must initially FAIL (red phase).

## 2. Task Implementation
- [ ] Create `src/research/tools/adjacent_market_detector.py`.
- [ ] Define `NicheDetectionResult(is_niche: bool, competitor_count: int, threshold: int, reason: str)` dataclass in `src/research/models/adjacent_market.py`.
- [ ] Implement `AdjacentMarketDetector` class with:
  - `__init__(self, min_competitors: int = 2)`.
  - `is_niche(self, market_result: MarketResearchResult) -> NicheDetectionResult`: Counts direct competitors in `market_result.competitors`, compares against `min_competitors`, and returns a `NicheDetectionResult` with a human-readable `reason` string explaining the decision (e.g., "Only 1 direct competitor found; threshold is 2. Triggering adjacent market analysis.").
- [ ] Import `MarketResearchResult` from `src/research/models/market_research.py` (create a stub if it does not yet exist, with at minimum a `competitors: list[str]` field).
- [ ] Ensure `AdjacentMarketDetector` is stateless (no instance state mutated between calls).
- [ ] Create `src/research/tools/adjacent_market_detector.agent.md` documenting purpose, inputs, outputs, and the threshold logic.

## 3. Code Review
- [ ] Verify `AdjacentMarketDetector` contains zero LLM calls or I/O — it must be a pure synchronous decision function.
- [ ] Verify `NicheDetectionResult.reason` is always a non-empty string regardless of branch taken.
- [ ] Verify the default `min_competitors=2` is defined as a named constant `DEFAULT_MIN_COMPETITORS` in the module, not a magic number.
- [ ] Verify `MarketResearchResult` import does not create a circular dependency with the market research agent module.
- [ ] Confirm 100% branch coverage is achievable from the written tests (true/false/threshold branches all exercised).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/research/test_adjacent_market_detector.py -v` and confirm all tests pass.
- [ ] Run `pytest --cov=src/research/tools/adjacent_market_detector --cov-report=term-missing` and confirm line coverage = 100%.

## 5. Update Documentation
- [ ] Update `src/research/tools/adjacent_market_detector.agent.md` with final logic description, threshold parameter documentation, and a Mermaid decision flowchart showing the niche detection branching logic.
- [ ] Add `AdjacentMarketDetector` to `docs/architecture/research_agents.md` with a short description of its role in the research pipeline.
- [ ] Update `CHANGELOG.md`.

## 6. Automated Verification
- [ ] Run `pytest tests/research/test_adjacent_market_detector.py --tb=short` and assert exit code is `0`.
- [ ] Run `pytest --cov=src/research/tools/adjacent_market_detector --cov-report=term-missing` and assert the output contains `100%` for branch coverage.
- [ ] Run `python scripts/verify_aod_density.py src/research/tools/` to confirm 1:1 `.py`/`.agent.md` ratio.
