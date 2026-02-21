# Task: Implement Hallucinated Requirements Detection & Mitigation (Sub-Epic: 09_Risk_Mitigation_and_Monitoring)

## Covered Requirements
- [8_RISKS-REQ-121]

## 1. Initial Test Written
- [ ] Write unit tests for a new `hallucination_detector` module that analyses extracted requirements and assigns a `hallucination_score` (0-1) based on provenance evidence and source overlap.
  - Test cases include: clearly supported requirement (score < 0.1), weakly supported requirement (0.1-0.5), and unsupported/hallucinated requirement (score > 0.8).
  - Tests for provenance checks: asserts detector flags requirements that reference non-existent sections or fabricated examples from LLMs.
  - Tests for integration with cross-check: detector should be able to accept cross-check diffs and reduce score when source evidence present.

## 2. Task Implementation
- [ ] Implement `src/distiller/hallucination_detector.py` with these components:
  - Provenance matcher: verifies requirement text against source document text spans and returns match strength (e.g., exact span match, paraphrase match using fuzzy matching, or no match).
  - Evidence aggregator: for each requirement, collect evidence items (doc ids, text spans, similarity scores) and compute `hallucination_score` using a weighted formula.
  - Provide an API or callable `detect_hallucinations(extracted_requirements, source_documents) -> list[ {req_id, hallucination_score, evidence} ]`.
  - Implement a mitigation policy engine that marks high-score items as `quarantine` and suggests one of: `auto-remove`, `request_user_review`, or `merge_with_existing` based on configurable rules.
  - Ensure module is testable with local fixtures and contains no live LLM calls; external validation must be behind toggleable interfaces.

## 3. Code Review
- [ ] Ensure scoring formula is transparent and documented; include unit tests that assert expected scores for fixtures.
- [ ] Confirm evidence links include source filenames and character offsets for traceability.
- [ ] Verify configurable mitigation policies exist, with sane defaults that prefer `request_user_review` over auto-removal.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_hallucination_detector.py` and ensure all scenarios and edge cases pass.

## 5. Update Documentation
- [ ] Document `docs/distiller/hallucination_detection.md` describing the detection algorithm, evidence schema, and mitigation policy options.
- [ ] Add examples in `docs/examples/` showing a hallucinated requirement being quarantined and the user review workflow resolving it.

## 6. Automated Verification
- [ ] Add a CI check that runs hallucination detector unit tests and validates that the mitigation policy does not auto-delete items without producing an audit record (test verifies audit records are created for quarantined items).
