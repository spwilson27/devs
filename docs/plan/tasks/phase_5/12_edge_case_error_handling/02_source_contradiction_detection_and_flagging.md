# Task: Implement Source Contradiction Detection and Confidence Flagging (Sub-Epic: 12_Edge Case & Error Handling)

## Covered Requirements
- [4_USER_FEATURES-REQ-028]

## 1. Initial Test Written
- [ ] In `tests/unit/research/test_contradiction_detector.py`, write unit tests for the `ContradictionDetector` class:
  - `test_detects_direct_contradiction`: Provide two `ScrapedSource` objects with conflicting numeric facts (e.g., "market size $1B" vs "market size $5B"); assert that `ContradictionDetector.analyze()` returns a `ContradictoryFinding` with `is_contradictory=True`.
  - `test_no_contradiction_on_consistent_data`: Provide two `ScrapedSource` objects with aligned data; assert `is_contradictory=False` and no `ContradictoryFinding` is returned.
  - `test_contradictory_finding_has_lower_confidence`: Assert that the `confidence_score` on a `ContradictoryFinding` is strictly less than the `confidence_score` of non-contradictory findings (use a configurable threshold, e.g., ≤ 0.6).
  - `test_contradictory_finding_contains_both_sources`: Assert that `ContradictoryFinding.sources` contains references to both conflicting sources (by URL or identifier).
  - `test_contradictory_finding_label`: Assert that the `finding_type` field on the result equals the string `"Contradictory Finding"`.
  - `test_multiple_contradictions`: Provide three sources where two pairs contradict each other; assert that two separate `ContradictoryFinding` entries are returned.
- [ ] In `tests/integration/research/test_research_manager_contradiction.py`, write an integration test:
  - `test_research_report_flags_contradictions`: Stub two scraped sources with conflicting market data; assert that the final `ResearchReport.findings` list contains at least one entry with `finding_type == "Contradictory Finding"` and `confidence_score < 0.65`.

## 2. Task Implementation
- [ ] Define the `ScrapedSource` dataclass in `src/devs/research/models.py` (add if not exists):
  ```python
  @dataclass
  class ScrapedSource:
      url: str
      content: str
      credibility_score: float  # 0.0–1.0
  ```
- [ ] Define the `ResearchFinding` dataclass in `src/devs/research/models.py`:
  ```python
  @dataclass
  class ResearchFinding:
      finding_type: str  # e.g., "Standard Finding" or "Contradictory Finding"
      summary: str
      confidence_score: float  # 0.0–1.0
      sources: list[str]  # source URLs
  ```
- [ ] Add `findings: list[ResearchFinding] = field(default_factory=list)` to the existing `ResearchReport` dataclass in `src/devs/research/models.py`.
- [ ] Create `src/devs/research/contradiction_detector.py` with class `ContradictionDetector`:
  - Constructor accepts `llm_client`.
  - `analyze(sources: list[ScrapedSource]) -> list[ResearchFinding]`: Passes sources pairwise to `llm_client` with a structured prompt to identify factual contradictions. For each contradiction found, returns a `ResearchFinding` with `finding_type="Contradictory Finding"`, `confidence_score` capped at `0.6`, and `sources` populated with both conflicting URLs. Non-contradictory data returns findings with `finding_type="Standard Finding"` and higher confidence scores.
- [ ] In `src/devs/research/research_manager.py`, after all sources are scraped:
  - Instantiate `ContradictionDetector` with the shared `llm_client`.
  - Call `analyze(scraped_sources)` and attach the returned list to `ResearchReport.findings`.

## 3. Code Review
- [ ] Verify that `ContradictionDetector` is stateless — each call to `analyze()` is independent and does not mutate shared state.
- [ ] Verify that `confidence_score` on `ContradictoryFinding` is always ≤ 0.6 (enforced in code, not only by LLM output).
- [ ] Verify that the LLM prompt used by `ContradictionDetector` explicitly instructs the model to compare factual claims (numbers, dates, proper nouns) rather than stylistic differences.
- [ ] Verify that `finding_type` is always exactly the string `"Contradictory Finding"` (no typos, consistent casing).
- [ ] Verify that `ContradictionDetector` does not make more LLM calls than necessary (should batch source comparisons efficiently rather than O(n²) individual calls where avoidable).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: `pytest tests/unit/research/test_contradiction_detector.py -v`
- [ ] Run integration tests: `pytest tests/integration/research/test_research_manager_contradiction.py -v`
- [ ] Confirm all tests pass with exit code 0 and zero failures.

## 5. Update Documentation
- [ ] Create `src/devs/research/contradiction_detector.agent.md` documenting:
  - Purpose of `ContradictionDetector`.
  - Input/output schema.
  - The LLM prompt strategy used (pairwise comparison, claim extraction).
  - The `confidence_score` cap value (0.6) and rationale.
- [ ] Update `src/devs/research/research_manager.agent.md` to note that contradiction detection runs post-scraping.
- [ ] Update `docs/research_phase.md` to describe how `"Contradictory Finding"` entries appear in the research report and what downstream agents should do with them.

## 6. Automated Verification
- [ ] Run the full relevant test suite: `pytest tests/unit/research/test_contradiction_detector.py tests/integration/research/test_research_manager_contradiction.py --tb=short 2>&1 | tail -5`
- [ ] Assert output contains `passed` and does not contain `failed`.
- [ ] Verify model imports correctly: `python -c "from devs.research.models import ResearchFinding; print('OK')"`
- [ ] Verify the confidence cap enforcement: `python -c "from devs.research.contradiction_detector import ContradictionDetector; print('OK')"`
