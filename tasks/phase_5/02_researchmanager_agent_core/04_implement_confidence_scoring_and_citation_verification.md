# Task: Implement Confidence Scoring and Citation Verification for Research Results (Sub-Epic: 02_ResearchManager Agent Core)

## Covered Requirements
- [1_PRD-REQ-RES-007]

## 1. Initial Test Written
- [ ] Create `tests/unit/agents/research/test_confidence_scoring.py`.
- [ ] Write a test that `ConfidenceScorer.score(stream_result: ResearchStreamResult) -> ScoredResearchResult` returns a `ScoredResearchResult` with a `confidence_score: float` between `0.0` and `1.0`.
- [ ] Write a test that a stream result with 5 citations from diverse, high-credibility domains (e.g., `.edu`, `.gov`, peer-reviewed sources) scores above `0.80`.
- [ ] Write a test that a stream result with 0 citations scores `0.0`.
- [ ] Write a test that a stream result with all citations from the same domain scores lower than one with citations from 5 distinct domains (diversity penalty).
- [ ] Write a test that `CitationVerifier.verify(citations: list[Citation]) -> list[Citation]` correctly marks citations with unreachable URLs as `credibility_score = 0.0` (mock HTTP calls using `respx` or `aioresponses`).
- [ ] Write a test that `CitationVerifier.verify` skips URLs that are not valid HTTP/HTTPS URLs and logs a warning.
- [ ] All tests must fail initially.

## 2. Task Implementation
- [ ] Create `src/agents/research/confidence_scorer.py`:
  - Define `@dataclass ScoredResearchResult` with fields: `stream_type: ResearchStreamType`, `raw_results: list[dict]`, `citations: list[Citation]`, `confidence_score: float`.
  - Define `class ConfidenceScorer`:
    - `def score(self, stream_result: ResearchStreamResult) -> ScoredResearchResult`:
      - Count citations; if zero, return `confidence_score = 0.0`.
      - Compute domain diversity score: `unique_domains / total_citations` (capped at `1.0`).
      - Compute average `citation.credibility_score` across all citations.
      - Final `confidence_score = 0.6 * avg_credibility + 0.4 * domain_diversity` (weights configurable via `ScoringWeights` dataclass).
      - Log the computed score at `DEBUG` level.
- [ ] Create `src/agents/research/citation_verifier.py`:
  - Define `class CitationVerifier`:
    - `__init__(self, http_client: AsyncHTTPClientProtocol)` — inject HTTP client.
    - `async def verify(self, citations: list[Citation]) -> list[Citation]`:
      - For each citation, perform a `HEAD` request to the URL.
      - If the response is `200–299`, keep `credibility_score` unchanged.
      - If the URL is unreachable or returns `4xx/5xx`, set `credibility_score = 0.0` and log `WARNING`.
      - If the URL is not a valid `http`/`https` URL, skip it and log `WARNING`.
      - Return the updated citation list.
- [ ] Create `AsyncHTTPClientProtocol` in `src/agents/research/protocols.py` with `async def head(self, url: str) -> int` (returns HTTP status code).
- [ ] Export `ConfidenceScorer` and `CitationVerifier` from `src/agents/research/__init__.py`.

## 3. Code Review
- [ ] Verify the `confidence_score` formula weights are stored in a `ScoringWeights` dataclass (not magic numbers inline) to allow future tuning.
- [ ] Verify `CitationVerifier` does not block the event loop — all HTTP calls must be `await`-ed.
- [ ] Verify that a `confidence_score` of exactly `0.0` is returned (not `None`) when no citations exist.
- [ ] Verify that `ConfidenceScorer` and `CitationVerifier` are stateless beyond their injected dependencies.
- [ ] Verify that the scoring formula output is always clamped to `[0.0, 1.0]` with `min(1.0, max(0.0, score))`.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/unit/agents/research/test_confidence_scoring.py -v` and confirm all tests pass.
- [ ] Run `mypy src/agents/research/confidence_scorer.py src/agents/research/citation_verifier.py` and confirm zero type errors.

## 5. Update Documentation
- [ ] Add a `### Confidence Scoring` subsection to `docs/architecture/agents.md` documenting the scoring formula, weights, and the rationale for the 0.85 threshold used in the research gate.
- [ ] Document `AsyncHTTPClientProtocol` in `docs/architecture/protocols.md`.

## 6. Automated Verification
- [ ] Run `pytest tests/unit/agents/research/test_confidence_scoring.py --tb=short` and confirm exit code `0`.
- [ ] Run `python -c "from src.agents.research.confidence_scorer import ConfidenceScorer; from src.agents.research.citation_verifier import CitationVerifier; print('Import OK')"` and confirm exit code `0`.
- [ ] Confirm `grep -n "min(1.0" src/agents/research/confidence_scorer.py` returns a match (verifying score clamping is present).
