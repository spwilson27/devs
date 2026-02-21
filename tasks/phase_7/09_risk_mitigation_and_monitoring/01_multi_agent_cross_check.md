# Task: Implement Multi-Agent Requirement Cross-Check (Sub-Epic: 09_Risk_Mitigation_and_Monitoring)

## Covered Requirements
- [8_RISKS-REQ-101]

## 1. Initial Test Written
- [ ] Write a unit test suite (using the project's test framework) for a new service/module `requirement_cross_check` that accepts a list of extracted requirement objects and the original source documents and returns a validation report. The tests must include:
  - A test that asserts the cross-check returns `valid: true` when the extracted list exactly matches a hand-crafted expected list derived from a sample PRD/TAS fixture.
  - A test that injects an extra (hallucinated) requirement into the extracted list and asserts that the cross-check flags it as `unexpected` and returns `valid: false` with details describing the mismatch.
  - A test that removes an expected requirement and asserts the cross-check reports `missing` items.
  - Tests should mock any external LLM or network calls; make the module pure function calls in the test using local fixtures located under `tests/fixtures/phase_7/distiller/`.

## 2. Task Implementation
- [ ] Implement a new module `src/distiller/requirement_cross_check.py` (or .ts depending on repo language) that exposes `cross_check_requirements(extracted_requirements, source_documents) -> validation_report`.
  - The function must compute three lists: `missing`, `unexpected`, `mismatched` (differences in titles/description). The `validation_report` must include counts and sample diffs.
  - Implement deterministic string-normalization and canonicalization helpers (strip whitespace, normalize punctuation, lowercase, remove stopwords) to reduce false positives.
  - Add a secondary check that uses token-level overlap heuristics (Jaccard / BLEU-like score) and marks borderline items with a `confidence` score.
  - Ensure the module is pure and side-effect free so it can be unit tested without external services.
  - Add type hints and simple docstrings/comments describing inputs/outputs.

## 3. Code Review
- [ ] Verify the implementation follows single-responsibility: cross-check logic separated from canonicalization helpers and scoring heuristics.
- [ ] Ensure tests cover normal, missing, unexpected and low-confidence cases and do not rely on non-deterministic components.
- [ ] Confirm the module contains no direct LLM calls; any LLM-driven validation must be mocked behind an interface and disabled by default.
- [ ] Verify linting and type checks pass for the new files.

## 4. Run Automated Tests to Verify
- [ ] Run the test suite filtered to the new tests, e.g., `pytest tests/test_requirement_cross_check.py` (or repo equivalent) and confirm all assertions pass.

## 5. Update Documentation
- [ ] Update `docs/architecture/distiller.md` (or create it if missing) with a short section describing the multi-agent cross-check flow, the API of `requirement_cross_check`, and how to interpret `validation_report` fields.
- [ ] Add a brief note to the DistillerAgent design doc describing how cross-check results should be surfaced to the user approval gate.

## 6. Automated Verification
- [ ] Add a CI job or test step that runs the `requirement_cross_check` unit tests and ensures the validation report format matches the expected JSON schema (add schema under `tests/schemas/req_cross_check_schema.json`), failing the build on mismatch.
